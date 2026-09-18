# Safety InSite — External Beta Critical Path

**Established at §316.** Re-derived from the current product rather than from any earlier section's
verdict. This document decides what actually stands between the product as it exists today and a
**controlled external human Beta**. It is not a repair plan and it is not an instruction to close the
register.

> **Authority.** The machine-readable register is
> [`../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json`](../../verification/current/PRE-PRODUCTION-RELEASE-REGISTER.json).
> This document interprets it; it does not replace it. Where the two disagree, the register's entry
> list wins and this document is wrong.

---

## 1. What Beta v1 is

**An individual safety-inspection product.** One professional, their own sites, their own
inspections. No organization, no colleagues, no seats.

The journey that must work end to end: signup → required agreements → subscription/entitlement →
create inspection → capture field information → observations and evidence → HazLenz-assisted analysis
where entitled → **human review and confirmation** → safety/regulatory reasoning → corrective actions
→ calendar follow-up → completion → report → history → account and data lifecycle.

**§305A proved this runs end to end with no organization** — 51 assertions through the real guarded
HTTP routes as an individual with `organizationId` NULL, ending in an issued report with a checksum.
That is why the deferred Company/Team surface is deferred rather than blocking.

**Deferred and not blocking:** organization administration, invitations, seat management, team roles,
organization analytics, assignment, workflow expansion — `SE-7`…`SE-11`, `TI-3`, `DB-7`, `EN-2`.
Their dormant presence was checked for the four risks that would override deferral (security, privacy,
data integrity, billing, reliability) and §304/§305A found them **failing closed**: no route creates an
organization, a company-plan owner is refused `teamMembers` at 402, no role satisfies the invite
routes, and an invitation cannot be accepted because `RegisterDto` does not declare `inviteToken`.
Dormant, not latent.

---

## 2. The register, re-derived

Every number below was **derived from the entry list**, not read from the declared counts.

| | Value |
|---|---|
| Total entries | **127** (126 + `HZ-11`, opened at §316 — see §6) |
| CLOSED | **78** (was 76 — see §2.1) |
| OPEN / BLOCKED / ENGINEERING_COMPLETE | **40** |
| DEFERRED | 9 |
| P0 / P1 / P2 / P3 | **9 / 15 / 66 / 37** |
| Threshold A | 0 |
| Threshold B | 0 |
| **Threshold C** | **15** (14 inherited + `HZ-11`) |

**Before §316 touched anything the declared counts matched the derivation exactly** — 126 total,
76 CLOSED, P0 9 / P1 14 / P2 66 / P3 37, Threshold C 14. The register's bookkeeping was sound; what
was wrong was the *content* of two entries (§2.1) and the *absence* of one (`HZ-11`).

### 2.1 Two stale entries, corrected against code

Neither was a Threshold-C blocker, so the Beta count is unaffected. Both were corrected because the
register decides what ships and an entry contradicted by the code is worse than no entry.

- **`PR-2`** read *"No self-serve account or data deletion exists… no route sets it."* It had never
  been updated since §288. `DELETE /auth/me` exists (`auth.controller.ts:94`), requires the account's
  own password, anonymises the row, sets `deletedAt`, **and erases the account's evidence from R2** —
  built at §313 and exercised in production at §313A and again at §314A. **CLOSED.**
- **`TI-2`** read `BLOCKED`, *"counts across EVERY tenant."* §287 repaired it **by scope**:
  `checkRecurrence` now takes a `WorkspaceScope` as a **required** argument with no unscoped variant,
  joins `outcomes` to `corrective_actions`, and applies the organization-or-owner predicate. **CLOSED.**
  `DB-3` (the `outcomes` table sitting outside the migration lineage) is a **separate** question and
  remains open.

---

## 3. The Threshold-C blockers, each re-asked

The question for each is not *did an earlier section say it blocks* but **what would actually go wrong
if a named external inspector used this product tomorrow.**

Of the **15** Threshold-C flags, **14 still genuinely block** and **one is recommended down**. No flag
was cleared unilaterally: `AC-1` keeps its flag in the register because removing it is the owner's call,
not §316's.

