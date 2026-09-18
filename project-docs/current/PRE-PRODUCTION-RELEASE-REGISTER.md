# Safety InSite v1.0 — PRE-PRODUCTION RELEASE REGISTER

**This is the release authority.** It is the single document that answers *what, exactly, prevents
the current candidate from being released* — and it answers that question three separate times,
because there are three separate thresholds and they do not have the same blockers.

Established at **§288**, live evidence **§289**, **deployed §290**, Threshold-B engineering **§291**, configuration closure **§292**, owner-input gate **§293**, monitoring-channel repair **§294**, owner-configuration handoff **§295**, webhook architecture **§296**, live receiver proof **§297A**, MO-1 live closure **§297B**, Expert HazLenz production activation **§298**, backup and disaster-recovery readiness **§311**.

**§317A — THE §317 RUNTIME IS IN PRODUCTION, AND THE PROOF IS THE SERVED BYTES.** Frontend
`dpl_EoZwh4xHZwxm38oYGLfpDJJNZf7D`, target production, git sha `5c84f1d0`, aliased to
`safety-insite.vercel.app`. The production HTML names the deployment in its own asset query strings
and the bundle inlines that sha, so the running frontend is the authorised candidate rather than
merely the one the deploy job reported.

**Runtime equivalence was established before anything was deployed.** A tree digest over every
tracked path except documentation and evidence is identical at `f55aed39` and `5c84f1d0`, so the
release identity is the register-bearing commit and the runtime is the code-bearing one.

**The scope was proven rather than assumed, and the check mattered.** The live production frontend
was **18 commits behind**, at `7e297dce` (§308). The frontend-runtime subtree digest is **identical
at `7e297dce` and `450b8fcb`** — §309 through §316 changed no frontend runtime file at all — so the
deployment carries exactly the §317 changes and no unauthorised runtime content.

**Two deployment methods were rejected, for reasons worth recording.** A CLI upload would have sent
the *working tree*, which carries the unexplained Next.js tooling delta, and would have stamped the
build `unknown` for lack of `.git`. Promoting the git-built preview as-is would have been worse:
`NEXT_PUBLIC_API_URL` exists for the **production target only** and is inlined at build time, so the
preview build had no API origin and **the production frontend would have pointed at
`localhost:4000`**. The redeploy rebuilt the same git source under the production environment, and
the served bundle inlines `https://safescope-backend.onrender.com` with no localhost anywhere.

**The unexplained file is preserved and provably absent from the candidate.**
`frontend-next/AGENTS.md` carries blob `8bd0e390…` in every commit from `450b8fcb` through
`5c84f1d0`, and `643577df…` in the working tree only.

**Every pre-§317 string is gone from the deployed bundle** — *"until the Stripe environment is set"*
0, *"Checkout is not available on this environment yet"* 0, *"persisted inspection"* 0 — and every
§317 marker is present. The Expert two-channel repair is proven **structurally in the deployed
minified code**: the reconciling read clears only the read channel and can no longer wipe a refused
run.

**Live:** the recovery surface makes no claim that an email was sent and exposes no token; a Free
account is refused at **402 on both the deterministic and the Expert route**, so no provider call was
reachable; a grant-derived Pro account renders *"Included — nothing is billed to this account"* and
its grant end date instead of a price it does not pay; **60 direct-entry and refresh probes** gave 0
blank pages, 0 stuck loads, 0 raw errors, 0 privileged-content flashes and 0 5xx. The `/settings`
hydration mismatch was **not reproduced in 16 production loads** and is **not closed**.

**No Expert analysis was executed and no provider was called.** Driving the deployed panel to a 503
would need a Pro entitlement §317A cannot create without a forbidden change, so that drive is
recorded as NOT EXERCISED rather than claimed as a pass. **0 real customer rows or evidence
modified, 0 real charges, $0.00, 0 migrations, 0 environment or credential changes, 0 Render calls.**
`HZ-12` and `CS-2` are returned as decision input, not decided.

**Evidence:** [`verification/current/external-activation-317a/`](../../verification/current/external-activation-317a/).

**§317 — EXTERNAL-USER ACTIVATION. `CPF-2` AND `CPF-3` ARE CLOSED, AND THE FRESH-USER PATH IS PROVEN
FROM ZERO.** A participant who has never existed in the database was created **twice, on databases
built by migrations alone**, and driven through the product in a real browser with every development
bypass off against a production build. **Free reached a stored inspection record with photo evidence
and a saved history with no operator involvement at all. Comped — one server environment variable,
no database write — reached a finished report.** No manual SQL, no manual grant, no allowlist entry,
no pre-created site, no pre-created inspection.

**Two defects were found that no page review could have found, because every page review walked the
workflow without leaving the page.**

**The report was stranded by a browser refresh.** Save a finding, refresh or come back later, reopen
the inspection from `Saved history`, press **Finish inspection** — and the inspection could never be
finished. No report, no corrective action, no calendar task, and the customer was told *"The governed
risk urgency policy was not returned by the server"*, which was untrue: the server returns it on
every read of the inspection. `riskPolicy` was held only in the memory of the session that saved the
review. It is now read back off the durable record. **This stranded the product's own deliverable on
a browser refresh.**

**A refused Expert run was invisible.** The server answered `503` with a sentence written for the
inspector and `providerCallsMade: 0`, and the page showed **nothing at all** — same panel, same
enabled button, measured at 0.5s, 1s, 2s, 4s and 7s. The panel set the message and then cleared it
with the reconciling read that followed. At production's ceiling of **1 analysis per user per 24
hours**, every Beta participant meets that path on their second observation of the day, so raising
the ceiling would have moved the silence rather than removed it. Both repairs are covered by
regression cases that **fail on the pre-repair build**, recorded in a watched-to-fail run.

**Password recovery stopped pretending.** Production reports `passwordResetEmail NOT_CONFIGURED`;
a reset request mints a token, fails delivery and correctly rolls the token back, so nothing is
written and nothing is sent — and the page said *"instructions will be sent."* It now reads the
service's own published capability and says plainly that no reset email can be sent. The API's
byte-identical generic response is untouched and re-asserted on every run, because what is disclosed
is a property of the **service**, identical for every caller and already public at `/health/ready`.
`EM-2` is **not** closed: nothing has still ever reached a real mailbox.

**`CPF-3`'s six registered adjustments were re-measured before being changed, and none had fixed
itself.** `/login`'s email field still rendered as `text`; `/inspections` still had two left margins
in one card (105px against 256px at 1280) and still clipped both workflow descriptions at every
width; `/settings` still showed a raw `none` and still named Stripe to the customer.

**`CPF-2`'s review found the worst defect on a surface the entry does not name.** `/register` — batch
7, absent from `CPF-2`'s text and present in its batch table — had **no programmatic label on any of
its six form fields**, on the one surface standing between an invited participant and an account.
Repaired, and reported **outside** the `CPF-2` closure claim rather than absorbed into it.

**Three new blockers are opened by measurement, and two of them are claims rather than code.**
`HZ-12`: HazLenz silently degrades to a reduced advisory path when a **420 MB** heap guard trips in
production, and the three fields in which the server says so are read nowhere in the frontend.
`CS-2`: the Pro plan advertises *"Inspection planning and assignment tools"* and *"Dashboards,
analytics, and audit trail"* with **no customer-reachable surface for either** — `CS-1`'s shape on
words `§305A`'s team-vocabulary sweep did not cover. `AC-2`: `/unlock` fails AA at 3.59:1, and it is
a brand-token decision. `EN-4` is opened and does **not** block: comped access can be granted by
configuration and expires on its own, but it cannot be **withdrawn early** without the platform
administrator that only a direct database write can create.

**One register defect was found in the register itself.** `canonicalSchemaManifest.digest` has been
wrong since **§310**: it carried the manifest's §305 value, §310 changed the manifest, and §316's
entry-by-entry re-derivation did not reach this top-level block. The schema was never wrong — the
gate compares the manifest to a fresh migration replay, and it passes with 68 tables and 0 material
differences — but the register stated an identity no artifact has held for seven sections.

**Threshold C: 15 → 14.** `AC-1` removed by product-owner decision (15 → 14), `CPF-2` and `CPF-3`
closed (14 → 12), `HZ-12` and `CS-2` opened (12 → 14). **Not one of the fourteen is a pure
engineering build item.** They are counsel, brand, claims, privacy, retention, product decision and
owner configuration. §316 said engineering was not the constraint; §317 finished the engineering it
named.

**Evidence:** [`verification/current/external-activation-317/`](../../verification/current/external-activation-317/).

**§316 — EXTERNAL BETA READINESS RE-BASELINED.** No code, configuration, deployment or production
state changed. The register was re-derived **entry by entry** rather than read from its own counts, and
the counts matched exactly. What was wrong was the *content* of two entries and the *absence* of one.

**Two entries were stale against the code and are now CLOSED.** `PR-2` claimed no self-serve deletion
exists — `DELETE /auth/me` was built at §313 and exercised in production at §313A and §314A, erasing
the account's evidence from R2. `TI-2` claimed the outcome recurrence check counts across every tenant
— §287 repaired it by making a workspace scope a **required** argument with no unscoped variant.
Neither was a Threshold-C blocker, so the Beta count is unaffected.

**One new blocker is opened by measurement: `HZ-11`.** Production Expert ceilings are **1 analysis and
$1.00 per user per 24 hours** — an internal-activation setting an inspector would exhaust on the first
observation. §316 checked the worse possibility first, whether `SE-20`'s collapse of every individual
into the literal workspace `'default'` made that ceiling **shared**: it does not. The ceiling is keyed
on `requestedByUserId`. Nothing in the register had tracked Expert's production ceilings at all.

**The Threshold-C set is re-derived rather than inherited.** Of 15 flags, **14 still genuinely block**.
`AC-1` is **recommended down** to SHOULD for an invitation-only Beta — the reviewed core journey passes
every objective check and only the unreviewed surfaces are unknown — and remains a **MUST before public
availability**; its flag is left in place because clearing it is the owner's call. `TM-1` is **reframed**:
the *name* does not block a recoverable controlled Beta, but **brand lock does**, because `EM-2`'s
sending domain and 17 brand occurrences in the legal text both depend on it.

**Engineering is not the constraint.** Of the twelve MUST-COMPLETE items, **three are engineering** and
all three are bounded; the rest is counsel, owner configuration and product decision. The v1
preservation package is still bound to the §292-era baseline and would not reconstruct the current
product; a full reconstruction document does not exist and **v1 is NOT frozen**.

**The critical path:** [`EXTERNAL-BETA-CRITICAL-PATH.md`](EXTERNAL-BETA-CRITICAL-PATH.md).

**§315 — `BR-9` IS CLOSED. The nightly job now hashes the bytes.** Authoritative live-byte SHA-256
verification is part of the **scheduled** path, and `AGGREGATE HEALTHY` is now impossible while any
active evidence object is mismatched, missing, unknown, resurrected, unreadable, or incompletely
scanned. It was built by **composition, not a second implementation** — no hashing code was written;
the proven §314 gate runs as a child process of `check-backup-health.js`, exactly as the other two
halves already did.

**The ordering is justified rather than assumed.** Integrity runs **before** reconciliation, because
reconciliation *captures* live bytes into recovery storage — verifying afterwards would faithfully copy
corruption into the recovery store as a new generation. On failure the capture is skipped, but the run
does **not** exit there: exiting would skip the step that dispatches `MO-1`, and a monitor that goes
quiet exactly when it finds something is the failure mode §312A already had to fix once.

**69 hard gates, 8 `MO-1` assertions, 8 of 8 mutations detected**, sources restored byte-identically.
The gates are real rather than nominal: equal-length corruption, a **never-captured** object with zero
recovery generations, a missing active object, an authorized erasure that must *not* read as damage, an
unreachable source, a genuine one-object read failure, and a **real** truncated enumeration induced by a
newline inside an object key. Proven through the **actual installed runner**, both directly and through
**launchd** (`runs = 1`, `last exit code = 0`), at the **unchanged 05:00 daily cadence**.

**§315 also found and repaired a live defect.** The installed launchd runner had been executing the
**pre-§313 reconciler since §312A** — a copy whose SQL does not even select `account_evidence_erased`,
the action `BR-7` account deletion writes. Measured against the same synthetic account-erased object,
the stale copy wrote **zero** erasure tombstones and still reported `PROTECTED`, silently leaving the
recovery copy of erased evidence in place with nothing to refuse a restore; the current copy writes the
tombstone and **refuses** the restore. Production was never affected — §313A and §314A both propagated
their erasures from the checkout — but every *future* scheduled erasure was. The runner now prints its
source binding on every run, so the next drift shows up in the log of the run that suffers from it.

**Production is unchanged and clean:** 5 `MATCHED`, 2 `ERASURE_AUTHORIZED`, 0 `MISMATCHED`, 0 `MISSING`,
0 `UNKNOWN`, `INTEGRITY_HOLDS`. 0 customer objects, rows, recovery objects or configuration touched.
**No application deployment**, and none required — only four operator-tooling files under
`backend/scripts/ops/` changed, and `backend/tsconfig.json` compiles only `src/**/*`, so the built
artifact is byte-identical. **Cost is not the constraint**: 180 Class B operations a month, well under a
cent, and R2 charges no egress. The honest limit is **runtime** — the scan is deliberately sequential
and streaming, so it grows linearly at ~349 ms/object: ~6 min at 1,000 objects, ~29 min at 5,000, ~70
min at 12,000. Recorded as the number to watch, not inflated into a blocker. **Threshold C is unchanged
at 14.**

**§314A — `BR-8` IS CLOSED IN PRODUCTION.** `ed37e34b` is live, chosen only after establishing it is
**code-identical** to the code-bearing repair `4dab23d8`: just two register/documentation paths differ,
the `backend/src` tree is object-for-object identical (`d8808c8c…` — and that is the *actual* compiled
input, since `tsconfig.json` is `include: ["src/**/*"]`), the frontend tree is identical, and both
commits produce the authorized `applicationSourceDigest` `5c939e74…`. **No frontend deployment was
needed at all** — that tree was already byte-identical to the deployed `32653cac`. Deploy
`dep-dam8no2jnfac73e7oamg` went live with **no migration, no synchronize, no environment change, no
credential change, no Expert configuration change**. Identity was read back from the running service
over **five stable reads**: `gitCommit ed37e34b`, and the digest recomputed *at that commit* is the
authorized value.

**The repaired behaviour was then proven through the real production route, 19/19**, on one disposable
synthetic `.invalid` account. An exact replay returned the same object, the same digest and the same
served bytes while leaving `file_upload_completed` at **1** — so there was no second material `PUT` and
no duplicate audit. A divergent replay carrying a payload of **identical byte length** was refused
**409 `PAYLOAD_MISMATCH`**, with evidence A still authoritative and provably not B. A replay against a
different inspection was refused **409 `OPERATION_MISMATCH`** without handing back the other
inspection's object. The synthetic account was then deleted through the `BR-7` route, **7/7** —
evidence erased from R2, row tombstoned, `downloadName` scrubbed, erasure audited, session dead at 401
— and the reconciler wrote the erasure tombstone, so recovery classifies it
`MISSING_LIVE_ERASURE_AUTHORIZED` with `RECOVERY_ONLY_SUSPECT` **0**.

**The deep read-only integrity gate over production is clean:** 7 rows — **5 `MATCHED`, 2
`ERASURE_AUTHORIZED`, 0 `MISMATCHED`, 0 `MISSING`, 0 `RESURRECTED`, 0 `UNKNOWN`**. The **five real
customer objects are byte-for-byte unchanged** against a baseline taken before any synthetic work, **0
modified**. Recovery stayed `PROTECTED` and the aggregate `HEALTHY`; **0 unexpected 5xx**; `MO-1` fired
no alert. Live observability was confirmed from production logs — one `storage.idempotent_replay`
(`RETURNED_COMMITTED`) and four `storage.idempotency_conflict` — carrying **no digest, key, filename,
token or address**.

**`BR-9` remains OPEN and was deliberately not repaired.** Scheduled recovery monitoring still does not
independently hash live production bytes; the new gate was **not** wired into the scheduler, which is
the next bounded section. *One note recorded rather than hidden:* `BUILD_TIMESTAMP` was **not** updated,
because §314A forbids environment change — so `/health/version` still reports the §313 build time, while
`buildTimestampSourceStatus` stays `BUILD_TIMESTAMP` (not `BUILD_FALLBACK`) and identity rests on the
platform-supplied `gitCommit`, which cannot go stale. **Threshold C is unchanged at 14.**

**§314 — `BR-8` IS CLOSED IN ENGINEERING, AND IS NOT DEPLOYED.** The defect was **reproduced first**,
against unmodified code, over real HTTP, on a real S3-semantics object store: the object store was
stopped so the first `PUT` genuinely failed, and replaying the same `clientRequestId` with different
bytes returned HTTP 201 leaving the database recording `sha256(A)` while the bucket held `B`. *The local
test provider writes with `flag: 'wx'`, so a second `PUT` fails under it and the defect is invisible —
which is why the rig uses MinIO.* **The repair is one rule:** a replay may drive a `PUT` only if the
replayed bytes are the bytes the row's digest already describes. Because `sha256` is written once and
never revised, that single rule closes same-id/different-payload, concurrent last-writer-wins, digest
staleness and legitimate resume **together** — with **no migration and no schema change**. The
register's alternative remediation, *recompute and persist the digest*, was deliberately **not** taken:
it makes the metadata agree with an overwrite that should never have happened, and the mutation
program proves the suite catches exactly that.

**Three further defects in the same path were found and repaired.** A replayed identifier could
**resurrect a file the customer had deleted** — writing the bytes back to the erased key and flipping
the tombstone to `ready`, a `BR-7` guarantee reachable through the ordinary upload route. A replayed
identifier could **rebind to a different inspection**, so the photo actually sent was never stored and
the caller was handed evidence belonging elsewhere. And the compensating delete ran on **resume**
failures, so a failed replay could destroy bytes a previous attempt had committed. A non-matching
replay is now a deterministic **409** carrying `EVIDENCE_RETIRED`, `OPERATION_MISMATCH` or
`PAYLOAD_MISMATCH`, and can disclose nothing: the row is always the caller's own.

**61 gates pass**, plus **26** `BR-7` regression gates, **24** recovery-integration gates, **5 of 5**
mutations detected with the source restored byte-identically, §307 at **334/334**, canonical schema and
entity contract **PASS**, and the integration regression at **18 suites, 0 failed**. **Production was
scanned read-only** with a full re-hash of every object — **5 `MATCHED`, 1 `ERASURE_AUTHORIZED`, 0
`MISMATCHED`, 0 `MISSING`, 0 `RESURRECTED`, 0 `UNKNOWN`** — so **no legacy divergence exists**, nothing
in production was modified, and no product-owner remediation decision is required.

**One new blocker is opened by measurement: `BR-9`.** The positive control found that the **§312A
scheduled recovery monitor cannot see equal-length live-byte divergence** — it compares the listed
object *size*, then compares recovery-generation digests against the *row* digest, and never re-hashes
the live bytes. `verify-object-consistency.js --deep` and the new
`scripts/ops/verify-evidence-digest-integrity.js` both detect it; the scheduled one does not. **This
also corrects a claim `BR-8`'s own entry made.** Not repaired here: that is §312 / `BR-5` surface,
`BR-5` is closed, and rewriting a closed blocker's monitor inside a `BR-8` section would be scope
expansion. **Threshold C is unchanged at 14** — `BR-8` never blocked it and `BR-9` does not either.
**`PRODUCTION_DEPLOYMENT_AUTHORIZATION_REQUIRED`.**

**§313A — `BR-7` IS CLOSED.** `32653cac` is live (five stable reads, code only, no migration, 43 env
vars unchanged, Expert untouched), and the erasure was proven **in production**: a synthetic `.invalid`
account created through normal governed signup, given one synthetic PNG, then deleted through the real
`DELETE /auth/me` at HTTP 200 — evidence erased from R2, row tombstoned and scrubbed, erasure tombstone
written to recovery storage, **resurrection refused**. The five real objects are byte-identical and
org-scoped state is unchanged at 1 object / 7 sites / 6 inspections. No destructive production failure
was injected; the failure modes rest on the §313 disposable proof. **`BR-8` is the recommended next
target.**

**§313 — `BR-7` IS REPAIRED AND PROVEN, and does not close because it is not deployed.** Account
deletion now erases the evidence that belonged to the account: intent recorded inside the transaction,
bytes deleted after the commit, ownership asserted relationally (`ownerUserId` AND `organizationId IS
NULL` — never a key, prefix or digest), organisation-scoped evidence untouched. **32/32 against the
real application** including a genuine partial failure with the object store stopped mid-flight, plus a
**4/4 database-rollback no-resurrection gate** and two mutation controls that were each watched to
break the suite. **No migration was required and none was created.** Production still runs `b8a6fd9c`,
so the defect remains live there: **PRODUCTION_DEPLOYMENT_AUTHORIZATION_REQUIRED**. `BR-6` and `BR-8`
untouched. Also registered: `test-cross-user-isolation.ts` is a **stale** BR-4-family instrument that
§313 did not break.

**§312A — `BR-5` IS CLOSED. Database and customer-evidence recovery are both operational.** The
read-only source credential exists, scoped to `insite-production` alone and proven across 19
assertions with every denial a genuine 403. Activation ran **through launchd**, not interactively:
`last exit code = 0`, database **HEALTHY**, evidence **PROTECTED** (`LIVE_MATCHED = 5`), **AGGREGATE
HEALTHY**. A new aggregate makes `NOT_ACTIVATED` **DEGRADED** rather than a pass — the exact false
green the scheduled run had been showing since §311A. One real defect found by testing: the
scan-incomplete branch exited without alerting, so the most important failure class was silent; fixed
and proven at HTTP 200. Production unchanged at five objects / 166 708 bytes. **`ST-4` also CLOSES.**
`BR-6`, `BR-7`, `BR-8`, `SE-21`, `OPS-2`, `SC-4`, `SC-5`, `EM-2`, `LG-3` preserved.

**§312 — the EVIDENCE half is built and proven; `BR-5` is PARTIAL on activation, not on design.**
Recovery objects are **content-addressed**, which is what makes an accidental *overwrite* recoverable
rather than merely a delete. The erasure ledger lives in **recovery storage, not the database**, and
the hard gate was run rather than argued: the database was rolled back until it believed the object
was live and had never been erased, and resurrection was **still refused**. 22/22 synthetic assertions,
twice. The five production objects are protected and byte-verified; the source is untouched. What
remains is one **read-only** source credential — cost is not the obstacle at 0.16 GiB of a 10 GiB free
allowance, $0.00. New: **`BR-7`** (account deletion never touches evidence objects) and **`BR-8`**
(a `clientRequestId` replay can overwrite a live key, desynchronising the recorded digest).

**§311A — the durable backup is LIVE, and `BR-5` still does not close.** The destination
(`insite-backups`), the scoped credential (`insite-backups-operator`, Object Read & Write, one bucket)
and the daily 05:00 launchd schedule all exist and are proven. Isolation holds **both ways** — 16
assertions on the backup credential, 4 on the application credential, every denial a genuine 403. The
first durable backup was taken **by the scheduler**, its **remote copy** downloaded, checksum-matched
and restored into a fresh PostgreSQL 17.11 at **78/78 tables content-identical**, with the application
booting on it in 1.1 s and serving 14/14 routes, **zero 5xx**, **$0.00**. Doing it for real surfaced
three defects, all fixed: retention could have **emptied the destination** after a long outage; macOS
**TCC** made launchd unable to read a checkout under `~/Desktop` (exit 126); and an unquoted `&` in the
sourced env file silently blanked the database URL. **`ST-4` is closed as an investigation with an
adverse finding: R2 has no object versioning at all, and customer evidence is NOT recoverable after
accidental delete or overwrite.** So **`BR-5` is PARTIAL / BLOCKING** — the database half is
operational, the object half is not, and the evidence-recovery mechanism is deliberately unbuilt
pending separate authorization.

**§311 — `BR-5` is ENGINEERING COMPLETE and the remaining gap is one credential wide.** The backup
mechanism, its restore verification, its DB↔object reconciliation and its independent failure
detection are all built, all committed and all **watched to fail** before being believed. A fresh
production backup was taken (7 898 796 bytes, sha256 `368fa047…`), restored into a *freshly created*
PostgreSQL 17.11, and proven **78/78 tables content-identical**, after which the application booted
against it in **1.1 s** and served sites, inspections, reports, corrective actions and billing state
with **zero 5xx**. What is missing is not code: an isolated R2 bucket and a token scoped to it are a
**product-owner credential action at no recurring cost**. Neon was re-read and has not moved — Free
plan, **6-hour** window, no snapshots, no schedule. §311 opened three entries: **`ST-4`** (R2
versioning/lifecycle/object-lock has never been read, so evidence-object recovery is UNKNOWN — this
is the second reason `BR-5` cannot close), **`BR-6`** (account anonymisation cannot clear the
undeclared legacy `user.password`; **latent — 8 live accounts hold one, 0 deleted accounts do**), and
**`SE-21`** (the repository is public; nothing is exposed, but it constrains where a backup credential
may live). **0 provider calls, 0 Expert executions, $0, 0 production changes of any kind.**
**EXPERT HAZLENZ IS ACTIVE IN PRODUCTION as of §298**, bounded to 1 analysis and USD 1.00 per
workspace per 24 hours, after exactly one controlled live analysis executed through the complete
production path with every governance and containment control holding. Whether it stays enabled is
an open product-owner decision. §298 also opened **five** new entries, two of them P1 — see `HZ-4`
through `HZ-8`.

**§299 closed `HZ-4` and `HZ-5`, the two P1 external-Beta blockers §298 opened.** The product owner
escalated `HZ-4` to **P0 for external Beta** before the repair, and that escalation is recorded
rather than erased: external-Beta safety must not depend on Expert always rescuing a deterministic
semantic error. `HZ-4` was repaired as a **semantic family** — what a negative person quantifier
negates is decided by the predicate it scopes over, not by the negation word — and `HZ-5` by giving
the frontend the **complete current server posture vocabulary** plus a bidirectional coverage check
that is itself proven to fail. Running the gate battery surfaced **two pre-existing verification-
infrastructure failures**, `IT-1` and `IT-2`, both closed; neither involved a production change.
**`HZ-6`, `HZ-7`, `SE-5`, `BR-5` and `EM-2` remain open and external Beta remains blocked.**

**§300 closed `HZ-9`, `HZ-6`, `HZ-7` and `HZ-10`; §301 closed `BI-4`; §302 closed `EN-3`.**

**§304 corrected `SE-6`, repaired its schema half, and found that the feature underneath it was
never built.** §304's first act was to confirm §303's claim independently, and it is **false**:
production answers `GET /auth/verify-invite/:token` with **404**, because its
`invitation."organizationId"` is already `uuid` with a foreign key. Production's table was created by
TypeORM **`synchronize`** before migrations were baselined — its constraint names are
TypeORM-generated, not the migration's. The real defect is that **the migration history does not
describe production**: `1779000000000` declares the column `character varying`, so *every database
built from migrations* 500s on the relation join — which is every disposable verification database
in this repository, and any environment ever rebuilt by replaying history.

Migration `1800000024000` converges from either starting point — a **no-op against production**, the
repair everywhere else — with `ON DELETE RESTRICT` (an invitation is a membership-granting credential,
so it must not vanish with its issuer), an index, and a unique token. The backup was **content-verified**
(78/78 tables identical after restoring into PostgreSQL 17.11) and the upgrade path proven on that
restore before production was touched: **no column changed, and the only table with changed content
was `migrations`**.

**`SE-6` is `PARTIALLY_CLOSED`, deliberately.** The lifecycle cannot be exercised because the
team-invitation feature is **not built**, and §304 registered five independent reasons rather than
building it: **`SE-7`** no route creates an organization; **`SE-8`** a company-plan owner is refused
402 `teamMembers`; **`SE-9`** no `OrganizationRole` satisfies the invite routes' `@Roles` list;
**`SE-10`** `inviteToken` is rejected by the DTO whitelist — *this, not `SE-6`, is why invitation
fails in production*; **`SE-11`** invitations never expire. **`SE-12`** records the wider drift: 36
column-type divergences and 21 production-only tables. **`IT-3`** closed — §268 `R-6` pinned a literal
migration timestamp, the third of its kind after `IT-1` and `IT-2`.

**§303 closed `SE-5` — and closed it across the whole affected route family, not on the one route
that was reported.** The first act of the section was to measure: 24 GET routes carrying an
identifier path parameter, 7 malformed shapes each, 168 probes. **Eight routes across four
controllers returned 500**, exactly as §297A's remediation note predicted. The repair is an **input
boundary** — one shared `ParseUUIDPipe` in `backend/src/common/uuid-route-param.ts`, attached to the
25 parameters genuinely compared against a `uuid` column, refusing malformed syntax **before any
query is issued**. No `QueryFailedError` is caught and no driver error is reclassified, and the gate
proves it by renaming a table out from under a live query and requiring the 500 to survive. The gate
was **watched to fail**: 13 failing assertions before the repair, 0 after.

**§303 also opened `SE-6`, and deliberately did not repair it.** Asserting that the invite route was
*not* swept up by the UUID repair exposed that `GET /auth/verify-invite/:token` returns **500 for
every token**, because `invitation."organizationId"` is `character varying` while `organization."id"`
is `uuid`. Team invitation is a non-functional feature, and it was already broken before §303 touched
anything. It is a **migration**, which §303 did not authorize. **`BR-5`, `EM-2`, `SE-6`, `EN-2` and
`OPS-2` remain open and external Beta remains blocked.**

**Threshold A is closed. THRESHOLD B IS CLOSED at §297B — a real production failure reached the
product owner's phone. Controlled internal / product-owner production use is AUTHORIZED. External
beta is not.** Machine-readable
equivalent, generated from the same entry list so the two cannot disagree:
[`../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json`](../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json).

| | |
|---|---|
| Candidate — **product source commit** | the §294 repair commit on `beta/expert-hazlenz-validated-candidate-2026-09-12` — gates run on Node v24.14.1 |
| **Candidate commit** | `7fe2d2bc` (§315) — operator tooling only. HEAD's `applicationSourceDigest` reads `0735cf0a…`, and that is a **false positive for deployment**: `backend/scripts/` is inside the digest's file pattern but is not compiled (`tsconfig` is `include: ["src/**/*"]`), and the **artifact-only** digest `4312701c…` is identical across the change. |
| **Deployed commit** | `ed37e34bbd5c3e69faa5fa1bb695a9ba8f4860ee` (§314A) — code-identical to the code-bearing repair `4dab23d8`. Still live; §315 required no deployment. |
| **Release binding — DEPLOYED (§314A)** | `applicationSourceDigest` = `5c939e74c6c4c9f98ef878ec48f7ea2f05020d5e061f45862939eb68320310c3` — **LIVE since §314A**, proven by recomputing the digest at the `gitCommit` the running service reports over five stable reads. Three files changed and nothing else: `storage.service.ts`, `operational-events.ts`, and the new `scripts/ops/verify-evidence-digest-integrity.js`. **No migration**; schema `1800000026000`, 58/58, `aheadOfBuild: []`. The method was checked against a known answer before use — recomputed at `75b5a149` it reproduced `bacfdb70…` exactly. |
| Superseded binding | `e0349820…` at `32653cac` — §313A, what production ran until §314A. |
| Superseded binding | `87bb6eaa…` at `b8a6fd9c…` — §310A, what production ran until §313 |
| Superseded binding | `bacfdb70…` at `75b5a149…` — §309 (SC-2), read back over five stable reads at schema `1800000025000`, 57/57. *This row named `8fe86790` until §314A, which recomputed both: `8fe86790` is `aa85802d…`, and `bacfdb70…` belongs to `75b5a149`. Corrected against measurement, and the duplicate row above removed.* |
| Superseded binding | `0f2edbaf…` at `e48a42f3…` — §303 SE-5 |
| Superseded binding | `20b59cc2…` at `9242d157…` — §303's first deploy |
| Superseded binding | `51db8f96…` at `61828222…` — §302 EN-3 |
| Superseded binding | `6d3e86ba…` at `de00f896…` — §301 BI-4 |
| Superseded binding | `84a02553…` at `2170a6ba…` — §300 HZ-6 + HZ-7 |
| Superseded binding | `4078a552…` at `359198f0…` — the §300 HZ-10 repair |
| Superseded binding | `95c9e343…` at `317daba8…` — the §299 HZ-4/HZ-5 repair, live from §299 to §300 |
| Superseded binding | `7fc9d47e…` at `87491ed9…` — the §294 repair, what production ran from §295 until §299 |
| Superseded binding | `05b1a2d8…` at `4749aba1…` — what production ran until §295, containing the MO-2 false-green path |
| Superseded binding | `2ce8a1d7…` at `94e29634` — §290's two bounded source closures (BR-3, indexing) changed the application source, so the digest changed with it |
| **Deployed release SHA** | `b8a6fd9cfe34d362b7cd1a585a8fcfc9e246ebb1` — live since **§310A** (backend `dep-dalju0qd0e5s73flk650`, api-triggered at a pinned commit with autoDeploy off), schema **`1800000026000` (58/58)**, `aheadOfBuild: []`. **Re-read live at §311** from `/health/version` with `versionSourceStatus: RENDER_GIT_COMMIT`, and `/health/ready` reporting `status: ready`, `dependencies.schema: current`, `monitoring.alerting: CONFIGURED`. |
| Predecessor deployed SHA | `c28dd43c1c54453029848a03422489073ffc2277` — §304, schema `1800000024000` (56/56) |
| Predecessor deployed SHA | `e48a42f3e58b18db4324fbf053622353251833b7` — §303, schema `1800000023000` (55/55) |
| Predecessor deployed SHA | `9242d157043cfab328c4d23cd3a7dcaf2804c635` — §303's first deploy |
| Predecessor deployed SHA | `61828222ceef5f1ebcdce424e64ae3a4291032a8` — §302 |
| Predecessor deployed SHA | `de00f896f87037ffb550d35e8ef134ad02ef34e7` — §301 |
| Predecessor deployed SHA | `2170a6ba6496d4673b54e68c2b738d89d7e4707f` — §300 |
| Predecessor deployed SHA | `359198f0c24abf595fc6464901e4eba0d0ffb122` — the HZ-10 repair |
| Predecessor deployed SHA | `317daba88e7ef8c117a2997b6347dae830e8823a` — live from §299 to §300 |
| Predecessor deployed SHA | `87491ed96f6f09de3de5800fc0a472e20d120413` — live from §295 to §299 |

