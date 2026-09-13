import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getBuildMetadata } from '../utils/build-metadata';
import { evaluateSchemaReadiness, type SchemaReadiness } from '../database/schema-readiness';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * §268 — the schema half of readiness, kept separate from `check()` on purpose.
   *
   * `check()` answers "is this process up and can it reach its database". This answers "is the
   * database the schema this build was compiled against". §266 measured why they are different
   * questions: a process deployed ahead of its migrations is up, reachable, and fails every read
   * of `hazlenz_analyses` — including the deterministic finalize path, not only Expert.
   */
  async schema(): Promise<SchemaReadiness> {
    return evaluateSchemaReadiness(this.dataSource);
  }

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
