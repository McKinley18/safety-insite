# S3 Production-Representative Verification

Provider: official MinIO image, digest `sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e`, isolated on loopback with a temporary TLS certificate containing localhost and 127.0.0.1 SANs.

The bucket was private and no static/public route was enabled. Disposable credentials and object keys are intentionally omitted.

Two independent runs passed:

- HTTPS endpoint and region configuration
- private upload/get/delete round trip
- SHA-256 checksum agreement
- direct unauthenticated object request: HTTP 403
- invalid credentials rejected
- missing bucket rejected
- object deletion verified

Application report generation against this provider also persisted two distinct objects and immutable checksums. The S3 client now supplies `ChecksumSHA256` and configurable retry attempts.

This is production-representative protocol proof, not verification of the eventual paid hosted provider account, DNS, retention policy, or production credentials.

