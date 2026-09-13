# Safety InSite — Safety Responsibility Statement

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED
>
> Authored at §269 by engineering. Not reviewed by an attorney. `project-docs/current/CAPABILITY-REGISTER.md`
> records that anything implying replacement of a qualified safety professional is
> `NOT_CURRENTLY_SUPPORTABLE` **and** the highest-liability claim class in the product.

---

## The boundary

**HazLenz analyses. A qualified person decides.**

That sentence is the whole statement. Everything below explains what it means in practice and shows
that the software is built to hold it, rather than merely asserting it.

## What HazLenz does

* Analyses the workplace observations you record.
* Identifies potential hazards in what you described.
* Surfaces conditions it cannot resolve, and says what it could not determine.
* Supports regulatory reasoning against a governed knowledge base of standards.
* Recommends controls and corrective actions for your consideration.
* Records the basis for what it concluded, so a reviewer can evaluate the reasoning and not only the
  answer.

## What HazLenz does not do

* It does **not** certify, approve or declare any workplace, task, area or condition to be safe.
* It does **not** replace a competent person, a qualified person, or any other role that law,
  regulation or your own safety management system assigns to a human being.
* It does **not** guarantee compliance with OSHA, MSHA or any other regulatory requirement. Software
  is not "OSHA compliant"; a workplace may be, and determining that is a person's job.
* It does **not** remove your obligation to exercise professional judgement.
* It does **not** make decisions. It produces input to yours.

## How the software enforces this, not just states it

These are architectural properties, verified through the product's own validation record:

1. **Expert analysis output is advisory by type.** It is structurally incapable of becoming an
   authoritative finding. This is not a policy that could be relaxed by configuration; it is how the
   type system and the admission rules are built.

2. **Decision-critical unknowns are escalated, not guessed.** When the analysis recognises that some
   fact it cannot establish controls the outcome, it emits that unresolved fact explicitly and
   requires a person to settle it. An unresolved condition is a deliberate output, not a failure.

3. **Human confirmation is required before an affected finding is relied upon.** The product records
   who confirmed or overrode what, the rationale they gave, and the analysis version it applied to.

4. **The system fails closed.** If the analysis cannot be performed — provider unavailable,
   validation not satisfied, spending ceiling reached, Expert analysis disabled — the product
   refuses and says so. It does not return a reassuring empty result.

5. **Deterministic analysis is independent.** The governed deterministic engine runs and produces
   findings regardless of whether any AI provider responds.

## What this means for you, concretely

* **A finding is a prompt to look, not a conclusion.** Review it against what you actually observed.
* **Silence is not clearance.** If HazLenz did not identify a hazard, that is not evidence there
  isn't one. It analysed the words you wrote, not the workplace.
* **An unresolved condition is a question you must answer.** It is the system telling you that
  something it could not determine controls the answer. Treating it as "nothing found" inverts its
  meaning.
* **A refusal means no analysis happened.** It carries no safety information at all.
* **You remain responsible.** For the inspection, for the judgement, for the decision, and for the
  workplace.

## Keeping this in proportion

None of the above means the product is not useful. It means the product is honest about which part
of the work is yours. HazLenz is built to make a competent safety professional faster and better
informed — to surface standards they might not have recalled, to catch what a long day might have
let slip past, and to keep a reviewable record of why a conclusion was reached. That is a
substantial thing to be, and it is what the product actually is.

What it is not, and is not designed to become, is the person accountable for the decision.
