# RC-1 / RC-2 / RC-3 / RC-4 — DESIGNED, NOT IMPLEMENTED

**Nothing below is built, run or authorized. Zero provider calls. `$0.00`.**
No prompt, schema, validator, binder, input builder, shim or scorer is changed by this phase.

---

# RC-1 — CLARIFICATION CALIBRATION `EXPERIMENT DESIGN ONLY`

**Established:** `DEN_A` 30 · 21 raised · 17 correct · 4 spurious · **13 misses, 13/13 reproducing in
process B** · 10 independent-realism, 3 `F6` · `D-56` carrier coupling does **not** explain it (no
question existed in either carrier on any miss; only 1 of 13 had zero candidates) · `D-59` **measured**
that activating the second carrier cut high-consequence recall **12/13 → 9/13**.

## Corpus — development only

**No reserved acceptance tranche. `gauntlet.seed` stays sealed. No unspent corpus is opened.** Build a
development corpus from the existing L3-2 development cohorts and newly authored cases, sized for
**power, not for resemblance to Run 2**. Minimum composition:

| stratum | n | purpose |
|---|---|---|
| ambiguity **with** a hazard candidate | ≥ 20 | the dominant Run-2 miss shape |
| ambiguity **without** any hazard candidate | ≥ 10 | the only shape where the `D-57` carrier can matter |
| `F6`-like undecided-state cases | ≥ 10 | `RC-1`/`RC-2` coupling |
| **negative controls — clarification MUST NOT be raised** | ≥ 15 | precision; catches the `D-59` failure mode |
| high-consequence cases | ≥ 20 | the regression guard `D-59` proved is needed |
| decided non-active (`F4`-like) | ≥ 10 | the observed over-asking cluster |

> **Anti-contamination rule.** Run 2 may supply **failure mechanisms and aggregate categories only** —
> never sentence-specific templates. **No case may be authored by paraphrasing a Run-2 observation.**
> Enforce with the `D-D.6` overlap check against the spent Run-1 **and** Run-2 holdouts and every
> prior surface, throwing on collision, exactly as the Run-2 builder did.

## Instrumentation — the gap Run 2 exposed

**Persist the complete raw provider proposal body**, before binder and before validator:
raw JSON response · every proposed candidate with state, evidence spans and offsets · both
clarification carriers · the pre-validation proposal · then validator output · then binder output.

> Run 2 could establish **which layer** each failure came from but **not why**, because only
> post-validator views were stored. On a development corpus this costs nothing but disk.

## Measurement — all four axes simultaneously, never traded

Report **separately and never merged** (`D-58`): clarification **precision** · clarification **recall**
on **both** denominators · **high-consequence recall** · **false `ACTIVE`**.

> **PROHIBITED: improving clarification at the expense of hazard recall.** This is the `D-59` failure
> mode, already measured once. Any variant that raises recall while lowering high-consequence recall
> or raising false `ACTIVE` is **rejected**, however good its clarification numbers.

## Success criteria — defined BEFORE implementation

| axis | criterion |
|---|---|
| clarification recall, both denominators | **≥ 90%**, up from 56.67% / 58.62% |
| clarification precision | **≥ 95%**, and **not below the pre-change baseline** |
| high-consequence recall | **NOT BELOW BASELINE** — hard veto |
| false `ACTIVE` | **NOT ABOVE BASELINE** — hard veto |
| negative controls | **zero** clarifications raised |
| cross-process stability | measured and **reported**, not gated at this tier |

**A variant that fails any veto is rejected regardless of its headline number.** These are development
criteria for deciding whether remediation is *working* — **they are not acceptance gates and they do
not touch `G1`–`G10`.**

---

# RC-2 — `ACTIVE` ON UNDECIDED TRUTH `EXPERIMENT DESIGN ONLY`

**Established:** 4 false `ACTIVE`, all truth `INSUFFICIENT_EVIDENCE` + `activeProhibited`; `F6` 3 of 4;
**validator accepted and binder bound the `ACTIVE` on all four**; provider originated the state;
reproduced in B.

## The invariant, stated generally

> **`ACTIVE` requires affirmative, decision-sufficient evidence. The ABSENCE of deciding evidence
> must never be silently converted into `ACTIVE`.**

**No Run-2 truth label may be read at runtime. `F6` must not be hard-coded. No lexical rule may be
written for any individual holdout sentence.** The constraint must be derivable from **structured
runtime facts alone** — what evidence the proposal bound, and what the deterministic fact layer can
establish — never from the answer key.

## Three arms to compare

