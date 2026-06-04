import { Controller, Post, Get, Query, Headers, UnauthorizedException, BadRequestException, UseGuards } from '@nestjs/common';
import { RegulatorySyncService } from './regulatory-sync.service';
import { RegulatoryService } from './regulatory.service';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('regulatory')
export class RegulatoryController {
  constructor(private syncService: RegulatorySyncService, private regulatoryService: RegulatoryService, private config: ConfigService) {}


  @Get('parts')
  async parts(@Query('agency') agency = 'MSHA') {
    return this.regulatoryService.getParts(agency);
  }

  @Get('sections')
  async sections(@Query('agency') agency = 'MSHA', @Query('part') part = '56', @Query('q') q?: string) {
    return this.regulatoryService.searchSections(agency, part, q);
  }

  @Get('section')
  async section(@Query('citation') citation: string) {
    return this.regulatoryService.getSection(citation);
  }

  @Post('sync')
  async sync(@Query('key') key: string, @Query('part') part: string, @Headers('x-sync-key') headerKey: string) {
    const envKey = this.config.get('REGULATORY_SYNC_KEY');
    if (process.env.NODE_ENV === 'production' && (!envKey || (key !== envKey && headerKey !== envKey))) {
      throw new UnauthorizedException();
    }
    
    const syncMap: Record<string, () => Promise<any>> = {
        '46': () => this.syncService.syncPart46(),
        '47': () => this.syncService.syncPart47(),
        '48': () => this.syncService.syncPart48(),
        '50': () => this.syncService.syncPart50(),
        '56': () => this.syncService.syncPart56(),
        '57': () => this.syncService.syncPart57(),
        '62': () => this.syncService.syncPart62(),
        '77': () => this.syncService.syncPart77(),
        '1904': () => this.syncService.syncOsha1904(),
        '1910': () => this.syncService.syncOsha1910(),
        '1926': () => this.syncService.syncOsha1926(),
    };

    if (!part || !syncMap[part]) throw new BadRequestException('Unsupported regulatory sync target.');
    return await syncMap[part]();
  }
}
