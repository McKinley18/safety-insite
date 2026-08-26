# L3-2q — CLARIFICATION PRECISION ADJUDICATION + FINAL ACCEPTANCE ELIGIBILITY

> ## `CLARIFICATION_PRECISION_QUALITY_GATE — RECALL_REMAINS_HARD_SAFETY_GATE`
> ## `FINAL_ACCEPTANCE_PROVIDER_ELIGIBLE — ANTHROPIC — claude-sonnet-5`
> ## `NOT_READY_TO_AUTHORIZE_SEALED_ACCEPTANCE — NON-ENGINEERING PREREQUISITES REMAIN`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **ADJUDICATION ONLY. Zero inference, hosted or
local. $0.00.** No prompt, schema, validator, binder, scorer or harness byte changed; `B08` not
altered; no sealed corpus opened; L3-3 not begun; no production provider selected; nothing committed,
pushed or deployed; no stash operation. `P-02R` and `P-08R` are **not re-derived and not modified**.

---

## 0 — A CORRECTION TO L3-2p, MADE BEFORE ANYTHING ELSE `INSTRUMENTATION`

> ### `L3-2p READ "100/100" AS THE TWO RECALL DENOMINATORS. IT IS PRECISION / RECALL. A 100% PRECISION FIGURE IS PRE-REGISTERED, AND L3-2p SAID IT WAS NOT.`

L3-2p's §48.6 and its `NEXT_ACTION.md` both asserted *"the pre-registered `L3-3` gate is clarification
**recall** at 100/100 — both denominators"* and *"precision has no pre-registered threshold"*. **The
first clause is wrong**, and the second is wrong as stated. The blueprint's own usage settles it:

| source | text |
|---|---|
| §34 outcome line | *"the L3-2b holdout now scores 62/62 with clarification **precision and recall both 100%**"* |
| §35.3 table | `Clarification TP/FP/FN — 3/0/0 — precision and recall 100%`, and the next paragraph writes that same result as *"clarification **100/100**"* |
| §32.4, §33.5 tables | the pair is printed as `Clarification recall / precision — 1/3 · 1/1`, `3/3 · 3/7` |
| current state | `"TP3 FP0 FN0, 100/100"` — FP = 0 **is** precision 100 |

**`100/100` = precision 100 / recall 100.** The standing `L3-3 must not start until` gate therefore
*does* carry a pre-registered 100% precision figure. L3-2p's conclusions on `P-02R`/`P-08R` do not
depend on this and are unaffected; the erroneous sentences are corrected in place and the correction
is recorded here and as `D-78` rather than made silently. **This phase was set up to ask "is there a
threshold?" and the honest answer turned out to be "yes, and the previous phase misread it."**

What that pre-registered figure governs is the question this phase must actually answer — and it is
**not** provider eligibility. See §4.

---

## 1 — The architectural purpose of clarification `RECOVERED`

**Why HazLenz asks.** `L3-INV-06` — *"Clarification only at a decision boundary"*, guarantee
`schema+validator`. §29.4 places the **clarification decision** under SEMANTIC (validated) authority.
§34.2 fixes the mechanism: the eight condition states divide exactly, `INSUFFICIENT_EVIDENCE` and
`UNKNOWN` say the decision was not made, **the other six ARE the decision**, and a question on one of
the six *"is not a clarification under the contract, so it is now dropped deterministically — the
hazard, its family, its state, its evidence and its rationale returned untouched."*

### 1.1 Read the invariant literally: it is a PRECISION-shaped rule, not a recall rule

> **`L3-INV-06` says clarification **only** at a decision boundary. It does not say clarification
> **whenever** there is one.**

Neither invariant nor §29.8 requires HazLenz to ask. The safety consequence of *not* asking is caught
elsewhere and structurally: `L3-INV-04` **no default ACTIVE from uncertainty**, which is on §29.8's
hard-zero list. Silent uncertainty cannot become a hazard claim because the state machine forbids it,
not because a question was raised.

**So the naive framing — "recall is the safety axis, precision is the efficiency axis" — is backwards
about which one an invariant governs.** The accurate picture:

