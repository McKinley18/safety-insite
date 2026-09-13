# Controlled release handoff — §277

**Nothing in this document has been executed.** §277 performed no push, no deploy, no
production migration and no production write. This is the sequence to authorize later, in
order, with what to check at each step and what to do when a check fails.

| | |
|---|---|
| Validated candidate | `709ee151b932095020ea69d25daa04a337ccba16` |
| Branch | `beta/expert-hazlenz-validated-candidate-2026-09-12` (never pushed) |
| Expert successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` |
| Baseline record | `verification/current/LOCAL-PRODUCT-BASELINE.json` |
| Local P0 / P1 / P2 | **0 / 0 / 2** — see the baseline for the two P2 items |

**The SHA above is the whole point of this document.** Every gate in the baseline was run
against that commit. Deploying anything else means deploying something that was not
validated, however small the difference looks.

---

## Blockers that must clear before step 1

These are not engineering work and cannot be closed by more of it.

1. **The seven legal drafts in `project-docs/legal/` are unapproved.** All seven read
   `INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`. Two of them —
   terms/privacy and the third-party model disclosure — are P0 release blockers in their own
   right.
2. **No participant may be admitted before the legal gate is satisfied.** That includes
   internal testers using real site data.

---

## The sequence

### 1. Legal / entity gate satisfied

Counsel has classified the seven drafts and the product owner has recorded the decision.
Until then, stop here.

### 2. Fresh production backup

Taken immediately before the migration, not earlier in the day, and **verified restorable**
— an unverified backup is a hope, not a rollback. Record the backup identifier; every step
below is reversible only as far as this point.

### 3. Run production migrations

```
npm run migrate:prod
```

Migrations **019 / 020 / 021** are absent from production; a §269 dry-run reached production
and confirmed that. The command loads the compiled `dist/database/data-source.js` and the
production `typeorm` dependency — no `ts-node`, no `src/`, no devDependency — verifies the
schema in the same command, and exits non-zero on failure.

It is an explicit release step, run **before** activation. `migrationsRun` stays `false` on
purpose: explicit migration makes failure visible and separately auditable.

**If it fails: stop.** Do not deploy. The running instance is still serving the old code
against the old schema, which is a consistent state.

### 4. Verify schema readiness

Confirm 019, 020 and 021 are applied and the expected schema version is current, before any
new code is activated. The rule this protects is that it must be impossible for new
application code to become active against the old schema — §266 measured why: the
`HazLenzAnalysis` entity declares five columns the pre-019 schema lacks, so **every** read of
`hazlenz_analyses` fails, including the core deterministic finalization path.

### 5. Deploy the exact validated candidate

Deploy `709ee151b932095020ea69d25daa04a337ccba16`. Render `autoDeploy` is off
(`autoDeploy: "no"`, `autoDeployTrigger: "off"`) and Vercel Git auto-deploy is disabled, so
this is a deliberate act rather than a consequence of pushing.

### 6. Verify the running SHA

Read it back from the service — do not infer it from the deploy that was requested. §269
established the mechanism: `versionSourceStatus: RENDER_GIT_COMMIT`. The value must equal
step 5's SHA exactly.

### 7. Verify `/health/live` and `/health/ready`

`/health/ready` fails closed when required migrations are absent, so a ready instance is an
instance whose schema matches its build. `healthCheckPath` is set to `/health/ready`, so
Render restarts an unready instance rather than routing to it.

A schema *ahead* of the build reads READY — that is a deliberate code rollback, not a fault.

### 8. Keep Expert execution disabled initially

Set `EXPERT_EXECUTION_ENABLED=false` for the migration verification. Production must set it
to exactly `true` or `false` or **boot fails** — "nobody set it" and "somebody decided it"
must not produce the same running system for the one control reached for in an emergency.

Disabled, the following still work: the deterministic workflow end to end, reads of existing
Expert analyses, and **settlement** of analyses already awaiting confirmation. The last is
deliberate — disabling it would strand every analysis in `ANALYSIS_AWAITING_CONFIRMATION` and
block inspection completion.

### 9. Enable Expert deliberately

Only once steps 6–8 are verified. Flip `EXPERT_EXECUTION_ENABLED=true` as its own change,
with its own verification, so a fault in Expert execution is attributable to that change and
nothing else.

### 10. Run ONE bounded production-path synthetic smoke

One inspection, synthetic data only, on a synthetic account. Expect **two provider legs**
for a verifier-reaching analysis, or one where the verifier is deliberately not reached.
Confirm the per-workspace analysis-count and cost ceilings are configured before the call,
not after — they are enforced after authorization and **before** `claimExecution`, so a
refusal writes no execution row and the transport is never reached.

**This is the first time the live provider transport will ever have been exercised.** It is
`UNVERIFIED_LIVE` in every record to date. Treat the result as information about the
transport, not as evidence about Expert reliability: one call is one call.

### 11. Verify monitoring and events

Render ingests and indexes this service's stdout/stderr; §269 verified that live by inducing
a production request at a unique path and retrieving that exact record. The 17-event
`safety-insite.operational-event.v1` vocabulary has **never appeared in production**, because
the code that emits it is not deployed yet. Absence before this release is expected;
absence *after* step 10 is a finding.

Review with `npm run ops:events` (read-only). Confirm redaction holds: a provider key,
observation text and an `Authorization` header must all read `[redacted]`.

### 12. Verify the server-backed calendar

The §275 defect: nine pieces of persisted due work, zero displayed. Finish the step-10
inspection and confirm its corrective actions and follow-up tasks appear on the Safety
Calendar, on the right days, and survive a reload.

The release gates for this are `test:276-calendar-reconciliation:db` (server) and
`test:calendar-reconciliation` (browser). Both halves matter: a passing server suite reported
everything healthy throughout §275.

### 13. Verify the corrected severity report

Generate the step-10 report and confirm the severity the screen showed is the severity the
PDF states. If HazLenz escalated past the reviewer, the report must carry the reviewer's band
with `HazLenz analysis: <band>` labelled separately — never the escalation in its place.

Confirm the basis line carries no number the reviewer did not choose: a reviewer-confirmed
finding shows their own severity and likelihood words, not the system matrix's integers.

### 14. Verify report branding

Cover reads **SAFETY INSITE**; the running header reads **Safety InSite ·**; the PDF metadata
title reads **Safety InSite Inspection Report**; HazLenz is named as the engine. No bare
`INSITE` wordmark anywhere.

If a correction is needed after issue, it must create a **new revision** — the issued
artifact is immutable and is marked superseded, never rewritten.

### 15. Controlled-beta admission decision

With 6–14 verified and the legal gate satisfied, the product owner decides admission. Not
before, and not as a consequence of the deploy having worked.

---

## What to watch that a green sequence will not tell you

- **Governed citation has never been exercised.** Every execution transmits zero governed
  records, so Expert may cite nothing. Fail-closed on purpose.
- **No finding is reconciled from any Expert analysis**, settled or not. The API says so
  (`findingsReconciled: false`). The guard **refuses**; it does not create.
- **Downstream activation is one consumer.** Finding finalization consumes the effective
  decision. The other five consumers §260 names are *contained* rather than guarded — they
  reach an Expert conclusion only through a finalized finding today, and a future feature
  reading an analysis directly would bypass that.
- **Reviewer revision of a settled analysis is not built.** One settlement per analysis,
  carried as a deferred product decision rather than as a claim that it is irreversible.
- **D-030**: the governed knowledge base has no electrical rule, so an exposed-live-parts
  condition is not proposed as a candidate. The inspector's own "add a finding HazLenz
  missed" path is what covers it today.

## Rollback

Steps 5–9 are reversible by redeploying the previous SHA; a schema ahead of the build reads
READY, so a code rollback does not require a schema rollback. Step 3 is reversible only via
the step-2 backup. That asymmetry is why step 2 is a verified restore and not a dump.
