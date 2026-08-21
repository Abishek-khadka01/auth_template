import { INestApplication } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import database from 'config/database';
import jwt from 'config/jwt';
describe('User Module checking', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [database, jwt],
        }),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('Should register the user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        first_name: 'Abishek',
        last_name: 'khadka',
        email: 'abishek0805067567@gmail.com',
        password: 'abishek1234',
      });
    console.log(response);
    expect(response.status).toBe(201);
  });
});
