# Deployment Audit

## Frontend

No committed `vercel.json` was found. The app builds, but environment switching depends on public variables. Root ignored Vercel metadata/env inspection files are local-only and not reproducible. Current Next 16.2.6 has high advisories with a same-major patched release available.

## Backend

Docker uses Node 20 Alpine, performs `npm install` rather than `npm ci`, compiles with 1 GB old-space, then runs with 512 MB old-space. Measured process RSS substantially exceeds 512 MB. Puppeteer/Chromium compatibility and required system libraries are not established in Alpine runtime.

The Docker Compose backend mapping is wrong (`3000:3000` versus application 4000), omits most environment variables, has no health check, and does not run migrations. Uploaded files are stored on ephemeral local disk.

No committed Render blueprint was found. `start:render` runs diagnostics then `dist/main.js`, but deployment rollback, migration ordering, release promotion, and failed-deploy recovery are undocumented.

## CI/CD

The sole GitHub workflow points to nonexistent `frontend/`, Node 24, and a deployed legacy Sentinel URL. It does not build/test backend, audit dependencies, validate migrations, or test the current local stack.

## Verdict

Deployment is not repeatable from the repository and cannot be safely rolled back as a coordinated frontend/backend/database release.

