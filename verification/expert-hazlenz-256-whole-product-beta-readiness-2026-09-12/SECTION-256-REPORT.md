# §256 — Whole-Product Expert HazLenz Beta Readiness Review

Provider calls: **0**. Database operations: **0**. No production code changed. No remediation. No
commit, no push, no tag, no deploy. No Expert wiring. No confirmation UI. No prompt change. No
billing configuration. No storage provisioning. No deployment-setting change.

This section is review, classification, dependency analysis and execution sequencing only.

`§255` package digest verified intact: `cd21919d27147b4071502f08eadfa0a4c547bbd8da3308772bf542c089795c6c`
is the SHA-256 of `REPORT-255.sha256`, and all four member digests recomputed equal.

**One artifact was written during this review**: `PROTECTED-IDENTITIES.json`, regenerated as a
side effect of running the §229 protected-identity verifier, which writes by design. It is an
untracked evidence artifact, not production code. Composite identity over 29 protected modules,
0 missing: `9b3964b523c6fe513c1c38bb425a1f6860843de584c4a6a3eb4903f120ab85e9`.

---

## 1. Executive readiness conclusion

**Safety InSite v1.0 cannot enter a controlled human beta with Expert HazLenz today, and the
binding obstacle is not the one the register names.**

§255 concluded that the Expert semantic work is far ahead of the Expert product work. That is
correct and this review confirms it. But §255 ranked the gap wrongly in one decisive respect, and
the correction changes the first step of every sequence.

**The validated Expert candidate cannot be committed at all, because the production build fails.**
`npm run build` on the current worktree exits 2 on a single TypeScript error inside the candidate
contract chain. §255 recorded that error as `P3 — POLISH`, described as something "a new engineer
running the suites sees red." It is not polish. The file now lives under `backend/src/`, the
production `tsconfig.json` includes `src/**/*`, `build:render` is plain `tsc`, and the Dockerfile
runs it as `RUN npm run build:render`. A non-zero exit aborts the image build. Committing the
Expert candidate to `main` therefore does not deploy a broken product — it fails to deploy at all.

A second fact compounds it. **The entire validated candidate exists only as untracked files in the
working tree.** The production entry point, the whole `contract/` chain and the `owed-facts/`
directory are `??` in `git status`. Nothing proved across §246 to §255 is in any commit, on any
branch, or on any remote. The artifact this review is about is one disk failure or one careless
command away from gone, and the repository's own operating instructions forbid the destructive git
operations partly for that reason.

Everything else in the register is real but subordinate to those two facts.

Three further corrections matter for planning:

**The deployment baseline in the register is wrong.** §255 states production is at `45251d38a4e8`
with local HEAD two commits ahead. The reflog shows `de655d2f` was pushed to `origin/main` on
2026-08-28 at 22:16, after the 18:33 health check that established `45251d38`. With
`autoDeploy=yes, trigger=commit, branch=main`, production has almost certainly been running
`de655d2f` ever since, and that commit changed production behaviour in `src/standards/cutover/`.
Only `37a5d1b5` is genuinely unpushed. The true running SHA is not established by anything on
disk and needs a live check.

**The measured Expert unit cost understates production cost.** §254 measured 43,713 input tokens
and USD 0.1123 per analysis across six calls that were all first-pass. The production entry point
calls the verifier leg unconditionally whenever an admitted declaration exists, and it does **not**
consult `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED`, the literal-`false` gate the canonical state
document describes as keeping the verifier out of non-experiment runs. A production analysis that
admits a declaration makes two provider calls, not one.

**The delivered-yield problem is smaller and better understood than 3/6 suggests.** Read directly
from the raw §254 provider output, neither H3 nor H4 produced unsafe, incomplete or semantically
inconsistent work. Both produced substantively sound analyses that failed cross-reference
bookkeeping between two parallel carriers. Section 7 sets out the evidence. Neither invariant
should be weakened, and neither needs to be.

**Readiness verdict.** There is a concrete, short and defensible path to a controlled human beta.
It is roughly four workstreams, only one of which is on the critical path for the others, and the
first step costs almost nothing: put the candidate on a branch. Critical portions of the
infrastructure picture — production object storage, live billing, the running production SHA —
cannot be classified from repository evidence and are left explicitly unverified rather than
guessed.

---

## 2. Normalized register

27 items from §255, plus 12 established in this review. Machine-readable form in
`SECTION-256-NORMALIZED-REGISTER.json`.

Dispositions: `P0` blocks any external human beta. `P1` required during controlled beta or before
expansion. `P2` post-beta improvement. `ACCEPTED` disclose or design around. `UNVERIFIED` requires
live confirmation.

### §255 items, normalized

| id | §255 | §256 | change and reason |
|---|---|---|---|
| E1 | ACCEPTED | ACCEPTED | unchanged |
| E2 | BLOCKER | **P0** | confirmed independently: sole definition at `expert-hazlenz-analysis.ts:201`, every caller under `backend/scripts/`, zero NestJS decorators in the directory |
| E3 | BLOCKER | **P1** | **down.** Degraded, not unsafe, provided Expert is additive and refusal is surfaced honestly. Becomes P0 if Expert ever becomes the sole analysis path |
| E4 | RISK | **P0** | **up.** The development gate is not wired into the production entry point, so unmeasured verifier code would run on the user path and double the per-analysis call count |
| E5 | RISK | P2 | not encountered in §254; carried |
| B1 | BLOCKER | **P0** | confirmed: `ExpertHazLenzResult` carries no confirmation state |
| B2 | BLOCKER | **P0** | same workstream as B1 |
| B3 | BLOCKER | **P0** | dependent, not independent: it is the activation step of the E2/B1/B2 workstream |
| B4 | RISK | **P0** | **up.** See N4 and N5. The candidate is untracked and the deployed baseline is unestablished |
| B5 | RISK | **P1** | the stale canonical document is also the source §255 drew its deployment facts from |
| P1 | POLISH | P2 | stale architectural comment |
| P2 | POLISH | **P1** | **up.** Known-failing suites obscure regression signal exactly when beta needs it. Needs a ruled baseline, not repair |
| P3 | POLISH | **P0** | **up, decisively.** Breaks the production build. See section 9 |
| I1 | RISK | **P0** in part | spend ceiling and per-tenant cap are P0. Prompt caching is P2 |
| I2 | RISK | P1 | free instance, cold starts, against 12–38s calls |
| I3 | RISK | P1 | procedure requirement. Currently zero migration drift |
| I4 | RISK/UNVERIFIED | **UNVERIFIED** | provider constructs lazily, so a healthy service does not evidence provisioning. First upload would 500 if unset |
| I5 | RISK/UNVERIFIED | **UNVERIFIED** | and may not be required for beta at all. See section 13 |
| L1 | BLOCKER | P1 | the register edit is cheap. The live copy is the blocker, and that is N2 |
| L2 | BLOCKER | **P0** | legal owner. Engineering cannot close |
| L3 | BLOCKER | **P0** | observation text leaves the product to a third party |
| L4 | RISK | P1 | qualification not yet in copy |
| A1–A5 | ACCEPTED | ACCEPTED | unchanged |

