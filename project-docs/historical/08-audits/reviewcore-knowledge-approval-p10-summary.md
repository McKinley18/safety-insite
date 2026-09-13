# ReviewCore Knowledge Approval Workflow — P10 Summary

## Purpose

P10 adds a governed approval workflow between knowledge ingestion and active retrieval. This prevents draft, needs-review, rejected, superseded, duplicate, or otherwise unreviewed knowledge records from influencing ReviewCore reasoning.

## Approval Queue Lifecycle

Records enter the approval workflow after ingestion as draft or needs_review records. The approval service builds review queue items that summarize record identity, status, authority tier, domain tags, duplicate candidates, review checklist items, approval blockers, and a recommended review decision.

## Approval Blockers

A record cannot be promoted into active retrieval unless required metadata and governance conditions are satisfied. Primary regulation and official guidance records require citation/source support. Duplicate-like records must be reviewed before activation. Site policy records cannot override primary regulations. Reviewer feedback and field observation patterns remain advisory and cannot create citations or standards.

## Promotion to Active Retrieval

Only approved records with intact advisory guardrails are eligible for active retrieval. Draft, needs_review, rejected, superseded, and unresolved duplicate records are excluded by default.

## Rejection and Supersession Behavior

Rejected records preserve source metadata and rejection reasoning but are excluded from active retrieval. Superseded records are also excluded from active retrieval, while replacement records must separately satisfy approval readiness before promotion.

## Governance Protection

This workflow ensures that Gemini-ingested records, site policies, reviewer feedback, and field observation patterns can be organized and queued without automatically affecting ReviewCore reasoning. Active retrieval remains limited to approved, source-governed records with advisory-only guardrails.

## Recommended Next Phase

P11 should connect the approval workflow to a lightweight review queue interface or backend route so approved users can review, reject, supersede, or promote records through the application while preserving audit traceability.
