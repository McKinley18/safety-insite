# L3-2h resume — what remains, and the exact next action

> This is the **resume's** NEXT_ACTION. The L3-2h original at
> `verification/hazlenz-l3-2h-cross-provider-2026-08-23/NEXT_ACTION.md` is left
> **byte-unmodified** as that phase's historical evidence.

## Terminal

> ### `L3_2H_BLOCKED — SECOND_PROVIDER_CREDENTIAL_REQUIRED`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

The resume existed to execute the previously blocked comparison. **It still cannot
be executed.** No authorized independent second-provider credential is reachable,
so entry-contract phases 3–8 did not run and **no decision class A/B/C/D can be
claimed** — each presupposes a measurement that does not exist.

## Is L3-3 eligible?

**No**, and nothing here changes that. The high-consequence gate has never been
demonstrated at zero on fresh sealed evidence, and no fresh sealed evidence has
been consumed. Family coverage stays complete at 24 of 24.

## What changed since §38, and what did not

**Changed — one thing, and it is small but real.** §38.1 called `OPENAI_API_KEY` a
placeholder from its **length class**. The resume presented it to the provider and
got **HTTP 401**. The conclusion is identical; the evidence is now direct. A future
attempt should not spend time re-examining that variable.

**Unchanged — everything else.** Same single stub key, same absence of every other
provider variable and credential file, same one local model at the same pinned
digest. §31.1 → §38.1 → §38.8: **three phases, no movement.**

## Exact recommended next action — NOT executed

> **Obtain one authorized hosted-provider credential.** This is the whole of the
> blocker. It is a **programme-level** decision, not an engineering task: nothing
> else on the Level-3 critical path is waiting on code.

Then run the locked experiment unchanged, **three separate invocations**:

```bash
ONLY=V_S_STRUCT        OUT=$P/results/provider2-struct.json  npx ts-node scripts/ablate-l32g-state-separation.ts
ONLY=V_S_STRUCT_MOVE1  OUT=$P/results/provider2-move1.json   npx ts-node scripts/ablate-l32g-state-separation.ts
ONLY=V_S_STRUCT_REPEAT OUT=$P/results/provider2-repeat.json  npx ts-node scripts/ablate-l32g-state-separation.ts
```

**72 calls, not 48.** Three processes, not one — §38.3's cache/slot-reuse finding
is a live trap: a harness that runs its repeat control in the same process as the
variant it controls manufactures ~12% false variance and then blames the provider.

Adapter work stays confined to transport. **Do not touch** the scenario set,
variants, resolver orderings, scorers, labels or thresholds. The A/B/C/D rules are
fixed by the entry contract and **must not be re-derived after seeing output**.

## If a credential still cannot be obtained

Take the decision explicitly rather than letting it sit: **Level-3 advancement is
gated on provider availability.** The alternatives are to fund one credential, or
to accept that the provider-vs-representation question stays open and that L3-3
stays closed behind it.

**Do not** substitute a second local model and report it as provider independence.
The blueprint does not establish that such a test answers the question, §38.1
refused it, and this resume refused it again.

## Deferred, unchanged from §37.11 and §38

1. `R1_MISSING_FIRST` still **not promoted** into `state-facts.ts` — it won on 24
   known cases; adopting it on that basis would be tuning.
2. Clarification recall sits at **75%**, and which case is missed moves with block
   ordering.
3. The same-sense-different-object binder residual — bounded, asserted, `DISC-02`-shaped.
4. `F-FLD-159`'s class — whether one non-verbatim quotation should cost a
   high-consequence finding.
5. `DISC-02` — still leave it.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json`
(`49aa40fd…`) and `safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) are
hash-verified unchanged, appear in **zero** artifacts of this resume, and were seen
by no provider. §37.10's sampling and sealing plan is untouched and remains the plan
of record.

> **It must not be spent merely because a provider was tested** — and here, none was.

> `L3-3 must not start` until the high-consequence gate reaches **zero** on fresh
> sealed evidence with the clarification axis at 100/100.
