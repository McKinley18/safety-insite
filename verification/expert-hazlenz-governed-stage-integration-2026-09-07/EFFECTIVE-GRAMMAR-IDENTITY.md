# §202 — EFFECTIVE GRAMMAR IDENTITY AND THE DETERMINISTIC-CONTRACT REJECTION CACHE

**Agent B2.** Development implementation. **Provider calls: 0. Database operations: 0. No customer
activation. No semantic self-grading — no §199/§200 verdict slot is touched by any §202 B2 artifact.**

Every result in this document is either (a) **MEASURED** by executing
`backend/scripts/test-202-grammar-identity-and-cache.ts` offline against the frozen §199 evidence, or
(b) **INFERRED** and labelled as such. Nothing here was exercised against a provider.

---

## 0. What was built

| file | role |
|---|---|
| `backend/scripts/lib/expert-202-effective-grammar-identity.ts` | the equivalence class over request schemas |
| `backend/scripts/lib/expert-202-rejection-cache.ts` | the run-scoped deterministic-rejection cache, the STOP/SKIP resolution and the three-state ledger |
| `backend/scripts/test-202-grammar-identity-and-cache.ts` | 80-case proof matrix, replay-only |
| this document | the rules, the limits, the measurements |

No existing file was modified. §195–§201 evidence, `expert-pre-inference-circuit-breaker.ts`,
`expert-201-harness-hardening.ts`, `expert-empty-run-safety.ts`, `backend/package.json` and every
`tsconfig` are byte-identical before and after (§9).

---

## 1. THE IDENTITY IS A PROXY. IT IS NOT THE PROVIDER'S COMPILED-GRAMMAR IDENTITY.

Stated first because it is the claim most easily overstated.

The provider compiles a grammar inside its own service, from its own JSON-Schema subset, under a
size metric that has **never been observed from here**. §199 measured a **433-byte margin** between an
accepted request (18,617–18,624 bytes) and a rejected one (19,057–19,062 bytes) and concluded in
`CAPABILITY-TRANSPORT-DIAGNOSIS.json` that *"BYTE SIZE IS NOT THE PROVIDER METRIC"*. We do not know
what the metric is.

What this module computes is an **equivalence class over our own request schemas**, built from the
schema keywords a grammar compiler is *known* to read. The only claim licensed by evidence is the one
measured in §3: over the twelve recorded §199 first-pass requests it produces exactly the partition
the observed rejection followed. **That is agreement on one cohort of twelve. It is not equality, and
it must never be reported as equality.**

The disclaimer is held in code as `EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY` and returned as a **field**
by `describeGrammarProjection`, so an artifact quoting an identity carries the caveat with it rather
than relying on a report author to remember it.

---

## 2. THE EQUIVALENCE-CLASS RULES, EXACTLY

The projection walks the schema and classifies every position **by schema keyword**, never by value
shape. That distinction is the whole correction: "erase every leaf scalar" cannot tell the enum
member `"OBS-SG-01"` (scenario data) from the type name `"string"` (grammar).

