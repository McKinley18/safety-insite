import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';
import { describeAlertConfiguration, serverErrorCountInWindow, OPERATIONAL_ALERT_POLICY } from '../observability/operational-alerts';
import { emitOperationalEvent } from '../observability/operational-events';

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

  /**
   * §268 — READINESS NOW MEANS "SAFE TO SERVE", NOT "PROCESS IS UP".
   *
   * It was previously a database-connectivity probe, which cannot distinguish a healthy deployment
   * from one that raced ahead of its migrations. §266 measured that second state: the process is
   * up, the database answers `SELECT 1`, and every read of `hazlenz_analyses` fails because the
   * entity declares columns the schema does not have. Reporting that as ready is the specific
   * failure §268's deployment safety rule exists to make impossible.
   *
   * `/health/live` is deliberately left as the liveness probe, so an orchestrator can still tell
   * "restart this process" (not live) from "do not send it traffic yet" (not ready).
   */
  @Get('ready')
  async ready() {
    const result = await this.healthService.check();
    if (result.status !== 'ok') {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        dependencies: { database: 'unavailable' },
      });
    }
    const schema = await this.healthService.schema();
    if (!schema.ready) {
      // §268. Emitted, not only returned: a readiness probe's 503 is usually consumed by an
      // orchestrator that will not tell anyone WHY it stopped routing traffic. This is the signal
      // that says "the deploy raced ahead of its migrations" in a place a human will see it.
      emitOperationalEvent('schema.readiness_failed', {
        reason: schema.reason,
        expectedSchemaVersion: schema.expectedSchemaVersion,
        expectedCount: schema.expectedCount,
        appliedCount: schema.appliedCount,
        missingCount: schema.missing.length,
      });
      throw new ServiceUnavailableException({
        status: 'not_ready',
        dependencies: { database: 'available', schema: 'behind' },
        schema: {
          reason: schema.reason,
          expectedSchemaVersion: schema.expectedSchemaVersion,
          missingMigrations: schema.missing,
        },
        version: result.version,
      });
    }
    /**
     * §291 (MO-1). "Nothing is watching" is reported as a FACT rather than left as an assumption.
     * A readiness endpoint that says `ready` while no failure would ever reach a human is telling
     * half the truth, and the half it omits is the one that matters at 02:00.
     *
     * §294 (MO-2). THREE STATES, AND THE SERVICE IS READY IN ALL THREE. `NOT_CONFIGURED` means
     * nothing is watching. `CONFIGURED` now means the channel has everything it needs to deliver,
     * including a sender — before §294 it could mean a recipient and a credential with no usable
     * sending identity, which is a green light over a channel that delivers nothing. `DEGRADED`
     * means the channel is configured and its last attempt did not succeed.
     *
     * `status` stays `ready` for DEGRADED on purpose, and that is a product decision rather than
     * an oversight: a third party's mail provider having a bad ten minutes must not stop Safety
     * InSite serving inspections. The degradation is reported where an operator reads it, and it
     * does not take the product down with it.
     */
    const alerting = describeAlertConfiguration();
    return {
      status: 'ready',
      dependencies: { database: 'available', schema: 'current' },
      monitoring: {
        alerting: alerting.state,
        channel: alerting.channel,
        detail: alerting.reason,
        lastDelivery: alerting.lastDelivery ?? null,
        serverErrorsInWindow: serverErrorCountInWindow(),
        policy: OPERATIONAL_ALERT_POLICY,
      },
      schema: {
        expectedSchemaVersion: schema.expectedSchemaVersion,
        expectedCount: schema.expectedCount,
        appliedCount: schema.appliedCount,
        aheadOfBuild: schema.ahead,
      },
      version: result.version,
    };
  }

  /**
   * The schema position on its own, for the deployment runbook's VERIFY SCHEMA step. It carries no
   * secret and no connection detail — only migration timestamps, which are public facts about the
   * build.
   */
  @Get('schema')
  async schema() {
    return this.healthService.schema();
  }

  @Get('version')
  version() {
    return this.healthService.getVersion();
  }
}
