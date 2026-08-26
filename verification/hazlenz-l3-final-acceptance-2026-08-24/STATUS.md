# L3 FINAL SEALED ACCEPTANCE — EXECUTION HALTED AT THE PRE-OPEN GATES

> ## `L3_FINAL_ACCEPTANCE_INVALID — NO_ACCEPTANCE_CONCLUSION`
> ## `SEALED_STRIDE_NOT_EXPOSED — NOT SPENT — ALL THREE SOURCES REMAIN UNOPENED`
> ## `THIS IS NOT A MODEL FAILURE. NO SEALED MEASUREMENT EXISTS TO INTERPRET.`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **The authorized run did not execute.** Two
independent pre-open gates failed, either of which alone forbids opening the corpus. **Zero inference
of any kind, hosted or local. Zero API requests. $0.00.** No credential read. **The sealed corpus was
NOT opened, NOT previewed and NOT inspected**, and its three hashes are byte-identical before and
after. Nothing was tuned, remediated, committed, pushed or deployed; no stash operation; L3-3 not
begun; no provider selected; no adapter built.

> **The single most important outcome: the single-use asset was preserved.** Stopping at the gates is
> what the gates are for. §29.8 spends the corpus once, and it has not been spent.

---

## 1 — Gate A `FAILED` — the execution-time provider gate

Phase 2's contract: *"`ANTHROPIC_API_KEY` must be present … If the credential fails: **STOP** … Do
NOT spend the sealed corpus unless the provider gate passes."*

Presence-only check across **every** path the SDK and CLI resolve, in documented precedence order:

| credential source | state |
|---|---|
| `ANTHROPIC_API_KEY` | **absent** |
| `ANTHROPIC_AUTH_TOKEN` | **absent** |
| `ANTHROPIC_PROFILE` | unset |
| `~/.config/anthropic/` OAuth profile | **does not exist** |
| `ant` CLI (`ant auth status`) | **not installed** |

**No credential is resolvable by any path.** Nothing was printed, hashed, persisted, or revealed by
prefix or suffix; **no metadata probe, no availability probe and no inference request was issued** —
Phase 2's re-probe of `claude-sonnet-5` was **not reached**, because a probe requires the credential
whose absence is the gate.

**Claude Code's own claude.ai OAuth session was NOT used and MUST NOT be.** §47.7 recorded that
boundary and it is unchanged: *"Claude Code's own claude.ai authentication was not changed or used as
the experiment credential."* Using it would substitute an unauthorized credential for the
pre-authorized one and invalidate the acceptance evidence.

**No substitution was made or considered.** Not another Claude model, not Gemini, not qwen.

---

## 2 — Gate B `FAILED` — there is no built stride to open `NEW_EVIDENCE`

> ### `§37.10 AND THE EVIDENCE PLAN IDENTIFY THE SOURCES AND DECLARE THE RULE. THEY DO NOT CONSTITUTE A BUILT, FROZEN, HASH-RECORDED ACCEPTANCE HOLDOUT.`

Phase 4 requires *"Select/open exactly the stride authorized by that plan."* Read in full, the plan
authorizes a **procedure**, and says so in its own words: *"**It is a plan.** Nothing here was opened
for evaluation, and no acceptance run was performed."* Measured against the repository:

| the plan's sealing procedure requires | state |
|---|---|
| step 1 — source hashes frozen in a `HOLDOUT_FREEZE.txt` **before** any selection code runs | **ABSENT.** Six freeze records exist (L3-2 … L3-2f); **none** names `a95e5480…` or `6f6897f1…` |
| step 2 — deterministic selection, **the rule recorded in the freeze record**; unused strides reserved | **NOT RECORDED.** The rule exists as prose (*"sort by `scenarioId`; take a fixed stride"*); no concrete stride has been declared, and declaring one now would be inventing the selection this command forbids inventing |
| step 3 — holdout ~90–100 rows: ~45 gauntlet + ~20 realism-pack + **~25 authored negative/corrected complement** | **THE AUTHORED STRATUM DOES NOT EXIST.** The plan states negative controls *"remain unavailable from any independent source"* and *"must still be authored"* — measured at **0 across all twelve candidate sources** |
| step 4 — overlap enforced **by a throw at build time** against every prior sealed and development set | **NO BUILDER EXISTS.** Eight `build-l32*` builders exist; **none targets the acceptance sources.** The only script that touches them, `survey-l32g-evidence-sources.ts`, surveyed ids/hashes/overlap and *"printed no observation text and ran no inference and no scoring"* |
| step 5 — holdout file hashed, hash recorded, re-verified byte-identical after execution | **NO HOLDOUT FILE EXISTS.** No acceptance holdout artifact is present anywhere in the repository |
| — a scorer for the acceptance holdout | **ABSENT.** The frozen scorers score the 24-scenario diagnostic cohort, not a ~95-row acceptance holdout with a by-provenance table |

