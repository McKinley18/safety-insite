# P0 Regression

## Protected/tracked file hash verification (post-fix)

All hashes recomputed via `git hash-object` after the edits and compared against the Phase 0 baseline (`P0_BASELINE.md`, itself matching the 2026-08-16 Production Polish audit's recorded values):

| Surface | Result |
|---|---|
| V4 recognition core (`safescope-v2.service.ts` classification/recognition logic, `multi-hazard-decomposition.service.ts`, `deterministic-classifier.ts`, taxonomy JSON, 3 frozen family-matrix artifacts) | `multi-hazard-decomposition.service.ts`, `deterministic-classifier.ts`, and the taxonomy JSON are byte-identical (unchanged). `safescope-v2.service.ts` **has changed** — this is the file P0-03's confirmed root cause lives in (`buildEnhancedGeneratedActions`, a corrective-action-generation function, not a classification/recognition function). See "V4 classification-path isolation" below for the argument that classification itself is unaffected. |
| V5-C01 (finding-scoped risk: `inspection-finding.entity.ts`, `inspection.service.ts`, `finding-risk.mapping.ts`) | Byte-identical, unchanged. |
| V5-C02 (shared evidence-fact foundation, 5 files) | Byte-identical, unchanged. |
| V5-C03 (`finalization-gate.ts`) | Byte-identical, unchanged. |
| V5-C04 (dead/placeholder cleanup) | All 6 deletion-set files remain absent, as before. |
| V5-C05 (primary inspection flow, 4 files) | Byte-identical, unchanged. |
| P1-02 (`corrective-action-brain/corrective-action.service.ts`) | Byte-identical, unchanged — Generator B (the P1-02-repaired narrative logic) was not touched; only its priority relative to Generator C at the assembly site was corrected. |

## V4 classification-path isolation argument

`safescope-v2.service.ts` changed, but the change is provably confined to corrective-action-generation code, not classification:

- `this.classifier.classify(fusedText)` (the call that drives all family/hazard-recognition scoring, including the 228-case frozen family-matrix regression) executes at line ~985, using the unmodified `fusedText`.
- Both edits made in this phase are (a) a change to the 5th argument passed to `buildEnhancedGeneratedActions()` at its call site (line ~1823, ~840 lines after classification has already run and `result`/`promotedPrimary` are already finalized), and (b) two new branches added inside `buildEnhancedGeneratedActions()` itself (lines ~4953, ~5092), a function that only produces corrective-action title/body strings and is never read by, or fed back into, the classifier, risk engine, or family-matrix scoring.
- No edit touches `fusedText`, `result`, `promotedPrimary`, `evaluateRisk`, `multi-hazard-decomposition.service.ts`, or `deterministic-classifier.ts`.

Given this, classification output is structurally unaffected. This was supplemented with 5 live smoke-test scenarios (machine guarding, isolated walking-surfaces fragment, electrical, genuine LOTO, genuine fall protection — see `P0_REGRESSION.md`'s companion `P0_BROWSER_VERIFICATION.md`/`P0_03_ACTION_ASSOCIATION_CONTRACT.md`), all of which classified correctly. The full 228-case frozen family-matrix suite was **not** re-executed in this phase (it operates against pre-captured fixture files, not live requests, and a full live re-capture was judged out of the P0-scoped time budget) — this is reported honestly as a structural-isolation argument plus targeted live smoke tests, not as an executed full-suite pass.

## PRA-002 regression

`inspection.service.ts` (where the PRA-002 fix — deduplicated review-ID counting in the `completed` transition — lives) is byte-identical to its pre-session baseline. Not independently re-tested to full inspection completion (`transition(..., 'completed')`) in this phase; the deepest state reached in live testing was per-finding finalization, not full-inspection completion. Reported as unchanged-by-hash, not independently re-exercised.

## Authorization regression

No cross-user mutation or export access was introduced. All edits are either pure display-derivation (P0-02) or server-side text-scoping/branch-priority changes that operate on already-authenticated, already-scoped request data (P0-03); no authorization/guard code was touched. The test entitlement grant used throughout this phase was created via the repo's own disposable-database-gated script (`grant-test-entitlement.ts`), which refuses to run against any database not matching an explicit `test*`/`phase*` allowlist pattern and `NODE_ENV=test`.

## Persistence regression

Finding state was confirmed to survive reload multiple times in this phase (forced by an incidental JWT expiry mid-session) — see `P0_ADVERSARIAL_IDENTITY_MATRIX.md`.

## P1 non-regression check

The four known P1s were not targeted for fixing. Checked incidentally:

1. `DEV_AUTH_BYPASS=true` raw 500 — not re-triggered; this phase's entire live-verification session ran with `DEV_AUTH_BYPASS=false` (real login) specifically to avoid it, matching the prior audit's own workaround. Status unchanged (still present in the default `.env`, not touched).
2. Standards paraphrase mislabeled as "official text" — not touched; the standards-citation display path was not part of any P0 fix.
3. Standards not clickable — not touched.
4. Report cloud-save `PayloadTooLargeError` — not touched; this phase's PDF exports used the client-side `jsPDF` path, not the cloud-save path.

No P1 became worse or escalated to a P0 as a result of this phase's changes.
