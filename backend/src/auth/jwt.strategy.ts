import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getJwtSecret } from './jwt-secret.util';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(OrganizationMembership)
    private readonly membershipRepository: Repository<OrganizationMembership>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({ where: { id: String(payload.userId) } });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    if (user.passwordChangedAt && (!payload.iat || payload.iat * 1000 < user.passwordChangedAt.getTime())) {
      throw new UnauthorizedException();
    }
    const membership = await this.membershipRepository.findOne({
      where: { userId: user.id, status: 'active' },
    });
    return {
      userId: payload.userId,
      email: payload.email,
      type: payload.type,
      role: membership?.role || payload.role,
      organizationRole: membership?.role || null,
      platformRole: user.role === 'platform_admin' ? 'platform_admin' : null,
      subscriptionStatus: payload.subscriptionStatus,
      subscriptionTier: payload.subscriptionTier,
      planCode: payload.planCode,
      effectivePlanCode: payload.effectivePlanCode,
      organizationPlanCode: payload.organizationPlanCode,
      billingStatus: payload.billingStatus,
      billingEntitlements: payload.billingEntitlements,
      hasPaidAccess: payload.hasPaidAccess,
      hasProAccess: payload.hasProAccess,
      deletedAt: payload.deletedAt,
      organizationId: membership?.organizationId || null,
    };
  }
}