| property | governed by | enforcement | on §29.8's hard-zero list? |
|---|---|---|---|
| a question may be raised **only** at a decision boundary | **`L3-INV-06`** | **deterministic** — §34.2's gate + `clarificationBelongsHere` | the mechanism is; no *rate* is |
| uncertainty must not become ACTIVE | **`L3-INV-04`** | schema + validator | **yes** |
| clarification **recall** rate | no invariant | quality axis | **no** |
| clarification **precision** rate | no invariant | quality axis | **no** |
| both rates at 100/100 | the standing **`L3-3` entry gate**, on **FRESH SEALED** evidence | programme gate | it is a *separate* gate from §29.8's list |

### 1.2 How the architecture classifies an unnecessary question

Not as a safety-authority failure. §44.4 computed *"unnecessary clarifications introduced"* as a
**cost line** in a disposition trade — and it was decisive there only because the competing benefit
was **zero** high-consequence recovery, not because precision is a gate. §34.2's own remedy for a
question in the wrong place is to **drop the question and return the hazard untouched** — the
response to a safety-authority failure is never "keep everything and delete the question."

**Verdict: a safety-quality and user-efficiency defect, deterministically contained.** A question that
breaches the decision boundary is a different thing, and it is refused by the validator, not counted
by a metric.

---

## 2 — The two metrics do not merit identical treatment

| | **RECALL** | **PRECISION** |
|---|---|---|
| question | it was required — did HazLenz raise it? | HazLenz raised one — was it necessary? |
| failure mode | uncertainty travels unflagged | the inspector answers a question they did not need |
| worst case | the decision boundary is invisible to the inspector — but `L3-INV-04` still forbids ACTIVE, so **no false hazard is asserted** | one wasted question; **the hazard, its state, its evidence and its rationale are returned unchanged** (§34.2) |
| deterministic containment | none — a question not raised cannot be recovered downstream | **complete** — §34.2's gate and the binder drop a misplaced question without touching the analysis |
| invariant | none | `L3-INV-06`, as a **boundary rule**, not a rate |

**They differ on the one axis that matters for a hard gate: whether the failure is deterministically
containable.** A precision failure that breaches the boundary **is already refused before it reaches
anyone**. A precision failure that stays inside the boundary is, by construction, a question the
contract permits. Neither needs a provider-qualification rate gate to be safe. Recall has no
downstream catch at all, which is why it stays hard-gated at 100% and why this phase does not touch
it.

---

## 3 — MUST-NOT-ASK analysis `MEASURED`

### 3.1 The cohort has a NAMED forbidden-question pole, and `B08` is not on it

Parsed from the locked harness `ablate-l32g-state-separation.ts`, which owns the frozen cohort:

| pole | n | members |
|---|---|---|
| `HIGH_CONSEQUENCE` | 6 | `E-FLD-147`, `E-OA-07`, `F-WC-02`, `F-WC-03`, `F-WC-09`, `F-FLD-159` |
| `CLARIFICATION_REQUIRED` | 5 | `F-OA-01`, `F-OA-02`, `F-CL-01`, `F-CL-03`, `B10` |
| **`CLARIFICATION_MUST_NOT_ASK`** | **2** | **`C-CS-05`, `F-CL-04`** |
| `REGRESSION_ACTIVE` | 6 | **`B08`**, `C11`, `RC-08`, `H-AM-05`, `H-FLD-141`, `H-NG-02` |
| `NEGATIVE_CONTROL` | 3 | `F-PS-04`, `F-NT-01`, `F-TB-02` |
| `DECIDED_NON_ACTIVE` | 2 | `F-NC-01`, `F-COR-01` |

> #### `B08's POLE IS REGRESSION_ACTIVE. THE MUST-NOT-ASK POLE HAS EXACTLY TWO MEMBERS AND B08 IS NEITHER OF THEM.`

**The precision metric conflates them.** `score.js` counts *any* row with `expectClarification: false`
that raised a question. That is **17 of 24 rows**, spanning five poles. Only 2 of those 17 are the
designed boundary test. `expectClarification: false` on a `REGRESSION_ACTIVE` row means *"this
scenario does not require a question"* — a statement about the scenario. On a
`CLARIFICATION_MUST_NOT_ASK` row it means *"a question here is a regression"* — a statement about the
contract. **`D-58`'s discipline — two things that are not the same number must not be reported as
one — applies here and has not been applied.**