### Established in this review

| id | disposition | finding |
|---|---|---|
| N1 | **P0** | Production build exits 2. Same root as P3, stated as a build fact |
| N2 | **P0** | Live customer copy claims "Autonomously identifies missing or ambiguous parameters" at `frontend-next/app/hazlenz/page.tsx:23`. The product's own register classifies "autonomous" `NOT_CURRENTLY_SUPPORTABLE`, and §254 measured exactly this capability below floor |
| N3 | **P0** | No Terms of Use and no Privacy Policy exist. `/legal` is a disclaimer only. Signup consent is a single acknowledgement checkbox, evaluated client-side, never transmitted and never recorded |
| N4 | **P0** | The validated candidate is untracked-only. No commit, no branch, no remote |
| N5 | **UNVERIFIED** | The running production SHA is not established. `origin/main` is one commit ahead of the recorded deployed SHA and `autoDeploy` is on |
| N6 | **P1** | `ExpertHazLenzResult.posture` is typed `unknown` and is shape-variant by status: the whole projection object on `COMPLETE`, the inner posture on `FIRST_PASS_REFUSED`. The §254 executor already navigates both shapes with `any` casts |
| N7 | **P0** | The verifier development gate is not wired into the production entry point. Basis for the E4 reclassification |
| N8 | **P1** | About 14,100 lines of acceptance-instrument material — fixtures, cohort and measurement contracts — now compile into the production bundle. Emitted files are 1,118 against the 1,071 recorded at §229 |
| N9 | **P1** | No error monitoring of any kind. No Sentry, Datadog, OpenTelemetry, Bugsnag or Rollbar anywhere in the repository |
| N10 | **P1** | Expert unit cost excludes the verifier leg. Folded into section 8 |
| N11 | P2 | `build-info.ts` fallback is a hardcoded June commit. Correct in production today because `RENDER_GIT_COMMIT` is set, misleading if it ever is not |
| N12 | P2 | `planEntitlements.ts` and `billing.ts` read `NEXT_PUBLIC_DISABLE_AUTH` without the `NODE_ENV !== "production"` guard that `auth.ts` and `AppShell.tsx` apply. Frontend display only; server enforcement is unaffected |

---

## 3. P0 beta blockers

Ten. For each: reason, consequence, dependency, smallest credible closure.

### P0-1 — The production build fails (P3, N1)

**Reason.** `src/safescope-v2/expert-hazlenz/contract/expert-237-posture-contract.ts(193,47)`
raises `TS2552: Cannot find name 'POSTURE_REF_KINDS_237'`. The name is never defined anywhere in
the repository. `tsconfig.json` includes `src/**/*`; `build` and `build:render` are plain `tsc`;
the Dockerfile runs `RUN npm run build:render`.

**Measured.** `tsc -p tsconfig.json` exits **2** while emitting 1,118 files including a runnable
`main.js`. The error is in type position only and has no runtime effect, but the exit code aborts
the Docker build before the artifact is ever used.

**Consequence.** The Expert candidate cannot be merged to `main`. A commit would fail the deploy,
not ship a defect. Today's deployed service is healthy only because the offending file is untracked.

**Dependency.** Blocks every commit of the candidate to `main`. Does not block committing to a
non-`main` branch.

**Smallest closure.** Define or import the missing constant so the type position resolves, with no
change to any emitted value. The five regression runners currently whitelist this exact string as
`allowedError`, so their expectations move with it. This touches a frozen contract module and is a
product-owner decision, not an opportunistic fix during implementation.

### P0-2 — The validated candidate is untracked-only (N4, B4)

**Reason.** `expert-hazlenz-analysis.ts`, the whole `contract/` directory and `owed-facts/` are
untracked. Seven further Expert files are modified-but-uncommitted.

**Consequence.** Total loss of the §246–§255 artifact on any disk failure or destructive command.
Protected-module digests are computed over files no commit pins.

**Dependency.** None. This is the one P0 with no prerequisite.

**Smallest closure.** Commit the candidate to a non-`main` branch. `autoDeploy` is bound to `main`
only, so a branch commit carries zero deploy risk and the broken build is harmless there. This
should happen before any other work.

### P0-3 — Expert has no production caller (E2)

**Reason.** Sole definition at `expert-hazlenz-analysis.ts:201`. Every caller is under
`backend/scripts/`. Zero `@Injectable`, `@Module` or `@Controller` decorators in the Expert
directory or its adapters, and no module imports them.

**Consequence.** Nothing proved from §246 to §255 is reachable by a user.

**Dependency.** Requires P0-1 before it can reach `main`. One workstream with P0-4, P0-5, P0-6.

**Smallest closure.** One authenticated, entitlement-gated server route that runs the entry point
and persists the result. `safescope-v2/classify` is the existing precedent: it already carries
`JwtGuard`, `EntitlementGuard('fullSafeScope')` and `RolesGuard`.

### P0-4 — No human-confirmation surface (B1)

**Reason.** `ExpertHazLenzResult` has no confirmation state. No flow exists in `frontend-next`.

**Consequence.** The §255 boundary cannot be honoured. Consequential classification would reach a
user unconfirmed or not at all.

**Dependency.** Same workstream as P0-3. Needs a schema migration, which activates I3.

**Smallest closure.** A pending-confirmation state on the persisted analysis that gates operational
presentation, plus a narrow confirm-or-change action. Section 11 sets out what already exists.

