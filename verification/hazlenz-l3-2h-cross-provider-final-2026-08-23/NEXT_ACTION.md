# L3-2h FINAL — what this settled, and the exact next action

## Terminal

> ### `L3_2H_COMPLETE — TERMINAL_A — CURRENT_EVALUATION_PROVIDER_NOT_VALIDATED_FOR_ADVANCEMENT`

Recorded **separately**, and deliberately **not merged into that vocabulary**:

> #### `CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE — REPRESENTATION_BOUND`

Blueprint **§39**. Decision log **`D-55`** (cross-provider / advancement) and **`D-56`**
(representation / measurement correction). Baseline HEAD `1feda622`, unchanged.

## Is L3-3 eligible?

**No, and this phase did not move that gate.** `L3-3 must not start until` the high-consequence gate
reaches **zero on FRESH SEALED evidence** with the clarification axis still at **100/100**. This
phase opened **no** sealed evidence — it ran on the 24 already-opened diagnostic scenarios. Family
coverage remains complete at 24 of 24.

---

## What L3-2h settled, so the next phase does not re-derive it

* **The credential gate PASSED**, three phases and four attempts after §31.1 first recorded it.
  Operator-named Google `gemini-3.1-pro-preview`; `GET /v1beta/models` → HTTP 200. §38.8's HTTP 401
  for `OPENAI_API_KEY` is **settled and was not re-probed**.
* **§37.5's provider indictment does NOT reproduce.** `CONDITIONAL_AND_ASSERTED` — the
  self-contradiction class the whole §37.5 argument rested on — is **empty across 74 Gemini
  candidates in three variants**, against qwen's 1/2/2. `C-CS-05`, the case §37.5 cited as flipping
  `asserted` under block order, returns **identical facts on all three Gemini runs**.
  **The mechanism is provider-capability-bound at n = 2.** That is Terminal A.
* **`CONTRACT_OR_ARCHITECTURE_LIMIT` stays ruled out**, as §37.5 established directly.
* **The harness is validated.** Replaying the same pipeline against qwen reproduces §38.2 exactly.
  A harness that could not reproduce the baseline could not be trusted to measure the comparator.
* **§38.3's trap was honoured and it matters.** Three variants, three separate processes, shim
  restarted between them. 72 calls, 0 transport errors, every `finishReason: STOP`.
* **The clarification residual is NOT provider-bound.** It is one structural defect — a
  zero-candidate `INSUFFICIENT_EVIDENCE` outcome has nowhere to carry a clarification — and it is
  **the whole** of Gemini's measured instability, noise floor and order-sensitivity signal alike.
  **No provider swap can fix it.**
* **The order-sensitivity improvement is NARROW.** 2/24 against a measured floor of 1/24, on a
  best-effort seed. Never cite it without that qualification.
* **§37.4's resolver ordering was compensating for provider fact quality.** On Gemini's facts the
  shipped `R0` already gives 0 false ACTIVE and 100% clarification recall on the scored cohort, so
  `R1_MISSING_FIRST` is unnecessary there — a further reason not to promote it.
* **A pre-existing scorer artifact was found.** `rederive-l32g-resolution.ts:94` drops zero-candidate
  rows before scoring, so **§37's and §38's 75% clarification recall is `3/4`, scorer-filtered. The
  corrected scenario-level figure is `3/5` = 60%.** Reported, **not patched**.

---

## The exact next action

> ### `L3-2i` — CANDIDATE-INDEPENDENT CLARIFICATION CONTRACT + SCORER CORRECTION + REVALIDATION

**Read `docs/INSITE_ENGINEERING_BLUEPRINT.md` — especially §29 and §39 — and
`docs/INSITE_CURRENT_STATE.json` before implementing anything.**

The order is **fixed** and is not a preference. Steps 1 and 2 exist so the corrected baseline is
established **before** the contract changes; reversing them makes the contract change unattributable.

1. **Scorer correction FIRST.** Patch `backend/scripts/rederive-l32g-resolution.ts` so zero-candidate
   clarification-required scenarios remain in the denominator.
2. **Re-score the existing frozen qwen and Gemini artifacts with ZERO new inference.** Establish the
   corrected baseline before changing the contract.
3. **Contract change SECOND.** Add a **candidate-independent, proposal-level carrier** for
   decision-critical clarification and unresolved decisions.
4. **Targeted zero-candidate proof THIRD.** Exercise only the demonstrated cohort required to prove
   that **`INSUFFICIENT_EVIDENCE` + zero hazard candidates can still carry the required
   clarification**. At minimum `F-CL-01` and `B10`. Run qwen and Gemini only as necessary.
5. **Preserve §38.3 process isolation.** Each required variant and control runs in **its own
   process**.
6. **Full diagnostic re-run ONLY IF** the targeted proof causes or reveals behaviour outside the
   demonstrated cohort.
7. **Stop.**

### Do NOT

* consume the sealed acceptance corpus;
* begin L3-3;
* select a production provider;
* promote `R1_MISSING_FIRST`;
* tune prompts;
* broaden the reasoning architecture;
* change Level-1 customer authority;
* deploy, commit, push, or perform any stash operation.

---

## Deferred, unchanged

1. `R1_MISSING_FIRST` is still **not promoted** — it won on 24 known cases, and §39.5.3 gives a
   second reason to leave it alone.
2. The same-sense-different-object binder residual — bounded and asserted.
3. `F-FLD-159`'s class — whether one non-verbatim quotation should cost a high-consequence finding.
4. `DISC-02` — still leave it. Six sealed holdouts, zero measured losses.

## Provider selection

> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Unchanged since §31.1. **This run is architecture-selection evidence on 24 diagnostic scenarios and
is explicitly not a production recommendation.** §31.2's privacy boundary — which the local provider
satisfied absolutely, at `127.0.0.1` — is a live consideration against any hosted provider carrying
customer observation text, and it has not been adjudicated. A **preview** model label is also not a
content digest: `gemini-3.1-pro-preview` can change under its label.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json` (`49aa40fd…`) and
`safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) are hash-verified unchanged, appear in
**zero** artifacts of this phase, and were seen by no provider. §37.10's sampling and sealing plan is
untouched and remains the plan of record.