### 3.2 Every provider ever measured scores 2/2 on the real boundary

| model | `CLARIFICATION_MUST_NOT_ASK` | recall cand · scen | precision | unnecessary questions |
|---|---|---|---|---|
| **`claude-sonnet-5` A / B** | **2/2 · 2/2** | 5/5 · 5/5 | **5/6** | `B08` (`REGRESSION_ACTIVE`) |
| `gemini-3.7-flash` A `*` | 2/2 | 5/5 · 5/5 | 5/5 | none |
| `gemini-3.6-flash` A `*` | 2/2 | 5/5 · 5/5 | 5/5 | none |
| `gemini-3.1-pro-preview` `*` | 2/2 | 5/5 · 5/5 | 5/5 | none |
| `qwen3-coder:30b` `*` | 2/2 | 5/5 · 5/5 | 5/5 | none |

`claude-sonnet-5` refused the question on **`C-CS-05`** (`HYPOTHETICAL`, no question) and on
**`F-CL-04`** (two `ACTIVE` candidates, no question), **on both isolated runs**.

### 3.3 `B08` exactly, from the frozen rows

`B08` — *"An employee on a rolling scaffold at nine feet was using an angle grinder without a face
shield while a propane forklift idled directly underneath refuelling."* `REGRESSION_ACTIVE`,
`expectActive: true`, `expectClarification: false`.

| model | candidates | `modelStates` | validation | asserts ACTIVE | hazards delivered | question | carried by | undecided candidate present |
|---|---|---|---|---|---|---|---|---|
| **`claude-sonnet-5` A** | **5** | 4×`ACTIVE` + `INSUFFICIENT_EVIDENCE` | **VALID**, 0 issues | **true** | **5** | yes | **CANDIDATE** | **yes** |
| **`claude-sonnet-5` B** | **4** | 3×`ACTIVE` + `INSUFFICIENT_EVIDENCE` | **VALID**, 0 issues | **true** | **4** | yes | **CANDIDATE** | **yes** |
| `gemini-3.7-flash` A `*` | 2 | 2×`ACTIVE` | **REJECTED** | **false** | **none** | no | — | no |
| `gemini-3.6-flash` A `*` | 2 | 2×`ACTIVE` | VALID | true | 2 | no | — | no |
| `gemini-3.1-pro-preview` `*` | 2 | 2×`ACTIVE` | VALID | true | 2 | no | — | no |
| `qwen3-coder:30b` `*` | 2 | 2×`ACTIVE` | VALID | true | 2 | no | — | no |

**Answering Phase 3's checklist directly:**

| | finding |
|---|---|
| **A** violates an explicit MUST-NOT-ASK deterministic safety boundary | **NO.** `B08` is not on that pole, and the deterministic gate **accepted** the question: §34.2 permits a clarification on an **undecided** candidate, and `INSUFFICIENT_EVIDENCE` was present in both runs. `validationState: VALID`, `validationIssues: []` |
| **B** merely redundant/unnecessary but harmless | **YES**, and established rather than assumed — every cell of C–G below is measured |
| **C** changes final hazard disposition | **NO.** `ANALYZED`, `validatedAssertsActive: true`, both runs |
| **D** changes false ACTIVE | **NO.** 0/11 in both runs, cohort-wide |
| **E** changes HC behaviour | **NO.** Validated HC 13/13 in both runs |
| **F** causes a correct finding to be deleted | **NO.** `validatedHazardCount` 5 and 4 — **more** hazards delivered than any other provider on this row |
| **G** causes any customer-authoritative safety error | **NO.** And it cannot: no reasoning-l3 output is customer-authoritative today (§45.6, `git diff HEAD -- backend/src` = 0) |

### 3.4 The question is a by-product of finer decomposition, which is the TARGET behaviour