### Still genuinely blocking — 13 inherited, plus `HZ-11`

| ID | Why it blocks **today** | The exact event that closes it | Who controls it | Code? | Deploy? |
|---|---|---|---|---|---|
| **LG-1** P0 | There is no contracting party. Terms and Privacy carry `NOT YET APPROVED` and five unfilled placeholders — legal entity, address, contact, governing law, beta term. You cannot take external users under a contract that names nobody. | Counsel approves the bodies **and** the owner supplies the five values | Counsel + owner | no | no |
| **LG-2** P0 | Liability allocation is **deliberately undrafted**. A warranty disclaimer exists; limitation of liability, indemnification and assumption of risk do not. This is a safety product whose failure mode is personal injury. | Counsel drafts the allocation | Counsel | no | no |
| **LG-3** P0 | The documents are unreachable from the running product until an approved body is published. **Engineering is complete** — `/terms` and `/privacy` answer 200 unconditionally behind a server- and build-authoritative lifecycle that code cannot promote. | Counsel-approved bodies placed and activated; the acceptance requirement then turns on by itself | Counsel, then engineering (mechanical) | placement only | yes |
| **SU-2** P0 | The signup checkbox is a **safety acknowledgement, not Terms acceptance**, and links to nothing. No contract is formed at signup. | Present Terms and Privacy as linked documents with affirmative acceptance, keeping the safety affirmation separate | Engineering, gated on LG-1/LG-3 | yes | yes |
| **CM-1** P1 | `/about`, `/hazlenz`, `/pricing` are **public and claim-bearing** and have never been audited. FTC *Operation AI Comply* is active into 2026; *FTC v. Evolv* (2024) is an AI-detection product barred from unsubstantiated detection claims. HazLenz is a detection-adjacent claim surface. | Every live claim audited and each one substantiated, qualified or removed | Owner + counsel | copy only | yes |
| **EM-2** P1 | **An external user who forgets their password is permanently locked out.** Production has no `RESEND_API_KEY` and no `PASSWORD_RESET_FROM_EMAIL`; `/health/ready` reports `NOT_CONFIGURED` right now. Tolerable for an internal owner, not for external humans. | Brand lock → domain → provider sending domain + DNS → set two env vars | Owner (brand-dependent) | no | no |
| **PR-1** P1 | External inspectors will photograph **real workplaces containing real workers**. The product has no stated position, no consent posture and no retention statement for images of people. | Counsel-reviewed statement in the Privacy Notice plus in-product guidance | Counsel + product | guidance copy | yes |
| **RR-1** P1 | An inspector may treat the output as their **statutory examination record**. MSHA 30 CFR 56.18002 requires a competent person's record retained one year; OSHA 29 CFR 1904 imposes separate duties. The product neither performs the examination nor guarantees the record — and does not say so. | State plainly in Terms and product copy that it does not perform the examination and does not satisfy any recordkeeping obligation | Counsel + product | copy | yes |
| **SR-1** P1 | The aid-not-replacement position exists on `/legal`, the signup checkbox and the report footer — but **not in the HazLenz UI**, which is exactly where a person decides whether to trust an analysis. | Decide the canonical placement set and apply it | Product decides, engineering applies | yes | yes |
| ~~**CPF-2** P2~~ | **CLOSED §317.** Every named surface reviewed at 390/768/1280/1440 in both themes on a production build. `/forgot-password` stopped promising an undeliverable email, `/profile` and `/upgrade` stopped naming a vendor and stopped showing a comped account a price it does not pay. `CS-2` and `AC-2` opened from the review. | — | — | done | done |
| ~~**CPF-3** P2~~ | **CLOSED §317.** Each registered adjustment re-measured before being changed, and none had fixed itself: O-14, O-4, O-5, O-6, O-7, O-10 and O-11 are closed; the subjective items are deferred unchanged. One intermittent hydration mismatch on `/settings` is carried as explicitly outstanding. | — | — | done | done |
| **ST-3** P2 | Retention is **undefined**. Reports and revisions are retained indefinitely by construction; nothing states a period, an export guarantee, or what happens when the Beta ends. External users are handing over real workplace records. | State a retention and export position for the Beta | Product, with counsel on the wording | maybe export | maybe |

