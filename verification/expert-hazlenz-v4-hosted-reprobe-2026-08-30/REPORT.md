# §106 — EXPERT HAZLENZ v4 BOUNDED HOSTED RE-PROBE (2026-08-30)

> ### `EXPERT_HAZLENZ_V4_HOSTED_REPROBE_BLOCKED — HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED`
> ### Hosted calls attempted **7** · completed clean **0** · actual spend **$0.00** · 0/7 reached generation
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

**An unrelated incident occurred during this operation and is documented in full in
`INCIDENT.md` in this directory: running the frozen probe overwrote the raw evidence file for
§105.0's real hosted run (a hardcoded, non-run-scoped output path). It has been reconstructed from
the session transcript, the aggregate figures it depends on are exact, and the bug is fixed so it
cannot recur. Nothing else in this report is affected by it.**

---

## Phase 0/1/2 — preflight

HEAD `37a5d1b50abe836eb19dd24ee18ad10557bda131`, `origin/main` `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`,
1 ahead / 0 behind, 4 stashes / 24 tags unmoved. `frontend-next/tsconfig.json` sha256
`73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` — unchanged. `ANTHROPIC_API_KEY`
PRESENT in `backend/.env` (recorded as PRESENT/ABSENT only). Provider `anthropic`, model
`claude-sonnet-5`, prompt `hazlenz.expert.prompt.v4`, contract `hazlenz.expert.analysis.v2`, thinking
disabled, `P2_DETERMINISM_CONTROL = ABSENT` (pre-registered, unchanged from §105.0 — no sampling
controls added, none were available before). Ceilings: 8 calls / $3.00.

## Phase 3 — the frozen probe was executed exactly once, unmodified

`npm run probe:expert-hosted-transport`. 7 calls planned, 7 attempted. **All 7 returned HTTP 400 in
136–433 ms** — far faster than any real generation call (§105.0's real run ranged 6.6 s to 32 s for
the same fixtures). `failureKind = HTTP_CLIENT_ERROR` on all 7; the classifier's credit-exhaustion
pattern did not match, so this is not a billing block. **0 tokens billed, $0.0000 actual cost** —
transport-level rejections are not billed. Raw transport log and console output are in
`transport/`.

**No fixture, prompt, schema or boundary code was modified between calls, and none was modified
after seeing the first failure before the remaining six ran** — the probe ran its fixed internal
loop to completion unattended.

## Phase 4 — required questions

Every question below has the same answer for the same reason: **none of the 7 calls reached
generation**, so none of them produced an `ExpertAnalysis` to measure. Reporting these as `PASS` or
`FAIL` would misrepresent an unmeasured field as a measured one — the same error this whole
programme has been built to avoid (§104, §105.0's own gate table: *"an unmeasured field is never
counted as a pass"*). All are **NOT MEASURED**.

- **Q1 — `HG08`: NOT MEASURED.** No zero-candidate case produced an analysis to check.
- **Q2 — `HG11`: NOT MEASURED.** No multi-collection case produced an analysis to check.
- **Q3 — `HG12`: NOT MEASURED.** The negative control produced no analysis either way. **The local
  repair's effect on `HG12` is NOT claimed to be confirmed or refuted by this run**, per this
  operation's own instruction.
- **Q4 — H7/H8 grounding:** for both fixtures — candidate produced? **no** (transport rejected before
  generation). `groundingStatus`? n/a. Quote emitted? n/a. Exact/governed substring? n/a. Accepted/
  rejected? n/a — no candidate object ever existed. Entire analysis rejected? **the REQUEST itself
  was rejected**, which is upstream of "analysis rejected." `GROUNDING_OPPORTUNITIES = 2` (fixed by
  the fixture set, unaffected by transport outcome), `QUOTES_EMITTED = 0`, `EXACTLY_BOUND = 0`,
  `UNBINDABLE = 0`, `FABRICATED = 0`, `GROUNDED_TYPED_OBJECTS = 0`, `UNGROUNDED_TYPED_OBJECTS = 0`
  (not 10, and not §105.0's 10 either — nothing was produced to count as ungrounded).
- **Q5 — evidence cliff: NOT REACHED.** Sonnet 5 never got the chance to attempt a quote, so it
  cannot be determined whether it exhibits the local model's copying error (§105 §7's `R5` finding).
  **This is the single most consequential unanswered question left by this run**: the risk flagged
  in §105.0 (*"if it makes the same class of copying error, a hosted analysis is lost whole"*) is
  neither confirmed nor ruled out.
- **Q6 — outcome/content consistency: NOT MEASURED.** No `outcome` field was ever returned.
  `OUTCOME_CONTENT_INCONSISTENCIES = 0` (of 0 measured, not 0 of 7 passing).
- **Q7 — explanation-only loss: NOT MEASURED.** No `expertExplanation` or `uncertainty` content was
  ever returned. `EXPLANATION_ONLY_LOSSES = 0` (of 0 measured).

## Diagnosis — offline evidence, not a live confirmation

The provider's sanitized error type (`error.type` from the response body — the only part of a 400
body this codebase ever reads, per `errorTypeOf()`) was **not captured**, because the frozen probe
script records `failureKind` but not that field, and no additional live call was made to retrieve it
— making one was judged to fall under this operation's restriction against using calls beyond the
frozen seven for anything but "an objectively necessary transport retry." **The diagnosis below is
therefore an inference from structural and timing evidence, stated at the confidence that evidence
supports, not a lab-confirmed result.**

