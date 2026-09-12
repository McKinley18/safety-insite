# §209 — FROZEN FRESH-COHORT PRODUCT-OWNER ADJUDICATION: SESSION PREPARED, JUDGMENTS NOT SUPPLIED

Prepared 2026-09-08. **Provider calls: 0. Database operations: 0.**

**TERMINAL:**
`EXPERT_HAZLENZ_ADJUDICATION_SESSION_PREPARED — PRODUCT_OWNER_MUST_SUPPLY_THE_177_JUDGMENTS`

---

## THE ONE THING THIS REPORT HAS TO SAY FIRST

§209 asks for two things that cannot both be done by me:

> Complete the 177 frozen substantive judgments against the authoritative acceptance packet.

> **Only PRODUCT_OWNER-attributed human verdicts may populate the 177 judgment slots. No agent,
> deterministic scorer, heuristic, language model, or code path may write a product-owner verdict.**

I am a language model acting as an agent. **The second rule governs, and I have not written a single
verdict.** 177 of 177 slots are open.

This is not a shortfall in effort and not a tooling gap. It is the property the entire acceptance
instrument rests on. §200 recorded **zero** model verdicts across 152 slots for this reason; §204's
120 verdicts were all `PRODUCT_OWNER`-attributed; §207 froze the attribution rule; §208 and §208B
each ended with 0 of 177. If I supplied verdicts and labelled them `PRODUCT_OWNER`, the label would
be false and every gate computed from them would be worthless. If I supplied them under some other
name and fed them to the gates, that would be the same act with an extra step.

**Everything §209 authorizes automation to do is done.** What remains is the judgment itself.

| §209 says automation MAY | status |
|---|---|
| render evidence | **done** — `ADJUDICATION-SESSION-209.md`, 446 KB, 24 cases in frozen order |
| validate worksheet structure | **done** — `ADJUDICATION-WORKSHEET-209.json`, 177 slots verified against the frozen budget |
| count completed slots | **done** — `COMPLETENESS-CHECK-209.json` |
| calculate deterministic findings | **done in §208**, carried forward unchanged |
| compute gates after judgments exist | **wired and exercised** — `GATE-RESULTS-209.json` |

| §209 says automation MUST NOT | status |
|---|---|
| decide semantic verdicts | **not done** — no scorer, no heuristic, no comparison against the frozen truth exists in any §209 script |
| pre-fill suggested verdicts | **not done** — every slot emitted `verdict: null`, `attribution: null` |
| translate deterministic findings into human verdicts | **not done** — the deterministic findings are rendered as evidence and nothing reads them into a slot |
| silently infer missing judgments | **not done** — 177 missing judgments are reported as missing |

---

## 1. ADJUDICATION PACKET IDENTITY

| | |
|---|---|
| preregistration identity | `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4` |
| machine worksheet | `ADJUDICATION-WORKSHEET-209.json` — `SECTION_209_PRODUCT_OWNER_ADJUDICATION_WORKSHEET` |
| human session document | `ADJUDICATION-SESSION-209.md` |
| slot source | `ADJUDICATION-WORKSHEET-208B.json`, **read rather than re-derived**, so no second slot constructor can disagree with the first |
| completeness check | `COMPLETENESS-CHECK-209.json` |
| verdict ledger | `VERDICT-LEDGER-209.jsonl` — not yet created; the recorder creates it on the first verdict |

## 2. AUTHORITATIVE §208B VERIFIER EVIDENCE — CONFIRMED

The session binds to **24 `ACCEPTANCE_VERIFIER_EVIDENCE` records** from
`RAW-VERIFIER-208B.jsonl`, and the builder **aborts** if it finds fewer than 24. The §208 verifier
outputs (`DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE`) **appear nowhere in the session document** — the
builder never opens that file. No selection between the two sets exists or is reachable.

