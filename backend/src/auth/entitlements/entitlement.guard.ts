import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingFeatureKey } from '../../billing/plan-entitlements';
import { EntitlementService } from './entitlement.service';
import {
  anchorReadRefusalEvent,
  classifyEntitlementDenial,
  noteReadRefusal,
  readRefusalKey,
} from './entitlement-denial-audit';
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

    // Route entirely through EntitlementService, which treats a live
    // UserSubscription row as authoritative over the JWT's cached plan claim
    // when one exists — a JWT issued while Pro must not keep unlocking Pro
    // features after Stripe has since ended the subscription (verified via
    // a Stripe Test Clock: see verification/insite-billing-lifecycle-2026-08-17).
    if (await this.entitlements.hasFeature(user, entitlement)) return true;

    const actorUserId = typeof user.userId === 'string' && /^[0-9a-f-]{36}$/i.test(user.userId) ? user.userId : null;
    const organizationId = typeof user.organizationId === 'string' && /^[0-9a-f-]{36}$/i.test(user.organizationId) ? user.organizationId : null;
    const resourceType = String(context.getClass().name || 'endpoint');
    const path = request.originalUrl || request.url;

    // §284. The audit is written on a best-effort basis and CANNOT change the answer. Before this
    // section an unreachable audit table turned a correct 402 into a 500: the save was awaited
    // ahead of the throw, so an infrastructure fault in the OBSERVABILITY path presented to the
    // customer as a fault in the ENFORCEMENT path. The refusal below is unchanged in status, body
    // and evidence; it is now simply unconditional.
    try {
      await this.recordDenial({ actorUserId, organizationId, entitlement, resourceType, path, method: request.method });
    } catch {
      // Deliberately swallowed. A denial that was not written down is a gap in telemetry; a denial
      // that was not ENFORCED would be a gap in authorization, and those are not the same size.
    }

    throw new HttpException(
      {
        message: 'A paid subscription is required for this feature.',
        code: 'PAID_SUBSCRIPTION_REQUIRED',
        entitlement,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  /**
   * §284 — THE DENIAL AUDIT, SPLIT BY WHAT THE CALLER WAS TRYING TO DO.
   *
   * The policy itself is in `entitlement-denial-audit.ts` and is pure; this is the part that
   * touches the database. A mutating denial writes one row per attempt, exactly as before. A
   * refused READ writes one row per window and counts the rest into it, so normal Free-tier
   * rendering cannot bury a real attempt under thousands of identical entries.
   *
   * Nothing is discarded: `repeats` on the row is the count of refusals that followed the one the
   * row was written for, and `lastAt` is when the most recent arrived.
   */
  private async recordDenial(input: {
    actorUserId: string | null;
    organizationId: string | null;
    entitlement: string;
    resourceType: string;
    path: string;
    method: string | undefined;
  }): Promise<void> {
    const { denialClass, action, coalesced } = classifyEntitlementDenial(input.method);
    const metadata: Record<string, unknown> = {
      entitlement: input.entitlement,
      method: input.method,
      path: input.path,
      denialClass,
    };

    if (!coalesced) {
      await this.securityAudits.save(this.securityAudits.create({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId,
        action,
        resourceType: input.resourceType,
        resourceId: null,
        metadata,
      }));
      return;
    }

    const key = readRefusalKey({
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      entitlement: input.entitlement,
      resourceType: input.resourceType,
    });
    const decision = noteReadRefusal(key);

    if (decision.write === 'UPDATE') {
      const updated = await this.securityAudits.update(
        { id: decision.eventId },
        {
          metadata: {
            ...metadata,
            windowOpenedAt: new Date(decision.firstAt).toISOString(),
            repeats: decision.repeats,
            lastAt: new Date().toISOString(),
          },
        },
      );
      // The row is gone -- retention, a manual delete, another instance. Fall through to a fresh
      // one rather than counting into something that no longer exists.
      if (updated.affected) return;
    }

    const saved = await this.securityAudits.save(this.securityAudits.create({
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      action,
      resourceType: input.resourceType,
      resourceId: null,
      metadata: {
        ...metadata,
        windowOpenedAt: new Date(decision.firstAt).toISOString(),
        repeats: 0,
        lastAt: new Date().toISOString(),
      },
    }));
    anchorReadRefusalEvent(key, saved.id);
  }
}
