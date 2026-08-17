import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { KnowledgeService } from './knowledge.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('auditTrail')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('documents')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  createDocument(@Body() body: any) {
    return this.knowledgeService.createDocument(body);
  }

  @Get('documents')
  listDocuments() {
    return this.knowledgeService.listDocuments();
  }

  @Get('documents/:id')
  findDocument(@Param('id') id: string) {
    return this.knowledgeService.findDocument(id);
  }

  @Post('documents/:id/chunks/rebuild')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  rebuildChunks(@Param('id') id: string) {
    return this.knowledgeService.rebuildChunks(id);
  }

  @Post('documents/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  approveDocument(@Param('id') id: string) {
    return this.knowledgeService.approveDocument(id);
  }

  @Post('documents/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  rejectDocument(@Param('id') id: string) {
    return this.knowledgeService.rejectDocument(id);
  }

  @Post('search')
  search(@Body() body: any) {
    return this.knowledgeService.search(body);
  }
}
