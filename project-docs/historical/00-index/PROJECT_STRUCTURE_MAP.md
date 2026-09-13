# SafeScope Project Structure Map v1

This document provides a high-level map of the Sentinel Safety repository, specifically focusing on the SafeScope AI Intelligence engine and its supporting infrastructure.

## Major Folders & Purpose

### Root
- **`backend/`**: NestJS server-side application.
- **`frontend-next/`**: Next.js client-side application.
- **`safescope-data/`**: Deterministic datasets, approved knowledge, and scenario packs.
- **`project-docs/`**: Permanent architectural, governance, and readiness documentation.

### Backend (`backend/`)
- **`src/safescope-v2/`**: Core reasoning logic, hazard universe, and governance layers. **Source of Truth for AI logic.**
- **`scripts/`**: Validation scripts, precision benchmarks, and automation tools.
- **`src/auth/`**: Authentication guards and role-based access control.

### Safescope Data (`safescope-data/`)
- **`approved-knowledge/`**: Governed regulatory and best-practice records.
- **`field-test-scenarios/`**: Realistic field observations for deterministic validation.
- **`benchmarks/`**: Precision and recall result snapshots.
- **`persistence/`**: Local JSON audit records (file-backed fallback mode).

### Project Documentation (`project-docs/`)
- **`00-index/`**: Capability index and project maps.
- **`04-safescope-engine/`**: Detailed engine architecture and taxonomy maps.
- **`05-deployment/`**: Staging and production readiness guides.

## Source of Truth Files
- `backend/src/safescope-v2/hazard-universe/hazard-universe.registry.ts`: The definitive hazard/energy map.
- `safescope-data/approved-knowledge/registry/`: Approved regulatory records.
- `backend/scripts/run-safescope-full-validation.ts`: The master integrity suite.

## Generated / Local-Only Files (Should normally be restored/ignored)
- `safescope-data/benchmarks/*results*.json`
- `safescope-data/reviewer-candidates/candidates.json`
- `safescope-data/persistence/audit_records.json`

## Integration Points
- **Post `/safescope-v2/classify`**: Primary classification entry point.
- **Post `/safescope/reviewer-candidates`**: Governance workflow entry point.
- **Frontend `lib/safescope.ts`**: API client for SafeScope services.

## Governance & Safety
- **DO NOT** casually edit `advisoryOnly` or `doesNotDeclareViolation` flags.
- **DO NOT** bypass `WorkspaceGovernanceAccessService` checks.
- **DO NOT** hardcode secrets in any environment.
