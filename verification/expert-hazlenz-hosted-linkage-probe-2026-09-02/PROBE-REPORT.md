# Expert HazLenz — Hosted Linkage Validation Probe

**§142. ONE bounded hosted DEVELOPMENT probe against the v8 linkage contract. 16 logical calls, 16
provider requests, 0 retries, $0.591308 of a $2.08 enforced ceiling.**

**Not a formal evaluation, not a formal-cohort rerun, not a new formal cohort, not an acceptance run,
not an M14 experiment, not a threshold-tuning exercise.** No frozen scorer ran. No formal measure was
computed. No formal gate status is claimed.

The historical result is untouched: **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**,
`FORMAL_COHORT_SPENT = TRUE`, historical `PROVIDER_INVOCATION_COUNT = 195` before and after. No
reserved material was opened. No spent-cohort row was read, reused or mimicked.

---

## 1. Terminal

```
EXPERT_HAZLENZ_HOSTED_LINKAGE_PROBE_FAILED — LINKAGE_CONTRACT_REVISION_REQUIRED
```

**This terminal is chosen against the grain of the headline result, and the reasoning is stated
plainly so it can be argued with.**

Eleven of twelve advancement criteria are met, and the question the probe existed to answer came back
strongly: **required-linkage population is 4 of 4, with 0 invalid keys and 0 surviving
contradictions.** That is the opposite of "materially under-populated or invalid".

But criterion 4 — *0 accepted FORBIDDEN links* — is **not met**: one link was accepted on a row the
manifest labels `FORBIDDEN`. `PASSED` requires all twelve, so `PASSED` is unavailable. Of the four
failure terminals, the one that names the thing actually needing work is
`LINKAGE_CONTRACT_REVISION_REQUIRED`, because §7 shows the cause is **the wording of the FORBIDDEN
clause I authored in §141, plus a blanket FORBIDDEN label applied to ten rows without a
per-row judgement** — not a model defect.

**What this terminal does NOT mean.** It does not mean the model under-populated required links; it
populated all four. It does not mean it invented or mis-resolved a key; there were none. It does not
mean clarification, grounding or citation behaviour regressed; all three improved or held.

---

## 2. Confinement

```
historical PROVIDER_INVOCATION_COUNT   195 before, 195 after — this probe does not touch it
provider requests this operation       16 (16 logical calls, 1 arm, 0 retries, 0 suppressed)
spend                                  $0.591308     enforced ceiling $2.08     authorized $3.00
tokens                                 200,974 in / 18,936 out
latency                                6,894–21,181 ms per call
model identity                         anthropic / claude-sonnet-5, bound pre-spend, verified per response
prompt                                 hazlenz.expert.prompt.v8
analysis contract                      hazlenz.expert.analysis.v2
system-prompt SHA-256                  7f143cb69b36a8969b588b0d104ca795b74776e55f4a6a53aed68eba0c1208fb
wire-schema  SHA-256                   614311db7a5e2c98a0f787a23b2d9f733431b13c72e5b9be592053014844773f
normalization SHA-256                  a12b478d80111ac570d1f7660f7f119dc86def251045520ee5fa17522dca1d9b
contract-types SHA-256                 d05f2f7c1abb1997fcb1b8240d256a81a05f9f0893ed21ff4618b57291a271ea
fixture-manifest SHA-256               348113c7e9594d60da37bf718c4a39d49048ec1c8ae61cca4ed046b6b96d1580
reserved material                      NOT OPENED
spent formal cohort                    NOT read, NOT reused, NOT mimicked
new formal cohort                      NONE
M14_REMEDIATION_STATUS                 NOT_ATTEMPTED
scorer / formal truth / thresholds     UNCHANGED
production / database / customer       NONE
commit / push / tag / deploy           NONE
```

Spend ceiling is the lower of the two allowed: 20 requests at the frozen worst case
(`$0.104`) is `$2.08`, below the authorized `$3.00`. Enforcement is prospective, checked before each
request, so neither ceiling was reachable.

---

## 3. Phase 0 — pre-spend gate

**28 of 28 checks passed at $0.00** before a provider object was constructed, plus a 29th proved on
the live artifact after it (H.3). Protected suites before spend: **33 of 33 PASS**. TypeScript clean.

