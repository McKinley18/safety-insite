# Phase 27 — Subscription Permission Matrix (post-remediation)

Re-verified after the corrective-action entitlement fix (see `CORRECTIVE_ACTION_ENTITLEMENT_VERIFICATION.md` for the full before/after detail on that specific route). This matrix combines that fresh result with the prior verification phase's already-confirmed results for the other routes (re-affirmed, not re-executed byte-for-byte this session, since none of those code paths were touched this phase).

| Route / action | Anonymous | Free | Expert/Pro-entitled | Source |
|---|---|---|---|---|
| `POST /safescope-v2/classify` | 401 | 402 `PAID_SUBSCRIPTION_REQUIRED` | 201 | Prior phase (unchanged this session) |
| `/standards` routes | 401 | 402 | 200 | Prior phase (unchanged) |
| Cloud report generation/export | 401 | 402 | 200 | Prior phase (unchanged) |
| Corporate/executive analytics | 401 | 402 | 200 | Prior phase (unchanged) |
| **`POST /actions` (corrective-action creation)** | 401 | **402 `PAID_SUBSCRIPTION_REQUIRED`** (was 201 before this phase — the fixed defect) | 201, persisted | **This session, live-verified** |
| Corrective-action list/read (`GET`) | 401 | 200 (own org's actions) | 200 | Prior phase (unchanged — reading was never the gap; creation was) |
| Dashboard/report reads (`GET`) | 401 | 200 | 200 | Prior phase (unchanged) |
| `/regulatory/parts`, `/dashboard/executive-summary` | 500 for all tiers | 500 | 500 | Prior phase — pre-existing service defect unrelated to entitlement enforcement, not fixed this session (out of the four scoped P1s) |

## Frontend gating

Corrective-action creation now has matching frontend gating (`app/inspection-workspace/page.tsx`): a Free user sees an amber notice explaining the Expert-tier requirement plus an "Unlock Corrective Actions" link to `/pricing`, rather than a button that appears to work and then fails. Already-entered immediate-action/permanent-correction/verification-step text is preserved (not cleared) when the gate is shown. All other previously-audited frontend gates (classify, standards, cloud reports) were unaffected by this session's changes and remain as documented in the prior phase.

## Known discrepancy carried forward

`PricingContent.tsx` lists "Manual corrective action entry" under the Free plan, which now directly contradicts the enforced Expert-only entitlement. This is a product/pricing-copy decision (should Free get a *limited* form of corrective-action entry, or should the pricing copy be corrected to match the Expert-only enforcement?) rather than an engineering call, and is flagged here rather than resolved unilaterally — see `CORRECTIVE_ACTION_ENTITLEMENT_CONTRACT.md` for the full detail.
