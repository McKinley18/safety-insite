# SafeScope Validation Workspace Map

## Script location

SafeScope validation scripts currently live in:

- backend/scripts/

Do not move these scripts yet because package.json references many direct paths.

## Benchmark data

Benchmark datasets and benchmark result outputs live in:

- safescope-data/benchmarks/

## Gauntlet data

Reusable gauntlet fixtures and outputs live in:

- safescope-data/gauntlets/

## Source intelligence data

Source candidates, ingestion previews, and source intelligence exports live in:

- safescope-data/source-intelligence/

## Naming conventions

Use versioned data names:

- safescope-[purpose]-[batch-or-scope].v1.json
- safescope-[purpose]-[batch-or-scope]-results.v1.json

Use clear script names:

- validate-safescope-[capability].ts
- run-safescope-[benchmark].ts
- create-safescope-[dataset].ts
- audit-safescope-[area].ts
- diagnose-safescope-[issue].ts

## Precision batch workflow

A precision batch should usually include:

- backend/scripts/create-safescope-precision-batch-XXX.ts
- backend/scripts/run-safescope-precision-batch-XXX.ts
- safescope-data/benchmarks/safescope-precision-batch-XXX.v1.json
- safescope-data/benchmarks/safescope-precision-batch-XXX-results.v1.json

## Pre-commit check

Before committing validation work, run:

- cd backend
- npm run build

Then run the specific validation or calibration script for the batch.
