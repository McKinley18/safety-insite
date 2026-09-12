# EXPERT HAZLENZ — INTEGRATION RISK REGISTER

**Agent 7 — Expert HazLenz System Auditor. §201 parallel development.**
**Date:** 2026-09-07 · **Mode:** strict read-only · **Provider calls:** 0 · **DB operations:** 0

## Scope and method

Subject is the SYSTEM, not any model answer. No §200 semantic verdict is supplied here and no §199
model output is judged right or wrong. Every finding below was reached by reading the code named in
it. Comments were treated as claims to be checked, never as evidence, and never as defects in
themselves.

Chain traced, in code, end to end:

```
raw observation
  → first pass          expert-prompt.ts · expert-first-pass-instruction-vnext.ts
  → transport           anthropic-expert-provider.ts · ollama-expert-provider.ts
                        · execute-199-structured-e2e-2026-09-07.ts (separate, inline)
  → declaration parsing expert-normalization.ts · expert-first-pass-owed-fact-projection.ts
  → projection          verifier-v3-development-boundary.ts::projectOwedFact
  → OwedFact            owed-fact.types.ts · owed-fact-ledger.ts
                        (and the parallel scripts/lib/expert-owed-facts.ts)
  → verifier            expert-verifier-instruction-v3-2.ts
  → admission           expert-verifier-contract-v3.ts → v3-2 → v3-3
  → settlement boundary settlement-review.ts                       [NO WIRED PRODUCER]
  → persistence         owed-fact-observability.ts                 [NO WIRED PRODUCER]
  → customer-inactive   verifier-v3-development-boundary.ts · expert-authority-merge.ts
```

## Severity summary

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 4 |
| MEDIUM | 11 |
| LOW | 9 |
| INFORMATIONAL | 6 |

**No CRITICAL is recorded, and that is a finding rather than an omission.** The customer-inactive
boundary was checked in code and holds — see INFO-1. Nothing below can reach a customer today. Every
HIGH is a defect in the development chain or an invariant that rests on a caller rather than on the
boundary that claims it.

---

# CRITICAL

None. See INFO-1 for the code evidence that the customer path is disconnected, and HIGH-4 for the
one place where that disconnection is weaker than the comment beside it claims.

---

# HIGH

## HIGH-1 — Two complete, divergent owed-fact implementations are both live, and the chain uses one at each end

**Files**
- `/Users/mckinley/Desktop/Safety_InSite/backend/scripts/lib/expert-owed-facts.ts` (§165 prototype)
- `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts` (§170 runtime)
- `/Users/mckinley/Desktop/Safety_InSite/backend/scripts/lib/expert-owed-fact-binding.ts`
- `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts`

**Symbols:** `OwedFact`, `OwedFactTransition`, `owedFactDefects`, `owedFact`, `createOwedFactLedger`,
`checkBindingDeclarations`, `COVERAGE_DECISION_FORBIDDEN_INPUTS`

**Evidence — the same semantics implemented twice, and already drifted:**

| Property | `scripts/lib/expert-owed-facts.ts` | `src/.../owed-fact.types.ts` |
|---|---|---|
| contract version | `'hazlenz.expert.owed-facts.v1'` (L32) | `'hazlenz.expert.owed-facts.runtime.v1'` (L31) |
| `OwedFact.whyUnresolved` | `readonly whyUnresolved: string;` (L76) | `readonly whyUnresolved: string \| null;` (L177) with `WHY_UNRESOLVED_STATUS_INVARIANT` (L156-161) |
| `owedFactDefects` rule | `if (blank(f.whyUnresolved)) d.push('WHY_UNRESOLVED_MISSING');` — one direction only | both directions: `WHY_UNRESOLVED_PRESENT_ON_NON_UNRESOLVED_FACT` (L61-63 of `owed-fact-ledger.ts`) |
| `OwedFactTransition.whyUnresolvedAtTransition` | **absent** (L90-98) | present (L232) — the field that preserves the sentence a transition nulls |
| `AcceptableEvidence` | **absent entirely** | present (L80-89) with `PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES` |
| production evidence-provenance boundary | **absent** | `assertProductionAdmissible` L138-143 of `owed-fact-ledger.ts` |
| `COVERAGE_DECISION_FORBIDDEN_INPUTS` | present, `expert-owed-fact-binding.ts:56` | **dropped** in the promotion — `grep -rn COVERAGE_DECISION_FORBIDDEN_INPUTS backend` returns exactly one hit, the prototype |

