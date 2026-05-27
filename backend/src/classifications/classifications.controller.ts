
import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { ClassificationsService } from './classifications.service';

import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)

@Controller('classifications')

export class ClassificationsController {

  constructor(private readonly classificationsService: ClassificationsService) {}

  @Get('report/:reportId')

  findByReportId(@Param('reportId') reportId: string, @Req() req: Request & { user?: any }) {

    return this.classificationsService.findByReportId(reportId, req.user);

  }

  @Post('report/:reportId/classify')

  classify(@Param('reportId') reportId: string, @Req() req: Request & { user?: any }) {

    return this.classificationsService.classify(reportId, req.user);

  }

  @Post(':classificationId/review')

  review(

    @Param('classificationId') classificationId: string,

    @Body() body: { action: any; notes: string; reason?: string },

    @Req() req: Request & { user?: any },

  ) {

    return this.classificationsService.review(

      classificationId,

      body.action,

      body.notes,

      body.reason,

      req.user,

    );

  }

}

