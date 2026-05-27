import { Controller, Get, NotFoundException, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { ExecutiveService } from './executive.service';
import { PdfService } from '../pdf/pdf.service';
import { ReportsService } from '../reports.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('reports')
export class ExecutiveController {
  constructor(
    private readonly service: ExecutiveService,
    private readonly pdf: PdfService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get(':id/executive-summary')
  async getExecutiveSummary(
    @Param('id') id: string,
    @Req() req: Request & { user?: any },
  ) {
    const report = await this.reportsService.findOne(id, req.user);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.service.generateExecutiveSummary(report);
  }

  @Get(':id/executive-summary/pdf')
  async getExecutivePdf(
    @Param('id') id: string,
    @Req() req: Request & { user?: any },
    @Res() res: Response,
  ) {
    const report = await this.reportsService.findOne(id, req.user);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const data = this.service.generateExecutiveSummary(report);
    const pdfBuffer = await this.pdf.generateExecutivePdf(data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-${id}.pdf`,
    });

    return res.send(pdfBuffer);
  }
}
