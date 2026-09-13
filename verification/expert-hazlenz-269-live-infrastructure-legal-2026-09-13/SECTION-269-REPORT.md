# §269 — LIVE INFRASTRUCTURE CONTROLS + CONTROLLED-BETA LEGAL MINIMUM

**Date** 2026-09-13 · **Branch** `beta/expert-hazlenz-validated-candidate-2026-09-12`
**§259 identity** `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` — unchanged
**Terminal** `SAFETY_INSITE_CONTROLLED_BETA_LEGAL_BLOCKER — PRODUCT_OWNER_DECISION_REQUIRED`

**P0 count: 6 → 5.** Two closed, one added.

---

## The finding that mattered most

`EXPERT_EXECUTION_ENABLED` was **absent** from the production environment.
`validateProductionEnvironment` requires it to be exactly `true` or `false` and throws on absence.
**The beta candidate could not have booted in production.**

This was established by execution, not by reading: the *compiled*
`dist/config/validate-production-environment.js` — the exact function `dist/main.js` calls at
boot — was run against the 37-variable live production environment map read from the Render API.

```
live env AS IT IS TODAY               BOOT FAILS
   -> EXPERT_EXECUTION_ENABLED must be set to exactly "true" or "false" in production.
      Received null.
live + EXPERT_EXECUTION_ENABLED=false BOOTS
live + EXPERT_EXECUTION_ENABLED=""    BOOT FAILS
live + EXPERT_EXECUTION_ENABLED=FALSE BOOT FAILS   (case-sensitive, by design)
```

Every other requirement of the production boot contract was already satisfied. This one variable was
the entire gap between the candidate and a successful release. It is now `false`, which is both the
correct pre-release state and the state §269 preferred.

This is exactly the "unresolved configuration surprise" §269 existed to eliminate, and it would have
been discovered mid-release, after the migrations had already been applied.

## What §269 changed in production

Five environment variables on `srv-d7kl74jeo5us73deaor0`, and one Vercel project setting. Nothing
else.

| change | before | after |
|---|---|---|
| `EXPERT_EXECUTION_ENABLED` | absent | `false` |
| `EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE` | absent | `25` |
| `EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE` | absent | `10` |
| `EXPERT_SPEND_WINDOW_HOURS` | absent | `24` |
| `EXPERT_ANTHROPIC_TIMEOUT_MS` | absent | `180000` |
| Vercel `gitProviderOptions.createDeployments` | `enabled` | `disabled` |

The spend ceilings are not invented. 1330 non-zero measured per-leg costs in the evidence base give
median USD 0.038 and p95 USD 0.080; at two legs per analysis a typical analysis is near USD 0.08 and
a p95 analysis near USD 0.16. 25 analyses therefore sit near USD 2–4 of expected spend, and the
USD 10 ceiling bounds the worst case including the observed outlier leg.

**No deploy was triggered by any of it.** The Render deploy list was byte-identical before and
after, and `/health/version` returned the same `gitCommit`. With `autoDeployTrigger=off`, a
configuration change does not deploy — and neither would a push.

## Deployment control — both platforms

| | before | after |
|---|---|---|
| Render `safety-insite-backend` | `autoDeploy=no`, `trigger=off` | unchanged, independently re-verified |
| Vercel `safety-insite` | `createDeployments=enabled` | `createDeployments=disabled` |

The Vercel half was a hazard no prior section had recorded: the frontend was auto-deploying on push
via `vercel[bot]`, so disabling Render alone would still have let a push activate frontend code.
The Git link is retained, so release-time deployment remains available.

`Saphyr-api` (`srv-d74vubdm5p6s73fedj9g`) is unrelated and was not touched.

## Backup — a real one, not a platform claim

Neon's control plane is unreachable from this session, so its retention window is **unverified** and
§269 refuses to claim readiness from platform advertising. Instead an independent,
operator-controlled backup path was established and proved:

```
pg_dump 18.3 (libpq) → 7.4 MB custom-format dump, sha256 db0246ac…, 6.9 s, 423 TOC entries
pg_restore → disposable local database
compare → 76/76 tables, 7049/7049 rows, ZERO per-table differences
```

The only restore error was `SET transaction_timeout = 0`, a PostgreSQL 17 parameter unknown to the
local 16.13 server. It sets a timeout and restores no data; the row comparison proves nothing was
lost. The dump and the disposable database were both deleted afterwards.

## Storage — the P0 whose premise was false

