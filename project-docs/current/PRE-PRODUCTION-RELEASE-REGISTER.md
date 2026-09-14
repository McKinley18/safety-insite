# Safety InSite v1.0 — PRE-PRODUCTION RELEASE REGISTER

**This is the release authority.** It is the single document that answers *what, exactly, prevents
the current candidate from being released* — and it answers that question three separate times,
because there are three separate thresholds and they do not have the same blockers.

Established at **§288**, updated with live production evidence at **§289**, and **deployed at §290**. Machine-readable
equivalent, generated from the same entry list so the two cannot disagree:
[`../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json`](../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json).

| | |
|---|---|
| Candidate — **product source commit** | `c695376a30f72985897cc9da2631511c3212c7ef` — the §290 gate set ran against this, and it does not move |
| **Release binding** | `applicationSourceDigest` = `7c4b5e402c5b00f32a53ee3f38d707adff9aee88931da1c523d1c53b9c8aeee1` |
| Superseded binding | `2ce8a1d7…` at `94e29634` — §290's two bounded source closures (BR-3, indexing) changed the application source, so the digest changed with it |
| Release SHA | **PENDING until push.** The tip at push time — see below |
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
| Production contact in §289 | **READ-ONLY.** Render, Neon, Cloudflare R2 and Vercel authenticated and read; one synthetic non-customer object round-tripped and deleted in R2 with zero residue. **0 writes, 0 migrations, 0 deployments, 0 configuration changes.** |

> **Supersedes** `verification/current/BETA-BLOCKERS.json` as the release authority. That file is
> retained unchanged as the historical §263–§285 record and must not be read as current status.

---

## The three thresholds

These are deliberately not the same question, and an item that blocks one frequently does not block
the others.

| | Threshold | What it means | Blockers |
|---|---|---|---|
| **A** | **CONTROLLED PRODUCTION DEPLOYMENT** | The candidate running in a production environment. **No users, no real data.** | **3** (was 8) |
| **B** | **INTERNAL / OWNER PRODUCTION USE** | Owner-controlled accounts entering **real data**. | **10** — §290 moved `DB-4` onto it |
| **C** | **EXTERNAL CONTROLLED BETA** | **Named external inspectors** entering real workplace data. | **23** (was 26) |

> **§289 changed the shape of Threshold A, not just its size.** Five of its eight entries closed on
> evidence, and the three that remain — `ST-2`, `IN-1`, `IN-2` — **cannot be closed by any further
> preparation.** Each one is closed by the deployment itself. Threshold A is therefore no longer a
> list of work; it is a request for authorization.

The shape of the answer matters more than the counts. **Threshold A is an infrastructure problem
and nothing else** — no legal item blocks it, because nobody is using the system. **Threshold B
adds the things that matter once real data exists**: consent you can evidence, monitoring, and an
acceptance procedure. **Threshold C is where the legal and claims work lands**, and it is the only
threshold with P0 items.

---

## Severity, and what it is not

| | Meaning |
|---|---|
| **P0** | Release is unsafe or indefensible without it. Six items, all at Threshold C, all legal/consent. |
| **P1** | Must be closed before the threshold it blocks; a real gap with a known shape. |
| **P2** | Registered and scheduled. Not a blocker unless paired with something else. |
| **P3** | Recorded fact, closed item, or accepted position. Carried so it is not rediscovered. |

Severity is **not** a synonym for importance. Several P3 items are load-bearing product guarantees
(report immutability, tenant isolation, entitlement authority) that are P3 precisely because they are
*done and proven*.

## Counts

| | Total | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Entries | **73** | **6** | **12** | **34** | **21** |

| Status | Count |
|---|---|
| CLOSED | 26 |
| OPEN | 41 |
| BLOCKED (waiting on a decision or another item) | 4 |
| DEFERRED (deliberately not v1) | 2 |

**A threshold's blocker count is the number of entries still flagged for it.** Closing an entry
clears its threshold flags and records what it used to block in `wasBlockingThresholds`, so an
entry is never deleted and a closed item is never counted.

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

### Threshold A — controlled production deployment  (3 items, **0 legal, 0 P0**)