Other authoritative evidence, unchanged: §208 first-pass (`RAW-FIRST-PASS-208.jsonl`), §208 governed
stage (`RAW-GOVERNED-208.jsonl`), and the Defect-1 corrected deterministic derivation
(`PROJECTION-208-CORRECTED.jsonl`), used exactly where the recorded Defect-1 ruling authorizes it.

`ORIGINAL_§208_EXECUTION_CLEAN_ACCEPTANCE_VALIDITY = NOT_ESTABLISHED` is preserved. §208 is not
rewritten as though the defects had not occurred: its report, its three defect entries, the failed
strict-wrapper call at ledger index 26 and the preserved aborted-attempt file all stand.

## 3–8. COMPLETENESS AND ATTRIBUTION

| | |
|---|---|
| total judgment slots | **177** — exactly the frozen budget (57 row + 120 fact) |
| PRODUCT_OWNER verdicts supplied | **0** |
| NOT_EXERCISED | **0** |
| AMBIGUOUS | **0** |
| unresolved / missing | **177** |
| frozen no-opportunity slots | **11**, preserved unchanged |
| attribution failures | **0** — worksheet and ledger both clean |
| verdict-ledger entries | **0** |
| ready for gate computation | **false** |

A direct scan of the worksheet finds **0 slots carrying any non-null `verdict` or `attribution`**.

### Per-axis slot inventory

| axis | slots | supplied | open | axis | slots | supplied | open |
|---|---|---|---|---|---|---|---|
| A | 24 | 0 | 24 | M | 24 | 0 | 24 |
| B | 24 | 0 | 24 | N | 2 | 0 | 2 |
| C | 21 | 0 | 21 | Q | 3 | 0 | 3 |
| D | 3 | 0 | 3 | R_FLOOR | 4 | 0 | 4 |
| E | 16 | 0 | 16 | R_SAFETY | 7 | 0 | 7 |
| F | 18 | 0 | 18 | S | 2 | 0 | 2 |
| G | 3 | 0 | 3 | T | 2 | 0 | 2 |
| H | 4 | 0 | 4 | | | | |
| I | 5 | 0 | 5 | | | | |
| L | 15 | 0 | 15 | | | | |

Per-case counts are in `COMPLETENESS-CHECK-209.json`.

## 9–10. PER-AXIS AND PER-CASE RESULTS

**None exist.** A per-axis or per-case result is a summary of verdicts, and there are no verdicts.
Reporting anything here would be reporting something I invented.

## 11–15. GATE OUTCOMES

Computed mechanically from the §209 worksheet, with every rule exactly as preregistered.

| gate | name | kind | denom | min | correct | fail | ambig | not-exercised | state |
|---|---|---|---|---|---|---|---|---|---|
| G1 | decision-critical fact recall | HARD | 0 | 15 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G2 | independent multi-gap preservation | HARD | 0 | 4 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G3 | total safety-fact loss | HARD | 0 | 20 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G4 | unsupported adverse counterfactuals | HARD | 0 | 20 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G5 | incomplete verification-state partitions | HARD | 0 | 3 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G6 | exact verifier target binding | HARD | 0 | **12** | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G7 | clarification settlement sufficiency | HARD | 0 | 18 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G8 | temporal / sequence preservation | HARD | 0 | 3 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G9 | unsupported downstream claims | HARD | 0 | 14 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| **G10** | **provider settlement authority** | HARD | **50** | 24 | — | **0** | — | — | **`PASSED`** (fully deterministic) |
| **G11** | **deterministic authority** | HARD | **1** | 1 | — | **0** | — | — | **`PASSED_AUTOMATED_HALF`** (recorded human check outstanding) |
| G12 | governed citation boundary | HARD | 24 | 20 | — | 0 | — | — | `AWAITING_ADJUDICATION` — scan half clean on 24 cases, axis N open |
| **G13** | **malformed states fail closed** | HARD | **0** | 0 | — | — | — | — | **`NOT_EXERCISED_ZERO_DENOMINATOR`** |
| G14 | governed axis coverage | COVERAGE | 0 | 1 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |
| G15 | priority floor distribution | MEASUREMENT | 0 | 0 | 0 | 0 | 0 | 0 | `AWAITING_ADJUDICATION` |

