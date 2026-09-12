# §203 — SYSTEMIC AUTHORITY-BOUNDARY AUDIT

**Agent F — systemic authority-boundary auditor. STRICT READ ONLY.**
**Provider calls: 0 · Database operations: 0 · Repository files modified: 0 · Files created: 1 (this document).**
Date 2026-09-07.

This is the systematic sweep warranted by the independently corroborated §201/§202 finding class:

> A BOUNDARY DESCRIBED AS THOUGH ENFORCED, BUT ACTUALLY HELD ONLY BY A CALLER DEFAULT, A COMMENT,
> A TYPESCRIPT TYPE, PROMPT WORDING, OR EXECUTION CONVENTION.

No architecture decision is patched here. Every finding is analysis; every remedy named is a
candidate for a later authorized change, not a change.

---

## 1. Method and exact scope actually swept

**Method.** Every comment, doc block, identifier name, published constant and report sentence that
asserts an invariant ("never", "cannot", "only", "forbidden", "enforced", "guaranteed") was treated
as a claim to be checked, never as evidence. For each claim the actual enforcement mechanism was
established by reading the code, and — where cheap and side-effect-free — by executing the real
exported function with a hostile value from a throwaway script in the session scratchpad
(`agent-f-probes.ts`, run with `npx tsx`; it imports repository modules and writes nothing into the
repository). Findings demonstrated by execution quote the observed output.

**Swept in depth (read fully or in the load-bearing regions, claims traced to enforcement):**

