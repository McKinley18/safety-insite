# L3-2j ITEM (4) — CROSS-PROVIDER REVALIDATION ON THE SHIPPED v6 LADDER

> ## `L3_2J_ITEM4_COMPLETE — CROSS_PROVIDER_REVALIDATION_EXECUTED_ON_THE_SHIPPED_LADDER`
> ## `SHIPPED_PROMPT_AND_SCHEMA_BYTE-UNCHANGED — NO_CODE_CHANGE — PROVIDER_AXIS_NOW_n=2_ON_THE_SHIPPED_PATH`
> ## `D-59_STRENGTHENED — ACTIVATION_IS_NOT_PROVIDER-CONDITIONED`
> ## `D-55_REMAINS_SUPPORTED — SCOPE_BOUNDED_ADDITIVELY_BY_D-62`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. **Zero production files, zero script files and zero scorer
files were modified by this phase.** Nothing committed, pushed or deployed; no stash operation; no
sealed corpus opened; no `L3_SYSTEM_PROMPT` or schema edit; neither rejected v7 revision
reintroduced; **zero qwen inference**.

§31–§41 are not rewritten. `D-55` … `D-61` stand exactly as recorded.

---

## 1. The one-line result

> ### `THE SHIPPED LADDER CARRIES THE CLARIFICATION ON A CANDIDATE FOR BOTH PROVIDERS, 5/5, ON THE SAME FIVE SCENARIOS`

§41.9 asked the question this phase existed to answer: *does the second provider carry the
clarification on a candidate the way qwen does on the shipped ladder, or does it need the carrier?*

**It does not need the carrier.** `gemini-3.1-pro-preview` scores **5/5 on both `D-58`
denominators**, at **100% precision**, on the **same five scenario identities** qwen uses, and
emitted a proposal-level `unresolvedDecisions` **zero times**. Activation is therefore **not** a
provider-conditioned decision — it is unnecessary on both providers, and `D-59` is strengthened
rather than qualified.

---

## 2. Method

The **shipped** v6 prompt and the **shipped** v6 schema, both byte-verified before the phase opened:

| | value |
|---|---|
| `L3_PROMPT_VERSION` | `hazlenz.l3.prompt.v6` |
| `sha256(L3_SYSTEM_PROMPT)` | `b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf` |
| shipped schema top-level key order | `outcome │ observationInterpretation │ hazardCandidates` |
| `unresolvedDecisions` in the shipped schema | **absent** — `D-60`'s insert position is not occupied |
| serialised run schema (`schemaSha256`) | `a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385` |
| locked L3-2h harness | `73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521` |

**`schemaSha256` is the load-bearing number.** It is byte-identical to the value the restored-v6
**qwen** baseline recorded (`results/reproduction/post-revert-V_PRE_ACTIVATION.json`). `D-60` says key
order is an input; this phase proves the two providers were constrained by the *same serialised
bytes*, rather than asserting it.

**§38.3 was honoured throughout: SIX variants, SIX separate processes, the shim restarted between
every one.** No repeat control ever shared a process with the variant it controls. Every artifact
records its own `pid`.

| # | run | instrument | role |
|---|---|---|---|
| 1 | `V_PRE_ACTIVATION` | `activate-l32j-shipped-corpus.ts` | the shipped pipeline, Gemini |
| 2 | `V_PRE_ACTIVATION` (own process) | same | **shipped-pipeline noise floor** |
| 3 | `V_B_LADDER` | locked `ablate-l32g-state-separation.ts` | the shipped ladder, second instrument |
| 4 | `V_A_LADDER` | locked harness | **order sensitivity**, §36.7's one-block move |
| 5 | `V_B_LADDER` (own process) | locked harness | **ladder noise floor, in the same instrument** |
| 6 | `V_S_STRUCT` | locked harness | **MODEL-DRIFT CONTROL** vs the frozen L3-2h rows |

Adapter work was **transport only**, exactly as §38.7 requires: the L3-2h shim
(`gemini-ollama-shim.js`, sha256 `0ba265bb…`) was reused **byte-unmodified** and the harness's
pre-existing `L3_OLLAMA_ENDPOINT` hook pointed at it. Scenario texts, expected labels, variants,
prompts, schema, resolver orderings and scorers were never touched.

