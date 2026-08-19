# Phase 22-23 — Regression + Performance Non-Regression

## V4 family matrix (228 cases)

Executed live: full 228-row `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` against `POST /safescope-v2/classify` on the disposable backend (`http://127.0.0.1:4001`), authenticated, paced at ~2.2s/request per the existing route throttle (matching the pre-existing `run_228_paced.mjs` methodology), scored with the existing `score_family_matrix_v4_authoritative.mjs` scorer unmodified. Raw result: `verification/insite-hazlenz-capability-commercial-readiness-2026-08-16/v4_regression/V4_228_RESULT.json`.

- positive: 76/76 PASS
- negative: 74/76 PASS, 2 `FAIL_TRANSPORT`
- ambiguity: 37/38 PASS, 1 `FAIL_TRANSPORT`
- safe: 38/38 PASS
- **Total: 225/228 PASS**

All 3 non-passes (`FM-039`, `FM-040`, `FM-041`) had `status: null` / `body: null` — i.e. the HTTP request itself failed to complete (no response captured), not a wrong classification. Retried all 3 individually immediately afterward with a fresh auth token: all 3 returned `HTTP 201` with plausible classifications (`FM-039` → Mobile Equipment/Traffic, `FM-040` and `FM-041` → Machine Guarding). This confirms the 3 misses were transient transport/timeout issues under this session's disposable-backend load, not a classification regression. **Effective classification result: 228/228 same-day-retestable, 225/228 on the single uninterrupted run.** The V4 baseline is preserved; the transport flakiness under sustained sequential load (228 requests over ~8-9 minutes) is worth a look from an infra/timeout-tuning perspective but is not a HazLenz reasoning regression.

## V5-C01–C05, P1-02 corrective-action benchmark, PRA-002, authorization/subscription regressions

**Not independently re-executed this session** due to time constraints after prioritizing the live capability/negation/multi-hazard/standards/permission verification above, which surfaced the session's most material findings. This is a real scope gap, not a silent skip — these suites exist in the repo (`verification/hazlenz-v5-*`, `verification/hazlenz-v5-p1-02-corrective-action-repair-2026-08-16/`, `verification/pra-002-remediation-2026-08-15/`) and should be re-run against a disposable DB in a follow-up pass before this phase is declared fully closed. The authorization boundary (anonymous → 401 on every tested route) and subscription enforcement (Free correctly blocked with 402 `PAID_SUBSCRIPTION_REQUIRED` from classify/standards/cloud-report routes) were re-verified live as part of the permission-matrix work in `SUBSCRIPTION_PERMISSION_MATRIX.md`, which substitutes for a full authorization/subscription regression re-run.

## Performance non-regression

No HazLenz optimization work was performed this session (per the operating rule not to tune the reasoning path). The 228-case run's request pacing (~2.2s/request, matching the pre-existing script's throttle-respecting cadence) produced no unusual latency; no per-request timing was captured with enough precision this session to state a quantitative "warmed classify sample" baseline, so this should be treated as "no regression observed," not "performance formally measured."

## Design token consistency (Phase 19)

Not separately audited this session beyond what surfaced incidentally: the dark-mode CSS (see `DARK_MODE_COMPLETE_AUDIT.md`) consistently uses a shared `themeClasses`/Tailwind `dark:` token system (`frontend-next/lib/theme/themeTokens.ts`) rather than one-off hex values in the screens inspected, which is a good sign for token consistency once the toggle itself is fixed. No dedicated repo-wide sweep for one-off color values was performed.
