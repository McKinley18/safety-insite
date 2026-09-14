import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { requireAuthenticatedUser } from '../common/authenticated-user';
import { AgreementsService } from './agreements.service';

@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreements: AgreementsService) {}

  /** Public: a client cannot present an agreement it is not allowed to read. */
  @Get()
  list() {
    return { agreements: this.agreements.listAgreements() };
  }

  @UseGuards(JwtGuard)
  @Get('acceptances')
  async mine(@Req() req: any) {
    const user = requireAuthenticatedUser(req.user);
    return {
      userId: String(user.userId),
      acceptances: await this.agreements.acceptancesFor(String(user.userId)),
      outstanding: await this.agreements.outstandingFor(String(user.userId)),
    };
  }

  @UseGuards(JwtGuard)
  @Post('accept')
  async accept(@Req() req: any, @Body() body: any) {
    const user = requireAuthenticatedUser(req.user);
    const saved = await this.agreements.record(
      String(user.userId),
      user.organizationId ? String(user.organizationId) : null,
      { agreementId: body?.agreementId, agreementVersion: body?.agreementVersion },
      'in_app',
    );
    return {
      agreementId: saved.agreementId,
      agreementVersion: saved.agreementVersion,
      acceptedAt: saved.acceptedAt,
      documentDigest: saved.documentDigest,
      outstanding: await this.agreements.outstandingFor(String(user.userId)),
    };
  }
}
