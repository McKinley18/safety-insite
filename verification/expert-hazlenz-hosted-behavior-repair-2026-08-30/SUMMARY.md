# §105 — EXPERT HAZLENZ HOSTED-BEHAVIOUR REPAIR (2026-08-30)

> **CORRECTION APPENDED 2026-08-30, after the v4 re-probe (§106):** every "§104" reference below
> means the account owner's real, successful hosted run (7/7 HTTP 200) — never its own numbered
> blueprint section, and NOT the credential-blocked attempt actually documented at blueprint §104.
> See blueprint §105.0 for the corrected citation and for how the raw
> `results/hosted-probe-summary.json` this document quotes was destroyed later the same day by an
> output-path bug in `probe-expert-hosted-transport.ts` (fixed in §106) and reconstructed from the
> session transcript at
> `verification/expert-hazlenz-hosted-transport-probe-2026-08-29/results/hosted-probe-summary.RECONSTRUCTED-2026-08-30.json`.
> The FIGURES below are unaffected — they were read from the file before it was destroyed.

> ### `EXPERT_HAZLENZ_HOSTED_BEHAVIOR_REPAIR_INCOMPLETE — EVALUATION_COHORT_REMAINS_BLOCKED`
> ### Hosted calls **0** · hosted spend **$0.00** · production untouched · nothing committed
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

The §104 hosted probe is treated as authoritative: **hosted transport is VALIDATED, Expert
BEHAVIOUR is not.** 7/7 HTTP 200, 15/18 gates, `HG08`/`HG11`/`HG12` failed, `GROUNDING_READY =
FALSE`, 0/2 supporting exact quotes, 10 ungrounded typed objects, $0.1710 actual. Every figure in
this document was re-read from `../expert-hazlenz-hosted-transport-probe-2026-08-29/results/
hosted-probe-summary.json` rather than copied from the task description.

Four defects were repaired at the contract level and measured locally at zero cost. **Two of the
eight local acceptance criteria are not met**, so the terminal is INCOMPLETE and no cohort spend is
authorised.

---

## 1. Root causes — three of the four defects had a STRUCTURAL cause, and it was measurable

### RC1 — `outcome` was the FIRST property in the wire schema

Structured decoding emits properties in schema order, so the producer had to answer *"is there
anything to add?"* **before it had enumerated a single hazard, question or interaction**, and then
generated the lists consistently with a commitment made while knowing nothing.

Both halves of that were measured:

| evidence | observation |
|---|---|
| §104 hosted `R1` | every collection empty, **635 output tokens** |
| §104 hosted `R5` | every collection empty, **254 output tokens**, 6.6 s — the shortest call of the seven |
| §105 local baseline | `outcome = NOTHING_TO_ADD` on **27 of 27 calls**, including calls that populated three collections |

The local half is the decisive one. A field that comes back `NOTHING_TO_ADD` while three lists are
populated is not a judgement — it is **a field answered before the answer existed**. Nothing in the
system validated the two against each other, so it had gone unnoticed since §99.

### RC2 — the wire schema was WEAKER than the boundary, in three places

Every one of these let a value pass strict transport validation and then be refused at the boundary:

| field | wire schema asked for | boundary requires | measured consequence |
|---|---|---|---|
| required strings | `type: 'string'` | `isNonEmptyString` | §104 `R6` — `CANDIDATE_MALFORMED` on the negative control |
| `participants` | `array` of strings | **≥ 2** members | §105 — one-participant insights refused, `crossHazardInsights` empty, the interaction surviving only in the summary as an **EXPLANATION_ONLY_LOSS** |
| `evidence` | not required at all | — | 0 quotes, everywhere, always |

### RC3 — grounding was not merely optional; the contract ACTIVELY INSTRUCTED OMISSION

The prompt said *"BUT A QUOTE IS OPTIONAL … raise the candidate anyway with an empty evidence
list"*, and the schema description repeated it. Silence was the cheapest legal answer and **every
producer took it** — `quotes = 0/0` across 14 local calls in §100/§101 and `EVIDENCE_QUOTES_EMITTED
= 0` across both hosted grounding fixtures in §104.

