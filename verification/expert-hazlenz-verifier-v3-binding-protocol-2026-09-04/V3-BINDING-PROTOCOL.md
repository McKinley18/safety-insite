# Verifier protocol v3 — explicit fact binding, and the remediated falsification harness

**§166, 2026-09-04. LOCAL ONLY. 0 provider calls, $0.00, 0 database operations, 0 files changed
under `backend/src/`.**

§165 proved mechanically that the frozen v2 contract could not express the manipulation the §164
falsification experiment exists to test. §166 builds the minimum protocol that can, validates it
locally, and remediates the harness. **Nothing was spent and the experiment remains unexecuted.**

---

## 1. Terminal

```
EXPERT_HAZLENZ_VERIFIER_V3_BINDING_PROTOCOL_READY —
SCOPED_HOSTED_FALSIFICATION_AUTHORIZATION_REQUIRED
```

The protocol is locally green: **49/49** proof assertions, `SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = 0`
on both the instruction and the contract, production confinement unchanged. The authorization now
required is **scoped by two named parameters**, neither of which is an engineering choice:

1. **falsifier D is not testable** — no human-authoritative silence row survives §162;
2. **the $0.60 cost cap admits 10 of the 12 calls** under strict prospective checking, because the
   v3 request is necessarily larger than the v2 request it was priced against.

Both are stated in full below. Neither was resolved by weakening a falsifier or by lowering the
output ceiling.

---

## 2. What v3 adds, and what it deliberately does not