`HZ-11` is the fourteenth and is set out in §6.

> **§317 UPDATE.** `CPF-2` and `CPF-3` are **closed**, `AC-1` is **removed from Threshold C by the
> product owner**, and **`HZ-12` and `CS-2` are opened by measurement**. The count returns to **14**,
> and the composition has changed: **not one of the fourteen is a pure engineering build item.**
> `HZ-11`'s UX half is also closed — the refusal the ceiling produces was invisible, and is not.

### Re-derived — 2

Neither flag is removed from the register. `AC-1` is a **recommendation** to the owner; `TM-1` is
**reframed** and still blocks. "An old section said it blocks" is not a reason to keep a flag, and
"it is inconvenient" is not a reason to drop one.

- **`AC-1` (P2, accessibility) → RECOMMENDED DOWN to SHOULD COMPLETE.** The **reviewed** surfaces — the whole core journey
  — pass objective checks: control naming, form labelling, full keyboard reachability, visible focus,
  contrast, and status never carried by colour alone. What is unknown is the CPF-2 surfaces. For an
  **invitation-only Beta with named participants the owner selects**, an unmeasured accessibility
  surface is a manageable risk rather than a functional barrier. It becomes a **MUST before open or
  public availability**, and it is cheap: the §286/§287 instrument already exists and only needs
  pointing at the new surfaces. It also closes naturally *with* CPF-2 rather than separately.

- **`TM-1` (P1, trademark) → the NAME does not block; BRAND LOCK does.** Re-derived precisely:
  a controlled, invitation-only Beta under a name later found to conflict is a **recoverable
  rebranding cost**, which the register itself says. What is *not* recoverable cheaply is building the
  things that **bake the name in**: `EM-2` needs a sending domain on the final brand, and the legal
  text carries **17 inventoried brand occurrences** that counsel would otherwise approve twice.
  So **brand lock is on the critical path as a product decision**, and **formal trademark clearance is
  external validation the owner may knowingly carry into a controlled Beta** — but not into public
  commercialization. See §5.

---

## 4. Disposition of every remaining item

**Beta blockers — 15**: the 14 Threshold-C flags that still block, plus live-payment enablement
(§7), which is conditional on whether the Beta charges and is not a register entry.

| Disposition | Count | Items |
|---|---|---|
| `BETA_BLOCKER_COUNSEL` | 5 | LG-1, LG-2, LG-3, PR-1, RR-1 |
| `BETA_BLOCKER_ENGINEERING` | **0** after §317 | ~~SU-2~~ is gated on LG-1/LG-3 and is counsel-bound; `CPF-2` and `CPF-3` are **closed**. |
| `BETA_BLOCKER_PRODUCT_DECISION` | 7 after §317 | CM-1, SR-1, ST-3, **brand lock (TM-1)**, **`HZ-11` Expert ceilings**, **`HZ-12` degraded-analysis disclosure**, **`CS-2` Pro capabilities with no surface** |
| `BETA_BLOCKER_OWNER_CONFIG` | 2 | EM-2, **live payment enablement (§7)** |
| `BETA_BLOCKER_EXTERNAL_VALIDATION` | 0 | none blocks a *controlled* Beta; trademark clearance is `SHOULD` and a **MUST before public availability** |

**Not blockers:**

| Disposition | Count | Items |
|---|---|---|
| `ACCEPTED_BETA_LIMITATION` | 9 | SC-4, SC-5, SE-21, OPS-2, SE-2, SE-20, OF-2, CF-1, SC-1 |
| `POST_BETA_HARDENING` | 12 | AC-1*, BR-6, BR-4, IT-4, DB-3, EM-1, AF-2, AF-3, UI-1, TP-1, CP-2, SE-4 |
| `COMPANY_TEAM_DEFERRED` | 9 | SE-7…SE-11, TI-3, DB-7, EN-2, OF-3 |
| `V2_ADVANCED_HAZLENZ` | 2 | HZ-3, HZ-8 |
| `SUPERSEDED` | 2 | PR-2, TI-2 (closed at §316) |

