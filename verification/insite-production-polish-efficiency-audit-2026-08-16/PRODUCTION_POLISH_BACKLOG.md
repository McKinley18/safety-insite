# Production Polish Backlog (Ranked)

Each item: screen/workflow · issue · evidence · user impact · professional-quality impact · recommended fix (not implemented) · regression risk · effort · prerequisite.

## P0 — release blockers

### P0-1. PDF/report export is a dead end
- **Screen/workflow**: `/inspection-review` (legacy flow), "Export Final PDF."
- **Evidence**: Checkbox confirmed checked; button click produces zero network requests; blocking message ("1 HazLenz AI finding(s) still need snapshot validation") has no corresponding UI control anywhere on the page.
- **User impact**: A user cannot get a finished report out of the product via this path at all.
- **Professional-quality impact**: Report generation is a headline feature per the product's own registration copy; this defect undermines the core value proposition.
- **Recommended fix**: Either surface a real "validate snapshot" control, or remove the gate if it's stale/misconfigured; requires backend investigation into what "snapshot validation" actually checks.
- **Regression risk**: Low to fix in isolation; requires understanding the gate's intended purpose first.
- **Effort**: Medium (investigation) + Small (fix).
- **Prerequisite**: None.

### P0-2. Finding-identity bug during finalization (canonical workspace)
- **Screen/workflow**: `/inspection-workspace`, "Confirm risk and finalize finding."
- **Evidence**: Confirming risk while `machine_guarding` was the selected finding instead finalized the sibling `fall_protection` finding; `machine_guarding` remained stuck at `pending_review`.
- **User impact**: A user's review action silently applies to the wrong record.
- **Professional-quality impact**: Directly undermines the "qualified human review" guarantee any resulting report would claim.
- **Recommended fix**: Root-cause the finding-selection/target-ID plumbing in the risk-confirm action.
- **Regression risk**: Medium — likely touches shared finalize logic used by multiple findings.
- **Effort**: Medium.
- **Prerequisite**: None.

### P0-3. Corrective-action content mismatch on multi-hazard observations
- **Screen/workflow**: HazLenz AI Review → Standards & Actions, any multi-hazard observation.
- **Evidence**: Machine Guarding finding's corrective action was titled "Verify hazardous-energy isolation before servicing" but its body text was entirely fall-protection guidance (guardrails, fall-arrest systems).
- **User impact**: A user following a "CRITICAL priority" action as written would not address the actual hazard.
- **Professional-quality impact**: Directly undermines trust in the corrective-action feature.
- **Recommended fix**: Investigate the 3 parallel corrective-action generators identified in `SERVICE_EXECUTION_AUDIT.md` (`CorrectiveActionBrainService`, `DefensibleCorrectiveActionService`, `ActionEngineService`) and their merge logic — this is a plausible mechanism for cross-hazard content bleed.
- **Regression risk**: Medium-high — touches a core, three-way-merged generation path.
- **Effort**: Medium-large.
- **Prerequisite**: None; can be investigated alongside P0-2 since both touch multi-hazard finding identity.

## P1 — high-severity, non-blocking

### P1-1. Default local dev config (`DEV_AUTH_BYPASS=true`) breaks HazLenz review entirely
- **Evidence**: `userId: 1` (integer) hardcoded in `JwtGuard`'s bypass path is passed to UUID-typed DB columns, causing `QueryFailedError` → raw 500 shown to the user.
- **Impact**: Anyone running the checked-in default local config cannot use the core feature.
- **Fix**: Either don't hardcode an integer dev userId against UUID schemas, or gate bypass behind a flag that doesn't collide with real entitlement/billing lookups.
- **Effort**: Small. **Regression risk**: Low (dev-only code path).

### P1-2. Standards shown as "Official standard text" are paraphrases
- **Evidence**: Full source + live trace in `STANDARDS_EXPERIENCE_AUDIT.md`; `standardText` is always a hand-written or `plainLanguageSummary`-derived paraphrase, never verbatim CFR/MSHA text, but the frontend's own label logic can present it as "Official standard text."
- **Impact**: Regulatory/professional credibility risk.
- **Fix**: Either wire the existing (already-built) `safescope-knowledge` ingestion store into the live citation path, or relabel honestly as "Summary" until that's done.
- **Effort**: Large (wiring) or Small (relabel as an interim mitigation). **Regression risk**: Low for relabeling; Medium for full wiring.

