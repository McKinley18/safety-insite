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

  /**
   * §305 (SE-14, second instance) — THE SAME DEFECT AS NotificationsService, IN A MOUNTED ROUTE.
   *
   * This decoded `{ sub, email, tenantId, role }`. Safety InSite signs NEITHER `sub` NOR `tenantId`,
   * so `auth.tenantId` was `undefined` on every request — and TypeORM 0.3 DROPS a `where` predicate
   * whose value is undefined. `getAuditByTenant(undefined)` therefore executed as
   * `find({ where: {} , take: 100 })`: THE 100 MOST RECENT AUDIT LOG ROWS OF EVERY TENANT.
   *
   * WHY IT WAS NOT REACHABLE, AND WHY THAT IS NOT REASSURING. The route also required
   * `['owner','admin'].includes(auth.role)`. The `role` claim IS signed, but it holds either an
   * OrganizationRole — `member`, `manager`, `organization_admin` — or `individual`. None of those is
   * `owner` or `admin`, so every caller was refused. The route was protected by the SAME vocabulary
   * mismatch registered as SE-9: an accident, not a control. Repair SE-9 and this begins disclosing
   * every tenant's audit trail the same day.
   *
   * §305 found this while sweeping active queries whose scope predicate is built from nullable
   * context, and contains it rather than leaving a landmine behind a coincidence. The role check is
   * NOT widened here — that would be building deferred Company/Team authorization, which §305
   * forbids. It is left exactly as strict as it was; only the scope is made real and fail-closed.
   */
  private getAuthContext(authHeader?: string): { userId: string; tenantId: string; role: string } {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing authorization token');

    let claims: Record<string, any>;
    try {
      claims = jwt.verify(token, getJwtSecret()) as Record<string, any>;
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }

    const userId = claims.userId || claims.sub;
    if (!userId) throw new UnauthorizedException('Invalid authorization token');
    const tenantId = claims.tenantId || claims.organizationId || `user:${userId}`;
    return { userId: String(userId), tenantId: String(tenantId), role: String(claims.role || '') };
  }

  @Get()
  findWorkspaceAudit(@Headers('authorization') authorization: string) {
    const auth = this.getAuthContext(authorization);

    if (!['owner', 'admin'].includes(auth.role)) {
      throw new UnauthorizedException('Only owners and admins can view audit logs.');
    }

    // Always a real value now: an organization id, or the synthetic `user:<id>` tenant an individual
    // is written under. Never undefined, so the predicate can no longer be dropped.
    return this.auditService.getAuditByTenant(auth.tenantId);
  }
}
