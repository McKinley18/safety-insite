# Beta operations

How the controlled beta is run once it starts. Until the legal blockers in
[current/BETA-READINESS.md](../current/BETA-READINESS.md) clear, none of this is live.

## Daily posture

| question | command | expectation |
|---|---|---|
| is the repository state sound? | `npm run hazlenz:verify` (backend) | PASS, drift 0 |
| do the beta mechanisms still exist? | `npm run beta:readiness` (backend) | PASS |
| is production up and current? | `npm run release:verify-sha` (backend) | the running SHA is the deployed candidate |
| what happened in production? | `npm run ops:events` (backend) | read-only review of the Render log store |
| has retired branding leaked? | `npm run brand:audit` (backend) | Tier 1 = 0 |

`ops:events` shells out to the authenticated Render CLI, so no credential is stored in the
repository.

## Spend control

Expert analysis costs money per call, so the controls are budgetary as well as safety-related:

- `EXPERT_EXECUTION_ENABLED` — the kill switch. Must be exactly `true` or `false`; boot fails if
  absent. Turning it `false` stops all provider execution immediately.
- `EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE` (10) and
  `EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE` (25), over
  `EXPERT_SPEND_WINDOW_HOURS` (24).
- `EXPERT_ANTHROPIC_TIMEOUT_MS` (180 000).

If spend needs to be stopped now, set the kill switch to `false`. It is a decision, not a default,
and it is checked at boot precisely so nobody has to discover mid-incident whether it was wired.

## Participant intake

Beta participants need accounts before they can do anything, and the legal drafts must be approved
and presented before a participant is onboarded — they are what the participant is agreeing to. The
maintenance seed route stays disabled; participant accounts are created through the normal
authenticated flow.

## Incidents

1. **Stop the bleeding.** If it involves analysis, set `EXPERT_EXECUTION_ENABLED=false` first and
   diagnose afterwards.
2. **Establish what is running** — `/health/version` and `npm run release:verify-sha`. Do not
   reason about a SHA you have not read.
3. **Read the log store** — `npm run ops:events`, filtering by path.
4. **Choose a recovery** using [ROLLBACK-MODEL.md](ROLLBACK-MODEL.md). The binding constraint is
   that recovery must never destroy human settlements to restore older code.
5. **Escalation and alerting routes** are in [MONITORING.md](MONITORING.md).

## What must not be done during beta

- No schema change outside a migration, and no migration without a fresh backup.
- No deploy that skips the runbook ordering; auto-deploy stays off on both platforms.
- No enabling of `ENABLE_MAINTENANCE_SEED` against production.
- No editing of protected HazLenz modules or frozen verification evidence to make a check pass.
