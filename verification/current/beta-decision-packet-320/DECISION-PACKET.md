# §320 — EXTERNAL BETA PRODUCT-OWNER DECISION PACKET

**Nothing here is implemented.** No runtime change, no deployment, no production mutation, no
provider call, no Expert call, no spend. Every figure is traced to evidence already in this
repository and the trace is given, so any number can be checked rather than believed.

**State at the time of writing.** HEAD `24d6ea54` · production frontend `29ab6c46` · production
backend `ed37e34b` · Threshold A 0, B 0, **C 14**.

---

# DECISION 1 — HZ-12: THE SILENT DEGRADED ANALYSIS

## CURRENT STATE

`hazlenz.service.ts` skips the full intelligence orchestrator when the runtime is production **and**
Render **and** either `HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER=true` **or** heap usage has
reached `HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB` — **which is unset in production and
therefore defaults to 420 MB.** It then returns a degraded result carrying `degraded: true`,
`fullIntelligenceAvailable: false` and a `fallbackReason` naming exactly what was skipped.

**None of those three fields is read anywhere in the frontend.** Confirmed again at §318 against the
deployed bundle.

**What a customer experiences today:** nothing distinguishes the two outcomes. A degraded analysis
arrives in the same panel, with the same headings, the same standard candidates, the same risk score
and the same corrective actions. The inspector cannot tell that the advanced review did not run, and
neither can the owner reading the record later.

