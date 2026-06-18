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

  // 🔷 GLOBAL VALIDATION
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 🔷 CORS: Allow local dev and deployed InSite frontend origins.
  const configuredFrontendUrl = configService.get<string>('FRONTEND_URL');
  const configuredCorsOrigins = configService.get<string>('CORS_ORIGINS');

  const configuredOriginList = configuredCorsOrigins
    ? configuredCorsOrigins
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const allowedOrigins = [
    configuredFrontendUrl,
    ...configuredOriginList,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',

    // Current InSite production / Vercel project origins.
    'https://safety-insite.vercel.app',
    'https://safety-insite-mckinley18s-projects.vercel.app',

    // Legacy production origins kept so old deployments and aliases do not break.
    'https://sentinelsafety.vercel.app',
    'https://sentinelsafety-mckinley18s-projects.vercel.app',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const isKnownVercelProjectOrigin =
        origin.endsWith('.vercel.app') &&
        (
          origin.includes('safety-insite') ||
          origin.includes('sentinelsafety')
        );

      if (isKnownVercelProjectOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  // 🔷 SECURITY HEADERS
  app.use(helmet());

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
