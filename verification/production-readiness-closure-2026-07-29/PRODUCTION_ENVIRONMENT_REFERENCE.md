# Production Environment Reference

Required production controls:

| Variable | Purpose | Requirement |
|---|---|---|
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection | Required; production SSL policy must be set by host |
| `JWT_SECRET` | Access-token signing | Required, at least 32 non-placeholder characters |
| `FRONTEND_URL` | Canonical UI origin | Required HTTPS |
| `PASSWORD_RESET_PROVIDER` | Reset delivery | `resend` |
| `PASSWORD_RESET_FRONTEND_URL` | Reset link origin | Required HTTPS |
| `PASSWORD_RESET_FROM_EMAIL` | Sender | Required |
| `RESEND_API_KEY` | Provider credential | Required; secret |
| `STORAGE_PROVIDER` | Private object storage | `s3` |
| `STORAGE_S3_ENDPOINT` | Provider endpoint | Required HTTPS |
| `STORAGE_S3_REGION` | S3 region | Required |
| `STORAGE_S3_BUCKET` | Private bucket | Required |
| `STORAGE_S3_ACCESS_KEY_ID` | S3 credential | Required; secret |
| `STORAGE_S3_SECRET_ACCESS_KEY` | S3 credential | Required; secret |
| `CORS_ALLOWED_ORIGINS` | Exact allowed UI origins | Required, no wildcard |
| `TRUST_PROXY_HOPS` | Proxy chain length | Nonnegative integer |
| `TYPEORM_SYNCHRONIZE` | Schema mutation | Must not be `true` |

`DEV_AUTH_BYPASS`, forced tiers, reset-token exposure, and local-test storage are rejected in production.
