import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingFeatureKey, hasEntitlement, normalizeBillingTier } from '../../billing/plan-entitlements';
import { EntitlementService } from './entitlement.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';

export const REQUIRED_ENTITLEMENT_KEY = 'requiredEntitlement';
export type EntitlementKey = BillingFeatureKey;

export const RequireEntitlement = (entitlement: EntitlementKey) =>
  SetMetadata(REQUIRED_ENTITLEMENT_KEY, entitlement);

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlements: EntitlementService,
    @InjectRepository(SecurityAuditEvent)
    private readonly securityAudits: Repository<SecurityAuditEvent>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const entitlement = this.reflector.getAllAndOverride<EntitlementKey>(
      REQUIRED_ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!entitlement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user || {};
    const effectivePlanCode = normalizeBillingTier(
      user.planCode ||
        user.effectivePlanCode ||
        user.tier ||
        user.billingTier ||
        user.subscriptionTier,
    );

    if (hasEntitlement(effectivePlanCode, entitlement) ||
        await this.entitlements.hasFeature(user, entitlement)) return true;

    const actorUserId = typeof user.userId === 'string' && /^[0-9a-f-]{36}$/i.test(user.userId) ? user.userId : null;
    const organizationId = typeof user.organizationId === 'string' && /^[0-9a-f-]{36}$/i.test(user.organizationId) ? user.organizationId : null;
    await this.securityAudits.save(this.securityAudits.create({
      actorUserId,
      organizationId,
      action: 'entitlement_denied',
      resourceType: String(context.getClass().name || 'endpoint'),
      resourceId: null,
      metadata: { entitlement, method: request.method, path: request.originalUrl || request.url },
    }));
    throw new HttpException(
      {
        message: 'A paid subscription is required for this feature.',
        code: 'PAID_SUBSCRIPTION_REQUIRED',
        entitlement,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