| id | rule | why | error it prevents |
|---|---|---|---|
| **R1** | The **value** of `type`, `format`, `pattern`, `const`, `$ref`, `minLength`, `maxLength`, `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`, `multipleOf`, `minItems`, `maxItems`, `minProperties`, `maxProperties`, `uniqueItems`, `nullable`, `strict`, `contentEncoding`, `contentMediaType` is **kept verbatim**. | each decides which strings are accepted. | false equivalence — see §4. |
| **R2** | `additionalProperties` / `additionalItems`: **verbatim when boolean**, recursed when a subschema. | `additionalProperties: false` is what closes the object, and is what makes §198's capability *omission* enforceable at the transport rather than only at the boundary. | collapsing an open object and a closed one. |
| **R3** | `description`, `title`, `$comment`, `examples`, `default`, `deprecated`, `readOnly`, `writeOnly`, `$schema`, `$id` — **key and value dropped whole**. | natural language handed to the model, not part of the accepted language. | a scenario-content or prompt-wording edit manufacturing a false grammar difference. **This is the rule with the largest cost — see L2.** |
| **R4** | An `enum` becomes its **member count** plus the sorted set of **member kinds**. Member values erased. | the stated requirement: array arity is grammar-relevant, leaf scalar values are not. | the §200 defect itself — per-row source ids and hazard-family values splitting one grammar into twelve identities. |
| **R5** | `required` keeps its **member names verbatim** and **normalises their order**. | members are property names (grammar-relevant); the order is not, because `required` denotes a set. | a builder emitting the same set in a different order manufacturing a false difference — while keeping the §198 capability split visible as **eleven names against twelve**. |
| **R6** | Anything else: object keys kept and **sorted**; array **order and arity** kept; a remaining leaf scalar erased to its **kind** (`@string`, `@number`, `@boolean`, `@null`). | an unrecognised extension keyword should degrade to §201's behaviour — coarse but safe. | the identity function throwing in the middle of a paid run. |
| **R7** | Inside `properties` / `patternProperties` / `definitions` / `$defs` / `dependentSchemas`, the keys are **property names** and **no keyword rule applies to them for exactly one level**. | a property may legitimately be called `type`, `required` or `description`. | silent corruption rather than a visible error. |

All seven are held as data in `EFFECTIVE_GRAMMAR_IDENTITY_RULES` and asserted by suite case **A12**.

### 2.1 The limits, including where I am uncertain

| id | limit | direction | consequence | handled by |
|---|---|---|---|---|
| **L1** | **Enum member LENGTH is invisible.** §199 measured that an enum-constrained string array "adds disproportionately" to grammar complexity; length plausibly contributes and this projection erases it. | coarser than the provider | a row skipped whose grammar was genuinely smaller. Cost: one unexercised row at $0.00, recorded as such. | accepted deliberately — a length-sensitive key would be guessing at a function nobody has. |
| **L2** | **Description length is invisible.** The §199 diagnosis' remediation **Option A — "materially shorten the vNext schema descriptions"** — produces the **same identity**. Measured: suite case **B13**. | coarser than the provider | a cache built under long descriptions would wrongly suppress a request built with short ones. | **run scoping.** `createRejectionCache` requires a `runScopeId` and refuses an empty one; within a run the treatment is frozen by preregistration and cannot be shortened mid-flight; a run under a new treatment starts empty. |
| **L3** | **The provider's size metric is unknown.** | unknown | agreement is measured on one cohort of twelve, not proved in general. | stated in `EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY`, returned as a field. |
| **L4** | **Which schema is measured is the caller's choice.** §199 keyed on the **wire** schema; the provider compiles the **sent** schema (post `applyStrictSchemaWrapper` + `stripAnthropicUnsupportedKeywords`). | unknown | measuring the wrong one keys the cache on something the provider never saw. | `MeasuredSchemaStage` is declared and recorded. **Both measured** in §3; the cache is expected to use the SENT schema. |
| **L5** | **The 10/2 partition is a property of THIS cohort.** All twelve §199 rows declare exactly **3** `allowedHazardFamilies`, so the `hazardFamily` enum has arity 3 throughout (measured, case **B8**). A cohort varying that count splits further. | finer than the provider | a further split is *correct* — a different enum arity is a different grammar — but the cache would then cover fewer rows than "10/2" suggests. | reported as a cohort measurement, never as a general claim. |
| **L6** | **Nothing was exercised against a provider.** | unknown | the cache's effect on a live run is **inferred from replay**, not measured. | stated wherever the replay result appears, and recorded in code as `REJECTION_CACHE_RULES.NOT_EXERCISED_AGAINST_A_PROVIDER`. |

---

## 3. MEASURED: the partition of the twelve §199 requests

All twelve requests were regenerated **offline** from `expert-199-cohort-2026-09-07.ts` using §199's
own `analysisInput` / `governedBindingFor` / `buildExpertVNextWireSchema` construction. The
reconstruction is validated against §199's own recorded output before any conclusion is drawn:

> **Case B2 (MEASURED).** The reconstruction reproduces §199's recorded `requestContractId`s exactly —
> **SG-01 = `d0713f36696e8bea`, SG-02 = `243bb6766c05599f`**, verbatim from
> `CIRCUIT-BREAKER-LOG.jsonl`. Every finding below is therefore about the **run**, not about a fixture.

### Partition on the SENT schema (what the provider compiles)

| identity | rows | n |
|---|---|---|
| `f7712359d2709cd2` | SF-01, SF-03, SF-05, SF-12, SF-06, SF-04, SF-02, SF-07, SF-08, SF-11 | **10** — every capability-ABSENT row |
| `33d3deb145c147a7` | SG-01, SG-02 | **2** — every capability-PRESENT row |

### Partition on the WIRE schema (what §199 keyed on)

| identity | rows | n |
|---|---|---|
| `8b9847471b4812ce` | the same ten | **10** |
| `423621dc9ced7f04` | SG-01, SG-02 | **2** |

### The key §200 recommended

Twelve rows → **twelve distinct `requestContractId`s** (case B7). A per-row key cannot memoise
anything: every row is its own class, so no second row ever matches.

### Verdict on §201's claim

§201's `test-201-harness-hardening.ts` cases B3–B6 asserted this 10/2 partition on the **wire** schema
and passed. **I independently VERIFY it, and extend it**: the partition is 10/2 on the wire schema
*and* on the sent schema, under a corrected identity function, and the SG-01 ≡ SG-02 collapse holds in
both. §201's measured result is confirmed, not refuted. What is refuted is the *soundness of the
function that produced it* — see §4.

**Case B9 (MEASURED)** — the requirement that content-only differences must not split: SF-01 and SF-03
carry entirely different observations, locations, tasks and source ids, hold different contract ids
(`c3ed2ab857eb877f` / `f6bff9add409252e`) and **different sent-schema bytes**, and share one identity
`f7712359d2709cd2`.

**Case B10 (MEASURED)** — the converse: SF-01 vs SG-01 split, and the difference is exactly the §198
governed-binding capability (one added property, one added `required` member, one added enum) — the
difference the provider actually rejected.

---

## 4. What I reused from §201, and what I changed and why

### Reused — by call, not by copy

| from | what | why not rewritten |
|---|---|---|
| §198 | `recordAttempt`, `mayIssueNextAttempt`, `preInferenceSignature`, `normaliseProviderErrorMessage`, `initialBreakerState` | clause (a) — two **consecutive** identical pre-inference rejections stop the run — is called on every issued attempt, first, unconditionally. `predecessorBreakerStateOf` projects the §198 state back out **exactly** (case G7 measures byte-equality of the projected state against a directly-driven §198 state). Not replaced, not weakened, not reimplemented. |
| §201 | `classifyProviderFailure`, the five-class taxonomy, `BREAKER_TREATMENT_BY_CLASS`, `DETERMINISTIC_REJECTION_PATTERNS` | the classifier is correct and its conservatism (UNKNOWN ⇒ transient) is the product-owner requirement. §202 **imports** it, so there is one taxonomy and not two. Cases G1–G4 measure that the conservatism survives composition. |
| §198 | `NOT_EXERCISED` | the third accounting state uses the word the repository already has, not a new one for the same thing (case F6). |
| §201 | the measured 10/2 partition claim | verified independently, then extended (§3). |

### Changed — four corrections

**C-1. The identity erased grammar-relevant leaf scalars.** `grammarShapeOf` replaces every leaf
scalar with `typeof value`, which erases the values of `type`, `pattern`, `additionalProperties` and
every numeric bound. **MEASURED against the §201 module as it stands on disk** (cases A15/A17):

| pair | §201 identity | §202 identity |
|---|---|---|
| `{type:"string"}` vs `{type:"number"}` | **EQUAL** | different |
| `additionalProperties:false` vs `:true` | **EQUAL** | different |
| `pattern:"^a$"` vs `pattern:"^[0-9]{40}$"` | **EQUAL** | different |

These are **false equivalences and they run in the dangerous direction.** A coarse identity skips a
row that might have succeeded — one unexercised row at $0.00, recorded as unexercised. A false
equivalence on `type` or `pattern` declares a genuinely *different* grammar already-rejected, and the
harness stops exercising a capability it never tested. §201's stated risk calculus assumed the
identity was faithful about structure; on these keywords it is not.

