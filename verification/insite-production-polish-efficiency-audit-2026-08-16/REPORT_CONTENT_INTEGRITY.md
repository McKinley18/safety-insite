# Report Content Integrity

## Scope limitation
Because no final PDF/durable report was successfully generated in this pass (see `REPORT_VISUAL_AUDIT.md`), this document verifies content integrity at the **pre-export, persisted-finding level** rather than by tracing an actual report document back to source data. This is a genuine gap against the brief's request, reported honestly rather than inferred.

## What was verified against persisted data
- **Sibling findings retain independent risk**: confirmed live. From one observation, `machine_guarding` (Critical, 93% confidence) and `fall_protection` (initially "Not established," later independently confirmed at Critical via its own risk-review step) were tracked as fully separate finding records with distinct `Finding ID`s and independent state machines (`pending_review` → `finalized` transitions happened independently per finding, not in lockstep).
- **Standards stayed attached to the correct finding**: the Machine Guarding card consistently showed `29 CFR 1910.219(c)` across every screen re-visit (HazLenz Review → Standards & Actions → Finalize → Final Review) — no cross-finding standard drift was observed.
- **Corrective actions did NOT reliably stay matched to the correct finding**: this is the confirmed defect in `CORRECTIVE_ACTION_UX_AUDIT.md` — the Machine Guarding finding's saved corrective action contained fall-protection-specific content. This is a direct, confirmed violation of "corrective actions stay with the proper finding" at the persistence layer, not just a display glitch — the mismatched text was present in the saved finding data shown on the Finalize/Final-Review screens, which read from persisted state.
- **A genuine finding-identity bug at the finalization step**: confirming risk while the `machine_guarding` finding was selected instead finalized the `fall_protection` finding (`fall_protection` flipped to `state: finalized` while `machine_guarding` remained `pending_review`). This is evidence that finding-scoped actions in the canonical workspace can, at least in this reproduction, apply to the wrong finding record — a serious integrity concern for any report that would later claim "reviewed by a qualified person" against findings that were never actually the ones acted on.

## What could not be verified in this pass
- Whether removed C04 placeholder fields remain absent from the final report output (no report output was produced).
- Whether historical/planned-future conditions are correctly excluded from "current" report language (not exercised — no historical/planned-future scenario was carried through to a saved finding in this pass, though the underlying temporal-reasoning capability was confirmed to exist via the service-execution trace).
- Whether the report silently drops any user-reviewed data (requires a completed report to check against).

## Recommendation
Given the finding-swap defect found above, treat any "finalize" action's target-finding identity as a priority root-cause item — this is a data-integrity bug, not a UX bug, and it directly undermines the "qualified human review" guarantee the product's own disclaimer language promises the report will carry.
