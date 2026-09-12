# §181 — SETTLED_BY_EVIDENCE AND CHALLENGE_FACT_VALIDITY: FULL TRACE

Re-derived from current source, not from §180's prose. 43 checks, 0 failures, 0 provider calls.

---

## The four §180 findings, re-derived

| finding | verdict | what the source actually shows |
|---|---|---|
| **F1** `SETTLED_BY_EVIDENCE` requires `ADMISSIBLE_EVIDENCE`, and only `ADMITTED_BINDING` is minted | **PARTIALLY_CONFIRMED** | Correct for `src/`: exactly one minting site, `owed-fact-binding.ts:355`, producing `ADMITTED_BINDING`; zero sites mint `ADMISSIBLE_EVIDENCE` or `RECORDED_ARBITRATION`. **But §180's word "unreachable" is too strong** — see below. |
| **F2** `CHALLENGE_FACT_VALIDITY` produces an `ArbitrationRequest` with no consumer | **CONFIRMED**, with a refinement | Produced at `owed-fact-binding.ts:283`, typed `settles: false`. Six references in `src/`, all carriage — the parse result and the observability record. None converts it into a transition. |
| **F3** the provider is never required to declare what its evidence establishes | **CONFIRMED** | `ProjectedOwedFact` carries eight fields; none is a settlement status and none asks what a span establishes. `STRUCTURED_EVIDENCE_PROPERTY_DECLARATION = ABSENT`. |
| **F4** the §179 rows ran outside the ledger | **CONFIRMED** | Neither the §179 runner nor the §175/§177 harness imports anything from `owed-facts`, and the harness contains no `OwedFact` or `factKey` reference at all. |

### The F1 correction, stated precisely

§180 said the settlement state is "unreachable". It is not. `transition()` is exported and generic: it checks that the requested authority is the one `REQUIRED_AUTHORITY` names for the requested status, and admits it. A0 called it directly and reached `SETTLED_BY_EVIDENCE` (check F1.d), and it correctly refused `ADMITTED_BINDING` for that status (F1.e).

The transition is also already **exercised and proven in development suites** —
`test-expert-bounded-reliability-architecture.ts:327` mints `ADMISSIBLE_EVIDENCE`, and three suites mint `RECORDED_ARBITRATION`.

> **The accurate statement: the state machine is complete and tested. What does not exist is a
> runtime caller.** The correct classification from the authorization's four options is
> **blocked pending a missing producer/consumer** — not "accidentally unreachable", and not
> "intentionally sealed".

This distinction matters for what gets built next. A sealed state would need a design change. An un-invoked state needs a caller.

## Can a provider cause `SETTLED_BY_EVIDENCE`?

**No.** Traced end to end:

```
provider output
  -> checkBindingDeclarations()        24 structural admission codes
  -> applyAdmittedDeclarations()       the ONLY transition it can mint is ADMITTED_BINDING
  -> status COVERED
```

A0 drove a well-formed bound declaration through the real path (check 2.3): the fact reached `COVERED`, every recorded transition carried `ADMITTED_BINDING`, and `owed-fact-binding.ts` contains no occurrence of `'ADMISSIBLE_EVIDENCE'` anywhere (P10).

The strongest provider-driven outcome is *"a question was asked about this"*. The provider cannot say *"this is settled"* in any way the ledger honours.

## The full `CHALLENGE_FACT_VALIDITY` trace

```
verifier instruction (expert-verifier-instruction-v3.ts:166)
   "the observation already settles it, or answering it either way leads to the same thing"
      |
      v
provider returns declaration = CHALLENGE_FACT_VALIDITY + challengeReason
      |
      v
parseOwedFactDeclarations()  -- refuses a challenge with no reason (CHALLENGE_WITHOUT_A_REASON)
      |
      v
ArbitrationRequest { factKey, requestedBy:'VERIFIER', reason, settles:false, factStatusUnchanged:true }
      |
      v
carried in DeclarationParseResult.arbitrationRequests
      |
      v
carried into OwedFactObservabilityRecord.arbitrationRequests
      |
      X   NOTHING READS IT TO DECIDE ANYTHING
```

A0 confirmed each step (checks 3.1–3.4). After a challenge the fact is still `UNRESOLVED`.

**Classification: DEAD AS A DECISION INPUT, LIVE AS OBSERVABILITY.** It is produced, validated, typed to be harmless, and recorded — and no decision consults it.

Against the authorization's four options, connecting it is **(A) necessary before new settlement representation** — and the reason is specific rather than tidy-minded:

> The channel a model would use to say "this fact is already settled" **already exists and already
> carries a free-text reason.** A reviewer could compare that reason against
> `acceptableEvidence.requirement` today, without any new field. So the first integration does not
> need the structured declaration; the structured declaration is a refinement whose value should be
> judged after reading real challenge reasons.

That is the single most consequential result in A0, because it revises §180's recommendation about what to build first.

## What is missing, stated as a list of absences

1. **No producer of `ADMISSIBLE_EVIDENCE`** in runtime code — so no fact can ever be recorded as settled by evidence.
2. **No consumer of `ArbitrationRequest`** — so a correct "this is already settled" claim reaches no one.
3. **No producer of `RECORDED_ARBITRATION`** — so the queue in (2) has no terminal state even if read.
4. **No structured evidence-property declaration** — so the claim in (2) is free text rather than a two-sided comparison.

Items 1–3 are integration gaps in a complete state machine. Item 4 is a representation gap. **A0's evidence is that 1–3 are the binding constraint and 4 is a refinement**, because the claim can already be made and carried today.
