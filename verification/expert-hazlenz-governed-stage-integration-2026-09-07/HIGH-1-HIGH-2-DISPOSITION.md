# §202 — HIGH-1 AND HIGH-2 DISPOSITION

**Agent C — authority-boundary sweep.** Provider calls: 0 · Database operations: 0 · Files
modified: 0. Date 2026-09-07.

Both findings originate in
`verification/expert-hazlenz-parallel-development-2026-09-07/INTEGRATION-RISK-REGISTER.md`
(§201 Agent 7). Neither was taken on trust. Each was re-established from current code, and where the
§201 write-up is imprecise that is stated.

**Both are classified `B — ARCHITECTURE / POLICY DECISION REQUIRED`. Neither is implemented.**

---

# HIGH-1 — two complete, divergent owed-fact implementations, both live

## Independent verification

### The two copies exist and have drifted

| property | `backend/scripts/lib/expert-owed-facts.ts` (§165 prototype) | `backend/src/…/owed-facts/owed-fact.types.ts` (§170 runtime) |
|---|---|---|
| contract version | `'hazlenz.expert.owed-facts.v1'` (`:31`) | `'hazlenz.expert.owed-facts.runtime.v1'` (`:31`) |
| `OwedFact.whyUnresolved` | `readonly whyUnresolved: string;` (`:76`) | `readonly whyUnresolved: string \| null;` (`:177`), with `WHY_UNRESOLVED_STATUS_INVARIANT` (`:156-161`) |
| `owedFactDefects` rule | one direction only (`expert-owed-facts.ts`, `WHY_UNRESOLVED_MISSING`) | both directions — `WHY_UNRESOLVED_PRESENT_ON_NON_UNRESOLVED_FACT` (`owed-fact-ledger.ts:61-63`) |
| `OwedFactTransition.whyUnresolvedAtTransition` | **absent** (`:90-98`) | present (`owed-fact.types.ts:232`), written at `owed-fact-ledger.ts:210,223` |
| `AcceptableEvidence` | **absent entirely** | present (`owed-fact.types.ts:80-89`) with `PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES` (`:110-115`) |
| production evidence-provenance boundary | **absent** | `assertProductionAdmissible` (`owed-fact-ledger.ts:130-144`) |
| `COVERAGE_DECISION_FORBIDDEN_INPUTS` | present (`expert-owed-fact-binding.ts:56-62`) | **dropped in the promotion** |
| the forbidden-field scan | **absent** | present (`owed-fact-binding.ts:137-142`) |
| `BINDING_ADMISSION_CODES` | 17 members (`expert-owed-fact-binding.ts:89-105`) | 24 members (`owed-fact-binding.ts:83-96`) |
| `parseOwedFactDeclarations` | **absent** | present (`owed-fact-binding.ts:252-316`) |

The last four rows were **executed**, not read: `test-202-authority-boundary-guards.ts` cases
HIGH-1.a … HIGH-1.d assert each against the files on disk. All four pass.

The drift runs in **both directions**, which is worth stating plainly because it defeats the obvious
remedy of "delete the prototype":

- the runtime gained `AcceptableEvidence`, the nullable/bidirectional `whyUnresolved` invariant, the
  transition-preservation field, the production provenance boundary, the forbidden-field scan and
  per-fact declaration parsing;
- the prototype still holds `COVERAGE_DECISION_FORBIDDEN_INPUTS`, the constant whose entire purpose
  is that "a later edit adding a text comparison contradicts a published constant rather than a
  comment". It exists **only** on the copy the §196–§199 chain does not use.

### Both copies really are live, and the chain really does use one at each end

Verified by import graph, not by the register's citation (which is corrected below):

- **runtime importers** (`src/…/owed-facts/owed-fact-ledger`): thirteen files, including
  `scripts/lib/expert-first-pass-owed-fact-projection.ts:43`,
  `scripts/execute-197-structured-e2e-2026-09-07.ts:71` and
  `scripts/score-199-deterministic-2026-09-07.ts:25`.
