# Phase 26 — Regulatory Text Provisioning

## Question being answered

Is the empty `regulatory_section` table (official eCFR/MSHA full text, as distinct from HazLenz's own citation + plain-language summary) an environment-provisioning gap in this session's disposable test setup, or a genuine product capability gap?

## Finding: environment-provisioning gap, with one caveat

The backing schema (`regulatory_agency`/`regulatory_part`/`regulatory_subpart`/`regulatory_section`/`regulatory_paragraph`) and the ingestion connectors that populate it (`backend/src/safescope-knowledge/ingestion/run-osha-ecfr-ingestion.ts`, `run-msha-30-cfr-ingestion.ts`, and `backend/src/standards/ingestion/ingest-ecfr-standards.ts`) exist in the codebase and are wired to real npm scripts (`ingest:safescope:osha-1910`, `ingest:safescope:msha-30-cfr`, etc.). These are genuine, callable provisioning steps — this is not vaporware. What's missing is documentation telling an operator (or a fresh disposable-environment setup script) that these ingestion commands are a *required* post-migration step, separate from the static `seed:safescope-standards` script that this session's disposable environments did run.

**Caveat carried over from the prior verification phase, not independently re-tested this session**: outbound HTTPS to `www.ecfr.gov` stalls after the TLS handshake completes in this sandbox (general internet works, e.g. `google.com` responds normally) — live ingestion could not be executed here either time. A sibling artifact referenced by the standards-verification background agent this session (`STANDARDS_TEXT_FOUNDATION.md`, from earlier work not part of this phase) reportedly shows this same ingestion path succeeding end-to-end with real OSHA/MSHA XML in a different, unrestricted environment — meaning the sandbox's network restriction, not a code defect, is the specific reason this session's disposable DB has an empty `regulatory_section` table.

## Recommendation

Add a line to whatever setup documentation exists for new environments (README, DEVELOPMENT.md, or a `postmigrate` note) stating that `npm run ingest:safescope:osha-1910`, `ingest:safescope:osha-1926`, and `ingest:safescope:msha-30-cfr` (at minimum) must be run once after migrations to populate official regulatory text, distinct from `seed:safescope-standards` (which only seeds HazLenz's own citation/summary layer). This session did not make that documentation change — it's a small, safe addition but was judged out of scope for the four P1 defects this phase was chartered to fix, and is flagged here as a clear, low-risk follow-up rather than silently left undiscovered.

## Standing verdict (unchanged from prior phase)

"Surfaces authoritative regulation text where available" remains accurate as literally worded (the frontend fails soft and honestly labels HazLenz's own summary as distinct from official text, verified in code by the standards-verification background agent this session) but should not be marketed as populated-by-default without the ingestion step being run, since a fresh environment — including this one — starts with that layer empty.
