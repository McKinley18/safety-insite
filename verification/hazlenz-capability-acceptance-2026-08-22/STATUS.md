# HazLenz AI Capability Acceptance — STATUS

> ## `HAZLENZ_CAPABILITY_GATE_BLOCKED — RC-01, RC-02, RC-03, RC-04, RC-05, RC-07, RC-08`

**Date:** 2026-08-22 · **Baseline:** `e723b62d7c773f281600fcbd40082d9b8ad12683` (clean `git archive`
checkout) · **Matrix:** `ef405d60ce4ba073970c1902560c6e8703fa8c297f3cf3cf0c2e6b88ee538111`, 66
scenarios, frozen before execution · **Implementation changes: NONE.** Nothing committed, pushed or
deployed; production untouched.

---

## 1 — The decisive architectural fact

**HazLenz performs no model inference.** The backend declares no LLM dependency
(`anthropic`, `openai`, `@ai-sdk`, `google`, `mistral`, `cohere`, `ollama` — all absent from
`backend/package.json`), no source file references any inference endpoint, and
`SafescopeV2Service` injects **no repository at all**. 66 full customer-path analyses completed in
**9.85 seconds total (~0.15 s each)**.

What decides the result is: hand-authored rule registries, weighted lexical classification, regex
evidence extraction, a canned corrective-action template library, and regex post-processing in the
controller. This is consistent with the repository's own 2026-08-08 audit
(`HAZLENZ_LEARNING_ARCHITECTURE.md`: *"the response path does not demonstrate an external model
call"*). It **contradicts** the blueprint §12 prose "a classify path dominated by seconds of AI
inference", which should be corrected.

---

## 2 — Capability results (frozen classifications, Phase 6)

| Classification | Count |
|---|---|
| PASS | **16** |
| PASS_WITH_LIMITATION | **13** |
| DEFECT | **24** |
| **SAFETY_BLOCKER** | **13** |
| TEST_ORACLE_ERROR | 1 (corrected, recorded) |
| HARNESS_ERROR | 2 (corrected, recorded) |

| Cohort | PASS | PASS_LIM | DEFECT | BLOCKER | clean |
|---|---|---|---|---|---|
| historical regression | 2 | 4 | 5 | 3 | 14% |
| novel adversarial | 4 | 3 | 10 | 3 | 20% |
| realistic field | 5 | 3 | 2 | 2 | 42% |
| negative controls | 3 | 0 | 5 | 4 | 25% |
| regulatory diversity | 2 | 3 | 2 | 1 | 25% |
| **TOTAL** | **16** | **13** | **24** | **13** | **24%** |

### Safety performance
* expected hazards missed (all high-consequence): **7** — A10, B08, B09, B11, C04, C06, E08
* negative controls carrying an ACTIVE hazard: **6 of 12**
* negative controls emitting citations: **7 of 12**
* fabricated ACTIVE states on non-active observations: **17**
* wrong-hazard corrective actions: 1 frozen check fired; broad sweep shows **16 of 66** action
  templates name a hazard absent from the observation
* invented evidence asserted in output: **1** frozen check; narrative invention is systemic (RC-05)

### Regulatory performance
* forbidden citation emitted: **2** (A05 `1910.146` on a closed oil tank; D05 `1910.146(c)(1)` on a
  document review)
* wrong regulatory Part from mine-type routing: **2 proven** (A13, DX5)
* PROTECTED_DECISION `(a)` paragraph emitted on the customer path: **proven**, while the guarded
  suite passes 16/16
* fabricated citations (citations that do not exist): **0**

### Clarification performance
* decision-critical questions required (frozen): 2 — correctly asked **1**, missed **1** (B03)
* scenarios carrying an unnecessary forced question: **29 of 66**
* forced questions total: **38**; `fall-height` alone fires **11×**

---

## 3 — Generalization (Phase 8)

The repository's own suite reproduces **28 of 30** — exactly the two documented pre-existing failures,
no third. Against that, **re-worded** versions of the same historical failure modes score **14% clean**
and novel adversarial cases **20% clean**.

Controlled perturbations isolate the mechanism:

| Probe | Text change | Result |
|---|---|---|
| DX1 → DX2 | "back-up alarm" → "backup alarm" | `57.14132(a)` + `57.9100` → **zero citations** |
| DX1 → DX3 | → "reverse signal alarm" | **zero citations** |
| DX1 → DX4 | + explicit "surface metal and nonmetal mine haul road" | Part 57 → Part **56** |
| OF4 → OF5 | canonical LOTO wording → ordinary wording | `1910.147` **lost**; returns `1910.37` (exit routes) |
| OF6 → OF7 | canonical safe-state wording → ordinary wording | "Controlled Condition" → **"Unclassified"** |

Guarding *does* generalize (OF1–OF3 all reach `56.14107`). The brittleness is family-dependent, not
uniform — but it is real, and it is present in LOTO, MSHA warning devices, and safe-state recognition.

**Verdict: there is evidence of fixture-shaped coverage.** Behaviour tracks enumerated phrasings
rather than meaning.

---

## 4 — Regulatory-context decision (Phase 10)

> ### `HYBRID`

| Measured | Explicit context | `unknown` |
|---|---|---|
| citation sets spanning >1 regime | **1 / 50 (2%)** | **11 / 43 (26%)** |
| declared regime absent from citations | 0 | 3 |
| scenarios producing no citations | 16 | 23 |

Inference itself is **sound**: it fires on only 11 of 66, was correct on every obvious case
(GI, Construction, MSHA surface, MSHA underground), correctly held `unknown` on the genuinely
ambiguous ladder case, and is always labelled `HAZLENZ_INFERRED`, never `USER_CONFIRMED`. The
`jurisdiction-work-environment` clarification already exists and fires.

The failure is not inference; it is the **55 cases where inference does not fire**, in which
candidates are emitted across regimes with no regime established — including OSHA General Industry
citations for a mine hazard.

* `KEEP_UNKNOWN` is refused: 26% cross-regime contamination is a material regulatory-selection risk.
* `REQUIRE_EXPLICIT` is refused: it discards a working, truthful, conservative inference capability
  and forces users to answer a question HazLenz can often answer itself, contradicting the §2
  autonomy invariant.
* **`HYBRID`**: retain "Not sure / Let HazLenz determine", but require the regime to be *established*
  — by inference or by one targeted clarification — **before** regulatory conclusions are emitted,
  and refuse to emit a cross-regime candidate set.

**The uncommitted 8-line proposal implements `REQUIRE_EXPLICIT`, not `HYBRID`, and must NOT be
packaged.** Per Phase 29 it is not silently discarded; it should be removed or restored in a
separately authorized cleanup step. It remains uncommitted and byte-identical.

Presentation note: the Settings label *"Let HazLenz AI Evaluate — HazLenz AI decides the likely
agency context"* promises more than the 11-of-66 inference rate supports.

---

## 5 — Learning status (Phase 16)

| Mechanism | Status |
|---|---|
| Per-finding human review (`human_reviews`) | **IMPLEMENTED_NOT_ACTIVE** — persisted, never read by reasoning |
| Reviewer-confirmed risk (`riskSnapshot.source`) | **IMPLEMENTED_NOT_ACTIVE** — report/UI only |
| Standards feedback (`SafeScopeFeedback`) | **IMPLEMENTED_NOT_ACTIVE** — `getWorkspaceStandardAdjustments()` is called only by its own GET endpoint |
| Legacy feedback tables | **IMPLEMENTED_NOT_ACTIVE** |
| `learningMemory` / `learningGovernance` in the payload | **DOCUMENTED_ONLY** — static literal policy objects, not a mechanism |
| Governed knowledge review queue | **IMPLEMENTED_AND_ACTIVE** for retrieval-tier knowledge, but not connected to any correction source |
| Regression corpus | **IMPLEMENTED_AND_ACTIVE** as a code-change gate, not a learning loop |

**HazLenz does not demonstrate closed-loop learning.** Proven executably: the classify path injects
no repository and reads no feedback, review or correction store. Stored corrections cannot influence
a later decision. This is unchanged from the 2026-08-18 record.

---

## 6 — Knowledge freshness (Phase 17)

* **Implemented:** source registry schema, allow-listed primary-source connectors (osha.gov,
  ecfr.gov/govinfo.gov, msha.gov), normalization with `parserVersion`, source metadata,
  `source_document_checksum` / `normalized_record_checksum`, release lifecycle with reviewer approval.
* **Governed:** release construction, immutable records, checksum-bound approval, explicit activation.
* **NOT operational:** **no scheduler exists** — zero `@Cron` / `ScheduleModule` / `setInterval` /
  `node-cron` in `backend/src`. Every ingestion is a manual npm script. On the production-shaped
  corpus, **0 of 2,390** rows carry `source_document_checksum` and **0** carry `retrieval_date`, and
  `safescope_knowledge_sources` is empty — so change detection cannot fire even if run by hand.
* **Not deployed:** the governed subsystem is absent from production (`STAGE1-OP-01`…`-05`).

HazLenz may truthfully be described as *using a governed regulatory knowledge architecture with
reviewed releases*. It may **not** be described as automatically staying current, periodically
ingesting sources, or continuously learning. The product does not currently make those claims.

---

## 7 — AI maturity assessment (Phase 18)

| Dimension | Evidence | Strength | Limitation | Status |
|---|---|---|---|---|
| Semantic understanding | 66 scenarios | Handles messy field shorthand in several families (C01, C02, C05, C07) | Recognition tracks surface tokens; "backup" vs "back-up" changes the outcome | **LEVEL_1–2** |
| Hazard recognition | 32 hazard scenarios | Correct on canonical phrasings | 7 high-consequence misses | **LEVEL_1** |
| Multi-hazard decomposition | A03, A11, B08, W3 | Genuinely decomposes | Over-decomposes context clauses into rated findings; under-decomposes A03 | **LEVEL_1** |
| Contextual reasoning | B09 | Ignores some irrelevant padding | Misses the real hazard inside it | **LEVEL_1** |
| Negation / control state | A02, B12, B14, D02 | Correct where phrasing is enumerated | 17 fabricated ACTIVE states; default-ACTIVE on unrecognized text | **LEVEL_1** |
| Regulatory reasoning | Phase 10, RC-02 | Explicit context is handled well (2% mixing) | Mine-type routing flips on a hyphen | **LEVEL_2** explicit / **LEVEL_1** unknown |
| Standards selection | 50 scenarios with citations | Frequently correct and correctly granular (1926.501(b)(1), 56.14107(a), 1910.147) | Emits a PROTECTED_DECISION-refused paragraph; 2 forbidden citations | **LEVEL_2** |
| Clarification judgment | 38 forced questions | Asks real questions | Template-gated; 29 unnecessary; 1 critical miss | **LEVEL_1** |
| Risk reasoning | all | Decomposed severity/likelihood, "Controlled" on safe states | Critical 25 on a document review; Moderate on an 18 ft unprotected edge | **LEVEL_1–2** |
| Corrective action | 66 | Structured hierarchy fields | Retrieved from a canned template library; 16/66 name an absent hazard | **LEVEL_1** |
| Explanation / evidence binding | RC-08 | Cites the source observation | A fragment inverts a negation on a customer report | **LEVEL_1** |
| Uncertainty calibration | RC-10 | Preserves ambiguity; never fabricates jurisdiction certainty | Top-level state is `UNKNOWN` on 62/66 | **LEVEL_2** |
| Workflow autonomy | 6 real workflows | All complete end to end | 29/66 carry an unnecessary forced question | **LEVEL_2** |
| Learning | Phase 16 | Corrections captured durably | No closed loop | **LEVEL_1** |
| Knowledge freshness | Phase 17 | Governed release architecture is real | No schedule; no freshness metadata on the real corpus | **LEVEL_1–2** |

> ### Overall: `LEVEL_1 — RULE ASSISTANT`

Assigned on the framework's own terms. LEVEL_2 requires hazard recognition and classification
*using AI-assisted reasoning*; there is no model inference in the system, and behaviour is
"primarily deterministic keyword/rule/template" that "cannot reliably generalize beyond encoded
patterns" — LEVEL_1's definition, demonstrated by DX2/DX3, OF5 and OF7.

This is a floor, not a dismissal. Several genuinely LEVEL_2 capabilities are present and were
measured working: negation-aware evidence extraction, condition-state modelling (`PLANNED_FUTURE`
correctly detected), per-finding predicates with named open questions, conservative and truthful
jurisdiction inference, and correct granular citation selection in several families. They are not
yet *reliable* enough to carry the level.

**To reach LEVEL_2:** close RC-01, RC-02, RC-03, RC-04 so that hazard recognition, condition state
and regime selection survive ordinary rewording rather than tracking enumerated phrasings.
**To reach LEVEL_3:** additionally close RC-05, RC-06, RC-07, RC-08 — corrective actions reasoned
from the observation rather than retrieved, clarification gated on decision boundaries rather than
family presence, decomposition that does not manufacture findings, and evidence fragments that carry
their negation scope. **LEVEL_4** additionally requires the learning loop in §5 to become active and
demonstrate measured improvement. **LEVEL_5** additionally requires production evidence that cannot
exist before deployment.

---

## 8 — Full-product workflow acceptance (Phase 19)

All six workflows completed end to end through the **real running API** (backend on 4320, disposable
production-shaped database): inspection creation → regulatory context persisted → observation →
HazLenz analysis → decomposition → standards → risk → corrective action → human review on every
finding → finalization → lifecycle transition → report generation → persistence → reload.

| | context | classification | citations | findings | report | provenance | governed keys |
|---|---|---|---|---|---|---|---|
| W1 | OSHA GI | Lockout / Stored Energy | 3 | 2 | ✓ | NULL | none |
| W2 | OSHA Construction | Walking/Working Surfaces | 4 | 2 | ✓ | NULL | none |
| W3 | MSHA | Lockout / Stored Energy | 7 | 4 | ✓ | NULL | none |
| W4 | OSHA GI | Emergency Egress | 2 | 3 | ✓ | NULL | none |
| W5 | OSHA GI (safe state) | Controlled Condition | 0 | 1 | ✓ | NULL | none |
| W6 | unknown | Fall Protection | 5 | 2 | ✓ | NULL | none |

W1 and W3 show the classification/citation incoherence of RC-07: the primary classification
("Lockout / Stored Energy") does not match the hazard or the citations actually emitted
(1910.212 / 56.14107 machine guarding).

## 9 — Report acceptance (Phase 20)

7 real PDFs generated through `CanonicalReportsService`, inspected with poppler.

**Sound:** **0 hits** on 20 governance/shadow/telemetry patterns across all 7. Executive-summary
counts reconcile with the findings table. Regulatory context printed correctly. "APPLICABLE STANDARD:
Not established for this specific finding" is an honest disclosure. Approved-content labelling is
correct — "HazLenz standard summary … qualified review remains required", no "Verified" badge on
unreviewed content. Basis-and-limitations disclaimer is present and truthful.

**Defects reaching the report:**
* **Phantom findings** — W2 and W3 each carry a finding #1 derived from the top-level classification
  with no standard, no risk rating and no observed content (RC-07).
* **Non-hazard findings** — W3 renders "the belt was running" and "miners travel the adjacent
  walkway" as rated findings with open corrective actions (RC-07).
* **Negation-inverting evidence** — W2 prints "WHAT WAS OBSERVED: safety net or personal fall arrest
  system in use" for "…with **no** guardrail, safety net or personal fall arrest system in use" (RC-08).
* **Boilerplate corrective actions** — "Immediate hazard control required to prevent
  contact/exposure to *Machine Guarding* hazard" (RC-05).
* **`KG5C-DISC-01` is customer-visible in reports** — the 1926.501 summary is a mid-sentence
  truncation ("…the requisite strength and s"). The blueprint classifies this
  `DEFECT_NONBLOCKING` and customer-invisible under SHADOW; this phase shows it printed in a
  generated customer report today, under LEGACY. **New evidence — the classification should be
  revisited on the report surface.**
* **False uncertainty** — W2 reports "HazLenz basis: Candidate only; missing: worker exposure" when
  the observation states "Employees were working within two feet".

## 10 — Customer-truthfulness review (Phase 21)

Customer-facing language is **restrained and well-disclaimed**, and materially better than the
engine's measured capability would license elsewhere. No claim of learning, staying current, being
always-current, expert, guaranteed or compliant appears. `/hazlenz` states plainly: *"HazLenz AI
supports professional judgment. It does not replace qualified safety review, declare violations,
create citations, determine compliance, or make final decisions."*

Two presentation-only items, classified separately from engine defects:
1. **Settings — "Let HazLenz AI Evaluate · HazLenz AI decides the likely agency context."** Inference
   fires on 11 of 66; in the remaining cases no regime is established and cross-regime candidates are
   emitted. `PRESENTATION_OVERCLAIM`.
2. **`/hazlenz` — "processes natural language safety observations into clean, structured datasets."**
   Defensible as a capability description, but "back-up"/"backup" changing the outcome makes
   "natural language" stronger than the mechanism. `PRESENTATION_SOFT_OVERCLAIM`.

Calling the engine "AI" is **not** recorded as an overclaim: rule-based expert systems are
conventionally described that way, and every surrounding claim is correctly bounded.

## 11 — Remediation decision (Phase 25)

**No implementation was changed, deliberately.**

Seven blocking clusters were root-caused. None has a "smallest correct remediation" in the §22 sense:
RC-01 is the absence of a safe-state default; RC-04 and RC-05 are the substitution of lexical
retrieval for reasoning; RC-07 is the decomposition contract itself. Each fix is a design change to
the reasoning substrate, not a defect repair in an owning layer. Editing them under this phase's
authorization would be precisely the speculative, circular remediation §22 exists to prevent, and the
phase brief forbids treating this as "an invitation to keep improving HazLenz indefinitely".

RC-02 and RC-03 *are* narrow enough to fix (a signal-ordering bug and a second unguarded citation
path). They are recorded with proven root cause and left unmodified, because a checkpoint that
remains blocked by RC-01/04/05/07/08 gains nothing from a partial repair, and because this phase's
authorization to modify implementation is conditioned on the fix clearing the gate.

## 12 — Remaining limitations, separated

**Checkpoint blockers:** RC-01, RC-02, RC-03, RC-04, RC-05, RC-07, RC-08.
**Accepted LEVEL-3 limitations (would remain after the blockers close):** RC-06 clarification
volume; RC-09/RC-10 uncertainty presentation; the two documented `test:hazlenz-core` failures.
**Future LEVEL-4 requirements:** activate the captured-correction loop (§5) and demonstrate measured
improvement under governed adjudication.
**Future LEVEL-5 requirements:** scheduled governed ingestion with change detection, plus production
reliability evidence that cannot exist before deployment.

---

## 13 — Closure addendum (authorized 2026-08-22)

Recorded after the measurement above, by explicit authorization. **Documentation and evidence only —
no implementation was written, and no cluster was remediated.**

### Capability decision `PROTECTED_DECISION`
* **Incremental LEVEL_2 patching is not the primary strategy.**
* **RC-01, RC-04, RC-05, RC-07, RC-08** are carried as **inputs to the LEVEL_3 reasoning-engine
  architecture**, not as a patch queue.
* **RC-02** (mine-type keyword collision) and **RC-03** (PROTECTED_DECISION bypass on a second
  citation path) are **preserved as independently actionable deterministic defects and are NOT fixed
  yet**. RC-03 must not be closed by editing `evidence-foundation.ts` — that file is correct and its
  suite passes 16/16; the defect is the second path at `msha-inspection-intelligence.service.ts:201`.
* The next authorized phase is **LEVEL_3 reasoning-architecture / implementation planning**. It is not
  started by this record.

### Regulatory-context disposition `PROTECTED_DECISION`
`HYBRID` recorded. The uncommitted `REQUIRE_EXPLICIT` implementation is a **superseded proposal**:
not committed, not discarded, not restored, **preserved byte-for-byte** in the working tree pending a
separately authorized cleanup step.

### `KG5C-DISC-01`
Reclassified **`DEFECT_NONBLOCKING` → `DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT`**
in the §26 register and in `docs/INSITE_CURRENT_STATE.json`. The release-gate conclusion is unchanged
— it blocks neither SHADOW nor CUTOVER. **Not remediated.**

### Capability databases
`test_hazlenz_capability_20260822` and `test_hazlenz_capability_prodshape_20260822` are **preserved**
for reproducibility until this closure is committed and remotely verified. Not dropped in this
operation. Their template `test_kg5b_prodshape_20260821` was read-only and is unmodified at 2,390 rows.
