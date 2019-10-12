import {KlinikkuCoreApplication} from '../..';
import {createRestAppClient, givenHttpServerConfig, Client} from '@loopback/testlab';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  process.env.NODE_ENV = 'test';

  const app = new KlinikkuCoreApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: KlinikkuCoreApplication;
  client: Client;
}
