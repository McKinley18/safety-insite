# L3-2n — what is qualified, what is not, and the exact next action

## Terminal

> ### `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — NO_CURRENT_STABLE_HOSTED_MODEL_MEETS_REQUIREMENTS`
> ### `P-05 / P-06 SATISFIABLE — DATA HANDLING IS NOT THE BLOCKER`

Blueprint **§46**. Decisions **`D-68`** (data handling) and **`D-69`** (the blocker), both additive.
`D-55` … `D-67` preserved. §29–§45 not rewritten. HEAD `1feda622`. **Nothing implemented. No sealed
corpus opened.**

## Is a provider qualified to carry the sealed acceptance run?

**No.** Three stable candidates were probed and each is disqualified on a different requirement.

---

## What L3-2n settled, so it is not re-derived

* **Data handling is solved, conditionally.** Paid tier = no training on inputs; 55-day
  abuse-monitoring retention; **ZDR available on approved request**, and HazLenz uses none of the
  ZDR-incompatible features. **A billing-enabled project is a precondition, not a preference.**
* **`gemini-2.5-pro` is not callable** — `HTTP 404, "no longer available to new users"` — while still
  listed and still documented as stable. **Probe callability, not just `ListModels` and not just the
  docs.**
* **The stable Flash models fail `P-02`**: 71% (3.7) and 83% (3.6) schema-contract validity against a
  ≥99% bar, every rejection `UNGROUNDED_CORRECTIVE_ACTION`, and largely deterministic.
* **The validator is correct and must not be weakened.** Two providers satisfy the same rule at 23/24.
  This is provider non-conformance, not a HazLenz defect.
* **`F-WC-09`, `F-WC-03` and `C-CS-05` are all CORRECT on both stable Flash models.** `D-63`'s
  residual is a `qwen` property and reproduces on no Gemini model tested.
* **The clarification and false-ACTIVE axes do not discriminate** — every model ties at ceiling
  (0/11, 5/5, 5/5, 100%), exactly as `D-62` found.

### The scoreboard, one line each

| candidate | disqualifying requirement |
|---|---|
| `gemini-2.5-pro` | **`P-12`** — not callable at all |
| `gemini-3.7-flash` | **`P-02`** — 71% valid |
| `gemini-3.6-flash` | **`P-02`** — 83% valid |
| `gemini-3.1-pro-preview` | **`P-07`** — preview (`D-67`); meets everything else at 23/24 |

---

## The exact next action — NOT EXECUTED

**Minimum blocker: no currently callable STABLE Gemini model reaches `P-02`'s ≥99% schema-contract
validity, and the Pro tier has no callable stable model at all.**

**None of these is a HazLenz engineering phase.** Pick one:

1. **Wait for, or obtain access to, a stable Gemini 3.x Pro.** `gemini-3.1-pro-preview` already meets
   every other requirement at 23/24; GA would qualify it immediately. Re-probe `ListModels` **and
   callability** before relying on any label.
2. **Qualify Anthropic Claude.** `PROVIDER_SELECTION.md` already documents it as the strongest hosted
   candidate — constrained-decoding structured output, an addressable pinned version, zero-data-retention
   agreements available — and it has **never been executed** because no credential was resolvable
   (§31.1). One credential makes it a **51-call run** on this same already-open cohort, reusing this
   phase's runner unchanged.
3. **Run acceptance locally on `qwen3-coder:30b` @ `06c1097efce0…`** — the only candidate pinnable by
   **content digest**, satisfying `P-05`/`P-06` absolutely at `127.0.0.1`, scoring 11/13 validated
   with the clarification axes at ceiling, and carrying `F-WC-09`'s deletion as `D-63`'s known,
   quantified, one-scenario cost.

### Before any hosted production use, additionally — none of it started

* confirm the project behind `GEMINI_API_KEY` is **billing-enabled** — the `P-05` gate is
  tier-conditional and this phase could not verify billing state from the API;
* request **ZDR** for that project;
* build a hosted adapter behind the existing `HazLenzReasoningProvider` interface — **none exists**
  (§45.6);
* decide name-level redaction, or explicitly accept narrative PII egress (§45.5);
* implement `P-11` egress telemetry and a hosted-dependency error taxonomy.

---

## Is further HazLenz engineering justified?

**No.** `L3-2l` closed the last open engineering question. `UNGROUNDED_CORRECTIVE_ACTION` is provider
non-conformance against a correct contract that two other providers satisfy, and the two `D-63` /
`D-64` residuals do not reproduce on either stable Flash model.

> **Do not open the sealed corpus to qualify a provider.** §29.8 spends it once.
