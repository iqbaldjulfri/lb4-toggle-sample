import {DefaultCrudRepository} from '@loopback/repository';
import {Toggle, ToggleRelations} from '../models';
import {MysqlDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ToggleMysqlRepository extends DefaultCrudRepository<Toggle, typeof Toggle.prototype.id, ToggleRelations> {
  constructor(@inject('datasources.mysql') dataSource: MysqlDataSource) {
    super(Toggle, dataSource);
  }
}
