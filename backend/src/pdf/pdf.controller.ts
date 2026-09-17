import { Controller, Get, GoneException, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('legacy/pdf')
export class PdfController {
  /**
   * §310 (SC-3). The injected `ReportsService` was removed: this route has thrown 410
   * unconditionally since §307 and never reached it, and the service itself is gone with the
   * legacy report tables.
   */
  constructor() {}

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
