# EXPERT HAZLENZ — ARCHITECTURE AND EXECUTABLE CONTRACT FOUNDATION (2026-08-29)

> ### `EXPERT_HAZLENZ_CONTRACT_FOUNDATION_COMPLETE — REAL_PROVIDER_EVALUATION_AUTHORIZATION_REQUIRED`
> ### provider calls `0` · API cost `$0.00` · production untouched · nothing committed, pushed or deployed
> ### `EXPERT_HAZLENZ_IMPLEMENTATION_BEGUN = TRUE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE` · `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`

HEAD, branch and upstream are unchanged: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`, `main`,
`origin/main`, `0 ahead / 0 behind`. Four stashes and twenty tags untouched.

---

## 1. What was built, and what it is not

Nine new source files under `backend/src/safescope-v2/expert-hazlenz/` and four new deterministic
suites under `backend/scripts/`. **379 new assertions, 0 failed.** No existing production file was
modified. The only edit to an existing file is four script registrations in `backend/package.json`.

**This is a foundation, not a feature.** Expert HazLenz is not wired into the customer path, no
provider exists behind the interface, and no Expert output can reach a customer. Interfaces and
schemas existing is not the same as Expert HazLenz being implemented, and this document does not
claim otherwise.

## 2. The governing architecture, as executable data

```
DETERMINISTIC HAZLENZ + GOVERNED KNOWLEDGE  =  PROTECTED SAFETY / REGULATORY AUTHORITY
EXPERT HAZLENZ                              =  ADDITIVE REASONING ONLY
```

`expert-authority-matrix.ts` turns blueprint §98.6's freeze into a table a test iterates. It records
**twelve behavioural authority surfaces** — hazard recognition, decomposition, dangerous/life-critical
retention, condition state, negation/safe state, actionable classification, risk, jurisdiction,
governed citation, knowledge-release provenance, corrective action/workflow, and fail-closed/fallback
— each naming its authority source, a runnable evidence pin, the frozen contracts it inherits, and
exactly what Expert may do to it.

Every one of the **twelve frozen governance contracts** from §98.6 is claimed by at least one
surface; the suite asserts that no contract is left unclaimed.

**No surface anywhere in the matrix permits `SUPPRESS` or `MUTATE`**, and every surface degrades to
`SURFACE_UNCHANGED` when Expert is missing. Both are asserted across the whole matrix rather than
sampled, so a future row that grants removal fails a test instead of quietly widening authority.
Four surfaces — governed citation, release provenance, fail-closed, jurisdiction — do not permit
`ADD` either: on those, anything Expert could contribute would be a claim it is not allowed to make.

An unknown surface permits nothing. A product surface added without a matrix row gets no Expert
access by default.

## 3. The clarification carrier — repaired by shape, not by rule

**The defect named in the brief was already partly addressed, and the evidence says why it was not
the whole story.** L3-2i added a proposal-level carrier (`unresolvedDecisions`) so a question could
survive a zero-candidate proposal; L3-2j then declared it in the shipped prompt, measured the full
24-scenario corpus, and **put it back** because every activating configuration cost high-consequence
recall. L3 Run-2 later measured that on **13 of 13** clarification misses the model expressed no
question *in either carrier* — only 1 of 13 had zero candidates. **The coupling was not what was
losing the questions.**

So this phase does not re-repair the L3 carrier. It removes the possibility instead:
`decisionCriticalClarifications` is one of **four sibling collections** in the Expert contract, and
there is **no candidate-owned clarification field to fall back to**. A clarification cannot be
coupled to a hazard because there is nothing to couple it to.

All six required proofs pass (`test:expert-contract-foundation` section D):

| | proof | result |
|---|---|---|
| 1 | zero candidates + a valid decision-critical clarification survives | ok |
| 2 | a candidate and a clarification both survive, independently | ok |
| 3 | multiple clarifications retain identity **and** order | ok |
| 4 | an empty clarification collection remains valid | ok |
| 5 | a malformed clarification **fails schema validation** — issue emitted, collection and index recorded, item absent, and the good clarification beside it survives | ok |
| 6 | provider failure does not affect Level-1 | proved against a real merge in the merge and failure suites |

## 4. The merge layer — removal is structural, not policed

`expert-authority-merge.ts` keeps three separately typed collections and labels every entry
`DETERMINISTIC_AUTHORITY`, `GOVERNED_REGULATORY_AUTHORITY` or `EXPERT_ADVISORY`. **There is no
combined `findings` array** — the suite asserts its absence, because the moment one exists something
downstream renders it and the distinction that makes Expert safe disappears into a list.

The merge copies A verbatim, copies B verbatim, and appends C. **No branch reads an Expert value to
decide a protected one.** `verifyMergeInvariants()` then audits the result against its inputs across
eleven invariants — and section E of the merge suite tampers with merged objects to prove the
verifier actually looks, rather than always returning `[]`.

Expert **failure, timeout, malformed output, contradiction and omission** are five things to the
evaluation plan and exactly one thing here. For each, the protected halves of the merged result are
**byte-identical** to a merge with no Expert layer at all. A `HIGH`-confidence Expert claim that a
life-critical confined-space finding does not belong leaves that finding, and all four of its
required actions, untouched.

Governed provenance is likewise untouchable: an unapproved record stays unapproved, a `NULL`
`knowledgeReleaseId` stays `NULL` (Expert cannot back-fill history), and the release id is read from
the governed input at the one assignment in the file.

## 5. Provider failure semantics — fail open for availability, fail closed for authority

Fourteen failure kinds, **each exercised through the real runner and the real merge**: timeout,
network error, HTTP 4xx, HTTP 5xx, rate limit, exhausted credits, malformed JSON, schema-invalid
structured output, empty response, truncated response, provider refusal, unexpected model identity,
`PROVIDER_NOT_CALLABLE` and `NOT_CONFIGURED`.

`PROVIDER_NOT_CALLABLE` exists because the L3 provider-readiness gate recorded exactly that — a
provider that could not be reached with credentials provisioned and a shim written. It is a distinct
member because retrying it accomplishes nothing.

Also proved: a provider that **throws** is caught and classified rather than propagated
(`runExpertAnalysis` does not throw, ever — an Expert outage must not become an inspection outage);
an abort is `TIMEOUT`, not a network error; a response from an **unqualified model** is refused
*before* the boundary rather than scored as the qualified one; a **rejected** output is not retried;
and a success followed by a failure produces a failure — **no stale response is substituted**,
because no cache exists to substitute from.

## 6. The no-call harness — ten scenarios, zero calls, proved from source

Every provider response in the corpus is a literal in `fixtures/no-call-scenarios.ts`. Section D of
the harness **reads all nine module files and fails if any contains a network primitive, endpoint,
credential or vendor name**, so `PROVIDER_CALLS = 0` is a property of the code rather than a claim in
this document. It also asserts the replay provider was actually exercised (18 invocations), because a
harness that ran nothing proves nothing.

| | scenario | what it makes falsifiable |
|---|---|---|
| S01 | single obvious hazard | the ordinary case still works |
| S02 | genuine multi-hazard | a cross-hazard insight lands beside two unchanged findings |
| S03 | negated / safe state | an Expert candidate stays advisory and creates no finding |
| S04 | **zero candidates + question** | the clarification survives the whole pipeline |
| S05 | Expert-only candidate | additive recall lands as advisory, not authority |
| S06 | disagrees with Level-1 | the condition state is unchanged |
| S07 | disagrees with governed | approval is not conferred |
| S08 | malformed output | the required action survives a rejection |
| S09 | provider unavailable | the inspection is unaffected |
| S10 | **life-critical + total omission** | four required actions survive; indistinguishable from S09 on the protected side |

## 7. One protected guard was broken by this work, and the code was changed — not the guard

**`test:l32i-clarification-carrier` F3 and `test:l32j-carrier-activation` D5 failed** on the first
run of the new module. Both assert that nothing under `src/` outside the Level-3 module references
it, under the label `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.

