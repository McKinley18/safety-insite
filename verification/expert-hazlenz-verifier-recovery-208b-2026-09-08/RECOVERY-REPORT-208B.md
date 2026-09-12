# §208B — FROZEN-COHORT VERIFIER-LEG RECOVERY

Executed 2026-09-08 under `SECTION-208B-PRODUCT-OWNER-AUTHORIZATION-2026-09-08`.

**TERMINAL:**
`EXPERT_HAZLENZ_VERIFIER_LEG_RECOVERED — PRODUCT_OWNER_ADJUDICATION_OF_177_JUDGMENTS_MAY_BEGIN`

Execution-infrastructure recovery only. **No second cohort. No first-pass call. No governed-stage
call. No human verdict.**

| Boundary | Actual |
|---|---|
| Frozen preregistration identity | `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4` — verified before the first call |
| Verifier calls | **24** of the 30 authorized |
| Verifier spend | **USD 0.612072** of the USD 1.50 ceiling |
| Retries | **0** of 6 |
| First-pass provider calls | **0** |
| Governed-stage provider calls | **0** |
| Database operations | **0** |
| Human verdicts written | **0** |
| Truth / gate / denominator / classification changes | **NONE** |
| Commit / push / tag / deploy | NOT PERFORMED |

---

## 1. OFFLINE PREFLIGHT RESULT

**CLEAN — 15 identity checks and 15 proofs, all passing, zero provider calls.** Full record in
`PREFLIGHT-208B.json`.

The preflight and the executor call **the same assembly function** in
`backend/scripts/lib/expert-208b-verifier-recovery.ts`. A preflight that proves properties of
requests the executor then builds separately proves nothing, so there is one assembly path and what
was inspected is what was sent.

| proof | measured |
|---|---|
| P1 exactly 24 requests, one per admitted OwedFact | 24 |
| P2 drawn from the 20 cases that admitted a fact | 20 cases |
| P3 every owed-fact identity distinct | 24 distinct |
| P4 every request records its frozen OwedFact identity | all 64-hex |
| P5 every request records its candidate-set identity | all 64-hex |
| P6 all 49 persisted candidate records readable | 49 |
| P7 every request carries EXACTLY its case's candidate records — none added, none dropped | all match |
| **P8 no request renders `(none raised)` — the defect-3 signature cannot recur** | **0 empty blocks of 24** |
| **P9 every request carries at least one candidate** | **min 1, max 3** |
| P10 verifier schema identical to the one §208 transmitted | `83071b51edc36738` |
| P11 one verifier system prompt, unchanged | `f2522995f0b08afd` |
| P12 one wrapper identity, **no strict flag** (the §199 envelope) | `4a50ca37766df3cb` |
| P13 every user prompt distinct — nothing assembled twice | 24 distinct |
| P14 every request records the persisted first-pass response it reuses | all 64-hex |
| P15 governed evidence reaches the verifier only on AC-22 | AC-22 |

**The defect-3 signature is unreachable by three independent mechanisms**, not by a caveat: the
assembly path throws if a case with candidate records produces an empty candidate array; it throws
again if the *rendered* block reads `(none raised)`; and the executor throws a third time
immediately before transmission. A silent empty block can no longer be sent.

## 2. FROZEN PREREGISTRATION IDENTITY

`879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4` — checked as `PR1` before the
first call and unchanged throughout. The §207 suite still passes **144/0** and all five §207 module
hashes are unchanged.

## 3. IDENTITIES OF THE 24 REUSED FIRST-PASS OUTPUTS

Read from `RAW-FIRST-PASS-208.jsonl`, **byte-untouched**. No first-pass response was regenerated and
this executor has no code path that could regenerate one. Identity is the sha256 of the canonicalised
persisted provider response.

