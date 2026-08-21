import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE ?? 'Auth Template API',
  description:
    process.env.SWAGGER_DESCRIPTION ??
    'Authentication and RBAC API documentation.',
  version: process.env.SWAGGER_VERSION ?? '1.0.0',
  path: process.env.SWAGGER_PATH ?? 'docs',
  bearerAuthName: process.env.SWAGGER_BEARER_AUTH_NAME ?? 'access-token',
}));