\* `AC-1` is `SHOULD COMPLETE` for a controlled Beta and a `MUST` before public availability.

---

## 5. Legal, counsel and branding

**The engineering publication mechanism is COMPLETE and the substantive legal text is NOT APPROVED.
These are different things and the register keeps them apart deliberately.**

- **Mechanism (LG-3, delivered §308):** `/terms` and `/privacy` are real routes answering 200
  unconditionally — §308 forbade a 404 caused by missing engineering. Behind them is a lifecycle
  (`DRAFT` → `APPROVED_NOT_EFFECTIVE` → `ACTIVE` → `SUPERSEDED`) with **no directory scan**: a file is
  inert until a human enumerates it with an exact version, effective date, state, approval record and
  digest. **Code cannot promote a draft** — `counselApproval` is required, and an entry claiming a
  later state without an approver refuses at load and the application does not start. A published
  version is **immutable**, watched to fail.
- **Substantive status: NOT APPROVED.** Terms and Privacy are drafted and carry
  `LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`.

| Document | Status |
|---|---|
| Terms | Drafted, **not approved**; 5 placeholders unfilled; liability allocation **undrafted** |
| Privacy Notice | Drafted, **not approved**; no position on images of identifiable people (PR-1) |
| AI / HazLenz disclosure | Content exists; **not in the HazLenz UI** (SR-1) |
| Responsibility allocation | Warranty disclaimer only; **no limitation, indemnification or assumption of risk** (LG-2) |
| Retention / deletion | **Undefined** (ST-3); the deletion *mechanism* is built and proven (§313/§313A) |
| Billing terms | Not separately drafted; subscription terms sit inside the unapproved Terms |

**Branding.** `Safety InSite` remains temporary and formally uncleared; *InSite* is a common
construction/safety formative, which raises conflict likelihood. `HazLenz` (TM-2) has had **no
conflict or provenance check at all** and is evaluated separately — it is the engine name, appears in
customer-facing claims, and is the more distinctive mark of the two.

**Nothing is renamed in §316.** What is required:

1. **Brand lock — a product decision, on the critical path** because EM-2's sending domain and the
   legal text's 17 brand occurrences both depend on it.
2. **Clearance search on the locked name** — commission before public commercialization. An owner may
   knowingly carry this risk into a controlled invitation-only Beta.
3. **Domain registration** — a sending domain cannot be a Vercel subdomain.
4. **HazLenz conflict/provenance check** — separate, and currently at zero.

---

## 6. HazLenz readiness

**What Expert HazLenz demonstrably does**, each with executed evidence: pre-spend idempotency (3
concurrent duplicates → 1 execution, 1 spender, 1 analysis); client forgery blocked (10 server-owned
fields refused over HTTP, raw SQL refused by a database CHECK constraint); structural identity
survives into the persisted row; a refusal is never presented as availability and a provider failure
creates no row; cross-workspace answers `NotFound`; candidate binding is **execution-derived** from the
transmitted prompt digest.

**What remains human-confirmed — and this is the product's central safety control.** An admitted
analysis is held at `ANALYSIS_AWAITING_CONFIRMATION` until a person settles it; confirmation preserves
the Expert result byte-identically, override makes the human replacement authoritative while
preserving the proposal, and two co-authorized reviewers produce exactly one settlement.

**Known accepted limitations:** the model's driver-role classification errs toward over-restriction
(contained by the confirmation rule); the Expert route runs its **own** deterministic basis rather than
reading the inspector's snapshot, so the two may diverge (**not yet reconciled**); `ANALYSIS_UNRESOLVED`
covers two distinct shapes.

**What cannot be claimed:** governed citation is **not exercised at all** — every execution transmits
zero governed records, so Expert may cite nothing. Reviewer revision of a settled analysis is not
built. The Expert frontend has never been served by a deployed instance.

**Provider dependency:** Anthropic, single provider, no fallback.

