# §277 evidence package — local product baseline closure

Produced 2026-09-13 on `beta/expert-hazlenz-validated-candidate-2026-09-12`. §277 closed the
three product-owner decisions §276 left open, hardened disposable-resource cleanup, and froze
the local baseline. It did NOT reopen whole-product validation — the §276 package remains the
validation evidence and is unchanged.

No customer data. No secrets. No production interaction of any kind. Zero provider calls.

## Contents

| Path | What it is |
|---|---|
| `results/hazlenz-human-assertion.txt` | D-023, 47 checks — a generic confirmation settles nothing; an explicit answer about a named fact settles that fact with `human_asserted` provenance |
| `results/hazlenz-routing-floor.txt` | D-024b, 26 checks — the 0.50 customer-visible routing floor, the known 0.2 "wall" case, and the governed-evidence exemption |
| `results/277-report-revision.txt` | D-028, 38 checks — an issued report is immutable; a correction creates a new revision and the prior artifact is superseded and retained |
| `results/277-disposable-cleanup.txt` | 19 checks — an older unrelated disposable database survives the cleanup of a new run |
| `results/117-guarding.txt` | §117 re-run after all three changes: 16/16, 0 dangerous |
| `results/decision-probes-live.json` | The three decisions measured against the running stack, before and after, with predicate provenance and routing notes |
| `results/report-revision-history-live.json` | The live revision history of inspection #6's report: `/2` superseded by `/3`, both retained |
| `results/post-change-walkthrough.json` | The product walkthrough re-driven after all three changes — 25/25 |
| `results/post-change-gap-closure-ui.json` | The §276 UI gap suite re-driven — 28 pass, 1 note, **0 fail** (§276's only failing check, E05, is now closed by D-023) |
| `results/final-db-reconciliation.json` | Row counts in `test_insite_validation_275` immediately before it was dropped |
| `results/localhost-cleanup.json` | Exactly what was deleted, exactly what was deliberately not, and why |
| `DIGEST.txt` | sha256 of every file in this package |

## Reading the decision probes

`decision-probes-live.json` is the shortest statement of what changed:

* **D-023** — the same observation, three ways. No answer: `UNKNOWN 0.45`. An explicit
  "Yes" to the predicate the engine named: `SUPPORTED 0.96`, with the predicate carrying
  `provenance: human_asserted`. A generic "Agree with finding": `UNKNOWN 0.45`, unchanged.
* **D-024b** — the safe bench-grinder observation now yields **zero** proposed hazards, and
  `routingNotes` records the `ground_control` route that was withheld and why.

## Commands

```
npm run test:hazlenz-human-assertion        # D-023
npm run test:hazlenz-routing-floor          # D-024b
npm run test:277-report-revision:db         # D-028 (disposable database)
npm run test:277-disposable-cleanup         # cleanup ownership safety
npm run disposable:cleanup                  # reports; deletes nothing without --run/--abandoned
```

## Provider accounting

**Zero provider calls.** §277 changed no Expert prompt, wire schema, admission rule or
verifier, and ran no hosted capability cohort. Cumulative §§275–277 spend is unchanged at
**$0.375220** of the $1.50 ceiling, 3 analyses of 6.
