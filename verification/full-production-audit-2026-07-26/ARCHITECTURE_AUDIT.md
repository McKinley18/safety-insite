# Architecture Audit

## Active flow

```text
Next.js frontend
  ├─ localStorage / local report store / offline queue
  ├─ Bearer JWT in localStorage
  └─ HTTP API → NestJS backend
                   ├─ JWT / entitlement / role guards
                   ├─ TypeORM → PostgreSQL
                   ├─ Stripe API + signed webhooks
                   ├─ local upload filesystem
                   ├─ Puppeteer/PDF
                   └─ HazLenz v2
                        text + structured evidence
                          → evidence fusion
                          → weighted classification
                          → preliminary risk
                          → native reasoning/applicability
                          → knowledge routing/shards
                          → DB applicable standards
                          → rule/recovery/ranking/scope gates
                          → action generation
                          → optional full orchestrator
                          → output repair/sanitization
                          → frontend review/PDF
```

## Authentication and billing

Registration creates an organization and bcrypt password. Login queries the user including password, verifies bcrypt, derives billing status from `user_subscription` or claims, and returns a signed JWT. Frontend stores the JWT locally. Backend paid routes use `EntitlementGuard`; Stripe checkout/webhook updates subscription records. Refresh tokens, revocation, reset, and server logout are absent.

## Inspection/report flow

The frontend can create inspections and reports locally, invoke HazLenz, review findings, export PDFs, and optionally save to cloud. Backend report creation persists a report, findings, generated actions, and synchronized actions sequentially. Calendar/actions consume corrective-action records and local data. The actual database lacks these core tables, so this architecture is aspirational in the current local state.

## Duplicate and legacy systems

- `/safescope` and `/safescope-v2` coexist.
- `SafeScope`, `Safescope`, HazLenz, Sentinel, and InSite naming coexist.
- Duplicate audit-session/audit entities and hazard-taxonomy modules exist.
- `backend/app/` contains Next pages despite the active `frontend-next/`.
- `backend/backend/` contains only nested generated-looking `src/standards/cfr` content and is not an active package; it appears to be an accidental/legacy nested path.
- Tracked build diagnostics, a PDF, generated tests/results, JSON stores, and saved source files exist in backend root.
- Hundreds of HazLenz subdirectories and validators exist, while the production endpoint directly constructs only a subset and lazily activates a second orchestrator.

## Deployment flow

Intended: Vercel frontend → Render backend → PostgreSQL/Stripe. Actual repository configuration does not encode a repeatable coordinated release, migration, health, rollback, or persistent-upload flow.

