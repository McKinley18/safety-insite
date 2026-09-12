# §201 — orchestrator integration report

**Experiment provider calls = 0 · database operations = 0 · no production or customer activation ·
no commit / push / tag / branch / deploy · §195–§200 evidence byte-unchanged (75 files verified) ·
runtime `src/` byte-unchanged (27 files verified).**

A note on the zero-call accounting, because the phrase is ambiguous and this programme has been
corrected on ambiguous verification claims before: **zero HazLenz experiment provider calls were
made** — no first-pass request, no verifier request, no Anthropic API call for experimental
purposes, and no spend against the experiment budget. The seven subagents are Claude Code tooling
and are not experiment executions; none of them was permitted to issue a provider call and none did.

## 1. Agents launched

Seven specialists plus this orchestrator, the authorization's preferred topology, launched in a
single message.

| # | agent | mode |
|---|---|---|
| 1 | adjudication evidence facilitator | strict read-only |
| 2 | governed-binding stage architect | analysis + isolated prototype |
| 3 | OwedFact representation engineer | analysis + prototype |
| 4 | priority / escalation safety architect | read-only |
| 5 | verifier / clarification engineer | generic development only |
| 6 | harness / experiment reliability engineer | implementation authorized |
| 7 | Expert HazLenz system auditor | strict read-only |

No additional agent was spawned. Capacity existing was not treated as a reason to use it.

## 2. Did they actually run concurrently?

**Yes.** All seven were dispatched in one message and executed in the background. Completion order
was 1 → 4 → 3 → 7 → 2 → 6 → 5, which does not match dispatch order — the direct evidence of genuine
concurrency rather than serialisation. Wall-clock durations ranged from ~5.8 minutes (Agent 1) to
~20.9 minutes (Agent 5); run serially that would have been roughly 76 minutes of agent time against
an observed span bounded by the longest agent.

## 3. Scope per agent

As assigned in `FILE-OWNERSHIP-MAP.md`, written **before** any agent began. No agent altered its own
scope and none requested expansion mid-run.

## 4. File ownership map — held

**Every agent stayed inside its allocation.** Sixteen files were created — eight code, eight
documents — and each maps to exactly one owning agent. No file was written by two agents. No agent
touched `backend/package.json` or any `tsconfig`, which were orchestrator-reserved precisely because
every implementing agent would otherwise have wanted to register a script there.

Four conflicts were resolved in advance rather than discovered mid-flight; the most consequential
was Agent 6's, and the additive steer worked — **it mutated neither harness module**, and both remain
byte-identical to the hashes §198 and §199 pinned.

## 5. Modifications made

**Created — code (8):**
`expert-201-governed-binding-stage.ts` · `test-201-governed-binding-stage.ts` ·
`expert-201-owed-property-representation.ts` · `test-201-owed-property-representation.ts` ·
`expert-201-verifier-vnext-candidates.ts` · `test-201-verifier-vnext-candidates.ts` ·
`expert-201-harness-hardening.ts` · `test-201-harness-hardening.ts`

**Created — documents (8):** the seven agent deliverables plus the ownership map.

**Modified by the orchestrator only (2):** `backend/package.json` (five script entries) and
`backend/tsconfig.scripts-201.json` (new).

**Modified by agents: none.** Not one existing file was changed by any of the seven.

## 6. Tests run — re-executed by the orchestrator, not taken on trust

| suite | result |
|---|---|
| `test-201-governed-binding-stage` | **59/59 PASS** |
| `test-201-owed-property-representation` | **59/59 PASS** |
| `test-201-verifier-vnext-candidates` | **216 passed, 0 failed** |
| `test-201-harness-hardening` | **67/67 PASS** |
| `test-198-transport-remediation` | **89/89 PASS** |
| `test-199-successor-protocol` | **43/43 PASS** |
| `test-196-structured-first-pass-owed-facts` | **92/92 PASS** |
| `test-expert-193-hardening` | 46 passed, 0 failed |
| `test-expert-194-regulatory-basis` | 48 passed, 0 failed |
| `test-expert-verifier-v3-binding-protocol` | 49/49 PASS |
| `test-expert-v3-development-integration` | 40/40 PASS |