| arm | description |
|---|---|
| **A** | **control** — provider-selected state unchanged (today's behaviour) |
| **B** | **deterministic post-provider state constraint** — a candidate proposed `ACTIVE` whose bound evidence does not meet a decision-sufficiency predicate is **demoted to `INSUFFICIENT_EVIDENCE`**, derived only from structured evidence and truth-independent runtime facts |
| **C** | **clarification-first** — where the state cannot be established, emit `INSUFFICIENT_EVIDENCE` **and** a decision-critical clarification |

**Arm C directly tests the `RC-1`/`RC-2` coupling**: on the three `F6` rows one behaviour caused both
failures, so one correction might fix both — **or might trade one for the other, which is exactly what
must be measured rather than assumed.**

## Where the constraint belongs — analysis, not a decision

| location | assessment |
|---|---|
| before provider inference | **NO** — the defect is in the provider's output; nothing upstream can see it |
| inside the structured contract (schema) | **NO** — `D-60` proved schema key order alone moved six measured fields. High blast radius, low precision. |
| **between provider and binder** | **CANDIDATE** — earliest point where the proposal is structured and complete. Clean seam. |
| **in the binder** | **STRONGEST CANDIDATE** — it already owns exactly this judgement: `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` fired 4 times in A and 7 in B in Run 2, and `L3-2l` inventoried **84 occurrences across 46 scenarios**. The capability exists; on the four Run-2 rows it simply did not fire. |
| in the validator | **NO** — the validator is deterministic-safety, not semantic sufficiency; widening it risks `G5`/`G6` blast radius |

> **A structural caveat that must be designed around, not discovered later.** The scored tier is the
> **VALIDATED** tier; the binder is recorded separately (`D-58`) and **never merged**. A binder-only
> fix would therefore be **invisible to `G1`–`G4`** — provably so: the scored candidate set matched the
> validated tier on **93/93** rows and the bound tier on only **86/93**. **Any binder-located remedy
> requires a companion decision about which tier the acceptance contract reads — and that is a
> governance change, not an implementation detail.** It is named here and left undecided.

---

# RC-3 — NON-DETERMINISM: ARCHITECTURE OPTIONS

Cost figures use the measured Run-2 basis: **186 calls, `$5.666386`, ≈ `$0.0305`/call**, 6,027 mean
input / 1,841 mean output tokens.

| # | option | safety benefit | determinism | latency | API cost | complexity | trust | RC-1 | RC-2 | RC-3 | new validation burden |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | single inference + deterministic downstream | none by itself | **none** — today's architecture | 1× | 1× | none | neutral | ✗ | ✗ | ✗ | none |
| 2 | **deterministic state resolver after generative extraction** | **high** — state stops being a sampling outcome | **high** for state; not for recognition | 1× | **1×** | **medium** | **high** — explainable rule | ✗ | **✓** | **partial** — fixes `assertedState` (12 of 14 divergences touch it) | resolver correctness suite |
| 3 | deterministic clarification resolver | medium | high for clarification | 1× | 1× | medium-high | medium | **partial** | ✗ | partial (4 of 14) | ambiguity-predicate suite |
| 4 | provider consensus / multi-call | medium — masks variance, does not remove it | **statistical only, never 100%** | **2–3×** | **2–3×** (`$11–17`/run) | medium | **low — "we asked three times and voted" is hard to defend** | ✗ | ✗ | partial | quorum-policy validation |
| 5 | provider with a real seed/determinism control | high | **highest** | 1× | varies | low **if such a provider qualifies** | high | ✗ | ✗ | **✓** | full re-qualification of a new provider |
| 6 | constrained structured classification separate from generative explanation | **high** — decision from a constrained head, prose kept non-authoritative | high for the decision | 1–2× | 1–2× | **high** | **highest** — the decision surface is auditable | **partial** | **✓** | **✓** | two-surface contract + new validation |
| 7 | **retain Level 1 as authoritative, Level 3 advisory** | **high — this is today's posture and it is already safe** | n/a | 0 | **`$0`** | **none** | high | ✗ | ✗ | **sidesteps** | **none** |

## Recommendation — smallest architecture that meets the actual requirement

**Now: option 7 — it is already in force, costs nothing, and is not a compromise.** Level 3 has never
been customer-authoritative; `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`. **Nothing about
the Run-2 failure endangers a customer**, because no customer receives Level-3 output.

**If and only if Level-3 promotion is pursued: option 2 first, then re-measure.** It is the smallest
change addressing the largest share of the evidence — `assertedState` differs on **12 of 14**
divergences and is the sole mechanism of `RC-2` — at **no extra API cost and no extra latency**. It
should be built and measured **before** the far more expensive options 4, 5 or 6 are considered.

> **Option 4 is explicitly not recommended** despite being the obvious reach: it triples cost and
> latency, **cannot reach 100%** (it makes divergence rarer, not impossible), and is the hardest to
> defend to a customer in a safety product.

---

# RC-4 — EVIDENCE GROUNDING `DIAGNOSTIC ONLY, NO BINDER REDESIGN`

`RC-4` is `INSUFFICIENT_EVIDENCE` and **must stay that way until the rate is known.** The whole
Run-2 basis is **1** `EVIDENCE_OUT_OF_BOUNDS` and **4** `UNGROUNDED_CORRECTIVE_ACTION` across 186
calls, each on one side only.

> **Do not redesign the binder from one unstable provider span.** That would be a speculative fix to a
> defect whose rate, mechanism and provider-dependence are all unmeasured.

**Design a development diagnostic only.** Persist, per candidate: raw proposed evidence span, exact
offsets as proposed, the raw observation, normalised evidence after any transform, the binder result
with codes, and the validator result with codes.

**Evidence required before any binder or grounding change is justified:**

1. a **rate** for each code over **≥ 500** development calls, with a confidence interval;
2. whether occurrences **cluster** by observation length, evidence position, candidate count or
   family — or are uniform;
3. whether they are **provider-specific** (≥ 2 providers) or architectural;
4. whether the offsets are **systematically** wrong (off-by-N, normalisation mismatch, tokenisation)
   or **randomly** wrong — a systematic error is a fixable bug, a random one is sampling noise;
5. whether any occurrence would have **survived** to a customer-visible surface.

**If (4) shows random offsets, `RC-4` is a facet of `RC-3` and must not be fixed separately.**
