import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin: [
    //   'http://localhost:8081',
    //   'http://127.0.0.1:8081',
    //   'http://localhost:5173',   // (si usas Vite)
    //   'http://localhost:19006',  // Expo web
    //   'http://localhost:19000',  // Expo dev tools
    // ],
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    credentials: true, // Pon true solo si usas cookies/sesiones; para JWT por header puede ser false
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: 'Authorization',
  });

  // (opcional) validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