**Hard-gate failures: none — and none is possible yet.** Eleven of thirteen hard gates have no human
evidence at all.
**UNDETERMINED gates: none.** That state requires an AMBIGUOUS verdict on a load-bearing slot, and
no verdict exists.
**COVERAGE_INSUFFICIENT gates: none.** That state requires a scored denominator below the frozen
minimum; every denominator is currently zero because adjudication has not begun, which is
`AWAITING_ADJUDICATION`, not coverage failure.

**Acceptance determination: `NOT_DETERMINABLE — adjudication is incomplete`.**

### G6 coverage, restated exactly as frozen

Live axis-L opportunity **13**; frozen minimum denominator **12**; **headroom 1**. Neither the
denominator nor the minimum has been altered. If one further applicable axis-L judgment is
`NOT_EXERCISED`, the scored denominator falls to 12 — still at the minimum; a second takes it to 11
and **G6 becomes `COVERAGE_INSUFFICIENT`, which is neither PASS nor FAIL**. No replacement
observation has been or may be created to restore coverage.

*(The §209 authorization's "Frozen minimum denominator:" line was left blank; the frozen value from
§207 is 12, which is what makes the stated headroom of 1 consistent with 13 live slots. The gate is
computed from the frozen constant, not from this note.)*

### G13, restated exactly as frozen

`NOT_EXERCISED_ZERO_DENOMINATOR`. Zero declarations were refused across the cohort, so RR-7 had
nothing to preserve. **It is not reported as PASSED**, and no malformed output was manufactured and
no replacement case introduced to exercise RR-7. It would move only if the already-frozen acceptance
evidence legitimately supplied an exercised opportunity under the preregistered rule; it does not.

## 16. THE SEVEN ORDINARY-QUALITY CRITERIA

All seven are `AWAITING_ADJUDICATION`: each is computed from the same recorded verdicts, and there
are none. **No headline accuracy percentage was invented and none will be.** No criterion can
compensate for a hard-gate failure in either direction, and any `ORDINARY_QUALITY_NOT_MET` will be
preserved for explicit disposition at the advancement decision.

## 17. AC-02 FACT 1 — PRESERVED EXACTLY, AND NOT ADJUDICATED

The recovered §208B result is preserved verbatim: the provider returned
`ADD_OR_REPLACE_CLARIFICATION` without the required proposal and source mode, and the **unchanged**
v3.3 admission contract refused it:

```
codes  = [PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION]
detail = ["ADD_OR_REPLACE must carry a clarification",
          "ADD_OR_REPLACE must declare its source mode"]
```

**Nothing was repaired, inferred, re-run, substituted or softened.** The missing proposal was not
inferred; the missing source mode was not inferred; the defective §208 output for this fact was not
substituted; the contract was not relaxed.

**It has NOT been classified semantically**, automatically or otherwise. The structural refusal is
recorded as a structural fact and is presented to the product owner in the session document under
"Authoritative verifier output" alongside the verdict and rationale, with the frozen §200 axis-L
instructions — including the line **"that admission passed — admission is structural. TOPIC REACH IS
NOT EXACT BINDING."** — which is exactly the instruction that keeps structural contract correctness
and semantic correctness apart. Its effect on the applicable human-adjudicated axis is a
product-owner judgment that has not been made.

Any deterministic gate consequence arising directly from the contract refusal remains deterministic
and is untouched.

## 18. PREREGISTRATION DEFECTS DISCOVERED DURING §209

**None.** Adjudication has not begun, so no frozen truth item has been tested against a judgment.
The one non-material defect from §208 (`PREREGISTRATION-DEFECT-REGISTER-208.md` entry 1) stands
recorded and unrepaired. The register is in place for the product owner to append to during
adjudication.

