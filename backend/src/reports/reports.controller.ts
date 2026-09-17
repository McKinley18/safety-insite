import { Roles } from '../auth/decorators/roles.decorator';
import {
  NotFoundException,
  Controller,
  Post,
  Patch,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CreateReportDto } from './dto/create-report.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, SubscriptionGuard, RolesGuard, EntitlementGuard)
@Controller('legacy/reports')
export class ReportsController {
  /**
   * §310. `ReportsService` is gone: every one of its methods read the legacy `report`, `finding` or
   * `report_attachments` table, and all three were retired with the mutable report model. This
   * controller now holds no dependency at all, because every route it exposes answers 410.
   */
  constructor() {}

  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  @RequireEntitlement('cloudReports')
  @Post()
  create(@Body() body: CreateReportDto, @Req() req: Request & { user?: any }) {
    void body;
    void req;
    throw new GoneException('Legacy report creation is retired. Generate an immutable report from a completed inspection.');
  }

  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  @Post(':id/recommendations/feedback')
  async submitFeedback(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    void id;
    void body;
    void req;
    throw new GoneException('Legacy report mutation is retired.');
  }

  /**
   * §310 (SC-3) — RETIRED, LIKE ITS SIX SIBLINGS.
   *
   * This read executed against the `report` table, which exists in neither the canonical manifest
   * nor a fresh replay. §310 MEASURED it: for an individual it answered 401 "Organization context
   * is required" before the repository was touched, and for an ORGANIZATION principal it answered
   * 500. A guard standing in front of a broken query is not the query being fixed.
   *
   * 410 rather than 404, deliberately: six routes on this controller already answer 410 and the
   * whole controller is namespaced `legacy/`. That namespace and those statuses are a deliberate
   * compatibility signal from an earlier section, and turning three of the nine into 404 would
   * destroy the signal for no gain. §310 prefers removal for *truly internal* obsolete endpoints;
   * this one is already an announced compatibility surface, so it keeps announcing.
   */
  @Get()
  findAll(@Req() req: Request & { user?: any }) {
    void req;
    throw new GoneException('The legacy report model is retired. Generate an immutable report from a completed inspection, and read it at /inspections/:id/report.');
  }



  @RequireEntitlement('cloudReports')
  @Post(':id/attachments/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
        return callback(new BadRequestException('Only PNG, JPG, or WEBP images are allowed.') as any, false);
      }

      callback(null, true);
    },
  }))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user?: any },
  ) {
    void id;
    void file;
    void req;
    throw new GoneException('Legacy report attachments are retired. Upload evidence to the canonical inspection route.');
  }

  @RequireEntitlement('cloudReports')
  @Post(':id/attachments')
  async addAttachment(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    void id;
    void body;
    void req;
    throw new GoneException('Legacy report attachments are retired.');
  }

  @RequireEntitlement('cloudReports')
  @Patch(':id')
  updatePackage(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    void id;
    void body;
    void req;
    throw new GoneException('Legacy report mutation is retired.');
  }

  @RequireEntitlement('cloudReports')
  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,
    @Req() req: Request & { user?: any },
  ) {
    void id;
    void req;
    throw new GoneException('Legacy report mutation is retired.');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    void id;
    void req;
    throw new GoneException('The legacy report model is retired. Generate an immutable report from a completed inspection, and read it at /inspections/:id/report.');
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    void id;
    void req;
    throw new GoneException('The legacy report model is retired. Generate an immutable report from a completed inspection, and read it at /inspections/:id/report.');
  }
}
