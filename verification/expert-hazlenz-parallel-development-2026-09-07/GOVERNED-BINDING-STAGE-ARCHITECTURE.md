# §201 — the governed-binding stage: architecture, contract and measurement

**Agent 2, governed-binding stage architect. Analysis plus an isolated development prototype.**

**Provider calls: 0. Database operations: 0. Nothing is wired into any active or customer path.
No existing file was modified. No §200 semantic verdict is supplied or implied anywhere in this
memo — every fixture referenced below is a structural fixture and asserts nothing about safety
truth.**

Artifacts this memo describes:

| file | role |
|---|---|
| `backend/scripts/lib/expert-201-governed-binding-stage.ts` | the prototype stage |
| `backend/scripts/test-201-governed-binding-stage.ts` | the zero-provider proof suite (59/59 PASS) |

---

## 1. The finding being remediated, restated exactly

§199 sent the capability-PRESENT vNext first-pass schema to Anthropic and was refused **before
inference** on both governed rows:

```
HTTP 400 invalid_request_error
"The compiled grammar is too large, which would cause performance issues.
 Simplify your tool schemas or reduce the number of strict tools."
```

The capability-ABSENT schema was accepted on all ten other rows and produced this programme's first
working end-to-end hosted path. §200's decision packet set out four directions and did not choose.
**This memo designs Option C** — the governed binding leaves the first-pass schema entirely and
becomes a separate, much smaller stage.

Two things about the problem statement have to stay in view because they constrain every claim
below:

1. **The provider's metric is compiled grammar complexity, not serialised size.** Every byte figure
   in this memo is a *proxy* measured on the axes the provider's own error message points at. None
   of them is the provider's number.
2. **The threshold is undocumented.** No offline measurement can establish that any schema will be
   accepted. Only a hosted single-row canary can, exactly as §199's own canary did for one call.

---

## 2. The decision

> **The governed-binding stage runs AFTER the deterministic OwedFact projection, as its own
> provider call, on governed rows only. The first pass becomes capability-ABSENT on every row.**

```
RAW OBSERVATION
  -> FIRST PASS  (capability-ABSENT — prompt, schema and user prompt all unchanged)
  -> DETERMINISTIC PROJECTION  (unchanged; produces HazLenz-COMPUTED factKeys)
  -> GOVERNED-BINDING STAGE  <<-- new, ~1.5 KB schema, governed rows only
  -> VERIFIER  (unchanged)
```

The task framed four candidate locations. This is **(B) after OwedFact projection**.

### 2.1 Why after projection and not before it

**Identity.** Before projection a fact has no identity. The only handle available is the model's own
`declarationId`, which `expert-first-pass-owed-fact-projection.ts` is explicit about *not* being an
identity ("IDENTITY IS COMPUTED, NEVER ACCEPTED"). A second provider call addressed by a handle the
first call's model chose would make the binding's addressing model-authored end to end. Structure
does not confer authority: a value is bound only when it is bound to an identifier HazLenz supplied.
After projection both halves of every binding come from closed sets HazLenz owns — the computed
`factKey` and the supplied `sourceId` — and the model *selects* between them rather than naming
anything.

**Wasted and orphaned work.** The projection refuses declarations for a dozen structural reasons
(`EVIDENCE_SPAN_NOT_VERBATIM`, `BRANCHES_IDENTICAL`, `DECISIONS_DO_NOT_DIVERGE`, …). Binding before
projection would spend a provider call binding facts that are about to be discarded, and would leave
an orphan binding behind when they were. Running after projection means the stage only ever sees
facts that survived.

**Determinism of the request.** The stage's own wire schema enumerates one reference per *admitted*
fact. Pre-projection, the number and identity of facts is whatever the model emitted; post-projection
it is a deterministic function of the boundary's output.

### 2.2 Why not the verifier

Rejected. The verifier is an adversarial per-verdict stage with its own contract (v3.3), its own
citation-reuse allowance, and its own `regulatoryBasis.sourceIds` — which is a *reliance* declaration
about the verdict, not a binding of a fact to evidence. Folding governed binding into it would:

- **conflate two different relations.** "This verdict relied on record R" and "fact F is bound to
  record R" would become indistinguishable in the same field.
- **make binding contingent on a verdict being admitted.** v3.x refuses a verdict **whole**. A
  verdict refused for an unrelated code would destroy a well-formed binding with it — the
  destroyed-output failure mode, imported into a new place.
- **grow the schema that is already second-largest** rather than reduce coupling, which is the one
  thing Option C is for.
- **run on the wrong population.** The verifier is not necessarily run on every row that carries
  governed evidence, and binding must not inherit that eligibility rule.