**Building it inside this command was not an option**, and not merely because it is unauthorized:
step 5 requires the freeze to happen **before** execution and step 3 requires ~25 rows the phase
would have to author. **A phase that authors its own gate rows and then grades itself on them is
exactly the methodological weakness §36.10 and this plan exist to close** — *"five phases running,
every precision, clarification and family-coverage number rests on scenarios the implementer wrote."*

### 2.1 This is a defect in the L3-2r readiness finding, and it is mine

`L3-2r` declared `READY_TO_AUTHORIZE_SEALED_ACCEPTANCE` after closing the provider-side, privacy,
model-identity and single-use prerequisites. **It verified that a stride-selection rule existed and
must be followed; it did not verify that the rule had been executed into a built, frozen, hashed
holdout.** That is a real gap in that phase's readiness check, it is recorded here rather than
quietly repaired, and it is why `D-83` adds the artifact-level precondition that was missing.

**Nothing in `L3-2r`'s other findings is affected.** `D-79`…`D-82` stand: the provider-side gates are
genuinely closed, and they remain closed for the run that eventually executes.

---

## 3 — The acceptance gates, PRE-REGISTERED with zero sealed evidence seen

Phase 0 requires the gates enumerated **before** the corpus is opened. They are recorded here, at a
moment when **no sealed row has been observed by anyone**, so no gate can have been shaped by a
result. **They are not re-openable after evidence is seen.**

| # | gate | requirement | source |
|---|---|---|---|
| G1 | high-consequence misses, VALIDATED tier | **ZERO** | §29.8; standing `L3-3` gate |
| G2 | clarification **precision** | **100%** | `L3-3` gate at `100/100`, read correctly per `D-78` |
| G3 | clarification **recall**, candidate-conditioned **and** scenario-level, reported separately | **100%** on **both** | `D-58`; `P-02R` **E**; `P-09R` **C** |
| G4 | false ACTIVE | **ZERO** | §29.8 hard gate; `L3-INV-04`; `P-02R` **D** |
| G5 | safety-consequential validator rejections | **ZERO** | `P-02R` **B** |
| G6 | evidence-integrity / authority codes — every member of `NON_RETRYABLE_VALIDATION_REASONS` | **ZERO** occurrences | `P-02R` **F**; `L3-INV-01/02/03/09/11` |
| G7 | `CLARIFICATION_MUST_NOT_ASK` violations | **ZERO** | `P-09R` **A** |
| G8 | decision-boundary codes — `UNRESOLVED_DECISION_NOT_DECISION_CRITICAL`, `INVALID_CLARIFICATION_DEPENDENCY` | **ZERO** | `P-09R` **B**; `L3-INV-06` |
| G9 | material safety-outcome reproducibility across two isolated processes | **100%** on the seven material axes | `P-08R` **A**; §38.3 |
| G10 | schema conformance after ≤1 retry | **≥99%** | `P-02R` **A** |

**Reported but NOT gating**, per `P-02R` **G** and `P-09R` **D**: aggregate schema-contract validity ·
safety-**preserving** rejections by code and row · hazard-decomposition granularity · MODEL-tier
high-consequence (never merged with VALIDATED — `D-58`) · latency · tokens · cost · **and the
by-provenance table** (independent vs authored strata reported separately, §36.5).

> **No denominator may be redefined after seeing a result, and no failed gate may be reinterpreted as
> a KPI.** `D-72`'s standing rule binds: *changing a requirement is the user's call, never a response
> to a provider failing it.*

---

## 4 — The frozen acceptance configuration, recorded and binding

Recorded before any opening; **no parameter may change after sealed evidence is observed.**

