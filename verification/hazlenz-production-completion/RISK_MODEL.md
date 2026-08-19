# Governed risk model

`inspection/risk-policy.ts` is the backend authority for categorical risk normalization, task priority, due-date guidance, closeout evidence, and material-override detection. The frontend consumes returned policy rather than maintaining independent constants.

Human reviews must include a rationale of at least ten characters when severity, likelihood, exposure, or overall category materially changes. Persisted review data includes the applied policy version and before/after proposal.

Regression: 10/10 checks passed.

