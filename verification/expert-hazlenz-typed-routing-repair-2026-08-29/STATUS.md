# EXPERT HAZLENZ — TYPED COLLECTION ROUTING REPAIR (2026-08-29)

> ### `EXPERT_HAZLENZ_TYPED_ROUTING_REPAIRED — HOSTED_PROVIDER_TRANSPORT_PROBE_AUTHORIZATION_REQUIRED`
> ### 14 / 14 routing gates **PASSED** · **16/16** routing opportunities hit · **0** explanation-only losses
> ### 14 local calls across **two attempts** · **$0.00** · 0 hosted calls · production untouched
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

HEAD unchanged: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`, `main`, 0 ahead / 0 behind.

**Two attempts were run. The first one failed, and it is reported here in full** — the repair that
worked is the second, and the first is what taught it.

---

## 1. The defect, frozen as diagnosed

```
EXPERT_TYPED_COLLECTION_ROUTING_DEFECT
MODEL_REASONING_PRESENT        = TRUE
MODEL_REASONING_TYPED_CORRECTLY = FALSE
```

§100 measured a model that reasoned correctly — the wet/electrical interaction, four
decision-critical missing facts, a plausible confined-space hazard — and filed every one of them in
`expertExplanation` and `uncertainty` while returning `NOTHING_TO_ADD` with three empty typed
collections. This operation treats that as representation, not reasoning, throughout.

## 2. Root cause — the schema offered every semantic TWO homes

| free-text field (v1) | its typed twin |
|---|---|
| `expertExplanation.whatIsMissing` | `decisionCriticalClarifications` |
| `expertExplanation.howConditionsInteract` | `crossHazardInsights` |
| `expertExplanation.whatMatters` | `expertHazardCandidates` |

A model asked to fill both fills the easier one. **The fix is to delete the twin, not to add a
sentence asking the model not to use it** — an instruction competes with a field; an absent field
does not compete. `expertExplanation` is now `{ summary }` alone, and the contract moved to
`hazlenz.expert.analysis.v2` because removing required fields is subtractive.

A provider that still sends the v1 fields has them **dropped at the boundary**, not carried.

## 3. Attempt 1 — the structural fix alone, and it FAILED

Prompt v2: routing semantics per collection, an ordered classification procedure, the no-loss rule,
strengthened schema descriptions, the twins removed. **8 of 14 gates failed.**

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
|---|---|---|---|---|---|---|---|
| candidates | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| clarifications | 0 | 0 | 0 | 3 | 2 | 0 | 0 |
| insights | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| output tokens | 108 | 138 | 121 | 540 | 522 | — | — |

`TYPED_ROUTING_HITS 10/16 · MISSES 6 · EXPLANATION_ONLY_LOSSES 3`

Two signals made the cause findable rather than guessable:

1. **`expertHazardCandidates` was empty on 13 of 13 live calls** across both probes, while
   clarifications and insights had begun to populate. One collection was behaving differently from
   the others.
2. **`quotes = 0/0` on every one of those 13 calls.** The model had never emitted a single evidence
   quote.

`expertHazardCandidates` is the only collection whose schema listed `evidence` as **required**, and
the prompt warned that an unfound quote gets the candidate rejected. **Proposing a candidate was
expensive and risky, so the model proposed none.** The gate on the collection was a quote it could
not produce.

## 4. Attempt 2 — three changes, and what they did NOT change

1. **`evidence` removed from the candidate `required` list.** Empty evidence was *always*
   contract-legal — `ExpertHazardCandidate.evidence` has said "Empty is legal and scores as
   ungrounded" since §99. Only the wire schema was demanding it.
2. **The prompt now says a quote is optional**: quote exactly if you can; if you cannot, raise the
   candidate anyway with an empty list. *"An unquoted candidate is worth far more than a silent
   one."*
3. **`NOTHING_TO_ADD` narrowed** to genuinely complete, already-controlled observations, with an
   explicit self-check — if you wrote "no information about…", that is a question you owe.

**The validator did not move.** A quote that IS supplied is still checked by exact equality, a
fabricated one is still rejected, and `test:expert-routing-contract` D.4–D.7 still proves an
unbindable quote is preserved with an unresolvable span and refused. This is a change to what is
*asked for*, not to what is *accepted* — it is not loosening a validator until malformed output
passes.

## 5. Attempt 2 result — clean

| | R1 | R2 | R3 | R4 | R5 | **R6** | **R7** |
|---|---|---|---|---|---|---|---|
| candidates | 1 | 1 | 1 | 1 | 1 | **0** | **0** |
| clarifications | 3 | 2 | 2 | 3 | 2 | **0** | **0** |
| insights | 1 | 1 | 1 | 1 | 1 | **0** | **0** |
| uncertainty | 2 | 0 | 2 | 2 | 0 | **0** | **0** |
| output tokens | 720 | 582 | 642 | 742 | 571 | 116 | 100 |
| losses | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

```
TYPED_ROUTING_OPPORTUNITIES  16
TYPED_ROUTING_HITS           16
TYPED_ROUTING_MISSES          0
TYPED_ROUTING_OVER_ROUTED     0
EXPLANATION_ONLY_LOSSES       0
```

| collection | opportunities | hits | misses | over-routed |
|---|---|---|---|---|
| `expertHazardCandidates` | 4 | 4 | 0 | 0 |
| `decisionCriticalClarifications` | 6 | 6 | 0 | 0 |
| `crossHazardInsights` | 4 | 4 | 0 | 0 |
| `disagreements` | 2 | 2 | 0 | 0 |

**The negative controls are the result worth trusting.** R6 (a fully controlled, fully described
lockout) and R7 (an inspected ladder with only unfalsifiable residual ambiguity) each returned
**every collection empty** and ~110 output tokens. The repair did not teach the model to fill lists;
it taught it where things go. A repair that moved the metric by making the model chattier would have
shown up here as over-routing, and it did not.

## 6. The fourteen routing gates — all PASSED

| gate | evidence |
|---|---|
| G01 transport callable | 7/7 HTTP 200 |
| G02 schema validity intact | 7/7 `PRESENT` |
| G03 zero-candidate clarification survives | R1 clar=3 |
| G04 wet/electrical → `crossHazardInsights` | R2 insights=1 |
| G05 missing facts → `decisionCriticalClarifications` | R3 clar=2, R2 clar=2 |
| G06 extra hazard → `expertHazardCandidates` | R4 candidates=1 |
| G07 multi-collection independent | R5 cand=1 clar=2 ins=1 |
| G08 **`EXPLANATION_ONLY_LOSSES = 0`** | 0 |
| G09 uncertainty not a catch-all | 0 concepts found only in uncertainty |
| G10 negative controls not over-routed | R6 over=0, R7 over=0 |
| G11 quote binding fail-closed | no unbindable quote arose live; proved deterministically |
| G12 protected halves byte-identical | 7/7 identical, 0 invariant violations |
| G13 Level-3 quarantine intact | no reference outside the module; Expert core vendor-free |
| G14 no hosted provider call | no hosted client or credential in the adapter tree |

**G14 initially reported a FALSE FAILURE, and the instrument was fixed rather than the result.** The
first version of that gate grepped raw file text for `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` and
matched the adapter's own header **comment explaining that those credentials are absent** — it read
the sentence documenting an absence as a presence. This is the third time in this programme a
content grep has matched prose; the gate now strips comments before matching, exactly as the Expert
core-purity guard already does.

## 7. The metric was validated before it was used

`test:expert-routing-contract` (**57 / 0**) proves the instrument first, because a routing metric
that cannot tell a correct silence from a miss would have scored R6/R7 as failures and rewarded
chattiness:

- all four verdicts — `CORRECT_EMPTY`, `INCORRECT_EMPTY`, `CORRECT_POPULATED`, `INCORRECT_POPULATED`;
- `OPTIONAL` creates no opportunity, so a fixture that cannot state the right answer does not vote;
- the §100 defect shape, replayed, produces exactly 2 explanation-only losses;
- **the same concepts typed correctly produce 0 losses even when the summary repeats them** — the
  metric measures routing, not verbosity;
- a concept the model never raised is **not** a loss, so the metric never scores reasoning;
- quote binding, both directions.

## 8. Protected regression — executed

| suite | result |
|---|---|
| `test:expert-contract-foundation` | **56 / 0** |
| `test:expert-authority-merge` | **51 / 0** |
| `test:expert-provider-failure` | **131 / 0** |
| `test:expert-nocall-harness` | **141 / 0** |
| `test:expert-routing-contract` | **57 / 0** |
| `test:l32i-clarification-carrier` · `test:l32j-carrier-activation` | **61 / 0** · **37 / 0** |
| `test:kg4a-cutover-contract` · `kg4a-default-off` · `kg4d-default-off` | exit 0 |
| `test:hazlenz-level1-recall` · `actionable-coverage` | exit 0 · exit 0 |
| `test:hazlenz-precision` | precision **100.0 %**, forbidden **0**, omissions **0** |
| backend `tsc --noEmit` | **exit 0** |

One suite needed a fix of its own: `test:expert-contract-foundation` C.5 used the literal
`hazlenz.expert.analysis.v2` as its *wrong* version, so bumping the contract TO v2 silently stopped
it testing anything. It now derives the invalid version from the current constant and cannot go
stale again.

**Confinement, by dependency inspection:** nothing under `backend/src` outside `expert-hazlenz/` and
`expert-hazlenz-adapters/` references either. No controller, service or module reaches the Expert
layer. The only tracked production file modified across §§99–101 remains `backend/package.json`.

## 9. What this does NOT mean

A routing pass does not mean the local model is provider-validated, that it is production-selected,
that Expert reasoning is validated, that the seventeen-measure evaluation is authorized, or that
customer activation is authorized. **`EXPERT_HAZLENZ_PROVIDER_VALIDATED` and
`EXPERT_HAZLENZ_CUSTOMER_ACTIVE` both remain `FALSE`.**

Sixteen routing opportunities on seven synthetic fixtures is a small, bounded probe. **No global
production-quality precision target is claimed from it**, and none should be inferred.

## 10. Residual debt

Closed: `EXPERT_PROMPT_COLLECTION_ROUTING_DEFECT` (§100.8 item 1).

Carried forward: `test:kg5b-operator-cli` 64/65 · unresolved-jurisdiction ranking ·
`directObjectStatus: NOT_VERIFIED_LOCAL_TEST_PROVIDER` · `LIVE_PAYMENT_PROOF = FALSE` ·
hosted-provider transport still unmeasured · G11/G13-style live malformed-output behaviour still
unobserved.

New:

1. **`quotes = 0/0` on all 14 calls — the model has still never produced an evidence quote.** The
   repair unblocked candidates by making the quote optional; it did not make the model able to
   quote. Every Expert candidate so far is ungrounded, which the evaluation plan's
   `M07_GOVERNED_RECORD_GROUNDING` will measure and which a hosted model may do differently.
2. **Routing is measured on one local model only.** Nothing here transfers to a hosted provider.

## 11. Exact next operation

**A hosted transport probe — and it is now justified for the first time.** The architecture is
proven end to end against a real model: adapter, boundary, merge, routing and negative controls all
hold, and the repair loop cost `$0.00`. What remains unmeasured is whether a hosted provider can be
called at all, which needs a credential the owner would provision and its own spend decision.

`probe:expert-transport` and `probe:expert-routing` both exist and would run against a hosted
adapter unchanged. Only after that is the seventeen-measure evaluation worth a reserved cohort.

Nothing was committed, pushed, tagged or deployed. `autoDeploy=yes` on `main` means preserving this
work in git remains a separate decision.
