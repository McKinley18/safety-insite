# §202 — the governed-binding stage as a bounded development integration

**Agent B1, governed-binding stage. Development implementation.**

**Provider calls: 0. Database operations: 0. Customer/production activation: NONE. No existing file
was modified — the four preservation hashes are byte-identical before and after (§8). No §199
semantic verdict is supplied or implied anywhere in this memo, and no §200 adjudication slot is
filled. The final `OwedFact` representation decision and the final escalation-policy decision are
both withheld from §202 and are NOT made here.**

| file | role | sha256 |
|---|---|---|
| `backend/scripts/lib/expert-202-governed-binding-contract.ts` | the authority contract, boundary and measurement | `a254e4bc90855dca9999bb848e8b7989600ae9919d9820aa81125681911886e3` |
| `backend/scripts/lib/expert-202-governed-stage-pipeline.ts` | the placement, as an enforced call graph | `2283c6992cb20214fbe653b49e0c551885bcf0d2a06946c4f9866931170937ac` |
| `backend/scripts/test-202-governed-binding-stage.ts` | the zero-provider suite — **54/54 PASS, 0 FAIL** | `0e8b968f313260409dbef5a3b383ef081169da8d4cbf005dcb94b5efc5e37723` |

---

## 1. The placement, and why it is this one

> **The governed-binding stage runs AFTER deterministic validation and identity, and BEFORE
> enrichment. It is its own provider call, made only on rows that carry governed evidence, and the
> ordinary capability-ABSENT first pass is unchanged on every row.**

```
RAW OBSERVATION
  -> ORDINARY FIRST PASS          capability-ABSENT — prompt, schema and user prompt UNCHANGED
  -> STRUCTURED DECLARATIONS      the model's own words; no identity yet
  -> DETERMINISTIC VALIDATION     §196's projection — verbatim span, diverging branches, …
     AND IDENTITY                 …and the COMPUTED factKey
  -> IDENTITY SEAL                §202 — sealed before anything is transmitted
  -> GOVERNED-BINDING STAGE       <<-- ~1.5 KB schema, governed rows only
  -> BINDING BOUNDARY             deterministic; nothing repaired; refusal is per entry
  -> ENRICHMENT                   attaches only a criterion HazLenz already held
  -> VERIFIER                     unchanged; not called by §202
```

This is the placement `PLACEMENT_RATIONALE` records, with four rejected alternatives and the
repository artifact that establishes each. The selection criterion the authorization set was **least
provider authority**, so each row below is stated as *the authority that alternative would have
handed the provider*.

| alternative | authority it would have handed the provider | repository evidence |
|---|---|---|
| inside the first pass (§198/§199 monolith) | the binding would be addressed by `declarationId`, which **the model chooses** — both halves of the relation model-named in one response, attached to an identity that does not exist yet | `expert-first-pass-owed-fact-projection.ts`: "IDENTITY IS COMPUTED, NEVER ACCEPTED"; `FACT_IDENTITY_CLAIMS.NOT_CHOOSABLE_BY_THE_PROVIDER = true`. §199 also had this exact request refused **before inference** on both governed rows, so it is not available as a transport either. |
| a separate stage placed **before** the projection | addressing would be end-to-end provider-authored — a second call keyed by a handle the first call's model chose. It would also spend a call binding declarations the projection is about to refuse, and orphan the binding when it did. | `PROJECTION_REFUSAL_CODES` lists **17** reasons a declaration never becomes a fact (`EVIDENCE_SPAN_NOT_VERBATIM`, `BRANCHES_IDENTICAL`, `DECISIONS_DO_NOT_DIVERGE`, …). The projection is also what makes the request deterministic: pre-projection the fact count is whatever the model emitted. |
| folded into the **verifier** | two different relations would become one field — "this verdict relied on record R" and "fact F is bound to record R". And v3.x refuses a verdict **whole**, so a verdict refused for an unrelated code would destroy a well-formed binding with it. | `expert-verifier-contract-v3-3.ts`: "Refuses the verdict WHOLE on any violation, as v1, v2, v3, v3.1 and v3.2 do." Its `regulatoryBasis` is a *reliance* declaration about a verdict, not a binding of a fact. It would also grow the second-largest schema in the programme. |
| no stage — bind deterministically by text | none, which is why it is tempting — but deterministic code would have to decide whether a record **bears on** an unresolved property, and the only deterministic way to fake that is term overlap. | the semantic matcher retired at §160, and the standing rule that an unenforceable fail-closed claim is escalated as a representation question rather than shipped as a weak matcher. |
| **after validation/identity, before enrichment — CHOSEN** | **selection between two closed sets HazLenz owns, and nothing else.** The fact side is a HazLenz-**minted**, request-scoped reference (`F1`, `F2`, …) resolved through a table this process owns and which never leaves the request; the evidence side is the exact supplied `sourceId` set. The provider names nothing, mints nothing and identifies nothing. | both closed sets exist only at this point: the computed `factKey` is produced by the projection, and the supplied id set is HazLenz input. This is what makes "the model selects rather than names" true. |