**Why it is HIGH:** the two halves of one chain sit on different copies.
`scripts/lib/expert-first-pass-owed-fact-projection.ts:42-43` imports the **src runtime**;
`scripts/lib/expert-verifier-contract-v3.ts:519` and `execute-verifier-v3-scoped-falsification-2026-09-04.ts:69`
drive the **scripts prototype**. A fix applied to either copy does not reach the other, and the
evidence-preservation field (`whyUnresolvedAtTransition`) exists only on the copy the verifier path
does not use.

## HIGH-2 — The §182 settlement consumer has no type-compatible producer; the settlement boundary is unreachable

**Files**
- `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts`
- `/Users/mckinley/Desktop/Safety_InSite/backend/scripts/lib/expert-verifier-contract-v3.ts`
- `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts`

**Evidence — three `ArbitrationRequest` definitions, two of them incompatible:**

`owed-fact.types.ts:247-253`
```ts
export interface ArbitrationRequest {
  readonly factKey: string;
  readonly requestedBy: 'VERIFIER';
  ...
}
```

`expert-verifier-contract-v3.ts:509-516`
```ts
export interface ArbitrationRequest {
  readonly factKey: string;
  readonly requestedBy: 'VERIFIER_V3';
  ...
}
```

`bridgeV3OutputToLedgerInputs` (`expert-verifier-contract-v3.ts:596-604`) emits
`requestedBy: 'VERIFIER_V3' as const`. `consumeSettlementClaims`
(`settlement-review.ts:163-167`) accepts `readonly ArbitrationRequest[]` from `owed-fact.types`,
i.e. `'VERIFIER'`. The two do not unify.

**Reachability, checked:** every caller of `consumeSettlementClaims` is
`scripts/test-settlement-review-integration-2026-09-05.ts`, using a locally hand-built `challenge()`
helper. Every caller of `bridgeV3OutputToLedgerInputs` is a v3 test or
`execute-verifier-v3-scoped-falsification-2026-09-04.ts`. There is no file in the repository where
the bridge's output reaches the consumer.

**Consequence:** `settlement-review.ts`'s header records that it closes
`CHALLENGE_FACT_VALIDITY_CONSUMER_PRESENT = FALSE`. The consumer exists as code; it has no producer
in any execution path, and the type it demands cannot be produced by the one function that produces
arbitration requests.

## HIGH-3 — The §199 executor reimplements the transport and drops three runner-owned safety checks

**File:** `/Users/mckinley/Desktop/Safety_InSite/backend/scripts/execute-199-structured-e2e-2026-09-07.ts`
**Symbol:** `callOnce` (L179-226)

The live §199/§197 path does **not** use `AnthropicExpertProvider`, `runExpertAnalysis`,
`normalizeExpertOutput` or `bindWireAnalysis`. It imports only the config, tool name and the two
schema transforms (L49-52) and issues its own `fetch` at L184.

**3a — Truncation is captured and never gated.**
`callOnce` records `stopReason: json.stop_reason ?? null` (L200). Grep for `stopReason` in that file
shows it used only at L755 and L1032, both of which write it into the JSONL record. There is no
`stop_reason === 'max_tokens'` branch anywhere. The canonical adapter has one:
`anthropic-expert-provider.ts:347-349`
```ts
if (telemetry.stopReason === 'max_tokens') {
  return finish({ ok: false, kind: 'TRUNCATED_RESPONSE', detail: 'generation hit the output limit' });
}
```
A truncated first-pass response therefore returns `ok: true` at L217 and its partial
`unresolvedFactDeclarations` array is projected as if complete.

**3b — No model-identity check.** `modelIdentity: json.model ?? null` (L199) is recorded and never
compared to `EXPERT_HOSTED_INFERENCE_CONFIG.model`. `expert-runner.ts:190-201` refuses
`UNEXPECTED_MODEL_IDENTITY` before the boundary. `score-199-deterministic-2026-09-07.ts:353` only
collects `respondedModels` into a set; it gates nothing.