Built the exact request body **offline, $0, no network call**, from the unmodified
`buildAnthropicRequestBody()` / `buildExpertWireSchema()` the probe itself uses
(`diagnostics/offline-schema-inspection.ts`, output alongside it). Findings:

- `tools[0].strict = true` — Anthropic's strict tool-schema mode, which validates the schema itself
  before any generation.
- The schema declares **15 `minLength: 1` constraints and 1 `minItems: 2` constraint** throughout —
  exactly the §105 additions that closed RC2 (the wire-schema-weaker-than-boundary defect).

`minLength`/`minItems`/`maxLength`/`maxItems`/`pattern`/numeric-range keywords are, by the pattern
matching most providers' strict/structured-output JSON Schema subsets (including this same
Anthropic integration's own comment, elsewhere in this file, about `additionalProperties: false`
being "a requirement of Anthropic's strict tool schema" — i.e. this file already tracks
provider-specific strict-mode requirements as a known, narrow concern), a plausible class of
keyword this mode does not accept. Combined with **7/7 uniform 400s at 136–433 ms** — a profile
that matches request-validation-time rejection, not the 6.6–32 s profile of §105.0's real
generation calls — this is assessed as the **most probable cause**, not a confirmed one.

**This is reported as a finding, not repaired.** Removing `minLength`/`minItems` from the
Anthropic-facing wire schema (while leaving them, and the boundary's independent
`isNonEmptyString`/participant-count checks, untouched for the local provider and for
`expert-normalization.ts`) is a plausible remediation — but it is a schema change, which this
operation explicitly prohibits performing "during the hosted measurement." It is named as the exact
next recommended operation instead.

## Phase 5 — comparison to §105.0 (the real v3 hosted run)

| measure | §105.0 (v3, real) | §106 (v4, this run) |
|---|---|---|
| calls completed clean | **7 / 7** | **0 / 7** |
| HTTP failures | 0 | **7 (all HTTP 400)** |
| routing opportunities · hits · misses · over-routed | 13 · 7 · 4 · 2 | **0 · 0 · 0 · 0 (not measured)** |
| `HG08` | FAIL | **NOT MEASURED** |
| `HG11` | FAIL | **NOT MEASURED** |
| `HG12` | FAIL | **NOT MEASURED** |
| grounding opportunities | 2 | 2 (fixture count; unaffected) |
| quotes emitted · exactly bound | 0 · 0 | **not measured · not measured** |
| unbindable · fabricated | 0 · 0 | not measured · not measured |
| grounded · ungrounded objects | 0 · 10 | **not measured · not measured** |
| explanation-only losses | 0 | not measured |
| analysis-fatal evidence failures | 0 (no candidate ever attempted a quote) | not measured |
| outcome/content inconsistencies | not instrumented at the time | not measured |
| input / output tokens | 40,269 / 9,049 | **0 / 0** |
| cost | $0.171028 | **$0.0000** |
| latency (p50 / max) | 20,869 ms / 32,026 ms | **148 ms / 433 ms** |

