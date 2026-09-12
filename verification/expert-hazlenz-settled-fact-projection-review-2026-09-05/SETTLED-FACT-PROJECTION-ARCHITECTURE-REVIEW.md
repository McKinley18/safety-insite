# §186 — Settled-fact projection architecture review

**2026-09-05. Review only. No source modified, no provider call, no database operation.**

**Answer to the primary question: no.** The existing inactive architecture cannot expose a truthfully
settled owed fact to a provider for restraint evaluation. Not because a filter is in the way — the
filter is the least of it — but because three independent layers each represent an owed fact as
unresolved by construction, and the one that matters most is an authority boundary that should not
be weakened.

---

## A. Why the projection filters to unresolved facts

Not implementation convenience. The evidence is an explicit named admission code.

Supplying a settled fact and letting a provider declare on it was executed, not reasoned about. All
three declaration modes are **refused whole**, each with the same code:

| declaration on a settled fact | codes | admitted | status after | transitions |
|---|---|---|---|---|
| `BOUND_BY_CLARIFICATION` | `BOUND_FACT_NOT_UNRESOLVED` | 0 | `SETTLED_BY_EVIDENCE` | 0 |
| `STILL_UNRESOLVED` | `BOUND_FACT_NOT_UNRESOLVED` | 0 | `SETTLED_BY_EVIDENCE` | 0 |
| `CHALLENGE_FACT_VALIDITY` | `BOUND_FACT_NOT_UNRESOLVED` | 0 | `SETTLED_BY_EVIDENCE` | 0 |

A code named `BOUND_FACT_NOT_UNRESOLVED` exists because someone decided a declaration may only
attach to an unresolved fact. Nothing throws and no status moves — the refusal is a safety property,
not a crash. But it also means **a provider cannot say anything admissible about a settled fact
through the existing protocol.**

Classification: **(1) clarification-only projection AND (3) authority safety boundary**, jointly.
The supplied set is simultaneously the declaration-obligation set — `checkBindingAdmission` raises
`OWED_FACT_NOT_DECLARED` for any supplied key that receives no declaration
(`owed-fact-binding.ts:300-302`) — so a settled fact cannot be supplied passively for information.
Supplying it *compels* a declaration that will then be refused.

## C. There is no dormant path, and the prompt text is the decisive obstacle

Two mechanisms carry owed facts, and they are not the same one:

- **`projectOwedFactsForVerifier`** filters through `unresolvedFacts()`. Measured: settled ledger → 0
  facts, unresolved ledger → 1. **No hosted experiment calls it.**
- **`buildVerifierV3UserPrompt`** is what actually reaches a provider, and every caller hand-builds
  its `V3SuppliedOwedFact[]`. Its `whyUnresolved` is typed `string`, **not** nullable — §185 did not
  change it.

So the filter is not what keeps settled facts out of the hosted prompt. The harness simply never
builds one, and the template could not express one if it did:

```
UNRESOLVED FACTS IDENTIFIED FOR YOUR REVIEW
  factKey: owed:guarding:fixed_guard_fastenings_currently_secure
    unresolved because: null
```

That is the actual rendered output for a settled fact, executed. The heading asserts the fact is
unresolved and the per-fact line asserts it again, with the null rendering as the literal string.
**Passing a settled fact through the existing text path represents it as unresolved — the one thing
the authorization forbids.**

Two full-ledger carriers exist and neither is a provider input: `runOwedFactCoverageStage`'s
attachment carries `ledger.facts` unfiltered but attaches to a merged *result* behind the literal
`false` gate, and `OwedFactObservabilityRecord.initialOwedFacts` is an append-only development
*record*. Both are outputs. Neither is a request.

## D. Provider authority is intact and unaffected

`applyAdmittedDeclarations` mints only `COVERED`, under `ADMITTED_BINDING`
(`owed-fact-binding.ts:352-357`). `SETTLED_BY_EVIDENCE` requires `ADMISSIBLE_EVIDENCE`, which no
provider path mints. `TRANSITION_AUTHORITIES` contains no member for a model explanation and a
forged one throws. **`PROVIDER_SETTLEMENT_AUTHORITY = NEVER` holds, and nothing in this review
proposes touching it.**

**The §182 and §185 claims do not imply provider visibility, and must not be read as implying it.**
§182 established that a human-authorized route to `SETTLED_BY_EVIDENCE` exists while provider claims
alone cannot settle — a statement about *who may settle*. §185 established that settled and
unresolved facts are both representable without false `whyUnresolved` text — a statement about
*internal representation*. Neither says a provider can see a settled fact. It cannot.

## E/F. The eight fields cannot say "settled", and the fixtures' legibility is borrowed

Between the two members of every pair, exactly **two** projected fields differ: `whyUnresolved`
(sentence vs `null`) and `evidenceSpan`. `factKey`, `branchA`, `branchB` and `decisionDivergence`
are identical. Nothing in the payload *names* the settlement state — a null is an absence, not an
assertion, and a model reading it has no way to distinguish "settled" from "the field was omitted".
`status` is not projected at all.

For **HR-04 / HR-10** and **HR-02 / HR-06** specifically, the owed property *is* recoverable from
`branchA` — but only because §185 derived the branches mechanically from the approved
`factStatement`, so they carry it verbatim. **That is a property of the §185 derivation, not of the
schema.** A fact whose branches were authored independently would not carry it, and neither
`factStatement` nor `targetDecision` is projected. The fixtures are legible by accident of
derivation, which is not a foundation to measure on.

