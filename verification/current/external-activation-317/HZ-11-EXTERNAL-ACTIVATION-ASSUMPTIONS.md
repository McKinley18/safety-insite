# §317 — EXTERNAL-USER ACTIVATION ASSUMPTION AUDIT

**Question asked.** What works for the product owner today that could fail, block, mislead or
unexpectedly expose a newly invited external Beta participant?

**Subject.** A person who has never existed in the database, has never been manually granted
anything, has never been touched by the product owner, and has never used an internal or test
account. Everything below was checked against that person, not against an account that already
exists.

**Method.** Source search over `backend/src` and the frontend application code for each assumption
class §317 names, followed by execution: a genuinely fresh participant was created twice, on two
databases built by migrations alone, and driven through the product in a real browser with both
development bypasses off (`DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DISABLE_AUTH=false`,
`NEXT_PUBLIC_DEV_FORCE_PRO=false`) against a production build. A finding is reported only where it
can affect an external Beta participant; the instruction not to report every "default" string is
honoured, and the `default` strings that do NOT reach such a participant are named below with the
reason, so their absence from the findings is a decision rather than an omission.

---

## FINDINGS THAT CAN AFFECT AN EXTERNAL BETA PARTICIPANT

### HZ-11 (confirmed, unchanged, and independently re-derived)

Production Expert ceilings are **1 analysis and $1.00 per user per 24 hours**. §316 opened this from
the register; §317 re-derived it from the code rather than accepting it, by evaluating the pure
control surface on the production values:

| usage in window | decision | message |
|---|---|---|
| 0 analyses, $0 | permitted | — |
| 1 analysis, $0.19083 | refused `WORKSPACE_ANALYSIS_CEILING_REACHED` | "This workspace has reached its Expert analysis limit for now. Deterministic HazLenz analysis is unaffected. No analysis was run and nothing was charged." |
| 0 analyses, $1.00 | refused `WORKSPACE_COST_CEILING_REACHED` | the same sentence |

The code defaults are 50 and 25; production carries 1 and 1 from the §298 controlled internal
activation. **The second Expert request an external inspector makes in any 24-hour period is
refused.**

§316's supporting claim was also re-verified rather than inherited: `readWorkspaceExpertUsage`
filters on `execution."requestedByUserId"` when `organizationId` is NULL, so for an individual the
ceiling is per user and one Beta participant cannot consume another's. That holds.

**§317 adds the part that makes it worse, and it is not a configuration value.** The refusal was
arriving correctly and the interface was showing nothing at all — see EA-1 below. Raising the
ceiling would not have fixed that; it would only have changed which request landed on the silence.

### EA-1 — A REFUSED EXPERT RUN WAS INVISIBLE *(repaired at §317)*

`POST .../expert-analyses` answered `503` with a sentence written for the inspector and
`providerCallsMade: 0`, and the page did not change: same panel, same enabled "Run Expert review"
button, no message, measured at 0.5s, 1s, 2s, 4s and 7s after the click.

Root cause: `ExpertAnalysisPanel.runAnalysis` caught the refusal, called `setError` with the
server's sentence, and then called `refresh()` to reconcile the durable state. `refresh()` succeeds
in exactly this case — the READ is fine, only the execution was refused — and its success path
called `setError(null)`. The refusal was set and wiped inside one continuation.

Repaired by splitting the read channel from the run channel, which is the pattern the same file
already uses for settlement. Regression: gate case `EXP-2`, which fails on the pre-repair build.

### EA-2 — A SAVED INSPECTION COULD NOT BE FINISHED IN A LATER SESSION *(repaired at §317)*

Save a finding, refresh the browser or come back later, reopen the inspection from `Saved history`,
press **Finish inspection** — and the inspection can never be finished. No report is generated, no
corrective action is created, no calendar task appears, and the customer is told
*"The governed risk urgency policy was not returned by the server."*

Root cause: `riskPolicy` was written in exactly one place — the response to saving a review, in that
browser, in that session — and was never derived when an existing inspection was loaded. The policy
is durable: it is persisted inside the human review's `reviewedConclusion` and is served on every
read of the inspection.

This is the most serious thing §317 found. The report is the product's deliverable and a browser
refresh stranded it. No page review before §317 saw it, because every one of them walked the
workflow end to end without leaving the page.