### 1.1 The placement is enforced by the call graph, not by a comment

`runGovernedStagePipeline` fixes the order, and the nomination is a **caller-supplied function typed
to receive `Governed202Request` and nothing else**. That object carries the system prompt, the user
prompt, the schema and the schema-as-sent. It has **no `facts` field, no `factKey`, no
`identitySeal`**. A nominator cannot read a fact identity because it is never handed one, and it is
invoked strictly after `sealFactIdentities` has run (suite T2).

§202 issues no provider call of its own: it imports no provider client, and the suite supplies only
offline stubs.

---

## 2. The authority contract

**Permitted, exhaustively** (`GOVERNED_STAGE_202_PERMITTED_AUTHORITY`, four entries):

1. SELECT one HazLenz-minted fact reference from the closed set enumerated in this request
2. DECLARE one of three determinations from a closed vocabulary
3. SELECT zero or more `sourceId`s from the closed set HazLenz supplied
4. WRITE one bearing sentence, recorded for human review, **which is never an authority**

**Forbidden** (`GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY`, eleven entries — every one of the eleven the
authorization named). Each row pairs the prohibition with a **structural mechanism**; "the prompt says
so" appears nowhere on its own, because §197 established that an instruction the transport does not
enforce is not enforcement.

| forbidden | mechanism | suite |
|---|---|---|
| author `factKey` | no such property on the wire in either direction; the value is never transmitted; the name heads the forbidden list | B10 |
| change fact identity | identity is **sealed** before the request is built; a response scored against any other fact set is refused whole (`IDENTITY_SEAL_MISMATCH`) | S1 |
| invent an evidence source | exact string membership in the supplied set, **at the boundary** and not only in the transport enum | B5, B5a |
| settle a fact | `status`/`settled`/`resolved`/`covered` absent from the wire and refused by name; enrichment never writes status | B13 |
| change priority | absent from the wire, refused by name, and copied unchanged by the enrichment | B14 |
| escalate `UNRESOLVED_SAFETY_STATE` | no field, no vocabulary member and no enrichment path writes a priority or a gate state | B14 |
| change `affectedDecision` | **§202 addition** — named in the forbidden list; §201 left this to `additionalProperties` alone | B11, B19a |
| rewrite branch semantics | `branchA`/`branchB`/`decisionIfA`/`decisionIfB`/`decisionDivergence`/`evidenceSpan`/`whyUnresolved` all named; enrichment copies each unchanged | B12 |
| alter the owed property | `missingFact`/`owedProperty` named; the property travels **into** the request and has no return field | B12, V3 |
| fabricate governed text | **no text-bearing return field exists**; nine text names refused | B8 |
| introduce unsupplied citation authority | §3 below | B15, B16 |

