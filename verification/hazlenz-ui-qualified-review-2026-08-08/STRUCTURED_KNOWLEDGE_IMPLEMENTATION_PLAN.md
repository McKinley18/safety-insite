# Structured knowledge implementation plan

Use a versioned hybrid: typed, provenance-bearing safety knowledge in application modules initially, with relational tables for standards, authority, applicability predicates, and release/version metadata as the library matures. Retrieval may propose candidates; deterministic evidence and jurisdiction gates remain authoritative.

Core records: HazardFamily, ObservablePredicate, Mechanism, ExposurePathway, Consequence, Standard, ApplicabilityRule, Control, CorrectiveAction, VerificationCriterion, ClarificationQuestion, TemporalStateEvidence. Every record carries source provenance, authority level, effective/review dates, and release ID.

Migration should begin with two to four high-value families (machine guarding, hazardous energy, mobile equipment, hot work/chemical residual exposure), preserve existing contracts, and add regression fixtures before promotion. No schema change is justified by this audit alone.