- **prototype importers** (`scripts/lib/expert-owed-facts`): eight files, including
  `scripts/execute-verifier-v3-scoped-falsification-2026-09-04.ts:62-65`,
  `scripts/lib/expert-owed-fact-binding.ts`, `scripts/lib/expert-question-budget.ts`,
  `scripts/lib/expert-target-coverage.ts` and
  `scripts/test-expert-verifier-v3-binding-protocol.ts`.

So the §196–§199 first-pass/projection half sits on the **runtime**, and the §167 verifier-binding
half sits on the **prototype**. A fix applied to either does not reach the other.

### Correction to the §201 register

HIGH-1 cites `expert-verifier-contract-v3.ts:519` as driving the prototype. That line is a **doc
comment** ("Ready for `checkBindingDeclarations` from `expert-owed-fact-binding.ts`"). The file
imports neither owed-fact module — its complete import list is `:41-50`, three verifier modules. The
actual prototype driver is `execute-verifier-v3-scoped-falsification-2026-09-04.ts:62-69`. The
substantive finding is unaffected; the citation is not load-bearing and should not be reused.

## Consequence, stated as an authority boundary

The §202 defect class applies to HIGH-1 directly. Three published guarantees of the runtime module
are **absent from the prototype**, and the only thing keeping an unsafe state out of the prototype's
path is that the prototype's callers happen not to construct one:

1. **The forbidden-field scan.** The prototype's `checkBindingDeclarations` has no
   `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD` code and performs no such scan. **Measured**
   (case HIGH-1.e): the *same* declaration object, carrying `acceptableEvidence` and `status`, is
   **admitted with zero codes** by the prototype and **refused** by the runtime boundary. The two
   halves of one chain disagree about whether that declaration is legal.
2. **The `whyUnresolved` invariant.** The prototype's field is a non-nullable `string`, so a settled
   control row cannot be represented truthfully at all on that path — the exact defect
   `owed-fact.types.ts:138-155` exists to record, still live on one of the two copies.
3. **Transition evidence preservation.** `whyUnresolvedAtTransition` does not exist on the
   prototype, so a fact transitioning out of `UNRESOLVED` there loses the sentence permanently.

## Classification: **B — ARCHITECTURE / POLICY DECISION REQUIRED**

Against the implementation gate, clause by clause:

| gate clause | met? |
|---|---|
| the intended invariant is already established elsewhere | **no** — the two copies *are* the two candidate statements of the invariant, and they disagree in both directions |
| the change merely makes a receiving boundary enforce an existing invariant | **no** — the change is "choose which of two implementations survives" |
| no semantic authority or product policy changes | **no** — `COVERAGE_DECISION_FORBIDDEN_INPUTS` and `AcceptableEvidence` are policy surfaces |
| backward-compatibility impact understood | **no** — twenty-one importers across two families, plus §167 replay evidence that reads the prototype's shapes |
| dedicated regression coverage added | not attempted |

It is additionally **explicitly withheld from §202**: the file-ownership map's binding rules state
"**No final OwedFact policy decision**", and `OWEDFACT-REPRESENTATION-OPTIONS.md` already exists as
the product-owner instrument for exactly this question.

**DO NOT IMPLEMENT.** Returned for product-owner decision.

## What the product owner is actually being asked

Not "which file is better", but three separable questions:

1. **Does the prototype retire, or does it stay as the frozen §165/§167 replay substrate?** Several
   §167 evidence artefacts were produced through it; retiring it changes what a replay reproduces.
2. **Does `COVERAGE_DECISION_FORBIDDEN_INPUTS` come back to the runtime?** Its absence there means
   the runtime's coverage discipline is defended by a comment where the prototype defends it with a
   published constant. Restoring it mutates `owed-fact-binding.ts`, which is §187-pinned.
3. **If one implementation survives, what happens to the eight prototype importers** —
   `expert-question-budget.ts`, `expert-target-coverage.ts`,
   `expert-bounded-reliability-state-machine.ts`, `expert-reliability-observability.ts` and four
   scripts — each of which is itself part of a frozen measurement path?

**Interim mitigation available today at zero risk:** the four HIGH-1 assertions in
`test-202-authority-boundary-guards.ts` are a **drift tripwire**. They fail the moment either copy
changes in any of the four measured respects, so the divergence cannot widen silently while the
decision is pending. That is the whole of what §202 delivered here, and it is deliberate.