**Effect declaration.** `governed202StageEffect()` is typed to the literal `false` on **twelve** axes
(§201 had eight; §202 adds `factIdentityMayChange`, `affectedDecisionMayChange`,
`branchSemanticsMayChange`, `unresolvedSafetyStateMayBeEscalated`) and the suite asserts every one
(V4).

### 2.1 A real gap in §201 that §202 closes

§201's `BINDING_FORBIDDEN_FIELDS` is `['factKey', ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
...FORBIDDEN_EXPERT_FIELD_NAMES]`. **Neither of those two lists contains `affectedDecision`,
`branchA`, `branchB`, `decisionIfA`, `decisionIfB`, `decisionDivergence`, `evidenceSpan` or
`whyUnresolved`** — the fields that carry the fact's semantics. §201 refused them only via
`additionalProperties: false`.

This is measured, not asserted. Suite case **B19a** runs §201's own boundary on
`{ affectedDecision: 'APPLICABILITY' }` and on `{ sourceText: 'x' }` and both are **admitted as
`BOUND`**; §202's boundary refuses both with `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD`.

§197's finding is why that matters: `maxItems` was a schema keyword the provider did not honour, and
the request was refused entirely. A guarantee that lives only in the transport is not a guarantee on
the hosted path. §202's list carries **55 distinct names**, every one refused at the boundary (V3).

**§201 is not modified.** Its file hash is unchanged and its suite still passes 59/59.

### 2.2 Deterministic verification of the six named invariants

| the authorization requires deterministic code to verify | how, and where |
|---|---|
| the bound fact exists | a `factRef` nobody minted is an **orphan**: counted, dropped, never reattached by proximity (B17) |
| identity was computed before/independently of nomination | `sealFactIdentities` runs before the request is built; the boundary refuses a mismatched or re-ordered fact set (S1); the nominator is structurally never handed a fact (T2). **Stated limit:** the seal is not a clock — see §6 |
| every `sourceId` was supplied | exact string membership, at the boundary, in both transport modes (B5, B5a) |
| `sourceId`/text pairing is exact | **structurally impossible to misstate**: no text field exists on the wire, HazLenz holds the pairing in `indexSuppliedRecords`, and nine invented text-field names are refused and counted (B8) |
| duplicates behave deterministically | five explicit cases in `DUPLICATE_HANDLING_RULES`, **all reject, nothing normalises** (B6) |
| malformed binding fails closed | malformed/duplicate `factKey` aborts minting (S3); malformed or duplicate supplied id, and an empty record text, abort the stage (B7); every other malformation refuses the entry with a countable code |
| abstention/no-binding is representable | three distinct outcomes — `NOT_BOUND`, `CANNOT_DETERMINE`, `NO_DETERMINATION_RETURNED` — and none is a refusal (B9) |

### 2.3 Isolation — the explicit answer the authorization asked for

**Isolation IS part of the contract.** `ENTRY_ISOLATION_IS_PART_OF_THE_CONTRACT = true`. Refusal is
**per entry**: a malformed sibling never corrupts an independent well-formed binding (B17). There are
exactly two exceptions, both stated and both tested (B17a): a response that is not an object, and one
whose `bindings` is not an array. Those refuse whole, because at that point there are no entries to
refuse individually — and every fact then becomes `NO_DETERMINATION_RETURNED`, never `NOT_BOUND`.

---

## 3. Governed text: the conclusion, and what needs a ruling

### 3.1 The engineering finding

**The first-pass v15 citation-production prohibition does NOT automatically apply to a separate
stage.** This is established from repository evidence, not assumed either way.

The restriction is not a property of governed evidence. It is a property of two artifacts that are
**not in this stage's path**:

- **v15's HARD PROHIBITIONS block**, which lives in `EXPERT_SYSTEM_PROMPT` and tells the *first pass*
  that reproducing a number from its own input is the same violation as inventing one. This stage
  does not use `EXPERT_SYSTEM_PROMPT`; its prompt is authored from nothing.
- **§196's projection boundary**, which refuses a citation-shaped string in a *declaration* field.
  This stage emits no declaration and the projection never sees its output.

§198's own comment records why the first pass is shown redacted text, and the reason is **conditional,
not categorical**: *"a first pass shown a citation could only be punished for repeating it."* That
argument is downstream of the output prohibition. Remove the output prohibition and the input
argument does not survive on its own.

The repository also already contains the counter-example: the **verifier** path receives governed text
with citations intact (`V3_3SuppliedGovernedEvidence.text`) and admits faithful reuse under
`decideCitationReuse`. "A stage may see governed text unredacted" needs no new principle here — it
needs an admission rule, and one already exists and is frozen.

### 3.2 The stage-specific citation/output authority contract

Both exposures are implemented and enforced. **The default does not move.**

| | `REDACTED` (default, unchanged from §198/§201) | `SUPPLIED_VERBATIM` (implemented, **gated**) |
|---|---|---|
| `sourceId` shown | exactly | exactly |
| record text shown | through `redactCitationTokens` | verbatim |
| a citation token in `bearingStatement` | **always refuses the entry** — `PROHIBITED_REGULATORY_CITATION` | admitted **only** on exact equality with a token present in a **supplied** record; anything else raises `UNAUTHORISED_REGULATORY_CITATION` |
| authorised set | (none) | **the closed supplied set itself** — strictly narrower than verifier v3.3, which authorises a model-*declared* reliance subset |
| synthesising external authority | impossible | impossible |

The admitted unit is a citation identifier matched by the frozen `CITATION_TOKEN_PATTERN` and nothing
else. Nothing fuzzy: an altered paragraph (`1910.151(d)` where the source says `1910.151(c)`) is a
different citation and is refused (B16). One unauthorised token among authorised ones refuses the
entry (B16, mixed case).

**Verifier v3.3 is not weakened.** §202 is a different admission function on a different stage. It
imports only the pure `decideCitationReuse` helper that v3.3 already used;
`checkVerifierV3_3Output` is not called, wrapped, relaxed or re-implemented anywhere. Its file hash
is unchanged and `test-196` still passes 92/92.

**The exposure mode changes the user prompt only — never the grammar** (B20c), so every figure in §4
holds in both modes.

### 3.3 AUTHORIZATION REQUIRED

> **Activating `governedTextExposure: 'SUPPLIED_VERBATIM'` needs a product-owner ruling. §202 has
> not activated it and cannot activate it by default.**

The engineering question — *does the first-pass rule apply here?* — is answered above, and answered
no. The remaining question is not engineering. Changing what regulatory content is transmitted to a
provider is a **containment-posture** change, and §198's authorization treated citation containment
outside the authorized supplied evidence as a product-owner-governed surface. An engineer may
establish that a rule does not apply; only the product owner may decide to stop applying it.

The gate is built so it cannot be crossed inattentively: `buildGoverned202Request` **throws** unless
`verbatimExposureRuling` names a ruling. It is a string, deliberately, and not a boolean — an
authorization that can be satisfied by `true` is an authorization nobody had to obtain (B16a).

What the product owner is being asked to weigh:

- **for**: redaction is lossy. The stage's whole job is a bearing judgement, and a record whose
  applicability turns on the scope its citation names is harder to judge redacted. `CANNOT_DETERMINE`
  is the measurement that would show this, and it cannot be measured without a hosted run.
- **against**: it puts a forbidden token class back into a model's context on a new path, and the
  containment posture in place today is the one that has been running.
- **cost of deferring**: none. The default is unchanged, the mode is built and proven offline, and
  activating it later is a one-field change with no code to write.

---

## 4. Offline grammar / request measurement

Measured on the request **as actually sent** — after `applyStrictSchemaWrapper` and the §108 Anthropic
keyword strip — and with the **real** `sourceId` shape the §199 executor builds (`OBS-${rowId}`).
§201 found that the frozen §199 diagnosis had used the placeholder `OBS` and was therefore 12
characters short per row; that error is not repeated here. Reproduce with
`npx tsx backend/scripts/test-202-governed-binding-stage.ts`.

```
request                                              enums  alts  objs props  reqs depth  descCh  schemaB   sysB   usrB  totalB
§199 first pass ABSENT   (SF-01, ACCEPTED 10/10)        17    74     9    54    52     9   12865    18679  42824   2188   63691
§199 first pass ABSENT   (SG-01, under §202)            17    74     9    54    52     9   12865    18686  42824   3247   64757
§199 first pass PRESENT  (SG-01, REJECTED)              18    75     9    55    53     9   13154    19124  43677   4285   67086
§202 governed stage      (1 record, CLOSED_ENUM)         3     5     2     5     5     7     914     1538   2894   1642    6074
§202 governed stage      (2 records, CLOSED_ENUM)        3     6     2     5     5     7     914     1560   2894   2151    6605
§202 governed stage      (1 record, PLAIN_STRING)        2     4     2     5     5     7     914     1505   2894   1642    6041
```

`schemaB`/`sysB`/`usrB` are UTF-8 bytes; `totalB` is their sum. `alts` is `enumAlternatives` — the
count that matters most, because an enum of *N* strings is an *N*-way alternation in a compiled
grammar and expands into far more grammar than its serialised length suggests.

**What the table shows.**

- **§199's accepted/rejected pair differs by one enum construct, one property, one required entry
  and 438 schema bytes — 2.3%.** That is the sharpest available demonstration that **size is not the
  metric** (B20b).
- The §202 stage request is **a different size class**, not a shave: 3 enums against 18, 5
  alternatives against 75, 5 properties against 55, 2 object nodes against 9, depth 7 against 9,
  1.5 KB of schema against 19 KB, and **6.1 KB of whole request against 67 KB** (B20).
- Option B composes: `PLAIN_STRING` removes one further enum construct and the boundary is unchanged
  (B5a, B20d).
- A second governed record adds **one** enum alternative and 509 user-prompt bytes. The stage scales
  with the supplied set, gently.

### 4.1 B20 IS DIAGNOSTIC EVIDENCE, NOT PROVIDER ACCEPTANCE

Stated in code (`GRAMMAR_MEASUREMENT_CLAIMS_202`), asserted by the suite (B20a) and repeated here:

- `IS_THE_PROVIDERS_COMPILED_GRAMMAR_METRIC: false`
- `EQUALS_PROVIDER_COMPILED_GRAMMAR_COMPLEXITY: false`
- `PROVES_A_REQUEST_WILL_BE_ACCEPTED: false`
- `IS_EVIDENCE_OF_PROVIDER_ACCEPTANCE: false`
- `KNOWS_THE_THRESHOLD: false`

No offline figure establishes that this request will be accepted. **Only a hosted single-row canary
can**, and none was run. "Far from a limit we cannot see" is a qualitative claim, not a proof.

---

## 5. B1..B20 results, individually

All executed by `npx tsx backend/scripts/test-202-governed-binding-stage.ts`. **54/54 PASS · 0 FAIL.**

| id | property | result | evidence |
|---|---|---|---|
| B1 | zero governed sources → stage NOT invoked | **PASS** | `NO_GOVERNED_EVIDENCE_SUPPLIED`; also `NO_PROJECTED_FACTS_TO_BIND`; ten of §199's twelve rows issue zero extra calls |
| B2 | one governed source | **PASS** | admitted `BOUND`, one bound pair, resolved to the computed `factKey` |
| B3 | multiple governed sources | **PASS** | both ids bind in the order named; both enumerated in the closed set |
| B4 | supplied id accepted structurally | **PASS** | present in the transport enum **and** admitted by the boundary |
| B5 | unsupplied id rejected | **PASS** | unsupplied, respelled (case), and another row's id all `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET` |
| B5a | boundary independent of the transport enum | **PASS** | `PLAIN_STRING` refuses identically |
| B6 | duplicates per an explicit rule | **PASS** | five rules, **all reject**: within-entry (`GOVERNED_SOURCE_ID_DUPLICATED`), duplicate supplied record (abort), two answers for one fact (`FACT_REF_DUPLICATED`), orphan (counted+dropped), duplicate `factKey` (abort) |
| B7 | malformed supplied id aborts | **PASS** | 5/5 malformed ids abort; empty record text aborts too |
| B8 | wrong `sourceId`/text pairing impossible | **PASS** | no text field on the wire; pairing held by HazLenz; **9/9** invented text-field names refused and counted |
| B9 | abstention representable | **PASS** | `NOT_BOUND`, `CANNOT_DETERMINE`, `NO_DETERMINATION_RETURNED` — three distinct outcomes, none a refusal |
| B10 | cannot author `factKey` | **PASS** | no field, value never transmitted, name refused, minted ref resolves HazLenz-side |
| B11 | cannot change `affectedDecision` | **PASS** | §202 addition; refused at the boundary and absent from the wire |
| B12 | cannot rewrite branch semantics | **PASS** | **7/7** semantic fields refused and absent from the wire |
| B13 | cannot settle | **PASS** | 5/5 settlement names refused; `SETTLED` as a determination is `DETERMINATION_NOT_A_MEMBER`; bound fact stays `UNRESOLVED` |
| B14 | cannot escalate priority | **PASS** | name refused, absent from the wire, priority copied unchanged (`OTHER`), two effect axes `false` |
| B15 | citation-shaped text supplied legitimately | **PASS** | in `SUPPLIED_VERBATIM`, `29 CFR 1910.151(c)` — a token the real §199 record contains — is admitted as reproduction; entry `BOUND`, zero codes |
| B16 | citation-shaped text NOT supplied stays outside authority | **PASS** | invented, altered-paragraph and mixed all `UNAUTHORISED_REGULATORY_CITATION`; **and in the default exposure even the supplied token refuses** |
| B16a | the non-default exposure is gated | **PASS** | throws without a ruling reference; default is `REDACTED` |
| B16b | default renders text redacted | **PASS** | no citation token in the default user prompt; present in verbatim; id exact in both |
| B17 | malformed sibling does not corrupt a valid binding — **isolation IS part of the contract** | **PASS** | refused + bound siblings; orphan + bound siblings |
| B17a | the two stated exceptions to isolation | **PASS** | wrong-shape responses refuse whole; every fact becomes undetermined |
| B18 | first-pass hashes unchanged | **PASS** | vNext module, projection module, `expert-prompt.ts` and the ABSENT system prompt all match §199's frozen values |
| B18a | ten ABSENT per-row wire schemas | **PASS** | 10 rows, **0 drifted**, against §199's immutable `PROTOCOL-HASHES.txt` |
| B18b | governed rows are capability-ABSENT under §202 | **PASS** | §199's rejected schema is reproduced (so the comparison is real) and §202 does not send it |
| B18c | v15 governed-standards rendering retained | **PASS** | §202 removes the first-pass id block, not the v15 treatment |
| B19 | existing suites pass | **PASS** | §196 92/92, §198 89/89, §199 43/43, §201 59/59 — see §7 |
| B19 (differential) | §202's boundary agrees with §201's | **PASS** | 17 fixtures, **0 disagreements** in the default exposure |
| B19a | the §202 additions are exactly the four claimed | **PASS** | §201 admits `affectedDecision` and `sourceText`; §202 refuses both |
| B20 | §202's request is materially smaller than §199's rejected one | **PASS** | schema 1,538 B vs 19,124 B; 3 vs 18 enums; 5 vs 75 alternatives; whole request 6,074 B vs 67,086 B |
| B20a | B20 is diagnostic, not acceptance | **PASS** | five claim flags all `false` |

Supporting: P1–P6 (placement, activation, withheld decisions), S1–S3 (identity seal), T1–T5
(pipeline end to end, including a hostile nomination naming five HazLenz-owned fields in one entry
and having **zero** downstream effect), V1–V6 (vocabularies, 55 forbidden names, twelve effect axes,
enrichment, residuals).

---

## 6. Residual limits and what §202 does not decide

**Withheld by the authorization and NOT decided here** (`STAGE_202_WITHHELD_DECISIONS`):

- the **final `OwedFact` representation decision**. `OwedFact` has no field for the owed property.
  This stage is the first consumer that genuinely needs it — deciding whether a record bears on a
  fact is exactly a question about the property. §202 takes it as a nullable caller-supplied string
  from `declaration.missingFact` and degrades without it. **That is a workaround, not a resolution**,
  and folding it into `whyUnresolved` would be composition and therefore invention.
- the **final escalation policy**. §202 never changes priority and never escalates, which preserves
  the question rather than answering it.
- any **§199 semantic verdict**. No fixture asserts any binding is correct.

**Residual limits** (`STAGE_202_RESIDUAL_LIMITS`):

- **Non-atomicity.** Two calls; the second can fail after the first succeeded. A fact whose binding
  call failed occupies the same *state* as a fact nothing bore on, so the outcome vocabulary keeps
  them apart (`NO_DETERMINATION_RETURNED`) and any harness **must** persist that distinction.
- **Context.** The stage sees the evidence span, not the whole observation, by design — so it cannot
  re-open the first pass's analysis or find a second gap. A record whose applicability turns on
  context outside the span is not decidable, and `CANNOT_DETERMINE` exists to measure exactly that.
- **The seal is not a clock.** It proves the scored fact set is the requested fact set, and that no
  `factKey` was introduced after the request. A caller bypassing the pipeline could still reseal.
  It closes the accidental failure and makes the deliberate one a visible act
  (`IDENTITY_SEAL_CLAIMS`).
- **Semantics are unchecked.** An admitted binding is a *well-formed* binding, never a correct one.
- **No acceptance is proven.** Only a hosted single-row canary can establish transport acceptance.
- **Cost.** A second latency and a second failure mode on every governed row; rows with no governed
  evidence pay nothing.

---

## 7. Verification actually executed

| command | scope | result |
|---|---|---|
| `npx tsx backend/scripts/test-202-governed-binding-stage.ts` | §202 suite | **54/54 PASS · 0 FAIL** |
| `npx tsx backend/scripts/test-196-structured-first-pass-owed-facts.ts` | §196 | **92/92 PASS · 0 FAIL** (before and after) |
| `npx tsx backend/scripts/test-198-transport-remediation.ts` | §198 | **89/89 PASS · 0 FAIL** (before and after) |
| `npx tsx backend/scripts/test-199-successor-protocol.ts` | §199 | **43/43 PASS · 0 FAIL** (before and after) |
| `npx tsx backend/scripts/test-201-governed-binding-stage.ts` | §201 | **59/59 PASS · 0 FAIL** |
| `tsc --noEmit` over the three §202 files | **EXPERIMENT_SCOPE_TYPECHECK** | **clean, exit 0** |

The typecheck config was written to a scratchpad path because `backend/tsconfig.*` is
orchestrator-owned. It `extends backend/tsconfig.json` (so `strict: true` applies) with `noEmit`.

**This is `EXPERIMENT_SCOPE_TYPECHECK` and is never a repository-wide check.** The corrected
`backend/scripts` baseline of 181 diagnostics across unrelated legacy scripts is unchanged and was
not re-measured.

**Not executed:** any provider call, any database operation, any repository-wide typecheck, any
hosted validation, any canary, and any semantic evaluation of any kind.

---

## 8. Preservation

Byte-identical before and after §202. No existing file was modified.

| file | sha256 before | sha256 after |
|---|---|---|
| `backend/scripts/lib/expert-first-pass-instruction-vnext.ts` | `a81c63c8…e0e756e` | **identical** |
| `backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts` | `bfe564c2…7fd0b694` | **identical** |
| `backend/scripts/lib/expert-first-pass-owed-fact-projection.ts` | `aab67e0b…0256432c` | **identical** |
| `backend/scripts/lib/expert-verifier-contract-v3-3.ts` | `43497985…1c948fd8` | **identical** |
| `backend/scripts/lib/expert-governed-citation-reuse.ts` | `248d7883…9de1c4ec58` | **identical** |
| `backend/scripts/lib/expert-201-governed-binding-stage.ts` | `e0d3fa47…d1e9735b4` | **identical** |
| `backend/package.json` | `52d3355c…4ddb730d2` | **identical** (its pre-existing working-tree modification is not §202's) |

Full values are in §7 of the agent's completion report and recomputable with `shasum -a 256`.

Nothing under `backend/src/` imports either §202 module (verified by grep: 0 hits). The only importer
of the pipeline is the §202 suite.

---

## 9. Registration the orchestrator must apply

Agents are forbidden from editing `backend/package.json` and every `tsconfig`. Reported, not applied.

**`backend/package.json` scripts:**

```json
"test:202-governed-binding-stage": "ts-node scripts/test-202-governed-binding-stage.ts",
"typecheck:202-experiment-scope": "tsc --noEmit -p tsconfig.scripts-202.json"
```

**`backend/tsconfig.scripts-202.json`** (new; B1's three files only — Agents A, B2 and C will report
their own, and the orchestrator merges):

```jsonc
{
  // §202. SCOPED typecheck. EXPERIMENT_SCOPE_TYPECHECK, never a repository-wide check:
  // `scripts/**` under the project's own options produces 181 diagnostics across unrelated
  // legacy scripts, which would make the gate unusable.
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true, "declaration": false, "incremental": false, "rootDir": "."
  },
  "files": [
    "scripts/lib/expert-202-governed-binding-contract.ts",
    "scripts/lib/expert-202-governed-stage-pipeline.ts",
    "scripts/test-202-governed-binding-stage.ts"
  ]
}
```

Verified clean under exactly these options at the scratchpad path.

**Circuit-breaker registration** (executor work, not a protocol module change): the stage exposes
`GOVERNED_BINDING_202_REQUEST_CONTRACT_ID =
'hazlenz.expert.governed-binding-stage.202.v1.request'`, deliberately distinct from the first pass's
**and** from §201's, so a rejection of this schema can never join another schema's rejection streak.
§198's breaker keys on `requestContractId` and needs no change; the executor must pass the stage's id.

---

## 10. What hosted validation would still be required

Nothing in §202 has been exercised against a provider. Required, in order, and **do not run a cohort
before the canary**:

1. **Transport acceptance.** One governed row, one call. Does the ~1.5 KB strict schema compile?
   *This is the only question the offline measurement cannot answer, and it is the load-bearing one.*
2. **Determination distribution.** Do `BINDS` / `NO_BINDING` / `CANNOT_DETERMINE` all occur, and is
   `NO_BINDING` reachable at all? A stage that always says `BINDS` has the coverage habit §184
   measured.
3. **`CANNOT_DETERMINE` rate.** The direct measurement of whether the minimal evidence packet is too
   thin, and the evidence that would justify widening it — or a `SUPPLIED_VERBATIM` ruling.
4. **Boundary refusal rates, per code**, with the treatment §198 gave the projection's.
5. **Two-call reliability.** "First pass succeeded, binding call failed" must be measured, not
   assumed rare.
6. **Whether a binding is CORRECT.** Semantic, human, and out of scope for every artifact here.
