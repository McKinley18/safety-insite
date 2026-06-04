import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../jwt-secret.util';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (
      process.env.DEV_AUTH_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      request.user = {
        userId: 1,
        email: 'dev@sentinelsafety.local',
        type: 'company',
        role: 'Auditor',
        planCode: 'company',
        effectivePlanCode: 'company',
        subscriptionStatus: 'active',
        organizationId: request.headers['x-dev-organization-id'] || null,
      };

      return true;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, getJwtSecret());
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
