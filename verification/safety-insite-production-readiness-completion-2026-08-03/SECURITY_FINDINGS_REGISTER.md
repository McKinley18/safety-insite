# Security findings register

- Critical/open: live provider, backup/restore, monitoring, and qualified regulatory release are unavailable.
- High/open: full authorization matrix, audit-history completeness, CSRF/session review, dependency audit, and production lint.
- Medium/open: operational retention/export/deletion policy and backend lint policy.
- Fixed/evidenced: exact-origin CORS loopback correction for disposable non-production use; entitlement boundary; HTTP 429 handling; PNG MIME rejection; protected report owner isolation; production validator rejects bypass/local storage/weak secrets.

`npm audit --omit=dev --json` could not complete in this environment because npm returned registry/audit metadata failure; this is not evidence of a clean dependency set.
