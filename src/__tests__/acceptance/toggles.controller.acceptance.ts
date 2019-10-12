import {Client, expect} from '@loopback/testlab';
import {KlinikkuCoreApplication} from '../..';
import {setupApplication} from './test-helper';
import {ToggleService} from '../../services';
import {Toggle} from '../../models';
import {ToggleMysqlRepository, ToggleRedisRepository} from '../../repositories';

describe('TogglesController', () => {
  const toggle: Toggle = new Toggle({id: '[TOGGLE]TEST', value: true});
  let app: KlinikkuCoreApplication;
  let client: Client;
  let toggleMysqlRepository: ToggleMysqlRepository;
  let toggleRedisRepository: ToggleRedisRepository;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    const toggleService: ToggleService = await app.get('services.ToggleService');
    await toggleService.setToggle(toggle);
    toggleMysqlRepository = await app.get('repositories.ToggleMysqlRepository');
    toggleRedisRepository = await app.get('repositories.ToggleRedisRepository');
  });

  after(async () => {
    await app.stop();
  });

  describe('GET /toggles', () => {
    it('returns toggles from MySQL', async () => {
      const expected = (await toggleMysqlRepository.find()).map(expectedToggle => ({...expectedToggle}));
      await client
        .get('/toggles')
        .expect(200)
        .expect('Content-Type', 'application/json')
        .expect(expected);
    });
  });

  describe('GET /toggles/{key}', () => {
    describe('when key is found', () => {
      it('returns its value', async () => {
        const response = await client
          .get(`/toggles/${toggle.id}`)
          .expect(200)
          .expect('Content-Type', 'application/json');
        expect(response.body).to.be.true();
      });
    });

    describe('when key is not found', () => {
      it('returns http error 404', async () => {
        const key = '[TOGGLE]TEST_NOT_FOUND';
        await client
          .get(`/toggles/${key}`)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({code: 1_000, message: 'invalid toggle key'});
      });
    });
  });

  describe('POST /toggles', () => {
    describe('when input is valid', () => {
      it('saves given toggle to MySQL and Redis', async () => {
        const given = {id: '[TOGGLE]TEST_ADD_DATA', value: true};
        await client
          .post('/toggles')
          .send(given)
          .expect(200)
          .expect('Content-Type', 'application/json')
          .expect(given);

        const resultMysql = {...(await toggleMysqlRepository.findById(given.id))};
        expect(resultMysql).to.eql(given);

        const resultRedis = {...(await toggleRedisRepository.get(given.id))};
        expect(resultRedis).to.eql(given);
      });
    });

    describe('when input is invalid', () => {
      it('returns http error 404', async () => {
        const given = {};
        await client
          .post('/toggles')
          .send(given)
          .expect(422)
          .expect('Content-Type', 'application/json; charset=utf-8');
      });
    });
  });

  describe('DELETE /toggles/{key}', () => {
    describe('when key is found', () => {
      it('deletes toggle with given key from MySQL and Redis', async () => {
        const givenToggle = new Toggle({id: '[TOGGLE]TO_BE_DELETED', value: true});
        await toggleMysqlRepository.create(givenToggle);
        await toggleRedisRepository.set(givenToggle.id, givenToggle);

        await client.del(`/toggles/${givenToggle.id}`).expect(200);
        expect(await toggleMysqlRepository.exists(givenToggle.id)).to.be.false();
        expect(await toggleRedisRepository.get(givenToggle.id)).to.be.null();
      });
    });

    describe('when key is not found', () => {
      it('returns http error 404', async () => {
        const key = '[TOGGLE]TEST_NOT_FOUND';
        await client
          .del(`/toggles/${key}`)
          .expect(404)

          .expect('Content-Type', 'application/json; charset=utf-8');
      });
    });
    // describe('when key is invalid');
  });
});
