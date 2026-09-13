# System architecture

Safety InSite is a two-tier application: a Next.js client and a NestJS API over PostgreSQL, with
object storage for evidence and generated reports, and a governed analysis engine (HazLenz) inside
the API. There is no separate analysis service; HazLenz is a set of modules the API calls directly.

```
  Browser / installed PWA
        │  HTTPS, JWT in httpOnly cookies
        ▼
  frontend-next  (Next.js App Router)
        │  REST
        ▼
  backend  (NestJS)
   ├── auth, organizations, entitlements      who you are, what you may do
   ├── inspection / observations / findings   the product workflow
   ├── HazLenz engine  (src/safescope-v2/)    hazard analysis and standards binding
   ├── hazlenz-knowledge                      governed regulatory corpus
   ├── standards, regulatory, applicable-standards
   ├── reports, pdf, transparency             customer-facing output
   ├── billing (Stripe)                       plans and entitlement grants
   └── storage                                S3-compatible object storage
        │
        ├── PostgreSQL   relational state, analysis persistence, audit
        └── Cloudflare R2 (S3 API)  evidence attachments, generated reports
```

## Frontend

`frontend-next/` is a Next.js App Router application. It is installable as a PWA, and offline
capability is a product requirement rather than a nicety: inspectors work in places without
connectivity. Observations captured offline are queued (`lib/offlineQueue.ts`) and synced
idempotently; a cached knowledge bundle (`lib/hazlenzBrainBundle.ts`) allows a degraded local
analysis when the API is unreachable.

The client holds no authority. Every decision that matters — whether an analysis may run, whether a
finding may be asserted, what a plan entitles — is made server-side and re-checked there.

## Backend

`backend/` is NestJS. Bootstrap is `src/main.ts`, and its first statement is
`validateProductionEnvironment()`, which throws before the application is constructed. A
misconfigured production instance therefore fails to start rather than starting wrong; see
[SECURITY-AND-AUTHORITY.md](SECURITY-AND-AUTHORITY.md).

Domain modules are organised by product concept (`inspection`, `reports`, `billing`, `auth`,
`standards`), with the engine in its own tree.

> **Naming.** The engine directory is `src/safescope-v2/` despite the engine being HazLenz. Nine of
> the twenty-nine protected modules resolve under that path, and two of them name it in a comment
> while also being digested into the frozen §259 identity — so renaming the directory would break a
> frozen acceptance artifact. This is a recorded exception, not an oversight.

## Persistence and storage

PostgreSQL via TypeORM. `TYPEORM_SYNCHRONIZE` is `false` in production and boot refuses to start if
it is `true`; schema changes are migrations only. Object storage is S3-compatible (Cloudflare R2)
and holds evidence attachments and generated reports; objects are private, served through
authorised, time-limited access rather than public URLs.

## Health and deployment

`/health/live` answers whether the process is up. `/health/ready` answers whether it may serve —
it fails closed when required migrations are absent, so an instance that skipped migration never
becomes ready rather than silently serving broken reads. `/health/version` reports the running
commit from the platform-supplied variable.

Auto-deploy is **off** on both platforms, so a deploy is always a deliberate act. The release
ordering is a safety property and is specified in
[operations/DEPLOYMENT-RUNBOOK.md](../operations/DEPLOYMENT-RUNBOOK.md).
