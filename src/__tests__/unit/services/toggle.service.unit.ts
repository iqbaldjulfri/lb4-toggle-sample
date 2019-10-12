import {ToggleMysqlRepository, ToggleRedisRepository} from '../../../repositories';
import {MysqlDataSource, RedisDataSource} from '../../../datasources';
import {ToggleService} from '../../../services';
import {expect} from '@loopback/testlab';
import {Toggle} from '../../../models';

process.env.ENV = 'test';

const mysqlDataSource: MysqlDataSource = new MysqlDataSource();
const redisDataSource: RedisDataSource = new RedisDataSource();
const toggleMysqlRepository: ToggleMysqlRepository = new ToggleMysqlRepository(mysqlDataSource);
const toggleRedisRepository: ToggleRedisRepository = new ToggleRedisRepository(redisDataSource);
const toggleService: ToggleService = new ToggleService(toggleMysqlRepository, toggleRedisRepository);

describe('ToggleService', () => {
  const toggle: Toggle = new Toggle({id: '[TOGGLE]TEST', value: true});
  async function resetDB() {
    await toggleRedisRepository.deleteAll();
    await toggleMysqlRepository.deleteAll();
  }

  after(async () => {
    await mysqlDataSource.stop();
    await redisDataSource.stop();
  });

  describe('#set', () => {
    async function compareToggleToDB(tog: Toggle): Promise<void> {
      const mysqlResult = await toggleMysqlRepository.findById(tog.id);
      expect(mysqlResult).to.eql(tog);

      const redisResult = await toggleRedisRepository.get(tog.id);
      expect(redisResult).to.eql(tog);
    }

    describe('when toggle does not exist', () => {
      it('adds toggle to MySQL and Redis', async () => {
        await resetDB();
        await toggleService.setToggle(toggle);
        await compareToggleToDB(toggle);
      });
    });

    describe('when toggle exists', () => {
      it('replaces toggle on MySQL and redis', async () => {
        await resetDB();
        const toggleCopy: Toggle = new Toggle(toggle);
        await Promise.all([
          toggleMysqlRepository.create(toggleCopy),
          toggleRedisRepository.set(toggleCopy.id, toggleCopy),
        ]);

        toggleCopy.value = false;
        await toggleService.setToggle(toggleCopy);
        await compareToggleToDB(toggleCopy);
      });
    });
  });

  describe('#isOn', () => {
    describe('when toggle exists', () => {
      it('loads from Redis and returns its value', async () => {
        await resetDB();
        await toggleService.setToggle(toggle);
        const expected = (await toggleRedisRepository.get(toggle.id)).value;
        const result = await toggleService.isToggleOn(toggle.id);
        expect(result).to.equal(expected);
      });
    });

    describe('when toggle is not synced', () => {
      before(async () => {
        await resetDB();
        const toggle2 = new Toggle({id: '[TOGGLE]TEST2'});
        const toggle3 = new Toggle({id: '[TOGGLE]TEST3'});
        await toggleMysqlRepository.createAll([toggle, toggle2, toggle3]);
      });

      it('loads from MySQL and returns its value', async () => {
        const expected = (await toggleMysqlRepository.findById(toggle.id)).value;
        const result = await toggleService.isToggleOn(toggle.id);
        expect(result).to.eql(expected);
      });

      it('syncs MySQL values to Redis', async () => {
        const expectedToggles = await toggleMysqlRepository.find();

        for (const expected of expectedToggles) {
          const result = await toggleRedisRepository.get(expected.id);
          expect(result).to.eql(expected);
        }
      });
    });

    describe('when toggle does not exist in Redis & MySQL', () => {
      before(async () => {
        await resetDB();
      });

      it('throws an error', () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(toggleService.isToggleOn('[TOGGLE]TEST_NOT_FOUND')).to.be.rejected();
      });
    });
  });

  describe('#delete', () => {
    before(async () => {
      await resetDB();
    });

    describe('when toggle exists', () => {
      it('deletes from MySQL and Redis', async () => {
        await toggleService.setToggle(toggle);
        await toggleService.deleteToggle(toggle.id);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(toggleMysqlRepository.findById(toggle.id)).to.be.rejected();
        expect(await toggleRedisRepository.get(toggle.id)).to.be.Null();
      });
    });
    describe('when toggle does not exists', () => {
      it('throws error', async () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(toggleService.deleteToggle('[TOGGLE]TEST_NOT_FOUND')).to.be.rejected();
      });
    });
  });
});