Repaired by deriving the policy from the record when the session does not hold it. Regression: gate
case `RP-1`, which opens a NEW browser context for precisely this reason and fails on the
pre-repair build.

### EA-3 — PASSWORD RECOVERY PROMISED AN EMAIL IT CANNOT SEND *(repaired at §317)*

Read live from production at §317: `/health/ready` reports `passwordResetEmail.state
NOT_CONFIGURED`, `provider "resend"`, missing `RESEND_API_KEY` and `PASSWORD_RESET_FROM_EMAIL`.
That is EM-2, and its customer-facing consequence had never been stated.

Measured behaviour: a reset request mints a token, fails to deliver, and — correctly, per §306 —
**rolls the token back** so no live credential is stranded on an account whose owner never received
it. Nothing is written and nothing is sent. The page then said *"If that account exists, password
reset instructions will be sent."*

For an external participant who has forgotten their password that sentence is the whole problem:
there is no other recovery route in the product, and it tells them to wait instead of asking for
help. §317 states the rule directly — do not pretend password recovery is operational if email
cannot be delivered — and the page now reads the service's own published capability and says so.
The generic API response is untouched; see `LOCKOUT-AND-RECOVERY.md` for why that distinction holds.

### EA-4 — HAZLENZ CAN SILENTLY DEGRADE IN PRODUCTION AND THE CUSTOMER IS NEVER TOLD *(reported, not repaired)*

`hazlenz.service.ts` skips the full intelligence orchestrator when the runtime is production AND
Render AND either `HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER=true` or heap usage has reached
`HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB`, **which defaults to 420 MB**. It then returns
`buildDegradedHazLenzIntelligence(...)`, which sets `degraded: true`,
`fullIntelligenceAvailable: false` and a `fallbackReason` naming exactly what was skipped.

**None of those three fields is read anywhere in the frontend.** The customer receives a reduced
advisory result with no indication that it is one.

Not repaired at §317, deliberately, and the reason is a boundary rather than effort: telling a
customer what an analysis did and did not do is a statement about the engine's output, which is
CM-1's subject and which §317 routes to the dedicated claims pass. The threshold itself is a
product-owner decision. Opened as **HZ-12**.

### EA-5 — THE PAID PLAN ADVERTISES CAPABILITIES WITH NO CUSTOMER-REACHABLE SURFACE *(reported, not repaired)*

`/pricing`'s Pro column offers **"Inspection planning and assignment tools"** and **"Dashboards,
analytics, and audit trail"**. An individual Pro account is granted `inspectionAssignments`,
`analytics`, `auditTrail`, `teamMembers`, `companyAnalytics` and `sharedReports`, all `true`. The
frontend contains no caller for the assignment API, no caller for `/dashboard/*`, and the string
`auditTrail` appears in exactly one file — the pricing data itself.

This is CS-1's shape on different words. §305A removed the "team members" promise; these two lines
survived because they are not team-worded. Opened as **CS-2**. Not repaired, because the choice
between removing the claim, rewording it and building the surface is a product decision and the
wording is CM-1's.

---

## ASSUMPTION CLASSES CHECKED AND FOUND CLEAR, WITH THE REASON

