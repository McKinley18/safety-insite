# ReviewCore Knowledge Review UI — P11 Summary

## Purpose

P11 adds visible governed knowledge lifecycle and review queue controls to the existing ReviewCore knowledge surfaces.

## UI Added

The `/safescope-knowledge` page now includes a compact governed lifecycle status panel showing draft, needs-review, approved, rejected, and superseded states, along with advisory-only guardrails.

The `/safescope-knowledge/review` page now includes a compact governed approval queue panel with local-only sample records, approval blockers, duplicate candidates, recommended decisions, active retrieval eligibility, and simulated action buttons.

## Existing Functionality Preserved

The existing knowledge search, document loading, retrieval display, reviewer candidate fetch logic, backend connection handling, role controls, plan controls, demo fallback protection, candidate filters, notes, and existing action handlers are preserved.

## Local-Only Behavior

The P11 review queue actions are simulated local UI state until backend persistence is wired.

## Governance Boundary

Unapproved records do not affect active retrieval. The UI remains advisory-only, does not declare violations, does not create citations, and requires qualified review.

## Recommended Next Phase

P12 should add backend API routes or local persistence contracts for queue records while preserving the P9/P10 approval and active retrieval guardrails.
