# InSite / HazLenz AI Transition Phases

## Product Identity

App/platform: InSite
AI engine: HazLenz AI

Legacy/internal names may still exist temporarily:
- Sentinel Safety
- SafeScope
- ReviewCore
- GuideGuard
- SightSignal
- AuditAlly

## Product Philosophy

InSite is inspection-first.

Keep the app mobile-first, simple, professional, straightforward, defensible, advisory-only, and centered on qualified human review.

Lightweight personal organization is allowed: in-progress inspections, corrective actions due, inspection/report reminders, task reminders, and a simple calendar.

Delay heavy company/team governance unless intentionally prioritized.

## Current Technical Reality

Frontend root: frontend-next/
Backend root: backend/

Current HazLenz internal backend implementation: backend/src/safescope-v2/
Current classify endpoint: POST /safescope-v2/classify
Current frontend client: frontend-next/lib/safescope.ts
Current primary workflow: frontend-next/app/inspection/page.tsx
Current DTO: backend/src/safescope-v2/dto/classify.dto.ts

Classify request currently supports:
- text
- scopes?
- evidenceTexts?
- visualAttachments?
- riskProfileId?
- workspaceId?
- priorFindings?

## Naming Rules

Customer-facing copy should use InSite for the app/platform and HazLenz AI for the AI engine.

Internal names may remain temporarily where renaming would be risky:
- backend/src/safescope-v2
- SafescopeV2Controller
- SafescopeV2Service
- ClassifyDto
- runSafeScopeV2Classify
- SafeScope TypeScript types
- /safescope-v2/classify

Do not rename backend folders, Nest modules, DTOs, database concepts, or API routes until a compatibility refactor is planned and verified.

Safe naming order:
1. Update visible copy first.
2. Update brand constants.
3. Update comments/logs where safe.
4. Add HazLenz-named wrappers/aliases.
5. Rename functions/types in small batches only after builds pass.
6. Rename routes/folders last, if ever.

## Phase 0 — Stabilize Current Build

Goal: preserve the working app.

Tasks:
- Keep frontend build passing.
- Keep backend build passing.
- Commit safe checkpoints locally.
- Do not push/deploy unless explicitly requested.
- Do not rename internal service folders or API routes.

Verification commands:
- cd ~/Sentinel_Safety/frontend-next && npm run build
- cd ~/Sentinel_Safety/backend && npm run build:render

## Phase 1 — Brand Surface Cleanup

Goal: visible app language becomes InSite / HazLenz AI.

Tasks:
- Replace visible Sentinel Safety references with InSite.
- Replace visible GuideGuard, SightSignal, and AuditAlly references with InSite.
- Replace visible SafeScope and ReviewCore AI references with HazLenz AI.
- Keep internal service names stable.
- Keep /safescope-v2/classify unchanged.
- Verify frontend/backend builds.

## Phase 2 — HazLenz Service Naming Wrapper Layer

Goal: introduce proper service naming without breaking existing imports or routes.

Tasks:
- Add HazLenz-named frontend wrappers around current SafeScope functions.
- Preserve existing SafeScope exports during transition.
- Create or verify shared classify request/response types.
- Keep old API route working.
- Optionally add a compatibility route later, such as /hazlenz-ai/classify, only after current behavior is stable.

## Phase 3 — HazLenz Output Stabilization

Goal: eliminate zeroed-out, misleading, or silent fallback output.

Tasks:
- Audit frontend-next/lib/safescope.ts.
- Audit backend/src/safescope-v2/safescope-v2.service.ts.
- Audit orchestrator fallback paths.
- Ensure degraded output is clearly labeled.
- Ensure fallback output never appears to be full successful HazLenz intelligence.
- Preserve advisory-only language.

## Phase 4 — Inspection-First UX Simplification

Goal: keep InSite centered on inspection work.

Tasks:
- Prioritize active inspections.
- Prioritize HazLenz review.
- Prioritize corrective actions due.
- Prioritize report work.
- Keep calendar/tasks lightweight.
- Reduce overbuilt dashboard/company/team emphasis.
- Delay heavy enterprise governance.

## Phase 5 — Controlled Internal Refactor

Goal: optionally rename internal SafeScope code safely.

Only begin this phase after the app is stable, brand surface cleanup is complete, and HazLenz output is reliable.

Tasks:
- Create compatibility aliases.
- Rename types/functions in small batches.
- Do not rename folders and routes in the same commit.
- Keep old API routes working until frontend migration is complete.
- Run builds after every batch.

## Current Reference Documents

Preferred current-state reference: INSITE_CURRENT_BUILD_BLUEPRINT_REVISED.md
Supporting reference: INSITE_CURRENT_BUILD_BLUEPRINT.md

The revised blueprint is preferred when the two differ.
