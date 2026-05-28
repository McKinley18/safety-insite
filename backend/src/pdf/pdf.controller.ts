import { Controller, Get, NotFoundException, Param, Req, Res, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ReportsService } from '../reports/reports.service';
import { Response, Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get(':id')
  async generate(
    @Param('id') id: string,
    @Req() req: Request & { user?: any },
    @Res() res: Response,
  ) {
    const report = await this.reportsService.findOne(id, req.user);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const pdf = await this.pdfService.generate(report);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=inspection-report.pdf`,
      'Content-Length': pdf.length,
    });

    return res.end(pdf);
  }
}
