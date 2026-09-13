# Safety InSite — AI and Third-Party Provider Disclosure

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED
>
> Authored at §269 by engineering. Not reviewed by an attorney. Customer-facing AI disclosure
> obligations vary by jurisdiction and are changing; `project-docs/current/CAPABILITY-REGISTER.md` classifies
> this whole subject `LEGAL_REVIEW_REQUIRED`, and item 17 of its launch gate is `NOT_YET_EXECUTED`.

---

## The disclosure, in one paragraph

HazLenz is Safety InSite's governed safety-analysis system. Part of it is ours: the deterministic
analysis engine, the governed regulatory knowledge base, the validation and admission rules, and the
evidence and authority model. Part of it is not: **the semantic reasoning is performed by a hosted
third-party AI model, operated by Anthropic, which we call over the internet.** When you request an
Expert HazLenz analysis, the text of your observation and its analysis context are transmitted to
that provider. We did not build, train or host that model.

## What we are not claiming

Stated explicitly, because these are the claims that would be wrong:

* We have **not** trained a foundation model. We have trained no model at all.
* HazLenz is **not** fully local, on-device, or free of third-party AI.
* There **is** third-party AI involvement in Expert analysis, and it is material.
* "HazLenz AI" refers to a governed system built around a third-party model, not to a model we own.

## What the model is permitted to do, and what it is not

This is the part that matters most, and it is enforced in code rather than promised in prose.

**The provider may:**

* read the observation text and its analysis context;
* propose hazard identifications, regulatory reasoning, recommended controls and actions;
* state that a condition is unresolved and that a person must decide.

**The provider may not, and structurally cannot:**

* finalise a finding — Expert output is advisory by type and cannot become authoritative;
* certify a workplace, task or condition as safe;
* decide whether its own output is admissible — every response is validated against our rules by our
  code, and a response that does not satisfy them is refused rather than repaired;
* determine its own authority — refusal, admission and the authority boundary are deterministic code
  we control;
* affect the deterministic HazLenz analysis, which runs and produces findings whether or not the
  provider answers at all.

The provider supplies semantic judgement. Everything about whether that judgement is admitted, and
what consequence follows, is ours.

## What is transmitted

* The text of the observation being analysed, and the analysis context accompanying it.
* No credentials, no account passwords, no payment data.
* Photographs and attached documents are **not** transmitted to the AI provider in the beta.

If your observation text names an individual or describes their conduct, that text is transmitted.
The product cannot detect this. Please record only what your organisation permits you to disclose to
a third-party processor.

## Provider data handling — what we have and have not verified

We have **not** completed a contractual review of the provider's data retention, data use and
training terms. That is item 8 of the launch gate in `project-docs/current/CAPABILITY-REGISTER.md` and it is
`NOT_YET_EXECUTED`.

Accordingly:

* **We do not claim that the provider retains nothing.** We have not verified it, and §269 forbids
  asserting a zero-retention posture we cannot evidence.
* **We do not send your content to the provider for training,** and we have configured nothing that
  would. What the provider does under its own terms is a separate question, and the honest answer
  today is that we have not confirmed it.
* This review must be completed before the beta ends, and before any commercial release.

## Reliability, stated honestly

The reasoning model is probabilistic. Measured during development:

* It does **not** always return the same analysis for the same input. Two runs of byte-identical
  input returned different verdicts.
* Its output was degenerate in 4 of 48 development executions.
* Our formal evaluation of the advisory layer **failed and was not accepted**.

This is why the architecture treats provider output as advisory, validates it before admitting it,
and routes decision-critical unknowns to a person. The reliability limits are the reason for the
design, not an afterthought to it.

## The one control that overrides everything

Expert analysis can be disabled entirely by configuration, independently of whether a provider
credential exists. When it is off, no observation reaches any provider, and deterministic HazLenz
continues to work normally. At the start of the controlled beta this switch is set to **off**, and
enabling it is a deliberate, recorded decision.

## Direction of travel

It is a recorded product goal to reduce dependence on third-party reasoning providers over time
while maintaining or improving demonstrated safety performance. The architecture is built for
provider replaceability: the core names no vendor, model or endpoint. That is a goal and a design
property. It is not a claim that the dependency is small today — today it is total for the Expert
layer.

## Contact

Questions about this disclosure: `[CONTACT EMAIL]`
