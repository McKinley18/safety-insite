# §201 — OwedFact owed-property representation: options, evidence, and an explicit non-choice

**Agent 3 — OwedFact representation engineer. ANALYSIS + DEVELOPMENT PROTOTYPE ONLY.**

Provider calls: **0**. Database operations: **0**. Contract mutations: **0**. Production activation:
**none**. `owed-fact.types.ts` sha256 recomputed at the end of this work:
`102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a` — **identical** to §187's
`owedFactSourceHashes`, so the pin is intact and this slice did not touch the contract.

Prototypes: `backend/scripts/lib/expert-201-owed-property-representation.ts`
Proof suite: `backend/scripts/test-201-owed-property-representation.ts` — **59/59 PASS**

---

## 1. The problem, restated precisely

The structured first-pass declaration carries **`missingFact`** — the owed property itself, in one
phrase. `OwedFact` has **no field for it**. `projectDeclaredOwedFacts` therefore drops it, and
`projectOwedFact` — the only owed-fact shape a verifier ever sees — cannot carry what the `OwedFact`
does not hold.

The property survives only *implicitly*, spread across `whyUnresolved`, `branchA`, `branchB` and the
two halves of `decisionDivergence`.

§196 did not close this. It recorded it, in `NON_PROJECTING_DECLARATION_FIELDS`, and **escalated** it:

> `missingFact` — THE OWED PROPERTY ITSELF, and there is NO canonical OwedFact field for it. […]
> Adding a field would mutate `owed-fact.types.ts`, whose sha256 is pinned by §187 and asserted by
> every integrity gate since. So it is preserved on the declaration record and ESCALATED rather than
> either dropped silently or folded into `whyUnresolved`, which would be composition and therefore
> invention.

§200 then built an adjudication axis specifically to **measure** the consequence — axis **Q**,
`OWED_PROPERTY_LOSS_IMPACT` — whose own `mustNotInfluence` line reads:

> **MEASUREMENT ONLY. Does not authorise adding a field or mutating the contract.**

That axis is unadjudicated. Section 6 of this document is where that fact becomes load-bearing.

---

## 2. What §199's real data shows — factually

Recomputed by the proof suite (cases **A1–A5**, **K1–K4**) directly from the immutable evidence in
`verification/expert-hazlenz-successor-structured-e2e-2026-09-07/`. Nothing below is copied from a
description; the suite fails if any number drifts.

| measurement | value |
|---|---|
| raw structured declarations returned by the hosted first pass | **9** |
| declarations carrying a non-blank `missingFact` | **9 / 9** |
| declarations admitted by the deterministic projection | **8** |
| declarations refused | **1** (`SF-05` — two blank fields, `decisionIfA` / `decisionIfB`; **not** a property problem) |
| projected `OwedFact`s carrying the property under any key | **0 / 8** |
| `missingFact` appearing verbatim anywhere in a projected `OwedFact` | **0 / 8** |
| `missingFact` appearing anywhere in `projectOwedFact()`'s output | **0 / 8** |
| authored property bytes that reach neither the fact nor the verifier | **770** (mean 96 per fact) |

All eight properties are single interrogative phrases: seven begin `Whether…`, one begins `Which…`.

### 2.1 A lexical view of the eight, and its limits

For each admitted fact: the content tokens of `missingFact` (stopwords removed) that appear **nowhere**
in the seven fields the verifier actually received.

| row | factKey | property tokens absent from everything the verifier saw |
|---|---|---|
| SF-01 | `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` | `chuck` |
| SF-11 | `FP.EXPOSURE.OBS-SF-11.357-406.1` | `into`, `expected` |
| SF-04 | `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1` | `installed`, `during`, `replacement` |
| SF-08 | `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` | *(none)* |
| SF-08 | `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` | *(none)* |
| SF-06 | `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1` | `replaced`, `hoist`, `tested`, `before` |
| SF-02 | `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1` | `actual`, `corresponding`, `permit's` |
| SF-07 | `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` | `achieves`, `actual`, `forward` |

**2 of 8** facts have complete token coverage; **6 of 8** have at least one absent token.

> **LEXICAL OVERLAP IS NOT SEMANTIC RECOVERABILITY.** This table says which *strings* travelled. It
> does **not** say that the two full-coverage facts lost nothing, and it does **not** say the six
> others were harmed. A property can be perfectly recoverable from five other fields while sharing
> few tokens with them, and it can be unrecoverable while sharing all of them. Whether the omission
> cost anything, for any fact, is **axis Q**, and axis Q is unadjudicated.

