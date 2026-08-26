# NEXT ACTION — root cause is established; the decision is now a governance one

## What is settled

Root cause is established for **every** failed gate, at `$0.00`. **All 30 failing rows are
provider-origin; none is pipeline-origin.** Two independent defect families exist:

* **deterministic reasoning-calibration** — `RC-1` clarification calibration (G3 13 misses, G2 4
  over-asks) and `RC-2` `ACTIVE` on undecided truth (G4 4, `F6` 3 of 4). Reproduces identically in
  both processes.
* **sampling non-determinism** — `RC-3` (G9 14 divergences) and `RC-4` (the single G1/G5/G6 row plus
  4 ungrounded-corrective-action rejections). Exists only because outputs do not reproduce.

They are largely disjoint: 11 of the 14 G9 rows fail G9 **only**.

## What blocks a Run 3 today

**`G9` is a hard gate at 100% cross-process reproducibility, and the frozen shim measured that
neither `temperature` nor `seed` can be sent to this provider** (`D4`/`D5`). A Run 3 would fail G9
**however well every other gate were repaired**. Spending a reserved tranche now would burn a
single-use corpus to re-measure a gate that is currently unreachable.

**No root cause is classified `LOCAL_REMEDIATION_CANDIDATE.`** Nothing in the evidence identifies a
defect in code this programme controls whose repair would move a failed gate.

## The decision that belongs to the user

Four directions. **None is authorized by this phase, and this phase recommends none of them as a
foregone conclusion:**

1. **Accept the finding and stop pursuing `claude-sonnet-5` at Level 3.** Nothing changes for
   customers: the Level-1 engine is already customer-authoritative and provider selection is already
   open.
2. **Qualify a different provider or model against the same frozen contract.** `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`,
   and the reserved tranches were built for exactly this. Note that `RC-3` would need re-testing per
   provider — determinism control is a **provider property**, and the two previously qualified
   providers were never measured at n=93 across two isolated processes.
3. **Open a governance review of `G9`'s 100% cross-process requirement.** This is legitimate *as a
   governance act*, but it must be argued on whether the requirement is right **in principle** — not
   because this run failed it. **This phase does not propose it and did not reclassify the gate.**
4. **Attempt architectural remediation of `RC-1`/`RC-2` first**, validated on **non-holdout
   development cohorts**, with a Run 3 authorized only after a fix is demonstrated *and* the `G9`
   question is resolved. Note `D-59` already **measured** that activating the second clarification
   carrier *reduced* high-consequence recall 12/13 → 9/13, so the obvious lever is already known to
   backfire.

## Still forbidden

Re-running the spent Run-2 corpus · tuning against its 93 observations · changing any threshold,
denominator, gate predicate or truth label in response to the result · selecting Anthropic for
production · beginning `L3-3` · changing customer authority · deploying · committing · pushing.

## The evidence limit worth knowing before any remediation attempt

**Raw model prose was not persisted** — only structured post-validator views. That was sufficient to
establish *which layer* each failure originates in, but **not** *why* the model declines to ask a
question or whether a different prompt would change it. Any future remediation phase that needs that
should **persist raw proposal bodies on development cohorts**, where doing so costs no sealed corpus.