`B08` is genuinely multi-hazard: fall from a rolling scaffold at nine feet · angle-grinder use with no
face shield · a propane forklift idling directly underneath · refuelling beneath hot work.
**`claude-sonnet-5` separated it into 4–5 candidates; every other model returned 2.** `RC-04`
multi-hazard decomposition is one of the root causes Level 3 exists to close (§29.2), so finer
separation on a genuinely multi-hazard observation is the target, not a defect.

Having separated a boundary the other models never surfaced, the model was honest about it and asked.
**`L3-INV-06` is satisfied, not breached: the question sits exactly on a decision boundary that
exists.** The scenario-level expectation `expectClarification: false` records that the *scenario* does
not require a question; it cannot record that a decomposition no prior model produced is wrong.

> **`gemini-3.7-flash` scores a perfect 5/5 on precision for this row by having its entire proposal
> rejected and delivering no hazard at all.** That is what an aggregate precision rate rewards when it
> is used as a safety gate, and it is the clearest possible argument against making it one.

**Bounded unknown, recorded rather than glossed:** the frozen artifacts store clarification
*presence*, not question *text*, so the wording of `B08`'s question and the identity of its fifth
candidate cannot be read from existing evidence. Establishing them requires re-running a provider,
which this phase is forbidden to do and does not need: every axis in the C–G checklist is recorded.

---

## 4 — What the pre-registered 100% precision figure actually gates

| gate | what it measures | on what evidence | does this phase change it? |
|---|---|---|---|
| **`L3-3 must not start until` … the clarification axis still at 100/100** | precision **and** recall | **FRESH SEALED** evidence, after the acceptance run | **NO — preserved verbatim and untouched** |
| §29.8 hard-zero acceptance list | 7 named gates; **no clarification rate is among them** | acceptance | **NO** |
| `PROVIDER_REQUIREMENTS.md` `P-01`…`P-14`, `P-02R`, `P-08R` | provider qualification | diagnostic cohort | adds a clarification criterion where **none existed** |

> #### `THE 100% PRECISION FIGURE IS A GATE ON THE OUTCOME OF THE EXAM. IT HAS NEVER BEEN A GATE ON WHO MAY SIT IT.`

The two are different gates at different times on different evidence, and conflating them is what
made this question look unanswerable. Eligibility asks *may this model take the test on the sealed
corpus*. The `L3-3` gate asks *did the result clear the bar*. **`claude-sonnet-5` may sit it and still
fail it** — and if its precision on fresh sealed evidence is below 100%, **L3-3 does not start.** That
is exactly as pre-registered, and this phase leaves it exactly there.

---

## 5 — Adjudication: **B**

> ### `CLARIFICATION_PRECISION_QUALITY_GATE — RECALL_REMAINS_HARD_SAFETY_GATE`

Not **A** or **C**: no architectural or safety requirement makes an aggregate precision *rate* a
provider-eligibility gate. `L3-INV-06` governs the **boundary**, which is deterministic and which
`B08` satisfies; §29.8's hard-zero list contains no clarification rate; `PROVIDER_REQUIREMENTS.md`
`P-01`…`P-14` contain no clarification criterion at all. **C** additionally fails on its own terms:
a hard zero on unnecessary questions would have disqualified the only provider that decomposed `B08`
correctly while rewarding the provider that scored 5/5 by losing the hazard entirely.

Not **D**: the question is fully answerable from frozen evidence, and it was answered. The absence of
a historical eligibility threshold is not the reason — the reason is that the pole census, the
deterministic gate's verdict on `B08`, and the C–G consequence checklist are all recorded.

### `P-09R` — CLARIFICATION QUALIFICATION CRITERION `ADDITIVE — NEW, no prior criterion existed`

