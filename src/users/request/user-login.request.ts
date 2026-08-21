import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const toLowerCase = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase() : value;

export class UserLoginRequest {
  @ApiProperty({ example: 'user@example.com', maxLength: 320 })
  @IsEmail()
  @MaxLength(320)
  @Transform(toLowerCase)
  email!: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
