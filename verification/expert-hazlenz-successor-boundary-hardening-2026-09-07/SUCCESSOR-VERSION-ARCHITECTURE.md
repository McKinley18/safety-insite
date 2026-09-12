# §203 — successor version architecture (Agent A)

**Provider calls = 0 · database operations = 0 · no existing file modified.** Every hash below was
recomputed from actual file bytes on 2026-09-07; none is copied from a task description.

## 1. Version map

```
FROZEN §187 CONTRACT                                   SUCCESSOR DEVELOPMENT CONTRACT
hazlenz.expert.owed-fact-binding.runtime.v1     ──►    hazlenz.expert.203-successor-boundary.v1
hazlenz.expert.first-pass-owed-fact-projection.v1 ─►   (single successor identity for the whole
(+ unversioned owed-facts companions)                   receiving boundary, held as code in
                                                        expert-203-successor-identity.ts)
```

Frozen ancestor identity, recomputed and equal to its pin today:

| ancestor | sha256 | pinned by |
|---|---|---|
| `src/.../owed-facts/owed-fact.types.ts` | `102d059b…9311e30a` | §187 `owedFactSourceHashes` |
| `src/.../owed-facts/owed-fact-ledger.ts` | `4fe33190…44ab3701` | §187 `owedFactSourceHashes` |
| `src/.../owed-facts/owed-fact-binding.ts` | `e25f1fa8…6ae1cd3e0`* | §187 `owedFactSourceHashes` |
| `src/.../owed-facts/verifier-v3-development-boundary.ts` | `5273d5af…6ae15245` | §187 `owedFactSourceHashes` |
| `src/.../expert-prompt.ts` | `bfe564c2…7fd0f694` | §187 `firstPassIdentity.promptFileSha256` |
| `scripts/lib/expert-verifier-contract-v3.ts` | `475a9577…62d6a3dc` | §192 `admissionValidatorSha256` |
| `scripts/lib/expert-first-pass-owed-fact-projection.ts` | `aab67e0b…60256432c`* | **FROZEN_BY_RECORDED_EVIDENCE** (below) |

\* full 64-hex values are in `expert-203-successor-identity.ts:ANCESTOR_PINS`, which is the
machine-readable authority; this table is the human view.

**The §187 pin location**, established by search rather than assumption:
`verification/expert-hazlenz-required-structured-verifier-validation-2026-09-05/PREREGISTRATION.json`
→ `owedFactSourceHashes` (four files). Re-asserted by eleven scripts:
`verify-188/190/191/192/193/194/195/196/197/198/199-source-integrity`.

**`expert-first-pass-owed-fact-projection.ts` freeze status** (the one non-obvious case): it is
*not* hash-pinned against a frozen expected value anywhere. It *is* frozen in practice: its sha256
is recorded inside §196 (`NEW … sha256` line 149-150), §197 (line 308) and §198 (line 351-352)
evidence emissions, and `verify-197-source-integrity.ts:248` / `verify-199-source-integrity.ts:255`
assert a byte-level property of it (the absence of any `transition(` call). §203 classifies it
**FROZEN_BY_RECORDED_EVIDENCE** and treats it exactly as pinned: successor behavior is added by
WRAP, never by edit.

## 2. Source ownership map (function level, touched functions only)

| successor module | lineage | ancestor function(s) | owner |
|---|---|---|---|
| `expert-203-successor-identity.ts` | NEW | — | A |
| `expert-203-successor-projection.ts` | **WRAPS** `expert-first-pass-owed-fact-projection.ts` | delegates to `projectDeclaredOwedFacts` unmodified; pre-boundary enforces ABF-1/2/7 | B |
| `expert-203-successor-binding.ts` | **COPIED_FROM** `owed-fact-binding.ts` | successor versions of `checkBindingDeclarations` (ABF-3, ABF-5, ABF-8, Ruling-5 contract) and `applyAdmittedDeclarations` (deterministic priority, `nominationOutcomeViolations` post-condition). `bindingSideEffects`, `evaluateTargetCoverage`, `parseOwedFactDeclarations` are NOT copied — unchanged behavior is imported, not duplicated | B, then C (declared handoff) |
| `expert-203-fact-identity-collision.ts` | NEW | — | C |
| `expert-203-effective-grammar-identity.ts` | NEW (Ruling 7; §201 prototype retired prospectively) | — | E |

