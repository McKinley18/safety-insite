# L3-1 — Reasoning Contract + Provider Abstraction + Deterministic Validator Skeleton

> ## `L3_1_COMPLETE — REASONING_CONTRACT_AND_VALIDATOR_ESTABLISHED — CUSTOMER_AUTHORITY_UNCHANGED`

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged (nothing committed or pushed).
**No model inference. No provider selected. No SDK. No network. No migration. Production untouched.**

## Implementation files (all new, all uncommitted)

| File | Purpose |
|---|---|
| `backend/src/safescope-v2/reasoning-l3/reasoning-contract.types.ts` | Versioned input contract (`hazlenz.l3.input.v1`), proposal contract (`hazlenz.l3.proposal.v1`), the eight condition states, evidence references, authoritative vs advisory sources |
| `backend/src/safescope-v2/reasoning-l3/hazlenz-reasoning-provider.ts` | Provider-neutral interface + six failure kinds + retryability |
| `backend/src/safescope-v2/reasoning-l3/unavailable-reasoning-provider.ts` | The only provider: performs no inference, always `UNAVAILABLE`, synthesizes nothing |
| `backend/src/safescope-v2/reasoning-l3/validation-result.types.ts` | Validation states + 22 stable reason codes + retryable/non-retryable partitions |
| `backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator.ts` | The proposal→validated boundary |
| `backend/src/safescope-v2/reasoning-l3/validated-reasoning.types.ts` | `ValidatedReasoning` — deliberately not a customer entity |
| `backend/src/safescope-v2/reasoning-l3/reasoning-outcome.ts` | Safe-failure union; `carriesHazardConclusion()` is true only for `VALIDATED` |
| `backend/scripts/test-l31-reasoning-contract.ts` | 48-assertion pure suite |
| `backend/package.json` | **one added line** registering the suite; dependencies byte-identical to HEAD |

## Customer authority

> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Proven three ways:

1. **Reachability.** No pre-existing source file imports `reasoning-l3`; it is registered in no Nest
   module, so it cannot be injected; the only importer is its own test.
2. **Zero modification.** `git diff` over `intelligence-orchestrator.service.ts` and
   `safescope-v2.service.ts` is empty. The seam and its call site were not touched.
3. **Behavioural invariance, measured.** The frozen 66-scenario matrix was re-run against the
   post-L3-1 worktree. Volatility was **derived empirically** from two runs of identical code
   (7 volatile paths, all per-run ids/timestamps: `candidateId`, `dueDate`, `generatedAt`,
   `reasoningSnapshotId`, `reportId`, `riskReasoningId`). Comparing the committed pre-L3-1 baseline
   against post-L3-1, excluding only those paths: **0 scenarios with a non-volatile difference.**

> **Instrumentation note.** A first comparison used a hand-declared volatility list and reported all
> 66 scenarios as differing while every customer-decisive field was identical — the declared list was
> wrong, not the engine. Volatility was then derived empirically per the KG-4B/KG-4E precedent. The
> corrected oracle is the one reported above.

## Verification

| Check | Result |
|---|---|
| `test:l31-reasoning-contract` | **48 passed, 0 failed** |
| `npm run build` (tsc) | exit 0 |
| Strict typecheck of every new module | clean |
| `test:kg4a-cutover-contract` | 146/146 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg3f-56-14132-predicate` | 16/16 |
| `test:evidence-foundation` | 35 assertions |
| `test:hazlenz-core` | 28/30 — the two documented failures only, **no third** |
| Customer-authority invariance | 0 non-volatile differences over 66 scenarios |
| Frontend typecheck | not required — no frontend file references `reasoning-l3` |

## Invariant coverage implemented at L3-1

`L3-INV-01` candidate-id-only references, free-form citations refused · `L3-INV-02` evidence required
for any asserting state · `L3-INV-03` governance fields structurally swept and refused ·
`L3-INV-04` no default member, missing state never becomes ACTIVE · `L3-INV-05` unavailable cannot
carry candidates; failures cannot carry a hazard conclusion · `L3-INV-06` clarification needs fact,
decision, ≥2 branches, question · `L3-INV-07` only typed schema-valid proposals validate ·
`L3-INV-08` rejection can never produce a `validated` object · `L3-INV-09` regulatory text refused ·
`L3-INV-10` no fallback path to the lexical engine exists in the union · `L3-INV-11` **mechanical
half** — immediately-preceding governing negation truncation rejected (RC-08's own sentence is the
test fixture) · `L3-INV-12` advisory signals cannot substitute for evidence.

**L3-INV-11's semantic half remains L3-2's responsibility** and is documented as such rather than
claimed here.

## Out of scope, unchanged

RC-01…RC-10 not remediated. RC-02 and RC-03 untouched. The superseded `REQUIRE_EXPLICIT` proposal,
`lib/auth.ts` and `lib/planEntitlements.ts` preserved byte-for-byte. KG source tree unmodified.
Capability databases preserved.
