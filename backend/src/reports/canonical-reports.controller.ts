import { Controller, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CanonicalReportsService } from './canonical-reports.service';

@UseGuards(JwtGuard, EntitlementGuard)
@Controller()
export class CanonicalReportsController {
  constructor(private readonly reports: CanonicalReportsService) {}

  @RequireEntitlement('cloudReports')
  @Post('inspections/:inspectionId/reports')
  generate(@Req() req: any, @Param('inspectionId') inspectionId: string) {
    return this.reports.generate(req.user, inspectionId);
  }

  @Get('inspection-reports')
  list(@Req() req: any) { return this.reports.list(req.user); }

  /** The report for one inspection, light metadata only. Null when none has been generated. */
  @Get('inspections/:inspectionId/report')
  forInspection(@Req() req: any, @Param('inspectionId') inspectionId: string) {
    return this.reports.forInspection(req.user, inspectionId);
  }

  @Get('inspection-reports/:reportId')
  get(@Req() req: any, @Param('reportId') reportId: string) {
    return this.reports.get(req.user, reportId);
  }

  @Patch('inspection-reports/:reportId/archive')
  archive(@Req() req: any, @Param('reportId') reportId: string) {
    return this.reports.archive(req.user, reportId);
  }

  /**
   * The inspection's current report. No version is named because there is only one: reopening and
   * finishing an inspection again REPLACES the report rather than adding a version beside it, so a
   * URL that named a version would be a URL the customer could keep and later find empty.
   */
  @Get('inspection-reports/:reportId/download')
  async downloadCurrent(@Req() req: any, @Param('reportId') reportId: string, @Res() response: Response) {
    const result = await this.reports.downloadCurrent(req.user, reportId);
    this.sendPdf(response, result);
  }

  /** Internal snapshot addressing, retained for the verification suites. See the service. */
  @Get('inspection-reports/:reportId/versions/:version/download')
  async download(
    @Req() req: any, @Param('reportId') reportId: string,
    @Param('version', ParseIntPipe) version: number, @Res() response: Response,
  ) {
    const result = await this.reports.download(req.user, reportId, version);
    this.sendPdf(response, result);
  }

  private sendPdf(response: Response, result: { body: Buffer; object: { downloadName: string } }) {
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Length', result.body.length);
    response.setHeader('Content-Disposition', `attachment; filename="${result.object.downloadName.replace(/"/g, '_')}"`);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    response.send(result.body);
  }
}
