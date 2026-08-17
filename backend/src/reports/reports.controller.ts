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

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, SubscriptionGuard, RolesGuard, EntitlementGuard)
@Controller('legacy/reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

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

  @Get()
  findAll(@Req() req: Request & { user?: any }) {
    return this.reportsService.findAll(req.user);
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
    return this.reportsService.findOne(id, req.user);
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    const report = await this.reportsService.findOne(id, req.user);

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    return this.recommendationsService.generate(report.findings);
  }
}
