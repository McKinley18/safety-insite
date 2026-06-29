import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../jwt-secret.util';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return true;

    const token = authHeader.split(' ')[1];
    if (!token) return true;

    try {
      request.user = jwt.verify(token, getJwtSecret());
    } catch {
      request.user = undefined;
    }

    return true;
  }
}
