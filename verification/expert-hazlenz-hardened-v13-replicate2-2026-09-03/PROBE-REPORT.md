# §153 — Hardened v9 / v13 Replicate 2. Run-to-Run Variance Characterization.

**Terminal:**

```
EXPERT_HAZLENZ_HARDENED_V13_REPLICATE_FAILED — NONSTABLE_CLARIFICATION_VARIANCE_REQUIRES_ADJUDICATION
```

Phase 12 **CASE C**. **CASE D also applies on its literal terms** and is reported as a co-equal
finding (§6).

> ## THE PROGRAMME'S CENTRAL ASSUMPTION DOES NOT HOLD.
>
> **6 of 16 rows are fully stable across two executions of identical material.** Candidate-state
> agreement is **7 of 16**. Two rows flipped clarification presence outright — one of them from an
> **exact recovery** in replicate 1 to **silence** in replicate 2.
>
> **Every semantic conclusion in §147–§152 rests on a single draw from a distribution this run shows
> to be wide.** That is a larger finding than any of the individual defects those sections named.

**16 calls, 16 requests, 0 retries, $0.784426** of a $1.6640 enforced ceiling. v13, `analysis.v2`,
arbitration and the v9 fixture bytes all byte-unchanged; **v14 does not exist**.

---

## 1. Freeze and identity

```
operation                    hardened-v9-v13-baseline-replicate-2   (REPLICATE_OF §152)
v9 digest        before/after 434c127c…a7fe194 / 434c127c…a7fe194   UNCHANGED — the authorized value
v9 file sha256   before/after 09195af8…1545cb / 09195af8…1545cb     UNCHANGED
prompt module sha256          02977c309f6d3e37…  = §150 = §152      v13 FROZEN
system-prompt sha256          c4b3162439988e74…  = §150 = §152
adjudication sidecar sha256   38de42ab951653dc…  frozen 0444 BEFORE any provider call
degenerate detector           hazlenz.expert.degenerate-output-detector.v1
family comparison map         hazlenz.expert.family-comparison-map.v1
sampling                      temperature / top_p / top_k NOT SENT (HTTP 400); NO seed
                              THIS RUN IS NOT DETERMINISTIC. NO EXACT REPRODUCTION IS ATTEMPTED.
retry policy                  NONE — and no rerun of a degenerate row under any circumstance
pre-spend gate                50 / 50 PASS at $0.00
linter after execution        PASS
```

**The sidecar was written, hashed and made read-only before the run**, so no denominator could be
chosen after seeing the data. §151 found four answer-key defects, every one in the model's favour;
a post-hoc denominator would have been that failure wearing a different hat.

---

## 2. The three views — reported separately, never substituted

|  | REQUIRED spoke | FORBIDDEN silent |
|---|---|---|
| **A · LITERAL** — every authored v9 row as frozen | **5 / 8** | **7 / 8** |
| **B · PREREGISTERED ADJUDICATED** — minus the sidecar's HS-F1 and HS-M1 | **4 / 7** | **7 / 7** |
| **C · EXECUTION-VALID** — B minus rows the detector condemned in *this* replicate | **4 / 7** | **6 / 6** |

REQUIRED silent in all three views: **HS-A1, HS-E1, HS-H1**.

Loose counts. Strict recall is adjudicated below.

### Replicate 1 versus replicate 2, side by side

|  | §152 replicate 1 | §153 replicate 2 |
|---|---|---|
| REQUIRED spoke (literal) | 7 / 8 | **5 / 8** |
| FORBIDDEN silent (literal) | 7 / 8 | 7 / 8 |
| clarifications emitted | 9 | **6** |
| degenerate rows | 1 (`HS-A1`) | 1 (**`HS-K1`** — a *different* row) |
| `HAZARD_SEVERITY` | 0 | **0** |

---

## 3. PHASE 8 — the HS-H1 stability test

**Classification: `D` — SILENCE. The §152 failure is REPLICATED, by a different mechanism.**

| replicate | outcome | Phase 8 class |
|---|---|---|
| §152 | asked about the deliberate **alarm distractor** instead of the cooling hold | **C** — distractor selection |
| §153 | **emitted no clarification at all** | **D** — silence |