| group | proved |
|---|---|
| A.1–A.11 | 16 rows, `validateCohortRow` 0 problems, all `LP-*`; ≥4 NO-GAP, ≥4 TRUE-GAP, ≥4 REQUIRED-linkage, ≥4 FORBIDDEN-linkage, governed quartet, citation-adversarial; one gap per TRUE-GAP row; **no fixture commissions a contradiction** |
| B.1–B.2 | no formal-cohort, reserved-material **or prior-probe fixture** path imported; rows from one v2 module |
| C.1–C.4 | model exactly `claude-sonnet-5`, vendor host, thinking disabled, credential present (never read, logged or persisted) |
| D.1–D.3 | 16 requests built, 0 invocations; **one arm only**; prompt is v8 |
| E.1 | no truth-key-only string in any of the 16 requests |
| F.1–F.3 | no citation-shaped text in the system prompt or any of the 16 user prompts, while **5 supplied record fields carried one pre-render** — redaction exercised, not assumed |
| G.1–G.2 | ceilings consistent and priced from the frozen cost model |
| H.1–H.2 | store empty; **`PRE-SPEND-IDENTITY.json` did not already exist** |
| **H.3** | **a second write to the LIVE identity artifact was refused with the bytes unchanged** — the §141 guard proved on the file it protects, not only in a unit test |

### 3.1 A defect in my own gate, found and fixed before spend

The first version of this script wrote `PRE-SPEND-IDENTITY.json` **before** honouring
`PROBE_DRY_RUN`, so the $0.00 rehearsal consumed the one write the real run needed — the real run
would then have been refused by its own guard. The identity describes *the moment of spend*, so it is
now written only on a run that is about to spend, and the rehearsal stops before it. The artifact the
rehearsal had written (`06c6d792…`, describing no spend) was deleted before the real run; the
identity in evidence (`09a62b99…`) was written by the run that actually issued the requests.

---

## 4. Phase 3 — persistence

```
store                    RUN-RECORDS.jsonl (append-only, fsync per record)
records on disk          16          parse problems 0        completeness problems 0
sha256                   7843260ca9cabbba471fa3aed4d4e8a2c0e3b048031e48d8ea03932773cf1d24
mid-run read-back        LP-A1 read back FROM DISK with 15 calls still outstanding — provenBeforeExit = true
```

Every call persists fixture id, normalized input, prompt/schema hashes, validated `ExpertAnalysis`,
merged output, candidate keys, clarification linkage values, arbitration events, validation issues,
provider attempts, usage, latency, retries and model identity.

---

## 5. Phase 4 — linkage

**Measured against the AUTHORED per-row expectation, never collection co-occurrence.** A clarification
that was never asked is a RETENTION event, not a linkage failure, and is counted once.

| readout | value |
|---|---|
| `REQUIRED_LINKAGE_OPPORTUNITIES` | **4** |
| `REQUIRED_LINKAGE_AUTHORED_ROWS` | 4 |
| `REQUIRED_LINKAGE_POPULATED` | **4** |
| `REQUIRED_LINKAGE_VALID` | **4** |
| `REQUIRED_LINKAGE_MISSING` | **0** |
| `REQUIRED_ROWS_WITH_NO_CLARIFICATION` | 0 |
| `FORBIDDEN_LINKAGE_ACCEPTED` | **1** (see §7) |
| `INVALID_LINKAGE_STRIPPED` | 0 |
| `ARBITRATION_OPPORTUNITIES` | 0 |
| `ARBITRATION_EVENTS` | 0 |
| `SURVIVING_LINKED_CONTRADICTIONS` | **0** |

**All four REQUIRED rows declared a link, and all four resolved to a candidate the same response
emitted.** This is the result §140 could not produce, because §140 created no required-linkage
opportunity at all.

| row | question | link | resolves | correct? |
|---|---|---|---|---|
| **LP-B1** | *"Has the pump's electrical energy source been locked out and tagged out … in addition to placing the local control switch in the OFF position?"* | `cand-loto` | ✓ | determines whether that LOTO candidate stays ACTIVE — **REQUIRED, taken** |
| **LP-L1** | *"Is the number 5 mixer's agitator drive de-energized and locked out at its disconnect while the access door is open and the operator is reaching inside?"* | `cand-loto-not-established` | ✓ | linked to the `INSUFFICIENT_EVIDENCE` LOTO candidate rather than the ACTIVE guarding one — **the more precise of the two available referents** |
| **LP-L2** | *"Was the pit purged or otherwise verified free of flammable/toxic atmosphere before the suction hose was inserted and the pump started?"* | `cand-fire-explosion` | ✓ | picked the fire/explosion candidate over the mobile-equipment one — **correct referent** |
| **LP-L3** | *"What are the actual contents of the drum…?"* | `chem-1` | ✓ | linked to the chemical candidate, not the `fire-1` one — **correct referent** |

