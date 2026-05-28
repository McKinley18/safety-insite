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

  private getAuthContext(authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      return jwt.verify(token, getJwtSecret()) as {
        sub: string;
        tenantId: string;
        role: string;
      };
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }
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
        userId: auth.sub,
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
        userId: auth.sub,
      },
    });

    if (!notification) throw new UnauthorizedException('Notification not found.');

    notification.read = true;
    return this.notificationRepo.save(notification);
  }
}
