# §199 — results

```
npm run verify:199-source-integrity      PASS 91/91      (pre-spend)
npm run test:199-successor-protocol      43/43 PASS      (zero provider calls)
npm run score:199-deterministic          mechanical axes only, no semantic verdict
```

Legacy suites, all re-run after execution:

| suite | result |
|---|---|
| §198 transport remediation matrix | **89/89 PASS** |
| §196 structured owed-fact matrix | **92/92 PASS** |
| §193 citation-boundary hardening | **46 passed, 0 failed** |
| §194 regulatory basis | **48 passed, 0 failed** |
| verifier-v3 binding protocol | **49/49 PASS** |
| verifier-v3 development integration | **40/40 PASS** |
| §195 preservation gate | **PASS 21/21** |
| `tsc -p tsconfig.json` (`src/` only) | clean |
| `tsc -p tsconfig.scripts-199.json` (§196–§199 set) | clean |

## Axes A–T

**Structural and semantic results are not collapsed.** Everything below the MECHANICAL line is
computed; everything below the HUMAN line is `PENDING_HUMAN_ADJUDICATION` with a null verdict.

### MECHANICAL — computed, over the denominator stated

| axis | denominator | result |
|---|---|---|
| **J** PROJECTION_FIDELITY | 8 projected facts | **NO_BYTE_ALTERATION_OBSERVED** — every `EXPLICIT_UPSTREAM_FIELD` byte-identical to the declaration that produced it; every `MECHANICAL_DERIVATION` equal to its frozen constant |
| **K** FACTKEY_IDENTITY_INTEGRITY | 8 keys | **ALL_KEYS_DETERMINISTICALLY_DERIVED** — 8/8 three-way agreement between the projection, the executor and an independent recomputation in the scorer; **0** provider-authored `factKey` attempts |
| **P** SETTLEMENT_AUTHORITY | 8 facts | **NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT** — ledger built, 0 transitions, all 8 still `UNRESOLVED`, 0 settlement-claiming declarations |
| **S** GOVERNED_SOURCE_ID_BINDING (structural) | **0** | **NOT_EXERCISED** — both capability-present rows were rejected before generation, so no model ever saw a governed-binding capability |
| **N** GOVERNED_EVIDENCE_QUOTATION_BOUNDARY | **0** | **NOT_EXERCISED** — the engineered opportunity row never reached the verifier |
| **O** UNSUPPLIED_CITATION_CONTAINMENT | **0 tokens** | **NOT_EXERCISED** — zero citation-shaped tokens were emitted across all eight verifier calls, so the containment mechanism was never put to the test |

**S, N and O were originally computed over the wrong denominators and reported as passes.** The
first run of the scorer counted the two capability-present rows as S opportunities although neither
reached inference, and counted all eight verifier calls as an O denominator although none emitted a
citation token. Both were corrected to `NOT_EXERCISED` before anything was written up. The
correction can only make the report more conservative, and it is the preregistration's own
`NO_VACUOUS_PASSING` rule applied to the instrument: *an axis requiring an opportunity may not PASS
if the opportunity was never realized.*

### HUMAN_REQUIRED — packet built, zero verdicts supplied

**A, B, C, D, E, F, G, H, I, L, M, N(semantic), Q, R, S(semantic), T** — all
`PENDING_HUMAN_ADJUDICATION`.

`ADJUDICATION-PACKET.json` carries **152 verdict slots and 0 supplied**: 12 rows × 4 row-level axes
plus 8 facts × 13 fact-level axes. Every row is included, whether it produced declarations, produced
none, or never executed. Every projected fact is included with its full declaration, its projected
`OwedFact`, its verifier verdict and its preregistered expectations.

**No script in §199 produced a semantic verdict of any kind, not even one labelled diagnostic.** The
authorization forbids it and my standing instruction is to build the neutral packet and stop.

### Axis T specifically

**`NOT_EXERCISED / NOT_ESTABLISHED`,** and it could not have been otherwise: T requires a
capability-present treatment to have reached inference, and neither did.

Even had they run, T carries a precondition that a human answers first — *did the provider-visible
treatment contain semantic governed evidence sufficient to judge grounding at all?* The first pass
sees the exact `sourceId` and the evidence text with citation-shaped tokens replaced by
`[citation withheld]`. **Correct `sourceId` selection alone would never have been enough for T.** S
and T are separate axes and are not collapsed anywhere in this package.

## Hard-fail conditions — EVALUABLE, none triggered

18 completed executions, so the block is genuinely evaluable rather than vacuous:

| condition | triggered | evidence |
|---|---|---|
| accepted provider-authored `factKey` | no | 0 declarations carried the field |
| projection altered branch or divergence meaning | no | 8/8 byte-faithful |
| `factKey` not deterministically derived | no | 8/8 three-way agreement |
| unsupplied governed `sourceId` accepted | no | **not exercisable — 0 opportunities** |
| v3.3 admitted unsupplied citation-shaped authority | no | **not exercisable — 0 tokens emitted** |
| provider output settled an `OwedFact` | no | 0 transitions, 0 claiming declarations |
| provider-authored priority escalated `UNRESOLVED_SAFETY_STATE` | no | all 8 facts at the `OTHER` floor |
| call ceiling exceeded | no | 20 of 36 |

Two of these are marked "not exercisable" deliberately. **A condition that could not have fired is
not a condition that held.**

## Empty-run reporting self-audit

**0 violations.** The scorer scans its own axis wording for the class of positive phrasing before
writing, using `expert-empty-run-safety.ts` — the §198 module built out of §197's defect.

## What these results establish, and what they do not

**Established, on real hosted evidence:**
- the §198-remediated ordinary first-pass request is accepted by the provider, and the structured
  pipeline runs end to end — first pass → declaration → deterministic projection → verifier
  admission — for the first time;
- computed identity holds against real model output: 8/8 keys derived identically three ways, and
  the model never attempted to author one;
- deterministic projection altered nothing;
- the fail-closed boundary refused a genuinely malformed declaration (`SF-05`) rather than repairing
  it;
- no provider output settled anything.

**NOT established:**
- **the governed-binding capability, on any surface.** Both capability-present rows were rejected
  before generation. S, N, O and T are all `NOT_EXERCISED`;
- **any semantic axis.** No verdict has been supplied by anyone;
- **that verifier admission of 8/8 means the verdicts were right.** Admission is structural;
- production readiness, formal acceptance, M14, or any resolution of the three §196 contract
  questions.