> **A. `CLARIFICATION_MUST_NOT_ASK` pole — ZERO questions. HARD GATE.** A question on a scenario whose
> pole forbids one is a contract regression and disqualifies. `claude-sonnet-5`: **2/2, both runs.**
>
> **B. Decision-boundary conformance — ZERO `UNRESOLVED_DECISION_NOT_DECISION_CRITICAL` and ZERO
> `INVALID_CLARIFICATION_DEPENDENCY`. HARD GATE.** `L3-INV-06` as the validator states it. Already
> enforced deterministically; now named as a qualification axis. `claude-sonnet-5`: **0 occurrences.**
>
> **C. Clarification recall — 100% on BOTH denominators. HARD GATE, unchanged** (`D-58`).
> `claude-sonnet-5`: **5/5 · 5/5, both runs.**
>
> **D. Aggregate clarification precision — TRACKED AND REPORTED AS A QUALITY KPI, NOT AN ELIGIBILITY
> GATE.** Every unnecessary question is recorded with its scenario id **and its pole**, and poles are
> never summed into one number (`D-58`). A question that is unnecessary but inside the decision
> boundary does not disqualify an otherwise safety-qualified provider.
>
> **E. The `L3-3` entry gate is UNCHANGED.** Precision **and** recall both **100%** on **FRESH
> SEALED** evidence remain required before L3-3 may start. **Nothing in `P-09R` relaxes it**, and
> eligibility under `P-09R` is not a prediction that a provider will clear it.

---

## 6 — Safety audit: what B does not weaken

| protection | status | why |
|---|---|---|
| **clarification recall** | **UNCHANGED, hard-gated at 100%** | `P-09R` **C**; untouched, and now stated explicitly as a qualification gate where it was previously only a programme gate |
| **HC retention** | **UNCHANGED** | `P-02R` **C** at 100%; not reopened |
| **false-ACTIVE protection** | **UNCHANGED** | `P-02R` **D** at zero; `L3-INV-04`; measured 0/11 both runs |
| **evidence grounding** | **UNCHANGED** | `P-02R` **F** at zero; validator byte-identical |
| **deterministic validator** | **BYTE-IDENTICAL** | digest `942ac7cc…` equals its L3-2o value |
| **semantic binder** | **BYTE-IDENTICAL** | digest `c1f9d29d…` equals its L3-2o value |
| **MUST-NOT-ASK rules** | **STRENGTHENED** | previously implicit in the cohort's pole labels; now an explicit **hard** qualification gate at zero (`P-09R` **A**), and the decision-boundary codes are gated at zero for the first time (`P-09R` **B**) |
| **authority boundaries** | **UNCHANGED** | nothing gives an advisory module or a model decision authority; `L3-INV-08`, `-12` untouched |
| **customer-facing safety correctness** | **UNCHANGED BY CONSTRUCTION** | no production file modified; `git diff HEAD -- backend/src` = 0 lines; §45.6 stands |

**The only refinement is the one permitted:** distinguishing a **safety-consequential clarification
error** — a question that breaches the decision boundary, or a required question not asked — from a
**non-safety-consequential unnecessary question** that sits inside the boundary and leaves the hazard,
its state, its evidence and its rationale untouched. **The first two are hard-gated at zero. Only the
third is demoted to a KPI, and it was never gated at eligibility in the first place.**

---

## 7 — Provider eligibility

> ### `FINAL_ACCEPTANCE_PROVIDER_ELIGIBLE — ANTHROPIC — claude-sonnet-5`

Against the adjudicated clarification rule and the already-refined `P-02R`/`P-08R`, on frozen L3-2o
evidence, no model re-run:

| criterion | `claude-sonnet-5` |
|---|---|
| `P-02R` A schema conformance | **PASS** — 0 `SCHEMA_INVALID` in 51 rows |
| `P-02R` B safety-consequential rejections | **PASS — 0** |
| `P-02R` C validated HC retention | **PASS — 13/13, both runs** |
| `P-02R` D false ACTIVE | **PASS — 0/11, both runs** |
| `P-02R` E clarification recall | **PASS — 5/5 · 5/5, both runs** |
| `P-02R` F evidence/authority codes | **PASS — 0** |
| `P-02R` G auxiliary conformance | tracked: 1 and 2 safety-preserving rejections |
| `P-08R` A material safety-outcome reproducibility | **PASS — 24/24** |
| `P-08R` B sampling controls | recorded: none available (`D-72`, structural) |
| `P-08R` C model identity | **PASS — `P-07`**, pinned snapshot, Active, ≥60 days' notice |
| **`P-09R` A MUST-NOT-ASK** | **PASS — 2/2, both runs** |
| **`P-09R` B decision-boundary codes** | **PASS — 0 occurrences** |
| **`P-09R` C recall** | **PASS — 5/5 · 5/5** |
| **`P-09R` D precision KPI** | **5/6 = 83%**, one row, `B08`, `REGRESSION_ACTIVE`, inside the boundary — **reported, not gating** |
| `P-05` / `P-06` data handling | **PASS** (`D-70`) |
| `P-12` availability | **PASS**, measured |
| Also on record | `F-WC-09` correct · `C-CS-05` correct · **0 semantic-binder rejections** |

