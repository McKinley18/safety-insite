import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrganizationsService } from './organizations.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@Controller('organization')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @UseGuards(JwtGuard)
  @Get('me/settings')
  getMySettings(@Req() req: Request & { user?: any }) {
    return this.service.findOne(req.user.organizationId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ORG_OWNER', 'Owner', 'Admin', 'SAFETY_DIRECTOR')
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

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('teamMembers')
  @Roles('ORG_OWNER', 'Owner', 'Admin', 'SAFETY_DIRECTOR')
  @Post('me/invite')
  inviteToMyOrganization(
    @Req() req: Request & { user?: any },
    @Body() body: { email: string; role: string },
  ) {
    return this.service.createInvitation(req.user.organizationId, body.email, body.role || 'Auditor');
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    if (id !== req.user?.organizationId) {
      throw new ForbiddenException('You can only view your own organization.');
    }

    return this.service.findOne(id);
  }

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('teamMembers')
  @Roles('ORG_OWNER', 'Owner', 'Admin', 'SAFETY_DIRECTOR')
  @Post(':id/invite')
  invite(
    @Param('id') id: string,
    @Req() req: Request & { user?: any },
    @Body() body: { email: string; role: string },
  ) {
    const organizationId = req.user?.organizationId;

    if (id !== organizationId) {
      throw new ForbiddenException('You can only invite members to your own organization.');
    }

    return this.service.createInvitation(id, body.email, body.role);
  }
}
