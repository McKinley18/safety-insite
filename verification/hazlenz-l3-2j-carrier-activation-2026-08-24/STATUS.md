# L3-2j — SHIPPED CLARIFICATION CARRIER ACTIVATION + CROSS-PROVIDER REVALIDATION

> ## `L3_2J_COMPLETE — SHIPPED_CARRIER_ACTIVATION_MEASURED_AND_REFUSED`
> ## `SHIPPED_PROMPT_AND_SCHEMA_BYTE-RESTORED — LOCKED_L3-2h_COMPARISON_RE-DERIVED_AND_RESTORED`
> ## `CROSS_PROVIDER_REVALIDATION_NOT_EXECUTED — CREDENTIAL_ABSENT — PROVIDER_AXIS_REMAINS_n=1`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Nothing committed, nothing pushed, nothing deployed, **no stash
operation**. No sealed set opened. Blueprint **§41**; decision log **`D-59`**, **`D-60`**, **`D-61`**.

L3-2j did the thing it was told to do, measured the result, and **put it back**. Both halves of that
sentence are the deliverable.

---

## 1. The one-line result

> ### `THE_SHIPPED_LADDER_DOES_NOT_HAVE_THE_DEFECT_THE_CARRIER_WAS_BUILT_TO_FIX`

`D-56`/§39.5.1's zero-candidate clarification loss was measured on **`V_S_STRUCT`** — the structural
representation, which is architecture-selection evidence and **is not what ships**. On the shipped
ladder prompt the question already rides a hazard candidate on **5 of 5** `CLARIFICATION_REQUIRED`
scenarios. A carrier cannot improve a metric that is already at ceiling, and every configuration that
activated it **cost** something measurable.

---

## 2. What was actually done, in order

1. **Declared `unresolvedDecisions` in `L3_SYSTEM_PROMPT`**, additively, using the **byte-identical**
   `CARRIER_DECLARATION` L3-2i proved as `V_CARRIER`, in that harness's APPEND position; advanced
   `L3_PROMPT_VERSION` to `v7`; added the field to `buildProposalSchema`.
2. **Ran the FULL 24-scenario already-open diagnostic corpus** through the **shipped** pipeline —
   shipped schema, shipped user prompt, shipped binder, shipped validator — one variant per process.
3. Found a **high-consequence regression**. Diagnosed the cause in the declaration's own text,
   **revised it once**, re-ran the full corpus. Still regressed.
4. **Separated the two halves** (prompt-only vs schema-only) so the regression could be attributed
   rather than merely observed.
5. **Re-derived the locked L3-2h comparison** against the activated prompt with the byte-unchanged
   locked harness. It does **not** transfer.
6. **Reverted the shipped prompt and schema to their v6 bytes** and proved the revert restored the
   exact prior behaviour, twice, by two independent instruments.
7. **Item (4) was not executed.** `GEMINI_API_KEY` is not present. See §7.

---

## 3. The measurement — `D-58`'s two denominators, side by side, never renamed

Provider `qwen3-coder:30b` at `127.0.0.1:11434`, temperature 0, seed 20260822, `num_ctx` 8192.
Cohort: the 24 already-open diagnostic scenarios, **parsed out of the locked harness** and
cross-checked field-by-field against the **frozen L3-2g artifact** — two independent sources agreeing
on all 24, so cohort drift is unrepresentable rather than merely unlikely.

| variant | prompt sha | cand-conditioned clar | scenario-level clar | clar **precision** | HC (model-asserted) | false ACTIVE | unnecessary question |
|---|---|---|---|---|---|---|---|
| **`V_PRE_ACTIVATION`** — the BEFORE | `b8cc50fc` (v6) | **5/5** | **5/5** | **100%** | **12/13** | 0/11 | — |
| `V_ACTIVATED` decl **rev 1** + schema | `b7f35111` | *undefined* (0 rows survive) | 5/5 | 71.4% | **9/13** | 0/11 | `C-CS-05`, `H-AM-05` |
| `V_ACTIVATED` decl **rev 2** + schema | `45862b26` | 5/5 | 5/5 | 83.3% | **10/13** | 0/11 | `H-AM-05` |
| `V_SCHEMA_ONLY` — the schema half alone | `b8cc50fc` (v6) | 5/5 | 5/5 | 83.3% | 12/13 | 0/11 | `C-CS-05` |

**Neither clarification denominator moved anywhere.** Both were already at 5/5 before activation, and
both stayed at 5/5 after it. What moved was **precision** (100% → 83.3% → 71.4%) and
**high-consequence recall** (12/13 → 10/13 → 9/13). `HC (model-asserted)` is a **third, separately
named** metric and is **not** §37–§39's candidate-conditioned high-consequence figure, which does not
exist for ladder rows because they emit no `stateFacts`.

### The noise floor is zero, so every difference above is attributable