`IN-1`, `IN-2`, `ST-2`

**Closed at §289, on evidence:**

| | |
|---|---|
| **DB-1** | Production head read: `1800000018000`, 50 applied, **zero drift**. Exactly 4 pending, all additive, **none destructive** on the `up()` path. Rehearsed forward *and* backward against a byte-identical copy of production. No migration run against production. |
| **BR-1** | Fresh backup of live production (14.4 s, 7 810 853 bytes, 76 tables, 7 051 rows), restored into a PostgreSQL 17.11 disposable target in 1 s, verified by **per-table content checksum**: all 76 tables identical. |
| **IN-3** | Render configuration re-read live and dated. `autoDeploy=no`, `autoDeployTrigger=off`, 41 env vars with 0 secret values exposed, `EXPERT_EXECUTION_ENABLED=false`. |
| **PV-1** | `project-docs/preservation/v1-beta/` created, with the build-and-restore guide and a manifest carrying every required field. The retired digest is not used as an integrity assertion. |
| **RL-1** | The candidate-exact deployment sequence, with rollback decision points for all seven named failure surfaces. |
| **OPS-1** | *(opened and closed at §289)* Two operations documents named Render as the database platform. Production is Neon. Corrected. |

**Remaining — and none of it is preparation:**

1. **IN-1** — deploy the candidate. Production runs `de655d2f` on both halves; the candidate is 51
   commits ahead and is **committed locally and not pushed**.
2. **IN-2** — exercise the Vercel production deployment path deliberately, and read the result back.
3. **ST-2** — round-trip one **generated report** through production object storage. The bucket
   itself is verified; this half runs through the product route and therefore needs the deployment.

The §288 reading of Threshold A as "an infrastructure problem and nothing else" survives §289 intact.
What §288 got wrong was three of its evidence claims — see the §289 section at the end.

### Threshold B — internal / owner production use  (11 items)

All of A, plus `MO-1`, `PA-1`, `SU-1`, `SU-3`, and two opened at §289: **`BR-2`** (Neon's platform
retention window and PITR setting are unread — one console read) and **`PV-3`** (no Node version is
pinned and the Render runtime version cannot be read, so a rebuild reproduces the source but not
provably the artifact).

Real data now exists, so three things change. **SU-1 and SU-3** — acceptance must be transmitted,
persisted and evidenceable; this is engineering work that does **not** depend on counsel, because
recording *that* someone accepted *version X at time T* is independent of what the document says.
**MO-1** — someone must find out when it breaks. **PA-1** — a post-deploy acceptance defining what
must be true before a human uses it.

### Threshold C — external controlled beta  (26 items, including all six P0)

All of B, plus the legal, claims, privacy, review and clearance work:

`LG-1`, `LG-2`, `LG-3`, `SU-2` (P0) · `CM-1`, `DB-4`, `PR-1`, `RR-1`, `SR-1`, `TM-1` (P1) ·
`AC-1`, `CPF-2`, `CPF-3`, `SE-3`, `ST-3`, `TI-3` (P2)

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
| **CPF-2** | Batch 6/7 surfaces never page-reviewed: /profile, /upgrade, /unlock, /pricing, /about, /hazlenz, /legal, /forgot-password, /reset-password, 404 / error / loading states. | P2 | C | Mixed | OPEN |
| **CPF-3** | /settings, /inspections and /login carry ADJUSTMENTS_REQUIRED from earlier batches; the adjustments were never closed. | P2 | C | Engineering | OPEN |

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
| **HZ-2** | Expert HazLenz execution is DISABLED in production (EXPERT_EXECUTION_ENABLED=false) and live provider transport has never been exercised. | P2 | — | Product | DEFERRED |
| **HZ-3** | Report generation could not be reached by hazlenz:verify because object storage is unset in that environment. | P3 | — | Engineering | OPEN |

**HZ-2 — remediation / decision.** Product-owner decision to activate, then a hosted activation runbook with spend controls. Do not activate to satisfy the register.

