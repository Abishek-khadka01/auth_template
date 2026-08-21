import {
  Inject,
  Injectable,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { USERS_REPOSITORY } from '../repository/users-repository.interface';
import type { UsersRepositoryInterface } from '../repository/users-repository.interface';
import { JsonwebtokenService } from 'src/common/jsonwebtoken/jsonwebtoken.service';

declare module 'express' {
  interface Request {
    user: { id: number; identifier: string; email: string };
    roles: string[];
    permissions: string[];
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JsonwebtokenService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: UsersRepositoryInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const payload = this.jwt.verify<{ sub: number }>(header.slice(7));
    const user = await this.usersRepo.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    const [roles, permissions] = await Promise.all([
      this.usersRepo.findRolesByUserId(user.id),
      this.usersRepo.findPermissionsByUserId(user.id),
    ]);

    req.user = {
      id: user.id,
      identifier: user.identifier,
      email: user.email,
    };
    req.roles = roles.map((r) => r.name);
    req.permissions = permissions.map((p) => p.name);

    return true;
  }
}
