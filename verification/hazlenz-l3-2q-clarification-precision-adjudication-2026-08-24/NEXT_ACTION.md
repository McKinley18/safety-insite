# L3-2q — what is settled, and the exact next phase `NOT EXECUTED`

## Settled

| question | answer |
|---|---|
| Why does HazLenz ask? | `L3-INV-06` — clarification **only** at a decision boundary. It says *only*, not *whenever*: it is a **boundary rule, not a rate**, and it points at precision, not recall |
| Which clarification failure is safety-critical? | **Neither rate is, on its own.** A *boundary breach* is, and it is refused deterministically before anyone sees it. Silent uncertainty is caught by `L3-INV-04`'s no-default-ACTIVE gate, which **is** on §29.8's hard-zero list |
| Did a numeric precision threshold exist? | **YES — 100%,** in the `L3-3` entry gate on **fresh sealed** evidence. **L3-2p said no; that was a misreading of `100/100`, corrected here as `D-78`.** It has never been a provider-eligibility criterion |
| Is `B08` a MUST-NOT-ASK violation? | **NO.** Its pole is `REGRESSION_ACTIVE`; the named `CLARIFICATION_MUST_NOT_ASK` pole has exactly two members and `B08` is neither. The deterministic gate **accepted** the question |
| Did `B08` cost anything? | **Nothing measurable.** Disposition unchanged, false ACTIVE 0/11, HC 13/13, nothing deleted, and **5 and 4 hazards delivered where every other provider returned 2** |
| Is `claude-sonnet-5` eligible? | **YES** — `P-02R` + `P-08R` + `P-09R`, plus `P-05`/`P-06`/`P-07`/`P-12` |
| Can the sealed run be authorized? | **NO.** Five non-engineering prerequisites remain |

## The five prerequisites — every one is a user decision

1. **Confirm the organization behind `ANTHROPIC_API_KEY` is under the Commercial Terms.** The binding
   one. `P-05` binds the **acceptance run**, not only production: a provider that trains on submitted
   data **contaminates the single-use corpus permanently**, and that is unrecoverable. Not verifiable
   from the API.
2. **Request ZDR** — makes item 1 robust rather than contractual-only.
3. **Decide name-level redaction, or explicitly accept narrative PII egress** (§45.5). The sealed
   corpus is novel, customer-shaped observation text; the pattern redactor cannot catch a personal
   name or an informal site reference.
4. **Explicitly accept §45.4's digest ceiling** — a pinned snapshot label is still not a content hash.
5. **Re-probe credential presence and callability.** `ANTHROPIC_API_KEY` is **absent from this
   environment right now**.

## Then, and only then

**Authorize the single-use sealed acceptance run** on `claude-sonnet-5` through the existing
verification harness — a separate explicit decision under §29.8.

> **Eligibility is permission to sit the exam, not a prediction of passing.** The `L3-3` entry gate —
> clarification **precision AND recall both 100%** on fresh sealed evidence, and zero high-consequence
> misses — is **unchanged**. `claude-sonnet-5` measured **5/6** precision on diagnostic material, so
> it may sit the run and **still fail the gate**. That outcome would be the process working.

## Separately, and not a sealed-acceptance prerequisite

**Build the hosted production adapter** behind `HazLenzReasoningProvider`. None exists (§45.6); the
L3-2o shim **must not become it**. Required before any customer use, not before the exam.

## Explicitly NOT recommended

* Re-running Anthropic, Gemini or qwen for any reason.
* Tuning effort, prompt, schema or clarification behaviour.
* **Altering `B08`.** It is frozen cohort material and the adjudication rests on it as-is.
* Opening the sealed corpus for anything short of the authorized acceptance run.
* Any further HazLenz engineering phase — `L3-2l` closed the last engineering question, and L3-2p and
  L3-2q each repaired a measurement defect in a qualification requirement, additively.
