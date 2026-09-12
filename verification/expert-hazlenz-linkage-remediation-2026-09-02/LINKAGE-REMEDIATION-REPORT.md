# Expert HazLenz — Linkage Contract and Development-Instrument Repair

**§141. ZERO provider calls. ZERO local-model calls. $0.00. No cohort created, none rerun, no
reserved material opened. Nothing committed, pushed, tagged or deployed. The replacement hosted
probe was DESIGNED and VALIDATED but NOT EXECUTED.**

The immutable historical result is untouched: **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**, cohort
`hazlenz.expert.formal.cohort.65.v1+d7c8f9c15f0a`, `FORMAL_COHORT_SPENT = TRUE`,
`PROVIDER_INVOCATION_COUNT = 195` before and after. §140's probe evidence is likewise untouched, and
its disclosed limitations stand exactly as written.

---

## 1. Terminal

```
EXPERT_HAZLENZ_LINKAGE_CONTRACT_REMEDIATION_COMPLETE — HOSTED_LINKAGE_PROBE_AUTHORIZATION_REQUIRED
```

Explicit linkage is **structurally possible** on the current contract — §2 proves it three ways — so
the `..._BLOCKED — EXPERT_OUTPUT_CONTRACT_REDESIGN_DECISION_REQUIRED` terminal does not apply. All
protected suites are green, so the regression terminal does not apply either.

---

## 2. Structural feasibility of `relatesToCandidateKey` — the first question, answered first

The authorization required this to be settled before anything was built, and to be answered honestly
if the answer was "impossible". **It is possible, and no contract redesign is needed.** Three
independent lines of evidence:

1. **The key is PRODUCER-AUTHORED, not system-generated.** `candidateKey` is declared in the wire
   schema as *"Short stable id, unique within this response"* — the model invents it. There is no
   post-generation identity assignment anywhere in the pipeline, so there is no window in which the
   model could fail to know a key it chose itself. `bindWireAnalysis` resolves quote offsets and
   touches no key.

2. **Candidates are emitted BEFORE clarifications.** `expertHazardCandidates` precedes
   `decisionCriticalClarifications` in wire-schema property order, and structured decoding emits
   properties in schema order — a property this codebase already relies on and has measured, which is
   why §105 moved `outcome` last. By the time the model authors a clarification, the candidate list
   and its keys are already written. Asserted at `A.13`.

3. **It has already happened, on live traffic.** §140's DP-B2 emitted candidates `loto-1` and
   `hydraulic-1`, then emitted a clarification carrying `relatesToCandidateKey: "loto-1"`, which
   resolves. The mechanism is not theoretical.

**No identity mechanism was added, and none is justified by this problem.** Deterministic semantic
IDs were considered and rejected: the linkage problem does not need them (the model can copy a key it
just wrote), and adopting them here would smuggle in the change §139 refused as unsupported for M14.
`M14.1` fails the build if `candidateKey` ever stops being a producer-authored free-form id.

---

## 3. The finding that reframes §140: the measurement was wrong, not the model

§140 reported **3 linkage opportunities, 1 populated, `LINKAGE_PARTIAL`**, and recorded the
opportunity definition as *"a clarification emitted on a call that also emitted at least one
candidate — an UPPER bound, not a measurement."* That caveat was correct and it was not enough.

Re-read against the semantics now specified, **all three model decisions were right**:

| §140 row | candidates emitted | question | correct call under §141 | model did |
|---|---|---|---|---|
| **DP-B2** | `loto-1` (ACTIVE), `hydraulic-1` (ACTIVE) | was the drive isolated beyond the local OFF switch? — determines whether `loto-1` stays ACTIVE | **REQUIRED** | **linked `loto-1`** ✓ |
| **DP-B3** | `atm-1` (ACTIVE), `train-1` (ACTIVE) | is the vault classified permit-required? — bears on the unsampled atmosphere AND the missing attendant | **FORBIDDEN (ambiguous — two candidates)** | **withheld** ✓ |
| **DP-B4** | `cand-noise` (INSUFFICIENT_EVIDENCE), `cand-confined-enclosed` (ACTIVE) | is an engineering control required? — concerns the silica exposure the *deterministic* layer owns, not either Expert candidate | **FORBIDDEN (different hazard)** | **withheld** ✓ |