### 2.3 Why not "no stage at all" — deterministic binding

Rejected, and worth stating because it is the option that costs nothing. A deterministic binder would
have to decide whether a governed record *bears on* an unresolved property. Doing that from text
means term overlap or a keyword rule — which is the semantic matcher this programme retired at §160,
reintroduced under a new name and with a fail-closed claim it could not honour. If a bearing
judgement is wanted, a model makes it and the boundary validates it; a weak matcher dressed as a
deterministic guarantee is the worse of the two failures.

### 2.4 Why not simply Option B (drop the enum, keep the monolith)

Not rejected — **deferred, and composable.** §200 was right that B is cheaper and does not commit
against C. B leaves the monolith near the ceiling and reduces no coupling; the next capability meets
the same wall closer to it. Option C's stage supports B directly: `governedIdTransport:
'PLAIN_STRING'` drops the id enum inside the *stage* schema, and the suite proves the boundary is
byte-for-byte as strict in both modes (case D4). If the small stage schema were ever itself refused,
that switch is the one-line follow-up.

---

## 3. The exact contract

### 3.1 What the stage is given

```ts
interface GovernedBindingStageInput {
  analysisId: string;
  facts: readonly BindingCandidateFact[];      // projected, UNRESOLVED, HazLenz-computed keys
  governedRecords: readonly { sourceId: string; text: string }[];   // the closed permissible set
  inspectionContext: { location: string; task: string };
  governedIdTransport?: 'CLOSED_ENUM' | 'PLAIN_STRING';             // default CLOSED_ENUM
}

interface BindingCandidateFact {
  factKey: string;                 // NEVER rendered to the provider
  owedProperty: string | null;     // declaration.missingFact, where the harness kept it
  affectedDecision: OwedFactAffectedDecision;
  evidenceSpan: string;            // already validated verbatim by the projection
  whyUnresolved: string;
  branchA: string;
  branchB: string;
}
```

**Included, and why:** `owedProperty` (the single most load-bearing field for a relevance judgement),
`affectedDecision` (a record bearing on `REQUIRED_CONTROL` and one bearing on `APPLICABILITY` are
different questions), `evidenceSpan` (anchors the fact without shipping the observation),
`whyUnresolved`, both branches (a record bears on a fact when it speaks to which state obtains), and
location/task (applicability is frequently a function of the task alone).

**Deliberately excluded, and why:**

| excluded | reason |
|---|---|
| `decisionDivergence` (`ifA`/`ifB`) | action content invites an action-flavoured judgement — "this fact matters enough to escalate". The stage has no escalation authority and is not given the material to reason about escalation with. |
| `priority`, `status` | HazLenz task state; showing them invites echoing them back. |
| the full observation | so the stage cannot re-derive hazards, re-open the first pass's analysis, or find a **second** gap it was not asked about. **The cost is real:** a record whose applicability turns on context outside the span cannot be judged. The honest answer to that is `CANNOT_DETERMINE`, which is exactly why that outcome exists and is counted separately. |

### 3.2 What the model may return

```jsonc
{
  "bindings": [
    {
      "factRef": "F1",                                  // enum of HazLenz-minted references
      "determination": "BINDS|NO_BINDING|CANNOT_DETERMINE",
      "governedEvidenceSourceIds": ["GOV-…"],           // enum of supplied ids (or plain string)
      "bearingStatement": "one sentence"                // recorded for review; NEVER an authority
    }
  ]
}
```

**There is no `factKey` field on the wire, and the computed key never appears in the request in
either direction** (suite cases C2, C3). The model addresses a fact by a **HazLenz-minted,
request-scoped reference** (`F1`, `F2`, …) that is enumerated in the schema and resolved back through
a table this module owns. That is the exact inverse of the first pass's `declarationId`: HazLenz
mints, the provider selects, and HazLenz — not the provider — decides which fact the token meant. The
reference cannot collide with or impersonate a real `factKey`, because it never leaves the request.

**Three answers, not a boolean.** A boolean would make "none of these records bears on this fact" and
"I cannot tell from what you gave me" the same answer. The first is a substantive negative result;
the second is evidence that *our own evidence packet is wrong*. Merging them would hide the only
signal that would ever tell us the packet was too thin.

### 3.3 What comes out

```ts
outcome ∈ { BOUND, NOT_BOUND, CANNOT_DETERMINE, REFUSED, NO_DETERMINATION_RETURNED }
```

Five outcomes for three determinations, because two of them never come from the model. `REFUSED` is
the boundary's; `NO_DETERMINATION_RETURNED` is what a fact receives when **no entry named it at
all**. That is deliberately not folded into `NOT_BOUND`: silence and a finding must never be the same
observable outcome (suite case D7).

---

## 4. Grammar-complexity comparison

Measured by `measureSchemaComplexity()` in the prototype, over the schema **as sent** — i.e. after
`applyStrictSchemaWrapper` and the §108 Anthropic keyword strip, which is the object that actually
travels. Reproduce with `npx ts-node scripts/test-201-governed-binding-stage.ts` from `backend/`.

```
  schema                                       enums   alts   objs  props   reqs  descChars  chars  utf8B
  first pass vNext ABSENT   (SF-01)             17     74      9     54     52      12865  18629  18679
  first pass vNext ABSENT   (SG-01, Option C)   17     74      9     54     52      12865  18636  18686
  first pass vNext PRESENT  (SG-01, REJECTED)   18     75      9     55     53      13154  19074  19124
  §201 binding stage        (CLOSED_ENUM)        3      5      2      5      5        883   1505   1507
  §201 binding stage        (PLAIN_STRING)       2      4      2      5      5        883   1472   1474
