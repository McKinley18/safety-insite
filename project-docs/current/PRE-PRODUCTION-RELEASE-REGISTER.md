# Safety InSite v1.0 — PRE-PRODUCTION RELEASE REGISTER

**This is the release authority.** It is the single document that answers *what, exactly, prevents
the current candidate from being released* — and it answers that question three separate times,
because there are three separate thresholds and they do not have the same blockers.

Established at **§288**. Machine-readable equivalent, generated from the same entry list so the two
cannot disagree: [`../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json`](../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json).

| | |
|---|---|
| Candidate HEAD | `0f36d49729c914c0c50a7e9118f3663877d057ef` |
| Frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` |
| Retired digest — **must not be used** | `3c2c5974…` (misattributed; see PV-2) |
| Provider calls in §288 | **0** |
| Production contact in §288 | **none** — no deploy, no migration, no configuration change, no live read |

> **Supersedes** `verification/current/BETA-BLOCKERS.json` as the release authority. That file is
> retained unchanged as the historical §263–§285 record and must not be read as current status.

---

## The three thresholds

These are deliberately not the same question, and an item that blocks one frequently does not block
the others.

| | Threshold | What it means | Blockers |
|---|---|---|---|
| **A** | **CONTROLLED PRODUCTION DEPLOYMENT** | The candidate running in a production environment. **No users, no real data.** | **8** |
| **B** | **INTERNAL / OWNER PRODUCTION USE** | Owner-controlled accounts entering **real data**. | **11** |
| **C** | **EXTERNAL CONTROLLED BETA** | **Named external inspectors** entering real workplace data. | **26** |

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
| Entries | **65** | **6** | **15** | **22** | **22** |

| Status | Count |
|---|---|
| CLOSED | 18 |
| OPEN | 40 |
| BLOCKED (waiting on a decision or another item) | 5 |
| DEFERRED (deliberately not v1) | 2 |

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

### Threshold A — controlled production deployment  (8 items, **0 legal, 0 P0**)

`BR-1`, `DB-1`, `IN-1`, `IN-2`, `IN-3`, `PV-1`, `RL-1`, `ST-2`

Entirely infrastructure and preservation. In order:

1. **DB-1** — read the production migration head; diff against the 54 shipped migrations; classify
   each pending one destructive or not. *No migration runs until this list is reviewed.*
2. **BR-1** — establish backups and rehearse one restore to a disposable target.
3. **PV-1** — create `project-docs/preservation/v1-beta/` with the build-and-restore guide and the
   release manifest.
4. **RL-1** — write the release runbook and define rollback for both halves.
5. **IN-3** — re-read Render configuration (read-only).
6. **IN-1 / IN-2** — deploy the candidate, exercising the Vercel production path deliberately.
7. **ST-2** — round-trip one generated report through production object storage.

### Threshold B — internal / owner production use  (11 items)

All of A, plus `MO-1`, `PA-1`, `SU-1`, `SU-3`.

Real data now exists, so three things change. **SU-1 and SU-3** — acceptance must be transmitted,
persisted and evidenceable; this is engineering work that does **not** depend on counsel, because
recording *that* someone accepted *version X at time T* is independent of what the document says.
**MO-1** — someone must find out when it breaks. **PA-1** — a post-deploy acceptance defining what
must be true before a human uses it.

### Threshold C — external controlled beta  (26 items, including all six P0)

All of B, plus the legal, claims, privacy, review and clearance work:

`LG-1`, `LG-2`, `LG-3`, `SU-2` (P0) · `CM-1`, `PR-1`, `RR-1`, `SR-1`, `TM-1` (P1) ·
`AC-1`, `CPF-2`, `CPF-3`, `SE-3`, `ST-3`, `TI-3` (P2)

The critical path is **counsel**, and it is not shortened by engineering. LG-1 → LG-2 → LG-3 → SU-2
is a chain: the documents must be approved and the placeholders filled before they can be published,
and they must be published before signup can link to and take acceptance of them. Everything else on
this list can proceed in parallel.

**The finite path is real.** No entry on any threshold is open-ended research. The largest single
unknown — the production migration head — is one read away, and §288 was forbidden from taking it.

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

**HZ-3 — remediation / decision.** Point the verify harness at a disposable local_test storage root, as review-stack.ts already does.

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
| **TI-2** | The outcome-intelligence recurrence check counts across EVERY tenant and would auto-escalate one customer's action on another customer's history. | P2 | — | Security | BLOCKED |
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
| **ST-2** | Production object storage (S3) has never been exercised end to end. All report evidence comes from the local_test provider. | P1 | ABC | Infrastructure | OPEN |
| **ST-3** | Report and inspection-record retention policy is undefined. | P2 | C | Product | OPEN |

**ST-2 — remediation / decision.** Configure and exercise S3 in the controlled production environment: store, read, retire, and an orphan sweep.

*Evidence:* `backend/src/storage/storage.service.ts; hazlenz:verify ENVIRONMENTALLY_BLOCKED`  
*Retest:* One generated report round-tripped through production storage with a checksum match.

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
| **IN-3** | Render configuration, authentication and auto-deploy posture were last evidenced at §269/§283 and are stale relative to the candidate. | P2 | A | Infrastructure | OPEN |
| **IN-4** | Vercel Preview deployments are SSO-protected, noindex and DENY-framed. | P2 | — | Infrastructure | OPEN |

**IN-1 — remediation / decision.** Push and deploy the candidate to a controlled production environment after DB-1, ST-2, PV-1 and RL-1.

*Evidence:* `verification/current/runtime-evidence-283 section D; project-docs/current/BETA-READINESS.md row 5`  
*Retest:* A production SHA read matching the candidate.

**IN-2 — remediation / decision.** Exercise the production deployment path once, deliberately, before relying on it.

*Evidence:* `verification/current/runtime-evidence-283 section D`  
*Retest:* A production deployment whose source and target are read back and recorded.

**IN-3 — remediation / decision.** Re-read Render service configuration, environment variables and auto-deploy setting at deploy time. Read-only.

*Evidence:* `verification/current/runtime-evidence-283`  
*Retest:* A recorded configuration read dated at deploy.

**IN-4 — remediation / decision.** Before sharing any preview externally, enumerate which environment variables are exposed to Preview and confirm no production secret is among them.

*Evidence:* `verification/current/runtime-evidence-283 section D`  
*Retest:* An environment-scope listing per target.

### DATABASE / MIGRATIONS

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **DB-1** | The production migration head is UNKNOWN from repository evidence, and 54 migrations exist in the candidate. | P1 | ABC | Engineering | OPEN |
| **DB-2** | The §287 corrective-action lifecycle migration had a DUPLICATE, out-of-order timestamp (1800000006000, colliding with AddUserProfileNames) which also left schemaCompatibilityVersion blind to the schema change. | P2 | — | Engineering | CLOSED |
| **DB-3** | The outcomes table is deliberately absent from the migration set, which keeps the cross-tenant recurrence code unreachable. | P3 | — | Security | BLOCKED |

**DB-1 — remediation / decision.** Read the production migrations table, diff against the shipped set, and record the pending list with a destructive/non-destructive classification per migration before running anything.

*Evidence:* `backend/src/database/migrations/ (54 files)`  
*Retest:* A recorded production head and a reviewed pending list.

**DB-3 — remediation / decision.** Do not add this migration until TI-2 is repaired and validated.

*Evidence:* `verified in §287 and re-verified in §288`  
*Retest:* Tied to TI-2.

### BACKUP / RESTORE

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **BR-1** | No evidence exists of a tested backup or a rehearsed restore for the production database or object storage. | P1 | ABC | Infrastructure | OPEN |

**BR-1 — remediation / decision.** Establish the backup schedule and retention, then rehearse one full restore to a disposable target and record the timing.

*Evidence:* `no restore evidence in verification/`  
*Retest:* A recorded restore rehearsal with a data-integrity check.

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
| **PV-1** | project-docs/preservation/v1-beta/ does not exist. There is no build-and-restore guide and no machine-readable release manifest. | P1 | ABC | Engineering | OPEN |
| **PV-2** | The historical digest 3c2c5974... is MISATTRIBUTED and must not be used as a current integrity assertion. | P3 | — | Engineering | CLOSED |

**PV-1 — remediation / decision.** Create the directory, the guide, and a manifest containing productVersion, gitSha, sourceDigest, hazlenzIdentity, frontendVersion, backendVersion, schemaCompatibilityVersion, migrationHead, nodeVersion, npmVersion, databaseVersion, buildTimestamp, knownLimitations, canonicalDocs and validationEvidence.

*Evidence:* `backend/src/common/release-identity.ts; project-docs/preservation/ absent`  
*Retest:* A rebuild from the guide reproducing the recorded identities.

### RELEASE / ROLLBACK

| ID | Description | Sev | Blocks | Owner | Status |
|---|---|---|---|---|---|
| **RL-1** | No release runbook and no tested rollback procedure exist for either the frontend or the backend. | P1 | ABC | Infrastructure | OPEN |

**RL-1 — remediation / decision.** Write the release runbook (order of operations, backup point, migration step, verification step) and define rollback for each half, including what happens to a migration that has already run.

*Evidence:* `no runbook in project-docs/`  
*Retest:* A rehearsed rollback on a disposable target.

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