| repeat pair, each in its **own process** | differing fields |
|---|---|
| decl rev 1 vs its repeat | **0** / 144 |
| decl rev 2 vs its repeat | **0** / 144 |
| schema-only vs its repeat | **0** / 144 |

§38.3 is satisfied: the runner **refuses** to execute more than one variant per invocation, and every
artifact records its own `pid`.

---

## 4. What each configuration broke, named

**Declaration revision 1** — the text L3-2i proved on five scenarios:

* `E-OA-07` (MSHA, roof bolter under unsupported roof) `ACTIVE` → **`NO_HAZARD_ESTABLISHED`, zero
  candidates**. The hazard disappeared.
* `H-AM-05` (gate hanging on one hinge, lower pin sheared) `ACTIVE` → `INSUFFICIENT_EVIDENCE`, zero
  candidates, **plus an unnecessary question**. This is `RC-01`'s failure mode, which cost L3-2c a
  phase to close.
* `F-WC-03` `ACTIVE` → `CONTROLLED`.
* `C-CS-05`, a **MUST-NOT-ASK** scenario, raised a question — and the validator could not refuse it,
  because §34.2's gate only fires when candidates exist and all are decided. The model had dropped
  the candidate, so the carrier was legitimate by construction. **Dropping the candidate defeated the
  control that was supposed to catch the question.**
* Candidate-borne clarifications went **5 → 0**. The new carrier did not supplement the old one; it
  **replaced** it — the opposite of the design, which says to use it *when there is no candidate for
  the question to hang on*.

**The cause, and why the fix was five lines and not an emphasis change.** Revision 1 said the field
was for when you *"return an EMPTY hazardCandidates array"*. The model read that as permission to
return one. It directly contradicts the `ASKING A QUESTION` rung two paragraphs above, which says an
empty list there is **WRONG**. Two rules pointed opposite ways and the newer, more specific one won.

**Declaration revision 2** — the licence removed, precedence stated instead. Recovered `E-OA-07`.
Still lost `F-WC-03` and `H-AM-05`, and the proposal-level carrier was used **zero times across all
24 scenarios**: it cost two high-consequence cases to buy nothing.

**Schema only** — no high-consequence regression, and the model **spontaneously filled
`unresolvedDecisions` on six rows with the prompt saying nothing about it**, because the JSON schema
is itself sent to the provider. But `C-CS-05` still moved from a correctly decided `HYPOTHETICAL` to
`INSUFFICIENT_EVIDENCE` with a question, so the MUST-NOT-ASK pole regressed here too.

---

## 5. The locked L3-2h comparison was re-derived, not assumed — and it does NOT transfer

The locked harness is **byte-unchanged** (`73f74131`). Its **inputs** changed, which is the whole
point, so it was re-run.

| locked variant, under declaration rev 2 | HC | false ACTIVE | rows differing from frozen L3-2g |
|---|---|---|---|
| `V_B_LADDER` — the baseline every L3-2g/L3-2h number is read against | **10/13** (was 12/13) | 0/11 | **11 of 24** |
| `V_A_LADDER` | 12/13 | 0/11 | **12 of 24** |

`V_B_LADDER` lost `F-WC-03` and `H-AM-05` — **the same two scenarios, by a different harness with a
different schema**. Two independent instruments agree on the regression.

The four **structural** variants read a self-contained prompt string and never touch
`L3_SYSTEM_PROMPT`, so their inputs were unchanged by construction.

### The revert is proven, not asserted

| check | result |
|---|---|
| `V_B_LADDER` re-run after the revert, vs **frozen L3-2g** | **0 differences** / 24 scenarios |
| `V_PRE_ACTIVATION` re-run after the revert, vs the run taken before the declaration existed | **0 differences** / 168 fields |
| `sha256(L3_SYSTEM_PROMPT)` | `b8cc50fc…` — byte-identical to v6 |
| `L3_PROMPT_VERSION` | `hazlenz.l3.prompt.v6` — the version matches the bytes |

---

## 6. A finding that cost six measured fields — `D-60` `DO_NOT_REDISCOVER`

> ### `THE_JSON_SCHEMA_IS_AN_INPUT, AND KEY ORDER IS PART OF IT`

When the declaration was moved out of the shipped prompt and back into the harness, the reconstructed
run **disagreed with the recorded one on six fields** — `B10` lost its candidate, `F-TB-02` lost its
candidate, three rows changed which carrier held the question — on a prompt whose **sha256 was
identical**. The cause was that the rebuilt schema **appended** `unresolvedDecisions` where the
original had **inserted** it between `observationInterpretation` and `hazardCandidates`. The schema is
serialised and sent to the provider as `format`, so where a key sits changes the bytes the model is
constrained by.

Restoring the position produced a **0-difference** reproduction. Every corpus artifact now records
`schemaSha256`, and `test-l32j-carrier-activation.ts` pins the serialised shipped schema, so this can
never again be checked by reading the code.

