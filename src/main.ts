import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './utils/filter/HttpExceptionFilter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { setupSwagger } from './utils/swagger/swagger';
import { LoggerService } from './common/logger/logger.service';
async function bootstrap() {
  console.log(process.env);
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(LoggerService));
  app.useGlobalFilters(
    new HttpExceptionFilter(app.get(WINSTON_MODULE_PROVIDER)),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
