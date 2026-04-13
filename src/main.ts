import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: () => {
        return new HttpException(
          {
            status: 'error',
            message: 'Missing or invalid name parameter',
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();