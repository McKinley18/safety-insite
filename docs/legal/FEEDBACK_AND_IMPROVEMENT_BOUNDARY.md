# Safety InSite — Feedback and Product-Improvement Boundary

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED
>
> Authored at §269 by engineering. Not reviewed by an attorney.

This document states what may and may not be done with information generated during the controlled
beta. It is referenced by, and forms part of, the Controlled Beta Terms and the Beta Privacy Notice.

---

## The principle

> **Customer operational content is not automatically authorised for any purpose beyond operating
> the service, merely because it was submitted.**

Submitting an observation buys you an analysis. It does not license the observation.

## What the product already captures

The beta records a genuinely valuable chain for each analysed observation:

```
observation  →  HazLenz result  →  human confirmation or override  →  rationale  →  version provenance
```

That chain is the most useful evidence a beta can produce: it shows not just what the system
concluded, but where a qualified professional disagreed and why. It exists for product quality, and
the whole point of this document is that its existence does not by itself authorise its use.

## What is permitted

| use | permitted | notes |
|---|---|---|
| Operating the service for you | **yes** | this is what the data is for |
| Investigating a failure you reported | **yes** | including reading the specific records involved |
| Reading confirmations, overrides and rationales to find where analysis is wrong | **yes** | reviewed by our team, internally |
| Aggregate, non-identifying quality measurement (how often findings are overridden, refusal rates, coverage gaps) | **yes** | no operational content leaves in the output |
| Using volunteered feedback about the product | **yes** | your commentary, under the licence in the Beta Terms clause 8 |
| Improving the governed knowledge base after a correction reveals a gap | **yes, with review** | the change is authored and reviewed by us, not copied from your content |

## What is prohibited

| use | permitted |
|---|---|
| Training any third-party AI model on your content | **no** |
| Training any future model of ours on your content | **no** |
| Fine-tuning, embedding or otherwise fitting a model to your content | **no** |
| Automatic modification of analysis behaviour from your corrections | **no** |
| Sharing your operational content with anyone outside the service providers listed in the Privacy Notice | **no** |
| Publishing your content, or anything identifying you or your organisation, in marketing, case studies or benchmarks | **no, without your written agreement** |
| Reusing your content as evaluation data outside the beta without your agreement | **no** |

## The improvement workflow, in full

The only route by which anything learned in the beta changes the product:

```
feedback or correction
  →  human review by our team
  →  a candidate product improvement is authored by us
  →  offline regression and evaluation against our own test corpus
  →  approved release
```

**There is no automatic self-modification anywhere in this loop.** Nothing you do in the product
changes how the product analyses anything, for you or for anyone else. Every change is authored by a
person, reviewed by a person, evaluated offline, and released deliberately.

This is also a factual statement about the system as built: nothing in Safety InSite learns from
customer data. The governed knowledge base changes only through an explicit, reviewed governance
process. `docs/PRODUCT-CLAIMS-REGISTER.md` classifies any claim that the product "learns" as
`NOT_CURRENTLY_SUPPORTABLE`, and that cuts both ways — it is a limitation on our marketing and a
protection for your data.

## De-identified and aggregated use

Where we want to measure product quality across the beta, we use aggregate statistics — override
rates, refusal rates, coverage gaps, latency. These are computed from your records and contain no
operational content, no observation text, no site identity and no personal data in the output.

We are drawing the boundary at **aggregate statistics**, not at "de-identified content". Free-text
safety observations are difficult to de-identify reliably: they describe specific places, tasks and
incidents, and a stripped name does not make an observation anonymous. We are therefore not
proposing to use de-identified observation text for anything, because we are not confident the
de-identification would hold.

## The provider limit, restated

Our commitments cover what **we** do. Observation text submitted for Expert analysis is transmitted
to a third-party AI provider and is then subject to that provider's terms. We have not completed a
contractual review of those terms — launch gate item 8, `NOT_YET_EXECUTED` — and we therefore do not
promise provider zero-retention. See the
[AI disclosure](AI_AND_THIRD_PARTY_PROVIDER_DISCLOSURE.md).

Completing that review is a prerequisite for commercial release and should be completed during the
beta.

## Changing this boundary

This boundary may only be widened with the affected participant's specific, written, informed
agreement. Continued use of the service is not agreement, and a change to the Terms does not
retroactively license content already submitted.