Required-linkage population was therefore **1 of 1**, not 1 of 3. Re-scored through the repaired
measure the §140 data classifies **`LINKAGE_READY`** — asserted at `D.11`/`D.12`, which fail if the
old denominator is ever reintroduced.

**This is a third development-instrument defect of the same class as the two §140 already
disclosed**, and it is the most consequential, because it produced a misleading verdict about model
behaviour rather than a misleading count. All three share one shape: **a scope error in a measurement
is indistinguishable from a defect in the thing measured.** That sentence is now the header comment
of `scripts/lib/expert-probe-measures.ts`.

**What this does NOT change.** `LINKAGE_PARTIAL` was the honest classification *on the definition
then in force*, and the §140 report's own §4.4 said the feature was "unexercised, not proven". That
remains true and is the reason this operation exists: **arbitration still fired zero times on hosted
evidence**, and no re-reading can manufacture an event that did not occur.

---

## 4. Linkage semantics, as specified

Stated in three places that must agree — the TypeScript contract, the system prompt, and the
per-field wire-schema description — and asserted in all three (`A.2`–`A.12`).

**REQUIRED.** The answer directly **determines, contradicts, qualifies or resolves ONE specific
candidate already emitted in this same analysis**: whether that hazard exists at all, whether the
condition is current, whether a control already in place changes *that* candidate's status, or
whether the missing fact decides if *that* candidate stays `ACTIVE`.

**ALLOWED.** The question materially refines exactly one candidate without deciding its existence or
status.

**FORBIDDEN.** Same observation; same broad hazard family; general PPE, procedure or documentation
follow-up; a different hazard; or **any relationship that is ambiguous** — if two or more candidates
could be meant there is no unique referent and the field must be omitted.

A key must name a candidate this analysis actually emitted. **Omitting the field is always legal**,
and the schema says so, because a field that reads as mandatory is how "link everything" gets learned.

**The obvious wrong fix was refused explicitly.** Making every clarification attach to a candidate
would rebuild the candidate-dependency the blueprint forbids (a clarification must never *require* a
candidate — blueprint 39.5.1, protected by `expert-grounding-contract` A.1–A.4) and would hand
arbitration a stream of guesses to act on. The §141 prompt change does **not** ask the model to link
more often; it says when linking is wrong.

---

## 5. Implementation

| file | change |
|---|---|
| `expert-contract.types.ts` | the three cases documented on `relatesToCandidateKey`, plus the statement that REQUIRED-ness is semantic and cannot be decided at the boundary |
| `expert-prompt.ts` | `EXPERT_PROMPT_VERSION` → **`hazlenz.expert.prompt.v8`**; the v7 one-line linkage instruction replaced with the three cases in the system prompt and in the schema field description |
| `expert-normalization.ts` | new item-scoped reason `CLARIFICATION_LINK_UNRESOLVED`; link resolution stage before arbitration |
| `scripts/lib/expert-probe-measures.ts` | **new** — citation by producer, coverage by union, linkage by answer key |
| `scripts/lib/expert-probe-identity.ts` | **new** — write-once pre-spend identity |
| `fixtures/hosted-linkage-probe-v2.ts` | **new** — the replacement probe manifest, not executed |
| `scripts/test-expert-linkage-contract.ts` | **new**, 68 assertions |
| `scripts/test-expert-linkage-probe-fixtures.ts` | **new**, 37 assertions |

`EXPERT_ANALYSIS_CONTRACT_VERSION` stays **`analysis.v2`**: no field added or removed, no enum member
moved, no `required` entry changed. An analysis omitting the optional field validates exactly as
before.

### 5.1 Link resolution — non-destructive by design

A declared key that names no emitted candidate is now **stripped to `null`, the question is KEPT, and
the break is recorded** with collection and index. v7 never checked: an invented key simply failed to
match and the stage abstained — the right outcome for the wrong reason, with a hallucinated
identifier and a deliberate non-link indistinguishable in both the output and the issue list.

The direction follows this file's own settled rule. A broken back-reference is a defect in the
question's *metadata*, not evidence the question is wrong, so dropping the clarification would delete
a possibly sound question over a bad name. Honouring the key would let a hallucinated identifier reach
arbitration — exactly the guessing §138 measured the cost of. `B.1`–`B.9`, `C.5`, `C.5b`.

