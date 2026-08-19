# Inspection workflow

## Implemented

A mobile-first progressive single-page workflow was selected:

1. Capture
2. HazLenz review
3. Risk
4. Corrective action
5. Complete/report

It reuses canonical server-backed site, inspection, observation, analysis, human-review, finding, action, task, report, and storage APIs. Draft identity is restored through the existing namespaced pointer, while completed state is server authoritative.

The HazLenz review shows one primary/candidate standard, why it was offered, confidence, missing evidence, structured facts, and only material clarifications. Risk edits and corrective-action edits are persisted in the human-review conclusion and downstream records. A report is marked complete only after durable report generation succeeds.

## Verified

Playwright ran twice at 390×844 (light and dark):

- real registration/login
- durable site and inspection
- real PNG evidence upload
- production HazLenz endpoint
- clarification answer
- structured fact correction and re-analysis
- risk review
- finding finalization
- action/task creation
- immutable report generation
- database snapshot verification
- reload persistence and logout protection

Both runs passed. Each persisted 1 observation, 3 analyses, 1 review, 1 finding, 1 private evidence object, and 1 report.

## Remaining

The fixed mobile navigation overlays a portion of very long full-page screenshots while scrolling, and the shared mobile header clips its left/right extremities on one review capture. These are usability defects outside the canonical data flow and should be fixed before unrestricted rollout.

