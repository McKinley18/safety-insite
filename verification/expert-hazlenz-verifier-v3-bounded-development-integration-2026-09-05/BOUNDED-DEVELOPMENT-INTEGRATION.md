# Verifier-v3 bounded development integration

**§170, 2026-09-05. 0 provider calls, $0.00, 0 database operations. 6 files created and 1 modified
under `backend/src/`. `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED = false`.**

---

## 1. Terminal

```
EXPERT_HAZLENZ_VERIFIER_V3_BOUNDED_DEVELOPMENT_INTEGRATED —
SILENCE_TRUTH_AND_SEMANTIC_SUFFICIENCY_VALIDATION_REQUIRED
```

40/40 integration proofs, 18 protected suites green, `SOURCE_PROJECT_TSC` exit 0, and the active
merge path proven byte-identical.

---

## 2. Exactly what changed under `backend/src/`

### Created — `src/safescope-v2/expert-hazlenz/owed-facts/` (6 files, 1,616 lines)

| file | lines | what it owns |
|---|---|---|
| `owed-fact.types.ts` | 222 | `OwedFact`, `AcceptableEvidence`, statuses, sources, provenances, transition authorities, provider-forbidden fields |
| `owed-fact-ledger.ts` | 283 | append-only ledger, transitions, preservation invariants, population boundary |
| `owed-fact-binding.ts` | 430 | closed-set binding admission, per-fact declarations, coverage set difference |
| `structural-questions.ts` | 273 | one question object per fact, compound handling, budget skeleton |
| `verifier-v3-development-boundary.ts` | 201 | the gate, the gated stage, the verifier input projection |
| `owed-fact-observability.ts` | 207 | append-only record, 18 reconstruction obligations |

### Modified — one file, **24 insertions, 0 deletions**

`src/safescope-v2/expert-hazlenz/expert-authority-merge.ts`

- an optional `owedFactCoverage?: unknown` field on `MergedIntelligence`;
- an optional 4th parameter on `mergeExpertIntelligence`;
- a conditional spread: `...(owedFactCoverage === undefined ? {} : { owedFactCoverage })`.

**Why `unknown` and not the real type.** Importing the owed-fact module into the merge would let a
coverage concern reach the place where protected authority is composed. The merge carries the value
and never inspects it; proof case **AD** asserts the merge's import specifiers are unchanged (2,
neither of them the owed-fact module) and that its executable code never names the gate.

**Nothing else under `src/` was touched.** The other eight modified files in `git status` are
pre-existing work from earlier operations, unchanged by this one.

---

## 3. The feature boundary

```ts
export const EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: false = false;
```

A **literal type**, so TypeScript itself carries the guarantee: no runtime value can make it true.

| requirement | how it is met |
|---|---|
| default OFF | the constant is `false` |
| no environment enables it | **the module reads no environment variable at all** — stronger than reading one and defaulting off, because a default can be overridden by a deployment and this cannot |
| no implicit enablement from credentials | nothing in the module knows what a credential is |
| no fallthrough activation | `runOwedFactCoverageStage()` returns `attached: false, attachment: null` on every input |
| no customer-facing toggle | proof **AF** — the six modules have **12 dependencies, all intra-directory**; there is no settings, config, flag-service or environment read that could carry one |
| no automatic activation in test/prod | there is no configuration surface to activate |

**What is gated and what is not.** The deterministic machinery — ledger, binding, coverage, question
projection — is pure and directly callable, which is what makes it testable; calling it computes
state and contacts nothing. The *stage* that would attach coverage to a merged result is what the
gate governs, and under the current constant it attaches nothing.

---

## 4. Active-path invariance

**The customer path does not reach the Expert layer at all.** Nothing outside
`expert-hazlenz/` and `expert-hazlenz-adapters/` imports it; the runner's own header records that it
runs "off the customer request path". So no change inside this module can reach a customer, and that
is the primary invariance argument.

The secondary, narrower proof is case **B**:

