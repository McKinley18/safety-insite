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

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      timestamp: new Date().toISOString(),
      version: getBuildMetadata(),
    };
  }

  getVersion() {
    return getBuildMetadata();
  }
}
