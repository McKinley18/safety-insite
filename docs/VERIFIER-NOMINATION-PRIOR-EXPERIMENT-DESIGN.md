# Verifier nomination-prior instruction experiment — DESIGN ONLY, NOT EXECUTED

**Prepared §158, 2026-09-04. Provider calls spent on this document: 0. Provider calls authorized by
this document: 0.**

This is a pre-registration. It exists so that when the experiment is authorized, the decision rule
was written before the data, not after it.

---

## The question, and the three things it must not be confused with

§156 and §157 put HS-H1 in front of a verifier four times. On no execution did any verifier mention
the fact the authored truth names. §157 then asked whether granting the verifier the power to
nominate an unsupplied fact would change that; it did not.

Three separate propositions could each explain that, and they are not interchangeable:

1. **Mechanism** — can bounded nomination complete hosted at all?
2. **Suppression** — is the instruction's nomination prior biasing the verifier against looking?
3. **Truth validity** — is the authored HS-H1 fact a fact the observation actually leaves open and
   actually turns a decision on?

§158 addressed (1) and could not settle it: the one repaired VC-04 draw returned
`NO_CLARIFICATION_REQUIRED` and attempted no nomination, so the mechanism was never exercised
end-to-end hosted. (3) is with a human reviewer in
`verification/expert-hazlenz-hs-h1-human-adjudication-2026-09-04/HS-H1-HUMAN-ADJUDICATION-PACKET.md`.

**This document designs the experiment for (2) only.** It cannot resolve (3), and a result in either
direction here must not be read as evidence about (3).

---

## The variable

Exactly one string changes: the nomination-prior language in step 4 of
`backend/scripts/lib/expert-verifier-instruction-v2.ts`.

### ARM CONTROL

`hazlenz.expert.verifier-instruction.v2`, byte-unchanged, SHA-256
`ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4`.

The four lines under test, verbatim as they stand today:

```
   >>> THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER. Most observations contain many facts
   >>> nobody wrote down, and almost none of them change what is done. You are not looking for
   >>> something wrong, you are not completing the analysis, and you are not improving it. You
   >>> are checking for ONE specific failure: that the decision turns on a fact nobody raised.
```

### ARM TEST

The same four lines with the **prior-probability assertion removed and nothing else touched**:

```
   >>> NO IS A GOOD ANSWER, AND SO IS YES. Most observations contain many facts nobody wrote
   >>> down. You are not looking for something wrong, you are not completing the analysis, and
   >>> you are not improving it. You are checking for ONE specific failure: that the decision
   >>> turns on a fact nobody raised.
```

