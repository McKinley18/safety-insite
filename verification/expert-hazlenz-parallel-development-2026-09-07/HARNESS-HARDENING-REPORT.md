# §201 — harness / experiment reliability hardening

**Agent 6.** Development harness infrastructure only.
**Provider calls: 0. Database operations: 0. Commits / pushes / tags / branches / deploys: 0.**
**No production or customer activation. No prompt or semantic contract touched. No §200 semantic
verdict supplied by this agent.**

---

## 1. What was built, and why it is a new file

Two new files, both created:

| file | sha256 |
|---|---|
| `backend/scripts/lib/expert-201-harness-hardening.ts` | `5c413d9c0bf9b70258c8cac25c85cfbda37ebf731ec52cf4e07cc7e9034f1b03` |
| `backend/scripts/test-201-harness-hardening.ts` | `863b266db82191cba00c49b8066fd26cd3360f74e86769f63fbe9a670dbac009` |

**No existing file was modified.** The two files the brief permitted me to touch are byte-identical
to their frozen references:

| file | sha256 now | frozen reference |
|---|---|---|
| `expert-pre-inference-circuit-breaker.ts` | `4b4d6b96a51b087ad427b69cbf11e5e52342330e88b0c30bec8468f964c86c33` | §199 `PREREGISTRATION.json.CIRCUIT_BREAKER.moduleSha256` — identical |
| `expert-empty-run-safety.ts` | `a34ebff758e9a23ffb98a49b6452d3ab12b646f76f017ec6bbdbcbed75b17298` | §198 `SOURCE-INTEGRITY.txt` "FILES ADDED BY §198" — identical |

Additive construction was not merely possible, it was *cheap*: every behaviour the brief asked for
either composes over the predecessor (clause a, the empty-run rule) or is orthogonal to it (the
evidence guard, the JSON splicer, the typecheck labels). The successor calls `recordAttempt` and
`mayIssueNextAttempt` directly rather than reimplementing them, holds the §198 `BreakerState`
verbatim inside its own state, and exposes `predecessorStateOf()` which returns it unchanged. Case
A4 drives both state machines over the same attempt sequence and asserts deep equality at every
step, so reversibility is measured rather than claimed.

§198's suite is **89/89, unchanged** (§4 below).

---

## 2. The finding that changes the recommendation: §200's clause (b) as written would not have fired

This is the most important result in this report and it was not anticipated by the brief.

§200's `CIRCUIT-BREAKER-RECOMMENDATION.md` states that `SG-01` and `SG-02` failed with "the
**identical** normalised signature". They did not. From §199's own
`CIRCUIT-BREAKER-LOG.jsonl`, verbatim:

```
pos 3  SG-01  contract=d0713f36696e8bea  msg=the compiled grammar is too large, …
pos 8  SG-02  contract=243bb6766c05599f  msg=the compiled grammar is too large, …
```

The **messages** are identical. The **contract ids are not**, because §199 set

```ts
requestContractId: sha(stableStringify(req.schema)).slice(0, 16)
```

and the vNext wire schema is built **per row** — the observation `sourceId`, the governed
`sourceId`s and the hazard-family enum values all vary. A stage-local memory keyed on
`stage + requestContractId` would therefore have missed `SG-02` in *exactly the same way* the
adjacency rule did. **Fixing the rule without fixing the key would have bought nothing.**

I recomputed both hashes from the current modules and they reproduce the log exactly (case B2), so
this is a statement about the run that happened, not about a fixture.

### The correction: a separate *effective grammar identity*

| concept | what it is | granularity |
|---|---|---|
| request-contract **identity** (§198/§199) | the exact bytes of one request's schema | per row |
| request-contract **class** (§201, declared) | e.g. `firstpass:vnext:capability-PRESENT` | per class, preregistered |
| **effective grammar identity** (§201, derived) | the schema *structure* a grammar is compiled from: every property name, nesting level, keyword and array arity **kept**; leaf scalar *values* erased | per grammar |

Measured over the real §199 cohort (cases B3–B5):

```
all ten capability-ABSENT rows  ->  4dddf9c5f80aab8c   (one identity)
SG-01 and SG-02  (PRESENT)      ->  c1601bd7dbd9d653   (one DIFFERENT identity)
SG-01 exact schema hash         ->  d0713f36696e8bea
SG-02 exact schema hash         ->  243bb6766c05599f
```

