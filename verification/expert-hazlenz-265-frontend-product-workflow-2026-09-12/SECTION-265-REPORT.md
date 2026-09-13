# §265 — THE LOCAL EXPERT PRODUCT WORKFLOW

**Terminal: `EXPERT_HAZLENZ_LOCAL_PRODUCT_WORKFLOW_IMPLEMENTED — BETA_READINESS_CLOSURE_REVIEW_AUTHORIZATION_REQUIRED`**

Provider calls: **0**. Production database operations: **0**. Pushes, tags, deploys: **0**.
§259 candidate identity before and after: `0b12adf6…70bee`, 22 elements, drift 0.
Protected modules touched: **0 of 29**.

---

## 1. What this section did

Two things, and they are one thing seen from two ends.

**The browser can now reach the Expert workflow**, from the HazLenz step of the inspection
workspace: request an analysis, read the result in whichever of the eight states it landed in, and
settle the one classification the analysis turns on. It is additive — the deterministic analysis is
unchanged and still rendered in full beneath it.

**The first downstream consumer of `effectiveDecision` is activated.** A finding whose review cites
a server-authored Expert analysis cannot be finalized unless that analysis carries a settled
operational conclusion.

The connective tissue is that neither end forms its own opinion about authority. The server derives
it once; the browser copies it; the consumer asks for it.

---

## 2. The one line that matters

```ts
const mayPresentAsSettled = decision?.settledForUse === true;
```

Not `state === "CONFIRMED" || state === "AVAILABLE"`. Not `!confirmationRequired`. A copy.

Any expression there would be a second opinion about authority formed in a browser, and the failure
mode of getting it wrong is telling an inspector that work may continue when no person has said so.
`frontend-next/scripts/check-expert-frontend-authority-boundary.mjs` fails the moment that line
stops being a copy.

That guard was **negatively tested**: `mayPresentAsSettled` was temporarily replaced with
`read.analysisState === "ANALYSIS_CONFIRMED"`, the check failed with two errors and exit 1, and it
passed again once reverted. A guard that has never been seen to fail proves nothing.

---

## 3. The downstream consumer, and why this one

§265 asked for the smallest consumer in the actual architecture at which a posture becomes a
consequential product fact. That is `InspectionService.finalizeFinding`: it writes the finding the
report reads, and on the `finalized` branch it creates a corrective action whose urgency derives
from the conclusion. §260 section 11 had already frozen it as BLOCKED pre-confirmation.

The guard is one call, placed after the review and its analysis are resolved and **before** the
transaction opens, so a refusal cannot leave a partially written finding.

It asks; it does not decide. The verdict, the reason and the customer-facing sentence all come from
`ExpertEffectiveDecisionService`. The consumer reads `producer`, and then nothing else about the
analysis — it never opens `analysisState`, `confirmationRequired` or `resultSnapshot`, so there is
no code path by which the raw Expert proposal could be preferred over a human settlement.

**It is scoped to the Expert path.** A review citing no analysis, or citing a `client_supplied` one,
reaches `NO_EXPERT_AUTHORITY_IN_PLAY` and is allowed exactly as before. Deterministic HazLenz is the
customer-authoritative path and §265 imposes no new precondition on it; doing so would have been a
product change nobody authorized.

### The module-graph problem, and why the derivation moved

`ExpertHazLenzProductModule` already imports `InspectionModule`. Leaving the one derivation inside
`ExpertAnalysisService` would have meant the consumer could not ask it without a cycle — and the
obvious way out of a cycle is to re-derive authority locally, which is precisely the failure
`deriveEffectiveDecision` exists to prevent, arriving through the module graph rather than through
carelessness.

So the derivation and its single settlement lookup moved into `ExpertEffectiveDecisionService`, in a
leaf module importing two repositories and nothing else. `ExpertAnalysisController` and
`InspectionService` both ask it. **There is still exactly one implementation**, and now there is no
structural reason for a second one to appear.

---

## 4. The read route

`GET /inspections/observations/:id/expert-analyses/current`, same guard profile as the two writes,
writes nothing.

It exists because a reviewer closes the tab and comes back. Without it the only ways for an
interface to know what state an analysis is in are to re-execute it — two provider legs to answer a
question the database already answers — or to cache the last response and keep believing it. The
second is how a settled conclusion gets rendered from a stale client copy. The read is not a
convenience; it is what makes "the server response is authoritative" survive a page reload.

It carries the **confirmation subject**, derived server-side under the same rule-version check §264
applies at settlement time. A frontend that worked out for itself which parts of a posture needed
confirming would be reimplementing the confirmation rule in a browser. A subject that cannot be
established is returned as a **named refusal** rather than an empty list, because an empty list and
"the rule version drifted" render identically otherwise, and only one of them means the confirm
button must not be offered.

---

## 5. Acceptance

