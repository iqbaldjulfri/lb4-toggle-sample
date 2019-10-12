import {KlinikkuCoreApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {KlinikkuCoreApplication};

export async function main(options: ApplicationConfig = {}) {
  process.env.ENV = process.env.ENV || 'development';
  const app = new KlinikkuCoreApplication(options);
  await app.boot();
  await app.migrateSchema({existingSchema: 'alter'});
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
