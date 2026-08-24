# L3-2h — what remains, and the exact next action

## Is L3-3 eligible?

**No.** Unchanged from §36 and §37: the high-consequence gate has never been demonstrated at zero on
fresh sealed evidence, and no fresh sealed evidence has been consumed. Family coverage stays complete
at 24 of 24.

## Terminal

> ### `L3_2H_BLOCKED — SECOND_PROVIDER_CREDENTIAL_REQUIRED`

The phase existed to run one experiment against a second model. No authorized hosted-provider
credential is reachable through any approved mechanism, and only one model is pulled locally, so the
comparison could not be made and no decision class (A/B/C/D) can honestly be claimed.

---

## What L3-2h settled anyway, so the next phase does not re-derive it

* **The L3-2g baseline reproduces exactly.** Every recorded metric — HC 12/12, false ACTIVE 0/7,
  clarification 100%/75%, order sensitivity 3/24, fact incoherence 7.1%/12%, control-reading 5/6 and
  6/6, `F-WC-09` recovered via `DEFEATED` — came back identical on a different day in a different
  process. `V_S_STRUCT` and `V_S_STRUCT_MOVE1` each differ from their L3-2g recordings on **0 of 24**.
* **§37's 0/24 noise floor is confirmed by a third independent measurement**, not just the original
  one.
* **A harness confound was found and quantified — and the next phase must control for it.**
  Issuing a byte-identical prompt **twice inside one process** yields **3/24** divergence; the same
  prompt run in **separate processes** yields **0/24**. Cause is server-side state (cache/slot
  reuse), not sampling.

> **This is a live trap for the cross-provider run.** A comparison harness that runs its noise-floor
> control in the same process as the variant it controls will manufacture ~12% false variance and
> then attribute it to the provider. **Run each variant, and especially the repeat control, in its
> own process.**

* **Instability concentrates in one small cohort under mechanically unrelated perturbations.**
  Prompt block order destabilises `F-CL-01`/`F-CL-03`/`C-CS-05`; server cache state destabilises
  `C-CS-05`/`F-CL-03`/`F-NC-01`. The high-consequence cohort is unmoved by either. That corroborates
  §37's provider-capability reading — **at n = 1**, so it does not close terminal A.

---

## Exact recommended next action

> **Obtain one authorized hosted-provider credential.** Nothing else in this programme is blocked on
> engineering; it is blocked on this single item, and has been since §31.1 recorded it two phases ago.
>
> Then run the locked experiment unchanged against the second model:
>
> ```bash
> ONLY=V_S_STRUCT             OUT=$P/results/provider2-struct.json  npx ts-node scripts/ablate-l32g-state-separation.ts
> ONLY=V_S_STRUCT_MOVE1       OUT=$P/results/provider2-move1.json   npx ts-node scripts/ablate-l32g-state-separation.ts
> ONLY=V_S_STRUCT_REPEAT      OUT=$P/results/provider2-repeat.json  npx ts-node scripts/ablate-l32g-state-separation.ts
> ```
>
> **Three separate invocations, not one** — that is the L3-2h finding applied. 72 calls, not the 48
> L3-2g estimated, because the noise-floor control needs its own process and its own 24.
>
> The adapter work required is confined to `ollama-reasoning-provider.ts`'s transport: the same
> messages, the same JSON-schema constraint, the same temperature/seed/context settings. **Do not
> touch the scenario set, the variants, the resolver orderings or the scorers.**

**Decision rules are already fixed by the L3-2h entry contract** and must not be re-derived after
seeing output: materially better on **both** incoherence and order sensitivity → terminal A
(`CURRENT_EVALUATION_PROVIDER_NOT_VALIDATED_FOR_ADVANCEMENT`); substantially the same instability →
terminal B (`STATE_REPRESENTATION_REDESIGN_REQUIRED`); neither → C; comparator cannot satisfy the
typed-output contract → D.

### If a credential cannot be obtained

Then record it as a programme-level blocker rather than an engineering one, and take the decision
explicitly: Level-3 advancement is gated on provider availability. The alternatives are to fund a
credential, or to accept that the structural-vs-provider question stays open and that L3-3 stays
closed behind it. **Do not** substitute a second local model and report it as provider independence —
the blueprint does not establish that such a test answers the question, and L3-2h did not create that
precedent.

---

## Deferred, unchanged from §37

1. `R1_MISSING_FIRST` is still **not promoted** into `state-facts.ts` — it won on 24 known cases and
   adopting it on that basis would be tuning.
2. Clarification recall sits at **75%**, and *which* case is missed changes with block ordering.
3. The same-sense-different-object binder residual — bounded, asserted, `DISC-02`-shaped.
4. `F-FLD-159`'s class — whether one non-verbatim quotation should cost a high-consequence finding.
5. `DISC-02` — still leave it.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json` (`49aa40fd…`) and
`safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) are hash-verified unchanged, appear in **zero**
L3-2h run artifacts, and were seen by no provider. The §37.10 sampling and sealing plan is untouched
and remains the plan of record.

> `L3-3 must not start` until the high-consequence gate reaches **zero** on fresh sealed evidence with
> the clarification axis at 100/100.