LP-L1, LP-L2 and LP-L3 each had **two** candidates available and each chose the right one. That is
the discriminating behaviour the contract asks for, not a reflex to link.

**The ambiguity control worked.** `LP-L4` — two exposed drives on one line, a permit question applying
equally to both — emitted **no clarification and no link**. The one row with a *stated* per-row
FORBIDDEN rationale behaved exactly as designed.

**Omission stayed legal.** `LP-B3` and `LP-B4` are `ALLOWED` rows; both emitted a clarification and
neither declared a link. Correct, and not scored as a failure.

---

## 6. Phase 5 — arbitration

```
ARBITRATION_LIVE_STATUS = NO_NATURAL_OPPORTUNITY
```

**Zero `HAZARD_EXISTENCE` clarifications were emitted anywhere in the probe**, so no candidate/question
contradiction arose and there was nothing to arbitrate. Per the authorization this is **not a
failure**: a contradiction is a model error, it must arise naturally, and none was manufactured.

Arbitration therefore remains **deterministically proven** (`test:expert-linkage-contract`, cases
C.1–C.10, including firing with a locatable diagnostic) and **hosted-unexercised**. That is unchanged
from §140 and cannot be closed by a probe that does not provoke the error.

Worth recording: LP-L3 was built as the *valid linked non-contradictory* case — existence genuinely
open, so the linked question should be retained. The model raised `chem-1` as **ACTIVE** rather than
`INSUFFICIENT_EVIDENCE` and labelled its question `REQUIRED_CONTROL`, so the arbitration path was
never reached from that direction either. The row still produced a valid required link.

---

## 7. Phase 4 — the one unmet criterion, diagnosed

One clarification carried a link on a row labelled `FORBIDDEN`:

> **LP-G3** — *"What personal protective equipment, if any, do employees currently wear while decanting
> from these unlabeled drums?"* → `decanting_skin_inhalation_exposure`
> (`chemical_inhalation_contact`, ACTIVE). Candidates available: three `hazcom` and this one.

**Two things went wrong, and neither is a model defect.**

**(a) A blanket fixture label.** The v2 manifest labels **ten** rows `FORBIDDEN`, but only `LP-L4`
carries a rationale that actually argues linkage would be wrong. LP-G3's rationale is entirely about
governed abstention and says nothing about linkage — I applied `FORBIDDEN` as the default for every
row that was not `REQUIRED` or `ALLOWED`. **`FORBIDDEN` should mean "a link here would be wrong", not
"no link is expected".** That is a fixture-authoring defect of the same family as the three
measurement defects already on record in this programme.

**(b) A genuine ambiguity in the clause I wrote.** The v8 FORBIDDEN clause names *"general PPE,
procedure or documentation follow-up"*. The REQUIRED clause covers a question that *"directly
determines, contradicts, qualifies or resolves ONE specific candidate"*. This question is both: it is
about PPE, **and** whether PPE is worn qualifies exactly one of the four candidates — the chemical
exposure — and none of the three hazcom ones. The referent is unique. The word doing the work in the
FORBIDDEN clause is *"general"*, and the clause does not say how to tell a generic PPE follow-up from
a PPE question that uniquely qualifies a named candidate.

**The disclosure that matters:** I am the author of both the clause and the label. It would be easy to
read this result as a clean pass by reclassifying LP-G3 after the fact. **Fixture truth is not
rewritten after spend**, the criterion is reported as mechanically unmet, and the terminal reflects
that. What needs revision is the contract wording and the labelling discipline — which is exactly
what the chosen terminal names.

---

## 8. Phase 6 — clarification retention

| readout | value |
|---|---|
| total clarifications, 16 rows | **7** |
| average per call | **0.438** |
| NO-GAP controls silent | **4 of 4** |
| clarifications on NO-GAP rows | **0** |
| TRUE-GAP rows with a question | **3 of 4** |
| TRUE-GAP rows with the authored label | **3 of 3 that answered** |
| clarifications on rows owing no authored gap | 1 (LP-G3) |
| duplicate questions | **0** |
| exposure/severity/control coverage template | **0 rows** — the §140-measured pattern did not return |

`affectedDecision`: `REQUIRED_CONTROL` 4, `HAZARD_SEVERITY` 2, `EXPOSURE` 1, others 0.