### 2.2 One further factual note on the §199 verifier requests

`execute-199-structured-e2e-2026-09-07.ts` builds the verifier prompt from **seven** of the eight
fields `projectOwedFact` returns; `acceptableEvidence` is not passed through. It was `null` on all
eight facts in this run, so nothing was dropped in practice — but the property was never in either
form to begin with.

---

## 3. The five options

| | option | where the property lives | contract file |
|---|---|---|---|
| **O1** | `UNCHANGED` | on the declaration record only; never on a fact | untouched |
| **O2** | `OWED_PROPERTY_FIELD` | `OwedFact.owedProperty: string` (**required**) | **mutated** |
| **O3** | `UNRESOLVED_TARGET_OBJECT` | `OwedFact.unresolvedTarget: UnresolvedTarget \| null` | **mutated** |
| **O4** | `DECLARATION_REFERENCE_SIDECAR` | an immutable retained declaration record, keyed by `factKey` | untouched |
| **O5** | `ADDITIVE_SUCCESSOR_TYPE` | `OwedFactV2 extends OwedFact` with `owedProperty: string \| null`, in a **new** module | untouched |

O5 is the fifth, minimally invasive representation identified here. It is not invented for this
document: it is the discipline this repository already applies elsewhere — v3 → v3.1 → v3.2 → v3.3,
v15 → vNext — and the one §201's own ownership map prescribes for the circuit breaker, on the stated
grounds that an additive successor *"keeps §198's 89/89 and §199's evidence attached to the module
hashes that produced them."*

Every option is buildable from a real §199 declaration and the real `OwedFact` production already
produced from it, so all five are tested over identical inputs.

---

## 4. The comparison matrix

### 4.1 Options × requirements

Outcomes are **structural**, established by executed checks — never a semantic judgement about any
§199 fact.

| requirement | O1 | O2 | O3 | O4 | O5 |
|---|---|---|---|---|---|
| **R1** preserves `factKey` identity | MET BY CONSTRUCTION | MET | MET | MET BY CONSTRUCTION | MET BY CONSTRUCTION |
| **R2** no unnecessary semantic duplication | MET BY CONSTRUCTION | MET *under condition* | MET *under condition* | MET BY CONSTRUCTION | MET BY CONSTRUCTION |
| **R3** deterministic code invents nothing | MET BY CONSTRUCTION | MET *under condition* | MET | MET | MET |
| **R4** backward compatibility | MET BY CONSTRUCTION | **NOT MET** | MET *under condition* | MET BY CONSTRUCTION | MET BY CONSTRUCTION |
| **R5** no provider settlement authority | MET BY CONSTRUCTION | MET | MET | MET | MET |
| **R6** no production activation | MET BY CONSTRUCTION | MET | MET | MET | MET |
| **migration burden** | **NONE** | **HIGH** | **MEDIUM** | **LOW** | **LOW** |

The conditions, stated rather than buried:

- **O2 / R2, R3** — the type only says a string is present. R3 holds while the field is populated by
  a copy-or-refuse boundary; a call site that *composes* one from `whyUnresolved` and the branches
  satisfies the type and breaks the rule. The type cannot carry that guarantee; a test must.
- **O2 / R4 — NOT MET, and this is the decisive structural fact about O2.** `required` means every
  existing `OwedFact` literal in the repository stops compiling until given a value — including the
  §184 human-truth fixtures and the settled control rows. A `DETERMINISTIC` or `GOVERNED_EVIDENCE`
  fact never had a declared property, so the only available values are a false string or a widening
  of the type to `| null` — which is O5's shape, not O2's.
- **O3 / R2** — `UnresolvedTarget` has four members. `property` carries information. `composed:
  false` is a real guard. `authoredBy` **restates `OwedFact.source`**, and `declarationField` has
  exactly one legal value. Two of four members duplicate what a reader already has (proved by case
  **F3**).
- **O3 / R4** — nullable keeps existing literals compiling, but a nullable field is one a call site
  can forget; the §196 projection would have to be the only thing that populates it.

### 4.2 The §187 hash-pin consequence, per option — stated explicitly

`owed-fact.types.ts` is pinned at `102d059bc477270d…` by
`verification/expert-hazlenz-required-structured-verifier-validation-2026-09-05/PREREGISTRATION.json`
→ `owedFactSourceHashes`, and that pin is re-asserted by **eleven live scripts** (case **I3** confirms
all eleven exist and read the field):

