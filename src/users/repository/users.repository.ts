import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';

import { KNEX_CONNECTION } from '../../common/database/database.constants';
import type {
  CreateUserModel,
  PermissionModel,
  RoleModel,
  UpdateUserModel,
  UserModel,
} from '../models/interface';
import type { UsersRepositoryInterface } from './users-repository.interface';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async create(user: CreateUserModel): Promise<UserModel> {
    const [createdUser] = await this.knex<UserModel>('users')
      .insert({
        ...user,
        email: user.email.toLowerCase(),
      })
      .returning('*');

    return createdUser;
  }

  async updateById(
    id: number,
    user: UpdateUserModel,
  ): Promise<UserModel | null> {
    const updateData = {
      ...user,
      email: user.email?.toLowerCase(),
    };

    const [updatedUser] = await this.knex<UserModel>('users')
      .where({ id })
      .update(updateData)
      .returning('*');

    return updatedUser ?? null;
  }

  async findUserById(id: number): Promise<UserModel | null> {
    const user = await this.knex<UserModel>('users').where({ id }).first();

    return user ?? null;
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    const user = await this.knex<UserModel>('users')
      .where({ email: email.toLowerCase() })
      .first();

    return user ?? null;
  }

  async findUserByIdentifier(identifier: string): Promise<UserModel | null> {
    const user = await this.knex<UserModel>('users')
      .where({ identifier })
      .first();

    return user ?? null;
  }

  async findRoleByName(name: string): Promise<RoleModel | null> {
    const role = await this.knex<RoleModel>('roles').where({ name }).first();

    return role ?? null;
  }

  async findRolesByUserId(userId: number): Promise<RoleModel[]> {
    return this.knex<RoleModel>('roles')
      .join('user_roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.*');
  }

  async findPermissionsByUserId(userId: number): Promise<PermissionModel[]> {
    return this.knex<PermissionModel>('permissions')
      .join(
        'role_permissions',
        'role_permissions.permission_id',
        'permissions.id',
      )
      .join('user_roles', 'user_roles.role_id', 'role_permissions.role_id')
      .where('user_roles.user_id', userId)
      .distinct('permissions.*');
  }

  async assignRole(userId: number, roleId: number): Promise<void> {
    await this.knex('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
      })
      .onConflict(['user_id', 'role_id'])
      .ignore();
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    await this.knex('user_roles')
      .where({
        user_id: userId,
        role_id: roleId,
      })
      .delete();
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.knex<UserModel>('users')
      .where({ id: userId })
      .update({ last_login_at: this.knex.fn.now() });
  }

  async createRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.knex('refresh_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
  }
}
