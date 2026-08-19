# Security Review

Verified:

- exact-origin CORS; arbitrary `safety-insite*.vercel.app` substring origins are no longer trusted;
- production rejects development auth/entitlement bypasses, synchronize, weak/missing secrets, insecure reset URLs, local storage, missing S3 settings, wildcard CORS, and invalid proxy-hop settings;
- `X-Powered-By` disabled and request correlation identifiers returned;
- role normalization and actual role-guard installation on sensitive global mutation routes;
- password reset token hashing, rotation, enumeration-resistant responses, and fail-closed production delivery;
- upload signature/MIME/extension/size/active-content/path traversal validation;
- private object authorization and cross-user report denial;
- login throttling: five 401 responses followed by 429; trivial forwarded-IP/user-agent headers do not reset it.

Residual risks:

- the complete historical route surface has not received a new exhaustive adversarial matrix in this closure;
- four moderate NestJS 10 advisories require a separately tested NestJS 11 migration or formal mitigation;
- bearer tokens remain browser-local-storage based, increasing XSS impact;
- CSP is set on private downloads but a full application CSP deployment was not introduced.