> **THE DEPLOYED PRODUCT IS THE §294 REPAIR.** §294 repaired `MO-2` in `backend/src/` and
> deliberately did not deploy; §295 deployed it **before** any Resend configuration, which was the
> whole point of the ordering. Both halves serve `87491ed9…` at `applicationSourceDigest`
> `7fc9d47e…`. The false-green path is out of production, so a credential configured from here lands
> on a build that refuses to claim a channel it cannot use.
>
> **HEAD moved past the deployed digest again, and it is a false positive.** §295's own commit adds
> one operator script, `backend/scripts/preflight-295-alert-configuration.ts`, and `backend/scripts/`
> is inside the digest's file pattern — so HEAD reads `e2dd73c0…`. The **built artifact is
> unchanged**: `backend/tsconfig.json` has `include: ["src/**/*"]` and `rootDir: ./src`, so nothing
> under `backend/scripts/` is compiled into `dist`, and a digest over the same set **minus**
> `backend/scripts/` is **`5fb47c7f…` at both** the deployed commit and HEAD. The only differing
> path in the full set is that one file.
>
> **§296 moved it again, and this time the narrower digest moved too.** §296 added a second operator
> script *and* one npm script entry to `backend/package.json` — which **is** a legitimate build
> input, so the artifact-only digest went from `5fb47c7f…` to `fa0330d9…`. The diagnostic is right to
> report a movement; what it cannot say is whether the movement matters, so the build-relevant fields
> were compared **field by field** against the deployed commit instead: `dependencies`,
> `devDependencies`, `engines`, `build:render` and `start:render` are **all identical**, and the only
> delta is one added `scripts` key that neither the build command nor the start command invokes.
>
> **`applicationSourceDigest` remains the binding and its definition is not being changed here.** The
> narrower digest is a diagnostic that explains a movement, not a replacement for it. The rule for
> the next deployment is unchanged: deploy a commit and confirm its `applicationSourceDigest`. **Do
> not redeploy to reconcile either movement** — that spends a deployment on bookkeeping for a build
> that is produced identically.
| Predecessor | `0f36d49729c914c0c50a7e9118f3663877d057ef` |
| Frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` |
| Retired digest — **must not be used** | `3c2c5974…` (misattributed; see PV-2) |

> **Why the release is bound by a digest and not by a SHA.** The release SHA is the branch tip at
> push time, and it cannot be recorded inside the commit that would record it — each such commit
> changes the value. §289 therefore binds the release to `applicationSourceDigest`, which covers only
> the files that determine the built artifacts and is unchanged across the documentation and evidence
> commits a preservation package necessarily adds. The SHA to deploy is whatever the branch points at
> after step 1 of the sequence, **provided its `applicationSourceDigest` is** `2ce8a1d7…`. That is one
> command to check, and it is a stronger statement than a SHA: it says *this is the same product*,
> not merely *this is the same commit I wrote down*.
| Provider calls in §288 and §289 | **0** |
| Production contact in §288 | **none** |
| Production contact in §290 | **DEPLOYED.** 4 approved migrations applied, backend and frontend deployed at `990a26b70dc625514bc081bfb7b2bb2ce4a19569`, bounded synthetic acceptance executed. **0 provider calls, 0 Expert calls, 0 configuration changes, 0 rollback events.** |
| Production contact in §289 | **READ-ONLY.** Render, Neon, Cloudflare R2 and Vercel authenticated and read; one synthetic non-customer object round-tripped and deleted in R2 with zero residue. **0 writes, 0 migrations, 0 deployments, 0 configuration changes.** |

> **Supersedes** `verification/current/BETA-BLOCKERS.json` as the release authority. That file is
> retained unchanged as the historical §263–§285 record and must not be read as current status.

---

## The three thresholds

These are deliberately not the same question, and an item that blocks one frequently does not block
the others.

| | Threshold | What it means | Blockers |
|---|---|---|---|
| **A** | **CONTROLLED PRODUCTION DEPLOYMENT** | The candidate running in a production environment. **No users, no real data.** | **0 — CLOSED at §290** |
| **B** | **INTERNAL / OWNER PRODUCTION USE** | Owner-controlled accounts entering **real data**. | **0 — CLOSED at §297B** |
| **C** | **EXTERNAL CONTROLLED BETA** | **Named external inspectors** entering real workplace data. | **22** |

> **THRESHOLD A IS CLOSED.** §289 reduced it from eight entries to three and observed that those
> three could only be closed *by the deployment*. §290 performed the deployment and closed them:
> `IN-1` by reading the release SHA back from both halves, `IN-2` by exercising the Vercel production
> path deliberately for the first time, and `ST-2` by round-tripping a generated report through
> production storage with a checksum match.
>
> **Nothing about Thresholds B or C changed because the deployment succeeded.** Threshold A means the
> candidate is *running*. It says nothing about whether anyone may rely on it.

The shape of the answer matters more than the counts. **Threshold A is an infrastructure problem
and nothing else** — no legal item blocks it, because nobody is using the system. **Threshold B
adds the things that matter once real data exists**: consent you can evidence, monitoring, and an
acceptance procedure. **Threshold C is where the legal and claims work lands**, and it is the only
threshold with P0 items.

---

## Severity, and what it is not

| | Meaning |
|---|---|
| **P0** | Release is unsafe or indefensible without it. **Four** items after §291 — all at Threshold C, all legal. `SU-1` and `SU-3` were P0 **engineering** items and closed on evidence; `SU-2`, `LG-1`, `LG-2` and `LG-3` remain, and no legal item was reclassified because engineering capability now exists. |
| **P1** | Must be closed before the threshold it blocks; a real gap with a known shape. |
| **P2** | Registered and scheduled. Not a blocker unless paired with something else. |
| **P3** | Recorded fact, closed item, or accepted position. Carried so it is not rediscovered. |

Severity is **not** a synonym for importance. Several P3 items are load-bearing product guarantees
(report immutability, tenant isolation, entitlement authority) that are P3 precisely because they are
*done and proven*.

## Counts

| | Total | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Entries | **127** | **9** | **15** | **66** | **37** |

| Status | Count |
|---|---|
| CLOSED | 78 |
| OPEN | 36 |
| BLOCKED (waiting on a decision or another item) | 2 |
| DEFERRED (deliberately not v1) | 9 |
| ENGINEERING_COMPLETE_OWNER_CONFIGURATION_REQUIRED | 1 |
| ENGINEERING_COMPLETE_COUNSEL_PUBLICATION_REQUIRED | 1 |

*Every number above is **derived** from the entry list in the JSON register, not maintained by hand.
The `BLOCKED` and `DEFERRED` rows had drifted (they read 4 and 2 against actual values of 3 and 9) and
the two engineering-complete statuses were missing entirely; §314 reconciled the table to the derived
values rather than restating either side, exactly as §312A did for the threshold block.*

**§315 closed `BR-9`** — the scheduled job now hashes live bytes and fails closed. **§314 closed `BR-8` and added `BR-9`** (P3, OPEN, blocks nothing — the §312A scheduled recovery
monitor cannot see equal-length live-byte divergence). **Threshold C is unchanged at 14:** `BR-8` was
never one of its blockers and `BR-9` is not one either. **§313A closed `BR-7`.** §313 added `IT-4` (P3, stale instrument). Of the fourteen Threshold-C
blockers that remain, **three are still engineering-owned** — `AC-1` and `CPF-3` (both P2, OPEN) and
`LG-3` (P0, engineering complete and waiting on counsel publication). The other eleven are counsel,
product, claims, privacy and infrastructure-configuration items. `EM-2` is engineering-complete and
waiting on one owner configuration step. **§312A closed `BR-5` and `ST-4`.** §312 had added `BR-7` (P2, blocks C) and
`BR-8` (P3).

**§311 added three entries and closed none.** `ST-4` (P2, blocks C), `BR-6` (P3) and `SE-21` (P3).
`BR-5` moved from OPEN to **ENGINEERING_COMPLETE_OWNER_INFRASTRUCTURE_DECISION_REQUIRED** and is
still counted as open, because a mechanism without a destination does not protect anything.

**§309 added SC-2 to this table and closed it, and added `SC-3`, `SC-4` and `SC-5` from what the
repair revealed.** SC-2 had only ever existed in the machine register; §309 brought it into the
narrative because closing it required correcting one half of its own description.

**§307 added five entries and closed four of them in the same section** — `SE-16`, `SE-17`, `SE-18`
and `SE-19` were found by the security review and repaired inside it; `SE-20` was found, measured,
and deliberately left open because its repair is customer-data reinterpretation rather than a
security fix. `SE-3` closed on top of that.

**A threshold's blocker count is the number of entries still flagged for it.** Closing an entry
clears its threshold flags and records what it used to block in `wasBlockingThresholds`, so an
entry is never deleted and a closed item is never counted.

**§312A made the machine-readable counts DERIVED rather than hand-maintained.** The declared block had
drifted from the actual entry statuses — it said 45 open against an actual 37 — which is exactly the
failure mode a register exists to prevent. `counts` is now computed from the entry list, so the two
cannot disagree again. The open Threshold-C blockers are `AC-1`, `BR-7`, `CM-1`, `CPF-2`, `CPF-3`,
`EM-2`, `LG-1`, `LG-2`, `LG-3`, `PR-1`, `RR-1`, `SR-1`, `ST-3`, `SU-2`, `TM-1`.

---

## Legal basis — how each statement is qualified

§288 re-researched current U.S. sources rather than reusing prior conclusions. Four categories are
kept distinct throughout, because collapsing them is how software teams end up believing a
disclaimer has done something it has not:

| Category | Meaning | Example in this register |
|---|---|---|
| **LEGAL REQUIREMENT** | Imposed by statute or regulation, on someone. | MSHA 30 CFR 56.18002 — a *competent person designated by the operator* must examine each working place each shift, record it before shift end, and the **operator** retains that record **one year** (RR-1). |
| **RISK-MANAGEMENT RECOMMENDATION** | Reduces exposure; not mandated. | Trademark clearance before external commercialization (TM-1). |
| **CONTRACTUAL CHOICE** | Allocation between the parties, enforceable only to the extent law allows. | Limitation of liability (LG-2). |
| **PRODUCT POLICY** | The product's own decision. | Closure does not claim verification (§287 D-052). |

Three findings drive the legal entries:

1. **FTC enforcement on AI claims is active and is the nearest precedent.** *Operation AI Comply*
   has continued into 2026. The closest analogue to this product is **FTC v. Evolv Technologies**
   (action Nov 2024, order approved Dec 2024): an AI **detection** product whose maker was barred
   from unsubstantiated detection claims after real-world failures to detect. Safety InSite makes
   hazard-analysis claims in the same family. This is why **CM-1** exists and why no surface may say
   HazLenz detects all hazards, guarantees compliance, or replaces an inspection.

2. **Statutory safety duties are not delegable to software.** Under MSHA's workplace-examination
   rule the examination must be performed by a competent person designated by the **operator**, and
   the **operator** keeps the record. OSHA imposes separate employer duties and 29 CFR 1904
   recordkeeping. Nothing the product says can move those duties, and product language must not
   imply otherwise (**RR-1**, **SR-1**).

3. **Incorporation by reference does not make private standard text redistributable by a commercial
   product.** *ASTM v. Public.Resource.Org* (D.C. Cir., Sept 2023) held that **non-commercial**
   posting of incorporated standards was fair use — the standards **remain copyrighted**, and that
   holding does not extend to commercial redistribution. The product's current posture is already
   correct (**CP-2**: names and scopes only, no standard text) and the register's job is to keep it
   that way.

**A disclaimer does not eliminate Safety InSite's liability.** Whether any limitation is
enforceable depends on jurisdiction, conspicuousness, unconscionability, and whether the loss is
personal injury — and none of that is settled by drafting. `USER ASSUMES ALL RESPONSIBILITY` is not
self-executing. LG-2 is BLOCKED on counsel for exactly this reason, and §288 did not draft around it.

---

## Minimum path to each threshold

### Threshold A — controlled production deployment  **— CLOSED at §290**

All eight entries are closed. Five closed at §289 on evidence (`DB-1`, `BR-1`, `IN-3`, `PV-1`,
`RL-1`, plus `OPS-1` opened and closed in the same section); the remaining three closed at §290 by
executing the deployment.

| | closed by | on what evidence |
|---|---|---|
| **DB-1** | §289 | Production head read, zero drift, four pending, none destructive; rehearsed forward *and* backward against a copy of production. §290 then applied them: head `1800000018000` → `1800000022000`, 54/54, and **no destructive operation**, proven table by table — no table dropped, no row count decreased anywhere. |
| **BR-1** | §289 | Backup and content-checksum restore. §290 took a **fresh** one immediately before migrating: 7 810 853 bytes, 76 tables, 7 051 rows, restored into PostgreSQL 17.11 in 1 s with all 76 tables content-identical. |
| **IN-3** | §289 | Render configuration re-read live and dated. |
| **IN-4** | §289 | Preview SSO / noindex / DENY-framed, and the environment-scope listing per target. |
| **PV-1** | §289 | The preservation package and its manifest. |
| **RL-1** | §289 | The candidate-exact deployment sequence, which §290 then executed. |
| **OPS-1** | §289 | The two operations documents that named the wrong database platform. |
| **IN-1** | **§290** | Both halves read back at `990a26b7…`: `/health/version` reports it with `versionSourceStatus: RENDER_GIT_COMMIT`, `release:verify-sha` reports `RUNNING SHA OK`, and the Vercel production deployment's `meta.githubCommitSha` matches. **Not closed because the services report healthy** — closed because the deployed identity was read back and matched. |
| **IN-2** | **§290** | The production deployment path exercised deliberately, its source and target read back from the API *and* from the served HTML, which names the deployment in its own asset query strings. |
| **ST-2** | **§290** | A generated report round-tripped through production storage with a checksum match: the bytes in R2, the database record and the bytes the product served all hash to `59ce3cd1…`, while an unsigned read of that object was refused HTTP 400. |

### Threshold B — internal / owner production use  (11 items)

**THRESHOLD B IS CLOSED.** The last item, `MO-1`, closed at §297B on actual monitored receipt — not
on a provider 2xx, and not on a manufactured condition.

| | how it closed |
|---|---|
| **MO-1** | **CLOSED §297B.** Five genuine production 500s inside the window produced **exactly one** `service.error_rate_exceeded`, dispatched to the configured webhook, accepted `HTTP 200` **272 ms** after the event, retrieved independently at the destination, and **seen in the product owner's subscribed client**. Requests 1–4 produced **no alert at all**, which is the noise policy stating itself. |
| **BR-2** | **CLOSED §295** on authoritative Neon console evidence: Free plan, 6-hour history window, Instant Restore across it, no snapshot schedule. Sufficient for Threshold B; `BR-5` carries the Threshold-C consequence. |
| **MO-2** | **CLOSED §294**, before any credential existed — the only order in which it could be closed honestly. |

`PV-3` and `DB-5` closed at §292. `DB-7` remains **DEFERRED**. `EM-2` remains **OPEN by decision**, not
by oversight: a webhook cannot deliver a password-reset link, and permanent email infrastructure waits
for the product rename.

> **What Threshold B now authorizes, and what it does not.** The product owner may enter **real data**
> into production under their own control. This is **not** external beta, **not** customer onboarding,
> **not** commercial launch, **not** public indexing, and **not** Expert HazLenz execution — Expert has
> never been enabled in production and its first call is a separately authorized bounded acceptance.

Closed at §291: `DB-4`, `DB-6`, `SU-1`, `SU-3`, `PA-1`, `OF-4`. The former Threshold-B list was `MO-1`, `PA-1`, `SU-1`, `SU-3`, `DB-4`, and two opened at §289: **`BR-2`** (Neon's platform
retention window and PITR setting are unread — one console read) and **`PV-3`** (no Node version is
pinned and the Render runtime version cannot be read, so a rebuild reproduces the source but not
provably the artifact).

Real data now exists, so three things change. **SU-1 and SU-3** — acceptance must be transmitted,
persisted and evidenceable; this is engineering work that does **not** depend on counsel, because
recording *that* someone accepted *version X at time T* is independent of what the document says.
**MO-1** — someone must find out when it breaks. **PA-1** — a post-deploy acceptance defining what
must be true before a human uses it.

### Threshold C — external controlled beta  (**14 open blockers** after §317, including all six P0)

All of B, plus the legal, claims, privacy, review and clearance work:

`LG-1`, `LG-2`, `LG-3`, `SU-2` (P0) · `CM-1`, `DB-4`, `PR-1`, `RR-1`, `SR-1`, `TM-1` (P1) ·
`AC-1`, `BR-7`, `CPF-2`, `CPF-3`, `SE-5`, `ST-3`, `TI-3` (P2) · `BR-5` and `ST-4` **closed at §312A** · `MO-2` **closed at §294** ·
`SE-3` **closed at §307**

**`ST-4` is new at §311 and, like `DB-4`, it is not legal work.** R2 versioning, lifecycle and
object-lock have never been read, so whether a deleted inspection photo can be recovered is unknown.
It is one Cloudflare console read, and it is the second of the two reasons `BR-5` cannot close — the
first being that the proven backup mechanism has no durable destination yet.

**`DB-4` is new at §289 and it is not legal work.** The cross-tenant recurrence path that `TI-2`
describes is **reachable in production**, because the `outcomes` table exists there although no
migration creates it. It fires the first time anyone closes a corrective action. At Threshold A
nobody closes anything; at Threshold C it escalates one customer's action on another customer's
history.

The critical path is **counsel**, and it is not shortened by engineering. LG-1 → LG-2 → LG-3 → SU-2
is a chain: the documents must be approved and the placeholders filled before they can be published,
and they must be published before signup can link to and take acceptance of them. Everything else on
this list can proceed in parallel.

**The finite path is real, and §289 shortened it.** The largest single unknown — the production
migration head — was one read away, §288 was forbidden from taking it, and §289 took it: head
`1800000018000`, zero drift, four pending, none destructive. No entry on any threshold is
open-ended research.

---

## Register entries

Ordered by domain. Every entry carries its evidence path and its retest requirement; closed entries
are retained so a later section does not rediscover them as new.

### CORE PRODUCT FUNCTION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **CPF-1** | Core v1 workflow (inspection spine, HazLenz presentation, completion, reports, actions, calendar) reviewed and closed. | P3 | — | Engineering | CLOSED |
| **CPF-2** | Batch 6/7 surfaces never page-reviewed: /profile, /upgrade, /unlock, /pricing, /about, /hazlenz, /legal, /forgot-password, /reset-password, 404 / error / loading states. | P2 | — | Mixed | **CLOSED §317** |
| **CPF-3** | /settings, /inspections and /login carry ADJUSTMENTS_REQUIRED from earlier batches; the adjustments were never closed. | P2 | — | Engineering | **CLOSED §317** |

**CPF-2 — remediation / decision.** Bounded Batch 6/7 review. Public claim-bearing pages first (/about, /hazlenz, /pricing, /legal) because they interact with CM-1.

*Evidence:* `project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md lines 109-119`  
*Retest:* A page-review batch at 390/768/1280/1440 in both themes, with the §286 instrument discipline.

**CPF-3 — remediation / decision.** Fold into the Batch 6 closure and record each adjustment as closed or deferred.

*Evidence:* `project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md lines 99-103`  
*Retest:* Re-review of the three surfaces.

### HAZLENZ

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **HZ-1** | Deterministic HazLenz is the customer-authoritative analysis path and is validated; severity parity across finding, report snapshot and both PDF presentations is proven. | P3 | — | Engineering | CLOSED |
| **HZ-2** | Expert HazLenz execution is disabled in production and live provider transport has never been exercised. | P2 | — | Product | **CLOSED §298** |
| **HZ-3** | Report generation could not be reached by hazlenz:verify because object storage is unset in that environment. | P3 | — | Engineering | OPEN |
| **HZ-4** | The deterministic evidence extractor asserts `employeeExposure=false` from a bare "nobody"/"no one" anywhere in the observation, contradicting the exposure predicate and suppressing the applicable standard. | **P0** | — | Engineering | **CLOSED §299** |
| **HZ-5** | The Expert frontend's posture label table does not share the server's frozen posture vocabulary, so the two restrictive postures render as "The operational posture could not be read". | **P1** | — | Engineering | **CLOSED §299** |
| **IT-1** | Five Expert integration harnesses never adopted the §291 registration-time agreement acceptance, so `hazlenz:integration:test` aborted in §262 before reaching any assertion. | P2 | — | Engineering | **CLOSED §299** |
| **IT-2** | §268 assertion E-2 pinned a literal schema version, so it failed against a readiness endpoint that was answering correctly. | P2 | — | Engineering | **CLOSED §299** |
| **HZ-6** | The Expert execution record cannot state which model produced a safety analysis, or how long it took. | P2 | — | Engineering | **CLOSED §300** |
| **HZ-7** | A finding finalized from an Expert-cited review carries no risk snapshot, so it reaches the customer report with no severity and no applicable standard. | P2 | — | Product | **CLOSED §300** |
| **HZ-8** | At a workspace analysis ceiling of N, an idempotent replay of a completed Expert request is refused by the ceiling instead of resolving to the execution that already ran. | P3 | — | Engineering | **OPEN §298** |
| **HZ-9** | HZ-4's repaired interpretation has not been exercised *behaviourally* against the deployed instance; production evidence for it is artifact identity of the running build. | P3 | — | Product | **CLOSED §300** |
| **HZ-10** | A **second, independent copy** of the bare-negation defect, in the display evidence boundary: "nobody"/"no one" anywhere in an observation zeroes the risk band and strips every standard. | **P0** | — | Engineering | **CLOSED §300** |
| **BI-4** | The employer-pro promo code is inert: registration reports Pro and the next login resolves the account to Free with `fullSafeScope` false. | P2 | — | Engineering | **CLOSED §301** |
| **EN-2** | Revoking a grant does not affect an already-issued token. **Closed for grant-derived authority at §302**; what remains is the same staleness for organization-seat claims. | P3 | — | Engineering | **OPEN — narrowed §302** |
| **EN-3** | A promo-granted plan is permanent and has no product-controlled revocation; emptying the allowlist stops new promotions but does not downgrade accounts already promoted. | P2 | — | Product | **CLOSED §302** |
| **OPS-2** | A Render deploy reports "live" before the old instance stops serving, so a configuration read-back taken immediately after can measure the OLD configuration. | P3 | — | Engineering | **OPEN §301** |

**HZ-2 — CLOSED at §298.** `EXPERT_EXECUTION_ENABLED` was set to `true` through the approved
Render configuration mechanism and made effective by a **deployment** of the already-deployed SHA
`87491ed9…`, not by a restart. The flag was then proved live **from the running application without
spending anything**: an execution request carrying an invented `requestVersion` returned 409 from
inside the claim transaction rather than 503 `EXPERT_EXECUTION_DISABLED`. Exactly **one** controlled
Expert analysis then executed through the complete production path — 2 provider legs, 60,045 input
and 7,074 output tokens, **USD 0.190830** against a USD 1.00 ceiling, `transportSubstituted: false`,
admission `ADMIT`, and a result persisted `server_authored` and byte-identical to the route response
and to a fresh-session read. No immediate-disable criterion occurred.

Closure means **the architecture executes correctly in production on one observation**. It is not an
accuracy claim, not external-beta readiness, and not authorization for a broad Expert campaign.
Expert remains **enabled** with the §298 ceilings still in force — **1 analysis and USD 1.00 per
workspace per 24 hours** — and whether it stays enabled is a product-owner decision §298
deliberately does not take.

*Evidence:* `verification/current/expert-activation-298/`  
*Retest:* Re-reading `/health/ready`, the execution record and the operational event stream.

**HZ-4 — the defect Expert HazLenz found.** `backend/src/hazlenz/evidence/shared-evidence-facts.ts`
line 473 builds `noExposure` as an alternation whose last two members are the **bare** words
`nobody` and `no one`, anchored to nothing about exposure; line 478 then writes
`employeeExposure = false` at confidence **0.98**, status `confirmed`. The §298 walkthrough note
contains *"Nobody working up there had a harness on"* and *"Nobody was injured"* — two sentences that
describe a fall hazard, one of which presupposes people working at height. Either matches on its
own; removing both removes the match; the intended sense (*"no employees were exposed"*) still
matches through the anchored alternative.

Measured consequence: **29 CFR 1910.28 came back `CONTRADICTED` at confidence 0.05**, *"Suppressed
because submitted evidence contradicts: employee access or exposure"*, with the other two required
predicates `SUPPORTED`; `assessmentDisposition` read `controlled_condition`; and the generated
customer report printed *"HazLenz basis: Candidate only; missing: employee access or exposure"*
directly beneath the paragraph that describes the exposure. `e.noExposure` gates *worker in fall
zone*, *occupational employee exposure* (×2) and *miner exposure during the work shift* (×2), so it
reaches OSHA general industry, OSHA construction and MSHA rules.

**What is not claimed:** the hazard was not missed. The deterministic decomposition still raised
`fall-protection` at `Critical`, `imminentDanger: true`, `requiresShutdown: true`. The engine
produced **internally inconsistent output on one observation** — the hazard escalated and its
regulatory basis suppressed — and it is the regulatory half that is degraded. This is **not an
Expert defect**: Expert identified it, quoted the contradicting sentence back, and recorded a
HIGH-confidence `MAY_BE_INCOMPLETE` disagreement, which is the advisory layer doing what it exists
to do.

*Evidence:* `verification/current/expert-activation-298/` — the persisted deterministic snapshot
(`fact-2 employeeExposure false, confidence 0.98`), the `applicabilityDecisions` block, the frozen
report source snapshot and `REPORT-TEXT-298.txt`. The mechanism was reproduced by executing the
shipped expression against the observation and three controls.  
*Retest:* The §298 observation re-analysed yields no `CONTRADICTED` exposure verdict and does not
suppress 29 CFR 1910.28; a genuine *"no employees were exposed"* observation still suppresses it.

**HZ-5 — the product cannot name its own most consequential conclusion.** The frozen §233 contract
emits one of four values — `CONTINUE`, `CONTINUE_WITH_CONTROLS`, `HOLD_PENDING_VERIFICATION`,
`STOP`. `frontend-next/lib/expert/expertPresentation.ts` holds a five-member `POSTURE_LABEL` table —
`STOP_WORK`, `DO_NOT_START`, `CONTINUE_WITH_CONTROLS`, `CONTINUE`, `NO_IMMEDIATE_RESTRICTION` —
which looks like the retired §210J/§226 vocabulary §233 superseded. **Only two members appear in
both.** The §298 analysis returned posture `STOP` and the deployed panel rendered *"The operational
posture could not be read"* above the correct `whatHappensNow` prose. **The two postures the product
cannot name are exactly the two that restrict work**; both permissive postures render correctly.

It **fails closed** — it declines to name a posture it cannot read rather than rendering a permissive
one — which is why this is not a §298 immediate-disable criterion. §298 is the first time any
deployed instance has served the §265 Expert frontend, which is why it was not found earlier.

*Evidence:* the deployed frontend at `safety-insite.vercel.app/inspection-workspace`, logged in as
the §298 synthetic inspector with no dev bypass; `expert-233-posture-contract.ts`
`IMMEDIATE_SAFETY_POSTURES_233` versus `expertPresentation.ts` `POSTURE_LABEL`.  
*Retest:* `STOP` and `HOLD_PENDING_VERIFICATION` render real labels, an unknown value still renders
the fallback, and a **coverage check fails in both directions** if either side changes.

**HZ-4 — CLOSED at §299, and the product owner escalated it to P0 for external Beta first.** The
escalation stands on the record rather than being erased by the repair: external-Beta safety must
not depend on Expert always rescuing a deterministic semantic error.

*Root cause.* A negative person quantifier — `nobody`, `no one`, `no <person-noun>` — **is not an
assertion about exposure**. What it negates is decided entirely by **the predicate it scopes over**,
and English offers at least four predicate families that a generic negation word cannot tell apart:
presence/exposure, control or PPE use, injury or outcome, and none of those. The pre-§299 expression
treated them as interchangeable, so *"Nobody working up there had a harness on"* — a sentence that
presupposes people working at height — wrote `employeeExposure = false` at confidence 0.98.

*The repair, and what it deliberately does not do.*
`backend/src/hazlenz/evidence/person-negation-semantics.ts` classifies each quantified clause into
`PRESENCE_OR_EXPOSURE`, `CONTROL_USE`, `OUTCOME` or `UNRESOLVED`, and **only the first reaches
`employeeExposure`**. It skips the restrictive modifier before reading the predicate —
`Nobody [working up there] [had a harness on]` — which is the precise mechanism of the defect; and
within the predicate the **earliest** family marker wins, so *"nobody was on the platform wearing a
harness"* is still a presence denial. **Nothing asserts the converse.** The §298 sentence is
vacuously true if nobody is up there, so exposure is not entailed, and the repair **removes a false
claim without inventing its opposite**. The §298 sentence appears in no matching rule: the family
was repaired, not the phrase.

*The §298 observation, before and after — both re-measured locally in a read-only worktree at
`d78150ed` rather than quoted from §298.*

| | before | after |
|---|---|---|
| `employeeExposure` fact | `false`, confidence **0.98**, `confirmed` | **not asserted** |
| 29 CFR 1910.28 | **CONTRADICTED**, confidence **0.05** | **UNKNOWN**, confidence 0.45 |
| exposure predicate | CONTRADICTED | UNKNOWN, listed in `missingPredicates` |
| explanation | *"Suppressed because submitted evidence contradicts: employee access or exposure"* | *"Candidate only; missing: employee access or exposure"* |
| `assessmentDisposition` | `controlled_condition` | `insufficient_evidence` |

The standard is now **a candidate with an open predicate instead of a suppressed one**, and **no CFR
citation is manufactured** — §299 explicitly did not require one, and the governed standards and
evidence architecture remains authoritative for what the candidate becomes next.

*No overcorrection.* The same note with *"No employees were on the mezzanine"* substituted for the
harness sentence, **every other sentence left in place**, still yields `employeeExposure = false` at
0.98 and still suppresses 1910.28 as CONTRADICTED at 0.05. The repair narrowed **which** sentences
negate exposure, not **whether any do**.

*The regression family.* 27 cases across the ten §299-named groups — 10 that must still negate, 17
that must not. **The pre-§299 expression is wrong on 16 of the 27 and right on 11**, so the family
measures a *distinction* rather than a direction; a change that simply stopped negating would fail
its other half. It was wrong in **both** directions — it also missed *"Not a single employee was
exposed"*, *"No employees on the elevated surface"* and *"None of the crew were on the roof"* — so
genuine no-exposure handling is **improved** as well as narrowed. The family caught one real gap
during development (plural control nouns: *"were wearing respirators"*), which is what it is for.

*Expert disagreement is unaffected, and that was checked rather than asserted.* All four
disagreement types and all three targets are intact; **no file under any Expert path was added or
modified**, verified against `d78150ed` over tracked changes *and* untracked additions; and the
deterministic projection Expert receives still names an open predicate for Expert to contest. The
fall-protection decision is `UNKNOWN`, **not** `SUPPORTED` — deterministic code did not acquire a
semantic conclusion here, so Expert's judgement about exposure is invited rather than pre-empted.
What is **not** claimed is that Expert *would* still disagree on this observation; that is a hosted
question and §299 authorised zero provider calls.

*Evidence:* `verification/current/expert-hz4-hz5-299/`.
*Retest:* `npm run test:299-person-negation` and `npm run test:299-section-298-replay`, both wired
into `hazlenz:test` so the family is a standing gate rather than a one-time proof.

**Deployed at §299, and what that does and does not prove.**

Production runs `317daba8…` on both halves — backend `dep-daka1lh42hec739qlfo0` (trigger `api`,
pinned to the commit; `autoDeploy` is `no` before *and* after), frontend
`dpl_Er16fs1N3XokrXwJc4FAMTuRhYjx`, whose id the served HTML names in its own bytes. **0 migrations,
schema unchanged at `1800000023000` (55/55, `aheadOfBuild []`).** One configuration key changed —
`BUILD_TIMESTAMP`, which the §270 runbook makes a release step and which was absent, so
`/health/version` had been reporting `BUILD_FALLBACK` against a stale June literal. It was set by
per-key `PUT`, the §298-proven mechanism: 42 → 43 keys, nothing removed, nothing else changed, and
the three Expert keys byte-identical. Expert stays enabled at 1 analysis / USD 1.00 per workspace
per 24h. Monitoring `CONFIGURED`, `serverErrorsInWindow` 0, no unexpected 5xx, `noindex, nofollow`
served, preview protections measured live (the preview the push created returns 302, this
deployment's own direct URL returns 302, only the production alias serves 200).

**`HZ-5` is proven in production and it cost nothing.** The posture table was extracted **verbatim
from the deployed JavaScript** served at `/inspection-workspace`, and the posture the deployed
server actually returned at §298 — `STOP`, replayed from disk — was driven through it:

```
{CONTINUE:{label:"Work may continue",restrictsWork:!1},
 CONTINUE_WITH_CONTROLS:{label:"Continue only with the controls below in place",restrictsWork:!1},
 HOLD_PENDING_VERIFICATION:{label:"Hold this work until the open question is resolved",restrictsWork:!0},
 STOP:{label:"Stop this work now",restrictsWork:!0}}
