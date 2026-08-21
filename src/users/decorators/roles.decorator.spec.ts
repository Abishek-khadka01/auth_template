import { ForbiddenException } from '@nestjs/common';
import { HasPermission } from './roles.decorator';

describe('HasPermission', () => {
  const decorated = () => 'ok';

  it('throws ForbiddenException when the user lacks the permission', async () => {
    const descriptor = { value: decorated } as PropertyDescriptor;
    HasPermission('view_users' as never)({}, 'method', descriptor);

    await expect(
      (descriptor.value as () => Promise<string>).call(null, {
        permissions: ['other_permission'],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException with the missing permission name', async () => {
    const descriptor = { value: decorated } as PropertyDescriptor;
    HasPermission('view_users' as never)({}, 'method', descriptor);

    await expect(
      (descriptor.value as () => Promise<string>).call(null, {}),
    ).rejects.toThrow('Missing permission: view_users');
  });
});