---

# HIGH-2 — the §182 settlement boundary has no producer in any execution path

## Independent verification

### The three definitions

1. `backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts:247-253`
   — `requestedBy: 'VERIFIER'`.
2. `backend/scripts/lib/expert-verifier-contract-v3.ts:509-516`
   — `requestedBy: 'VERIFIER_V3'`.
3. `backend/scripts/lib/expert-201-verifier-vnext-candidates.ts:1704`
   — `ReviewableArbitrationRequest`, a **differently named** interface produced by
   `reviewableArbitrationRequests` (`:1722-1724`), a §201 vNext candidate with no consumer.

Confirmed by exhaustive grep across `backend/scripts` and `backend/src`.

### The producers, and the register's framing corrected

§201 records "the only wired producer type-incompatible with the only consumer". **There are two
producers, and one of them IS type-compatible:**

- `bridgeV3OutputToLedgerInputs` (`expert-verifier-contract-v3.ts:596-604`) emits
  `requestedBy: 'VERIFIER_V3' as const` — **not** assignable to the consumer's parameter.
- `parseOwedFactDeclarations` (`owed-fact-binding.ts:283-289`) emits `requestedBy: 'VERIFIER'` —
  **exactly** the type `consumeSettlementClaims` (`settlement-review.ts:163-167`) demands.

So the correct statement is narrower and, for the red team, more useful: **the compatible producer
exists and is simply never connected.** `parseOwedFactDeclarations`'s callers are
`scripts/a0-settlement-replay-2026-09-05.ts:336,348` and
`scripts/test-expert-v3-development-integration.ts:30`; neither imports `settlement-review`.
`consumeSettlementClaims`'s only caller in the repository is
`scripts/test-settlement-review-integration-2026-09-05.ts`, which builds every request through a
local hand-written `challenge()` helper (`:73`). The register's **conclusion** — no producer in any
execution path — is correct and is confirmed.

### The incompatibility is compile-time only — measured

This is the material addition, and it changes how the risk should be read.

`test-202-authority-boundary-guards.ts` case HIGH-2.a passes a `requestedBy: 'VERIFIER_V3'` object
to the real `consumeSettlementClaims`. Result: **one claim produced, zero refused,
`claimOrigin: 'CHALLENGE_FACT_VALIDITY'`.** The function reads `r.factKey`, `r.reason`,
`r.settles` and `r.factStatusUnchanged`; it never reads `requestedBy`.

So the type mismatch is **not a runtime barrier**. It is a compile-time barrier only, and it is
defeated by a single `as never`, a structural refactor, or a `JSON.parse` boundary. Anyone reading
HIGH-2 as "the types make this unreachable" is reading it too strongly.

What **does** hold at runtime was measured too, and holds:

- the structural sanity check still fires on a forged `settles: true`, refusing with
  `CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE` (HIGH-2.b, `settlement-review.ts:179-182`);
- consuming a claim changes nothing — `ledgerUnchanged` is the literal `true` and the fact remains
  `UNRESOLVED` afterwards (HIGH-2.c);
- `SettlementAuthority` cannot be forged at all: `SETTLEMENT_AUTHORITY_BRAND`
  (`settlement-review.ts:230`) is a real module-private `unique symbol`, never exported, so the
  brand holds at runtime and not merely in the type system. **`PROVIDER_SETTLEMENT_AUTHORITY =
  NEVER` is structurally true**, and nothing in HIGH-2 threatens it.

### Confirmed side-finding (§201 MED-5), re-read

`settleByReviewedEvidence:358-361` — `LEAVE_UNRESOLVED` staleness guard:

```ts
if (!fact) refused.push('FACT_NOT_IN_LEDGER');
else if (fact.status !== 'UNRESOLVED') refused.push('FACT_NOT_UNRESOLVED');
else if (fact.status !== claim.factStatusAtClaim) refused.push('LEDGER_MOVED_SINCE_CLAIM');
```

