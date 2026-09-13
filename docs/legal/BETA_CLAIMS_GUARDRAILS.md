# Safety InSite — Beta Claims Guardrails

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED
>
> Authored at §269 by engineering. Not reviewed by an attorney.

**This document does not replace `docs/PRODUCT-CLAIMS-REGISTER.md`,** which remains the
authoritative claims inventory and the source of every classification below. This is the operational
subset: what may and may not be said *while the controlled beta runs*, in a form short enough to
check a sentence against.

The standing principle, adopted §156 and unchanged:

> **Public claims must describe the capability actually proven and deployed, not the aspirational
> HazLenz architecture.**

---

## Prohibited: remove before beta, wherever it appears

Any language equivalent to the following must not be used in product copy, the beta invitation,
onboarding material, email, or conversation with participants:

| prohibited | why |
|---|---|
| "always accurate", "highly accurate", any accuracy percentage | the formal evaluation failed and was not accepted; no rate is supportable |
| "catches every hazard", "identifies all hazards", "comprehensive hazard detection" | measured coverage was 5 of 9 truth families |
| "guarantees compliance", "ensures compliance", "OSHA compliant" | an outcome guarantee about a regulatory obligation; software cannot be OSHA compliant |
| "autonomous", "automatic safety approval", "self-certifying" | the architecture is advisory-with-human-review by construction |
| "replaces safety professionals", "no safety expert needed", "your virtual safety expert" | the highest-liability claim class in the register |
| "definitive", "authoritative", "legal determination", "regulatory determination" | Expert output is advisory by type and cannot become authoritative |
| "learns from your data", "self-learning", "gets smarter as you use it" | nothing in the system learns from customer data |
| "our AI", "proprietary AI model", "we built the AI" (unqualified) | the reasoning model is a hosted third-party model |
| "fully local", "on-device", "your data never leaves" | observation text is transmitted to a third-party provider |
| "consistent", "repeatable", "reproducible analysis" | measured draw instability on byte-identical input |
| "real-time monitoring", "continuous monitoring" | the product analyses submitted observations; it monitors nothing |

## Permitted, as written

These are supportable today and already reflect the architecture:

* "HazLenz is Safety InSite's governed safety-analysis system."
* "HazLenz does not auto-finalise findings."
* "HazLenz does not replace qualified safety professionals."
* "Decision support for qualified safety professionals."
* "AI-powered" — literally true and claims no ownership of the model.
* "Surfaces conditions it cannot resolve, and asks a person to decide."
* "Analyses observations against a governed knowledge base of standards."
* "Records the reasoning basis for every finding, so a reviewer can evaluate it."
* "Runs a deterministic analysis that works whether or not any AI provider responds."

## Permitted only with qualification

| claim | required qualification |
|---|---|
| "proprietary" | attach it to the governed knowledge base, the deterministic engine, the scorers or the evaluation architecture — which are ours. Never to the reasoning model, which is not |
| "HazLenz AI" | the register's sharpest item. Permitted in the beta only where the [AI disclosure](AI_AND_THIRD_PARTY_PROVIDER_DISCLOSURE.md) is available to the reader. It reads naturally as an AI we built, and we did not |
| "real-time" | only for interactive workflow responsiveness, never implying instantaneous or continuous. Measured median 15.7s, up to 38.2s |
| "current standards" / "regulatory-current" | must state the corpus date and its scope in the same copy |
| "expert" | "Expert HazLenz" is an internal layer name and is fine internally. Telling a participant they are getting a safety expert is a different claim and is prohibited |

## The test to apply

Before any sentence goes to a beta participant, ask:

1. **Is it true of the deployed system, today?** Not of the architecture, not of the roadmap.
2. **Would the measured evidence survive someone checking it?** If the number came from a small
   development set, it cannot be stated as a product characteristic.
3. **Does it imply a guarantee about a safety or regulatory outcome?** If so, it is prohibited
   regardless of how it is hedged.
4. **Does it imply we own the reasoning model?** If so, qualify it or drop it.

If any answer is uncertain, the sentence does not ship. The beta cohort is five people; there is no
volume of copy here worth getting wrong.

## Standing status

`FINAL_LEGAL_IP_LAUNCH_GATE = NOT_YET_EXECUTED`. Trademark clearance for "Safety InSite" and
"HazLenz" has not been performed, customer-facing AI disclosure has not been legally cleared, and
marketing claims are inventoried but not cleared. **No broad marketing work is authorised**, and
§269 explicitly forbids beginning it.
