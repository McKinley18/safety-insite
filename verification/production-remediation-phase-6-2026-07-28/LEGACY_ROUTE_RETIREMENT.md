# Legacy Route Retirement

Legacy report creation, attachment upload, PDF generation, and transparency explanation no longer occupy canonical public paths. Authenticated compatibility routes fail explicitly with `410 Gone`; unauthenticated requests fail with `401`.

Canonical report download resolves a report/version through authenticated user or organization scope and streams controlled headers. Object identifiers and raw paths do not grant access.

Browser evidence:

- `/pdf/...`: 404
- `/uploads/...`: 404
- `/legacy/pdf/...` unauthenticated: 401
- `/legacy/pdf/...` authenticated: 410
- foreign canonical report version: 404
- direct object request: 403

The compatibility namespace should be removed after legacy clients are confirmed absent.

