import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { KnowledgeService } from './knowledge.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('auditTrail')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('documents')
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
  rebuildChunks(@Param('id') id: string) {
    return this.knowledgeService.rebuildChunks(id);
  }

  @Post('documents/:id/approve')
  approveDocument(@Param('id') id: string) {
    return this.knowledgeService.approveDocument(id);
  }

  @Post('documents/:id/reject')
  rejectDocument(@Param('id') id: string) {
    return this.knowledgeService.rejectDocument(id);
  }

  @Post('search')
  search(@Body() body: any) {
    return this.knowledgeService.search(body);
  }
}
