# ReviewCore Knowledge Review Queue Routes/Persistence Contract — P13

## Purpose

P13 adds a local-first controller/store layer over the P12 governed review queue contract. It gives ReviewCore deterministic backend API-style surfaces before a real database migration or NestJS route binding is added.

## Files Added

- `reviewcore-knowledge-review-queue.store.ts`
- `reviewcore-knowledge-review-queue.controller.ts`
- `validate-reviewcore-knowledge-review-queue-routes-p13.ts`

## Store Behavior

The in-memory store supports listing, fetching, saving, updating, archiving, resetting, active retrieval filtering, and deterministic queue snapshots. It preserves record status and review history when present.

## Controller Behavior

The controller supports listing the queue, fetching queue items, creating drafts, approving, rejecting, requesting more information, superseding records, listing active retrieval records, and exporting queue snapshots.

## Governance

Every action returns guardrails confirming advisory-only behavior, no violation declarations, no citation creation, qualified review, no regulation override, and no effect from unapproved records on active retrieval.

## Active Retrieval Rule

Only approved/governed records that are not duplicates and are not flagged for prohibited language or confidential data can enter active retrieval. Draft, pending validation, needs-review, rejected, retired, and superseded records remain excluded.

## Remaining Work

P14 should convert this controller/store contract into real NestJS routes with authenticated actors, durable persistence, audit logging, and database migrations while preserving P9/P10/P12/P13 governance.
