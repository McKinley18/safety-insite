# Remaining dispositions

## RC-02 / RC-03 — preserved, scheduled, not fixed

| | RC-02 | RC-03 |
|---|---|---|
| **Defect** | `\bback\b` (mine roof) matches "back-up alarm"; underground branch evaluated before surface | `msha-inspection-intelligence.service.ts:201` hard-codes `56/57.14132(a)` for both mine types |
| **Owner** | `mine-context.service.ts` — TAXONOMY/RESOLUTION | STANDARDS_MATCHING |
| **Survives Level 3?** | **Yes** — Level 3 keeps deterministic jurisdiction filtering, so a mis-resolved mine type still corrupts the candidate set | **Yes** — the model selects among candidates; an unguarded path injecting `(a)` lets it select a refused paragraph |
| **Scheduled** | **L3-4** | **L3-4** |
| **Why not earlier** | fixing before the candidate contract exists is premature | same |
| **Why not later** | Level-3 would inherit a corrupted candidate set and the gate would measure the wrong thing | same |
| **Standing warning** | — | **Do NOT close by editing `evidence-foundation.ts`.** That file is correct; `test:kg3f-56-14132-predicate` passes 16/16 against it. Editing the evidence that proves the defect would destroy the proof |

Neither fix is thrown away by the authority transition: both live in deterministic layers that Level 3
**keeps** (retrieval, jurisdiction filtering, candidate-set membership).

## KG5C-DISC-01 — not remediated here

Classification preserved exactly: **`DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT`**,
owner **SOURCE**.

**Placement relative to Level 3: independent, and deliberately outside it.** It is a legacy
*content-generation* defect (a 500-character hard cut of `standard_text`), not a reasoning defect. The
Level-3 engine neither causes it nor repairs it — the reasoning layer never supplies regulatory text
(`L3-INV-09`). Repairing it belongs in a SOURCE/content slice, sequenced independently and at the
owner's discretion; governed CUTOVER separately repairs it for approved reviewed records.

> **This must not expand the reasoning-architecture scope.** §24 forbids a non-blocking defect
> expanding the current gate, and nothing in the Level-3 plan depends on it.

## Checkpoint deployment decision

> ### `DO_NOT_DEPLOY_LEVEL1_CHECKPOINT`

| Consideration | Finding |
|---|---|
| Is a checkpoint preserved without deploying? | **Yes.** Commit `1feda622` is immutable and verified present on `origin/release/insite-rc-2026-08-18` |
| Does production need it? | **No.** Production is on `97941ca2` with **one analysis in the product's lifetime** — deployment would not generate meaningful traffic evidence |
| Does the KG programme need it? | **No.** KG deployment is separately staged and independently blocked on operations 1–11 (`STAGE1-OP-01`…`-05`) |
| Does local execution already prove the infrastructure? | **Yes.** Six full workflows completed through the real API, seven PDFs generated, provenance NULL, zero governed keys |
| What would be exposed? | An engine measured at **LEVEL_1** with **13 SAFETY_BLOCKERs**: fabricated ACTIVE states on safe conditions, corrective actions naming absent hazards, a negation-inverted evidence fragment on a customer report, and high-consequence false negatives |
| Is there evidence obtainable **only** from production? | **No.** Nothing in the Level-3 plan requires production data. The one genuinely production-only question — Render's handling of a ~1.7 KB log line — belongs to the KG Stage-1 abort gate `G1`, not here |

**Rationale.** Deployment is justified when it buys evidence that cannot reasonably be obtained
otherwise. Here it buys none, and it would put a known-defective safety-reasoning surface in front of
real safety professionals whose organizations include genuine customers. The checkpoint value is
already realized by the verified remote commit.

## Multimodal scope

> ### `TEXT_FIRST_LEVEL3`

`real-image-analysis.service.ts` operates on `simulatedVisionFindings`, captions and metadata; no
image-decoding or vision library exists in `backend/package.json`. HazLenz performs **no** image
inference today. Every measured Level-3 blocker is a text-reasoning failure. Photo reasoning is a
later, separately scoped slice; P-13 keeps the seam ready for it.
