# L3-2p — what is settled, and the exact next phase `NOT EXECUTED`

## Settled by this phase

| question | answer |
|---|---|
| Is `P-02`'s `≥99%` contract-derived? | **No.** It cites *"the L3-2 acceptance gate"*, not an invariant. No `L3-INV` requires a validity rate |
| Is `P-08`'s determinism requirement contract-derived? | **No.** It cites *"evaluation must be re-runnable"*. No `L3-INV` requires determinism |
| Does HazLenz need a deterministic model? | **No.** It needs a deterministic safety envelope. Measured: a provider with zero determinism controls reproduced **every** material safety outcome on 24/24 rows across isolated processes |
| Should every validator rejection carry equal provider-disqualification weight? | **No.** The same code cost one provider 6 hazards and another 0. The architecture already grades rejections three ways in `validation-result.types.ts` |
| Was the validator, binder, prompt, schema or scorer changed? | **No. Zero bytes.** `P-02R`/`P-08R` change only how QUALIFICATION interprets a rejection the pipeline already contained |
| Does Anthropic now qualify? | **`P-02R` and `P-08R`: PASS.** Eligibility does **not** follow — see below |

## The narrowest open question — and it is a PRODUCT decision

> ### `CLARIFICATION PRECISION HAS NO PRE-REGISTERED THRESHOLD, AND SETTING ONE IS NOT AN ENGINEERING CALL`

`claude-sonnet-5` raises an unnecessary question on `B08`, **reproducibly**, giving precision
**5/6 = 83%** where every other model ties at 5/5.

> **CORRECTED BY L3-2q (`D-78`).** This paragraph originally claimed the pre-registered `L3-3` gate
> is clarification **recall** at `100/100`. It is **precision / recall**, so a 100% precision figure
> *is* pre-registered — for `L3-3` entry on **fresh sealed** evidence, never for provider
> eligibility. L3-2q adjudicated the eligibility question separately and left the `L3-3` gate
> untouched.

`D-72` recorded precision as newly discriminating. §29.8 places no precision gate in the hard-zero
list and §44.4 treats unnecessary clarifications as a measured cost, not a gate. **This phase
therefore does not invent a threshold.** The user must decide whether an 83% precision rate — one
superfluous question in six — disqualifies a provider that is otherwise the best measured.

## Routes forward — none is executed here

1. **Adjudicate clarification precision** (recommended first, zero cost, zero inference). A product
   decision on what precision rate is acceptable, recorded as a protected decision. It is the only
   remaining axis on which `claude-sonnet-5` is short.
2. **Build the hosted adapter.** `HazLenzReasoningProvider` has three implementations and **none is
   hosted** (§45.6). The `L3-2o` shim is a verification instrument and **must not become one**. This
   is real engineering and nobody has done it.
3. **Complete the hosted-use prerequisites** (§46.6, §47.8, unchanged): confirm the credential's
   organization is under the Commercial Terms; request ZDR; decide name-level redaction or explicitly
   accept narrative PII egress (§45.5); implement `P-11` egress telemetry; explicitly accept §45.4's
   digest ceiling.
4. **Re-derive the `P-08` baselines under one key** if any future phase compares reproducibility
   across providers — `P-08R` **D** now makes that mandatory.
5. **Run acceptance locally** on `qwen3-coder:30b`. Note that `P-02R` is **harder** on qwen than
   `P-02` was: its single rejection destroyed a high-consequence hazard, so it fails axis **B** at
   zero and axis **C** at 11/13.

## Explicitly NOT recommended

* **Re-running Anthropic at a lower `output_config.effort`** (§47.8 route 1). Under `P-02R` the
  `P-02` blocker is gone, so the measurement it would produce no longer decides anything. Running it
  now would be tuning toward a threshold, which §22 forbids.
* **Any further HazLenz engineering phase.** `L3-2l` closed the last open engineering question and
  nothing found here is an architecture defect — it is a measurement defect in a qualification
  requirement, and it is now repaired additively.
* **Opening the sealed corpus.** §29.8 spends it once. It is closer to being on the table than at any
  prior phase, but it is not authorized and the prerequisites in routes 1–3 are unmet.

## The `L3-3` gate is unchanged

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** This phase opened no sealed evidence, ran no inference,
> and does not advance that gate. Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.