Cause: `expert-contract.types.ts` imported `EvidenceReference` and the condition-state vocabulary
from the Level-3 contract, which models both well.

**The guard was not touched.** The Expert module was made self-contained instead, for two reasons
that agree: the guard is a real quarantine keeping an unaccepted tier off the customer path, and
that tier **failed its sealed acceptance** (`MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`, seven
gates) — coupling a newly authorized additive layer to it would make Expert inherit both the
quarantine and the fate.

A third fact was learned by tripping it and is now recorded in the source: **the guard is a content
grep, not an import-graph check.** It matches the directory name anywhere in a file, so a prose
mention in a comment breaks it exactly as an import does. Two references — one comment, one path
string in the evaluation corpus policy — were rewritten to describe the tier without naming it.

The duplicated vocabularies are deliberate and asserted: `test:expert-contract-foundation` section E
reads the Level-3 file **as data**, from a path assembled at runtime, and asserts the eight
condition states are identical. Reading is not depending. Both L3 suites are green again at **61/0**
and **37/0** — one assertion higher than before, because the containment check now also runs from
the Expert side.

## 8. Verification actually executed

Backend `tsc --noEmit`: **exit 0, clean.** No frontend source was touched;
`frontend-next/tsconfig.json` was hashed before and after and is byte-identical at
`73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` — the known contamination,
untouched.

