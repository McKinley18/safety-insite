# Entitlement regression results

- `test:entitlement-boundary`: passed 4/4 (free denied, expired denied, active grant allowed, cross-user isolation).
- `test:authenticated-entitlement-path`: passed; unauthorised user received HTTP 402 with `PAID_SUBSCRIPTION_REQUIRED`, eight concurrent entitled requests succeeded, three sequential entitled requests succeeded, and bypass was false.
- Authenticated clarification gauntlet: 10/10 passed.
- Full authenticated reasoning evaluator: 20/20 scenarios reached the endpoint and passed the evaluator; no HTTP 402 request failures remained.

