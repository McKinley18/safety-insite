# §195 — The pipeline stage that does not exist

**§195 did not execute. Zero provider calls were made. Nothing was spent.**

The authorization names a seven-stage system under test:

```
RAW OBSERVATION
→ EXPERT FIRST PASS
→ OWED-FACT / TASK-STATE CONSTRUCTION        ← this stage does not exist
→ FIRST-PASS CLARIFICATIONS
→ VERIFIER-v3.2
→ DETERMINISTIC ADMISSION
→ UNRESOLVED / SETTLEMENT-ELIGIBILITY STATE
```

**There is no code that reads an Expert first-pass analysis and produces owed facts.** Every owed
fact this programme has ever verified was authored: product-owner-reviewed at §184, or authored by me
at §192. The authorization forbids exactly that — *"Do NOT hand-author the first-pass owed-fact state
presented to the verifier"* — so the run cannot proceed.

## The evidence, four independent ways

**1. No constructor from an analysis exists.** A repository-wide search for `deriveOwedFact`,
`owedFactsFrom` and `fromAnalysis` returns nothing. Every caller of `owedFact(...)` and
`createOwedFactLedger(...)` is a test or a harness building facts from authored data — the §167
falsification executor, the §166/§170 proof suites, the §182 settlement integration tests.

**2. The projection boundary is a firewall, not a constructor.**

```ts
export function projectOwedFact(f: OwedFact): ProjectedOwedFact
```

It takes an **already-constructed** `OwedFact` and strips what a provider may not see. It cannot
create one.

**3. The whole owed-fact layer is inactive, and none of it knows what an analysis is.** Every module
under `owed-facts/` carries `INTEGRATED AND INACTIVE`, and **not one imports or references
`ExpertAnalysis`**. There is no owed-fact usage anywhere in the production service layer.

**4. The shapes do not meet.** What the first pass emits, and what an owed fact requires:

| first pass — `DecisionCriticalClarification` | owed fact — `OwedFact` |
|---|---|
| `clarificationId` | `factKey` — **absent** |
| `question` | — |
| `whyItMatters` | `whyUnresolved` — related but not the same |
| `affectedDecision` | `affectedDecision` ✓ |
| `criticality` | `priority` — related |
| `evidenceGap` *(prose, "stated as a fact")* | `evidenceSpan` — **a verbatim observation span. Absent.** |
| — | `branchA` — **absent** |
| — | `branchB` — **absent** |
| — | `decisionDivergence.ifA` / `.ifB`, which must differ — **absent** |
| — | `source`, `status`, `acceptableEvidence` |

The gap is not formatting. To build an owed fact from a clarification, something would have to
**invent a factKey**, **extract a verbatim span from prose that is not one**, and **author both
plausible answer states and both of today's decisions**.

## Why building it was not attempted

That construction is the precise thing this architecture has repeatedly and deliberately refused.

`structural-questions.ts`:
> "**No parser over generated English.** Splitting a compound string on a conjunction is a lexical
> heuristic over model prose, and a mis-split safety question is worse than a compound one…
> **Inventing customer-facing wording deterministically is the one thing this module must never do.**"

`governed-evidence-derivation.ts`:
> "**Nothing here searches for a record**, because a search would be an inference, and inferring
> which governed record applies to an unresolved fact is a judgement this module has no standing to
> make."

Authoring `branchA`, `branchB` and both decision outcomes from a model's prose is authoring safety
truth deterministically. It is also a substantial architectural integration — not a validation task —
and §195 explicitly forbids remediating or integrating in the same authorization.

## What this means for the authorization's own questions

- **A, B, C, D (first-pass behaviour)** — partially answerable today, but only against
  *clarifications*, not owed facts. Question C, owed-property decomposition, has no artifact to
  measure because the pipeline produces no owed properties.
- **E (task-state transfer)** — unanswerable. There is no transfer; the state is hand-built.
- **F, G, H, I (verifier and regulatory basis)** — answerable only against a hand-authored state,
  which is what §192 already did and what §195 was convened to stop doing.
- **J (end-to-end union quality)** — unanswerable.

**Running §195 with hand-authored owed facts would reproduce §192 with a fresh cohort and call it an
end-to-end validation.** That would be the misleading outcome, not the stop.

## What §195 delivered instead

Everything that does not depend on the missing stage, so §196 can execute the moment it exists:

- a **fresh 12-row cohort**, frozen, covering all ten fixture families, with 6 valid-reliance and 6
  unsupported-reliance executions across two hazard families each, 30 NONE-expected executions,
  A∧B and A∧B∧C conjunctives, a multi-gap row and two zero-owed-fact rows;
- **truth and governed-evidence manifests**, with every expected `evidenceSpan` verified verbatim;
- a **preregistration with all fourteen thresholds**, frozen and not derived from any observed
  output;
- a frozen **interleaved execution order** and protocol hashes;
- a second finding discovered without spend — see `CITATION-RELIANCE-COLLISION.md`.

## The decision this needs

How should owed facts come to exist from a real first pass? Three shapes, and the choice is a
product-architecture decision, not an engineering one:

1. **The first pass emits them directly.** Extend the Expert response schema so the model returns
   structured unresolved facts — `factKey`, verbatim `evidenceSpan`, both branches, both decisions —
   rather than prose clarifications. Most faithful to the pipeline as specified. Largest change: a
   new first-pass protocol version and a re-validation of first-pass behaviour.
2. **A deterministic constructor over first-pass output.** Rejected above on this architecture's own
   stated grounds — it would require inventing branches and spans from prose.
3. **Accept that owed facts are human-authored** and rescope the end-to-end claim accordingly: the
   pipeline under test becomes *observation → first pass → clarification*, with the owed-fact layer
   remaining a governed human artifact. Smallest change; also the smallest claim.

My reading is that option 1 is the only one that makes the specified pipeline real, and that its cost
is a first-pass protocol change plus fresh first-pass validation. Option 3 is honest and cheap but
means "end-to-end Expert HazLenz" never includes automatic owed-fact construction. **That is the
owner's call and §195 does not make it.**
