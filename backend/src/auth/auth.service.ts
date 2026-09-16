import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { emitOperationalEvent } from '../observability/operational-events';
import { AgreementsService } from '../agreements/agreements.service';
import { createHash, randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OrganizationsService } from '../organizations/organizations.service';
import { getRequestMetadata } from '../common/utils/request-metadata';
import { BillingService } from '../billing/billing.service';
import { normalizeBillingTier } from '../billing/plan-entitlements';
import { PasswordResetDeliveryService } from './password-reset-delivery.service';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { EntitlementGrant } from '../billing/entitlement-grant.entity';
import { buildPromotionalGrant } from '../billing/promotional-grant';
import { InspectionAssignment } from '../inspection/entities/inspection-assignment.entity';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { Notification } from '../notifications/notification.entity';
import { RefreshToken } from './entities/refresh-token.entity';

// Parses simple "<number><s|m|h|d>" durations (matches the format already
// used for JWT_EXPIRES_IN/JWT_REFRESH_EXPIRES_IN). Falls back to 7 days for
// anything unrecognized rather than failing session issuance.
function parseDurationMs(value: string | undefined, fallbackMs: number): number {
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(String(value || '').trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase()];
  return amount * (unitMs as number);
}

const REFRESH_TOKEN_TTL_MS = parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 86_400_000);

function getEmployerProPromoCodes(): string[] {
  return String(process.env.EMPLOYER_PRO_PROMO_CODES || '')
    .split(',')
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean);
}

function normalizePromoCode(value?: string): string {
  return String(value || '').trim().toLowerCase();
}

