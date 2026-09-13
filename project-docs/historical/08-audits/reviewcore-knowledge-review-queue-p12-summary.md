# ReviewCore Knowledge Review Queue API Contract — P12

## Purpose

P12 adds a deterministic local-first backend contract for governed ReviewCore knowledge review queue actions. It prepares the system for future persistence/API wiring without changing active retrieval behavior.

## Contract Added

The queue service supports:

- `listQueue(records)`
- `getQueueItem(recordId, records)`
- `createDraft(input)`
- `approve(record, reviewer, records)`
- `reject(record, reviewer, reason)`
- `requestMoreInfo(record, reviewer, reason)`
- `supersede(oldRecord, replacementRecord, reviewer)`
- `listActiveRetrievalRecords(records)`

## Governance Behavior

Every queue action result includes guardrails confirming:

- Advisory-only behavior
- No violation declarations
- No citation creation
- Qualified review remains required
- Regulation cannot be overridden
- Unapproved records do not affect active retrieval

## Active Retrieval Eligibility

Only approved/governed records are eligible for active retrieval. Draft, needs-review, rejected, retired, superseded, duplicate, prohibited-language, and confidential-data records are excluded.

## Approval Blockers

Primary/core and enhanced/official-style records require citation or source-reference support before promotion. Duplicate, confidential-data, and prohibited-language flags also block approval.

## Validation

The P12 validator checks lifecycle counts, draft creation, approval blockers, active retrieval exclusion, rejected and needs-review behavior, supersession behavior, queue item detail fields, and guardrail preservation.

## Remaining Work

P13 should wire this local-first contract into real backend routes and persistence while preserving P9/P10 approval rules and the P11 UI fallback protections.
