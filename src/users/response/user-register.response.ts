import { ApiProperty } from '@nestjs/swagger';

import { PublicUserResponse } from './user-login.response';

export class UserRegisterData {
  @ApiProperty({ type: PublicUserResponse })
  user!: PublicUserResponse;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token!: string;
}

export class UserRegisterResponse {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 201 })
  statusCode!: number;

  @ApiProperty({ example: 'User registered successfully' })
  message!: string;

  @ApiProperty({ type: UserRegisterData, nullable: true })
  data!: UserRegisterData | null;

  @ApiProperty({ example: null, nullable: true })
  errors!: string[] | null;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  timestamp!: string;
}