*Direct evidence that the §201 identity is reachable and unchanged:*
`grammarShapeOf({type:'number'})` still returns `{"type":"string"}` (case A17) — the §201 module is
imported and measured, never edited.

**C-2. §201 split on annotation PRESENCE while collapsing annotation CONTENT** (case A16, measured) —
the wrong way round. §202 drops annotation keys whole, so neither presence nor content splits. This is
the rule that carries limit **L2**.

**C-3. The key was missing three parts and required a fourth it should not have.** The product-owner
specification is *provider/model family as relevant + execution stage + EFFECTIVE_GRAMMAR_IDENTITY +
normalized deterministic rejection signature*. §201's key was `stage | class | grammar`.

- **MISSING — provider and model scope.** A grammar-size limit is a property of one provider's
  compiler. §199 ran one model, so the omission could not be caught. §202 puts `providerFamily` and
  `modelScope` in the key (case C7) and refuses a scope wider than one exact model unless the harness
  states its evidence (case C8) — suppressing rows on a model that was never asked is the expensive
  error.
- **MISSING — the rejection signature.** §201 remembered **that** a class was rejected, never
  **which** rejection. Two different deterministic faults on one grammar collapsed into one entry and
  the second was lost from the evidence entirely (case C5).
- **WRONG — `requestContractClass` was REQUIRED**, and a null class silently disabled the whole memory.
  A harness that forgot to declare it degraded to §198 with no complaint. In §202 the class is
  **advisory**: it is recorded, reported, and used to look up the STOP/SKIP declaration, but the
  **grammar identity carries the key**. The capability class is a *structural* property of the schema
  — §198's capability omission adds a property and a `required` member — so deriving it from a
  declaration the harness might forget was the weaker of two available mechanisms.

**The four-part key identifies the established FACT. The suppression PREDICATE is necessarily the
three-part prefix** — provider, stage, grammar — because those are the only parts knowable before a
request is issued: a planned attempt cannot be matched on a rejection it has not received yet. Both
are separate named functions (`suppressionPrefix`, `establishedRejectionKey`) so the distinction
cannot blur (case C6).

**C-4. There was no accounting.** §201 counted failure classes over attempts and had no ledger. Its
comment asserted that a suppressed row is "recorded as NOT ISSUED, never as a failure"; nothing in the
code made that true. See §7.

---

## 5. MEASURED: the §200 defect, demonstrated concretely

Replaying **§199's actual recorded twelve-step order** through a cache keyed the way §200 recommended:

```
issued  12    skipped  0
```

**Nothing is suppressed anywhere in the run (case C1), and SG-02 is issued (case C2).** §200 recorded
SG-01's and SG-02's signatures as *identical*. They are not: the contract ids are `d0713f36696e8bea`
and `243bb6766c05599f`, so SG-02 never matches SG-01 and the recommended memory never fires.

Adjacency would also have missed it, and for an independent reason (case C3, measured from the log):
SG-01 sits at position 3 and SG-02 at position 8, with **four completed inferences** — SF-11, SF-04,
SF-08, SF-03 — in between. `consecutive` never exceeded 1 and §198's two-consecutive rule correctly
did not trip. **Fixing the rule without fixing the key would have bought nothing.**

Under the §202 key, SG-01 and SG-02 share one suppression prefix (case C4) and the second is
suppressed. The single established entry, verbatim from the run (case D11):

```
provider=anthropic | model=anthropic:the-exact-§199-first-pass-model | stage=firstpass
  | grammar=33d3deb145c147a7
  | rejection=COMPILED_GRAMMAR_TOO_LARGE::the compiled grammar is too large, which would cause
    performance issues. simplify your tool schemas or reduce the number of strict tools.
```

---

## 6. STOP_RUN vs SKIP_ATTEMPT — resolved prospectively, by declaration