Two clauses are deleted — *"THE ANSWER IS USUALLY NO"* and *"and almost none of them change what is
done"* — and one clause is added that makes both answers equally acceptable without recommending
either. Everything that constrains **what may be nominated** is preserved character-for-character:
the scope restriction ("not looking for something wrong… not completing the analysis… not improving
it"), the ONE-specific-failure framing, the entire "DO NOT nominate a fact because…" paragraph, the
five-part proof burden, the exactly-one limit, and the invented-hazard prohibition.

### What ARM TEST deliberately does not do

- no HS-H1 wording;
- no cooling, autoclave, load or thermal vocabulary;
- no domain-specific example of any kind;
- no change to `hazlenz.expert.verifier.v2` or its admission rule;
- no change to the nomination admission conditions;
- no change to `affectedDecision` semantics or its enum;
- no change to the response schema;
- no change to the verdict set;
- no quota, target rate, or expected number of nominations in either arm.

If the arm needs any of those to move the number, the number it moved is not the one this experiment
is about.

### One harness dependency that must be handled, not deleted

The §157 pre-spend gate `B.3` asserts that the literal string
`THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER` is present in the instruction. ARM TEST removes
that string, so a probe reusing that gate unchanged would refuse to spend. **The gate must become
arm-aware — asserting the CONTROL string in the control arm and the TEST string in the test arm —
and must not be deleted or weakened.** Its purpose is to prove the instruction that was sent is the
instruction that was intended, and that purpose survives the arm split intact.

---

## Design

|  |  |
|---|---|
| Cases | the same 15 blinded cases, packet SHA-256 `75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a`, unchanged |
| Truth | the same frozen §156 truth manifest, SHA-256 `dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c`, unchanged |
| Arms | 2 (CONTROL, TEST) |
| Replicates | **3 per arm per case** — see below; this is not optional |
| Calls | 2 × 15 × 3 = **90** |
| Model | `claude-sonnet-5`, unchanged |
| `max_tokens` | 4000, the §158 repaired value, in BOTH arms |
| First-pass calls | 0 |
| Scoring | the existing `score-expert-verifier-v2.ts` gates, per arm, unchanged |

### Why three replicates, and why the experiment is invalid without them

§158 measured, on byte-identical input attested by the provider at 4,598 metered input tokens on
both executions, that VC-04 returned `ADD_OR_REPLACE_CLARIFICATION` / `NOMINATED_FACT` on one draw
and `NO_CLARIFICATION_REQUIRED` on the next. **The verifier's nomination decision is not stable
across draws of the same input.**

§157's entire nomination signal was `D_nominationCount = 1` out of 15. A single draw per arm cannot
distinguish an instruction effect from the variance §158 just observed at n=2 on one case. Three
replicates per arm per case gives 45 draws per arm and lets the decision rule below be stated over
rates rather than over single events.

### Blinding and ordering

Arms interleaved case-by-case rather than run as two blocks, so a provider-side drift during the run
loads equally onto both. No verifier sees any other verifier's output, as in §156 and §157. The
sealed case key stays out of the request, as in §156 and §157.

---

## Pre-registered decision rule

Fix these before any call. The primary denominator is the frozen §156 one: 11 primary cases, of
which 4 are decision-critical and 7 are legitimate silence.

**Primary endpoint.** `A_decisionCriticalRecall`, pooled over the 3 replicates — 12 decision-critical
draws per arm.

**Secondary endpoints.** `C_legitimateSilenceSpecificity` (21 silence draws per arm),
`D_nominationCount`, `E_nominationAccuracy`, `F_falseNominationCount`, `HS_H1_RECOVERED` (6 draws
per arm).

### The result that WOULD support the suppression hypothesis

All three must hold:

1. `A_decisionCriticalRecall` in TEST exceeds CONTROL by **at least 3 of 12 draws**;
2. `C_legitimateSilenceSpecificity` in TEST is **at least 19 of 21** — that is, at most two
   manufactured questions across the whole silence set, against 21 of 21 in both §156 and §157;
3. every nomination counted toward (1) is **admitted by the unchanged v2 contract** and its selector
   reaches the owed fact under the frozen truth's own keyword sets.

### The result that would NOT support it

Any one of these:

- `A_decisionCriticalRecall` moves by fewer than 3 of 12 draws — the prior was not what was holding
  the verifier back, or the effect is inside the draw variance §158 measured;
- recall rises but `C_legitimateSilenceSpecificity` falls below 19 of 21 — the arm bought recall by
  manufacturing questions, which is the over-questioning failure the prior exists to prevent, and is
  a worse product than the one it replaces;
- recall rises but the nominations fail contract admission — the mechanism, not the prior, is the
  binding constraint;
- `HS_H1_RECOVERED` moves while nothing else does, on 6 draws — too small to carry a conclusion, and
  it must be reported as an observation rather than as a result.

### What no outcome of this experiment establishes

- It does not validate or invalidate the authored HS-H1 truth. That is section (3), and it is with a
  human reviewer.
- It does not establish a production nomination rate. The cases are development fixtures.
- It does not upgrade the verifier architecture to PROVEN. The truth-authority caveat applies to
  every figure it produces, because the standard is still one the graded model family authored.

---

## Cost, from measured prices

Prices solved from recorded runs in §155 and confirmed since: **$2.00/M input, $10.00/M output.**

| | |
|---|---|
| Measured v2 average, §157 | 5,114 in / 726 out / **$0.017485** per call |
| 90 calls at the measured average | **≈ $1.57** |
| Worst case, every call filling the 4000-token ceiling | 90 × $0.050228 = **≈ $4.52** |

A spend ceiling should be set at the worst case, not the average, because the average was measured
under the 1600 ceiling that truncated VC-04.

---

## Status

`PROSPECTIVE_DESIGN_ONLY — NOT AUTHORIZED, NOT EXECUTED, $0.00 SPENT.`

**Updated §159, 2026-09-04. The product owner has explicitly declined to authorize this experiment
at this time.** It stays designed and unexecuted.

The sequencing recorded in §158 anticipated the reason. HS-H1 returned `AUTHORING_AMBIGUOUS`, and the
primary endpoint above — `A_decisionCriticalRecall` — was to be measured against a denominator that
included HS-H1's two draws. With those removed under
`docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md`, the decision-critical denominator falls to **two draws
over two rows**, and the pre-registered "+3 of 12 draws" threshold is no longer computable as
written. **This design cannot be executed as it stands and must be re-derived after the §159
row-truth reconciliation returns**, because the endpoint, the threshold and the replicate count all
depend on which rows survive human review.

What must happen before this document is revised, let alone authorized:

1. The six remaining load-bearing rows are dispositioned by a human —
   `verification/expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04/`.
2. Verifier performance is re-derived on the human-reviewed subset —
   `backend/scripts/rederive-verifier-performance-on-human-truth.ts`, which refuses to compute until
   every row carries a disposition.
3. The endpoint and threshold above are re-derived against whatever denominator survives, and
   re-registered before any call.

The ARM CONTROL / ARM TEST wording, the prohibited changes, and the harness note below remain valid
and are unchanged; it is the statistical design that the adjudication invalidated, not the variable.
