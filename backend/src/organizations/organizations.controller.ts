import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrganizationsService } from './organizations.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@Controller('organization')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @UseGuards(JwtGuard)
  @Get('me/settings')
  getMySettings(@Req() req: Request & { user?: any }) {
    return this.service.findOne(req.user.organizationId);
  }

  @UseGuards(JwtGuard)
  @Roles('ORG_OWNER')
  @Patch('me/settings')
  updateMySettings(
    @Req() req: Request & { user?: any },
    @Body() body: { riskProfileId?: string; name?: string; logoPath?: string },
  ) {
    return this.service.updateSettings(req.user.organizationId, body);
  }

  @UseGuards(JwtGuard, EntitlementGuard)
  @RequireEntitlement('teamMembers')
  @Get('me/members')
  getMyMembers(@Req() req: Request & { user?: any }) {
    return this.service.getMembers(req.user.organizationId);
  }

  @UseGuards(JwtGuard, EntitlementGuard)
  @RequireEntitlement('teamMembers')
  @Get('me/invites')
  getMyInvites(@Req() req: Request & { user?: any }) {
    return this.service.getInvitations(req.user.organizationId);
  }

  @UseGuards(JwtGuard, EntitlementGuard)
  @RequireEntitlement('teamMembers')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR')
  @Post('me/invite')
  inviteToMyOrganization(
    @Req() req: Request & { user?: any },
    @Body() body: { email: string; role: string },
  ) {
    return this.service.createInvitation(req.user.organizationId, body.email, body.role || 'Auditor');
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtGuard, EntitlementGuard)
  @RequireEntitlement('teamMembers')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR')
  @Post(':id/invite')
  invite(@Param('id') id: string, @Body() body: { email: string; role: string }) {
    return this.service.createInvitation(id, body.email, body.role);
  }
}