**Production limits — and a decision nobody has made.** Expert is `ACTIVE` in production since §298
with ceilings of **1 analysis and $1.00 per 24 hours**, and 1 analysis / 2 provider calls / $0.19083
have been spent. §316 verified how the ceiling is scoped, because `SE-20` collapses every individual
into the literal workspace `'default'` and a shared ceiling would have been serious: it is **not**
shared. `readWorkspaceExpertUsage` filters on `execution."requestedByUserId"` for an individual, so the
ceiling is **per user**. `SE-20`'s collapse touches only three governance routes that return 403 to an
individual.

**But 1 analysis per user per day is an internal-activation setting, not a Beta setting** — the code
defaults are 50 and $25. An external inspector doing a real walkthrough would exhaust it on the first
observation. **This is a new finding and a required owner decision.** It is registered as **`HZ-11`** (P1, OPEN,
blocks Threshold C) — the first register entry to track Expert's production ceilings at all.

**Does HazLenz block a controlled Beta? No** — with one condition: the ceilings must be set
deliberately, and `SR-1`'s aid-not-replacement disclosure must reach the HazLenz UI.

---

## 7. Offline, billing, email, operations, security, UX

### Offline — derived from code, not from claims

| Capability | State |
|---|---|
| Inspection **capture** offline | **Works.** Service worker precaches the shell for `/field-capture`; observations and photos persist in per-user IndexedDB (`OF-1`, closed) |
| Draft persistence | **Works.** Workspace drafts in local storage (§280); cover-page draft, field-capture drafts, offline request queue all survive reload |
| Evidence capture offline | **Works** — photos to IndexedDB |
| Sync / retry | **Partial.** A mutation outbox exists **for calendar tasks only** |
| Corrective-action create/edit/close offline | **Requires network** (`OF-2`) — and fails *honestly*: keeps what the user typed, never claims to have queued, one retry succeeds leaving exactly one record |
| HazLenz offline | **Does not exist** (`OF-3`, deferred) |
| Reports offline | **Does not exist** |
| Conflict resolution | **Does not exist** (`OF-3`, deferred) |

**Minimum for a controlled Beta: what exists today is sufficient** — capture and evidence, the parts
that happen in a plant with no signal, work and persist. Analysis, actions and reports are desk work.
The honest-failure behaviour of `OF-2` is what makes this acceptable rather than dangerous.

### Billing

Entitlement is **server-authoritative over the JWT claim in both directions** (`BI-2`, closed) — a live
subscription or active grant beats a stale token. Free is correctly refused corrective actions and
report generation at 402 while **retaining read and management of work it already has** (`EN-1`) — the
deliberate choice not to paywall closing open compliance work. The promo path was found inert at §300
and repaired; `EN-3` records that a promo-granted plan is **permanent with no product-controlled
revocation**.

**Not exercised:** Stripe checkout, portal and webhooks exist but are **gated on
`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` and not configured in production** (`BI-1`). Failed
payment, dunning, downgrade, cancellation and refund have **never been exercised** (`BI-3`).

**Owner actions before accepting real money** — this is a **Beta blocker if the Beta charges**:
configure live Stripe keys and webhook secret; exercise at least one full lifecycle including a failed
payment and a cancellation; decide the refund posture. **If the controlled Beta is free or comped, this
drops out entirely** — and that is itself an owner decision.

### Email

`EM-2`'s dependency chain is exactly: **final brand → domain registration → provider sending domain
+ DNS (SPF/DKIM/return-path, records issued at creation and not knowable in advance) → sender address
→ two environment variables.** All application code, the reset token contract, the frontend pages and
the delivery abstraction are **complete**. No redeploy is required.

**Without transactional email a locked-out external user has no self-serve recovery.** §306 proved the
failure is honest — the request is accepted, answered generically, and **no stranded reset credential
is left on the account** — but honest failure is not recovery. **This blocks external Beta.**

### Operations