**Both replaced fixtures worked, which validates the §141 corrections.**

- **LP-B3** (replacing DP-B4): *"What did the personal noise dosimetry reading taken last month show,
  and can it be located or repeated now?"* — the authored gap, exactly, labelled `HAZARD_SEVERITY`,
  with both branches written out. The old DP-B4 gap was declined by the model as not
  decision-changing; the rebuilt one was asked.
- **LP-B4** (replacing DP-B1): *"Is anyone required to access or work on the crane runway walkway
  while the twelve foot handrail section remains off?"* — the authored `EXPOSURE` gap, exactly. Note
  it was emitted with **zero candidates on the row**, which is the blueprint's candidate-independence
  property holding in live traffic.

**The one miss is LP-B2** (`APPLICABILITY`, carried unchanged from §140's DP-B3, where it *was*
recovered). No question was emitted; `issues: []` and `mergeViolations: []`, so no harness loss path
is involved. The model's own summary shows why: it **resolved the question rather than asking it** —
*"the vault meets the profile of a confined space: below-grade, restricted twenty-four inch opening,
no continuous ventilation…"* — treating classification as settled by the physical facts. The authored
gap is a *programmatic* fact (has the site evaluated and classified this vault under its permit
program), which the physical profile does not answer.

**LP-B2's authored gap is NOT a fixture defect** — its two branches do lead to different current
actions (permit entry with attendant and monitoring, versus ordinary access), so it satisfies the v8
counterfactual definition. It is recorded as a genuine retention miss.

**The same fixture behaved differently under v7 (§140) and v8 (§142), and no causal inference is
drawn from that.** Different prompt, one replicate each, no reproducibility control, and
`P2_DETERMINISM_CONTROL = ABSENT` on this transport. The difference is recorded as an observation
only.

**Criterion 2 result: 3 of 4 semantically correct — MET.**

---

## 9. Phase 7 — governed evidence and citation

**All negative controls behaved correctly; the positive control grounded.**

| row | class | what the model said | verdict |
|---|---|---|---|
| **LP-G1** | relevant | *"Record R1 supports…"* — grounded on the point-of-operation guarding record | **grounded positive** |
| **LP-G2** | unrelated + citation adversarial | no record handle referenced at all; no regulatory assertion; no `welding_fumes` candidate | **abstained** |
| **LP-G3** | no record | *"…no way to identify the chemical…"* — hazards stated, **no governed obligation asserted** | **abstained** |
| **LP-G4** | narrower | *"The only supplied governed record (R1) explicitly excludes fixed ladders from its scope, so no governed citation applies to the actual condition observed and none is asserted."* | **extension refused, in as many words** |

**No forbidden family was emitted on any row in the probe**, so no record-induced invention occurred.

### Citation containment

| readout | value |
|---|---|
| `INPUT_CITATION_SHAPED_COUNT` | **0** (16 system + user prompts) |
| `SUPPLIED_RECORD_CITATION_COUNT` | 5 — redaction exercised, not assumed |
| `EXPERT_OUTPUT_CITATION_SHAPED_COUNT` | **0** |
| `ACCEPTED_CITATION_COUNT` | **0** |
| `REJECTED_CITATION_COUNT` | 0 (nothing needed refusing) |
| `MERGED_CITATION_COUNT` | **0** |
| `GOVERNED_AUTHORITY_CITATION_COUNT` | 4 — the supplied records copied through by design, **context, not a defect** |

`UNSUPPORTED_ACCEPTED_CITATIONS = 0`. `UNSUPPORTED_MERGED_CITATIONS = 0`.

---

## 10. Phase 8 — additive coverage and routing

| readout | value |
|---|---|
| truth-present families | 13 |
| deterministic coverage | 8 |
| **additive Expert coverage** | **5** |
| **combined coverage** | **13 of 13** |
| **truth-present misses after union** | **0** |
| Expert-only families supplied | 16 |

