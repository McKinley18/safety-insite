# HazLenz Family Matrix — V4 Adjudication Memo

## Summary
V3 authoritative result was **227/228**, with production engineering already fully closed (zero recognition misses, zero negative failures, zero safe/control engineering failures). The sole V3 failure, **FM-155**, exposed a scorer/contract semantic mismatch — not a production defect. This memo documents the adjudicated V4 contract that resolves it, and proves the resolution changes **zero production behavior**.

## V3 Status (immutable, historical)
- `FAMILY_CONTRACT_ADJUDICATION_V3_FULL_FROZEN.json` — SHA-256 `d61caa7274c9c40d599389d22caf7ff0a2b6fffab8c5b814d711692115c9315b`
- `FAMILY_MATRIX_EXECUTION_MANIFEST_V2.json` — SHA-256 `fbc5539031572bc9f16ce61e2c4ba593d86bfa520f162ff86973db0363a332ea`
- `score_family_matrix_v3_authoritative.mjs` — SHA-256 `eeb7fd7ade78f79bd5e6bc52c05511276b3557f6c52dc41025126329254769e1`
- Authoritative result: positive 76/76, negative 76/76, ambiguity 37/38, safe/control 38/38 — **227/228**
- `HAZLENZ_FAMILY_MATRIX_V3_ENGINEERING_CLOSED` remains true and remains reproducible against these exact artifacts. None of these three files were modified to produce V4.

## FM-155 — the discriminating case
Input: *"Welding occurs but breathing-zone exposure is unknown."* Target family: `welding_fumes` (ambiguity). Production's actual output: `welding_fumes` correctly absent (never promoted), `hot_work:ACTIVE` correctly present (independently established by "Welding occurs," unconditional and unrelated to the ambiguous breathing-zone/fume-exposure question). The V3 scorer's ambiguity rule — "any ACTIVE finding of any family fails the row, because `requiredFamilies` is empty" — flags the correct `hot_work` finding as an "unsupported" failure. This is a scorer/contract gap, not a production recognition defect.

A full audit of all 38 frozen ambiguity fixtures found FM-155 to be the **only** one that pairs a definite, independently-established fact about one family with genuine ambiguity about a different family. For the other 37, the entire observation is uniformly uncertain, so the V3 "zero active anything" rule is indistinguishable from a correctly-designed family-relative rule — it simply never gets exercised. FM-155 is the sole case where the two theories diverge.

Corroborating evidence: the manifest's own `expectedBehavior` metadata (present on 76/228 rows, never read by the V3 scorer) already reads `BOUNDED_OR_CLARIFY_WITHOUT_UNSUPPORTED_PROMOTION` for ambiguity rows and `SAFE_OR_RESOLVED_WITH_SIBLING_LOCALITY` for safe rows — both phrasings anticipate family-relative, sibling-aware evaluation, not a global suppression rule. This matches the pervasive family-relative-veto design used throughout the actual production decomposition logic (every fix this session — FM-036, FM-198, and the ~15 FC-A/UA-A/UA-B guards — was built on "unsupported evidence for one family must not suppress an independently-supported different family," never a global rule).

## Adopted Invariant: FAMILY_RELATIVE_AMBIGUITY
> Ambiguity or safe/control status for one canonical family must not automatically invalidate an independently-supported sibling family. When a fixture explicitly defines `forbiddenFamilies`, the scorer evaluates only those explicitly forbidden families for ambiguity/safe rows. Fixtures with empty `forbiddenFamilies` (all 37 other ambiguity rows and all 38 safe rows) fall back to the exact V3 rule, unchanged.

This explicitly does **not** mean: "ignore unrelated findings on ambiguity rows," "any sibling family is allowed," or "only score the named family." It is scoped narrowly to families the fixture author explicitly excludes.

## V3 → V4 Delta
- **Contract**: `FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json` — the 38 family text templates (positive/negative/ambiguity/safe phrase sets) are byte-identical to V3; only the `policy` object gains a `familyRelativeAmbiguitySafeScoring` entry documenting the invariant.
- **Manifest**: `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` — structurally verified against V2: 228 rows, same case IDs, same cardinality (76/76/38/38). **Exactly one field on exactly one row changed**: `FM-155.forbiddenFamilies` from `[]` to `["welding_fumes"]`. `hot_work` was never added to any forbidden list. See `FAMILY_MATRIX_CONTRACT_DELTA_V3_TO_V4.json` for the machine-readable diff.
- **Alias/hierarchy policy**: unchanged. `FAMILY_MATRIX_ALIAS_HIERARCHY_POLICY_V3.json` is reused as-is by V4; no V4 copy was created.
- **Scorer**: `score_family_matrix_v4_authoritative.mjs` imports `ALIASES`, `HIERARCHY`, `extractAuthoritativeFindings`, and `classifyFamily` directly from the V3 scorer module (zero duplication, zero drift). Positive and negative scoring logic is byte-identical to V3. Only the ambiguity/safe branch is extended: if `forbiddenFamilies` is non-empty, only forbidden-family ACTIVE findings fail the row; otherwise the exact V3 "any active family" rule applies.

## No production change
No file under `backend/src` or `safescope-data` was modified to produce or verify V4. All three production hashes are identical before and after this work (see status artifact and final repository proof).

## Verification performed
1. **Unit fixtures** (`test_v4_scorer_unit_20260815.mjs`, 11/11 PASS): proved the family-relative rule in isolation (cases A–C), proved exact V3-fallback equivalence for legacy ambiguity rows with empty `forbiddenFamilies` (cases D–E), and proved positive/negative/safe scoring is unaffected (cases F–H).
2. **Static outcome delta** (`FAMILY_MATRIX_SCORER_OUTCOME_DELTA_V3_TO_V4.json`): re-scored the existing `CURRENT_20260815F` raw findings under both V3 and V4 rules. Result: V3 = 227/228, V4 = 228/228, **exactly one outcome changed (FM-155 UNSUPPORTED_ACTIVE → PASS)**, all other 227 rows byte-identical.
3. **Live V4 Tier-3** (fresh 228-case run against the unchanged engineering-closed candidate, disposable infrastructure): **228/228**, 0 transport failures. FM-155's live result: `hot_work:ACTIVE` present (unchanged, unsuppressed), `welding_fumes` absent (unchanged), outcome PASS via `scoringRule: V4_FAMILY_RELATIVE`. Zero non-FM-155 failures.

## Governance
- V3 artifacts remain byte-identical and are the permanent, reproducible historical record of the 227/228 result and `HAZLENZ_FAMILY_MATRIX_V3_ENGINEERING_CLOSED`.
- V4 is a new, separately-versioned and separately-tracked contract/scorer/manifest set. Adopting V4 does not retroactively alter the V3 result.
- `HAZLENZ_FAMILY_MATRIX_V4_CLOSED` applies specifically to scoring under the V4 contract.
