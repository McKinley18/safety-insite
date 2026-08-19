# Security Audit

## Severity summary

- Critical: 1
- High: 7
- Medium: 6
- Low: 1
- Informational: 3

Counts include application and dependency findings; details and reproduction are in `FINDINGS.md`.

## Verified controls

- Bcrypt with configurable cost (default 12).
- Generic login failure message.
- JWT signature and expiry validation.
- Global validation with whitelist and forbidden unknown fields.
- Helmet headers and global/per-route throttling.
- Stripe raw-body signature verification and event replay check.
- Backend entitlement guards on core paid endpoints.
- Organization filters in report and corrective-action services.
- Upload filename generation prevents direct path traversal.

## Critical/high risks

- Same-origin SVG active-content upload.
- Arbitrary organization lookup lacks membership authorization.
- Database/auth schema drift makes security behavior non-reproducible.
- High-severity dependency advisories.
- No password reset lifecycle despite functional-looking UI.
- JWT in localStorage, no refresh/revocation/logout server state.
- CORS trusts Vercel origin substrings rather than exact origins.
- Report attachments accept unvalidated data URIs/MIME/name.

## Other observations

- No CSRF token is used. Bearer tokens reduce classic cookie CSRF, but credentialed CORS/cookie-parser configuration and future cookie adoption need an explicit model.
- No CSP is configured on the frontend response observed; backend Helmet CSP does not protect Vercel-hosted frontend pages.
- Authentication rate limiting is process-local unless a distributed storage adapter is configured.
- User deletion/export/privacy implementation was not found as a coherent backend workflow.
- Sensitive request metadata and raw errors are logged in several paths; a production redaction policy is not evident.
- Static `/uploads` persistence is ephemeral on typical Render filesystem unless external storage is used.

## Safe tests performed

- Unauthenticated `/auth/me` returned 401.
- Free local bypass request to full HazLenz returned 402 with the required entitlement.
- Invalid/destructive payload exploitation was not attempted.
- Cross-tenant IDOR was identified statically and not exercised against user data.

