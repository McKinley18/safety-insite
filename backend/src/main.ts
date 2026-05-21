import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  // 🔷 SECURITY HEADERS
  app.use(helmet());

  // 🔷 GLOBAL VALIDATION
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 🔷 CORS: Dynamic origin based on environment
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/offline', express.static(join(process.cwd(), 'dist', 'offline')));

  const PORT = configService.get<number>('PORT') || 4000; 

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV')}`);
}
bootstrap();
// Render redeploy trigger Thu May 14 08:57:38 EDT 2026
