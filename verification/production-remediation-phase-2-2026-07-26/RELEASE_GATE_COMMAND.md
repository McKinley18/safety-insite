# Release gate command

Run `node scripts/release-gate-phase2.mjs` with disposable `DATABASE_URL`, `BASELINE_REFERENCE_DATABASE_URL`, local service URLs, and explicit E2E credentials.

It rejects database names not marked test/audit/phase2, runs stages synchronously, stops on blocking failures, treats dependency audits as reports, and writes logs below this audit directory.

Observed run: FAIL at frontend build because the new reset page initially lacked a Suspense boundary. That defect was corrected. The gate remains non-green because the full authenticated persistent workflow and isolated auth rate-limit fixture are unresolved.
