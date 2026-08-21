import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Response } from 'express';

import { ApiResponse } from '../common/response/api-response';
import { UserLoginRequest } from './request/user-login.request';
import { UserRegisterRequest } from './request/user-register.request';
import { UserLoginResponse } from './response/user-login.response';
import { UserRegisterResponse } from './response/user-register.response';
import { AuthService } from './services/auth.service';
import { HasPermission } from './decorators/roles.decorator';
import { PermissionName } from './enums/role.enum';
import { AuthGuard } from './guards/auth.guard';
import { type Request } from 'express';
const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
const ACCESS_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: UserRegisterRequest })
  @ApiCreatedResponse({
    description: 'User registered successfully.',
    type: UserRegisterResponse,
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only access token cookie.',
        schema: {
          type: 'string',
          example: 'access_token=jwt; HttpOnly; Path=/; SameSite=Lax',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'User with this email already exists.' })
  async register(
    @Body() request: UserRegisterRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserRegisterResponse> {
    const data = await this.authService.register(request);
    this.setAccessTokenCookie(response, data.access_token);

    return ApiResponse.success(data, 'User registered successfully', 201);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: UserLoginRequest })
  @ApiOkResponse({
    description: 'User logged in successfully.',
    type: UserLoginResponse,
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only access token cookie.',
        schema: {
          type: 'string',
          example: 'access_token=jwt; HttpOnly; Path=/; SameSite=Lax',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(
    @Body() request: UserLoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserLoginResponse> {
    const data = await this.authService.login(request);
    this.setAccessTokenCookie(response, data.access_token);

    return ApiResponse.success(data, 'User logged in successfully');
  }

  // this is for the checking only
  @Get('permissions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @HasPermission(PermissionName.RolesRead)
  @ApiOperation({ summary: 'Check user permissions' })
  @ApiOkResponse({ description: 'Permissions checked successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiConflictResponse({ description: 'Forbidden - insufficient permissions.' })
  async checkPermissions(@Req() request: Request) {
    return 'hello_world';
  }

  private setAccessTokenCookie(response: Response, accessToken: string): void {
    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
    };

    response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, options);
  }
}