| case | raw identity (16) | parsed identity (16) | case | raw identity (16) | parsed identity (16) |
|---|---|---|---|---|---|
| AC-01 | `a321949c91af8c66` | `83b4686da03cb53b` | AC-13 | `250940f58a5f96c4` | `fa6d68da78ed4660` |
| AC-02 | `5ade6b237808ee5d` | `4645de3f9dbd13c8` | AC-14 | `d2a1e2543f5aa242` | `f69dc53859825eff` |
| AC-03 | `b1a7285cfb8a8692` | `56ecb7e43c55b2c7` | AC-15 | `d8cfca09ee8dbb0f` | `506ba699fc240973` |
| AC-04 | `3cbb1b3074174540` | `402bfb2ce16a9f60` | AC-16 | `20f2b2111ab759a9` | `cfddceb259e9bb47` |
| AC-05 | `d24e989aee288d2a` | `d16a6e2faf009c66` | AC-17 | `17303d757681663a` | `6b9727adb4333872` |
| AC-06 | `a7a697a9603ae797` | `133a6c305cab0203` | AC-18 | `62157bb8520a32d8` | `9f1abec6c40fd403` |
| AC-07 | `531b4a7fdcf4b535` | `44be08542d9b1318` | AC-19 | `96d5400a76ed0dd5` | `d0675ad7111319de` |
| AC-08 | `7c417f464ade5d5a` | `a22997a53532cec3` | AC-20 | `3b79524a7d13e2dc` | `68c85b3d17d80137` |
| AC-09 | `a11730f272de67ae` | `4d46fcde328f2c1e` | AC-21 | `1194d4482293eb90` | `47e2c90a59149832` |
| AC-10 | `86f8d586aa06ff52` | `53944c5296c62751` | AC-22 | `2554170184de912d` | `3a6212b2d0ab85ae` |
| AC-11 | `dbde00a4a052c0ac` | `2a354a833ff3b2bf` | AC-23 | `203012c570fdf9c1` | `58957c8eafbde895` |
| AC-12 | `dc2079fcc6fc7f40` | `bd416399e7d35c95` | AC-24 | `df1e48d27c95f973` | `29ee38f1813b20c8` |

Each of the 24 recovery records and each ledger entry carries the `firstPassRawIdentity` of the
response it reused.

## 4. CANDIDATE COUNTS PER CASE

**49 persisted candidate records across the 24 cases**, every one readable and assembled verbatim.

| case | cands | case | cands | case | cands | case | cands |
|---|---|---|---|---|---|---|---|
| AC-01 | 2 | AC-07 | 2 | AC-13 | 2 | AC-19 | 3 |
| AC-02 | 3 | AC-08 | 2 | AC-14 | 2 | AC-20 | 3 |
| AC-03 | 3 | AC-09 | 1 | AC-15 | 2 | AC-21 | 3 |
| AC-04 | 1 | AC-10 | 2 | AC-16 | 2 | AC-22 | 3 |
| AC-05 | 1 | AC-11 | 2 | AC-17 | 3 | AC-23 | 4 |
| AC-06 | **0** | AC-12 | 2 | AC-18 | 1 | AC-24 | **0** |

**AC-06 and AC-24 legitimately raised no candidates** — both are zero-declaration cases whose
observations the model treated as sufficient — and neither admitted an owed fact, so neither
receives a verifier call. Every one of the 20 cases that *does* receive verifier calls raised at
least one candidate, so **all 24 requests carry a populated block**.

The executor log reports **54 candidate entries in total**: that is the per-*request* sum, and a
case with two admitted facts assembles its own candidate set twice. Proof P7 compares per *case*
against the persisted records, which is the comparison that can detect an addition or a drop.

## 5. PROOF THE CANDIDATE BLOCKS WERE POPULATED AS INTENDED

Four independent lines of evidence, all in the persisted artifacts:

1. **Per-request candidate counts**, recorded on every ledger entry and every recovery record:
   minimum 1, maximum 3, **zero requests at 0**.
2. **The candidate-block identity**, computed by extracting the block *from the transmitted prompt*
   rather than re-rendering it — a second formatter could drift and would then certify the wrong
   bytes. Cases sharing a candidate set share the block identity (AC-01's two facts both carry
   `816c433b0579`), and cases with different sets differ.
3. **Preflight proof P8**: no assembled request renders `(none raised)`.
4. **Three transmission guards** that throw rather than send, described in §1.

For contrast, every §208 verifier call rendered exactly `(none raised)`.

## 6–9. CALLS, SPEND, RETRIES, FAILURES

| | |
|---|---|
| verifier calls | **24** — one per admitted OwedFact, of 30 authorized. **Unused capacity was not spent.** |
| spend | **USD 0.612072** of the USD 1.50 ceiling |
| retries | **0** of 6 — no transient failure occurred |
| HTTP statuses | **all 200** |
| failure classes | **`NO_FAILURE` × 24** |
| reached inference | 24 of 24 |
| stop reasons | `tool_use` on all 24 |
| model responded | `claude-sonnet-5` on all 24 |
| structural rejections | **0** |
| truncations, unparseable payloads, degenerate outputs | **0** |

**No provider or infrastructure failure occurred.** The §208 defect-2 rejection did not recur: the
wrapper identity is constant across all 24 calls and carries no strict flag.

