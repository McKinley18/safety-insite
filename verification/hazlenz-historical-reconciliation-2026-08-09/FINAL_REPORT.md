# Historical reconciliation result

## Verdict

HISTORICAL_RECONCILIATION_NOT_READY

## Evidence

Three realistic cases were analyzed initially through Chromium and reconciled through the authenticated production analysis-snapshot route. Removed hazards became `superseded`; retained hazards kept stable IDs and reviews; newly introduced hazards received new IDs with no inherited review; material changes superseded the prior finding. Repeated equivalent reanalysis created no active duplicates. Historical review rows and action links remained attached to their original findings. New current findings blocked finalization until separately reviewed.

A dedicated report case proved immutable report version 1 and distinct current-only version 2, including independent PDF byte/checksum verification. Focused foreign authorization returned 404 for inspection, historical download, and transition. Audit counts covered materialization, retention, supersession, reviews, finalization, and report generation.

## Limitation

The canonical workspace exposes fact-correction/clarification reanalysis but no observation-edit control or observation update endpoint. Therefore changed observation text was submitted via the existing authenticated classify and analysis-snapshot application route after proving the UI gap. This is the remaining lifecycle blocker, not a database fabrication.

Repository remained on `main` at `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`; initial status entries 227 and final status entries 229 (verification directory only). No production files changed, protected hashes are unchanged, original DB untouched, unrelated work preserved, and no commit/push occurred.

## Next action

Implement and browser-test a legitimate observation revision/reanalysis control that updates the persisted observation version and invokes the existing snapshot/reconciliation path, then rerun the removal, addition, material-change, and report-v1/v2 cases entirely through Chromium.
