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
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, SubscriptionGuard, RolesGuard, EntitlementGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  @RequireEntitlement('cloudReports')
  @Post()
  create(@Body() body: CreateReportDto, @Req() req: Request & { user?: any }) {
    return this.reportsService.create(body, req.user);
  }

  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  @Post(':id/recommendations/feedback')
  async submitFeedback(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    const report = await this.reportsService.findOne(id, req.user);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.recommendationsService.submitFeedback(body);
  }

  @Get()
  findAll(@Req() req: Request & { user?: any }) {
    return this.reportsService.findAll(req.user);
  }



  @RequireEntitlement('cloudReports')
  @Post(':id/attachments/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req: any, _file: Express.Multer.File, callback: any) => {
        const uploadPath = 'uploads/evidence';
        fs.mkdirSync(uploadPath, { recursive: true });
        callback(null, uploadPath);
      },
      filename: (_req: any, file: Express.Multer.File, callback: any) => {
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
        callback(null, safeName);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only image uploads are allowed.') as any, false);
      }

      callback(null, true);
    },
  }))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user?: any },
  ) {
    if (!file) {
      throw new BadRequestException('No evidence file uploaded.');
    }

    const attachment = await this.reportsService.addAttachment(
      id,
      {
        imageUri: `/uploads/evidence/${file.filename}`,
        mimeType: file.mimetype,
        fileName: file.originalname,
      },
      req.user,
    );

    if (!attachment) {
      throw new NotFoundException("Report not found");
    }

    return attachment;
  }

  @RequireEntitlement('cloudReports')
  @Post(':id/attachments')
  async addAttachment(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    const attachment = await this.reportsService.addAttachment(id, body, req.user);

    if (!attachment) {
      throw new NotFoundException("Report not found");
    }

    return attachment;
  }

  @RequireEntitlement('cloudReports')
  @Patch(':id')
  updatePackage(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    return this.reportsService.updatePackage(id, body, req.user);
  }

  @RequireEntitlement('cloudReports')
  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,
    @Req() req: Request & { user?: any },
  ) {
    const archived = await this.reportsService.archive(id, req.user);

    if (!archived) {
      throw new NotFoundException("Report not found");
    }

    return archived;
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
