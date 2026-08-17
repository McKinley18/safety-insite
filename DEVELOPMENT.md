# Safety InSite local development

Requirements: Node.js 20 LTS, npm, Docker Desktop, and ports 5432, 4000, and 3000 (or 3001).

1. Start PostgreSQL: `docker compose up -d db`
2. From `backend/`, copy the documented non-secret values into `.env`. Set `DATABASE_URL=postgresql://user:password@127.0.0.1:5432/safescope`, `PORT=4000`, `TYPEORM_SYNCHRONIZE=false`, and a local `JWT_SECRET`.
3. From `backend/`, run `npm ci`, then `npm run migration:run`. Seeds are not required for authentication; regulatory/HazLenz seeds are separate, explicit operations.
4. Start the API from `backend/` with `npm run dev`.
5. Verify `curl http://127.0.0.1:4000/health`.
6. From `frontend-next/`, run `npm ci` then `npm run dev`. Use `npm run dev -- --port 3001` if 3000 is occupied.
7. Verify the browser at `http://127.0.0.1:3000` (or 3001).

`DATABASE_URL` takes precedence over individual `DB_*` variables. Never enable `TYPEORM_SYNCHRONIZE` in production. Password reset requires a configured production delivery provider; local testing may explicitly set `DEV_EXPOSE_RESET_TOKEN=true`, which must never be used in production.