*Evidence:* `backend/src/hazlenz/expert-hazlenz-product/expert-operational-controls.ts; hazlenz:verify reports UNVERIFIED_LIVE`  
*Retest:* A preregistered hosted activation with spend ceiling and refusal accounting.

**HZ-3 — unchanged at §289, and the remediation is now more precisely aimed.** `hazlenz:verify` still reports `ENVIRONMENTALLY_BLOCKED`. A §289 attempt to satisfy it by supplying `STORAGE_PROVIDER=local_test` and `STORAGE_LOCAL_ROOT` **did not take effect** — the harness does not pass them into the child process that needs them. So the fix is in `scripts/hazlenz/verify.ts`, not in the environment the operator sets.

*Evidence:* `backend hazlenz:verify output; verification/current/completion-report-285`  
*Retest:* hazlenz:verify reporting a result other than ENVIRONMENTALLY_BLOCKED.

### LEGAL / TERMS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **LG-1** | Controlled Beta Terms and Beta Privacy Notice are DRAFTED but carry 'LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED' and five unresolved contracting placeholders. | P0 | C | Legal Counsel | BLOCKED |
| **LG-2** | Liability allocation, caps and exclusions are DELIBERATELY UNDRAFTED in the Terms. | P0 | C | Legal Counsel | BLOCKED |
| **LG-3** | No /terms and no /privacy route exists. The drafted documents are unreachable from the running product. | P0 | C | Engineering | BLOCKED |

**LG-1 — remediation / decision.** Counsel review and approval, plus the product owner supplying the entity, address, contact, governing law and beta term. Engineering owes nothing here.

*Evidence:* `project-docs/legal/CONTROLLED-BETA-TERMS.md, BETA-PRIVACY-NOTICE.md, COUNSEL-REVIEW-PACKET.md`  
*Retest:* A recorded product-owner classification of counsel approval, or of INTERNAL BETA DRAFT ACCEPTED FOR CONTROLLED TEST.

**LG-2 — remediation / decision.** Counsel drafts liability allocation. A disclaimer does NOT eliminate liability; enforceability of any limitation depends on jurisdiction, conspicuousness, unconscionability and whether the loss is personal injury.

*Evidence:* `project-docs/legal/CONTROLLED-BETA-TERMS.md line 116-120`  
*Retest:* Counsel-approved clause present and linked from the accepted agreement.

**LG-3 — remediation / decision.** Publish the approved documents at stable, versioned routes once LG-1 clears. Engineering work is small and is blocked on counsel, not on capacity.

*Evidence:* `frontend-next/app/legal/page.tsx; no terms or privacy route under frontend-next/app`  
*Retest:* Both routes reachable, versioned, and linked from signup.

### SIGNUP / CONSENT

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **SU-1** | Agreement acceptance is evaluated CLIENT-SIDE ONLY and is never transmitted to the server. | P0 | BC | Engineering | OPEN |
| **SU-2** | The signup checkbox is a SAFETY-RESPONSIBILITY acknowledgement, not an acceptance of Terms, and links to nothing. | P0 | C | Mixed | OPEN |
| **SU-3** | No agreement version, acceptance timestamp, identity binding, re-acceptance mechanism, or means of later evidencing acceptance exists. | P0 | BC | Engineering | OPEN |

**SU-1 — remediation / decision.** Transmit and persist the acceptance: agreement id, version, timestamp, and the user id it binds to.

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
| **SE-3** | No production security review, dependency-vulnerability gate, or penetration test has been performed. | P2 | C | Security | OPEN |
| **SE-4** | Secrets handling: provider key, JWT secret, Stripe keys and database URL are environment-only; production validation refuses unsafe combinations. | P3 | — | Infrastructure | OPEN |

**SE-2 — remediation / decision.** Accept for controlled beta with a short token life, or move to httpOnly cookies with CSRF protection in v1.1. Record the decision.

*Evidence:* `frontend-next/lib/auth.ts:120-161`  
*Retest:* If changed: a full auth regression plus CSRF coverage.

**SE-3 — remediation / decision.** A dependency advisory scan in the release path, and a scoped review of the authenticated API surface before external users. Do not test against production.