**No qwen inference was spent.** The restored-v6 qwen baseline is hash-backed and frozen; it was
re-scored from `hazlenz-l3-2j-carrier-activation-2026-08-24/` with the byte-unmodified scorer, and
qwen's ladder order-sensitivity figure was re-scored from the frozen L3-2g artifact. Spending
inference to reproduce either would be exactly the compensating engineering §38.8 refused.

---

## 3. The measured result — the SHIPPED v6 LADDER

Both providers, same prompt bytes, same serialised schema, same 24 already-open diagnostic
scenarios, same byte-unmodified scorer (`score-l32j-clarification-denominators.ts`).

| measure | `qwen3-coder:30b` (frozen, restored v6) | `gemini-3.1-pro-preview` |
|---|---|---|
| **candidate-conditioned** clarification recall | **5/5** | **5/5** (both runs) |
| **scenario-level** clarification recall | **5/5** | **5/5** (both runs) |
| clarification **precision** | **100%** (5 raised, 5 owed) | **100%** (5 raised, 5 owed) |
| clarification scenario identities | `F-OA-01` `F-OA-02` `F-CL-01` `F-CL-03` `B10` — all candidate-borne | **identical, all candidate-borne** |
| proposal-level carrier used | 0 | **0** |
| HC (model-asserted) | **12/13** — misses `F-WC-09` | **13/13** |
| false ACTIVE | **0/11** | **0/11** |
| validator rejections | 1 — `E-FLD-147` `DUPLICATE_CANDIDATE` | 1 — `F-COR-01` `UNGROUNDED_CORRECTIVE_ACTION` |
| candidate omissions (zero-candidate rows) | `F-PS-04`, `F-NT-01` | `F-PS-04` (+`F-NT-01`,`F-TB-02` in the repeat) |
| — all omissions are | `NEGATIVE_CONTROL` / `NO_HAZARD_ESTABLISHED` | `NEGATIVE_CONTROL` / `NO_HAZARD_ESTABLISHED` |
| **order sensitivity**, `V_B_LADDER` vs `V_A_LADDER`, ONE block moved | **1/24** (`C-CS-05`) | **0/24** |
| **noise floor**, locked instrument, separate processes | 0/24 (§37, §38) | **0/24** — 0 differing fields of 168 |
| **noise floor**, shipped-pipeline instrument, separate processes | **0/168** (§41) | **4/168 — 2/24** (`F-NT-01`, `F-TB-02`) |
| structural-state coherence | **NOT DEFINED on ladder rows** | **NOT DEFINED on ladder rows** |
| control-reading | **NOT DEFINED on ladder rows** | **NOT DEFINED on ladder rows** |

> **`HC (model-asserted)` is `D-58`'s third, separately named metric.** It is **not** §37–§39's
> candidate-conditioned high-consequence figure, which is computed over resolved `stateFacts` and
> does not exist for ladder rows. The rule that metrics are never renamed into each other applies
> here as it did in §41.2.

**Coherence and control-reading are undefined on the shipped ladder by construction, not by
omission.** Both are computed from the six separated `stateFacts`, which only the **structural**
variants emit; every ladder row carries `derived: null`. This is stated rather than filled in with a
structural number wearing a shipped-path label.

### 3.1 A scorer-boundary artifact this phase produced and must warn about `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `THE LOCKED RESOLUTION SCORER REPORTS 0/5 CLARIFICATION RECALL ON LADDER ROWS. THAT IS A NON-MEASUREMENT, NOT A ZERO.`

Run over this phase's Gemini `V_B_LADDER` and `V_A_LADDER` rows, `rederive-l32g-resolution.ts` reports
**scenario-level clarification recall 0/5**, listing all five scenarios as "zero-candidate misses".
Every one of those five **did** emit a candidate and **did** carry its clarification.

The cause is the boundary `score-l32j-clarification-denominators.ts` was written for: the locked
scorer detects the candidate carrier by re-resolving `row.derived[].facts`, and ladder rows have
`derived: null`. Its notion of "candidate" is a *resolved* candidate, not a model candidate.

This is **not** a defect and the scorer is **not** patched — it is the boundary of what it was built
to measure, and §39.3's lesson applies in a sharper form: **a scorer-boundary zero looks exactly like
a measured zero.** The two Gemini instruments agree **24 of 24** on whether a clarification was
raised, and the L3-2j scorer measures the same rows at 5/5.

