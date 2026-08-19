# Object Storage Results

Local provider tests passed four scenarios and confirmed traversal rejection and production rejection.

A fresh production-representative MinIO service was run loopback-only over TLS using the previously pinned official image. The S3 suite passed six scenarios:

- private upload/retrieval round trip;
- direct unauthenticated object request returned 403;
- invalid credentials rejected;
- missing bucket rejected;
- deletion verified;
- TLS endpoint used.

This proves S3 protocol compatibility, not the eventual paid provider account, production DNS, lifecycle/retention policy, or credentials.