### 5.2 Arbitration — deliberately narrow

Unchanged in trigger and now operating on **resolved** links only. It fires on `HAZARD_EXISTENCE`
against the asker's own `ACTIVE` candidate, and on nothing else.

The system prompt's hard prohibition names exactly that pair. `REQUIRED_CONTROL` against an `ACTIVE`
candidate is **not** a contradiction — "the hazard is live, was the control applied?" is coherent, and
§140's DP-B2 is precisely that shape, correctly linked and correctly retained. **Extending the trigger
to `EXPOSURE` was considered and refused**: no evidence supports it, and a wider trigger would suppress
real questions to make a metric look better. `C.10` asserts the refusal so a future widening must be
argued rather than slipped in.

The candidate is never deleted. `C.1b`, `C.8b`.

---

## 6. Arbitration proof — the eight enumerated cases

§140 could not prove arbitration works, because no contradiction ever occurred. **A contradiction
cannot be commissioned**: asking whether a hazard exists while asserting it `ACTIVE` is a model
*error*, and a fixture cannot instruct one. So arbitration is proven where it can be —
deterministically. Every fixture in the v2 manifest carries `contradictionIsAModelError: true` so no
future report can claim a contradiction was "expected" (`C.7`).

| # | case | assertion | result |
|---|---|---|---|
| 1 | valid linked existence contradiction | `C.1` clarification removed, `C.1b` candidate kept, `C.1c` **event recorded with index** | **ARBITRATION FIRES** |
| 2 | valid linked control-status question | `C.2` retained with link intact, `C.2b` no event | retained |
| 3 | same row, unrelated clarification | `C.3` retained | retained |
| 4 | same family, ambiguous, unlinked | `C.4` retained and unlinked, `C.4b` stage abstains | retained |
| 5 | invalid candidate key | `C.5` link stripped, question kept, break recorded; `C.5b` never reaches arbitration | strip + record |
| 6 | missing linkage when required | `C.6` **not** a production rejection; `C.6b` detected by development validation against the answer key | dev-detectable |
| 7 | valid linked non-contradictory | `C.7` retained, link intact | retained |
| 8 | two candidates, one family | `C.8` only the explicitly linked question is arbitrated; `C.8b` both candidates survive | no guessing |

Plus `C.9` (non-`ACTIVE` candidate: a linked existence question is legitimate and survives) and
`C.10` (the `EXPOSURE` refusal).

---

## 7. DP-B4 — fixture corrected, model not touched

§140 recorded the model declining DP-B4's authored gap and stating why, unprompted:

> *"The exact duration the worker has already been exposed to dust prior to arrival is unrecorded,
> which affects cumulative exposure but does not change the current control decision."*

That is the counterfactual test applied correctly. Dry breaking of concrete in an enclosed stairwell
with no water feed and no vacuum needs an engineering control whether the worker has been at it for
fifteen minutes or four hours, so the two answers do **not** lead to different current outcomes. **The
authored gap failed the product contract the fixture existed to exercise.**

Option B (replace the gap) was taken over Option A (reclassify `NOT_OWED`), because the fixture's
diagnostic purpose — a TRUE-GAP control on a magnitude — is still needed and is still coverable.

| | |
|---|---|
| **old truth** | gap = *"how long the worker has been performing the dry breaking task in the enclosed stairwell"*, `HAZARD_SEVERITY` |
| **new truth** (`LP-B3`) | gap = *"the measured noise exposure level for this task, which the site already has on record but which was not available at the station"*, `HAZARD_SEVERITY` |
| **why the old was invalid** | the two branches converge on the same current action, so the v7/v8 counterfactual test correctly refuses the question |
| **why the new is valid** | below the action level, hearing protection is discretionary and the step is to file the result; at or above it, a hearing conservation programme and protection are owed **now**, for the operator *and* the two employees within ten feet. Different actions today. The missing fact is concrete and already exists — a specific measurement taken last month — rather than an open-ended "how long". |

**The model was not changed to satisfy DP-B4.** Asserted at `B.6`/`B.7`. v1 keeps its original
authored gap byte-for-byte (`B.2`), so §140's executed evidence is not rewritten.

---

## 8. DP-B1 — `DP_B1_CAUSE = UNKNOWN`, and the unidentifiability is demonstrated

