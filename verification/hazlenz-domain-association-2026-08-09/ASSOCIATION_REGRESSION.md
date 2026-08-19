# Targeted association regression

`backend/src/safescope-v2/tests/domain-association-regression.ts` runs four finding contexts (walking, electrical, fall, mobile) while deliberately supplying an unrelated electrical observation-understanding context. All four retain compatible permanent controls and reject incompatible sibling controls.

Result: `domain-association-regression: PASS`.

The existing narrative regression also passes.