### P0-5 — Fail-closed pending confirmation is unimplemented (B2)

**Reason.** Nothing prevents an unconfirmed classification being presented as an operational
conclusion, because no consumer exists.

**Consequence.** The boundary would be decorative.

**Dependency.** Must be built with P0-4. Confirmation must never be inferred from silence.

**Smallest closure.** Presentation gated on recorded confirmation, with absence rendered as
"awaiting confirmation" and never as a conclusion.

### P0-6 — Expert is not customer-active (B3)

**Reason.** `customerDefaultMode` is LEGACY; production shadow is off.

**Consequence.** This is the current safe state, not an independent defect. It becomes a blocker
only in the sense that an Expert beta requires activating it.

**Dependency.** Last step of the P0-3/4/5 workstream, behind a flag.

**Smallest closure.** A flag that activates Expert for named beta accounts only, additive to the
deterministic path rather than replacing it.

### P0-7 — The verifier gate is not wired (E4, N7)

**Reason.** The entry point assembles and sends the verifier leg whenever an admitted declaration
exists. It does not import `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED`.

**Consequence.** Code never exercised against Candidate v2.3 — the §254 call ledger holds six
entries, all `PRIMARY`, all first-pass — would run on the user path, and every admitting analysis
would make two provider calls rather than one.

**Dependency.** Must be decided before P0-3 ships, because it changes both the risk and the cost
of every production call.

**Smallest closure.** A product-owner decision to either disable the verifier leg for beta, or
measure it before exposure. Either is defensible; leaving it unwired and unmeasured is not.

### P0-8 — Unsupportable capability claim in live copy (N2)

**Reason.** `frontend-next/app/hazlenz/page.tsx:23` reads "Autonomously identifies missing or
ambiguous parameters — such as worker proximity, equipment operational state, or control status —
and flags them as critical questions to resolve before finalizing findings."

**Consequence.** This is precisely the capability §254 measured at 2/6 admission-aware against a
5/6 floor, and precisely the word the product's own register classifies
`NOT_CURRENTLY_SUPPORTABLE`. Showing it to external beta users is an unsubstantiated capability
claim about a safety product.

**Dependency.** None. Fully parallel.

**Smallest closure.** Replace with the §255 permissible characterization, and record the amendment
in the claims register (L1).

### P0-9 — No Terms of Use, no Privacy Policy, no recorded consent (N3)

**Reason.** `/legal` is a 120-line disclaimer. There is no contract formation, liability
limitation, governing law, termination, acceptable use, data collection, retention, deletion or
subprocessor disclosure anywhere in the frontend. Registration gates on one checkbox whose state
(`acceptedTerms`) is evaluated client-side at `register/page.tsx:79` and is absent from the request
body.

**Consequence.** A paid tier exists at USD 24.99/month with no terms of service. Real workplace
observations would be collected and transmitted to a third-party model with no privacy policy and
no recorded consent.

**Dependency.** Overlaps P0-10. Fully parallel to all engineering.

**Smallest closure.** A Terms of Use and a Privacy Policy, linked from registration, with
acceptance transmitted and persisted against the user record.

### P0-10 — Third-party model disclosure and data processing (L3)

**Reason.** Reasoning is performed by `claude-sonnet-5`. Observation text — real workplace
conditions, locations, task context, potentially named individuals — leaves the product.

**Consequence.** Subprocessor disclosure, a data-processing agreement and a customer consent
posture are required before real observations are sent.

**Dependency.** None engineering-side. Blocks first external observation.

**Smallest closure.** Product-owner and legal decision, reflected in the privacy policy from P0-9.

### P0-11 — Name and trademark clearance (L2)

**Reason.** The register marks "HazLenz" and "Safety InSite" `LEGAL_REVIEW_REQUIRED`.

**Consequence.** Engineering has no view and cannot close it. Exposure scales with how public the
beta is: a closed cohort under agreement is materially lower risk than a marketed one.

**Dependency.** None.

**Smallest closure.** A product-owner decision on beta scope plus legal review. This is the one P0
where the right answer may be to accept the risk for a closed cohort and record that decision.

### P0-12 — Expert spend exposure is unbounded (I1, in part)

**Reason.** No per-tenant spend cap, no budget control, no concurrency limit on the Expert path.
The only limit is the global `ThrottlerGuard` at 100 requests per 60 seconds.

**Consequence.** With Expert wired behind that throttle alone, one authenticated account could
drive roughly 100 analyses per minute. At the measured USD 0.1123 per first-pass call, that is
about USD 11 per minute per account, before the verifier leg P0-7 would add.

**Dependency.** Must exist before any real user can reach the path, so it gates P0-6 rather than
P0-3.

**Smallest closure.** A per-tenant daily analysis ceiling enforced server-side, plus a global kill
switch. Prompt caching is an optimization, not a control, and is P2.

---

## 4. P1 controlled-beta requirements

| id | requirement |
|---|---|
| E3 | Delivered-analysis yield. See section 7. Not on the critical path, but closing it roughly doubles usable yield at no safety cost |
| B5 | Refresh `docs/INSITE_CURRENT_STATE.json`. It predates §243 and was the source of §255's incorrect deployment facts |
| P2 | Rule and record the known-failing suites so regression signal is readable during beta |
| I2 | Backend instance sizing. Cold starts on a free plan against 12–38 second analyses |
| I3 | Migration and deploy ordering procedure. Currently zero drift — 50 migrations at HEAD, production applied through `1800000018000` — but P0-4 introduces a migration and activates the hazard |
| L1 | Record the §255 permissible characterization in the claims register |
| L4 | Apply the qualification to the 57 "HazLenz AI" occurrences |
| N6 | Fix the shape-variant `posture` field before a product consumer is written against it |
| N8 | Decide whether acceptance fixtures belong in the production bundle |
| N9 | Error monitoring. A beta whose purpose is structured feedback cannot run blind |
| N10 | Re-measure unit cost with the verifier decision from P0-7 applied |

---

## 5. Accepted v1.0 limitations

A1 through A5 carry unchanged from §255, with E1 as the capability boundary itself.

- **A1** Autonomous driver-role assignment is not an accepted v1.0 capability. Consequential
  continuation-controlling versus follow-up classification is human-confirmed.