- `src/safescope-v2/expert-hazlenz/expert-authority-merge.ts` (construction + invariant verifier + call sites)
- `src/safescope-v2/expert-hazlenz/expert-normalization.ts` (forbidden-field walk, string collection, boundary claims)
- `src/safescope-v2/expert-hazlenz/expert-runner.ts` (entire file)
- `src/safescope-v2/expert-hazlenz/expert-provider.ts` (contract + claims region)
- `src/safescope-v2/expert-hazlenz/replay-expert-provider.ts` (entire file)
- `src/safescope-v2/expert-hazlenz/expert-deterministic-projection.ts` (guard + projection + provenance stamp)
- `src/safescope-v2/expert-hazlenz/expert-input-constructor.ts` (header contract + anti-leak rule region)
- `src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts` (mint, apply, observability, published constants)
- `src/safescope-v2/expert-hazlenz/owed-facts/structural-questions.ts` (priority fallback anchor re-verified)
- `src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-observability.ts` (entire file)
- `src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation.ts` (entire file)
- `src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger.ts` / `owed-fact-binding.ts` /
  `verifier-v3-development-boundary.ts` (KNOWN-ledger anchor re-verification only — these are
  §187-pinned and were §202's principal subject)
- `scripts/lib/expert-202-rejection-cache.ts` (key derivation — the §202 red team's declared gap)
- `src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.*`
  (to close §202 UNVERIFIED-3 at the code level)

**Claim-triaged but NOT deep-swept** (claims counted by grep; these are measurement/cohort
contracts rather than data-path authority boundaries, and their claims were not individually traced):
`expert-authority-matrix.ts`, `expert-cohort-composition.ts`, `expert-cohort-contract.ts`,
`expert-evaluation-plan.ts`, `expert-measure-scorers.ts`, `expert-measurement-contract.ts`,
`expert-routing-metrics.ts`, `expert-corpus-retirement-registry.ts`, the `fixtures/` directory, the
remaining `scripts/lib/expert-*.ts` §195–§201 development modules, and Agent B1's §202
governed-binding contract/pipeline (54/54 suite of its own; not re-audited here). **No claim of any
kind is made about surfaces in this paragraph beyond "not swept in depth in §203".**

---

## 2. KNOWN ledger — §202 findings, current status verified against source

Anchors were re-read in the current working tree on 2026-09-07. "ANCHOR VERIFIED" means the exact
code the §202 inventory cites is still present at the cited location; the §202 suite
(`test-202-authority-boundary-guards.ts`, 83/83 at §202 close) re-executes the demonstrations.

| id | one-line status | anchor check |
|---|---|---|
| ABF-1 | declaring-stage validation still absent; key-shape accident still the only refusal | per §202 suite; not re-read |
| ABF-2 | provenance copy-through unchanged | per §202 suite; not re-read |
| ABF-3 | top-level scan tests `d`, not `d.nomination` | **ANCHOR VERIFIED** `owed-fact-binding.ts:136-141` |
| ABF-4 | provider-authored priority; two contracts still contradict | per §202 suite; not re-read |
| ABF-5 | terminal-status collision still silently no-ops | **ANCHOR VERIFIED** `owed-fact-binding.ts:205`, `owed-fact-ledger.ts:163` (`if (factOf(l, f.factKey)) return l;`) — this is §203 Agent C's remit |
| ABF-6 | fourth merge parameter still `owedFactCoverage?: unknown`, spread unconditionally | **ANCHOR VERIFIED** `expert-authority-merge.ts:176` |
| ABF-7 | projection scan still top-level only | per §202 suite; not re-read |
| ABF-8 | ceiling still a bare default parameter | **ANCHOR VERIFIED** `owed-fact-binding.ts:122` |
| ABF-9 | question priority fallback still reads the nomination | **ANCHOR VERIFIED** `structural-questions.ts:138` |
| ABF-10 | `CITATION_SHAPED_PATTERN` unchanged, blind spots stand | **ANCHOR VERIFIED** `expert-contract.types.ts:701` |
| ABF-11 | model-identity opt-in; classified D (documented, not a defect) | **ANCHOR VERIFIED** `expert-runner.ts:190-191`, plus dev-gate literal `verifier-v3-development-boundary.ts:41` re-read (`: false = false`) |
| BYPASS-1..8 | as recorded in §202 `RED-TEAM-CHALLENGE.md`; BYPASS-1 (citation detector coverage) is now also product-owner Ruling 2's stated ground | not re-executed |

**§202 UNVERIFIED-3 is now partially closed.** `PLACEHOLDER_CITATION_MARKERS =
['placeholder', 'review_required']` in `governed-evidence-derivation.ts:68` uses case-insensitive
substring matching, and the registry's own normalization uses the same two substrings with the same
semantics (`approved-knowledge-citation-normalization.service.ts:10`:
`original.toLowerCase().includes('placeholder') || original.toLowerCase().includes('review_required')`,
canonical status `placeholder_review_required`, `...types.ts:14`). The spellings agree **at the code
level**. Whether the two live registry rows carry exactly those markers remains unverified — reading
them is a database operation and §203 forbids database operations.

---

## 3. NEW findings

Each entry: the claim (quoted, file:line), what actually enforces it, classification, rank,
demonstrated-by, production reachability, and the narrowest boundary that could enforce it
(analysis only). Production reachability note common to all: `backend/tsconfig.json` includes
`src/**/*` only, the Expert layer has zero imports from outside its own directories
(§202-verified, re-relied-on here), and `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED` is a literal
`false` — so "reachable from production" below means "in the production build and reachable the day
the layer is activated", not "reachable by a customer today". Nothing below is customer-reachable
today.

---

### AB203-1 — the deep governance scan silently stops at depth 8, and silence looks like clean · **HIGH**

**Claim.** `expert-normalization.ts:214-217`: "Walks **every** nested key looking for a forbidden
governance field name. Deep rather than shallow because a provider that wants to send `citation`
will happily send `{extra: {citation: ...}}`, and a top-level check would pass it." And `:230`:
"Every free-text string in the payload, so a citation **cannot hide in prose**."

**Actually enforced by.** A recursion with a fail-open cap: `if (depth > 8 || ...) return;`
(`:219`), and the same cap in `collectStrings` (`:232`). A forbidden field or citation-shaped
string at nesting depth 9+ is not scanned, and the function returns exactly as it does on a clean
payload — the outcome the repository's own standard names as unacceptable: the check that cannot
inspect its target reports clean.

**Demonstrated by EXECUTION** (probe P1, real `normalizeExpertOutput`):

```
shallow {extra:{citation:'29 CFR 1910.147'}}      -> issues include FORBIDDEN_GOVERNANCE_FIELD
same citation wrapped at depth 11                 -> issues: ["CONTRACT_VERSION_MISMATCH"] only
```

The deep payload was refused solely for an unrelated version field my probe omitted; a conforming
payload would carry the version, and the citation at depth 9+ would cross the boundary unflagged.

**Classification** NO_ENFORCEMENT_FOUND (beyond depth 8). **Reachable:** in the production build;
the normalization boundary is the single choke point the whole layer's safety argument cites.
**Narrowest boundary:** the walk itself — depth exhaustion must be a fatal issue
(fail closed), never a silent return. Note the transport's `additionalProperties: false` does not
mitigate this: nesting depth is not property unknown-ness, and §202 UNVERIFIED-1 already declines
to treat the transport keyword as a guarantee.

---

### AB203-2 — a hand-built "validated" analysis skips the normalization boundary entirely · **HIGH**

**Claim.** `expert-runner.ts:8-10`: "**Nothing may skip a stage.** A provider result is raw
`unknown`; a normalized analysis is still only advisory". `expert-normalization.ts:6`: "Arbitrary
provider JSON never reaches the customer workflow. **It crosses here first**, or it does not cross".
`expert-provider.ts:110-113`: "`unknown` forces the result through `normalizeExpertOutput` — the
boundary is **enforced by the type system** rather than by a convention someone can forget".

**Actually enforced by.** The type system only — and the type is satisfiable by an object literal.
`ExpertLayerInput.validated` is a plain unbranded interface; `mergeExpertIntelligence` spreads its
contents into `expertAdvisory` (`expert-authority-merge.ts:196-206`) with no way to tell a
boundary-produced analysis from a literal one.

**Demonstrated by EXECUTION** (probe P2, real `mergeExpertIntelligence` + `verifyMergeInvariants`):

```
merged.expertAdvisory.explanation = "Per 29 CFR 1910.147 you must lock out. (never normalized)"
verifyMergeInvariants(merged, det, gov) = []
```

A citation-shaped sentence that `normalizeExpertOutput` would refuse
(`CITATION_SHAPED_TEXT_NOT_PERMITTED`) sits on the merged advisory with zero violations, because
the free-text citation scan lives only in the boundary that was skipped.

**Classification** TYPE_ONLY. **Reachable:** the merge is the exact function that will compose
customer-facing output on activation. **Narrowest boundary:** brand `ExpertValidatedAnalysis` with
a module-private `unique symbol` minted only inside `expert-normalization.ts` — the identical
pattern `settlement-review.ts:226-246` already uses and §202 already recommended for ABF-6. This is
the third confirmed instance of the unbranded-provenance class (with ABF-6 and AB203-3), which is
why it is a systemic finding and not a nit.

---

### AB203-3 — the "recorded human decision" behind settlement authority is an unbranded literal · **MEDIUM-HIGH**

**Claim.** `settlement-review.ts:274-279`: "THE PRODUCER. The only function in the repository that
constructs an `ADMISSIBLE_EVIDENCE` authority, and it **requires a recorded human decision**. …
**Nothing in a provider response can produce a `ReviewDecisionRecord` carrying `HUMAN_REVIEW`**".

**Actually enforced by.** Field equality over a plain unbranded interface. The
`SettlementAuthority` brand is real (module-private symbol, re-affirmed sound), but the trust root
one step upstream — the decision record asserting a human decided — is a plain object any code path
can literal, or parse provider output into.

**Demonstrated by EXECUTION** (probe P3): a literal
`{reviewerProvenance:'HUMAN_REVIEW', decision:'APPROVE_SETTLEMENT', reviewerId:'forged-by-anything', ...}`
mints: `authority minted: true, refusedBecause=[]`.

**Classification** CALLER_ONLY. **Reachable:** development-only settlement path today; it is also
the path the model-must-not-adjudicate rule depends on structurally. **Narrowest boundary:** brand
`ReviewDecisionRecord` at the point a human decision is actually recorded (the same symbol
pattern), or have `mintSettlementAuthority` accept decisions only from a recording registry it can
interrogate. The cross-checks that ARE sound are recorded in §5.

---

### AB203-4 — "raw preserved, never summarised away" is a typed literal, not a check · **MEDIUM**

**Claim.** `owed-fact-observability.ts:61-63`: "The raw response, **preserved whole. Never
summarised away.** `readonly rawPreserved: true`" — and the module header: evidence "has to be
PERSISTED rather than reconstructed afterwards", with `observabilityViolations()` said to "prove"
the properties.

**Actually enforced by.** The literal type on the flag. `observabilityViolations` tests
`!a.rawPreserved` (`:151`) — the flag, not the payload — and `reconstructionGaps` checks key
presence on the record, not on the attempt.

**Demonstrated by EXECUTION** (probe P5): an attempt appended with `rawResponse: undefined,
rawPreserved: true` passes both audits — `violations=[] gaps=[]`. The evidence is gone and every
auditor reports clean.

**Classification** TYPE_ONLY. **Reachable:** development observability only, but this is the
machinery the evaluation-evidence-persistence debt is measured with, so a false "preserved" here
contaminates exactly the record that debt is tracked against. **Narrowest boundary:**
`appendAttempt` refusing an absent `rawResponse`, and `observabilityViolations` testing the
payload, not the flag.

---

### AB203-5 — rejection-cache keys are forgeable by delimiter injection · **MEDIUM**

**Claim.** `expert-202-rejection-cache.ts:208-222`: `suppressionPrefix` is "what suppression
matches on", the deliberate distinction §200's recommendation lost — i.e. the key is presumed to
identify `(provider, model, stage, grammar)` uniquely.

**Actually enforced by.** Flat string concatenation with ` | ` and `grammar=` as unescaped
delimiters, over caller-supplied strings that are only trimmed.

**Demonstrated by EXECUTION** (probe P6): two **different** `(stage, effectiveGrammarIdentity)`
pairs produce the **identical** prefix:

```
stage='FIRST_PASS | grammar=G1', grammar='G2'  ->  ...stage=FIRST_PASS | grammar=G1 | grammar=G2
stage='FIRST_PASS', grammar='G1 | grammar=G2'  ->  ...stage=FIRST_PASS | grammar=G1 | grammar=G2
```

A key collision here converts directly into a **wrongly skipped row** — an attempt suppressed by a
rejection established for a different grammar — which is precisely the failure the three-state
accounting exists to keep out of denominators. Today every caller is the §202 harness supplying
sane tokens, so this is CALLER_ONLY in practice; the finding is that the key derivation itself
performs no validation. **This was the §202 red team's explicitly declared unchallenged surface.**

**Classification** NO_ENFORCEMENT_FOUND (structural encoding), CALLER_ONLY in current use.
**Reachable:** §203 experiment scope only (not in the production build). **Narrowest boundary:**
`suppressionPrefix`/`providerScopeDefects` refusing components containing the delimiter, or a
non-injectable encoding (length-prefixed or JSON canonical). Handing this to Agent E's §203
identity work is natural since the grammar identity string is one of the two injectable components.

---

### AB203-6 — single-use settlement scope depends on a caller-supplied default-empty list · **LOW**

**Claim.** `settlement-review.ts:253` (`scope: 'SINGLE_FACT_SINGLE_CLAIM_SINGLE_USE'`) and
`:240` "SCOPE, stated in the type and **enforced on use**".

**Actually enforced by.** `appliedClaimIds: readonly string[] = []` (`:349`) — the
`CLAIM_ALREADY_APPLIED` refusal cannot fire for a caller using the default, the same shape as
ABF-8's default-parameter ceiling. **Honestly mitigated in the code itself:** after a successful
application the fact is no longer `UNRESOLVED`, so a replay against the *current* ledger refuses
with `FACT_NOT_UNRESOLVED`; the gap is only a replay against a stale pre-transition ledger
snapshot, and the comment at `:340-343` states the caller-carried design openly.

**Demonstrated by** READING (probe P4's ledger-construction refusal, quoted in §5, blocked the
execution half — itself useful evidence). **Classification** CALLER_ONLY. **Rank LOW.**
**Narrowest boundary:** ledger-carried applied-claim ids, if the product ever wants SINGLE_USE to
be a property of the authority rather than of the calling convention.

---

### AB203-7 — `NEVER_PROJECTED_TO_PROVIDER` is enforced by a 200-character regex in one test · **LOW**

**Claim.** `settlement-review.ts:443-446`: "Fields this module must never project into a provider
request, recorded so a later edit that adds one **contradicts a published constant**."

**Actually enforced by.** One integration test
(`test-settlement-review-integration-2026-09-05.ts:320-322`) asserting membership plus
`!/projectOwedFact[\s\S]{0,200}reviewDecision/.test(moduleCode)` — a source-text heuristic that a
projection added in any other function, under any other name, or more than 200 characters from the
anchor passes silently. The constant itself is read by no production code.

**Classification** COMMENT_ONLY (constant + heuristic test). **Rank LOW** (the fields are also not
reachable from any current projection function). **Narrowest boundary:** the projection functions
themselves refusing keys in the published list.

---

### AB203-8 — provenance stamps are unbranded strings (third and fourth instances of the class) · **LOW**

**Claim.** `expert-deterministic-projection.ts:139-142`: rows are stamped
`DERIVED_FROM_PRODUCTION_ENGINE`; "this function never produces [a constructed row], **so a forged
disposition cannot be mistaken for a derived one**."

**Actually enforced by.** The stamp is a plain string field on an unbranded interface; any caller
can literal a row carrying it. Same class as AB203-2/AB203-3/ABF-6. The function's own conduct
matches its claim (READING); the claim's "cannot be mistaken" half is TYPE_ONLY.

**Classification** TYPE_ONLY. **Rank LOW** in isolation; the class (four confirmed instances) is
the systemic item — see §6.

---

### AB203-9 — the thrown-error classifier is a prose matcher inside the failure taxonomy · **INFORMATIONAL**

`expert-runner.ts:112`: `/timeout|timed out/i` over `error.message` decides `TIMEOUT` (retryable)
vs `NETWORK_ERROR`. A provider library whose non-timeout message mentions the word earns a retry it
should not; the module family's own standard ("no regex over prose") is not met by this one
classifier. READING. Consequence bounded by the retry ceiling of one.

---

### AB203-10 — "every formal provider request passes a check" is a harness convention · **INFORMATIONAL**

`expert-runner.ts:95-104` documents it itself: `mayIssueRetry` **absent means unbounded** (the
production default), and the initial request is gated only by the harness's own counter. The claim
about formal runs is CALLER_ONLY and is stated as such in the source; recorded here so the sweep is
complete, not because anything is misdescribed.

---

### AB203-11 — the merge-invariant verifier has no production-shaped call site · **INFORMATIONAL**

`verifyMergeInvariants` is called in `src` only from `fixtures/cohort-validation-fixtures.ts:446`.
The module is honest that construction, not the audit, is the enforcement
(`expert-authority-merge.ts:250`); recorded so no future report cites the verifier as a runtime
gate. DEFENSE_IN_DEPTH_ONLY, working as designed.

---

## 4. Summary table

| | CRITICAL | HIGH | MED-HIGH | MEDIUM | LOW | INFO |
|---|---|---|---|---|---|---|
| NO_ENFORCEMENT_FOUND | — | AB203-1 | — | AB203-5 | — | — |
| TYPE_ONLY | — | AB203-2 | — | AB203-4 | AB203-8 | — |
| CALLER_ONLY | — | — | AB203-3 | — | AB203-6 | AB203-10 |
| COMMENT_ONLY | — | — | — | — | AB203-7 | — |
| DEFENSE_IN_DEPTH_ONLY | — | — | — | — | — | AB203-11 |
| PROMPT_ONLY | — | — | — | — | — | — |
| ENFORCED_AT_BOUNDARY (checked sound, §5) | 8 boundaries re-affirmed or newly verified |

No CRITICAL: nothing found is customer-reachable today (production build boundary re-relied-on;
dev gate literal re-read at `verifier-v3-development-boundary.ts:41`).

## 5. Boundaries checked and found SOUND (so this audit can be checked, not only read)

1. **Owed-fact ledger construction fails closed, loudly.** Probe P4's deliberately sloppy fact was
   refused at `createOwedFactLedger` with a thrown, fully-itemised
   `OWED_FACT_SET_INVALID -- ... FACT_KEY_MISSING, EVIDENCE_SPAN_MISSING, BRANCH_MISSING, ...`
   (execution, output preserved in the probe log).
2. **The settlement-authority brand holds** (module-private symbol, `settlement-review.ts:226-246`)
   — re-affirmed; the defect found is upstream of it (AB203-3), not in it.
3. **`mintSettlementAuthority`'s five cross-checks are real** — claim/fact/digest mismatch,
   non-approving decision, blank rationale/reviewer all refuse (READING; code at `:286-296`).
4. **Retry ceiling of one is structural** in `runExpertAnalysis` — the retry block is straight-line
   code, not a loop (`expert-runner.ts:157-171`); a suppressed retry preserves the first attempt's
   real outcome and its cause (`:162`, `:169`).
5. **Attempt counters cannot disagree with their list** — recomputed from the appended list in
   `appendAttempt` (`owed-fact-observability.ts:120-128`), and `reconstructionGaps` cross-checks
   them (`:195-205`).
6. **`governed-evidence-derivation` fails closed on all five named grounds** with reasons, derives
   only from the record, and contains no comparison/matcher (entire file read; `:99-149`).
7. **Placeholder-marker spelling agrees with the registry's own normalization** (code level;
   §2 above), partially closing §202 UNVERIFIED-3.
8. **The replay provider is genuinely no-network** — no URL, fetch, client or credential in the
   file or its imports (entire file read).

## 6. AUTHORIZATION REQUIRED / product-owner items

1. **The unbranded-provenance class is systemic and now has four confirmed instances** — ABF-6
   (`owedFactCoverage`), AB203-2 (`validated`), AB203-3 (`ReviewDecisionRecord`), AB203-8
   (disposition stamp). The repository already contains the correct pattern
   (`settlement-review.ts` brand). Deciding to adopt it as the standard for authority-bearing
   attachments is an architecture decision — recommended for the successor path, not patched here.
2. **AB203-1 (depth-cap fail-open)** lands in `expert-normalization.ts` — a working-tree-modified,
   non-§187-pinned `src` file, but still an existing runtime file no §203 agent may modify.
   Repair needs its own authorization (successor or direct).
3. **AB203-5** is recommended input to Agent E's §203 effective-grammar-identity design (one of the
   two injectable key components is the identity string).
4. Everything already listed under §202's AUTHORIZATION REQUIRED remains open and is not
   re-listed.

## 7. Self-verification

- This document contains no raw NUL byte (written as UTF-8 text; the escaped sequences above are
  seven-bit characters; to be re-asserted by Agent A's `verify-203-text-integrity` gate).
- Repository modifications by Agent F: **zero**. Deliverables created: **one** (this file).
  Probe script lives in the session scratchpad, outside the repository.
- Provider calls 0; database operations 0; no §187-pinned file opened for writing; no semantic
  verdict of any kind supplied; the 120-verdict adjudication denominator untouched (0/120).
