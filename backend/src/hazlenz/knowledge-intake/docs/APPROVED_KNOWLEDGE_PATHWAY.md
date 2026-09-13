# SafeScope Approved Knowledge Pathway

## Purpose

This document describes the approved-knowledge pathway for SafeScope.

The pathway lets SafeScope collect, validate, review, export, query, and later use source-grounded safety knowledge without allowing unreviewed information to affect production reasoning.

## Pathway

1. Source register
2. Source-specific intake mods
3. Quarantined knowledge records
4. Knowledge record validation
5. Coverage reporting
6. Human review workflow
7. Approved-only export bundle
8. Approved knowledge query service
9. Disabled approved knowledge bridge
10. Disabled approved knowledge integration adapter
11. Contract and snapshot validation
12. Full knowledge pipeline validation

## Approval Rule

Only records meeting all of these conditions may be exported or queried as approved knowledge:

- reviewStatus = approved_by_human
- approvedForUse = true
- sourceBoundary != prohibited

Quarantined, unreviewed, rejected, or prohibited records must not be used by SafeScope reasoning.

## Guardrails

The approved-knowledge pathway must not:

- Declare violations
- Create citations
- Invent standards
- Override regulations
- Use unapproved records
- Bypass qualified human review
- Modify SafeScope native reasoning
- Treat guidance as binding regulation
- Treat accident reports as regulatory requirements

## Bridge and Adapter Status

The approved knowledge bridge is disabled by default.

The approved knowledge integration adapter is also disabled by default.

These components define a safe future connection point between approved knowledge and SafeScope native reasoning, but they do not change active production reasoning.

When disabled, they must return no records and no references.

When explicitly enabled for validation or future integration work, they may provide read-only approved context only.

## Current Validation Command

Run the full SafeScope knowledge pipeline with:

cd ~/Sentinel_Safety
npx ts-node --project backend/tsconfig.json backend/scripts/validate-safescope-knowledge-pipeline.ts

## Current Production Status

Production SafeScope reasoning is unchanged.

This pathway is infrastructure only. No approved knowledge should influence active SafeScope reasoning until a separate explicit integration task is designed, validated, reviewed, and committed.
