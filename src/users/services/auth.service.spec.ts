import { Test, TestingModule } from '@nestjs/testing';
import { JsonwebtokenService } from '../../common/jsonwebtoken/jsonwebtoken.service';
import { USERS_REPOSITORY } from '../repository/users-repository.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USERS_REPOSITORY,
          useValue: {},
        },
        {
          provide: JsonwebtokenService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
