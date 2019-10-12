import {inject, lifeCycleObserver, LifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './mysql.datasource.json';

function loadConfig(): object {
  const cfg = {...config};
  const {MYSQL_HOST, MYSQL_PORT, MYSQL_USERNAME, MYSQL_PASSWORD, ENV, MYSQL_DATABASE} = process.env;
  cfg.host = MYSQL_HOST || config.host;
  cfg.port = +(MYSQL_PORT || config.port);
  cfg.user = MYSQL_USERNAME || config.user;
  cfg.password = MYSQL_PASSWORD || config.password;
  const dbSuffix = ENV === 'production' ? '' : `_${(ENV || 'development').toLowerCase()}`;
  cfg.database = `${MYSQL_DATABASE || config.database}${dbSuffix}`;

  return cfg;
}

@lifeCycleObserver('datasource')
export class MysqlDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'mysql';

  constructor(
    @inject('datasources.config.mysql', {optional: true})
    dsConfig: object = loadConfig(),
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