`verify-188` · `verify-190` · `verify-191` · `verify-192` · `verify-193` · `verify-194` ·
`verify-195` · `verify-196` · `verify-197` · `verify-198` · `verify-199` `-source-integrity`

| option | §187 hash-pin consequence |
|---|---|
| **O1** | **NONE.** sha stays `102d059b…`; all eleven live assertions and every archived §184/§192 evidence attachment hold unchanged. |
| **O2** | **BREAKS THE PIN.** The sha changes; **all eleven live assertions fail** until §187's `owedFactSourceHashes` is re-preregistered under a new authorization. Additionally fails §196 case **B3**. |
| **O3** | **BREAKS THE PIN**, identically to O2. Same eleven failures, same B3 failure. |
| **O4** | **NONE.** sha stays `102d059b…`. The sidecar is a new, unpinned module. |
| **O5** | **NONE.** sha stays `102d059b…`, because the pinned *file* is unchanged. The successor type lives in a new module. |

**The precedent, and exactly what it does and does not settle.** §185 changed `owed-fact.types.ts`
under explicit authorization. §182's pin (`f77c7febb55a0562…`, asserted at case **P20c** of
`test-settlement-review-integration-2026-09-05.ts`) has not matched since. §186 classified that as
`EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE`, with
`CURRENT_REGRESSION_FAILURE: false` and `actionTaken: "NONE. Not relaxed, not refreshed, not
rewritten."` (verified verbatim by case **I4**).

So the repository already has a settled answer for an **archived** pin when the contract legitimately
moves. It does **not** have one for the eleven **live** §187 assertions, which are re-executed rather
than filed. O2 and O3 would require that question to be answered by an authorization, not by an
engineering decision.

### 4.3 Downstream consumers

