# Bounded development integration decision

**§168, 2026-09-04. Zero provider calls. This is a DECISION document. Nothing was integrated, and
no file under `backend/src/` was created or modified in this operation.**

---

## What "bounded development integration" would mean here

Moving a component from `backend/scripts/lib/` into the development Expert path **behind an inactive
feature gate**, with zero behaviour change under existing configuration, so it can be exercised by
development harnesses without any customer reaching it.

Today the compiler enforces the separation: `backend/tsconfig.json` sets `rootDir: "./src"`, so a
`src/` file importing `scripts/lib/` is a compile error. Integration means giving up that
enforcement for the integrated components and replacing it with a feature gate — a strictly weaker
guarantee. **That trade is the reason to be selective rather than to move everything that passed.**

---

## Eligible now — subject to one gate

The following are recommended for inactive development integration **conditional on
`BINDING-ADJUDICATION-FORM.json` returning no `BINDING_INCORRECT` disposition**. They are structural,
their behaviour is deterministic, and hosted evidence exercised them without a single violation.

| component | why eligible | why the binding review still gates it |
|---|---|---|
| `CLOSED_SET_OWED_FACT_LEDGER` | 44/44 local; 0 removals, 0 preservation violations across 12 hosted draws | it stores what bindings decide; if bindings are semantically wrong the ledger faithfully records wrong coverage |
| `EXPLICIT_BINDING_FACT_KEY` (admission only) | exact-equality membership, all refusals proven | this is the component under review |
| additive-not-substitutive invariant | unrepresentable by construction — `nominateAdditiveFact()` has nowhere to name a fact to drop | independent of the review, but ships with the ledger |
| `TARGET_COVERAGE_WARNING` (computation) | deterministic set difference; correct on all 12 | its inputs are bindings |
| `PER_FACT_DECLARATIONS` (parsing + refusals) | 12/12 complete and consistent | parsing is independent; admitted content is not |
| observability record | append-only, 17 reconstruction obligations, proven locally | independent |
| deterministic state transitions | three authorities, no member for a model explanation | independent |

**A condition on all of them.** They may be integrated **only** with the population boundary intact:
`DEVELOPMENT_HUMAN_TRUTH` must continue to throw on a `PRODUCTION` ledger. That boundary is what
keeps evaluation truth out of the measured system, and it must not be relaxed to make integration
convenient.

---

## Not eligible — and the reasons differ

| component | status | why not |
|---|---|---|
| `CONDITIONAL_SECOND_DRAW_POLICY_C` | **hold** | `UNEXERCISED_HOSTED`. Zero of 12 draws fell silent, so the gate never opened. Integrating a retry mechanism whose hosted behaviour is entirely unmeasured — on the strength of a run where it was unnecessary — is the inverse of the argument that should justify it. **Do not activate a hosted retry mechanism merely because v3 made it unnecessary in this experiment.** |
| `QUESTION_BUDGET` formatting | **blocked** | `REQUIRES_REMEDIATION`. The budget rule does not govern the verifier's returned `question` string, and two hosted draws returned two questions in one string across different equipment. Integrating the budget while that gap is open would import a rule that does not reach the artefact it is meant to govern. |
| additive-gap **discovery** expectations | **blocked** | unspecified in the contract, no threshold, and a confirmed denominator of one gap on one row. There is nothing to integrate — only a product question awaiting the draw-6 adjudication. |
| customer-visible multi-question behaviour | **blocked** | depends on the compound adjudication and on the burden design; no frontend work is authorized. |
| `DEGENERATE_RETRY_POLICY` | **unchanged** | `PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION`, exactly as before. Zero degenerate responses occurred, so §167 supplies no new evidence either way. |
| challenge / arbitration bridge | **hold** | zero `CHALLENGE_FACT_VALIDITY` declarations were emitted, so the path is `UNEXERCISED_HOSTED`. Its refusals are proven locally; its hosted behaviour is not. |

---

## The recommendation, stated plainly

**Do not integrate anything in this operation**, and do not treat this document as authorization to
do so. It records which components *would* be eligible and under what condition.

The sequencing that follows from the evidence:

1. **Return the 12 binding dispositions.** Zero cost, and it gates the eligible set.
2. **Adjudicate the compound-question and draw-6 packets.** These decide whether `QUESTION_BUDGET`
   needs a contract change or a formatter, and whether a discovery axis exists at all.
3. **Then** authorize inactive integration of the eligible components as a single named slice, with
   the population boundary and a zero-behaviour-change regression proof as explicit acceptance
   criteria.

**One caution about ordering.** It is tempting to integrate the clean components now and resolve the
adjudications later. The binding review is the cheapest item on the list and gates the most
components; doing it first costs nothing and avoids integrating a coverage mechanism whose semantic
foundation is still open.