function isEmployerProPromoCode(value?: string): boolean {
  const normalized = normalizePromoCode(value);
  if (!normalized) return false;
  return getEmployerProPromoCodes().includes(normalized);
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private orgService: OrganizationsService,
    private billingService: BillingService,
    private passwordResetDelivery: PasswordResetDeliveryService,
    private agreements: AgreementsService,
    @InjectRepository(OrganizationMembership)
    private membershipRepo: Repository<OrganizationMembership>,
    @InjectRepository(EntitlementGrant)
    private entitlementGrantRepo: Repository<EntitlementGrant>,
    @InjectRepository(InspectionAssignment)
    private assignmentRepo: Repository<InspectionAssignment>,
    @InjectRepository(SecurityAuditEvent)
    private securityAuditRepo: Repository<SecurityAuditEvent>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto & { inviteToken?: string }, req?: any) {
    const { password, name, inviteToken, promoCode } = dto;
    const email = this.normalizeEmail(dto.email);
    const metadata = req ? getRequestMetadata(req) : null;
    const promoCodeProvided = !!String(promoCode || '').trim();
    const employerProPromoApplied = isEmployerProPromoCode(promoCode);

    if (promoCodeProvided && !employerProPromoApplied) {
      throw new BadRequestException('Invalid promo code');
    }

    /**
     * §291 (SU-1) — ACCEPTANCE IS VALIDATED BEFORE AN ACCOUNT EXISTS, NOT AFTER.
     *
     * §288's finding was that acceptance never reached the server at all. Transmitting it is only
     * half the repair; the other half is that a registration WITHOUT a valid acceptance must be
     * REFUSED, which is exactly the retest the register asks for. This runs before the duplicate
     * check and before any write, so a refused registration leaves nothing behind -- no orphan
     * user, no half-made workspace.
     *
     * The validation is against the server's registry: the agreement must exist, and the version
     * must be the one currently required. A client cannot accept a version that has been
     * superseded, which is what keeps the re-acceptance mechanism honest.
     */
    const acceptedAgreements = this.agreements.validateRegistrationAcceptances(dto.acceptedAgreements);

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    let organizationId: string | null = null;
    let role = 'member';
    // Public self-registration must not grant paid Company access.
    // Paid plans are applied by billing webhook; invite tokens inherit Company workspace access.
    let finalType = employerProPromoApplied ? 'pro' : 'individual';

    // 🔷 HANDSHAKE: IF INVITE TOKEN PROVIDED
    if (inviteToken) {
      const invite = await this.orgService.useInvitation(inviteToken);
      organizationId = invite.organizationId;
      role = invite.role;
      finalType = 'company'; // Locked to company tier
    }

    /**
     * §302 / EN-3 — THE ACCOUNT ROW NOW TELLS THE TRUTH ABOUT BILLING.
     *
     * This used to read `employerProPromoApplied ? 'pro' : 'free'`, and the line below used to set
     * `subscriptionStatus: 'active'` to match. Between them they made an account that had never
     * paid anything assert a purchase — permanently, with no expiry and no route that could lower
     * it again. §301's cleanup had to DELETE accounts to remove entitlement, which is not something
     * you can do to a real pilot customer.
     *
     * A promotion is now a BOUNDED ENTITLEMENT GRANT, created after the account is saved. The
     * account's own billing state stays free/none because that is what is true: nothing was
     * purchased. Effective feature access is resolved from the grant by the canonical resolver, so
     * the customer gets what the promotion promised without the record claiming they bought it.
     */
    const planCode = 'free';

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS || 12),
    );

    const resolvedName = name || email.split('@')[0];
    const nameParts = resolvedName.trim().split(/\s+/).filter(Boolean);

    const user = this.userRepo.create({
      email,
      name: resolvedName,
      firstName: nameParts[0] || null,
      lastName: nameParts.slice(1).join(' ') || null,
      passwordHash: hashedPassword,
      type: finalType || 'individual',
      planCode,
      subscriptionStatus: 'none',
      role: organizationId ? role : 'individual',
      organizationId: null,
    });

    await this.userRepo.save(user);

    /**
     * §291 (SU-1). Written by the SERVER, from the server's own copy of the document: the
     * timestamp, the digest and the counsel status all come from the registry, not from the
     * request. The client's assertion was validated above; it is not the evidence.
     *
     * This is after the user row because the acceptance binds to a user id, and a consent record
     * pointing at a user that does not exist would be worse than none.
     */
    await this.agreements.recordRegistrationAcceptances(user.id, organizationId, acceptedAgreements);

    /**
     * §302 / EN-3 — THE PROMOTION, AS A BOUNDED GRANT.
     *
     * After the user row, for the same reason the acceptance is: a grant pointing at an account
     * that does not exist would be worse than none.
     *
     * EVERY FIELD IS SERVER-DERIVED. `buildPromotionalGrant` is handed the id of the account that
     * was just created and nothing from the request — there is no parameter through which a caller
     * could choose the duration, the tier, the source, or another account. The promo code
     * authorised the grant; it did not describe it, and it is deliberately not written into it.
     */
    let promotionalGrant: { id: string; endsAt: Date; tier: string; source: string } | null = null;
    if (employerProPromoApplied) {
      const { fields, duration } = buildPromotionalGrant(user.id);
      const saved = await this.entitlementGrantRepo.save(
        this.entitlementGrantRepo.create(fields as never),
      ) as unknown as { id: string; endsAt: Date };
      promotionalGrant = {
        id: saved.id, endsAt: saved.endsAt, tier: fields.tier, source: fields.source,
      };
      // Auditable provenance, and NO SECRET: the mechanism, the bounds and the resolution of the
      // configured duration, never the code that authorised it.
      await this.securityAuditRepo.save(this.securityAuditRepo.create({
        actorUserId: user.id, organizationId: organizationId || null,
        action: 'promotional_entitlement_granted',
        resourceType: 'entitlement_grant', resourceId: saved.id,
        metadata: {
          userId: user.id,
          source: fields.source,
          tier: fields.tier,
          startsAt: fields.startsAt.toISOString(),
          endsAt: fields.endsAt.toISOString(),
          durationDays: duration.days,
          durationSource: duration.source,
          grantedAtRegistration: true,
        },
      }));
    }

    if (organizationId) {
      await this.orgService.createActiveMembership({
        userId: user.id,
        organizationId,
        role: ['manager', 'organization_admin'].includes(role)
          ? role as 'manager' | 'organization_admin'
          : 'member',
      });
    }

    return {
      message: 'User created successfully',
      userId: user.id,
      organizationId,
      // §302 / EN-3. THE ACCOUNT'S OWN BILLING PLAN, which is `free` for a promotional account
      // because nothing was purchased. The temporary capability is reported separately and
      // explicitly, so no reader has to infer one from the other.
      planCode,
      promoApplied: employerProPromoApplied,
      promotionalEntitlement: promotionalGrant === null ? null : {
        tier: promotionalGrant.tier,
        source: promotionalGrant.source,
        expiresAt: promotionalGrant.endsAt,
        basis: 'bounded_entitlement_grant',
      },
      metadata,
    };
  }

  async verifyInvite(token: string) {
    return await this.orgService.verifyInvitation(token);
  }

  async login(email: string, password: string, req?: any) {
    email = this.normalizeEmail(email);
    const metadata = req ? getRequestMetadata(req) : null;

    const user = await this.userRepo
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();

    if (!user || !user.passwordHash || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { membership, organization, billingSnapshot, effectivePlanCode } =
      await this.resolveSessionContext(user);

    const token = this.signAccessToken(user, membership, organization, billingSnapshot, effectivePlanCode);
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      message: 'Login successful',
      token,
      refreshToken,
      user: await this.buildUserSnapshot(user, membership, organization, billingSnapshot, effectivePlanCode),
      metadata,
    };
  }

  /**
   * Rotates a refresh token: the presented token is atomically revoked and
   * replaced. A short-lived (15m) access token means a normal inspection
   * session outlives it many times over; the frontend calls this on a 401
   * from the access token and retries transparently, so an active user is
   * never bounced to /login mid-workflow. Presenting a token that was
   * already rotated out (revokedAt set) is treated as replay/theft: every
   * other outstanding token for that user is revoked too, forcing a fresh
   * login rather than silently trusting the stolen token's chain.
   */
  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const existing = await this.refreshTokenRepo.findOne({ where: { tokenHash } });

    if (!existing) throw new UnauthorizedException('Invalid refresh token');

    if (existing.revokedAt) {
      await this.refreshTokenRepo.update(
        { userId: existing.userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userRepo.findOne({ where: { id: existing.userId } });
    if (!user || user.deletedAt) throw new UnauthorizedException();

    existing.revokedAt = new Date();
    await this.refreshTokenRepo.save(existing);

    const { membership, organization, billingSnapshot, effectivePlanCode } =
      await this.resolveSessionContext(user);

    const token = this.signAccessToken(user, membership, organization, billingSnapshot, effectivePlanCode);
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      token,
      refreshToken,
      user: await this.buildUserSnapshot(user, membership, organization, billingSnapshot, effectivePlanCode),
    };
  }

  // Best-effort: revokes the presented refresh token so it can no longer be
  // used to mint new access tokens. Deliberately does not require a valid
  // access token — a user whose access token already expired must still be
  // able to log out and kill their refresh token.
  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.refreshTokenRepo.update(
        { tokenHash, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    }
    return { message: 'Logged out' };
  }

  private async resolveSessionContext(user: User) {
    const membership = await this.orgService.getActiveMembership(user.id);
    const organization = membership?.organizationId
      ? await this.orgService.findOne(membership.organizationId).catch(() => null)
      : null;

    const billingSnapshot = await this.billingService.getBillingStatus({
      userId: user.id,
      email: user.email,
      planCode: organization?.planCode || user.planCode || 'free',
      type: user.type,
      /**
       * §301 / BI-4 — THE OMISSION THAT MADE A GRANTED PLAN EVAPORATE AT LOGIN.
       *
       * This call passed the user's TIER and withheld their STATUS. `getBillingStatus` needs both:
       * with no `UserSubscription` row it resolves through
       * `resolveAccessTier(tier, status, periodEnd)`, which returns `free` for anything that is not
       * `active` or `trialing`. Receiving no status, it read `none`, and every account whose tier
       * lives on the user row rather than in Stripe — which is exactly the employer-pro promo path —
       * resolved to FREE one request after registration answered `planCode: "pro"`.
       *
       * The status is REQUESTED-PLAN INPUT, not authority. `getBillingStatus` still prefers a live
       * `UserSubscription` row over both of these fields whenever one exists, so passing the status
       * cannot let a stale row outrank Stripe. What it does is stop the resolver from inferring a
       * status the caller simply failed to mention.
       */
      subscriptionStatus: user.subscriptionStatus,
    }).catch(() => null);

    const effectivePlanCode = normalizeBillingTier(
      billingSnapshot?.tier ||
        organization?.planCode ||
        user.planCode ||
        'free',
    );

    return { membership, organization, billingSnapshot, effectivePlanCode };
  }

  private signAccessToken(
    user: User,
    membership: OrganizationMembership | null | undefined,
    organization: any,
    billingSnapshot: any,
    effectivePlanCode: string,
  ): string {
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      type: user.type,
      role: membership?.role || user.role,
      organizationRole: membership?.role || null,
      platformRole: user.role === 'platform_admin' ? 'platform_admin' : null,
      subscriptionStatus: billingSnapshot?.subscriptionStatus || user.subscriptionStatus,
      subscriptionTier: effectivePlanCode,
      planCode: effectivePlanCode,
      effectivePlanCode,
      organizationPlanCode: organization?.planCode || null,
      billingStatus: billingSnapshot?.status || user.subscriptionStatus,
      billingEntitlements: billingSnapshot?.entitlements || null,
      // §302 / EN-3. HOW THIS SESSION'S TIER WAS REACHED. The entitlement guard uses it to decide
      // whether the claim may be trusted on its own or must be re-checked against live grant state,
      // so that revoking a grant takes effect immediately rather than when the token expires.
      // Absent on tokens minted before §302, which the guard treats as the pre-§302 behaviour.
      entitlementBasis: billingSnapshot?.tierSource || null,
      hasPaidAccess: billingSnapshot?.hasPaidAccess || false,
      hasProAccess: billingSnapshot?.hasProAccess || false,
      deletedAt: user.deletedAt,
      organizationId: membership?.organizationId || null,
    });
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(48).toString('hex');
    await this.refreshTokenRepo.save(this.refreshTokenRepo.create({
      userId,
      tokenHash: this.hashToken(raw),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    }));
    return raw;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(String(token || '')).digest('hex');
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException();
    }

    return this.loadUserSnapshot(user);
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string }) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException();
    }

    if (dto.firstName !== undefined) {
      const trimmed = dto.firstName.trim();
      if (!trimmed) {
        throw new BadRequestException('First name cannot be empty.');
      }
      if (trimmed.length > 100) {
        throw new BadRequestException('First name is too long.');
      }
      user.firstName = trimmed;
    }

    if (dto.lastName !== undefined) {
      const trimmed = dto.lastName.trim();
      if (trimmed.length > 100) {
        throw new BadRequestException('Last name is too long.');
      }
      user.lastName = trimmed || null;
    }

    const combinedName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (combinedName) {
      user.name = combinedName;
    }

    await this.userRepo.save(user);
    return this.loadUserSnapshot(user);
  }

  private async loadUserSnapshot(user: User) {
    const { membership, organization, billingSnapshot, effectivePlanCode } =
      await this.resolveSessionContext(user);
    return this.buildUserSnapshot(user, membership, organization, billingSnapshot, effectivePlanCode);
  }

  private async buildUserSnapshot(
    user: User,
    membership: OrganizationMembership | null | undefined,
    organization: any,
    billingSnapshot: any,
    effectivePlanCode: string,
  ) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      type: user.type,
      role: membership?.role || user.role,
      organizationRole: membership?.role || null,
      platformRole: user.role === 'platform_admin' ? 'platform_admin' : null,
      subscriptionStatus: billingSnapshot?.subscriptionStatus || user.subscriptionStatus,
      subscriptionTier: effectivePlanCode,
      planCode: effectivePlanCode,
      effectivePlanCode,
      organizationPlanCode: organization?.planCode || null,
      organizationId: membership?.organizationId || null,
      billingStatus: billingSnapshot?.status || user.subscriptionStatus,
      billingEntitlements: billingSnapshot?.entitlements || null,
      hasPaidAccess: billingSnapshot?.hasPaidAccess || false,
      hasProAccess: billingSnapshot?.hasProAccess || false,
    };
  }

  /**
   * Self-service account deletion. Requires re-authentication (current password) as
   * explicit confirmation. Because 13 tables hold ON DELETE RESTRICT foreign keys to
   * "user" (inspections, findings, human reviews, tasks, entitlement grants, org
   * memberships, etc.), a hard DELETE of the user row is not possible without either
   * violating referential integrity or cascading destruction into safety/compliance
   * records the product cannot safely guess are disposable. Instead this performs a
   * soft delete + anonymization, consistent with the deletedAt convention the login
   * and JWT-validation paths already enforce.
   *
   * Retention decisions (do not change without re-deriving from the schema):
   * - user row: RETAINED (never hard-deleted, satisfies all RESTRICT FKs) but
   *   ANONYMIZED — name/email scrubbed, password invalidated, deletedAt set. This
   *   also frees the original email for reuse.
   * - organization_memberships / inspection_assignments / entitlement_grants:
   *   RETAINED as historical records; any currently-active rows are transitioned to
   *   an ended/revoked state so the deleted account no longer carries live access or
   *   billing entitlement.
   * - inspections, observations, hazlenz_analyses, human_reviews, inspection_findings,
   *   tasks, corrective_actions, audit_logs, security_audit_events, reports, and
   *   legacy report/review/risk tables: RETAINED UNCHANGED. These are safety
   *   inspection and audit content, not account profile data; deleting them on
   *   account closure would destroy the actual compliance record the product exists
   *   to produce, so they are preserved under the deleted (anonymized) user id.
   * - notifications: DELETED. Purely personal, ephemeral UX reminders with no FK
   *   constraint and no compliance value.
   */
  async deleteAccount(userId: string, password: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date();
    const anonymizedEmail = `deleted-${user.id}@deleted.safety-insite.local`;
    const originalEmail = user.email;

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.update(
          OrganizationMembership,
          { userId: user.id, status: 'active' },
          { status: 'ended', endedAt: now },
        );

        await manager.update(
          EntitlementGrant,
          { userId: user.id, status: 'active' },
          { status: 'revoked' },
        );

        await manager.update(
          InspectionAssignment,
          { userId: user.id, endedAt: IsNull() },
          { endedAt: now },
        );

        await manager.delete(Notification, { userId: user.id });

        await manager.update(
          RefreshToken,
          { userId: user.id, revokedAt: IsNull() },
          { revokedAt: now },
        );

        await manager.update(User, { id: user.id }, {
          name: 'Deleted User',
          email: anonymizedEmail,
          passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), Number(process.env.BCRYPT_ROUNDS || 12)),
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          passwordChangedAt: now,
          deletedAt: now,
        });

        await manager.save(SecurityAuditEvent, manager.create(SecurityAuditEvent, {
          actorUserId: user.id,
          organizationId: user.organizationId || null,
          action: 'account_deleted',
          resourceType: 'User',
          resourceId: user.id,
          metadata: { originalEmailHash: createHash('sha256').update(originalEmail).digest('hex') },
        }));
      });
    } catch (error) {
      /*
       * §305 (OB-1) — THE CAUSE REACHES THE OPERATOR, AND NOTHING REACHES THE CUSTOMER.
       *
       * This was a bare `catch {}`. It discarded the error object entirely, so a failed account
       * deletion produced no log line, no operational event and no clue — only a generic 500. §305
       * met that wall while diagnosing SE-12: account deletion was failing on every migration-built
       * database with `relation "notifications" does not exist`, and the message had to be recovered
       * by temporarily instrumenting this method.
       *
       * The client contract is UNCHANGED and deliberately so: the caller still receives the same
       * generic message, because the cause can name a relation, a constraint or a column. The
       * operator gets the failure KIND only — no message, no identifier, no SQL — which is the same
       * discipline `report.generation_failed` already follows. The audit row below keeps the fuller
       * reason inside the customer's own audit trail, where it belongs.
       */
      emitOperationalEvent('auth.account_deletion_failed', {
        failureKind: error instanceof Error ? error.name : 'UnknownError',
        accountPreserved: true,
      });
      throw new InternalServerErrorException('Unable to delete account. Please try again.');
    }

    return { message: 'Account deleted successfully' };
  }

  async requestPasswordReset(rawEmail: string) {
    const email = this.normalizeEmail(rawEmail);
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordResetTokenHash')
      .where('LOWER(user.email) = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    let developmentResetToken: string | undefined;
    if (user) {
      const token = randomBytes(32).toString('hex');
      user.passwordResetTokenHash = this.hashResetToken(token);
      user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await this.userRepo.save(user);

      if (process.env.NODE_ENV !== 'production' && process.env.DEV_EXPOSE_RESET_TOKEN === 'true') {
        developmentResetToken = token;
      }
      try {
        await this.passwordResetDelivery.send({
          email: user.email,
          resetUrl: this.passwordResetDelivery.buildResetUrl(token),
          expiresMinutes: 30,
        });
      } catch {
        user.passwordResetTokenHash = null;
        user.passwordResetExpiresAt = null;
        await this.userRepo.save(user);
      }
    }

    return {
      message: 'If the account exists, password reset instructions will be sent.',
      ...(developmentResetToken ? { developmentResetToken } : {}),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashResetToken(token);
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash', 'user.passwordResetTokenHash'])
      .where('user.passwordResetTokenHash = :tokenHash', { tokenHash })
      .andWhere('user.passwordResetExpiresAt > :now', { now: new Date() })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    user.passwordHash = await bcrypt.hash(
      newPassword,
      Number(process.env.BCRYPT_ROUNDS || 12),
    );
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.passwordChangedAt = new Date();
    await this.userRepo.save(user);
    await this.refreshTokenRepo.update(
      { userId: user.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { message: 'Password reset successful' };
  }

  private normalizeEmail(email: string): string {
    return String(email || '').trim().toLowerCase();
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(String(token || '')).digest('hex');
  }
}
