import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { EntitlementGuard, RequireEntitlement } from "../auth/entitlements/entitlement.guard";
import { SafeScopeKnowledgeService } from "./safescope-knowledge.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement("auditTrail")
@Controller("safescope-knowledge")
export class SafeScopeKnowledgeController {
  constructor(
    private readonly safeScopeKnowledgeService: SafeScopeKnowledgeService,
  ) {}

  @Post("documents")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  createDocument(@Body() body: any) {
    return this.safeScopeKnowledgeService.createDocument(body);
  }

  @Get("documents")
  listDocuments() {
    return this.safeScopeKnowledgeService.listDocuments();
  }

  @Get("review/pending")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  listPendingDocuments() {
    return this.safeScopeKnowledgeService.listPendingDocuments();
  }

  @Get("review/status-counts")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  getStatusCounts() {
    return this.safeScopeKnowledgeService.getStatusCounts();
  }

  @Get("sources")
  listSources() {
    return this.safeScopeKnowledgeService.listSources();
  }

  @Post("sources")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  upsertSource(@Body() body: any) {
    return this.safeScopeKnowledgeService.upsertSource(body);
  }

  @Get("ingestion-runs")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  listIngestionRuns() {
    return this.safeScopeKnowledgeService.listIngestionRuns();
  }

  @Post("ingestion-runs")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  createIngestionRun(@Body() body: any) {
    return this.safeScopeKnowledgeService.createIngestionRun(body);
  }

  @Post("ingestion-runs/:id/running")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  markIngestionRunRunning(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.markIngestionRunRunning(id);
  }

  @Post("ingestion-runs/:id/complete")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  completeIngestionRun(@Param("id") id: string, @Body() body: any) {
    return this.safeScopeKnowledgeService.completeIngestionRun(id, body);
  }

  @Get("documents/:id")
  findDocument(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.findDocument(id);
  }

  @Post("documents/:id/chunks/rebuild")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  rebuildChunks(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.rebuildChunks(id);
  }

  @Post("documents/:id/approval-status")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  updateDocumentApprovalStatus(
    @Param("id") id: string,
    @Body()
    body: {
      status: "draft" | "pending_review" | "approved" | "rejected" | "archived";
    },
  ) {
    return this.safeScopeKnowledgeService.updateDocumentApprovalStatus(
      id,
      body.status,
    );
  }

  @Post("documents/:id/approve")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  approveDocument(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.approveDocument(id);
  }

  @Post("documents/:id/reject")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "PLATFORM_ADMIN")
  rejectDocument(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.rejectDocument(id);
  }

  @Post("search")
  search(@Body() body: any) {
    return this.safeScopeKnowledgeService.search(body);
  }
}
