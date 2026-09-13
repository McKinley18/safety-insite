# SafeScope Targeted Validation Guide

## Purpose
This guide explains how to use SafeScope's targeted validation system to perform faster, more focused validation during development, reducing the need to run the full master validation suite after every edit.

## Commands
Use the following commands to validate specific areas of the SafeScope system:

- `npm run validate:safescope:targeted:taxonomy` - Validates hazard taxonomy coverage and absorption.
- `npm run validate:safescope:targeted:knowledge` - Validates approved knowledge review API and registry.
- `npm run validate:safescope:targeted:output` - Validates knowledge retrieval and field output composer.
- `npm run validate:safescope:targeted:orchestrator` - Validates orchestrator wiring and observation understanding.
- `npm run validate:safescope:targeted:governance` - Validates all governance engines.
- `npm run validate:safescope:precision` - Runs precision benchmark batches.
- `npm run validate:safescope:core` - Runs core audits and critical validators.

## Workflow
1. **Active Editing:** Use `npm run validate:safescope:targeted:<area>` for rapid feedback.
2. **Pre-Commit:** Use `npm run validate:safescope:full` before any local commit that touches core governance or orchestration systems.
3. **Pre-Push:** Ensure full validation and frontend build pass.

## Notes on Benchmarks
Precision batches update `generatedAt` timestamps. Do not commit these changes unless intending to snapshot validation results.