**And replicate 2 is worse than plain silence — it is a RETAINED-BUT-NOT-ASKED.** The model left
`cand-steam-release` at `INSUFFICIENT_EVIDENCE` and wrote an explicit uncertainty statement:

> *"It is not established whether the zero pressure gauge reading was cross-verified against an
> independent indicator or whether **residual steam pockets could remain trapped within the load
> itself**."*

That is substantively the authored decision — is it safe to open the door — held open in **two** of
the four channels v13's retention bridge names, with **no clarification carrying it**.

**Per Phase 8, C or D means the residual defect gains replication evidence. It has.** But the shape
changed between draws, so this is **not** the stable "selector-prioritization" defect CASE A
describes. What replicates is that **HS-H1 reliably fails to deliver the owed clarification; the
route it fails by is not stable.**

**And it is a `RETAINED_BUT_NOT_ASKED` recurrence** — a class §150 closed and §152 measured at zero.
Recorded as a regression on that axis (§7).

---

## 4. PHASE 7 — REQUIRED decomposition (view C, preregistered)

| row | replicate 2 | mechanism |
|---|---|---|
| **HS-A1** | **SILENT** | output **garbled** — see §6.2; detector gap disclosed |
| **HS-B1** | spoke | as replicate 1 |
| **HS-C1** | spoke — recovered the screening fact exactly | detector **SUSPECT** (one signal), excluded from nothing |
| **HS-D1** | spoke — recovered exactly, label correct | **fully stable across both** |
| **HS-E1** | **SILENT** | **gap not recognized** — §5 |
| **HS-G1** | spoke (1 question, was 2) | recovered the authored fact |
| **HS-H1** | **SILENT** | **retained-but-not-asked** — §3 |

```
gap not recognized        1   HS-E1
retained but not asked    1   HS-H1
unsupported settlement    0
reasoned but destroyed    0
different valid question  0
selector-prioritization   0   (replicate 1 had 1; it did not recur in that form)
execution anomaly         1   HS-K1 (FORBIDDEN side) + HS-A1 garbled but undetected
```

**FORBIDDEN:** `HS-M1` spoke again — the fifth fixture defect, pre-registered as excluded. Every
other FORBIDDEN row silent. **View C FORBIDDEN silence is 6/6.**

---

## 5. The single most important variance datum — HS-E1

| | replicate 1 | replicate 2 |
|---|---|---|
| clarification | *"Was a functional/operational test performed on the debarker after the rotor tooth change…?"* — **the authored fact, exactly** | **none** |
| candidate | 1 | 1 |
| state | `CORRECTED` | `CORRECTED` |

Replicate 2's summary: *"The machine is currently running in its normal guarded state: the rotor
guard door is closed with its interlock in place."*

**The same prompt, the same observation, and the same frozen bytes produced an exact recovery and a
silence.** Nothing else changed. This is the clearest possible demonstration that a single-run
recall result — in *either* direction — cannot be treated as a property of the model.

---

## 6. PHASE 12 CASE D also applies — degenerate output recurred

**Rate: 1 of 16 in each replicate, on a different row each time.**

### 6.1 HS-K1 — caught

```
summary: "placeholder"   candidates: 0   clarifications: 0
signals: PLACEHOLDER_SUMMARY, ALL_PROSE_IS_PLACEHOLDER   →   DEGENERATE
```

**The detector caught a case it was not built against.** It was written from §152's HS-A1 shape; this
is a different shape — no candidates at all — and two independent signals still fired. It is *not* a
legitimate empty response, which the detector's first four negative tests establish carries a
**substantive** summary.

### 6.2 HS-A1 — a disclosed detector gap

```
summary: "summary placis a a placeholder"      candidateKey: "x"
one candidate WITH substantive prose (133 / 322 chars)      →   NOT flagged
```

The summary is **garbled**, and the key is a single letter. Neither is a whole-field placeholder
token, so the detector — deliberately conservative, whole-field-equality only — did not fire.

**This is a real limitation and it is disclosed rather than patched.** Widening the detector after
seeing the data is exactly the post-hoc adjustment the sidecar exists to prevent. **HS-A1 remains in
the preregistered denominator as a silent REQUIRED row**, and the gap is recorded for a future
operation.

**So HS-A1's provider output was anomalous in BOTH replicates** — a stub in §152, garbled here. That
is itself a stability signal about the row and is noted.

