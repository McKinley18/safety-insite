import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string) {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateSettings(id: string, data: { riskProfileId?: string; name?: string; logoPath?: string }) {
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
    return this.membershipRepo.find({
      where: { organizationId: orgId, status: 'active' },
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
    return this.inviteRepo.find({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async createInvitation(orgId: string, email: string, role: string) {
    const token = crypto.randomBytes(16).toString('hex');
    const invite = this.inviteRepo.create({
      email,
      token,
      role,
      organizationId: orgId
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