```
mergeExpertIntelligence(det, gov, expert)                 ===  (by JSON identity)
mergeExpertIntelligence(det, gov, expert, undefined)
keys: analysisId, jurisdiction, authoritative, governed, expertAdvisory, expertLayer
'owedFactCoverage' in merged  ===  false
```

A conditional spread rather than `owedFactCoverage: undefined`, because a key present with an
undefined value is a different object from no key at all, and the proof compares objects.

```
FEATURE_OFF_CURRENT_PATH_INVARIANT = TRUE
```

`test:expert-nocall-harness` also re-scanned the module with the new files included: **41 source
files, 0 network primitives, 0 vendor names in code.**

---

## 5. `acceptableEvidence`

The §169 remedy, placed in HazLenz-owned task state rather than in a prompt prior.

```ts
acceptableEvidence: {
  requirement: string,
  examples?: string[],
  insufficientExamples?: string[],
  provenance: AcceptableEvidenceProvenance,
} | null
```

`insufficientExamples` is the half §169 exists for: naming the evidence classes that *look* like
settlement and are not — visibility, physical presence, a status indicator.

### Production population authority

| permitted in production | forbidden in production |
|---|---|
| `DETERMINISTIC_RULE_METADATA` | `DEVELOPMENT_HUMAN_TRUTH` |
| `GOVERNED_EVIDENCE` | `ADJUDICATION_LABEL` |
| `AUTHORED_HAZLENZ_SAFETY_CONTRACT` | `MODEL_SELF_AUTHORED` |
| `VALIDATED_DOMAIN_CONTROL_DEFINITION` | |

All three forbidden provenances **throw** on a `PRODUCTION` ledger (proof **J**). `ADJUDICATION_LABEL`
is listed separately from development truth deliberately: a §169-style disposition is a judgement
*about* the system's output, and feeding it back as task state would close the loop the evaluation
depends on being open.

**`acceptableEvidence: null` is valid and stays valid** (proof **I**). Where no trustworthy
production source exists, null is the correct value and no criterion is manufactured. A nominated
fact inherits `null` for exactly this reason — HazLenz holds no criterion for a fact it did not
author.

**A provider can never write it.** `acceptableEvidence` heads
`PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`, and a declaration carrying it is refused whole (proof **H**).

### The example wording is a development fixture, not runtime behaviour

The HS-A1 and HS-E1 criteria appear only in the §170 proof suite. **No hazard-specific wording is
hard-coded into any runtime module** — the modules define the shape and the provenance rule; the
content is supplied per analysis by whichever permitted source exists.

---

## 6. The evidence-sufficiency semantic boundary

```
CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED
```

**Deterministically proven:** the criterion exists or does not; it is projected intact; the binding
key is exact; a provider cannot mutate it; it is retained in observability; and no status transition
occurs from textual similarity.

**Not attempted, and asserted absent:** proof **L** strips comments from the integrated admission
code and confirms it contains no `similarit|embedding|cosine|jaccard|levenshtein|overlap|fuzzy|
threshold`. Whether a proposed clarification actually elicits sufficient evidence remains
`HUMAN_SAMPLING_REQUIRED` — a deterministic gate over question prose would be the matcher §160
retired for being satisfiable by the observation itself.

---

## 7. Verifier input projection

`projectOwedFactsForVerifier()` is pure, total and stable: the same fact projects to the same bytes
every time, which is what lets a future pre-spend gate hash a request before sending it.

Projected: `factKey`, `affectedDecision`, `whyUnresolved`, both branches, the divergence,
`evidenceSpan`, and `acceptableEvidence` (requirement + examples + insufficientExamples).

**Not projected**, and asserted absent from the serialised output (proof **G**): `disposition`,
`status`, `priority`, `source`, `modelAuthored`, `provenance`, `expectedQuestion`, `rowId`,
`authoredClass`, `humanSemanticTarget`, `acceptableSelectors`.

`provenance` is dropped deliberately — it governs whether a criterion may *exist*, and telling a
model that one came from a governed record invites it to weigh criteria by source, which is not its
job.