| Area | State for a small controlled Beta |
|---|---|
| Monitoring | **Acceptable.** MO-1 alerting `CONFIGURED` via webhook; `serverErrorsInWindow` 0. It is an **emission** layer — §268 forbids calling it monitoring, and `OPS-2`'s wider gap stays open |
| Database recovery | **Acceptable.** Durable backup, proven restore, `HEALTHY (FRESH)` |
| Evidence recovery | **Acceptable.** Content-addressed generations, erasure tombstones that refuse restore, `PROTECTED` |
| Live-byte integrity | **Acceptable — newly so.** §315 wired full re-hashing into the scheduled path, fail-closed |
| Scheduler laptop limitation | **Acceptable with disclosure.** `launchd` runs a missed job at next wake but **cannot run while the machine is powered off**. No unconditional 24-hour RPO may be claimed |
| Release / rollback | **Acceptable.** Deliberate commit-pinned deploys, auto-deploy off, digest-bound identity |
| Secret handling | **Acceptable.** Operator secret file at 0600 outside the repo; scan passes |
| `SE-21` public repo | **Acceptable.** Nothing exposed, verified; it constrains *where* secrets may live, and that constraint is being honoured |

### Security and privacy

From existing evidence — **§307 is 334/334**, plus §303 malformed-identifier (168 probes), §304
invitation relationship, §305A scope, §313/§314A erasure, §315 integrity. Against the realistic
exposure list: **no cross-user access** (tenant isolation answers `NotFound`, indistinguishable from
absent); **no credential leakage** (repo and deployed bundle both scanned); **no account takeover path
identified**; **no undeleted customer data** — deletion is built, proven in production, and erasure
survives recovery; **no unsafe authorization** found on the individual path; **no billing abuse path**
with billing unconfigured; **no unrecoverable loss** — backup, recovery and integrity all operational.

**Remaining, and neither blocks:** `SE-2` (tokens in `localStorage` — standard SPA trade-off, 15-minute
token life, no known XSS) and `BR-6`.

**`BR-6` disposition — latent history, not a Beta privacy blocker.** Account anonymisation cannot clear
the undeclared legacy `user.password` column. The numbers are why: **8 of 67 accounts hold a value, 0
of the 26 deleted accounts did**, the population is **frozen at 8** (the entity does not declare the
column so nothing writes it), all 8 are bcrypt hashes rather than plaintext, and authentication reads
`passwordHash` only. **An external Beta customer's row will always have it NULL**, so no Beta user can
be affected. It is `POST_BETA_HARDENING` with one standing condition: **do not delete any of those 8
legacy accounts before it is remediated**, because that is the only way the privacy claim becomes
inaccurate.

**`SC-4`/`SC-5` disposition — no residual member can cause a Beta failure.** §316 asked the question
member by member. The one that genuinely could — `user.subscriptionStatus` defaulting to `'active'`
against an entity declaring `'none'`, i.e. **privilege granted on silence** — was **closed at §310A**
with a migration and a byte-identical distribution across it. The remaining twelve are a column type,
two nullabilities, five defaults and five legacy database-only columns, none of which sits on a
security, data-loss, privacy, billing, inspection, report, HazLenz, corrective-action or recovery
path. `SC-5`'s four timezone-naive columns are **lossless under the UTC deployment** — a property of
the deployment rather than the schema, which is why it stays registered. **Schema aesthetic mismatch is
not a launch blocker**, and neither is being treated as one.

### Product UX

The **core journey is proven end to end** (§305A, 51 assertions, real guarded routes, ending in an
issued report with a checksum). Against the four things that would actually stop a safety professional:

- **Broken flow / dead end:** none known on the reviewed spine.
- **Data loss:** addressed — §280 closed the one surface where a reload destroyed work.
- **Unclear human confirmation:** the mechanism is sound, but **`SR-1` leaves the HazLenz UI without
  the aid-not-replacement framing**, which is the one UX gap with safety consequences.
- **Unsafe recommendation presentation:** contained by the confirmation rule.

**Remaining UX blockers are `CPF-2` and `CPF-3`** — unreviewed and unclosed surfaces, notably `/login`
(front door) and `/forgot-password` / `/reset-password` (which interact with EM-2).

---

## 8. Pre-production checklist

