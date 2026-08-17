import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async check() {
    return await this.healthService.check();
  }

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    const result = await this.healthService.check();
    if (result.status !== 'ok') {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        dependencies: { database: 'unavailable' },
      });
    }
    return {
      status: 'ready',
      dependencies: { database: 'available' },
      version: result.version,
    };
  }

  @Get('version')
  version() {
    return this.healthService.getVersion();
  }
}
