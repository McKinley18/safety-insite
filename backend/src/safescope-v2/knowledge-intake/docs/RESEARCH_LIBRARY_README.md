# SafeScope Research Library

This library contains autonomous, read-only research into safety and health regulations, standards, mechanism-of-injury intelligence, exposure metrics, and corrective-action patterns intended for potential inclusion in the SafeScope engine.

## Operational Principles
- **Read-Only:** This folder contains gathered intelligence; no changes are made to application code or production files.
- **Source-Verified:** All information is grounded in official sources (OSHA, MSHA, NIOSH, etc.).
- **Authoritative:** Sources are ranked by authority tier; guidance is explicitly distinguished from regulation.
- **Defensible:** All findings require human review before being considered for SafeScope.

## Organization
- `source-register/`: Tracks all reviewed sources.
- `osha/`, `msha/`, `niosh/`: Official regulatory and health agency intelligence.
- `hazard-domains/`, `mechanism-intelligence/`, `exposure-intelligence/`: Structured data models for engine reasoning.
- `corrective-actions/`, `evidence-sufficiency/`: Operational support data.
- `review-needed/`: Tracking gaps, conflicts, and human review candidates.
