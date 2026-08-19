# Offline / Free / Pro Experience Audit

## What is Free vs. Pro, as presented to the user
Registration and the `/inspections` hub both present a clear 3-tier structure: **Free** ("$0, try the core workflow — core inspection capture, basic reports, limited HazLenz AI reviews"), **Pro** ("$6.99/mo — expanded HazLenz AI review, professional reports, corrective-action tracking, and saved history"), **Expert** ("$11.99/mo — advanced HazLenz reasoning, enhanced report packages, larger evidence history, custom report branding"). This gating language is honest and specific, not vague marketing copy.

## What actually happened when tested
- Registering and selecting "Pro" at signup **did not grant Pro entitlement** in this environment — Stripe/billing is not configured locally ("Billing is not configured on this environment yet... checkout and portal actions are unavailable until the Stripe environment is set," shown honestly in Settings). A freshly registered "Pro" selector account was, in practice, on the Free tier until a test entitlement grant was manually applied via the repo's own disposable-database test-entitlement script.
- On the **Free tier**, requesting HazLenz AI review returned a clean `402`-style "A paid subscription is required for this feature" response with a working, honestly-labeled offline fallback ("Use Offline Review" → "Limited review... DO NOT TREAT THIS AS A FULL REVIEW," 0% confidence, "Risk: REVIEW"). This does **not** feel broken — it feels like an intentional, safety-conscious degraded mode.
- On the **Pro/Expert tier** (via test grant), HazLenz review worked end-to-end: real confidence scores, real risk classification, real standards suggestions, real corrective actions, real multi-hazard decomposition.

## What works offline / what requires the backend
- The Free-tier "Offline Review" path is genuinely usable without a successful HazLenz call — it produces a structured (if minimal) finding the user can still document, tag with location/evidence gaps, and save.
- Standards suggestion, risk scoring, corrective-action generation, and multi-hazard decomposition all require a live, successful backend classify call — there is no local/offline equivalent for these beyond the "Use Offline Review" stub.
- Local data storage: the app explicitly distinguishes "Local encrypted storage" (client-side, always active) from "Cloud persistence" (an explicit "Save to Cloud" action that creates a durable backend report record) — this is a real, deliberate design decision, not an accident, and the copy explaining it ("Local encrypted storage remains active. Cloud save creates a backend report record...") is clear.

## Contradiction found between promise and behavior
The registration flow lets a user **select and appear to commit to** a paid plan without any payment step actually occurring in this environment, and nothing in the registration or dashboard UI subsequently tells the user "you selected Pro but you are currently on Free" — the only way to discover the mismatch is to attempt a Pro-gated action and read the resulting `PAID_SUBSCRIPTION_REQUIRED` error. This is specific to environments without Stripe configured (i.e., possibly just this local dev setup, not necessarily production), but it is exactly the kind of promise/behavior gap the brief asked to identify, so it is recorded here regardless of root cause.

## Gating logic assessment
Gating occurs at a sensible point (the HazLenz review call itself, via a proper HTTP guard/entitlement check on the backend — `EntitlementGuard`), not scattered ad hoc across the frontend. The app does **not** feel broken when a Pro action is unavailable — the fallback path is a genuine, if minimal, feature rather than a dead button. Upgrade messaging at the point of denial is clear and appropriately brief (no full-screen paywall interruption observed).