The identity partitions the cohort **exactly along the capability axis** — which is the axis the
grammar-size rejection actually follows — and does not collapse the cohort into a single key.

**Where this can be wrong, stated plainly.** Two schemas with the same shape but very different
string-literal *lengths* could compile to grammars of different size, so this identity can be
coarser than the provider's real behaviour. The cost of coarseness is a skipped row that might have
succeeded — $0.00 and one row recorded `NOT ISSUED`. The cost of the opposite error is spending
rows to rediscover a settled fact, which is what §199 did. A harness that wants the finer key can
supply the exact schema hash as `effectiveSchemaIdentity` instead; the helper is offered, not
imposed, and a harness that supplies neither degrades to §198 exactly (case A5).

---

## 3. The eight work items

### 3.1 Stage-local deterministic-contract-rejection memory (item 1)

```
STOP when EITHER
  (a) two CONSECUTIVE attempts share a normalised pre-inference signature       [§198, preserved]
  (b) a signature has ALREADY occurred for the same stage + request-contract
      class + effective grammar identity AND the rejection is classified
      DETERMINISTIC_CONTRACT_REJECTION                                          [new]
```

**Clause (a) and clause (b) have different dispositions, and that difference is deliberate.**
Clause (a) returns `STOP_RUN`, unchanged from §198. Clause (b) returns `SKIP_ATTEMPT`. §200's own
worked example is the authority for this: *"SG-02 is not issued at position 8 → the run continues
through the remaining capability-ABSENT rows"*. Clause (b) is a statement about **one contract
class** and carries no information about any other, so halting the whole run on it would discard
rows the rejection says nothing about. **This is the one design decision in this slice that a
preregistration should state explicitly rather than inherit** — see §7.

### 3.2 Adjacency preserved for transient failures (item 2)

`recordAttempt` — §198's function, unmodified — is called on **every** attempt, unconditionally and
first, before any §201 logic runs. Case A4 proves the resulting predecessor state is identical to
running §198 alone. Case D6 proves two *adjacent* transient failures still stop the run; case D5
proves two *non-adjacent* transient failures suppress nothing.

### 3.3 Error taxonomy (item 3)

Five classes, a closed vocabulary:

| class | breaker treatment |
|---|---|
| `DETERMINISTIC_CONTRACT_REJECTION` | `MEMOISE_AND_ADJACENCY` — the only class that may be memoised |
| `TRANSIENT_PROVIDER_FAILURE` | `ADJACENCY_ONLY` |
| `UNKNOWN_PROVIDER_FAILURE` | `ADJACENCY_ONLY` |
| `INFERENCE_COMPLETED_OUTPUT_FAILURE` | `NEVER_CONTRIBUTES` |
| `SEMANTIC_PROVIDER_REFUSAL` | `NEVER_CONTRIBUTES` |

**Conservatism is expressed structurally, not by a comment.** Classification order is: reached
inference → account state → transient status/type → deterministic allow-list → UNKNOWN. The HTTP
status is checked **before** the deterministic allow-list, so a rate limit that ever arrived wearing
a deterministic-looking message is still transient (case C5). Only an explicit allow-list of six
message patterns — each naming the section that paid for it — can reach `MEMOISE`; everything else
falls through to `UNKNOWN` and is treated as transient (case C6).

**One deviation from the brief's vocabulary, reported rather than made silently.** The brief listed
five classes; §200's table also lists `ACCOUNT_STATE_REJECTION`. I did not add a sixth member,
because a §192 rule already stops the run on an account rejection's *first* occurrence, before any
breaker consults this classifier. Instead `classifyProviderFailure` raises a separate
`accountStateRejection` flag **and** classifies conservatively, so a harness that forgets the
stricter rule still cannot memoise an account condition against a schema identity (case C10). I also
did not relabel `UNKNOWN` as `TRANSIENT`: it is recorded honestly as unknown and *treated* as
transient, which keeps the evidence accurate without weakening the conservatism.

### 3.4 Regression proving (item 4)

Cases D1–D9 replay §199's **actual** twelve-step order, taking each attempt's outcome from the
recorded log rather than simulating one.

