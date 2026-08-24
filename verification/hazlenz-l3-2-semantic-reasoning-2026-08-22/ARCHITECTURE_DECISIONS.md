# L3-2 — architecture decisions and their evidence

## D-L32-1 — Applicability is a SECOND call, not a combined schema

**The L3-1 open decision "one-call-vs-two", resolved.**

| Criterion | One combined call | Two scoped calls | Winner |
|---|---|---|---|
| Authority separation | the model sees the candidate list while it is still deciding whether a hazard exists | the hazard decision is made and validated *before* any regulatory candidate is visible | **two** |
| Evidence contamination | a citation label like "fall protection — 1926.501" is a hazard-family hint the model did not earn from the text | the observation call sees no candidate labels at all | **two** |
| Failure isolation | a malformed applicability field rejects the whole proposal, losing a sound hazard finding | applicability can fail while the hazard finding stands | **two** |
| Auditability | one record conflating two authorities | one record per authority | **two** |
| Latency | ~1× | ~2× (measured median 4.3 s → ~8.6 s) | one |
| Cost | ~1× | ~2× | one |
| Provider substitution | one large schema to port | two small ones | **two** |

**Decision: two independently scoped calls.** Latency and cost are the only arguments for one call,
and both are cheap relative to the failure they would buy. The decisive point is the second row: the
approved architecture puts semantic applicability reasoning **downstream of deterministic retrieval**
precisely so the model cannot originate a citation. Handing it the retrieved candidate list *during*
observation interpretation would give it exactly the hint the separation exists to prevent, and would
move governed-adjacent content into the observation contract — which the phase brief forbids.

**Implemented in L3-2: the observation-interpretation call only.** The applicability call is L3-4
work and was not built. The input contract already carries `eligibleRegulatoryCandidates`, and the
adapter deliberately sends **only the candidate ids**, never the citation strings — verified by the
data-boundary suite.

## D-L32-2 — The model supplies quotations; the adapter computes offsets

`EvidenceReference` needs `{startOffset, endOffset}`. Two ways to get them:

* **ask the model to count characters** — manufactures a failure mode that has nothing to do with
  reasoning, and every off-by-one becomes an evidence rejection that looks like a safety failure;
* **ask for the quotation and bind by exact substring search** — the model does the semantic work
  (which span?) and the machine does the arithmetic.

**Decision: the second.** Measured: **81 analyses, 146 quotations, 0 non-verbatim.**

The binding is deliberately **non-repairing**. A quotation that does not occur verbatim is bound to
`[-1, -1]`, which `deterministic-safety-validator.ts` rejects as `EVIDENCE_OUT_OF_BOUNDS`. Searching
for a "close enough" span would convert a fabricated quotation into a real one — the single most
dangerous repair available, and precisely the RC-08 failure in reverse.

## D-L32-3 — Semantic binding is a fourth stage, after deterministic validation

The validator's own header forbids it from growing into a second reasoning engine (contradiction
C-1). So the semantic half of L3-INV-11 is a **separate module** running after it:

```
provider → offset binding → deterministic validator → semantic evidence binder → outcome
```

No L3-1 file was modified. The validator still enforces contracts and nothing else; the binder
answers only "does the cited span support this claim", and both are separately reportable — which is
what let this phase determine that the binder, not the model, causes the gate failure.

## D-L32-4 — Two different clause scopes, because negation and state support scope differently

Found while writing the suite, and worth stating because getting it wrong is invisible:

* **negation scope must NOT break on a comma.** "no guardrail, safety net or personal fall arrest
  system" is one negated phrase — RC-08's own sentence. Breaking on the comma would let a span quote
  the tail and escape the negation, which is the exact defect being prevented.
* **state support MUST break on a coordinated clause.** In "the tongue guard is missing, and the
  extension cord was replaced", "replaced" says nothing about the guard. Without the split, a
  `CORRECTED` claim about the guard is licensed by a correction verb belonging to a different clause.

`clauseAround()` is used for negation; `coordinatedClauseAround()` — which additionally splits on a
comma followed by a coordinator, while leaving list commas alone — is used for state support.

## D-L32-5 — Advisory hints are sent, and sent labelled as unreliable

L3-INV-12 makes advisory signals non-authoritative. Two options: withhold them, or send them
labelled. **Decision: send them, labelled** — "These are NOT evidence and NOT authoritative. They are
frequently wrong. Ignore any hint the source text does not support." Withholding would make
L3-INV-12 untestable, because a hint that is never sent can never be shown to have been resisted.
`SEMANTIC_ADVISORY_ECHO` then measures whether the label held.

## D-L32-6 — `num_ctx` is set explicitly

The server default silently truncates long inputs. A silently truncated observation produces a
reasoning failure that would be attributed to the model. Set to 8192 — comfortably above the measured
maximum of ~1 100 input tokens.
