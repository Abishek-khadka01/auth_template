import type {
  CreateUserModel,
  PermissionModel,
  RoleModel,
  UpdateUserModel,
  UserModel,
} from '../models/interface';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepositoryInterface {
  create(user: CreateUserModel): Promise<UserModel>;
  updateById(id: number, user: UpdateUserModel): Promise<UserModel | null>;
  findUserById(id: number): Promise<UserModel | null>;
  findUserByEmail(email: string): Promise<UserModel | null>;
  findUserByIdentifier(identifier: string): Promise<UserModel | null>;
  findRoleByName(name: string): Promise<RoleModel | null>;
  findRolesByUserId(userId: number): Promise<RoleModel[]>;
  findPermissionsByUserId(userId: number): Promise<PermissionModel[]>;
  assignRole(userId: number, roleId: number): Promise<void>;
  removeRole(userId: number, roleId: number): Promise<void>;
  updateLastLogin(userId: number): Promise<void>;
  createRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
}