`SRC_TYPECHECK = PASS` (`tsconfig.json`, `src/**` only).
`EXPERIMENT_SCOPE_TYPECHECK = PASS` for both the §196–§200 set and the new §201 set.
Neither is repository-wide.

**A correction to my own earlier reporting.** §198 and the blueprint state that `backend/scripts`
carries "~2011 pre-existing type errors". Under the project's own compiler options the real figure is
**181 diagnostics across 43 files**. My number came from an ad-hoc invocation with `--strict false`,
which manufactures errors that do not exist under the real configuration. Agent 6 measured this
independently; I re-measured and confirm 181. The scoped configuration is still necessary — 181 is
plenty to make a directory-wide gate unusable — but the figure I published was wrong by an order of
magnitude and is corrected here rather than left standing.

## 7. Conflicts detected

**None.** No overlapping edit, no contested file, no agent blocked by another. The ownership map was
sufficient and required no mid-run arbitration.

## 8. Duplicated findings

Two agents reached the **same wiring gap from opposite ends**, independently:

- **Agent 3** (harness end): the §199 executor forwards 7 of the 8 fields `projectOwedFact` returns —
  `acceptableEvidence` is not passed. It was `null` on all eight facts, so nothing was lost in
  practice.
- **Agent 5** (contract end): `V3SuppliedOwedFact` has no `acceptableEvidence` field at all, so the
  verifier is structurally never shown the architecture's own statement of what would settle the
  fact — while being asked to judge resolution sufficiency.

Neither read the other. Together they establish that this is a **contract gap with a harness gap
sitting on top of it**, and that fixing only the executor would achieve nothing.

## 9. Independent corroborations

**The strongest result of the run**, and the reason the independent-review rule exists.

**Agent 4 and Agent 7 independently identified the same defect class: a boundary asserted in a
comment but held only by a caller default.**

- Agent 4 (F5): `NominationPayload.priority` is validated for membership and copied verbatim into
  the ledger; the forbidden-field scan inspects the declaration, not `d.nomination`. What keeps a
  provider-authored priority out is that a bridge function defaults it to `OTHER`.
- Agent 7 (HIGH-4): `mergeExpertIntelligence`'s fourth parameter is ungated, unlabelled and
  unaudited. A comment asserts it is present only under the v3 gate; the code enforces nothing. What
  holds it shut is that no caller passes a fourth argument.

Two agents, different files, different mandates, same structural finding. **This class deserves a
systematic sweep** — "which of our stated invariants are held by a default rather than by a check?"
is now an answered question in two places and an open one everywhere else.

Agent 2 and Agent 7 were also tasked to inspect governed binding independently. Agent 7 found no
governed-binding defect; Agent 2's work is design rather than audit. No contradiction between them.

## 10. Governed-binding recommendation (Agent 2)

**Location: after `OwedFact` projection, as its own small call, on governed rows only.** The first
pass becomes capability-ABSENT on every row.

The justification is the one that matters: **before projection a fact has no identity**, and the only
handle available is the model's own `declarationId` — which the projection explicitly refuses as
identity. Keying a second call on it would make binding addressing model-authored end to end. After
projection, both halves of every binding come from HazLenz-owned closed sets: the computed `factKey`
and the supplied `sourceId`.

**Measured grammar (as actually sent, after strict wrapper and the §108 strip):**

| request | enums | alternatives | props | chars |
|---|---|---|---|---|
| first pass, capability ABSENT (accepted) | 17 | 74 | 54 | 18,629 |
| first pass, capability PRESENT (**rejected**) | 18 | 75 | 55 | 19,074 |
| **§201 binding stage** | **3** | **5** | **5** | **1,505** |

