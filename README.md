# Safety InSite

Field safety intelligence. Inspectors capture observations on site; **HazLenz**, the analysis
engine, identifies hazards, binds them to regulatory standards, and produces audit-ready reports
that a human reviews and confirms before anything is asserted.

Two names are canonical. **Safety InSite** is the product. **HazLenz** is the engine. Earlier names
(SafeScope, Sentinel Safety) survive only as internal identifiers pinned by compatibility — see
[`docs/hazlenz/current/BRAND-COMPATIBILITY-REGISTER.md`](docs/hazlenz/current/BRAND-COMPATIBILITY-REGISTER.md).

## Layout

| where | what |
|---|---|
| `backend/` | NestJS API. Bootstrap is `backend/src/main.ts` |
| `backend/src/safescope-v2/` | **the HazLenz engine** — see the naming note below |
| `backend/src/hazlenz-knowledge/` | governed regulatory knowledge: ingestion, review, retrieval |
| `backend/src/inspection/`, `standards/`, `reports/`, `billing/`, `auth/` | product domains |
| `backend/src/database/` | TypeORM data source, entities, migrations |
| `backend/scripts/` | verification instruments and operational tooling |
| `frontend-next/` | Next.js App Router client |
| `docs/hazlenz/current/` | **current** state, invariants, test tiers |
| `docs/operations/` | deployment runbook, rollback model, monitoring |
| `verification/` | **frozen** historical evidence. Never edited to satisfy a later section |
| `project-docs/`, `research/` | historical planning and R&D material |

> **Naming note.** The engine directory is still `safescope-v2`. Nine of the twenty-nine protected
> modules resolve under that path and two of them name it in a comment while also being digested
> into the frozen §259 identity, so the directory cannot be renamed without breaking a frozen
> acceptance artifact. This is a recorded, deliberate exception, not an oversight.

## Prerequisites

Node 20+, npm, and PostgreSQL 14+ (or `docker compose up` for a local database).

## Running it

```bash
# database
docker compose up -d                      # local PostgreSQL

# backend  — http://localhost:4000
cd backend && npm install
cp .env.example .env                      # then fill in the values it names
npm run migration:run
npm run dev

# frontend — http://localhost:3000
cd frontend-next && npm install
npm run dev
```

## The commands that matter

| command | where | what it does |
|---|---|---|
| `npm run hazlenz:verify` | backend | **the one canonical current-state check.** Read-only, zero provider calls |
| `npm run beta:readiness` | backend | whether the local engineering mechanisms for a beta exist |
| `npm run brand:audit` | backend | fails if a retired brand reaches a customer-visible surface |
| `npm run lint` | backend | TypeScript typecheck (`tsc --noEmit`) |
| `npm run build` | backend | compile to `dist/` |
| `npm run hazlenz:test` | backend | the HazLenz contract suite |
| `npm run hazlenz:integration:test` | backend | integration suite against a **disposable** database |
| `npm run lint` / `npm run build` | frontend-next | ESLint / Next production build |

There is deliberately no Prettier configuration: an opinionated formatter would rewrite modules
whose byte-level identity is a frozen acceptance artifact. `.editorconfig` carries the baseline
(LF, UTF-8, 2-space, final newline) that every editor honours without reformatting existing code.

## Before you change HazLenz

Read [`docs/hazlenz/current/HAZLENZ_INVARIANTS.md`](docs/hazlenz/current/HAZLENZ_INVARIANTS.md)
first. Twenty-nine modules are **protected**: their digests are recorded in
`PROTECTED-IDENTITIES.json` and eighteen files are digested into the frozen §259 candidate identity.
Editing one — even for formatting, imports or a comment — changes an acceptance artifact. Run
`npm run hazlenz:verify` before and after any engine change; it must report drift 0.

## Releasing

`docs/operations/BETA_DEPLOYMENT_RUNBOOK.md` is authoritative and its order is the safety property:
**MIGRATE → VERIFY SCHEMA → DEPLOY**. Auto-deploy is off on both platforms, so a deploy is always a
deliberate act. `docs/operations/ROLLBACK_MODEL.md` covers the reverse.
