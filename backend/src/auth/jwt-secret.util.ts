import { UnauthorizedException } from '@nestjs/common';

const LOCAL_DEV_JWT_SECRET = 'dev-only-secret-change-me';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new UnauthorizedException('JWT secret is not configured.');
  }

  return LOCAL_DEV_JWT_SECRET;
}