```

`STOP` → *"Stop this work now"*, `restrictsWork: true`, where before §299 the same value rendered
*"The operational posture could not be read"*. The three retired §210J names occur **zero** times in
the deployed bundle, and the fail-closed fallback and the *"work is restricted"* qualifier are both
in the deployed bytes.

**`HZ-4`'s production evidence is weaker, and that is stated rather than smoothed over.** Production
runs the commit that contains the repair — `/health/version` reports `gitCommit 317daba8` with
`versionSourceStatus RENDER_GIT_COMMIT`, the Render deploy record agrees, and `build:render` is bare
`tsc` over `backend/src`, so the deployed `dist` is compiled from exactly that source. **That is
artifact identity, not a live behavioural execution.** `POST /hazlenz/classify` is guarded by
`JwtGuard` + `EntitlementGuard(fullSafeScope)` + `RolesGuard`, so exercising it in production needs
a synthetic account and an entitlement — production writes §299 did not authorise. Two non-invasive
routes were attempted and both need an owner action: `render ssh` into the running container
requires an SSH key registered with the Render account, and resetting the §298 synthetic account the
way §298 did requires a production database credential that is not available locally. **So `HZ-4`
closes on an executed local proof plus artifact identity, and `HZ-9` records the missing live half
so the two are never conflated.** The local half is not thin: 117 assertions run through the shipped
`buildEvidenceFacts()` and `applyEvidenceFoundation()`.

**HZ-5 — CLOSED at §299.** The root cause is that the frontend **restates** the posture vocabulary,
because it does not build against `backend/`, and the restatement went stale when §233 superseded
the §210J/§226 names — with nothing asking, **in either direction**, whether the two lists still
agreed.

*The complete current server vocabulary is four members, and that was established mechanically
rather than assumed.* §235 and §237 both import `IMMEDIATE_SAFETY_POSTURES_233` unchanged, so they
are additive successors over the same enum: `CONTINUE`, `CONTINUE_WITH_CONTROLS`,
`HOLD_PENDING_VERIFICATION`, `STOP`.

| | previous frontend vocabulary | repaired |
|---|---|---|
| `CONTINUE` | "Work may continue" | "Work may continue" |
| `CONTINUE_WITH_CONTROLS` | "Continue only with the controls below in place" | unchanged |
| `HOLD_PENDING_VERIFICATION` | **absent** → *"The operational posture could not be read"* | "Hold this work until the open question is resolved" |
| `STOP` | **absent** → *"The operational posture could not be read"* | "Stop this work now" |
| `STOP_WORK`, `DO_NOT_START`, `NO_IMMEDIATE_RESTRICTION` | named, and the server cannot emit any of them | **removed** |

*Restrictiveness is copied, not inferred.* `restrictsWork` is the server's own
`POSTURE_PERMITS_CONTINUED_WORK`, negated, and the panel now gives a restricting posture a red
bordered treatment and a *"work is restricted"* qualifier instead of the neutral slate it previously
shared with *"Work may continue"*. Nothing reads the label or the prose to decide.

*Fail-closed is preserved and strengthened.* An unknown value still declines to name a posture —
*"The operational posture could not be read — treat this work as restricted and have it reviewed"* —
and now **also** carries `restrictsWork: true`, so a future server value this build has never heard
of lands on the restrictive treatment rather than the calm one. Asserted over a plausible future
addition, a retired name, a wrong-case value and an empty value; permissive language is never
borrowed and the permissive labels are never substituted.

*The §298 result itself.* The proof reads
`verification/current/expert-activation-298/EXPERT-RESULT-298.json` — the response the deployed
server actually returned — and pushes it through the same `readFromExecution()` the panel uses,
**not a hand-authored STOP fixture**. It renders "Stop this work now", `restrictsWork: true`, with
the server's `whatHappensNow` prose unchanged beneath it. **No provider call was made**: the §298
execution is replayed from disk.

*The coverage check fails in both directions, and it has been watched doing so.*
`check-299-posture-vocabulary-parity.mjs` reads `IMMEDIATE_SAFETY_POSTURES_233` and
`POSTURE_PERMITS_CONTINUED_WORK` **out of the server source** and fails on: a server posture the
frontend cannot name; **a frontend posture the server cannot emit** — the direction that would have
caught this the day §233 landed, because dead vocabulary looks like coverage; a `restrictsWork`
disagreement; permissive language on a restrictive posture; and any retired §210J name.
`prove-parity-check-fails.mjs` runs **seven mutations** against copies of the two files, including
the literal HZ-5 shape, and asserts a non-zero exit for each — a gate nobody has watched fail is not
evidence.

*Evidence:* `verification/current/expert-hz4-hz5-299/`.
*Retest:* `npm run check:299-posture-vocabulary` and `npm run test:299-posture-presentation`.

**IT-1 and IT-2 — two pre-existing gate failures found at §299 while running the battery, both in
verification infrastructure, neither a production defect.**

`hazlenz:integration:test` had been **aborting in §262 since §291**, and nothing noticed because the
abort happened before any assertion ran. §291 (SU-1) made acceptance of
`internal-pre-beta-acknowledgement` **required at registration** — deliberate, correct product
behaviour — and five harnesses (§262, §264, §265, §267, §268) build their `/auth/register` body by
hand and were never updated. Each received `400 Acceptance of … is required` and then `401` on the
login that followed. **It reproduces unchanged at `d78150ed`**, so it is not a §299 regression.

The repair does **not** weaken, mock or disable the §291 requirement — the harnesses now send an
acceptance and the service still validates and records it, and would still reject a wrong or missing
version. The acceptance is **derived** from `agreementsRequiredAtRegistration()`, the same registry
the service validates against, so a version bump flows through with no edit: a hardcoded copy in a
test is the same failure mode as HZ-5.

Behind it, `IT-2`: §268's `E-2` pinned the literal schema version `1800000021000` and failed against
a `/health/ready` that was answering **correctly** with `1800000023000`, two migrations later. A
pinned schema version in a test means every legitimate migration breaks a gate that is supposed to
be about readiness, and the reflex repair — bump the literal — teaches nobody anything. The
expectation is now derived from `expectedMigrationTimestamps()`, the enumerator the endpoint itself
uses, so a genuine drift still fails.

`hazlenz:integration:test` now reports **435 assertions passed, 0 failed** across §261, §262, §264,
§265, §267 and §268. **No production code changed for either.**

**`HZ-10` — CLOSED at §300, repaired, gated, deployed, and re-proven on the live production path
that measured it.**

*Inventory before repair.* All of `backend/src` was swept for the bare words and the sibling
exposure vocabulary **before anything was edited** — repairing the second copy without asking how
many exist would have repeated the §299 mistake at a different scale. **Exactly two executable
sites**, both in this module. `reasoning-l3/word-classes.ts` was examined and cleared (a closed
linguistic `PRONOUNS` list that asserts nothing about exposure). Everything else matching is prose,
comments, fixtures or evaluation corpora.

*Repair by reuse.* Both alternations now call `readPersonNegation()` — the module §299 created.
**A third copy of the rule is precisely how there came to be a second one.** Only the
person-quantifier members moved; `"no … exposure"`, `"unoccupied"` and the non-observation markers
are deliberately kept, and the control words in the second alternation (`fenced`, `barricaded`,
`locked`, `secured`, `passed`, `within`, `fully`, `complete`, `closed`) are left alone and
**recorded as a known coarseness** — they are not person quantifiers, and that branch already
requires the structured observation to state affirmatively that controls *are* present and none are
missing.

*The live production re-proof, on the same input that measured the defect:*

| | before (`317daba8`) | after (`359198f0`) |
|---|---|---|
| `assessmentDisposition` | `controlled_condition` | **`hazard_requires_human_review`** |
| `riskBand` / `riskScore` | Controlled / **0** | **Critical / 25** |
| `imminentDanger` | false | **true** |
| `requiresShutdown` | false | **true** |
| `standardDecisions` | *(none)* | **29 CFR 1910.28(b)(1)** — `probable`, `applicable_after_human_review` |
| risk reasoning | *"describes controls in place…"* | *"Fall Protection hazards can create serious or fatal exposure"* · *"Imminent-danger trigger detected"* |

**The no-presence control is byte-for-byte unchanged** — still `controlled_condition`, still
Controlled/0, still 1910.28 CONTRADICTED at 0.05. The repair narrowed *which* observations are
called controlled, not *whether any are*. **And the HZ-4 repair is untouched:** `employeeExposure`
is still not asserted and 1910.28 is still `UNKNOWN @ 0.45` with the exposure predicate missing — no
CFR citation is manufactured, the standard is carried as a *probable candidate for qualified
review*. 0 provider calls, 0 Expert analyses, $0, 0 migrations.

*The gate that stops a third copy.* `check-bare-person-negation.ts` fails the build if any module
outside `person-negation-semantics.ts` matches the bare words inside a regex literal in executable
code — 1018 files scanned, comments and fixture/eval directories excluded so it cannot flag its own
documentation. It is **proven to fail on seven cases, including the actual pre-repair file recovered
from git**: a gate that would not have caught HZ-10 is not worth having.

**§300 Phase 1 — HZ-9 IS CLOSED, and closing it found something worse.**

With Option A authorized, one synthetic account on a `.invalid` domain was registered through the
**public** `POST /auth/register`, entitled by **one** `pilot` grant bounded to 24 h that in fact
lived **4 minutes 15 seconds**, and used for exactly **two** `POST /hazlenz/classify` requests
against the deployed production service. Database writes: **exactly two**, both on that same
`entitlement_grants` row — one `INSERT`, one `UPDATE` to `revoked` — with the resolved host and
database printed and checked first. **0 provider calls, 0 Expert analyses, $0, production SHA
unchanged.**

| | **A** — the exact §298 text | **B** — the no-presence control |
|---|---|---|
| differs by | — | one sentence only |
| `employeeExposure` fact | **none asserted** | `false` @ 0.98 `confirmed` |
| 29 CFR 1910.28 | **UNKNOWN @ 0.45** | **CONTRADICTED @ 0.05** |
| exposure predicate | UNKNOWN, in `missingPredicates` | CONTRADICTED |
| explanation | *"Candidate only; missing: employee access or exposure"* | *"Suppressed because submitted evidence contradicts…"* |

Two requests differing in one sentence, treated **oppositely** on exactly the axis HZ-4 got wrong.
That is discrimination, not the removal of suppression — and it is the §298 baseline
(`employeeExposure=false` @ 0.98, 1910.28 CONTRADICTED @ 0.05) inverted on the observation that
produced it. **`HZ-9` closes and `HZ-4`'s live half is discharged.**

**`HZ-10` — and it is the reason HZ-9 was worth doing.** The same production response that proves
HZ-4 repaired *also* reports that observation — a worker three feet from an unguarded twelve-foot
opening with a ten-foot drop, no harness, no anchor points — as:

> `assessmentDisposition: controlled_condition` · `riskBand: Controlled` · `riskScore: 0` ·
> `imminentDanger: false` · `requiresShutdown: false` · zero standards

`backend/src/hazlenz/display/hazlenz-evidence-boundary.ts` contains **a second, independent copy of
the bare-negation defect**. `affirmativelyNoExposure` is an alternation whose members include the
bare words `nobody` and `no one`, anchored to nothing — the identical shape §299 repaired in the
extractor. It **alone** sets `affirmativelyControlled`, which sets the disposition, empties
`primaryCitation`, `primaryStandards`, `suggestedStandards` and `standards`, and **overwrites
`result.risk`** with a zeroed, Controlled, no-shutdown block.

Causation was isolated locally: the **same note** with only the two bare quantifiers reworded —
*"Nobody working up there"* → *"None of the stockers up there"*, *"Nobody was injured"* → *"There
were no injuries"* — and every hazard fact identical, yields `hazard_requires_human_review`,
**`Critical`, riskScore 20, `imminentDanger: true`, `requiresShutdown: true`**, primary citation
29 CFR 1910.28. **The word alone flips it.**

**Every §299 local proof still passes**, because §299 exercised `buildEvidenceFacts` and
`applyEvidenceFoundation` and this module sits downstream of both. Neither the local suite nor the
artifact-identity argument §299 relied on could have reached it. **Only running the real product
path in production did.**

It is registered `P0` on the same reasoning the product owner used to escalate HZ-4, and arguably
stronger: HZ-4 suppressed the regulatory *basis* while the hazard stayed Critical; this zeroes the
*hazard* and tells the reader the condition is controlled. **It is registered, not repaired** —
§300 scopes Phase 1 to HZ-9 and Phase 2 to HZ-6/HZ-7, and this is neither. **§300's Phase-2 gate
was therefore not taken and HZ-6/HZ-7 were not started.**

**§300 Phase 1, first attempt — superseded by the proof above, and it found `BI-4`.**
**No classification was executed and nothing was proven.**

`POST /hazlenz/classify` — and every other HazLenz endpoint — requires the Pro-only entitlement
`fullSafeScope`. There are exactly three ways to obtain it, and under §300's constraints none is
available:

| route | status under §300 |
|---|---|
| Stripe subscription | a real charge; §300 budgets $0 |
| `EntitlementGrant` row via `POST /admin/entitlement-grants` | needs `platformRole === 'platform_admin'`, and **no code path in the repository sets `user.role = 'platform_admin'`** — only a direct database write can |
| `EMPLOYER_PRO_PROMO_CODES` at registration | the one DB-free candidate. **Attempted, and proven inert — see `BI-4`** |

§298 used a bounded direct `entitlement_grant` insert, revoked at cleanup. §300 forbids exactly
that.

**What was attempted, and how it was cleaned up.** A single 45-character random one-off promo code
was set by per-key `PUT` (43 → 44 keys, nothing else touched, Expert keys byte-identical) and made
effective by deploying the *identical* artifact — the §297 rule, not a restart. One synthetic
account on a `.invalid` domain registered through the public route with the server's own required
agreement, read live from `GET /agreements`. The server answered `201, planCode "pro",
promoApplied true`, **which is itself the §297 read-back proof that the configuration reached the
running process** — and then the very next login minted a JWT reading `planCode "free"`,
`fullSafeScope false`, and `classify` returned **402**.

Everything was reversed: the account was deleted through the product's own `DELETE /auth/me` (which
revokes grants, revokes refresh tokens, anonymizes the email and sets `deletedAt`; login afterwards
is 401), the promo code was removed and the identical artifact deployed again, and a live read-back
confirms the code now returns *"Invalid promo code"* — a validation that runs before any write, so
it created nothing. The production environment is **byte-identical to its §300 starting state**:
43 keys, 0 added, 0 removed, 0 changed. Production SHA unchanged throughout. **0 provider calls,
0 Expert analyses, $0.**

**`BI-4` — the defect that blocked it, and it is a real customer-facing one.** Registration writes
`planCode 'pro'` *and* `subscriptionStatus 'active'` onto the user row, but
`AuthService.resolveSessionContext` calls `getBillingStatus({ userId, email, planCode, type })` and
**never passes `subscriptionStatus`**. Inside `getBillingStatus`,

```ts
const fallbackStatus =
  normalizeStripeSubscriptionStatus(user?.subscriptionStatus || user?.billingStatus) ||
  (fallbackTier === 'free' ? 'none' : 'active');
