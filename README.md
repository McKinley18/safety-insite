# Safety InSite

Field safety intelligence. Inspectors capture observations on site; **HazLenz**, the governed
analysis engine, identifies hazards, binds them to regulatory standards, and states what it does not
know — and a person confirms every finding before it is asserted.

**Full documentation: [`project-docs/README.md`](project-docs/README.md).** That is the single
documentation root; this file is only enough to get the repository running.

## Layout

| where | what |
|---|---|
| `backend/` | NestJS API. Bootstrap is `backend/src/main.ts` |
| `backend/src/hazlenz/` | the HazLenz engine (directory name is a recorded exception — see below) |
| `backend/src/hazlenz-knowledge/` | governed regulatory knowledge: ingestion, review, retrieval |
| `frontend-next/` | Next.js App Router client |
| `project-docs/` | **all project documentation** |
| `verification/` | frozen historical evidence. Never edited to satisfy a later section |
| `research/` | historical R&D material |

## Running it

```bash
docker compose up -d                      # local PostgreSQL

cd backend && npm install
cp .env.example .env                      # then fill in the values it names
npm run migration:run
npm run dev                               # http://localhost:4000

cd frontend-next && npm install
npm run dev                               # http://localhost:3000
```

Full setup, including the environment variables that matter, is in
[`project-docs/operations/LOCAL-DEVELOPMENT.md`](project-docs/operations/LOCAL-DEVELOPMENT.md).

## The commands that matter

| command | where | what it does |
|---|---|---|
| `npm run hazlenz:verify` | backend | **the one canonical current-state check.** Read-only, zero provider calls |
| `npm run beta:readiness` | backend | whether the local engineering mechanisms for a beta exist |
| `npm run brand:audit` | backend | fails if a retired brand reaches a customer-visible surface |
| `npm run docs:check-links` | backend | fails on a broken documentation link or a competing source of truth |
| `npm run lint` / `npm run build` | backend | typecheck / compile |
| `npm run hazlenz:test` | backend | the HazLenz contract suite |
| `npm run lint` / `npm run build` | frontend-next | ESLint / Next production build |

There is deliberately no Prettier configuration: an opinionated formatter would rewrite modules
whose byte-level identity is a frozen acceptance artifact. `.editorconfig` carries the baseline.

## Before you change HazLenz

Read [`project-docs/architecture/HAZLENZ-INVARIANTS.md`](project-docs/architecture/HAZLENZ-INVARIANTS.md)
first. Twenty-nine modules are **protected**, with digests in `PROTECTED-IDENTITIES.json`, and
eighteen files are digested into the frozen §259 candidate identity. Editing one — even for
formatting, imports or a comment — changes an acceptance artifact. Run `npm run hazlenz:verify`
before and after any engine change; it must report drift 0.

> **Naming.** The engine directory is `hazlenz`. Nine protected modules resolve under it and two
> name it in a comment while also being §259-digested, so it cannot be renamed without breaking a
> frozen artifact. Recorded in
> [`project-docs/current/BRAND-COMPATIBILITY-REGISTER.md`](project-docs/current/BRAND-COMPATIBILITY-REGISTER.md).

## Releasing

[`project-docs/operations/DEPLOYMENT-RUNBOOK.md`](project-docs/operations/DEPLOYMENT-RUNBOOK.md) is
authoritative and its order is the safety property: **MIGRATE → VERIFY SCHEMA → DEPLOY**. Auto-deploy
is off on both platforms, so a deploy is always a deliberate act.