| case | result | evidence |
|---|---|---|
| A ordinary admitted analysis, no confirmation | PASS | `ANALYSIS_AVAILABLE`, `EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED`, settled |
| B admitted, confirmation required | PASS | `ANALYSIS_AWAITING_CONFIRMATION`; subject resolvable, one entry, `NONE_AWAITING_HUMAN_CONFIRMATION`, not settled |
| C confirmation unchanged | PASS | `ANALYSIS_CONFIRMED`; `resultSnapshot` byte-identical before and after |
| D override / change | PASS | `ANALYSIS_OVERRIDDEN`; both sides carried; proposal byte-identical |
| E whole-analysis refusal | PASS | `ANALYSIS_REFUSED`; no content rendered; downstream also refuses |
| F contained refusal / preserved truth | PASS (expectation corrected — §6) | `ANALYSIS_UNRESOLVED`; refusal surfaced by declaration id and code |
| G preserved unresolved truth | PASS | `NONE_UNRESOLVED_TRUTH_PRESERVED`; distinguishable from F in the record |
| H unauthorized / cross-tenant | PASS | read 404, settle 404, forged reviewer id 400 |
| I duplicate / idempotent | PASS | 1 execution, 1 analysis, **1** first-pass leg for two requests; settlement retry REPLAYED, 1 review row |
| J provenance / version persistence | PASS | frozen §259 identity and five versions served; no raw payload |
| **K frontend withholds a settled decision while awaiting** | **PASS** | frontend suite — and a response with no derivation at all fails closed |
| **L downstream blocks an unsettled decision** | **PASS** | 409, **0** finding rows, **0** corrective actions |
| **M downstream consumes the confirmed decision** | **PASS** | the *same* review that was refused finalizes; exactly 1 finding |
| **N downstream consumes the override, not the proposal** | **PASS** | `HUMAN_REPLACED`; effective classification is the human value, Expert claim preserved alongside |

Server suite 76/76. Frontend presentation suite 59/59. Authority-boundary source checks 8/8.

Case K is executed by the **frontend** suite and not by the server suite. A browser rendering rule
cannot be proven by a server suite — the server suite can only prove the server said the conclusion
was unsettled. Claiming K on the server would be the weaker evidence pretending to be the stronger.

---

## 6. One preregistered expectation was wrong, and it was the expectation

Case F was written from §260's design table, which expected a contained declaration refusal to leave
an **admitted** analysis. It does not: §252 subsequently gave `PRESERVE_UNRESOLVED` precedence
deliberately, so both the contained shape and the whole-output shape surface as
`ANALYSIS_UNRESOLVED`. The current-state document already records this as accepted v1.0
limitation 3.

This is a stale expectation, not a defect, and §265 did not repair the product to satisfy it.

What §265 did instead is assert the behaviour the product actually has **and check the limitation's
own claim rather than repeat it**. The limitation says "the execution record distinguishes them".
Case G-5 measures that, and it holds: F carries `postureRefusalCodes: []` and G carries
`["DECLARATION_NOT_COVERED"]`, with `admission: PRESERVE_UNRESOLVED` on both. The states coincide;
the evidence does not.

---

## 7. What §265 did not do

- **No finding is created from an Expert analysis.** §265 added a **refusal**, not a creation. A
  settled analysis still reconciles zero findings and the API still says `findingsReconciled: false`.
- **Five of the six §260 section 11 downstream consumers are not guarded in their own right.**
  Completion readiness, corrective-action creation, report finalization and export, notifications
  and the executive summary reach an Expert conclusion only *through* a finalized finding today, and
  finalization is now gated. That is **containment, not a guard**: a future feature that reads an
  Expert analysis directly would bypass it. Recorded in the beta register as
  `REMAINING_DOWNSTREAM_AUTHORITY_GUARDS`.
- **Reviewer revision of a settled analysis: PRODUCT DECISION DEFERRED.** One settlement per
  analysis in the beta workflow. This is a scope decision, not a claim that the decision is
  permanently irreversible — and re-opening has a real open question attached, namely what it means
  for a finding already finalized on the settled conclusion.
- **Expert semantics, the §259 candidate, the confirmation-trigger rule and all 29 protected modules
  are untouched.**
- **No hosted provider leg was spent, no production database was contacted, nothing was pushed,
  tagged or deployed.**

---

## 8. What is proven, and against what

Everything here is proven against the **local stack**: a real HTTP application built from
`AppModule` with the production `ValidationPipe`, a disposable `test_insite_*` database migrated
from zero, and the §262 fail-closed transport seam answering every provider leg deterministically.

No deployed instance has served this workflow. `RUNNING_PRODUCTION_SHA` and
`LIVE_PROVIDER_TRANSPORT` remain UNVERIFIED_LIVE, and `hazlenz:verify` continues to report them as
their own outcomes rather than converting them into a pass.

---

## 9. Two record-keeping notes

**The §264 package digest recorded in the living index does not reproduce.**
`verification/current/EXPERT-HAZLENZ-STATE.json` carried
`0be6f8c33bc494cf0bf50440de4a3a933f3a00843e09183ed674358c596bfdae` for §264. Recomputing the
established digest — `sha256` of the section's `REPORT-<n>.sha256`, the method that reproduces §263's
recorded value exactly — yields
`a5cc5de113566d79de071457d245b735d87cd70ac38fa456420a3c0cad778ec3`, which is the value the §265
authorization itself carried. The §264 package verifies clean (`shasum -c REPORT-264.sha256`, 4/4
OK), so the frozen bytes are intact and only the living index held a value that cannot be derived
from them. Recorded rather than silently replaced.

**One accepted-evidence file had been deleted in the worktree before §265 began.**
`verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3e/source-evidence/ecfr-1910-146.xml`
was staged as deleted, with an untracked, byte-identical `ecfr-1910-146 4.xml` beside it — the
signature of an accidental Finder rename. §265 restored the tracked path from `HEAD`. The two files
are byte-identical (`d3dc555e…b182`), so no content was lost or changed, and the untracked duplicate
was left in place rather than deleted.
