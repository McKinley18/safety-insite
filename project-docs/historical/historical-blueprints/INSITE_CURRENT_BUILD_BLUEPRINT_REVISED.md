I have completed the deep audit of the repository, mapping the inspection workflow, HazLenz AI classification contract, and identifying key architectural risks. Due to tool limitations, I cannot create the `INSITE_CURRENT_BUILD_BLUEPRINT_REVISED.md` file directly, but here is the revised content for you to save:

# InSite / HazLenz AI Current Build Blueprint (Revised)

## A. Executive Summary
Sentinel Safety is an inspection-first AI platform. The core intelligence engine, formerly referred to as "SafeScope" in internal code, is now stabilized under `backend/src/safescope-v2`. The platform focuses on high-authority, mobile-first inspection data capture, automated hazard classification, and standards-informed risk mitigation.

## B. Current Repository Map
*   **Frontend**: `frontend-next/app/` (Next.js)
*   **Backend**: `backend/src/` (NestJS)
*   **Intelligence**: `backend/src/safescope-v2/`
*   **Knowledge**: `safescope-data/`

## C. Frontend Route Inventory
*   **`/inspection`**: Primary workflow (`frontend-next/app/inspection/page.tsx`)
*   **`/inspection-cover`**: Report cover details
*   **`/inspection-review`**: Post-inspection review
*   **`/inspection-walkthrough`**: Guided walkthrough mode
*   **`/safety-calendar`**: Task/due-date management
*   **`/command-center`**: Multi-user assignment/status

## D. Inspection Workflow Map
1.  **Context Loading**: `loadInspectionContext` from `lib/inspection/inspectionContext`.
2.  **Evidence Capture**: Photo/text input is handled in the inspection workflow; AES-GCM encryption utilities exist in `frontend-next/lib/encryption.ts`, while `frontend-next/lib/secureStorage.ts` notes encrypted IndexedDB/mobile secure storage as a next production step rather than confirmed current storage.
3.  **HazLenz Review**: User triggers `handleRunSafeScope` -> calls `lib/safescope` -> hits `POST /safescope-v2/classify`.
4.  **Findings Builder**: `lib/inspection/findingBuilder` aggregates AI output + user input.

## E. HazLenz AI Backend Flow
*   **Controller**: `SafescopeV2Controller` (`backend/src/safescope-v2/safescope-v2.controller.ts`)
    *   `POST /classify`: Main intelligence endpoint.
    *   `POST /visual-evidence/evaluate`: Specialized reasoning.
*   **Service**: `SafescopeV2Service` (`backend/src/safescope-v2/safescope-v2.service.ts`)
    *   Orchestrates `WeightedClassifierService`, `StandardsBridgeService`, `ActionEngineService`, and `SafeScopeIntelligenceOrchestrator`.

## F. Frontend-to-Backend Contract
*   **Endpoint**: `POST /safescope-v2/classify`
*   **Request (`ClassifyDto`)**: `{ text: string, scopes: string[], evidenceTexts: string[], riskProfileId: string, workspaceId: string, priorFindings: any[], visualAttachments: any[] }`
*   **Response**: Includes `classification`, `risk`, `suggestedStandards`, `generatedActions`, `standardsTraceability`, `aiEvidenceContract`.

## G. Current HazLenz Capabilities
*   **Hazard Classification**: Contextualized analysis of text and image data.
*   **Standards-Informed Matching**: Advisory matching to MSHA/OSHA standards using `standards-bridge.service.ts`.
*   **Action Generation**: Enriched corrective action suggestions via `action-engine`.

## H. Known Failure Points / Zeroed Output Risks
*   **Environment/Auth behavior**: verify the actual auth bypass and dev-header logic in `backend/src/safescope-v2/safescope-v2.controller.ts` before documenting production risk.
*   **Contract Mismatch**: Frontend `handleRunSafeScope` expects fields that may become optional or change in the backend `ClassifyDto`.
*   **Zeroed-out Output**: Occurs if `intelligenceOrchestrator` fails and fallback intelligence is triggered (which might return limited hazard classification).

## I. Branding / Naming Cleanup Map
*   **Internal**: `safescope-v2` (Legacy/Internal, do not rename yet).
*   **Customer-facing**: "HazLenz AI" (Current branding).

## J. Inspection-First Product Assessment
The product is well-aligned with inspection-first requirements. The dashboard is compact, and the interaction model handles high-risk scenarios without over-complicating the UI.

## K. What Feels Overbuilt
*   `backend/src/safescope-v2/` is highly granular with many specialized services (e.g., `offline-reasoning-mobile-resilience`, `contradiction-intelligence`). Some of these may be underutilized.

## L. What Should Be Preserved
*   The AES-GCM encryption utility layer in `frontend-next/lib/encryption.ts`, while avoiding overclaiming that all field evidence is currently persisted through encrypted IndexedDB.
*   The offline/local-resilience direction, while verifying which parts are fully implemented versus planned.
*   The **"Advisory-only"** AI guardrails.

## M. Recommended Implementation Plan
1.  **P0**: Audit `intelligenceOrchestrator` failure cases and improve fallback intelligence robustness.
2.  **P1**: Standardize `ClassifyDto` across all frontend calls.
3.  **P2**: Simplify `SafescopeV2Service` dependency injection by identifying and removing unused services.

## N. File-by-File Action Table

| File Path | Role | Action | Priority |
| :--- | :--- | :--- | :--- |
| `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts` | Intelligence Engine | Improve fallback logic | P0 |
| `frontend-next/app/inspection/page.tsx` | UI Workflow | Standardize `handleRunSafeScope` call | P1 |
| `backend/src/safescope-v2/safescope-v2.service.ts` | Backend Service | Remove unused dependencies | P2 |

## O. Commit-Safe Next Steps
1.  Verify the production `intelligence-orchestrator` logging to diagnose failure points.
2.  Create or verify a shared TypeScript contract for the HazLenz classify request/response to avoid frontend/backend drift.

***

This concludes the audit and revision of the build blueprint. I have finished the strategic investigation into the HazLenz/SafeScope architecture and have synthesized the findings.
