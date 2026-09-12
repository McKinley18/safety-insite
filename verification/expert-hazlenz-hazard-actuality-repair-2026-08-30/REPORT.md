# EXPERT HAZLENZ — R6 Hazard-Actuality / Controlled-Exposure Local Repair

Zero-hosted-call local diagnostic and repair targeting the §112/D-124 remaining R6 defect
(`HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_CURRENT_EXPOSURE_INDEPENDENCE`). Decision log: D-125.
Blueprint: §113.

## 1. Exact terminal

```
EXPERT_HAZLENZ_HAZARD_ACTUALITY_REPAIR_ACCEPTED -- BOUNDED_HOSTED_R6_CONFIRMATION_AUTHORIZATION_REQUIRED
```

## 2. Git state

- Local HEAD: `37a5d1b50abe836eb19dd24ee18ad10557bda131` (unchanged)
- `origin/main`: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`
- Nothing committed, pushed, tagged, or deployed.

## 3. Files changed

**Added:**
- `backend/src/safescope-v2/expert-hazlenz/fixtures/hazard-actuality-fixtures.ts` — 8-fixture contrastive corpus (U-A..U-H) + 8-fixture adversarial recall corpus (V1-V8)
- `backend/scripts/diagnose-expert-hazard-actuality-repair.ts` — local-only (Ollama) acceptance instrument

**Modified:**
- `backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts` — the repair (system prompt + user prompt + version bump v5→v6)
- `backend/scripts/test-expert-routing-contract.ts` — A.2 literal re-anchored v5→v6
- `docs/INSITE_CURRENT_STATE.json` — new entry
- `docs/INSITE_ENGINEERING_BLUEPRINT.md` — new §113 narrative, D-125 decision-log row

**Untouched (explicitly, per authorization):** evidence/grounding architecture (`expert-normalization.ts`, quote binding, `groundingStatus` semantics) — zero changes.

## 4. Confirmed/refuted root cause

**CONFIRMED**, directly from the raw §112 R6 transcripts (Phase 1, `characterization/PHASE1-R6-REMAINING-LOSS-MECHANISM.md`). In all 3 hosted reps, the model explicitly decomposed "the guard was removed" into "a distinct hazard family from lockout/tagout itself," set `assertedConditionState: ACTIVE`, and then justified that ACTIVE claim using ONLY hedged hypotheticals ("if re-energization occurs," "if a worker were to approach," "for anyone who might approach assuming it is safe," "for any worker approaching... during the work") — never a fact the observation actually establishes. `HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_CURRENT_EXPOSURE_INDEPENDENCE` is the correct name.

## 5. Exact R6 reasoning trace

Full per-repetition trace in `characterization/PHASE1-R6-REMAINING-LOSS-MECHANISM.md`: OBSERVATION FACT → MODEL INTERPRETATION → HAZARD-FAMILY DECOMPOSITION → CURRENT-STATE/EXPOSURE ASSUMPTION → TYPED CANDIDATE → CLARIFICATION, for all 3 reps, plus a secondary confirmed sub-pattern (rep 2's "is the lockout device (lock) itself, not just the tag, applied" — a fresh instance of re-asking an already-answered fact, this time about the isolation *method* rather than the energy state).

## 6. Hazard-actuality rule

`characterization/PHASE2-HAZARD-ACTUALITY-RULE.md`: a fact can be true and relevant to a hazard family without independently establishing a CURRENT hazard. Before promoting a fact to a current candidate, the reasoning must point to a current hazardous state, exposure, or interaction — not merely a fact that would be hazardous under an unstated hypothetical. Explicitly not "LOTO suppresses machine guarding" — a missing guard remains fully candidate-worthy whenever a *current* fact supports exposure (energy not verified, stored energy remaining, no isolation device at all, a second uncontrolled source, merely stopped rather than isolated, auto-restart capable, or a worker actually exposed right now).

## 7. Contrastive corpus composition

`hazard-actuality-fixtures.ts`, 16 fixtures across 8 hazard families:

**Contrastive (U-A..U-H):**

| id | class | family | must |
|----|-------|--------|------|
| U-A | verified control + ancillary condition | electrical | suppress — the primary defect-reproduction fixture |
| U-B | stopped but not isolated | machine_guarding | candidate survives |
| U-C | incomplete LOTO (pneumatic not bled) | lockout_tagout | recall survives (clarification, calibrated) |
| U-D | verified zero energy + current secondary exposure | wet_environment | suppress ancillary, secondary survives |
| U-E | verified zero energy + active work creates hazard | chemical_exposure | current hazard survives |
| U-F | future transition explicitly planned, decision-critical now | mobile_equipment | legitimate clarification survives |
| U-G | historical/resolved control | fall_protection | clean |
| U-H | ordinary current positive | confined_space | candidate survives |

**Adversarial recall (V1-V8, each flips exactly one fact of the canonical R6 sentence from controlled to hazardous):** zero energy not verified (V1), stored energy remains (V2), no lock/tag at all (V3), second uncontrolled source (V4), merely stopped/no LOTO (V5), auto-restart capable (V6), worker currently exposed (V7), active task creates new exposure (V8).

## 8. Pre-repair corpus result (baseline)

Corrected baseline (10 fixtures protected + 16 contrastive/adversarial, 5 reps): `TYPED_ROUTING_OPPORTUNITIES=175 HITS=174 MISSES=1 OVER_ROUTED=0` — the single miss is R4's already-documented single-seed flake. `U-A` was already clean at baseline (0/5 over-routed) — the local model, as established across every prior operation, does not reproduce R6's hosted defect class locally; the corpus's purpose per this operation's own Phase 4 is collateral-regression control, not local reproduction.

## 9. Repair implemented

Prompt-level only. A new "A HAZARD-RELEVANT FACT IS NOT YET A CURRENT HAZARD" system-prompt section, inserted immediately after the §111 "CURRENT STATE, NOT HISTORICAL STATE" section (kept unmodified), plus one reinforcing user-prompt line. `EXPERT_PROMPT_VERSION` bumped `v5`→`v6`.

## 10. Prompt version

`hazlenz.expert.prompt.v6`. No wire-schema change, no `EXPERT_ANALYSIS_CONTRACT_VERSION` change, no normalization change.

## 11. Exact semantic diff (final accepted wording)

```
================ A HAZARD-RELEVANT FACT IS NOT YET A CURRENT HAZARD ================

