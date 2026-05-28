import { Controller, Get, Headers, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Headers('authorization') authorization: string) {
    return this.notificationsService.findMine(authorization);
  }

  @Patch(':id/read')
  markRead(@Headers('authorization') authorization: string, @Param('id') id: string) {
    return this.notificationsService.markRead(authorization, id);
  }
}