## 10. STRUCTURAL / CONTRACT OUTCOMES

All 24 returned a parseable `tool_use` block. Under the **unchanged** v3.3 admission contract:

| | |
|---|---|
| admitted | **23** |
| refused | **1** — AC-02 fact 1 |

AC-02 fact 1 returned `ADD_OR_REPLACE_CLARIFICATION` without the replacement proposal the contract
requires:

```
codes  = [PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION]
detail = ["ADD_OR_REPLACE must carry a clarification",
          "ADD_OR_REPLACE must declare its source mode"]
```

That is a **verifier contract-compliance observation**, recorded structurally. Whether it bears on
axis L is a product-owner judgment and is not made here.

## 11. RECOVERED VERIFIER RESULTS

`RAW-VERIFIER-208B.jsonl`, 24 records, each marked `ACCEPTANCE_VERIFIER_EVIDENCE`.

| verdict | count |
|---|---|
| `VERIFIED_AS_IS` | 23 |
| `ADD_OR_REPLACE_CLARIFICATION` | 1 (AC-02 fact 1) |

Every record carries its call index, candidate count, candidate-block identity, candidate-set
identity, owed-fact identity, reused first-pass response identity, user-prompt identity, schema
identity, wrapper identity, the raw provider payload, the parsed payload and the admission result.

## 12. COMPARISON TO THE ORIGINAL — **DIAGNOSTIC ONLY**

`VERIFIER-COMPARISON-208B.json`. **This comparison decides nothing.** The replacement rule was fixed
by the authorization before the comparison existed, it is uniform across all 24 facts, and no code
path selects between the two sets.

| | |
|---|---|
| facts compared | 24 |
| verdict identical | **23** |
| verdict differing | **1** — AC-22: `ADD_OR_REPLACE_CLARIFICATION` → `VERIFIED_AS_IS` |
| admission outcome changed | **2** — AC-02 fact 1 `true` → `false`; AC-22 `false` → `true` |

**Agreement on 23 of 24 does not retrospectively make the degraded input adequate.** The §208 calls
were made with an empty candidate block on every one of the 24; that is a property of the
measurement, not of the answer it happened to produce. Equally, the one difference does not make the
recovered answer "better" — neither set is scored here.

## 13. PROOF NO FIRST-PASS OR GOVERNED-STAGE CALL OCCURRED

- The §208B ledger contains **24 records, every one `leg: VERIFIER_RECOVERY`** — one distinct leg
  value across the whole file.
- The §208B executor **imports no first-pass or governed-stage request builder**. It has no code
  path to `buildExpertVNextWireSchema`, `buildExpertR2SystemPrompt` or `buildGoverned202Request`,
  so a first-pass or governed call is not merely unmade but unconstructible.
- The §208 ledger is **unchanged at 50 records**; the recovery writes only into its own directory.
- `RAW-FIRST-PASS-208.jsonl` and `RAW-GOVERNED-208.jsonl` are untouched, and their identities are
  recorded above and on every recovery record.

## 14. PROOF NO HUMAN VERDICT WAS WRITTEN

- `ADJUDICATION-WORKSHEET-208B.json`: **177 slots, `suppliedVerdictCount: 0`, `openSlotCount: 177`**,
  and a direct scan finds **0 slots carrying any non-null `verdict` or `attribution`**.
- No script in §208 or §208B contains a code path that writes a verdict or an attribution; every
  slot is constructed with both fields `null`.
- The deterministic scoring ran before any adjudication and is carried as evidence, **never** as a
  suggested answer on a semantic slot.

## 15. FILES CHANGED

**New §208B code:**

| file | purpose |
|---|---|
| `backend/scripts/lib/expert-208b-verifier-recovery.ts` | deterministic assembly + the pre-run identity checks, shared by preflight and executor |
| `backend/scripts/preflight-208b-verifier-recovery.ts` | offline preflight, zero cost |
| `backend/scripts/execute-208b-verifier-recovery.ts` | the 24-call recovery executor |
| `backend/scripts/compare-208b-verifier.ts` | the diagnostic comparison |
| `backend/tsconfig.scripts-208b.json` | §208B experiment-scope typecheck |

**Modified §208 tooling** (infrastructure only — no truth, gate, denominator or classification
change): `build-208-adjudication.ts` and `compute-208-gates.ts` each gained a `--recovered` flag
selecting the verifier evidence source and output directory. Keeping ONE builder was deliberate: a
second copy could drift from the first and then certify different slots.

