# V5-C05 — Phases 4-6: Consolidation Strategy, State Preservation, Primary CTA

## Phase 4 — Strategy selection

**User decision (explicit, via clarifying question before implementation):** fix the defect in place and
preserve the legacy flow's free/no-entitlement access and offline capability, rather than redirecting the
primary CTA to the canonical flow.

This is **Strategy C** from the task's preferred ordering ("extract/reuse the already-validated canonical
behavior... only if route consolidation is not currently safe. Avoid creating independent copies"), with
one architectural refinement discovered during design: the legacy flow's "finding" is a **pure client-side
object** — `persistFindingSaveSideEffects()` (`frontend-next/lib/inspection/findingSaveService.ts`) only
touches `actionStorage`/`activityStorage` (both localStorage), never a backend endpoint. Legacy findings
never become `InspectionFinding` database rows, so C01's `riskSnapshot` (a DB column populated by
`InspectionService.reconcileDecompositionFindings()`) cannot structurally apply to them — there is no
shared persisted entity to reuse. **True Strategy C (reusing the persisted `riskSnapshot` field itself) is
not reachable without first re-architecting the legacy flow onto server-persisted findings — a change with
the same entitlement/offline consequences as Strategy A/B, which the user's decision rules out.**

Given that, the implemented fix reuses the **shared underlying risk-computation mechanism** at one level
lower than the persisted field: both flows' risk ultimately originates from the same deterministic
`/safescope-v2/classify` endpoint and its `evaluateRisk()` engine. C01's independence guarantee comes from
scoping the *input text* to `hazard.observationFragment + mechanism + supportingSignals` before calling
that engine — never from a separate risk-computation implementation. The legacy flow already surfaces each
decomposed hazard's `observationFragment` in its UI (the "Separate hazards detected" banner,
`SafeScopeInspectionStep.tsx:308-343`); it simply had no way to feed that fragment back in as the next
finding's input text.

**Implementation:** each hazard card in that banner gained a **"Start a finding for this hazard"** button.
Clicking it saves the current finding (reusing the existing `addNewFinding()` save-and-reset logic
unchanged), then seeds the fresh finding's observed-condition field with that hazard's own
`observationFragment` (falling back to `mechanism` if the fragment is empty). When the inspector then runs
"Review with HazLenz AI" for that finding, the classify() call is scoped to just that hazard's evidence
text — exactly the same scoping principle C01 uses server-side, reusing the identical backend engine, with
zero new risk-computation logic anywhere in the frontend or backend.

This is not "two independently maintained C01 implementations": there is exactly one risk-computation
mechanism (`evaluateRisk()` behind `/safescope-v2/classify`); the fix only changes what text the legacy UI
sends to it, mirroring — not duplicating — C01's scoping contract.

### Why Strategy A/B were correctly rejected

Confirmed via Phase 2/3 research and the explicit user decision:
- Legacy `/inspection` has **zero** entitlement gating (`hasPlanEntitlement`: zero matches anywhere in the
  legacy tree); canonical gates the full guided workflow behind a Pro entitlement. Redirecting the primary
  CTA would paywall a currently-free capability as a side effect of a defect fix — a product/policy change,
  not an engineering one.
- Legacy has a genuine, working offline capability (`runHazLenzOffline` plus a fully local report
  build/edit/export loop); canonical has no offline fallback at all. A redirect would remove this with no
  substitute.

### Why Strategy D (a literal "narrow backport" reimplementation) was unnecessary

The task frames Strategy D as reimplementing C01's risk-snapshot *behavior* client-side, as a last resort.
That was not needed: because the underlying risk engine is already shared (same `classify()` endpoint, same
`evaluateRisk()`), the fix only had to change which text reaches that shared engine — no new
risk-computation code was written anywhere.

## Phase 5 — Inspection state preservation

No routes changed, no persistence mechanism changed, no existing function's behavior changed for any
caller that doesn't use the new button. The diff is **purely additive**: 64 insertions, 0 deletions, across
4 files (`app/inspection/page.tsx`, `InspectionStepRenderer.tsx`, `steps/InspectionStepTwo.tsx`,
`SafeScopeInspectionStep.tsx`) — confirmed via `git diff --stat`. `addNewFinding()` (the save-and-reset
function reused by the new handler) is invoked unmodified; the new `useHazardFragmentForNewFinding()`
wraps it without altering its logic.

Consequences for each of the required test scenarios:
1. **New inspection** — unaffected; new capability is purely additive UI on an existing, already-visited
   step.
2. **Existing in-progress canonical inspection** — untouched; no canonical file was modified.
3. **Existing in-progress legacy inspection** — untouched; existing `findings` array, `resetCurrentFinding()`,
   `saveFinding()`, and all storage keys (`sentinel_inspection_autosave`, `sentinel_selected_inspection_context`,
   encrypted report storage) are unmodified. A user mid-inspection who never clicks the new button experiences
   zero behavior change.
4. **Refreshed browser** — unaffected (legacy resume behavior was already established as non-robust in
   Phase 3's capability diff; this fix neither improves nor worsens it, since it touches only the
   step-2-banner button, not any persistence/reload path).
5. **Direct deep link** — unaffected; no route was added, removed, or redirected.
6. **Back/forward navigation** — unaffected; `resetCurrentFinding()`'s existing `setCurrentStep(1)` call
   (reused, not modified) is the only navigation the new handler triggers, identical to the pre-existing
   "Save & Add New Finding" button's behavior.

No migration was required. No existing inspection progress can be stranded or corrupted by this change.

## Phase 6 — Primary CTA

The dashboard's "Start Inspection" CTA (`command-center/page.tsx:419`) still routes to `/inspection`,
unchanged. Per the user's explicit decision, this is correct: the CTA now reaches a flow that no longer
exhibits the shared-risk defect for hazards documented via the new "Start a finding for this hazard"
control, while retaining its free/offline character.

**This is a narrower guarantee than "the flow is now bug-proof for every finding a user creates."** The
fix is opt-in at the point where it matters: it appears only when the system has already detected multiple
material hazards in one observation (`multiHazardDecomposition.hazards.length > 1`) — precisely the
scenario P1-01 exploited. A user who manually creates two findings from two entirely separate, unrelated
observations was never affected by P1-01 in the first place (each such finding already gets its own
independent `classify()` call on its own distinct text). The residual gap — a user ignoring the new button
and instead re-typing/re-pasting the same multi-hazard narrative for a second finding, as this audit's
Phase 1 reproduction deliberately did to prove the defect — is a user-workflow choice, not a system defect;
the tool now offers the correct path at the exact decision point where the risk previously existed. See
`V5_C05_STATE_COMPATIBILITY.md` and `V5_C05_BROWSER_VERIFICATION.md` for the full verification, and
`V5_C05_IMPLEMENTATION_REPORT.md` for the final disposition assessment against the C05_CLOSED bar.

Desktop and mobile: no responsive-specific code path exists for the banner or the new button (plain
Tailwind flex/grid classes, no viewport-conditional rendering) — the fix applies identically at both
breakpoints. `/inspection-cover` and `/inspection-quick` were not modified (out of scope: the former is a
thin unrelated wrapper, the latter is confirmed dead code, see `V5_C05_FLOW_CENSUS.md`).
