# EXPERT HAZLENZ — TARGETED HOSTED CONFIRMATION FOR R4/R6 (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_R6_HOSTED_OVERROUTING_CONFIRMED — HOSTED_NEGATIVE_CONTROL_REPAIR_REQUIRED`**

Predecessor: §109 (`D-121`). Authorization: product-owner targeted hosted confirmation,
2026-08-31. **7 calls planned, 7 attempted, 7 completed clean. Actual cost $0.2353 of $3.00.**
Nothing committed, pushed, tagged, or deployed. No production, prompt, schema, or normalization
code changed before, during, or after the measurement.

```
HEAD          37a5d1b50abe836eb19dd24ee18ad10557bda131   (local only, unchanged this phase)
EXPERT_PROMPT_VERSION             = hazlenz.expert.prompt.v4   (UNCHANGED)
EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE
EXPERT_HAZLENZ_CUSTOMER_ACTIVE    = FALSE
```

## Headline result

**R4 did NOT reproduce: 3/3 hosted calls survived cleanly**, each producing 3 well-formed
candidates plus other content — no `CANDIDATE_MALFORMED`, no `EXPLANATION_MALFORMED`, no empty
required field. This is consistent with §109's structural finding (the local channel could never
construct R4's precondition) and with the possibility §108 itself flagged: a provider with no
`temperature`/`seed` control can produce a one-off draw. **This measurement supports "one-off,"
not "stable defect," for R4.**

**R6 DID reproduce, on all 3 calls, with a stable, specific pattern**: every one of the three
independent hosted generations invented the same conceptual over-route — a `machine_guarding`
candidate about the removed guard, plus two clarifications about guard reinstatement and residual
stored energy — despite the observation stating the isolation was locked out, tagged, bled down,
verified at zero, and second-person verified. Wording varied call to call; the concept and the
two-collection shape (`expertHazardCandidates`, `decisionCriticalClarifications`) did not.
**This is now a confirmed, repeatable hosted defect, not a one-off.**

