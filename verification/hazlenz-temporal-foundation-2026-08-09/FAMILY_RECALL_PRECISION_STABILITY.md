# Family recall/precision stability — current candidate

Status: **HAZLENZ_TEMPORAL_FOUNDATION_NOT_READY**

This is a pre-freeze verification phase. No final untouched holdout, protected matrix, Chromium final run, or persistence final run was started.

## Candidate

- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Backend file SHA-256: `safescope-v2.service.ts` = `18385c691b71b97f84cae6d34fdc4704b8d654a552ceea388b10c77db5ae8592`
- Decomposition file SHA-256: `multi-hazard-decomposition.service.ts` = `aa59a595b944c588b67d38add6eec7487e2d174a14a336dcc1b9fc3fae8fa630`
- Development corpus SHA-256: `75b1946b6d7034a27052f05f9a2eae0dd38a0921630d69dc6f6e5045dfbed74b`

## Expanded association controls

The raw machine-readable evidence is `family-controls-current.json`.

- Case A: guarding ACTIVE; no LOTO/electrical promotion — PASS.
- Case B: guarding ACTIVE; no current electrical promotion — PASS.
- Case C: guarding ACTIVE + electrical HISTORICAL; aggregate HISTORICAL is non-authoritative and requires mixed-state summary adjudication.
- Case D: guarding SAFE_VERIFIED + electrical ACTIVE — consistent with the current safe-state model.
- Case E: guarding ACTIVE + hot_work PLANNED_FUTURE — PASS.
- Case F: guarding ACTIVE + genuine LOTO ACTIVE — PASS.
- Case G/G2/G3: genuine exposed-energized electrical ACTIVE — PASS.
- st-006: UNKNOWN; guarding ACTIVE; electrical HISTORICAL; no hot_work — PASS.

The broader controls also exposed unresolved defects:

- L2 (disconnect not isolated before servicing; stored hydraulic energy uncontrolled) and L3 (lock removed while servicing; unexpected re-energization risk) produced no retained LOTO finding. This is a genuine LOTO recall gap.
- Hard-negative H produced an unrelated `noise:ACTIVE` finding.
- Hard-negative E5 produced an unrelated `suspended_loads` candidate.
- Hard-negative L5 produced an unrelated `ppe` candidate.
- L7 produced a spurious LOTO candidate from the clause explicitly saying no lockout deficiency is described.

These are material family-precision/recall failures; the candidate is not stable.

## Development corpus rerun

- 60/60 terminal responses.
- Two initial HTTP 429 rows (st-007 and st-038) were recovered by bounded single-row retries; no row was omitted.
- Raw top-level legacy projection comparison was 30/60, but this is not a valid safety score for the known compound rows. The prior canonical finding-level baseline (49/60) is stale relative to this electrical fallback and was not reused as current evidence.
- Current canonical finding-level scoring is blocked on the unresolved family-association defects above; no score was promoted to readiness.

## Validation

- Backend `npm run build`: PASS.
- Frontend `npm run build` (Next production TypeScript/build phase): PASS.
- Standalone frontend `tsc --noEmit`: blocked by pre-existing duplicate `.next/types` declarations (`cache-life.d 2.ts`, `routes.d 2.ts`).
- `git diff --check`: PASS.
- Disposable PostgreSQL/backend were stopped after execution.
- Original development database and unrelated dirty work were preserved. No reset, clean, stash, commit, or push.

## Remaining blockers

1. Generalized LOTO recall for incomplete isolation/stored-energy/lock-removal cases.
2. Unrelated-family false positives in hard negatives (`noise`, `suspended_loads`, `ppe`) and explicit-negative LOTO leakage.
3. A canonical finding-level development scorer that can report a trustworthy post-fallback score is still required.
4. Because stability is not proven, the final untouched holdout and full protected matrix remain intentionally unexecuted.
