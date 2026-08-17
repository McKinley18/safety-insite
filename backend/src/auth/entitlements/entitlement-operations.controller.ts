import { BadRequestException, Body, Controller, Delete, ForbiddenException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';
import { EntitlementGrant } from '../../billing/entitlement-grant.entity';
import { requireAuthenticatedUser } from '../../common/authenticated-user';
import { User } from '../../users/user.entity';
import { JwtGuard } from '../guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('admin/entitlement-grants')
export class EntitlementOperationsController {
  constructor(
    @InjectRepository(EntitlementGrant) private readonly grants: Repository<EntitlementGrant>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(SecurityAuditEvent) private readonly audits: Repository<SecurityAuditEvent>,
  ) {}

  private requirePlatformAdmin(rawUser: unknown) {
    const user = requireAuthenticatedUser(rawUser);
    if (user.platformRole !== 'platform_admin') throw new ForbiddenException('Platform administrator access is required.');
    return user;
  }

  @Post()
  async grant(@Req() req: any, @Body() body: any) {
    const actor = this.requirePlatformAdmin(req.user);
    if (!['pilot', 'support'].includes(body.source)) {
      throw new BadRequestException('Only pilot or support grants may be assigned through this route.');
    }
    if (!['pro'].includes(body.tier)) throw new BadRequestException('Invalid entitlement tier.');
    if (!String(body.reason || '').trim()) throw new BadRequestException('A grant reason is required.');
    const endsAt = new Date(body.endsAt);
    if (!Number.isFinite(endsAt.getTime()) || endsAt <= new Date()) throw new BadRequestException('A future expiration is required.');
    if (endsAt.getTime() - Date.now() > 90 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Operational grants may not exceed 90 days.');
    }
    const target = await this.users.findOne({ where: { id: body.userId } });
    if (!target) throw new BadRequestException('Target user was not found.');
    const grant = await this.grants.save(this.grants.create({
      userId: target.id, source: body.source, tier: body.tier, status: 'active',
      startsAt: new Date(), endsAt, issuedByUserId: actor.userId, reason: String(body.reason).trim(),
    }));
    await this.audits.save(this.audits.create({
      actorUserId: actor.userId, organizationId: null, action: 'entitlement_granted',
      resourceType: 'entitlement_grant', resourceId: grant.id,
      metadata: { targetUserId: target.id, source: grant.source, tier: grant.tier, endsAt: grant.endsAt.toISOString() },
    }));
    return grant;
  }

  @Delete(':id')
  async revoke(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const actor = this.requirePlatformAdmin(req.user);
    if (!String(body.reason || '').trim()) throw new BadRequestException('A revocation reason is required.');
    const grant = await this.grants.findOne({ where: { id } });
    if (!grant) throw new BadRequestException('Grant was not found.');
    grant.status = 'revoked';
    grant.endsAt = grant.endsAt < new Date() ? grant.endsAt : new Date();
    await this.grants.save(grant);
    await this.audits.save(this.audits.create({
      actorUserId: actor.userId, organizationId: null, action: 'entitlement_revoked',
      resourceType: 'entitlement_grant', resourceId: grant.id,
      metadata: { targetUserId: grant.userId, reason: String(body.reason).trim() },
    }));
    return { revoked: true, id: grant.id };
  }
}