The accepted/rejected pair differs by **one enum construct and 438 characters — 2.3%** — which is the
sharpest available demonstration that byte size is not the provider's metric. The binding stage is
**12.7× smaller** than the request that was refused.

The model addresses facts by HazLenz-minted request-scoped references (`F1`, `F2`) enumerated in the
schema — the exact inverse of `declarationId`. **No `factKey` appears on the wire in either
direction.** `governedBindingStageEffect()` is literal `false` on eight axes.

**Verifier-associated enrichment was rejected** for conflating verdict reliance with fact binding,
and **deterministic-only binding was rejected** as the §160-retired matcher under a new name.

**Agent 2 also found a defect in my §199 evidence — verified.** `CAPABILITY-TRANSPORT-DIAGNOSIS.json`
reproduces its per-row figures only with a placeholder `sourceId: "OBS"`; the executor actually sent
`OBS-<rowId>`, enumerated twice in the schema. **Every per-row figure in that artifact is 12
characters short of what was sent** (6 short in the v15 column). I confirmed this independently:
SF-01 published 18,617 / actual 18,629; SG-01 published 19,062 / actual 19,074. The conclusion is
unaffected — both sides carry the offset — but a later remeasurement would have looked unexplainably
adrift. **§199's evidence is immutable and was not edited; the correction is recorded here.**

## 11. OwedFact representation options (Agent 3)

Five options prototyped and tested against the eight real §199 pairs. **59/59.** Agent 3 explicitly
declined to recommend, correctly: choosing among them *is* answering axis Q, from the component under
evaluation.

**Measured loss:** 9 raw declarations all carried a non-blank `missingFact`; **0 of 8 projected facts
carry the property under any key or as a substring — 770 authored bytes reach neither the fact nor
the verifier.** Lexical overlap was reported with an explicit boundary that it is *not* semantic
recoverability.

**The §187 pin is more expensive than §196 recorded.** O2 (`owedProperty`) and O3
(`unresolvedTarget`) break the pin and fail **eleven live source-integrity assertions** plus §196
case B3 until re-preregistered. O1, O4 (declaration sidecar) and O5 (`OwedFactV2` successor) cost
nothing on the pin. **O2 fails outright** on a requirement nobody had tested: `required` is
unsatisfiable for `DETERMINISTIC` and `GOVERNED_EVIDENCE` facts that never had a declared property.
O4 and O5 share a demonstrated failure mode — **silence**: an empty sidecar projection is
byte-identical to O1 with no error.

## 12. Escalation options (Agent 4)

Threat model plus six options, none chosen. Three findings reshape the question:

- **F3, the largest constraint and absent from §196's argument:** `priority` is part of fact identity
  in `preservationViolations`, and there is no priority analogue of `transition()`. **Post-hoc
  escalation is unrepresentable as a priority edit**, which structurally eliminates option C-as-an-
  edit and post-admission option D.
- **F4:** `modelAuthoredOnlyFailClosedKeys` already bars a model-authored fact from alone justifying
  a fail-closed state. Every first-pass fact is `modelAuthored: true`, so escalating one would not
  entitle it to the state anyway. **The two rules do not consult each other.**
- **F2:** `LIFE_CRITICAL` does not itself fail closed — the gate needs a life-critical fact *not
  presented*. Escalation's first-order effect is ranking displacement.

Agent 4 refused to estimate alert-fatigue cost in a product whose customer surface is undesigned, and
refused to rank options on axis-R evidence that does not exist. It also flagged that
`SafeScopeEvidenceGapIntelligenceService` looks like a ready-made classifier but matches by
`String.includes` over concatenated free text — pointed at model prose it is the §160-retired matcher
deciding a fail-closed state.

## 13. Verifier options (Agent 5)

Ten candidates; seven prototyped, two declined on repo-settled grounds, one derived. **216/216.**
v3.2's prompt and schema verified byte-unchanged before and after every application.

