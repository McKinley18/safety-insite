import { Controller, Get, Headers, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../auth/jwt-secret.util';
import { AuditService } from './audit.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('auditTrail')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  private getAuthContext(authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      return jwt.verify(token, getJwtSecret()) as {
        sub: string;
        email: string;
        tenantId: string;
        role: string;
      };
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }

  @Get()
  findWorkspaceAudit(@Headers('authorization') authorization: string) {
    const auth = this.getAuthContext(authorization);

    if (!['owner', 'admin'].includes(auth.role)) {
      throw new UnauthorizedException('Only owners and admins can view audit logs.');
    }

    return this.auditService.getAuditByTenant(auth.tenantId);
  }
}
