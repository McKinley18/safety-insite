# L3 RUN-2 FINAL PRE-SPEND EXECUTION GUARD (2026-08-25) — `D-K WIRED, VERIFIED, NOTHING SPENT`

> ### `READY_TO_AUTHORIZE_L3_RUN2_SEALED_ACCEPTANCE — D_K_WIRED — ANTHROPIC — claude-sonnet-5`
> ### `D_K_ABORT = WIRED_AND_VERIFIED` · `RUN2_HOLDOUT_SPENT = FALSE` · provider calls `0` · `$0.00`
> ### `RUN1_HOLDOUT_SPENT = TRUE` · `RUN1_MODEL_ACCEPTANCE_RESULT = NOT_ESTABLISHED`
> ### `PROVIDER_CAPACITY = PASS` · `RUN2_HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

§65.8 recorded that four of the five Run-2 freeze §9 preconditions stood and that **precondition 4
was still owed**: the `D-K` permanent-provider-failure abort was *specified and frozen but not
wired*. This phase wired it. **It designed nothing. `D-K` is unchanged.**

**Run 1 issued 144 doomed calls because no such abort existed. Under the predicate now wired in, it
would have issued none of them.**

## The frozen rule, restated and not reinterpreted

> **After spend, the run ABORTS at the first required row that ends `PROVIDER_EVALUATED = FALSE`
> once the frozen retry policy for that row is exhausted.**
> — `D-K.2`, `INDEPENDENT_EVIDENCE_PLAN.md` `a7da57e4…` line 965

No streak. No configurable threshold. No tuning constant. No semantic inspection. No
hazard-dependent behaviour. No response-quality judgement. The predicate is **derived, not chosen**:
by `D-G.2` a single unevaluated required row already forces `SCORABLE = FALSE`, so from that moment
every further request is provably incapable of changing the terminal.

`MALFORMED_STRUCTURED_OUTPUT` and `PROVIDER_REFUSAL` remain **`PROVIDER_EVALUATED = TRUE`** — in both
the model produced output — so neither can fire `D-K`, and `G10` keeps its teeth. `TIMEOUT`,
`UNAVAILABLE`, `TRANSIENT_ERROR` and `PERMANENT_CONFIGURATION_ERROR` remain **FALSE**.
**FAIL-CLOSED** on any unrecognised outcome or failure kind.

## The exact execution seam

`guard/acceptance-execution-loop.ts` is the single loop through which every required Run-2 provider
evaluation passes, in both required processes:

```
next-row scheduling decision          <-- GLOBAL D-K gate, PRE-ISSUE
  -> request construction                 frozen input builder 2865ae91
  -> provider transport                   frozen shim 76d3e039 -> claude-sonnet-5
  -> frozen retry policy                  runValidatedReasoning, UNCHANGED
  -> provider-evaluated classification <-- D-G.3, THE EARLIEST DETERMINISTIC POINT
  -> result recording                     frozen nine fields + providerEvaluated
  -> next-row scheduling decision      <-- LOCAL D-K abort fires HERE
```

**The earliest deterministic point at which `D-K` can know `PROVIDER_EVALUATED = FALSE` after the
frozen retry policy is exhausted is the instant `runValidatedReasoning` resolves.** That function
does not return until both the transport retry ceiling of one and the single frozen SHAPE retry have
been applied, so its very first observation is already post-retry. There is no earlier point, and
waiting any longer issues a request `D-G.2` has already proved pointless.

## Process-pair behaviour — the Run-1 pattern, prevented mechanically

Run 2 requires two isolated processes for `G9`. By `D-G.2` the complete measurement requires set
equality of evaluated with expected row ids in **every** required process, so **the first required
unevaluated row in either process already makes the complete Run-2 measurement impossible.** The
abort is therefore **global, not per-process**, carried by one file both processes share:

* the firing process stops scheduling immediately;
* the sibling issues **no new request** — it is checked **between rows, never mid-flight**, so an
  already-issued request always completes and its raw evidence is recorded intact;
* `run-run2-sealed.sh` refuses to **start** process B at all when the flag already exists, so not one
  further provider connection is opened;
* the **first** abort record is never overwritten, so a later firing in the sibling cannot rewrite
  which row ended the run.

**The two-process measurement requirement itself is unchanged.**

## Synthetic verification — 92 assertions, 92 PASS, 0 FAIL

`verification/SYNTHETIC_DK_VERIFICATION.txt`. **Zero Anthropic access. Zero credential reads. Zero
Run-2 rows opened, read or transmitted.** Transport is a local `127.0.0.1` fixture; the 93-row
holdout and every observation are authored inside the suite. The guard, the execution loop, the
**shipped** `OllamaReasoningProvider`, the **frozen** `runValidatedReasoning`, the **frozen** input
builder and the **frozen** v2 scorer are all the real ones.

