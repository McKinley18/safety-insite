import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { InspectionService } from './inspection.service';

@UseGuards(JwtGuard)
@Controller('inspections')
export class InspectionController {
  constructor(private service: InspectionService) {}

  @Post()
  create(@Body() body: any, @Req() req: Request & { user?: any }) {
    return this.service.create(body, req.user);
  }

  @Get()
  findAll(@Req() req: Request & { user?: any }) {
    return this.service.findAll(req.user);
  }
}
