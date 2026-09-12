# §255 — Whole-Product Beta Readiness: Blocker Inventory

Zero provider calls. Zero database operations. This is an inventory, not a plan and not an
implementation. Every quantitative figure is derived from evidence on disk by
`emit-255-boundary-and-inventory.ts`; the machine-readable form is
`SECTION-255-BLOCKER-INVENTORY.json`. Two entries are marked **UNVERIFIED** because the repository
does not establish them either way, and they are not guessed.

**8 blockers, 10 risks, 3 polish items, 6 accepted limitations.**

The question this answers: what stands between current Expert HazLenz and a production-ready Expert
HazLenz for human beta, given that consequential driver-role classification now requires human
confirmation.

---

## 1. Blockers to Expert capability

**E2 — Expert HazLenz has no production caller. `BLOCKER`**
`runExpertHazLenzAnalysis` is invoked by scripts only. No controller, route or service under `src/`
calls it. §246 made the validated path production-*callable*; nothing has made it
production-*called*. Everything proved in §246 through §254 is currently unreachable by a user. This
is the single largest gap between the Expert work and a beta.

**E3 — Delivered-analysis yield is 3 of 6. `BLOCKER`**
§254 refused three of six analyses outright on fresh, well-formed observations. The refusals are
correct and fail-closed, and no unsafe output escaped, but a beta user would receive no analysis half
the time.

This matters more than it first appears, because **only one of the three refusals is a driver-role
defect.** H5 is. H3 (declared an unresolved fact and never referenced it in the posture) and H4 (did
not quote its own control exactly) are independent of the §255 boundary and would still refuse under
human role confirmation. Human confirmation does not raise the yield.

**E4 — The verifier leg has never been exercised against Candidate v2.3. `RISK`**
§254 ran first-pass only by frozen spend design; the verifier was reached on 0 of 6. The §218
verifier contract is wired into the entry point but unmeasured on this candidate.

**E5 — `dischargingControlRef` gap. `RISK`** Carried forward, not encountered, distinct from the
capability result.

**E1 — Autonomous driver-role classification. `ACCEPTED`** Closed by §255 as a bounded limit.

## 2. Blockers to safe human beta

**B1 — No human-confirmation surface. `BLOCKER`**
The §255 boundary requires the continuation-controlling versus follow-up distinction to be
human-confirmed where it decides whether work stops, holds or continues. No such flow exists in
`frontend-next`, and the backend result contract carries no confirmation state.

**B2 — Fail-closed behaviour pending confirmation is unimplemented. `BLOCKER`**
Nothing yet prevents an unconfirmed classification from being presented as an operational conclusion,
because no consumer exists. It must be built with B1 and must never infer confirmation from silence.

**B3 — Expert is not customer-active. `BLOCKER`**
`customerDefaultMode` is LEGACY and production shadow is off. Deterministic HazLenz remains the sole
customer-authoritative path.

**B4 — Deployed code is behind local main and the worktree is large. `RISK`**
Deployed `45251d38a4e8`; local HEAD `37a5d1b50abe`; 2 commits ahead; **812 uncommitted worktree
entries**. `autoDeploy` is on for `main`, so a commit to main is a production deploy, while
migrations are applied out of band. Beta needs a controlled release plan agreed before any commit.

**B5 — The canonical readiness statement is stale. `RISK`**
`docs/INSITE_CURRENT_STATE.json` still describes the pre-§243 formal evaluation and its M14/M10 gate
failures. It predates §243 through §255 and would misinform anyone assessing beta readiness from the
authoritative document.

## 3. Product polish

**P1 — Stale architectural comment. `POLISH`** `expert-semantic-transport.ts` still explains why the
strict flag cannot be dropped. Behaviour is correct because the flag comes from the envelope, but the
envelope now binds `strict=FALSE` and the comment reads as an invariant that no longer holds.

