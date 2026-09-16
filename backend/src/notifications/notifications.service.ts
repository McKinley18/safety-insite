import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../auth/jwt-secret.util';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  /**
   * §305 (SE-14) — READ THE CLAIMS THIS PRODUCT ACTUALLY SIGNS, AND FAIL CLOSED WITHOUT THEM.
   *
   * =============================================================================================
   * WHAT WAS WRONG.
   *
   * This decoded the token as `{ sub, tenantId, role }`. Safety InSite's `signAccessToken` signs
   * NEITHER `sub` NOR `tenantId` — it signs `userId` and `organizationId`. So both values were
   * `undefined` on every request, and §305A had already established what TypeORM 0.3 does with an
   * undefined value in a `where` object: IT DROPS THE PREDICATE.
   *
   *   findMine   ->  find({ where: { tenantId: undefined, userId: undefined } })
   *                  -> every predicate dropped -> THE 50 MOST RECENT NOTIFICATIONS OF ALL USERS
   *   markRead   ->  findOne({ where: { id, tenantId: undefined, userId: undefined } })
   *                  -> only `id` survives -> ANY notification readable AND mutable by id
   *
   * The same root cause as SE-13, in a different place, and worse: markRead returns the saved row,
   * so it both discloses and mutates another user's record.
   *
   * =============================================================================================
   * WHY IT WAS NOT VISIBLE AS AN INCIDENT.
   *
   * The notifications table is empty in production, so there was nothing to disclose. That is not a
   * control — it is a coincidence maintained by a second bug, and it stops holding the moment a
   * corrective action creates a notification. A safety property that depends on a table staying
   * empty is not a safety property.
   *
   * =============================================================================================
   * THE CONTRACT NOW.
   *
   * The identity is REQUIRED: no userId, no query. The tenant is derived exactly the way
   * CorrectiveActionsService derives it when it WRITES these rows — `tenantId || organizationId ||
   * user:<userId>` — so reads and writes agree for an individual, who has no organization and whose
   * notifications carry the synthetic `user:<id>` tenant. Reads are scoped by BOTH, so neither a
   * missing organization nor a shared tenant can widen them.
   */
  private getAuthContext(authHeader?: string): { userId: string; tenantId: string } {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing authorization token');

    let claims: Record<string, any>;
    try {
      claims = jwt.verify(token, getJwtSecret()) as Record<string, any>;
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }

    const userId = claims.userId || claims.sub;
    if (!userId) {
      // Fail closed. An unidentified caller must never reach a query whose scope they would set.
      throw new UnauthorizedException('Invalid authorization token');
    }
    const tenantId = claims.tenantId || claims.organizationId || `user:${userId}`;
    return { userId: String(userId), tenantId: String(tenantId) };
  }

  async create(data: Partial<Notification>) {
    return this.notificationRepo.save(this.notificationRepo.create(data));
  }

  async findExistingForEntity(data: {
    tenantId: string;
    userId: string;
    type: Notification['type'];
    entityType: string;
    entityId: string;
  }) {
    return this.notificationRepo.findOne({
      where: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    });
  }

  async findMine(authHeader: string) {
    const auth = this.getAuthContext(authHeader);

    return this.notificationRepo.find({
      where: {
        tenantId: auth.tenantId,
        userId: auth.userId,
      },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(authHeader: string, id: string) {
    const auth = this.getAuthContext(authHeader);

    const notification = await this.notificationRepo.findOne({
      where: {
        id,
        tenantId: auth.tenantId,
        userId: auth.userId,
      },
    });

    if (!notification) throw new UnauthorizedException('Notification not found.');

    notification.read = true;
    return this.notificationRepo.save(notification);
  }
}