The persisted record was inspected for exactly this question. It contains:

```
layerStatus      PRESENT          issues           []
failureKind      null             mergeViolations  []
attempts         [(0, ok, no failure, no retry)]
outcome          ANALYZED         clarifications   []
uncertainty      {statements: []}
merged.expertAdvisory.clarifications  []
```

**Positively excluded, from evidence rather than assumption:**

- **schema routing loss** — `decisionCriticalClarifications` is a required array; other rows in the
  same run populated it.
- **validation loss** and **normalization loss** — `issues: []`. Every item-level rejection in this
  boundary leaves a coded, indexed issue: `CLARIFICATION_MALFORMED`,
  `CLARIFICATION_NOT_DECISION_CRITICAL`, `DUPLICATE_CLARIFICATION_ID`,
  `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE`. None is present, **so the wire array was empty as it
  left the model.**
- **merge loss** — `mergeViolations: []`, and the merged advisory block matches the validated
  analysis exactly.
- **provider/retry loss** — one attempt, successful, no retry, no suppression.

**Not distinguishable:** *model omission* (never formed the question) from *prompt licensing
ambiguity* (formed it and declined it under the counterfactual test). `uncertainty.statements` is
empty, so the model left no trace either way — and unlike DP-B4, where the reasoning was recorded,
here there is nothing to read.

**`DP_B1_CAUSE = UNKNOWN` is the final classification.** It is not narrowed further and it is not
rationalised into a finding. The prompt was **not** tuned to DP-B1.

`LP-B4` replaces it: the same contract property (`EXPOSURE`, whether anyone is exposed) on entirely
different surface facts — a crane runway walkway with its handrail removed for a three-day repair.
Its branches diverge on the current action: control access and provide an alternative route now,
versus proceed as planned. `B.8`–`B.10` assert the cause is recorded as UNKNOWN, the property is
preserved, and the surface facts do not overlap. **The rule is tested; the row is not taught.**

---

## 9. Development-measurement repair

All three measures now live in `scripts/lib/expert-probe-measures.ts`, exercised by the same code
path the probe will use, with self-tests that **fail under each original buggy calculation**.

### 9.1 Citation, counted by producer

`INPUT_CITATION_SHAPED_COUNT`, `EXPERT_OUTPUT_CITATION_SHAPED_COUNT`, `ACCEPTED_CITATION_COUNT`,
`REJECTED_CITATION_COUNT`, `MERGED_CITATION_COUNT`, plus `GOVERNED_AUTHORITY_CITATION_COUNT` and
`SUPPLIED_RECORD_CITATION_COUNT` as **context, never defects**.

Governed input records, deterministic input and prompt/system/schema text are never counted as Expert
output. `D.4` reproduces the §140 scan verbatim, shows it returns **1** on a clean analysis beside a
citation-bearing governed block, and asserts the repaired measure returns **0**.

`D.5` closes a second, subtler hole: a citation the boundary **refused** is still Expert output.
Counting only survivors would report a working fail-closed boundary as "the model emitted nothing",
hiding the behaviour the probe exists to observe.

### 9.2 Coverage, over `deterministic ∪ acceptedExpert`

Deterministic coverage, additive Expert coverage, combined coverage and truth misses after union are
reported separately. **Expert is never required to repeat a deterministic hazard.** `D.7` reproduces
the §140 calculation, shows it reports **2** misses on a three-row case, and asserts the repaired
measure reports **1** — the only family covered by neither layer.

### 9.3 Linkage, against the answer key

`requiredLinkOpportunities` counts clarifications on rows the **fixture** marks `REQUIRED`.
`FORBIDDEN` rows make an emitted link a counted violation. `D.12` reproduces the §140 denominator
(3 opportunities, 0.333) and asserts the repaired measure scores the same data **1.0**.

`classifyLinkage` returns `LINKAGE_NOT_WORKING` when there are **zero** required opportunities —
untested, with the conservative label, which is exactly what §140 was (`D.15`).

---

## 10. Write-once identity — proven

`scripts/lib/expert-probe-identity.ts`. Every field is required: probe-script SHA, fixture-manifest
SHA, system-prompt SHA, wire-schema SHA, normalization SHA, contract SHA, provider/model identity,
budget configuration. `isFormalEvaluation` is typed as literal `false` (`E.7`).