---

## 4. The MODEL-DRIFT CONTROL — `MUST_REVERIFY` discharged

§39.9 item 5 records that **a preview model label is not a content digest**: `gemini-3.1-pro-preview`
can change under its label. Without a control, any shipped-ladder-versus-structural difference could
be model drift rather than representation. So `V_S_STRUCT` was re-run today and scored with the same
byte-unmodified scorers.

| measure | frozen L3-2h (2026-08-23) | today |
|---|---|---|
| `CONDITIONAL_AND_ASSERTED` — the §37.5 mechanism, `D-55`'s decisive axis | **0** | **0** |
| internal fact incoherence | 1 of 23 = **4.3%** | 1 of 24 = **4.2%** |
| — the single incoherence | `CORRECTED_AND_ABSENT_CONTROL` on `F-COR-01` | **identical** |
| control-reading correctness | **5/6**, miss `F-COR-01` | **5/6**, miss `F-COR-01` |
| HC gate, all three resolver orderings | 12/12 | **12/12** |
| false ACTIVE | 0/7 | **0/7** |
| clarification precision / recall (candidate-conditioned) | 100 / 100 | **100 / 100** |
| scenario-level clarification recall | 3/5 · 5/5 · 4/5 across variants | **4/5** — inside the recorded spread |
| row-level agreement with the frozen artifact | — | **2 of 24 scenarios differ** |

The two differing scenarios are `F-CL-01` — **which is L3-2h's own measured 1/24 Gemini noise-floor
scenario** — and `F-OA-02`, a single `conditionState` label moving `INSUFFICIENT_EVIDENCE` → `UNKNOWN`.
**2/24 against a recorded floor of 1/24 on a best-effort seed is at the floor, not above it.**

> **Conclusion: no material model drift.** `D-55`'s evidence reproduces today at `n = 2`, and every
> shipped-ladder-versus-structural difference below is attributable to the **representation**, not to
> the label having moved underneath the measurement.

---

## 5. Which L3-2h findings transfer to the shipped ladder — `A / B / C / D`

The L3-2h comparison was taken on `V_S_STRUCT`. §41.5 established it does not automatically transfer
across changed inputs. It does not automatically transfer across a **different representation**
either, and this section says which parts do.

### A. Findings that REPRODUCE on the shipped v6 ladder

1. **The provider ordering holds, in direction.** Gemini is no worse than qwen on every axis measured
   and better on two: high-consequence **13/13 vs 12/13**, order sensitivity **0/24 vs 1/24**.
2. **§39.4's "one deterministic error each, on different scenarios" signature reproduces.** On the
   ladder each provider produces exactly **one** validator rejection, on a **different** scenario —
   qwen `E-FLD-147`, Gemini `F-COR-01`. Gemini's is the **same scenario** as its structural
   control-reading miss, in the same direction (it misreads the fitted blanking plate). That is a
   capability signature carrying across representations, not noise.
3. **Order sensitivity remains narrow and remains an improvement.** The margin on the ladder is
   1 scenario, as it was 1 scenario (2 vs 3) structurally. §39.6's `MUST NOT BE OVER-READ` stands.

### B. Findings that existed ONLY under `V_S_STRUCT`

1. **`CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE — REPRESENTATION_BOUND` (§39.5.1).** The
   zero-candidate clarification loss **does not occur on the shipped ladder for either provider**.
   `B10` and `F-CL-01` — the two scenarios that *defined* the defect — carry their clarification on a
   hazard candidate on both providers. §41.1 established this for qwen; it is now cross-provider.
2. **`D-56`'s 60% scenario-level recall.** A fact about `V_S_STRUCT`. On the shipped ladder both
   providers are 5/5. `D-56` is not overturned — its scope is bounded, as `D-59` already recorded.
3. **§39.5.3 — `R0_HAZARD_FIRST` dropping clarifications on qwen's facts.** `R0` is what ships, and on
   the shipped ladder qwen scores 5/5 under it. The `R1` repair remains unnecessary on this path, and
   `R1_MISSING_FIRST` remains **not promoted** — now for a third recorded reason.
