# SafeScope Site Policy Isolation v1

This document outlines the architecture for applying site-specific and company-wide safety policies within SafeScope, ensuring they adhere to rigorous governance boundaries.

## Purpose
Customers often require stricter or supplementary safety controls (e.g., "100% tie-off", "continuous air monitoring") that must be applied in addition to OSHA/MSHA regulations. Site Policy Isolation allows these rules to influence SafeScope reasoning without contaminating the approved regulatory knowledge base.

## Core Concepts
- **Policy Isolation:** Policies are strictly scoped by `workspaceId` and optional `siteId`. A policy defined for one workspace is impossible to trigger in another.
- **Advisory-Only:** Site policies are flagged as `advisoryOnly: true`. They supplement but do not define legal compliance.
- **Governance:** Site policies cannot override OSHA/MSHA regulatory requirements. The `SitePolicyGovernanceService` blocks any policy that attempts to declare a violation, override regulatory text, or introduce prohibited legal language.
- **Deterministic:** The isolation service uses a local-first fixture model. Policies are filtered and ranked based on specificity (`siteId` exact > `workspaceId`-wide).

## Governance Boundaries
- **No Auto-Promotion:** Site policies are managed separately from the approved knowledge registry.
- **Separation of Concerns:** Site policies are clearly labeled and functionally separated from the official regulatory knowledge base.
- **Review Requirement:** All site policies require qualified review (as per existing workflow gates) before being marked as `active` and influential in the reasoning engine.

## Output Labels
To maintain transparency, all output influenced by site policies must be labeled as "Site/Company Policy" or "Customer Requirement," ensuring users understand the distinction from established regulatory standards.
