# HS-A1 — DISPLACED-FACT ADJUDICATION RESULT

**Returned by the PRODUCT OWNER, 2026-09-04, against
`verification/expert-hazlenz-reliability-target-displacement-design-2026-09-04/HS-A1-DISPLACED-FACT-ADJUDICATION-PACKET.md`
(sha256 `79e60079bd8c9bcf704c58ecff6c74e52fa8b26e350eab279689be01690c91a6`).**

The §164 packet is unaltered and its hash above was recomputed from the file on disk after this
record was written. This is a separate record so that the question and the answer stay
distinguishable, exactly as `HS-H1-ADJUDICATION-RESULT.md` is separate from its packet.

---

## Disposition

```
HS-A1_DISPLACED_AUGER_FACT = DISPLACED_FACT_VALID_DECISION_CRITICAL
```

## The determination, verbatim

> The seven §163 auger clarifications are independently legitimate, decision-critical safety
> clarifications.
>
> They remain `OWED_TARGET_RECALL = MISS` because they do not cover the frozen HS-A1 flame-failure
> target.
>
> They are prospectively classified `SEMANTIC_OUTCOME = VALID_BUT_TARGET_DISPLACED`.
>
> They are NOT `INVALID_WRONG_FACT` and must NOT count as a clarification-precision defect.

## The boundary the determination draws, verbatim

> The observation explicitly states: "An operative is clearing a blockage at the discharge auger with
> the dryer running."
>
> The observation does not establish isolation/deenergization.
>
> Clearing/unjamming machinery can require hazardous-energy control when exposure to unexpected
> energization/startup exists.
>
> Do NOT encode an unconditional regulatory claim that every possible grain-dryer blockage-clearance
> circumstance is governed by OSHA 1910.147.
>
> The authoritative semantic conclusion is narrower: the isolation state is unresolved and can
> materially change whether clearing the blockage may safely continue.
>
> Both the flame-failure fact and auger-isolation fact may simultaneously be decision-critical.

---

## What is recorded as a consequence

| item | value |
|---|---|
| `OWED_FLAME_FAILURE_TARGET` | **still authoritative** |
| `AUGER_ISOLATION_FACT` | additional valid decision-critical fact |
| `RELATIONSHIP` | `SIMULTANEOUS_INDEPENDENT_GAPS` |
| §163 historical scoring | **immutable — the 3/10 owed-target-recall result stands unchanged** |
| prospective clarification-validity reading of the seven | `VALID_BUT_TARGET_DISPLACED` |
| clarification-precision defect count attributable to the seven | **0** |

## What this disposition does not do

It does not rescore §163, it does not broaden HS-A1's frozen target, and it does not convert a
recall miss into a recall pass. `VALID_BUT_TARGET_DISPLACED` carries `owedTargetRecall: 'MISS'` and
`clarificationPrecision: 'NOT_A_DEFECT'` in
`backend/scripts/lib/expert-semantic-outcome-v2.ts`, and `summariseOutcomes()` reports the two
dimensions as separate objects with no combined accuracy field, so the disposition cannot be netted
into a better-looking number. `assertRecallAndPrecisionNotNetted()` throws if a caller tries.

## How the disposition is encoded in code, and how it is not

The narrower conclusion — *the isolation state is unresolved and can materially change whether
clearing the blockage may safely continue* — is what the HS-A1 auger fixture in the local proof
suite states, in those terms. Its `decisionDivergence` reads:

- **if the drive was isolated**: clearing the blockage may continue as observed;
- **if it remains capable of powered motion**: whether clearing may safely continue is not
  established and must be resolved before work proceeds.

No regulatory citation, no OSHA section number and no unconditional applicability claim appears
anywhere in the fixture or in any of the seven new modules. The prohibition in the determination is
honoured by the absence rather than by a comment saying it was honoured.

## The mechanism that would have prevented the §163 failure

Under the architecture implemented in §165, the seven displaced draws would each have added the
auger fact **alongside** the flame-failure fact rather than in place of it. This is proven
mechanically rather than argued: `test-expert-bounded-reliability-architecture.ts` case **R1**
replays all ten stored HS-A1 draws through the binding architecture and records

```
0 erasures · 7 draws carried both facts · 3 draws bound the owed key
TARGET_COVERAGE_WARNING true on 7/10
```

The seven draws that displaced the target in §163 leave the owed flame-failure key **`UNRESOLVED`
and named in `uncoveredFactKeys`** in every one of the seven. Silent displacement is not detected
after the fact; it is structurally unrepresentable, because `nominateAdditiveFact()` has nowhere in
its signature to name a fact to remove.

**Reviewer:** product owner · **Date:** 2026-09-04