```

the right-hand branch — which exists precisely to treat a paid tier carrying no explicit status as
active — **can never run**, because `normalizeStripeSubscriptionStatus` ends in `return "none"` and
is never falsy. So `fallbackStatus` is always `'none'`, `resolveAccessTier('pro','none',null)`
returns `'free'`, and `effectivePlanCode` — which prefers `billingSnapshot.tier` — discards the user
row's `'pro'`. **Anyone onboarded by an employer promo would be told they are Pro and then get 402
on the core feature.** No customer is affected today: the variable was empty in production before
§300 and is empty again after it.

**§300's Phase-2 gate holds.** Phase 1 did not pass, so `HZ-6` and `HZ-7` were not started.

**`HZ-6` and `HZ-7` — CLOSED at §300, deployed, and each with its limit stated.**

**`HZ-6`.** One correction to the registered mechanism, which §300 asked for: the remediation
assumed the value was already in hand because *"the adapter DOES capture the responding model"*.
That is true of `anthropic-expert-provider.ts` — **a protected module, and not what production
runs**. Production runs `HostedExpertSemanticTransport`, which parsed the envelope for `usage` and
threw `model` away with it. The value was not discarded at the product boundary; **it was never
captured**. **No migration was needed** — `respondedModel` and `latencyMs` already exist on
`expert_analysis_executions` and were simply never populated.

The repair **reuses the §268 side channel** rather than inventing a second one, because
`ExpertLegResponse` is element 5 of the §259 candidate identity and the adapter is protected — which
is precisely why that channel exists. Recorded on **all four outcomes**, and legs that report
different models are **both** recorded with a `modelsDiverged` flag rather than one silently
winning. **Historical honesty is asserted, not assumed:** no backfill, no migration, no row touched;
legacy executions keep `NULL`, and the fold is tested to return `NULL` **even with a model name
sitting in the environment**. The decisive test stubs `global.fetch` and runs the real transport
parsing path — no network call, no credential, nothing billed. **Not claimed:** that a live provider
execution has recorded a non-null `respondedModel`. That needs a hosted Expert call and §300
authorises none. **CODE AND INTEGRATION PROVEN; LIVE PROVIDER EXECUTION NOT PROVEN.**

**`HZ-7`.** The trace first. The provider carries no severity by contract, admission rates nothing,
settlement settles the conclusion, and **the report was never the defect** — it printed "Not rated",
counted it in the summary and invented nothing. The defect is that `riskSnapshot` was `NULL` either
way, so **nothing distinguished "a reviewer could not rate it yet" from "the workflow never asked"**.

Risk authority, named: `computeFindingRisk` is governed but keyed to a **deterministic decomposition
hazard**, which an Expert candidate is not; `withReviewerConfirmedRisk` is the human authority and
already worked; **Expert has none, and gains none here.** So a finalization that would otherwise
produce a finding rated by nobody must now carry a `riskAssessment` **or** a `ratingDeferred` with a
reason. **NOT ESTABLISHED remains reachable — only the silent version is gone.**

**The customer-facing output is byte-identical**, and that is the strongest claim:
`resolveEffectiveSeverity` — the same resolver the report, the executive summary and the completion
gate use — returns an **identical object** for a `NULL` snapshot and for a deferral-only snapshot.
The new record is additional, not substitutional.

**The rule is deliberately not Expert-specific.** A finding reaching the report rated by nobody is
the same problem whatever produced it, and §268's `H-3` proved the deterministic
create-at-finalization path exists. **Ordering is load-bearing:** placed before the §265 authority
gate, the risk gate turned an authority refusal into a 400 about risk — the right refusal for the
wrong reason. §265's `L-1`/`L-2` caught it. §265 asks *may this be asserted*; §300 asks *what does
anyone say about its risk*; authority comes first.

**HZ-6 — which model answered is not on the record.** `respondedModel` is written as a literal
`null` and `providerId` records the seam (`hosted-expert-semantic-transport`), with the stated
reason that the transport owns the vendor; `latencyMs` is never written. The adapter **does** capture
the responding model, so the value exists and is discarded at the product boundary. For §298, vendor
and model had to be established from the frozen envelope, the absence of any production override,
the credential's model list, and cost arithmetic that reproduces the recorded `costUsd` at the
published `claude-sonnet-5` rates. That chain is sound but **configuration-derived, not
execution-derived**.

*Evidence:* `expert_analysis_executions` row `7c14adbe…`.  
*Retest:* a successful execution records a non-null `respondedModel` equal to what the provider
returned, and a non-null `latencyMs`.

**HZ-7 — an Expert-derived finding reaches the report unrated.** Risk is computed at deterministic
reconciliation, and no finding is reconciled from any Expert analysis by design, so a finding created
by finalizing an Expert-cited review has `riskSnapshot` NULL. The §298 report printed it as
*"Not rated"* with *"APPLICABLE STANDARD: Not established for this specific finding"*, while the
deterministic finding naming the same hazard printed `Critical`, severity 5, likelihood 4. **The
report is honest about it** — the executive summary states *"1 finding(s) have no established risk
rating"* and directs a qualified person to rate it before closure — so this is a capability gap, not
a false claim. Do **not** remediate by having deterministic code infer a severity from Expert's
posture; that would be deterministic code authoring safety semantics.

*Evidence:* `inspection_findings 80f32efc…`; `expert-activation-298/REPORT-TEXT-298.txt` pages 2-3.  
*Retest:* no path silently produces an unrated finalized finding.

**HZ-8 — accepted.** The operational gate runs before `claimExecution`, deliberately, so a refusal
writes no execution row. The side effect is that the idempotent-replay resolution — which cannot
spend — is unreachable once the ceiling is met. It spent nothing (`providerCallsMade: 0`, no new
row, attempts unchanged) and the read route is the recovery. Recorded so it is not rediscovered as a
bug; the reuse path is therefore **NOT_EXERCISED** in production at this configuration.

*Evidence:* replay of `expert-bc9eb0f4…-0` after the ceiling -> 503.  
*Retest:* not applicable while accepted.

**HZ-3 — unchanged at §289, and the remediation is now more precisely aimed.** `hazlenz:verify` still reports `ENVIRONMENTALLY_BLOCKED`. A §289 attempt to satisfy it by supplying `STORAGE_PROVIDER=local_test` and `STORAGE_LOCAL_ROOT` **did not take effect** — the harness does not pass them into the child process that needs them. So the fix is in `scripts/hazlenz/verify.ts`, not in the environment the operator sets.

*Evidence:* `backend hazlenz:verify output; verification/current/completion-report-285`  
*Retest:* hazlenz:verify reporting a result other than ENVIRONMENTALLY_BLOCKED.

### LEGAL / TERMS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **LG-1** | Controlled Beta Terms and Beta Privacy Notice are DRAFTED but carry 'LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED' and five unresolved contracting placeholders. | P0 | C | Legal Counsel | BLOCKED |
| **LG-2** | Liability allocation, caps and exclusions are DELIBERATELY UNDRAFTED in the Terms. | P0 | C | Legal Counsel | BLOCKED |
| **LG-3** | No `/terms` and no `/privacy` route exists. The drafted documents are unreachable from the running product. | P0 | C | ENGINEERING | **ENGINEERING_COMPLETE_COUNSEL_PUBLICATION_REQUIRED (§308)** |
| **LG-4** | `/terms` and `/privacy` returned 200 and were still unreachable: the app shell redirects any path not in its public allow-list to `/login`, and the two new routes were not in it. | P1 | — | Engineering | **CLOSED (§308)** |

**LG-1 — remediation / decision.** Counsel review and approval, plus the product owner supplying the entity, address, contact, governing law and beta term. Engineering owes nothing here.

*Evidence:* `project-docs/legal/CONTROLLED-BETA-TERMS.md, BETA-PRIVACY-NOTICE.md, COUNSEL-REVIEW-PACKET.md`  
*Retest:* A recorded product-owner classification of counsel approval, or of INTERNAL BETA DRAFT ACCEPTED FOR CONTROLLED TEST.

**LG-2 — remediation / decision.** Counsel drafts liability allocation. A disclaimer does NOT eliminate liability; enforceability of any limitation depends on jurisdiction, conspicuousness, unconscionability and whether the loss is personal injury.

*Evidence:* `project-docs/legal/CONTROLLED-BETA-TERMS.md line 116-120`  
*Retest:* Counsel-approved clause present and linked from the accepted agreement.

**LG-3 — ENGINEERING COMPLETE at §308, and deliberately NOT called closed.** The register's own
definition of LG-3 is that the *drafted documents are unreachable from the running product*. The
engineering half of that is finished and proven; the other half is a counsel act that has not
happened, so the status is `ENGINEERING_COMPLETE_COUNSEL_PUBLICATION_REQUIRED` rather than CLOSED.
§308 is explicit that the definition must not be manipulated to reduce Threshold C, and it has not
been: **LG-3 still blocks Threshold C.**

*What exists now.* `/terms` and `/privacy` are real routes that answer **200 unconditionally** —
§308 forbids a 404 "due missing engineering", and a route created only at approval time would be
exactly that. Behind them is a publication lifecycle — `DRAFT`, `APPROVED_NOT_EFFECTIVE`, `ACTIVE`,
`SUPERSEDED` — that is **server and build authoritative**, not a hidden frontend control.

**There is no directory scan.** §308's "no hidden fallback to latest file" is structural here: the
registry never lists a directory, so a file under `backend/legal-documents/` is inert until a human
enumerates it with an exact version, effective date, state, approval record and digest. Dropping a
file in does nothing. And the publication root is a **different tree** from `project-docs/legal/`,
so no `sourceFile` value can even name a draft.

**Code cannot promote a DRAFT.** `counselApproval` is a required property and is `null` for DRAFT;
a registry entry claiming any later state with a null or empty approver is **refused at load** and
the application does not start. §308's central rule is enforced by a boot failure, not a convention.

**A published version is immutable, and that is watched to fail.** The registry recomputes the
sha256 of every body from its file and refuses on a mismatch. §308 phase 3 *actually appends a byte*
to a published fixture, records the refusal, restores the file and re-hashes it to prove the
repository is unchanged. An accepted version therefore cannot be edited underneath the people who
accepted it.

**The acceptance binding is §291's, reused rather than rebuilt.** An ACTIVE document is projected
into the agreement shape as `legal:terms` / `legal:privacy`, so it inherits server-resolved
versions, server-computed digests, server-generated timestamps and insert-only evidence — all
already proven. **No migration was needed**: `agreement_acceptances.documentDigest` is `varchar(64)`,
which is exactly a sha256. The requirement is **derived from publication state**, so today's
registration is unchanged and activation turns enforcement on by itself; there is no second switch
to forget.

*Proven:* the whole A–T matrix, **58 assertions, 0 failed**, over three phases run as separate
processes because A/B need an empty registry and C–Q need a populated one. Non-vacuous: each phase
asserts its own precondition and aborts rather than reporting green. Mutation-proven: disabling
server-side version resolution failed requirements K and M.

*Evidence:* `verification/current/legal-publication-308/`  
*Retest:* `npm run check:legal-documents`, `npm run test:308-legal-publication:db`,
`npm run test:legal-render`.

**What counsel must still do, and it is the only thing left.** Resolve the five contracting
placeholders (`LG-1`), draft the liability allocation (`LG-2`), approve the exact bodies, decide the
brand replacement across the 17 inventoried occurrences, and authorise effective dates. Then
engineering places each approved body in `backend/legal-documents/` and adds **one registry entry**.
Nothing else changes — not the routes, not the renderer, not the acceptance binding, not the
registration flow, not the frontend.

**LG-4 — CLOSED at §308, and it is the reason this section ran a browser.** Both routes returned
**HTTP 200**, the backend served the correct state, the gate passed and the acceptance suite passed
58/58 — and a browser navigating to `/terms` landed on `/login`. `AppShell` redirects any path not
in its public allow-list, and the two new routes were not in it. **A route that serves correctly and
cannot be reached is not published**, which is precisely the condition LG-3 was raised about. Found
by running the product, not by reading it.

*Evidence:* `frontend-next/components/layout/AppShell.tsx`  
*Retest:* load `/terms` and `/privacy` signed out and confirm no redirect.

*Evidence:* `frontend-next/app/legal/page.tsx; no terms or privacy route under frontend-next/app`  
*Retest:* Both routes reachable, versioned, and linked from signup.

### SIGNUP / CONSENT

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **SU-1** | Acceptance is transmitted, validated server-side, and recorded by the server. Registration without it is refused. | P2 | — | Engineering | **CLOSED (§291)** |
| **SU-2** | The signup checkbox is a SAFETY-RESPONSIBILITY acknowledgement, not an acceptance of Terms, and links to nothing. | P0 | C | Mixed | OPEN |
| **SU-3** | Version, timestamp, identity binding, workspace, document digest, re-acceptance and evidence retrieval all exist and are proven. | P2 | — | Engineering | **CLOSED (§291)** |

**SU-1 / SU-3 — CLOSED at §291. The server now decides what was accepted.**

The defect was that a tick in a browser *was* the evidential record, and it vanished with the page. Inverting that is the whole design: the client sends an **assertion**, the server checks it against its own registry, and the server writes the row.

| refused | why |
|---|---|
| registration with **no** acceptance | **400**, naming the agreement and version — and refused **before any account row exists**, so nothing is left behind |
| a **superseded** version | **400** — otherwise a cached page could accept old text forever and re-acceptance would quietly stop working |
| an **unknown** agreement | **400** |

Every stored field comes from the server: agreement id, version, a **sha256 of the exact text accepted**, the counsel status at the time, the timestamp, the user, the workspace. The digest matters because in a year the question is not *"did they tick a box"* but *"what did the document say when they did"*.

**Re-acceptance needs no policy engine.** It is one comparison — is there a row at the version currently required? Raising a version makes prior acceptances outstanding **without touching a stored row**, so no account is reset, and re-acceptance is an `INSERT`: the earlier acceptance survives because it remains true that the person accepted that text on that date. Proven: stored versions went from `[2026-01-01.0]` to `[2026-01-01.0, 2026-09-14.1]`. Accepting the same version twice is one fact, enforced by a unique index — 2 rows stayed 2 rows.

**Nothing here is counsel-approved, and the product says so in a field rather than a comment.** The agreement is `counselStatus: NOT_COUNSEL_REVIEWED` and is named an internal pre-beta acknowledgement. **`SU-2`, `LG-1`, `LG-2` and `LG-3` remain open at Threshold C**, and this closes none of them.

*Evidence:* `frontend-next/app/register/page.tsx:79 and the POST body at :90-102; backend auth.service register records nothing`  
*Retest:* A registration that is refused server-side without acceptance, and an acceptance row that can be produced for a named user.

**SU-2 — remediation / decision.** Present Terms and Privacy Notice as linked documents and take affirmative acceptance of THEM. Keep the safety acknowledgement as a separate, additional affirmation.

*Evidence:* `frontend-next/app/register/page.tsx:344-355`  
*Retest:* The signup flow showing both links and refusing without acceptance.

**SU-3 — remediation / decision.** A minimal agreement_acceptances table: userId, agreementId, version, acceptedAt, ip/userAgent if counsel wants it. Re-acceptance is a version comparison at sign-in.

*Evidence:* `backend/src/users/user.entity.ts; backend/src/database/migrations/*`  
*Retest:* Acceptance evidenced for a named user, and a version bump forcing re-acceptance.

### SAFETY RESPONSIBILITY

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **SR-1** | Safety-responsibility content exists but is not consistently placed across the surfaces where it matters. | P1 | C | Mixed | OPEN |
| **SR-2** | The generated report does not overstate what it knows, and its zero-finding language is bounded and falsified. | P3 | — | Engineering | CLOSED |

**SR-1 — remediation / decision.** Decide the canonical placement set and apply it: signup, Terms, /legal, Safety Responsibility doc, Product Limitations, HazLenz UI, generated reports. Wording for the contractual surfaces is counsel's.

*Evidence:* `frontend-next/app/legal/page.tsx; backend/src/reports/canonical-report-pdf-renderer.ts basis footer`  
*Retest:* A placement audit across the seven named surfaces.

### CLAIMS / MARKETING

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **CM-1** | Public claim-bearing surfaces (/about, /hazlenz, /pricing, marketing copy) have never been audited against the product's own claims guardrails or against FTC substantiation expectations. | P1 | C | Mixed | OPEN |

**CM-1 — remediation / decision.** Audit every live claim. Never claim HazLenz detects all hazards, guarantees compliance, or replaces inspection. Substantiate any accuracy/performance claim or remove it.

*Evidence:* `project-docs/legal/CLAIMS-GUARDRAILS.md exists but is not enforced against live copy; ftc.gov Evolv action`  
*Retest:* A claim-by-claim audit of the four public surfaces against CLAIMS-GUARDRAILS.md.

### PRIVACY

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **PR-1** | Workplace photographs may contain identifiable individuals; the product has no stated position on that and the Privacy Notice is unapproved. | P1 | C | Mixed | OPEN |
| **PR-2** | No self-serve account or data deletion exists. The user entity has deletedAt but no route sets it. | P2 | — | Mixed | OPEN |

**PR-1 — remediation / decision.** Counsel-reviewed statement in the Privacy Notice plus in-product guidance on photographing people. State-law exposure varies; this is a risk-management and contractual matter, not a single federal requirement.

*Evidence:* `frontend-next/lib/offline/fieldCaptureStore.ts; backend storage module; project-docs/legal/BETA-PRIVACY-NOTICE.md (unapproved)`  
*Retest:* Privacy Notice section approved and a product guidance surface.

**PR-2 — remediation / decision.** For a named, invitation-only beta a documented MANUAL deletion procedure with a stated turnaround is a defensible position. Self-serve deletion is a v1.1/v2 item. If the beta ever opens beyond named participants, revisit against CCPA/CPRA applicability thresholds.

*Evidence:* `backend/src/users/ (no controller with a Delete route)`  
*Retest:* A written deletion procedure, and one rehearsed deletion on a disposable database.

### SECURITY

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **SE-1** | Authentication and authorization architecture verified: 15-minute access tokens, refresh tokens, production refuses to start without JWT_SECRET, global and per-route throttling, server-owned authority on entitlement and lifecycle state. | P3 | — | Security | CLOSED |
| **SE-2** | Access and refresh tokens are held in localStorage rather than httpOnly cookies. | P2 | — | Security | OPEN |
| **SE-3** | No production security review, dependency-vulnerability gate, or penetration test has been performed. | P2 | C | Security | **CLOSED (§307)** |
| **SE-4** | Secrets handling: provider key, JWT secret, Stripe keys and database URL are environment-only; production validation refuses unsafe combinations. | P3 | — | Infrastructure | OPEN |
| **SE-5** | A malformed resource identifier reaches the database unvalidated and surfaces as an unhandled HTTP 500. | P2 | — | Engineering | **CLOSED (§303)** |
| **SE-6** | Invitation verification is broken for **every** token by a schema type mismatch: `invitation."organizationId"` is `character varying` while `organization."id"` is `uuid`, so the relation join is invalid SQL and `GET /auth/verify-invite/:token` returns HTTP 500 unconditionally. | P1 | C | Engineering | OPEN (§303) |
| **SE-16** | `POST /maintenance/seed-safescope` calls `dataSource.synchronize(false)` against the live database. Contained in production only by `ENABLE_MAINTENANCE_SEED=false` — configuration, not code. | P2 | — | Engineering | **CLOSED (§307)** |
| **SE-17** | `GET /health/ready` is unauthenticated by design and was publishing the full alerting policy: the 5-errors-in-5-minutes threshold, the 15-minute dedupe window, the 12-per-window ceiling and the list of statuses that never alert. | P3 | — | Security | **CLOSED (§307)** |
| **SE-18** | `POST /hazlenz/classify` read `body.workspaceId \|\| context.workspaceId`, so a caller-named workspace outranked the one derived from the authenticated principal. | P2 | — | Security | **CLOSED (§307)** |
| **SE-19** | The deployed frontend returned no `frame-ancestors`, `X-Frame-Options`, `X-Content-Type-Options` or `Referrer-Policy`, so the application holding the session token in `localStorage` could be framed and click-driven by any origin. | P2 | — | Security | **CLOSED (§307)** |
| **SE-20** | Every individual Beta principal resolves to one shared literal governance workspace, `'default'`. Nothing is disclosed today, and the reason is a role gate rather than a scope gate. | P2 | — | Engineering | OPEN (§307) |
| **SE-21** | The GitHub repository is **public**. No credential is exposed today, but it constrains where production secrets may be placed. | P3 | — | Product | OPEN (§311) |

**SE-21 — new at §311, found while choosing where a backup credential could live.**

`github.com/McKinley18/safety-insite` is a **PUBLIC** repository. Nothing in this register had said so,
and §311 needed to know because the obvious scheduler for a nightly backup is GitHub Actions, which
would mean the production database credential living in a public repository's CI.

**Nothing is currently exposed, and that was checked rather than asserted.** `.env` and `.env.*` are
gitignored with an `!.env.example` exception; no environment file is tracked; and a scan of tracked
content at HEAD for live-shaped credentials — Anthropic keys, Neon `npg_`, Stripe `sk_live_`/`rk_live_`,
AWS `AKIA`, Resend `re_` — returns **zero** matches other than two evidence documents that *describe*
the patterns being scanned for. §307 separately scanned the deployed frontend bundle and found none.

**What it actually constrains.** GitHub does not expose secrets to workflows triggered by forked pull
requests, and `schedule` only runs on the default branch, so Actions is not an open door. But the
blast radius of a production database credential placed there includes anyone who ever gains write
access and any third-party action that runs in the job. §311 therefore pinned every action in
`.github/workflows/database-backup.yml` to a **verified commit SHA** rather than a movable tag, and
made the job install only `@aws-sdk/client-s3`. The equally valid alternative — the identical scripts
on a `launchd`/`cron` schedule on a machine the owner controls — is recorded beside it.

**This is a product-owner decision, not an engineering defect**, which is why it is P3 and owned by
Product: whether the repository should be public at all is a separate question from where a secret
goes, and §311 takes neither decision.

*Evidence:* `verification/current/br5-recovery-readiness-311/SECTION-311-BR5-RECOVERY-READINESS.json`
→ `automation.publicRepositoryConsideration`
*Retest:* A recorded owner decision on repository visibility, and on which scheduler holds the backup
credential.

**SE-2 — remediation / decision.** Accept for controlled beta with a short token life, or move to httpOnly cookies with CSRF protection in v1.1. Record the decision.

*Evidence:* `frontend-next/lib/auth.ts:120-161`  
*Retest:* If changed: a full auth regression plus CSRF coverage.

**SE-3 — CLOSED at §307, and what closing it actually required.** Both halves were delivered.

*The dependency half.* Production trees only, both ecosystems, `npm audit --omit=dev`. **Before: one
CRITICAL, twelve HIGH, ten MODERATE across the two. After: zero critical, zero high, and a single
excepted moderate.** The critical was Next.js 16.2.12's unauthenticated RCE in the Image
Optimization API — and unreachability was *not* argued, because `/_next/image` answered **200** on
the deployed frontend even though `next/image` is imported nowhere in the source. A deployed route
is in scope whether or not the product uses it. Fixed by 16.2.12 → 16.3.5, a minor upgrade.

*The one HIGH with no forward fix was removed rather than excepted.* `extract-zip`'s symlink path
traversal (CVSS 8.1) reaches production through `@puppeteer/browsers`, and npm's proposed "fix" is a
**downgrade** to puppeteer 19.8.0. But `puppeteer`'s only importer anywhere in the application was
`src/pdf/pdf.service.ts`, provided by a module whose only route has answered **410 Gone**
unconditionally since legacy PDF generation was retired. An exception would have been a claim about
reachability; deleting the dead provider removes the dependency. **441 packages, including Chromium,
left the production artifact** — 468 → 387 tree nodes. `GET /legacy/pdf/:id` still answers 410 with
the same sentence.

*The durable gate.* `npm run security:deps` (`backend/scripts/security-dependency-gate.ts`).
Deliberately **not** in `hazlenz:precommit`: `npm audit` queries a remote advisory service, so its
answer is a function of the calendar as well as the lockfile, and a gate that reddens an unrelated
typo fix is a gate people stop believing. **A scan that cannot execute is `UNKNOWN` (exit 2), never
`PASS`** — a non-JSON body, an `error` object, an absent `metadata` block or an implausibly small
production tree all trip it, and classification is read from the JSON body rather than npm's exit
code so an `audit-level` in a config file cannot buy a pass. **An exception must carry a predicate,
not a paragraph:** the one accepted entry names `applicabilityCheck: no-sse-surface`, which the gate
re-derives across 2,389 source files on every run and fails the moment an `@Sse()` route appears.
**All four refusal paths were watched to fail** — a reintroduced HIGH, an expired exception, a broken
predicate, and no registry — with the control run passing.

*The review half.* `backend/scripts/test-307-security-boundary.ts`, **334 assertions, 0 failed**,
zero provider calls, zero Expert executions, $0. And it is **non-vacuous by construction**: user B is
driven through the entire Beta v1 workflow — issued immutable report, real uploaded evidence,
corrective action, notification — and the suite *aborts* rather than reporting green if any of it is
missing; a real organization with a real member and a real organization-scoped inspection is planted
so the null-authority assertions have something to fail to reach. **Proven by mutation:** disabling
the single ownership predicate in `InspectionService.findAccessible` failed **27** assertions across
cross-user read, write, report generation, archive, revision history, download and the Expert read.

*Evidence:* `verification/current/security-307/` — `SECTION-307-SECURITY-READINESS.json`,
`SECTION-307-DEPENDENCY-GATE.json`, the full suite run, and the mutation-probe run.  
*Retest:* `npm run security:deps` and `npm run test:307-security-boundary:db`.

**SE-16 — CLOSED at §307.** A runtime `synchronize()` is the one thing §305 spent a section making
impossible: the canonical manifest is a statement about the *migration history*, and a route that
lets TypeORM reconcile the live schema against entity metadata moves production off it — after which
`check:canonical-schema` is describing a database that no longer exists. `TYPEORM_SYNCHRONIZE=false`
does not help, because this is a direct call. Production is now refused **first**, ahead of the
feature flag, with the same 404 the flag already produced — so the deployed service's observable
behaviour is byte-identical and what changed is that the flag is no longer the only thing in the way.

*Evidence:* `backend/src/maintenance/maintenance-seed.controller.ts`  
*Retest:* §307 assertions `K-synchronize` (which checks the *order* of the two refusals against the
actual call site) and `K-synchronize-sweep` (no other module in `src/` calls `synchronize()` at all).

**SE-17 — CLOSED at §307.** Read as an attacker reads it, the published policy was a pacing guide:
stay under five 5xx in five minutes, prefer 401/402/404, and nothing ever reaches a human. Detection
thresholds are one of the few operational facts whose value comes entirely from not being known. The
policy block is gone from the unauthenticated response; `OPERATIONAL_ALERT_POLICY` is unchanged and
still exported, and §294's and §296's suites assert against the constant directly, which is where a
threshold assertion belongs. **Nothing about what alerts, or when, changed.** Everything an operator
reads at 02:00 stayed: the `CONFIGURED`/`NOT_CONFIGURED`/`DEGRADED` state, the channel, the detail,
the last delivery, the error count in the window, the email capability and its missing variable
names, and the schema position. A threshold was removed, not observability.

*Evidence:* `backend/src/health/health.controller.ts`  
*Retest:* §307 assertions `C-8`, `C-9`, `C-10`.

**SE-18 — CLOSED at §307, and the honest severity is "authority", not "disclosure".** §307 measured
the consequence rather than assuming one: the `workspaceId` selects among site policies that are
*shipped fixtures*, not customer rows, and probes naming a foreign organization, another individual's
synthetic workspace, `organizationId`, `tenantId` and `ownerUserId` returned nothing belonging to any
of them. Nothing leaked. What was wrong is that an authority-shaped field was one the server had
stopped owning — the §305A/§305 defect class. `workspaceId` is now **removed from `ClassifyDto`**, so
the global `forbidNonWhitelisted` pipe rejects a body carrying it with 400 rather than dropping it
silently (§262's "the rejection is structural"), and the controller and both service sites read the
server-derived value. No client is affected: `workspaceId` exists in the frontend's HazLenz client
only as an optional *type* member and is never assigned a value anywhere.

*Evidence:* `backend/src/hazlenz/dto/classify.dto.ts`, `hazlenz.controller.ts`, `hazlenz.service.ts`  
*Retest:* §307 assertions `C-3` (five authority-shaped fields, each 400) and `C-3c` (the same request
*without* an authority field still succeeds, so `C-3` measures the field and not a broken route).

**SE-19 — CLOSED at §307, with one thing deliberately left undone and said out loud.** `SE-2`
accepts tokens in `localStorage` for Beta on the strength of a short token life. That reasoning
assumes the token is hard to *reach*; it says nothing about an attacker who never needs to read it
because the victim's own browser performs the action. The deployed frontend returned no
`frame-ancestors` and no `X-Frame-Options`, so it could be framed by any origin. It now returns
`Content-Security-Policy: frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self),
microphone=(), geolocation=()` and `Cross-Origin-Opener-Policy: same-origin`.

**`script-src` is deliberately absent.** A real script policy for an App Router build needs
per-request nonces, which means a middleware layer this product does not have and §307 does not
authorise building. Shipping `script-src 'unsafe-inline' 'unsafe-eval'` to make a CSP header *appear*
would be worse than shipping none — a header that looks like a control and is not one, which is the
exact failure §307 names. `camera=(self)` rather than `camera=()` because field capture uses
`<input capture="environment">`, which Chrome gates on that policy; locking it to nothing would break
the primary mobile flow, a correction more conservative than the risk. **A full script policy is the
remaining frontend security work**, and it is a `v1.1` item, not a Beta blocker.

*Evidence:* `frontend-next/next.config.ts`; production read-back recorded in the §307 evidence.  
*Retest:* read the headers off the deployed production response.

**SE-20 — OPEN, and deliberately not repaired.** `resolveHazLenzGovernanceContext` returns
`user.organizationId || user.workspaceId || 'default'`. The JWT strategy produces no `workspaceId` at
all and an individual has no organization, so **every individual in the deployment resolves to the
same literal string**. The absence does not make a predicate disappear — it collapses every
individual into one shared scope, which is the same fault read the other way round.

**Nothing is disclosed today, and §307 measured why.** The three surfaces scoped by that value —
`/hazlenz/persistence/audit-records` and its trail and candidate routes — carry
`@Roles('ORG_OWNER','SAFETY_DIRECTOR','SUPERVISOR','AUDITOR','SUPER_ADMIN')`, and an individual's
role is `individual`. An authenticated individual was driven at them with and without a named foreign
workspace and got **403 both times**. That is a *role* gate, not a scope gate — §305's own phrase for
this shape was "coincidences, not controls" — and one role string away from failing. The service's
own `getById` and `updateStatus` also guard with `record.workspaceId && record.workspaceId !==
user.workspaceId`, so a record with a NULL workspace passes the cross-workspace check entirely.

*Why it was left open:* the obvious repair is to derive an individual's workspace as
`user:<userId>`, mirroring what `CorrectiveActionsService` already does for `tenantId`. That changes
the workspace identity written on every future HazLenz persistence row **and** changes which existing
rows a principal can reach — customer-data reinterpretation, which §307 lists as a stop-for-product-
owner decision rather than an in-slice repair.

*Evidence:* `backend/src/hazlenz/workspace-governance-access/hazlenz-governance-context.ts`,
`backend/src/hazlenz/persistence/persistence.service.ts`  
*Retest:* a two-individual fixture proving one individual's HazLenz audit records are unreachable by
another **without** relying on the role gate.

**SE-4 — remediation / decision.** Confirm Vercel Preview environment scopes do not carry production secrets before any external preview sharing.

*Evidence:* `backend/src/config/validate-production-environment.ts`  
*Retest:* An environment-scope read at deploy time.

### DATA PROTECTION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **DP-1** | Operational logging redacts content and credentials by KEY NAME, including observation text, rationale and snapshots. | P3 | — | Engineering | CLOSED |
| **DP-2** | Audit-trail completeness now has a stated failure mode: a failed audit write no longer fails the request and is emitted as action.audit_write_failed (severity error). | P3 | — | Engineering | CLOSED |

### TENANT ISOLATION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **TI-1** | Cross-account isolation verified on inspections, reports, actions, tasks and calendar, including the §287 edit route. | P3 | — | Security | CLOSED |
| **TI-2** | The outcome-intelligence recurrence check counts across EVERY tenant and would auto-escalate one customer's action on another customer's history. **§289: reachable in production — see DB-4.** | P2 | — | Security | BLOCKED |
| **TI-3** | Organization/multi-user workspace paths are only partially exercised; most evidence is from single-user personal accounts. | P2 | C | Engineering | OPEN |

**TI-2 — remediation / decision.** Before any activation: scope recurrence to tenant/workspace, prove same-tenant history CAN influence and other-tenant history CANNOT, prove no identifier leakage, no cross-tenant escalation, add query scoping and indexes, and regress with two or more workspaces.

*Evidence:* `backend/src/outcomes/outcome.service.ts checkRecurrence; verified absent in §287`  
*Retest:* A two-workspace regression proving both directions.

**TI-3 — remediation / decision.** A two-member organization fixture exercising owner, assignee, manager and non-member.

*Evidence:* `backend corrective-actions and tasks services; no multi-member workspace fixture`  
*Retest:* A role-matrix regression on a populated organization.

### STORAGE / PHOTOS / REPORTS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **ST-1** | Report and artifact access is an authenticated streaming GET; there are no signed URLs to leak or expire. | P3 | — | Security | CLOSED |
| **ST-2** | A generated report round-tripped through production storage with a checksum match, from the deployed candidate. | P2 | — | Infrastructure | **CLOSED (§290)** |
| **ST-3** | Report and inspection-record retention policy is undefined. | P2 | C | Product | OPEN |
| **ST-4** | R2 bucket protection — versioning, lifecycle, object lock — has never been read, so accidental-deletion recovery for evidence objects is UNKNOWN. | P2 | — | Infrastructure | **CLOSED (§312A).** The platform finding stands unchanged — R2 has no versioning and durability does not cover deletion — and the gap it described is now remediated and running: an independent content-addressed recovery copy, reconciled daily, with a rollback-proof erasure ledger. |

**ST-2 — §289 update.** The premise "never been exercised end to end" was already false: §269 verified the live R2 bucket, and §289 re-verified it freshly and non-destructively. Bucket reachable and authorised, no public policy, ACL `AccessDenied`, upload, authorised download with sha256 match, unsigned GET and LIST both refused (HTTP 400), delete, `NoSuchKey` after delete, **0 residue**, no customer data. Tenant isolation is database-enforced rather than path-enforced: the object key is `<category>/<date>/<uuid>` and carries no tenant identifier, `objectKey` is `select: false`, a digest mismatch on read is refused, and `FilesController` is entirely behind `JwtGuard` — so an object identifier alone confers no access.

**CLOSED at §290, with the exact retest the register asked for.** The deployed candidate generated a report, and three independent readings of the same artifact agree:

| | sha256 |
|---|---|
| the record the application wrote to the production database | `59ce3cd1…` |
| the bytes fetched directly from the R2 bucket with the production credential | `59ce3cd1…` |
| the bytes the product served over its own authenticated download route | `59ce3cd1…` |

`storage_objects` gained one row — `objectKey report/2026-09-14/1997e3c3-…`, `application/pdf`, 7 317 bytes, `status ready`, owner-scoped — and the bucket went from two objects to three. An **unsigned** public read of that exact object was refused `HTTP 400`; an unauthenticated product download returned `401`; the other tenant's *authenticated* download returned `404`. Synthetic data only.

*Evidence:* `verification/current/threshold-a-290/SECTION-290-DEPLOYMENT.json` → `smoke.storage`, `smoke.signedAccess`  
*Retest:* A generated report round-tripped through production storage with a checksum match on any change to the storage path.

> Retention policy is a different question and remains open as **ST-3**. What closed here is the storage **path**.

**ST-4 — new at §311. The bucket's *contents* are proven; its *protection* has never been read.**

ST-1 and ST-2 establish that the storage path works and that access to it is correctly refused.
Neither asks the recovery question: **if an evidence photo is deleted, can it be brought back?**

§311 tried to answer it and could not, for a reason worth recording because it is also good news.
The application's R2 credential is **object-scoped**: `ListBuckets`, `GetBucketVersioning`,
`GetBucketLifecycleConfiguration` and `GetBucketEncryption` all return **403 AccessDenied**. The
token that serves customer files cannot administer the bucket — a real isolation property, measured
rather than assumed, and one §311 was careful not to weaken. The consequence is that the protection
settings are readable only from the Cloudflare console, and unlike Neon the owner is **not** signed
in to Cloudflare in this browser, so there was no already-authorised session to read. §311 did not
log in.

**So this is a one-console-read finding, exactly as `BR-2` was before §295.** What must be read:
**versioning** (on or off), **lifecycle rules** (any expiry), **object lock**, and whether any public
access is configured.

**Why it blocks BR-5 rather than standing alone.** A database restore moves evidence *references*,
not evidence *objects*. If versioning is off — the R2 default — then an object the application
deleted is gone, and no database backup can bring it back. Until that is known, the recovery strategy
has a hole in a material customer-data store, and `BR-5`'s closure rule forbids closing over one.

**What *is* established.** The database and the bucket are currently **consistent**: 5 live
`storage_objects` rows, 5 objects, one-to-one, every one verified by full sha256 download against the
hash the database recorded at upload — 0 missing, 0 orphans, 0 mismatches. And the reconciliation is
now a command (`verify-object-consistency.js --deep`) rather than an exercise.

*Evidence:* `verification/current/br5-recovery-readiness-311/03-OBJECT-CONSISTENCY-PRODUCTION.json`
and `SECTION-311-BR5-RECOVERY-READINESS.json` → `objectStorage`
*Retest:* The four settings above, read from the Cloudflare console and dated.

**ST-3 — remediation / decision.** State a retention and export position for the beta, especially interacting with RR-1.

*Evidence:* `no retention policy document`  
*Retest:* A written policy referenced from the Terms.

### OFFLINE / SYNCHRONIZATION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **OF-1** | OFFLINE CAPTURE and OFFLINE PERSISTENCE work: field capture stores observations and photos in per-user IndexedDB behind a controlling service worker. | P3 | — | Engineering | CLOSED |
| **OF-2** | OFFLINE MUTATION OUTBOX exists for calendar TASKS only. Corrective-action create, edit and close are REQUIRES_NETWORK. | P2 | — | Product | OPEN |
| **OF-3** | OFFLINE CONFLICT RESOLUTION does not exist, and OFFLINE HAZLENZ INTELLIGENCE does not exist. | P3 | — | Product | DEFERRED |
| **OF-4** | D-053: EDIT is naturally idempotent; CLOSE side effects now fire on the transition, not the request. | P2 | — | Engineering | **CLOSED (§291)** |

**OF-2 — remediation / decision.** Recommended v1 beta minimum is capture+persistence offline and honest refusal for everything else, which is what ships. A mutation outbox for actions is v1.1/v2.

*Evidence:* `verification/current/action-lifecycle-287/results/action-lifecycle-offline.json`  
*Retest:* Re-run the §287 offline probes on any change.

**OF-3 — remediation / decision.** Both are v2. Neither is required for a v1 controlled beta provided marketing never claims offline analysis.

*Evidence:* `no conflict-resolution module`  
*Retest:* None for v1. Guarded by CM-1.

**OF-4 — CLOSED at §291. The transition was idempotent; its side effects were not, and that is where the harm was.**

**EDIT — naturally idempotent, reclassified.** Every field is assigned absolutely, so a replayed `PATCH` leaves the row **byte-identical**: zero differing columns, zero duplicate side effects. The extra audit row is a true record of two requests, not a state change.

**CLOSE — this one was genuinely unsafe.** `recordClosureIntelligence` **inserted a new outcome row on every request**. A client that commits a close, loses the response and retries therefore wrote *two* outcomes for one closure — and because `checkRecurrence` counts rows in a window, **a retry could manufacture a recurrence that never happened and escalate the customer's own action on the strength of its own duplicate.** The feedback write has a sharper threshold still: a remediation is promoted at **two** occurrences, so two retries of a single closure could mint a "learned" fix from one event.

Closure side effects now fire on the **transition**, not the request. `close()` had no gate at all. Proven: a retry leaves outcomes at 1, and a genuine reopen-then-reclose records a second outcome (1 → 2) — so it is not over-corrected. Two closures are two closures; one closure twice is one.

*Evidence:* `verification/current/action-lifecycle-287 I0-I4, U8, F4-F5`  
*Retest:* A duplicate-submission measurement on both routes.

### BILLING / SUBSCRIPTIONS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **BI-1** | Stripe checkout, customer portal and webhook endpoints exist and are gated on STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET. | P2 | — | Business | OPEN |
| **BI-2** | Entitlement is server-authoritative over the JWT's cached plan claim, in both directions. | P3 | — | Engineering | CLOSED |
| **BI-3** | Failed payment, dunning, downgrade, cancellation and refund flows have not been exercised. | P2 | — | Business | OPEN |

**BI-1 — remediation / decision.** If the controlled beta is FREE, billing is out of the beta path and this does not block. If the beta charges, configure and exercise checkout, webhook signature verification and reconciliation in a test-mode production environment first.

*Evidence:* `backend/src/billing/billing.controller.ts, billing.service.ts`  
*Retest:* A test-mode end-to-end purchase with webhook reconciliation.

**BI-3 — remediation / decision.** Exercise in Stripe test mode with a test clock before any paid tier opens.

*Evidence:* `backend/src/billing/`  
*Retest:* A test-clock subscription lifecycle.

### ENTITLEMENTS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **EN-1** | Entitlement boundaries behave correctly and name themselves: Free cannot create corrective actions or generate reports (402 PAID_SUBSCRIPTION_REQUIRED) but retains read and management of what it already has. | P3 | — | Engineering | CLOSED |

### APP / MOBILE FORMAT

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **AF-1** | 'App' for v1 is a responsive web application with a service worker, not a native binary. | P3 | — | Product | CLOSED |
| **AF-2** | PWA install experience (home-screen install, standalone launch, update-on-relaunch) has never been reviewed. | P2 | — | Engineering | OPEN |
| **AF-3** | Mobile touch targets resolve to 40px, below the 44px iOS HIG / WCAG 2.5.5 (AAA) guideline, on every mobile surface. | P2 | — | Product | OPEN |

**AF-2 — remediation / decision.** Fold into Batch 6: install, launch standalone, go offline, relaunch, take an update.

*Evidence:* `frontend-next/public/sw.js, manifest.webmanifest`  
*Retest:* An install-and-update walkthrough on a real device or emulated PWA context.

**AF-3 — remediation / decision.** A one-line change with product-wide visual effect. Belongs to a design decision, not to a bounded section.

*Evidence:* `frontend-next/app/globals.css ~line 1558; §287 UX findings at 390`  
*Retest:* A mobile sweep at 390 after any change.

### UI / FORMATTING

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **UI-1** | Two competing page shells produce different content widths and gutters; content shifts sideways between routes. | P2 | — | Engineering | OPEN |

**UI-1 — remediation / decision.** Choose one shell. Shared change; fold into Batch 6.

*Evidence:* `project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md O-3`  
*Retest:* A width measurement across routes at 1440.

### ACCESSIBILITY

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **AC-1** | Reviewed surfaces pass objective accessibility checks; unreviewed surfaces are unknown. | P2 | — | Engineering | OPEN — **SHOULD**, removed from Threshold C by the product owner at §317 |

**AC-1 — remediation / decision.** Extend the §286/§287 instrument to the Batch 6/7 surfaces. No new standard is being invented; the checks are the ones already in use.

*Evidence:* `verification/current/actions-calendar-286 and action-lifecycle-287 measurements`  
*Retest:* The accessibility block of the page-review instrument on each remaining surface.

### UPDATE DELIVERY

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **UD-1** | Client update delivery and version-skew refusal are implemented and gated. | P3 | — | Engineering | CLOSED |

### INFRASTRUCTURE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **IN-1** | The validated candidate is deployed. Both halves serve `990a26b7…` and the identity was read back and matched. | P2 | — | Infrastructure | **CLOSED (§290)** |
| **IN-2** | The Vercel PRODUCTION deployment path was exercised deliberately and its source and target read back. | P2 | — | Infrastructure | **CLOSED (§290)** |
| **IN-3** | Render configuration, authentication and auto-deploy posture re-read live and dated at §289. | P2 | — | Infrastructure | **CLOSED (§289)** |
| **IN-4** | Vercel Preview deployments are SSO-protected, noindex and DENY-framed, and no backend secret is scoped to Preview. | P2 | — | Infrastructure | **CLOSED (§289)** |

**IN-1 — CLOSED at §290. The candidate is deployed.**

| | |
|---|---|
| Backend | Render `dep-dak2qeqfngtc7381gch0`, **live**. `/health/version` reports `gitCommit 990a26b70dc6…` with `versionSourceStatus: RENDER_GIT_COMMIT` — platform-sourced, not a checked-in literal — and `release:verify-sha` reports `RUNNING SHA OK`. |
| Frontend | Vercel `dpl_14HTnchjHhcrMp5aHFSzut5miJRR`, target production, `meta.githubCommitSha` matching. |
| Alias | `safety-insite.vercel.app` resolves to that deployment, confirmed **from the served HTML**, which names it in its own asset query strings rather than only from the API. |
| Stability | Three readiness probes over ~40 s, all `HTTP 200` in 0.33–0.58 s. No crash or restart loop. |

**Not closed because the services report healthy.** Closed because the deployed identity was read back and matched on both halves.

*Evidence:* `verification/current/threshold-a-290/SECTION-290-DEPLOYMENT.json`  
*Retest:* A production SHA read on both halves matching the intended release, plus an `applicationSourceDigest` match at that SHA.

**IN-1 — superseded §289 note.** DB-1, PV-1 and RL-1 are closed, and ST-2's infrastructure half is closed. Production runs `de655d2f` on **both** halves — the Render backend and the Vercel production deployment agree, which is itself worth knowing. The candidate is more than 50 commits ahead and is committed locally and **not pushed**. What identifies it for release is not a SHA but `applicationSourceDigest` `2ce8a1d7…`, the digest at `94e2963427c46b4d69dcdd8664c4754c5fc72c37` — the commit the §289 build and gates ran against.

*Evidence:* `verification/current/threshold-a-289/SECTION-289-THRESHOLD-A.json` → `IN_1_AND_IN_2_DEPLOYMENT`; `/health/version` read live  
*Retest:* A production SHA read on both halves matching the pushed tip, and an `applicationSourceDigest` at that SHA equal to `2ce8a1d7…`.

**IN-2 — CLOSED at §290, and the paradox is now explained rather than merely observed.**

`gitProviderOptions.createDeployments: "disabled"` suppresses **automatic** Git deployments. It does not prevent a push from producing a **preview**, and §290's push duly produced one — `dpl_DRhjpmPGnEyhsgBb7AHm6gDVrdvC` at the release SHA. That preview was SSO-protected (`302` to `vercel.com/sso-api`), `noindex`, `DENY`-framed, carried no production secret, and **did not touch the production alias**. Production moved only when it was explicitly told to, by an API-created deployment targeting production at the exact release SHA, whose source and target were then read back.

*Evidence:* `verification/current/threshold-a-290/SECTION-290-DEPLOYMENT.json` → `frontendDeployment`, `preview`  
*Retest:* A production deployment whose source and target are read back from the Vercel API and recorded.

**IN-2 — superseded §289 note.** `gitProviderOptions.createDeployments` is `"disabled"`, and a Git-sourced **preview** deployment of the candidate branch at `0f36d497` nevertheless exists and is `READY`. Pushing this branch is therefore not a purely local act, and that is precisely why §289 did not push: a push is step 1 of the deployment sequence and belongs to the authorization, not to the preparation.

*Evidence:* `verification/current/threshold-a-289/SECTION-289-THRESHOLD-A.json` → `IN_1_AND_IN_2_DEPLOYMENT`  
*Retest:* A production deployment whose source and target are read back from the Vercel API and recorded — deployment sequence steps 9 and 10.

**IN-3 — CLOSED at §289.** `srv-d7kl74jeo5us73deaor0`, oregon, `0.5c-512mb`, 1 instance, `autoDeploy=no`, `autoDeployTrigger=off`, previews off, `healthCheckPath=/health/ready`, 41 environment variables with **0 secret values exposed**, `EXPERT_EXECUTION_ENABLED=false`, current deploy `dep-dajckf3m8hqs73fp3u90` at `de655d2f`. Rollback capability present — seven prior deploys retained.

**Migrations do not run on deploy.** The start command is `start:render`, not `start:release`, so `npm run migrate:prod` is a separate deliberate step. That is the ordering the runbook depends on, and it is enforced by configuration rather than by memory.

Four observations registered rather than fixed: the service slug and public hostname are the retired **SafeScope** brand (infrastructure, not a product surface); `DB_SSL=false` is set but `DATABASE_URL` carries `sslmode=require` and takes precedence; the backend is in **oregon** while the database is in **us-east-1**, a cross-region hop on every query; and no `RESEND_*` credential appears among the 41 names although `PASSWORD_RESET_PROVIDER=resend`.

*Evidence:* `verification/current/threshold-a-289/SECTION-289-THRESHOLD-A.json` → `IN_3_RENDER`  
*Retest:* A recorded configuration read dated at the next deploy.

**IN-4 — CLOSED at §289.** Probed live. Preview answers **HTTP 302** to `vercel.com/sso-api` with `x-frame-options: DENY` and `x-robots-tag: noindex`. The scope listing per target is the answer the entry asked for: the Vercel project has **exactly four** environment variables and **every one is public-prefixed**, so no backend secret is exposed to Preview.

**Two facts worth carrying forward.** The project's own production alias is *exempt* from SSO and returns 200, so a controlled production deployment is publicly reachable and is not `noindex` — correct for a product, but not what "controlled" sounds like. And `NEXT_PUBLIC_DISABLE_AUTH` is scoped to **Production**, which reads alarmingly and is structurally inert: every consumer either tests `NODE_ENV !== "production"` directly or delegates to `getLocalDevPlanCode()`, whose first line returns `"free"` under production. Registered as `CF-1` for the name, not for the behaviour.

*Evidence:* `verification/current/threshold-a-289/SECTION-289-THRESHOLD-A.json` → `IN_4_PREVIEW`  
*Retest:* Re-enumerate scopes whenever a Vercel environment variable is added.

### DATABASE / MIGRATIONS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **DB-1** | Production migration head READ at §289: `1800000018000`, 50 applied, zero drift, 4 pending, none destructive. | P2 | — | Engineering | **CLOSED (§289)** |
| **DB-2** | The §287 corrective-action lifecycle migration had a DUPLICATE, out-of-order timestamp (1800000006000, colliding with AddUserProfileNames) which also left schemaCompatibilityVersion blind to the schema change. | P2 | — | Engineering | CLOSED |
| **DB-3** | The outcomes table is absent from the MIGRATION SET but PRESENT in the production database. The reachability conclusion drawn from its absence does not hold. | P2 | — | Security | OPEN — premise corrected at §289 |
| **DB-4** | Recurrence is scoped to one workspace, proven on a production-shaped database. | P2 | — | Mixed | **CLOSED (§291)** |
| **DB-5** | Learned corrective-action fixes were selected across every tenant. | P2 | — | Mixed | **CLOSED (§292)** |
| **DB-7** | Workspace-scoped learning from outcomes is not implemented and is not a v1 capability. | P3 | — | Product | DEFERRED (§292) |
| **DB-6** | Closure intelligence failed for every hand-created corrective action. | P2 | — | Engineering | **CLOSED (§291)** |
| **SC-2** | Pre-existing entity-versus-database contradictions that exist identically in production and in a fresh replay: `standards_master` column bounds, and four `timestamp` columns the entities declared `timestamptz`. | P2 | C | Engineering | **CLOSED (§309)** |
| **SC-3** | Four entities map to tables that exist in neither the canonical manifest nor a fresh replay — `Report`, `Finding`, `ReportAttachment`, `HazardTaxonomy`. Every read through them fails on a migration-built database. | P1 | — | Engineering | **CLOSED (§310A, DEPLOYED and proven in production).** All four families classified LEGACY/SUPERSEDED and **retired**, not resurrected. |
| **SC-4** | Residual entity-versus-database differences, each recorded in the entity-contract ledger with a reason. Thirteen at §309; **twelve** after §310 resolved `user.subscriptionStatus`. | P3 | — | Engineering | OPEN (§310A) — the named unsafe-default member is **CLOSED in production**; **twelve** residuals remain OPEN. |
| **SC-5** | Four timestamp columns hold INSTANTS in timezone-naive storage; lossless only because the deployment runs UTC. | P3 | — | Engineering | OPEN (§309) |

**SC-2 — CLOSED at §309, and the register text it closed was partly wrong.**

**The instrument came first.** `npm run check:entity-contract:db` compares the ENTITY CONTRACT
against a fresh migration replay using **TypeORM's own comparison** — `createSchemaBuilder().log()`,
the machinery behind `typeorm schema:log` and the machinery that would actually run if `synchronize`
were ever enabled. A hand-written comparator would be a second opinion about type equivalence, and
the opinion that decides whether a read fails at runtime is TypeORM's. It found **27 material
differences**, correctly separated from **184 cosmetic** constraint- and index-name differences.

**Contradiction 1 — `standards_master`, six columns. The register text was STALE.** SC-2 recorded
that *"neither production nor a fresh replay has them, so any query naming them fails — the §266
failure mode"*. §309 **measured all six present**, with the exact types migration `1800000004000`
authored: `varchar(120)`, `char(64)`, `char(64)`, `varchar(80)`, `varchar(24)`, `varchar(80)`. The
contradiction was never *absence* — it was the entity failing to declare bounds the database
enforces. The **database is authoritative** here, because those bounds are in a versioned migration
and were chosen on purpose, so the **entity** was repaired.

**Contradiction 2 — four timestamps, decided by measurement rather than by preference.**
`site.createdAt`, `inspection.createdAt`, `user.deletedAt` and `user.nextBillingDate` declared
`timestamptz` over `timestamp without time zone` columns. §309 measured what that actually does:

- Under **UTC** the round trip is **exact either way** — 5/5 probe instants. This is production, and
  it is why nothing has ever gone wrong.
- Under a **non-UTC** reader the instant **moves by the offset — identically** whether the entity
  says `timestamp` or `timestamptz`. 5/5 moved in both cases.

**The declaration is not the mechanism.** An offset the column never stored cannot be recovered by
claiming it is there. So `timestamptz` was a claim the storage could not honour, and removing it
changes **no runtime behaviour at all**. Converting the columns is the only change that would make
the instants portable, and it means rewriting stored customer timestamps against an assumed offset —
which §305 refused and §309 forbids. Registered as `SC-5` rather than hidden.

**Both repairs are ENTITY METADATA ONLY.** No migration. No column altered. No default changed.
**No historical row modified.** The canonical-schema gate still reports 68 tables and 0 material
differences with the same digest.

*Proven by round trip:* **20 assertions, 0 failed**, including NULL behaviour, DEFAULT behaviour, a
64-character digest through `char(64)`, values at the exact declared bounds, a value one character
over the bound **refused by the database**, and instants crossing both a UTC-offset and a
month boundary.

*The gate is watched to fail on exactly the two classes it exists to catch:* reverting
`user.deletedAt` to `timestamptz` and removing the `release_id` length each failed it, and both
entities were restored with their sha256 re-verified. There is deliberately **no ledger entry** for
a `standards_master` length or a timestamp type, so either one returning fails.

*Evidence:* `verification/current/sc2-entity-contract-309/`  
*Retest:* `npm run check:entity-contract:db` and `npm run test:309-sc2-reconciliation:db`.

**SC-3 — CLOSED at §310A by RETIRING the architecture, not by creating the tables.**

**Released and proven in production.** `b8a6fd9c` serves over five stable reads at schema head
`1800000026000`, 58/58, `aheadOfBuild: []`. `GET /analytics/safety-trends` answered 401 before the
deploy and **404** after it — the route-removal proof, and the only change to the deployed route
surface. The three legacy report reads return the real **410** naming their successor, from
production, as an authenticated individual. **Zero missing-relation 5xx across all sixteen affected
routes**, and `/inspections`, `/inspection-reports`, `/sites`, `/actions` and `/auth/me` all answer
200, so no individual capability was lost. The entitlement-gated routes refuse a free individual
with 402/403 before the handler runs, so their 410 bodies are proven in the rebuilt environment
against identical code rather than in production — stated as a limit, not glossed.

§310 was forbidden to begin by creating tables, and required to classify each family first. All four
were classified **B — LEGACY / SUPERSEDED**, and the classification was decided on evidence rather
than on the existence of a TypeORM entity in source:

| family | table | successor that actually ships | production rows |
|---|---|---|---|
| `Report` | `report` | `inspection_reports` + `inspection_report_versions` (immutable snapshot) | **0** |
| `Finding` | `finding` | `inspection_findings` | **0** |
| `ReportAttachment` | `report_attachments` | inspection evidence storage | **0** |
| `HazardTaxonomy` | `hazard_taxonomy` | the shipped taxonomy JSON map, read by `HazardTaxonomyCoverageService` via `fs.readFileSync` — this family never used a database table at all | **0** |

**The register text §309 wrote was partly wrong about the blast radius, and the correction matters.**
§309 said the entities are injected into five services backing deployed controllers "so any route
that actually queries one returns a 500". Measured against the **authoritative deployed route table**
— all 156 routes Nest actually registers — `ClassificationsModule`, `ControlVerificationsModule` and
the two `IntelligenceModule`s **were never registered in `AppModule`**. Their paths return 404
because the route does not exist. A controller in source is not a deployed route.

**What did reach the missing relation, measured before any repair:** exactly five routes.
`GET /analytics/safety-trends` (500 for any entitled caller) and — for an **organization** principal;
an individual is refused 401 by the organization guard before the repository is touched —
`GET /legacy/reports`, `/legacy/reports/:id`, `/legacy/reports/:id/recommendations`, and
`POST /action-engine/generate/:reportId`. **That fifth route is why the route table is evidence and
not a convenience:** it is not namespaced `legacy/`, is not named after a report, and injects
`ReportsService` through a `forwardRef`, so reading controllers missed it. It was added to the
instrument after the BEFORE capture and measured separately, which the evidence states rather than
folding it in.

**One more correction, and it narrows the severity honestly.** The production-upgrade rehearsal
revealed that **production still carries all four tables** as synchronize-era residue — created
before migrations were baselined over production, present in no migration and in no manifest. So on
a migration-built database the routes return 500, which is what the BEFORE proof measured, but in
**today's** production they would have returned an empty result. SC-3 is a rebuilt-environment
failure — disaster recovery, any new environment, and every disposable verification database take
the replay path — rather than a live 500 a beta customer was hitting. **All four tables are empty in
production**, so retirement loses no customer data, and §305 forbids dropping them, so they remain
in place and are now inert.

**The repair.** `GET /analytics/safety-trends` was **removed** — the deployed route surface went 156
→ 155, and that one route is the entire diff. The remaining routes answer **410 Gone**, not 404:
they are namespaced `legacy/`, six siblings already answered 410, and turning some of them into 404
would destroy a compatibility signal an earlier section deliberately established. The choice is
documented in the controller. Every retired route names its successor in the response body. The
entities, their modules and their services were deleted, and `ReportsService` went with them once
its last unreachable caller — `TransparencyService.getDecisionBreakdown`, behind a route that has
answered 410 since the mutable report model was retired — was removed.

**The gate could have gone green for the wrong reason, and that was measured too.** §310 resolved
SC-3 by removing entities, so the entity-contract comparison stops looking at them. So §309's `F-1`
was rewritten from "these four entities fail to read" into the general property — **no entity in the
DataSource maps to a table absent from the database**, asserted over all 57 registered entities —
and **watched to fail**: a probe entity mapped to a non-existent table made it fail, and was removed.
The four retired entity names are enumerated in the ledger under `sc3ClosedAt310` rather than merely
deleted, so the shrinkage is recorded rather than silent. SC-3's closure rests on the route proof
driving live routes against a real database, not on a gate going quiet.

*Evidence:* `verification/current/sc3-legacy-surfaces-310/`  
*Retest:* `npm run test:310-missing-relation:db` and `npm run routes:deployed:db`.

**SC-5 is untouched and remains OPEN**, as §310 required.

**SC-4 — OPEN, twelve residuals in a ledger. The one §309 named as "worth naming" is CLOSED in production at §310A.**

**Production now reads `subscriptionStatus DEFAULT 'none'`**, confirmed by schema inspection rather
than by inserting a row. The migration moved **zero** customer rows: 9 `active` / 57 `none` before
and after. A synthetic account registered through the real product path came out **free / none**,
and was removed through `DELETE /auth/me`.

`user.subscriptionStatus` had a database default of `'active'` while the entity declared `'none'`, so
an INSERT omitting the column created an account asserting an **ACTIVE subscription** — the `EN-3`
defect §302 repaired in code, still present in the schema. §309 registered it as contained **by code
rather than by schema**, and §310 removed the need for that containment: migration
`1800000026000-UserSubscriptionStatusDefault` sets the default to `'none'`. A default is the value
you get when nobody decided, and the value you get when nobody decided must be the safe one.

**The migration changes the DEFAULT and reads no row.** Existing `'active'` rows are legitimate
customer subscription state, and a migration cannot distinguish one written by `AuthService` or the
Stripe webhook from one that merely inherited the bad default. Guessing would either revoke a paying
customer's entitlement or fabricate a billing state. The objective was default correction, not
customer-state normalization — and that restraint is **measured**, not asserted: a fresh production
backup was restored into a disposable database and upgraded, and the distribution of existing
`subscriptionStatus` values is byte-identical across the migration (**9 `active` / 57 `none` before
and after**). The same rehearsal proved the upgraded production schema carries **zero material
differences** from the schema a fresh replay produces, so the migration converges from both sides.

`AuthService.register` still sets both fields explicitly (§302 / EN-3) and a caller-supplied
`subscriptionStatus` is still refused 400 (BI-4). §310 changed a database default, not the authority
model.

*Evidence:* `verification/current/sc3-legacy-surfaces-310/SECTION-310-PRODUCTION-UPGRADE-CONVERGENCE.txt`  
*Retest:* `PROD_BACKUP_SQL=… npm run test:310-upgrade-convergence`.

**The other twelve residuals are unchanged** and still carry their §309 reasons in the ledger: one
column type, two nullabilities, four defaults, five legacy database-only columns.

**SC-5 — OPEN.** The residual of contradiction 2, above. Note the local development database server
runs `America/New_York` while production runs UTC, so any future conversion must be done per
environment against evidence of how each row was written rather than against one assumed offset.


**DB-1 — CLOSED at §289.** The read §288 was forbidden to take. Production head `1800000018000`, **50 applied**, and — the fact that actually matters — **zero drift**: every applied row matches a migration file in the candidate, and the four pending ones are strictly newer than the head.

| | migration | `up()` | destructive? | backfill? |
|---|---|---|---|---|
| 1 | `1800000019000` ExpertAnalysisAuthorityFoundation | 4 defaulted/nullable columns on `hazlenz_analyses`, new table `expert_analysis_executions`, 4 indexes, 6 constraints | **No** | **Yes** — sets `producer='client_supplied'`, `analysisState='ANALYSIS_AVAILABLE'`, `confirmationRequired=false`. The rehearsal confirmed all 8 production rows take exactly those values. |
| 2 | `1800000020000` ExpertHumanConfirmation | widens `human_reviews.decision` 24→32, replaces its CHECK, adds nullable `settlementReviewId`, 2 partial unique indexes | **No** | No |
| 3 | `1800000021000` ProducerScopedAnalysisCurrentness | replaces the single-current index with a per-producer one | **No** | No |
| 4 | `1800000022000` CorrectiveActionLifecycle | 3 nullable columns on `corrective_actions`, 2 indexes | **No** | No |

**Preflight against real production data, before any of it ran:** zero duplicate groups would violate either new unique index, and the single existing `human_reviews.decision` value (`accepted`) is permitted by the new CHECK. So none of the three ways these migrations could have failed on live data was present.

**Then it was rehearsed both ways against a byte-identical copy of production.** Forward: 4 applied in 1 s, schema verification `READY`, `54/54`. Backward: 4 reverted in 1 s, head back to `1800000018000`, and **the content was restored exactly** — all 76 tables identical to the pre-migration state.

**Three of the four `down()` paths are destructive, and that is the important asymmetry.** `020000` and `021000` **refuse on their own** when real data would be lost. `019000` does not: it would drop `expert_analysis_executions` and four columns, destroying every Expert analysis's provenance and cost accounting. The rehearsal succeeded only because production has zero Expert analyses and zero settlements today. Schema rollback is **not** the rollback path; see §MF in the deployment sequence.

**No migration was run against production.**

*Evidence:* `verification/current/threshold-a-289/` → `SECTION-289-THRESHOLD-A.json` `DB_1_PRODUCTION_DATABASE_STATE`, `production-migrations-applied.txt`, `migration-forward-rehearsal.log`  
*Retest:* Re-read the production head before executing the sequence. This classification holds only while the pending list is these four.

**DB-3 — premise corrected at §289. Status moved BLOCKED → OPEN, because the thing it was blocked on turned out not to be true.**

Half the claim survives: **no migration in the candidate creates `outcomes`** — verified by grep across all 54 files, zero references. The half that mattered does not: **the table exists in production.** Thirteen columns, zero rows, one of the 76 tables in the §289 backup. Nothing in the migration set put it there, so it predates the set — most plausibly from a period when `TYPEORM_SYNCHRONIZE` was enabled.

**Do not add the migration.** The decision now is what to do about the table that is already there, and the consequence of it being there is `DB-4`.

*Evidence:* `verification/current/threshold-a-289/SECTION-289-THRESHOLD-A.json` → `DB_3_OUTCOMES_TABLE_FINDING`  
*Retest:* Tied to DB-4 and TI-2.

**DB-4 — new at §289. The containment argument does not hold in production.**

`corrective-actions.service.ts` carries its own safety argument for why the cross-tenant recurrence check cannot fire: *"The `Outcome` entity is declared and its module is wired, and NO MIGRATION CREATES THE TABLE. `synchronize` is false in production and the application refuses to start with it enabled there, so the table cannot appear by any other route."* Every clause is true and the conclusion is false, because the table was already there before the migration set existed.

So on production, `PATCH /actions/:id/status` with `closed` does **not** fail with `relation "outcomes" does not exist`. It succeeds, writes an outcome row, and runs `OutcomeService.checkRecurrence` — a count by category with **no organization or owner scope** — whose result sets `priorityCode` to `urgent`.

| threshold | material? | why |
|---|---|---|
| **A** | No | Nobody closes anything. No users. |
| **B** | Not as a leak | One owner tenant, so recurrence counts only the owner's own history. But the escalation fires silently, which is the undecided D-055 question. |
| **C** | **Yes** | One customer's action escalated on another customer's history. |

**A second consequence, and it is the one most likely to be missed.** All §286 and §287 action-closure evidence was gathered against databases **without** this table. Local closure evidence therefore does not represent production closure behaviour, in either direction.

*Evidence:* `backend/src/outcomes/outcome.service.ts` `checkRecurrence`; `backend/src/corrective-actions/corrective-actions.service.ts` `recordClosureIntelligence`  
*Remediation:* Scope the recurrence query to tenant/workspace and prove both directions (the TI-2 remediation), **or** decide the outcome loop is deliberately global and state that as a product position. Dropping the production table to restore the original containment is a production **write** and belongs to its own authorised section.  
*Retest:* A two-workspace regression proving same-tenant history CAN influence a recurrence and other-tenant history CANNOT.

**DB-4 — CLOSED at §291. The root cause was not the missing table.**

§286 reasoned that the branch could not run because no migration creates `outcomes`. §289 found the table present. §291 measured **why**: TypeORM `synchronize` created it before the switch was turned off, and it is one of **twenty-one** production tables outside the migration lineage — production has 77 tables, a clean replay of all 55 migrations produces 56.

So the defect was never a missing table. It was a query counting outcomes **across every tenant** that nothing was stopping.

**The repair is scope, not unreachability.** `outcomes` has no owner of its own, so the scope comes from the authoritative relationship that does exist — `outcomes.actionId → corrective_actions` — and applies the product's *own* workspace predicate, the one already used for every list, read and mutation. The scope is a **required argument**, so a recurrence figure cannot be computed without one. **No column was added** to a table outside the lineage, and no migration was created for it.

**Validated on a production-SHAPED database**, not the historical local state where the table is absent: the clean rebuild plus production's own `outcomes` DDL, verified column-for-column identical before any test ran.

| | |
|---|---|
| A history **may** influence A | **PASS** — `true`, escalated to `urgent`, which is the intended behaviour |
| A history **cannot** influence B | **PASS** — `false`, B's action stayed `medium` |
| B history **cannot** influence A | **PASS** — `false`, A's action stayed `medium` |
| Zero history | **PASS** — `false` |
| No identifier escapes | **PASS** |

**And the negative control, because a test that cannot fail proves nothing:** the OLD query, run verbatim against the same fixtures and evaluated for B, returns **1 matching row** and would have set recurrence `true`. The new one returns 0 for B and 1 for A — neither under- nor over-corrected.

Exercised in production after deployment: a real closure wrote a clean outcome with `recurrenceDetected=false`, the priority was unchanged, and no failure event was emitted.

*Evidence:* `verification/current/threshold-b-291/SECTION-291-THRESHOLD-B.json` → `DB_4`  
*Retest:* The two-workspace proof, including the negative control, on any change to the recurrence path.

**DB-5 — the same family, found while looking.** `findLearnedFix` selected approved `fix_feedback` across **every tenant** and put the resulting remediation titles at the **top** of the actions HazLenz proposes. That leaked **content**, not just influence. `fix_feedback` carries no owner and its `report_id` is not reliably a report — the outcome path writes an *action* id into it — so no correct scoping predicate exists over the current schema, and the only read path carries no workspace. The read is now **fail-closed**: no scope, no suggestions. Behaviour-preserving in production, where the table has zero rows and this has never once returned a fix.

**DB-5 — CLOSED at §292, and getting there required correcting the §291 repair itself.**

§291 reported *"now fail-closed"* while listing DB-5 as new and unrepaired. Reconciling that inconsistency found something worse than an inconsistent report.

§291 had added an **optional `scope` parameter** and returned early when it was absent — but **the query underneath was never scoped**. The guard held only because no caller happened to pass a scope, and it would have become **fail-open** the moment one did: the caller would believe it had asked for one workspace and would receive every workspace. *A guard that inverts when someone starts using it is worse than no guard, because it reads as protection.*

The parameter is removed. **There is now no way to ask for cross-tenant data, because there is nothing to ask with.**

Properly scoping it is not available: `fix_feedback` has no owner column, and its `report_id` is not reliably a report — `OutcomeService` writes a corrective *action* id into it — so no correct predicate exists over this schema, and §292 does not authorise the migration that would create one.

**Proven on production-shaped data**, `fix_feedback` populated with two approved rows per workspace under distinctive wording:

| | |
|---|---|
| the OLD query, replicated verbatim | returns **both** workspaces' confidential remediation wording — the defect was real |
| A wording cannot reach B | **PASS** |
| B wording cannot reach A | **PASS** |
| missing or ambiguous scope fails closed | **PASS — structurally.** Declared parameter count is 1, and forcing an extra argument in still returns `[]` |
| identifier or content leak | **PASS** — returns nothing at all |
| the real read path (actions HazLenz would propose) | **PASS** — contains neither workspace's wording |
| writes retained | 4 rows, untouched |

**Own-scope eligible feedback is not intended at v1 and is therefore not enabled** — stated rather than claimed as working, and carried as `DB-7`.

*Evidence:* `verification/current/threshold-b-292/SECTION-292-CONFIGURATION-CLOSURE.json` → `DB_5`

**DB-7 — the capability question, carried separately so DB-5 is unambiguous.** The loop still *writes* `fix_feedback`; nothing reads it. Making it work needs a workspace column populated at write time and a scope threaded from the HazLenz pipeline, which carries none — a migration plus a pipeline change, and a product decision about whether the loop ships at all. **DEFERRED, not a defect: there is no cross-tenant path left to close.**

**DB-6 — why the loop had never actually run.** `outcomes."originalRecommendation"` is `jsonb NOT NULL` and `action.originalSuggestion` is NULL for every **hand-created** action, so the insert violated the constraint — caught by the §286 guard, emitted as `action.closure_intelligence_failed`, and invisible to the customer, who saw a successful closure. Six of six failed this way under test. `{}` is now written for *"no original recommendation was recorded"*, which fabricates nothing.

> It would **not** have saved us: an action created from a HazLenz finding carries an `originalSuggestion`, so for those the cross-tenant query ran.

**§290 PRODUCT-OWNER HOLD (superseded by the repair above).** DB-4 was **real** and must not be described as unreachable. It does **not** block Threshold A, because Threshold A authorises *deployment*, not ordinary product use. It **does** block unrestricted Threshold B corrective-action operation and External Beta, and the register now records it as blocking both. Until it is repaired and validated in production shape, **corrective-action closure must not be exercised in production** except as a deliberately bounded synthetic release test — and §290 judged such a test unnecessary and did not perform one.

### BACKUP / RESTORE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **BR-1** | A backup of live production was taken and its restore verified by content checksum at §289. | P2 | — | Infrastructure | **CLOSED (§289)** |
| **BR-2** | Neon's platform backup retention window and point-in-time-recovery setting are unread. | P2 | — | Infrastructure | **CLOSED (§295)** |
| **BR-5** | Recovery beyond six hours depends on a manual dump nobody is scheduled to take. | P2 | C | Infrastructure | **CLOSED (§312A)** — database AND customer-evidence recovery are both operational on the daily schedule, with aggregate health that is HEALTHY only when both halves are. All fourteen closure requirements proven. |
| **BR-6** | Account anonymisation writes through the `User` entity, so it cannot clear the undeclared legacy `user.password` column. Latent: 8 live accounts hold a hash, 0 deleted accounts do. | P3 | — | Engineering | OPEN (§311) |
| **BR-7** | Account deletion does not touch `storage_objects` or R2 at all, so a customer who deletes their **account** leaves every evidence photo and report PDF live in production. Latent: 0 of the 26 deleted accounts owned an object. | P2 | — | Engineering | **CLOSED (§313A)** — deployed as `32653cac` and proven end to end **in production** on a fully synthetic account: real route, real R2, evidence erased, tombstoned, and resurrection refused. |
| **BR-8** | A `clientRequestId` replay can re-`put` to an **existing** object key with different bytes, leaving the database recording the first attempt's sha256 while R2 holds the second's. | P3 | — | Engineering | OPEN (§312) |
| **BR-3** | check:launch-pricing conflated the retired Expert pricing tier with Expert HazLenz the capability. | P2 | — | Engineering | **CLOSED (§290)** |
| **BR-4** | Four browser verification instruments remain stale against the §285–§288 successor. | P2 | — | Engineering | OPEN (§290) |

**BR-1 — CLOSED at §289. The register's evidence claim here was wrong.** It said `no restore evidence in verification/`. §269 had already taken a full logical backup of production and rehearsed a restore (76/76 tables, 7 049/7 049 rows, zero differences); it is recorded in `SECTION-269-LIVE-INFRASTRUCTURE.json`. §288 did not look.

§289 did it again rather than citing §269, and did it more strictly:

| | |
|---|---|
| Backup | 14.4 s, 7 810 853 bytes, 76 tables, 7 051 rows, sha256 `d4c2c351…` |
| Restore target | disposable **PostgreSQL 17.11** container — an exact production server-version match |
| Restore | 1 s, `pg_restore` exit 0, **0 errors** |
| Integrity | **per-table content checksum**, not row count: all 76 tables identical, digest `da17e9b755a540dac240c5f2bd8c7a7c` on both sides |

**Two operational facts that will otherwise be rediscovered painfully.** Production is PostgreSQL 17.11 and a PostgreSQL 16 client **refuses** it — use `/opt/homebrew/opt/libpq/bin/pg_dump` (18.3), and use the **direct** Neon endpoint, not the `-pooler` one. And pin the collation when comparing: Neon runs `lc_collate=C.UTF-8` while a stock `postgres:17` container runs `en_US.utf8`, so a checksum that orders rows by their text reports a difference on identical data. §289 hit that exactly once, on the `user` table, and it looked like corruption until the per-row hashes came back identical.

*Evidence:* `verification/current/threshold-a-289/backup-production-table-checksums.txt` and `backup-restored-table-checksums.txt`  
*Retest:* A fresh backup and a content-checksum verification immediately before each release — deployment sequence steps 3 and 4.

**BR-2 — CLOSED at §295, read from the console without a new credential.**

§292 and §293 both stopped here because there is no Neon API key and the control plane is not
exposed to SQL. §295 reached it a third way that needed no credential at all: **the owner is signed
in to the Neon console in this machine's browser**, and an already-authorised session is existing
authenticated access. The console was **read**. Nothing was changed — no slider moved, no Save
pressed, no snapshot created, no plan altered.

| | authoritative value, read 2026-09-14 |
|---|---|
| **Plan / tier** | **Free** |
| **History (restore) window** | **6 hours** — the Free maximum; the slider stops there and 30 days is offered only on upgrade |
| **Instant Restore / PITR** | **AVAILABLE** — *"Instantly restore this branch to any point in the past 6 hour history window"*, with a point-in-time picker |
| **Snapshots** | **none, and no schedule set** — schedules require an upgrade |

It was read from the **right** database: project `old-moon-90939488`, branch `br-misty-union-a4uke5p1`
named `production`, compute `ep-weathered-moon-a4egk93d` — the same endpoint as the host in the
production `DATABASE_URL`, so this is not a same-named neighbour.

**SUFFICIENCY DECISION — sufficient for Threshold B, not for Threshold C.** Six hours of instant
restore covers the failure mode that actually dominates at internal use: an operator mistake noticed
inside the working session. The operator-controlled logical backup path is proven three times end to
end with a content-checksum restore and is not window-limited. What six hours does **not** cover is
damage discovered the next day — and at Threshold B the only party who can cause or suffer that is
the owner, entering their own data, with nobody else relying on it. At Threshold C it is a different
answer, and that is `BR-5` rather than a footnote here.

**BR-5 — §311 built the whole thing and could not finish it, and the gap is one credential wide.**

§295 said closing this needs "a scheduled operator backup with a stated retention and a rehearsed
restore". §311 built exactly that, proved every part of it, and stopped at the one step that is not
engineering: **the durable destination does not exist, because creating it means making a credential
in the owner's Cloudflare account.**

**The provider position was re-read, not carried forward.** Neon console, 2026-09-17, from the
owner's already-authenticated session: **Free plan, 6-hour history window, Instant Restore available
across it, no snapshots and no schedule set.** Identical to §295. Nothing was changed — no slider
moved, no Save pressed, no snapshot created. It was the right database: project `old-moon-90939488`,
branch `br-misty-union-a4uke5p1`, compute `ep-weathered-moon-a4egk93d`, the same endpoint as the host
in the production `DATABASE_URL`. *One thing §311 deliberately did not settle: the console offers a
**Create** button for a manual snapshot on Free, and §311 did not press it, so whether a Free-plan
snapshot outlives the 6-hour window is **unverified in both directions** rather than assumed either way.*

**What was built, and what each part refuses to pretend.**

| script | the claim it makes |
|---|---|
| `backup-production-database.js` | dumps, uploads, then **reads the artifact back and re-hashes it**. An upload that returned 200 is not a backup; a run is successful only when the bytes come back matching |
| `verify-backup-restore.js` | restores into a disposable PostgreSQL and compares **every table by content**, not by row count |
| `verify-object-consistency.js` | reconciles `storage_objects` against R2 in **both** directions, because the two failures need different answers |
| `check-backup-freshness.js` | answers "did it actually run?" **from the destination**, on its own schedule, so a backup job that dies entirely cannot suppress the signal |

**The proof, taken fresh rather than cited.**

| | |
|---|---|
| Backup | 6.0 s, **7 898 796 bytes**, 78 tables, 7 294 rows, sha256 `368fa047…`, schema head `1800000026000` |
| Restore target | a **freshly created empty** PostgreSQL **17.11** container — not an overwrite of a previous restore |
| Restore | 0.5 s, `pg_restore` exit 0, **0 errors** |
| Integrity | **78/78** tables content-identical, aggregate digest `e093a62f81ac4d9e49011c43b5489f07` both sides |
| Canonical schema on the restore | **PASS**, 68 tables, 0 material differences |
| Application on the restore | booted in **1.1 s**, authenticated, and served sites, inspections, reports, revisions, corrective actions and billing state — **all 200, zero 5xx** |

**Every instrument was watched to fail.** Changing **one character in one row** of the restored copy
turned the comparison red and named the `user` table; restoring again turned it green. The
consistency checker was made to report a missing object and an orphan, and then cleared. All five
freshness verdicts were reached, including the two that matter most — `ARTIFACT_ABSENT` and
`ARTIFACT_ALTERED` — which exist because a `latest.json` written by the backup job is a *claim*, and
the check verifies it rather than believing it.

**Why it is not closed, stated as the closure rule requires.** BR-5 closes only on a durable path
covering database **and** material object evidence. Two things are missing and neither is code:

1. **No durable destination.** An isolated R2 bucket plus a token scoped to it — **no recurring
   cost** (one artifact is ~7.9 MB; the whole 14-daily/8-weekly retention fits inside R2's free
   allowance). It must not be `insite-production`: the application credential can read every key in
   its own bucket, so co-locating backups would escalate a leaked application key from five evidence
   objects to the entire database. The backup script **refuses to start** if the two buckets match.
2. **The object half is unassessed** — `ST-4`. R2 versioning, lifecycle and object-lock could not be
   read: the application credential is denied every bucket-administration call, and unlike Neon the
   owner is *not* signed in to Cloudflare here, so there was no session to read and §311 did not log
   in. Until that read happens, "can we recover a deleted evidence photo?" has no answer.

**Closing it on what exists today would be precisely the failure the rule names** — a manual dump
that restored once. *Still separated from BR-2 on purpose: BR-2 asked what the platform gives us and
that is answered; whether it is enough is a different question with a different answer per threshold.*

*Evidence:* `verification/current/br5-recovery-readiness-311/`; runbook at
`project-docs/operations/DISASTER-RECOVERY-RUNBOOK.md`
*Retest:* A scheduled run landing an artifact in the durable bucket, `check-backup-freshness.js`
reporting `FRESH` against it, and `ST-4` answered.

**BR-5 — CLOSED at §312A. Both halves are operational on the same daily schedule.**

The gap §312 left was one credential wide, and §312A closed it. `insite-evidence-recovery-reader`
is an R2 **Object Read only** token scoped to `insite-production` alone — and the form defaulted to
*"Apply to all buckets in this account"*, which would have violated the boundary outright, so the
scope was changed and the **selected chip** verified as `insite-production` alone before submitting.

**19 assertions on the new credential, 0 failed, every denial a genuine 403.** It reads all five
objects and every digest matches the authoritative expectation. It cannot write a new object, cannot
**overwrite an existing customer object**, cannot delete, cannot touch `insite-backups` in any way,
cannot administer either bucket, cannot list or create buckets. Both reciprocal invariants re-checked:
the backup credential is still refused on `insite-production`, and the **application credential is
still refused on `insite-backups`**.

**The activation ran through launchd, not interactively** — which is the distinction that matters,
because a script that works when you type it proves nothing about the schedule. `launchctl kickstart`,
`last exit code = 0`, agent loaded at 05:00:

| half | state |
|---|---|
| database | **HEALTHY** (FRESH) |
| evidence | **PROTECTED** — `LIVE_MATCHED = 5`, captured 0 (reconciled, no bytes duplicated) |
| **aggregate** | **HEALTHY** |

**A green light meaning "half your recovery posture is fine" is worse than no light**, so §312A added
an explicit aggregate: `HEALTHY` only when the database half is HEALTHY *and* the evidence half is
PROTECTED. `NOT_ACTIVATED` is **DEGRADED**, not a pass — which is precisely the state the scheduled
run had been exiting 0 in every night between §311A and §312A. `UNKNOWN` never becomes PASS, and
`FAILED` outranks `UNKNOWN`. Eight assertions on the truth table.

**A real defect, found by testing rather than reading.** The reconciler's scan-incomplete branch
exited 2 **without dispatching an alert** — and that branch covers source unavailable, destination
unavailable, unreadable ledger and bad credential. The single most important failure class, *"I cannot
see what I am supposed to be protecting"*, was the one that never reached anybody. A monitor that goes
quiet exactly when it loses sight of its subject is worse than no monitor. Fixed, and proven at HTTP
200.

**Everything §312 proved still holds on the activated code**: the 22-assertion suite re-run twice,
including the database-rollback gate. A *future* new production object was proven synthetically to go
`LIVE_UNBACKED` → `LIVE_MATCHED` → `PROTECTED` — **no sixth real customer object was created**, and
production remains at five objects / 166 708 bytes, unchanged.

**Residuals carried forward rather than buried.** The laptop scheduler cannot run while the machine is
off, and that would break the RPO *and* the monitor that would report it. Bucket Lock on
`insite-backups` was considered and **declined**: it would block erasure propagation and make a
customer's deletion impossible to honour — trading a privacy obligation for a durability gain. And a
content divergence at *equal byte length* on a never-captured object reads as `LIVE_UNBACKED` until
the first capture hashes it.

*Evidence:* `verification/current/evidence-recovery-312/SECTION-312A-ACTIVATION-AND-BR5-CLOSURE.json`
*Retest:* A scheduled run reporting `AGGREGATE HEALTHY`.

**ST-4 — CLOSED at §312A.** The platform finding is unchanged and still true: R2 has no object
versioning, and Cloudflare states that durability *"does not prevent intentional or accidental
deletion of data."* What closed is the gap that finding described. Evidence is now independently
recoverable, reconciled daily, with a rollback-proof erasure ledger — and `insite-production` itself
was never modified to achieve it: no lock, no lifecycle change, no versioning, no access logs.

**BR-5 / ST-4 — §312 BUILT THE EVIDENCE HALF AND PROVED IT. It runs on demand, not yet on a schedule.**

`ST-4` said a deleted or overwritten inspection photo is gone forever. §312 answers it with an
independent recovery copy in `insite-backups/evidence/`, and the design turns on one decision:
**recovery objects are content-addressed** — `evidence/objects/<sha256>`, the digest *is* the key.

That is what makes **overwrite** recoverable at all. A naive mirror (live key → same backup key) would
let generation B destroy generation A and leave overwrite exactly as unrecoverable as before. Content
addressing cannot do that: A and B are different keys by construction. It also dedupes, and it puts no
customer-derived text in any key.

**The erasure ledger is not in the database, and that is the whole point.** §312 set a hard gate:
after the database is rolled back to *before* a customer's deletion, the system must still refuse to
resurrect their evidence. `security_audit_events` cannot do that — it is a table in the database being
rolled back, so restoring to T0 destroys the T1 erasure record and the object becomes restorable
again. An erasure ledger that lives only inside the restorable state is not an erasure ledger. So the
tombstone is written into **recovery storage**, where a restore cannot reach it.

**The gate was run, not argued.** The database was rolled back — `deletedAt` cleared, status returned
to `ready`, the audit row **deleted** — until it believed the object was live and had never been
erased. The state stayed `MISSING_LIVE_ERASURE_AUTHORIZED` and the restore was **still refused**.

**Erasure is never inferred from absence.** A missing object is a candidate for *recovery*, not for
erasure; a tombstone needs a positive signal. And `report_artifact_retired` is explicitly **not**
erasure — it is the product superseding its own PDF, and treating it as erasure would delete recovery
copies during ordinary report regeneration. Proven: a retired report yields `RECOVERY_ONLY_EXPECTED`
and **no tombstone**.

**22 of 22 synthetic assertions, run twice with identical results**, on disposable containers: capture,
accidental delete, *a bad delete not propagating into the backup*, governed restore with digest
equality, both overwrite generations surviving independently, retirement-is-not-erasure, authorized
erasure with refusal and byte deletion, the rollback gate, digest mismatch, orphan detection, and
`UNKNOWN` exiting non-zero.

**The five production objects are protected.** `LIVE_UNBACKED 5` → `LIVE_MATCHED 5`, `PROTECTED`, all
five byte-identical by full download and re-hash on both sides — and the source is untouched at 5
objects / 166 708 bytes, re-verified `CONSISTENT` afterwards.

**Why BR-5 is still PARTIAL.** Ongoing protection needs a **read-only** R2 token on
`insite-production`, and §312 created no credential. A single token spanning both buckets could read
every customer's evidence *and* destroy its only backup, which is the combination this design exists
to prevent — so the source credential must be separate and read-only. The scheduled run already calls
the reconciler and currently logs `SKIPPED: … customer evidence is NOT being protected`, which is
reported differently from a failure. **Cost is not the obstacle: the whole steady state is 0.16 GiB
against a 10 GiB free allowance, $0.00.**

**Two new entries, both found by reading every path rather than trusting the earlier list.** `BR-7` —
account deletion never touches `storage_objects` or R2, so deleting an *account* leaves the evidence
live (latent: none of the 26 deleted accounts owned an object). `BR-8` — a `clientRequestId` replay
can re-`put` to an existing key, so the database can record one digest while R2 holds another. Neither
is repaired here: §312 is an evidence-recovery section and was forbidden from broadening.

**Data Access Logs remain OFF.** The bucket settings section has **no control at all** — no toggle, no
Enable — so it is gated on this plan. It would capture `DeleteObject` with the `accessKeyId` that did
it, which is genuinely useful forensics, but **logs are not recovery** and BR-5 closure must never rest
on them.

*Evidence:* `verification/current/evidence-recovery-312/`
*Retest:* One scheduled run reporting `PROTECTED` with `EVIDENCE_SOURCE_S3_*` configured.

**BR-5 — §311A ACTIVATED THE DATABASE HALF. It still does not close, and the reason is `ST-4`.**

Everything §311 built now runs against real infrastructure. **`insite-backups`** exists — private,
ENAM, no public URL, no custom domain — and **`insite-backups-operator`** is an R2 *Object Read &
Write* token scoped to that bucket alone. **$0.00 billable.**

**The isolation was proven in both directions rather than asserted.** The backup credential writes,
reads, lists and deletes in `insite-backups`, and is refused **403 AccessDenied** on every attempt to
touch `insite-production`, to administer either bucket, to delete the backup bucket, to list the
account's buckets, or to create one — 16 assertions, 0 failures. Reciprocally the application
credential keeps its 5-object `insite-production` scope and is refused on `insite-backups`. *Every
refusal was checked to be a genuine 403; an ambiguous failure was defined in advance as not a pass.*

**The first durable backup was produced BY THE SCHEDULER**, not by a hand-run command: 7 898 796
bytes, sha256 `a084be62…`, 12.0 s end to end, bound to production SHA `b8a6fd9c` and
`applicationSourceDigest` `87bb6eaa…`. The **remote copy** was then downloaded and its checksum
matched the freshness record and the metadata sidecar; that downloaded copy — not the local
pre-upload file, which the script had already deleted — restored into a fresh PostgreSQL 17.11 with
**78/78 tables content-identical**, after which the application booted in **1.1 s** and served
**14/14** individual-Beta routes with **zero 5xx**.

**Three defects surfaced by doing it for real, each fixed rather than worked around.**

| | |
|---|---|
| **Retention could empty the destination** | After an outage longer than the daily window every artifact is past the cutoff, and the pass would have deleted *all* of them — at the moment the contents mattered most. `ALWAYS_KEEP_NEWEST = 3` is now an absolute floor, and an incomplete listing suppresses deletion entirely. 9 assertions. |
| **launchd cannot read the checkout** | The first scheduled run exited **126, "Operation not permitted"**. macOS **TCC** denies a launchd agent access to `~/Desktop`: a diagnostic agent could `stat` the script but not read it, and could not list the directory at all. Permissions are irrelevant. The job is now installed to `~/.safety-insite/runner/`, with per-file hashes and a `--verify` drift check. Granting Full Disk Access to `/bin/bash` was rejected as a far worse trade. |
| **The env file silently lost a value** | The first run reported `BACKUP_SOURCE_DATABASE_URL is not set` while the value sat plainly in the file. It is **sourced by bash**, and a connection string contains `&`. Every value is now single-quoted and the template says why. |

**Monitoring distinguishes four states and `UNKNOWN` never passes.** HEALTHY / STALE / FAILED /
UNKNOWN, all proven against the real destination using a synthetic prefix that was deleted afterwards.
A bad credential or an unreachable endpoint reports **UNKNOWN**, not MISSING — "there is no backup"
and "I could not find out" are different facts, and only HEALTHY exits 0. **MO-1 carried two real
dispatches at HTTP 200**, one of them on the genuine env-quoting failure above.

**Why it is still PARTIAL.** BR-5 closes only on database **and** material object evidence. `ST-4`
established that a deleted or overwritten inspection photo **cannot be recovered at all**. Closing
BR-5 now would mean calling the product recoverable while a single mistaken `DELETE` permanently
destroys safety evidence.

*Evidence:* `verification/current/br5-recovery-readiness-311/12-SECTION-311A-ACTIVATION.json`
*Retest:* `check-backup-freshness.js` reporting HEALTHY on a schedule, and `ST-4` remediated.

**ST-4 — CLOSED AS AN INVESTIGATION at §311A, and the answer is the bad one.**

Read from the Cloudflare console. **Cloudflare R2 has no object versioning** — not disabled,
*absent*: the bucket settings offer fourteen sections and versioning is not among them, and Cloudflare's
own bucket-feature documentation does not list it. `insite-production` has **no bucket lock**, its only
lifecycle rule **aborts incomplete multipart uploads** (R2's default on every bucket, which never
deletes a completed object), and **Data Access Logs are disabled** — so there is not even a record of
what was deleted, when, or by which credential. The bucket *is* private: no custom domain, public
development URL disabled, no CORS.

Durability is **99.999999999%**, and Cloudflare states plainly that it **"does not prevent intentional
or accidental deletion of data."** Eleven nines describes the medium, not the operator.

**Bucket lock is not the fix, and that was measured in source rather than assumed.** The product
*hard-deletes* R2 objects in normal operation: upload rollback, `retireReportArtifact` on ordinary
report regeneration, and customer `tombstone`. A lock would break report regeneration **and** customer
erasure — putting the product in conflict with its own privacy commitments.

**So the entry stays OPEN as a Threshold-C blocker.** The investigation is finished; the remediation —
copying evidence objects into `insite-backups/evidence/` — is deliberately **unauthorized and unbuilt**,
and §311A was explicitly forbidden from silently broadening the backup system to do it.

*Evidence:* `verification/current/br5-recovery-readiness-311/10-ST4-R2-PROTECTION-READ.json`
*Retest:* An evidence-recovery mechanism, authorized and proven — or a recorded owner decision to
accept permanent loss of accidentally-deleted evidence during Beta.

**BR-7 — CLOSED at §313A. Deployed, and proven in production rather than only in a rig.**

`32653cac` is live (`dep-dam72itbedkc73aagjsg`), confirmed by **five stable reads** of the running
service rather than by the deploy job reporting success — the OPS-2 lesson applied. **Code only**: no
migration ran, schema stayed `1800000026000` 58/58 with 0 ahead, the environment stayed at **43
variables**, and the Expert flags and limits are byte-identical.

**The production proof is route (A): a real deletion, of real production storage, on a synthetic
account.** A throwaway `.invalid` account was created through the normal public signup — accepting
the mandatory §291 agreement at the server's required version, no control bypassed — given one
synthetic 1×1 PNG through the ordinary evidence route, and then deleted through the real
`DELETE /auth/me`, which returned **HTTP 200** (a deletion result, not a rate-limited 429).

| step | result |
|---|---|
| storage ownership | owner-scoped, `organizationId` NULL — in scope |
| live object in R2 | present, 69 bytes, digest equal to the database record |
| recovery protection | `LIVE_UNBACKED` → captured → `LIVE_MATCHED`, overall `PROTECTED` |
| erasure state machine | `account_deleted` (marked 1) → `account_evidence_erased` → `account_evidence_erasure_complete` (erased 1) |
| live evidence | **NotFound** in production R2 |
| `storage_objects` | `status='deleted'`, `deletedAt`/`deletedByUserId` set, `downloadName` scrubbed to `erased` |
| erasure authority | tombstone written in **recovery storage** |
| resurrection | **refused**, exit 1; next pass reports `MISSING_LIVE_ERASURE_AUTHORIZED` |
| recovery bytes | eligible for deletion after the governed **24-hour** grace |
| deleted account | old token 401, login 401 |

**Nothing real was touched, and that was measured rather than asserted.** The five production objects
are **byte-identical** — `verify-object-consistency --deep`: 5 verified by full sha256 download, 0
missing, 0 mismatches, 0 orphans, `CONSISTENT`. Org-scoped state is unchanged at **1 object, 7 sites,
6 inspections**, so the shared-ownership exclusion was proven by counting, not by reasoning about the
predicate. `erasure_pending` is 0.

**What it does not claim.** No destructive production failure was injected and no production R2 outage
was induced. Partial failure, R2 unavailability, database failure, retry, already-missing objects and
repeated deletion all rest on the §313 **disposable** proof, exactly as §313A directed. The rate
limiter stays at **5 / 60 s** and was never weakened for testing.

*One honest residue, named rather than tidied away* — in the §300 tradition: the synthetic account
leaves a soft-deleted anonymised user, one site and one inspection in production. That is the
product's own documented retention policy for compliance records. **The evidence itself is gone.**

*Evidence:* `verification/current/account-evidence-erasure-313/SECTION-313A-PRODUCTION-PROOF.json`
*Retest:* Aggregate recovery `HEALTHY` with `ERASURE_PENDING` at 0.

**BR-7 — REPAIRED AND PROVEN at §313. It does not close, because it is not deployed.**

Account deletion now governs the evidence that belonged to the account. The contract was re-derived
from source rather than from §312's description — controller, service, transaction, tables, storage
metadata, R2, audit, recovery ledger — and every user-owning column in the schema was inventoried and
classified: **29 columns across 24 tables**, with no `UNKNOWN` remaining.

**The ordering is the design.** R2 cannot join a PostgreSQL transaction, so the two systems are
reconciled by order rather than by pretending atomicity. The erasure **intent** is recorded inside the
account-deletion transaction — `status = 'erasure_pending'`, `deletedAt`, `deletedByUserId`,
`downloadName` scrubbed — and only after the commit are the bytes deleted and each row moved to
`deleted`. A crash anywhere leaves a precise, queryable work item instead of an object nobody knows
should have been erased. And **anonymisation never touches `ownerUserId`**, so the work list survives
the deletion that created it, which is what makes the retry deterministic.

**No migration was needed and none was created.** `status` is an unconstrained `varchar(24)` with no
check constraint, so the new state cost nothing; the intent rides on columns that already existed.

**Ownership is relational and narrow**: `ownerUserId = :userId AND organizationId IS NULL`. Never a
key, never a prefix, never a filename, and **never a digest** — BR-8 means a stored digest can be
stale, so a digest may not be an ownership authority. **Organisation-scoped evidence is never erased**,
and that is a live case rather than a hypothetical: production holds 1 organisation-scoped object
alongside 6 organisation-scoped inspections and 7 sites.

**32 of 32 assertions against the real application**, not a unit harness: a NestJS server on a
migration-built PostgreSQL 17.11 and a real object store, driven through the actual `DELETE /auth/me`.
Wrong-ownership isolation, zero/one/multiple objects, an already-missing object, repeated deletion,
and a **genuine partial failure** — the object store was stopped mid-flight — where the response
refused to claim completion, all three rows stayed `erasure_pending`, no completion audit was written,
and the deterministic retry then finished the job and recorded completion exactly once.

**The response tells the truth.** A complete erasure returns the existing message, preserving API
compatibility. An incomplete one says so and names the remaining count, at HTTP 200 because the
*account* deletion did succeed. Claiming "deleted successfully" while a customer's photos are still in
a bucket would be a false completion claim about a deletion right.

**The rollback gate holds, 4/4.** With the database rolled back to before the deletion — `deletedAt`
cleared, status back to `ready`, the audit row **deleted** — the state stayed
`MISSING_LIVE_ERASURE_AUTHORIZED` and restoration was still refused, because the §312 tombstone lives
in recovery storage where a database restore cannot reach it.

**Both controls were watched to fail.** Removing the ownership predicate broke five assertions,
including *"B can still read its own evidence"* — deleting user A destroyed user B's access. Removing
`account_evidence_erased` from the erasure-authoritative set broke the rollback gate, turning an erased
object back into a recovery candidate. Both files were then restored byte-identical and the suite
returned to 32/32. *One honest limit: in the second mutation the restore was still refused, but for an
unrelated reason — the decisive signal is the state, and the state failed.*

**Why it stays open.** Production runs `b8a6fd9c`, which predates all of this. A real account deletion
there would **still** leave evidence live. The defect is fixed in code and proven; it is not fixed in
production, and §313 does not authorise a deployment.

**BR-6 and BR-8 were not touched, and the reason is structural rather than restraint.** The erasure
works through `storage_objects` and never re-specifies the user-anonymisation field list, so it never
enters BR-6's territory; and it uses relational ownership rather than digest equality, so BR-8's stale
digests cannot mis-route it.

*Evidence:* `verification/current/account-evidence-erasure-313/`
*Retest:* The §313 suite at 32/32 plus the rollback gate, run against the deployed build.

**A stale instrument, classified rather than counted as a failure.** `test-cross-user-isolation.ts`
errors before its first assertion: it registers users without `acceptedAgreements`, which §291 made
mandatory. It is a **BR-4-family stale instrument that §313 did not break**, its own
disposable-database refusal was respected rather than bypassed, and it was not modified to pass.
Cross-user isolation for this change is covered by the §313 wrong-ownership gate, its mutation control,
and 334 passing §307 security assertions.

**BR-6 — new at §311, latent, and the numbers are why it is P3 rather than P1.**

Account deletion anonymises through the `User` entity, so it can only clear columns the entity
**declares**. The legacy `user.password` column — which §305 explicitly recorded as a tolerated
legacy column and excluded from schema enforcement — is not declared. Deleting an account therefore
does not clear it, and it would survive in production and in every backup for its retention.

**It has not happened.** Of the **8 of 67** accounts holding a non-null `user.password`, **0 are
deleted**; all **26** accounts deleted to date had it NULL. So no deletion request has actually been
left incomplete.

**It also cannot spread.** Migration `1793000000000` copied `password` into `passwordHash` and left
the source populated for the accounts that predated it; nothing has written the column since and the
entity does not declare it, so **the population is frozen at 8** and an external Beta customer's row
will always have it NULL. The values were checked rather than assumed: all 8 are 60-character `$2b$`
**bcrypt hashes, not plaintext**. Authentication reads `passwordHash` only, deletion randomises that
and sets `deletedAt`, and login rejects a deleted user — so this is **not** an authentication bypass.

What it is, is personal data that would survive an erasure request, and the Privacy Notice will make
a deletion claim that should be true for all 67 accounts rather than 59. **Remediation is one
statement** — `UPDATE "user" SET password = NULL` — run before any of those 8 is ever deleted, which
removes the possibility entirely. §311 did **not** run it: that is a production customer-data
mutation and §311 carries no such authorization.

*Evidence:* `verification/current/br5-recovery-readiness-311/SECTION-311-BR5-RECOVERY-READINESS.json`
→ `accountDeletionBackupConsequence.newFindingBR6`
*Retest:* `select count(*) from "user" where password is not null` returning 0, or the column dropped.

**BR-2 — the original §289 finding.** What the **platform** retains was unknown. Neon's control plane was unreachable from §269 and again from §289: there is no `NEON_*` credential in the repository or the environment. This is **not** a "we have no backups" finding — the operator-controlled path above is proven twice and does not depend on the console. It is a "we do not know what the platform would give us" finding, and it is one console read away.

*Evidence:* `SECTION-289-THRESHOLD-A.json` → `BR_1_BACKUP_AND_RESTORE.notEstablished`  
*Retest:* A recorded retention window and a recorded PITR window.

**BR-3 — CLOSED at §290. The gate was asking the wrong question, not asking it the wrong way.**

`check:launch-pricing` tested `/expert/i` against every file in `frontend-next/{app,components,lib}` and `backend/src/billing`. That assertion was authored when *Expert* had one meaning here: the retired **$11.99 pricing tier**. Since §261 it has a second, live meaning — **Expert HazLenz**, the server-authored analysis capability — and a word-blind regex cannot tell them apart. By §289 it was failing on fourteen files: the analysis panels, the entitlement memo, the Expert read route, the Expert snapshot-selection comments. Every one is the capability. **Not one offers a plan.**

**The tempting repair was rejected.** Allowlisting those fourteen files would have weakened the check in exactly the direction it exists to guard — a file-level entry permits *any* future Expert reference in that file — while still saying nothing about whether a purchasable Expert plan had returned.

**What changed is the scope, and the allowlist did not move.** The assertion now runs against the files that determine or present what a customer can **buy**. In that scope — 22 files — exactly four name Expert, and they are precisely the four already allowlisted. **Nothing was added to obtain a pass.**

**A narrowed gate that cannot fail is worse than a noisy one**, so two things guard against that. `PLAN_SURFACE_ANCHORS` asserts the scope still contains the pricing page, the plan data, the entitlement normalizers and the billing module, and fails loudly if pricing ever moves out of it. And a new assertion forbids `expert` as a plan-code literal on any plan surface outside the retired-tier normalizers.

**Proven by mutation rather than asserted.** Injecting a selectable Expert plan at `$11.99` into `PricingContent.tsx` failed **three independent assertions**. Reverted.

Prices are untouched — FREE $0 / PRO $24.99 / EXPERT NOT_A_V1_PLAN, identical before and after, and the three retired-price checks still run against the **full** customer-facing scope. **38 passed / 1 failed became 49 passed / 0 failed:** the gate is stronger, not quieter.

*Evidence:* `verification/current/threshold-a-290/SECTION-290-PREDEPLOYMENT-CLOSURES.json` → `BR_3`  
*Retest:* `check:launch-pricing` passing, **and** the mutation control still failing when an Expert plan is injected.

**BR-4 — the remainder, carried forward.** §290 closed the launch-pricing instrument because it gated the release. Four remain: `check:company-actions` and `check:action-workflow` wait for a heading the command-center no longer renders and need `VAL_EMAIL`/`VAL_PASSWORD`; `check:closure-inspection-workspace` expects ports 3100/4200; `check:phase5-inspection-report-release` calls a HazLenz route that answers 404; `validate:279-update-delivery` needs a seeded account. **None is a product defect** — each failed to run, or failed against its own stale expectation.

*Evidence:* `SECTION-289-THRESHOLD-A.json` → `BUILD_AND_GATES.instrumentStale`  
*Retest:* Each instrument running and reporting a result rather than an environment error.

### MONITORING / INCIDENT RESPONSE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **MO-1** | The alerting mechanism is built and proven. No destination is configured in production. | P1 | — | Infrastructure | **CLOSED (§297B)** |
| **MO-2** | The email channel reports itself configured without a deliverable sender, and the delivery result is discarded. | P2 | — | Engineering | **CLOSED (§294)** |

**MO-1 — §291 built the push half, and production still has nowhere to push to.**

§290 could only say failures were *retrievable*. §291 made them *deliverable*: every error-severity operational event is dispatched to a configured destination, and the log line is always written first, so alerting can fail without taking the evidence with it.

**The noise policy is the hard part, and it is encoded rather than intended.** §290 counted 15 × 401 and 1 × 402 during a completely successful release — alerting on those would bury the real signal and train the operator to ignore the channel.

| | |
|---|---|
| **Alerts** | every `error`-severity operational event |
| **Never alerts** | 401, 402, 404, ordinary 400 validation, expected 409 conflict |
| **Alerts on a pattern** | 5 × 5xx in 5 minutes raises **one** `service.error_rate_exceeded`, not one alert per failed request |
| **De-duplicates** | one alert per event kind per 15 minutes, with a hard ceiling of 12 per window so an alerting bug cannot become a mail bomb |

**Proven against a real failure, not a mock.** Pointing storage at an unwritable root and generating reports produced **six consecutive HTTP 500s** and **three alerts** — `storage.operation_failed` ×1, `report.generation_failed` ×1, and one `service.error_rate_exceeded` carrying path, method, status and count and no content. In the same run, 401, 404 and 400 produced **zero**.

**Why it is still open.** No destination is configured in production, and §291 forbids adding mutable production configuration casually — choosing an alerting channel has a cost and an account attached. So `/health/ready` now reports `alerting: NOT_CONFIGURED` with the reason and the full policy: **"nothing is watching" is a visible fact rather than a silent assumption.**

**§293 re-verified the absence and found the remediation understated.** The 41 production
environment variables were read again: `OPERATIONAL_ALERT_WEBHOOK_URL`, `OPERATIONAL_ALERT_EMAIL`
and `RESEND_API_KEY` are all still absent. Render still has **zero** webhooks and `slackEnabled:
false`; Vercel still has **zero** marketplace integrations and **zero** storage stores; no Resend
credential exists in the repository or in any standard client configuration location; and
`/health/ready` still reports `alerting: NOT_CONFIGURED`. Nothing had changed — but reading the
dispatch path rather than the configuration found that **the email channel needs a third variable
the remediation never named.** See `MO-2`.

**§294 repaired the channel but could not configure it.** The false-green path is gone: setting the
two variables the register used to name now leaves `/health/ready` reporting `NOT_CONFIGURED` **with
the missing sender named**, rather than reporting a configured channel that delivers nothing. `MO-1`
itself is untouched by that — no destination, credential or sender was supplied and none was
invented, and production configuration is unchanged.

**§296 chose the architecture, proved the branch, and still could not close it.** The owner selected
the **webhook** path — deliberately, and not for speed: the product is to be renamed before external
beta, and a verified sending domain is precisely the infrastructure that entrenches a name, whereas
a webhook URL is one environment variable to replace. §296 then found that **the webhook branch had
never been executed since §294 rewrote the dispatcher** — §291 and §292 proved it against a local
receiver *before* the rewrite, and §294's gate proved the new outcome machinery entirely on the
**email** branch; the string `webhook` appears nowhere in it. Closing `MO-1` on an unexercised code
path would have been the same kind of assumption `MO-2` was, so the branch was proven first:
`npm run test:296-webhook-channel` — **15/15**, 0 network, 0 provider calls.

**The destination remains an owner action, and §296 searched before saying so.** No Slack session and
no workspace — the sign-in page asks for a workspace URL. No Discord session. None of GitHub, Render,
Vercel, Neon or Stripe offers an inbound receiver that accepts an unauthenticated POST and surfaces it
where a human looks. **Smallest practical choices, in order:** a free Slack workspace with an Incoming
Webhook — free, standard, genuinely monitored through the mobile app, and replaceable when the product
is renamed; or `ntfy.sh` with a long random topic — no account and no terms at all, push straight to
the owner's phone, at the cost that a public server means anyone holding the topic can read the
alerts, which is bounded because the payload is **measured** to carry identifiers and no content; or a
Discord server webhook if the owner already lives there. **Not acceptable:** an ephemeral receiver
such as `webhook.site`, a receiver inside the Safety InSite stack itself — a monitoring destination
that dies with the thing it monitors is not a monitoring destination — or any address nobody reads.

*Remediation:* **one configuration step, and it is three values if the channel is email.** Either set `OPERATIONAL_ALERT_WEBHOOK_URL` (any receiver the owner controls — sufficient on its own), **or** — the architecture the owner selected at §293 — set all three of `OPERATIONAL_ALERT_EMAIL` (the monitored recipient), `RESEND_API_KEY` (the credential, placed directly in the production secret store, which also serves `EM-2`) **and** a verified sender: `PASSWORD_RESET_FROM_EMAIL`, shared with password reset, or `OPERATIONAL_ALERT_FROM_EMAIL` to override it. Since §294 the third is **enforced rather than documented** — without a structurally deliverable sender the channel reports `NOT_CONFIGURED` and sends nothing. Then induce one failure and confirm it **arrives in the mailbox**.

*Evidence:* `backend/src/observability/operational-events.ts; no APM dependency`  
*Retest:* One alert fired end to end from a deliberately induced error-severity event and **observed in the monitored mailbox** — actual receipt — with `/health/ready` reporting `alerting: CONFIGURED` and a `monitoring.alert_delivered` line carrying the provider acknowledgement. A `PROVIDER_REJECTED` line, or a `DEGRADED` readiness state, means the configuration is wrong **and says which part**.

**MO-2 — the email channel can say `configured` and deliver nothing. New at §293.**

Three limbs, all in `backend/src/observability/operational-alerts.ts`, all found by reading the
dispatch path rather than by running it — §293 made **zero** provider calls.

1. **`describeAlertConfiguration()` reports `configured: true, channel: 'email'` on two variables, and `dispatchOperationalAlert()` needs three.** The sender is `PASSWORD_RESET_FROM_EMAIL || 'alerts@safety-insite.invalid'`. With only the two variables set, `/health/ready` would flip from the honest `NOT_CONFIGURED` to a configured email channel that Resend rejects on every send. **That inverts the guarantee that made MO-1 defensible** — §291 made *"nothing is watching"* a **visible fact rather than a silent assumption**, and this makes `alerting: configured` a way to say *nothing is watching*. A false green is worse than the red it replaces.
2. **The delivery result is discarded.** Both branches are `void fetch(...).catch(() => undefined)` with no logging of a non-2xx response. **Not throwing is correct** — it is the same rule §287 applied to the audit write, and an alerting failure must not turn a succeeded request into an error. **Not recording is not correct.** An unverified domain, a revoked key or a suspended account produces no signal anywhere inside the product, which is why MO-1's retest above had to be strengthened to actual mailbox receipt: there is nothing server-side to corroborate it with.
3. **The email branch has never been executed.** The §291 and §292 alert proofs both ran against a local HTTP webhook receiver. `OPERATIONAL_ALERT` appears in exactly three files — the dispatcher, the health controller and this register — so no committed test or script sets it. **The channel the owner selected at §293 has zero executed coverage.**

*Why P2 and not a Threshold-B blocker.* Closing `MO-1` by proving **actual receipt** inherently
demonstrates that a deliverable sender is configured, so `MO-2` does not stand between the owner and
Threshold B. What it does is make `MO-1` **stay** closed. Registering it as a B blocker would inflate
a latent-configuration risk into an owner action, and there is no owner action here: every limb is
engineering work.

**CLOSED at §294, before any credential exists — which is the only order in which it could be closed
honestly.** A configured channel would have hidden this defect rather than revealed it, so the
repair had to come first. Three structural changes, and a gate that would fail without them.

| | |
|---|---|
| **One source of truth** | `resolveEmailChannel()` decides what the email channel requires, and **both** `describeAlertConfiguration()` and `dispatchOperationalAlert()` are written in terms of it. Neither restates a requirement, so they cannot drift. Proven over **all 24 configuration combinations**: *claims configured* and *transmits* are the same predicate in every one, and no combination transmitted an undeliverable sender. |
| **No fallback identity** | `alerts@safety-insite.invalid` is gone and **nothing replaced it**. Undeliverability is tested by reserved TLD — RFC 2606 `.invalid`/`.example`/`.test`, RFC 6761 `.localhost`/`.local` — rather than by naming one retired string, so the next such address is caught too. The same rule applies to the **recipient**. An absent or undeliverable sender leaves the channel `NOT_CONFIGURED` **with the sender named as the reason**. |
| **The outcome is evidence** | Dispatch is still launched and abandoned with respect to the customer's request, so an alert-provider failure still cannot become a customer-facing 500. What changed is that the promise resolves into evidence rather than into `undefined`: every attempt produces exactly one of `DELIVERY_ACCEPTED`, `PROVIDER_REJECTED`, `NETWORK_FAILURE` or `MALFORMED_RESPONSE`. |

**A 2xx that is not an acknowledgement is not an acceptance.** `MALFORMED_RESPONSE` exists because
treating an unreadable success as a success is MO-2 one layer down.

**The outcome events are deliberately below `error` severity.** `monitoring.alert_delivered` is
`info` and `monitoring.alert_delivery_failed` is `warning`, and that is load-bearing rather than
cosmetic: the dispatcher acts only on `error`, so it cannot alert about its own failure through the
channel that just failed.

**Sender semantics — option A, shared, with an optional override.** Monitoring uses
`PASSWORD_RESET_FROM_EMAIL` by default, so **one** verified domain serves both monitoring and
`EM-2`; `OPERATIONAL_ALERT_FROM_EMAIL` overrides it if operations mail should ever be
distinguishable from product mail. **No new required configuration** — the owner still supplies
three values — and the shared-sender decision stays reversible by configuration rather than by
another edit.

**`/health/ready` gained a third state and the service is ready in all three.** `NOT_CONFIGURED`,
`CONFIGURED`, and `DEGRADED` for a configured channel whose last attempt did not succeed. `status`
stays `ready` under `DEGRADED` as an explicit product decision: a third party's mail provider having
a bad ten minutes must not stop Safety InSite serving inspections.

**The gate: `npm run test:294-monitoring-email-channel` — 21/21**, against a controlled in-process
fake provider. **0 provider calls, 0 real email, 0 network, 0 database, 0 production contact.** It
covers all twelve required cases plus describe/dispatch parity, `MALFORMED_RESPONSE`, `DEGRADED`
recovery, and the sender override.

**Two things about the gate are worth stating, because both are places it could have lied.**

1. **It reads the real log stream, not the test sink.** `captureOperationalEventsForVerification`
   returns *before* `dispatchOperationalAlert`, so a harness built on it exercises emission and
   never exercises alerting at all — an earlier draft of this gate had two cases passing that way,
   with the provider never called. The gate intercepts `process.stdout/stderr.write` instead, so the
   full production path runs and the redaction case asserts against the **exact bytes** a log drain
   would receive.
2. **The noise-policy cases drive the real `ServerErrorAlertFilter`.** Restating its `>= 500`
   predicate in the test would have made the case agree with itself no matter what the filter did.
   Five real `HttpException`s at 401/402/404/400/409 produce a rate count of **0**, **0** events and
   **0** sends, and all five statuses reach the client unchanged; five real 500s through the **same
   filter instance** produce exactly **one** `service.error_rate_exceeded` and exactly **one** send.
   Dedupe and the ceiling are unchanged: two identical kinds plus one distinct kind → 2 sends;
   30 distinct kinds → 12, against the ceiling of 12.

**Anti-vacuity.** Case `A` replicates the pre-§294 logic verbatim and requires it to **fail**: with
the two variables the register used to name, the retired code reports `configured: true` and would
have sent from `alerts@safety-insite.invalid`. The false green reproduces on demand, and the repaired
path reports `NOT_CONFIGURED` on the same environment. If case `A` ever starts passing, the harness
has stopped measuring the thing it was written for.

**What §294 does NOT claim.** The proof is **local**. No Resend credential exists, no real email was
sent, production configuration is unchanged and production was not redeployed. `/health/ready`'s
three states are proven at `describeAlertConfiguration()`; the controller is a direct projection of
that state, verified by reading and by type-check rather than by live observation. **The live half
is `MO-1` and it is still open.**

*Remediation:* Require a sender before reporting the email channel configured, and return the same `NOT_CONFIGURED` shape naming the sender as the reason when it is absent — the honesty the dispatcher already applies to a missing credential. Record the provider response at warning severity without awaiting it and without letting it throw, so a rejection leaves a trace `ops:events` already reads. Add an email-branch case to the alert harness.  
*Evidence:* `backend/src/observability/operational-alerts.ts` lines 74–92 and 139–155  
*Retest:* With `OPERATIONAL_ALERT_EMAIL` and `RESEND_API_KEY` set and `PASSWORD_RESET_FROM_EMAIL` unset, `/health/ready` reports `NOT_CONFIGURED` naming the sender; a rejected provider response appears as a warning-severity line.

### THIRD-PARTY DEPENDENCIES / LICENSING

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **TP-1** | Dependency licensing surveyed across both packages: overwhelmingly MIT/ISC/Apache-2.0/BSD. No infecting copyleft in the application graph. | P3 | — | Engineering | OPEN |

**TP-1 — remediation / decision.** Record an attribution/notice file covering LGPL and CC-BY components before external distribution. No license here prevents commercial use.

*Evidence:* `license-checker summaries taken in §288`  
*Retest:* Re-run the license survey when dependencies change.

### CONFIGURATION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **CF-1** | NEXT_PUBLIC_DISABLE_AUTH is scoped to the Vercel PRODUCTION environment. Structurally inert there; registered for what it invites. | P2 | — | Engineering | OPEN (§289) |
| **CF-2** | Production withholds search-engine indexing until External Beta is authorised. Verified live. | P2 | — | Engineering | **CLOSED (§290)** |

**CF-1 — new at §289.** Every consumer either tests `NODE_ENV !== "production"` directly (`AppShell.tsx:3`, `lib/auth.ts:113`, `lib/billing.ts` `isLocalDevAuthBypass`) or delegates to `getLocalDevPlanCode()`, whose first line returns `"free"` under production. The variable therefore does nothing in a production build whatever its value, and entitlement is server-authoritative in any case. **Do not restate this as a live auth bypass.** The hazard is the next consumer who reads the variable without the guard, and the remediation — remove it from the Production scope — is behaviour-preserving precisely because it does nothing there.

**CF-2 — new at §290. A deliberate restriction, carried so it is lifted deliberately.** Threshold A puts the candidate on production infrastructure with no external users, and Vercel exempts a project's own production domain from the SSO that protects Preview — so without this the release would be crawlable before External Beta is authorised and before any of the Threshold-C claims, terms or clearance work exists. §290 added `X-Robots-Tag: noindex, nofollow` on every production route, defaulting to **withhold**, so a forgotten variable fails toward *not indexed*.

**Deliberately not `robots.txt`.** `Disallow: /` forbids the **crawl**, which means a crawler that learns the URL from an external link can still list it and will never fetch the page to discover a `noindex`. Blocking the crawl actively prevents the de-indexing instruction from being seen. The header travels on the response and covers non-HTML routes a `<meta>` tag cannot reach.

**This is an indexing policy, not an access control.** Authentication remains the access boundary; nothing here is load-bearing for confidentiality.

*Evidence:* `frontend-next/next.config.ts`; `verification/current/threshold-a-290/`  
*Remediation:* At External Beta authorisation, set `NEXT_PUBLIC_ALLOW_INDEXING=true` on the Vercel production environment and redeploy.  
*Retest:* A production `HEAD` showing the intended `X-Robots-Tag` value.

**Verified in production at §290:** `X-Robots-Tag: noindex, nofollow` on `/`, `/login`, `/pricing`, `/about` **and on `/manifest.webmanifest`** — confirming the non-HTML responses a `<meta>` tag cannot reach are covered. Closed as *implemented and verified*; lifting it is a Threshold-C action, not an outstanding defect.

### COPYRIGHT / CONTENT PROVENANCE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **CP-1** | Federal regulatory text (29 CFR OSHA, 30 CFR MSHA) is reproduced from eCFR sources. | P3 | — | Engineering | CLOSED |
| **CP-2** | Privately authored consensus standards (ANSI, ASTM, NFPA, ANSI/ASSP) are referenced by NAME AND TOPICAL SCOPE ONLY. No standard text is reproduced anywhere in the shipped product. | P2 | — | Mixed | OPEN |
| **CP-3** | Fonts, icons and images: the only icon dependency is lucide-react (ISC). No licensed font or stock imagery is bundled. | P3 | — | Engineering | CLOSED |

**CP-2 — remediation / decision.** This is the correct posture and must be PRESERVED as a hard rule. ASTM v. Public.Resource.Org (D.C. Cir. 2023) held that NON-COMMERCIAL posting of incorporated-by-reference standards is fair use; the standards remain copyrighted and that holding does not extend to a COMMERCIAL product redistributing the text. Incorporation by reference does not make private standard text freely redistributable here.

*Evidence:* `backend/src/hazlenz/supplemental-knowledge/supplemental-knowledge.registry.ts`  
*Retest:* A content gate asserting no private standard text is ever ingested into shipped content.

### TRADEMARK / PRODUCT NAME

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **TM-1** | SAFETY INSITE is treated as NOT FORMALLY CLEARED. No trademark search, clearance opinion or application is recorded. | P1 | C | Legal Counsel | OPEN |
| **TM-2** | HazLenz has had no conflict or provenance check. | P2 | — | Legal Counsel | OPEN |

**TM-1 — remediation / decision.** Commission a clearance search before external commercialization. A controlled, invitation-only beta under a name later found to conflict is a recoverable but real rebranding cost. Do not rename in this section.

*Evidence:* `no clearance record in the repository`  
*Retest:* A recorded clearance opinion.

**TM-2 — remediation / decision.** Include in the same clearance search as TM-1.

*Evidence:* `no clearance record`  
*Retest:* A recorded clearance opinion.

### REPORT / RECORD RETENTION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **RR-1** | If an operator relies on Safety InSite output as their statutory examination record, the product's retention and export properties become regulatorily significant. | P1 | C | Mixed | OPEN |
| **RR-2** | Report revision retention is implemented and proven: every issued revision is retained, byte-identical, downloadable, and marked superseded with a link to its successor. | P3 | — | Engineering | CLOSED |

**RR-1 — remediation / decision.** State plainly, in Terms and in product copy, that Safety InSite does not perform the statutory examination and does not itself satisfy any recordkeeping obligation, and that the operator remains responsible for making and retaining required records. Pair with ST-3 to give customers a dependable export.

*Evidence:* `ecfr.gov 30 CFR 56.18002; the product has no retention guarantee`  
*Retest:* A copy audit plus a demonstrated export of a full inspection record.

### EMAIL / NOTIFICATIONS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **EM-1** | The only outbound email is password reset, via Resend, and production refuses to run without PASSWORD_RESET_PROVIDER=resend. All other notifications are in-app database rows with no delivery. | P2 | — | Product | OPEN |
| **EM-2** | Production has no Resend credential, so password reset cannot deliver. | P1 | C | Infrastructure | OPEN (§291) |

**EM-2 — new at §291.** `PASSWORD_RESET_PROVIDER=resend` in production, but `RESEND_API_KEY` and `PASSWORD_RESET_FROM_EMAIL` are both **absent** from the 41 production environment variables. `checkProductionConfiguration()` is written to require all three and the service starts anyway, so that check is not enforced as a boot refusal. **A user who forgets their password cannot recover it** — and this also removes the most obvious destination for `MO-1`.

*Remediation:* configure both variables and exercise one reset end to end. Separately, decide whether the boot contract should **refuse** rather than merely report.

*Retest:* A password reset requested and received.

**EM-1 — remediation / decision.** Decide whether the beta needs any outbound notification beyond password reset. If not, ensure no surface implies a user will be emailed when work is assigned to them.

*Evidence:* `backend/src/auth/password-reset-delivery.service.ts; backend/src/notifications/notifications.service.ts`  
*Retest:* A copy audit of anything implying notification delivery.

### PRESERVATION / REBUILD

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **PV-1** | project-docs/preservation/v1-beta/ created at §289 with the build-and-restore guide and the release manifest. | P2 | — | Engineering | **CLOSED (§289)** |
| **PV-3** | Node is pinned to 24.14.1 and the running process reports it. | P2 | — | Engineering | **CLOSED (§292)** |
| **PV-2** | The historical digest 3c2c5974... is MISATTRIBUTED and must not be used as a current integrity assertion. | P3 | — | Engineering | CLOSED |

**PV-1 — CLOSED at §289.** `project-docs/preservation/v1-beta/` now holds `SAFETY-INSITE-V1-BETA-BUILD-AND-RESTORE-GUIDE.md` and `release-manifest.json`, with every field the entry named.

Two choices in the manifest are worth stating. **The source digest is defined, not merely asserted** — it is sha256 over the `LC_ALL=C`-sorted output of `git ls-tree -r <sha>`, and the command that recomputes it is in the manifest beside the value, so a future reader verifies rather than trusts. And it carries a **second** digest, `applicationSourceDigest`, over only the files that determine the built artifacts, because the full digest changes whenever documentation or evidence changes and would therefore be useless as a "did the product change?" test.

**The retired digest `3c2c5974…` is not used as an integrity assertion.** It appears once, labelled as retired, so a reader who encounters it elsewhere knows not to reuse it.

*Evidence:* `project-docs/preservation/v1-beta/release-manifest.json`  
*Retest:* A rebuild from the guide reproducing the recorded digests — but read PV-3 first.

**PV-3 — CLOSED at §292. The runtime was made observable before anything was pinned.**

Pinning a version nobody had measured would have been a guess dressed as a control, so the first change was to report `process.version` at request time, alongside whether the repository declares a pin at all — the difference between *"we run 24 and meant to"* and *"we run 24 and nobody chose it"*.

**It did not need a deploy to find out.** The Render build log said it outright:

```
==> Using Node.js version 24.14.1 (default)
```

`(default)` is itself the finding. And it means **both production halves already run Node 24** — Render `24.14.1` by default, Vercel `24.x` by project setting — so the pin makes an implicit default explicit rather than changing what executes.

| declaration | value | why |
|---|---|---|
| `backend/package.json` `engines.node` | `>=24.14.1 <25.0.0` | floors at the version production proves, forbids a surprise jump to 25, allows patches |
| `frontend-next/package.json` `engines.node` | `>=24.14.1 <25.0.0` | same contract for the other deployable |
| `backend/.node-version` | `24.14.1` | Render resolves *exactly*, rather than "newest 24.x at build time" |
| `.nvmrc` | **deliberately absent** | a third declaration of the same fact is how declarations start contradicting each other |

**Proven on that exact runtime**, installed locally for the purpose: clean `npm ci` in both packages with **zero `EBADENGINE` warnings**, backend `tsc`, frontend `tsc --noEmit`, `next build` 25/25, and all 15 gates.

**Verified in production after deploy.** The build log now reads `via /opt/render/project/src/backend/.node-version`, and the running process reports `nodeVersion: v24.14.1` with `nodeVersionPinned: >=24.14.1 <25.0.0`. The declared pin and the executed runtime are the same fact, checkable from production rather than assumed.

> **A correction this closes.** §289 reported the gates running on Node `v20.20.2`. They were in fact on `v26.7.0` — a `PATH` change moved `node` to the Homebrew build partway through the session, and nothing noticed. That drift, in the middle of a release programme, is precisely what PV-3 exists to prevent.

*Evidence:* `verification/current/threshold-b-292/SECTION-292-CONFIGURATION-CLOSURE.json` → `PV_3`; live `/health/version`

### RELEASE / ROLLBACK

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **RL-1** | The candidate-exact controlled-production deployment sequence and its rollback decision points were written at §289. | P2 | — | Infrastructure | **CLOSED (§289)** |
| **OPS-1** | Two operations documents named the wrong database platform. | P2 | — | Infrastructure | **CLOSED (§289)** |

**RL-1 — CLOSED at §289. The register's evidence claim here was also wrong.** It said `no runbook in project-docs/`. `DEPLOYMENT-RUNBOOK.md` (§268, 13 KB), `ROLLBACK-MODEL.md` (§268, 7 KB), `BACKUP-AND-RESTORE.md` and `MONITORING.md` all existed.

**What was actually missing is more interesting than what the entry described: the runbook was stale in three ways, and one of them would have stopped an operator cold.**

| runbook says | actually true | consequence |
|---|---|---|
| backlog is **three** migrations | **four** — `022000` shipped with §287 | step 5's pass condition met with a migration still pending |
| expected schema `1800000021000` | `1800000022000` | steps 5 and 8 accept a schema the build does not support |
| *"Render dashboard → the Postgres instance → Backups"* | **there is no Render Postgres instance** — production is Neon | the operator hunts for a thing that does not exist, at the one step that is the only way back from a bad migration |

§289 wrote `SECTION-289-CONTROLLED-PRODUCTION-DEPLOYMENT.md` as an **additive successor** rather than rewriting §268's record: preconditions with their §289 results, the sequence, and a rollback decision point for each of the seven named failure surfaces — **migration, backend, frontend, compatibility, storage, auth, report** — each stating not just what to do but which symptom is a *stop* rather than a triage. A cross-tenant read that succeeds and a lost report revision are stops; a failed report generation is not.

The rollback itself is no longer theoretical: §289 rehearsed all four `down()` paths against a copy of production and restored the content exactly. The document says plainly that this proves the mechanism **on a database with no Expert analyses and no settlements**, which is production today and will not be production after use.

**Not executed.** §289 was forbidden to execute it.

*Evidence:* `project-docs/operations/SECTION-289-CONTROLLED-PRODUCTION-DEPLOYMENT.md`  
*Retest:* Execution, which is what turns a procedure into a record.

**OPS-1 — opened and closed at §289.** The platform misstatement above is registered rather than quietly fixed, because it is the kind of error that reappears. `BACKUP-AND-RESTORE.md` and `ROLLBACK-MODEL.md` both now name Neon, record the §289 backup and content-checksum restore, state the PostgreSQL-17-or-newer client and direct-endpoint requirements, warn about the collation trap, and split `BACKUPS_AND_RETENTION` into the proven half and the unread half.

*Evidence:* `project-docs/operations/BACKUP-AND-RESTORE.md`; `project-docs/operations/ROLLBACK-MODEL.md`  
*Retest:* A read of both documents showing Neon and the four-migration backlog.

### PRODUCTION ACCEPTANCE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **PA-1** | A bounded internal production acceptance was executed against the deployed release. | P2 | — | Mixed | **CLOSED (§291)** |

**PA-1 — EXECUTED at §291 against the deployed release.** A synthetic owner account, no external user.

Consent-gated registration (refused without acceptance, accepted with it) → login → site → inspection → observation → user-authored finding → human review → finalization → completion readiness → `in_review` → `completed` → corrective-action create → update → **close** → calendar → report generation → checksum-matched download → revision identity → logout → fresh login → **every authoritative record still there**: the completed inspection with its observation, the closed action with its closure notes and completion stamp and its priority unchanged, the byte-identical report, and the consent evidence.

**Zero 5xx and zero operational failure events for the entire acceptance.** The closure in particular is the one that would previously have emitted `action.closure_intelligence_failed` — see `DB-6`.

*Evidence:* `verification/current/LOCAL-PRODUCT-BASELINE.json is explicitly the LOCAL baseline`  
*Retest:* The acceptance executed against the controlled production environment and recorded.

---

## Maintenance

The JSON and this Markdown are generated from one entry list; when an entry changes, both change
together. Any section that closes an entry must:

1. change its `status` and, where it applies, its `severity` and threshold flags;
2. record the retest it actually ran, not the retest it intended to run;
3. leave the entry in place rather than deleting it.

**Do not restate release status anywhere else.** `BETA-BLOCKERS.json`, `BETA-READINESS.md` and
`CURRENT-STATE.md` point here; they do not carry a competing verdict.

---

## §303 — `SE-5` closed as a route family, and a second defect found by refusing to over-apply the fix

§303 authorized one repair: `SE-5`, the malformed identifier that reached Postgres and came back as
an unhandled 500. It also forbade the obvious shortcut — *do not merely special-case
`GET /files/:id`* — and that prohibition is the reason this section found seven more routes.

### Measuring first changed the answer

Twenty-four GET routes carrying an identifier path parameter were driven with seven malformed shapes
chosen to be different kinds of wrong: a plain non-UUID, SQL metacharacters, a UUID one character
short, a UUID with a non-hex character, a 5000-character string, a percent-encoded traversal, and a
single space. One hundred and sixty-eight probes against a live authenticated application.

**Eight routes across four controllers returned 500** — storage, canonical reports, inspection and
sites. The route §297A probed was the one that happened to be probed, not the only one that was
broken.

### The repair is an input boundary, and that distinction is the whole point

`backend/src/common/uuid-route-param.ts` holds one stateless `ParseUUIDPipe` instance, wrapping the
framework's own UUID syntax rule rather than reimplementing it, with a product-owned message that
names no SQL, no driver and no schema, and does not echo the caller's input. Twenty-five route
parameters reference it. §303 forbade scattering regex copies across controllers, and the reason is
not tidiness: eight copies of a shape rule drift, and the first one to drift is the one nobody tests.

§303 equally forbade the other shortcut — converting `QueryFailedError` into 400 after the fact —
and that one deserves restating, because it is the difference between a fix and a cover-up. A
dropped table, an exhausted connection pool or a half-applied migration all arrive as
`QueryFailedError`. Reclassify them as client errors and the product stops reporting its own
outages. So the suite **renames `storage_objects` out from under a live query and requires 500**.
That single assertion is what keeps this repair honest.

### Four properties the fix could plausibly have broken, each asserted

* **It is not applied to every `:id`.** A parameter is not a UUID because of its name.
  `/auth/verify-invite/:token` carries an opaque varchar token; the `:version` route keeps its
  `ParseIntPipe` contract.
* **It does not move the security boundary.** A pipe runs *after* guards, so an unauthenticated
  malformed request is still **401**, never 400 — an anonymous caller cannot use the shape of the
  refusal to tell a real route from a fabricated one. A well-formed cross-tenant id is still 404.
* **404 contracts survive.** A valid identifier naming nothing accessible still returns 404. The
  repair changes *when a query runs*, never what an existing answer means.
* **Uppercase hexadecimal is accepted.** Rejecting it would be a new client-facing failure invented
  by the fix.

### The gate was watched to fail

`npm run test:303-malformed-identifier`, wired into `hazlenz:integration:inner` and therefore into
`hazlenz:precommit`. **13 failing assertions before the repair, 0 after** — both logs retained in
`verification/current/se5-malformed-identifier-303/`. A gate nobody has watched fail is not evidence.

### Proven live in production

Deployed on both halves and read back from the live product — `GET /health` reported
`9242d157…` **five consecutive times** before a single byte of proof data was created, and the
synthetic account's credentials were written to disk **before** the account existed. §297's rule and
§301's `OPS-2` lesson, both applied.

Through the real authenticated production HTTP product path:

* **All eight previously-affected routes return `400`**, with an identical product-owned body that
  carries no SQL, no driver name, no schema, no stack, and **no echo of the caller's input**.
* **Unauthenticated malformed is still `401`**, not 400 — the boundary did not move.
* **Valid-but-absent is still `404`** on every route, and an uppercase UUID is accepted.
* **A real site created through the product path round-trips at `200`.**
* **`monitoring.serverErrorsInWindow` read 0 before, 0 after and 0 at the end**, `lastDelivery` null
  throughout. No `service.error_rate_exceeded` alert, because **no server error was produced**. §303
  manufactured no new 500s to demonstrate that monitoring still works; it forbade exactly that.

Cleanup went through the product path too — `DELETE /sites/:id` 200, `DELETE /auth/me` 200, and the
same credentials then failed login with 401. **0 provider calls, 0 Expert executions, 0 direct
production DB writes, 0 charges, $0.**

**One honest limit.** The full `1' OR '1'='1` string never reached the application in production:
the **Cloudflare edge in front of Render** returned 403 with an HTML body. That is containment at a
different layer and it is not evidence about this repair. The application-level claim for SQL
metacharacters rests on `a'b`, `;drop` and `1--2`, which *do* reach the application and return the
product's 400 — and on the disposable-database suite, which drives the full string with no edge in
the path.

### A note on which commit the live proof ran against, stated precisely

The authenticated production proof matrix was executed against `9242d157`, §303's first deploy.
`e48a42f3` adds **one assertion to a test script** under `backend/scripts/`, which
`backend/tsconfig.json` (`include: ["src/**/*"]`) does not compile into `dist`. A digest over the
same file set **minus** `backend/scripts/` is `b74754f5…` at **both** commits — the running artifact
is identical. The redeploy happened anyway, so HEAD and production carry **one binding** rather than
a divergence that has to be explained every time someone reads the table.