Writing uses `openSync(path, 'wx')` plus `fsync`, so the existence check and the create are atomic and
the bytes are on disk before the first request. **There is deliberately no `force`, no `overwrite` and
no environment escape** — every one of those is the flag a future operation reaches for at 2am.

The self-test (`E.1`–`E.6`) creates an identity, attempts a second write with **different content**,
and asserts: the second write is refused (`E.2`), with a typed error (`E.3`), **the bytes are
unchanged** (`E.4`), and the original content — including the probe-script hash the §140 pass lost —
survives (`E.5`). A re-measurement writes a separate file, repeatably, and still cannot touch the
original (`E.6`).

**§140's identity artifact is NOT retroactively repaired.** Its recorded probe-script hash remains the
post-correction one and its disclosed limitation stands. Reconstructing a pre-spend hash after the
fact would manufacture the very evidence this module exists to protect.

---

## 11. Verification actually executed

**Zero provider calls. Zero local-model calls. $0.00.** TypeScript project typecheck clean.

| suite | §140 baseline | §141 | detail |
|---|---|---|---|
| `hazlenz-core` | PASS | **PASS** | Overall Result: PASS |
| `expert-contract-foundation` | PASS | **PASS** | 56 passed, 0 failed |
| `expert-authority-merge` | PASS | **PASS** | 51 passed, 0 failed |
| `expert-provider-failure` | PASS | **PASS** | 131 passed, 0 failed |
| `expert-nocall-harness` | PASS | **PASS** | 141 passed, 0 failed |
| `expert-routing-contract` | PASS | **PASS** | 67 passed, 0 failed |
| `expert-grounding-contract` | PASS | **PASS** | 41 passed, 0 failed |
| `expert-projection-equivalence` | PASS | **PASS** | 90 passed, 0 failed |
| `expert-anthropic-adapter-repair` | PASS | **PASS** | 30 passed, 0 failed |
| `expert-execution-budget` | PASS | **PASS** | 66 passed, 0 failed |
| `expert-cohort-instrument` | PASS | **PASS** | 155 passed, 0 failed |
| `expert-remediation-contract` | PASS | **PASS** | 92 passed, 0 failed |
| `hazlenz-evidence-boundary` | PASS | **PASS** | {"passed":true,"assertions":13} |
| `evidence-foundation` | PASS | **PASS** | {"passed":true,"assertions":35} |
| `guided-finding-response` | PASS | **PASS** | {"passed":true,"assertions":28} |
| `risk-policy` | PASS | **PASS** | Risk policy: 10/10 checks passed |
| `l31-reasoning-contract` | PASS | **PASS** | 49 passed, 0 failed |
| `l32-semantic-contract` | PASS | **PASS** | L3-2 semantic contract suite: 191 passed, 0 failed |
| `l32b-binder-precision` | PASS | **PASS** | L3-2b binder precision suite: 105 passed, 0 failed |
| `l32c-gate-polarity` | PASS | **PASS** | L3-2c gate polarity suite: 86 passed, 0 failed |
| `l32d-clarification-scope` | PASS | **PASS** | L3-2d clarification scope suite: 71 passed, 0 failed |
| `l32e-syntactic-role` | PASS | **PASS** | L3-2e syntactic role suite: 82 passed, 0 failed |
| `l32f-predicate-scope` | PASS | **PASS** | L3-2f predicate scope suite: 77 passed, 0 failed |
| `l32g-state-separation` | PASS | **PASS** | L3-2g state separation + binder residual: 57 assertions passed, 0 failed |
| `l32i-clarification-carrier` | PASS | **PASS** | L3-2i candidate-independent clarification carrier: 61 assertions passed, 0 failed |
| `l32j-carrier-activation` | PASS | **PASS** | L3-2j shipped carrier activation (measured and refused): 37 assertions passed, 0 failed |
| `hazlenz-understanding` | PASS | **PASS** | HazLenz hazard understanding benchmark: 25/25 passed. |
| `hazlenz-precision` | PASS | **PASS** | PASS HazLenz decomposition precision/recall gate |
| `hazlenz-level1-recall` | PASS | **PASS** | PASS HazLenz Level-1 recall gate (17 checks) |
| `hazlenz-actionable-coverage` | PASS | **PASS** | PASS HazLenz actionable-coverage gate (17 checks) |
| `hazlenz-guarding-applicability` | PASS | **PASS** | HazLenz machine-guarding applicability precedence regression: all invariants passed, 0 failed |
| `expert-linkage-contract` | — | **PASS** | 68 passed, 0 failed |
| `expert-linkage-probe-fixtures` | — | **PASS** | 37 passed, 0 failed |

