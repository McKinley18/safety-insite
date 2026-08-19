# Production configuration checklist

- Production must reject `local_test` storage.
- External S3-compatible endpoint, bucket, region, TLS, and credentials require deployment-specific values and live verification.
- Database migrations and startup validation are implemented in prior phases; original development DB was not touched.
- Live object-storage credentials were unavailable, so provider-level production confirmation remains blocked.