### `SE-6` — the defect that the restraint found

The assertion that the invite route was *not* swept up by the repair is what exposed it:
`GET /auth/verify-invite/:token` returns **500 for every token**, valid or not.

Root cause was **proven rather than inferred**. A read-only probe on a disposable database read
`information_schema` and then issued the exact join TypeORM emits for `relations: ['organization']`:
`invitation."organizationId"` is `character varying`, `organization."id"` is `uuid`, and the join
fails with `operator does not exist: uuid = character varying`. The same lookup *without* the
relation join succeeded. The token column is not the problem; the `ManyToOne` join is.

It **pre-dates §303** — the same 500 appears in the pre-repair measurement log, captured before a
line of §303 code was written — and it **fails closed**: the exception propagates, so no invitation
is returned, no membership is granted, and nothing is mutated. Generic response body, no stack, no
SQL, no echo of the token. It is not an authentication bypass and not a disclosure, so it did not
meet the bar that would have required stopping for a product-owner decision.

What it *is*: **team invitation is a non-functional feature**, and it is an unauthenticated route
that produces cheap genuine 500s.

And it is materially different from `SE-5` in the way that decides the remedy. `SE-5` was an
input-boundary defect — well-formed input worked. `SE-6` is a persistence-schema defect: **no input
works at all**. Attaching a UUID pipe to `:token` would have been actively harmful, converting an
unconditional 500 into an unconditional 400 and hiding a wholly non-functional feature behind a
client error. The fix is a **migration**, and §303 authorized none. Registered, not repaired.

