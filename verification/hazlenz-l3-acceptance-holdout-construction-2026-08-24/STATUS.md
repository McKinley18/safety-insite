# L3 ACCEPTANCE HOLDOUT CONSTRUCTION — BLOCKED AT THE PHASE 0 EXECUTABILITY GATE

> ## `L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — PLAN_NOT_EXECUTABLE_AS_PREAUTHORIZED`
> ## `NEGATIVE_CONTROL_PROCEDURE_NOT_PREDECLARED` — independently satisfied at Phase 3
> ## `NO HOLDOUT WAS BUILT` · `NO HOLDOUT_FREEZE.txt WAS WRITTEN` · `SEALED_STRIDE_NOT_EXPOSED — NOT_SPENT`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **Zero inference of any kind, hosted or local.
Zero API requests. Zero provider probes. No credential read — none was required, and Phase 8 states
credential presence is not a precondition for this phase.** The three protected sources were **not
opened for evaluation**, and their hashes are byte-identical before and after. Nothing was
committed, pushed, deployed or stashed; no gate was changed; L3-3 not begun.

> **The construction phase stopped where it was told to stop.** It was authorized to *execute* the
> approved evidence plan, and forbidden to *invent* a selection rule. Measured against the actual
> source files, the plan cannot be executed without inventing one.

---

## 1 — What this phase was, and what it did not become

L3-FA's `D-83` found that the acceptance holdout *"has never been built"* and directed a separate
construction phase to execute the plan's sealing procedure in order. This is that phase. It ran
Phase 0 (blueprint-first reconciliation) and Phase 1 (source preservation), and stopped at Phase 0's
terminal gate before Phase 2 could predeclare a construction identity.

**Phases 2 through 10 were never reached.** In particular: **no `HOLDOUT_FREEZE.txt` exists for this
attempt** — writing one would have required recording a stride rule the plan does not contain — no
builder was written, no row was selected, no negative control was authored, no holdout artifact was
materialised, and no acceptance scorer was written.

---

## 2 — Phase 1 `PASS` — source preservation and integrity

All three protected sources re-derived from the actual files and matched the pre-authorization
record exactly.

```
a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4  safescope-gauntlet.source.v1.json   150 rows · 184,988 B
49aa40fdcc507d549f22b59c9791823c3f1196034543df1746c8eb5d857b73fe  safescope-gauntlet.seed.json        100 rows ·  77,638 B
6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb  safescope-field-realism-pack-v2.v1.json 117 rows ·  87,460 B
```

**MATCH: 3 of 3.** Mutually disjoint: 0 normalised-text intersections across all three pairs.

**The expected aggregate of 366 reconciles, with one clarification.** Raw rows total **367**;
**distinct normalised texts total 366** — `gauntlet.seed` carries 100 rows but 99 distinct texts, one
internal duplicate pair. The `366` of record is a distinct-text count. Recorded because the reserve
tranche's duplicate policy will meet it; it does not touch the two sources this phase would have
drawn from.

**Plan characterisation verified** for `gauntlet.source.v1` on every claim: severity 103 critical /
36 high / 11 medium (**139 of 150 high-consequence** ✓), sourceType 66/51/33 ✓, agency OSHA 84 /
MSHA 66 ✓, 21 families ✓, `sourceId` on 150/150 ✓. **One claim did not verify** — see §3, E-3.

---

## 3 — Phase 0 `FAILED` — four measured defects, each independently blocking

Full reasoning and evidence: **`analysis/PLAN_EXECUTABILITY_ADJUDICATION.md`**.