**3c — Divergent failure taxonomy.** `callOnce` emits `'ACCOUNT_CREDIT_REJECTION'` (L206) and
`'TRANSPORT_ERROR'` (L220), neither of which is a member of `EXPERT_PROVIDER_FAILURES`
(`expert-provider.ts:38-53`).

## HIGH-4 — `mergeExpertIntelligence`'s owed-fact carrier is ungated, unlabelled and unaudited

**File:** `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/expert-authority-merge.ts`
**Symbols:** `mergeExpertIntelligence` (L164-223), `MergedIntelligence.owedFactCoverage` (L155),
`verifyMergeInvariants` (L254-335), `MERGE_INVARIANTS` (L227-239)

```ts
  owedFactCoverage?: unknown,            // L176
): MergedIntelligence {
  ...
    ...(owedFactCoverage === undefined ? {} : { owedFactCoverage }),   // L221
```

The comment at L147-150 asserts the key is "Present ONLY when the verifier-v3 development stage
attached one, which requires `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED`". **The code enforces none of
that.** The parameter is `unknown`, the function reads no gate, and by design (L151-153) the merge
does not import the owed-facts module, so the gate and the carrier are in different modules with no
link between them.

Additionally:
- `verifyMergeInvariants` never inspects `merged.owedFactCoverage`, and `MERGE_INVARIANTS` has no
  member covering it — so a blob attached by any future caller is not audited.
- Every other collection in the result carries a `source` label (`AuthoritativeFindingEntry.source`,
  `GovernedCitationEntry.source`, `ExpertAdvisoryBlock.source`). `owedFactCoverage` carries none.

**What currently holds it shut, verified:** `grep -rn "mergeExpertIntelligence\|runOwedFactCoverageStage" backend`
shows no call site anywhere passing a fourth argument other than the literal `undefined` in
`test-expert-v3-development-integration.ts:177`, and no file connects `runOwedFactCoverageStage`'s
result to the merge. The inactivity is real; it is a property of "nobody calls it yet", not of the
gate the comment names.

---

# MEDIUM

## MED-1 — Two of the boundary's five root-identity fatal checks are unreachable on every real provider path

**File:** `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts`
**Symbol:** `bindWireAnalysis` (L1596-1636)

```ts
    raw: {
      ...w,
      contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,   // L1627
      analysisId: input.analysisId,                        // L1628
```

`normalizeExpertOutput` treats both as fatal (`expert-normalization.ts:332-339`,
`CONTRACT_VERSION_MISMATCH` / `ANALYSIS_ID_MISMATCH`, both in `ANALYSIS_FATAL_REASONS` L102).
Both adapters route through `bindWireAnalysis` before the boundary
(`anthropic-expert-provider.ts:380`, `ollama-expert-provider.ts:205`), and neither field exists in
`buildExpertWireSchema`'s `properties` or `required` (L1093-1350). So on every real provider path
the adapter supplies the values the boundary then checks against itself, and neither code can fire.
Any measure counting these two codes is measuring a constant zero.

The function's own header (L1593-1594) states "No field is invented"; it invents two.

## MED-2 — `bindWireAnalysis` silently repairs a malformed `evidence` field

**File:** `expert-prompt.ts` · **Symbol:** `bindEvidence` (L1602-1619)

```ts
  const bindEvidence = (items: unknown): unknown[] => {
    if (!Array.isArray(items)) return [];        // L1603
```

`expert-normalization.ts:248-251` has a branch for exactly this case
(`CANDIDATE_MALFORMED — evidence is not an array`) that can never be reached through either adapter.
Where the candidate declares `NO_EXACT_QUOTE_AVAILABLE`, the grounding cross-check at
`expert-normalization.ts:444-451` also passes, so a candidate that sent `evidence: "..."` is
**admitted** rather than refused. This is a hidden fallback in a file whose header (L1593-1594) says
"nothing is filtered — if the model said it, it reaches the boundary and the boundary decides".

## MED-3 — Model-supplied nomination priority reaches `OwedFact.priority`; the guarantee lives in a caller

**Files**
- `/Users/mckinley/Desktop/Safety_InSite/backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts:345`
- `/Users/mckinley/Desktop/Safety_InSite/backend/scripts/lib/expert-owed-fact-binding.ts:281`