**No provider call exists in this module.** The projection is built; nothing sends it.

---

## 8. Structural question representation

The architecture no longer equates **one string** with **one decision-critical fact**.

```ts
interface StructuralQuestion {
  clarificationKey; bindingFactKey;      // one key. Not an array. Not optional.
  question: string | null;               // null when no wording exists that HazLenz did not invent
  affectedDecision; sourceAttempt; priority; presentationStatus;
}
```

### Compound handling — the VC-08-2 / VC-08-3 repair

When a response binds fact A and nominates fact B while supplying one string:

1. the string belongs to **A** and is projected into A's question object;
2. **B gets `question: null`** and `presentationStatus: NO_WORDING_AVAILABLE`;
3. the raw prose is retained as a `CompoundProviderOutputDiagnostic` naming the co-declared key;
4. **B stays `UNRESOLVED` and the coverage warning stays live.**

No parser over generated English. Proof **P** confirms the module contains no `.split(`, `.match(`,
`RegExp` or `replace(` **at all** — the guarantee is the absence of the machinery, not a rule about
using it carefully. Deterministically inventing customer-facing wording is the one thing this module
must never do, and it has no code path that could.

Replaying the two adjudicated draws (proof **AI**): each yields **2 question slots and 1 diagnostic**,
while its `BINDING_SEMANTICALLY_CORRECT` disposition is untouched. The two axes stay separate.

---

## 9. Question budget skeleton

`PRESERVE_FIRST`, `RANK_SECOND`. Proven: one fact = one question object (**M**); two independent
facts cannot hide in one slot (**N**, **O**); a suppressed question leaves its fact `UNRESOLVED`
(**R**); a budget records **zero transitions** and therefore cannot settle anything (**R**); and a
life-critical gap that cannot be presented surfaces `UNRESOLVED_SAFETY_STATE` with the deterministic
findings still shown (**S**).

**Customer presentation thresholds are deliberately not finalised.** The surface is undesigned and
the burden question is unmeasurable while no silence-control truth exists.

---

## 10. Component status after this slice

### `INTEGRATED_INACTIVE_DEVELOPMENT`

`CLOSED_SET_OWED_FACT_LEDGER` · `EXPLICIT_FACTKEY_BINDING` · `PER_FACT_DECLARATIONS` ·
`ADDITIVE_NOT_SUBSTITUTIVE_NOMINATION` · `MULTI_GAP_PRESERVATION` ·
`COVERAGE_STATE / WARNING PLUMBING` · `OBSERVABILITY` · `ACCEPTABLE_EVIDENCE_TASK_STATE` ·
`STRUCTURAL_PER_FACT_QUESTION_REPRESENTATION`

### `REQUIRES_REMEDIATION / HUMAN VALIDATION`

- `CLARIFICATION_EVIDENCE_SUFFICIENCY` — the shape is integrated; the judgement stays human
- `CUSTOMER_VISIBLE_QUESTION_BUDGET` — skeleton only, thresholds undesigned

### `UNEXERCISED_HOSTED` — unchanged, and not upgraded

- `POLICY_C` — 0 of 12 draws fell silent, so the gate never opened. **Not integrated into `src/`**
  (proof **U**), because integrating a retry mechanism whose hosted behaviour is unmeasured, on the
  strength of a run where it was unnecessary, is the inverse of the argument that should justify it.
- `PRIMARY_TARGET_COVERAGE_WARNING_FAILURE_PATH` — the warning fired on 5 of 12 §167 draws and
  **never once because an owed fact was uncovered**; every firing came from an unresolved additive
  nomination. The set-difference computation is integrated; the failure path it exists for has still
  not occurred hosted.
- `DEGENERATE_REISSUE` — `PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION`, unchanged. Not integrated
  (proof **V**). Its counter stays separate from the reliability-draw counter (proof **W**) and the
  5-call structural cap is intact (proof **X**).

### `BLOCKED`

