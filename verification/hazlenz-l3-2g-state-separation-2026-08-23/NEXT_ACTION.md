# L3-2g — what remains, and the exact next action

## Is L3-3 eligible?

**No.** The high-consequence gate has never been demonstrated at zero on fresh sealed evidence, and
L3-2g deliberately consumed none. Family coverage stays complete at 24 of 24.

---

## What L3-2g settled, so the next phase does not re-derive it

* **The Level-3 contract CAN represent the state distinction structurally.** Six separated facts, a
  deterministic resolver, and the provider answers §36.4's control question correctly **23/24 in
  isolation**. `CONTRACT_OR_ARCHITECTURE_LIMIT` is ruled out with direct evidence, not by argument.
* **`F-WC-09` is recovered, and it is the strongest single result.** PPE against a defeated
  engineering control — which **no** prompt ordering ever recovered — is ACTIVE under every
  structural variant, via `controlReading: DEFEATED`. Asking the control question directly closes it.
* **The high-consequence axis is stable under structural separation: 12/12 everywhere.**
* **Structural separation does NOT remove prompt-order sensitivity.** Size-matched: ladder 1/24,
  structural 3/24, noise floor **0/24**. The §36.7 trade was **relocated**, not resolved — the HC
  pole became robust and the uncertainty pole absorbed all the instability.
* **The reproducibility floor on the new schema is 0/24.** Byte-identical prompts at temperature 0
  agree completely, so every difference measured this phase is an effect.
* **The deterministic resolver's first ordering was wrong and the ablation caught it.**
  `R0_HAZARD_FIRST` dropped clarifications on `F-OA-01`/`F-OA-02`; `R1_MISSING_FIRST` gives 100%
  precision / 0 false ACTIVE / 75% recall. **Tuned on known cases — no generalisation claim.**
* **The binder residual is closed, and it was ten tokens, not one.**
* **The multi-hazard scorer never ran in L3-2f.** Corrected in the reader; the frozen holdout was
  not touched; re-score gives 1/1 and changes nothing else.

---

## The blocker, and the ONE experiment that resolves it

### `A AND B CANNOT BE SEPARATED WITHOUT A SECOND PROVIDER`

The residual instability is on the uncertainty/clarification axis, and it shows up as the model
**contradicting itself on separated, non-competing questions** — `framing: CONDITIONAL` together
with `hazardAsserted: true`, in 4–12% of candidates, varying with block order. No ranking can
explain an answer that contradicts itself, which is why this points at provider capability.

**But n = 1.** `qwen3-coder:30b` is the only model available: §31.1's finding still holds — no
hosted-provider credential is resolvable on this machine, and no second model is pulled. So
`PROVIDER_CAPABILITY_LIMIT_PROVEN` cannot honestly be claimed.

> **The next action is to run the EXISTING, UNCHANGED L3-2g ablation against a SECOND provider.**
> The harness already holds everything else constant, the scenario set is fixed, and the two
> outcomes are decisive:
>
> * a second provider shows **materially lower** fact-level self-contradiction and order sensitivity
>   → the limit is `PROVIDER_CAPABILITY_BOUND`. Close L3-2g as **B**, and §31.1's production
>   provider question becomes the critical path rather than a background note.
> * a second provider shows **the same** instability → the limit is in the task representation after
>   all, and structural separation needs redesign rather than a different model. Close as **C**.
>
> This is cheap: 24 scenarios × 2 structural variants = 48 calls. It needs **one credential**, which
> is the only thing standing between this programme and an answer it has been circling for four
> phases. Anthropic is documented in `PROVIDER_SELECTION.md` as the strongest hosted candidate.

**Do not run another prompt-remediation cycle.** Four phases moved this balance with prose; L3-2f
measured both poles; L3-2g measured the structural alternative. There is nothing further to learn
from rewording, and §36.7's instruction — *the next phase should stop looking for the wording that
satisfies both* — now extends to block ordering as well.

---

## Deferred, specified, deliberately not implemented

1. **`R1_MISSING_FIRST` is not promoted into `state-facts.ts`.** It won on 24 known cases and would
   be tuning if adopted on that basis. It belongs in the next phase's implementation slice, measured
   against the fresh independent corpus.
2. **The clarification-recall residual.** `F-CL-01` (canonical) / `F-CL-03` (moved) — exactly one
   required clarification is missed under each ordering, and *which one* changes with the ordering.
   Recall sits at 75%; the gate wants 100%.
3. **The same-sense-different-object binder residual.** `replaced` `reinstalled` `applied` can still
   delete a correct ACTIVE under a broad quote. `DISC-02`-shaped, bounded by the prompt's
   shortest-span rule, and asserted in `test:l32g-state-separation` (`A''3`/`A''4`) so it cannot
   drift silently. Closing it needs the OBJECT of the correction resolved — a semantic question a
   deterministic check should not answer.
4. **`F-FLD-159`'s class** — still open, unchanged from §36.11. Whether one non-verbatim quotation
   (1 of 100; 99% verbatim) should cost an entire high-consequence finding, or whether §29.6's
   reject-without-retry deserves a bounded re-ask.
5. **`DISC-02` — still leave it.** Six sealed holdouts, zero measured losses, precision risk only.

---

## Evidence status

**No sealed set was opened.** Every scenario used this phase is already-opened development or
retired-holdout material, which the entry contract permits for architecture selection and forbids
being reported as fresh. `holdout-l32f.json` remains retired at sha256 `47f92dae…`, verified
byte-identical.

**The independent source for the next acceptance run is identified, characterised and NOT opened:**
`safescope-gauntlet.source.v1.json` — 150 rows from real OSHA/MSHA fatality reports, inspection
violations and investigation summaries, fixed **ten weeks before L3-2 began**, 0 overlap, 139
critical-or-high, 21 families. Plus `safescope-field-realism-pack-v2.v1.json` for the ambiguity
complement (92 rows with a pre-existing `shouldHaveMissingEvidence` flag), and
`safescope-gauntlet.seed.json` (99 rows, **measured disjoint**) held in reserve. **366 independent
rows total — roughly four future runs, if each takes a stride rather than the file.**

Negative controls remain unavailable from any independent source — measured across all twelve
candidates, and structural: regulator records document violations, not clean audits. They must still
be authored and must still be reported separately.

---

## Exact recommended next action

> **Obtain one hosted-provider credential and re-run `scripts/ablate-l32g-state-separation.ts`
> unchanged against a second model.** Nothing else in this programme is currently blocked on
> engineering; it is blocked on a single missing measurement, and that measurement decides between
> terminal states B and C — which in turn decides whether the next slice is a provider migration or a
> contract redesign.
>
> **Only then** build the fresh sealed holdout from the independent source and run one
> implementation/acceptance phase. Do not build it first: a holdout opened against a configuration
> whose numbers move with block ordering would burn irreplaceable independent evidence to produce a
> number that does not reproduce.
>
> `L3-3 must not start` until the high-consequence gate reaches **zero** on fresh sealed evidence
> with the clarification axis at 100/100.

If a credential cannot be obtained, the honest fallback is to state that `L3_2G_PARTIAL` stands
indefinitely and that Level-3 advancement is blocked on provider availability rather than on
engineering — which is itself a decision the programme is entitled to record and act on.
