import { Module } from '@nestjs/common';

import { JsonwebtokenModule } from '../common/jsonwebtoken/jsonwebtoken.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { USERS_REPOSITORY } from './repository/users-repository.interface';
import { UsersRepository } from './repository/users.repository';
import { AuthService } from './services/auth.service';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [JsonwebtokenModule, DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
    AuthGuard,
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
