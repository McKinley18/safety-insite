# §198 — the three instrument invariants

Three defects in §197's own instruments were recorded rather than quietly corrected. §198 turns each
into a module with regression coverage, so the next slice inherits the lesson instead of re-learning
it.

---

## 1. The circuit breaker — `expert-pre-inference-circuit-breaker.ts`

### The defect

§197's executor issued **twelve** requests and received twelve byte-identical pre-inference
rejections. The first established the incompatibility completely; the remaining eleven established
nothing. It cost $0.00 only because nothing reached inference — that is luck, not design. §187A had
already paid this lesson at fifteen calls.

### The rule

> If TWO consecutive provider attempts fail with an identical PRE-INFERENCE rejection signature for
> the same execution stage and request-contract class: STOP. Classify
> `SYSTEMATIC_PRE_INFERENCE_REJECTION`.

### The signature

```
stage | requestContractId | httpStatus | providerErrorType | normalisedMessage
```

Normalisation removes only what varies between two reports of one identical problem — request ids,
timestamps, uuids, quoted identifiers, long bare numbers — and keeps the structural path and the
words. `tools.0.custom` keeps its index: a rejection on `tools.0` and one on `tools.1` are different
problems.

**A defect found by case K2 while writing it:** the first draft replaced any quoted token of eight
characters or more, which turned `property 'maxItems' is not supported` into
`property '{identifier}' is not supported` — erasing the keyword that identifies the problem and
making two *different* unsupported-keyword rejections look identical. A quoted token is now treated
as an identifier only when it carries a separator or a digit, so `GOV-ABRASIVE-01` is replaced and
`maxItems` is kept (cases **L5**, **L6**).

### The line it must not cross

A pre-inference rejection is a statement about **our request**. An inference-time failure is a
statement about **the model**, and it is exactly what a cohort exists to sample.

`reachedInference` is a separate field, set from provider-returned usage and response shape, and it
is **never inferred from the HTTP status** — a billed 400 reached inference, and a 200 carrying no
`tool_use` block may not have (case **M4**). An attempt that reached inference produces **no
signature at all** (`null`, not a flag a caller might forget), and a single inference-reaching
attempt **breaks a streak** (case **M3**).

| exercised | case |
|---|---|
| two identical rejections trip it; attempts 1 and 2 recorded, attempt 3 not issued | **K1**, **K3** |
| the tripped state names the signature it tripped on | **K2** |
| different message / stage / contract / status do **not** trip it | **L1–L4** |
| volatile detail normalised away; two reports of one problem still match | **L5** |
| two similar-looking inference-time failures do not trip it | **M2** |

Case **K3** states the counterfactual plainly: the §197 run would have stopped at **2** calls
instead of 12.

**Wiring this into the successor executor is part of the successor slice.** §197's executor is a
historical instrument and was not modified.

---

## 2. Empty-run safety — `expert-empty-run-safety.ts`

### The defect

§197's scorer, on a run where nothing executed, printed:

```
P settlement      NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT
HARD FAILS        none triggered
```

Both literally true. No provider output settled any fact, because there was no provider output. And
both read as green.

### The rule

> completed model executions = 0 ⇒ **no** behavioural or semantic axis may emit a positive verdict.

Not "should not". `axisResult` and `axisRatio` **cannot express one**: on an empty denominator they
return the empty-run state regardless of what the caller computed. `hardFailEvaluability` returns
`anyTriggered: null` and not `false` — `false` asserts the conditions were checked and held; `null`
says the question was not askable (case **N4**).

`emptyRunReportingViolations` is a self-audit a scorer runs over its own output before writing it,
and `FORBIDDEN_EMPTY_RUN_PHRASES` names a **class** rather than one remembered string. Case **N5**
feeds it the two strings §197 actually printed and expects two violations.

Also enforced here: a single observation is reported as `x/n` literally with
`NOT_MEANINGFULLY_ESTIMABLE`, never as a percentage, and a zero denominator never renders as `0/0`
(cases **N2**, **N3**).

### On the §197 scorer itself

It was **left exactly as §197 produced it**, and the §197 evidence it wrote is byte-unchanged. The
correction is preserved in place; the invariant is made permanent in this module, which future
scorers import. Extracting it *and* rewriting the historical instrument would have regenerated
§197's `DETERMINISTIC-RESULTS.json` — which is exactly what happened once during §198 and was
reversed by inverting the patch and regenerating, with the restored file verified byte-identical
against a hash manifest taken before any §198 edit.

---

## 3. Integrity-instrument precision — `expert-source-semantic-scan.ts`

### The defect

§197's pre-spend gate contained:

```ts
check('transition authorities do not include a model explanation', 'true',
  String(!/TRANSITION_AUTHORITIES[\s\S]{0,200}MODEL/i.test(settlementSurface)));
```

It failed 57/58 — on `owed-fact-ledger.ts`'s own **comment** explaining that there is deliberately no
member for a model explanation. The module was correct; the instrument read the explanation of the
rule as a violation of it. §170 had already written this lesson down.

### The correction, and its honest limit

`stripComments` removes comments while preserving line numbering, so a finding still points at the
right line. **String literals are deliberately kept** — a forbidden token inside a string literal is
executable content, and hiding it would be the coverage weakening this module promises not to do
(case **O3**).

**But comment-stripping alone would not have rescued that particular check**, and case **O2b**
asserts so: `owed-fact-ledger.ts` also *imports* `MODEL_AUTHORED_SOURCES` a few lines from
`TRANSITION_AUTHORITIES`, so the naive proximity regex matches executable text too. The comment was
never the only problem — **the instrument was**.

That is why the actual §197 repair asserted over the exported constant's **values**, and why
`preferValueAssertion` is recorded in the module:

> where an invariant can be asserted against an exported VALUE, assert the value. Use a source scan
> only where no value carries the property — for example, proving that a module never *calls* a
> function.

| exercised | case |
|---|---|
| the §197 false positive reproduced against raw source | **O1** |
| a real comment-only occurrence is removed by stripping | **O2** |
| comment-stripping does **not** rescue a badly-chosen proximity scan | **O2b** |
| comments removed, executable text and string literals kept | **O3** |
| line numbering survives | **O4** |
| the scanner reports the offending line, not a boolean | **O5** |
| coverage is not weakened — an executable violation still fails | **O6** |

---

## 4. A fourth defect, found by §198 in the project's own typecheck coverage

`tsc --noEmit -p tsconfig.json` includes only `src/**/*`. **It does not typecheck anything under
`scripts/`.**

§198 discovered this by renaming an export: the §196 suite was left with a broken import and the
project typecheck reported clean. Every "tsc clean" in §196 and §197 was therefore a statement about
`src/` alone, and is restated as such in this package.

The whole directory cannot simply be added — it carries **2011 pre-existing errors** in unrelated
legacy scripts, and fixing those is not this slice's work. So §198 adds
`backend/tsconfig.scripts-198.json`, which typechecks exactly the §196–§198 file set **under the
project's own compiler options**. Using the project's options matters: an ad-hoc `--strict false`
invocation produced false errors in `anthropic-expert-provider.ts`, because loose narrowing changes
how a discriminated union reads. The §198 gate runs it and requires clean.
