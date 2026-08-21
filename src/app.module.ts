import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import appConfig from '../config/app';
import databaseConfig from '../config/database';
import jwtConfig from '../config/jwt';
import swaggerConfig from '../config/swagger.config';
import { DatabaseModule } from './common/database/database.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [appConfig, jwtConfig, databaseConfig, swaggerConfig],
    }),
    DatabaseModule,
    UsersModule,
    LoggerModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, stack }) =>
                `${timestamp} [${level}] ${stack ?? message}`,
            ),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