**31 of 31 previously protected suites PASS, and the result set is identical line for line to the §140 post-spend baseline.** Two new suites add 105 assertions. Total 33 suites, 0 failures.

**NOT RUN, and not claimed as passing:** `hazlenz-clarification-gauntlet` (requires a database; none
was touched) and `hazlenz-authentic-reasoning` (integration test against a live local endpoint; not
started). Neither exercises anything this operation changed.

**Four protected assertions were re-anchored from `v7` to `v8`, disclosed in full.** None was
weakened, and each carries an in-file comment. The fourth was found the honest way: the first Phase-8
run came back with **one failure**, `expert-projection-equivalence` F.2, which a grep for the version
literal had missed. It is recorded here as a caught regression rather than as a clean first pass.

1. `test-expert-routing-contract.ts` **A.2** — the literal has now moved v6 → v7 → v8, each time
   because a separately authorized operation revised the prompt. The property it protects (a recorded
   probe names the version it ran under) is unchanged, and **A.2b–A.2e still pin the content
   hashes**, which is what a label cannot do.
2. `test-expert-cohort-instrument.ts` **C.17** — same convention; this file's operation still touches
   nothing in the prompt, and C.18 still asserts the prompt knows nothing about the evaluation
   apparatus.
3. `test-expert-remediation-contract.ts` **H (identity)** — what H asserts is that identity *carries*
   the label and the two content hashes and that a mismatch is detected, none of which depends on
   which label is current.
4. `test-expert-projection-equivalence.ts` **F.2** — re-anchored on exactly the reasoning its own
   in-file comment already gave for the v6 → v7 move: pinning an old literal would make the test
   assert *"no one may ever change the prompt again for any reason"*, which is not the property it
   protects. **F.2b/F.2c are unchanged** and still assert the real projection property directly — the
   disposition block lives in the per-request input and is rendered from supplied dispositions.

Contract identity after this operation:

```
EXPERT_PROMPT_VERSION            hazlenz.expert.prompt.v8
EXPERT_ANALYSIS_CONTRACT_VERSION hazlenz.expert.analysis.v2   (unchanged)
systemPromptSha256               7f143cb69b36a8969b588b0d104ca795b74776e55f4a6a53aed68eba0c1208fb
wireSchemaSha256                 614311db7a5e2c98a0f787a23b2d9f733431b13c72e5b9be592053014844773f
```

§140 ran under `d0506f67…` / `65d6fe4c…`. **The hashes have moved, which is the point of having
them** — the next probe's evidence is attributable to v8 and cannot be confused with §140's.

---

## 12. The replacement hosted probe — designed, NOT executed

`fixtures/hosted-linkage-probe-v2.ts`. **16 rows, one arm, not run.** Executing it requires its own
authorization. v1 stays byte-identical because it is the instrument that produced §140's evidence
(`B.1`–`B.3`).

| role | rows | note |
|---|---|---|
| NO-GAP negative controls | `LP-A1`–`LP-A4` | carried from v1 unchanged; all four were silent in §140, so the next probe is directly comparable |
| TRUE-GAP positive controls | `LP-B1`–`LP-B4` | B1/B2 carried (both recovered exactly); **B3 replaces DP-B4**; **B4 replaces DP-B1**. Four distinct `affectedDecision` values retained |
| linkage REQUIRED | `LP-B1`, `LP-L1`, `LP-L2`, `LP-L3` | **§140 created ZERO such opportunities**, which is why linkage came back unexercised |
| valid linked non-contradictory | `LP-L3` | existence genuinely open → candidate should be `INSUFFICIENT_EVIDENCE` and a linked existence question must be **retained**. If arbitration fires here, the trigger is wrong |
| ambiguous, must NOT link | `LP-L4` | two exposed drives on one line; a permit question applies equally to both. **A link here is a counted violation** — this row catches a model, or a prompt revision, that has learned to always link |
| governed evidence | `LP-G1` relevant, `LP-G2` unrelated, `LP-G3` none, `LP-G4` narrower | all carried from v1, all proven |
| citation adversarial | `LP-G2` | DRAFT electrical + APPROVED welding-fume records, neither bearing on a floor opening, both citation-bearing before redaction |

