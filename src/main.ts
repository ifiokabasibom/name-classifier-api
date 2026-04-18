import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from './common/filters/validation-exception/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Required by grading script
  app.enableCors({
    origin: '*',
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Custom validation filter (handles 400 vs 422 responses correctly)
  app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(3000);
}

bootstrap();