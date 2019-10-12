import {bind, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ToggleMysqlRepository, ToggleRedisRepository} from '../repositories';
import {Toggle} from '../models';

@bind({scope: BindingScope.TRANSIENT})
export class ToggleService {
  constructor(
    @repository(ToggleMysqlRepository) protected toggleMysqlRepository: ToggleMysqlRepository,
    @repository(ToggleRedisRepository) protected toggleRedisRepository: ToggleRedisRepository,
  ) {}

  async setToggle(toggle: Toggle): Promise<void> {
    const toggleMysql = await this.toggleMysqlRepository.findById(toggle.id).catch(() => null);
    if (toggleMysql) {
      toggleMysql.value = toggle.value;
      await this.toggleMysqlRepository.save(toggleMysql);
    } else {
      await this.toggleMysqlRepository.create(toggle);
    }
    await this.toggleRedisRepository.set(toggle.id, toggle);
  }

  async isToggleOn(key: string): Promise<boolean> {
    const toggleRedis = await this.toggleRedisRepository.get(key);
    if (toggleRedis) return toggleRedis.value;

    const toggleMysql = await this.toggleMysqlRepository.findById(key);
    const toggles = await this.toggleMysqlRepository.find();
    for (const toggle of toggles) {
      await this.toggleRedisRepository.set(toggle.id, toggle);
    }

    return toggleMysql.value;
  }

  async deleteToggle(key: string): Promise<void> {
    await this.toggleRedisRepository.delete(key);
    await this.toggleMysqlRepository.deleteById(key);
  }
}