**On the "at least 2 expected contradictions that should trigger arbitration" requirement.** `LP-L1`
and `LP-L2` are the rows where an existence/status contradiction is most likely to surface if the
model still makes that error. But a contradiction **is** a model error, and this report will not
claim a fixture can commission one — that is why every row carries `contradictionIsAModelError: true`
and why arbitration is proven deterministically in §6 instead. If the next probe records zero
arbitration events again, that is a **good product outcome**, not a failed probe, and it must be
reported as such.

**Frozen advancement criteria** (in the manifest, `NEXT_PROBE_ADVANCEMENT_CRITERIA`, so they cannot be
chosen after seeing the result — `A.13`): NO-GAP ≥3/4 silent; TRUE-GAP ≥3/4 semantically correct;
required-linkage ≥3/4 valid; arbitration fires on every correctly linked contradiction that occurs;
0 invalid linkages accepted; all unrelated/no-record controls abstain; ≥1 grounded positive; 0
unsupported accepted citations; no material regression in combined coverage versus the §140 baseline
of **1 truth-present family covered by neither layer, of 16 rows**. **Development criteria, not formal
thresholds.**

Validated at $0.00 by `test:expert-linkage-probe-fixtures` (37 assertions): structure, role minimums,
one gap per TRUE-GAP row, four distinct decision values, v1 untouched, both supersessions disclosed
with old truth / new truth / why, no truth-key leak into any built prompt, no citation-shaped text in
any built prompt while redaction is exercised on 4 records.

---

## 13. Remaining unknowns

1. **Arbitration has still never fired on hosted evidence.** §6 proves it fires deterministically.
   Whether the model ever produces the contradiction is unknown, and a probe cannot force one.
2. **`DP_B1_CAUSE = UNKNOWN`** — model omission versus a correct counterfactual refusal, permanently
   indistinguishable for that row. `LP-B4` tests the property; it does not answer the question.
3. **Whether the v8 specification changes model behaviour at all.** Everything here is verified
   deterministically. No hosted evidence exists that required links are declared more reliably, or
   that ambiguous links stay absent, under v8. Those are model properties.
4. **Whether `LP-L4` is genuinely ambiguous to the model.** It is ambiguous by construction and by
   the authored key, but "would a competent reader see one referent or two" is exactly the judgement
   the fixture is testing, and a fixture cannot validate its own premise.
5. **`crossHazardInsights` precision** — §140's residual concern (13 items on 16 rows, 5 of 13 using
   `OTHER`, one forced vocabulary member) is **untouched by this operation** and remains open.
6. **A fourth measurement defect of the same class could still be present.** Three have now been
   found, two after spending. The self-tests close the three known ones and nothing more.
7. **M14 remains causally unresolved.**

---

## 14. Confinement

```
PROVIDER_INVOCATION_COUNT   195 before, 195 after     provider calls 0      local-model calls 0
cost this operation         $0.00
frozen formal artifacts     BYTE-IDENTICAL (COHORT-MANIFEST, EVALUATION-RESULT, ADJUDICATIONS)
§140 probe artifacts        BYTE-IDENTICAL (RUN-RECORDS, PRE-SPEND-IDENTITY, RESULTS-SUMMARY, REPORT)
spent cohort                unmodified    cohort rerun NO    new cohort NO
reserved material           not opened
scorer formulas             UNCHANGED     thresholds UNCHANGED    formal truth UNCHANGED
M14                         NO implementation change, NO repair attempted, NO repair claimed
hosted probe                DESIGNED, NOT EXECUTED
production / database / customer activation          NONE
commit / push / tag / deploy                         NONE
```

**M14_REMEDIATION_STATUS = NOT_ATTEMPTED.** No canonicalization, no deterministic semantic id, no
permutation-specific instruction. `candidateKey` remains producer-authored and free-form. Guarded by
`M14.1`–`M14.4`, and by §139's own `M14.1`/`M14.2`, all green.

No formal acceptance is declared. The formal evaluation remains **FORMAL_EVALUATION_FAIL — NOT
ACCEPTED**.