- `CUSTOMER_ACTIVATION`
- silence-side precision claims

---

## 11. The silence-side blocker, unweakened

```
HUMAN_AUTHORITATIVE_SILENCE_ROWS = 0
CURRENT_SILENCE_CANDIDATES_HOSTED_ELIGIBILITY = NOT_READY_LENGTH_CONFOUNDED
```

Customer activation remains blocked on silence-control truth, unnecessary-question behaviour, and
precision when no clarification is owed. Nothing in this integration touches that gate. The
prospective **380–440 character** band stands as an instrument-control constraint — not a
safety-truth criterion — and no silence control was authored or rewritten here.

---

## 12. Human-sampling obligation, recorded as an architecture requirement

```
BOUND_BINDING_TOPIC_REACH  !=  RESOLUTION_SUFFICIENCY
```

Any future activation evaluation must independently sample whether a question (1) addresses the
bound fact **and** (2) asks for evidence sufficient to resolve it. The §162 cue instrument measures
only the first and may not be substituted for the second.

`HUMAN_REVIEWED_RESOLUTION_SUFFICIENCY` is maintained as a separate future metric. The current
figure — 8 of 12 — is an exact count on a 12-row sample and **may not be published as an accuracy
percentage**.

---

## 13. Proof matrix — 40/40

A default-off · B active-path byte-invariance · C `UNRESOLVED` entry · D exact binding · E sibling
survives · F additive nomination · G projection intact and clean · H provider cannot mutate ·
I null accepted · J three forbidden provenances throw · K similarity settles nothing · L no matcher
in code · M one question one fact · N two facts two slots · O compound cannot consume a slot ·
P raw prose preserved, no splitting machinery exists · Q nominated fact stays unresolved ·
R suppression cannot cover · S budget cannot drop life-critical · T two NOs settle nothing ·
U policy C inactive · V degenerate inactive · W budgets separate · X 5-call cap · Y arbitration owns
rejection · Z explanation is not an authority · AA deterministic set difference · AB missing
nomination is not a failure · AC fixture truth refuses · AD merge unchanged · AE stage cannot run ·
AF no toggle surface exists · AG no persistence primitives · AH append-only + 18 obligations ·
AI VC-08-2/3 replay · AJ VC-08-1/4/6 preserved · AK VC-04-1 preserved.

**AI/AJ/AK are the ones that matter most:** deterministic code replays the §167 draws and the §169
human findings survive intact. Nothing rounds a `BINDING_PARTIALLY_CORRECT` up to correct, and
nothing downgrades a semantically correct binding because its packaging was wrong.

---

## 14. Protected regression — 18 suites, 0 failures

`SOURCE_PROJECT_TSC` exit 0 · v3-development-integration **40/40** · verifier-v3-protocol 49/49 ·
bounded-reliability 44/44 · **nocall-harness 141** (41 files scanned, 0 offenders) ·
contract-foundation 56 · reliability-architecture 69 · verifier-v2-contract 46 · routing-contract 67
· measurement-layer 66 · fixture-hardening 76 · clarification-settlement 148 ·
affected-decision-arbitration 41 · unsupported-settlement 129 · retention-bridge 123 ·
level1-recall PASS · actionable-coverage PASS · guarding-applicability 16/16 ·
governed-kill-switch-authority 115.

No database operation was issued. No frontend build was run and
`frontend-next/tsconfig.json` was not touched.

---

## 15. Exact next authorization required

1. **Populate `acceptableEvidence` from a real production source** — deterministic rule metadata or
   governed control semantics — for at least one hazard family, so the field carries something other
   than null outside a fixture.
2. **Re-author silence controls inside the 380–440 band**, then independently adjudicate that exact
   wording. This is the single blocker on every precision claim and on customer activation.
3. **Human-sample resolution sufficiency** on any future bound pairs, per §12.
4. Only after 1–3: consider hosted validation of the integrated stage. Policy C and the degenerate
   reissue stay inactive until something measures them.