`REPORT_GENERATION_BLOCKED` said "no object storage is configured". That was measured **locally**.
Production has had Cloudflare R2 configured all along, and the application cannot boot without
`STORAGE_S3_BUCKET`. Verified live with one synthetic non-customer object:

upload PASS · authorised download PASS (sha256 match) · unsigned GET refused PASS (400) ·
unsigned LIST refused PASS (400) · no public bucket policy PASS · delete PASS · gone after delete
PASS · zero residue PASS

The bucket already holds objects under `evidence/` and `report/`. Tenant isolation is
database-enforced, not path-enforced: object keys deliberately carry no tenant, `objectKey` is
`select:false`, scope failures return 404 rather than 403, and retrieved bytes are checksum-verified.

## Monitoring — the collector existed and had never been looked at

§268 built emission and was explicit that emission is not monitoring. §269 did not add a vendor. It
found that Render already ingests, retains and indexes this service's output, and verified it by
inducing a production event and retrieving it:

```
induced   GET /section269-ingestion-probe-1789311424 → 404 at 14:57:05.043Z
retrieved render logs --path /section269-ingestion-probe-1789311424 → 1 match
labels    method=GET statusCode=404 level=warning type=request host=safescope-backend.onrender.com
```

Emission is severity-routed (`info` → stdout, `warning`/`error` → stderr), which is what lets Render
label it. The shape was verified too: 8 of 8 representative events emitted by the compiled emitter
parsed back by the new reviewer, with a planted provider key, observation text and `Authorization`
header all reduced to `[redacted]`.

`npm run ops:events` turns that from reviewable-in-principle into reviewed-in-practice. It shells
out to the authenticated Render CLI so **no credential reaches this repository**. Its first run
surfaced a real 503.

**The honest gap:** the 17-event vocabulary has never appeared in production, because the code that
emits it is not deployed. `ops:events` says so explicitly rather than printing a reassuring zero.

## Additional findings

| finding | severity | action |
|---|---|---|
| `ANTHROPIC_API_KEY` absent in production | **P0, new** | blocks the smoke, not the deploy — it is read at call time. Set it before step 11 |
| `healthCheckPath` empty on the Render service | material | Render does not probe `/health/ready`, so an unready instance is neither refused nor restarted. Reserved to the release, because changing it risks a deploy |
| `ENABLE_MAINTENANCE_SEED=true` in production | medium | gates a route running `ALTER TABLE` + `dataSource.synchronize(false)`, bypassing `TYPEORM_SYNCHRONIZE=false`. Defended by three factors, so not remotely exploitable. Left `true` because pre-beta knowledge seeding may need it; set `false` before participants have accounts |
| Free plan spin-down | material for UX | measured 39.8 s → 503, then 5.2 s. Disclosed in `PRODUCT_LIMITATIONS.md` |
| `BILLING_CANCEL_URL` malformed | low | contains a literal space in its hostname; both billing URLs point at the legacy `sentinelsafety` alias |
| `build-info.ts` stale `buildTimestamp` | P2 | carried forward, not opportunistically altered. `gitCommit` provenance is accurate |

## Lane B

Seven artifacts in `docs/legal/`, plus an index. Every one classified
**INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED**. They describe the system as
verified at §269 — the subprocessor list is drawn from the live production configuration, and the
limitations are the measured ones, not generic disclaimer text.

**Beta acknowledgement: Option A** — an out-of-product signed agreement before account creation. No
consent UI is to be built. The existing registration checkbox is client-side only
(`register/page.tsx:36,79,343`; never transmitted, never persisted), so there is no record anywhere
in the system that any user accepted anything, and it must not be treated as acceptance evidence.

## Constraints held

provider analysis calls **0** · production migrations **0** · production database writes **0** ·
application pushes **0** · application deploys **0** · Expert enabled for live use **no** ·
secret values printed or stored **0** · Saphyr-api modified **no** · protected modules modified
**0** · Expert semantics modified **no**

`hazlenz:verify` PASS — identity drift 0, protected modules 29/29, accepted evidence drift **0 new**.
`beta:readiness` PASS — 58 checks.

## Why the terminal is CASE C

Lane A is closed or converted to execution steps that belong to the release by design. Lane B cannot
be closed by engineering: all seven drafts exist and nothing further is owed, but the classification
decision and the counsel review are the product owner's. §269 states that where counsel approval is
required for a material item and has not occurred, the P0 remains open.
