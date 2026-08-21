CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;

SET search_path TO auth, public;

CREATE TABLE IF NOT EXISTS auth.users (
    id BIGSERIAL PRIMARY KEY,
    identifier UUID NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_identifier_unique UNIQUE (identifier),
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_email_lowercase_check CHECK (email = LOWER(email))
);

CREATE TABLE IF NOT EXISTS auth.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT roles_name_unique UNIQUE (name),
    CONSTRAINT roles_name_format_check CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

CREATE TABLE IF NOT EXISTS auth.permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT permissions_name_unique UNIQUE (name),
    CONSTRAINT permissions_name_format_check CHECK (name ~ '^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$')
);

CREATE TABLE IF NOT EXISTS auth.user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT user_roles_user_id_fk
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE,
    CONSTRAINT user_roles_role_id_fk
        FOREIGN KEY (role_id)
        REFERENCES auth.roles (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth.role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT role_permissions_role_id_fk
        FOREIGN KEY (role_id)
        REFERENCES auth.roles (id)
        ON DELETE CASCADE,
    CONSTRAINT role_permissions_permission_id_fk
        FOREIGN KEY (permission_id)
        REFERENCES auth.permissions (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT refresh_tokens_token_hash_unique UNIQUE (token_hash),
    CONSTRAINT refresh_tokens_user_id_fk
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS users_email_idx
    ON auth.users (email);

CREATE INDEX IF NOT EXISTS user_roles_role_id_idx
    ON auth.user_roles (role_id);

CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx
    ON auth.role_permissions (permission_id);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx
    ON auth.refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS refresh_tokens_active_idx
    ON auth.refresh_tokens (user_id, expires_at)
    WHERE revoked_at IS NULL;

CREATE OR REPLACE FUNCTION auth.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON auth.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

DROP TRIGGER IF EXISTS set_roles_updated_at ON auth.roles;
CREATE TRIGGER set_roles_updated_at
BEFORE UPDATE ON auth.roles
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

DROP TRIGGER IF EXISTS set_permissions_updated_at ON auth.permissions;
CREATE TRIGGER set_permissions_updated_at
BEFORE UPDATE ON auth.permissions
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

INSERT INTO auth.roles (name, description, is_system)
VALUES
    ('admin', 'Full access to authentication and authorization management.', TRUE),
    ('user', 'Default authenticated user role.', TRUE)
ON CONFLICT (name) DO UPDATE
SET
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system;

INSERT INTO auth.permissions (name, description)
VALUES
    ('users:create', 'Create users.'),
    ('users:read', 'Read users.'),
    ('users:update', 'Update users.'),
    ('users:delete', 'Delete users.'),
    ('roles:create', 'Create roles.'),
    ('roles:read', 'Read roles.'),
    ('roles:update', 'Update roles.'),
    ('roles:delete', 'Delete roles.'),
    ('permissions:read', 'Read permissions.')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM auth.roles
CROSS JOIN auth.permissions
WHERE roles.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM auth.roles
JOIN auth.permissions
    ON permissions.name IN ('users:read', 'roles:read', 'permissions:read')
WHERE roles.name = 'user'
ON CONFLICT (role_id, permission_id) DO NOTHING;