*Evidence:* `no security gate in the repository's gate set`  
*Retest:* A clean advisory scan and a recorded review.

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
| **ST-2** | Production object storage is verified at the infrastructure level. No GENERATED REPORT has been round-tripped through it. | P1 | ABC | Infrastructure | OPEN — half closed at §289 |
| **ST-3** | Report and inspection-record retention policy is undefined. | P2 | C | Product | OPEN |

**ST-2 — §289 update.** The premise "never been exercised end to end" was already false: §269 verified the live R2 bucket, and §289 re-verified it freshly and non-destructively. Bucket reachable and authorised, no public policy, ACL `AccessDenied`, upload, authorised download with sha256 match, unsigned GET and LIST both refused (HTTP 400), delete, `NoSuchKey` after delete, **0 residue**, no customer data. Tenant isolation is database-enforced rather than path-enforced: the object key is `<category>/<date>/<uuid>` and carries no tenant identifier, `objectKey` is `select: false`, a digest mismatch on read is refused, and `FilesController` is entirely behind `JwtGuard` — so an object identifier alone confers no access.

**What remains is one thing, and it needs the deployment.** No generated report has ever gone through production storage via the product route. That is the register's own retest and it cannot be run from a preparation section.

*Evidence:* `verification/current/threshold-a-289/st2-r2-live-probe.json`  
*Retest:* One generated report round-tripped through production storage with a checksum match — deployment sequence step 14.

**ST-3 — remediation / decision.** State a retention and export position for the beta, especially interacting with RR-1.

*Evidence:* `no retention policy document`  
*Retest:* A written policy referenced from the Terms.

### OFFLINE / SYNCHRONIZATION

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **OF-1** | OFFLINE CAPTURE and OFFLINE PERSISTENCE work: field capture stores observations and photos in per-user IndexedDB behind a controlling service worker. | P3 | — | Engineering | CLOSED |
| **OF-2** | OFFLINE MUTATION OUTBOX exists for calendar TASKS only. Corrective-action create, edit and close are REQUIRES_NETWORK. | P2 | — | Product | OPEN |
| **OF-3** | OFFLINE CONFLICT RESOLUTION does not exist, and OFFLINE HAZLENZ INTELLIGENCE does not exist. | P3 | — | Product | DEFERRED |
| **OF-4** | D-053 residual: corrective-action EDIT and CLOSE carry no idempotency key. | P1 | — | Engineering | OPEN |

**OF-2 — remediation / decision.** Recommended v1 beta minimum is capture+persistence offline and honest refusal for everything else, which is what ships. A mutation outbox for actions is v1.1/v2.

*Evidence:* `verification/current/action-lifecycle-287/results/action-lifecycle-offline.json`  
*Retest:* Re-run the §287 offline probes on any change.

**OF-3 — remediation / decision.** Both are v2. Neither is required for a v1 controlled beta provided marketing never claims offline analysis.

*Evidence:* `no conflict-resolution module`  
*Retest:* None for v1. Guarded by CM-1.

**OF-4 — remediation / decision.** Extend the clientRequestId pattern to the two mutation routes, OR accept last-write-wins and state it. This is a PRECONDITION for any future offline outbox, not a live defect: no duplicate has been produced by either route.

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
| **AC-1** | Reviewed surfaces pass objective accessibility checks; unreviewed surfaces are unknown. | P2 | C | Engineering | OPEN |

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
| **IN-1** | The validated candidate has never been deployed. Production runs de655d2f (2026-08-29); the candidate branch is many unpushed commits ahead. | P1 | ABC | Infrastructure | OPEN |
| **IN-2** | The Vercel PRODUCTION deployment control has never been exercised. gitProviderOptions.createDeployments is disabled, yet a branch push still produced a Git-sourced preview. | P1 | ABC | Infrastructure | OPEN |
| **IN-3** | Render configuration, authentication and auto-deploy posture re-read live and dated at §289. | P2 | — | Infrastructure | **CLOSED (§289)** |
| **IN-4** | Vercel Preview deployments are SSO-protected, noindex and DENY-framed, and no backend secret is scoped to Preview. | P2 | — | Infrastructure | **CLOSED (§289)** |

