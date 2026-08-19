# Baseline environment

## Runtime expectations discovered

- Backend development command: `npm run dev`
- Backend production build/start: `npm run build`, then `npm start`
- Backend migration command: `npm run migration:run`
- Frontend development/build/start: `npm run dev`, `npm run build`, `npm start`
- Package manager: npm with separate backend and frontend lockfiles
- PostgreSQL: repository Compose uses PostgreSQL 16 on port 5432
- Backend expected port: 4000
- Frontend expected port: 3000
- External production dependencies: PostgreSQL, private S3-compatible object storage, password-reset delivery provider, and Stripe where billing is enabled

`backend/.env.example`, Compose files, deployment configuration, and runtime validation remain subject to the production configuration workstream. Secret values are not copied into verification artifacts.

