import { ForbiddenException } from '@nestjs/common';
import type { PermissionName } from '../enums/role.enum';
import { type Request } from 'express';
type Method = (...args: unknown[]) => unknown;

export function HasPermission(permission: PermissionName) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as Method;

    descriptor.value = async function (
      this: unknown,
      ...args: unknown[]
    ): Promise<unknown> {
      const request = args[0] as Request;
      const user = request.permissions as string[];

      console.log('The permissions of the user is ', user);
      console.log(user?.includes(permission));
      if (!user?.includes(permission)) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }

      return await Reflect.apply(originalMethod, this, args);
    };

    return descriptor;
  };
}