**New evidence** in `verification/expert-hazlenz-verifier-recovery-208b-2026-09-08/`:
`PREFLIGHT-208B.json` · `CALL-LEDGER-208B.jsonl` · `RAW-VERIFIER-208B.jsonl` ·
`VERIFIER-COMPARISON-208B.json` · `ADJUDICATION-WORKSHEET-208B.json` ·
`ADJUDICATION-PRESENTATION-PACKET-208B.md` · `GATE-RESULTS-208B.json` · this report.

**Appended** to `verification/expert-hazlenz-fresh-cohort-execution-208-2026-09-08/EXECUTOR-DEFECT-REGISTER-208.md`:
the product-owner rulings on entries 1–3, including
`ORIGINAL_§208_EXECUTION_CLEAN_ACCEPTANCE_VALIDITY = NOT_ESTABLISHED`. The original entries are
unedited and the §208 evidence — including the failed strict-wrapper call as ledger call 26 and the
preserved aborted-attempt file — is intact.

### The acceptance packet, and what it supersedes

`ADJUDICATION-WORKSHEET-208B.json` is `SECTION_208B_ACCEPTANCE_ADJUDICATION_WORKSHEET`: **177 slots,
0 verdicts**, bound to `ACCEPTANCE_VERIFIER_EVIDENCE`. Its 15 axis-L slots (13 live) now carry a
**provenance statement** in place of §208's fidelity disclosure — the defect is remedied, not
caveated, which is what the authorization required. The §208 worksheet remains as the record of what
§208 produced and is marked superseded; it must not be adjudicated.

The 11 no-opportunity slots are unchanged (AC-03 fact 2, AC-23 fact 1), because they arise from the
first-pass results, which §208B did not touch. **G6's coverage headroom remains one slot.**

## 16. REGRESSION AND INTEGRITY RESULTS

| check | result |
|---|---|
| `test-207-preregistration` | **144 passed, 0 failed** |
| §205 lib sha256 prefixes (all eight) | **unchanged** |
| §207 lib sha256 prefixes (all five) | **unchanged** |
| preregistration record on disk | `VERIFIED` |
| §208 call ledger | **50 records, unchanged** |
| §208 first-pass and governed evidence | **untouched** |
| `tsc -p tsconfig.scripts-208b.json` | clean — **EXPERIMENT_SCOPE_TYPECHECK (§208B)**, not a repo-wide `tsc clean` |
| `tsc -p tsconfig.scripts-208.json` | clean |

## 17. RESULTING TERMINAL

`EXPERT_HAZLENZ_VERIFIER_LEG_RECOVERED — PRODUCT_OWNER_ADJUDICATION_OF_177_JUDGMENTS_MAY_BEGIN`

## 18. RECOMMENDATION — MAY THE 177 JUDGMENTS BEGIN?

**Yes, on the §208B acceptance packet.** Every condition the authorization set for the recovery is
met and checkable in the artifacts:

- the preflight was clean and offline, and no provider call was used to debug assembly;
- all nine pre-run identity classes verified before inference;
- the stimuli are the frozen §208 first-pass outputs, byte-untouched, with identities recorded;
- the candidate blocks are populated from the persisted records with no wording rewritten;
- the envelope is §199's, the schema, prompt, admission contract, provider and model are unchanged;
- 24 calls, USD 0.612072, 0 retries, 0 failures, within both ceilings, with unused capacity unspent;
- the replacement is uniform, and no cherry-picking is possible in the tooling;
- 177 slots remain open with 0 verdicts, so no human judgment influenced the recovery.

**Two things the product owner should carry into adjudication, neither of which blocks a start:**

1. **G6's coverage headroom is one slot.** Thirteen axis-L slots are live against a preregistered
   minimum of twelve. A single `NOT_EXERCISED` there makes G6 `COVERAGE_INSUFFICIENT`, which is not
   a pass. This is a property of the first-pass results (AC-03 produced one fact where two were
   designed, AC-23 none where one was), not of the recovery.
2. **AC-02 fact 1's verifier output fails the v3.3 admission contract.** It is preserved, it is the
   acceptance evidence for that fact, and how it bears on axis L is a judgment — not something this
   report or any deterministic check may decide.

**What must not happen next:** nothing may be re-run because the recovered semantic output looks
unfavourable. The recovery is complete, the evidence is uniform, and the next authorized activity is
the frozen 177-judgment product-owner adjudication against the §208B acceptance packet.

---

**TERMINAL:**
`EXPERT_HAZLENZ_VERIFIER_LEG_RECOVERED — PRODUCT_OWNER_ADJUDICATION_OF_177_JUDGMENTS_MAY_BEGIN`
