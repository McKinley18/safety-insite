# §196 — the stage that did not exist, and what now stands in its place

**§196 made zero provider calls, performed zero database operations, activated nothing, and modified
no existing runtime file.**

## The root cause, restated from §195 and unchanged

§195 was authorised to validate a seven-stage pipeline end to end. It stopped before spending
anything because the third stage was not a component:

```
RAW OBSERVATION
→ EXPERT FIRST PASS
→ OWED-FACT / TASK-STATE CONSTRUCTION        ← no code performed this
→ FIRST-PASS CLARIFICATIONS
→ VERIFIER-v3.2
→ DETERMINISTIC ADMISSION
→ UNRESOLVED / SETTLEMENT-ELIGIBILITY STATE
```

The first pass emitted `DecisionCriticalClarification` — `clarificationId`, `question`,
`whyItMatters`, `affectedDecision`, `criticality`, `evidenceGap`. An `OwedFact` requires `factKey`,
a **verbatim** `evidenceSpan`, `branchA`, `branchB` and a `decisionDivergence` whose two halves must
differ. Nothing in the repository read the first and produced the second, and every owed fact the
programme had ever verified was hand-authored — product-owner-reviewed at §184, or authored by the
model-facing harness at §192.

**The gap was never a formatting gap.** Building an owed fact from a clarification would have
required inventing a `factKey`, extracting a verbatim span from prose that is not one, and authoring
both plausible answer states together with both of today's decisions. That is authoring safety truth
deterministically, and two modules refuse it in writing:

> **No parser over generated English.** Splitting a compound string on a conjunction is a lexical
> heuristic over model prose, and a mis-split safety question is worse than a compound one…
> **Inventing customer-facing wording deterministically is the one thing this module must never do.**
> — `structural-questions.ts`

> **Nothing here searches for a record**, because a search would be an inference, and inferring which
> governed record applies to an unresolved fact is a judgement this module has no standing to make.
> — `governed-evidence-derivation.ts`

## The product-owner decision §196 executes

Option 1. **The first pass emits structured unresolved facts directly.** Option 2 — a deterministic
constructor over first-pass prose — was rejected on this architecture's own stated grounds. Option 3
— accept human-authored owed facts permanently — was rejected as the production bridge.

So the remediation is **representational**, and the division of labour is stated once and enforced
everywhere below it:

> **The model authors semantic safety content. Deterministic code validates and projects it.**

## What now exists

| stage | before §196 | after §196 |
|---|---|---|
| first pass may STATE an unresolved fact | no representation | `unresolvedFactDeclarations`, a fifth sibling collection in the prospective **first-pass vNext** protocol |
| declaration → `OwedFact` | nothing | `projectDeclaredOwedFacts`, deterministic, fail-closed, with a total field-provenance table |
| identity of a first-pass fact | n/a | computed by HazLenz from closed-vocabulary and externally-anchored fields; **the wire has no `factKey` field at all** |
| governed-evidence citation reuse | faithful reuse refused whole | admitted at the verifier only when the identifier appears verbatim in an authorised supplied source (**v3.3 admission**) |

Four new modules, all under `backend/scripts/lib/`, all development-only and unreachable from
production:

- `expert-first-pass-instruction-vnext.ts` — the prospective protocol, built by construction from
  v15 and provably reversible to it
- `expert-first-pass-owed-fact-projection.ts` — the deterministic bridge
- `expert-governed-citation-reuse.ts` — the supplied-source reuse rule
- `expert-verifier-contract-v3-3.ts` — v3.2 plus that rule, admission only

## What §196 deliberately did not do

- **It did not touch `expert-prompt.ts`.** v15's system prompt sha256 is still
  `20979d90c0fe0b81…`, so §138's routing evidence, §147/§148's label repair, §176's threshold clause
  and §183's retained-unknown check all remain attached to the protocol that produced them.
- **It did not touch `owed-fact.types.ts` or any file under `owed-facts/`.** Every hash §187 pinned
  is unchanged. The projection writes *into* the runtime contract and never edits it.
- **It did not touch v3, v3.1 or v3.2.** v3.3 composes; there is no v3.3 instruction and no v3.3
  prompt hash.
- **It did not execute anything.** vNext and v3.3 both carry `HOSTED VALIDATED = FALSE`. §195
  remains an execution-inconclusive pre-spend run and none of its eleven absent execution artifacts
  was created.

## The residual this does not close, stated rather than buried

`OwedFact` has **no field for the owed property itself**. The declaration states it in
`missingFact`; the fact carries `whyUnresolved`, two branches and two decisions, and the property
survives only implicitly across them. Adding a field would mutate `owed-fact.types.ts`, whose sha256
is pinned by §187 and asserted by every integrity gate since. Folding `missingFact` into
`whyUnresolved` would be composition, and composition is invention. So it is preserved on the
declaration record, recorded in `NON_PROJECTING_DECLARATION_FIELDS`, and **escalated** — see
`OWED-FACT-FIELD-PROVENANCE.md`.

The second residual is `priority`. See `DETERMINISTIC-PROJECTION.md`.