### 6.3 Why CASE C rather than CASE D

Both apply. CASE C was chosen because the dominant, generalizable finding is the **variance**, which
is not caused by the degenerate rows: HS-E1 and HS-H1 both returned rich, well-formed, non-degenerate
output and still disagreed with replicate 1. CASE D's terminal would foreground a 1-in-16 execution
issue and understate a 6-in-16 stability result.

---

## 7. PHASE 9 — two-replicate run-to-run stability evidence

> **This is TWO NONDETERMINISTIC EXECUTIONS. It is not a variance estimate, not a distribution and
> not a reproducibility claim.**

```
REPLICATE_ROW_AGREEMENT_COUNT        6 / 16
REPLICATE_ROW_DISAGREEMENT_COUNT    10 / 16
CLARIFICATION_PRESENCE_AGREEMENT    14 / 16
AFFECTED_DECISION_AGREEMENT         12 / 16
CANDIDATE_STATE_AGREEMENT            7 / 16
CANDIDATE_FAMILY_AGREEMENT           9 / 16
LINKAGE_AGREEMENT                   15 / 16
```

**Stable:** `HS-A1` `HS-D1` `HS-J1` `HS-L1` `HS-P1` `HS-Q1`
**Variable:** `HS-B1` `HS-C1` `HS-E1` `HS-F1` `HS-G1` `HS-H1` `HS-K1` `HS-M1` `HS-N1` `HS-R1`

**The layers differ sharply in stability.** Linkage (15/16) and clarification presence (14/16) are
comparatively stable; **candidate state (7/16) and candidate family (9/16) are not.** Which hazards
the model names, and what state it asserts, is close to a coin-flip between draws — which bears
directly on every candidate-recall and coverage measurement this programme has taken.

### 7.1 Metrics whose conclusion changes materially between runs

| metric | replicate 1 | replicate 2 | conclusion changes? |
|---|---|---|---|
| REQUIRED spoke (literal) | 7/8 | 5/8 | **YES** |
| HS-E1 | recovered exactly | silent | **YES** |
| HS-H1 mechanism | distractor selection | retained-but-not-asked | **YES** — the mechanism, not the verdict |
| retained-but-not-asked | 0 | **1** | **YES** — a closed axis reopened |
| `HAZARD_SEVERITY` | 0 | 0 | no |
| affectedDecision survival | 8/8 | 5/5 | no |
| linkage reconciliation | true | true | no |
| unsupported settlement | 0 | 0 | no |

---

## 8. PHASE 10 — `HAZARD_SEVERITY` across every v13 run

| run | prompt | `HAZARD_SEVERITY` | clarifications |
|---|---|---|---|
| §150 | v13 | **4** | 7 |
| §152 | v13 | **0** | 9 |
| **§153** | **v13** | **0** | **6** |

**Second consecutive zero on the hardened instrument.** Label usage this replicate:
`REQUIRED_CONTROL` 5, `REGULATORY_INTERPRETATION` 1. Confusion contains one disagreement
(`APPLICABILITY` → `REQUIRED_CONTROL` on HS-G1), the same one as replicate 1, and it is defensible.
`LABEL_EXACT = 4/5`.

**The §151 consequence-magnitude-routing diagnosis is further weakened.** Two independent hardened
draws produce zero misuse where §150 produced four. **v14 remains unjustified and unimplemented, and
this run does not resurrect it** — but note the honest reading: §150's 4-of-7 is now the outlier
across three v13 runs, and with candidate-state agreement at 7/16 the most economical explanation is
**stochasticity**, not a repaired or a real defect.

---

## 9. PHASE 11 — repaired-mechanism regression axes

| axis | replicate 2 | status |
|---|---|---|
| unsupported settlement | **0** | holds (§149) |
| **retained-but-not-asked** | **1 — HS-H1** | **REGRESSED** (§150 closed it; §152 measured 0) |
| reasoned-but-destroyed | 0 | holds |
| `AFFECTED_DECISION_SURVIVAL` | **5/5 = 1.0** | holds (§148) |
| accepted invalid linkage | 0 | holds |
| raw / normalized linkage | 5 / 0 / 5 / 0 — **reconciled TRUE** | holds (§149) |
| invalid clarification objects | 0 | holds |
| citations input / output / accepted / merged | **0 / 0 / 0 / 0** | holds |
| protected-authority contradictions | 0 | holds |
| forbidden candidate families | **0** of 26 candidates | holds |
| duplicate / over-fragmented candidates | none observed | holds |
| arbitration events | 0; true contradictions **NOT_EXERCISED** | holds |
| deterministic union coverage | 4/9 raw, **4/9 mapped** | see §10 |
| protected suites | **24 / 24, 1,778 assertions** | holds |
| `SOURCE_PROJECT_TSC` | PASS | holds |