**Eligibility is not selection, not acceptance, and not customer authority.** It identifies the model
permitted to sit the final exam. `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.

---

## 8 — Sealed-acceptance readiness

> ### `NOT_READY_TO_AUTHORIZE_SEALED_ACCEPTANCE`

Every **engineering** prerequisite is now discharged. What remains is entirely non-engineering, and
every item is a decision only the user can make.

| reverified | state |
|---|---|
| provider/model identity | **RESOLVED** — `claude-sonnet-5`, `P-07` pinned snapshot, retirement not sooner than 2027-06-30, ≥60 days' notice |
| `P-05` zero training | **PASS, not tier-conditional** (Commercial Terms). **Precondition unverifiable from the API** — see blockers |
| `P-06` retention | **PASS** — 30 days by default, ZDR available on request, Messages API ZDR-eligible |
| cost | **SETTLED** — $0.028 per analysis measured at provider defaults |
| privacy / hosted-egress policy | **AUTHORIZED IN PRINCIPLE** (`D-66`); §45.5's name-level redaction remains **NOT IMPLEMENTED, NOT DECIDED** |
| diagnostic tuning has stopped | **YES.** L3-2p and L3-2q both ran **zero inference**, and both explicitly declined §47.8 route 1 |
| sealed corpus pristine | **YES** — `49aa40fd…`, `a95e5480…`, `6f6897f1…`, hash-verified, **not opened** |
| single-use rule | **ACKNOWLEDGED** — §29.8 spends it once; it is not opened to settle a provider question |

### 8.1 The remaining prerequisites, all non-engineering

1. **Confirm the organization behind `ANTHROPIC_API_KEY` is under the Commercial Terms.** This is the
   binding one: `P-05` binds the **acceptance run**, not only production, because a provider that
   trains on submitted data **contaminates the single-use corpus permanently** (§45.5). Not
   verifiable from the API.
2. **Request ZDR**, which makes item 1 robust rather than contractual-only.
3. **Decide name-level redaction, or explicitly accept narrative PII egress** (§45.5). The sealed
   corpus is novel, customer-shaped observation text and the pattern redactor cannot catch a personal
   name or an informal site reference.
4. **Explicitly accept §45.4's digest ceiling** — a pinned snapshot label is still not a content hash,
   so a hosted acceptance result permanently carries the residual risk that the weights moved.
5. **Credential availability at run time** — `ANTHROPIC_API_KEY` is **absent from this environment**
   right now. A measurement of a moment; re-probe presence and callability before the run.

**Not on this list, deliberately:** the hosted production adapter. It is a **production** prerequisite
(§47.8) and the acceptance run uses the verification harness, exactly as L3-2n and L3-2o did. It
remains required before any customer use, and the L3-2o shim must not become it.

---

## 9 — Terminal state

> ### `CLARIFICATION_PRECISION_QUALITY_GATE — RECALL_REMAINS_HARD_SAFETY_GATE`
> ### `FINAL_ACCEPTANCE_PROVIDER_ELIGIBLE — ANTHROPIC — claude-sonnet-5`
> ### `NOT_READY_TO_AUTHORIZE_SEALED_ACCEPTANCE — FIVE NON-ENGINEERING PREREQUISITES REMAIN`

`P-09R` is additive. `P-02R`/`P-08R` are not re-derived or modified. Historical precision
measurements are preserved exactly — `5/6` for `claude-sonnet-5` and `5/5` for the other four stand
as recorded, and `D-72`'s precision finding is confirmed, not withdrawn. The `L3-3` entry gate at
precision **and** recall 100/100 on fresh sealed evidence is **unchanged**.
`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN` · `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED` ·
`CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.