`acceptableEvidence: null` does not change the projection question. It is uniformly null across all
ten rows, so it distinguishes nothing between settled and unresolved members and is orthogonal to
this review. §171/§181 governed-evidence findings stand untouched.

## B/G. What is measurable now, and what is not

| §183 behaviour | needs settled-fact visibility? | measurable under current architecture |
|---|---|---|
| Unnecessary clarification suppression | **No** | **Yes** — supply zero owed facts and measure whether the model invents one |
| Settled-fact restraint | **No** | **Yes**, same way, and *more* strongly |
| Adjacent-fact containment | **No** | **Yes** — §182 proved the structural half with no provider |
| False-settlement challenge behaviour | **Yes** | **No** |
| `CHALLENGE_FACT_VALIDITY` on an already-settled fact | **Yes** | **No** — refused `BOUND_FACT_NOT_UNRESOLVED` |

The first three do not need the model to be *told* a fact is settled. The §184 settled rows are the
§174 **SILENCE** rows: the correct behaviour is to ask nothing. Running them with zero supplied owed
facts measures exactly that, and measures it harder — telling a model a fact is already settled is a
cue that makes restraint easier, so settled-fact visibility would confound *in the direction of
flattering the model.* That is worth stating plainly, because it inverts the assumption behind the
§185 stop report: exposing settled facts is not obviously an improvement to measurement validity.

The last two genuinely require visibility, and there is no admissible declaration a provider could
return about a settled fact. There is no `ALREADY_SETTLED` or `NO_ACTION_NEEDED` member of
`OWED_FACT_DECLARATIONS`, and adding one is option E.

**§183 ten-row design under the current projection: `INVALID_FOR_SETTLED_CONTROL_AXES`.** The five
REQUIRED rows remain valid on the axes §183 already identified as constructible. The five settled
rows project zero facts, so any containment result attributed to them today would be a property of
the filter rather than of the model.

**Minimum architecture condition for the full ten-row cohort to be interpretable:** either re-scope
the settled rows to zero-supplied-fact silence controls (no code change), or add a declaration
vocabulary in which a provider can respond admissibly to a settled fact (option E, unauthorized).

## Decision table

| | Approach | Representation fidelity | Provider authority risk | Contamination risk | Code surface | Causal interpretability | §184 compat | §182 compat | Ten-row usefulness |
|---|---|---|---|---|---|---|---|---|---|
| **A** | Keep unresolved-only projection; run settled rows as zero-supplied-fact silence controls | **High** — nothing is misrepresented | **None** | **None** | **Zero** | **Highest** — no cue is given, so restraint is the model's | Full | Full | **3 of 5 axes**, and the three that matter most |
| **B** | Use an existing full-ledger projection | — | — | — | — | — | — | — | **Not available.** No such provider path exists; both full-ledger carriers are outputs |
| **C** | Extend the projection minimally to include settled facts plus existing status | Low — prompt still says "UNRESOLVED FACTS … unresolved because: null" | Medium — needs `BOUND_FACT_NOT_UNRESOLVED` relaxed, which is the authority boundary | Medium — adds a cue | **Large** — projector + `V3SuppliedOwedFact` type + prompt text + admission codes | Poor — cue confound | Full | **Weakens it** | Low |
| **D** | Separate development-only settled-fact context carrier | Medium — can say "settled" without touching declarations | Low, if it carries no declaration obligation | Medium — still a cue | Medium — new carrier + prompt block | Medium | Full | Full | Medium |
| **E** | New provider declaration/property field | High | Must be designed to stay informational | Medium | Largest | Best for the two challenge axes | Full | Must be proven | Highest — **design only, not authorized** |

**Recommendation: A now, E later if the two challenge axes are judged worth their own slice.** No
narrow projection correction is justified before §183, and C in particular buys a cue-confounded
measurement at the price of the authority boundary that §182 exists to hold.

## Direct-construction observation (§185 carry-forward)

Executed: a **PRODUCTION** ledger admits a `FIRST_PASS_MODEL`-sourced fact constructed directly as
`SETTLED_BY_EVIDENCE`, with zero transition records. No provider can reach that path — provider
output flows through `applyAdmittedDeclarations`, which mints `COVERED` only — so this is a
**construction-side** gap, not a provider-authority gap, and `PROVIDER_SETTLEMENT_AUTHORITY = NEVER`
is undisturbed. For §183 it is inert, because fixtures are built by the harness rather than by the
model. It is recorded here rather than redesigned, per the authorization; it would matter if
production owed facts were ever constructed from an untrusted source.

## Historical pin

`CURRENT_REGRESSION_FAILURE = FALSE`. `HISTORICAL_PIN_NO_LONGER_MATCHES_CURRENT_SOURCE = TRUE`.
Classified `EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE`. Nothing was modified.

## Claim boundary

**Established by this review:** no existing path carries a settled owed fact to a provider; the
unresolved-only restriction is a deliberate authority boundary evidenced by a named admission code;
the projected eight fields cannot express settlement state; and three of the five settled-control
axes are measurable today with no code change at all.

**Not established:** anything about model behaviour, §183 validity beyond the classification above,
settlement quality, reviewability, governed evidence sufficiency, customer or production readiness.
No provider ran.
