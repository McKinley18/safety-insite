import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import { SitesService } from './sites.service';

@UseGuards(JwtGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSiteDto) {
    return this.sites.create(req.user, dto);
  }

  @Get()
  list(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.sites.list(req.user, page, limit, search);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.sites.findAccessible(req.user, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.sites.update(req.user, id, dto);
  }

  @Delete(':id')
  archive(@Req() req: any, @Param('id') id: string) {
    return this.sites.archive(req.user, id);
  }

  @Post(':id/transfer-preview')
  transferPreview(@Req() req: any, @Param('id') id: string) {
    return this.sites.transferPreview(req.user, id);
  }
}
