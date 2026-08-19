# Billing and Entitlement Results

- Billing regression: 24 passed, 0 failed.
- Entitlement boundary: free denied, expired denied, active grant allowed, cross-user isolation passed.
- Entitlement operations: ordinary escalation denied; audited platform grant and revocation passed.
- Fixed a contract defect where active pilot/test grants unlocked backend guards but `/billing/me` still returned free. Billing status now reports the effective grant tier, source, and expiry while preserving subscription metadata.
- No live financial transaction was performed.