| suite | result |
|---|---|
| `test:expert-contract-foundation` | **56 / 0** |
| `test:expert-authority-merge` | **51 / 0** |
| `test:expert-provider-failure` | **131 / 0** |
| `test:expert-nocall-harness` | **141 / 0** |
| **new Expert total** | **379 / 0** |
| `test:hazlenz-level1-recall` | **PASS** (17 checks) |
| `test:hazlenz-actionable-coverage` | **PASS** (17 checks) |
| `test:hazlenz-precision` | **PASS** — precision 100.0 %, forbidden 0, required secondary recall 100.0 % (43/43), dangerous omissions 0, life-critical omissions 0 |
| `test:l31-reasoning-contract` | 49 / 0 |
| `test:l32-semantic-contract` | 191 / 0 |
| `test:l32i-clarification-carrier` | **61 / 0** (was 60/1 mid-operation) |
| `test:l32j-carrier-activation` | **37 / 0** (was 36/1 mid-operation) |
| `test:l32b`…`l32g`, `test:l3-condition-state-resolution` | 105 / 86 / 71 / 82 / 77 / 57 / 155, all 0 failed |

The `test:hazlenz-precision` measurements are field-for-field identical to the §98.4 baseline at this
same SHA.

## 9. What was NOT done

No provider call. No API spend. No production access, read or write. No database migration, seed or
mutation. No Render change. No Stripe or payment action. No governed-rollout expansion — the
allowlist still names exactly one account. No commit, push, tag or deploy. No existing scorer,
threshold, expected result, assertion or protected guard was modified. The evaluation plan in §11 is
**specified and not executed**.

## 10. Residual debt, carried forward unchanged

1. **`test:kg5b-operator-cli` 64/65** — not re-run and not repaired by this operation; the pin at
   `scripts/test-kg5b-operator-cli.ts:416` is unmodified at HEAD. Classification unchanged.
2. **Unresolved-jurisdiction ranking behaviour** — preserved unchanged.
3. **`directObjectStatus: NOT_VERIFIED_LOCAL_TEST_PROVIDER`** — unchanged.
4. **`LIVE_PAYMENT_PROOF = FALSE`** — untouched, still
   `DEFERRED_UNTIL_FIRST_GENUINE_CUSTOMER_TRANSACTION`.

New, introduced by this phase and stated rather than hidden:

5. **The Expert contract has no prompt and no schema serialization.** A provider adapter must
   translate this contract into whatever structured-output form its transport requires, and that
   translation is unwritten. It is deliberately out of scope — a prompt written before a provider is
   selected is a prompt written for a guess.
6. **`M01_ADDITIVE_HAZARD_RECALL` and `M11_CROSS_HAZARD_REASONING` are reported, not gated.** Both
   are new capabilities with no baseline, and a floor guessed before any measurement is a floor that
   gets quietly lowered later.

## 11. The first provider evaluation — pre-registered, not run

`expert-evaluation-plan.ts` records **seventeen measures across four independent families** —
`SAFETY`, `REGULATORY_INTEGRITY`, `REASONING_QUALITY`, `RELIABILITY`. `evaluateGateFamilies()`
returns four verdicts and **has no aggregate field**, so a safety failure cannot be averaged away by
good explanation prose. An unmeasured hard gate **fails**; it is not skipped.

Zero-tolerance gates: contradiction with protected authority `0`, fabricated citations `0`, governed
provenance integrity `0`, life-critical retention `100 %`.

**The G9 lesson is carried forward explicitly.** L3 Run-2 pre-registered a hard 100 % cross-process
reproducibility gate, then measured from 400 responses that `temperature` was not forwardable and
`seed` had no equivalent — the gate was unreachable by construction, and learning that burned a
single-use holdout. So `M17_CROSS_PROCESS_REPRODUCIBILITY` is pre-registered as
`MEASURED_AND_REPORTED`, and precondition `P2_DETERMINISM_CONTROL` establishes by cheap probe —
**before any corpus is opened** — whether a determinism control exists at all. Promoting it to a hard
gate later is a governance act with its own authorization.

Corpus policy: the Run-1 and Run-2 sealed holdouts and the retired gauntlet/realism offsets are
**CLOSED**; gauntlet offsets 2 and 3, realism offsets 1 and 2, and the unopened 100-row
`gauntlet.seed` are **reserved**, each a different exam opened once. Development happens on
non-holdout cohorts.

## 12. Exact recommended next operation

**Provider selection and a priced transport probe — authorization required, and it is a spend
decision.** Not a corpus run. The probe should establish `P1_TRANSPORT_PROBE`, `P2_DETERMINISM_CONTROL`
and `P3_MODEL_IDENTITY` on non-corpus fixtures at a stated call count and ceiling, and it must
report which determinism parameters the transport actually accepts. Only after that does the choice
of a first evaluation cohort become answerable, and opening one needs `P4_PRESPEND_AUTHORIZATION`.

Preserving this work in git is a **separate decision**: `autoDeploy=yes` with
`autoDeployTrigger=commit` on `main` means pushing to `origin/main` is itself a production
deployment.