§201 flagged this as ambiguous and always returned `SKIP_ATTEMPT`. §202 resolves it and the resolution
is: **both dispositions exist, and which one applies is read from a frozen table. Nothing in the code
inspects the class name, the row count, the position in the order or how much of the cohort remains.**

```ts
type CapabilityRequirement =
  | 'REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE'          // first established rejection halts the run
  | 'NOT_REQUIRED_REMAINING_ROWS_STILL_INFORMATIVE';   // matching rows skipped, every other class runs

interface FrozenCapabilityRequirement {
  stage; requestContractClass; requirement;
  frozenBy;             // the preregistration artifact that froze it — REFUSED if empty
  whyThisRequirement;   // REFUSED if empty
}
```

**The enforcement mechanism is a totality check at construction, not a default at decision time.**
`createRejectionCache` refuses to build a cache whose requirement table does not cover **every** planned
`(stage, class)` (case E6). A missing declaration costs nothing before the run and cannot be resolved
honestly during one — so the question can never arrive undecided mid-spend. A defence in depth
(`UNDECLARED_CAPABILITY_REQUIREMENT` in `decision.defects` and `cache.undeclaredRequirements`) surfaces
the defect loudly rather than absorbing it, if a plan is ever extended after construction.

Under `REQUIRED`, the halt fires **at the first established rejection**, not on a second matching row
(case E2): a required capability that is deterministically rejected means the run can no longer answer
its question, so continuing would spend rows on nothing. Every remaining row is **NOT_EXERCISED** —
not skipped, not failed (case E3).

`frozenBy` and `whyThisRequirement` are refused when empty (case E7): a requirement naming no freezing
artifact is a decision made *during* the run, which is the thing the field exists to prevent.

**The §199 replay tables used in §7 are §202 replay declarations, illustrative — §199 froze no such
table. Authoring the real table for a future run is a protocol decision and is not mine to make.**

---

## 7. MEASURED: the §199 replay, and the three-state account

### 7.1 The three states

`ATTEMPTED` / `SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION` / `NOT_EXERCISED`. Held as a per-row
ledger; `accountingViolations` **proves** the arithmetic rather than trusting it:

- the three states **sum** to the planned rows;
- `attemptDenominator === attempted` — a row never issued was never an opportunity for the provider to fail;
- the provider-failure numerator is drawn **only** from ATTEMPTED rows;
- a non-ATTEMPTED entry **cannot carry** `reachedInference` or `failureClass` — the fields are `null`
  by construction and checked independently (case F3);
- a SKIPPED entry must cite the **ATTEMPTED ordinal** that established the fact, or it is unauditable
  (case D10);
- a planned row with **no ledger entry** is a violation, not a silent hole (case F2);
- `recordSkippedRow` **throws** if handed a decision whose disposition was not `SKIP_ATTEMPT` — a row
  is recorded in the state its decision actually produced, never relabelled (case F1);
- `skippedRowsWronglyCountedAsFailures(cache, failureRowIds)` is a callable guard a scorer applies to
  its **own** failure set before publishing it (case D8).

Crucially: **`recordAttempt` is never called for a skipped row.** §198's breaker never learns it
existed. That is the accounting point, not a convention.

### 7.2 Replay under `NOT_REQUIRED` (matches §199's actual protocol posture)

```
PLANNED ROWS: 12
  ATTEMPTED                                     11  — SF-01, SF-05, SG-01, SF-11, SF-04, SF-08,
                                                      SF-03, SF-06, SF-02, SF-12, SF-07
  SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION   1  — SG-02
  NOT_EXERCISED                                  0  — (none)
ATTEMPT DENOMINATOR: 11
PROVIDER FAILURE NUMERATOR: 1
```

**Contrast with what §199 actually did** (`RUN-EXECUTION-SUMMARY.json`, `FIRST-PASS-EXECUTION-SUMMARY.json`):

| | §199 as executed | §202 replay |
|---|---|---|
| first-pass rows issued | **12** | **11** |
| skipped | 0 | **1 (SG-02)** |
| not exercised | 0 | 0 |
| attempt denominator | 12 | **11** |
| pre-inference rejections in the failure numerator | **2** (SG-01, SG-02) | **1** (SG-01 only) |
| circuit breaker tripped | no | no |
| stop reason | null | null |

