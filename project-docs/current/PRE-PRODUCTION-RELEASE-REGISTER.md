# Safety InSite v1.0 — PRE-PRODUCTION RELEASE REGISTER

**This is the release authority.** It is the single document that answers *what, exactly, prevents
the current candidate from being released* — and it answers that question three separate times,
because there are three separate thresholds and they do not have the same blockers.

Established at **§288**, live evidence **§289**, **deployed §290**, Threshold-B engineering **§291**, configuration closure **§292**, owner-input gate **§293**, monitoring-channel repair **§294**, owner-configuration handoff **§295**.
**Threshold A is closed. Threshold B stands at ONE owner action: a monitoring destination.** Machine-readable
equivalent, generated from the same entry list so the two cannot disagree:
[`../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json`](../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json).

| | |
|---|---|
| Candidate — **product source commit** | the §294 repair commit on `beta/expert-hazlenz-validated-candidate-2026-09-12` — gates run on Node v24.14.1 |
| **Release binding** | `applicationSourceDigest` = `7fc9d47ec1f8bc40bef8149a980f6c448628f04ad1f5f68859f76c3317bee4fb` — **§294, DEPLOYED at §295 on both halves.** |
| Superseded binding | `05b1a2d8…` at `4749aba1…` — what production ran until §295, containing the MO-2 false-green path |
| Superseded binding | `2ce8a1d7…` at `94e29634` — §290's two bounded source closures (BR-3, indexing) changed the application source, so the digest changed with it |
| **Deployed release SHA** | `87491ed96f6f09de3de5800fc0a472e20d120413` — live on **both halves** since §295, schema `1800000023000` (55/55), Node `v24.14.1` pinned |

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
> **`applicationSourceDigest` remains the binding and its definition is not being changed here.** The
> narrower digest is a diagnostic that explains a movement, not a replacement for it. The rule for
> the next deployment is unchanged: deploy a commit and confirm its `applicationSourceDigest`. **Do
> not redeploy to make `e2dd73c0…` match** — that spends a deployment on bookkeeping for a build that
> is byte-identical.
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
| **B** | **INTERNAL / OWNER PRODUCTION USE** | Owner-controlled accounts entering **real data**. | **1** — `MO-1`, an owner action, not engineering |
| **C** | **EXTERNAL CONTROLLED BETA** | **Named external inspectors** entering real workplace data. | **18** |

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
| Entries | **79** | **4** | **7** | **46** | **22** |

| Status | Count |
|---|---|
| CLOSED | 40 |
| OPEN | 32 |
| BLOCKED (waiting on a decision or another item) | 4 |
| DEFERRED (deliberately not v1) | 3 |

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

**ONE item remains, and it is not engineering.** §295 closed `BR-2` and found that `MO-1`'s owner
boundary is larger than it had been recorded as.

| | what is actually left | state after §295 |
|---|---|---|
| **MO-1** | **Name a destination**, and supply what that architecture needs. | The hardened §294 build is **deployed** and still reports `NOT_CONFIGURED`, which is now the honest state rather than a bug. The email architecture the owner selected at §293 turns out to need a **domain the owner controls** before it needs a credential: Resend sends only from a verified domain, verification is DNS, and the Vercel account holds **zero** custom domains. A **webhook** needs none of that. **The choice between them is a real product decision — see the runbook.** |
| ~~BR-2~~ | ~~One Neon console read.~~ | **CLOSED at §295** on authoritative console evidence: Free plan, **6-hour** history window, Instant Restore available across it, no snapshots and no schedule. Sufficient for Threshold B; `BR-5` carries the Threshold-C consequence. |

`PV-3` and `DB-5` closed at §292 and were accepted at §293. `MO-2` opened at §293 and closed at §294.
`BR-2` closed at §295. `DB-7` remains **DEFERRED**.

Closed at §291: `DB-4`, `DB-6`, `SU-1`, `SU-3`, `PA-1`, `OF-4`. The former Threshold-B list was `MO-1`, `PA-1`, `SU-1`, `SU-3`, `DB-4`, and two opened at §289: **`BR-2`** (Neon's platform
retention window and PITR setting are unread — one console read) and **`PV-3`** (no Node version is
pinned and the Render runtime version cannot be read, so a rebuild reproduces the source but not
provably the artifact).

Real data now exists, so three things change. **SU-1 and SU-3** — acceptance must be transmitted,
persisted and evidenceable; this is engineering work that does **not** depend on counsel, because
recording *that* someone accepted *version X at time T* is independent of what the document says.
**MO-1** — someone must find out when it breaks. **PA-1** — a post-deploy acceptance defining what
must be true before a human uses it.

### Threshold C — external controlled beta  (28 items, including all six P0)

All of B, plus the legal, claims, privacy, review and clearance work:

`LG-1`, `LG-2`, `LG-3`, `SU-2` (P0) · `CM-1`, `DB-4`, `PR-1`, `RR-1`, `SR-1`, `TM-1` (P1) ·
`AC-1`, `BR-5`, `CPF-2`, `CPF-3`, `SE-3`, `ST-3`, `TI-3` (P2) · `MO-2` **closed at §294**

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
| **ST-2** | A generated report round-tripped through production storage with a checksum match, from the deployed candidate. | P2 | — | Infrastructure | **CLOSED (§290)** |
| **ST-3** | Report and inspection-record retention policy is undefined. | P2 | C | Product | OPEN |

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
| **BR-5** | Recovery beyond six hours depends on a manual dump nobody is scheduled to take. | P2 | C | Infrastructure | OPEN (§295) |
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

**BR-5 — new at §295, and deliberately not folded into BR-2.** The console confirms there are no
snapshots and no schedule, and the operator backup has only ever been taken **at release time**. So
for data entered between releases the posture is six hours from the platform and, before that,
whatever dump someone remembered to take. Closing it needs either a Neon plan with a longer window
and a schedule, or a scheduled operator backup with a stated retention and a rehearsed restore —
both product-owner decisions with a cost, and §295 is authorised to take neither. *Separated from
BR-2 on purpose: BR-2 asked what the platform gives us and that is answered; whether it is enough is
a different question with a different answer per threshold, and merging them would make a closed
fact look open or an open risk look closed.*

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
| **MO-1** | The alerting mechanism is built and proven. No destination is configured in production. | P1 | BC | Infrastructure | OPEN — one configuration step |
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