- **A2** Single-call strict structured output is infeasible on this provider. Replaced by
  non-strict transport plus deterministic whole-output admission.
- **A3** The `dischargingControlRef` transmitted-null versus projection-refusal gap carries
  forward. Not materially encountered in §254.
- **A4** The frozen `POSTURE_REF_KINDS_237` provenance error — **now reclassified P0 on the build
  evidence**. It can no longer be accepted as a limitation while it blocks the build.
- **A5** Historical suites superseded by the strict flag and the §253 schema head.

Two limitations from the canonical state document remain live and should be disclosed to beta
users rather than designed around: **silent non-declaration** has no architectural containment, and
**wrong-property selection** has proven containment but unmeasured rate.

---

## 6. Unverified live-environment items

Four. None guessed.

| id | item | why repository evidence cannot settle it |
|---|---|---|
| N5 | The running production SHA | `origin/main` is at `de655d2f`, one ahead of the recorded deployed `45251d38`, pushed 2026-08-28 at 22:16 — after the 18:33 health check that established the record. `autoDeploy` is on for `main`. Requires `GET /health` and reading `gitCommit` |
| I4 | Production object storage | `STORAGE_PROVIDER` defaults to `s3` outside test; `S3PrivateStorageProvider` throws without `STORAGE_S3_BUCKET`. Construction is **lazy**, inside `provider()`, so a healthy service proves nothing. If unset, the first evidence photo upload returns 500. Requires reading the Render service environment |
| I5 | Live billing configuration | Plans, entitlements, webhook signature verification and Stripe customer identifiers all exist in code. Whether live keys, products and webhooks are configured is not established. Requires the Stripe dashboard and the Render environment |
| I2 | Current instance plan | Recorded as Render free plan, one instance, as of 2026-08-28. Not re-verified |

The only backend-adjacent environment files on disk are Vercel frontend pulls. They establish that
`NEXT_PUBLIC_DISABLE_AUTH` is empty in production and the frontend points at
`safescope-backend.onrender.com`. They say nothing about the backend service environment.

---

## 7. H3 and H4 delivered-yield classification

**Classification: ACCEPTABLE REFUSAL BEHAVIOUR at the invariant level, POST-BETA IMPROVEMENT at
the representation level. Neither invariant should be weakened. Neither needs to be.**

This is the one place where reading the raw provider output changes the conclusion, so the evidence
is given before the judgement.

### H4 — what actually happened

The model wrote, in `requiredControls`:

> "Supervisor or permit issuer to track progress against the 15:30 planned finish and confirm
> before 16:00 whether work is complete, needs extension, or must cease"

and, in the controls driver's `dischargingControlRef`:

> "Monitor progress against the 15:30 planned finish time and ensure hot work ceases or is
> re-authorised before the 16:00 permit expiry"

These are the same control. Same times, same trigger, same three outcomes. The M8 check is
`controlTexts.has(ref.trim())` — trim-normalized exact string equality — so the output was refused.

### H3 — what actually happened

The model emitted one declaration, `decl-slab-capacity`, carrying the missing fact, both branches,
the decision under each, and the while-unresolved action. Its posture cited two hazard candidates,
one of them `cand-slab-capacity-unknown` with state `UNKNOWN`, gave it
`UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION`, and selected `HOLD_PENDING_VERIFICATION`. The
acceptance list was empty.

So the slab-capacity concern **was** the stated continuation-controlling driver of a protective
posture. What P3 caught is that the *declaration object* was not itself cited, because its
*candidate twin* was cited instead. The declaration schema carries no field binding a declaration
to a hazard candidate, so deterministic code cannot know they are the same subject — and correctly
must not infer it from prose.

### The six questions, for each

**1. What invariant caused the refusal.**
H3: §233 P3 coverage — every emitted declaration must appear in `requiredBy` or in
`acceptedWithoutImmediateAction`. H4: §247 M8 — a controls driver's `dischargingControlRef` must
resolve to one of the model's own `requiredControls`.

**2. What unsafe behaviour the invariant prevents.**
H3 prevents decision-critical silence: a declared unresolved fact that the posture never accounts
for, leaving a user with an open question and an unexplained recommendation. H4 prevents the shape
where controls drivers and controls coexist with nothing tying any of them together — the M8 case
that motivated the check.

**3. Was the rejected output unsafe, incomplete, internally inconsistent, or merely non-canonical.**
H4: **merely non-canonical.** The tie existed in substance; only its spelling failed.
H3: **internally inconsistent referentially, but not decision-critically silent.** Both of the
model's statements point the same way and the posture was protective. This is weaker than §254's
own reading, which described it as two statements that "do not agree."

**4. Is the invariant necessary at current strictness.**
Both: **yes.** P3's acceptance list is the escape valve that keeps it from being a stop-forcing
rule, and removing it would permit exactly the silence it exists to catch. M8 compares one
model-written string to another and judges no workplace fact. Relaxing either to raise yield would
be remediating a safety gate by making the system less exacting, which is not available.

**5. Can equivalent safety be established without demanding unnecessary model self-reference.**
**Yes, and this is the finding.** Both checks are discharged by asking the model to restate, in a
second location, a tie it has already established in the first. H4 asks it to copy a control
verbatim into another field. H3 asks it to cross-reference between two parallel carriers for the
same real-world unknown. In both cases the deterministic obligation could be carried by a
model-authored identifier rather than a model-authored restatement, and an identifier is checkable
at the same strictness with no copying burden. Supplying a link is a semantic assertion the model
is entitled to make; deriving it from prose is not.

**6. Where the problem belongs.**
**Contract design and deterministic representation** — not model capability, and not product
behaviour. This is the same class of defect in both cases, which is why they refused together.

### Product consequence

Of §254's three refusals, only H5 is a driver-role defect. H3 and H4 survive the §255
human-confirmation boundary untouched, so human confirmation does not raise yield — §255 is right
about that. But the corollary is better than §255 implies: the two non-role refusals are not
evidence that the model cannot produce sound analysis. On this evidence it did, twice, and the
contract refused the packaging.

A beta user would receive no Expert analysis on roughly half of observations. That is a real
degradation and a real trust cost. It is survivable for a controlled beta **provided** Expert is
additive to the deterministic path and refusals are surfaced honestly rather than rendered as
empty results. It is not survivable if Expert ever becomes the sole analysis path.

