import { ApiProperty } from '@nestjs/swagger';

export class PublicUserResponse {
  @ApiProperty({ example: '9f8a6a95-73d1-477a-94f4-3df915ca3958' })
  identifier!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Abishek', nullable: true })
  first_name!: string | null;

  @ApiProperty({ example: 'Shrestha', nullable: true })
  last_name!: string | null;

  @ApiProperty({ example: true })
  is_active!: boolean;

  @ApiProperty({ example: null, nullable: true })
  email_verified_at!: Date | null;

  @ApiProperty({ example: null, nullable: true })
  last_login_at!: Date | null;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  created_at!: Date;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  updated_at!: Date;
}

export class UserLoginData {
  @ApiProperty({ type: PublicUserResponse })
  user!: PublicUserResponse;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token!: string;
}

export class UserLoginResponse {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'User logged in successfully' })
  message!: string;

  @ApiProperty({ type: UserLoginData, nullable: true })
  data!: UserLoginData | null;

  @ApiProperty({ example: null, nullable: true })
  errors!: string[] | null;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  timestamp!: string;
}
