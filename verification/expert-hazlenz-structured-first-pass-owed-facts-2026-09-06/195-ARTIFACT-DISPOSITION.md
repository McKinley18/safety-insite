# §196 — disposition of every §195 artifact

**§195 is preserved exactly as an execution-inconclusive pre-spend run.** Nothing in its package was
edited, and the §196 integrity gate asserts that positively: `EXECUTED = false`,
`PROVIDER_CALLS = 0`, `ACTUAL_PROVIDER_SPEND_USD = 0.0`, and **each of the eleven absent execution
artifacts is still absent** — checked file by file, not asserted in prose. §195 is not a behavioural
failure and is not described as one anywhere.

The §195 cohort is **not** a completed validation cohort. No synthetic execution evidence was created.

## Why a disposition is owed at all

§195 froze a protocol identity that included `first-pass system prompt 20979d90…` and
`admission contract hazlenz.expert.verifier.v3.2`. §196 changes the system under test at the
first-pass stage. **§195's preregistration did not, and could not, freeze a protocol that did not yet
exist** — its own `systemUnderTest` names a stage that had no implementation. Pretending otherwise is
the failure this document exists to avoid.

## Disposition

### REUSABLE_UNCHANGED

| artifact | why |
|---|---|
| `PIPELINE-STAGE-BLOCKER.md` | the root-cause finding. §196 acts on it; it does not supersede it |
| `CITATION-RELIANCE-COLLISION.md` | the second zero-spend finding. Its preferred option is what §196 implemented, and case **L1** reproduces the collision against the unmodified v3.2 boundary |
| `RUN-SUMMARY.json` | the record that §195 stopped before spend, and why |
| `SOURCE-INTEGRITY.txt`, `PROTOCOL-HASHES.txt` | historical record of what was frozen on 2026-09-06 before §196 existed. Preserved as history, **not** as a plan — see RETIRED below |
| the **12 raw observations** inside `FIXTURE-MANIFEST.json` | raw input is protocol-independent. A first pass reads the same observation whichever protocol it is run under |
| the **semantic rubric concepts** — `owedProperty`, `conjuncts`, `adjacentPropertiesEstablished` | these describe the world, not the wire |

### REUSABLE_WITH_NEW_PREREGISTRATION

| artifact | what must change, and why |
|---|---|
| `TRUTH-MANIFEST.json` | the expected owed facts remain valid **scoring truth** and were verified verbatim against their observations. Two adjustments are needed. (1) Identity: the manifest already uses `factKeyIntent` — a semantic intent label, never an identity — which is compatible with §196's computed `factKey`, but the new preregistration must state that recall is scored against the intent semantically and **never** by key equality, because a computed key encodes a span offset and two correct declarations may anchor differently. (2) `evidenceSpan`: still required verbatim, but now supplied by the model rather than authored, so the expected span is a scoring reference and not a target the model is shown |
| `FIXTURE-MANIFEST.json` (as a whole) | the row set and family coverage survive; the manifest must be re-frozen against the vNext protocol hashes |
| `GOVERNED-EVIDENCE-MANIFEST.json` | `noCitationShapedText` was a **design-around** for the §193/§194 collision, and the freeze script aborts if supplied governed text contains a citation. v3.3 removes the reason for it. The next cohort should include governed text that **does** carry citations — that is the live-registry case §195 warned about — and the abort must be relaxed deliberately, under a new preregistration, rather than quietly |
| `EXECUTION-ORDER.json` | the interleaving method and the seed are sound; the frozen order must be re-derived because the execution plan is now attached to different protocol hashes |
| `PREREGISTERED_THRESHOLDS` (the fourteen values inside `PREREGISTRATION.json`) | the values were frozen without reference to any observed output and remain untainted. They must be **re-stated in a new preregistration**, not inherited by reference, because several of them — `FIRST_PASS_OWED_FACT_RECALL`, `FIRST_PASS_OWED_FACT_PRECISION`, `MULTI_GAP_PRESERVATION`, `TRANSFER_FIDELITY` — were unmeasurable when written and now describe a stage that exists |
| `MECHANICAL_GATES` | reusable in substance. One gate needs re-wording: `rawProhibitedCitationAdmitted` must now distinguish an **unauthorised** citation from an authorised supplied-source reuse, or it will fire on the behaviour v3.3 deliberately admits |
| `backend/scripts/lib/expert-e2e-cohort-2026-09-06.ts` | the cohort module; re-freezable against the new protocol |
| `backend/scripts/freeze-195-cohort-2026-09-06.ts` | the freeze machinery; needs the governed-citation abort revisited as above |

### RETIRED_FOR_NEW_PROTOCOL

| artifact | why |
|---|---|
| `PREREGISTRATION.json` / `PREREGISTRATION.md` **as a frozen preregistration** | its `firstPassIdentity` pins v15's prompt and file hashes, and its `systemUnderTest` names a stage that had no implementation. A run under vNext is not the run this document preregistered. It is preserved as history and must not be cited as the preregistration of any future execution |
| `PROTOCOL-HASHES.txt` **as an execution plan** | the first-pass identity in it is v15's. A vNext run has a different prompt hash (`05e1ad22…`) and a different schema |
| the two **outcome-defined fixture families** as input families | already retired by §195's own design finding, and §196 confirms it. `EXISTING-SUFFICIENT-FIRST-PASS-QUESTION` and `FIRST-PASS-INSUFFICIENT-QUESTION` are **observed first-pass outcomes**, not properties a fixture can carry. §192 could guarantee them only because its first-pass sets were hand-authored. See below |

## The outcome-defined families, preserved as a design constraint

Future preregistration **must not** guarantee those two families by construction. It must instead
preregister scoring categories:

```
if the first-pass clarification is sufficient   →  test verifier PRESERVATION
if the first-pass clarification is insufficient →  test verifier REPAIR
```

and report **realised opportunity counts after execution**. Rows may carry
`sufficientQuestionLikelihood` as design intent; scoring must record what actually happened. Truth
must not be altered after observing them.

This is the same denominator discipline the programme applies elsewhere: a behavioural rate is
occurrences over the executions where the behaviour was **genuinely available**, and the cohort must
be described by realised opportunity rather than by intent.

## What §196 did NOT do to §195

- did not execute the frozen §195 cohort, automatically or otherwise
- did not create any of the eleven absent execution artifacts
- did not edit any §195 file
- did not re-freeze, re-preregister or re-cost anything
- did not describe §195 as a provider, model or infrastructure failure

## Spend

**No spend is authorised by §196 and none occurred.** A fresh prospective authorization is required
before any execution, and it must carry its own preregistration built on the dispositions above.