This was not model incapacity. §105 measured the same local model emitting exactly-bound quotes as
soon as the contract stopped inviting it not to.

### RC4 — negative-control over-routing (`HG12`) has NO structural cause established

`R6` emitted a candidate and two clarifications where the correct answer is empty. RC2 explains the
`CANDIDATE_MALFORMED` half. The over-production half is **prompt-pressure asymmetry** — the prompt
pushes hard against under-reporting and only lightly against invention — and that is a hypothesis,
not a measurement. **It is not claimed as repaired.** Locally `R6`/`R7` stayed empty 10/10 both
before and after, so the local model cannot falsify it either way.

---

## 2. What changed

**Contract / schema — `expert-prompt.ts`**

1. **`outcome` moved from FIRST to LAST**, after the typed lists, the explanation and the
   uncertainty. A consequence of the lists rather than a commitment preceding them — and the order
   the system prompt has asked for since §99 (*"Fill the typed lists FIRST"*).
2. **`minLength: 1`** on every required string.
3. **`minItems: 2`** on `crossHazardInsights.participants`.
4. **`groundingStatus`** added to hazard candidates as a required enum, with **`evidence` now
   required** beside it.
5. Candidate description: **one entry per distinct hazard**, do not merge and do not leave the
   second to the summary.

**Boundary — `expert-normalization.ts`** (three new reason codes)

- `GROUNDING_STATUS_INVALID` — unrecognised declaration, **item-level** (bad formatting).
- `GROUNDING_CLAIM_UNSUPPORTED` — the declaration and the evidence disagree **in either direction**,
  **item-level** (see §4).
- `OUTCOME_INCONSISTENT_WITH_CONTENT` — `NOTHING_TO_ADD` carrying content. **Recorded, not
  rejected**, and deliberately not corrected: this module resolves and refuses, it does not rewrite
  a producer's output.

**Prompt** — the omission instruction replaced by a two-branch declaration rule; exact-string-search
semantics stated (*"a correct paraphrase fails exactly like an invented sentence"*); outcome-last
instruction added. `EXPERT_PROMPT_VERSION` → **`hazlenz.expert.prompt.v4`**.

**`EXPERT_ANALYSIS_CONTRACT_VERSION` stays `analysis.v2`.** The wire form changed; the normalised
analysis the customer path consumes did not. `groundingStatus` is deliberately **not** added to the
internal type — grounded/ungrounded stays derivable from `evidence`, so there is no second copy of
the same fact to drift.

---

## 3. Two things that were NOT done

**No gate was lowered, and no expected answer was moved to match the model.** `H7`/`H8` are
untouched. Exact binding is untouched. `EVIDENCE_OUT_OF_BOUNDS` and `EVIDENCE_TEXT_MISMATCH` remain
analysis-fatal exactly as §99 left them.

**`A.13`/`A.15` in `test-expert-routing-contract` were RE-ANCHORED, not deleted or loosened.** They
asserted the v3 rule that `evidence` is *not* required, which went stale the way `G14` did in
§103.4. The property they protect — an unquotable hazard is **raised, not dropped**, so §101's
collection-wide suppression cannot return — now has a **direct** assertion: a candidate declaring
`NO_EXACT_QUOTE_AVAILABLE` is normalised and survives. Nothing that used to fail now passes, and the
suite went 57 → 58 assertions.

---

## 4. One decision was reversed BY MEASUREMENT, and it is recorded rather than absorbed

`GROUNDING_CLAIM_UNSUPPORTED` was **fatal first**, by analogy with `EVIDENCE_OUT_OF_BOUNDS`. The
local probe then measured the cost: on the two grounding fixtures the model over-claimed, the
analysis was condemned whole, and **9 of 10 iterations returned nothing at all** — good
clarifications and insights destroyed alongside the one candidate that lied. That is §101's
suppression failure returning in a new costume, and `expert-normalization.ts` already carries the
same lesson from L3-2i.