**No remediation is proposed here and none was performed.** The representation question is a
bounded design section of its own, and §256 is not it.

---

## 8. Cost and control classification

### Measured, and the correction

| | |
|---|---|
| §254 input tokens per call | 43,713 |
| §254 output tokens per call | 2,484 |
| §254 cost per call | USD 0.1123 |
| §254 calls | 6, all `PRIMARY`, all first-pass |
| System prompt size | **81,664 characters**, byte-identical across all six calls |
| Transmitted schema | six distinct values across six calls |
| `cache_control` in the request body | **absent** |
| Production calls per admitting analysis | **two**, not one — see P0-7 |

The system prompt is the single largest static component of the request and does not vary with the
observation, only with the governed-record count. It was byte-identical across all six §254 calls.
The transmitted tool schema, by contrast, is rebuilt per request and differed on every one. That
asymmetry decides the caching design: the system block is the sound cache target, and naive caching
of the tool block would not hit.

### Pre-beta controls

| control | present | disposition |
|---|---|---|
| Per-tenant spend cap | no | **P0** |
| Global kill switch on the Expert path | no | **P0** |
| Concurrency limit | no, beyond the 100/60s global throttle | **P0** |
| Request and token ceilings | partial — `max_tokens` bound in the envelope | P1 |
| Timeout | yes — `AbortController`, per-call `timeoutMs` | present |
| Retry policy | yes — `isRetryableExpertFailure`, auth and model-name failures excluded | present |
| Provider error taxonomy | yes — `PROVIDER_NOT_CALLABLE`, `RATE_LIMITED`, `HTTP_SERVER_ERROR`, `CREDITS_EXHAUSTED` | present |
| Attempt accounting | yes — `attemptTelemetry`, append-only, retries counted | present, but in-memory only |
| Cost attribution per tenant | no | **P1** |
| Observability | none | **P1** (N9) |

The adapter-level controls are genuinely good. What is missing is entirely at the product level:
nothing persists the telemetry, nothing attributes spend to a workspace, and nothing stops a
tenant.

### Post-beta optimizations

- **Prompt caching on the system block.** The dominant addressable term. `P2` as an optimization,
  though it may become economically necessary quickly.
- **Static-context caching** of the governed material that does not vary per observation.
- **Retrieval of only relevant governed material** rather than transmitting the full set.
- **Contract compaction** — recorded as available but **not recommended**. Capability equivalence
  would have to be demonstrated first, and §251 through §253 are recent enough that shrinking the
  contract to save tokens would put accepted capability at risk for a cost saving that caching
  achieves without touching semantics.

---

## 9. Repository and deployment sequencing

### Current state, established

| | |
|---|---|
| Local HEAD | `37a5d1b5` |
| `origin/main` | `de655d2f` — **one commit ahead of the recorded deployed SHA** |
| Recorded deployed SHA | `45251d38`, health-confirmed 2026-08-28T18:33:25Z |
| `de655d2f` pushed | 2026-08-28 22:16, **after** that health check |
| Genuinely unpushed | `37a5d1b5` only |
| Worktree entries | 813 |
| `autoDeploy` | yes, trigger=commit, branch=`main` |
| Migrations at HEAD | 50 |
| Production applied through | `1800000018000` = 50. **Zero drift** |
| Production build | **fails, exit 2** |

`de655d2f` changed `src/standards/cutover/` — the governed kill switch — so the behaviour running
in production is very likely not the behaviour the record describes.

### The 813 entries, classified

| class | count | disposition |
|---|---|---|
| `backend/scripts/` — experiment harnesses and instruments | 524 | Outside the production build. Commit as evidence, never as product |
| `verification/` — frozen evidence | 197 | Commit as evidence. Never edit |
| `backend/src/safescope-v2/` — the validated candidate and adapters | 40 | **Production build path.** The accepted Expert work |
| `tsconfig.scripts-*.json` | 26 | Per-section script configs. Evidence |
| Build and diagnostic artifacts, tracked-and-deleted | 11 | `build_errors.txt`, `build_output.txt`, `server_logs.txt`, `tsc_diagnostics.txt`, `report.pdf`, `pico.save`, and others. **Must never enter a production commit.** They are currently tracked in history and deleted in the worktree; committing the deletion is correct. A pattern scan of these files in `HEAD` for credentials, connection strings and bearer tokens found none |
| `docs/` | 8 | Canonical state and blueprint. B5 applies |
| `backend/src/safescope-v2/evidence/` | 2 files, 144 lines | **Production changes unrelated to Expert.** Must be classified and committed separately |
| `frontend-next/tsconfig.json` | 1 | Benign: two build-output type globs added |

Environment files are correctly handled: `.env*` is gitignored except `.env.example`, and only
`.env.example` is tracked.

### The safe sequence

1. **Establish the true baseline.** `GET /health` on the production service and read `gitCommit`.
   Nothing else should be planned against the recorded SHA until this is done.
2. **Preserve the candidate immediately.** Commit the 40 `src/` entries plus the evidence to a
   **non-`main` branch**. `autoDeploy` is bound to `main`, so this is zero deploy risk, and it is
   safe even with the build broken. This is the highest-value, lowest-risk action available and it
   has no prerequisites.
3. **Separate the unrelated production change.** The `evidence/` modifications are their own commit
   with their own justification.
4. **Close the build break** before anything targets `main`.
5. **Change the deploy trigger before the first `main` commit.** With `autoDeploy` on, there is no
   safe way to land unfinished beta work. Either disable auto-deploy for the duration, or move
   integration to a branch with a manual promotion step.
6. **Order migrations explicitly.** The P0-4 confirmation state introduces the first migration
   since drift reached zero. Additive and old-code-safe first, applied before the code that reads
   it, as the three §76-era migrations were.
7. **Rollback.** The deployed artifact is a Docker image, so rollback is a redeploy of the previous
   image. Any migration introduced must be additive so that rollback does not strand the schema.

**Candidate identity across integration.** The §254 pre-spend gate re-derives candidate identity
live from the production entry point rather than trusting a recorded value, and the authorized
identity is `293697746d7de52c1c5b8492592189e93211a0c986975832d8d8401bb258cfbf`. That mechanism is
the right one to carry through integration: identity must stay execution-derived from the assembled
request, never declaration-derived from a list of expected modules. It could not be re-run in this
review because the gate itself fails to compile on P0-1, which is a further consequence of that
blocker.

