# Corrective-Action UX Audit

## Headline finding: content/finding mismatch on a multi-hazard observation (P1)

Observation submitted: *"Missing guard on the rotating shaft near the crusher drive on the west platform. Exposed lockout/tagout point on the same crusher lacks a padlock, and there is loose material buildup creating a slip hazard on the walkway leading to the platform."*

HazLenz correctly decomposed this into 3 independent hazards (Machine Guarding / LOTO / Fall Protection). For the **Machine Guarding** finding (29 CFR 1910.219(c), Critical, 93% confidence), the single generated corrective action was:

> **Title:** "Verify hazardous-energy isolation before servicing"
> **Body:** "Restrict access to the fall exposure until edge protection or fall protection is in place. • Install guardrails, covers, fall-arrest systems, or another suitable fall-protection control for the exposed edge or opening."
> **Priority:** CRITICAL

The title references energy isolation (LOTO-flavored) and the body is **entirely about fall protection** — neither addresses the actual finding, which is a missing machine guard over a rotating shaft (the expected action would be something like "install/replace a fixed guard over the rotating coupling"). This was captured with a zoomed screenshot as direct evidence. This reads as **cross-hazard content bleed**: when a single observation contains language for multiple hazard families, the corrective-action generator appears to attach content from one branch (fall protection) to a different finding's card (machine guarding).

This is a trust-critical defect, not a cosmetic one: a user following this "critical priority" action as written would install guardrails and never address the actual exposed rotating shaft.

## Representative categories exercised
- **Machine guarding**: exercised live — content-mismatch defect above.
- **LOTO**: exercised live as a sibling finding (separate card, 40% confidence, "human review required") but not driven to a saved corrective action in this pass.
- **Fall protection**: exercised live as a sibling finding; ironically, the fall-protection-flavored text that leaked into the machine-guarding card would probably have been a reasonable action *for the fall_protection finding itself* — suggesting the bug is a mis-association rather than a generation-quality problem.
- Electrical, housekeeping, and "failed-but-present control" scenarios were not separately driven to a saved corrective action in this pass — flagged as a coverage gap, not a clean bill of health.

## UX quality of the corrective-action surface itself (independent of the content bug)
- Clarity/specificity: good when content matches the finding — bullet-style, actionable.
- Length: appropriately short.
- Hierarchy of controls: not explicitly labeled as elimination/substitution/engineering/administrative/PPE in what was observed — the action text implies engineering controls but doesn't name the hierarchy tier.
- Owner/due-date: due date is set automatically (visible as a raw ISO timestamp — see `FINDING_PRESENTATION_AUDIT.md`); no owner/assignee field was surfaced in the flows exercised.
- Editing: an "+ Add Action" control exists alongside the generated action, so users can add their own — good escape hatch.
- Persistence: the action was saved successfully as part of the finding in the legacy flow (`1 action(s)` shown in the finalize summary).
- Report rendering: not verified — PDF export was blocked in this pass (see `REPORT_VISUAL_AUDIT.md`).

## Known P2 limitation (per the brief): failed-but-present / effective / unknown control state
Not independently re-verified as fixed or broken in this pass beyond what P1-02's own baseline already documents. The clarification question set does ask "Was a guard removed, missing, damaged, bypassed, or was lockout/tagout applied and verified?" with options including "Guard installed," "Lockout/tagout applied," "Zero-energy verified," and "No control verified" — which suggests the underlying model for control-state has meaningfully improved since earlier phases, but this was not stress-tested against a genuinely "control present but failed" scenario end-to-end in this pass. Visibility of this limitation to a first-time user is low — nothing in the UI calls it out as a known gap; a user would only notice if they submitted exactly that scenario and compared the output critically.

## Recommendation for the backlog
Prioritize root-causing the cross-hazard content-bleed bug above any polish work in this area — it directly undermines the credibility of the corrective-action feature, which is one of the product's core value propositions per its own registration-page copy ("corrective-action tracking").