**No causation beyond what was measured is claimed.** The comparison shows a v3 run that reached
generation on every call and a v4 run that reached generation on none. It does not show whether v4's
Expert BEHAVIOUR (routing, grounding, the evidence cliff) is better, worse, or unchanged from v3 —
that remains entirely unmeasured.

## Phase 6 — terminal

```
EXPERT_HAZLENZ_V4_HOSTED_REPROBE_BLOCKED — HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED
```

Selected because the failure is neither a credential problem (the credential worked — the request
reached the provider and got a substantive HTTP response, not an auth-stage rejection) nor an
Expert-behaviour failure (no behaviour was ever exercised) — it is a transport-format
incompatibility that "prevents valid measurement," which is this terminal's own definition. Terminal
C (further local behaviour repair required) does not fit: nothing about Expert's *behaviour* failed;
the *request* never reached the model. Terminal B (architecture decision required) does not fit
either: this is not the `EVIDENCE_OUT_OF_BOUNDS` cliff — that cliff requires a candidate to exist
first, and none did.

## Phase 7 — protected regression (zero provider calls, re-run fresh for this operation)

| suite | result |
|---|---|
| `expert-contract-foundation` | **56 / 0** |
| `expert-authority-merge` | **51 / 0** |
| `expert-provider-failure` | **131 / 0** |
| `expert-nocall-harness` | **141 / 0** |
| `expert-routing-contract` | **58 / 0** |
| `expert-grounding-contract` | **40 / 0** |
| `l32i-clarification-carrier` | **61 / 0** |
| `l32j-carrier-activation` | **37 / 0** |
| HazLenz core · precision · level-1 recall · actionable coverage | exit 0 · exit 0 · exit 0 · exit 0 |
| HazLenz precision detail | dangerous omissions **0**, life-critical omissions **0** |
| backend `tsc --noEmit` | **exit 0** |

Forbidden-emission and citation-laundering checks (the task's "forbidden emissions" /
"Population-A precision" items) are covered within `expert-contract-foundation`
(`CITATION_SHAPED_TEXT_NOT_PERMITTED`, `FORBIDDEN_GOVERNANCE_FIELD`) — no separately named suite
exists under those literal names, and none was invented.

**Confinement:** 15 files reference the Expert module, unchanged from §105. **No** controller,
service or module; **no** frontend reference; the hosted adapter has **exactly one importer**
(the hosted probe itself). Confirmed **no regression suite imports the hosted adapter** — the
protected zero-provider-call floor made zero hosted calls.

`EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`. `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. Production and
customer behaviour untouched.

## Exact next recommended operation

**Not authorized here — this is a recommendation, not an action taken.** Diagnose, with the account
owner's authorization, whether Anthropic's `strict: true` tool-schema mode rejects `minLength` /
`minItems`, most cheaply by making one minimal, isolated live call with those two keywords stripped
from a copy of the wire schema (leaving the boundary's independent enforcement of the same
properties untouched) and observing whether it returns 200. If confirmed, the remediation belongs in
the Anthropic adapter's schema wrapper (`applyStrictSchemaWrapper` or a sibling function) — a
provider-specific transport adjustment, not a change to the wire schema every provider receives, and
not a change to `expert-normalization.ts`, which would keep enforcing empty-string and
under-populated-participant rejection regardless of what any adapter sends. Only after transport is
re-confirmed does re-running the bounded v4 behaviour re-probe (Q1–Q7 above) become possible.

**The 17-measure evaluation cohort remains BLOCKED.**