**What boundary it represents.** Not a safety boundary — a degraded result is still advisory, still
requires review, and still says so, so the safety argument does not collapse. It is a **capability
and claims** boundary: it converts every *categorical* limitation the product states ("candidates are
not confirmed violations") into an *episodic* one — sometimes the analysis is what `/hazlenz`
describes and sometimes it is not, and only the server knows which.

**Frequency is unknown and §320 does not guess.** Measuring it needs production load measurement,
which no section has been authorised to perform.

## OPTIONS

| # | option | exact behaviour | user experience | safety | disclosure | Beta | engineering | overclaim risk | under-serve risk |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **Surface `fallbackReason`** when `degraded` is true | one conditional block in the HazLenz step renders the server's existing sentence | the inspector is told the advanced review was skipped and why | unchanged | **closes the gap**; the episodic claim becomes self-correcting | participants see an honest product | small — the sentence exists; ~half a day with a contract test | **lowest** | small: an occasional caveat some readers will not need |
| **2** | **Measure first** — route the existing log to the MO-1 webhook | no customer-visible change | unchanged | unchanged | **none** — silence ships through Beta | learn the frequency, decide later | very small | unchanged from today | unchanged from today |
| **3** | **Set or remove the threshold** — 420 MB is a default nobody chose | either an explicit value or no guard | none directly | unchanged | none directly | removes an unchosen number from control of what customers receive | configuration only for a raise (§297 read-back applies); removal is a code change needing a memory argument | reduced indirectly | if the guard is removed unwisely, a memory incident |
| **4** | **Do nothing for Beta** | — | — | unchanged | **none** | the product may tell a participant it did something it did not do, on the page that sells exactly that capability | none | **highest** | none |

## FACTUAL RECOMMENDATION

**Option 3 together with option 1.** Option 3 is nearly free and removes the part that is hardest to
defend later — an *unchosen default* deciding what a customer receives. Option 1 is the only option
that closes the gap between what `/hazlenz` sells and what a degraded analysis delivers, and it does
so using the server's own words rather than new marketing language.

**Option 2 alone is weaker than it looked at §317A.** Frequency does not change whether the claim is
true; it changes only how often it is false.

## PRODUCT-OWNER DECISION REQUIRED

Which option, and — if option 1 — whether its wording goes to counsel with the rest of the claims
work (it is a statement about analysis completeness, so CM-1's approval path fits it).

---

# DECISION 2 — HZ-11: EXPERT BETA ACCESS AND SPEND

## CURRENT STATE, VERIFIED FROM CODE AND CONFIG

| | value | source |
|---|---|---|
| production analyses / user / 24 h | **1** | register `expertHazlenzProductionActivation.ceilingsStillInForce`, set at §298 |
| production USD / user / 24 h | **1.00** | same |
| code defaults if unset | 50 and 25 | `expert-operational-controls.ts` lines 115, 117 |
| provider legs per analysis | **2** (authoring + verifier) | same file, line 119 |
| scope for an individual | **per user** | `readWorkspaceExpertUsage` filters on `requestedByUserId` when `organizationId` is NULL |
| model | `claude-sonnet-5`, thinking disabled, maxTokens 8000 | `expert-request-envelope.ts` |
| accounting rates | **$2.00 / M input, $10.00 / M output** | `EXPERT_HOSTED_INFERENCE_CONFIG` |

## THE COST BASIS, AND ONE WARNING THAT CHANGES THE ANSWER

**There is exactly ONE production-representative cost observation** — §298's first and only
production Expert analysis:

```
first pass  45,442 input + 4,715 output
verifier    14,603 input + 2,359 output
total       60,045 input + 7,074 output
cost        (60,045/1e6 × $2) + (7,074/1e6 × $10) = $0.12009 + $0.07074 = $0.19083   ✓ reproduces exactly
```

**The 1,334 development cost observations in the evidence must NOT be used to project Beta spend.**
Their median is $0.03815 — but their median *input* is 2,412 tokens against production's 45,442.
Development requests are roughly **19× smaller**, because production assembles the full inspection
context. Projecting from them would understate spend by about 5×.

So every figure below uses **$0.19083 per analysis, n = 1**. It is the honest basis and it is thin;
a second production analysis would materially improve it, and obtaining one costs about 19 cents.

## THE SCENARIOS

| analyses/day | uncapped $/user/day | effective after the $1 cap | 7-day / user | 30-day / user | binding limit |
|---|---|---|---|---|---|
| **1** | $0.191 | $0.191 | $1.34 | $5.72 | the **analysis count** |
| **3** | $0.572 | $0.572 | $4.01 | $17.17 | the **analysis count** |
| **5** | $0.954 | $0.954 | $6.68 | $28.62 | **both, almost simultaneously** |
| **10** | $1.908 | **$1.00 (capped at ~5 analyses)** | $7.00 | $30.00 | the **USD cap** |

**The single most useful fact here: the existing $1.00/day cap already permits five analyses a day.**
5 × $0.19083 = $0.95415; a sixth would exceed it. So moving the count from 1 to 5 requires **no
change to the cost cap at all** — one environment variable, not two. Moving to 10 would require
raising the cost cap as well, and the cap would still bind at about 5.

**The USD cap is a hard spend bound in every scenario.** Whatever the true per-analysis cost turns
out to be, no user can cost more than $1.00/day while it is in force.

## IS THE ALLOWANCE ENOUGH TO EVALUATE EXPERT?

**This question splits, and the split is the answer.**

- **The deterministic path is unlimited** and is the customer-authoritative one. A participant can
  walk a whole site, capture many observations, and get a finding, a citation, a risk band, a
  corrective action and a report for every one of them without touching Expert. §317 proved that on a
  database containing nothing but migrations.
- **At one analysis per day, Expert cannot be evaluated.** A participant sees it approximately once
  and cannot form a view on whether a second opinion is worth having, whether it usefully disagrees,
  or whether settlement works in practice — while the product still pays for it.

## THE THREE STRUCTURAL OPTIONS

| option | consequence |
|---|---|
| **Expert disabled for Beta** | Zero provider spend, zero provider risk, simplest possible operation. The Beta evaluates the deterministic product — which is what a participant mostly uses. Learns nothing about Expert. `/hazlenz` already states Expert is "subject to usage limits during the Beta", so the copy survives; the Expert control would need to state its own unavailability, which §317 already made visible |
| **Expert enabled with an explicit Beta limit** | Learns something real. Requires disclosing the number — §318 found it is disclosed nowhere, and §317 made the refusal visible, so a participant now meets a limit they were never told about |
| **Expert on selected observations only** | Not implemented and not cheap: there is no per-observation eligibility concept. This is new engineering, not a configuration choice |

## FACTUAL RECOMMENDATION

**Raise the analysis count to 5 and leave the USD cap at $1.00.** It is the only option that is
optimised for all four stated goals at once:

- **meaningful feedback** — five analyses a day is a real working sample rather than a token;
- **controlled spend** — the cap is untouched and remains a hard bound; at a 10-user cohort for 30
  days the ceiling is $300 and the expected figure is $286;
- **safety** — unchanged; the refusal is correct and, since §317, visible;
- **simplicity** — **one environment variable**, and §297's read-back rule applies.

**If spend is the dominant concern, disable Expert instead of leaving it at one.** One per day is the
worst of both: it pays for Expert and learns nothing about it.

## PRODUCT-OWNER DECISION REQUIRED

The analysis count (and whether Expert runs at all during Beta), plus whether the number is disclosed
to participants and where.

---

# DECISION 3 — BETA ACCESS AND PRICING MODE

## CURRENT STATE — AND FREE IS NOT COMPED

| | **FREE INVITATION** | **COMPED INVITATION** | **PAID** |
|---|---|---|---|
| **signup flow** | ordinary self-serve registration; nothing extra | ordinary registration **plus a promo code** the participant types | registration, then Stripe checkout after sign-in |
| **entitlement** | `tier free`, `quickCapture` only. **No HazLenz analysis, no findings, no corrective actions, no reports** — all 402 | `tier pro`, `tierSource grant`, `accessSource pilot`; a **bounded** `entitlement_grants` row, 7 days by default, clamped at 30 | `tier pro` via a Stripe subscription; the webhook promotes the account |
| **Stripe dependency** | none | none | **total** |
| **operator action** | none at all | **one server environment variable** (`EMPLOYER_PRO_PROMO_CODES`); no database write | the Stripe configuration production already holds |
| **revoking access** | n/a | **expires by itself** within ≤30 days. Withdrawing it EARLY needs the platform administrator that only a direct DB write can create (**EN-4**) | cancel in Stripe |
| **refund / cancellation** | n/a | n/a | **required, and nothing in the product addresses it.** The portal needs a `stripeCustomerId`, which only a real purchase creates — untested |
| **support expectation** | informal | informal | **material**, and there is **no support surface in the product** — the only route named anywhere is `/forgot-password`'s "contact the person who invited you" |
| **legal** | acknowledgement only | acknowledgement only | full subscription terms, price, renewal, cancellation, data-at-end |
| **customer expectation** | low | low–moderate | **availability and support the product makes no commitment about.** No SLA exists |
| **tests subscription infrastructure** | no | no | **yes — and nothing else does** |
| **operational complexity** | lowest | very low | highest |

**The critical asymmetry: a FREE Beta cannot evaluate the product.** Free is a record-keeping tier —
no HazLenz analysis, no findings, no corrective actions, no reports. A free invitation Beta would
test capture and storage and nothing that makes the product worth having.

**Does payment introduce a blocker that does not otherwise exist? Yes, three.**
1. **EM-2 becomes a service defect.** A paying customer locked out with no recovery is a refund
   conversation at best. Today there is no self-serve recovery at all.
2. **Refund and cancellation terms are required and absent**, and the portal path is untested.
3. **CS-2's class of defect changes category** — an advertised capability that does not exist becomes
   a payment-surface misrepresentation rather than a claims defect. (§319 corrected the known
   instances; the point is the standard rises.)

## FACTUAL RECOMMENDATION

**COMPED INVITATION BETA.** It is the only mode that evaluates the actual product while introducing
no blocker that does not already exist. It costs one environment variable, it expires by itself, and
§319 already ships the presentation for it — a granted account renders *"Included — nothing is billed
to this account"* and its end date, verified live in production at §317A.

**Two consequences to accept knowingly:** early revocation needs EN-4 (bounded, because grants expire
within 30 days anyway), and the Beta will **not** exercise the subscription path — so Stripe remains
untested until a later paid phase.

## PRODUCT-OWNER DECISION REQUIRED

The mode, and — if comped — the grant duration (default 7 days, maximum 30) and whether participants
are told when their access ends.

---

# DECISION 4 — ST-3: RETENTION

## CURRENT STATE — WHAT ACTUALLY HAPPENS TODAY

### ACTIVE PRODUCT DATA — retained indefinitely, by construction

Active and completed inspections, observations, findings, human reviews, corrective actions,
calendar tasks, reports and **every report revision** (finishing again issues a new revision and
keeps the one it replaced), sites, and account data. **Nothing expires. No period is stated anywhere,
no export guarantee is given, and nothing says what happens when the Beta ends.** That absence *is*
ST-3.

### CUSTOMER-DELETED DATA

- **A single evidence file** (`DELETE /files/:id` by its creator) → status `erasure_pending` → the
  object is erased from R2 and the row moves to `deleted`. Nothing serves an `erasure_pending`
  object: `findAuthorized` admits only `ready`, so it 404s immediately.
- **A whole account** (`DELETE /auth/me`) → login access removed, the user row anonymised, and since
  §313 the account's evidence erased from R2 end to end. Exercised in production at §313A, §314A and
  again at §317A.
- **One known latent gap, BR-6:** `user.password` is a tolerated legacy column the entity does not
  declare, so anonymisation does not clear it and it would survive in backups for their retention. It
  has not been realised in production.

### BACKUP DATA — the numbers nobody has yet told a customer

| | value | source |
|---|---|---|
| database backups, daily | **14 kept** | `BACKUP_RETAIN_DAILY=14` |
| database backups, weekly (Sunday) | **8 kept** | `BACKUP_RETAIN_WEEKLY=8` — so a Sunday artifact can persist ~**70 days** |
| freshness alarm | 36 h | `BACKUP_MAX_AGE_HOURS=36` |
| platform instant-restore | **6 hours** | Neon Free plan (BR-5) |

### RECOVERY DATA

Evidence recovery generations are kept for **`EVIDENCE_GENERATION_WINDOW_DAYS`, default 30** and not
overridden. The nightly reconciler **propagates erasures into the recovery store**, so a deleted
object does not quietly live on there — but it is a nightly job, so there is a window.

### RETAINED AUDIT / COMPLIANCE DATA

`security_audit_events` and `audit_logs` record actor, action and resource — including the deletion
itself. They are **not** erased by account deletion, deliberately: an audit trail that deletes its own
record of a deletion is not an audit trail.

## THE GAP

**Every number above is real and none has ever been told to a customer.** The honest statement
"deleted" cannot be made unqualified while a Sunday backup can hold the row for ~70 days and a
recovery generation for 30.

## OPTIONS

| # | policy | what it says | what it costs |
|---|---|---|---|
| **A — describe what the system already does** | "Your records are kept while your account is open. Deleting your account removes your access and erases your evidence from live storage; encrypted backups and recovery copies are retained for up to 70 and 30 days respectively and then expire." | **nothing** — it is a disclosure, not a change. Truthful today |
| **B — A, plus a stated Beta end** | A, plus "at the end of the Beta we will give you N days' notice and an export before anything is removed" | small: an export path must exist. Reports are downloadable; a whole-account export is **not** built |
| **C — A, plus a shortened backup window for Beta** | reduce `BACKUP_RETAIN_WEEKLY` so the outer bound is ~14 days rather than ~70 | configuration only, but it **weakens recovery** during the phase where data loss would hurt most. Not recommended |
| **D — defer** | say nothing | free today; leaves external participants handing over real workplace records with no stated retention — the thing ST-3 was opened about |

## FACTUAL RECOMMENDATION

**Option A for the Beta, and decide B's export question separately.** A costs nothing, is true today,
and converts ST-3 from an undefined policy into a stated one — which is what the entry actually asks
for. B is the right destination but needs an export path that does not exist; do not block the Beta on
it. **C is a false economy.**

## COUNSEL QUESTIONS (engineering states the facts; counsel decides the wording)

1. What may be said about "deleted" given a ~70-day backup window and a 30-day recovery window?
2. Does a Beta with no stated retention period create exposure independent of the wording?
3. Must an export right be offered before the Beta ends, or is notice sufficient?
4. Do the audit records that survive deletion need their own disclosure?

## PRODUCT-OWNER DECISION REQUIRED

Which option, and whether a whole-account export is in scope for the Beta.

---

# DECISION 5 — THE BRAND CRITICAL PATH

**No names are proposed here.** This is the inventory of what a rename touches, so the cost of the
decision is visible before it is made.

## MEASURED SURFACE

| area | files | occurrences |
|---|---|---|
| `frontend-next/app` | 26 | 62 |
| `frontend-next/components` | 8 | 20 |
| `frontend-next/lib` | 9 | 23 |
| `backend/src` | 10 | 23 |
| `project-docs/legal` | 9 | **17 — these are the ones counsel would otherwise approve twice** |

**The frontend already has a single source of truth**: `lib/brand.ts` exports `APP_NAME`,
`AI_ENGINE_NAME`, `APP_TAGLINE`, `APP_DESCRIPTION` and the logo paths. Most of the 105 frontend
occurrences read through it. The backend has `PRODUCT_NAME` with a `'Safety InSite'` fallback.
**A rename is therefore far less mechanical work than the raw count suggests** — the expensive parts
are outside the code.

## MUST CHANGE BEFORE EXTERNAL BETA

| item | why it cannot wait |
|---|---|
| **domain registration** | a sending domain **cannot** be a `vercel.app` subdomain, so EM-2 cannot close without it |
| **email sending domain + DNS** (SPF/TXT, DKIM, return-path) | issued by the provider at creation; tearing one down and rebuilding it under a second name is the waste brand lock exists to avoid |
| **sender identity** (`PASSWORD_RESET_FROM_EMAIL`) | ditto |
| **`PRODUCT_NAME`** in production | it is what the reset email says it is from |
| **17 brand occurrences in the draft legal text** | counsel approving text under a name that then changes means paying for the review twice |
| **customer-facing product name** — `APP_NAME`, tagline, page titles, footer, report header/footer | what a participant sees and cites |
| **support contact** | there is none today; whatever is chosen carries the brand |

## CAN CHANGE AFTER INVITATION BETA

Logo image assets; the `safety-insite.vercel.app` frontend URL (a rebrand can keep it during an
invitation-only Beta; participants receive a link rather than typing one); Stripe product and
statement descriptors (**no charges are planned in a comped Beta, so nothing bills under the old
name**); documentation and `project-docs/current`; monitoring channel naming; the repository name.

## INTERNAL IDENTIFIERS THAT SHOULD **NOT** BE RENAMED FOR BRANDING

Renaming these buys nothing a customer can see and costs migrations, evidence-identity breakage and
risk:

- **41 database tables and columns** carrying `hazlenz_*` and the legacy `safescope_*` prefixes.
  Renaming them is a migration on customer data for cosmetic reasons.
- **278 backend identifiers** — classes, types, functions.
- **4 API route prefixes** containing `hazlenz`.
- The `safescope-backend.onrender.com` service hostname and the `insite-production` bucket name.
- Frozen verification package paths and digests — §274 established that **file paths participate in
  evidence identity**, so renaming a path can invalidate a manifest.

**The rule worth adopting: rename what a customer reads; leave what a machine reads.**

## FACTUAL RECOMMENDATION

Treat brand lock as **one decision that unblocks three entries** — EM-2 (domain and sender), TM-1
(the mark), and the 17 legal occurrences counsel would otherwise review twice. It is the longest pole
that nothing engineering does shortens.

## PRODUCT-OWNER DECISION REQUIRED

The permanent product name, and whether the `vercel.app` frontend URL is acceptable for an
invitation-only Beta (it is, technically).

---

# DECISION 6 — THE HAZLENZ NAME

## WHERE IT IS

| | count |
|---|---|
| customer-visible frontend strings | **186** |
| frontend files | 48 |
| backend source files | **406** |
| backend identifiers (classes, types, functions) | **278** |
| database tables and columns | **41** |
| API route prefixes | 4 |

**"HazLenz AI" alone was measured at §318 at 84 occurrences across 28 rendered surfaces** — the
single most-used claim in the product.

## TIMING OPTIONS

| choice | technical impact | risk |
|---|---|---|
| **Name stays** | none | TM-1 stays open. §318/§319 already did the hard part: the AI-provenance qualification is live and reachable, so the name's *claim* risk is mitigated even while the *mark* risk is not |
| **Changes before Beta** | the **186 customer-visible strings** and `AI_ENGINE_NAME`; leave the 278 identifiers, 41 tables and 4 routes alone. Bundled with the product rename it is one copy pass, not two | lowest total cost. Participants only ever know one name |
| **Changes after Beta** | the same 186 strings, **plus** everything participants have already been told, every report they hold carrying the old engine name, and the disclosure §319 just made reachable | **highest.** A safety professional who cited "HazLenz" in a filed report now holds a document naming an engine that no longer exists |

**The report point is the sharpest.** Reports are the artifact participants keep and may show to
others. An engine rename after Beta orphans the name inside documents already issued, and §286's
revision model deliberately preserves issued reports exactly as issued — so they cannot be rewritten
even in principle.

## FACTUAL RECOMMENDATION

**Decide the HazLenz name at the same time as the product name, before Beta.** Not because the name
is wrong — §320 reaches no trademark conclusion — but because the *timing* is the cheap part and only
stays cheap until the first participant receives a report.

## PRODUCT-OWNER DECISION REQUIRED

Whether HazLenz is in or out of scope for the brand decision, and whether trademark clearance is
sought for both marks together.

---

# DECISION 7 — EM-2: TRANSACTIONAL EMAIL

## WHAT IS ALREADY COMPLETE — ENGINEERING, AND IT IS FINISHED

§306 completed and proved the software path: 51 assertions, 0 failed, **0 emails sent**. It also
found and repaired a real concurrency defect — two completions of the same token both reported
success while only one password worked. What is proven: 256-bit tokens, digest-only storage verified
by recomputation, bounded expiry, byte-identical generic responses for known, unknown and
case-variant addresses plus a timing comparison, reset-path password strength equal to registration,
immediate session death, configuration-only reset URLs immune to Host-header injection, throttling,
and a rollback that leaves no stranded credential when delivery fails.

§317 and §319/§319A completed the **customer surface**: the page no longer promises an email it
cannot send, and the hero and the notice now read from the same published capability. Live in
production.

**`noCodeChangeRequired: true`.** Nothing in the application is waiting.

## WHAT REMAINS, SEPARATED

| layer | item | blocker type |
|---|---|---|
| **brand** | the permanent name | **product decision** — Decision 5 |
| **domain** | register it. **A sending domain cannot be a `vercel.app` subdomain** | owner action, gated on brand |
| **DNS / provider** | create the sending domain at the provider and publish the records it issues — SPF/TXT, DKIM, return-path/MX or CNAME. **The exact records are issued at creation and are not knowable in advance** | owner action, gated on domain |
| **production secrets** | `RESEND_API_KEY`, `PASSWORD_RESET_FROM_EMAIL`, `PRODUCT_NAME`, and `PASSWORD_RESET_FRONTEND_URL`/`FRONTEND_URL` if the public origin changes | owner configuration |
| **delivery verification** | `/health/ready` must report `passwordResetEmail CONFIGURED` | read-back, §297 rule |
| **end-to-end proof** | one real reset message reaching a real mailbox | the closure condition |

## IS ANYTHING ELSE AN ENGINEERING BLOCKER?

**No.** Every remaining item is brand, domain, DNS, owner configuration or verification. §320 found
nothing in the application waiting on engineering.

**One consequence to hold in view while EM-2 is open:** a participant who forgets their password is
**permanently locked out of that account**. There is no other recovery route. The designed
temporary support procedure (§317) is deletion and re-invitation, using the invitation itself as the
identity proof.

## PRODUCT-OWNER DECISION REQUIRED

Whether to close EM-2 before Beta (which requires the brand decision first), or to run the Beta with
the documented support procedure and no self-serve recovery.

---

# DECISION 8 — THE FIRST COHORT

No accounts were created and no participant information was used.

## PROVIDER SPEND BY COHORT — 30 DAYS, at $0.19083/analysis

| cohort | 1/day | 3/day | 5/day | 10/day (cap binds) |
|---|---|---|---|---|
| **3 users** | $17.17 | $51.52 | $85.87 | $90.00 |
| **5 users** | $28.62 | $85.87 | $143.12 | $150.00 |
| **10 users** | $57.25 | $171.75 | $286.25 | $300.00 |
| **20 users** | $114.50 | $343.49 | $572.49 | $600.00 |

Seven-day figures are 7/30 of these — a 5-user cohort at 5/day for a week is **$33.40**.
**The USD cap bounds every cell: no user can exceed $1.00/day while it is in force.**

## THE NON-MONETARY BURDENS

| cohort | support | recovery / monitoring | feedback | risk of outrunning the proven model |
|---|---|---|---|---|
| **3** | trivial; the owner knows everyone | trivial | **thin** — three people may simply not hit the interesting paths | none |
| **5** | small, and it is the size the project's own guardrails already assume ("the beta cohort is five people") | small | **adequate** — enough to surface workflow problems, not enough for rates | none |
| **10** | real. With **no support surface in the product** and **EM-2 open**, every lockout is a personal message | moderate; one nightly job, one webhook, one person watching | **good** | approaching it |
| **20** | **exceeds what one operator can carry** given no support surface, no self-serve recovery, and no one else on call | the monitoring runs on a **laptop scheduler**; 20 participants' data depends on that machine | good, but arrives faster than it can be acted on | **yes** |

**The binding constraint is not money.** Even 20 users at the highest ceiling is $600/month. It is
that **EM-2 is open, there is no support surface, and the nightly integrity job runs on a laptop** —
all of which scale linearly with participants while the operator does not.

## FACTUAL RECOMMENDATION

**Five participants.** It matches the cohort size the project's own claims guardrails were written
for, keeps 30-day provider spend at **$28.62–$143.12** depending on the HZ-11 decision, and keeps
support and recovery inside what one operator can carry with no support surface and no self-serve
recovery. Expand to ten once EM-2 closes and a support path exists.

## PRODUCT-OWNER DECISION REQUIRED

The size of the first cohort, and the spend ceiling they are willing to authorise.

---

# DECISION 9 — THE COUNSEL PACKAGE

## READY TO SEND NOW

| artifact | what it is |
|---|---|
| `claims-remediation-319/COUNSEL-HANDOFF-319.md` | **the cover document.** Six topics, each carrying the **actual deployed runtime wording** and its placement, marked ENGINEERING FACT / PRODUCT COPY / COUNSEL APPROVAL REQUIRED |
| `claims-substantiation-318/COUNSEL-HANDOFF.md` | the eight original questions with facts attached |
| `claims-substantiation-318/CLAIM-VOCABULARY.md` | approved, prohibited and qualification-required vocabulary |
| `claims-substantiation-318/HAZLENZ-CAPABILITY-BOUNDARY.md` | every capability classified PROVEN / BOUNDED / PARTIAL / NOT PROVEN / KNOWN LIMITATION |
| `claims-substantiation-318/STANDARDS-CITATION-ORIGIN-TRACE.md` | how a citation is produced, and why it is a suggestion rather than a determination |
| `claims-substantiation-318/CM-1-CLAIMS-SUBSTANTIATION.md` | 41 claims with verdicts and evidence |
| `project-docs/legal/` — 9 drafts | AI-provider disclosure, Beta privacy notice, controlled-Beta terms, product limitations, safety responsibility, feedback and data use, claims guardrails, counsel review packet, README |
| **this packet** | the retention facts (Decision 4) and the Beta-mode analysis (Decision 3) |

## WHAT COUNSEL MUST ANSWER

1. Does the deployed AI-provider disclosure discharge any applicable obligation, and is `/hazlenz`
   sufficient placement, or must it sit beside each use of "HazLenz AI"?
2. Is "Suggested standard" / "Supported by the evidence" the right formulation, and is the
   three-way distinction — suggested citation vs verified legal applicability vs compliance —
   adequately drawn?
3. Is the human-authority clause correctly stated, and does it need contractual support in Terms?
   **This is the most counsel-sensitive sentence engineering wrote.**
4. What may be said about "deleted" given ~70-day backup and 30-day recovery windows?
5. What consent or notice posture applies to workplace photographs of identifiable people?
6. What must Terms say to prevent reliance as a statutory examination record?
7. If the Beta charges, what disclosure, cancellation and refund terms are required?
8. Must Beta status be persistently visible, and is an acknowledgement marked
   `NOT_COUNSEL_REVIEWED` enforceable?

**Counsel is not asked to determine any engineering fact.** Every one is stated and traceable.

## PRODUCT-OWNER DECISION REQUIRED

Whether to send now, or to wait for the brand decision so the 17 brand occurrences in the legal text
are reviewed once rather than twice. **§320's view: waiting is cheaper, and brand lock is the
critical path either way.**

---

# DECISION 10 — ENTRY CRITERIA FOR THE FINAL PAGE-BY-PAGE REVIEW

**The review must not start because engineering is quiet.** It is expensive, it is the last
comprehensive pass, and anything settled after it starts invalidates part of it.

## REQUIRED BEFORE THE PAGE REVIEW

| item | why re-reviewing would otherwise be forced |
|---|---|
| **Brand** | the product name is on every page, every title, the footer and every report |
| **HazLenz naming** | 186 customer-visible strings |
| **Counsel-approved legal language** | Terms and Privacy are unpublished; activating them **changes the registration flow itself**, because the required-acceptance set derives from publication state |
| **Beta mode** | decides whether `/pricing`, `/upgrade` and the plan surfaces are shown, hidden or reworded |
| **HZ-12** | option 1 adds a customer-visible statement to the HazLenz step |
| **Support contact** | it does not exist; wherever it lands is a new element on a reviewed surface |

## CAN REMAIN OPEN DURING THE REVIEW

| item | why |
|---|---|
| **HZ-11** | a number in an environment variable. §319 already placed the sentence that will carry it |
| **EM-2** | the pages are built and deployed; the notice self-cancels the moment the credential is set, with no second deployment |
| **ST-3** | if Option A is chosen, the wording lands in the legal text, which is already in the counsel batch |
| **CS-3** | an entitlement-flag hygiene item with no customer surface |

## MUST BE COMPLETE BEFORE BETA BUT NOT BEFORE THE REVIEW

EM-2 activation and its end-to-end proof · HZ-11's value set and read back · the ST-3 wording once
counsel returns · the cohort decision · trademark clearance (TM-1 — **a MUST before public
availability, and the owner may knowingly carry it into a controlled invitation Beta**).

## FACTUAL RECOMMENDATION

**Gate the page review on six items: brand, HazLenz naming, counsel-approved language, Beta mode,
HZ-12 and the support contact.** Everything else can move underneath it without invalidating it.
