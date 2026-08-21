import { Global, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import knex, { type Knex } from 'knex';

import databaseConfig from '../../../config/database';
import { KNEX_CONNECTION } from './database.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KNEX_CONNECTION,
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>): Knex =>
        knex(config),
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
