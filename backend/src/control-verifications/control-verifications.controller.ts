
import { Controller, Post, Body, Param, Get, Req, UseGuards } from "@nestjs/common";

import { Request } from "express";

import { ControlVerificationsService } from "./control-verifications.service";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { EntitlementGuard, RequireEntitlement } from "../auth/entitlements/entitlement.guard";

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')

@Controller("control-verifications")

export class ControlVerificationsController {

  constructor(private svc: ControlVerificationsService) {}

  @Post(":reportId")

  async verify(

    @Param("reportId") reportId: string,

    @Body() body: { control: string; status: "present" | "missing"; notes?: string },

    @Req() req: Request & { user?: any },

  ) {

    return this.svc.create(reportId, body, req.user);

  }

  @Get(":reportId")

  async get(@Param("reportId") reportId: string, @Req() req: Request & { user?: any }) {

    return this.svc.getForReport(reportId, req.user);

  }

}

