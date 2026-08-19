# Finding Presentation Audit

Based on live inspection of the HazLenz-generated "Machine Guarding" finding (Critical, 93% confidence, 29 CFR 1910.219(c)) across both the legacy and canonical flows.

## Can a user quickly answer the required questions?

| Question | Answerable at a glance? | Where |
|---|---|---|
| What did HazLenz find? | Yes | "Finding Summary" heading + risk/confidence chips, top of card |
| What evidence supports it? | Yes, but requires a scroll/click | "Mechanism Chain" (observed condition / exposure pathway / failure mode / consequence) is primary content, well-placed |
| How serious is it? | Yes | CRITICAL / 93% CONFIDENCE chips are the most visually prominent elements on the card |
| Which standard applies? | Yes, citation is shown prominently — but see `STANDARDS_EXPERIENCE_AUDIT.md` for the text-accuracy caveat | "Primary Standard" card |
| What should I do? | Yes | Corrective action shown directly below, but see `CORRECTIVE_ACTION_UX_AUDIT.md` for a content-accuracy defect |
| Is anything uncertain? | Yes | "CANDIDATE STANDARD — MORE EVIDENCE REQUIRED" / "Confidence: Low" banners are explicit and well-worded |
| Is more information needed? | Yes | "CONFIRM BEFORE CLOSURE" checklist (e.g. "Employee exposure is not clearly described," "No photo evidence is attached") is a genuinely good pattern |
| Is this finding active/historical/planned-future? | **Not visually surfaced on the card itself** in either flow exercised | Temporal qualification exists in the underlying reasoning (confirmed via the service-execution trace) but wasn't observed as a card-level indicator during live testing |

## Visual hierarchy assessment
- **Primary** (correctly prominent): finding title, risk level, confidence, primary standard, mechanism chain.
- **Secondary** (correctly de-emphasized): "Evidence Used," hazard-category "Change Category" control — both collapsed by default.
- **Expandable/advanced** (correctly hidden): "View AI Reasoning Trace" — collapsed, click-to-expand, exactly right for a first-time user who shouldn't need to read the internal reasoning to trust the summary.
- **Content that leaks internal architecture to the user** (should be secondary/advanced, currently primary or unavoidable): raw `Finding ID` and `Analysis` UUIDs printed directly in the "Persisted hazard findings" list on the canonical workspace; a raw ISO-8601 due-date timestamp in Action Details; a raw JSON error string in one failure mode (`{"statusCode":500,"message":"Internal server error"}`). None of these belong in front of a non-technical user.

## Multi-hazard handling
Decomposition correctly keeps sibling hazards from the same observation as independent cards ("Machine Guarding," "LOTO," "Fall Protection" all appeared separately, each with its own confidence/risk and an explicit "Review each material hazard independently. Evidence, standards, risk, and corrective actions must not be merged without qualified review" banner) — this is a strong, deliberate design choice and reads well to the user.

## Overall assessment
The finding card's **content model** is genuinely good: the right things are primary, the right things are collapsed. The two things that would most improve a first-time user's trust are (1) fixing/labeling the standard-text accuracy issue and (2) fixing the corrective-action content-mismatch defect — both are content-integrity problems, not presentation/hierarchy problems.