| | change | classification |
|---|---|---|
| **+** | `bindingFactKey` — a clarification declares the ONE supplied owed fact it answers, by copying the key exactly | `BINDING_PROTOCOL_REQUIRED` |
| **+** | `owedFactDeclarations[]` — one explicit line per supplied fact: `BOUND_BY_CLARIFICATION`, `STILL_UNRESOLVED`, `CHALLENGE_FACT_VALIDITY` | `BINDING_PROTOCOL_REQUIRED` |
| **~** | `clarificationSourceMode` — v2's two members kept, `SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION` added for the shape v2 refused | `SCHEMA_ALIGNMENT_REQUIRED` |
| **−** | `aboutUnresolvedFactRef` — superseded by `bindingFactKey`, which is the same idea checked against a closed set | `SCHEMA_ALIGNMENT_REQUIRED` |
| **−** | `NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT` (v2's 0.8 content-overlap rule) | `SCHEMA_ALIGNMENT_REQUIRED` |

**On the last one, because it is the one that could be misread as a relaxation.** v2 caught a
renamed supplied fact with a lexical overlap threshold, because under v2 a nomination was the only
way to talk about a fact. v3 addresses supplied facts *by key*, so the structural rule
`NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY` replaces it. The threshold is **dropped rather than
tightened** deliberately: a content-overlap score *is* a free-text semantic gate, and §160's
FINDING 1 — a keyword scorer satisfied by the observation text itself — is why this programme does
not run one. Proof case **C2** greps the v3 admission rule (comments stripped) and confirms no
similarity, embedding, overlap or threshold machinery exists in it.

**What v3 does not do:** it does not redesign the verifier's substantive safety reasoning. Steps 1,
2 and 3 are byte-identical to v2. So are the "usually NO" prior, the two shapes that look
decision-critical and are not, the one that looks settled and is not, the nomination proof burden,
the `YOU MAY NOT` authority list and the no-quota closing.

---

## 3. The semantic-preservation diff — `SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = 0`

`V2-V3-SEMANTIC-DIFF.md` · `V2-V3-SEMANTIC-DIFF.json`

| | |
|---|---|
| v2 → v3 | 105 lines → 145 lines |
| added | **42** (12 of them blank) |
| removed | **2** |
| `BINDING_PROTOCOL_REQUIRED` | 39 |
| `SCHEMA_ALIGNMENT_REQUIRED` | 5 |
| **`SUBSTANTIVE_SEMANTIC_CHANGE`** | **0** |
| `V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL` | **TRUE** |

**The entire removal set is two lines**, both the sentence naming v2's either/or source-mode choice:

```
     A fact that would change what is done now is not asked about. Supply the question, and say
     whether it came from a SUPPLIED_FACT or from a NOMINATED_FACT of your own.
```

Under v3 that is no longer a choice — a clarification may be both at once — so the sentence
describes fields that no longer carry the meaning it claims. Everything else in v3 is an insertion.

**The classification is checked in both directions.** An actual change with no table entry is
`UNCLASSIFIED_CHANGE`; a table entry with no actual change is `STALE_CLASSIFICATION`. Both are
empty, so the count above rests on a table proven complete rather than on an author's assurance.

**Blank-line rule, stated rather than assumed:** a blank line carries no instruction and is the
paragraph break belonging to whatever paragraph it separates. Blank changes are classified
`BINDING_PROTOCOL_REQUIRED` uniformly. It cannot hide a change because a blank line has no content.

**Survival is checked positively.** A diff reporting no change to a block and the block still being
present are different claims; only the second supports the preservation argument. All **12** v2
blocks that must survive — including `THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER` — are
confirmed present in v3 by substring.

---

## 4. Supplied owed facts — task state, not grading truth

Each supplied fact carries exactly seven fields: `factKey`, `affectedDecision`, `whyUnresolved`,
`branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`.

**What is not supplied, and is checked by pattern rather than asserted:** no row identity, no
`REQUIRED`/`FORBIDDEN` fixture label, no expected outcome, no historical model performance, no
pass/fail state, no scoring vocabulary, no human disposition, no section reference.

The leak checks are **scoped**, exactly as §163's were. The whole body is checked for
evaluation-truth artefacts; the fixture-label and scoring-state checks apply to the **user message
only**, because the contract's own vocabulary appears in the system prompt and schema by design —
the verifier cannot choose a verdict it has not been shown. Two exclusions are stated rather than
encoded silently: `REQUIRED-CONTROL` (inherited byte-identically from v2's step 4) and
`FIRST-PASS ANALYSIS` (a structural header the §156 packet builder has always emitted). Both are
matched by a naive `\bREQUIRED\b` or `\bPASS\b` and neither is grading truth.

---

## 5. Binding semantics

`bindingFactKey` must equal one supplied key by **exact string equality**. Proof case **F** shows a
one-character typo *and* a case change are both refused: there is no fuzzy match, no normalisation
and no nearest neighbour. A binding key that is not a string is refused rather than coerced (**Y15**).

An admitted clarification bound to key X affects coverage state for X **and nothing else**. Proof
case **M** binds fact A while fact B carries byte-identical descriptive prose, and B stays
`UNRESOLVED` and named in `uncoveredFactKeys`.

---

## 6. Binding + additive nomination

One response may carry a binding **and** one nomination. This is the shape §165 proved v2 refuses,
and the preflight re-runs that exact construction against v3 (gate **F.1**): **admitted**, with both
`bindingAdmitted` and `nominationAdmitted` true.

Maximum additive nominations per response: **1**. The field is an object, not a list, and an array
is refused as `MORE_THAN_ONE_NOMINATION` (**N**).

**The nomination remains additive by construction.** The bridge to the §165 ledger emits a binding
and a nomination as two *separate* declarations, and the nomination path calls
`nominateAdditiveFact()`, whose signature has nowhere to name a fact to remove. Proof case **C**
shows two supplied facts plus a nomination all three representable at once; **D** shows the second
supplied fact is not deleted.

---

## 7. `NO_CLARIFICATION_REQUIRED` resolves nothing

The verdict means only *this verifier proposes no clarification*. It cannot mark any supplied fact
answered. Proof **H**: the fact stays `UNRESOLVED`, zero ledger transitions occur, and
`TARGET_COVERAGE_WARNING` stays TRUE. Proof **I**: two consecutive NO declarations make no fact
`COVERED`.

A silent verdict that nonetheless declares a fact bound is refused
(`BOUND_DECLARATION_WITHOUT_A_CLARIFICATION`, **Y8**), and a binding key on a silent verdict is
refused (`BINDING_DECLARED_BY_A_NON_ADD_VERDICT`, **Y9**).

---

## 8. Fact challenge — a request, never a settlement

`CHALLENGE_FACT_VALIDITY` requires a recorded reason and produces an `ArbitrationRequest` whose
`settles` field is typed as the literal `false`. It is **not** a ledger declaration, so it cannot
reach `applyAdmittedDeclarations` and cannot move a fact's status.

There is deliberately **no** `FACT_NOT_DECISION_CRITICAL = true` the model can assert. A declaration
carrying `settled`, `resolved`, `covered`, `rejected` or `factNotDecisionCritical` is refused as
`CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT` (**Y7**).

Proof **J**: a challenge leaves the fact `UNRESOLVED`, 0 transitions, warning TRUE, 1 arbitration
request. Proof **K**: an unupheld challenge changes nothing. Proof **L**: arbitration *can* reject
the fact — but only through `transition(…, RECORDED_ARBITRATION)`, which HazLenz owns.

---

## 9. Contract hard gates

41 admission codes. Every Phase-8 requirement is covered and proven by a named adversarial case:

| # | requirement | code | case |
|---|---|---|---|
| 1 | binding key absent when a supplied fact is claimed | `BINDING_KEY_MISSING_FOR_SUPPLIED_MODE` | P |
| 2 | binding key not in the supplied set | `BINDING_KEY_NOT_IN_SUPPLIED_SET` | E, F |
| 3 | more than one additive nomination | `MORE_THAN_ONE_NOMINATION` | N |
| 4 | source mode inconsistent with nomination presence | `SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD` | O, P |
| 5 | nomination used to overwrite a supplied fact | `NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY` | Y12 |
| 6 | sibling fact implicitly marked covered | `MORE_THAN_ONE_FACT_DECLARED_BOUND` / `BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY` | Y4, Y5, M |
| 7 | `NO_CLARIFICATION_REQUIRED` carrying a covered claim | `BOUND_DECLARATION_WITHOUT_A_CLARIFICATION` | Y8 |
| 8 | a challenge producing a settled state | `CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT` | Y7 |
| 9 | malformed `affectedDecision` | `AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER` | — |
| 10 | forbidden fields | `FORBIDDEN_FIELD` | Y14 |
| 11 | multiple proposed clarifications | `MORE_THAN_ONE_PROPOSED_CLARIFICATION` | — |
| 12 | incomplete nomination proof | `NOMINATION_FIELD_MISSING`, `OBSERVATION_SPAN_NOT_VERBATIM`, `DECISIONS_DO_NOT_DIVERGE` | Y10, Y11 |
| 13 | human fixture truth in a runtime response | `HUMAN_TRUTH_PROVENANCE_IN_RESPONSE` | Y13 |
| 14 | free-text substitute for a binding key | `BINDING_KEY_MALFORMED` | Y15 |

Plus completeness of the declaration block: `OWED_FACT_NOT_DECLARED` (Y1),
`OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED` (Y2), `OWED_FACT_DECLARATION_DUPLICATED` (Y3),
`OWED_FACT_DECLARATIONS_MISSING` (Y16), `CHALLENGE_WITHOUT_A_REASON` (Y6).

A verdict is refused **whole** on any violation, as v1 and v2 do — which leaves every owed fact
where it was.

---

## 10. Local proof matrix — 49/49, 0 provider calls

Full transcript: `PROOF-MATRIX-RESULT.txt`.

| case | result |
|---|---|
| A one supplied fact + correct binding | admitted; COVERED; warning FALSE; 0 side effects |
| B two supplied, bind the first | second `UNRESOLVED`, warning TRUE, 1 uncovered key |
| C two supplied + binding + additive nomination | all three representable in one ledger |
| D the nomination did not delete the second fact | 0 removed, 0 deletion violations |
| E nonexistent factKey | refused |
| F typo **and** case change | both refused — no fuzzy match |
| G word-for-word matching question, no binding | coverage NOT cleared |
| H NO with an unresolved fact | warning survives, 0 transitions |
| I two consecutive NOs | no fact COVERED |
| J challenge | arbitration requested, fact not cleared |
| K unupheld challenge | original fact untouched |
| L arbitration rejection | only via `RECORDED_ARBITRATION` |
| M bind A with B's prose identical | B stays uncovered |
| N one nomination maximum | enforced |
| O nomination with no source mode | refused |
| P source mode with no nomination | refused |
| Q rationale asserting coverage | mutates nothing |
| R fixture truth into production | throws |
| S raw attempts | append-only; overwrite reported |
| T call-budget invariants | unchanged — 5-call cap, 4 channels |
| **U** | **HS-A1 — bind the flame-failure target AND nominate the auger gap in one response** |
| V | HS-A1 — auger bindable only when supplied; target survives either way |
| W | HS-E1 — the interlock fact can be bound |
| X | HS-E1 — a NO verdict leaves the warning TRUE |

**Adversarial:** Y1–Y16, all refused with the expected code.
**Diff:** D1–D4. **Confinement:** C1–C5.

---

## 11. Production confinement

| property | evidence |
|---|---|
| nothing under `backend/src/` created, modified or deleted | `git status` for `backend/src/` is byte-identical to the session-start snapshot |
| production cannot import v3 | `backend/tsconfig.json` `rootDir: "./src"`, `include: ["src/**/*"]` — a `src/` import of `scripts/lib/` is a **compile error** |
| `SOURCE_PROJECT_TSC` | `npx tsc --noEmit` → **exit 0, clean** |
| v3 modules import nothing from `src/` and reach no provider | proof **C1** — 3 modules, 0 `src/` imports, 0 provider tokens |
| v2 stays active | v2's instruction and contract are byte-unchanged; nothing selects v3 anywhere |
| current customer behaviour | **unchanged — no `src/` file and no runtime configuration was touched** |

`hazlenz.expert.verifier-instruction.v2` sha256 `ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4` — recomputed after v3 was authored, identical to §163's recorded value.

---

## 12. Human-truth authority inventory

`HUMAN-TRUTH-INVENTORY.json`

| class | rows |
|---|---|
| **human-authoritative REQUIRED** | **HS-A1, HS-E1** — both `AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS` |
| **human-authoritative silence** | **none** |
| ineligible | HS-H1 `AUTHORING_AMBIGUOUS` · HS-J1, HS-N1, HS-P1 `AUTHORING_INVALID` · HS-R1 `AUTHORING_AMBIGUOUS` |

```
FALSIFIER_D_TESTABLE = FALSE
```

Falsifier D — *does binding manufacture questions on cases where silence was right* — has **no
denominator**. Manufacturing one from `AUTHORING_INVALID` or `AUTHORING_AMBIGUOUS` rows would
produce a precision figure resting on truth a human rejected. Gate **H.4** confirms none of the four
ineligible rows appears in any request the harness builds.

**The experiment claim is narrowed, not the falsifier weakened.** D stands exactly as written in
§164/§165 and becomes testable only when fresh, independently reviewed silence material exists.

### Falsifier testability matrix

| falsifier | testable | basis |
|---|---|---|
| A settled-silence recovery | **yes** | HS-E1 is human-authoritative; A measures recovery of an owed target, not the correctness of a silence control |
| B owed-target preservation | **yes** | the core claim; HS-A1 is human-authoritative and binding is now available |
| C valid-but-displaced retention | **yes** | the additive shape is admitted by v3 and refused by v2; retention is directly observable |
| **D false question manufacture** | **NO** | no human-valid silence row survives §162 |
| E draw instability | **yes** | 6 draws per case give 15 within-case pairs against §163's 45 |
| F question burden | **yes, scoped** | measurable on these two rows only; **not** a production burden estimate and may not be quoted as one |

**5 of 6 testable.** B and D were §164's decisive pair; with D untestable, this experiment can
falsify the design's core claim but **cannot** establish that binding avoids over-questioning.

---

## 13. Remediated harness — `FALSIFICATION_HARNESS_READY = FALSE`

44 of 45 pre-spend gates pass. **$0.00 spent.** `FALSIFICATION-HARNESS-PREFLIGHT-V3.txt` /
`.json`.

### The §165 blocker is closed, and that is shown rather than claimed

Gate **F.1** builds the exact additive verdict §165 submitted to the v2 contract — which refused it
with `NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE` — and submits it to v3: **admitted**, with
binding and nomination both accepted in one response. Gate **F.2**: the schema now has
`bindingFactKey` and `owedFactDeclarations`. Gate **F.3**: 5 of 5 binding tokens present in the
instruction. Gate **F.4**: a key one character off is still refused — the door opened, not widened.

### The remaining blocker — the cost cap

| figure | value |
|---|---|
| max_tokens per call | 4000 *(unchanged, per the product owner's direction)* |
| conservative input bound | 8,000 tokens/call |
| projected input tokens | VC-08 6,660 · VC-04 6,298 |
| worst case per call | **$0.05600** |
| **prospective worst case, 12 calls (conservative)** | **$0.67200** |
| prospective worst case, 12 calls (projection-based) | $0.63550 |
| §163-measured expected cost | $0.25231 |
| hard prospective cap | **$0.60** |
| **calls admitted under the cap** | **10 of 12** |

**Why.** The $0.60 cap was set against §165's figure, which priced the **v2** request. The v3
request is necessarily larger — the owed facts and their two-branch structure are now in the prompt
— so the same 12 calls at the same output ceiling cost more. This is a direct consequence of the
manipulation, not an estimate drifting.

The runtime spend guard is implemented and exercised (gate **E.3**): before each call it checks
`spent + worstCasePerCall <= cap`, so the run **stops short rather than overspending**. The output
ceiling was **not** lowered to fit, per the owner's explicit direction.

**Minimum cap that admits all 12 calls: `$0.68` (conservative bound) or `$0.64`
(projection-based).** Set it from the conservative bound — a projection that is 5% low is a cap that
can be crossed. **This is a product-owner number and was not chosen here.**

---

## 14. The 12-call experiment as it now stands

| | |
|---|---|
| arm | one, binding-enabled, verifier protocol v3 |
| baseline | §163's 20 draws under v2, **frozen** — no new baseline purchased |
| cases | HS-A1 (VC-08), HS-E1 (VC-04) — the only two human-authoritative rows |
| draws | 6 per case = **12 hosted calls** |
| model | claude-sonnet-5 |
| max_tokens | 4000 |
| retries / replacements / first-pass calls | **0 / 0 / 0** |
| owed facts supplied | HS-A1: the flame-failure target only. HS-E1: the interlock-function fact only |

**HS-A1 supplies only the flame-failure target.** The experiment asks whether a verifier that *can*
bind the owed target still displaces it, and whether it carries the auger gap **additively**.
Supplying the auger fact too would answer the question for the model and measure nothing (gate
**C.4**).

**On comparability, stated rather than glossed:** the v3 request necessarily differs byte-for-byte
from §163's v2 request. That difference **is** the manipulation. §163 remains the frozen no-binding
baseline and is compared across the manipulation, not held byte-identical to it (gate **I.2**).

---

## 15. Protected regression — all green

`PROTECTED-REGRESSION.txt`

| suite | result |
|---|---|
| `SOURCE_PROJECT_TSC` | **exit 0, clean** |
| `test:expert-verifier-v3-protocol` *(new)* | **49/49** |
| `test:expert-bounded-reliability` | 44/44 |
| `test:expert-reliability-architecture` | 69 passed, 0 failed |
| `test:expert-verifier-v2-contract` | 46 passed, 0 failed |
| `test:expert-contract-foundation` | 56 passed, 0 failed |
| `test:expert-routing-contract` | 67 passed, 0 failed |
| `test:expert-measurement-layer` | 66 passed, 0 failed |
| `test:expert-fixture-hardening` | 76 passed, 0 failed |
| `test:expert-clarification-settlement` | 148 passed, 0 failed |
| `test:expert-affected-decision-arbitration` | 41 passed, 0 failed |
| `test:expert-unsupported-settlement` | 129 passed, 0 failed |
| `test:expert-retention-bridge` | 123 passed, 0 failed |
| `test:hazlenz-level1-recall` | PASS (17 checks) |
| `test:hazlenz-actionable-coverage` | PASS (17 checks) |
| `test:hazlenz-guarding-applicability` | 16 cases, 0 failures, 0 dangerous failures |
| `test:governed-kill-switch-authority` | 115 passed, 0 failed |

No database was contacted.

---

## 16. Exact next authorization required

Two numbers and one scope decision. None is an engineering call.

1. **Set the prospective cost cap to at least `$0.68`** (conservative bound) so all 12 calls fit,
   or accept a run that stops at 10 draws. The output ceiling stays at 4000 either way.
2. **Authorize the experiment SCOPED to falsifiers A, B, C, E and F(scoped)**, with
   `FALSIFIER_D_TESTABLE = FALSE` recorded on the result and no false-question-precision claim
   drawn from it.
3. *(optional, separable)* commission fresh silence-control material for independent human review,
   which would make D testable in a later experiment. This is not a prerequisite for A/B/C/E.

Only then may the 12-call binding falsification experiment be authorized. It remains unexecuted and
**$0.00 has been spent.**
