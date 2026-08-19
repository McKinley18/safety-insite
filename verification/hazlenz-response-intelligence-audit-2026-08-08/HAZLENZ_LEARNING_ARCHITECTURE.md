# Controlled HazLenz learning architecture

Current code is primarily deterministic hybrid reasoning: weighted classification, scenario/domain services, rules, and structured composition. The response path does not demonstrate an external model call in this audit.

Permitted learning loop:

1. Capture the output, evidence provenance, reviewer correction, and affected finding/state.
2. Store a candidate example with actor, organization, model/rule version, and rationale.
3. Require qualified adjudication and privacy review.
4. Convert accepted examples into versioned regression cases or knowledge records.
5. Validate frozen blind, adversarial, safe-state, life-critical, and production-path suites.
6. Promote only through an explicitly approved release and retain rollback metadata.

Deterministic safety/legal predicates, authorization, condition states, audit rules, and finalization governance must not self-modify from feedback.