The successor **imports the frozen ledger module unchanged** (`owedFact`, `nominateAdditiveFact`,
`transition`, `factOf`, `preservationViolations`). Copying it is unnecessary: the ABF-5 defect is
not *in* `addOwedFact` (its exact-key no-op is the documented deduplication policy,
`owed-fact-ledger.ts:152-158`); the defect is that `checkBindingDeclarations` admits the colliding
nomination in the first place (`owed-fact-binding.ts:204-208` tests only `UNRESOLVED`). Fixing
admission upstream and adding the §202 `nominationOutcomeViolations` post-condition downstream
closes the silent path without touching the pinned ledger.

## 3. Per-guard placement decisions

Wrap where the receiving boundary genuinely sees the unsafe value before the frozen code runs;
copy where the frozen function's own contract must change.

| finding | decision | where the call site lives | why |
|---|---|---|---|
| **ABF-1** declaring-stage membership | **WRAP** | `projectDeclaredOwedFacts203` pre-check on `input.stage` via §202 `declaringStageViolations` | `stage` is a wrapper-visible input; the frozen function never needs to see a non-member |
| **ABF-2** acceptableEvidence provenance | **WRAP** | per-declaration pre-screen: for each bound governed id with a held criterion, provenance must be a member of `ACCEPTABLE_EVIDENCE_PROVENANCES` (§202 `acceptableEvidenceProvenanceViolations`) | the criteria map `acceptableEvidenceBySourceId` is wrapper-visible input |
| **ABF-7** nested forbidden governance fields | **WRAP** | per-declaration pre-screen via §202 `nestedForbiddenGovernanceFields` (depth-recursive) before delegation | declarations are wrapper-visible input; a declaration refused here never enters frozen code at all |
| **ABF-3** nomination forbidden-field scan | **COPY** | inline in `checkBindingDeclarations203`'s NOMINATED_NEW branch, scanning `d.nomination` | cannot wrap: the frozen checker *requires* `n.priority` (`NOMINATION_PRIORITY_NOT_A_MEMBER` at `owed-fact-binding.ts:201-203`), and the Ruling-5 successor contract removes that field, so delegation would refuse every well-formed successor nomination |
| **ABF-8** nomination ceiling | **COPY** | `checkBindingDeclarations203` takes no widening parameter; the ceiling is the frozen constant `1`, and a legacy-shaped caller-supplied widening is structurally unrepresentable | a bare default parameter cannot be hardened from outside the function |
| **ABF-5 / Ruling 3** identity collision | **COPY** | `checkBindingDeclarations203` widens the collision test to **all statuses**: UNRESOLVED keeps the historical code; any terminal status yields the explicit structural state `FACT_IDENTITY_COLLISION` (fail closed, nomination refused, fact untouched, no reopen, no synthesized key, diagnostic exposed). Post-condition: `applyAdmittedDeclarations203` calls §202 `nominationOutcomeViolations` so an admitted-but-factless nomination can never again be silent | the narrowest boundary holding BOTH identities (nomination.factKey and the ledger) is the admission check itself |

**Ruling-5 consequence resolved structurally**: the successor nomination payload carries **no
provider-authored authoritative priority field**. Actual `OwedFact.priority` for a successor
nomination is deterministically assigned (the non-escalating floor, the same policy
`FIRST_PASS_PROJECTED_PRIORITY` documents at `expert-first-pass-owed-fact-projection.ts:88-105`).
If B preserves model urgency it must be a separately named non-authoritative nomination field that
maps into no escalation state. This also dissolves the ABF-4 contradiction *for the successor
contract only* — the historical `NominationPayload.priority` requirement stands untouched in the
frozen module, and no final escalation-policy redesign is performed (explicitly out of §203 scope).

**Ruling-4 consequence**: every successor model-facing schema B emits must set
`additionalProperties: false` at the actual schema boundary, with adversarial tests (Agent D
attacks this independently).