**Highest-ranked (25.0) — C6a, challenge grounding.** The sharpest asymmetry in the contract: a
*nomination* asserting "this is open" must quote a verbatim span checked by containment; a
*challenge* asserting the exact opposite need not point anywhere. **The contract demands proof for
the claim that creates work and accepts bare assertion for the claim that removes it.** §199 produced
exactly one `CHALLENGE_FACT_VALIDITY` — on SF-04 — so this is not hypothetical.

**Compound questions are induced by the representation, not permitted by it** (proved: a well-formed
two-question verdict is refused by unmodified v3.2). `structural-questions.ts` enforces
one-string-one-fact at assembly while the verifier contract enforces the opposite at emission.

**Adding any prose field silently reopens the §193 citation boundary** — `verifierFreeTextStrings` is
a hand-maintained list. Handled by reusing the canonical pattern over 13 proved-reachable fields.

Total grammar cost if all seven were adopted: 4,998 → 9,765 bytes, 25 → 41 enum members. The top
three cost +1,998 bytes and +3 enum members combined.

## 14. Harness changes (Agent 6)

**67/67, §198 held at 89/89, both predecessor modules byte-identical to their frozen hashes.** The
additive steer worked and no mutation was needed.

**Agent 6 falsified my own §200 recommendation — verified.** §200 states SG-01 and SG-02 shared "the
identical normalised signature". The §199 log shows `contract=d0713f36696e8bea` versus
`contract=243bb6766c05599f`: **only the messages matched.** §199 keyed `requestContractId` on the
per-row schema hash, and the vNext schema is built per row, so a memory keyed on that field would
have missed SG-02 exactly as adjacency did. **My recommendation was wrong on its own worked example.**

The corrected key is an **effective grammar identity** — structure, property names, nesting, keywords
and array arity retained; leaf scalar values erased. Measured on the real cohort it partitions
exactly along the capability axis: all ten ABSENT rows to one identity, both PRESENT rows to another.
Replaying §199's actual 12-step order, the successor issues 11 rows, skips SG-02, and still issues
every row that reached inference.

**A second ambiguity in my §200 text:** I wrote "STOP" while my own worked example described the run
*continuing* past the skipped row. Agent 6 implemented `SKIP_ATTEMPT` and flagged that both are
expressible and the executing slice must freeze one. It is right that the text was ambiguous.