**Exactly one row is saved, and no observation is lost** (case D4): every row that reached inference
in §199 is still issued, SG-01 is still issued so the capability is still tested once (case D3), and
the run continues through four later capability-ABSENT rows after the suppression (case D5).

The change in the failure numerator from 2 to 1 is the accounting-integrity point, not a cosmetic one.
§199 recorded two pre-inference rejections **because it issued two**. §202 issues one, so **one** is
the honest numerator — and the skipped row is reported in its own state rather than absorbed into
either the numerator or the denominator.

`accountingViolations` returned **0 findings** (case D6). §198's projected state records **11**
attempts, not 12 (case D9).

### 7.3 The same cohort under `REQUIRED` — the other disposition

```
PLANNED ROWS: 12
  ATTEMPTED                                      3  — SF-01, SF-05, SG-01
  SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION   0  — (none)
  NOT_EXERCISED                                  9  — SF-11, SF-04, SF-08, SF-03, SG-02, SF-06,
                                                      SF-02, SF-12, SF-07
```

Same cohort, same order, same code. **The only difference is the frozen declaration** (case E1). The
halt fires at ordinal 3, and SF-11 at position 4 is the first row refused (case E2).

---

## 8. Test results, as actually executed

| suite | command | result |
|---|---|---|
| §202 proof matrix | `npx tsx backend/scripts/test-202-grammar-identity-and-cache.ts` | **80/80 PASS · 0 FAIL** |
| §198 transport remediation (regression) | `npx tsx backend/scripts/test-198-transport-remediation.ts` | **89/89 PASS · 0 FAIL** |
| §201 harness hardening (regression) | `npx tsx backend/scripts/test-201-harness-hardening.ts` | **67/67 PASS · 0 FAIL** |

**EXPERIMENT_SCOPE_TYPECHECK PASSED (0 errors, exit 0).** Command:

```
npx tsc --noEmit --strict --strictPropertyInitialization false --target es2021 --module commonjs \
  --moduleResolution node --allowSyntheticDefaultImports --skipLibCheck --experimentalDecorators \
  --emitDecoratorMetadata --useDefineForClassFields false \
  scripts/lib/expert-202-effective-grammar-identity.ts \
  scripts/lib/expert-202-rejection-cache.ts \
  scripts/test-202-grammar-identity-and-cache.ts
```

**COVERS:** exactly those three files and their transitive imports. **DOES NOT COVER:** the rest of
`backend/scripts/**` (the corrected baseline there is **181** diagnostics) and the production surface.
A green EXPERIMENT_SCOPE_TYPECHECK says nothing about either. **No SRC_TYPECHECK was run by B2** —
no file under `backend/src/**` was touched.

Provider calls made by every command above: **0**. Database operations: **0**.

---

## 9. Preservation

| file | sha256 before | sha256 after | verdict |
|---|---|---|---|
| `backend/scripts/lib/expert-pre-inference-circuit-breaker.ts` | `4b4d6b96a51b087ad427b69cbf11e5e52342330e88b0c30bec8468f964c86c33` | identical | **BYTE-UNCHANGED**, and equal to §199 `PREREGISTRATION.json.CIRCUIT_BREAKER.moduleSha256` (case H1) |
| `backend/scripts/lib/expert-201-harness-hardening.ts` | `5c413d9c0bf9b70258c8cac25c85cfbda37ebf731ec52cf4e07cc7e9034f1b03` | identical | **BYTE-UNCHANGED** |
| `backend/scripts/lib/expert-empty-run-safety.ts` | `a34ebff758e9a23ffb98a49b6452d3ab12b646f76f017ec6bbdbcbed75b17298` | identical | **BYTE-UNCHANGED** |
| `backend/scripts/test-198-transport-remediation.ts` | `bf62667fc7d906ada464d549fa3dfff7d334964865e7301f94287097849c5df8` | identical | **BYTE-UNCHANGED** |

New files created by B2:

