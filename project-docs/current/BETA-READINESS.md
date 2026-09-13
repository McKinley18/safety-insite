# Beta readiness

**Status: NOT READY. The blocker is legal, not engineering.**

## §278 — the engineering freeze, in six lines

| | |
|---|---|
| **LOCAL PRODUCT BASELINE** | **VALIDATED AND FROZEN** |
| **ENGINEERING RELEASE READINESS** | **READY** |
| **LEGAL RELEASE READINESS** | **BLOCKED** |
| **PRODUCTION RELEASE** | **NOT STARTED** |
| **CONTROLLED BETA** | **NOT YET AUTHORIZED** |
| **LIVE PROVIDER TRANSPORT** | **NOT YET EXERCISED** |

The validated baseline is `709ee151b932095020ea69d25daa04a337ccba16`, recorded with its gates,
digests and remaining items in [`../../verification/current/LOCAL-PRODUCT-BASELINE.json`](../../verification/current/LOCAL-PRODUCT-BASELINE.json).
Local P0 **0**, local P1 **0**, local P2 **2** (D-029, D-030).

**The baseline is frozen.** It does not change without an explicit product-owner authorization
tied to a concrete defect or release requirement. Refactors, polish, renames, HazLenz tuning,
prompt edits, schema changes, compatibility-identifier cleanup, ordinary P3 debt, mass lint
fixes and repository reorganization are all out of scope until then — not because they are
worthless, but because each one invalidates the thing that was validated.

What engineering still owes is **execution**, not development:
[`CONTROLLED-RELEASE-HANDOFF.md`](CONTROLLED-RELEASE-HANDOFF.md) is the authoritative
procedure, and it is **blocked at Step 1** by the legal gate below.

This document distinguishes *release blockers* from *historical findings*. Everything under
"Closed" was a blocker and is no longer one; it is recorded so the question is not reopened.

The machine-checkable half of this is `npm run beta:readiness`, which currently reports **PASS on 58
checks**. That command establishes only that the local engineering mechanisms exist. It contacts
nothing live, and passing it does not mean production is ready — the two lists below are what
actually gate a release.

## Open release blockers

| # | blocker | owner | note |
|---|---|---|---|
| 1 | **No contracting legal entity** | product owner | No entity, address, contact, governing law or beta term is established. Counsel review cannot begin without them. This blocks everything below it. |
| 2 | **Counsel not engaged** | product owner | The packet is prepared and waiting |
| 3 | **Terms, Privacy Notice and AI-provider disclosure unapproved** | counsel | Drafted; all still carry `INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW REQUIRED BEFORE BETA` |
| 4 | **Production migrations not run** | engineering | Must precede deploy — that ordering is the safety property |
| 5 | **Beta candidate not deployed** | engineering | Production runs `de655d2f…`; the validated candidate `709ee151…` is **41** unpushed commits on the beta branch (was 15 when this row was written; §§275–278 added the rest) |
| 6 | **Expert execution disabled** | engineering | `EXPERT_EXECUTION_ENABLED=false`. Enabling it is a runbook step, not a default |
| 7 | **Live provider transport unverified** | engineering | The credential is configured and was validated against the model-list endpoint, which invokes no model. The transport itself has never carried a real analysis in production |


Items 1–3 are the real gate. Items 4–7 are a single runbook execution once 1–3 clear.

**§278 re-confirmed 1–3 against the drafts themselves**: all seven still carry
`LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`, and all five contracting placeholders remain
unresolved. Nothing about the legal gate has moved since §271 — which is expected, because
nothing engineering does can move it. What the product owner must provide or obtain is listed
in [`../legal/README.md`](../legal/README.md) under *The legal handoff checklist*.

The engine-directory rename that stood here as item 8 was **closed at §274**: the engine now
lives at `backend/src/hazlenz/`, no active SafeScope route or module remains, and the candidate
identity moved to the §274 successor `8c163b31…` under authorisation.

## Closed — do not reopen

| closed at | item | evidence |
|---|---|---|
| §269 | Object storage and report generation | Live R2 bucket verified end to end: upload, authorised download with checksum match, unsigned GET and LIST refused, delete, no residue |
| §269 | Database backup and restore | Full logical backup of production taken and a restore rehearsed: 76/76 tables, 7 049/7 049 rows, zero differences |
| §269 | Running production SHA | `de655d2f…` read from `/health/version`, sourced from the platform commit variable |
| §269 | Error-monitoring ingestion | A production request was induced and that exact record retrieved from the log store. Review path: `npm run ops:events` |
| §270 | Provider credential | Configured in production and validated against the provider model-list endpoint, which invokes no model and bills nothing |
| §272 | Free-tier cold start | The service runs on the paid `0.5c-512mb` plan, 1 instance, Oregon. `/health/ready` went from 41.8 s cold on free to 0.23 s. Paid instances do not sleep |
| §272 | `healthCheckPath` unset | Now `/health/ready`, so Render probes readiness and restarts an unready instance |
| §272 | Auto-deploy left on | Off on both platforms. A deploy is now always a deliberate act |
| §272 | Maintenance seed enabled | `ENABLE_MAINTENANCE_SEED=false`; the route that would `ALTER TABLE` against production is unreachable |
| §274 | Active SafeScope namespace | Engine directory, API routes and the dead v1 module all removed. Candidate identity moved to the authorised successor `8c163b31…`, with §259 preserved as provenance |

## Verified live configuration

Read from the platform, not assumed:

- Render compute plan **`0.5c-512mb` (paid)**, 1 instance, `oregon`, not suspended
- backend `autoDeploy: no` / `autoDeployTrigger: off`; frontend Git auto-deploy **off**
- `healthCheckPath: /health/ready`; readiness returns **200**
- `EXPERT_EXECUTION_ENABLED=false`, `ENABLE_MAINTENANCE_SEED=false`, `TYPEORM_SYNCHRONIZE=false`,
  `DEV_AUTH_BYPASS=false`, `NODE_ENV=production`
- provider credential **present and configured**
- production SHA **`de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`**, matching `origin/main`

## How a release actually happens

The ordering in [operations/DEPLOYMENT-RUNBOOK.md](../operations/DEPLOYMENT-RUNBOOK.md) is a safety
property, not a checklist preference:

> fresh backup → production migrations → deploy the exact candidate SHA → verify SHA and readiness →
> enable Expert → bounded live smoke → verify monitoring → beta release decision

Migrations precede deploy so an instance never serves against a schema it does not expect, and
`/health/ready` fails closed if that order is violated.
