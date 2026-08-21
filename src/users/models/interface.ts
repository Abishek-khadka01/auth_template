export interface UserModel {
  id: number;
  identifier: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RoleModel {
  id: number;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionModel {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserRoleModel {
  user_id: number;
  role_id: number;
  assigned_at: Date;
}

export interface RolePermissionModel {
  role_id: number;
  permission_id: number;
  assigned_at: Date;
}

export interface RefreshTokenModel {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface DatabaseTables {
  users: UserModel;
  roles: RoleModel;
  permissions: PermissionModel;
  user_roles: UserRoleModel;
  role_permissions: RolePermissionModel;
  refresh_tokens: RefreshTokenModel;
}

export type CreateUserModel = Pick<UserModel, 'email' | 'password_hash'> &
  Partial<
    Pick<
      UserModel,
      | 'identifier'
      | 'first_name'
      | 'last_name'
      | 'is_active'
      | 'email_verified_at'
    >
  >;

export type UpdateUserModel = Partial<
  Pick<
    UserModel,
    | 'email'
    | 'password_hash'
    | 'first_name'
    | 'last_name'
    | 'is_active'
    | 'email_verified_at'
    | 'last_login_at'
  >
>;
