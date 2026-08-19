# Storage architecture

## Selected design

`StorageService` owns stable random object keys, metadata, scope, checksums, lifecycle state, and audit events. Providers implement `put`, `get`, and `delete`.

- `s3`: private S3-compatible storage configured by `STORAGE_S3_*`.
- `local_test`: filesystem-backed disposable storage requiring `STORAGE_LOCAL_ROOT`; construction is rejected when `NODE_ENV=production`.

Objects are separated by category: `report`, `evidence`, `branding`, and `temporary`. PostgreSQL stores provider, hidden object key, scope, parent, content type, controlled download name, size, SHA-256, state, actor, expiry, and tombstone fields.

External credentials are lazy: backend startup does not require them until storage is invoked. Production never falls back to local storage.

## Environment

- `STORAGE_PROVIDER=s3|local_test`
- `STORAGE_S3_BUCKET`
- `STORAGE_S3_REGION`
- `STORAGE_S3_ENDPOINT` (optional)
- `STORAGE_S3_FORCE_PATH_STYLE`
- `STORAGE_S3_ACCESS_KEY_ID` / `STORAGE_S3_SECRET_ACCESS_KEY` when provider-native credentials are not used
- `STORAGE_LOCAL_ROOT` for disposable tests only

## Residual

S3 code compiles but no production-representative S3 credentials/provider were available, so external durability is unverified.
