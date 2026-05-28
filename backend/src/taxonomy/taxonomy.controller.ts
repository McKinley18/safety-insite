import { Controller, Get, Post, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { HAZARD_CATEGORIES, SEVERITY_LEVELS } from './taxonomy.config';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard)
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('hazard-categories')
  getHazardCategories() {
    return HAZARD_CATEGORIES;
  }

  @UseGuards(EntitlementGuard)
  @RequireEntitlement('auditTrail')
  @Get('rules/export')
  async exportRules() {
    const rules = await this.taxonomyService.findAllRules();
    const csv = 'code,severity,keywords\n' + rules.map(r => `${r.code},${r.severity},"${r.keywords.join(';')}"`).join('\n');
    return csv;
  }

  @UseGuards(EntitlementGuard)
  @RequireEntitlement('auditTrail')
  @Post('rules/import')
  async importRules(@Body() dto: { csv: string }, @Request() req: any) {
    // Basic CSV import logic
    const rows = dto.csv.split('\n').slice(1);
    for (const row of rows) {
      const [code, severity, keywords] = row.split(',');
      await this.taxonomyService.createRule({ code, severity: parseInt(severity), keywords: keywords.replace(/"/g, '').split(';') }, req.user.userId);
    }
    return { success: true };
  }
  @UseGuards(EntitlementGuard)
  @RequireEntitlement('auditTrail')
  @Post('rules')
  createRule(@Body() dto: any, @Request() req: any) {
    return this.taxonomyService.createRule(dto, req.user.userId);
  }
  @UseGuards(EntitlementGuard)
  @RequireEntitlement('auditTrail')
  @Post('rules/:ruleId/rollback/:versionId')
  async rollbackRule(
    @Param('ruleId') ruleId: string,
    @Param('versionId') versionId: string,
    @Request() req: any
  ) {
    return this.taxonomyService.rollbackRule(ruleId, versionId, req.user.userId);
  }

  @Get('severity')
  getSeverity() {
    return SEVERITY_LEVELS;
  }
}