---

## 10. Expert integration dependency

The integration must make the **validated** candidate callable while preserving its boundary. The
coupled workstream A–F from the brief maps onto the repository as follows.

**A — production invocation.** One route. `safescope-v2/classify` is the precedent and already
carries `JwtGuard`, `EntitlementGuard('fullSafeScope')` and `RolesGuard`. Note that only
`ThrottlerGuard` is global: a new controller inherits authentication from nothing, so guards must
be explicit. 42 of 43 controllers are guarded today; only `health` is deliberately open.

**B — confirmation.** Section 11.

**C — preserving deterministic admission, RR-7, authority and settlement.** These live in protected
modules with pinned digests. The integration must call them, never reimplement them, and must not
modify them. Discovering that a change needs one is a stop-and-report event.

**D — refusal and unresolved behaviour.** `ExpertHazLenzResult.status` is already a three-value
vocabulary — `COMPLETE`, `FIRST_PASS_REFUSED`, `PROVIDER_FAILED` — and the entry point never
coerces a refusal into an answer. The product must render all three distinctly.

**E — traceability.** Already solved at the engine: every result carries `contractVersion` and
`entryVersion`. `hazlenz_analyses.engineVersion` is a `varchar(80)` that can carry both.

**F — user-visible distinction** between analysis, unresolved condition, required confirmation,
refusal and confirmed conclusion. This is the largest genuinely new surface.

**One integration defect must be fixed first (N6).** `ExpertHazLenzResult.posture` is typed
`unknown` and returns the whole projection object on `COMPLETE` but the inner posture on
`FIRST_PASS_REFUSED`. The §254 executor already works around both shapes with `any` casts and
reads `recommendationState` off the outer object. A product consumer written against this today
would be written against an ambiguity.

---

## 11. Human-confirmation dependency

**The substrate already exists, and this materially shortens the path.**

`hazlenz_analyses` carries `engineVersion`, `traceId`, `knowledgeReleaseId`, `idempotencyKey`,
`requestVersion`, a `current`/`superseded` status, a `jsonb` result snapshot, `advisoryStatus`
fixed to `advisory`, and `requestedByUserId`, under an advisory transaction lock with pessimistic
write locking and version conflict detection.

`human_reviews` carries a `decision` vocabulary of `accepted`/`edited`/`overridden`/`dismissed`, a
`rationale`, a `jsonb` `reviewedConclusion`, `reviewedByUserId`, links to both the analysis and the
finding, and a `current`/`superseded`/`invalidated` status.

So the product already records human decisions over model output, with provenance and supersession.

**The delta is precise.** The existing review is a *finding-level* review whose absence simply
means "not yet reviewed" — nothing is gated on it. The §255 boundary needs something different: a
state in which an analysis exists, is presentable as analysis, and is **not** presentable as an
operational conclusion until a human confirms the classification. That is a gating state, and it is
what does not exist.

Two constraints carry directly from §255 and must not be relaxed in implementation. The
confirmation stays **narrow** — the user reviews only the consequential conclusion and never
populates a role taxonomy or reconstructs the analysis. And silence is never confirmation: the
absence of a decision must never be read as evidence that a role is controlling or non-controlling.

One caution. `addAnalysis` currently persists a **client-supplied** `resultSnapshot` and
`engineVersion`. For deterministic HazLenz that is the established design. For Expert it would be
wrong: a confirmation boundary whose subject is client-supplied is not a boundary. The Expert path
must produce its result server-side.

---

## 12. Storage readiness

**Implementation: present and sound. Provisioning: UNVERIFIED.**

Private S3-backed storage with `LocalTestStorageProvider` for test and a correct fail-closed throw
when `STORAGE_S3_BUCKET` is absent. Files stream through the API under `JwtGuard` rather than via
presigned URLs, so objects are private by default. Access checks are organization-scoped on read
and delete, falling back to owner-scoped where no organization exists, and both paths write
security audit events. Uploads are idempotent on a client-minted request id, and only a `ready`
object counts as already-stored.

Against the beta requirements: inspection photos, evidence attachments and generated reports are
supported; access control and tenant isolation are implemented and audited; deletion exists as an
explicit authorized route.

**Gaps.** No retention policy and no automated deletion. No backup or recovery position stated for
the object store. Both are P1 for a beta handling real workplace imagery.

**The unverified part matters more than it looks.** The provider is constructed lazily inside
`provider()`, not at boot. A healthy `/health` therefore proves nothing about storage. If
`STORAGE_S3_BUCKET` is unset in production, the service starts cleanly and the **first evidence
photo a beta user uploads returns 500**. This must be confirmed before the cohort exists.

---

## 13. Billing readiness

**Code: substantially complete and better than the register implies. Live configuration:
UNVERIFIED.**

Server-side entitlement enforcement is real. `EntitlementGuard` routes through `EntitlementService`,
which treats a live `UserSubscription` row as authoritative over the JWT's cached plan claim, so a
token issued while Pro stops unlocking Pro once the subscription ends — verified against a Stripe
Test Clock in `verification/insite-billing-lifecycle-2026-08-17`. Denials are written to the
security audit log and return `PAYMENT_REQUIRED`. `@RequireEntitlement` appears 43 times. Webhook
signature verification uses `stripe.webhooks.constructEvent` against `STRIPE_WEBHOOK_SECRET` and
rejects unsigned events.

Frontend plan visibility is therefore **not** the enforcement mechanism, which answers the brief's
warning directly.

**One correction to the brief's premise.** There is no Company plan. `BILLING_PLAN_DEFINITIONS`
holds exactly two tiers — `free` and `pro` at USD 24.99/month. `company`, `expert`, `enterprise`
and `plus` are retired names that all normalize to `pro`. Company-plan gating and seat enforcement
are therefore not beta questions; they do not exist in the current model.

**Must billing be live for the first cohort? No — and it should not be.** Beta accounts can be
provisioned on `pro` entitlements directly, because entitlement resolution reads the subscription
row rather than requiring a Stripe round trip. That decouples the billing path from the beta
entirely: the cohort gets full access, no card is charged, no Terms-of-Use-for-payment question
arises for those users, and the billing lifecycle is validated separately against test clocks as it
already has been. Given P0-9, provisioning beta accounts without live charging is the safer route.