| # | required assertion | result |
|---|---|---|
| 1 | 93/93 in A and 93/93 in B — `D-K` never fires, all **186** requests scheduled | PASS |
| 2 | first required evaluation in A unevaluated — fires immediately, A `1`, B `0` | PASS |
| 3 | unevaluated at A row 41 — exactly **41** issued, nothing after newly scheduled | PASS |
| 4 | unevaluated in process B — global abort also fires | PASS |
| 5 | malformed model output counts as provider-evaluated; `D-K` does not fire; `G10` can still fail | PASS |
| 6 | provider refusal with actual model output stays evaluated; not converted to transport failure | PASS |
| 7 | exhausted transient retries → fires **only** after the frozen policy is exhausted | PASS |
| 8 | no semantic retry introduced | PASS |
| 9 | `HOLDOUT_SPENT = TRUE` irreversible once spend has begun | PASS |
| 10 | `SCORABLE = FALSE` after `D-K` fires | PASS |
| 11 | no additional request can restore `SCORABLE` once one required evaluation is absent | PASS |
| 12 | a complete successful run is behaviourally identical, `D-K` dormant | PASS |

Assertions 5, 6 and 7 are proved through **real transport** — the shipped provider and the frozen
retry policy driven against the local fixture — so the classification is verified against genuine
provider-boundary behaviour, not a hand-written mock of it. The recorded measurements: HTTP 4xx →
`PERMANENT_CONFIGURATION_ERROR`, **1 attempt, 1 call, no retry**; HTTP 5xx → `TRANSIENT_ERROR`,
**2 attempts, 2 calls**; a 5xx **recovered** by the frozen retry is `PROVIDER_EVALUATED = TRUE`; a
malformed body is retried once then classified **EVALUATED**; a refusal is **not** retried and stays
**EVALUATED**.

Assertion 12 is proved by field-by-field comparison against an **unguarded reference loop**: the same
requests in the same order, and every scorer record byte-identical once the `D-K` declaration is
stripped. Assertions 10 and 11 are proved through the **frozen v2 scorer**, with a complete-pair
control that reaches the frozen arithmetic and passes it.

`tsc` under the project's own strict configuration: **0 errors**.

## Run-1 counterfactual structural replay

`replay/RUN1_COUNTERFACTUAL_REPLAY.txt`. Transport and error metadata only — **no observation text,
no expected truth, no gate membership, no candidate, no semantic field**. Replayed through the same
guard and the same loop, with the same A-then-B ordering.

| | actual | under `D-K` |
|---|---|---|
| process A calls | 92 | **41** |
| process B calls | 92 | **0** |
| **total** | **184** | **41** |

First non-provider-evaluated row: **process A, executionIndex 41, `H2A-041`**, failure kind
`PERMANENT_CONFIGURATION_ERROR`, class `PERMANENT_PROVIDER_REJECTION` — the first HTTP 400 of the run.
**Doomed calls prevented: 143** (51 in A, 92 in B). 7 checks, 7 PASS.

> **And it would have changed nothing else.** `HOLDOUT_SPENT` still `TRUE`, offsets `0` and `3` still
> `RETIRED`, `SCORABLE` still `FALSE`, `MODEL_ACCEPTANCE_RESULT` still `NOT_ESTABLISHED`, no automatic
> rerun, corpus not restored. **Aborting saves money; it does not give the corpus back.**
>
> This is **validation of an already-frozen predicate, not an input to it.** `D-K` is unchanged by
> it, and Run-1 model performance is not reinterpreted.

## Frozen-artifact impact — nothing frozen was mutated

`preservation/ARTIFACT_IDENTITY_IMPACT.txt`, determined **mechanically** from the manifest, every
component digest **recomputed from the actual file**.

**`RUN2_ACCEPTANCE_ARTIFACT_IDENTITY_UNCHANGED`** —
`9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc`, **15/15 components reproduce
their manifest lines byte-for-byte**.

The 15 components are the holdout and its deterministic rebuild, the builder and the authored-control
source, the pre-selection gate and its output, the structural/rebuild/overlap validation outputs and
the validator, the v2 scorer frozen copy and its synthetic tests and their output, and the two freeze
records. **There is no runner, no harness, no execution driver and no shell script among them** —
checked three ways, by manifest path, by content digest and by basename: **0 collisions.**

§63.11 froze **the exam**; §63.12 named the `D-K` wiring as a still-owed **precondition of executing
it**, not as a component of it. **The runner is outside the frozen artifact and did not exist when it
was frozen.** Nothing had to be rebuilt, and **the Run-2 holdout was not rebuilt.**

The execution surface is frozen **separately**, under its own new identity:

```
20290a85267b75a11f4778eee7a9bb24fe0ffbd85a5805faa93a257f41103d7d  guard/acceptance-execution-loop.ts
95b3ca8ccd0fe056888d7994ec0372c6e42e5b14aaca3fb7d78b56924506a28a  runner/run-run2-sealed.sh
ce9c749380d4713098f0215a72797921b70d9c8a67408b132b37ead34adf9ed1  guard/dk-abort-guard.ts
d97eb94c93ce094322e153a9f86bc6257e4c12146c7ea1d990b5e11fb5d02d88  runner/run-run2-acceptance.ts

RUN2_EXECUTION_GUARD_IDENTITY = eee8e587cd19183024d9a00b0ace5efbdcc73d587dddf801c51aaa0beab303c1
```

> **The Run-2 acceptance authorization must name BOTH identities.** Any change to any of those four
> files changes the guard identity.

## A defect in this phase's own audit, recorded rather than concealed

The first revision of the egress audit pattern-banned the string `anthropic` and the words
`curl|wget` across the package. It flagged four hits — **a file path in a digest table, the audit's
own regex literal, and two banner comments.** None was a network primitive; the instrument was
measuring itself. It was corrected to strip comments first, to check where **URL literals actually
point**, and to **enumerate every shell-execution site in full** rather than assert a negative about
its own source text. All nine sites are printed in the evidence: eight read-only `git` invocations
and one `node` spawn of the local fixture. **No finding was waved away — the check was replaced with
one that measures the right thing.**

A second over-broad check asserted `git diff HEAD` clean over `backend/scripts`, which carries
**pre-existing unrelated uncommitted user work** recorded in `preservation/PRESERVATION_PRE.txt`. It
was narrowed to what is actually claimed: `backend/src` and `safescope-data` clean, and the locked
cohort harness unmodified. **That pre-existing work is preserved untouched.**

## Unspent, and Run 1 is not rewritten

`preservation/FROZEN_IDENTITY_AND_UNSPENT_PROOF.txt` — **40 checks, 40 PASS, 0 FAIL.**

All 14 frozen identities **recomputed from the actual files** and matching: the Run-2 holdout and its
rebuild `f887cfd1…`, the original scorer `ea5e50ae…`, the v2 wrapper `b9a0a6bc…` (in both its
locations), `HOLDOUT_FREEZE` `67e6b47c…`, the governing plan `a7da57e4…`, and prompt `426302a4`,
contract types `5f70281c`, validator `942ac7cc`, binder `c1f9d29d`, input builder `2865ae91`, cohort
harness `73f74131`, shim `76d3e039`. `git diff HEAD` over `backend/src` and `safescope-data`:
**0 lines.**

The spent Run-1 package verifies **31/31 byte-identical to its own manifest**; the Run-1 runner
remains `8d8a6479…`, **unmodified**. It was read for transport and error metadata only, read-only.

| | |
|---|---|
| Run-2 observation values opened | **0** |
| Run-2 rows transmitted · reserved source rows transmitted | **0 · 0** |
| provider calls · readiness probes · credential reads | **0 · 0 · 0** |
| inference executions · `G1`–`G10` on provider output | **0 · 0** |
| API cost | **$0.00** |
| stashes · tags · staged · upstream divergence | **4 untouched · 23 unchanged · none · 0/0** |

What this phase **did** read from the Run-2 holdout: its **bytes** (to hash), its **row count**, and
the **names** of its keys. No `observation` value, no `expect` value and no `sourceId` was opened,
printed, transmitted or written. Compare §62.8, where the Run-2 schedule itself was derived by
reading sort keys and counts only.

**`RUN2_HOLDOUT_SPENT = FALSE`.** Gauntlet offset `1` and realism offset `0` remain **selected,
frozen and unspent**. Gauntlet offsets `2`, `3` and realism offsets `1`, `2` remain **reserved**. The
100-row `gauntlet.seed` remains **unopened**.

## Exact next prerequisite — NOT EXECUTED

**Explicit user authorization to execute the sealed Run-2 acceptance run.** It is the only
outstanding gate and it is a user decision, not an engineering one. All five Run-2 freeze §9
preconditions now stand: capacity **PASS** (`$40.00` against `$18.038745`, `2.217×`), credential
**PRESENT**, `claude-sonnet-5` identity **PASS**, `D-K` **WIRED AND VERIFIED**, and authorization
**owed**.

> **`READY_TO_AUTHORIZE` is not authorization.** The first inference call containing any Run-2 row
> flips `RUN2_HOLDOUT_SPENT` to `true` and retires gauntlet offset `1` and realism offset `0`
> **permanently, whatever the result** (§29.8) — and per `D-H` that follows from **transmission
> alone**. `D-K` reduces waste and does nothing else: **it does not make that transition reversible.**
>
> `D-84`'s `G1`–`G10` are **untouched**. `D-79`…`D-98` are **not rewritten**. Attempt 1 remains
> **INVALIDATED**. **`claude-sonnet-5` still has no Level-3 acceptance result.**
> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` ·
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN` · **L3-3 remains unauthorized.**
