# SafeScope Workspace Map

## Active source

Active SafeScope v2 engine source lives in:

- backend/src/safescope-v2/

Legacy bridge and adapter code remains in:

- backend/src/safescope/

Approved knowledge and source ingestion live in:

- backend/src/safescope-knowledge/
- backend/src/safescope-source-intelligence/
- backend/src/safescope-v2/knowledge-intake/

Frontend SafeScope display lives in:

- frontend-next/components/inspection/SafeScope*.tsx
- frontend-next/components/safescope/
- frontend-next/lib/safescope.ts
- frontend-next/lib/safescope/
- frontend-next/lib/safescopeBrainBundle.ts
- frontend-next/lib/safescopeKnowledge.ts

## Data locations

Benchmark and scenario data should live outside source code when possible:

- safescope-data/benchmarks/
- safescope-data/gauntlets/
- safescope-data/source-intelligence/
- backend/test-data/scenario-bank/
- backend/tests/regression/

## Documentation locations

SafeScope docs should live in:

- project-docs/04-safescope-engine/
- project-docs/06-validation-and-gauntlets/
- project-docs/08-audits/

One-time prompt files should live in:

- project-docs/09-archive-reference/prompts/

## Do not search by default

Ignore these unless specifically needed:

- backend/dist/
- frontend-next/.next/
- node_modules/
- backend/node_modules/
- frontend-next/node_modules/

## Cleanup rule

Before large SafeScope edits:

1. Keep active source files in place.
2. Put benchmark data under safescope-data.
3. Put docs under project-docs.
4. Avoid placing generated reports in src unless they are intentional fixtures.
5. Run backend build and relevant validation before committing.