| # | defect | consequence |
|---|---|---|
| **E-1** | The stride is a **shape, not a rule** — *"take a fixed stride"* names no modulus, no offset and no reservation schedule. Prior freezes recorded concrete rules (L3-2f: `i % 5 === 3`). Worse, the plan's own sizing clauses **conflict**: *"roughly 45 rows"* implies a non-integer stride of 3.33; *"roughly four future runs"* implies `i % 4` → 37–38 | Choosing the modulus and offset decides **which regulator records are graded against G1** (high-consequence misses = ZERO). §51.2 already recorded this: *"no concrete stride is declared, and declaring one now would be inventing the selection"* |
| **E-2** | The rule is **literally inapplicable** to the realism pack. It sorts by `scenarioId` and carries `observation`. **Measured: `scenarioId` present on 0 of 117 rows; `observation` present on 0 of 117 rows.** The file carries `id` and `hazardObservation` | No stride can address the source without an **undeclared field mapping**. Phase 7 must prove every observation *"copied verbatim from its authorized source"* — unprovable against an undeclared carrier |
| **E-3** | The **ambiguity denominator is undetermined** — striding over all 117 rows and striding over the flagged subset are different sets, and **G3 gates recall on both registered denominators**. Separately, the figure of record is **wrong**: the plan and §37.10 state `shouldHaveMissingEvidence` is *"declared on 92 rows"*; **measured `true` on 87, `false` on 2, absent on 28** | The 92 traces to `source-survey.json`'s `"ambiguityish": 92` — a **heuristic text signal**, not the declared field. The source is unmodified; **the record is wrong, not the data**. A frozen gate's denominator cannot be set from it, and correcting a `PROTECTED_DECISION` is not this phase's authority |
| **E-4** | **Phase 3 gate — negative-control procedure not predeclared.** The plan fixes a count (~25), a provenance class (AUTHORED) and a reporting rule (separately). It fixes **none** of the seven bases Phase 3 requires: control families · transformation rules · expected state · expected clarification behaviour · expected MUST-NOT-ASK behaviour · provenance marking · duplicate/overlap rejection | The phase would have to invent which families to negate and **which rows must not ask** — the direct input to **G7**. A phase that authors its own MUST-NOT-ASK rows and is then graded on G7 **grades itself**, reproducing the §36.10 weakness the plan exists to close |

### 3.1 Why none of this was repaired in place

Each defect fixes a number a **frozen gate** will later be measured against — G1's selection, G3's
denominator, G7's controls. `D-72` stands: *changing a requirement is the user's call, never a
response to a provider failing it.* **Choosing those numbers inside the phase that builds the exam is
the same failure in a different order**, and the command forbids it in terms: *"Do NOT invent a new
stride-selection rule · Do NOT choose rows manually · Do not silently repair a blocked condition."*

**The gates were not touched.** G1–G10 stand exactly as pre-registered at `D-84`.

### 3.2 Contamination discipline held

**The positive stride was not opened to learn what negative controls would be useful** — the exact
ordering Phase 3 mandates. All measurement in this phase read **field names, row counts, structural
flags and normalised-text intersection counts only**; it printed no observation text and no scenario
identifier, the same class of act as `survey-l32g-evidence-sources.ts` under `D-83`.

---

## 4 — This is not a defect in the sources, the engine, or the model

The two acceptance sources are **exactly as good as §37.10 says they are** — 150 regulator-derived
rows, 139 of them high-consequence, 21 families, ten weeks older than the programme, provably
disjoint. Nothing here impugns them, and **nothing is retired**.

`claude-sonnet-5` was not called. **`D-70` and `D-77` are unchanged and untested by this phase.**
There is no model performance result here, because no inference occurred.

`D-79`…`D-82` are unaffected — the provider-side, privacy, model-identity and single-use
prerequisites remain genuinely closed. `D-83`'s artifact-level precondition remains **unsatisfied**:
the holdout still does not exist.

---

## 5 — Terminal state

> ### `L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — PLAN_NOT_EXECUTABLE_AS_PREAUTHORIZED`
> ### `NEGATIVE_CONTROL_PROCEDURE_NOT_PREDECLARED` — independently satisfied at Phase 3

Both are recorded because resolving E-1…E-3 alone would still leave E-4 blocking. **A future
authorization must close both.**

**Was any stride exposed or spent? NO.** Not opened, not previewed, not selected, not inspected.
**Remaining unopened independent evidence: ALL 366 distinct rows** — `gauntlet.source.v1` 150 ·
`gauntlet.seed` 99 · `field-realism-pack-v2` 117. Roughly four acceptance runs. Nothing retired.
