import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { VersionController } from './version.controller';

@Module({
  controllers: [HealthController, VersionController],
  providers: [HealthService],
})
export class HealthModule {}