```

`chars` is `JSON.stringify(...).length`; `utf8B` is the same string in UTF-8 bytes. Both are
reported because a size figure with an unstated encoding is a figure two people will disagree about
while both being right — the 50-byte gap is em dashes in the descriptions.

**What the comparison shows.**

- The capability-PRESENT schema differs from the ABSENT one by **one enum construct, one property,
  one required entry and 438 characters** — a 2.3% size difference that separates an **accepted**
  request from a **rejected** one. That is the sharpest available demonstration that size is not the
  metric. `enumAlternatives` is the count worth watching: an enum of N strings is an N-way
  alternation in the compiled grammar.
- The binding stage is **an order of magnitude smaller on every axis**: 3 enums against 18, 5
  alternatives against 75, 5 properties against 55, ~1.5 KB against ~19 KB. It is not a shave; it is
  a different size class.
- **Option B composes:** `PLAIN_STRING` removes one further enum construct from the stage schema and
  the boundary is unchanged (cases B5, D4).

**What the comparison does NOT show, stated plainly.** It does not show that the stage schema will be
accepted. `GRAMMAR_MEASUREMENT_CLAIMS` records this in code:
`IS_THE_PROVIDERS_COMPILED_GRAMMAR_METRIC: false`, `PROVES_A_REQUEST_WILL_BE_ACCEPTED: false`,
`KNOWS_THE_THRESHOLD: false`. A ~1.5 KB schema with five enum alternatives is far from any plausible
limit, and "far from a limit we cannot see" is a qualitative claim, not a proof.

### 4.1 A discrepancy found while reconciling against §199

§199's `CAPABILITY-TRANSPORT-DIAGNOSIS.json` records 18,617 for SF-01 and 19,062 for SG-01. Those
figures are reproduced **exactly** — but only when the analysis input carries the placeholder
`sourceId: "OBS"`. The §199 **executor** builds `sourceId: "OBS-${rowId}"`, and that id is enumerated
twice in the vNext schema (once in v15).

**Every per-row figure in the frozen diagnosis is therefore 12 characters short of what was actually
sent** (6 short for the v15 base column). Suite case B2a asserts the offset is exactly 12 on all
twelve rows.

This is recorded rather than smoothed over. It changes **nothing** about §199's conclusion — the
offset is a constant that both sides of every comparison carry — but a later reader remeasuring would
otherwise be 12 bytes adrift with no explanation, and the correct absolute figure for what was sent
is 12 higher than the frozen artifact states. §195–§200 evidence is immutable and has not been
touched; this is a note about how to read it.

---

## 5. Deterministic boundary rules

The boundary (`checkGovernedBindings`) refuses **per entry**, exactly as the projection does and for
the same reason: each entry concerns one independent fact, and refusing the whole response because
one entry was malformed would let a defect in one binding destroy an unrelated one. A response that
is not even the right *shape* is refused whole, because at that point there are no entries to refuse
individually.

**Nothing is repaired.** No nearest-match on a `factRef`, no case-folding on a `sourceId`, no
inference of a determination from the ids that came with it.

| rule | code | suite |
|---|---|---|
| every `sourceId` must be in the supplied set, by exact string equality | `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET` | D2, D3, D4 |
| no duplicate id within an entry | `GOVERNED_SOURCE_ID_DUPLICATED` | — |
| `BINDS` must name at least one id | `BINDS_NAMES_NO_SOURCE` | D8 |
| `NO_BINDING` / `CANNOT_DETERMINE` must name none | `NON_BINDING_CARRIES_A_SOURCE` | D8 |
| determination must be a member | `DETERMINATION_NOT_A_MEMBER` | D17 |
| a `factRef` nobody minted is an **orphan**: counted, dropped, never reattached by proximity | — | D13 |
| two entries for one fact refuse **that fact** | `FACT_REF_DUPLICATED` | D14 |
| a bearing statement is owed on all three determinations | `BEARING_STATEMENT_MISSING` | D12 |
| a citation-shaped string in the free-text field refuses the entry | `PROHIBITED_REGULATORY_CITATION` | D11 |
| 31 HazLenz-owned field names — `factKey` first — refuse the entry | `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD` | D9, D10 |
| a response of the wrong shape refuses whole; every fact becomes undetermined | `RESPONSE_NOT_AN_OBJECT`, `BINDINGS_NOT_AN_ARRAY` | D16 |

**Minting is fail-closed too.** A malformed or duplicated `factKey` aborts minting rather than being
rewritten, because quietly rewriting an identifier is how two different facts end up sharing one
(case F4).

**Empty-run safety.** `stageInvocation()` answers both empty cases *without a provider call* and
neither is a failure: no governed record means there is nothing legitimate to bind to; no projected
fact means there is nothing to bind. On §199's cohort that is **ten of twelve rows issuing zero extra
calls** (cases F1–F3).

---

## 6. What authority the model gains: none beyond declaration

Exhaustively, the model may: **select** a minted fact reference from a closed set; **declare** one of
three determinations; **select** zero or more supplied `sourceId`s from a closed set; and **write one
sentence** that is recorded for human review and is never an authority for anything.

`governedBindingStageEffect()` is typed to the literal `false` on all eight axes and asserted by the
suite (case E9): `factsMayBeSettled`, `coverageMayChange`, `priorityMayChange`,
`citationsMayBeCreated`, `regulatoryTruthMayBeCreated`, `factsMayBeAdded`, `factsMayBeRemoved`,
`questionWordingMayBeInvented`.

**The only effect a binding has** is `applyGovernedBindings`: it attaches an `acceptableEvidence`
criterion **HazLenz already holds** for a bound governed id — the same lookup the projection performs
today when the binding arrives on the declaration, moved to the stage that now produces the binding.
Provenance is unchanged (`HAZLENZ_TASK_STATE`, looked up, never authored, never accepted from the
provider). Proven by the suite:

- a bound fact stays `UNRESOLVED`; `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` is untouched (E1)
- priority is unchanged, so a binding cannot escalate a fact toward `UNRESOLVED_SAFETY_STATE` (E2)
- no other field of the fact is altered, and no fact is added or removed (E4, E5)
- an existing criterion is **never** overwritten by a model-selected binding (E6)
- a binding with no criterion held changes nothing and is not an error (E7)
- the enriched fact is re-checked with `owedFactDefects`, so an invalid enrichment fails here

---

## 7. What is preserved, proven rather than asserted

Section A of the suite is the reason Option C is worth anything. It reads §199's **immutable**
`PROTOCOL-HASHES.txt` and asserts:

- the capability-ABSENT vNext system prompt is byte-identical to the one the ten accepted rows used
  (`bdb3af04…`)
- `expert-first-pass-instruction-vnext.ts` and `expert-first-pass-owed-fact-projection.ts` hash to
  §199's frozen values — §201 modified neither
- **all ten** capability-ABSENT per-row wire schemas reproduce §199's frozen per-row hashes, zero
  drift
- under Option C, SG-01's first pass is capability-**ABSENT**: it carries no
  `governedEvidenceSourceIds` property at all, uses the ABSENT prompt, and is **not** the schema
  §199 sent and had rejected (whose hash is also reproduced, so the comparison is real)
- the `AVAILABLE GOVERNED EVIDENCE` id block leaves the first-pass user prompt, while v15's own
  rendering of governed standards under opaque handles **stays** — Option C removes the §198 id
  block, not the v15 treatment

If §201 had perturbed the working path, those ten hashes would move and the suite would fail before
any binding property was ever considered.

**Side benefit worth naming.** Option C also resolves the §199 tension where the first pass was shown
a `sourceId` but a citation-redacted text while v15 still told it that reproducing a number from its
own input is a violation. Under Option C the first pass is never shown a governed `sourceId` at all,
so the tension does not arise. The binding stage sees the ids exactly and the text **redacted**, with
its own explicit citation prohibition — v15's containment posture, unchanged (cases C8, C9).

---

## 8. Migration and integration plan

Additive throughout. Nothing below modifies a §196–§199 module.

**Phase 0 — orchestrator-owned registration (I cannot make these edits).**
- `backend/package.json`: `"test:201-governed-binding-stage": "ts-node scripts/test-201-governed-binding-stage.ts"`
- a §201 scoped typecheck config listing
  `scripts/lib/expert-201-governed-binding-stage.ts` and `scripts/test-201-governed-binding-stage.ts`.
  Verified clean under the project's own compiler options (see §10).

**Phase 1 — harness plumbing, zero provider calls.** The executor must (a) build every first-pass
request with an **empty** governed binding, and (b) retain the raw declaration records alongside the
projected facts so `declaration.missingFact` survives projection and can be handed to the stage as
`owedProperty`. Both are executor changes; neither touches a protocol module.

**Phase 2 — circuit-breaker registration.** The stage exposes
`GOVERNED_BINDING_REQUEST_CONTRACT_ID`, deliberately distinct from the first pass's, so a rejection
of this schema can never join a first-pass rejection streak or vice versa. §198's breaker keys on
`requestContractId` and needs no change; the executor must pass the stage's id.

**Phase 3 — a single-row transport canary.** §200 named the pattern and it is the right one: build
the request offline, then issue **one** call on one governed row. That establishes acceptance for the
cost of one call. **Do not run a cohort before the canary.**

**Phase 4 — governed-arm behavioural validation.** A new preregistration, a new protocol hash set,
and the stage's own frozen identity, because a new stage is a new protocol.

**Reversibility.** Option C is purely additive: the ten-row working path is what it already was, and
deleting the stage returns the system to §199's capability-ABSENT behaviour exactly.

---

## 9. What hosted validation would still be required

Nothing in this memo has been exercised against a provider. Required, in order:

1. **Transport acceptance.** One governed row, one call. Does the ~1.5 KB strict schema compile?
   *This is the only question the offline measurement cannot answer, and it is the load-bearing one.*
2. **Determination distribution.** Do `BINDS` / `NO_BINDING` / `CANNOT_DETERMINE` all actually occur,
   and is `NO_BINDING` reachable at all? A stage that always says `BINDS` is a stage with a coverage
   habit, which is this programme's measured failure mode for every added instruction.
3. **`CANNOT_DETERMINE` rate.** This is the direct measurement of whether the minimal evidence packet
   (§3.1) is too thin. A high rate is a *design finding about our input*, not a model failure, and it
   is the evidence that would justify widening the packet.
4. **Boundary refusal rates**, per code, with the same treatment §198 gave the projection's.
5. **Whether a binding is CORRECT.** Semantic, human, and out of scope for every deterministic
   artifact here. An admitted binding is a well-formed binding, never a correct one.
6. **Two-call reliability.** The analysis is no longer atomic. The failure mode "first pass succeeded,
   binding call failed" must be measured, not assumed rare.

---

## 10. Residual limits, stated not buried

Recorded in code as `STAGE_RESIDUAL_LIMITS` and `STAGE_DEPENDENCIES`:

- **Non-atomicity.** Two calls; the second can fail after the first succeeded. A fact whose binding
  call failed occupies the same *state* as a fact nothing bore on, so the outcome vocabulary keeps
  them apart (`NO_DETERMINATION_RETURNED`) and any harness **must** persist that distinction.
- **Cost.** A second latency and a second failure mode on every governed row. Rows with no governed
  evidence pay nothing (the stage is not called).
- **Context.** The stage sees the span, not the observation. Some bearing judgements are not
  decidable from it, by design.
- **The measurement proves no acceptance.** The threshold remains undocumented.
- **`OwedFact` has no field for the owed property.** §196 recorded this as a residual and preserved
  `declaration.missingFact` on the declaration record rather than folding it into `whyUnresolved`,
  which would have been composition and therefore invention. **This stage is the first consumer that
  genuinely needs it** — deciding whether a record bears on a fact is exactly a question about the
  property. The prototype takes it as a nullable caller-supplied string and degrades to
  `whyUnresolved` plus the branches when it is absent. That is a workaround for a representation gap,
  **not a resolution of one**, and the gap belongs to whoever owns `OwedFact`'s representation
  (Agent 3's workstream). It is reported here, not absorbed.

---

## 11. Verification actually executed

```
$ cd backend && npx ts-node scripts/test-201-governed-binding-stage.ts
59/59 PASS · 0 FAIL
PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE
```

Scoped typecheck under the project's own compiler options (`extends backend/tsconfig.json`,
`noEmit`), over both §201 files: **clean, exit 0**. The config was written to a scratchpad path
because `backend/tsconfig.*` is orchestrator-owned.

Not executed: any provider call, any database operation, any repository-wide typecheck, any hosted
validation, and any semantic evaluation of any kind.