| file | sha256 | lines |
|---|---|---|
| `backend/scripts/lib/expert-202-effective-grammar-identity.ts` | `0e96daa8b5b5a99ad54820074c6f3aae70578730b8f486462dda5313e1a6e57a`\* | 489 |
| `backend/scripts/lib/expert-202-rejection-cache.ts` | `6f39e91da7267cc6287d75ab38414a3ef00b6fd76252c9098393c3725fa98c32` | 876 |
| `backend/scripts/test-202-grammar-identity-and-cache.ts` | `986811787f9c8fb30db466a6a62f04d215da73ad0ad7c32c17f3b0bf1a330ba6` | 919 |

\* recorded after the single post-typecheck edit removing an invalid `as const`; the orchestrator
should re-hash at integration.

`backend/package.json`, every `tsconfig*.json`, and every `verification/expert-hazlenz-*` evidence
directory are untouched by B2. The §202 suite performs **no writes at all** — every measurement is in
memory (case H4). No `expert-202-governed-*` file was read, imported or written; B2 validated only
against the frozen §199 requests, per the ownership map's conflict resolution 1.

---

## 10. Entries the orchestrator is asked to register (B2 did **not** apply them)

**`backend/package.json` → `scripts`:**

```json
"test:202:grammar-cache": "tsx scripts/test-202-grammar-identity-and-cache.ts"
```

Note the runner: §201's requested entries use `ts-node`, but `test-201-harness-hardening.ts` and this
suite were both executed with `npx tsx`. `tsx` is the runner actually verified. Held in code as
`REQUESTED_PACKAGE_JSON_SCRIPTS_202`.

**`backend/tsconfig.scripts-202.json`** (orchestrator-owned; B2 used the equivalent CLI flags in §8):

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true, "declaration": false, "incremental": false, "rootDir": "." },
  "files": [
    "scripts/lib/expert-202-effective-grammar-identity.ts",
    "scripts/lib/expert-202-rejection-cache.ts",
    "scripts/test-202-grammar-identity-and-cache.ts"
  ]
}
```

---

## 11. Remaining uncertainty, and what needs authorization

**Uncertainty — measured vs inferred.**

- **MEASURED:** the 10/2 partition of the twelve §199 requests, on both the wire and sent schemas;
  the reproduction of §199's own contract ids; the three §201 false equivalences; the §200 key's
  complete failure to suppress across the recorded order; the replay counts 11/1/0 and 3/0/9; every
  suite result in §8; every hash in §9.
- **INFERRED, NOT MEASURED:** that this cache would behave the same way against a live provider.
  §202 made zero provider calls. The identity's agreement with provider behaviour rests on **one
  cohort of twelve**, and the two rejections in it are **two observations**, not a rate. Clause (b)
  can suppress on a **single** observation; if a provider ever returned a grammar-size rejection
  non-deterministically, one row is skipped that a retry might have completed — recorded as
  SKIPPED, everything already obtained preserved, and recoverable by a successor re-authorization.
- **NOT ESTABLISHED:** anything about the correct remediation for the §199 capability-transport
  failure. Options A–D in `CAPABILITY-TRANSPORT-DIAGNOSIS.json` remain open and are not B2's to
  choose. Note the interaction with **L2**: if Option A (shorten descriptions) is chosen, the
  effective grammar identity does **not** change, and only run scoping keeps that safe.

**AUTHORIZATION REQUIRED — none of these was taken by B2:**

1. **Registering the npm script and creating `tsconfig.scripts-202.json`** — orchestrator-owned per
   the ownership map; reported in §10, not applied.
2. **Authoring the real `FrozenCapabilityRequirement` table for any future run.** Declaring whether
   the governed-binding capability is `REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE` is a **protocol
   decision**, not an engineering one. The tables in §7 are illustrative replay declarations and are
   labelled as such in the suite.
3. **Wiring this cache into any executor.** No prototype was wired into any active path; §202 changes
   no runtime behaviour of anything.
4. **Any provider call to validate the identity against real grammar compilation.** The single
   measurement that would upgrade the proxy from "agrees on twelve" to "agrees on a designed probe"
   is a deliberate transport probe, and it costs provider calls.
