# §210F — FINAL RESIDUAL FIRST-PASS HOSTED CONFIRMATION, PREREGISTERED

**`EXPERT_HAZLENZ_210F_FINAL_CONFIRMATION_PREREGISTERED — PRODUCT_OWNER_HOSTED_EXECUTION_AUTHORIZATION_REQUIRED`**

Provider calls **0**. Database operations **0**. No customer or production activation. No commit,
push, tag or deploy. §210F was **not executed**.

| | |
|---|---|
| Artifact | `FINAL-CONFIRMATION-PREREGISTRATION-210F.json` |
| SHA256 | `2c186aa15734728c81e88e54ec313cba48377083ecc5e775ed01bf1281d0c24a` |
| Probe version | `hazlenz.expert.210f.final-confirmation.v1` |
| Cases | 4, all capability-ABSENT |
| Expected declarations | 5 across the probe |
| Evaluation questions | 34, of which 7 are mandatory |
| Axes | A–I as authorized, plus J |

## Instruction under test

| | |
|---|---|
| Version | `hazlenz.expert.first-pass-instruction.210e-R4-R7` |
| Plain identity | `874d26d4d036ca419dd0ffaee2a43f89ecec26f6b6bfba93e7a423a10658d831` |
| Governed identity | `e6794aaf894df3dbc186ce38d0c16b2fc69e6a0fa758c1a110ac1e640d7e7c2f` |
| Plain size | 52,443 bytes, ~18,361 tokens estimated |

Both identities were computed from the module, not copied from the authorization, and both match the
abbreviations §210E froze. Every §210F case is capability-ABSENT, so only the plain identity is
transmitted; the governed identity is frozen for the record.

## The four cases

| Case | Target | Declarations | Shape |
|---|---|---:|---|
| **E1** | R4 / GATE 8 | 1 | Precast panel demoulding. The owed property is the concrete's actual strength; the cubes at the laboratory, the unread maturity probe and the unlogged heating interruption are the tempting evidence framing. The world where the strength is adequate but unmeasured is explicitly available. |
| **E2** | R5 and R7 / GATE 9 and GATE 11 | 1 | Dairy balance-tank entry. One fact that naturally requires a BLOCKING question, adjudicated on the authored binding **and** on whether all four branch and decision fields carry real content. |
| **E3** | R6 / GATE 10 | 2 | Loading-bay trailer. Two independent facts, the trailer lock and the deck, both open, adjudicated on containment in **both** directions. |
| **E4** | R4 and R6 narrowing integrity | 1 | Robot welding cell after a program change. The required reduced-speed cycle **is** the owed property, and no sibling blocker exists. **Mandatory and load-bearing.** |

## Why E4 is the load-bearing case

E4 is the single case that fails if either §210E narrowing was lost in hosted behaviour.

- A model that over-applies GATE 8 will refuse to name performance of the act and rewrite the
  property into a state-only one. `E4.Q3` fails.
- A model that over-applies GATE 10 will hedge a positive decision against siblings that do not
  exist. `E4.Q4` fails.

Both are frozen mandatory on axis I, and both are paired across cases so neither degenerate strategy
passes:

| Control | Question | Paired with | Rule |
|---|---|---|---|
| R4 process-as-property | `E4.Q3` | `E1.Q3` | Both must PASS. E1 alone can be passed by a model that refuses every act-shaped property; E4 alone by one that never narrows a property. |
| R6 unqualified authorization | `E4.Q4` | `E3.Q3` | Both must PASS. E3 alone can be passed by a model that hedges everything; E4 alone by one that contains nothing. |

## Axis exercise matrix

| Axis | Exercised on | Frozen NOT_APPLICABLE |
|---|---|---|
| A REQUIRED_FACT_RECALL | E1 E2 E3 E4 | — |
| B EXACT_PROPERTY | E1 E2 E3 E4 | — |
| C PROPERTY_PURITY | E1 E2 E3 | E4 |
| D CLARIFICATION_BINDING | E1 E2 E3 E4 | — |
| E BRANCH_SEMANTIC_COMPLETENESS | E1 E2 E3 E4 | — |
| F DECISION_SEMANTIC_COMPLETENESS | E1 E2 E3 E4 | — |
| G INDEPENDENT_FACT_PRESERVATION | E3 | E1 E2 E4 |
| H FACT_LOCAL_DECISION_CONTAINMENT | E3 | E1 E2 E4 |
| I OVERCORRECTION_CONTROL | E4 | E1 E2 E3 |
| J FALSE_GAP_RESTRAINT | E1 E2 E3 E4 | — |

Axis **J** is beyond the authorized minimum and is declared as such. Without it an over-declaring
model would pass every case, and the authorization requires that no case be passable through
declaration count alone. Every NOT_APPLICABLE carries a frozen basis: an axis with no genuine
opportunity to fail is recorded NOT_EXERCISED, never scored as correct.

Axis D is unconditionally exercised on E2, where the frozen truth requires a BLOCKING clarification.
On E1, E3 and E4 it is **conditionally** exercised and is recorded NOT_EXERCISED where no BLOCKING
clarification is emitted. That conditional rule is frozen here, before execution.

