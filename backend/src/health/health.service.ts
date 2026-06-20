import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getBuildMetadata } from '../utils/build-metadata';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check() {
    let database = 'down';

    try {
      await this.dataSource.query('SELECT 1');
      database = 'up';
    } catch {
      database = 'down';
    }

    const usage = process.memoryUsage();
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      timestamp: new Date().toISOString(),
      version: getBuildMetadata(),
      memory: {
        rssMb: Math.round(usage.rss / 1024 / 1024),
        heapUsedMb: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(usage.heapTotal / 1024 / 1024),
        externalMb: Math.round(usage.external / 1024 / 1024),
      },
    };
  }

  getVersion() {
    return getBuildMetadata();
  }
}
