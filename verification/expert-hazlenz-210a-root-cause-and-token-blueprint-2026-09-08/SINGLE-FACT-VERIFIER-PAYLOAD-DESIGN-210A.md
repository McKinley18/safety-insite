# SINGLE-FACT-VERIFIER-PAYLOAD-DESIGN-210A

**Design only. Not implemented. §210A forbids altering runtime architecture.**

## The evidence this design answers

| Row shape | axis-L slots | non-CORRECT |
|---|---|---|
| more than one admitted OwedFact visible | 6 | **6 (100%)** |
| one admitted OwedFact visible | 7 | 2 |

No axis-L slot passed on a row where a sibling OwedFact was in the payload. The two single-fact
failures drifted onto a sibling **clarification** (AC-03) and sibling **hazard candidates** (AC-22).
Sibling properties reach the verifier through three channels, and drift follows the channel.

The verifier reached the correct fact in all 8 failures. It was not confused about its target — it
was given neighbours and reasoned about them.

## Current payload versus proposed

| Component | Today | Proposed | Reason |
|---|---|---|---|
| System prompt / admission contract | full, re-sent per call | **retained, cached** | 1 distinct identity across 24 calls; caching is transmission-only |
| Target OwedFact | full | **retained in full** | it is the object of the judgement |
| Target's clarification | supplied with siblings | **retained, target's only** | axis M is judged on this exact clarification |
| Target's evidence span | full observation | **retained** | required to judge whether the fact is genuinely open |
| Surrounding observation facts | full observation text | **localized, fail-open** | TBR-8: bounded window, widening to full text whenever the span alone is ambiguous — never silent truncation |
| **Sibling OwedFacts** | **supplied in full** | **REMOVED** | the G6 defect; 6/6 drift, no counterexample |
| **Sibling clarifications** | **supplied** | **REMOVED** | AC-03.FACT1.L drifted onto exactly this |
| Hazard-candidate block | all candidates (2–3) | **localized to the target's originating candidate(s)** | AC-22 drifted onto the other two candidates; AC-21 did not. 1 of 2 — experiment, not assumption |
| Row-level task language | supplied | **retained** | needed to judge whether the property changes today's action |
| Governed records | only where governed | **unchanged** | already bounded to 2 sourceIds; TBR-6 satisfied |

## Fields retained, removed, localized — and why

**Retained in full (10 of 13 components).** This is not a compression exercise. Everything the
verifier needs to judge *this* fact stays, including the full target OwedFact, its clarification, its
evidence span and the row task language.

**Removed (2).** Sibling OwedFacts and sibling clarifications. Both are, for the target fact,
semantically irrelevant by construction — the instrument's own axis-H definition is that independent
facts need their own evidence — and both are directly implicated by the adjudicator's reasons.

**Localized (2).** The observation window and the candidate block, both with a **fail-open**
requirement: ambiguity widens the window, it never narrows it. A localization mechanism that can
silently truncate necessary context would manufacture RC-A and RC-C failures, which cost more than
any token it saves.

## Estimated token effect, from the exact historical requests

Verifier input today: 217,911 tokens across 24 calls, median 9,106, **static floor ≥8,759 (≥91%)**.

| Change | Effect |
|---|---|
| Remove sibling OwedFacts + clarifications | within the 794-token observed cohort spread — realistically **200–600 tokens per multi-fact call**, ~6 calls affected. **≈2,000–4,000 tokens total, under 2% of verifier input** |
| Cache the byte-identical static half | **≈179,100 tokens ≈ $0.36**, ~82% of verifier input |

**The isolation is not a token optimization and must not be justified as one.** Its token saving is
under 2%. Its purpose is G6. The token win at this stage comes almost entirely from caching, which is
independent of it and could be done either way.

Stated plainly because the blueprint demands it: *capability and safety outrank token savings*. Here
they happen to point the same direction, but the isolation would be worth doing at zero token saving.

## What this design does NOT claim

The correlation is measured. **The fix is not.** Frozen evidence cannot demonstrate that removing
sibling material removes the drift — the counterfactual was never executed. Classification:
**`REQUIRES_SEMANTIC_EXPERIMENT`**.

Minimum honest validation before adopting: replay the 6 multi-fact rows with the isolated payload and
re-adjudicate axis L. That is 6–8 provider calls, ≈9,000 input tokens each, **≈$0.15**. It is the
smallest experiment that can falsify the hypothesis, and §210A does not authorize it.