## The seven mandatory questions

`E1.Q3` · `E2.Q3` · `E2.Q5` · `E2.Q6` · `E3.Q3` · `E4.Q3` · `E4.Q4`

All must PASS. Each sits on a case constructed so the question has a genuine opportunity to fail, so
no mandatory question can be NOT_EXERCISED.

## Frozen adjudication rules

- **A missing required declaration** fails axis A and leaves axes B, C, E and F for that entry
  NOT_EXERCISED, never PASS.
- **A `NON_SEMANTIC_PLACEHOLDER_VALUE` refusal** is a semantic FAIL on axis E or F. It is
  model-authored filler detected deterministically, not a structural failure, and is not converted
  into one.
- **A transport, HTTP, schema or tooling failure** is recorded as structural and is never converted
  into a model semantic verdict.
- **Reaching four of four** is instrument completion, not validation and not acceptance.
- **No partial credit, no aggregate compensation, no post-hoc axes.**

## Pass rule

Every exercised frozen question must PASS.

| Result | Terminal |
|---|---|
| One substantive failure | `EXPERT_HAZLENZ_FINAL_FIRST_PASS_REMEDIATION_REQUIRES_REVIEW` |
| Fully clean | `EXPERT_HAZLENZ_FIRST_PASS_DEVELOPMENT_CONFIRMED — TARGETED_VERIFIER_VALIDATION_REQUIRED` |

A clean §210F is the **stopping condition** for first-pass semantic prompt remediation. If clean, do
not continue tuning the first-pass prompt without new contrary evidence.

## Call plan and cost

Four FIRST_PASS calls maximum, exactly one draw per case. No retries, no rescue calls, no verifier
calls, no governed-stage calls, no post-output truth edits. Caching **disabled** per TBR-20; §210F
is not redesigned for caching.

| | |
|---|---:|
| Projected input per call | 26,184 tokens |
| Projected output per call | 2,824 tokens |
| **Projected spend** | **USD 0.3224** |
| Worst case, all four to the 4,000-token allowance | USD 0.3775 |
| **Recommended hard ceiling** | **USD 0.45** |

Derived from the §210B-3B measured medians plus the measured §210C and §210E static deltas. Only the
§210B-3B medians are measurements; the input figures are projections. The builder refuses to freeze
if the worst case exceeds the ceiling — the ceiling is raised, coverage is never cut.

## Integrity at freeze

Protected suites, all executed:

| Suite | Result |
|---|---|
| §205 remediation | 92 passed, 0 failed |
| §207 preregistration | 144 passed, 0 failed |
| §209 batch recorder | 116 passed, 0 failed |
| §210B-1 structural | 55 passed, 0 failed |
| §210B-2 semantic | 36 passed, 0 failed |
| §210C residual | 92 passed, 0 failed |
| §210E final | 103 passed, 0 failed |
| **Total** | **638 passed, 0 failed** |

Historical frozen evidence, verified unchanged:

| File | SHA256 |
|---|---|
| §210D preregistration | `55510f9cc4e9424d543332e1c2f5db5a86d26757adba28d21730cc882420f30f` |
| §210B-3B call ledger | `4eacfd832cc23b4444d5f9061504fb17c01fa21e897871ff65eabd0a94809943` |
| §210D raw first pass | `7d78804dbeb3f0cf77f31be80169bb63c8ae1e1e74dfd959e968c0f228fdfb44` |
| Pinned v15 prompt | `bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694` |

## Design refusals

The builder exits non-zero rather than freeze an instrument that could not discriminate. It refuses
a case that labels its own answer, replays §210D or PB-case vocabulary, names a prior case, shares
more than 35% of its content vocabulary with a §210D observation, carries governed evidence, expects
declarations without naming the owed property, names no established fact to withhold, leaves a
branch, decision, clarification or binding unfrozen, or expects a verdict other than PASS. It also
refuses if an axis is exercised by no case, if a mandatory question is missing, if an overcorrection
pair sits on one case, if E4 carries a sibling fact or forbids unqualified authorization, if E3 is
not a symmetric two-fact case, if E2 does not require BLOCKING, if two cases share an industry
setting, if the transmitted grammar is capability-PRESENT or lacks
`answersUnresolvedFactDeclarationId`, or if the instruction identity has drifted from the §210E
freeze.

## S6

`NOT_EXERCISED`. Every §210F case is capability-ABSENT and the capability-PRESENT first-pass grammar
remains refused by the provider. §210F does not attempt to validate S6, and the separate governed
stage is retained.

## What this is not

Not Expert HazLenz acceptance. Not production validation. Not an accuracy percentage. Not evidence
about the verifier or about S6. Four development cases measure four named final mechanisms and two
narrowings, nothing broader.

## STOP

Design and freeze only. **Do not execute §210F under this authorization.** Hosted execution requires
separate product-owner authorization.

Once execution begins no frozen truth in the artifact changes. A truth defect discovered later is
recorded beside the frozen text as a `PREREGISTRATION_DEFECT` and is never silently repaired.
