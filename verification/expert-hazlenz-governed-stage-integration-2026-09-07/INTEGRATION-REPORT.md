# §202 — orchestrator integration report

**Experiment provider calls = 0 · database operations = 0 · no production or customer activation ·
no commit / push / tag / branch / deploy · 1,177 / 1,177 baseline files byte-unchanged (96
`expert-hazlenz-*` evidence directories + the runtime module) · 0 historical-evidence violations ·
0 runtime `src/` violations.**

Zero HazLenz **experiment** provider calls: no first-pass request, no verifier request, no hosted
governed-stage canary, no spend against the experiment budget. The five subagents are Claude Code
tooling, not experiment executions.

## 1. Adjudication progress — the headline number is 0

| | |
|---|---|
| total slots | **152** (§200's frozen arithmetic, reproduced not recomputed) |
| structurally pre-filled | **24** — governed axes N, S, T on the 8 projected facts, all `NOT_EXERCISED` |
| excluded by product-owner decision | **8** — the SG-01 / SG-02 row-axis slots |
| **answerable denominator** | **120** |
| **product-owner verdicts supplied** | **0** |
| remaining | **120** |
| supplementary, deferred | 58 (56 verifier sub-axes + 2 refused-declaration questions) |

**No semantic judgment was made by anyone but the product owner, and none was made.** Workstream A
delivered the machinery; the judgments themselves require the product owner in the loop and a
subagent has no channel to them. Review unit U01 was presented; no verdict was returned. This is
reported as **0 of 120**, not softened.

Three defects in the §200 instrument surfaced and were resolved by product-owner decision:

- **The 128 figure I published contained 8 unanswerable slots.** SG-01 and SG-02 carry
  `ADJUDICABLE = false` with the recorded reason *"No model output exists. Every axis is
  NOT_EXERCISED and no semantic judgement is possible or permitted"*, yet their 4 row-axis slots each
  sat inside the open 128. **Ruled: excluded, denominator 120.** Recorded as
  `OUT_OF_SCOPE_NO_MODEL_OUTPUT` with the §200 reason quoted; §200 unedited; **no verdict supplied**.
  I verified that operation touched **zero** `verdict` or `attribution` fields.
- **`R_PRIORITY_FLOOR_IMPACT` had no vocabulary anywhere in §200.** Axis R is two slots per fact and
  the axis declaration carries the scale for the classification half only — which is why 8 facts × 13
  keys = 104 while `factAxes` declares 12. **Ruled: the three proposed members confirmed.**
- **Axis O does not exist.** §200's prose says "Axes N, O, S and T"; the worksheet defines N, S, T.
  Agent A reproduced the worksheet rather than the sentence, which is why the count is 24 not 32.

## 2. Per-row recorded product-owner verdicts

**None. The worksheet's 120 answerable slots are `null` and every `attribution` is `null`.**

`recordVerdict` refuses any attribution other than the exact string `PRODUCT_OWNER`, checked before
the slot is even resolved, so a model-authored verdict is not representable. It also refuses writes
into the 24 structural slots and any value outside a slot's vocabulary, and preserves the supplied
string verbatim. 21 review units, all ten required sections each, with the AI-assisted /
not-product-owner-reviewed disclosure in **every** unit (21 occurrences, asserted by test).

## 3–4. Governed-binding stage — architecture and implementation

**Placement: after deterministic validation and identity, before enrichment, as its own call on
governed rows only.** The ordinary first pass stays capability-ABSENT on every row and is
byte-unchanged.

Four alternatives were rejected on least-provider-authority grounds, with repository evidence: inside
the first pass addresses binding by model-chosen `declarationId` against an identity that does not
yet exist (and is the shape §199 refused); before projection makes addressing end-to-end
model-authored and orphans bindings the 17 projection refusal codes discard; in the verifier
conflates *relied on* with *bound to* and inherits whole-verdict refusal; deterministic text matching
is the §160-retired semantic matcher again.

At the chosen point **both sides of the relation are HazLenz-owned closed sets** — a minted
request-scoped `factRef` and the exact supplied `sourceId` set. The model selects; it never names.
**Enforced by the call graph rather than by a comment:** the nominator is typed to receive
`Governed202Request` only — no facts, no `factKey`, no seal.

Added beyond the §201 prototype: an **identity seal** making "identity computed before nomination"
checkable, with the honest limit recorded that a seal is not a clock; and `excludedFromBinding`, so a
fact kept out of the candidate set is recorded rather than silently dropped.

## 5. Governed-stage zero-provider tests — B1 … B20 all pass

**54/54, re-executed by the orchestrator.** Highlights: B5 rejects unsupplied, respelled and
cross-row ids, with the boundary independent of the enum; B6 rejects all five duplicate cases and
normalises nothing; B8 makes wrong `sourceId`/text pairing structurally impossible (9/9 text-field
names refused); B10–B14 refuse `factKey`, `affectedDecision`, branch semantics, settlement and
priority **at the boundary**; B17 confirms isolation is part of the contract with two stated
exceptions; B19 includes a 17-fixture **differential against §201's boundary with 0 disagreements**.

**B20 is diagnostic evidence and is NOT provider acceptance.** It is labelled so in the code
(`GRAMMAR_MEASUREMENT_CLAIMS_202`, five flags `false`), in the suite banner and in the memo.

## 6. Ordinary first-pass preservation

Six hashes recomputed identical before and after: `expert-first-pass-instruction-vnext.ts`,
`expert-prompt.ts`, `expert-first-pass-owed-fact-projection.ts`, `expert-verifier-contract-v3-3.ts`,
`expert-governed-citation-reuse.ts`, `expert-201-governed-binding-stage.ts`. Ten of ten frozen §199
row schemas reproduce with **0 drift**. Zero `backend/src` imports of any §202 module.

Grammar table, measured as sent with the real `OBS-<rowId>` shape (the §201-found 12-character
placeholder error deliberately not repeated):

| request | enums | alts | props | schema B | total B |
|---|---|---|---|---|---|
| §199 ABSENT (accepted 10/10) | 17 | 74 | 54 | 18,679 | 63,691 |
| §199 PRESENT (**rejected**) | 18 | 75 | 55 | 19,124 | 67,086 |
| **§202 stage, 1 record** | **3** | **5** | **5** | **1,538** | **6,074** |

Schema 1,538 B against 19,124 B; whole request 6,074 B against 67,086 B.

## 7. Effective grammar identity

Classification is **by schema keyword, never by value shape** — that distinction *is* the correction.
Seven rules held as data; six limits recorded with direction and handling.

**Validated before use:** the reconstruction reproduces §199's own recorded contract ids exactly
(SG-01 `d0713f36696e8bea`, SG-02 `243bb6766c05599f`), so the findings are about the run and not a
fixture. The partition is **10 capability-ABSENT rows to one identity, 2 PRESENT rows to another**, on
both the sent and the wire schema — §201's claim independently verified and extended.

**The §200 defect demonstrated concretely:** replaying the recorded 12-step order with a
`requestContractId`-keyed cache issues 12 and skips 0 — SG-02 goes through. Adjacency misses it
independently (positions 3 and 8, four completed inferences between). Under the §202 key SG-02 is
suppressed.

**Four corrections to §201's own function, measured against the module on disk:** §201's
`grammarShapeOf` erased grammar-*relevant* leaf scalars, collapsing `{type:"string"}` with
`{type:"number"}`, `additionalProperties:false` with `:true`, and `pattern:"^a$"` with
`"^[0-9]{40}$"`. Those are false equivalences **in the dangerous direction** — they declare a
*different* grammar already-rejected. §201 also split on annotation *presence* while collapsing
annotation *content*, the wrong way round; omitted provider/model scope and the rejection signature;
and had no accounting at all.

**It is a proxy.** The disclaimer is a code constant returned as a field. Agreement with provider
behaviour is measured on one cohort of twelve — agreement, not equality.

## 13. Circuit-breaker integration

**STOP vs SKIP_ATTEMPT resolved prospectively and unambiguously.** Both dispositions are implemented
and which applies is read from a frozen `FrozenCapabilityRequirement` table — nothing inspects class
name, counts or position. A **totality check at construction** refuses a table that does not cover
every planned `(stage, class)`, so the question can never arrive undecided mid-spend.

Three-state accounting with a per-row ledger and an `accountingViolations` arithmetic proof.
`recordAttempt` is never called for a skipped row, so the §198 breaker never learns it existed.
Replay under `NOT_REQUIRED`: **11 attempted / 1 skipped / 0 not-exercised**, attempt denominator 11,
provider-failure numerator 1 — against §199 as executed, 12 / 0 / 0 with denominator 12 and numerator
2. **A skipped row appears in no failure numerator and no attempt denominator.**

**Not wired into any executor.** Behaviour against a live provider is **inferred from replay, not
measured**, and the two §199 rejections are two observations, not a rate.

## 8. Authority-boundary inventory — 11 findings (A=5, B=5, C=0, D=1)

Every finding cites file:line; **10 of 11 were reproduced by executing the real production function**
rather than read.

**The structural finding that governed the whole workstream:** every category-A fix lands on a file
whose sha256 is frozen — §187's `owedFactSourceHashes` pins four modules, re-asserted by **eleven**
`verify-19x-source-integrity` scripts, plus `expert-prompt.ts` and `expert-verifier-contract-v3.ts`.
**The §202 category-A hardening authorization and the §187 pin are in direct conflict, and only the
product owner can resolve it.** Agent C therefore wrote every guard as a pure function with the exact
call-site signature and recorded 5 one-line insertions — **zero applied.** All six pinned hashes
recomputed identical. This was the correct call and it is the most important item in the workstream.

**Category A, guard written and call site NOT patched:** ABF-1, a declaring stage whose membership
validation is claimed at `OWED_FACT_FIELD_PROVENANCE:253` but performed nowhere — a non-member is
refused only by a key-shape accident under a misnamed code; ABF-2, supplied `acceptableEvidence`
copied verbatim with `provenance` unchecked, so `MODEL_SELF_AUTHORED` reaches a DEVELOPMENT ledger
(PRODUCTION does fail closed); ABF-3, the forbidden-field scan tests `d` and never `d.nomination`;
ABF-7, the projection's governance scan is **top-level only** where the canonical boundary recurses
depth-8 — `extra:{citation,approved}` admitted with zero codes, held shut only by the provider
honouring `additionalProperties: false`; ABF-8, the nomination ceiling is a bare default parameter.

**Category B, not implemented:** ABF-4, provider priority reaches `OwedFact.priority` and **two
published contracts in one directory contradict each other**; **ABF-5, the highest-consequence new
finding** — a nomination colliding with a *terminal-status* key is admitted, `addOwedFact` then
silently no-ops, and `preservationViolations` **and** `bindingSideEffects` both report nothing, so a
genuine new safety fact vanishes while a question is still projected against the key; ABF-6, HIGH-4
confirmed and extended, with a fourth-argument blob returned verbatim and **zero** merge-invariant
violations because it bypasses normalisation entirely; ABF-9, a provider-escalated question measured
as `SELECTED` while the deterministic life-critical one is `SUPPRESSED_BY_BUDGET`; ABF-10, citation
blind spots measured and **deliberately not repaired**, because broadening the regex is semantic
inference.

## 9–10. HIGH-1 and HIGH-2 — both **B**, neither implemented

**HIGH-1** confirmed, and the drift is **bidirectional**: the runtime gained `AcceptableEvidence`,
nullable `whyUnresolved` and the forbidden-field scan, while the prototype still holds
`COVERAGE_DECISION_FORBIDDEN_INPUTS`, which the promotion dropped. Measured: the *same* declaration is
refused by the runtime and **admitted with zero codes** by the prototype. It fails four of five
category-A gate clauses and is explicitly withheld from §202 by the "no final OwedFact policy
decision" stop condition. Register correction: the §201 citation at `expert-verifier-contract-v3.ts:519`
is a doc comment, not an import.

**HIGH-2** conclusion confirmed, framing **corrected twice** — and both corrections matter because
§201 stated it too strongly. There *are* two producers and `parseOwedFactDeclarations` **is**
type-compatible; it is simply never wired. And **the incompatibility is compile-time only**:
measured, `consumeSettlementClaims` accepts a `requestedBy:'VERIFIER_V3'` object and produces a
claim, because it never reads that field. Anyone reading HIGH-2 as "the types make this unreachable"
is reading it wrongly. `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` still holds structurally, on a real
module-private `unique symbol`.

## 11. Deterministic boundary fixes actually made

**One, by the orchestrator, and it is not a category-A guard.** Agent B1's contract module contained a
**raw NUL byte** used as a hash-join delimiter — sound intent, unsafe encoding. It made `grep` treat
the file as binary and it **silently returned nothing during my own verification**, which is how it
was caught. Replaced with the `\u0000` escape sequence, written as the six literal characters backslash-u-zero-zero-zero-zero (this report itself first reproduced the defect it documents, and that is recorded rather than quietly corrected): the runtime string is identical, so every hash that
function computes is unchanged. `a254e4bc…` → `2d0b0f86…`, +5 bytes. B1's suite re-run: **54/54**.

Agent C's 193 auditability gate independently failed on the same byte while it was present, then
passed after repair — **the gate worked**, which is the reassuring half. C's report attributes the
repair to Agent B1; **it was the orchestrator.** C's accompanying warning is the right one and was
acted on: any source-scanning gate running in that window risked a false clean. The one that ran
failed loudly rather than falsely passing, and 193 now reports **46/46** post-fix.

**No call-site insertion was applied. No existing runtime file was modified by any agent.**

## 12. Independent red-team findings

Five evidenced bypasses, two HIGH, each executed against real modules with output quoted.

**BYPASS-1 (HIGH), and it directly gates a ruling.** The entire `SUPPLIED_VERBATIM` citation
contract is gated behind `CITATION_SHAPED_PATTERN` = `/\b\d{2}\s*CFR\s*\d+/i`. **Verified
independently by the orchestrator by executing the pattern:** `29 CFR 1910.147` fires;
`29 C.F.R. 1910.147`, `1910.147(c)(4)`, `NFPA 70E` and `OSHA 1926.1153` **all miss**. The mode's
safety argument rests on a detector that recognises one spelling. The input-side redactor uses the
same pattern, so it leaks in both directions.

**BYPASS-2 (HIGH), with a correction that strengthens it.** The red team reported
`additionalProperties: false` "count 0 in both". Binary-safe measurement: §201 has **one occurrence,
in a comment**, asserting that it "refuses them at the boundary". No schema anywhere sets it. The
conclusion holds and the true finding is a **cleaner instance of the systemic class than the red team
stated** — not an absent feature but a comment claiming a protection layer that was never built.
Agent B1 measured the consequence from the other side: §201's own boundary **admits
`{affectedDecision:'APPLICABILITY'}` as `BOUND`**, because its forbidden-field list omits
`affectedDecision`, `branchA/B`, `decisionIfA/B`, `decisionDivergence`, `evidenceSpan` and
`whyUnresolved`, relying on the layer that does not exist. §202 names 55 fields. §201 is unmodified.

**BYPASS-3 (MED-HIGH):** a model-authored value enters a closed vocabulary through a TypeScript cast
whose validation sits inside a caller-gated branch — with `enabled=[]` a hostile verdict flips from
refused to `admitted:true`.

**BYPASS-4 (MED)** and **BYPASS-8 (MED)** are reporting-integrity findings: Agent C's guards have
**0 external call sites**, and the evidence guard covers 6 of 97 directories, has no production call
site and is defeated by a symlink because `resolve` is lexical rather than `realpath`. C was right not
to wire the guards, and §202 must not claim these boundaries are hardened. **It does not.**

**A red-team framing I do not accept, having checked the code.** D reports that C's ABF-3 "explicitly
skips `priority`, exempting the exact field ABF-4 identifies", and concludes "apply both or neither".
C does not exempt it: it **routes** it, reporting `PROVIDER_AUTHORED_NOMINATION_PRIORITY` separately
and not as a violation, with the reason stated at the line — `NominationPayload.priority` is a
**required** field of the published nomination contract, so scanning it as forbidden would refuse
every well-formed nomination. That contradiction between two published contracts *is* ABF-4, and is
why it is category B rather than a fix. C's handling is more careful than the challenge implies.

**What held.** The customer-inactive boundary was attacked rather than re-verified, and held four
ways — decisively via `backend/tsconfig.json`'s `include: ["src/**/*"]`, which places every
`expert-20x-*` module outside the production build. A model-authored `factKey` could **not** reach a
verifier declaration under any enabled list. B1 genuinely closed the §201 cross-analysis hole.

**Declared coverage gaps, which I would rather have named than papered over:** C's two disposition
documents and B1's and B2's memos were all absent when D finished — D read none and claims nothing
about them. And **B2's rejection-cache key derivation is unchallenged by this red team.**

## 14. Files created and modified

**Created — code (11):** four `expert-202-*` library modules from B1/B2, `expert-202-adjudication-grouping.ts`,
`expert-202-authority-boundary-guards.ts`, `build-202-adjudication-session.ts`, and four test suites.
**Created — documents (9):** the ownership map, seven agent deliverables, and this report.
**Modified by the orchestrator only (3):** `backend/package.json` (6 script entries, prior bytes
preserved verbatim), `backend/tsconfig.scripts-202.json` (new), and the one NUL-byte repair in §11.
**Modified by agents: zero existing files.**

## 15. Verification

| | |
|---|---|
| `test-202-adjudication-grouping` | **137/137** |
| `test-202-governed-binding-stage` | **54/54** |
| `test-202-grammar-identity-and-cache` | **80/80** |
| `test-202-authority-boundary-guards` | **83/83** |
| §196 / §198 / §199 | 92/92 · 89/89 · 43/43 |
| §201 × 4 | 59/59 · 59/59 · 216 · 67/67 |
| §193 / §194 / v3-binding / v3-dev | 46 · 48 · 49/49 · 40/40 |
| **SRC_TYPECHECK** | **PASS** (`tsconfig.json`, `src/**` only) |
| **EXPERIMENT_SCOPE_TYPECHECK (§202)** | **PASS** (11 files) |
| **preservation** | **1,177 / 1,177 byte-unchanged** |

**354 new §202 assertions**, all re-executed by the orchestrator rather than taken on the agents'
word. Neither typecheck is repository-wide; `backend/scripts` carries **181** pre-existing
diagnostics under the project's own options.

## 16. Authorizations requested

| # | request | note |
|---|---|---|
| 1 | **Resolve the §187 pin vs category-A hardening conflict.** Five guards are written, tested and unapplied. Every one lands on a pinned file re-asserted by eleven integrity scripts. Nothing proceeds without this | the blocking item |
| 2 | **Do NOT grant the `SUPPLIED_VERBATIM` ruling yet.** B1 asks for it and the honest answer is to wait: BYPASS-1 means it would authorize a weaker mechanism than the one described. Default stays `REDACTED`; cost of deferring is zero | withhold |
| 3 | **ABF-5** — decide the repair. Both candidates contradict published design, and a vanished safety fact reported by nothing is the worst finding in this slice | architecture |
| 4 | **ABF-4** — resolve the contract contradiction: `NominationPayload.priority` required vs `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` | contract |
| 5 | **ABF-6 placement, ABF-9 fallback chain, ABF-10 citation representation** | three separate rulings |
| 6 | **HIGH-1** — which owed-fact implementation is canonical. Withheld from §202 by its own stop condition | architecture |
| 7 | **HIGH-2** — whether the settlement consumer is meant to have a producer | architecture |
| 8 | **Citation-pattern widening.** Recommend a *separate* broader routing pattern leaving the frozen scoring constant untouched, so §195–§201 citation measures keep meaning what they meant | measurement integrity |
| 9 | **The 120 adjudication verdicts.** Everything semantic stays blocked until these exist | product owner only |
| 10 | Wiring the rejection cache into an executor; authoring a real `FrozenCapabilityRequirement` table; any provider call, including a hosted canary | deferred |

**No prototype was integrated into the active Expert path and none is reachable from production.**
