# Authentication remediation

Changes:

- normalized emails on registration/login; duplicates are case-insensitive in application behavior;
- UUID user IDs and `passwordHash` entity compatibility;
- uniform 401 response for unknown account, invalid password, deleted user;
- validated login/reset DTOs and endpoint throttles;
- SHA-256 reset-token hashes, 30-minute expiry, single-use invalidation;
- production fails closed without reset delivery; explicit `DEV_EXPOSE_RESET_TOKEN=true` supports local tests without logging tokens.

Automated `test:auth-flow` passed registration, duplicate registration, login, invalid/unknown credentials, missing/malformed/valid JWT, unknown reset request, invalid token, successful reset, token reuse denial, old password denial, and new password acceptance.

Residual: no production email provider is configured and JWT revocation remains claim-based until expiry. Both block public production; delivery configuration blocks user-facing recovery in a pilot.