4. **`CONDITIONAL_AND_ASSERTED` itself — `TERMINAL_A`'s decisive axis — is not measurable on the
   shipped ladder at all.** It is computed from `stateFacts`. This is the single most important
   scoping fact in this section and is why `D-62` exists.
5. **Gemini's 1/24 structural noise floor and 2/24 structural order sensitivity.** On the ladder,
   inside the locked instrument, both are **0/24**.

### C. Findings INVALIDATED by the shipped-ladder measurement

**None.** Nothing measured here contradicts a recorded L3-2h finding. Every difference is a **scope**
result — a finding that is true of the structural representation and silent about the shipped one.
That distinction is preserved deliberately rather than collapsed into "superseded".

### D. Remaining provider-specific differences ON THE SHIPPED LADDER

| # | difference | detail |
|---|---|---|
| 1 | **high-consequence recall** | Gemini **13/13**, qwen **12/13**. qwen calls `F-WC-09` `CONTROLLED`; Gemini calls it `ACTIVE`. `F-WC-09` is the two-hand control taped down — the scenario whose correct control reading is `DEFEATED`, which Gemini reads correctly structurally and qwen also reads correctly structurally but fails to act on through the ladder. |
| 2 | **validator rejection identity** | qwen `E-FLD-147` `DUPLICATE_CANDIDATE`; Gemini `F-COR-01` `UNGROUNDED_CORRECTIVE_ACTION`. One each, different scenarios. |
| 3 | **outcome labelling** | qwen returns `INSUFFICIENT_EVIDENCE` on `F-OA-01` `F-CL-01` `F-CL-03` `C-CS-05` `B10`; Gemini returns `ANALYZED` on all five. **Both carry the same clarifications on candidates**, so on this cohort the difference has no clarification consequence — but it is a real contract-level divergence and is recorded rather than smoothed. |
| 4 | **candidate multiplicity** | Gemini emits two candidates where qwen emits one on `C11`, `H-NG-02`, `F-CL-04`. Validated hazard totals **27 vs 23**. |
| 5 | **noise floor is instrument-dependent for Gemini** | 0/24 in the locked instrument, 2/24 in the shipped-pipeline instrument — and both non-zero differences sit on `NEGATIVE_CONTROL` rows optionally emitting a `NEGATED` candidate. **No clarification-required and no high-consequence scenario moved in any floor pair, in either instrument.** qwen's floor is 0 in both. Gemini's `seed` is best-effort (§39.9 item 4) and this remains the live fidelity deviation. |
| 6 | **order sensitivity** | Gemini **0/24**; qwen **1/24** on `C-CS-05`, the `CLARIFICATION_MUST_NOT_ASK` pole — moving a prompt block makes qwen ask a question it must not ask. |

Cross-provider divergence at the row level: **11 of 24** scenarios in the shipped pipeline, **10 of
24** in the locked instrument. The two instruments agree on every decision axis and differ only in
candidate multiplicity and on the two negative-control rows inside Gemini's own floor.

---

## 6. Decision dispositions

