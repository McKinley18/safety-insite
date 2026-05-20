import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SafeScopeKnowledgeService } from './safescope-knowledge.service';

@Controller('safescope-knowledge')
export class SafeScopeKnowledgeController {
  constructor(private readonly safeScopeKnowledgeService: SafeScopeKnowledgeService) {}

  @Post('documents')
  createDocument(@Body() body: any) {
    return this.safeScopeKnowledgeService.createDocument(body);
  }

  @Get('documents')
  listDocuments() {
    return this.safeScopeKnowledgeService.listDocuments();
  }

  @Get('documents/:id')
  findDocument(@Param('id') id: string) {
    return this.safeScopeKnowledgeService.findDocument(id);
  }

  @Post('documents/:id/chunks/rebuild')
  rebuildChunks(@Param('id') id: string) {
    return this.safeScopeKnowledgeService.rebuildChunks(id);
  }

  @Post('documents/:id/approve')
  approveDocument(@Param('id') id: string) {
    return this.safeScopeKnowledgeService.approveDocument(id);
  }

  @Post('documents/:id/reject')
  rejectDocument(@Param('id') id: string) {
    return this.safeScopeKnowledgeService.rejectDocument(id);
  }

  @Post('search')
  search(@Body() body: any) {
    return this.safeScopeKnowledgeService.search(body);
  }
}
