import { Body, Controller, Get, Headers, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { BillingService } from "./billing.service";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { CreatePortalSessionDto } from "./dto/create-portal-session.dto";

@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtGuard)
  @Get("me")
  getMyBilling(@Req() req: Request & { user?: any }) {
    return this.billingService.getBillingStatus(req.user);
  }

  @UseGuards(JwtGuard)
  @Post("checkout")
  createCheckout(
    @Req() req: Request & { user?: any },
    @Body() body: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(req.user, body.tier);
  }

  @UseGuards(JwtGuard)
  @Post("portal")
  createPortal(
    @Req() req: Request & { user?: any },
    @Body() _body: CreatePortalSessionDto,
  ) {
    return this.billingService.createPortalSession(req.user);
  }

  @Post("webhook/stripe")
  handleStripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature?: string,
  ) {
    const rawBody = req.rawBody || (req.body ? JSON.stringify(req.body) : "");
    return this.billingService.handleStripeWebhook(rawBody, signature);
  }
}
