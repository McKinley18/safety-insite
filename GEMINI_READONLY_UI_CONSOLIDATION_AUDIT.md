You are acting as a senior full-stack engineer, UI systems architect, and production-readiness reviewer for Sentinel Safety.

IMPORTANT RULES:
- Do not modify files.
- Do not run write commands.
- Do not reformat files.
- Do not change visual appearance.
- Do not rename routes, components, or public-facing labels.
- Do not alter business logic.
- Do not push, deploy, install packages, or update dependencies.
- Analysis only.

Goal:
Analyze the current Sentinel Safety build and produce a careful consolidation plan that would make the codebase more efficient and maintainable while preserving the exact current appearance and behavior.

Focus areas:
1. Repeated UI styles across frontend-next/app and frontend-next/components.
2. Repeated title/header/title-card patterns.
3. Repeated content card patterns.
4. Repeated metric/status cards.
5. Repeated button styles.
6. Repeated badge/status label styles.
7. Repeated empty states.
8. Repeated page spacing/container classes.
9. Components that could be safely extracted without changing appearance.
10. Backend patterns that could be consolidated without changing route behavior, guards, entitlements, or API contracts.
11. Any duplicate helper logic, repeated authorization patterns, or repeated controller/service code.
12. Any areas where consolidation is risky and should be avoided.

Required output:
Create a written audit only. Do not edit code.

Structure the answer like this:

# Sentinel Safety Read-Only Consolidation Audit

## Current Build Summary
Briefly summarize the frontend and backend structure you observed.

## High-Confidence Consolidation Opportunities
For each item, include:
- Current repeated pattern
- Files involved
- Proposed shared component/helper
- Why it is safe
- How to preserve appearance exactly
- Risk level

## Frontend Design System Candidates
List proposed shared components such as:
- PageHeader
- ContentCard
- FeatureCard
- MetricCard
- SectionHeader
- StatusBadge
- AppButton
- EmptyState
- PageContainer

For each, identify the exact existing files/styles that should be used as the visual source of truth.

## Backend Consolidation Candidates
Identify repeated guard/entitlement/service/controller patterns that could be centralized without changing access behavior.

## Do-Not-Touch Areas
List files or flows that should not be refactored yet because they are sensitive, recently hardened, or production-critical.

## Recommended Implementation Sequence
Give a phased plan:
1. Create shared components only.
2. Refactor one low-risk page.
3. Verify appearance.
4. Expand page-by-page.
5. Commit locally after each verified batch.

## Verification Plan
Include exact commands to verify after each phase, using existing local checks only.

## Final Recommendation
Give a practical recommendation on whether this consolidation should happen before production release.

Remember:
No code changes. No appearance changes. No behavior changes. No push. No deploy.