| | rows issued | rows skipped | run halted |
|---|---|---|---|
| §199's key (predecessor) | 12 | 0 | no |
| §201's key (successor) | **11** | 1 (`SG-02`) | no |

Every row that reached inference in §199 is still issued (case D4). A transient 429 does not trigger
clause (b) (cases C3, D5). An inference-reaching failure never establishes a memory — even carrying
the exact §199 grammar message — and resets the adjacency streak (case D7). A different stage
sharing the same grammar is not suppressed (case D8).

**Same evidence, one fewer row spent.** As §200 noted, this saves a row, not a result: `SG-02` would
still be unexercised and axes S, N, O and T would still be `NOT_EXERCISED`.

### 3.5 Non-opportunity scorer safety (item 5)

§198's invariant is `completed executions = 0 ⇒ no positive verdict`. §199 exposed a case it does
not cover: **eight** verifier executions completed, and axis `O_UNSUPPLIED_CITATION_CONTAINMENT`
still had to be reported `NOT_EXERCISED` because *"zero citation-shaped tokens [were] emitted across
all eight verifier calls, so the mechanism was never put to the test"*. §199's scorer got that right
by hand; nothing in the module made it.

Case **E2 measures the gap rather than asserting it**: given the emission
`"NO_UNSUPPLIED_CITATION_WAS_ADMITTED — clean"` on an axis with 8 executions and 0 opportunities,
§198's `emptyRunReportingViolations` returns **0** findings and §201's
`nonOpportunityReportingViolations` returns **1**.

`opportunityAxisResult` requires an `opportunityDefinition` and refuses a verdict when it is absent
(case E5) — an axis whose opportunity cannot be stated is an axis whose denominator nobody has
decided. When executions are zero it **delegates** to §198's `axisResult`, so the predecessor
wording is preserved by construction rather than copied (case E3). §199's three real `NOT_EXERCISED`
wordings pass the new guard unchanged (case E6).

### 3.6 Immutable evidence-directory protection (item 6)

`checkEvidenceWrite` / `assertEvidenceWriteAllowed` / `guardedWriter`, over all six §195–§200
packages, all confirmed present on disk (case F1).

Refused: a write inside a package (F2); a `..` traversal into one (F3); a write or removal at an
**ancestor**, which destroys the package underneath just as completely (F5). Not refused: a sibling
directory whose name merely *starts with* a protected name (F4) — the comparison is on path
segments, not string prefixes. Case F7 proves the wrapper is a real refusal by counting calls into
the wrapped writer.

### 3.7 Targeted current-state update utility (item 7)

`docs/INSITE_CURRENT_STATE.json` is **2,287,975 bytes** across **235** top-level keys, and case G1
measures the hazard directly: `JSON.stringify(JSON.parse(text), null, 2)` is **not** the identity on
this file. A slice that re-serialises it rewrites escaping in entries it never touched.

`topLevelMemberSpans` is a string-aware scanner that returns exact byte spans;
`upsertTopLevelJsonKey` splices one span and never re-serialises the document;
`provesOnlySpanChanged` verifies the claim independently of the function that made the change.

Proved **against the live 2.28 MB document, entirely in memory**: the scanner agrees with the parser
on all 235 keys and their order (G2); every span parses to its parsed value (G3); replacing one key
leaves every other byte identical (G4); inserting one key does too (G5); **removing the inserted
span restores the original document byte for byte** (G6). Case G11 re-reads the file at the end and
asserts it is unchanged on disk — nothing was written.

The renderer is optional and the caller supplies `valueText` already rendered, so the module never
owns the escaping of anyone else's data.

### 3.8 Explicit verification labels (item 8)

`SRC_TYPECHECK` and `EXPERIMENT_SCOPE_TYPECHECK` each carry a `covers` and a `doesNotCover` string,
and `typecheckClaim()` emits a sentence in which an unqualified reading is not available.
`ambiguousTypecheckClaims()` flags result-asserting phrases in any sentence that does not name a
scope label — and case H7 applies that rule **to this document**, which is why every claim below is
labelled.

---

## 4. Verification actually executed

