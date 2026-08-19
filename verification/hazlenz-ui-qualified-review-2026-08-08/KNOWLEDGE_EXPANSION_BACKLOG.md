# Knowledge expansion backlog

## P0 — Corrective-action identity and mechanism association
Families: all multi-hazard families
Root cause: Actions are sometimes selected from unrelated family templates.
Proposed representation: Typed ActionTemplate keyed by stable hazard family, mechanism, and condition state with evidence predicates and verification criteria.
Consumer: corrective-action generation and response composition
Benefit: Prevents unsafe or irrelevant controls.
Regression tests: multi-hazard association, sibling isolation, state-aware action tests.

## P1 — Mechanism and exposure-pathway depth
Families: mobile equipment, pressure systems, structural, noise, respiratory, hand tools
Root cause: Narratives often fall back to unknown exposure or generic mechanism text.
Proposed representation: Structured mechanism records with initiating condition, exposure pathway, consequence, and observable support.
Consumer: scenario intelligence and narrative composer
Benefit: More useful partial answers without overpromotion.
Regression tests: field-language and incomplete-evidence cases.

## P1 — Regulatory applicability predicates
Families: OSHA GI/construction, MSHA, thresholds
Root cause: Candidate standards do not consistently identify the missing applicability predicate.
Proposed representation: Versioned StandardApplicabilityRule with jurisdiction, authority, evidence, exclusions, and clarification mapping.
Consumer: applicability and citation review
Benefit: Defensible standard reasoning.
Regression tests: jurisdiction/threshold paired cases.

## P1 — Temporal and verification evidence
Families: chemical release, guarding, electrical, hot work
Root cause: Reported repair/current verification can remain contradictory instead of historical or controlled.
Proposed representation: TemporalStateEvidence with source, ordering, verification status, and residual exposure.
Consumer: state reconciliation and findings
Benefit: Correct current versus historical representation.
Regression tests: repair-before-inspection, residual sibling hazard, future repair.

## P2 — Closure verification criteria
Families: all active families
Root cause: Verification prose is often generic competent-person language.
Proposed representation: Family/mechanism-specific closure predicates and evidence types.
Consumer: actions, tasks, reports
Benefit: Operationally verifiable controls.
Regression tests: closure evidence per family.