Unverified: whether live keys, products and webhooks are configured in production.

---

## 14. Security and privacy readiness

### Must exist before external beta

| item | state |
|---|---|
| Authentication | **present.** 42 of 43 controllers guarded; only `health` is open by design |
| Authorization and roles | **present.** `RolesGuard`, `SubscriptionGuard`, `EntitlementGuard` |
| Workspace isolation | **present** on the paths reviewed. Storage access is organization-scoped with owner fallback |
| Entitlement enforcement | **present, server-side and DB-authoritative** |
| Secrets handling | **sound.** `.env*` gitignored except `.env.example`; only `.env.example` tracked; a pattern scan of the tracked diagnostic artifacts found no credentials |
| Provider data transmission | **P0-10.** Observation text leaves the product |
| Privacy policy and consent | **P0-9.** Neither exists; consent is client-side and unrecorded |
| Error monitoring | **absent (N9).** P1 |
| Auditability | **present.** `SecurityAuditEvent` on entitlement denial and storage access |
| Rate limiting | present globally at 100/60s, but not Expert-specific (P0-12) |
| Adapter logging | **clean.** The Expert adapters log nothing, so prompts and observations are not written to logs |

### Production hardening after controlled beta

Retention and deletion policy, object-store backup and recovery, per-tenant cost attribution, and
the `NEXT_PUBLIC_DISABLE_AUTH` guard inconsistency (N12), which is frontend display only and
harmless while the variable is empty.

**No compliance certification is claimed.** None has been established and none is asserted here.

---

## 15. Legal and claims readiness

### Required before external beta

- **Terms of Use** — does not exist (P0-9).
- **Privacy Policy** — does not exist (P0-9).
- **Beta disclosure** — does not exist. Users must be told this is a beta and what that means.
- **AI and subprocessor disclosure** — does not exist (P0-10).
- **Recorded consent** — the registration checkbox is never transmitted (P0-9).
- **Removal of the "Autonomously identifies" claim** (P0-8).
- **The §255 permissible characterization recorded in the claims register** (L1).
- **Name and trademark decision** (P0-11).

### Required before general commercial release

Full substantiation of all `SUPPORTABLE_WITH_QUALIFICATION` claims in the register, including the
57 "HazLenz AI" occurrences and the 7 "proprietary" ones; the data-use and product-improvement
terms; and marketing performance claims.

### The claim boundary, preserved

The existing disclaimer is genuinely good on the points it covers: professional review required, no
compliance determination, no regulatory interpretation, user responsibility for inputs. It is
silent on everything that makes this a beta with a third-party model.

Two claims in live copy sit outside what the evidence supports. "Autonomously identifies..." is
P0-8. "HazLenz AI is proprietary decision-support intelligence" uses "proprietary" unqualified,
which the register classifies `SUPPORTABLE_WITH_QUALIFICATION` precisely because the reasoning
model is not ours.

**No accuracy or reliability percentage may be drawn from the six-case cohort.** Six cases do not
support a rate, and §255's own reopening rule forbids reusing them as anything but closed evidence.

---

## 16. Update, rollback and observability readiness

| capability | state |
|---|---|
| HazLenz version identification | **present.** `engineVersion` on every analysis |
| Candidate provenance on analyses | **available.** `contractVersion` and `entryVersion` on every result; `engineVersion` is `varchar(80)` and can carry both |
| Feature flags | **partial.** The governed cutover has modes, a kill switch and shadow authorization. Expert has no flag |
| Controlled rollout | **absent** for Expert |
| Rollback | **available** — redeploy the previous image. Constrained by migration additivity |
| Error monitoring | **absent (N9)** |
| Refusal monitoring | **absent.** Refusal codes exist on every result and nothing aggregates them |
| User correction capture | **present.** `human_reviews.decision` includes `edited` and `overridden`, with rationale and `reviewedConclusion` |
| Structured feedback | **partial.** The review record is the substrate |
| Accepted-versus-changed comparison | **possible** from `human_reviews` joined to `hazlenz_analyses` |
| Build provenance | present but with a stale fallback (N11) |

For the intended loop — real use, structured feedback, evaluation, bounded improvement, regression
testing, controlled release — the missing pieces are **error monitoring**, **refusal aggregation**
and an **Expert feature flag**. The feedback capture and provenance substrate is largely built.

---

## 17. Minimum end-to-end acceptance requirement

This is product-integration acceptance, not a semantic benchmark. It must not repeat §240 or §254,
and it must exercise the real product path rather than a harness.

**Shape.** One authenticated Pro-entitled user, one real inspection, one observation, through the
actual HTTP route, with the real entry point, the real admission layer and real persistence.

**The six paths that must be demonstrated.**

1. **Admitted analysis requiring confirmation.** Expert returns `COMPLETE` with a consequential
   classification. The unconfirmed result is visible as analysis and is **not** presented as an
   operational conclusion.
2. **Human confirms.** The conclusion becomes presentable. Exactly one recorded transition, by a
   named user, at a recorded time.
3. **Human changes the classification.** The change takes effect exactly, and the model's original
   classification cannot afterwards settle.
4. **Refusal.** `FIRST_PASS_REFUSED` reaches the user as an honest refusal with no fabricated
   analysis, and the deterministic path still delivers its own analysis.
5. **Provider failure.** `PROVIDER_FAILED` degrades safely, with no partial result presented.
6. **Persistence and provenance.** `engineVersion` carries the contract and entry version, the
   result snapshot is stored, and the audit event is written.

**Evidence.** The HTTP transcript, the resulting database rows, and the rendered UI state for each
path. Nothing derived from a script that bypasses the route.

**Denominator.** Six product paths. Not a semantic cohort, and not a rate.

**Preregistration.** Expectations authored and frozen before execution, and never redefined after
output is seen.

**What it does not establish.** It says nothing about semantic quality, population reliability, or
the rate of either Class A first-pass defect. Those remain open and must not be implied by a green
result here.

---

## 18. Dependency graph