The third branch is reached only when `fact.status === 'UNRESOLVED'`, and
`consumeSettlementClaims:175` refuses any claim whose fact is not `UNRESOLVED`, so a well-formed
claim always carries `factStatusAtClaim === 'UNRESOLVED'` and the comparison is
`'UNRESOLVED' !== 'UNRESOLVED'`. If the ledger genuinely moved, the second branch fires first.
Confirmed by reading. The guard is not wrong, it is unreachable for the drift it is named after, and
the second branch does the safety work. **Not separately dispositioned — it is subsumed by HIGH-2's
decision.**

## Classification: **B — ARCHITECTURE / POLICY DECISION REQUIRED**

Against the implementation gate:

| gate clause | met? |
|---|---|
| the intended invariant is already established elsewhere | **partially** — `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` is established and is structurally enforced by the brand; what is *not* established is which `ArbitrationRequest` is canonical |
| the change merely makes a receiving boundary enforce an existing invariant | **no** — the change is to unify three types and decide whether to wire a stage |
| no semantic authority or product policy changes | **no** — wiring the settlement stage is an activation decision |
| backward-compatibility impact understood | **no** |
| dedicated regression coverage added | not attempted |

And decisively: `verifier-v3-development-boundary.ts:46-53` records that the whole verifier-v3 stage
is inactive because **"customer activation is blocked on human-authoritative silence-control truth,
of which there are currently zero rows"** and **"clarification evidence sufficiency requires
remediation and remains a human-sampling obligation"**. `settlement-review.ts:32-43` restates the
same: the module refuses to decide whether evidence settles a fact, because that is
`CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED`. **The absent producer is not an
oversight; it is the visible shape of a deliberate deferral.**

Adding one would connect a human-review workflow that has no human-review surface, no reviewer
identity source and zero silence-control truth rows to score against.

**DO NOT IMPLEMENT.** Returned for product-owner decision.

## What the product owner is actually being asked

1. **Which `ArbitrationRequest` is canonical**, and does `requestedBy` remain a per-protocol literal
   (`'VERIFIER'` vs `'VERIFIER_V3'`) or become a closed set both members belong to? This is the same
   question as HIGH-1 and should probably be answered once, not twice.
2. **Should `consumeSettlementClaims` check `requestedBy` at all?** It currently does not, so the
   only enforcement of the producer's identity is the compiler. If `requestedBy` is meant to be
   load-bearing, the receiving boundary is where it should be checked — which is the §202 design
   principle applied to this exact seam. If it is only observability, that should be said, because
   today the field reads like an authority claim that nothing verifies.
3. **Does the settlement stage stay unwired?** If yes, that should be an explicitly recorded state
   — `CHALLENGE_FACT_VALIDITY_CONSUMER_PRESENT = TRUE, PRODUCER_DELIBERATELY_ABSENT` — rather than a
   fact a reader has to reconstruct from a grep, which is how §201 found it.
4. **Does `LEDGER_MOVED_SINCE_CLAIM` stay?** It is unreachable for its named case. Retiring it,
   reordering the branches, or documenting it as reachable-only-for-a-forged-claim are three
   different answers and only one of them is a code change.

## Interim mitigation delivered

Three assertions in `test-202-authority-boundary-guards.ts` (HIGH-2.a/b/c) record the **runtime**
behaviour of the settlement seam as it stands today, so that if a future change wires a producer,
the fact that the boundary accepts a foreign `requestedBy` is already on the record rather than
discovered afterwards. No production code was touched.

---

# Summary

| finding | §201 claim | independently verified? | classification | implemented? |
|---|---|---|---|---|
| **HIGH-1** | two divergent owed-fact implementations, both live, already drifted | **yes**, and the drift is bidirectional; one register citation corrected | **B** | **no** — drift tripwire added instead |
| **HIGH-2** | three incompatible `ArbitrationRequest` definitions; settlement boundary has no producer | **conclusion yes; framing corrected** — a type-compatible producer exists but is unwired, and the incompatibility is compile-time only | **B** | **no** — runtime behaviour recorded instead |

Neither finding was implemented, and in both cases the reason is the same: the fix is a choice
between published designs, not the enforcement of an invariant that already exists.