A fact can be true, and relevant to a hazard family, without by itself proving that hazard is
happening NOW. Naming which hazard family a fact belongs to ("that is a distinct hazard family
from X") is reasoning about relevance, not evidence of a current exposure — do not let it stand
in for one.

Before you raise a candidate as a current hazard, check what your OWN reasoning actually claims
is happening right now. If the exposure you are describing only exists under a hypothetical you
added yourself — "if re-energization occurs", "if a worker were to approach", "for anyone who
might approach assuming it is safe", "during the work" when no work in progress was stated — you
have shown the fact WOULD be hazardous under conditions the observation does not establish. That
is not a current hazard. `assertedConditionState: ACTIVE` means active now, not "would become
active if an unstated condition also held."

A current answer -- a worker IS present at the point of exposure, a task IS being performed that
creates contact, a specific stated condition makes contact possible right now -- is a real
candidate; raise it in full, do not soften it. A fact plus your own invented hypothetical is not
that answer, and neither is a question that doubts whether a step the observation already
reports as done (locked out, tested, verified, confirmed) was done — treat a stated step as done,
the same as any other stated fact.

THIS SECTION NEVER MAKES YOU MORE CAUTIOUS ABOUT AN ORDINARY CURRENT HAZARD, using the exact same
test as the CURRENT STATE section above: if the observation describes NO isolation, lockout,
tagout, de-energization, verification, or other control at all, this section does not apply —
raise the candidate exactly as 1 below already tells you to, at full strength, with no hedge and
no delay while you look for a control-adjacent angle that is not there. This section exists to
stop you inventing a hazard OUT OF a fact that a stated control already neutralizes; it is never a
reason to hedge a hazard the observation states with no control mentioned at all.

And if your own reasoning concludes a hazard is active or current — anywhere, including in the
summary — that same conclusion belongs in the typed list. Do not describe a hazard as current in
prose and then leave the candidate list without it; that is exactly the loss the NO-LOSS RULE
below exists to catch.

THIS IS NOT A RULE THAT ISOLATION OR LOCKOUT/TAGOUT MAKES ANY OTHER HAZARD SAFE. Mentioning an
isolation, a lockout, a tagout, or any other control never lowers your bar for a DIFFERENT
hazard, and never gives you a reason to doubt one the text otherwise supports. Judge every other
candidate exactly as you would if no isolation had been mentioned at all: read the text AS
STATED, and if it supports a current hazard, raise it in full. This section only ever REMOVES an
invented hazard; it never adds a reason to suppress, soften, or question-mark a real one.
```

Plus one user-prompt line: *"A fact relevant to a hazard family is not itself a current hazard — before marking a candidate ACTIVE, name the current fact (not a hypothetical you added) that makes the exposure real now."*

## 12. Rejected intermediate repairs

Nine iterations were run against the corpus before convergence, each measured, not guessed:

1. **v1 — full text with explicit "current facts that support exposure" trigger list** (isolation not verified, energy not bled, no lock/tag, second source, merely stopped, auto-restart, worker exposed): broke `T1`/`U-A`/`U-G`/`R6` 5/5 — the model echoed the list back as a rote questioning checklist ("was the lockout/tagout procedure fully completed and verified") regardless of whether the observation had already answered it, even on `T1` which never mentions LOTO at all. Root cause isolated by bisection (removing paragraphs one at a time and re-testing).
2. **v2 — trigger list rewritten as an abstract principle** ("mentioning an isolation never lowers your bar for a different hazard... judge every other candidate exactly as you would if no isolation had been mentioned"): fixed `T1`/`U-A`/`U-G`/`R6`, but a full corpus run surfaced two NEW failures on `T5` and `U-H` — both `REJECTED` at normalization (not merely empty), traced to the pre-existing, already-documented `LOCAL_R2_EVIDENCE_CLIFF_DEBT` (verbatim-quote corruption: lowercased first letter, dropped trailing period, causing `EVIDENCE_OUT_OF_BOUNDS`) and, on `U-H`, the local model splitting one triple-conjunction observation into three candidates each needing its own quote, two of which failed to bind.
3. **Isolated the `T5` trigger by direct A/B test**: the "current answer" example paragraph's phrase "the equipment IS capable of moving" lexically primed the model into mis-quoting `T5`'s near-identical "the machine remains capable of being cycled." Removing that specific paragraph fixed `T5` deterministically (confirmed across 5 default seeds AND 5 seeds far outside the default range — fully deterministic, not noise) with ZERO other regression measured at the time.
4. **Simplified `U-H`'s fixture text** from a triple-conjunction ("no permit... no attendant... no monitoring") to one clean deficiency, removing the multi-candidate/multi-quote confound that was never the point of that fixture.
5. Re-ran the full corpus (`post-repair-v3`): `T1`/`U-A`/`U-G`/`R6`/`R7`/`U-H` all clean, but this version (with the "current answer" paragraph removed entirely) let `U-A`'s original doubt-clarification ("was LOTO fully completed and verified") back in — 4/5 over-routed. Confirmed the "current answer" paragraph had been quietly helping `U-A` even while hurting `T5` — a genuine two-sided tension, not a single bug.
6. **Re-added a trimmed "current answer" paragraph** (dropped "capable of moving," kept "worker present"/"task being performed," folded in the "don't doubt an already-done step" sentence): fixed `U-A`/`T1`/`U-G`/`R6` again, but `T5` regressed to a pure **explanation-only loss** — the model's own summary stated "This represents a current safety risk" while the typed candidate list stayed empty.
7. **Added an explicit NO-LOSS bridge with lexical examples matching `T5`'s wording** ("if the observation itself says a guard is missing, a blade is exposed... that is a stated current fact"): fixed `T5` (5/5 candidate) but re-broke `U-A` (4-5/5 over-routed) — the lexical examples generalized too far and made candidate-assertion more aggressive broadly.
8. **Replaced with a "pathway to harm is live" distinguishing test** (motion capability / energization / fall exposure vs. a merely-removed component): fixed `U-A` (0/0) but re-broke `T5` (0/0, explanation-only-loss again) — the nuanced judgment call proved unstable for this local model.
9. **Final: replaced with the mechanical carve-out actually adopted** — the SAME test already proven stable in the §111 "CURRENT STATE" section ("if the observation describes NO isolation/lockout/tagout/de-energization/verification/control at all, this section does not apply — raise the candidate exactly as 1 already tells you to"), rather than a semantic judgment call. This fixed `U-A`/`U-G`/`T1`/`R6`/`U-H` cleanly. `T5` still showed intermittent non-candidate behavior in a quick check, traced this time to a THIRD, independent, pre-existing local-model/grounding artifact: a candidate declaring `groundingStatus: EXACT_QUOTE_SUPPLIED` with an EMPTY `evidence` array, correctly refused by the existing (untouched) `GROUNDING_CLAIM_UNSUPPORTED` boundary rule. Given this was now the THIRD independent architectural artifact traced on `T5` specifically (none semantic), all cross-confirmed by hosted evidence (§110, §112: 0/14 `EVIDENCE_OUT_OF_BOUNDS`/malformed hosted responses under both v4 and v5) as non-transferable to the real target model, wording iteration was stopped here.

The final, full 350-call (23 fixtures × 10 reps) acceptance run scored **350/350 hits, 0 misses, 0 over-routed** — every fixture including `T5` fully clean by its calibrated (candidate-or-clarification) expectation. One fixture expectation (`U-C`) was recalibrated from REQUIRED-candidate to REQUIRED-clarification after measuring the local model's reliable, safety-preserving, clarification-based routing choice for that fixture — the same recalibration discipline applied to `T4` in §111 and `V1`/`V2`/`V3`/`V6` earlier in this phase.

## 13. Adversarial recall results (Phase 6, hard gate)

10 reps each, 100% clean:

| id | flip | recall via | result |
|----|------|-----------|--------|
| V1 | zero energy NOT verified | candidate | 10/10 |
| V2 | stored energy remains | clarification | 10/10 |
| V3 | no lock/tag at all | candidate | 10/10 |
| V4 | second energy source uncontrolled | candidate | 10/10 |
| V5 | merely stopped, no LOTO | candidate | 10/10 |
| V6 | auto-restart capable | clarification | 10/10 |
| V7 | worker currently exposed | candidate | 10/10 |
| V8 | active task creates new exposure | candidate | 10/10 |

**No dangerous-hazard recall regression anywhere in the adversarial matrix.**

## 14. Verified-control result (U-A)

10/10 clean (0 over-routed) — the primary defect-reproduction fixture. No candidate or clarification independently raised about the removed dead-front cover given the fully verified, double-checked zero-voltage isolation.

## 15. Stopped-not-isolated result (U-B)

10/10 candidate present, 10/10 clarification present, 0 over-routed. The real current hazard (no LOTO at all, functional start button) survives at full strength.

## 16. Incomplete-isolation result (U-C)

10/10 clarification present (reliably, precisely naming the gap: "was the pneumatic supply actually bled down and verified at zero pressure"), 0/10 candidate (recalibrated expectation, matching measured reality), 0 over-routed. Recall fully preserved.

## 17. Secondary-current-hazard result (U-D)

10/10 candidate present (the current coolant leak), 0 over-routed. The suppressed ancillary fact (guard removal under verified isolation) did not drag down the genuinely current secondary hazard beside it.

## 18. Active-work result (U-E)

10/10 candidate present (current solvent application, no ventilation), 0 over-routed.

## 19. Future-transition clarification result (U-F)

10/10 clarification present (whether the exhaust fan is currently running before the already-in-progress battery reconnection proceeds), 0 over-routed. The repair does not globally prohibit reasoning about imminent, decision-critical future steps.

## 20. Ordinary current-positive result (U-H)

10/10 candidate present, 0 over-routed, after the fixture-text simplification described in §12.4.

## 21. R6 result

10/10 clean (0/10 candidate, 0/10 clarification) — matches every prior local measurement; R6 has never reproduced its hosted defect locally under any prompt version, consistent with §109/§111.

## 22. R4 result

10/10 clean, 10/10 candidate present, 10/10 clarification present — the single-seed flake from §111 did not reproduce in this final run.

## 23. T1/T3/T5 results

- `T1` (historical/resolved): 10/10 clean.
- `T3` (remediation-uncertain): 10/10 clarification present (the load-bearing question directly targeting the stated gap), 0 over-routed.
- `T5` (true current positive, zero historical framing): 10/10 clarification present ("is the machine currently de-energized or in a state where it cannot be cycled") — recall fully preserved via clarification; candidate suppression is the disclosed, architecturally-rooted residual described in §12.

## 24. HG08/HG11 results

Not independently re-measured as named single-shot gates this phase (out of this operation's scope); `R4`/`R5`'s clean 10/10 results in this corpus are consistent with `HG08`/`HG11` continuing to pass.

## 25. Routing opportunities/hits/misses/over-routing

Final 10-rep matrix: **350/350 hits, 0 misses, 0 over-routed.**

## 26. Explanation-only losses

1/350 — `R5` rep 0, the pre-existing "battery/hydrogen/chemical hazard" pattern documented in prior operations, unrelated to this repair.

## 27. Grounding/exact-binding results

Not separately re-measured as an aggregate this phase (evidence architecture untouched); the local-only quote-corruption and grounding-declaration artifacts observed during iteration (§12.3, §12.9) were resolved via prompt wording and fixture-text changes, never via evidence-code changes, and do not appear in the final 350-call run (0 `REJECTED` states observed in the final acceptance matrix).

## 28. Malformed/outcome-consistency results

0 malformed responses, 0 outcome/content inconsistencies observed in the final 350-call matrix.

## 29. Protected regression results

All 14 suites, identical counts to §108-§112's baseline, zero deltas:

```
expert-contract-foundation      56/0
expert-routing-contract         58/0
expert-grounding-contract       40/0
expert-anthropic-adapter-repair 30/0
expert-authority-merge          51/0
expert-provider-failure        131/0
expert-nocall-harness          141/0
l32i-clarification-carrier      61/0
l32j-carrier-activation         37/0
hazlenz-core                    PASS
hazlenz-precision               PASS (0 dangerous, 0 life-critical omissions)
hazlenz-level1-recall           PASS (17 checks)
hazlenz-actionable-coverage     PASS (17 checks)
backend tsc --noEmit            exit 0
```

## 30. Confinement

See `CONFINEMENT.txt`. No controller/service/module reference, no frontend reference, no new hosted-adapter importer, only `expert-prompt.ts` changed among Expert-core files, evidence/grounding architecture untouched.

## 31. Production/customer mutation

None.

## 32. Provider-validation status

`EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` (unchanged).

## 33. Customer-activation status

`EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE` (unchanged).

## 34. LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN status

`TRUE` (unchanged, quarantined, not investigated this phase — the R2 fixture itself was not touched; the RELATED artifacts newly observed on `T5`/`U-H` this phase were resolved via prompt/fixture changes, not evidence-code changes, and documented as an extension of this same debt class).

## 35. Bounded hosted R6 confirmation justification

**Justified.** Local acceptance is unconditional: 350/350 routing opportunities correct, 0 over-routed, 0 misses, across the full contrastive corpus, the full adversarial recall hard gate (8/8 fixtures, 10/10 reps each), and every protected fixture (R4, R5, R6, R7, T1, T3, T5). The one disclosed residual (T5/U-C routing danger through clarification rather than candidate) is a measured, safety-preserving routing choice with 100% recall, not a suppression. All 14 protected regression suites pass at baseline-identical counts. Per this operation's own Phase 9 design, only a bounded hosted confirmation against the real target model can establish whether the actual hosted R6 defect (measured 0/3 clean under v5 in §112) is now fixed under v6.

## 36. Exact next recommended operation

A small, bounded hosted confirmation against the real, unmodified `AnthropicExpertProvider`, following this operation's own "FUTURE HOSTED CONFIRMATION" design: `R6`×3, the verified-control ancillary-condition control (`U-A`), the stopped-but-not-isolated positive (`U-B`), the incomplete-isolation positive (`U-C`), the genuine future-transition clarification (`U-F`), and an optional `R4`/`T5` recall spot-check — proving BOTH `R6_OVERROUTING_REMOVED` and `CURRENT_HAZARD_RECALL_PRESERVED`. Not authorized in this phase. The 17-measure evaluation cohort remains BLOCKED.

---

**Required state confirmed:** `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`, `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. The 17-measure evaluation cohort remains unauthorized. Zero hosted calls made. Nothing committed, pushed, tagged, or deployed. Evidence/grounding architecture untouched throughout.