## 19. NON-PREREGISTERED DIAGNOSTIC OBSERVATIONS

The two carried from §208 are preserved unchanged in the worksheet (AC-05 produced one admitted fact
where zero were designed; AC-07 produced two where one was designed). **One is added by §209, about
the instrument rather than the model:**

**`NON_PREREGISTERED_DIAGNOSTIC_OBSERVATION` — the §208/§208B presentation packets exposed per-slot
gate linkage.** Every slot row listed the gates it feeds. Combined with the now-published fact that
G6's coverage headroom is one slot, a reader of those packets could see which single answer would
decide a hard gate — which is precisely the "whether a particular answer would cause overall
acceptance failure" that §209 forbids exposing during adjudication. **The §209 session document
removes it**; the linkage is retained only in the machine worksheet, where the gate computation
needs it and cannot be influenced by it. No judgment was formed from the earlier packets, so nothing
is contaminated — but the earlier packets should not be used for adjudication. This observation
changes no judgment, gate applicability, denominator, threshold or acceptance outcome.

## 20. D08 REOPEN TRIGGER

**Did not fire.** D08 reopens on a concrete architectural contradiction, expressed at run time as a
**G11 failure**. G11's automated half is `PASSED`: the executed path performs no repair, no
reconstruction and no prose-parsing recovery. **D08 remains CLOSED.** The recorded human half of
G11 is still outstanding and is the only route by which the trigger could yet fire.

## 21. D15 REVISIT TRIGGER

**Did not fire, and cannot yet.** The trigger is a second consequential axis-Q loss in the fresh
cohort, or a recorded reviewer difficulty attributable to the missing back-reference. Axis Q is
adjudicated on three facts (AC-13, AC-14, AC-15) and **all three are open**, so no axis-Q loss has
been recorded at all, let alone a second consequential one; and no reviewer difficulty has been
recorded because no review has occurred. **D15 remains `O1_RETAINED` / `O4_AVAILABLE_NOT_ADOPTED`.**
Neither decision was changed on the strength of any isolated surprising output.

## 22. D14 — EVIDENCE AND RECOMMENDATION

**D14 remains OPEN. E3 was not activated, tuned or fitted.**

The evidence D14 needs from this cohort is gate G15's axis-R distribution: **7 `R_SAFETY` and 4
`R_FLOOR` judgments, all currently unfilled.** §207 wrote that denominator limit into the gate
itself so the figure could never be quoted as if it carried D14 alone, and that constraint binds.

**Recommendation: do not evaluate D14 yet.** Evaluate it after all judgments and gate results are
visible, using only the evidence authorized for that decision, and set the fresh distribution beside
§204's 7-of-8 `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` rather than in place of it. **A fresh Expert
cohort does not automatically validate an escalation policy**, and 11 measurement judgments could
not do so even when supplied.

## 23. FILES CHANGED

**New §209 code:**

| file | purpose |
|---|---|
| `backend/scripts/build-209-adjudication-session.ts` | builds the machine worksheet and the non-disclosing human session document |
| `backend/scripts/record-209-verdict.ts` | **the only path that may write a verdict.** Derives nothing |
| `backend/scripts/check-209-completeness.ts` | completeness and attribution validation |
| `backend/tsconfig.scripts-209.json` | §209 experiment-scope typecheck |

**Modified:** `compute-208-gates.ts` gained an `--adjudication` mode selecting the §209 worksheet.
No gate rule, denominator, minimum, threshold or classification was altered — the same evaluation
code runs against a different worksheet.

**New evidence** in `verification/expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08/`:
`ADJUDICATION-WORKSHEET-209.json` · `ADJUDICATION-SESSION-209.md` ·
`COMPLETENESS-CHECK-209.json` · `GATE-RESULTS-209.json` · this report.

### What the recorder refuses — each proved by execution