| decision | disposition |
|---|---|
| **`D-55`** | **REMAINS SUPPORTED — UNCHANGED, and its evidence was re-measured rather than assumed.** `CONDITIONAL_AND_ASSERTED` is still 0 for Gemini today against qwen's recorded 1/2/2, incoherence 4.2%, control-reading 5/6 — the drift control reproduces §39.4 exactly. **Its SCOPE requires an additive bound (`D-62`): `D-55`'s decisive axis does not exist on the shipped path**, so `D-55` governs architecture selection and cannot be cited as a statement about the shipped ladder. **Not rewritten historically.** |
| **`D-56`** | **STANDS EXACTLY AS RECORDED.** 60% remains the corrected scenario-level truth **for `V_S_STRUCT`**. §41.1/`D-59` bounded its scope for qwen; this phase extends that bound to Gemini, which is a **scope** result and not a contradiction. Today's Gemini `V_S_STRUCT` scenario-level figure, 4/5, sits inside §39.5.2's recorded 3/5–5/5 spread. |
| **`D-57`** | **UNAFFECTED.** The capability is byte-unchanged and still asserted against the live modules by `test-l32j-carrier-activation.ts` (37/37). |
| **`D-58`** | **HONOURED AND EXERCISED.** Both denominators are reported for every variant and neither was renamed. `HC (model-asserted)` kept its own third name. |
| **`D-59`** | **STRENGTHENED, not merely preserved.** The refusal to activate rested on a single-provider measurement. The second provider carries the clarification on a candidate **5/5 on the same five scenarios** and used the proposal-level carrier **zero times**. §41.9's open question — *is activation provider-conditioned?* — is answered **NO**. Activation remains refused, now at `n = 2`. |
| **`D-60`** | **PRESERVED AND PROVEN ACROSS A PROVIDER CHANGE.** The Gemini runs recorded `schemaSha256 a522cf5a…`, byte-identical to the restored qwen baseline's, and `unresolvedDecisions` never occupied its insert position. Asserted, not inspected. |
| **`D-61`** | **PRESERVED AND HONOURED.** No prompt change was made, so no re-derivation was owed. The locked instrument was run anyway; its Gemini `V_B_LADDER` rows are a **new cross-provider measurement**, not a re-derivation of qwen's, and qwen's frozen rows were not re-run. |
| **`D-62`** *(new, additive)* | **The cross-provider conclusion on the shipped v6 ladder is recorded separately from `D-55`.** On the shipped path the two providers tie at ceiling on every clarification axis and on false ACTIVE, and differ on exactly two scenarios — one high-consequence (`F-WC-09`) and one order-sensitivity (`C-CS-05`). `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`. |

---

## 7. What this phase did NOT do

* did **not** modify `L3_SYSTEM_PROMPT`, the shipped schema, or any schema key order;
* did **not** reintroduce either rejected v7 declaration revision;
* did **not** activate `unresolvedDecisions` in the model-facing prompt or schema;
* did **not** tune a prompt, reword, move or delete any v6 text;
* did **not** modify the locked harness or any scorer — every scorer ran byte-unmodified;
* did **not** run **any** qwen inference — the restored-v6 baseline is hash-backed and was re-scored;
* did **not** consume the sealed acceptance corpus, or open any sealed evidence;
* did **not** begin L3-3 or move that gate;
* did **not** select a production provider;
* did **not** commit, push, deploy, or perform any stash operation.

---

## 8. Regression, authority and egress — MEASURED, not inherited

No code changed, but the suites were **executed** rather than declared inherited.

**L3 offline: 814 assertions over 10 suites, 0 failed** — `l31` 49 · `l32` 189 · `l32b` 105 ·
`l32c` 86 · `l32d` 71 · `l32e` 82 · `l32f` 77 · `l32g` 57 · `l32i` 61 · `l32j` 37. **Identical to
§41.8's record, suite for suite** — no count moved, so no unexplained drift.

`test:hazlenz-core` **206 pass / 2 fail** — the two documented §13.1 failures (`Golden Hardening
Scenarios`, `HazLenz Production Path Regression`) and **only** those, **not** reclassified. KG
contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51, `kg4b-shadow-contract`
123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170, `evidence-foundation` 35. Backend and
frontend `tsc --noEmit` both exit **0**.

**Customer authority, by source inspection at the documented seam:**
`orchestration/intelligence-orchestrator.service.ts`, its call site `safescope-v2.service.ts:1576`
and `backend/src/standards/` are **byte-unmodified vs HEAD** (tracked files, `git diff HEAD` empty);
all 19 `reasoning-l3` modules are **byte-identical to L3-2j's recorded post-phase hashes**; **zero**
importers of `reasoning-l3` outside the module; **zero** importers of `state-facts` outside it;
**zero** Level-3 vocabulary in the service. `reasoning-l3` declares only `L3_OLLAMA_*` — **no hosted
credential became required for customer execution, and none can be: the credential lives in the
transport shim, which is verification-only and outside `backend/src`.**

> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`. Level 3 is not on the customer path, and
> this phase moved it no closer.

**Egress:** one destination, `generativelanguage.googleapis.com`. **147 HTTP requests — 1 auth probe,
1 transport smoke, 144 inference calls, 1 retried 503.** `127.0.0.1:11434` — **0 calls, 0 local
inference.** Only already-opened diagnostic scenarios transmitted. No customer data, no production
data, no sealed-corpus content, and **the credential appears in zero artifacts (verified by scan of
all 51 files).** Full record: `CREDENTIAL_AND_EGRESS.txt`.

---

## 9. Fidelity deviations — recorded rather than hidden

Carried forward from §39.9 and re-measured where they moved.

1. **Reasoning could not be equalised, and this remains the largest confound.** `thinkingLevel: low`
   is the floor for Gemini 3 Pro; it still spent a mean of **592 thought tokens per call** — 85,215
   over 144 calls, range 232–930. qwen ran with no extended reasoning at all. **The confound cuts in
   Gemini's favour, and every Gemini advantage in §3 must be read with it.**
   *(§39 recorded 527 on the structural corpus; 592 is this phase's figure on a partly different
   variant mix. The §39 number is not edited — a verification artifact is not rewritten to suit a
   later recount, §13.6.)*
2. **`num_ctx` has no Gemini equivalent** — 8,192 locally against a fixed ~1M window. Prompt size was
   2,002–2,456 tokens throughout, far inside both; silent truncation is impossible in that direction.
3. **`additionalProperties: false` is dropped** in schema conversion — unsupported by Gemini's
   OpenAPI-subset `responseSchema`. Field order is preserved explicitly via `propertyOrdering`, which
   is what makes the `D-60` claim meaningful across the conversion.
4. **`seed` is best-effort on Gemini.** Its 2/24 shipped-pipeline noise floor reflects that. Note the
   floor was **0/24 in the locked instrument** on the same day and the same model — so the floor is
   itself instrument-dependent, and no single number should be cited as "Gemini's floor".
5. **A preview model label is not a content digest.** Discharged this phase by the §4 drift control
   rather than left as a caveat — but it re-arms the moment the label is used again. `MUST_REVERIFY`.
6. **One HTTP 503**, retried once by the shim's bounded transient-fault path and succeeding, during
   `V_A_LADDER`; provider latency reached 271 s on that variant against a 300 s timeout. No call was
   aborted, no scenario lost, no truncation anywhere (`finishReason: STOP` on all 144).

---

## 10. Acceptance gates

| # | gate | result |
|---|---|---|
| 1 | prompt byte-identical to restored v6 before and after | **PASS** — `b8cc50fc…`, version `v6`, asserted by `test-l32j-carrier-activation` 37/37 |
| 2 | schema serialisation **and key order** byte-identical | **PASS** — `a522cf5a…` on every run, identical to the qwen baseline's |
| 3 | locked harness and all scorers byte-unmodified | **PASS** — `73f74131…` and the three companions |
| 4 | credential gate by presence only, no value handled | **PASS** — HTTP 200, zero artifacts contain it |
| 5 | authorized model only, nothing substituted | **PASS** — `gemini-3.1-pro-preview`; the shell's flash-lite `GEMINI_MODEL` was not used |
| 6 | §38.3 process isolation, floors never sharing a process | **PASS** — six processes, pids recorded, two independent floors |
| 7 | both `D-58` denominators reported, neither renamed | **PASS** — plus the third metric kept its own name |
| 8 | the model-label drift risk controlled, not assumed away | **PASS** — §4, at the recorded floor |
| 9 | no qwen inference spent reproducing a hash-backed baseline | **PASS** — 0 local calls |
| 10 | sealed corpus untouched, unopened, in zero artifacts | **PASS** — hash-verified before and after |
| 11 | `unresolvedDecisions` not activated in the model-facing prompt/schema | **PASS** — absent from the schema; carrier used 0 times by either provider |

---

## 11. The honest summary

L3-2j refused an activation on one provider's evidence and said so. The obvious risk in that refusal
was that the second provider might have needed what the first did not — in which case activation
would have been a provider-conditioned decision belonging to the production-provider choice rather
than to the shipped prompt. **It did not.** Both providers carry the question on a candidate, on the
same five scenarios, at 100% precision, and neither reached for the carrier once.

What the second provider does bring on the shipped path is narrower than L3-2h's structural
comparison suggested: **one** high-consequence scenario and **one** order-sensitivity scenario, with
a reasoning-budget confound cutting in its favour and a non-zero, instrument-dependent noise floor
cutting against it. That is not a production recommendation, and §31.2's privacy boundary — which the
local provider satisfied absolutely at `127.0.0.1` — remains unadjudicated for any hosted provider
carrying customer observation text.

**`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.**
