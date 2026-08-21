import { registerAs } from '@nestjs/config';
import type { Knex } from 'knex';

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export default registerAs('database', (): Knex.Config => ({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5433', 10),
    database: process.env.DB_NAME ?? 'auth_db',
    user: process.env.DB_USER ?? 'user',
    password: process.env.DB_PASSWORD ?? 'password',
    ssl: parseBoolean(process.env.DB_SSL)
      ? {
          rejectUnauthorized: parseBoolean(
            process.env.DB_SSL_REJECT_UNAUTHORIZED,
          ),
        }
      : false,
  },
  searchPath: [process.env.DB_SCHEMA ?? 'auth', 'public'],
  pool: {
    min: parseInt(process.env.DB_POOL_MIN ?? '0', 10),
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
  },
  migrations: {
    tableName: 'knex_migrations',
    schemaName: process.env.DB_SCHEMA ?? 'auth',
  },
}));
