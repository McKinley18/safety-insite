
import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { ReviewsService } from './reviews.service';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('supervisorValidation')

@Controller('review-queue')

export class ReviewQueueController {

  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()

  async getQueue(@Req() req: Request & { user?: any }) {

    return this.reviewsService.getReviewQueue(req.user);

  }

}

