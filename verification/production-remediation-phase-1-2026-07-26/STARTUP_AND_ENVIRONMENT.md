# Startup and environment

Validated sequence is documented in repository `DEVELOPMENT.md`.

- PostgreSQL: existing `safescope-db`, PostgreSQL 16.14, port 5432.
- Migrations: explicit `npm run migration:run`; `DATABASE_URL` overrides `DB_*`.
- Backend: `npm run dev`, expected port 4000; validated on isolated port 4100 with health/database 200.
- Frontend: `npm run dev`, 3000 or 3001; validated ready on 3001.
- Docker Compose backend mapping corrected from 3000 to 4000.
- Production refuses synchronize.

Residual: Compose does not run migrations automatically and the fixed container name conflicts with a separately created existing container. CI still requires environment-specific database orchestration and migration gating.
