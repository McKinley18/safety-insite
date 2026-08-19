# Entitlement report

## Model

`EntitlementGrant` is backend-managed, time-bounded, user-specific, and resolved after the ordinary subscription tier. Sources are `pilot`, `test`, and `support`.

The disposable Test grant command requires:

- `NODE_ENV=test`;
- localhost database host;
- allowlisted database name beginning `phaseN` or `test`;
- explicit user UUID;
- lifetime greater than zero and no more than 24 hours.

Production invocation failed closed before opening a database connection.

## Real endpoint evidence

Against `/safescope-v2/classify`:

- free user: 402;
- expired grant: 402;
- active Test grant: success;
- different free user after the first user’s grant: 402.

The test also found and fixed missing canonical-role mapping: an `individual` user was previously treated as a HazLenz viewer even after entitlement.

Pilot assignment still lacks a complete audited platform-admin command/UI. That blocks an operational pilot even though the underlying grant record and resolver work.

