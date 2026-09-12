# Resolved product-owner adjudications — §169, 2026-09-04

**Returned by the PRODUCT OWNER. Recorded verbatim. Zero provider calls.**

The §168 packets are unaltered; this is a separate record so the question and the answer stay
distinguishable, as `HS-H1-ADJUDICATION-RESULT.md` and
`HS-A1-DISPLACED-FACT-ADJUDICATION-RESULT.md` are separate from their packets.

**The 12 binding dispositions are NOT resolved and remain `null` in
`BINDING-ADJUDICATION-FORM.json`.**

---

## 1. HS-A1 draw 6

```
HS_A1_DRAW_6_DISPOSITION = SECONDARY_GAP_NOT_REQUIRED_IN_THIS_VERIFIER_ROLE
```

**Reason, verbatim:**

> Verifier-v3 is REQUIRED to preserve and address supplied owed facts.
>
> Additive nomination is PERMITTED and bounded.
>
> It is not presently governed by an independently validated additive-discovery recall requirement.
>
> Therefore failure to rediscover the independently valid auger fact does not by itself make draw 6
> defective.

**Axes preserved separately:**

```
OWED_FACT_PRESERVATION          = REQUIRED
ADDITIVE_GAP_DISCOVERY_RECALL   = NOT_CURRENTLY_A_REQUIRED_AXIS
```

**Standing prohibition:** do not convert the observed 5/6 additive nomination into a required recall
threshold. It is an observation on a denominator of one confirmed gap on one row, and it is not a
rate.

This upholds the architectural reading §168 derived from the frozen contract and instruction: the
contract has no admission code for a missing nomination, the inherited *"THE ANSWER IS USUALLY NO"*
prior is the opposite of a recall target, and the verifier's jurisdiction is bounded to the
clarification set rather than hazard re-analysis.

---

## 2. HS-A1 draws 2 and 3 — compound question strings

```
HS_A1_DRAW_2_COMPOUND_DISPOSITION = COMPOUND_UNACCEPTABLE
HS_A1_DRAW_3_COMPOUND_DISPOSITION = COMPOUND_UNACCEPTABLE
```

**Reason, verbatim:**

> The underlying facts may each be valid, but two independently answerable facts with distinct
> immediate-control implications must not be packed into one customer-visible proposedClarification
> string.
>
> This is a REPRESENTATION / QUESTION-BUDGET defect, not necessarily a semantic question-validity
> defect.

**Preferred remediation:**

```
STRUCTURAL_PER_FACT_QUESTION_REPRESENTATION
```

**Standing prohibition:** do **not** build a lexical/conjunction parser over model prose as the
safety gate.

**What this separates.** The disposition is about *representation*, not about whether either
question was semantically right. Those 12 semantic judgements are the open binding review, and this
disposition does not pre-empt any of them — including for draws 2 and 3.

**Consequence for the component status.** `QUESTION_BUDGET = REQUIRES_REMEDIATION` is confirmed, and
the remediation form is now fixed: a structural per-fact question representation, which in practice
means a v3 schema revision giving the additive nomination its own question field. That is its own
authorization and was not performed here.

---

## 3. Silence-control candidates

```
CURRENT_SILENCE_CANDIDATES_HOSTED_ELIGIBILITY = NOT_READY_LENGTH_CONFOUNDED
```

**Reason, verbatim:**

> The five fresh silence rows are perfectly separable from the two authoritative REQUIRED rows by
> observation length.
>
> This invalidates them as a clean comparison set in their current form.
>
> It does NOT establish that their semantic silence truth is wrong.

**Prospective remedy, verbatim:**

> Re-author fresh silence-control observations into a predeclared length band comparable with the
> authoritative REQUIRED observations while preserving the same underlying settled safety state.

**Prohibitions:**

- do not modify HS-A1 or HS-E1;
- do not pad frozen historical REQUIRED material;
- do not truncate a human-approved silence row after adjudication merely to hit a length target;
- do not use filler text whose sole purpose is class camouflage.

**Required order of operations:** author the final silence-control wording **first**, within the
frozen length band, and **then** independently human-adjudicate that final exact wording. Adjudicate
the text that will actually be used — not a longer draft that is trimmed afterwards.

**Recommended prospective observation-length design band:**

```
380–440 characters
```

unless a mechanically justified neighbouring band better contains **both** frozen authoritative
REQUIRED observations without revealing class.

**The band's status, recorded so it cannot be mistaken later:** it is an **instrument-control
constraint, NOT a safety-truth criterion.** A row is not more or less true for its length. The band
exists so that class cannot be read off surface form.

*Reference figures, unchanged: the two frozen REQUIRED observations are 402 and 412 characters; the
five §168 candidates ran 559–592, which is why they are class-separable. The recommended band
contains both frozen rows.*

---

## What remains open

```
THE 12 VERIFIER-v3 BINDING DISPOSITIONS — PRODUCT_OWNER_DISPOSITIONS_REQUIRED
```

No count over them may be computed while any is `null`, and none has been assigned by any model.
