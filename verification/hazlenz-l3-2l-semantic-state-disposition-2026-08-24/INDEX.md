# L3-2l — evidence index

`L3_2L_COMPLETE — SEMANTIC_STATE_REJECTION_DELETION_RETAINED` · **CLASS A** · blueprint **§44** ·
decision **`D-65`** · HEAD `1feda622` · **zero inference, zero production change**

| file | what it is |
|---|---|
| `STATUS.md` | the architecture decision: the structural finding, the full inventory, the authority analysis disposition by disposition, and the measured counterfactual |
| `NEXT_ACTION.md` | what is closed so it is not re-derived, and the unchanged programme decision |
| `inventory/DISPOSITION_ANALYSIS.json` | **the deliverable.** All four dispositions costed over the 52 distinct (scenario, proposed-state) pairs using the SHIPPED scorer's own `asserts := some candidate at ACTIVE` semantics, plus the structural finding that `ACTIVE` is absent from `checkStateSupported`'s `required` map |
| `inventory/semantic-state-rejection-inventory.json` | the complete `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` inventory — 84 occurrences, 46 scenarios, 34 artifacts, 1,871 records scanned |
| `inventory/build-inventory.js` | builds the inventory. Read-only over already-open artifacts; imports no production module |
| `inventory/build-disposition-analysis.js` | builds the counterfactual. Models the shipped scorer semantics, which it documents in its own header |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, branch, upstream 0/0, 23 tag objects, 4 untouched stashes, shipped prompt digest, all 19 `reasoning-l3` module digests, sealed corpus hash-verified and unopened, and a **zero-call** egress account |
| `regression/` | 814 L3 assertions / 0 failed over 10 suites; KG contracts; `hazlenz-core` 28/30 suites (the two §13.1 failures only); both `tsc` clean |

**Nothing implemented. No production file, shipped prompt, shipped schema, scorer or historical
harness touched. No new holdout. No sealed corpus opened. No provider selected. L3-3 not begun.**
