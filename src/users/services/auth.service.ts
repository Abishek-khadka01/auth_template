import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'crypto';
import { promisify } from 'util';

import { JsonwebtokenService } from '../../common/jsonwebtoken/jsonwebtoken.service';
import type { UserModel } from '../models/interface';
import { UserLoginRequest } from '../request/user-login.request';
import { UserRegisterRequest } from '../request/user-register.request';
import type {
  PublicUserResponse,
  UserLoginData,
} from '../response/user-login.response';
import type { UserRegisterData } from '../response/user-register.response';
import {
  USERS_REPOSITORY,
  type UsersRepositoryInterface,
} from '../repository/users-repository.interface';

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

type PublicUser = Omit<UserModel, 'password_hash'>;

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryInterface,
    private readonly jsonwebtokenService: JsonwebtokenService,
  ) {}

  async register(request: UserRegisterRequest): Promise<UserRegisterData> {
    const existingUser = await this.usersRepository.findUserByEmail(
      request.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersRepository.create({
      email: request.email,
      password_hash: await this.hashPassword(request.password),
      first_name: request.first_name,
      last_name: request.last_name,
    });

    const defaultRole = await this.usersRepository.findRoleByName('user');
    if (defaultRole) {
      await this.usersRepository.assignRole(user.id, defaultRole.id);
    }

    return this.createAuthData(user);
  }

  async login(request: UserLoginRequest): Promise<UserLoginData> {
    const user = await this.usersRepository.findUserByEmail(request.email);

    if (
      !user ||
      !(await this.verifyPassword(request.password, user.password_hash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    await this.usersRepository.updateLastLogin(user.id);

    return this.createAuthData(user);
  }

  private async createAuthData(
    user: UserModel,
  ): Promise<UserLoginData | UserRegisterData> {
    const roles = await this.usersRepository.findRolesByUserId(user.id);
    const roleNames = roles.map((role) => role.name);
    const payload = {
      sub: user.id,
      identifier: user.identifier,
      email: user.email,
      roles: roleNames,
    };
    const accessToken = this.jsonwebtokenService.sign(payload);
    const refreshToken = this.jsonwebtokenService.signWithOptions(payload, {
      expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d`,
    });

    await this.usersRepository.createRefreshToken(
      user.id,
      this.hashToken(refreshToken),
      this.getRefreshTokenExpiry(),
    );

    return {
      user: this.toPublicUser(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
    )) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    const [salt, storedHash] = passwordHash.split(':');

    if (!salt || !storedHash) return false;

    const storedBuffer = Buffer.from(storedHash, 'hex');
    const derivedKey = (await scrypt(
      password,
      salt,
      storedBuffer.length,
    )) as Buffer;

    return (
      storedBuffer.length === derivedKey.length &&
      timingSafeEqual(storedBuffer, derivedKey)
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
    return expiresAt;
  }

  private toPublicUser(user: UserModel): PublicUserResponse {
    const { password_hash: _passwordHash, id: id, ...publicUser } = user;
    return publicUser;
  }
}