### P1-3. Standards citations are not clickable at all
- **Evidence**: Confirmed via accessibility tree — plain `generic` element, no href, no handler.
- **Impact**: No path to more detail even where it might exist.
- **Fix**: Add a real click target once P1-2's content question is resolved (no point linking to a paraphrase and calling it "official").
- **Effort**: Small. **Regression risk**: Low. **Prerequisite**: P1-2.

### P1-4. `PayloadTooLargeError` on report cloud-save, shown as raw text
- **Evidence**: `ERROR_EMPTY_LOADING_AUDIT.md`, `API_PAYLOAD_AUDIT.md`.
- **Impact**: Cloud persistence unusable even for a single-finding report; raw error confuses users.
- **Fix**: Address root payload bloat (see `HAZLENZ_EFFICIENCY_BACKLOG.md`) and add a user-friendly error message regardless.
- **Effort**: Medium. **Regression risk**: Low for the message fix; Medium for the payload-size root cause.

## POLISH_HIGH

### PH-1. Two parallel inspection systems, more prominent entry point leads to the weaker one
- **Evidence**: `FIRST_TIME_USER_JOURNEY.md`, `INSPECTION_SIMPLIFICATION.md`, `INFORMATION_ARCHITECTURE_AUDIT.md`.
- **Fix**: Point the dashboard's primary CTA at the canonical `/inspections` → "Full Inspection" flow; retire or clearly demote the legacy flow.
- **Effort**: Medium (routing/navigation change, not a rewrite). **Regression risk**: Medium — needs care not to orphan existing legacy-flow data.

### PH-2. Dark-mode white-on-white text on Settings Appearance/Billing cards
- **Evidence**: `DARK_MODE_AUDIT.md`, zoomed screenshot confirming near-zero contrast.
- **Fix**: Ensure the card component consumes the dark-mode surface token, not just the text-color token.
- **Effort**: Small. **Regression risk**: Low.

### PH-3. Raw UUIDs, ISO timestamps, checksums, and JSON error bodies shown to end users
- **Evidence**: `COPY_TERMINOLOGY_AUDIT.md`, multiple screens.
- **Fix**: Format dates, hide/shorten IDs behind "advanced details," and never render raw caught-exception text.
- **Effort**: Small-medium (many small touch points). **Regression risk**: Low.

## POLISH_MEDIUM

### PM-1. Homepage hydration mismatch on every load
- **Evidence**: `ERROR_EMPTY_LOADING_AUDIT.md`.
- **Fix**: Make the hero CTA's server-rendered and client-rendered states match (e.g., render a neutral CTA server-side, swap after hydration without changing className/structure).
- **Effort**: Small. **Regression risk**: Low.

### PM-2. "Welcome back." shown to brand-new users on first login
- **Evidence**: `FIRST_TIME_USER_JOURNEY.md`.
- **Fix**: Neutral copy, or detect first-login state.
- **Effort**: Small. **Regression risk**: Low.

### PM-3. Sticky "Finding Builder" mobile summary not dark-themed and oversized on small viewports
- **Evidence**: `DARK_MODE_AUDIT.md`, `RESPONSIVE_MOBILE_AUDIT.md`.
- **Fix**: Theme the component; consider a more compact collapsed default on narrow viewports.
- **Effort**: Small-medium. **Regression risk**: Low.

### PM-4. Silent no-op on "Attempt finalization now"
- **Evidence**: `ERROR_EMPTY_LOADING_AUDIT.md`.
- **Fix**: Add explicit success/failure feedback.
- **Effort**: Small. **Regression risk**: Low.

## POLISH_LOW

### PL-1. Redundant "Attempt finalization now" vs. "Confirm risk and finalize finding" buttons with unclear distinct purpose
- **Fix**: Merge into one action, or clearly differentiate the copy.
- **Effort**: Small.

### PL-2. Registration plan selection with no billing configured gives no post-hoc indication the selected paid tier didn't actually apply
- **Fix**: Surface actual current tier clearly right after registration in a Stripe-less environment (likely dev-only relevance).
- **Effort**: Small.
