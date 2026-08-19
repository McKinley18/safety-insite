# Private file authorization

Status: **unresolved; pilot blocker for sensitive evidence**.

Uploads use safer validation from Phase 1, but retrieval remains static and has no ownership-bearing file record. Report attachments store caller-facing URI/name/MIME fields and do not provide an opaque, parent-authorized download boundary.

The storage model must first identify the canonical parent (inspection, finding, report, profile or organization). Required implementation: private object record with opaque ID, storage key never returned as a path, authenticated controller, parent-scope check, attachment/nosniff headers, and explicit public-asset classification.

No direct-file authorization test can pass truthfully with the current static model.
