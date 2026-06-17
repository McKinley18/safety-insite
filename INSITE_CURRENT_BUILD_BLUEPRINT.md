# InSite / HazLenz AI Current Build Blueprint

## A. Executive Summary
The repository has been transitioned into a highly focused, mobile-first inspection platform. The core inspection workflow is stable, with **HazLenz AI** serving as the primary hazard intelligence engine. The app is currently geared towards professional safety inspections with streamlined reporting.

*   **Current State**: Production-ready inspection flow with automated intelligence.
*   **HazLenz AI Readiness**: Core classification and corrective action logic are functional; however, standards-informed matching is undergoing active refinement for high-confidence output.
*   **Biggest Blockers**: Fine-tuning standards-matching band-ranking to avoid false positives in same-level slip/trip vs. elevated fall protection scenarios.

## B. Repository Map
*   **`frontend-next/app/`**: Customer-facing UI, including inspection workflow (`/inspection`) and calendar (`/safety-calendar`).
*   **`backend/src/safescope-v2/`**: Core intelligence logic.
*   **`backend/src/safescope-v2/standards-intelligence/`**: Regulatory knowledge seeds (`standards-intelligence.seed.ts`).
*   **`backend/src/safescope-v2/tests/`**: Core regression benchmarks (`hazlenz-core-regression.ts`).

## C. Current User Flow
1.  **Auth**: Token-aware login.
2.  **Home**: Inspection launch / Dashboard.
3.  **Inspection**: Multi-step flow (Evidence, Risk, Actions).
4.  **HazLenz Review**: AI-driven analysis of inputs via `handleRunSafeScope`.
5.  **Finalize**: Report compilation, metadata/standards verification.

## D. HazLenz AI Flow
1.  **Frontend Request**: `handleRunSafeScope` in `frontend-next/app/inspection/page.tsx` sends a payload (text, evidence, prior findings) to the backend.
2.  **API**: `POST [API_BASE_URL]/safescope-v2/classify`.
3.  **Backend Controller**: `SafescopeV2Controller` routes to `classify` method.
4.  **Orchestration**: `SafescopeV2Service` delegates to semantic search and engine classifiers.
5.  **Response**: Frontend maps AI results (`classification`, `suggestedStandards`, `generatedActions`) back to the UI.

## E. Current Capabilities
*   **Hazard Classification**: Contextual hazard analysis.
*   **Standards-Informed Matching**: Advisory matching to OSHA/MSHA standards.
*   **Evidence Gap Detection**: Identifying missing information based on registry evidence requirements.
*   **Reasoning**: Surfacing potential risk mechanisms and proposing corrective actions.

## F. Known Issues and Risks
*   **Routing Regressions**: Standard ranking overlap between "same-level walking surface" and "elevated fall protection".
*   **Brand Naming**: Residual legacy names (`SafeScope`, `Sentinel Safety`) in internal identifiers and code documentation.
*   **Local Backend/Environment**: Risk of local-production environment variable mismatch (API URLs).

## G. Inspection-First Product Assessment
The app is firmly inspection-first. The simplification of the navigation and the focus on the compact mobile dashboard are significant improvements. The calendar and settings pages are currently well-balanced. Avoid expanding into enterprise management features that deviate from inspection execution.

## H. Recommended Next Implementation Plan
*   **P0**: Resolve Scenario E false-positive routing in regression benchmarks.
*   **P1**: Complete customer-facing brand name replacement (all visible instances).
*   **P2**: Enhance evidence requirements granularity to reduce "missing evidence" false positives.
*   **P3**: Strengthen fallback intelligence for degraded network states.

## I. File-by-File Action Table

| File Path | Role | Action | Priority |
| :--- | :--- | :--- | :--- |
| `backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts` | Standards Knowledge | Refine searchBoostTerms | P0 |
| `backend/src/safescope-v2/tests/walking-working-surfaces-benchmark.ts` | Regression Testing | Tune Scenario E assertions | P0 |
| `frontend-next/app/safescope/page.tsx` | Customer-facing Info | Modernize HazLenz branding | P1 |

## J. Final Recommendation
To maintain marketability and professional trust, finalize the HazLenz AI classification precision for elevated vs. same-level hazards. Maintain strict advisory-only language in the UI, emphasizing human-in-the-loop and professional review to reinforce AuditAlly's position as a supportive, high-authority tool for safety professionals.