| refusal | proved |
|---|---|
| `UNKNOWN_SLOT` | ✓ |
| `VALUE_NOT_IN_ALLOWED_VOCABULARY` | ✓ (`EXCELLENT` rejected; permitted set echoed back) |
| `ATTRIBUTION_MUST_BE_PRODUCT_OWNER` | ✓ (`MODEL` rejected) |
| `NOT_EXERCISED_REQUIRES_A_REASON` | ✓ |
| `NO_OPPORTUNITY_SLOT_TAKES_ONLY_NOT_EXERCISED` | ✓ (a frozen no-opportunity slot cannot be scored) |
| `CONFLICTING_REVISION_REQUIRES_EXPLICIT_FLAG` | implemented; both values retained in the ledger |
| verdict omitted → **nothing is written** | ✓ — the recorder has no way to derive one |

The ledger is appended **before** the worksheet is updated, so a revision can never destroy the
value it replaces.

## 24. INTEGRITY AND REGRESSION RESULTS

| check | result |
|---|---|
| `test-207-preregistration` | **144 passed, 0 failed** |
| `test-205-remediation` / `test-205-acceptance-design` | 92/0 · 35/0 |
| `test-203-boundary-guards` / `test-202-authority-boundary-guards` / `test-204-value-shape-closure` | 52/0 · 83/0 · 36/0 |
| §205 lib sha256 prefixes (all eight) | unchanged |
| §207 lib sha256 prefixes (all five) | unchanged |
| §208 call ledger | **50 records, unchanged** |
| §208B call ledger | **24 records, unchanged** |
| provider calls in §209 | **0** |
| database operations in §209 | **0** |
| typechecks | §209, §208B, §208, §207, §205 scoped configs all clean — **EXPERIMENT_SCOPE_TYPECHECK**, not a repo-wide `tsc clean` |

## 25. RESULTING TERMINAL

`EXPERT_HAZLENZ_ADJUDICATION_SESSION_PREPARED — PRODUCT_OWNER_MUST_SUPPLY_THE_177_JUDGMENTS`

## 26. RECOMMENDATION ON EXPERT HAZLENZ ADVANCEMENT

**No advancement recommendation is available, and none may be inferred from this slice.**

The acceptance determination is `NOT_DETERMINABLE`. Two hard gates have passed on deterministic
evidence (G10, and G11's automated half); one is `NOT_EXERCISED_ZERO_DENOMINATOR`; **eleven have no
evidence at all.** Nothing about a clean structural run is an advancement signal — that was true at
the end of §208 and it is still true.

**The next step is the product owner supplying the 177 judgments**, through
`record-209-verdict.ts`, in the frozen instrument order, reading `ADJUDICATION-SESSION-209.md`.
Three things to carry in:

1. **AMBIGUOUS is a legitimate answer.** Do not choose CORRECT or INCORRECT to make a gate
   determinate; on a hard-gate slot AMBIGUOUS produces the preregistered `UNDETERMINED`, and the
   instrument is built to carry that.
2. **G6's headroom is one slot**, so a `NOT_EXERCISED` on axis L has consequences the session
   document deliberately does not show you while you judge. Use `NOT_EXERCISED` only under the
   frozen opportunity rule, with the frozen reason — never as an escape from difficult output.
3. **The four divergent cases** — AC-03 (one fact where two were designed), AC-05 (one where zero),
   AC-07 (two where one), AC-23 (none where one) — and **AC-02 fact 1's contract refusal** are where
   the frozen truth and the run disagree most visibly. They are also where the temptation to repair
   the truth will be strongest; record a `PREREGISTRATION_DEFECT` instead if one is genuinely wrong.

Then: the completeness check, the fifteen gates, the seven ordinary-quality criteria, D14, and only
then advancement. **No provider call, no remediation, no re-run and no second cohort is authorized,
and none has occurred.**

---

**TERMINAL:**
`EXPERT_HAZLENZ_ADJUDICATION_SESSION_PREPARED — PRODUCT_OWNER_MUST_SUPPLY_THE_177_JUDGMENTS`
