# Verified component freeze

Treat the following as protected from broad edits: citation ranking/recovery (protected hashes and dedicated regressions), analysis concurrency/idempotency, authorization/entitlement denial, report source fingerprinting/version immutability, and persisted finding/review relationships. A future change may touch them only after a reproducible defect is traced into the component, a focused regression is added, and dependent closed-gate suites rerun.

Hazard classification, mechanism reasoning, corrective-action quality, response composition, and frontend narrative rendering are **not** frozen: this audit found response-composition limitations and has only heuristic utility evidence for the other layers.
