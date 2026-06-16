# HazLenz AI Improvement Roadmap

HazLenz AI is SightSignal's customer-facing safety intelligence engine. It should be positioned as AI-assisted, advisory, source-governed, and human-reviewed.

## Trustworthy AI Direction

HazLenz should be improved against these characteristics:

- valid and reliable
- safe
- secure and resilient
- accountable and transparent
- explainable and interpretable
- privacy-enhanced
- fair and harmful-bias managed where applicable

## Phase 1: Validation Gate

Run:

    bash scripts/validate-hazlenz-ai.sh

Backend shortcut:

    cd backend
    npm run validate:hazlenz

The gate runs available database-independent SafeScope/HazLenz validators plus backend and frontend builds.

Skipped by design:

- DB-dependent precision regression scripts requiring seeded PostgreSQL
- generate/create/repair scripts that mutate datasets
- benchmark-only utilities without pass/fail thresholds

Failure means HazLenz reasoning, knowledge, standards, or build behavior changed enough to require review before release.

## Next Phases

1. Expand domain coverage across MSHA, OSHA General Industry, OSHA Construction, mobile equipment, conveyors, electrical, fall protection, LOTO, chemical exposure, confined space, fire prevention, PPE, material handling, and emergency response.
2. Add stronger mechanism-of-injury reasoning and multi-hazard detection.
3. Add confidence/evidence scoring.
4. Add governed learning through human review.
5. Add explainability panels and audit-ready traceability in the UI and reports.

## Marketing Guardrails

Acceptable language:

- HazLenz AI
- AI-assisted safety intelligence
- source-governed reasoning engine
- human-reviewed safety intelligence

Avoid language saying HazLenz autonomously determines violations, creates citations, guarantees compliance, or replaces qualified safety professionals.
