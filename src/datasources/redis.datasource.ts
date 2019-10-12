import {inject, lifeCycleObserver, LifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './redis.datasource.json';

function loadConfig(): object {
  const cfg = {...config};
  const {REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, ENV, REDIS_DATABASE} = process.env;
  cfg.host = REDIS_HOST || config.host;
  cfg.port = +(REDIS_PORT || config.port);
  cfg.password = REDIS_PASSWORD || config.password;
  const dbSuffix = ENV === 'production' ? '' : `_${(ENV || 'development').toLowerCase()}`;
  cfg.db = `${REDIS_DATABASE || config.db}${dbSuffix}`;

  return cfg;
}

@lifeCycleObserver('datasource')
export class RedisDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'redis';

  constructor(
    @inject('datasources.config.redis', {optional: true})
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
