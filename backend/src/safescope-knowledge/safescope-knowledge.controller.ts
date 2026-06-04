import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { EntitlementGuard, RequireEntitlement } from "../auth/entitlements/entitlement.guard";
import { SafeScopeKnowledgeService } from "./safescope-knowledge.service";

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement("auditTrail")
@Controller("safescope-knowledge")
export class SafeScopeKnowledgeController {
  constructor(
    private readonly safeScopeKnowledgeService: SafeScopeKnowledgeService,
  ) {}

  @Post("documents")
  createDocument(@Body() body: any) {
    return this.safeScopeKnowledgeService.createDocument(body);
  }

  @Get("documents")
  listDocuments() {
    return this.safeScopeKnowledgeService.listDocuments();
  }

  @Get("review/pending")
  listPendingDocuments() {
    return this.safeScopeKnowledgeService.listPendingDocuments();
  }

  @Get("review/status-counts")
  getStatusCounts() {
    return this.safeScopeKnowledgeService.getStatusCounts();
  }

  @Get("sources")
  listSources() {
    return this.safeScopeKnowledgeService.listSources();
  }

  @Post("sources")
  upsertSource(@Body() body: any) {
    return this.safeScopeKnowledgeService.upsertSource(body);
  }

  @Get("ingestion-runs")
  listIngestionRuns() {
    return this.safeScopeKnowledgeService.listIngestionRuns();
  }

  @Post("ingestion-runs")
  createIngestionRun(@Body() body: any) {
    return this.safeScopeKnowledgeService.createIngestionRun(body);
  }

  @Post("ingestion-runs/:id/running")
  markIngestionRunRunning(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.markIngestionRunRunning(id);
  }

  @Post("ingestion-runs/:id/complete")
  completeIngestionRun(@Param("id") id: string, @Body() body: any) {
    return this.safeScopeKnowledgeService.completeIngestionRun(id, body);
  }

  @Get("documents/:id")
  findDocument(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.findDocument(id);
  }

  @Post("documents/:id/chunks/rebuild")
  rebuildChunks(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.rebuildChunks(id);
  }

  @Post("documents/:id/approval-status")
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
  approveDocument(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.approveDocument(id);
  }

  @Post("documents/:id/reject")
  rejectDocument(@Param("id") id: string) {
    return this.safeScopeKnowledgeService.rejectDocument(id);
  }

  @Post("search")
  search(@Body() body: any) {
    return this.safeScopeKnowledgeService.search(body);
  }
}