| Item | State | Evidence |
|---|---|---|
| Legal review | **BLOCKED** | LG-1, LG-2 — drafted, not approved |
| Signup / user agreement | **BLOCKED** | SU-2 — checkbox is not Terms acceptance |
| Aid-not-replacement disclosure | **PARTIAL** | SR-1 — present on `/legal`, signup, report footer; **absent from HazLenz UI** |
| Formatting / UI consistency | **PARTIAL** | UI-1 two shells; AF-3 40px touch targets |
| Offline field capability | **READY** | OF-1 closed; capture and evidence persist |
| Security / data protection / privacy | **PARTIAL** | §307 334/334 and deletion proven; PR-1 unstated |
| Billing / subscriptions | **PARTIAL** | Authority proven (BI-2); live path unconfigured (BI-1, BI-3) |
| App formatting | **PARTIAL** | AF-2 PWA install unverified |
| Hazard classification evidence | **READY** | §298 activation; boundary documented §6 |
| Human confirmation workflow | **READY** | §264 — confirm, override, one settlement under concurrency |
| Monitoring / recovery | **READY** | §311–§315; DB, evidence and live-byte integrity all operational |
| Branding | **BLOCKED** | TM-1 brand lock; TM-2 HazLenz unchecked |

---

## 9. V1 preservation

**The preservation package exists and is bound to a superseded baseline.**
`project-docs/preservation/v1-beta/` holds the build-and-restore guide, the release manifest and the
schema provenance — but the manifest binds `productSourceCommit 4749aba1` at
`applicationSourceDigest 05b1a2d8` (the §292 era), and the guide's verification digests are §289-era.
**Production now runs `ed37e34b` at `5c939e74`.** Following that guide today would reconstruct a
product that is roughly twenty sections old.

**The requested build-from-scratch / full reconstruction document for the current candidate does not
exist.** Do not freeze v1 yet. Before a final Beta baseline preservation, the following must be written
or refreshed:

1. Re-bind the release manifest and guide to the **Beta baseline commit**, once one exists.
2. A **full reconstruction document** — every runtime dependency, every environment variable and what
   breaks without it, the object-storage layout, the Expert/provider configuration, and the
   scheduler/runner installation, which now includes `verify-evidence-digest-integrity.js`.
3. The **operator runner** as a first-class artifact: §315 found the installed runner had drifted a
   full section behind the checkout, so a reconstruction that omits it reconstructs a monitoring blind
   spot.
4. The **legal publication state** — which document versions were ACTIVE at the baseline, with digests.

---

## 10. The critical path

### MUST COMPLETE BEFORE EXTERNAL BETA

Ordered by **dependency**, not by register priority.

1. **Brand lock** *(owner decision)* — gates 2, 3 and 6. Nothing else here is expensive; this one
   blocks three other items and should be decided first.
2. **Legal: LG-1 + LG-2** *(counsel + owner)* — approved Terms and Privacy, five placeholders filled,
   liability allocation drafted. The long pole in wall-clock time. **Start immediately, in parallel
   with everything below.**
3. **LG-3 activation** *(engineering, mechanical)* — place the approved bodies, set effective dates,
   activate. Requires 2.
4. **SU-2** *(engineering)* — present Terms and Privacy as linked documents with affirmative
   acceptance; keep the safety affirmation separate. Requires 3.
5. **PR-1 + RR-1** *(counsel + product copy)* — a position on photographing identifiable people, and a
   plain statement that the product does not perform the statutory examination or satisfy any
   recordkeeping obligation. Folds into 2.
6. **EM-2** *(owner config)* — domain, provider sending domain, DNS, two environment variables.
   Requires 1. Without it a locked-out user is stranded.
7. **CM-1** *(owner + counsel)* — audit every public claim; substantiate, qualify or remove. Highest
   regulatory exposure per hour spent.
8. **SR-1** *(product decision + engineering)* — put the aid-not-replacement framing in the HazLenz UI.
   The one UX gap with safety consequences.
9. **ST-3** *(product decision)* — retention and export position for the Beta.
10. **CPF-2 + CPF-3 + AC-1** *(engineering, one bounded pass)* — review the eleven unreviewed surfaces
    and close the six unclosed adjustments, running the existing accessibility instrument over the same
    set. Public claim pages first, because they are CM-1's surface.
11. **Expert ceilings** *(owner decision — new at §316)* — 1 analysis/$1 per user per 24h is an
    internal-activation setting; an inspector exhausts it on the first observation.
