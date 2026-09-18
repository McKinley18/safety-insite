# §317 — THE FRESH-USER HARD GATE

## THE ENVIRONMENT

| | |
|---|---|
| Database | `insite_317_gate_20260918` on local PostgreSQL 16, **created empty and built by `migration:run` alone** — 58 migrations, 68 canonical tables, 69 including `migrations` |
| Seeded customer identity | **none** |
| Manual SQL | **none**, other than `CREATE DATABASE` |
| Manual DB grant | **none** |
| Internal allowlist | **none** |
| Pre-existing site | **none** |
| Pre-existing inspection | **none** |
| Standards / knowledge corpus | **not seeded** — deliberately, to find out what the journey depends on |
| Backend | `NODE_ENV=development`, `DEV_AUTH_BYPASS=false`, `TYPEORM_SYNCHRONIZE=false`, `STORAGE_PROVIDER=local_test`, `EXPERT_EXECUTION_ENABLED=false`, no `ANTHROPIC_API_KEY` |
| Frontend | **production build** (`next build` + `next start`), `NEXT_PUBLIC_DISABLE_AUTH=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |

The production build matters: §280 established that the dev server adds an indicator that looks
like a product control, cancels requests the instrument records as failures, and refuses to register
the service worker.

A second, independent fresh database (`insite_317_freshuser_20260918`) was built the same way for
the first, exploratory pass. Both are disposable and neither is the `safescope` development
database, which was never the resolved target of any command.

---

## THE JOURNEY, STEP BY STEP

| Step | Result | Operator intervention |
|---|---|---|
| **Signup** | Works. Server validates the agreement acceptance against its own registry before any account is written; registration without acceptance is refused with a message naming the agreement and version. Account created on Free. | none |
| **Agreement** | One required agreement — `internal-pre-beta-acknowledgement v2026-09-14.1`, `NOT_COUNSEL_REVIEWED`. An `agreement_acceptances` row is written with the server's own document digest, timestamp and counsel status. | none |
| **Login / session** | Registration redirects to sign-in with an explicit success message rather than auto-signing-in. Sign-in works immediately; there is no activation, verification or approval step. | none |
| **Zero-entitlement state** | `tier free`, `status none`, `tierSource none`, `hasProAccess false`, `quickCapture true`, `fullSafeScope false`. | none |
| **Site creation** | The participant adds their own first site from `/settings` or from the site selector on `/inspections`. No site is pre-created and none is needed. | none |
| **Inspection creation** | Site plus regulatory context, then a workflow card. Draft persisted server-side before the workspace opens. | none |
| **Observation** | Recorded and persisted. | none |
| **Evidence** | Photo attached and stored. *(One environment note: the first pass produced a 500 because this verification environment had no object store configured — `STORAGE_S3_BUCKET is required` — which production does have. Configuring the local test provider is a property of the harness, not a Beta operator action, and it is recorded here rather than counted as one.)* | none |
| **HazLenz entitlement boundary (Free)** | `402` from `/hazlenz/classify`, and the workspace says *"Observation saved. HazLenz AI analysis is a Pro feature."* followed by a statement that the observation, evidence and site details are saved and unchanged. Written as a plan boundary, not a fault. | none |
| **HazLenz (Pro, comped by promo code)** | **Produced a full analysis on a database containing nothing but the migrations**: hazard family *Machine guarding*, standard `29 CFR 1910.212(a)(1)`, risk **High (16)**, one corrective action, and an unresolved-fact panel naming *"moving or accessible energy"* with the question that settles it. It also stated its own limitation — *"The regulatory text shown for this standard has not completed source review"* — which is the empty-corpus condition surfacing honestly rather than silently. | none |
| **Human confirmation** | Answering the settling question moved the standard from *Candidate* to *applies* and updated the assessment. | none |
| **Corrective action** | Three layered actions offered on the hierarchy of controls — immediate, permanent, verification — with a responsible person and a due date derived from the risk band (High → 3 days). | none |
| **Calendar / follow-up** | Reachable and correct; created work appears against the derived due date. | none |
| **Completion** | Works. **In one continuous session it always did.** Reopened in a later session it did NOT — see EA-2; repaired at §317 and now covered by gate case `RP-1`. | none, after the repair |
| **Report** | Generated on completion and appears in `/reports`. | none |
| **History** | `/inspections` shows saved inspections with status, site, regulatory context and timestamp; completed ones open their finished record. | none |
| **Logout / re-login** | Works. Device-local customer content is swept on sign-out. | none |
| **Account recovery surface** | Reachable and, after §317, truthful about what it can do. See `LOCKOUT-AND-RECOVERY.md`. | none |
| **Account deletion** | `DELETE /auth/me` exists and is exercised by the §305A suite on a migration-built database. | none |

## OPERATOR INTERVENTIONS REQUIRED FOR THE INTENDED BETA JOURNEY

**For a FREE participant: none.** Registration to a finished inspection record with photo evidence,
saved history and calendar tasks, with nobody touching anything.

**For a COMPED participant: one, and it is configuration rather than data.** Set
`EMPLOYER_PRO_PROMO_CODES` in the server environment and give the participant the code. No database
write, no per-account action, no allowlist entry.

**For a PAID participant: none**, beyond the Stripe configuration production already holds.

The only place a direct database mutation is genuinely required is creating the first platform
administrator, and that is an operator capability — early revocation of a grant — rather than
anything on the participant's path. See `ENTITLEMENT-ACTIVATION-BOUNDARY.md`.

## WHAT THE JOURNEY PROVED ABOUT INTERNAL-ONLY DATA

Nothing on the customer path depends on data that only an existing internal account possesses. The
strongest evidence is negative and was obtained on purpose: the standards corpus was never seeded,
and deterministic HazLenz still returned a citation, a risk score and a corrective action. Had the
product depended on the owner's seeded knowledge base, it would have failed here, visibly.
