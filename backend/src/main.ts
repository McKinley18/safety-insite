import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { validateProductionEnvironment } from './config/validate-production-environment';

async function bootstrap() {
  validateProductionEnvironment();
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const express = app.getHttpAdapter().getInstance();
  express.disable('x-powered-by');
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
    express.set('trust proxy', trustProxyHops);
  }
  app.use((req: any, res: any, next: () => void) => {
    const supplied = String(req.headers['x-request-id'] || '');
    const requestId = /^[A-Za-z0-9._:-]{8,128}$/.test(supplied) ? supplied : randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });
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
  const configuredCorsOrigin = configService.get<string>('CORS_ORIGIN');

  const configuredOriginList = configuredCorsOrigins
    ? configuredCorsOrigins
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const allowedOrigins = [
    configuredFrontendUrl,
    configuredCorsOrigin,
    ...configuredOriginList,
    ...(!isProduction ? [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://localhost:8081',
    ] : []),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  // 🔷 SECURITY HEADERS
  app.use(helmet());

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }
  app.enableShutdownHooks();
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Backend listening on port ${port}`);
  console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV')}`);
  const usage = process.memoryUsage();
  console.log(`📊 [Startup Memory] rss: ${Math.round(usage.rss / 1024 / 1024)} MB, heapUsed: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
}
bootstrap();
// Render redeploy trigger Thu May 14 08:57:38 EDT 2026