---

## 7. Item (4) — cross-provider revalidation: NOT EXECUTED `OPEN_ITEM`

`GEMINI_API_KEY` is **not present** in this session's environment, nor in any ancestor process. The
probe was validated against variables that **are** present before its negative result was trusted, and
it counted the variable **name** only — no value was read, printed, hashed or persisted. Full record:
`CREDENTIAL_AND_EGRESS.txt`.

The task statement said the credential had been exported into the launching environment. It had not
been. **The provider axis therefore remains `n = 1`**, and the blocker is unchanged from §31.1 →
§38.1 → §38.8 → §39.1 → §40. Nothing was substituted, estimated, simulated or worked around:
`GEMINI_MODEL` is exported by the user's shell as `gemini-3.1-flash-lite-preview`, which is **not** the
authorized model, and it was not used.

---

## 8. Regression, authority and egress — MEASURED

**L3 offline: 814 assertions over 10 suites, 0 failed** (777 over 9 at §40.9; **+37 new**, and **no
prior assertion rebound** — both pins L3-2j temporarily moved were restored when the prompt was).

`l31` 49 · `l32` 189 · `l32b` 105 · `l32c` 86 · `l32d` 71 · `l32e` 82 · `l32f` **77** · `l32g` 57 ·
`l32i` 61 · **`l32j` 37**.

`test:hazlenz-core` **28 pass / 2 fail** — the two documented §13.1 failures (`Golden Hardening
Scenarios`, `HazLenz Production Path Regression`) and **only** those, not reclassified. KG contracts
unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51, `kg4b-shadow-contract` 123/123,
`kg3f-predicate` 16/16, `kg3f-determinism` 170/170, `evidence-foundation` 35. Backend and frontend
`tsc --noEmit` both exit 0.

**Customer authority** is preserved by construction — the shipped prompt and schema are byte-identical
to their pre-phase state — and verified structurally: zero importers of `reasoning-l3` outside itself,
`reasoning-runner.ts` still does not consume `state-facts`, the validator carries no Nest or TypeORM
decorator.

**Egress:** one destination, `http://127.0.0.1:11434`. **264 local inference calls, 0 hosted-provider
calls**, no credential material read or emitted, no production data sent anywhere.

**Preservation:** HEAD `1feda622`, branch, 23 tags and the 4-entry stash list re-verified unchanged.
Sealed corpus hash-verified unchanged before and after, present in **zero** artifacts of this phase.

---

## 9. What L3-2j did NOT do

* did **not** consume the sealed acceptance corpus;
* did **not** begin L3-3, and did not move that gate one inch;
* did **not** select a production provider, and did not reopen the qwen-versus-Gemini decision;
* did **not** promote `R1_MISSING_FIRST` — `state-facts.ts` is byte-unchanged;
* did **not** tune prompt emphasis: the v6 body was never reworded, moved or deleted at any point,
  which is asserted byte-for-byte and not merely claimed;
* did **not** modify the locked harness or `TERMINAL_A`'s two scorers;
* did **not** commit, push, deploy, or perform any stash operation.

`DISC-02` is still left alone and `F-FLD-159`'s class is still open.

---

## 10. Nine acceptance gates

| # | gate | result |
|---|---|---|
| 1 | the carrier was actually declared in the shipped prompt and schema, both halves | **PASS** — and both were measured |
| 2 | the FULL already-open diagnostic corpus was run, not a subset | **PASS** — 24/24, cohort cross-checked against a frozen artifact |
| 3 | §38.3 process isolation, repeat control never sharing a process | **PASS** — runner refuses; pids recorded; three 0-difference floors |
| 4 | a BEFORE was measured, not asserted (`D-54`) | **PASS** — `V_PRE_ACTIVATION`, derived from the shipped artefacts |
| 5 | the regression was attributed, not merely observed | **PASS** — halves separated; cause named in the declaration's own text |
| 6 | the locked L3-2h comparison was re-derived rather than assumed to transfer | **PASS** — it does **not** transfer; 11/24 rows move |
| 7 | both clarification denominators reported, neither renamed (`D-58`) | **PASS** — and a third metric given its own name rather than borrowing one |
| 8 | the shipped path ends byte-identical to its pre-phase state | **PASS** — proven twice, by two instruments, 0 differences |
| 9 | cross-provider revalidation on the second provider | **NOT EXECUTED** — credential absent, recorded, nothing substituted |

---

## 11. The honest summary

The next action L3-2i named was correct to try and wrong to assume. Declaring the field in the shipped
prompt is exactly what the pipeline needed **if** the shipped pipeline had the defect — and the full
corpus says it does not. The defect lives in the structural representation, which has never been
selected, so the carrier remains **built, tested and unused**, which is a considerably better place
for it than shipped and silently costing two high-consequence findings.
