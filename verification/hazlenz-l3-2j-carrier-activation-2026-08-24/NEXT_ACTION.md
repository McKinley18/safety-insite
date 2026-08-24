# L3-2j — what remains, and the exact next action

## Terminal

> ### `L3_2J_COMPLETE — SHIPPED_CARRIER_ACTIVATION_MEASURED_AND_REFUSED — SHIPPED_PROMPT_AND_SCHEMA_BYTE-RESTORED — CROSS_PROVIDER_REVALIDATION_NOT_EXECUTED — SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Blueprint **§41**. Decision log **`D-59`** (the refusal), **`D-60`** (schema key order is an input),
**`D-61`** (the credential gate, re-recorded). `D-55` … `D-58` are preserved. §37–§40 are not
rewritten. Baseline HEAD `1feda622`, unchanged.

**This state does NOT mean** L3-3 starts, that the carrier was wrong to build, that `D-56` is
overturned, or that a production provider has been chosen. It means one ordered action was carried
out, measured, and reversed on its own evidence.

## Is L3-3 eligible?

**No, and this phase did not move that gate.** `L3-3 must not start until` the high-consequence gate
reaches **zero on FRESH SEALED evidence** with the clarification axis still at **100/100**. No sealed
evidence was opened. The provider axis is still **n = 1**.

---

## What L3-2j settled, so the next phase does not re-derive it

* **The shipped ladder carries the clarification on a candidate 5/5.** Measured twice, ten days
  apart, by two harnesses: `V_PRE_ACTIVATION` and the frozen L3-2g `V_B_LADDER` agree exactly.
* **`D-56`'s 60% is a fact about `V_S_STRUCT`, not about the shipped pipeline.** That is a scope
  correction, not a contradiction, and it is the reason the activation had nothing to gain.
* **Every activation configuration costs.** Declaration rev 1: HC 12/13 → **9/13**. Rev 2: →
  **10/13**. Schema alone: HC held, but the MUST-NOT-ASK pole regressed. Precision fell in all three.
* **The noise floor is zero** across three cross-process repeat pairs, so none of that is variance.
* **The locked L3-2h comparison does not survive a prompt change** — `V_B_LADDER` moved on 11 of 24
  rows. Anyone who edits `L3_SYSTEM_PROMPT` again must re-derive it, not assume it.
* **A declaration that names the empty-candidate case reads as permission to produce one.** The
  contradiction is with the `ASKING A QUESTION` rung, and the newer, more specific rule wins.
* **Schema key ORDER is a behavioural input** (`D-60`). Moving one key moved six measured fields on a
  byte-identical prompt.
* **Refusing an activation is not undoing a capability.** L3-2i's contract, validator and binder are
  byte-unchanged and still assert that a zero-candidate proposal carries its clarification.

---

## The exact next action

> ### OBTAIN THE CREDENTIAL AND CLOSE THE `n = 1` LIMIT. NOTHING ELSE IS BLOCKING.

L3-2j's items (1), (2), (3) and (5) are closed. Item (4) is untouched and is now the **only**
outstanding instruction from the L3-2j command.

1. **Supply one authorized hosted-provider credential** in the environment that launches the session,
   and verify it is actually there before the phase starts — L3-2i and L3-2j both opened believing it
   was present and both found it absent. `CREDENTIAL_AND_EGRESS.txt` records a presence-only probe
   that costs one command and is validated against variables known to be present.
2. **Re-run the `F-CL-01`/`B10` proof on the second provider**, through the L3-2h transport adapter
   (`hazlenz-l3-2h-cross-provider-final-2026-08-23/adapter/gemini-ollama-shim.js`): same messages,
   same JSON-schema constraint, same temperature/seed/context, **three separate invocations**.
3. **Ask the question L3-2j's result makes newly interesting**: does the second provider carry the
   clarification on a candidate the way qwen does on the shipped ladder, or does it need the carrier?
   If it needs one and qwen does not, that is a **provider-conditioned** activation decision, and it
   belongs in the production-provider decision rather than in the shipped prompt.
4. **Report both denominators** (`D-58`) and never rename one into the other.

### Do NOT

* re-ship either declaration revision without a new measurement — both are kept in
  `activate-l32j-shipped-corpus.ts` precisely so a doubter can re-run them rather than re-argue them;
* delete the carrier from the contract — the activation was refused, the capability was not;
* read `D-56`'s 60% as a statement about the shipped ladder;
* consume the sealed acceptance corpus, begin L3-3, select a production provider, promote
  `R1_MISSING_FIRST`, or tune prompt emphasis;
* edit `L3_SYSTEM_PROMPT` without re-deriving the locked comparison — §41.5 is what happens if you do;
* deploy, commit, push, or perform any stash operation.

---

## Deferred, unchanged

1. `R1_MISSING_FIRST` still **not promoted** — `state-facts.ts` byte-unchanged.
2. **Unifying the two clarification shape predicates**, with the hazard-deletion consequence measured.
3. `F-FLD-159`'s class — whether one non-verbatim quotation should cost a high-consequence finding.
4. `DISC-02` — still leave it.
5. **New, from this phase:** whether the structural representation — the one that actually has the
   zero-candidate defect — is ever selected. If it never is, the carrier never activates, and that
   should be said out loud rather than left as a dangling capability.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json` (`49aa40fd…`) and
`safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) are hash-verified unchanged before and after,
appear in **zero** artifacts of this phase, and were seen by no provider. §37.10's plan is untouched.