**Zero truth-present families were covered by neither layer** — an improvement on the §140 baseline of
one (DP-C1's `walking_working_surfaces`). Expert supplied 16 family-level candidates the deterministic
engine did not emit, five of which were truth-present families the engine missed.

| collection | items | rows with an empty list (of 16) |
|---|---|---|
| `expertHazardCandidates` | 21 | 4 |
| `decisionCriticalClarifications` | 7 | 9 |
| `crossHazardInsights` | 10 | 7 |
| `disagreements` | 5 | 12 |

Outcome was `ANALYZED` on all 16. `crossHazardInsights` fell from 13 (§140) to 10 and — notably —
**`interactionKind: OTHER` fell from 5 of 13 to 0 of 10**: `FALL_EXPOSURE_ANCHORAGE` 4,
`LOTO_STORED_ENERGY` 2, `CONFINED_SPACE_ATMOSPHERIC` 2, `CHEMICAL_PPE_VENTILATION` 2. §140's
vocabulary-fit concern does not reproduce here. **This is reported as diagnostic only; no threshold
was invented, and the two probes used different fixtures, so the comparison is not controlled.**

---

## 11. Phase 9 — M14

```
M14_REMEDIATION_STATUS = NOT_ATTEMPTED
```

One arm, asserted at gate check D.2 against the requests actually built. No permutation, no order
score, no same-input replicate, no reproducibility figure. **This probe says nothing about M14.**

---

## 12. Phase 10 — advancement decision

| # | criterion | required | observed | met |
|---|---|---|---|---|
| 1 | NO-GAP silence | ≥3 of 4 | **4 of 4** | **YES** |
| 2 | TRUE-GAP retention | ≥3 of 4 semantically correct | **3 of 4** | **YES** |
| 3 | REQUIRED linkage | ≥3 of 4 valid | **4 of 4** | **YES** |
| 4 | FORBIDDEN linkage accepted | 0 | **1** (§7) | **NO** |
| 5 | invalid/unresolved keys accepted | 0 | **0** | **YES** |
| 6 | natural contradiction must not survive | none surviving | `NO_NATURAL_OPPORTUNITY`, 0 surviving | **YES** |
| 7 | governed negative controls | all correct | **3 of 3 correct** | **YES** |
| 8 | governed positive | ≥1 grounded | **1 (LP-G1)** | **YES** |
| 9 | unsupported accepted citations | 0 | **0** | **YES** |
| 10 | combined coverage | no material regression | **0 misses, vs baseline 1** | **YES** |
| 11 | protected suites after probe | 33 of 33 | **33 of 33, identical line for line to the pre-spend baseline** | **YES** |
| 12 | no provider/budget/persistence defect | none | none | **YES** |

**Eleven of twelve. Criterion 4 is not met, so the probe is not `PASSED`.**

---

## 13. Remaining unknowns

1. **Hosted arbitration is still unexercised.** Zero `HAZARD_EXISTENCE` clarifications across 16
   rows and two probes. It is deterministically proven and cannot be closed live without the model
   making the error, which must not be manufactured.
2. **The FORBIDDEN clause needs revision** to separate generic PPE/procedure/documentation follow-up
   from a question of that kind that uniquely qualifies one named candidate. Until it does, the
   FORBIDDEN measurement has a known ambiguity.
3. **Fixture labelling discipline.** Nine of the ten `FORBIDDEN` labels in the v2 manifest were
   defaults, not judgements. A future manifest should require a stated per-row rationale for
   `FORBIDDEN`, exactly as `LP-L4` has, or leave the row unlabelled.
4. **LP-B2's miss** — the model resolved an applicability question rather than asking it. One
   replicate; whether this recurs is unknown.
5. **Whether any of this reproduces.** One arm, one replicate, 16 development rows. No rate, no
   distribution, no reproducibility claim.
6. **§140 versus §142 differences are not causally attributable** — different prompt, different
   fixtures, no control.
7. **M14 remains causally unresolved.**

---

## 14. Files

**Created** (`verification/expert-hazlenz-hosted-linkage-probe-2026-09-02/`)

| file | purpose |
|---|---|
| `PROBE-REPORT.md` | this document |
| `PRE-SPEND-IDENTITY.json` | write-once; refusal proved on the live artifact |
| `RUN-RECORDS.jsonl` | 16 append-only fsync-backed records, `7843260c…` |
| `RESULTS-SUMMARY.json` | every diagnostic in §5–§12, machine-readable |
| `FIXTURE-MANIFEST.json` | fixture truth, roles, linkage expectations, supersessions |
| `ATTEMPT-LEDGER.json` | budget, accounting, per-call attempts, tokens, latency, cost |

**Modified**: `docs/INSITE_ENGINEERING_BLUEPRINT.md`, `docs/INSITE_CURRENT_STATE.json` — additively.

**No production source was modified by this operation.** No scorer, formal truth, threshold or frozen
artifact was touched. **No historical formal or prior hosted-probe evidence was altered** — §140's and
§141's artifacts are byte-identical before and after.
