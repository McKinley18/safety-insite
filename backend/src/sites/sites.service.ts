import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthenticatedUser, isOrganizationManager, requireAuthenticatedUser } from '../common/authenticated-user';
import { Site } from './entities/site.entity';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';

@Injectable()
export class SitesService {
  constructor(@InjectRepository(Site) private readonly sites: Repository<Site>) {}

  private scopeWhere(user: AuthenticatedUser) {
    return user.organizationId
      ? { organizationId: user.organizationId, archivedAt: IsNull() }
      : { ownerUserId: user.userId, archivedAt: IsNull() };
  }

  async create(rawUser: unknown, dto: CreateSiteDto): Promise<Site> {
    const user = requireAuthenticatedUser(rawUser);
    const name = dto.name.trim();
    try {
      return await this.sites.save(this.sites.create({
        name,
        organizationId: user.organizationId,
        ownerUserId: user.organizationId ? null : user.userId,
        createdByUserId: user.userId,
        archivedAt: null,
        archivedByUserId: null,
      }));
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('A site with this name already exists.');
      }
      throw error;
    }
  }

  async list(rawUser: unknown, pageInput = 1, limitInput = 25, search = '') {
    const user = requireAuthenticatedUser(rawUser);
    const page = Math.max(1, Number(pageInput) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitInput) || 25));
    const query = this.sites.createQueryBuilder('site')
      .where(user.organizationId
        ? 'site.organizationId = :scopeId'
        : 'site.ownerUserId = :scopeId', { scopeId: user.organizationId || user.userId })
      .andWhere('site.archivedAt IS NULL');
    if (search.trim()) {
      query.andWhere('LOWER(site.name) LIKE :search', { search: `%${search.trim().toLowerCase()}%` });
    }
    const [data, total] = await query.orderBy('site.createdAt', 'DESC')
      .skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, meta: { page, limit, total } };
  }

  async findAccessible(rawUser: unknown, id: string, includeArchived = false): Promise<Site> {
    const user = requireAuthenticatedUser(rawUser);
    const site = await this.sites.findOne({ where: { id } });
    const inScope = site && (user.organizationId
      ? site.organizationId === user.organizationId
      : site.ownerUserId === user.userId);
    if (!inScope || (!includeArchived && site.archivedAt)) {
      throw new NotFoundException('Site not found.');
    }
    return site;
  }

  async update(rawUser: unknown, id: string, dto: UpdateSiteDto): Promise<Site> {
    const user = requireAuthenticatedUser(rawUser);
    const site = await this.findAccessible(user, id);
    if (site.organizationId && !isOrganizationManager(user)) {
      throw new ForbiddenException('Manager access is required to update organization sites.');
    }
    if (dto.name !== undefined) site.name = dto.name.trim();
    return this.sites.save(site);
  }

  async archive(rawUser: unknown, id: string): Promise<Site> {
    const user = requireAuthenticatedUser(rawUser);
    const site = await this.findAccessible(user, id);
    if (site.organizationId && !isOrganizationManager(user)) {
      throw new ForbiddenException('Manager access is required to archive organization sites.');
    }
    site.archivedAt = new Date();
    site.archivedByUserId = user.userId;
    return this.sites.save(site);
  }

  async transferPreview(rawUser: unknown, id: string) {
    const user = requireAuthenticatedUser(rawUser);
    if (!user.organizationId || !isOrganizationManager(user)) {
      throw new ForbiddenException('Organization manager access is required.');
    }
    const site = await this.sites.findOne({ where: { id, ownerUserId: user.userId } });
    if (!site || site.archivedAt) throw new NotFoundException('Site not found.');
    return {
      siteId: site.id,
      from: { ownerUserId: user.userId },
      to: { organizationId: user.organizationId },
      applySupported: false,
      reason: 'Apply requires inspection ownership reconciliation and is intentionally deferred.',
    };
  }
}
