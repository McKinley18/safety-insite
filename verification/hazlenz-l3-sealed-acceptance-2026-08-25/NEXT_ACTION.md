# NEXT ACTION — NOT EXECUTED BY THIS PHASE

The single-use acceptance corpus is **spent** and the measurement was **not obtained**. The user has
chosen the path: **build a fresh holdout from an unspent reserved offset**, rather than re-run the
spent one.

**This phase does not build it.** Holdout construction has been a separately authorized phase every
time (`D-85` blocked, `D-87` attempt 1, `D-89` attempt 2), and the authorization this phase ran under
covers the acceptance run only and explicitly forbids changing the holdout.

## What is already determined, and needs no new decision

The reservation schedule is **frozen and immutable** (`D-A.11`, `D-B.11`). Run 2 is not a choice:

| stratum | source | offset | rows |
|---|---|---|---|
| `INDEPENDENT_GAUNTLET` | `gauntlet.source.v1` | **1** (run 2 in the cyclic schedule `0→1→2→3`) | **38** |
| `INDEPENDENT_REALISM` | `field-realism-pack-v2` | **0** (run 2 in the cyclic schedule `3→0→1→2`) | **30** |
| `AUTHORED_CONTROL` | authored from the frozen F1–F8 table | — | **25** |
| **total** | | | **93** |

93 is inside the plan's `~90–100` band. Selection rules, comparator, verbatim carriage, drift guard,
duplicate rejection and ordering are all unchanged and mechanical. `G4 = 21` and `G7 pole = 11` are
properties of the authored family specification and are unchanged. **`|DEN_A|` must NOT be computed
now** — `D-B.3` requires it be discovered from frozen metadata *after* selection, and precomputing it
would be the exact defect `E-3` identified.

**The frozen scorer needs no change to score a 93-row holdout.** It is generic over
`holdout.rows` and the `expect` flags.

## The one genuine decision, which belongs to the user

**May run 2 reuse the same 25 authored control observations, or must it author 25 new ones?**

- `D-D.6` overlap surface 5 checks every authored control against **every prior sealed holdout**.
  `holdout-l3-acceptance-attempt2.json` is now a spent prior holdout, so reusing its 25 texts
  **would THROW**.
- Against that: those 25 authored rows were **rejected at the provider and never answered** — the
  model has never seen a single one of them.

**Recommendation: author 25 new controls (the strict reading).** A spent tranche is retired
*whatever the result* (§29.8), authoring 25 fresh rows from the frozen F1–F8 table is mechanical and
cheap, and relaxing a protected overlap rule to save that work would weaken a rule for convenience —
which is what `D-72` exists to prevent. The alternative is defensible but requires an explicit
amendment, not a construction-phase judgement call.

## One improvement worth authorizing with run 2

**Abort-before-burn on a permanent provider error.** This run issued **144 doomed calls** after the
provider began rejecting everything, and then produced a scored artifact whose passes were vacuous
and whose failures were not the model's. A frozen rule — *on the first `PERMANENT_CONFIGURATION_ERROR`,
stop the run and emit `PROVIDER_CALLABILITY_FAILURE` instead of continuing* — would have stopped at
row 41 and produced an honest terminal directly.

Relatedly, the scorer has **no invalidity predicate for "the provider refused to answer"**. Adding
one is a **governance act**, must be authorized explicitly, and must be done **before** the next run
so it cannot be shaped by a result. It would only ever move a run from a misleading `FAILED`/vacuous
`PASS` to `NOT_SCORABLE`; it can never turn a failure into a pass.

**Note:** the credit exhaustion could not have been prevented by a pre-flight probe — row 1 succeeded
and the balance ran out mid-run.

## Not authorized by anything in this package

Re-running the spent holdout · reusing gauntlet offset `0` or realism offset `3` · altering any gate,
threshold or truth field · tuning or remediating against any holdout observation · treating the 40
answered rows as partial advancement evidence · selecting a production provider · beginning `L3-3` ·
changing customer authority · deployment, commit or push.
