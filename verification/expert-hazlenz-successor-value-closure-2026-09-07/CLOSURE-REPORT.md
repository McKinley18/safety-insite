# §204 — successor value-shape closure (Lane B: D05 / D06 / D07)

**Provider calls = 0 · database operations = 0 · no §203 module modified · no §187-pinned ancestor
modified · no promotion into existing callers · governed stage default remains `REDACTED` · no
semantic verdict supplied by any component of this lane.**

## Contract identity

**`hazlenz.expert.204-successor-closure.v1`**, an ADDITIVE successor revision. Lineage held as
code in `expert-204-closure-identity.ts`: `hazlenz.expert.203-successor-boundary.v1` → §204
closure successor. The five §203 successor modules are §204's direct frozen ancestors (sha256
pinned, recomputed from file bytes at authoring time); the §187/§192 ancestry is imported from the
§203 identity module and never restated, so the two contracts cannot disagree about it. §204 has
its own source manifest (`SUCCESSOR-SOURCE-MANIFEST-204.json`), its own integrity gate
(`verify:204-source-integrity`, distinguishing CLOSURE_DRIFT from ANCESTOR_DRIFT, loud
MANIFEST_ABSENT), and its own byte-safe raw-NUL gate (`verify:204-text-integrity`).

**No versioning STOP was needed: composition sufficed.** The §204 receiving boundaries perform the
closure checks and delegate the same input to the UNMODIFIED §203 functions. The §203 result is
carried inside the §204 result for differential evidence.

## RT203-1 / D05 — bounded scan, fail closed

`expert-204-bounded-scan.ts`: iterative (non-recursive) traversal with explicit bounds held as
data — `SCAN_MAX_DEPTH = 32`, `SCAN_MAX_NODES = 10,000` — and ancestor-set cycle refusal.
Tri-state result: `SCAN_COMPLETE` (exhaustive findings) or `SCAN_LIMIT_EXCEEDED`
(`DEPTH_LIMIT` / `NODE_LIMIT` / `CYCLE_DETECTED`). **The exceeded arm carries no `findings` field
at all**, so "limit reached, zero findings, therefore clean" is not even expressible on it —
SCAN_LIMIT_REACHED can never read as NO_FORBIDDEN_CONTENT_FOUND. `JSON.parse` output cannot be
cyclic; the cycle arm exists because the function is also programmatically callable, and a bound
that only holds for well-behaved callers is the defect class this closes. Call sites: the §204
binding boundary refuses `SCAN_LIMIT_EXCEEDED_FAIL_CLOSED`; the §204 projection boundary refuses
before delegating. A forged "admitted anyway" result THROWS at `applyAdmittedDeclarations204`
(`CLOSURE_REFUSED_DECLARATION_IN_APPLY`).

## RT203-2 / D06 — free text non-authoritative, structural bounds only

No citation detector, no regex over regulatory meaning, nothing semantic. Policy held as data:
type must be plain string (the RT203-2 carrier `{citation: '29 CFR 1910.147', approved: true}` is
refused as `FREE_TEXT_NOT_A_STRING` — a shape violation regardless of content); required fields
non-empty; `FREE_TEXT_MAX_BYTES = 4096` (UTF-8); control bytes below 0x20 refused except
TAB/LF/CR, DEL (0x7F) refused — raw NUL therefore always refused. Governs `question` plus the six
nomination free-text fields. Authority separation proven, not asserted: the §204 result surface
emits no governed-provenance field of any kind (asserted by test over the serialized result), an
admitted declaration passes through byte-identical, structured supplied-`sourceId` binding in the
SEPARATE §202 governed stage remains the only governed-binding authority, and
`DEFAULT_GOVERNED_TEXT_EXPOSURE === 'REDACTED'` is asserted by the suite (RT2-F).

## RT203-3 / D07 — affectedDecision independently validated

Declaration-level `affectedDecision` (the BOUND-path gap) is membership-checked at the §204
receiving boundary against the IMPORTED `OWED_FACT_AFFECTED_DECISIONS` closed set. Invalid,
unknown, missing, or caller-cast values → `AFFECTED_DECISION_NOT_A_MEMBER`, rejected whole. Valid
values are preserved byte-exactly (same object reference asserted). No coercion, no default
substitution, no repair: the near-member `'REQUIRED_CONTROLS'` is refused and survives unmodified
on the refused record.

## Integration status per RT finding

| finding | GUARD_EXISTS | GUARD_CALLED | GUARD_REJECTS_ADVERSARIAL_INPUT | §203 differential |
|---|---|---|---|---|
| RT203-1 | ✓ (`boundedGovernanceScan`) | ✓ (binding + projection §204 boundaries) | ✓ (depth 40, >10k nodes, cycle, forged apply) | §203 admits the depth-40 question and misses the depth-10 burial — historical behavior unchanged, measured |
| RT203-2 | ✓ (`freeTextViolations`) | ✓ (binding boundary, 7 fields) | ✓ (object-valued question, 4097 B, NUL, BEL) | §203 admits the object-valued question — unchanged, measured |
| RT203-3 | ✓ (membership check at boundary) | ✓ (every declaration) | ✓ (bogus, missing, cast, near-member) | §203 admits `TOTALLY_BOGUS_DECISION` — unchanged, measured |

## Files created (10, nothing pre-existing modified)

`backend/scripts/lib/expert-204-closure-identity.ts` · `expert-204-bounded-scan.ts` ·
`expert-204-closure-binding.ts` · `expert-204-closure-projection.ts` ·
`backend/scripts/generate-204-source-manifest.ts` · `verify-204-source-integrity.ts` ·
`verify-204-text-integrity.ts` · `test-204-value-shape-closure.ts` · this report ·
`SUCCESSOR-SOURCE-MANIFEST-204.json` (generated at freeze).

## Verification executed (exact results in the suite output)

- `test-204-value-shape-closure`: **36 passed / 0 failed** (first run; re-run after freeze)
- §203 suites unchanged: re-executed at freeze (counts reported by the implementer)
- `EXPERIMENT_SCOPE_TYPECHECK (§204)`: `npx tsc --noEmit -p tsconfig.scripts-204.json` exit 0
- `verify:204-text-integrity`, `verify:204-source-integrity`: run at freeze

## Not done, deliberately

No hosted validation of any kind; no wiring into any executor or existing caller; no change to
§203 behavior for clean input (byte-identical apply differential asserted); no citation detector;
no semantic judgment about any free-text content; no final fact-identity, escalation, or OwedFact
representation decision.
