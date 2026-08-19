# V5-C05 — Phase 1: P1-01 Reproduction

## Environment

Disposable Postgres database `c05_flowunif_20260816` (all 35 migrations applied, `safescope` untouched —
see `V5_C05_BASELINE.md`). Backend: `cd backend && DATABASE_URL=... PORT=4055 DEV_AUTH_BYPASS=true
DEV_FORCE_PRO=true CORS_ORIGINS="http://localhost:3055" npm run dev`. Frontend:
`cd frontend-next && NEXT_PUBLIC_API_BASE_URL="http://localhost:4055" NEXT_PUBLIC_DISABLE_AUTH="true"
PORT=3055 npm run dev`. Real Chrome browser session via `claude-in-chrome`, dev-bypass auth token
(`sentinel_auth_token=local-dev-token` in `localStorage`, gated by `NEXT_PUBLIC_DISABLE_AUTH`).

One incidental fix was required to make the disposable environment usable: the backend's default CORS
allowlist (`backend/src/main.ts`) only includes `localhost:3000`/`3001`/`8081` for non-production — port
3055 (chosen to avoid colliding with any already-running instance) had to be added via `CORS_ORIGINS`.
This is a session-local dev-server invocation flag, not a code change, and is unrelated to C05's scope.

## Trace: dashboard → primary CTA → route → workflow → review → persisted findings → displayed risk

1. Navigated to `/command-center` (the Home dashboard). Confirmed live backend connectivity ("Live"
   indicator, green).
2. Clicked **"Start Inspection"** — the single most prominent CTA on the page
   (`frontend-next/app/command-center/page.tsx:419`, `href="/inspection"`).
3. Landed directly on `/inspection` (the legacy flow) — no picker, no gating, confirming this CTA
   bypasses the canonical `/inspections` entry point entirely.
4. Entered a multi-hazard observation: *"A mechanic reached into the baler to clear a jam while
   hydraulic pressure remains in the ram, and a nearby employee walked past an open electrical panel
   with exposed energized bus bars."* (location: "Baler area, east wall"). This is the same fixture the
   midpoint audit's finding-scope feasibility research used, confirmed server-side to decompose into
   **4 distinct hazards**: `electrical`, `hydraulic_pneumatic_energy`, and two more surfaced live in the
   UI as `ground_control` and `lockout_tagout` (confidence 40%/78%/20%/75% respectively — screenshot-
   confirmed "SEPARATE HAZARDS DETECTED" banner, `SafeScopeInspectionStep.tsx:308-333`, rendered inside
   `InspectionStepTwo` at Step 2 of the legacy flow).
5. Ran "Review with HazLenz AI" — top-level classification returned: **"Electrical", HIGH risk, 99%
   confidence**. The multi-hazard banner is purely informational: no per-hazard "add as separate finding"
   control exists anywhere in its markup (confirmed by DOM/accessibility-tree inspection) — the only way
   to create a second finding is to save the current one and manually start a fresh finding via
   "Save & Add New Finding".
6. Saved this as **Finding 1** ("Electrical", risk matrix cell Severity 4 × Likelihood 3 = 12/High).
7. Clicked "Save & Add New Finding", entered the **identical** observation text again (representing the
   inspector documenting a second material hazard from the same scene, exactly as the banner's own text
   instructs: *"Review each material hazard independently... must not be merged without qualified
   review"*), ran "Review with HazLenz AI" again.
8. Result: **identical** top-level classification — "Electrical", HIGH risk, 99% confidence, same
   primary standard (29 CFR 1910.303(g)(2)(i)). Saved as **Finding 2** with the same risk matrix
   selection (12/High).
9. Proceeded through "Finalize Findings" (both findings listed: `FINDING 1 · Electrical · Risk High` /
   `FINDING 2 · Electrical · Risk High`) → "Generate Report" → `/inspection-review`.
10. On `/inspection-review`'s "Findings Review" section (rendered by
    `frontend-next/components/inspection/FindingsReviewList.tsx`), both finding cards display a **"HIGH"**
    risk badge — **byte-identical risk presentation for two findings the system's own multi-hazard
    decomposition had already identified as four separate material hazards with different confidence
    levels**. Screenshot saved:
    `verification/hazlenz-v5-c05-flow-unification-2026-08-16/screenshots/legacy-flow-shared-risk-defect.jpg`.