It is now **item-level**. This does not weaken the rule: the lying candidate is still discarded, it
does not cross as grounded and it does not cross at all. This phase's authorization names both
options in as many words — such a candidate *"must fail closed **or remain non-authoritative**"*.

After the change, `H8` kept its 3 clarifications and 1 insight on all 5 iterations while both
over-claiming candidates were correctly dropped.

**A second attempt was also reversed by measurement: `maxLength: 120` on `quotedText`.** It was
added to stop the local model pasting the whole observation into a quote. Under the local provider's
structured decoding it did not produce a shorter span — it produced a **truncated** one, cut
mid-sentence with stray characters appended (`"…walked past the 10."`), which bound *less* often
than the over-long quote it replaced. A schema keyword that corrupts output on a provider we can
actually test is not a repair. Removed; the ask lives in the description instead.

---

## 5. Local measurement — 50 calls, `qwen3-coder:30b`, $0.00

5 repeats × 10 cases, so a structural repair is distinguishable from a lucky generation.

| measure | baseline (v3) | after (v4) |
|---|---|---|
| `outcome` inconsistent with content | **27 / 27** | **0 / 50** |
| typed routing opportunities · hits · misses | 54 · 54 · 0 | 75 · 70 · 5 |
| over-routed | 0 | **0** |
| EXPLANATION_ONLY_LOSSES | 0 | **5** |
| EVIDENCE_QUOTES_EMITTED | **0** | **5** |
| EVIDENCE_QUOTES_EXACTLY_BOUND | **0** | **5** |
| EVIDENCE_QUOTES_UNBINDABLE | 0 | **0** |
| EVIDENCE_QUOTES_FABRICATED | 0 | **0** |
| GROUNDED typed objects | **0** | **5** |
| negative controls `R6`/`R7` empty | 6 / 6 | **10 / 10** |

By collection, after: clarifications **25/25**, insights **15/15**, disagreements **10/10**,
candidates **20/25**. Every miss and every loss is in **one fixture, `H8`**.

**The headline: the grounding question moved for the first time in the programme.** §100, §101 and
§104 all measured `quotes = 0`. `H7` now emits an exactly-bound quote on **5 of 5** iterations, with
zero unbindable and zero fabricated.

---

## 6. Local acceptance — 6 of 8 met, and the two that are not

| # | required | result |
|---|---|---|
| 1 | zero-candidate clarification survives | **PASS** — deterministic `A.1`–`A.3`; `R1` 5/5 |
| 2 | multi-collection sibling emission survives | **PARTIAL** — deterministic `B.1`–`B.3` PASS; `R5` not demonstrated by the model (§7) |
| 3 | negative control stays empty | **PASS** — 10/10 |
| 4 | EXPLANATION_ONLY_LOSSES = 0 | **FAIL** — 5, all `H8` |
| 5 | both positive grounding fixtures exactly bind | **FAIL** — `H7` 5/5, `H8` **0/5** |
| 6 | fabricated evidence = 0 | **PASS** |
| 7 | unbindable evidence = 0 | **PASS** (in accepted output) |
| 8 | evidence-required candidates cannot cross ungrounded | **PASS** — deterministic `D.6`/`D.7`; observed 10/10 on `H8` |

---

## 7. The two residual failures, and what they are NOT

**`H8` — the model declares `EXACT_QUOTE_SUPPLIED` and supplies an empty list, twice per call, 5/5.**
The boundary drops both candidates, which is correct and is criterion 8 passing. But the candidate
collection is then empty and the confined-space concept survives only in free text, which is
criteria 4 and 5 failing. The same model on `H7`, with the same contract, quotes correctly 5/5 — so
this is **fixture-specific producer behaviour, not a contract defect**. Per §103.3's precedent it is
classified as model behaviour because no evidence makes it provider-neutral.

