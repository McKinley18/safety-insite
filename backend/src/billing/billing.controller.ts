import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMyBilling(@Req() req: Request & { user?: any }) {
    return this.billingService.getBillingStatus(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('checkout')
  createCheckout(
    @Req() req: Request & { user?: any },
    @Body() body: { planCode: 'plus' | 'company' },
  ) {
    return this.billingService.createCheckoutSession(req.user, body.planCode);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.billingService.handleStripeWebhook(body);
  }
}
