import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  path: string;
  bearerAuthName: string;
}

export const setupSwagger = (app: INestApplication): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const configService = app.get(ConfigService);
  const swaggerConfig = configService.getOrThrow<SwaggerConfig>('swagger');

  const documentConfig = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      swaggerConfig.bearerAuthName,
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup(swaggerConfig.path, app, document);
};
