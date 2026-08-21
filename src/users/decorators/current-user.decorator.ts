import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthUser {
  id: number;
  identifier: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request>();

    return {
      id: req.user.id,
      identifier: req.user.identifier,
      email: req.user.email,
      roles: req.roles,
      permissions: req.permissions,
    };
  },
);
