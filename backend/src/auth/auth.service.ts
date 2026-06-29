import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

const SENTINEL_EMPLOYER_PRO_PROMO_CODE = 'Vulcan';

function normalizePromoCode(value?: string): string {
  return String(value || '').trim().toLowerCase();
}

function isEmployerProPromoCode(value?: string): boolean {
  return normalizePromoCode(value) === SENTINEL_EMPLOYER_PRO_PROMO_CODE.toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private orgService: OrganizationsService,
    private billingService: BillingService,
  ) {}

  async register(dto: RegisterDto & { inviteToken?: string }, req?: any) {
    const { email, password, name, type, inviteToken, promoCode } = dto;
    const metadata = req ? getRequestMetadata(req) : null;
    const promoCodeProvided = !!String(promoCode || '').trim();
    const employerProPromoApplied = isEmployerProPromoCode(promoCode);

    if (promoCodeProvided && !employerProPromoApplied) {
      throw new BadRequestException('Invalid promo code');
    }

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    let organizationId = null;
    let role = 'Auditor';
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

    if (!organizationId) {
      const org = await this.orgService.create({
        name: `${name || email.split('@')[0]}'s Organization`,
        planCode,
      } as any);

      organizationId = org.id;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS || 12),
    );

    const user = this.userRepo.create({
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      type: finalType || 'individual',
      planCode,
      subscriptionStatus: 'active',
      role,
      organizationId,
    });

    await this.userRepo.save(user);

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
    const metadata = req ? getRequestMetadata(req) : null;

    const user = await this.userRepo
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();

    if (!user || !user.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const organization = user.organizationId
      ? await this.orgService.findOne(user.organizationId).catch(() => null)
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
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionTier: effectivePlanCode,
      planCode: effectivePlanCode,
      organizationPlanCode: organization?.planCode || null,
      deletedAt: user.deletedAt,
      organizationId: user.organizationId
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: effectivePlanCode,
        planCode: effectivePlanCode,
        organizationPlanCode: organization?.planCode || null,
        organizationId: user.organizationId,
        billingStatus: billingSnapshot?.status || user.subscriptionStatus,
        billingEntitlements: billingSnapshot?.entitlements || null,
      },
      metadata,
    };
  }
}