## §292 — two closed on evidence, two that are not mine to close

**Threshold B went from three to two, and it does not close.** Both remaining items need the product
owner to do something §292 was explicitly forbidden to do on their behalf.

### The DB-5 reconciliation found a defect in the §291 repair

The §291 report said *"now fail-closed"* while listing DB-5 as new and unrepaired. That
inconsistency was worth chasing, because underneath it was something worse.

§291 had given `findLearnedFix` an **optional `scope` parameter** and returned early when it was
absent — **but the query underneath was never scoped.** The guard held only because no caller
happened to pass a scope. It would have become **fail-open** the first time one did, and the caller
would have believed it was asking for a single workspace.

> A guard that inverts when someone starts using it is worse than no guard, because it reads as
> protection.

The parameter is gone. There is no way to ask for cross-tenant data because there is nothing to ask
with, and the proof now runs against `fix_feedback` actually populated from two workspaces rather
than against an empty table.

### PV-3 closed by measuring before pinning

The production runtime was not observable, so §292 made it observable first. The Render build log
then answered the question without a deploy — `Using Node.js version 24.14.1 (default)` — and
`(default)` was the finding: both halves already ran 24, and nothing in the repository had chosen
it. The pin makes an implicit default explicit.

It also caught a live drift: §289 reported the gates running on Node `v20.20.2`; they were on
`v26.7.0`. Nothing noticed, mid-release-programme. That is the gap PV-3 exists to close.

