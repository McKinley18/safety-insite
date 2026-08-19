# HazLenz reasoning boundaries

| Concern | Boundary |
|---|---|
| Semantic interpretation, paraphrase, multi-fact synthesis, mechanism explanation, clarification wording | MODEL_DRIVEN or HYBRID |
| Candidate hazard-family generation and decomposition | HYBRID: semantic candidate generation constrained by evidence predicates |
| Mechanism mapping and corrective-action selection | HYBRID: structured knowledge selects admissible controls; model/rules explain context |
| Temporal reconciliation and evidence provenance | HYBRID with deterministic state constraints |
| Jurisdiction, authority, applicability predicates, citation verification | STRUCTURED/DETERMINISTIC |
| Unsupported-promotion prevention and persisted audit state | STRUCTURED/DETERMINISTIC |

Current implementation is predominantly deterministic/rule and knowledge driven; no independent external model inference was demonstrated in this audit. The next architecture should make model interpretation replace brittle string dependence while retaining deterministic legal and safety gates.