| Class | Result |
|---|---|
| **Hard-coded user IDs** | None in application code. The only literal is `local-dev-bypass-user`, returned by `localDevBypassUserId()`, which throws unless `DEV_AUTH_BYPASS === 'true'` **and** `NODE_ENV !== 'production'`; `validateProductionEnvironment` refuses to boot production with that variable set. |
| **Hard-coded workspace IDs / "default" workspace** | Two literals, both in `hazlenz-governance-context.ts`: `'dev-local-workspace'` behind the same double dev guard, and `'default'` as the fail-safe when a user has no organization. §316 established and §317 re-verified that the `'default'` value reaches only the three governance/audit routes, which answer an individual 403, and that the Expert ceiling is keyed on `requestedByUserId` rather than on it. Reported as the register already has it, not as new. |
| **Email / domain allowlists** | None. No email or domain allowlist exists anywhere in the application. The only allowlist affecting registration is `EMPLOYER_PRO_PROMO_CODES`, which is a promo-code list rather than an identity list and is absent from production today. |
| **Manual entitlement grants** | `POST /admin/entitlement-grants` requires `platformRole === 'platform_admin'`. See `ENTITLEMENT-ACTIVATION-BOUNDARY.md`: this is the one place a direct database mutation is genuinely required, and it is required for the OPERATOR, never for the participant. |
| **Manual promo requirement** | None. A participant with no promo code registers and uses the product on Free. A promo code is optional and confers a bounded grant. |
| **Internal-only flags** | `DEV_AUTH_BYPASS`, `DEV_FORCE_PRO`, `DEV_EXPOSE_RESET_TOKEN`, `LEGAL_TEST_FIXTURES`, `LEGAL_HOSTILE_FIXTURE` are each refused at production boot. `ENABLE_MAINTENANCE_SEED` is `false` in production and the route additionally requires `MAINTENANCE_SEED_TOKEN`. `HAZLENZ_ALLOW_LIVE_SOURCE_FETCH` defaults off. |
| **localhost / development URLs** | `BillingService.frontendUrl()` falls back to `http://localhost:3000`, and the frontend API clients fall back to `http://localhost:4000`. **Neither is reachable in production**: `validateProductionEnvironment` requires `FRONTEND_URL` to be an absolute HTTPS URL or the service does not boot, and the frontend's `NEXT_PUBLIC_API_URL` is set at build. Every other localhost literal is in a test, a maintenance script or an ingestion script, none of which serves a customer request. |
| **Test-mode assumptions** | `STORAGE_PROVIDER` must be `s3` in production or boot fails. `TYPEORM_SYNCHRONIZE=true` is refused. No test-mode branch is reachable in a production customer request. |
| **Feature flags with internal defaults** | Two matter and both are reported above: the Expert ceilings (HZ-11) and the Render heap guard (HZ-12). `EXPERT_EXECUTION_ENABLED` defaults to enabled OUTSIDE production and must be present and exactly `true` or `false` IN production, which is the correct posture for a kill switch and is enforced at boot. |
| **Hidden environment dependencies** | `REGULATORY_RELEASE_ID` / `REGULATORY_RELEASE_VERSION` are read only by the seeding script, not by any request path. `DIAGNOSTIC_USER_EMAIL` / `DIAGNOSTIC_JWT_TOKEN` are read only by a maintenance diagnostic script. |
| **Admin bootstrap dependencies** | The participant needs none. There is no first-run setup, no admin account requirement and no bootstrap step between registration and using the product — proven by execution twice. |
| **Pre-created site requirements** | None. The participant creates their own first site, and an inspection cannot be started without one, which is the correct order. Proven by execution. |
| **Pre-created inspection requirements** | None. |
| **Manual DB changes for the participant** | **Zero.** Both fresh participants were created, entitled, and driven through the whole journey with no SQL other than the migrations themselves. |
| **Internal-only Expert activation** | Expert requires the `fullSafeScope` entitlement plus the kill switch plus headroom under both ceilings. An entitled external participant needs no manual activation. See `EXPERT-ACTIVATION-BOUNDARY.md`. |
| **Rate / spend state requiring owner intervention** | HZ-11 is exactly this: after one Expert analysis the participant waits 24 hours, or the owner raises the ceiling. Nothing else in the product requires operator intervention to clear. |
| **Customer routes depending on data only internal accounts possess** | None found, and this was tested the hard way: the entire journey — site, inspection, observation, evidence, deterministic HazLenz, the standard citation, the risk score, the corrective action, human confirmation, completion and the report — ran on a database containing **nothing but the migrations**. No standards corpus was seeded and HazLenz still produced `29 CFR 1910.212(a)(1)` with a High (16) risk score and a corrective action. |
| **Legacy fields / historical entitlements on internal accounts** | The fresh participant's row carries `planCode 'free'`, `subscriptionStatus 'none'`, no organization and no grant, and every surface behaved correctly against it. Nothing in the journey depended on a field only an older account would have. |

---

## ONE ASSUMPTION THAT IS TRUE AND IS RECORDED RATHER THAN REPAIRED

A signed-out visitor to an unknown URL is redirected to `/login` rather than shown the 404 page.
§280 built the 404 (D-034), recorded this behaviour in the same breath, and left it deliberately:
*"who a mistyped URL belongs to is a product decision."* §317 measured it again and it still holds.

It is raised here only because HZ-11's lens makes it concrete: a Beta participant following a stale
invitation link lands on a sign-in form with no explanation of why. It violates none of §317's four
direct-navigation criteria — it is not blank, not stuck, not a raw error and not privileged content
— so it is reported as an observation and the decision is left where §280 left it.
