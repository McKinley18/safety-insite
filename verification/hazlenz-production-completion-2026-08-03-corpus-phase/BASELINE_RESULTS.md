# Baseline results

Passed: backend build; frontend production build/typecheck; entitlement boundary 4/4; authenticated entitlement path (negative, eight concurrent, three sequential); clarification gauntlet 10/10; authenticated 20-case evaluator 20/20; prior evidence, risk, storage, environment, and billing suites. `git diff --check` passed.

Frontend `npm run lint` remains failing with 507 errors and 115 warnings, including pre-existing `any` and set-state-in-effect findings across the application. It was not weakened or suppressed.