| consumer | O1 | O2 | O3 | O4 | O5 |
|---|---|---|---|---|---|
| `projectOwedFact` | — | must decide whether to project the field | must decide **what** to project; projecting `authoredBy` would tell a verifier which stage authored the fact, which the existing `provenance` comment says not to do | — (a **new two-argument** projection is needed) | — (an additive successor projection; `narrowToV1` reproduces today's bytes) |
| `owedFactDefects` | — | must decide whether a blank value is a defect | gains an `acceptableEvidence`-shaped rule | — | — (a V2 fact passes the V1 rules unchanged) |
| `createOwedFactLedger` | — | every construction site must supply a value | — (nullable) | — | — |
| `preservationViolations` | — | should add the field to `FACT_IDENTITY_MUTATED` | should add the object, as `acceptableEvidence` already is | sidecar needs its **own** append-only proof | successor check owed |
| `structural-questions` | — | — | — | — | — (reads `priority` and `factKey` only) |
| owed-fact observability | — | widens automatically with `initialOwedFacts` | widens automatically | **sidecar must be persisted** or the property is unreconstructable from evidence | widens automatically |
| `settlement-review` | — | re-check `NEVER_PROJECTED_TO_PROVIDER` | same, and more so | — | — |
| §196 case **B3** (provenance table covers `OwedFact` **exactly**) | — | **FAILS** until a provenance row is added | **FAILS** until a row is added | passes unchanged | passes on `OwedFact`; a **successor provenance table is owed**, and B3's exactness rule should be mirrored onto it or the guarantee is lost |

B3 failing is the gate working as designed, not a defect: a field added to `OwedFact` without a
provenance row is exactly what §196 built B3 to catch.

### 4.4 Residuals — every option costs something

**O1** — the verifier never sees the phrase the first pass wrote to name the gap; a human reviewing an
`OwedFact` alone must reconstruct the property from five other fields; the loss is precisely what
axis Q exists to measure, and axis Q is unadjudicated.

**O2** — `required` is unsatisfiable for non-declared facts; every existing literal breaks; R3 depends
on discipline the type cannot carry.

**O3** — two of four members carry no new information; a nullable field is one a call site can forget;
a richer object is a larger surface for a later edit to add a decision-bearing member to.

**O4** — **the failure mode is silence.** A consumer handed only an `OwedFact` gets today's behaviour
and **no error** — proved, not asserted, by case **F5**, which shows an O4 projection with an empty
sidecar is byte-identical to an O1 projection. That is the shape of defect this repository has
repeatedly refused elsewhere ("a check that cannot inspect its target must fail visibly"). Two objects
must travel together and nothing in the type system makes them.

**O5** — **two types now describe one thing**, and the "which type does this field belong to" question
never goes away; a V1 consumer handed a V2 fact silently ignores the property — the same silence as
O4, moved from two objects into two types; and it *defers* rather than answers whether the contract
should name the property.

---

## 5. What the prototypes and the suite actually establish

`backend/scripts/test-201-owed-property-representation.ts` — **59/59 PASS**, 0 provider calls,
0 database operations. Built over the **eight real §199 pairs**, not fixtures.

- **Identity (R1)** — 8 facts × 5 options = **40 checks** that the `factKey` is byte-identical to the
  one production already computed; keys remain unique across the analysis under every option; `O5`'s
  `widenToV2 → narrowToV1` round-trip is byte-equal to the input `OwedFact` (**D1–D4**).
- **O1 *is* today** — O1's projection is byte-equal to production `projectOwedFact` on all seven
  shared fields, and O1 reports the omission as `owedProperty: null` so "not carried" stays
  distinguishable from "not declared" (**E1–E3**).
- **Verbatim, or refusal (R3)** — the property equals `declaration.missingFact` trimmed, byte for
  byte, on 8/8. Absent, blank and non-string fields are each **refused with their own code**. The
  invention test (**B5**) feeds a declaration rich in all nine other fields and blank in
  `missingFact`, and proves the refusal contains **no text from any of them**.
- **No duplication (R2)** — no option alters any existing `OwedFact` field (**F1**); the property
  appears **exactly once** in each representation that carries it, and **zero** times in O4's fact
  (**F2**).
- **Backward compatibility (R4)** — every option's facts pass production `owedFactDefects` and admit
  to a `DEVELOPMENT` ledger through the production constructor, with **0 transitions** (**G1–G2**).
- **No authority (R5)** — no added field name appears in `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` or
  `PROJECTION_FORBIDDEN_FIELDS`; status stays `UNRESOLVED`, priority/source/`modelAuthored` unchanged;
  building representations records no transition (**H1–H6**).
- **No activation (R6)** — the contract sha is recomputed from the file and matched against the frozen
  §187 preregistration; the prototype's **entire dependency set** is `crypto` plus two owed-fact type
  modules, so it cannot reach a provider or a database whatever its prose says (**I1–I7**).

---

## 6. NO RECOMMENDATION IS MADE

**I am not choosing an option, and this is not diplomacy — it is the only position the evidence
supports.**

The instrument built to answer this question exists and is **empty**. Verified by cases **L1–L3**
against `verification/expert-hazlenz-semantic-adjudication-2026-09-07/ADJUDICATION-WORKSHEET.json`:

- axis **Q** (`OWED_PROPERTY_LOSS_IMPACT`) carries `null` for **all 8** §199 facts;
- the worksheet status is `PENDING_HUMAN_ADJUDICATION`;
- `HUMAN_ADJUDICATION_COMPLETENESS` is **`0 / 152`**, `STATUS: UNMEASURED`;
- axis Q's own `mustNotInfluence` line says **"MEASUREMENT ONLY. Does not authorise adding a field or
  mutating the contract."**

Choosing between these five representations *is* choosing an answer to axis Q. O1 is correct if the
loss is `NO_OBSERVABLE_LOSS`; O4 or O5 are proportionate if it is `MINOR_WORDING_LOSS` or
`HUMAN_REVIEW_DIFFICULTY`; a contract-level field becomes arguable only if it is `TARGET_AMBIGUITY`,
`CLARIFICATION_INSUFFICIENCY` or `INCORRECT_VERIFIER_BINDING`. **Ranking the options would supply the
verdict the instrument was built to obtain, from the component being evaluated.**

The suite enforces this rather than promising it: `OWED_PROPERTY_RECOMMENDATION` is the literal string
`NOT_MADE`, `owedPropertyRepresentationEffect().recommendationMade` is `false`, and case **L5** proves
no ranking, score or ordering of the options exists anywhere in the module — `migrationBurden` is a
stated cost, and nothing sorts by it.

Three further reasons the choice is not mine to make, each recorded in
`RECOMMENDATION_WITHHELD_BECAUSE`:

1. Two of the five options require an authorization I do not hold — mutating a §187-pinned contract
   and re-preregistering eleven live integrity assertions is a governance act, not an engineering one.
2. The §201 authorization places this workstream in **analysis + prototype** mode and reserves every
   semantic judgement to the product owner.
3. The number that would most inform the choice — *how many of the eight facts actually lost
   something* — is exactly the number nobody has yet produced.

**What is ready for the moment axis Q is adjudicated:** five working representations, a copy-or-refuse
boundary that provably invents nothing, an executed matrix over all six requirements, the §187
consequence stated per option, and the eleven live assertions enumerated. The decision is one input
away, and that input is a human verdict.
