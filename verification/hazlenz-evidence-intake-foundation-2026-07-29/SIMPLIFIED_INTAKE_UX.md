# Simplified Intake UX

## Quick intake

1. Photo/evidence upload.
2. “What did you observe?” narrative.
3. Location/area.
4. Optional activity.
5. Jurisdiction inherited from site; shown only when missing or ambiguous.

## Analysis state

HazLenz displays “What HazLenz understood”:

- observed condition;
- people/exposure;
- equipment/activity;
- operating/energy state;
- controls;
- critical unknowns.

Each row has a compact Correct action. No long form is shown.

## Clarification

Zero to three questions are selected by decision impact:

1. life-critical discovery;
2. suppression of an unsupported citation;
3. safe/controlled-state confirmation;
4. material risk change;
5. jurisdiction;
6. corrective-action change.

Answers are Yes, No, Not sure, short selection, or short text only when unavoidable. Facts already explicit at high confidence are not re-asked.

## Review

After re-analysis, the user confirms risk, edits the finding/action, and finalizes. The UI visibly distinguishes definitive-after-review, candidate, unknown, contradicted, and not applicable standards.

## Mobile states

- Capture: single-column photo, narrative, location, Run.
- Clarify: up to three cards with large answer controls.
- Understand: concise fact list with corrections.
- Review: risk, standards, unknowns, controls.
- Save: server state shown explicitly; local draft never appears finalized.
