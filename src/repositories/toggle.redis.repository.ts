import {DefaultKeyValueRepository} from '@loopback/repository';
import {Toggle} from '../models';
import {RedisDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ToggleRedisRepository extends DefaultKeyValueRepository<Toggle> {
  constructor(@inject('datasources.redis') dataSource: RedisDataSource) {
    super(Toggle, dataSource);
  }
}