## Root-cause confirmation (code-level)

`FindingsReviewList.tsx:55`: `const risk = finding.safeScopeResult?.risk?.riskBand ||
finding.safeScopeResult?.risk?.operationalRisk?.matrixBand || finding.riskBand || finding.riskScore ||
"Not rated";` — reads the **observation-level** `risk` field from whatever `/safescope-v2/classify`
response is attached to that finding. Neither `frontend-next/app/inspection/page.tsx` nor
`frontend-next/lib/inspection/hazlenzInspectionService.ts` references `riskSnapshot`, `multiHazard`, or
any per-hazard risk scoping mechanism (confirmed by grep — zero matches). Every finding in the legacy
flow gets whatever the single dominant/top-level classification of its own `classify()` call was; when
two findings document the same or overlapping multi-hazard scene (the exact scenario the flow's own UI
explicitly invites via the "Separate hazards detected" banner), they receive the same dominant
classification and risk band, because the underlying engine has no concept of "this finding is hazard #2
of the observation, score only hazard #2's fragment."

## Canonical-side comparison (not re-derived live — cited from existing verified evidence)

Attempting to run the equivalent canonical `/inspection-workspace` flow live in this same disposable
environment was blocked by an unrelated pre-existing dev-harness limitation: the `DEV_AUTH_BYPASS`
synthetic user hardcodes `userId: 1` (`backend/src/auth/guards/jwt.guard.ts:31`), which is numeric, while
the `sites` table's owner/organization columns are typed `uuid` — `POST /sites` and `GET /sites` both
return `500 QueryFailedError: invalid input syntax for type uuid: "1"`. This is a dev-auth-bypass/schema
mismatch unrelated to C05's scope and was not fixed (no production code was modified in Phase 1).

Instead, the canonical side is established from V5-C01's own verification, already the authoritative,
closed record for that flow:

- `verification/hazlenz-v5-c01-finding-risk-2026-08-15/V5_C01_IMPLEMENTATION_REPORT.md`: `InspectionService
  .computeFindingRisk(hazard, hazardKey, riskProfileId)` builds hazard-scoped evidence text strictly from
  `hazard.observationFragment + mechanism + supportingSignals` — never sibling-hazard data, never the
  whole fused observation.
- **Metamorphic sibling-isolation proof** (the report's own strongest test): two paired-observation
  tests, in both directions — varying only the machine-guarding-relevant fact between two otherwise-
  identical observations changed the guard finding's risk while leaving the electrical finding's risk
  byte-identical, and vice versa. This is constructive proof of zero sibling-evidence leakage in the
  canonical computation path.
- `verification/hazlenz-v5-c01-finding-risk-2026-08-15/desktop_browser_notes.json`: live browser evidence
  that each finding's risk panel is independently computed and independently labeled ("Risk and review
  actions below apply only to the selected finding. Other findings require their own review."), with
  distinct per-finding rationale text ("Machine Guarding hazards..." vs. "Electrical hazards...").
- Frontend wiring: `frontend-next/app/inspection-workspace/page.tsx` reads `finding.riskSnapshot` per
  finding (`riskSnapshotToReviewerRisk()`, confirmed present at lines 57-84, 826, 833 per the midpoint
  audit's capability-map trace) — the persisted, independently-computed field this session's legacy-flow
  reproduction proved is entirely absent from the competing flow.

## Conclusion

**P1-01 is reproduced and confirmed live, via the real application, through the actual highest-prominence
user entry point.** Two findings documenting different material hazards from one multi-hazard
observation, entered through the flow reachable from the dashboard's primary "Start Inspection" button,
receive byte-identical risk classification and risk band. The canonical `/inspection-workspace` flow does
not exhibit this defect, per its own already-verified, code-proven independence guarantee. This
establishes the baseline defect state before any C05 implementation work begins.