**The R5 control stayed clean and correct on its one call** (3 candidates, 3 clarifications, 2
insights — all three required collections populated, matching HG11's requirement), which rules
out general provider degradation as the explanation for R6: the same call, in the same session,
against the same model, correctly restrained itself on one fixture and over-routed on another.

---

## 1. Per-call detail

| # | fixture | role | HTTP | latency | tokens in/out | cost | outcome | result |
|---|---|---|---|---|---|---|---|---|
| 1 | R4 | primary | 200 | 25,883 ms | 6,922 / 2,692 | $0.0408 | ANALYZED | 3 candidates, 5 clarifications, 1 insight, 1 disagreement — `R4_CANDIDATE_SURVIVED` |
| 2 | R4 | primary | 200 | 25,894 ms | 6,922 / 2,812 | $0.0420 | ANALYZED | 3 candidates, 5 clarifications, 1 insight, 1 disagreement — `R4_CANDIDATE_SURVIVED` |
| 3 | R4 | primary | 200 | 28,165 ms | 6,922 / 3,008 | $0.0439 | ANALYZED | 3 candidates, 5 clarifications, 2 insights, 1 disagreement — `R4_CANDIDATE_SURVIVED` |
| 4 | R6 | primary | 200 | 10,749 ms | 6,912 / 1,111 | $0.0249 | ANALYZED | 1 candidate, 2 clarifications — **2 collections over-routed** |
| 5 | R6 | primary | 200 | 11,527 ms | 6,912 / 1,054 | $0.0244 | ANALYZED | 1 candidate, 2 clarifications — **2 collections over-routed** |
| 6 | R6 | primary | 200 | 12,015 ms | 6,912 / 1,076 | $0.0246 | ANALYZED | 1 candidate, 2 clarifications — **2 collections over-routed** |
| 7 | R5 | control | 200 | 20,171 ms | 6,926 / 2,092 | $0.0348 | ANALYZED | 3 candidates, 3 clarifications, 2 insights — all three required collections populated, clean |

All 7 calls: HTTP 200, no transport failure, no `UNEXPECTED_MODEL_IDENTITY`, `respondedModel:
claude-sonnet-5` on every call, zero normalization issues of any kind (every response was
well-formed — R6's problem is content, not shape). Full raw wire objects and request IDs in
`transport/targeted-confirmation.jsonl`.

## 2. R4 — verdict and detail

**Verdict: `R4_HOSTED_FAILURE_NOT_REPRODUCED`** (3/3 survived, decision rule: "if 3/3 survive
cleanly").

Every call produced multiple well-formed candidates (3 each), all required fields populated, no
empty string, no malformed shape. This is the OPPOSITE of §108's single hosted sample (0
candidates, `CANDIDATE_MALFORMED` + `EXPLANATION_MALFORMED`, 439 output tokens). Output token
counts this run (2,692–3,008) are roughly 6–7× §108's 439, consistent with §109's structural
finding that the loss point requires the model to emit multiple empty required strings under an
Anthropic-transport-specific schema weakness (§109 §2) — evidently a low-probability event on
this fixture, not a systematic one.

**No new material defect appeared on R4.**

## 3. R6 — verdict and detail

**Verdict: `R6_HOSTED_OVERROUTING_REPRODUCED`** (over-routing recurred on 3/3 calls, decision
rule: "if any typed over-routing recurs").

**Frequency:** 3 of 3 calls over-routed. **Exact over-routed collections:**
`expertHazardCandidates` (1 item, 3/3 calls) and `decisionCriticalClarifications` (2 items, 3/3
calls). `crossHazardInsights` and `disagreements` stayed correctly empty on all 3 calls — a
narrower shape than §108's single v4 hosted sample, which additionally populated
`crossHazardInsights` (3 of 4 collections over-routed there; 2 of 4 here). §105 §7's original v3
single sample also over-routed 2 of 4 collections (candidates, clarifications) — this run's shape
matches v3's more than v4's, on 3 independent draws rather than 1.

**The exact text, verbatim, from the three calls** (all classified `unsupported candidate` /
`unnecessary clarification` per the authorization's taxonomy — none is a legitimate clarification,
a generic insight, or a speculative disagreement; the shape is consistently candidate + two
clarifications):

- Call 1 — candidate: *"machine_guarding / The guard was removed to perform work on the press,
  which exposes machine hazards (pinch points, stored mechanical hazards) unless the guard is
  restored before re-energization."* — clarifications: *"Will the guard be reinstalled and
  verified before lockout is removed and the press is re-energized?"*; *"What task is being
  performed while the guard is removed, and is any residual stored energy source (e.g., springs,
  counterweights, or pneumatic accumulators) present beyond what was bled down?"*
- Call 2 — candidate: *"machine_guarding / The guard was removed to perform work on the press,
  and there is no statement about whether or when the guard will be reinstalled before the press
  is returned to service."* — clarifications: *"Will the guard be reinstalled and verified in
  place before the lockout is removed and the press is re-energized?"*; *"What is the work being
  performed while the guard is removed, and is there any residual exposure to workers accessing
  the point of operation during this window?"*
- Call 3 — candidate: *"machine_guarding / The guard was removed to access the press after
  lockout, but the observation does not state whether the guard has been reinstalled or whether
  work is complete, leaving an open question about current guarding status."* — clarifications:
  *"What task is being performed now that the guard is removed and the press is locked out, and
  will the guard be reinstalled and verified before the press is returned to service?"*; *"Who has
  authority to remove the lockout/tag, and is there a written or verified procedure confirming all
  workers are clear before re-energization?"*

**Why this is over-routing, not a defensible reading**: the `R6` fixture states the guard WAS
removed (the model reads this correctly), but the deterministic finding already carries this fact
as `CONTROLLED`, and the observation gives no basis for treating "will the guard be reinstalled"
as a live decision-changing question — nothing in the text suggests the work is unfinished or the
press is about to be re-energized without it. The model appears to be reasoning forward from "a
guard is currently off" to "eventual reinstallation is an open question" — a generically true
observation about machine guarding that is not specific to what THIS observation actually leaves
undetermined, which is exactly the "generic... commentary" failure mode Phase 4 of the prior
authorization named. This is a genuine, reproducible content defect in how the hosted model reads
this specific fixture, not noise.

## 4. Control (R5 / HG11)

**OK.** 3 candidates, 3 clarifications, 2 insights — all three required collections populated
simultaneously, matching §108's own record of R5 behaving cleanly on both v3 and v4 hosted runs.
This is the load-bearing fact that separates "R6-specific defect" from "general hosted
degradation this session": the same session, same credential, same model, adjacent calls,
correctly restrained itself on R5 and did not on R6.

## 5. Decision rules applied

Per the authorization's own rules, R4 and R6 are not averaged. R4 = `NOT_REPRODUCED` (3/3 clean).
R6 = `REPRODUCED` (3/3 over-routed, stable shape). No other independent material defect appeared
(all 7 calls were transport-clean, schema-valid, and normalization-clean). Per the terminal
selection table, this combination — R6 reproduced, R4 otherwise acceptable — selects
**Terminal C**: `EXPERT_HAZLENZ_R6_HOSTED_OVERROUTING_CONFIRMED — HOSTED_NEGATIVE_CONTROL_REPAIR_REQUIRED`.

## 6. Quarantined local R2 evidence-cliff debt

**Unchanged, not touched, not investigated.** `LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN = TRUE` remains
as recorded in §109. This operation did not call R2 in any form (local or hosted) and made no
change to evidence binding, exact-quote matching, or normalization.

## 7. Protected regression and confinement

Re-run fresh after the hosted calls, all green and matching §108/§109's baseline exactly:

| suite | result |
|---|---|
| `test:expert-contract-foundation` | 56/0 |
| `test:expert-routing-contract` | 58/0 |
| `test:expert-grounding-contract` | 40/0 |
| `test:expert-anthropic-adapter-repair` | 30/0 |
| `test:expert-authority-merge` | 51/0 |
| `test:expert-provider-failure` | 131/0 |
| `test:expert-nocall-harness` | 141/0 |
| `test:l32i-clarification-carrier` (quarantine) | 61/0 |
| `test:l32j-carrier-activation` (quarantine) | 37/0 |
| `test:hazlenz-core` | PASS |
| `test:hazlenz-precision` | PASS — 0 dangerous, 0 life-critical omissions |
| `test:hazlenz-level1-recall` | PASS (17 checks) |
| `test:hazlenz-actionable-coverage` | PASS (17 checks) |
| `tsc --noEmit` | exit 0 |

**Confinement** (`CONFINEMENT.txt`): no controller/service/module references the Expert module; no
frontend reference; the hosted adapter's importer set grew by exactly one file — this phase's own
`probe-expert-hosted-r4-r6-targeted-confirmation.ts` — and no production/customer or Expert-core
file changed (`git diff --stat` against session start shows the identical 4-file, pre-existing
§105–§108 diff, nothing added by this phase).

## 8. Production/customer mutation, provider-validation, customer-activation status

**No production or customer-path code changed.** `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`.
`EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. Neither changes as a result of this measurement — a
confirmation probe, even a clean one, does not itself authorize provider selection or customer
activation.

## 9. Whether the 17-measure evaluation cohort should be considered

**No.** Terminal C's own text calls for hosted negative-control repair, not cohort authorization.
The cohort remains BLOCKED.

## 10. Exact next recommended operation

Not authorized here: a repair phase targeting `R6`'s now-confirmed over-routing specifically —
this time WITH a real hosted signal to design and validate against (three consistent generations
naming the same concept), unlike §109 where no local signal existed at all. The repair should be
scoped narrowly to what these three transcripts actually show: the model over-generalizing "a
guard is off" into "reinstatement timing is an open question" without regard to whether the
observation gives any basis for that being unresolved. `R4` needs no further local action; a
repeat hosted spot-check (1–2 calls) after any unrelated future prompt change would be prudent
given only 3 hosted samples exist total, but is not itself authorized by this operation. The
quarantined local `R2` evidence-cliff debt remains open and separately authorizable.