**P2 — Historical suites carry known-failing assertions. `POLISH`** test-249, test-246 and the
adapter-repair suite fail by design under the accepted architecture. Ruled and classified, but a new
engineer running them sees red.

**P3 — Frozen TypeScript provenance error. `POLISH`** `POSTURE_REF_KINDS_237`, deliberately
unrepaired since §239.

## 4. Infrastructure, billing, storage, updates

**I1 — Expert unit economics are unmanaged. `RISK`**
§254 measured **43,713 input tokens and USD 0.1123 per analysis**. Input tokens dominate the cost and
**prompt caching is not configured** on the request envelope. No per-tenant spend cap or budget
control exists on the Expert path. At beta volume this is a real cost line and an abuse surface.

**I2 — Single free-plan backend instance. `RISK`** Cold starts and no redundancy, compounded by
Expert calls that take tens of seconds.

**I3 — Deploy and migration ordering hazard. `RISK`** Code ships on commit; schema does not.

**I4 — Production object storage provisioning. `RISK` `UNVERIFIED`**
Storage is S3-backed and the local provider correctly throws in production. Whether
`STORAGE_S3_BUCKET` and credentials are configured in the production environment is not established
by anything in the repository. Verify before beta.

**I5 — Billing live configuration. `RISK` `UNVERIFIED`**
Plans, entitlements, subscription status and Stripe customer identifiers exist in `src/billing`.
Whether live keys, products and webhooks are configured in production is not established by anything
in the repository. Verify before beta.

## 5. Legal, privacy, claims

**L1 — The claims register predates §254. `BLOCKER`**
`docs/PRODUCT-CLAIMS-REGISTER.md` already classifies "autonomous" as `NOT_CURRENTLY_SUPPORTABLE` and
"expert" as not supportable externally. §254 now corroborates both with direct measurement. The
permissible characterization §255 sets out must be recorded there before any beta-facing copy exists.

**L2 — Name and trademark clearance not performed. `BLOCKER`**
The register marks both "HazLenz" and "Safety InSite" `LEGAL_REVIEW_REQUIRED`. Engineering has no
view and cannot close this.

**L3 — Third-party model disclosure and data processing. `BLOCKER`**
Reasoning is performed by `claude-sonnet-5`. Observation text leaves the product to a third-party
provider. Subprocessor disclosure, a data-processing agreement and the customer consent posture are
required before real workplace observations are sent.

**L4 — "HazLenz AI" attaches to third-party reasoning. `RISK`** 57 occurrences,
`SUPPORTABLE_WITH_QUALIFICATION`, and the qualification is not yet in the copy.

## 6. Known accepted limitations

| | |
|---|---|
| A1 | Autonomous driver-role assignment not accepted for v1.0 (§255) |
| A2 | Single-call strict structured output infeasible on this provider (§251) |
| A3 | `dischargingControlRef` contract-consistency gap carried forward (§253, §255) |
| A4 | Frozen `POSTURE_REF_KINDS_237` TypeScript provenance error |
| A5 | Historical suites superseded by the strict flag and the §253 schema head |

---

## What the shape of this inventory says

The Expert semantic work is far ahead of the Expert product work. Transport, structural admission and
contract consistency are all closed and evidenced, and the capability boundary is now settled — but
**no user can reach any of it**, and on the evidence they would receive an analysis about half the
time when they could.

Three findings deserve attention before any beta plan is written, and none is a semantic experiment:

1. **E2 plus B1 and B2 are one piece of work.** Wiring Expert to a caller and building the narrow
   confirmation surface are the same integration, and doing either alone produces something that
   should not ship.
2. **E3 is independent of the §255 boundary.** Two of the three refusals have nothing to do with
   driver roles. Yield needs its own answer, and it is a question about how the model is asked for
   self-consistent output rather than about role semantics.
3. **I1 is measurable and largely addressable.** 43.7k input tokens per analysis with no prompt
   caching is the dominant cost term, and it is a configuration question rather than a capability
   one.

No further semantic experiment has been started, and none is proposed here.
