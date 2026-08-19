# Security report

## Passing regressions

- Upload signature/MIME/extension, active-content, traversal, oversize/empty validation passed.
- Registration/login/JWT/password rotation/reset invalid/reuse/success passed.
- Password reset provider fails closed in production and constructs a fixed frontend origin/path.
- Canonical cross-tenant site/inspection/task/action tests passed.
- Browser unauthenticated inspection request returned 401.
- `DEV_AUTH_BYPASS=false` was explicit in real authorization runs.

## Remaining material risks

- Backend audit: 3 high, 9 moderate, 0 critical (production audit count unchanged).
- Frontend production audit: 3 high, 1 low, 0 critical.
- Nest/Multer compatible fixes require a major Nest upgrade; stopped under the framework-upgrade condition.
- Next/PostCSS/Sharp advisory resolution is inconsistent in npm’s proposed fix and requires a separately tested framework dependency update.
- Existing private uploads and report files are not behind the approved object-storage authorization boundary.
- Legacy `DEV_AUTH_BYPASS` code still exists and must be removed or replaced with the explicit Test grant model.
- Several legacy controllers do not use the canonical Passport strategy and remain outside the completed matrix.