### What is left, and why it is not engineering

**MO-1 — `MONITORING_DESTINATION_OWNER_DECISION_REQUIRED`.** §292 searched properly before
declaring this. Project documentation names exactly one established destination — Render's own
service notification, which is a *platform* channel the application cannot publish into. There is no
Slack, PagerDuty, Sentry or webhook configuration anywhere; Render has zero webhooks and no log
stream; Vercel has zero integrations; and the Resend credential that would open the email channel
does not exist. **Inventing a destination was forbidden, and would have been the wrong thing to do**
— an alert address nobody reads is worse than an honest `NOT_CONFIGURED`.

The mechanism was re-proven on the §292 build against a real receiver: 401, 404, 400, a duplicate
registration and a 402 entitlement refusal produced **zero** alerts; one qualifying 500 produced
**two**, one per event kind, delivered in **4 ms**, carrying no content. Thresholds were not touched.

**BR-2 — one console read.** Neon's retention and PITR settings are control-plane and are not
exposed to SQL. No `neonctl`, no `NEON_*` variable, no Vercel integration, no API key. What *is* out
of doubt is the operator-controlled backup path, now proven three times including a fresh
content-checksum-verified restore immediately before the §291 migration.

### Threshold B does not close, and that is the honest answer

Internal production use remains **NOT YET AUTHORIZED**. Nothing in Threshold C changed, no legal
item was reclassified, and **external beta remains BLOCKED**.

