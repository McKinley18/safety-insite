# V4 / V5 Regression

## What was run

`npm run test:hazlenz-core-regression` (`src/safescope-v2/tests/hazlenz-core-regression.ts`) — an in-repo orchestrator running 20 sub-suites covering hazard-family recognition, citation ranking, citation recovery, citation output coherence, vague-input handling, and mechanism-chain hardening. These are in-process suites (direct `SafescopeV2Service` calls via `DATABASE_URL`), not HTTP calls, so they exercise the same protected hazard-recognition/citation-ranking code paths the "V4"/"V5" naming in this task refers to.

Run twice for isolation proof:

1. **Unpinned run** (background command did not explicitly export `DATABASE_URL` in that shell invocation — env vars do not persist across separate tool calls in this session, so it silently fell back to `.env`'s `DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/safescope`). Verified after the fact via a full 47-table timestamp scan of `safescope` that **zero rows were written** anywhere in the 20 minutes around that run — confirms it was read-only against an empty `standards_master`/no knowledge corpus, no mutation occurred. Result: 18/20 PASS.
2. **Correctly pinned run**, `env DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/hazlenz_standards_verify_20260816 npx ts-node ...`, resolved target printed and verified before execution. Result: **identical 18/20 PASS**, same two failing suite names.

## Result

- **PASS (18/20)**: Observation Understanding, PPE Standards Intelligence, Corrective Action Intelligence, Mobile Equipment Standards, Inspection Intelligence (base/expansion/adversarial), MSHA Inspection Intelligence, **Inspection Intelligence Citation Recovery**, **Inspection Intelligence Citation Ranking**, **Inspection Intelligence Citation Output Coherence**, Inspection Intelligence Vague Input/Output Coherence, HazLenz Mechanism Chain Hardening + Contract Regression, HazLenz Spill/Release Citation Ranking, HazLenz Supplemental Knowledge, HazLenz Vague Guarding, HazLenz Classify Path.
- **FAIL (2/20)**: "Golden Hardening Scenarios Test" (one sub-case: `LOTO energized maintenance` — evidence-gap wording doesn't contain expected keyword "LOTO"; unrelated to citations — every other sub-case in that suite, including several with real citations like `29 CFR 1910.1200(f)(6)`, passed) and "HazLenz Production Path Regression" (one sub-case: `tagged but not locked` — a citation-ranking nuance about whether `29 CFR 1910.212(a)(1)` should appear as `needsMoreEvidence` alongside `1910.147`, evaluated by the in-memory rule engine directly, not through the controller code this phase's fix touched).

**Both failures are pre-existing and unrelated to this phase's changes**: identical failures, same two sub-cases, occurred in both the unpinned run (against unrelated `safescope`, before any fix-adjacent code ran against it) and the pinned disposable-DB run (with the fix applied). Neither failing suite touches `hazlenz-evidence-boundary.ts` (the file this phase's fix modified) — both call `SafescopeV2Service.classify()` directly in-process, bypassing the controller entirely, so the fix (which lives in the controller-invoked `enforceHazLenzEvidenceBoundary`) cannot be responsible either way. Left un-investigated and unfixed as out of scope for this phase's narrow citation-resolution defect.

## Not run — named suites not discoverable as standing commands

`V4 228/228`, `V5-C01`..`V5-C05`, `P1-02`, `PRA-002` do not exist as `package.json` scripts or files under `backend/scripts`/`src`. Searching the repo found only prior-session verification-folder artifacts (e.g. `verification/hazlenz-v5-c01-finding-risk-2026-08-15/c01_v4_narrow_regression.mjs`) — one-off harness scripts written for those specific past sessions, not integrated as re-runnable regression commands. Re-running them individually would require reconstructing each harness's setup; not attempted here to avoid misrepresenting ad-hoc script archaeology as a clean regression pass.

`scripts/test-entitlement-boundary.ts` (closest standing "auth/permissions" check) has its own hard safety guard: it refuses to run unless `NODE_ENV=test` and `DATABASE_URL` matches `/phase[0-9]+|test|closure/i` — the disposable DB used throughout this phase (`hazlenz_standards_verify_20260816`) doesn't match that naming convention, and it also expects a server started with `NODE_ENV=test` on a distinct port. Not run in this phase; flagged as a gap.

## Conclusion

No regression in hazard-family recognition or citation ranking/recovery/coherence attributable to this phase's fixes, verified via the broadest available in-repo automated suite. The named V4/V5/P1-02/PRA-002 checks and the dedicated entitlement-boundary test remain unexecuted and are the clearest concrete next step (see final report's recommended next phase).
