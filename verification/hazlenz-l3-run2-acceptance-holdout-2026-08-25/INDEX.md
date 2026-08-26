# INDEX — L3 Run-2 Acceptance Holdout, constructed and frozen (2026-08-25)

Terminal: **`L3_RUN2_ACCEPTANCE_HOLDOUT_FROZEN — PROVIDER_CAPACITY_GATE_REQUIRED`**
**`RUN2_HOLDOUT_SPENT = FALSE`** · `RUN1_HOLDOUT_SPENT = TRUE`

| path | what it is |
|---|---|
| `STATUS.md` | the result, the order things happened in, the `G1` = 36 finding |
| `NEXT_ACTION.md` | the capacity gate, and why callability alone is no longer sufficient |
| `FINAL_STATE.txt` | terminal, state bits, identities, results |
| `HOLDOUT_FREEZE.txt` | **`67e6b47c…`** — written **before** the builder existed, never rewritten |
| `ACCEPTANCE_ARTIFACT_FREEZE.txt` | the complete Run-2 acceptance configuration |
| `ACCEPTANCE_ARTIFACT_MANIFEST.txt` | 15 components → identity **`9c74ffd4…`** (`189a3cbf…` NOT reused) |
| `analysis/preselection-gate.js` · `PHASE3_PRESELECTION_GATE.txt` | **51/51 MATCH**, run before selection code existed |
| `builder/authored-controls-run2.js` | the **25 fresh** controls, from the F1–F8 table alone |
| `builder/build-holdout-run2.js` | the builder: drift guards, derived offsets, `D-D.6` throws, ordering |
| `holdout/holdout-l3-acceptance-run2.json` | **`f887cfd1…`**, 107018 bytes, **93 rows** |
| `rebuild/holdout-l3-acceptance-run2.json` | byte-identical rebuild, `cmp` 0 |
| `validation/validate-holdout-run2.js` · `STRUCTURAL_VALIDATION.txt` | **61 checks, 61 PASS, 0 FAIL** |
| `validation/OVERLAP_SURFACES.txt` | **84 surfaces, 0 collisions**; surface 8 = the spent Run-1 holdout |
| `validation/REBUILD_PROOF.txt` | first materialization == rebuild |
| `scorer/acceptance-scorer-v2.frozen-copy.js` | **`b9a0a6bc…`**, verifies the original's digest and throws |
| `scorer/synthetic-run2-tests.js` · `SYNTHETIC_SCORER_VALIDATION.txt` | **71 assertions, 71 PASS, 0 FAIL** |
| `preservation/PRESERVATION_PRE.txt` | 15 frozen identities recomputed, OK 15, DRIFT 0 |
| `preservation/UNSPENT_AND_PRESERVATION_POST.txt` | Run-2 unspent proof, Run-1 preserved, egress audit |

**The original scorer is NOT in this package** — `ea5e50ae…` lives in the Run-1 package and is
**byte-unchanged**; the v2 layer requires it by path and digest.

**Not in this package, because it was not done:** any provider call, probe, credential access,
inference, acceptance result, or any reuse of the spent Run-1 corpus.