**IN-1 — §289 update. The prerequisites it named are now met.** DB-1, PV-1 and RL-1 are closed, and ST-2's infrastructure half is closed. Production runs `de655d2f` on **both** halves — the Render backend and the Vercel production deployment agree, which is itself worth knowing. The candidate is more than 50 commits ahead and is committed locally and **not pushed**. What identifies it for release is not a SHA but `applicationSourceDigest` `2ce8a1d7…`, the digest at `94e2963427c46b4d69dcdd8664c4754c5fc72c37` — the commit the §289 build and gates ran against.

*Evidence:* `verification/current/threshold-a-289/SECTION-289-THRESHOLD-A.json` → `IN_1_AND_IN_2_DEPLOYMENT`; `/health/version` read live  
*Retest:* A production SHA read on both halves matching the pushed tip, and an `applicationSourceDigest` at that SHA equal to `2ce8a1d7…`.

**IN-2 — §289 update. The paradox is confirmed, not merely restated.** `gitProviderOptions.createDeployments` is `"disabled"`, and a Git-sourced **preview** deployment of the candidate branch at `0f36d497` nevertheless exists and is `READY`. Pushing this branch is therefore not a purely local act, and that is precisely why §289 did not push: a push is step 1 of the deployment sequence and belongs to the authorization, not to the preparation.

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
| **DB-4** | The cross-tenant recurrence path is REACHABLE in production, because the outcomes table exists there. | P1 | **BC** | Mixed | OPEN — §290 product-owner hold |

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

**§290 PRODUCT-OWNER HOLD.** DB-4 is **real** and must not be described as unreachable. It does **not** block Threshold A, because Threshold A authorises *deployment*, not ordinary product use. It **does** block unrestricted Threshold B corrective-action operation and External Beta, and the register now records it as blocking both. Until it is repaired and validated in production shape, **corrective-action closure must not be exercised in production** except as a deliberately bounded synthetic release test — and §290 judged such a test unnecessary and did not perform one.

### BACKUP / RESTORE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **BR-1** | A backup of live production was taken and its restore verified by content checksum at §289. | P2 | — | Infrastructure | **CLOSED (§289)** |
| **BR-2** | Neon's platform backup retention window and point-in-time-recovery setting are unread. | P2 | B | Infrastructure | OPEN (§289) |
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

**BR-2 — new at §289.** What the **platform** retains is still unknown. Neon's control plane was unreachable from §269 and again from §289: there is no `NEON_*` credential in the repository or the environment. This is **not** a "we have no backups" finding — the operator-controlled path above is proven twice and does not depend on the console. It is a "we do not know what the platform would give us" finding, and it is one console read away.

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
| **MO-1** | Structured operational events are emitted to stdout/stderr with redaction, but there is no aggregation, alerting, error tracking or incident runbook. | P1 | BC | Infrastructure | OPEN |

**MO-1 — remediation / decision.** Aggregate the operational event stream, alert on the error-severity events that already exist (report.generation_failed, action.audit_write_failed, schema.readiness_failed, migration.failed), and write a minimal incident runbook with an owner and a contact path.

*Evidence:* `backend/src/observability/operational-events.ts; no APM dependency`  
*Retest:* One alert fired end to end from a deliberately induced error-severity event.

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
| **CF-2** | Production withholds search-engine indexing until External Beta is authorised. | P2 | — | Engineering | OPEN (§290) |

**CF-1 — new at §289.** Every consumer either tests `NODE_ENV !== "production"` directly (`AppShell.tsx:3`, `lib/auth.ts:113`, `lib/billing.ts` `isLocalDevAuthBypass`) or delegates to `getLocalDevPlanCode()`, whose first line returns `"free"` under production. The variable therefore does nothing in a production build whatever its value, and entitlement is server-authoritative in any case. **Do not restate this as a live auth bypass.** The hazard is the next consumer who reads the variable without the guard, and the remediation — remove it from the Production scope — is behaviour-preserving precisely because it does nothing there.

