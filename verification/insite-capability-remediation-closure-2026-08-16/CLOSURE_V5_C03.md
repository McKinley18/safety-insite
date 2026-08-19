# CLOSURE — V5-C03 Evidence-Sufficiency / Finalization Regression (Live Re-Run)

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.

## Result: **V5-C03 PASS** (independently live re-run against a disposable DB + live backend)

## Infrastructure

- Disposable database: `test_hazlenz_closure_20260816` (127.0.0.1:5432), created fresh this
  session. `DATABASE_URL` explicitly exported for every command (never relied on unset/dotenv
  fallback — see `CLOSURE_BASELINE.md` for the positive/negative resolution proof).
- Migrations: `DATABASE_URL=...test_hazlenz_closure_20260816 npm run migration:run` — exit 0,
  36 migrations applied to the disposable DB. `safescope`'s migrations count independently
  confirmed unchanged (35 before, 35 after).
- Backend started against the disposable DB only: `DATABASE_URL=...test_hazlenz_closure_20260816
  PORT=4320 NODE_ENV=test DEV_AUTH_BYPASS=true npx ts-node src/main.ts`. Health check confirmed
  `{"status":"ok","database":"up"}`.

## What was run

1. `c03_finalization_gate_unit_tests.ts` (pure in-process, no DB) — 8/8 PASS
   (`grep -c '"pass": false'` = 0). Covers: protected-provisional stays provisional; final +
   insufficient + no citation newly blocks; final + insufficient + citation does NOT block
   (belt-and-suspenders); weak/partially_sufficient/sufficient never block;
   `evidenceSufficiency` undefined (degraded path) never blocks or crashes; explicit
   monotonicity check (gate never turns a blocked `mayFinalize` into `true`).
2. `c03_live_harness.ts` — live-executed against the disposable backend
   (`API_BASE_URL=http://127.0.0.1:4320 DATABASE_URL=...test_hazlenz_closure_20260816
   HAZLENZ_TEST_DATABASE_URL=...test_hazlenz_closure_20260816 NODE_ENV=test
   NODE_PATH=<backend>/node_modules npx ts-node .../c03_live_harness.ts`). All 11/11 fixtures
   returned HTTP 201 with the expected stage/finalize pattern:

| Fixture | resultStage | mayFinalize | humanReviewRequired |
|---|---|---|---|
| sufficient | final | true | false |
| insufficient_vague | provisional | false | true |
| clarification_required_energy_unknown | provisional | false | true |
| optional_enrichment_jurisdiction_unknown | final | true | false |
| ambiguity | provisional | false | true |
| negation | provisional | false | true |
| historical_resolved | provisional | false | true |
| planned_future | provisional | false | true |
| safe_controlled | provisional | false | true |
| failed_control | final | true | false |
| multi_hazard | provisional | false | true (citation present: `29 CFR 1910.212(a)(1)`) |

## Verified against the required checklist

- Narrow bottom-tier insufficiency gate remains intact: `insufficient_vague` and `ambiguity`
  both correctly held at `provisional`/`mayFinalize: false` — the gate is not disabled or
  weakened.
- `resultStage` / `mayFinalize`: present and behaviorally correct on every fixture.
- Sufficient case: `sufficient` finalizes (`final`/`true`).
- Genuinely vague/insufficient case: `insufficient_vague` blocked.
- Optional clarification case: `optional_enrichment_jurisdiction_unknown` finalizes with a
  real citation, non-mandatory clarifications only.
- Negated safe-state case: `negation` correctly stays `provisional` pending human review
  (finalization gate does not over-trust a negation-derived safe state without review — matches
  the contract's "must not over-block, must not blindly finalize" balance).
- Effective-control case: `safe_controlled` stays `provisional` — same reasoning.
- Failed-control case: `failed_control` finalizes (`final`/`true`) — genuine unresolved hazard
  is not suppressed by the presence of a (failed) control.
- Historical/planned-future: both stay `provisional`, human review required — no premature
  finalization of stale/future-tense claims.
- Multi-hazard: `multi_hazard` stays `provisional` but carries a real `primaryCitation`,
  consistent with the belt-and-suspenders rule.

## Regression classification

No failures. The negation/effective-control improvements made this remediation phase did **not**
make the sufficiency gate more permissive (nothing that should stay blocked slipped through) or
more restrictive (`sufficient` and `failed_control` still finalize correctly). Clean PASS.
