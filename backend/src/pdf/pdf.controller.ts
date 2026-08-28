import { Controller, Get, GoneException, Param, Req, Res, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ReportsService } from '../reports/reports.service';
import { Response, Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('legacy/pdf')
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
    void id;
    void req;
    void res;
    throw new GoneException('Legacy PDF generation is retired. Retrieve the inspection\'s current report.');
  }
}
