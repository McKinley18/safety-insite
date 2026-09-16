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
    const status = await this.agreements.acceptanceStatusFor(String(user.userId));
    return {
      userId: String(user.userId),
      acceptances: await this.agreements.acceptancesFor(String(user.userId)),
      outstanding: status.outstanding,
      /**
       * §308 (LG-3). The server's own determination, reported rather than left for a client to
       * derive from the length of an array. It gates nothing — §308 is explicit that §308 does not
       * invent a lockout UX — but the product can now ANSWER whether a user is bound to the
       * documents currently in force, which it previously could not.
       */
      acceptanceStatus: status.status,
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