Also delivered: the five-class error taxonomy with conservative unknown ⇒ transient; non-opportunity
scorer safety (§198's checker returns 0 findings on axis O's real §199 shape, §201's returns 1);
an immutable-evidence guard as a tested function; and a targeted JSON splice proved on the live
2.29 MB current-state file — 235 keys agreeing with the parser, every other byte identical, and the
insert reversible byte-for-byte. Nothing was written to disk.

## 15. Full-system audit findings (Agent 7)

**30 findings: 0 CRITICAL · 4 HIGH · 11 MEDIUM · 9 LOW · 6 INFORMATIONAL**, every one cited to file
and line, with 3 items explicitly marked as requiring verification rather than asserted.

**The customer-inactive boundary holds in code**, checked four independent ways rather than taken
from comments — no reference to `expert-hazlenz` anywhere in `backend/src` outside the module, no
match for "expert" in the module registration, no dynamic import, and a single type-only outward
edge. That is why nothing is CRITICAL.

**HIGH-1** two complete divergent owed-fact implementations, both live, already drifted, with the
chain using one at each end. **HIGH-2** three incompatible `ArbitrationRequest` definitions; the only
wired producer is type-incompatible with the only consumer, and the §182 settlement boundary has no
producer in any execution path. **HIGH-3** the §199 executor reimplements the transport inline and
drops three runner-owned checks — most consequentially there is no `max_tokens` branch, so a
truncated response would return `ok: true` and project partial declarations as complete.
**HIGH-4** the `mergeExpertIntelligence` authority seam described in §9.

**I verified HIGH-3 against the frozen §199 records: zero `max_tokens` truncations across all 18
completed calls, every stop reason `tool_use`, responded model `claude-sonnet-5` on every call.** The
defect is **latent, not retroactive** — the gate is genuinely missing and §199's results are
unaffected. That distinction is load-bearing and belongs in the finding.

Two MEDIUMs matter because they make measurements read as zero rather than as gaps:
`CONTRACT_VERSION_MISMATCH` and `ANALYSIS_ID_MISMATCH` are unreachable on every real provider path
(both fields are injected before the boundary), so any count of them is a constant zero; and a
non-array `evidence` is silently coerced to `[]`, making the boundary's own malformed-evidence code
unreachable.

## 16. Integrable immediately

Nothing requires a semantic verdict, and nothing here changes runtime behaviour:

1. **The four prototype modules and their suites, as development-only artifacts.** Already
   registered; 401 assertions passing across them.
2. **The two typecheck configurations and their explicit labels.**
3. **The corrected `scripts/` diagnostic count (181, not ~2011)** — a documentation correction.
4. **The §199 12-character offset**, recorded additively here.
5. **The corrected circuit-breaker key** — the effective-grammar-identity function, as a module. It
   is not wired into any executor and wiring it is a separate authorization.

## 17. Blocked on product-owner semantic adjudication

- **the final OwedFact representation choice** — axis Q, 0 of 8 verdicts;
- **the final priority/escalation choice** — axis R, 0 of 8 verdicts;
- **any prompt remediation** for gap recall, gap precision, branch semantics or decision divergence;
- **any acceptance threshold** derived from §199 semantic quality;
- **promoting any verifier candidate to a numbered protocol version.**

**The §200 worksheet was re-verified after all seven agents completed: 0 human semantic verdicts
supplied, `PENDING_HUMAN_ADJUDICATION`, `0 / 152`.** No agent filled a slot, created a substitute
verdict, or described anything as human review, product-owner review, ground truth or semantic
acceptance.

Stated precisely, because a reader traversing the file will find non-null values and should not have
to guess: **24 of the 152 slots carry `NOT_EXERCISED`** — the governed axes N, S and T on the eight
projected facts. That is a **deterministic structural consequence**, not a judgement: both governed
rows were rejected at the transport, so the governed arm never reached inference and there is nothing
for a human to judge on those axes. The worksheet's own counter excludes them from `verdictsSupplied`
for exactly that reason, and I re-derived the split independently rather than reading the stored
figure: **152 slots · 24 pre-filled `NOT_EXERCISED` · 128 genuinely open · 0 supplied by anyone.**

## 18. Authorizations requested for subsequent implementation

| # | request | who must grant |
|---|---|---|
| 1 | Choose the governed-grammar direction (§200 A/B/C/D). Agent 2's Option C prototype is ready; the first hosted step should be a **single-row transport canary**, not a cohort | product owner |
| 2 | Any provider call, including that canary | product owner |
| 3 | Wire the hardened circuit breaker into an executor, and freeze in that slice's preregistration: the `SKIP_ATTEMPT`/`STOP_RUN` disposition, the identity function and its hash, and the deterministic allow-list | product owner |
| 4 | Add truncation and model-identity gates to the executor transport (HIGH-3) — narrow, and the one finding with a measurement consequence | product owner |
| 5 | Triage HIGH-1 and HIGH-2 — which owed-fact implementation is canonical, and whether the settlement consumer is meant to have a producer at all. Both are architecture questions, not repairs | product owner |
| 6 | A systematic sweep for the corroborated defect class: invariants held by a caller default rather than by a check | product owner |
| 7 | Any mutation of `owed-fact.types.ts` — §187-pinned, eleven live assertions, and it should be taken **jointly** with the escalation question since both need the same protocol-version decision | product owner |
| 8 | Populating `OwedFact.acceptableEvidence` from a production-permitted provenance — who authors safety-settlement criteria is a product and safety decision | product owner |
| 9 | Any promotion of a verifier candidate to `v3.4` — needs its own preregistration, hashes, offline build and canary | product owner |

**No architecture prototype was integrated into the active Expert path, and none is reachable from
production.**