**Only one repaired mechanism regressed**, and given §7's variance it is reported as *one observation
of a reopened axis*, not as a re-broken repair.

---

## 10. The measurement-layer repairs, and a correction to §152

**Both repairs shipped and are self-tested against real §152 data** (`test:expert-measurement-layer`,
39 assertions).

**The family comparison map corrects a structural error, not a list error.** §151 assumed one
canonical vocabulary; measured across §147–§152 the two sides are **different taxonomies** — 12
shared, 17 deterministic-only, 17 Expert-only. The engine routes to a response *domain*; Expert names
a hazard *family*. The map is explicit, directional and versioned, and flags weak mappings rather than
hiding them.

> **AND IT CORRECTS §152's OWN REPORT.** Recomputing §152's coverage with the honest map gives
> **4/9 — identical to the reported figure.** §152 said *"three of four misses are artifacts… the
> wrong canonical family list on HS-C1 and HS-E1."* **That was wrong.** HS-C1's engine emitted
> `guarding_interlocks` (a different hazard, not an alias) and HS-E1's engine emitted **nothing** —
> there was no name to alias. The real defects there are a poor truth-family choice and a genuine
> family-choice disagreement. **The map was still necessary — §150's RB-C1 proves the shape is real —
> but it did not fire on this data, and claiming otherwise would have invented a result.**

§152's reported 4/9 stands as the historical figure; this recomputation sits beside it.

---

## 11. Confinement

```
prompt / analysis.v2 / arbitration    UNCHANGED — verified against §150 and §152 recorded hashes
normalizer accepted-output behaviour  UNCHANGED
v9 fixture bytes / digest / signatures UNCHANGED — verified before and after, two ways
v14 / v15                             DO NOT EXIST — gated before spend
§139 collision rule                   UNTOUCHED — gated before spend
what changed                          MEASUREMENT LAYER ONLY: sidecar, degenerate detector,
                                      family comparison map, replicate probe, +3 npm scripts
reserved material                     NOT opened
spent formal cohort                   NOT read or mimicked
§147–§152 evidence                    byte-identical against recorded hashes
formal scorers / truth / thresholds   UNCHANGED
deterministic HazLenz                 UNCHANGED
reruns                                NONE — no degenerate row was re-executed
expanded validation                   NOT RUN
M14_REMEDIATION_STATUS                NOT_ATTEMPTED
production / database / customer      UNTOUCHED
commit / push / tag / deploy          NONE
```

---

## 12. PHASE 13 — what this run cannot prove

It does **not** establish deterministic model behaviour, clarification acceptance, production
readiness, global recall, or v13 finality. **Two draws are not a distribution.**

What it does establish is narrower and more useful: **the currently asserted residual defect is not
stable enough to justify a semantic intervention, and neither is its absence.** HS-H1 failed twice by
two different mechanisms; HS-E1 succeeded once and failed once; §150's `HAZARD_SEVERITY` result has
not reproduced in two attempts.

---

## 13. Remaining uncertainty

1. **Two executions. No seed. No third draw.** Every stability figure here is 2-sample.
2. **Candidate-state agreement is 7/16** — the layer every coverage and candidate-recall measurement
   in this programme depends on is the least stable one measured.
3. **Degenerate output is running at ~1 in 16 calls** and HS-A1 was anomalous in both replicates.
4. **The detector missed HS-A1's garbled replicate-2 output**, disclosed and deliberately not patched
   post hoc.
5. **`RETAINED_BUT_NOT_ASKED` reopened at 1** after two runs at 0.
6. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.
7. **Expanded validation remains NOT AUTHORIZED**, and this result moves it further away, not closer:
   a broad run on a 6-of-16-stable instrument would produce numbers nobody could attribute.
