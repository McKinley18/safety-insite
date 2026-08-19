# Proposed HazLenz knowledge architecture

Use a hybrid model: versioned relational/typed records for hazard families, observable predicates, state evidence, jurisdiction, applicability, authority, controls, corrective actions, and verification; retrieval documents may supply explanatory context but never decide legal applicability alone.

A HazardFamily record should link aliases, evidence predicates, mechanisms, exposure pathways, consequences, condition-state evidence, jurisdiction/authority, standards and applicability predicates, exclusions, controls by hierarchy, immediate actions, corrective actions, evidence gaps, clarification questions, and closure verification. Each record needs source provenance, review status, effective version, and supersession metadata.

Keep federal regulation, MSHA regulation, state regulation, consensus standard, agency guidance, manufacturer requirement, industry practice, and internal policy as separate authority types. Deterministic predicate evaluation should gate standards; model/retrieval assistance may rank explanations and suggest missing evidence.

Implementation should follow a development set, qualified adjudication, migration/seed versioning, regression gate, and rollback path. Do not implement this architecture as an unreviewed expansion in the current phase.