**One honest behavioral divergence, chosen and recorded rather than hidden.** Pre-screen exclusion
(ABF-2/7) means a wrapper-refused declaration never increments the frozen function's internal
`anchorCounts`, whereas §202's recorded in-place insertion for ABF-2 would have refused *after*
the ordinal was consumed (`:574-575` runs before `:598-611`). Two declarations sharing an anchor
where the first is ABF-2-refused therefore yield ordinal 1 (successor) vs ordinal 2 (insertion
semantics) for the second — a different `factKey`. The successor rule — *identity is computed over
declarations that survive the successor receiving boundary* — is the cleaner contract and is part
of the new version's identity; B must pin it with a regression test. It is a successor-contract
difference, not a reproduction error: the frozen path's own behavior is unchanged and still
reproducible byte-for-byte.

## 4. Successor source manifest design

- **Generator** `generate-203-source-manifest.ts` (orchestrator-run, at implementation freeze):
  hashes every file in the four §203 families (`scripts/lib/expert-203-*`, `scripts/test-203-*`,
  `scripts/verify-203-*`, `scripts/generate-203-*`) from actual bytes; records the seven ancestor
  pins from `ANCESTOR_PINS` as labelled ancestor evidence; reports planned-but-absent and
  unplanned modules rather than silently reconciling; deterministic (no timestamp, sorted keys) so
  re-running over unchanged sources is byte-idempotent.
- **Gate** `verify-203-source-integrity.ts`: recomputes everything; distinguishes
  `SUCCESSOR_DRIFT` from `ANCESTOR_DRIFT`; fails loudly on absent manifest (`MANIFEST_ABSENT`),
  unparseable manifest, unreadable file, mismatch, or an on-disk successor-family file the
  manifest never froze (`UNLISTED`). An absent manifest is a FAIL, never a pass — demonstrated in
  §7 below.
- **NUL gate** `verify-203-text-integrity.ts`: byte-level 0x00 scan (fs reads, never grep) over
  the four families plus the whole §203 evidence directory; per-file byte offsets on failure;
  fails on zero targets ("an empty scan proves nothing").

## 5. Migration path (designed, NOT performed by §203)

1. §203 freeze: manifest generated, both gates green, §203 suites green — the successor contract
   exists with its own identity and evidence, callers unchanged.
2. Product-owner review of §203 evidence; explicit authorization to promote.
3. Promotion (future §): rewire the development harness call sites — and only then production —
   from `projectDeclaredOwedFacts` / `checkBindingDeclarations` to the 203 successors, one call
   site per commit, each behind the existing kill-switch discipline; frozen modules stay in place
   for §187–§202 replay forever.
4. Historical replays (`verify-188..199`, replay scripts) continue to import the frozen modules
   and are never migrated.

## 6. Historical paths remaining unchanged (explicit)

All of: the seven ancestor files in §1; every `backend/scripts/verify-19x-source-integrity` script;
every `expert-202-*` module and test; every `verification/expert-hazlenz-*` directory for
§195–§202; `expert-prompt.ts`; `expert-verifier-contract-v3.ts`; the entire
`src/safescope-v2/expert-hazlenz/owed-facts/` directory; `docs/` project documents. Agent A created
five files (§7) and modified nothing pre-existing. The orchestrator's 2,470-file baseline is the
enforcement instrument.

## 7. Verification actually executed (Agent A scope)

- Ancestor hash recomputation: all seven equal to their pins (commands + values above).
- `npx tsc --noEmit -p tsconfig.scripts-203.json` — **EXPERIMENT_SCOPE_TYPECHECK (§203): PASS**
  on Agent A's files at time of writing (scope will grow as B/C/E land files).
- `npx ts-node scripts/verify-203-text-integrity.ts` — PASS (files scanned > 0, zero raw NULs).
- `npx ts-node scripts/verify-203-source-integrity.ts` — **FAIL (MANIFEST_ABSENT), exit 1, by
  design**: the manifest does not exist until the orchestrator freezes the implementation. The
  loud failure is the demonstrated fail-closed behavior, recorded here rather than hidden.

## AUTHORIZATION REQUIRED

- Nothing beyond §203's grant for Agents B/C/D/E/F to proceed within this design.
- Any *promotion* of a successor module into a caller (development harness or production) — §5
  steps 2-4 — requires separate explicit product-owner authorization.
- If B or C find the minimum copy surface must grow beyond `checkBindingDeclarations` +
  `applyAdmittedDeclarations` (e.g. a ledger copy after all), that is a design change to report
  back, not to absorb silently.
