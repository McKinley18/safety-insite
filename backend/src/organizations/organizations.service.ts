import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { Invitation } from './entities/invitation.entity';
import { User } from '../users/user.entity';
import * as crypto from 'crypto';
import {
  OrganizationMembership,
  OrganizationRole,
} from './entities/organization-membership.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(Invitation)
    private inviteRepo: Repository<Invitation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(OrganizationMembership)
    private membershipRepo: Repository<OrganizationMembership>,
  ) {}

  async create(data: { name: string; logoPath?: string; planCode?: string }): Promise<Organization> {
    const org = new Organization();
    org.name = data.name;
    org.planCode =
      data.planCode === 'company' ? 'company' :
      data.planCode === 'plus' ? 'plus' :
      'basic';

    if (data.logoPath) {
      org.logoPath = data.logoPath;
    }

    return await this.orgRepo.save(org);
  }

  /**
   * §305A (SE-13) — A MISSING ORGANIZATION SCOPE IS A REFUSAL, NEVER AN UNFILTERED QUERY.
   *
   * ===============================================================================================
   * WHAT WENT WRONG, AND WHY IT WAS INVISIBLE.
   *
   * These methods received the caller's organization id straight from the session. An individual
   * user has NO organization, so the value was `null` — and TypeORM 0.3 DROPS a `where` condition
   * whose value is null or undefined rather than rejecting it. `findOne({ where: { id: null } })`
   * therefore became `SELECT ... LIMIT 1` with no WHERE at all, and returned SOMEONE ELSE'S
   * ORGANIZATION. `find({ where: { organizationId: null, status: 'active' } })` kept only the
   * status and returned every active membership in the database.
   *
   * §305A confirmed it in LIVE PRODUCTION: a freshly registered individual with no organization
   * called GET /organization/me/settings and received a real company-plan workspace, HTTP 200. That
   * route carries `JwtGuard` alone, so any authenticated account could reach it.
   *
   * It stayed invisible because the natural test — an individual against an empty organization
   * table — returns 404 and looks correct. The disclosure only appears when another tenant exists,
   * which is why the §305A suite now creates a foreign organization before it asserts.
   *
   * ===============================================================================================
   * THE FIX IS THE CONVENTION THIS REPOSITORY ALREADY USES.
   *
   * `reports`, `classifications`, `reviews` and `control-verifications` each resolve their scope
   * through a `requireOrganization(user)` that throws when the scope is absent. This service was the
   * only one that took the same value and trusted it. It now does the same thing they do.
   *
   * Note what this is NOT: it does not widen any guard, does not grant anyone access, and does not
   * build deferred Company/Team functionality. A caller with no organization is refused, which is
   * what should always have happened.
   */
  private requireOrganizationId(organizationId: string | null | undefined): string {
    if (!organizationId) {
      throw new UnauthorizedException('Organization context is required.');
    }
    return organizationId;
  }

  async findOne(id: string) {
    const scoped = this.requireOrganizationId(id);
    const org = await this.orgRepo.findOne({ where: { id: scoped } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateSettings(id: string, data: { riskProfileId?: string; name?: string; logoPath?: string }) {
    // findOne refuses a missing scope, so an unscoped caller cannot reach a write either.
    const org = await this.findOne(id);

    if (data.name !== undefined) org.name = data.name;
    if (data.logoPath !== undefined) org.logoPath = data.logoPath;

    if (data.riskProfileId !== undefined) {
      const allowed = ['simple_4x4', 'standard_5x5', 'advanced_6x6'];

      if (allowed.includes(data.riskProfileId)) {
        org.riskProfileId = data.riskProfileId;
      }
    }

    return this.orgRepo.save(org);
  }

  async getMembers(orgId: string) {
    const scoped = this.requireOrganizationId(orgId);
    return this.membershipRepo.find({
      where: { organizationId: scoped, status: 'active' },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getActiveMembership(userId: string) {
    return this.membershipRepo.findOne({
      where: { userId, status: 'active' },
      relations: ['organization'],
    });
  }

  async createActiveMembership(input: {
    userId: string;
    organizationId: string;
    role?: OrganizationRole;
    invitedByUserId?: string | null;
  }) {
    const current = await this.getActiveMembership(input.userId);
    if (current) throw new ConflictException('User already has an active organization membership.');
    const membership = this.membershipRepo.create({
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role || 'member',
      status: 'active',
      invitedByUserId: input.invitedByUserId || null,
      joinedAt: new Date(),
      endedAt: null,
    });
    return this.membershipRepo.save(membership);
  }

  async getInvitations(orgId: string) {
    const scoped = this.requireOrganizationId(orgId);
    return this.inviteRepo.find({
      where: { organizationId: scoped },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async createInvitation(orgId: string, email: string, role: string) {
    const scoped = this.requireOrganizationId(orgId);
    const token = crypto.randomBytes(16).toString('hex');
    const invite = this.inviteRepo.create({
      email,
      token,
      role,
      organizationId: scoped
    });
    return await this.inviteRepo.save(invite);
  }

  async verifyInvitation(token: string) {
    const invite = await this.inviteRepo.findOne({ 
      where: { token, isUsed: false },
      relations: ['organization']
    });
    if (!invite) throw new NotFoundException('Invalid or expired invitation token');
    return invite;
  }

  async useInvitation(token: string) {
    const invite = await this.verifyInvitation(token);
    invite.isUsed = true;
    await this.inviteRepo.save(invite);
    return invite;
  }
}
