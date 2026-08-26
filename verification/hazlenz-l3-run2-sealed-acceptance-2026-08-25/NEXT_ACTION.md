# NEXT ACTION — a result exists, and it is a FAIL

## What is now established

**`claude-sonnet-5` has a Level-3 acceptance result on the Run-2 corpus: `ESTABLISHED_FAIL`.**
`L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`, on a run that was **fully provider-evaluated**
(186/186), fully schema-conforming (G10 100%) and scored by the byte-unmodified frozen scorer through
its byte-unmodified frozen validity wrapper.

This is the first substantive Level-3 model result the programme has ever obtained. It is a
measurement, not a verdict on the model in general.

## What is explicitly forbidden now

* **Do not re-run the spent Run-2 corpus.** Gauntlet offset `1` and realism offset `0` are
  permanently `RETIRED`. Re-running measures nothing.
* **Do not tune against these 93 observations.** They are burnt. Fitting to them would destroy the
  value of gauntlet offsets `2`/`3`, realism offsets `1`/`2` and the unopened `gauntlet.seed`
  (`D-72`, §29.8).
* **Do not change any threshold, denominator, gate predicate or truth label** in response to this
  result. Post-result adjustment is the failure the pre-registered contract exists to prevent.
* **Do not select Anthropic for production**, do not begin `L3-3`, do not change customer authority,
  do not deploy, commit or push. A `PASS` would not have licensed any of those either.

## What the result does NOT settle

The run measures **one model, one prompt version, one schema, one validator/binder configuration, on
one 93-row corpus.** It does not establish that the failures are the model's rather than the
configuration's. `G3` recall at 56.67% and `G9` reproducibility at 84.95% are large enough margins
that they are unlikely to be scoring noise, but **no root cause has been established by this run and
none is asserted.**

Two observations worth carrying, neither of them a conclusion:

* the failures reproduce on **INDEPENDENT** rows (68 of 93, 73.1%), not only on authored controls —
  G1's single miss and the realism recall shortfall are both independent;
* `G7` **0/11**, `G8` **0/93** and `G10` **100%** passed cleanly, so this is not a
  schema-compliance or forbidden-clarification failure.

## The decision that belongs to the user

Three broad directions exist. **Choosing among them is a product decision, not an engineering one,
and none is authorized by this run:**

1. **Accept the finding and stop pursuing Anthropic at Level 3** — `PRODUCTION_PROVIDER_SELECTION`
   stays open and the Level-1 engine stays customer-authoritative, which is already the case today.
2. **Diagnose without spending corpus** — root-cause `G3`/`G9` from the raw evidence this run already
   produced. That is zero-cost, uses no reserve, and would need its own authorization. It must be
   diagnosis only: any repair validated against these burnt rows is worthless.
3. **Authorize a Run 3 on a reserved tranche after a demonstrated, independently justified fix.**
   Gauntlet offsets `2`/`3` and realism offsets `1`/`2` remain reserved and `gauntlet.seed` is
   unopened, so a Run 3 is possible — but it is a **third spent tranche**, not a retry, and spending
   it without a real fix would burn a reserve to re-measure a known failure.

## Recorded uncertainty

The `D-97` cost model, whose authored-control token comparability was flagged as **assumed, not
proven**, turned out accurate to **0.45%**. That assumption is now supported by evidence — input
tokens were 6,027.25 mean against a projected 6,010.95. This resolves a stated uncertainty in the
cost model only. **It says nothing about the acceptance result.**