---

## §293 — the owner-input gate held, and one defect was found behind it

**§293 closed nothing and changed no production configuration, because the five inputs its own
directive made preconditions were not supplied with it.** The directive required a monitored alert
recipient, an authorised Resend credential (or confirmation of one configured through the approved
secret path), and the Neon plan, history-retention window and PITR window. None arrived, and §293
independently confirmed that none of them exists in the environment either. Creating an account,
accepting provider terms, inventing a recipient or changing a Neon plan setting were all explicitly
forbidden, and each is the sort of act that is the owner's alone regardless.

**What §293 did instead of waiting.** Everything that did not depend on those inputs was completed.
Production identity was re-derived end to end rather than quoted: `applicationSourceDigest`
recomputed at both the deployed SHA and HEAD to `05b1a2d8…` — **equal**, which is why the one commit
since the deploy is documentation and does not change the product; the §274 successor identity
recomputed to `8c163b31…` over 22 elements with the delta still the authorised path rename alone and
**zero files written**; the running SHA read back from `/health/version` as `4749aba1…` on Node
`v24.14.1` against the `>=24.14.1 <25.0.0` pin; the Vercel production deployment confirmed at the
same SHA; schema `1800000023000` with **55 of 55** migrations applied. Every production control was
re-observed: Expert execution `false`, `x-robots-tag: noindex, nofollow` on production, Render
auto-deploy `no`, preview deployments answering `302` to Vercel SSO with `x-robots-tag: noindex`, and
production-only environment variables not exposed to preview. **0 production writes, 0 deployments, 0
migrations, 0 configuration changes, 0 provider calls, 0 Expert calls.**

### The instruction the owner was about to follow was wrong

The register told the owner that the email channel was `OPERATIONAL_ALERT_EMAIL` plus
`RESEND_API_KEY`. Reading the dispatcher rather than the register found a third variable, and
without it the channel **reports itself configured and delivers nothing** — `MO-2`, registered above.
Had §293 simply waited for the owner's inputs and then set the two variables it was told to set, the
outcome would have been `/health/ready` reporting `alerting: configured` over a channel Resend
rejects on every send: a **false green**, and a false green about monitoring is worse than the honest
`NOT_CONFIGURED` it would have replaced.

This is why the gate is worth having. A precondition that stops the section also stops the section
from executing a wrong instruction confidently.

---

## §294 — the monitoring email channel, repaired before it was ever configured

**`MO-2` is CLOSED. `MO-1`, `BR-2` and `EM-2` are untouched and Threshold B is still at two.**
§294 configured nothing, sent no mail, created no account, contacted no provider and did not change
or redeploy production. It repaired the defect §293 found, in the only order that could close it
honestly: **before a credential exists.** A configured channel would have concealed this defect
rather than revealed it — the whole failure mode is that it looks healthy.

The three structural repairs, the gate and the anti-vacuity case are recorded under `MO-2` in the
MONITORING section above. Two consequences belong here rather than there.

**The owner's configuration step is now self-checking.** Before §294, supplying two of the three
values produced a green light and silence. After it, supplying two produces `NOT_CONFIGURED` naming
the third, and supplying a wrong one produces `PROVIDER_REJECTED` with the provider's status in the
log store and `DEGRADED` on `/health/ready`. The owner no longer has to trust that the configuration
worked; the product tells them, and tells them which part did not.

**`EM-2` got closer without being touched.** Monitoring shares the password-reset sender by default,
so the single step the owner will perform — a credential plus one verified sender — serves both
paths. `isStructurallyDeliverableAddress` is exported for the password-reset sender to use at `EM-2`
closure rather than growing a second, differently-wrong copy of the same test. §294 deliberately did
not exercise password reset and does not claim anything about it.

### What §294 does not claim

The proof is **local and executable, not live.** No real email was sent and nothing observed a real
mailbox. The three readiness states are proven at `describeAlertConfiguration()`; the controller is
a direct projection of that state, verified by reading and by type-check rather than by observation
in production. **An emission layer that now records its own failures is still not monitoring** — the
live half is `MO-1`, it needs the owner's configuration, and it is still open.

The application source changed, so the release binding changed with it. **§295 deployed it.**

---

## §298 — Expert HazLenz is live, it worked, and it caught a defect in the engine beneath it

**One analysis. USD 0.190830. Two provider legs. Zero retries. No immediate-disable criterion.**

`EXPERT_EXECUTION_ENABLED` went from `false` to `true` through the Render per-key env-var route —
avoiding by construction the whole-list replacement hazard `§297A` recorded — and was made effective
by a **deployment pinned to the already-deployed commit** `87491ed9…`, so the configuration landed on
a byte-identical build. 42 variables before, 42 after, 0 added, 0 removed, exactly 3 changed, the
other 39 byte-identical. `applicationSourceDigest` `7fc9d47e…` unchanged; schema `1800000023000`
55/55; §274 identity `8c163b31…` re-verified 22/22 with 0 failures. **No source was modified to
activate Expert.**

**The flag was proved live without spending a cent.** An execution request carrying an invented
`requestVersion` returned **409** — a refusal raised inside the claim transaction, after the
operational gate and before any execution row is written. A flag still reading `false` would have
produced 503 `EXPERT_EXECUTION_DISABLED`. `expert_analysis_executions` was still empty afterwards.

**The ceiling was proved to fail closed three separate ways, and only one of them was live.** The
unit tier (`test:268-operational-controls`, 64/0, including *a limit of 1 permits the first and
refuses the second*); the **shipped** control surface executed against the exact values §298 intended
to set, before they were set; and then, after the one analysis, a live second request refused
**503 `WORKSPACE_ANALYSIS_CEILING_REACHED`, `providerCallsMade: 0`**, no new execution row. The
refusal path was never bought with a provider call. Worst-case bounded spend for one analysis is
**USD 0.273** against the USD 1.00 ceiling — computed from the frozen envelope, not estimated — so
no higher technical ceiling was needed and none was taken.

**The chain held end to end.** Server-allocated `requestVersion` 2 under the advisory lock; an
`ANALYSIS_RUNNING` row before any provider contact; `transportSubstituted: false`; admission `ADMIT`
with empty `conformanceViolations`, `declarationRefusals`, `postureRefusalCodes`,
`roleJustificationCodes` and `semanticInventions`; `candidateIdentity` **derived from the execution**
rather than declared; and three-way byte parity, sha256 `37b0a11a5dd5c560…`, across the route
response, the persisted `resultSnapshot` and a fresh-session read. Six cross-tenant probes from a
**second entitled workspace** — so the test was not answered by the entitlement gate — all returned
**404**, never 403.

**Human confirmation was not required, and that was a decision rather than a pass.** The posture
carried `UNRESOLVED_RESPONSE_OR_FOLLOW_UP`, which is branch B's trigger; branch B additionally
requires the posture to permit continued work, and the posture was `STOP`. Re-running the **shipped**
rule on the stored posture reproduced the server's answer, and two counterfactuals flipped it to
*required* — so the rule had a real opportunity to fire. The confirm/override **transition is
NOT_EXERCISED** and was not manufactured; forcing one would have needed a second Expert execution.
The boundary was proved instead: a settlement attempt with a *valid* decision value on the
`ANALYSIS_AVAILABLE` analysis was refused **409** by the eligibility rule.

**The semantic result was materially reasonable, and it is one observation.** Expert understood the
note, identified the fall exposure with three exact quotes, declined to raise the suspended-load and
powered-industrial-truck hazards the *deterministic* decomposition raised on an observation stating
the forklift was not lifting, preserved one genuine unresolved fact with both branches and a
decision for each, asked exactly one clarification bound to that same unknown, and returned a `STOP`
scoped to work near the opening with an explicit resume condition and the note that the unresolved
gate question *"does not delay the immediate stop"*. It cited **nothing** — `governedRecordCount` is
0, so it was permitted to cite nothing, and zero CFR-shaped strings appear anywhere in its output.
**No population-level accuracy claim follows from this.**

**And it caught `HZ-4`.** The deterministic engine had marked employee exposure `CONTRADICTED` and
suppressed 29 CFR 1910.28 at confidence 0.05, because its extractor read the word *"Nobody"* — in
*"Nobody working up there had a harness on"* — as an assertion that nobody was exposed. Expert
quoted the contradicting sentence back and recorded a HIGH-confidence `MAY_BE_INCOMPLETE`
disagreement. That is the advisory layer earning its place, on the first real analysis it ever ran
in production.

**Four other defects were opened and none was repaired**, because §298 authorises no source change:
`HZ-5` (the frontend cannot name `STOP` or `HOLD_PENDING_VERIFICATION` — the two restrictive
postures — and renders *"The operational posture could not be read"*, failing closed), `HZ-6` (the
execution record cannot say which model answered), `HZ-7` (an Expert-derived finalized finding
reaches the report unrated, which the report states honestly rather than fabricating), and `HZ-8`
(an idempotent replay is shadowed by the ceiling; it spends nothing).

**Housekeeping.** The retained §297 synthetic credential was rotated through the product's own reset
path, and its invalidation was **executed rather than argued**: a two-phase rotation proved that a
credential which *did* authenticate returns 401 afterwards. Both §298 pilot entitlement grants were
revoked and the revocation proved effective (the Expert read route now answers **402**), and both
§298 synthetic credentials were invalidated. **No account, finding, analysis or report was deleted** —
report immutability and the audit rows this closure rests on are product guarantees, and the
§290/§291/§297 precedent is to name synthetic residue rather than tidy it away.

**0 alerts raised. 0 unexpected 5xx. 0 migrations. 0 source changes. 1 deployment. 1 Expert call.**

*Evidence:* `verification/current/expert-activation-298/`

---

## §297B — five errors, one alert, one phone

**`MO-1` is CLOSED and THRESHOLD B is CLOSED.** A real production failure reached the product owner,
and the evidence is the arrival rather than the attempt.

### The window rule was applied rather than assumed

§297A's 500 was **not** counted. Production reported `serverErrorsInWindow: 0` — 15½ minutes had
passed against a 5-minute window — so the aged-out event was discarded and a fresh sequence of
exactly five ran against the same confirmed `SE-5` path.

### The progression is the policy stating itself

| request | status | `serverErrorsInWindow` | `lastDelivery` |
|---|---|---|---|
| 1 | 500 | 1 | `null` |
| 2 | 500 | 2 | `null` |
| 3 | 500 | 3 | `null` |
| 4 | 500 | 4 | `null` |
| **5** | **500** | **5** | **`DELIVERY_ACCEPTED`, 200, 23:59:49.031Z** |

**Four genuine production errors produced no alert at all.** The fifth crossed the threshold and
produced **exactly one** `service.error_rate_exceeded` — not five. That ratio is the entire purpose of
the aggregation, and it is now measured in production rather than argued for.

**272 ms** from the monitoring event to `DELIVERY_ACCEPTED`. The alert was then retrieved
independently at the destination and **confirmed rendered in the product owner's subscribed client**.

### Closed on receipt, never on submission

§294 built the distinction between a provider 2xx and an alert a human actually sees, and §297A/§297B
honoured it: the alert was verified **twice** — once by an independent subscriber-side poll and once
by seeing it in the client. Afterwards `/health/ready` still reports `alerting: CONFIGURED`,
`channel: webhook`, `lastDelivery: DELIVERY_ACCEPTED` — the configuration stayed truthful *through*
the dispatch, not merely before it.

### The payload was reconfirmed on the bytes that actually left

311 bytes: `source`, `event`, `severity`, `at`, `environment`, `release`, and five metadata fields —
`path: "/files/:id"`, `method`, `statusCode`, `countInWindow: 5`, `failureKind: "QueryFailedError"`.

**The malformed identifier that caused the errors appears nowhere in it.** `path` is the route
*pattern* and `failureKind` is the error *class name* rather than its message — which is where the
identifier would have been. That is the §268 redaction working on live production data, verified on
the transmitted bytes rather than on a local reproduction.

### `SE-5` was used as an instrument and is not thereby acceptable

Six genuine unhandled 500s have now been observed on that path. It was deliberately **not** repaired
while it was serving as the stimulus — repairing the stimulus while validating the layer downstream
of it would have destroyed the only confirmed qualifying condition the product has. Its severity and
classification are unchanged, and **`MO-1`'s closure does not depend on it staying broken**: any
error-severity condition reaches the same path.

---

## §297A — everything but the trigger

**`MO-1` does not close, and the reason is the product working rather than failing.** Every link in
the chain is now independently proven except the one that starts it.

### The receiver is real, and that was checked before anything touched the product

One hand-sent message, labelled `OUT-OF-BAND MONITORING RECEIVER VERIFICATION` and explicitly not a
product alert, was accepted by the destination, **retrieved independently through a subscriber poll**,
and **confirmed rendered in the owner's subscribed client**. Doing this first matters: it means a
silent client during the real test would be evidence of a product failure rather than of an
unsubscribed phone.

The destination is configured and production says so truthfully — `alerting: CONFIGURED`,
`channel: webhook`, `lastDelivery: null`. Exactly one environment variable was added; the full
variable list was diffed against a before-snapshot and **nothing was lost and no existing value
changed**.

### The probe found a real fault, and the real fault correctly did not alert

One authorised request — `GET /files/<malformed>`, referencing no real resource and crossing no
tenant boundary — returned **HTTP 500 in 313 ms**. The production log names the cause in the same
second: `QueryFailedError: invalid input syntax for type uuid`. That is `SE-5`, registered above.

**And it raised no alert, which is correct.** §291 encoded that a single 500 is a bug report and a
burst is an outage: `service.error_rate_exceeded` fires only at **5 server errors in 5 minutes**.
After the probe, production reported `serverErrorsInWindow: 1` against a threshold of `5`,
`lastDelivery: null`, and the destination still held only the out-of-band message.

> **So the induction the section authorised cannot complete under its own constraint**, and not
> because anything is broken. One probe was permitted; one 500 is by design not a qualifying
> monitoring condition. §297A did **not** repeat the probe, did **not** lower the threshold to make
> the test pass, and did **not** fall back to breaking storage — each was explicitly forbidden, and
> the first two would have been the same category of error as `MO-2`: adjusting the instrument until
> it reports what you wanted.

### What this bought, which is not nothing

The quiet path is now proven **live on a configured channel**: a genuine 500, a 404 and a 401
together produced **zero** alerts and left `lastDelivery` at `null`. Before §297A that was proven
locally and against an unconfigured channel. Configuration truthfulness, destination reachability,
subscriber receipt and human visibility are all evidenced in production. The webhook branch's
dispatch and outcome recording were proven at §296. **What remains is a trigger.**

The three ways to get one, and why each needs a decision, are in `MO-1`'s remediation above.

### One synthetic account was created and is named rather than tidied away

`section297a-probe@release-test.invalid`, free plan, one organization, no inspection and no data.
It exists because `GET /files/:id` is behind `JwtGuard` and free-tier gating puts every other
storage-touching route behind a 402. Named here so the product owner can remove it deliberately,
following the §290 precedent for synthetic residue.

---

## §296 — the architecture is chosen, the branch is proven, and the receiver does not exist

**Threshold B does NOT close. It stays at one, and the one is `MO-1`.** §296 made real progress and
none of it was the thing that closes the threshold, which is the honest summary rather than the
disappointing one.

### The webhook was chosen on a product argument, and it is worth recording

Not cost, not speed. **The product name is to be replaced before external beta.** A verified sending
domain is exactly the kind of infrastructure that entrenches a name — the domain, its DNS, its warmed
sending reputation and every address on it — whereas a webhook URL is one environment variable to
replace. So monitoring gets a webhook now, and transactional email waits for the brand decision.
**`EM-2` stays open on purpose and is not partially satisfied by any of this**: a webhook cannot
deliver a password-reset link, and saying otherwise would be the sort of adjacency this register
exists to prevent.

### The branch about to carry MO-1 had never been run

§291 and §292 proved the webhook branch against a local receiver — **before §294 rewrote the
dispatcher.** §294's gate then proved the new outcome machinery thoroughly and proved all of it on
the **email** branch: the string `webhook` does not appear anywhere in it. So at the moment the
architecture was selected, the webhook branch's `.then()` / `.catch()` outcome recording had never
been executed by anything. **Closing `MO-1` on an unexercised code path would have been the same kind
of assumption `MO-2` was**, so it was proven first.

`npm run test:296-webhook-channel` — **15/15**, 0 network, 0 provider calls, 0 production contact. A
separate file rather than four more cases in the §294 gate, because §294's record says 21/21 and is
cited above; editing it to say something else would rewrite a finished result to describe work it did
not do.

**Two real response shapes are asserted because real receivers return them.** Discord answers
`204 No Content`; Slack answers `200` with the plain-text body `ok`. Both are `DELIVERY_ACCEPTED`.
This is also where §296 recorded a **deliberate asymmetry**: the webhook branch does *not* apply the
email branch's `MALFORMED_RESPONSE` rule, because an arbitrary receiver has no acknowledgement
schema, so 2xx *is* the acknowledgement. A dispatcher that demanded a JSON acknowledgement would have
reported every successful Slack delivery as a failure.

**What is on the wire was measured, not assumed.** A payload carrying a planted observation text, a
planted `Authorization` header and a planted API key transmitted the identifiers and `[redacted]`,
and none of the three planted strings.

> **The gate caught one thing, and it was mine.** The first run failed `W3`: a 204 came back as
> `NETWORK_FAILURE`. The cause was the harness — `new Response('', {status: 204})` throws, because a
> 204 has a null body by definition — and the product had behaved correctly by classifying a thrown
> `fetch` as a transport failure. Fixing it turned a harness bug into the **most operationally
> relevant case in the file**, since 204 is what a real Discord webhook returns.

### What §296 could not do, having looked

The destination itself. §296 searched the already-authorised surface for a receiver the owner would
actually read and found none: **no Slack session and no workspace**, **no Discord session**, and no
inbound receiver on GitHub, Render, Vercel, Neon or Stripe that accepts an unauthenticated POST and
surfaces it where a human looks.

**Every shortcut here was forbidden and each would have produced the same defect.** Inventing a URL,
standing up an ephemeral receiver, or pointing the channel at an address nobody reads all yield
`alerting: CONFIGURED` over nothing watching — **which is `MO-2` with a different cause.** The
register has spent three sections making that state impossible to reach by accident; reaching it on
purpose to close a gate would have been worse.

The smallest practical choices are in `MO-1`'s remediation above and in the runbook.

---

## §295 — the hardened build is live, `BR-2` is closed, and `MO-1`'s boundary got bigger

**Threshold B goes from two to one.** The one that remains is `MO-1`, and §295 could not close it —
but it also could not leave it where it was, because the instruction attached to it was still
incomplete.

### The deployment came first, and that was the point

Production ran the pre-`MO-2` implementation until §295. Configuring a credential against it would
have configured the false-green path — the exact outcome §294 existed to prevent — so the hardened
build was deployed **before** any Resend work was attempted. Both halves now serve
`87491ed96f6f09de3de5800fc0a472e20d120413` at digest `7fc9d47e…`, confirmed from the backend's
`/health/version`, from the Vercel API, and from the production HTML, which names its own deployment
in its asset query strings. Schema is unchanged at `1800000023000`, 55/55. The §274 identity
recomputed unchanged with **0 files written**. Expert is still `false`, production is still
`noindex, nofollow`, Render auto-deploy is still `no` with trigger `off`, and the incidental preview
from the push answers **302 to Vercel SSO** with `noindex` and `X-Frame-Options: DENY`.

**The three-state contract is live.** `/health/ready` now serves `alerting: NOT_CONFIGURED` together
with the requirement list, `senderFallback: "NONE"` and the four dispatch outcomes — so the thing an
operator needs in order to configure the channel correctly is now readable **from the running
product** rather than from this register.

**The noise policy was re-proven against the new build in production.** A 404, two 401s and a 400
were induced; `serverErrorsInWindow` stayed at **0** and `lastDelivery` stayed `null`.

### `BR-2` closed without a new credential

Two sections stopped at "no Neon API key exists". §295 noticed the third route: **the owner is
signed in to the Neon console in this machine's browser.** An already-authorised session is existing
authenticated access, and reading a dashboard is a read. The values are in the BACKUP / RESTORE
section above. Nothing was changed.

### What §295 found that nobody had checked

`MO-1` has been recorded for three sections as *"name a destination and supply a credential."* For
the **email** architecture the owner chose, that is incomplete in a way that would have surfaced
only after the owner had done work:

> Resend sends only from a domain **verified in the account**. Verification is DNS records on a
> domain the owner **controls**. The Vercel account holds **zero** custom domains — the product is
> served from `safety-insite.vercel.app`, whose apex belongs to Vercel.

So the email path needs a **domain** before it needs a key, and no Resend session exists in the
owner's browser to suggest an account is waiting either. Meanwhile the **webhook** path needs no
domain, no DNS and no mail provider at all.

**§293 said not to prefer a webhook "merely to obtain a faster green gate if an approved Resend
configuration is now available."** One is not available. That instruction was written on the
assumption that Resend was a configuration step away; it is a domain away. The webhook is therefore
a legitimate architecture on the merits rather than a shortcut, and **which one to take is the
product owner's decision**, not something §295 should quietly settle by picking the cheaper path.

**`EM-2` is only reachable through the email path.** A webhook cannot deliver a password-reset link.
If reset is to work, the domain is required eventually — which is the real argument for doing it
now, and it is an argument rather than a decision.

### Prepared so the closure is not an improvisation

[`../operations/MO-1-ALERT-CONFIGURATION-RUNBOOK.md`](../operations/MO-1-ALERT-CONFIGURATION-RUNBOOK.md)
— seven ordered steps with pass conditions and a one-variable rollback, including the bounded way to
induce **one** qualifying production failure and the explicit rule that a provider 2xx is submission
and **only the mailbox closes `MO-1`**.

`backend/scripts/preflight-295-alert-configuration.ts` — checks candidate values against the
product's **own** resolver before anything reaches production, so a missing sender is a one-line
answer rather than a configure-restart-read cycle. It imports `describeAlertConfiguration` rather
than restating it; a preflight with its own copy of the rules would be a third copy of exactly what
`MO-2` was. **It checks structure, not ownership** — a well-formed address on a domain the owner does
not control passes the preflight and is rejected by Resend, which §294 now makes visible as
`PROVIDER_REJECTED` and `DEGRADED` instead of silence.

### What §295 did not do

No account created, no terms accepted, no domain purchased, no DNS touched, no mailbox invented, no
Neon setting changed, no charge incurred, no Expert call, no Threshold-C work. **0 provider calls, 0
real email, 0 migrations, 0 schema changes.** Expert stayed `false` throughout, deliberately: its
first production call is a separate bounded acceptance and is not §295's to spend.

---

## §291 — Threshold-B engineering, and the three things that are left

**Threshold B went from seven to three, and not one of the three is engineering.** `MO-1` needs a
destination set. `BR-2` needs one read of the Neon console. `PV-3` needs a Node version pinned.

### The finding that reframed DB-4

§288 recorded the cross-tenant recurrence path as contained because no migration creates `outcomes`.
§289 found the table present. §291 asked the question neither had: **how did it get there, and is it
alone?**

It is not. **Production has 77 tables; replaying all 55 migrations into an empty database produces
56.** Twenty-one tables exist in production that no migration creates, all derived from live
`@Entity` classes by TypeORM `synchronize` before that switch was turned off — `outcomes` matches its
entity exactly, defaults included, which is that mechanism's signature and nothing else's.

So the build-and-restore guide was implying something untrue, and
[`PRODUCTION-SCHEMA-PROVENANCE.md`](../preservation/v1-beta/PRODUCTION-SCHEMA-PROVENANCE.md) now
records the divergence, the method for re-measuring it, and the rule it exists to enforce:

> **"No migration creates it" does not mean "it does not exist."**

That inference is what produced DB-4, and the repair deliberately does **not** replace it with
another unreachability claim. The branch *is* reachable. It is safe because it is scoped.

### Two defects found while proving the first one

Neither was in scope when §291 began, and both were in the same closure handler.

**`DB-5`** — `findLearnedFix` selected approved feedback across every tenant and put other
customers' remediation wording at the *top* of the actions HazLenz proposes. That is a **content**
leak, not an influence leak. Now fail-closed.

**`DB-6`** — the closure intelligence loop had been failing on **every hand-created action** for a
`NOT NULL` violation, caught by a guard, logged, and invisible to the customer who saw a successful
close. Six of six failed under test. It would not have saved us: an action created from a HazLenz
finding carries the missing field, so for those the cross-tenant query ran.

### What was deliberately not done

`EXPERT_EXECUTION_ENABLED` stayed `false` — **0 provider calls, 0 Expert calls**. No production
configuration was changed and no secret altered: the env var count is still 41. No migration was
created for `outcomes`, because the repair needed **scope, not schema**, and §291 is explicit that a
migration must not be written merely to recreate a table that already exists.

`BUILD_FALLBACK` was left alone. `gitCommit` is platform-sourced and the release is bound by
`applicationSourceDigest`, which answers *"is this the same product"* rather than *"is this the same
commit someone wrote down"*. Setting a wall-clock variable would add mutable production
configuration to make a cosmetic field green.

### What closing SU-1 and SU-3 does and does not mean

They were **P0**, and they are closed — which is why the P0 count fell from six to four. They were
also explicitly **engineering** items, and §288 said so: *recording that someone accepted version X
at time T is independent of what the document says.*

**No legal item was reclassified because engineering capability now exists.** `SU-2`, `LG-1`, `LG-2`
and `LG-3` remain open, the agreement the product ships is `NOT_COUNSEL_REVIEWED` in a field rather
than a comment, and **external beta remains BLOCKED**.

---

## §290 — Threshold A closed, and what that does and does not mean

The validated candidate is deployed. `990a26b70dc625514bc081bfb7b2bb2ce4a19569` is live on both halves, running against a schema at
`1800000022000`, with Expert disabled and nobody using it.

### What was actually proven

Three things are worth separating from the general fact that the deployment succeeded.

**No data was lost, and that is a measurement rather than an assurance.** The four migrations were
applied and then the post-migration database was compared to the pre-migration backup *table by
table*: no table dropped, **no row count decreased anywhere**, 76 tables preserved plus one new one,
total rows 7 051 → 7 055 — which is exactly the four migration rows. Three tables changed content
and each has a named reason: `hazlenz_analyses` (four new columns and the documented backfill, which
set all eight rows to `client_supplied` / `ANALYSIS_AVAILABLE` / `false`, precisely what the
migration says it will do), `corrective_actions` (three new nullable columns), and `migrations`.

**The tenant boundary was proven rather than assumed.** A first attempt returned `404` for the
second account — but that account had never successfully authenticated, so the `404` proved nothing.
Re-run with account B genuinely authenticated (`/auth/me` `200`, its own list `200` with zero
inspections), B received `404` on **both a read and a write** of A's inspection while A received
`200` on the same resource.

**The entitlement boundary was proven in both directions.** As Free, report generation returned
`402 PAID_SUBSCRIPTION_REQUIRED`. With a bounded, clearly-labelled pilot grant it returned `201`.
After the grant was revoked it returned `402` again — **while the already-generated report remained
downloadable**, which is exactly what `EN-1` promises: Free cannot create, but keeps what it has.

### What was deliberately not done

`EXPERT_EXECUTION_ENABLED` stayed `false` throughout. **0 provider calls, 0 Expert calls.**
`expert_analysis_executions` is empty and no analysis row carries a producer other than
`client_supplied`.

**Corrective-action closure was not exercised**, in observance of the `DB-4` hold. `outcomes` remains
at zero rows and `corrective_actions` at one. The bounded synthetic test §290 was permitted to run
if essential was judged **not** essential, so it was not run.

No production configuration was changed, no secret was altered, and **no rollback was needed**.

### The honest limits of what "monitoring verified" means here

The Render log store captures structured `method` / `path` / `statusCode` / `level` labels and is
queryable: the smoke window returned 15 × `401`, 5 × `404`, 3 × `400`, 1 × `402` — correctly
labelled `POST /inspections/:id/reports -> 402`, level `warning` — 1 × `409`, and **0 × `500` with
0 at `level=error`**. Failures are therefore detectable and retrievable.

Nothing aggregates them and **nothing pages anyone**. Every operational event in the catalogue is a
failure event or an Expert event, so a clean release legitimately emits none — zero events is the
correct outcome, not missing instrumentation. `MO-1` stays **open**, because an emission layer you
can query is not monitoring.

### Synthetic residue, named rather than quietly left

Two accounts on a `@release-test.invalid` domain, one site, one inspection, one observation, one
finding, one report revision and its 7 317-byte PDF in R2. The entitlement grant was revoked.

The report was **not** deleted, and that is deliberate: report immutability is a product guarantee
(`RR-2`), so tidying up by deleting an issued revision would have meant violating the exact guarantee
this section verified — and deleting the R2 object alone would have left a `storage_objects` row
pointing at bytes that no longer exist, which is worse than a clearly-labelled synthetic record in a
system with no users. It is listed here so the product owner can remove it deliberately.

### Threshold A says the candidate is running. It says nothing about reliance.

**External Beta remains BLOCKED.** No legal item was reclassified, no Threshold-B or Threshold-C
item was closed because the deployment succeeded, and `DB-4` is recorded as blocking internal
operational use and external beta exactly as directed.

---

## §289 — what the live reads changed

§289 was the first section permitted to contact production. It did so read-only: **0 writes,
0 migrations, 0 deployments, 0 configuration changes, 0 provider calls.** The one thing it put into
production was a 97-byte synthetic object in a probe prefix of the R2 bucket, which it then deleted
and confirmed gone, with zero residue.

### Three of §288's evidence claims were wrong

This is the part worth reading carefully, because it is a fault in the register itself rather than
in the product.

| entry | §288 said | actually |
|---|---|---|
| **BR-1** | *"no restore evidence in verification/"* | §269 had taken a full backup of production and rehearsed a restore. It is in `SECTION-269-LIVE-INFRASTRUCTURE.json`. |
| **RL-1** | *"no runbook in project-docs/"* | `DEPLOYMENT-RUNBOOK.md`, `ROLLBACK-MODEL.md`, `BACKUP-AND-RESTORE.md` and `MONITORING.md` all existed, from §268–§270. |
| **ST-2** | *"has never been exercised end to end"* | §269 verified the live R2 bucket end to end — upload, authorised download with checksum, unsigned access refused, delete, no residue. |

All three were written as absences — *no evidence*, *no runbook*, *never exercised* — and an absence
is the one kind of claim that cannot be verified by reading the thing it describes. §289 closed the
first two on fresh evidence rather than by citing §269, and split the third into the half that was
already true and the half that still needs the deployment.

**The lesson the register should keep:** an entry that asserts something does not exist must name
where it looked. Two of these three would have been caught by `ls project-docs/operations/`.

### What §289 established that nobody knew

* **The production migration head**, which §288 called *"the largest single unknown"* and was
  forbidden to read. `1800000018000`, 50 applied, **zero drift**, four pending, **none destructive**.
* **That the four pending migrations actually apply**, forward and back, against a byte-identical
  copy of production — not by reading them, by running them.
* **That the `outcomes` table exists in production**, which defeats a containment argument written
  into the product's own source. See `DB-3` and `DB-4`.
* **That production is Neon, not Render Postgres**, which two operations documents had wrong at the
  step that is the only way back from a bad migration. See `OPS-1`.
* **That no backend secret reaches Vercel Preview** — four variables, all public-prefixed.
* **That both halves of production agree** on `de655d2f`.

### Threshold A is now a request, not a list

| | before §289 | after |
|---|---|---|
| Threshold A | 8 | **3** |
| Threshold B | 11 | **9** |
| Threshold C | 26 | **23** |
| Entries | 65 | **71** |

Closed: `DB-1`, `BR-1`, `IN-3`, `IN-4`, `PV-1`, `RL-1`, `OPS-1`.
Opened: `DB-4`, `BR-2`, `PV-3`, `CF-1`, `BR-3`, and `OPS-1` (opened and closed in the same section).

The three remaining Threshold-A entries — `ST-2`, `IN-1`, `IN-2` — share one property: **each is
closed by the deployment, and none of them is closed by more preparation.** There is no further
work that moves Threshold A. What moves it is authorization.

**And even then, external beta remains BLOCKED.** Threshold A means the candidate running in
production infrastructure with nobody using it. It says nothing about `LG-1`, `LG-2`, `LG-3` or
`SU-2`, and §289 reclassified no legal item.
