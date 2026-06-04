# Sentinel Safety Read-Only Consolidation Audit

## Current Build Summary
Sentinel Safety is a Next.js (frontend-next) and NestJS (backend) application. 
The frontend structure follows a clear feature-based directory in `frontend-next/app`, with a foundational `frontend-next/components/ui` library. 
The backend is a highly modular NestJS service architecture.

## High-Confidence Consolidation Opportunities

### 1. UI Components (Frontend)
- **Pattern:** Redundant container/card wrappers and status badges across `app/analytics`, `app/command-center`, and `app/inspections`.
- **Files:** `components/ui/SentinelCard.tsx`, `components/ui/StatusBadge.tsx`.
- **Proposed:** Ensure strict usage of these UI components. If they are not being used in `app/inspections`, refactor the inspection components to use them.

### 2. Backend Guard/Auth Patterns
- **Pattern:** Repeated authorization/entitlement checks in controllers.
- **Files:** `backend/src/auth/` vs `backend/src/organizations/`.
- **Proposed:** Standardize the use of NestJS Guards or Interceptors for organizational and role-based checks.

## Frontend Design System Candidates
- **PageContainer:** The app lacks a unified, exported `PageContainer` component for consistent padding/margins, relying instead on CSS classes in `globals.css` or component files.
- **AppButton:** Consolidate `PrimaryButton` and `SecondaryButton` into a single `AppButton` variant-driven component (e.g., `variant="primary" | "secondary"`).

## Backend Consolidation Candidates
- **Dashboard Service:** Analytics and dashboard services share similar data fetching logic.
- **Common Middleware:** Centralize common request/response transformations in `backend/src/common`.

## Do-Not-Touch Areas
- **Encryption Logic:** `frontend/lib/storage.ts` and `frontend/lib/localExporter.ts` (sensitive, cryptography).
- **Authentication/Token Flow:** `backend/src/auth` (production critical).
- **Scientific Models:** `backend/src/predictive` and `backend/src/intelligence` (core intellectual property).

## Recommended Implementation Sequence
1. Standardize UI components (Button variant-driven, unified Container).
2. Refactor low-risk pages (e.g., `about`, `legal`) to use the new UI components.
3. Verify appearance using `npm run dev`.
4. Iterate on features with higher UI complexity (e.g., `analytics`).
5. Consolidate backend service patterns incrementally.

## Verification Plan
1. `npm run lint` - Static analysis.
2. `npm run build` - Ensure no breaking changes.
3. Manual visual regression check in `npm run dev`.

## Final Recommendation
Consolidation should be performed incrementally after the next production release, as the current stability is high and focus should remain on hardening `SafeScope AI Offline`.