12. **Live payment enablement** *(owner config)* — **only if the Beta charges.** Configure Stripe, then
    exercise one full lifecycle including a failed payment and a cancellation. **If the Beta is free or
    comped, this drops out.**

### SHOULD COMPLETE BEFORE EXTERNAL BETA

- **Trademark clearance on the locked name** — an owner may knowingly carry the rebranding risk into a
  controlled Beta, but not into public commercialization.
- **TM-2** — HazLenz conflict and provenance check, currently at zero.
- **BI-3** — exercise cancellation and failed payment even if the Beta is comped, so the first real
  failure is not the first observed one.
- **AF-3** — 40px touch targets against a 44px guideline, on a product used on a phone in a plant.
- **UI-1** — two competing page shells producing different widths.
- **A written Beta support and incident path** — who an external inspector contacts, and how.

### ACCEPTABLE CONTROLLED-BETA LIMITATIONS

Each is a **knowing** acceptance with a stated reason, not an oversight.

- **Scheduler cannot run while the machine is powered off** — disclose; claim no unconditional RPO.
- **Monitoring is an emission layer, not a monitoring system** (`OPS-2`) — acceptable at Beta scale.
- **`SE-2`** tokens in `localStorage` — standard SPA trade-off, 15-minute life, no known XSS.
- **`SE-20`** every individual resolves to workspace `'default'` — the three affected routes return 403
  to an individual, and the Expert ceiling is keyed per user, not on this value.
- **`SE-21`** public repository — nothing exposed; honour the constraint on secret placement.
- **`OF-2`** corrective actions require network — fails honestly and does not lose typed work.
- **`SC-4`/`SC-5`** schema residuals — no member on a risk path; the one that was is closed.
- **`BR-6`** legacy `user.password` on 8 pre-existing accounts — frozen, cannot reach a Beta user.
  **Condition: do not delete those 8 accounts before remediation.**
- **No offline HazLenz, reports or conflict resolution** — desk work, not field work.
- **Single provider, no fallback** — Expert degrades to the deterministic path.

### POST-BETA / V2

`BR-6` · `DB-3` (adopt `outcomes` into the migration lineage) · `BR-4` and `IT-4` (stale instruments)
· `EM-1` (broader transactional email) · `AF-2` (PWA install) · `TP-1` · `CP-2` (consensus-standard
licensing) · `SE-4` · `HZ-3` · `HZ-8` · reviewer revision of a settled analysis · reconciling the
Expert deterministic basis with the inspector's snapshot · governed citation (**never yet exercised**)
· all Company/Team work.

---

## 11. The shortest path

**Two lanes, run in parallel. The legal lane is the long pole and nothing engineering does shortens
it.**

- **Owner/counsel lane:** brand lock → commission clearance → counsel on LG-1/LG-2/PR-1/RR-1 →
  approve bodies → domain + email config → claims audit → retention and Expert-ceiling decisions.
- **Engineering lane:** CPF-2/CPF-3/AC-1 bounded review pass → SR-1 placement → then, once counsel
  returns, LG-3 activation and SU-2 acceptance (both small).

**Engineering is not the constraint.** Of the twelve MUST items, **three are engineering** (SU-2,
CPF-2/CPF-3, SR-1 placement) and all three are bounded. The rest is counsel, owner configuration and
product decisions.

### Owner decisions required

1. **The brand.** Blocks email, the legal text and the domain.
2. **Does the controlled Beta charge?** Removes or activates the entire live-payment lane.
3. **Expert ceilings for external use** — and whether Expert stays enabled at all during Beta.
4. **Retention and export position**, including what happens at Beta end.
5. **Accept or retire the trademark risk** for a controlled Beta.
6. **Canonical placement set** for the safety-responsibility content.
7. **Beta participant count and support path.**

### Next bounded section

**Close `CPF-2`, `CPF-3` and `AC-1` in one pass.** It is the largest engineering item on the MUST list,
it depends on no counsel and no owner decision, it can start immediately, and it produces the review
evidence the claims audit (`CM-1`) then needs for the public pages.
