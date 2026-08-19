# Controlled Learning Model

User corrections create immutable feedback events containing original value, corrected value, evidence snapshot ID, user/reviewer role, jurisdiction, affected standard, reason, and timestamps.

Feedback levels:

1. ordinary correction — affects only the current finding;
2. qualified-review correction — may enter aggregate quality analysis;
3. platform-approved knowledge change — versioned global release after review.

Aggregates identify missing questions, extraction errors, ranking errors, corpus gaps, and action weaknesses. They do not mutate production rules automatically.

Promotion requires provenance, minimum supporting cases, conflict review, regulatory-source verification, approval actor, release version, regression run, and rollback metadata.
