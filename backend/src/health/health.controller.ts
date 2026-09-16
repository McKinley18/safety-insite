import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { passwordResetEmailCapability } from '../auth/password-reset-transport';
import { HealthService } from './health.service';
import { describeAlertConfiguration, serverErrorCountInWindow } from '../observability/operational-alerts';
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
    /*
     * §306 (EM-2) — EMAIL CAPABILITY IS REPORTED, NOT INFERRED FROM SILENCE.
     *
     * Readiness already distinguished monitoring-alert channel states; password-reset delivery had
     * no reported state at all, so "we cannot send recovery email" looked exactly like "everything
     * is fine" from outside. It reads only whether variables are PRESENT — no secret value is read,
     * compared or returned — and says nothing about any individual delivery, which belongs to the
     * operational event stream.
     *
     * NOT_CONFIGURED is the honest and expected state until a sending domain exists. It does not
     * make the service unready: the product runs, and recovery requests are still accepted and
     * answered generically with no reset credential left stranded on the account.
     */
    const email = passwordResetEmailCapability();
    return {
      status: 'ready',
      dependencies: { database: 'available', schema: 'current' },
      passwordResetEmail: {
        state: email.state,
        provider: email.provider,
        missing: email.missing,
        detail: email.detail,
      },
      /*
       * §307 — THE ALERTING POLICY NUMBERS ARE NO LONGER PUBLISHED TO AN UNAUTHENTICATED CALLER.
       *
       * `/health/ready` has no authentication, by design: an orchestrator has to be able to ask.
       * It was answering with `OPERATIONAL_ALERT_POLICY` in full — `serverErrorThreshold: 5`,
       * `serverErrorWindowMinutes: 5`, `dedupeWindowMinutes: 15`, `maxAlertsPerWindow: 12` and the
       * list of statuses that never alert. Read as an attacker reads it, that is a published
       * pacing guide: stay under five 5xx in five minutes, prefer 401/402/404, and nothing ever
       * reaches a human. Detection thresholds are one of the few operational facts whose value
       * comes entirely from not being known.
       *
       * WHAT IS DELIBERATELY KEPT, because §307 also says preserve internal observability and
       * because making a readiness endpoint less useful is not a security win:
       *
       *   - `alerting` — CONFIGURED / NOT_CONFIGURED / DEGRADED. §291/§294's whole point is that
       *     "nothing is watching" must be reported as a fact rather than left as an assumption,
       *     and hiding it would hide the gap rather than the threshold.
       *   - `channel`, `detail`, `lastDelivery` — what an operator reads at 02:00.
       *   - `serverErrorsInWindow` — the observation, not the rule applied to it. A count tells an
       *     operator the service is unhappy; on its own it does not say when anyone finds out.
       *   - `passwordResetEmail.missing` (below) — the variable NAMES are already public in the
       *     source and the register, and an attacker can establish that recovery mail does not
       *     arrive simply by requesting a reset. Removing them would cost the operator the one
       *     line that says what to set and buy nothing.
       *
       * The policy itself is unchanged and `OPERATIONAL_ALERT_POLICY` remains exported: §294's and
       * §296's suites assert against the constant directly, which is where a threshold assertion
       * belongs. Nothing about what alerts, or when, is altered by this.
       */
      monitoring: {
        alerting: alerting.state,
        channel: alerting.channel,
        detail: alerting.reason,
        lastDelivery: alerting.lastDelivery ?? null,
        serverErrorsInWindow: serverErrorCountInWindow(),
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