| what | command | result |
|---|---|---|
| §201 proof matrix | `npx ts-node scripts/test-201-harness-hardening.ts` | **67/67 PASS · 0 FAIL** |
| §198 regression | `npx ts-node scripts/test-198-transport-remediation.ts` | **89/89 PASS · 0 FAIL** (unchanged from the pre-change baseline I measured first) |
| SRC_TYPECHECK | `npx tsc --noEmit -p tsconfig.json` | **PASSED**, exit 0, 0 diagnostics. COVERS `backend/src/**` as `backend/tsconfig.json` includes it. DOES NOT COVER `backend/scripts/**`. |
| EXPERIMENT_SCOPE_TYPECHECK | `npx ts-node scripts/test-201-harness-hardening.ts` (no `--transpile-only`) | **PASSED**, exit 0. COVERS `scripts/test-201-harness-hardening.ts`, `scripts/lib/expert-201-harness-hardening.ts` and their transitive imports. DOES NOT COVER the rest of `backend/scripts/**` or the production surface. |

**Measured, so the background figure is not repeated from memory.** Compiling
`backend/scripts/**/*.ts` under a throwaway config extending `backend/tsconfig.json` (with `rootDir`
widened to `backend/`) reports **182 diagnostics across 43 files**, **0 of them in either §201
file**. The brief's "~2000" figure is not what this configuration produces; the count is
configuration-dependent, and the point stands either way — a scope-free claim about
`backend/scripts` would be meaningless. The throwaway config was written to `/tmp` and no tsconfig
in the repository was touched.

The §201 test itself declares `PROVIDER CALLS: 0 · DATABASE OPERATIONS: 0 · CUSTOMER ACTIVATION:
NONE · NO SEMANTIC SELF-GRADING`.

---

## 5. Boundaries observed

- `backend/package.json` and every `tsconfig` — **not modified.** Requested entries in §6.
- §195–§200 evidence directories — **read only.** The only file I wrote under `verification/` is
  this report, inside §201's own directory, which the ownership map assigns to me.
- `docs/INSITE_CURRENT_STATE.json` — **read only.** Case G11 proves it.
- No prompt, no first-pass instruction, no verifier instruction, no admission contract, no semantic
  contract was read-modified. No §200 verdict slot is touched anywhere in these files.
- Pre-existing unrelated working-tree modifications were left alone.

---

## 6. Requested orchestrator changes (NOT applied by me)

`backend/package.json` `scripts`:

```json
"test:201:harness": "ts-node scripts/test-201-harness-hardening.ts",
"test:198:transport": "ts-node scripts/test-198-transport-remediation.ts"
```

`backend/tsconfig.scripts-201.json` (orchestrator-owned), if a standing scoped typecheck is wanted:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true, "rootDir": "." },
  "include": ["scripts/lib/expert-201-harness-hardening.ts", "scripts/test-201-harness-hardening.ts"]
}
```

Scoping the `include` to the §201 files specifically is deliberate: widening it to
`scripts/**/*.ts` would pull in the 182 pre-existing diagnostics and make the gate unusable on its
first run.

---

## 7. Decisions that belong to a preregistration, not to me

1. **`SKIP_ATTEMPT` vs `STOP_RUN` for clause (b).** I implemented skip-and-continue, following
   §200's worked example. The brief's item 1 says "STOP". The module returns a structured
   `disposition` so a harness can adopt either, but **the executing slice must freeze which one**,
   and the choice materially changes what a run produces.
2. **The effective-grammar-identity function is a choice, not a fact.** `grammarShapeOf` erases leaf
   scalar values. A slice that spends real rows should freeze the identity function it used, and its
   hash, in its preregistration — exactly as §199 froze the breaker module hash.
3. **The deterministic allow-list is a governance surface.** Adding a pattern makes a class of
   failure able to truncate a cohort on one observation. It should not be extended without the
   section that paid for the entry.

---

## 8. What this slice does NOT establish

- **Nothing here has been exercised against a provider.** Every §199-derived result is a *replay* of
  the recorded log. The successor rule has never issued a real request.
- The `SKIP_ATTEMPT` path has never run inside `execute-*-structured-e2e`; no executor imports this
  module yet. Wiring it in is a separate, unauthorised change.
- No §199 semantic question is answered, narrowed, or hinted at by anything in these files.
- The coarseness risk in §2 is reasoned, not measured. Establishing where the provider's real
  grammar-size boundary sits would require provider calls, which this slice had none of.