**CF-2 — new at §290. A deliberate restriction, carried so it is lifted deliberately.** Threshold A puts the candidate on production infrastructure with no external users, and Vercel exempts a project's own production domain from the SSO that protects Preview — so without this the release would be crawlable before External Beta is authorised and before any of the Threshold-C claims, terms or clearance work exists. §290 added `X-Robots-Tag: noindex, nofollow` on every production route, defaulting to **withhold**, so a forgotten variable fails toward *not indexed*.

**Deliberately not `robots.txt`.** `Disallow: /` forbids the **crawl**, which means a crawler that learns the URL from an external link can still list it and will never fetch the page to discover a `noindex`. Blocking the crawl actively prevents the de-indexing instruction from being seen. The header travels on the response and covers non-HTML routes a `<meta>` tag cannot reach.

**This is an indexing policy, not an access control.** Authentication remains the access boundary; nothing here is load-bearing for confidentiality.

*Evidence:* `frontend-next/next.config.ts`; `verification/current/threshold-a-290/`  
*Remediation:* At External Beta authorisation, set `NEXT_PUBLIC_ALLOW_INDEXING=true` on the Vercel production environment and redeploy.  
*Retest:* A production `HEAD` showing the intended `X-Robots-Tag` value.

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

**EM-1 — remediation / decision.** Decide whether the beta needs any outbound notification beyond password reset. If not, ensure no surface implies a user will be emailed when work is assigned to them.

*Evidence:* `backend/src/auth/password-reset-delivery.service.ts; backend/src/notifications/notifications.service.ts`  
*Retest:* A copy audit of anything implying notification delivery.

### PRESERVATION / REBUILD

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **PV-1** | project-docs/preservation/v1-beta/ created at §289 with the build-and-restore guide and the release manifest. | P2 | — | Engineering | **CLOSED (§289)** |
| **PV-3** | No Node version is pinned, and the Render runtime Node version cannot be read. | P2 | B | Engineering | OPEN (§289) |
| **PV-2** | The historical digest 3c2c5974... is MISATTRIBUTED and must not be used as a current integrity assertion. | P3 | — | Engineering | CLOSED |

**PV-1 — CLOSED at §289.** `project-docs/preservation/v1-beta/` now holds `SAFETY-INSITE-V1-BETA-BUILD-AND-RESTORE-GUIDE.md` and `release-manifest.json`, with every field the entry named.

Two choices in the manifest are worth stating. **The source digest is defined, not merely asserted** — it is sha256 over the `LC_ALL=C`-sorted output of `git ls-tree -r <sha>`, and the command that recomputes it is in the manifest beside the value, so a future reader verifies rather than trusts. And it carries a **second** digest, `applicationSourceDigest`, over only the files that determine the built artifacts, because the full digest changes whenever documentation or evidence changes and would therefore be useless as a "did the product change?" test.

**The retired digest `3c2c5974…` is not used as an integrity assertion.** It appears once, labelled as retired, so a reader who encounters it elsewhere knows not to reuse it.

*Evidence:* `project-docs/preservation/v1-beta/release-manifest.json`  
*Retest:* A rebuild from the guide reproducing the recorded digests — but read PV-3 first.

**PV-3 — new at §289.** Neither package declares `engines.node`; there is no `.nvmrc` and no `.node-version`. Vercel is set to **24.x**, the §289 build host was **v20.20.2**, and Render exposes its runtime version through neither its API nor the service's startup output. So the preservation guide can promise that the **source** reproduces exactly and cannot promise that the **artifact** does. That is a real limitation of a preservation package and it is stated in the manifest rather than glossed.

*Evidence:* `project-docs/preservation/v1-beta/release-manifest.json` → `nodeVersion`  
*Retest:* A recorded Render runtime Node version matching a pin in the repository.

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
| **PA-1** | No production acceptance procedure is defined: after deploying, nothing states what must be true before a human is allowed to use the system. | P1 | BC | Mixed | OPEN |

**PA-1 — remediation / decision.** Define a short post-deploy acceptance: health and readiness, version/SHA match, one real inspection to a generated report, storage round-trip, entitlement boundary, and the operational event stream visible.

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
