# L3-2i — what remains, and the exact next action

## Terminal

> ### `L3_2I_COMPLETE — CANDIDATE_INDEPENDENT_CLARIFICATION_ESTABLISHED — SCENARIO_LEVEL_CLARIFICATION_SCORER_CORRECTED — SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Blueprint **§40**. Decision log **`D-57`** (the carrier) and **`D-58`** (the two metrics).
`D-55` and `D-56` are preserved. §37–§39 are not rewritten. Baseline HEAD `1feda622`, unchanged.

**This state does NOT mean** L3-3 starts, Gemini is selected, production provider selection is
closed, or the sealed acceptance gate has passed. It means two named defects are closed.

## Is L3-3 eligible?

**No, and this phase did not move that gate.** `L3-3 must not start until` the high-consequence gate
reaches **zero on FRESH SEALED evidence** with the clarification axis still at **100/100**. No sealed
evidence was opened. Family coverage remains complete at 24 of 24.

---

## What L3-2i settled, so the next phase does not re-derive it

* **`D-56` reproduced exactly** — 3/4 = 75% candidate-conditioned, 3/5 = 60% scenario-level, miss
  `B10` — and the correction changed **zero** previously-recorded keys.
* **`TERMINAL_A` is untouched, checked rather than assumed.** Its two pre-registered axes are computed
  by `score-l32g-fact-coherence.ts` and `score-l32g-order-sensitivity.ts`, neither of which this phase
  modified.
* **The representation defect is closed.** Four zero-candidate `INSUFFICIENT_EVIDENCE` rows carried
  the owed clarification; the validator accepted every one **without a hazard candidate**.
* **Scenario-level recall on the proof cohort went 0% → 100%**, where the candidate-conditioned metric
  is *undefined* because no row survives its filter. That is the clearest demonstration of why the
  denominator correction mattered.
* **Decision-criticality is `§34.2`'s rule, not a new one**, and `L3_UNDECIDED_STATES` now has one
  definition shared by the validator and the semantic binder.
* **A superfluous question is dropped, never fatal** — measured wrong first, then corrected.
* **The candidate-level reject path was NOT tightened.** Failing it deletes a hazard; §35.1 governs.
* **No full diagnostic re-run was needed** — every changed shared path's safety is established by a
  deterministic assertion, and every pre-existing suite reports §38.6's count.

---

## The exact next action

> ### DECLARE THE CARRIER IN THE SHIPPED PROMPT, THEN RE-MEASURE

The contract can carry the clarification and the validator accepts it. **The shipped pipeline still
cannot produce one**, because `L3_SYSTEM_PROMPT` was deliberately left byte-unchanged — the locked
L3-2h instrument reads that exact string, and editing it would have changed that instrument's inputs
while its own bytes stayed identical.

1. **Declare `unresolvedDecisions` in `L3_SYSTEM_PROMPT`**, additively, and advance
   `L3_PROMPT_VERSION` past `v6`. The proof harness's declaration block is a working starting point
   and is deliberately additive — no rung is reworded and nothing shipped is moved.
2. **Then run the FULL already-open diagnostic corpus.** This is the one condition Phase 9 named: a
   shared prompt path whose behavioural safety cannot be established by deterministic tests. Preserve
   §38.3 process isolation — one variant per process, the repeat control never sharing a process with
   the variant it controls.
3. **Re-derive the locked L3-2h comparison against the new prompt rather than assuming it transfers.**
   §36.7 and §37 both measured how much prompt position moves behaviour; a prompt that has grown a
   block is not the prompt those numbers were taken under.
4. **Report BOTH clarification denominators** (`D-58`) and never rename one into the other.
5. **Close the n = 1 provider limit.** One authorized hosted-provider credential re-runs the
   `F-CL-01`/`B10` proof on `gemini-3.1-pro-preview`. The blocker is unchanged from §31.1 → §38.1 →
   §38.8 → §39.1.

### Do NOT

* consume the sealed acceptance corpus;
* begin L3-3;
* select a production provider, or reopen the qwen-vs-Gemini discrimination decision;
* promote `R1_MISSING_FIRST`;
* tune prompt emphasis, as opposed to declaring a contract field;
* broaden the carrier into a generalized question or workflow system;
* deploy, commit, push, or perform any stash operation.

---

## Deferred, unchanged

1. `R1_MISSING_FIRST` still **not promoted** — §39.5.3 gave a second reason to leave it alone.
2. **Unifying the two clarification shape predicates**, with the hazard-deletion consequence measured.
3. `F-FLD-159`'s class — whether one non-verbatim quotation should cost a high-consequence finding.
4. `DISC-02` — still leave it.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json` (`49aa40fd…`) and
`safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) are hash-verified unchanged, appear in **zero**
artifacts of this phase, and were seen by no provider. §37.10's plan is untouched.
