import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OrganizationsService } from '../organizations/organizations.service';
import { getRequestMetadata } from '../common/utils/request-metadata';
import { BillingService } from '../billing/billing.service';
import { normalizeBillingTier } from '../billing/plan-entitlements';
import { PasswordResetDeliveryService } from './password-reset-delivery.service';

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

    const planCode = employerProPromoApplied ? 'pro' : 'free';

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS || 12),
    );

    const user = this.userRepo.create({
      email,
      name: name || email.split('@')[0],
      passwordHash: hashedPassword,
      type: finalType || 'individual',
      planCode,
      subscriptionStatus: employerProPromoApplied ? 'active' : 'none',
      role: organizationId ? role : 'individual',
      organizationId: null,
    });

    await this.userRepo.save(user);
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
      planCode,
      promoApplied: employerProPromoApplied,
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

    const membership = await this.orgService.getActiveMembership(user.id);
    const organization = membership?.organizationId
      ? await this.orgService.findOne(membership.organizationId).catch(() => null)
      : null;

    const billingSnapshot = await this.billingService.getBillingStatus({
      userId: user.id,
      email: user.email,
      planCode: organization?.planCode || user.planCode || 'free',
      type: user.type,
    }).catch(() => null);

    const effectivePlanCode = normalizeBillingTier(
      billingSnapshot?.tier ||
        organization?.planCode ||
        user.planCode ||
        'free',
    );

    const token = this.jwtService.sign({
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
      hasPaidAccess: billingSnapshot?.hasPaidAccess || false,
      hasProAccess: billingSnapshot?.hasProAccess || false,
      deletedAt: user.deletedAt,
      organizationId: membership?.organizationId || null,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
      },
      metadata,
    };
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
    return { message: 'Password reset successful' };
  }

  private normalizeEmail(email: string): string {
    return String(email || '').trim().toLowerCase();
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(String(token || '')).digest('hex');
  }
}
