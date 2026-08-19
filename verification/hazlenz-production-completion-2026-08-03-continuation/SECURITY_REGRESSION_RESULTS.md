# Security regression results

- `DEV_AUTH_BYPASS=false` during authenticated tests.
- Free and expired entitlements denied with stable HTTP 402 behavior.
- Active disposable entitlement allowed classification through the real endpoint.
- Cross-user isolation passed.
- Eight concurrent and three sequential entitled requests passed.
- No original database or production credential was used.