**`R5` — the analysis is REJECTED on all 5 iterations, and this is the most important finding here.**
The diagnostic (`diagnose-expert-quote-binding.ts`) shows the model is **not paraphrasing**: it
copies the *entire* observation verbatim, except that it lower-cases the sentence-initial `A` and
drops the closing period. `indexOf` therefore fails, `EVIDENCE_OUT_OF_BOUNDS` fires, and because
that code is **analysis-fatal** the whole response dies.

> **This is a latent cliff that §105 exposed rather than created.** Under v3 no producer ever
> quoted, so the fatal rule never fired — it was dormant for the entire programme. Requiring
> grounding to be declared makes producers *attempt* quotes, and every attempt is now a chance to
> lose the whole analysis.

**It was deliberately not repaired here.** The only repair is to make `EVIDENCE_OUT_OF_BOUNDS`
item-scoped, and that is a **pre-existing protected rule** asserted by `expert-contract-foundation`
`C.9`–`C.11`, `expert-routing-contract` `D.7` and `no-call-scenarios` `S08`. Changing it to make a
measurement pass is precisely this phase's stop condition — *"exact evidence binding must be
weakened"* — so it is escalated as a decision rather than taken. Case-insensitive or
whitespace-normalised binding was rejected for the same reason: it is approximate matching, and the
authorization forbids it.

**The risk this carries into a hosted re-probe is real and should be priced in.** In §104 Sonnet 5
emitted 0 quotes with `UNBINDABLE = 0` and `FABRICATED = 0` — it *abstained*. Under v4 it must now
declare, so it will attempt. If it makes the same class of copying error the local model makes, a
hosted analysis is lost whole rather than returned ungrounded.

---

## 8. Protected regression — all green at HEAD `37a5d1b5`

| suite | result |
|---|---|
| `expert-contract-foundation` · `expert-authority-merge` | **56 / 0** · **51 / 0** |
| `expert-provider-failure` · `expert-nocall-harness` | **131 / 0** · **141 / 0** |
| `expert-routing-contract` | **58 / 0** (was 57 — `A.13` re-anchored, `A.13a` added) |
| `expert-grounding-contract` (**new**, §105) | **40 / 0** |
| `l32i-clarification-carrier` · `l32j-carrier-activation` | **61 / 0** · **37 / 0** |
| HazLenz core · precision · level-1 recall · actionable coverage | exit 0 · exit 0 · exit 0 · exit 0 |
| HazLenz precision detail | dangerous omissions **0**, life-critical omissions **0** |
| backend `tsc --noEmit` | **exit 0** |

`141/0` still carries the most: the Expert core is **provably pure**, and §105 added no network
primitive, endpoint, credential or vendor name to it.

**Confinement:** 15 files reference the Expert module (§104's 12 plus this phase's probe, suite and
diagnostic). **No** controller, service or module; **no** frontend reference. The hosted adapter has
**exactly one importer**, the hosted probe. **No §105 script imports a hosted adapter at all** —
which is what structurally backs the $0.00.

---

## 9. Exact next operation

**A bounded hosted RE-PROBE is justified, and it is the account owner's authorization to give.** The
contract moved materially: `prompt.v4`, a reordered schema, a required grounding declaration, and
three boundary codes. §104's measurements were taken under v3 and **do not transfer**.

The re-probe should re-run the same seven fixtures under v4 and answer three questions §105 could
not: whether `HG08`/`HG11` recover once `outcome` is decided last; whether Sonnet 5 emits an
exactly-bound quote on `H7`/`H8`; and — the one that matters most — **whether Sonnet 5 loses whole
analyses to `EVIDENCE_OUT_OF_BOUNDS` now that it will attempt quotes** (§7). Cost is bounded exactly
as before: 7 calls, `MAX_HOSTED_CALLS = 8`, `MAX_HOSTED_COST_USD = 3.00`; §104's actual was $0.1710.

**The 17-measure evaluation cohort remains BLOCKED and is not authorised here.**

No provider selection, no customer activation, no evaluation corpus, no Render or Vercel change, no
production access, no Stripe action, and **no commit, push, tag or deploy**.