Both read `priority: n.priority` where `n` is `d.nomination`, a provider-supplied
`NominationPayload` (`owed-fact-binding.ts:61-71`). `checkBindingDeclarations` validates only
membership of `OWED_FACT_PRIORITIES` (L201-203) — `LIFE_CRITICAL` is a member.

`priority` is load-bearing: `COVERAGE_PRIORITY_GATE` (`owed-fact-binding.ts:392-393`),
`PRIORITY_RANK` and `UNDROPPABLE_PRIORITIES` (`structural-questions.ts:168-171`), and
`UNRESOLVED_SAFETY_STATE` (`structural-questions.ts:236`).

The same policy is implemented twice more, both times the other way:
- `expert-verifier-contract-v3.ts:589` — `priority: opts.nominatedPriority ?? 'OTHER'`, with L548-550
  stating the reason: "a model-chosen priority would let the provider promote its own nomination past
  a deterministic life-critical gap".
- `expert-first-pass-owed-fact-projection.ts:105` — `FIRST_PASS_PROJECTED_PRIORITY = 'OTHER'`, hard.

So the invariant is enforced by `bridgeV3OutputToLedgerInputs`, a caller, and not by the boundary
that constructs the fact. `owed-fact.types.ts:12-13` states the opposite ("Every field on `OwedFact`
that decides anything is populated by HazLenz").

**Not currently exploited:** the bridge is the only wired producer of nominations today.

## MED-4 — The anti-citation-laundering predicates are narrow and are shared by every stage

**Files**
- `expert-contract.types.ts:689-701` (`FORBIDDEN_EXPERT_FIELD_NAMES`, `CITATION_SHAPED_PATTERN`)
- consumers: `expert-normalization.ts:225` and `:322`;
  `expert-first-pass-owed-fact-projection.ts:154` and `:555`;
  `expert-verifier-contract-v3-2.ts:108`; `expert-governed-citation-reuse.ts:64-65`

```ts
export const CITATION_SHAPED_PATTERN = /\b\d{2}\s*CFR\s*\d+/i;
```
Requires a literal `CFR` after exactly two digits. Not matched: `29 C.F.R. 1910.147`,
a bare `1910.147`, `§ 1910.147`, `1926.501(b)(1)`, or a state-plan reference.

```ts
    if (FORBIDDEN_EXPERT_FIELD_NAMES.includes(k)) out.push(`${path}.${k}`);   // normalization L225
```
Exact, case-sensitive `Array.includes`. A key spelled `Citation`, `CFR` or `Regulations` passes.

This is one predicate reused at four boundaries, so its blind spots are the same at all four. It is
recorded as MEDIUM rather than HIGH because the merge layer labels everything that gets past it
`EXPERT_ADVISORY` and gives it no write path to a governed surface.

## MED-5 — `LEDGER_MOVED_SINCE_CLAIM` cannot fire for the case it names

**File:** `settlement-review.ts` · **Symbol:** `settleByReviewedEvidence` (L358-361)

```ts
  const fact = factOf(ledger, claim.factKey);
  if (!fact) refused.push('FACT_NOT_IN_LEDGER');
  else if (fact.status !== 'UNRESOLVED') refused.push('FACT_NOT_UNRESOLVED');
  else if (fact.status !== claim.factStatusAtClaim) refused.push('LEDGER_MOVED_SINCE_CLAIM');
```

The third branch runs only when `fact.status === 'UNRESOLVED'`. `consumeSettlementClaims` refuses any
claim whose fact is not `UNRESOLVED` (L175), so a well-formed claim always carries
`factStatusAtClaim === 'UNRESOLVED'` and the comparison is `'UNRESOLVED' !== 'UNRESOLVED'`. If the
ledger genuinely moved, the second branch fires first. The staleness guard fires only for a
hand-forged claim, never for the drift it is named after.

## MED-6 — The vNext wire schema is weaker than the projection boundary on `declarationId`

**Files**
- `expert-first-pass-instruction-vnext.ts:337-345` — `declarationId: str('Short id, …')` where
  `str` sets only `{ type: 'string', minLength: 1, description }` (L337-338). No `pattern`.
- `expert-first-pass-owed-fact-projection.ts:160` and `:470` — the boundary requires
  `FACT_KEY_SHAPE = /^[A-Za-z0-9][A-Za-z0-9_:.\-]{0,127}$/` and refuses otherwise with
  `DECLARATION_ID_MALFORMED`.
- `anthropic-expert-provider.ts:169-186` — `stripAnthropicUnsupportedKeywords` deletes `minLength`
  before the request is sent, so even the length floor is not transmitted.

A `declarationId` of `gap #1` or `d 1` passes strict transport validation and is refused at the
boundary — the exact defect class `expert-prompt.ts:1056-1060` records §104/§105 having repaired for
the base schema, reintroduced in the vNext extension. `observationSourceId` and `affectedDecision`
do carry enums and are not affected.

## MED-7 — An absent `uncertainty` is silently defaulted with no recorded issue

**File:** `expert-normalization.ts:598-606`

```ts
  let uncertaintyStatements: string[] = [];
  if (raw.uncertainty !== null && raw.uncertainty !== undefined) { ... }
```

An omitted `uncertainty` produces `{ statements: [] }` and **no** `UNCERTAINTY_MALFORMED` issue.
`expert-contract.types.ts:622-625` states the design rule this contradicts: "Every collection is
REQUIRED and may be empty. 'Absent' and 'none' are the same thing to a consumer, and forcing the
producer to say which one it means removes a class of ambiguity". `uncertainty` is in the schema's
`required` list (`expert-prompt.ts:1349-1350`), so the boundary is weaker than the wire here — the
inverse of the usual direction and therefore easy to miss.

## MED-8 — `parseOwedFactDeclarations` mislabels one refusal and leaks unvalidated keys on a refused parse

**File:** `owed-fact-binding.ts` · **Symbol:** `parseOwedFactDeclarations` (L252-316)

```ts
    if (!(OWED_FACT_DECLARATIONS as readonly string[]).includes(e.declaration)) {
      fail('OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED', `${e.factKey}: ${String(e.declaration)}`);   // L275-277
```
There is no `BINDING_ADMISSION_CODES` member for "declaration value is not a member"
(L83-96), so an invalid declaration value is counted as an unsupplied key. Two different provider
faults become one code.

```ts
    stillUnresolvedFactKeys: entries
      .filter(e => e.declaration !== 'BOUND_BY_CLARIFICATION').map(e => e.factKey),   // L313-314
```
This is derived from raw `entries`, not from `seen`, so it includes keys already refused as
`OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED` or `OWED_FACT_DECLARATION_DUPLICATED`. It is also returned
unconditionally, unlike `arbitrationRequests` which is correctly gated on `admitted` at L312. A
downstream reader of a refused result receives model-authored strings in a field named as if it were
a determined outcome.

## MED-9 — The §196–199 chain terminates at admission; six downstream stages have no wired producer

**Evidence:** `grep -rn` across `backend/scripts` and `backend/src` for the downstream symbols
returns only test files plus `execute-verifier-v3-scoped-falsification-2026-09-04.ts`:

| Symbol | File | Producers on the §199 path |
|---|---|---|
| `applyAdmittedDeclarations` | `owed-fact-binding.ts:329` | none |
| `evaluateTargetCoverage` | `owed-fact-binding.ts:410` | none |
| `projectStructuralQuestions` | `structural-questions.ts:87` | none |
| `selectQuestionsForBudget` | `structural-questions.ts:195` | none |
| `consumeSettlementClaims` | `settlement-review.ts:163` | none (see HIGH-2) |
| `runOwedFactCoverageStage` | `verifier-v3-development-boundary.ts:97` | none |

`execute-199-structured-e2e-2026-09-07.ts` uses exactly two owed-fact symbols: `projectOwedFact`
(L954) and `checkVerifierV3_3Output` (L1019). `createOwedFactLedger` appears only in the scorer
(`score-199-deterministic-2026-09-07.ts:253`). A reader who takes "structured e2e" at face value will
over-read what the run exercises.

## MED-10 — The production admissibility boundary has never executed, and one refusal code does not check what it is named for

**File:** `expert-first-pass-owed-fact-projection.ts:596-612`

```ts
        if (blank(c.requirement)) {
          fail('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ',
            `the criterion HazLenz holds for ${gid} has no requirement sentence`);
```
The code names a provenance check; the predicate is a blank-string check. `acceptableEvidence = c`
(L609) copies the caller's criterion wholesale, `provenance` included, with no comparison against
`PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES` or `PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES`
(`owed-fact.types.ts:110-128`).

The real provenance boundary is `assertProductionAdmissible` (`owed-fact-ledger.ts:130-144`) and it
returns immediately unless `population === 'PRODUCTION'` (L131). Every ledger constructed in an
executed path is `'DEVELOPMENT'` — `score-199-deterministic-2026-09-07.ts:253`
`createOwedFactLedger('DEVELOPMENT', facts)`. So the boundary that would catch a
`MODEL_SELF_AUTHORED` or `ADJUDICATION_LABEL` criterion has never run outside its own unit test.

## MED-11 — §199 misclassifies a structured-output failure as a provider refusal, and does not check the tool name

**File:** `execute-199-structured-e2e-2026-09-07.ts:212-216`

```ts
    const block = (json.content as Array<Record<string, any>> | undefined)
      ?.find(b => b.type === 'tool_use');
    if (!block) {
      return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL', ...base };
    }
```

Two divergences from the canonical adapter:
- `anthropic-expert-provider.ts:352-355` also requires `block.name === EXPERT_TOOL_NAME`; §199 does
  not, so a `tool_use` block for any other tool is accepted as the analysis.
- `anthropic-expert-provider.ts:357-365` classifies a missing block as
  `SCHEMA_INVALID_STRUCTURED_OUTPUT` and reserves `PROVIDER_REFUSAL` for
  `stop_reason === 'refusal'` (L344-346). §199 collapses both into `PROVIDER_REFUSAL`, and
  `expert-provider.ts:64-67` treats refusal as non-retryable while a schema failure is a different
  operational fact.

---

# LOW

## LOW-1 — `disagreementFatal` is redundant
`expert-normalization.ts:541`, `:558`, `:566`, `:680`. Both codes it tracks
(`DISAGREEMENT_UNKNOWN_SURFACE`, `DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE`) are already members of
`ANALYSIS_FATAL_REASONS` (L124), so `issues.some(i => isFatal(i.code))` at L680 already covers it.
Two mechanisms for one decision; either can be edited without the other.

## LOW-2 — The Anthropic adapter attaches usage and a telemetry row to a request that never left the process
`anthropic-expert-provider.ts:246-270` — `finish()` unconditionally attaches a `usage` object and
pushes to `attemptTelemetry`. `L274-276` returns `finish({ ok: false, kind: 'NOT_CONFIGURED', … })`
**before** any `fetch`. `expert-provider.ts:99-102` documents `usage` as "Present when the request
billed". `expert-runner.ts:148` then records `usage: r.usage ?? null`, so the attempt record carries
a non-null usage object for a call that was never issued. Every numeric field is `null`, so no
spend is overstated — the defect is that "usage present" stops meaning "a request happened".

## LOW-3 — The runner drops model identity from the trace on the failure path
`expert-runner.ts:133-138` builds `trace()` with `providerModelIdentity: null`; the failure return at
L177-184 uses bare `trace()`, while the identity-mismatch, rejection and success returns all spread
`{ ...trace(), providerModelIdentity: result.modelIdentity }` (L197, L215, L225). On a
`PROVIDER_FAILED` result the identity survives only inside `attempts[].modelIdentity` (L147).

## LOW-4 — `groundingStatus` is validated and then discarded
`expert-normalization.ts:428-434` validates `item.groundingStatus`; the candidate constructed at
L453-463 carries no such field, and `ExpertHazardCandidate`
(`expert-contract.types.ts:147-163`) has none. Not a persistence gap in practice: the fail-closed
check at L444-451 makes the declaration exactly recoverable from `evidence.length > 0`. Recorded so a
future reader does not add the field twice or assume it was lost.

## LOW-5 — A schema description contradicts its own constraint
`expert-prompt.ts:1301` — `targetRef: str('Which object you mean, or an empty string.')`, and `str`
sets `minLength: 1` (L1061-1062). The empty string it invites is schema-illegal. `minLength` is
stripped for Anthropic (`anthropic-expert-provider.ts:169-186`) so the string arrives and is
normalised to `null` at `expert-normalization.ts:573` — but a provider honouring `minLength` sees a
contradiction.

## LOW-6 — A blank provider question is presentable
`structural-questions.ts:102-110` pushes `question: d.question` with
`presentationStatus: 'SELECTED'`. Nothing in `checkBindingDeclarations` requires
`ClarificationDeclaration.question` to be non-blank. `selectQuestionsForBudget:217` only excludes
`q.question === null`, so `''` is selected for presentation.

## LOW-7 — `verifyMergeInvariants` checks removal but not addition, and ignores the owed-fact carrier
`expert-authority-merge.ts:280-283` computes `missing` only:
```ts
    const missing = f.requiredActions.filter(a => !m.requiredActions.includes(a));
```
An added required action passes, and `EXPERT_CANNOT_ALTER_DETERMINISTIC_FINDING` (L276-279) does not
compare `requiredActions` either. `merged.owedFactCoverage` is not inspected at all (see HIGH-4).
Construction makes both safe today; the after-the-fact audit is narrower than its name.

## LOW-8 — The projection consumes identity state before a refusal that comes later
`expert-first-pass-owed-fact-projection.ts:573-575` writes `seenContent` and increments
`anchorCounts` while computing the key; the `acceptableEvidence` check at L598-612 can still push
`ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ`, refusing the declaration at L614. The
ordinal is spent and the content digest is registered against a declaration that produced no fact, so
a later declaration at the same anchor receives ordinal 2 with no ordinal-1 fact in existence, and a
restatement is refused as duplicating a declaration that was itself refused. `seenKeys` is correctly
added only on admission (L621), so no key is burned.

## LOW-9 — `expert-deterministic-projection.ts` also exists twice, with live importers on both
`scripts/lib/expert-deterministic-projection.ts` (prototype) vs
`src/safescope-v2/expert-hazlenz/expert-deterministic-projection.ts` (§119 promotion). `diff` reports
them different. Three scripts import the prototype and eleven import the promotion. Same drift shape
as HIGH-1, with lower blast radius because the promotion's header names the prototype and declares
any behavioural difference a defect.

---

# INFORMATIONAL

## INFO-1 — The customer-inactive boundary holds in code, not only in comments — checked four ways

1. **Import graph.** `grep -rn --include='*.ts' "expert-hazlenz" backend/src` filtered to files
   outside `backend/src/safescope-v2/expert-hazlenz*` returns **zero results**. No file in the Nest
   application imports the Expert layer.
2. **Module registration.** `grep -i expert backend/src/safescope-v2/safescope-v2.module.ts` returns
   **zero matches**.
3. **No dynamic escape.** `grep -rn "require(\|import(" backend/src/safescope-v2/expert-hazlenz*`
   returns one hit, and it is a regex literal
   (`expert-measurement-contract.ts:646` — `/\brequire(s|d|ment|ments)?\b/i`).
4. **Outward dependencies.** The only import from the Expert layer into the rest of `src` is
   `governed-evidence-derivation.ts:38`, a `import type` of
   `approved-knowledge-record.types` — a type-only edge that erases at compile time and creates no
   runtime coupling in either direction.

The gate itself is what it claims: `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: false = false`
(`verifier-v3-development-boundary.ts:41`) is a literal type, reads no environment, and
`runOwedFactCoverageStage`'s enabled branch (L112-124) is unreachable while it stands.

## INFO-2 — Inactivity rests on the import graph, not on the build boundary
`backend/tsconfig.json` sets `"include": ["src/**/*"]` (L26) with `"outDir": "./dist"` (L11) and no
`exclude`. `backend/package.json:10` builds with bare `tsc`. Both
`src/safescope-v2/expert-hazlenz/` and `src/safescope-v2/expert-hazlenz-adapters/` therefore compile
into `dist/` and ship with the Render deploy — including
`anthropic-expert-provider.ts`'s `fetch`, `process.env.ANTHROPIC_API_KEY` and `x-api-key` header.
Nothing loads them (`dist/main.js` reaches them through no import chain), so this is a surface-area
observation, not an active path. It is recorded because "the code is not in production" and "the code
is in production and unreferenced" are different facts.

## INFO-3 — The no-call purity guard covers the core module only
`scripts/test-expert-nocall-harness.ts:211-247`. `MODULE_DIR` is
`src/safescope-v2/expert-hazlenz`, so D.3 (`NETWORK_PRIMITIVES`) and D.4 (vendor names) prove purity
for the core and `owed-facts/` but say nothing about `expert-hazlenz-adapters/` (correct — that is
where the transport is meant to live) and nothing about the executors under `scripts/`, which is
where the live §199 `fetch` and API key are (HIGH-3). D.3 also scans comment text, unlike D.4 which
strips it (L239-241).

## INFO-4 — Self-documented dead branch in v3.3
`expert-verifier-contract-v3-3.ts:157-161`. `otherCodes` was proven empty at L121-122, so `codes` at
L155 is necessarily empty and the branch cannot run. The comment says so and refusing is the safe
answer; recorded for completeness, not as a defect.

## INFO-5 — Ten live verifier contract/instruction variants, selected by import with no registry
`expert-verifier-contract{,-v2,-v3,-v3-2,-v3-3}.ts` and
`expert-verifier-instruction{,-v2,-v3,-v3-1,-v3-2}.ts`, all under `backend/scripts/lib/`, all with
distinct exported version constants, all with live importers (4, 6, 19, 3, 8 and 5, 9, 18, 13, 10
respectively). The §199 executor pairs `expert-verifier-instruction-v3-2` (execution) with
`expert-verifier-contract-v3-3` (admission) and additionally imports
`expert-verifier-contract-v3` for its version constant — a deliberate three-way composition recorded
at `execute-199-structured-e2e-2026-09-07.ts:363-373`. Nothing prevents a new script from importing
a stale pair; the discipline is per-author, and the source-integrity scripts
(`verify-19x-source-integrity-*.ts`) are what currently catch a mismatch, after the fact.

## INFO-6 — `offendingTextFor` redaction is unreachable in the current order
`expert-normalization.ts:180-187`. `CITATION_SHAPED_TEXT_NOT_PERMITTED` (L320-329) condemns the
analysis before any candidate's evidence is validated, so a citation-shaped quote never reaches the
redaction. The file states this at L173-178 and tests the function directly for that reason. Correct
as written; recorded so it is not mistaken for a live defence.

---

# Items suspected but NOT confirmed — verification required before acting

These are stated as open questions, not findings.

- **V-1.** `bindWireAnalysis` resolves offsets with `source.text.indexOf(quotedText)`
  (`expert-prompt.ts:1610`), and the projection does the same with
  `text.indexOf(span)` (`expert-first-pass-owed-fact-projection.ts:495`). Both take the **first**
  occurrence. Where a span occurs more than once in one observation, the computed offsets — and
  therefore the `factKey` anchor — name an occurrence the model may not have meant. I did not find a
  cohort row where this occurs and did not execute anything to look for one. Confirm by scanning the
  §197/§199 cohort observations for repeated candidate spans before treating this as real.
- **V-2.** `deriveAcceptableEvidence` substitutes a real citation into `REQUIREMENT_TEMPLATE`
  (`governed-evidence-derivation.ts:125-127`), and `projectOwedFact` forwards
  `acceptableEvidence` to the verifier (`verifier-v3-development-boundary.ts:176`). I could not find
  a path that projects `acceptableEvidence` into a **first-pass** request, where
  `PROHIBITED_REGULATORY_CITATION` would then refuse the model for reproducing it
  (`expert-first-pass-owed-fact-projection.ts:552-560`, and the explicit note at L546-551 that no
  reuse allowance applies on the first-pass path). If such a path is ever added, HazLenz would be
  supplying a citation it then refuses the model for echoing. Requires verification against any
  future first-pass criterion projection.
- **V-3.** `PLACEHOLDER_CITATION_MARKERS` matches by `lower.includes(...)` on `'placeholder'` and
  `'review_required'` (`governed-evidence-derivation.ts:68`, `:108`). A record marked
  `review-required` or `Review Required` would not match. The header states two live registry records
  carry "exactly this marker" — I did not read the registry to confirm the exact spelling in use, and
  reading it is the check this needs.

---

# What this register does NOT cover

- Any §200 semantic verdict, and any judgement about whether a §199 model output was right or wrong.
  None is offered here and none should be inferred from any finding above.
- Whether the §199 cohort, its truth, or its adjudication design are sound. Out of scope.
- Test coverage adequacy. Findings above cite tests only as evidence of what is or is not wired.
- Nothing was executed. No test, build, type check, scorer or script was run; every claim rests on
  reading the files named.