```
                    ┌─────────────────────────────────────────┐
                    │ 0. PRESERVE THE CANDIDATE               │
                    │    commit to a non-main branch          │
                    │    NO PREREQUISITE. DO THIS FIRST.      │
                    └────────────────────┬────────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
┌───────────▼──────────┐   ┌─────────────▼─────────────┐  ┌───────────▼───────────┐
│ 1a. BASELINE         │   │ 1b. BUILD BREAK           │  │ LEGAL / CLAIMS        │
│  live /health SHA    │   │  P0-1 / P3                │  │  P0-8 P0-9 P0-10 P0-11│
│  N5                  │   │  blocks every main commit │  │  FULLY INDEPENDENT    │
└───────────┬──────────┘   └─────────────┬─────────────┘  └───────────┬───────────┘
            │                            │                            │
            └────────────┬───────────────┘                            │
                         │                                            │
            ┌────────────▼─────────────┐                              │
            │ 2. DEPLOY CONTROL        │                              │
            │  disable autoDeploy or   │                              │
            │  branch + manual promote │                              │
            └────────────┬─────────────┘                              │
                         │                                            │
            ┌────────────▼──────────────────────────┐                 │
            │ 3. EXPERT PRODUCT WIRING (ONE PIECE)  │                 │
            │   P0-3 route + P0-4 confirmation      │                 │
            │   + P0-5 fail-closed + P0-6 flag      │                 │
            │   requires: P0-7 verifier decision    │                 │
            │             N6 result-contract fix    │                 │
            │             one additive migration    │                 │
            └────────────┬──────────────────────────┘                 │
                         │                                            │
            ┌────────────▼─────────────┐                              │
            │ 4. SPEND CONTROLS  P0-12 │   ◄── gates user exposure,   │
            └────────────┬─────────────┘       not construction       │
                         │                                            │
            ┌────────────▼─────────────┐                              │
            │ 5. END-TO-END ACCEPTANCE │                              │
            │    section 17            │                              │
            └────────────┬─────────────┘                              │
                         │                                            │
            ┌────────────▼─────────────┐  ┌──────────────────────┐    │
            │ 6. OPERATIONAL CONFIRM   │  │ INDEPENDENT, ANYTIME │    │
            │   I4 storage (UNVERIFIED)│  │  N9 monitoring       │    │
            │   I5 billing (UNVERIFIED)│  │  E3 yield / H3 H4    │    │
            │   I2 instance sizing     │  │  B5 state refresh    │    │
            └────────────┬─────────────┘  │  P2 suite baseline   │    │
                         │                └──────────────────────┘    │
                         └───────────────┬────────────────────────────┘
                                         │
                            ┌────────────▼─────────────┐
                            │   CONTROLLED HUMAN BETA  │
                            └──────────────────────────┘
```

### Where this differs from the sequence the brief proposed

The brief's candidate order was: repository baseline → Expert wiring and confirmation → yield
decision → end-to-end acceptance → security, storage and operational controls → beta. Derived from
actual dependencies, three things move.

**Preservation splits out of "baseline" and comes first.** Committing to a branch has no
prerequisite at all — not the build fix, not the baseline check. It is the single most valuable
action available and the sequence should not wait on anything to take it.

**The yield decision leaves the critical path.** The brief places it third. H3 and H4 are
independent of the §255 boundary, independent of the wiring, and independent of confirmation. Yield
work can run in parallel throughout and does not gate beta, provided Expert is additive and
refusals are surfaced honestly.

**Legal and claims run fully parallel from the start, and they are the long pole.** Four of the
twelve P0 items are legal, none has an engineering dependency, and two need external input that
engineering cannot schedule. If they start when engineering starts, they will not be the reason the
beta slips. If they start after acceptance, they almost certainly will be.

### Independent workstreams

Legal and claims. Error monitoring. Yield representation. Storage and billing verification. The
canonical state refresh. The test-suite baseline. None blocks any other.

---

## 19. Recommended implementation sequence

1. **Commit the candidate to a non-`main` branch.** No prerequisite. Do it before anything else.
2. **Start the legal workstream.** It is the long pole and has no engineering dependency.
3. **Confirm the live production SHA** with `GET /health`.
4. **Close the build break** as its own change, against the frozen-chain rule, with the five
   regression whitelists moved with it.
5. **Decide the verifier question** (P0-7). It changes the cost and risk of every later step.
6. **Fix the result contract** (N6) before any consumer is written against it.
7. **Bring deployment under control** before the first `main` commit.
8. **Build the integration as one piece**: route, confirmation state, fail-closed presentation,
   flag. Additive migration first.
9. **Add spend controls** before any real user can reach the path.
10. **Run the end-to-end acceptance** in section 17, preregistered.
11. **Confirm storage and instance sizing** against the live environment.
12. **Add error monitoring** before the cohort exists, not after.
13. **Open the beta** to a named, agreed cohort.

Yield, the canonical state refresh and the suite baseline run alongside from step 1.

---

## 20. Deferred until after beta

- Prompt caching and static-context caching (I1 optimization).
- Retrieval of only relevant governed material.
- Contract compaction — deferred and **not recommended** without demonstrated capability
  equivalence.
- `dischargingControlRef` transmitted-null gap (E5, A3).
- The stale transport comment (P1) and the stale build-info fallback (N11).
- The `NEXT_PUBLIC_DISABLE_AUTH` guard inconsistency (N12).
- Removing acceptance fixtures from the production bundle (N8) — P1 to decide, post-beta to execute.
- Retention, deletion and backup policy for the object store.
- Population-level measurement of silent non-declaration and wrong-property selection. These remain
  measurement obligations for final acceptance and are **not** beta work.

**Explicitly not deferred and explicitly not reopened:** autonomous driver-role capability. The
§254 cohort is closed and may never be reused as a tuning set.

---

## 21. Provider calls

**0.**

## 22. Database operations

**0.**

## 23. Package digest

Recorded in `REPORT-256.sha256`. The package digest is the SHA-256 of that file.

## 24. Terminal

Repository evidence establishes a concrete beta path, and critical infrastructure portions cannot
be classified without live environment access and were left explicitly unverified.

    WHOLE_PRODUCT_BETA_READINESS_REVIEW_COMPLETE_WITH_LIVE_VERIFICATION_GAPS —
    CONTROLLED_BETA_EXECUTION_PLAN_AUTHORIZATION_REQUIRED

STOP.