| field | value |
|---|---|
| provider · endpoint | Anthropic · `https://api.anthropic.com`, `POST /v1/messages` |
| model | `claude-sonnet-5` — pinned snapshot (`D-82`); the live `GET /v1/models/claude-sonnet-5` body must be captured at run time |
| prompt | `hazlenz.l3.prompt.v6` · `L3_SYSTEM_PROMPT` sha256 `b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf` · file `426302a4c79d64ed1ecf122b216b3ff96295f26d54c2575956d3823cf22b19d5` |
| schema | run schema `a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385` · contract types `5f70281ce5ba14228a2002f3ae00eca0d0ae9668881f19eb0c84fe3d913d91b1` |
| validator | `942ac7cc20c2153c03ba5a6af2f7ecb62d1a5769b411ec849f32efb7eb69c298` |
| binder | `c1f9d29dea446d6b86237b7cce305514de6734bec5dae8e879768492d7e6eb47` |
| input builder | `2865ae91a7f50ff5794ea5d116399662e01116a2e9f34a585ac0ff276dbccc9e` — mandatory path (`D-81`) |
| redaction | `hazlenz.l3.redaction.v1` — `email`·`phone`·`ssn`·`street_address`·`mine_id`·`employee_id`·`url`; per-rule counts recorded for every row |
| transport shim | `76d3e0397c138e72a3eeafec2ebbd8bf23f5f387dea8b7d8a365392ad895a083` |
| harnesses | cohort `73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521` · `activate-l32j-shipped-corpus.ts` `0b3b8d86…` · `diagnose-l32k-shipped-residual.ts` `d90cb89c…` |
| scorer | `76…/adapter/score.js` `7d748111b88e0acf9000bb28c6ec62868d0e0e10f124ecb1654c7544afde4d0a` — **plus an acceptance-holdout scorer that does not yet exist** |
| inference parameters | `output_config.format` present; **`thinking` OMITTED**; **`output_config.effort` OMITTED** (adaptive at documented default `high`, exactly as every recorded baseline ran); `temperature`/`top_p`/`top_k`/`seed` **not transmitted — inexpressible** (`D-72`) |
| isolation | §38.3 — one variant per process, shim restarted between runs, repeat control in its own process |

**All 31 hashes recorded at L3-2o re-derived: OK = 31, MISMATCH = 0.** `git diff HEAD -- backend/src`
= **0 lines**. **No unauthorized implementation change occurred after pre-authorization.**

---

## 5 — Terminal state

> ### `L3_FINAL_ACCEPTANCE_INVALID — NO_ACCEPTANCE_CONCLUSION`

Phase 7's third terminal, reached **before** any sealed measurement could exist. Per its own
instruction, **this is not a model failure** — `claude-sonnet-5` was never called, and nothing about
its qualification (`D-70`, `D-77`) changes.

**Was the stride exposed and therefore spent? NO.** Not opened, not previewed, not selected, not
inspected. Post-run hashes are byte-identical to pre-run:

```
49aa40fdcc507d549f22b59c9791823c3f1196034543df1746c8eb5d857b73fe  safescope-gauntlet.seed.json
a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4  safescope-gauntlet.source.v1.json
6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb  safescope-field-realism-pack-v2.v1.json
```

**Remaining unopened sealed evidence: ALL OF IT — 366 independent rows**, roughly four acceptance
runs. Nothing is retired. Phase 8's failure discipline is **not** engaged, because there was no
acceptance failure — there was no acceptance.

---

## 6 — What must exist before this command can succeed

Two prerequisites, neither remediable inside this command's boundaries.

**A. A credential.** Export `ANTHROPIC_API_KEY` for the run, for an organization under the Commercial
Terms (`D-79`). Then Phase 2's re-probe of identity and callability runs as specified.

**B. A built, frozen acceptance holdout** — a separate, authorized **construction** phase that
executes the existing plan rather than re-inventing it:

1. write `HOLDOUT_FREEZE.txt` recording the three source hashes **and the concrete stride rule**,
   **before** any selection code runs;
2. write the acceptance holdout builder, following the L3-2b builder pattern, with **overlap
   enforced by a throw** against every prior sealed set, every development set, the exhausted field
   corpus and both new sources' previously-used strides;
3. author the **~25 negative-control / corrected-state complement** the plan says must be authored,
   and mark it so the by-provenance table reports the independent number on its own;
4. carry observation text **verbatim** — any normalisation is a text edit and must be recorded;
5. emit the holdout, hash it, record the hash;
6. write the acceptance-holdout scorer against the **pre-registered §3 gates** — which are frozen
   above and may not be adjusted to the builder's output.

> **Step 6 is the one to watch.** The gates are already registered in §3, before any sealed row was
> seen. A construction phase that finds them inconvenient must change the *builder*, never the gates.

---

## 7 — Preservation

HEAD `a7b21a26` at 0/0 · 23 tag objects · 4 stash entries, **no stash operation** · 0 index entries
staged · all 19 `reasoning-l3` modules and every locked harness digest byte-identical · `git diff HEAD
-- backend/src` **0 lines** · `B08` unaltered · **sealed corpus unopened and hash-identical** ·
protected excluded product work (5 `frontend-next` files, 2 backend integration-test repairs,
`Safety InSite Logos/`) unstaged, unmodified and byte-identical.

**Egress: NONE.** Zero inference calls, zero API requests, zero probes, zero destinations contacted,
**$0.00**. No credential read; **the credential appears in zero artifacts because none was ever
obtained.** Claude Code authentication unchanged and not used.

**Customer authority:** unchanged by construction — no production file modified, and §45.6 stands
that no hosted adapter exists in `backend/src` to change it.
