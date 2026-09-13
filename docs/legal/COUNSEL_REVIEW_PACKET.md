# Safety InSite — Counsel Review Packet

**Prepared §270, 2026-09-13, by engineering. Not legal advice.**

**What is being asked for:** a **bounded** review, scoped to one thing — letting **3–5 named,
individually invited, United States–based safety professionals across 1–2 organisations** use a
pre-release product that puts real workplace safety information into third-party AI analysis.

**What is NOT being asked for**, and should not be drafted now: enterprise customer agreements,
global commercialisation terms, full public-launch terms, or future subscription scenarios. Those
are later work and are out of scope for this review.

---

## 0. BLOCKING — no legal operating entity exists

**Confirmed by the product owner at §271: no legal operating entity for Safety InSite has been
formed.** This is not an unknown that engineering failed to look up; it is a settled fact about the
business.

**The product owner's standing policy, recorded at §271:**

> The controlled beta is **not** to default to an informal individual or sole-proprietor contracting
> arrangement. The intended legal operating entity is to be established before outside beta
> participants are admitted — **unless qualified counsel specifically advises that an individual
> arrangement is appropriate for a cohort of this size and character.**

**That exception is question 1 below, and it is the first thing counsel should answer**, because the
answer determines whether entity formation blocks the beta or merely precedes commercial launch.
Everything else in this packet is downstream of it.

**Engineering could not resolve five placeholders, and did not invent them.** Every document in this
packet still contains them:

| placeholder | needed for |
|---|---|
| `[LEGAL ENTITY]` | the party that contracts with participants and controls their data |
| `[ENTITY ADDRESS]` | the registered address in the Terms and Privacy Notice |
| `[CONTACT EMAIL]` | the monitored privacy and support contact |
| `[GOVERNING LAW]` | governing law and venue |
| `[BETA TERM]` | the beta's start and intended end date |

Nothing in the repository records a legal entity, a registered address, or a business contact
address. The only addresses present are development and test artefacts.

**A counsel review cannot meaningfully begin until the contracting entity is decided**, because who
contracts, who controls the data, and which state's law governs all follow from it. If no entity has
been formed, that is itself the first question for counsel: whether the beta may be run by an
individual, and what that means for liability.

This is recorded in `verification/current/BETA-BLOCKERS.json` as
`LEGAL_ENTITY_AND_CONTRACTING_PARTY_UNRESOLVED`.

---

## 1–7. The documents for review

| # | document | what it does |
|---|---|---|
| 1 | [`CONTROLLED_BETA_TERMS.md`](CONTROLLED_BETA_TERMS.md) | invitation-only nature, permitted use, allocation of responsibility, availability, termination |
| 2 | [`BETA_PRIVACY_NOTICE.md`](BETA_PRIVACY_NOTICE.md) | categories collected, purposes, service providers, retention, choices, US-only processing |
| 3 | [`AI_AND_THIRD_PARTY_PROVIDER_DISCLOSURE.md`](AI_AND_THIRD_PARTY_PROVIDER_DISCLOSURE.md) | that a hosted third-party model performs the reasoning, and what it may and may not decide |
| 4 | [`SAFETY_RESPONSIBILITY_STATEMENT.md`](SAFETY_RESPONSIBILITY_STATEMENT.md) | the qualified-professional boundary the architecture enforces |
| 5 | [`PRODUCT_LIMITATIONS.md`](PRODUCT_LIMITATIONS.md) | measured limitations, with sources — not generic disclaimer text |
| 6 | [`FEEDBACK_AND_IMPROVEMENT_BOUNDARY.md`](FEEDBACK_AND_IMPROVEMENT_BOUNDARY.md) | what may and may not be done with beta content; the no-training commitment |
| 7 | [`BETA_CLAIMS_GUARDRAILS.md`](BETA_CLAIMS_GUARDRAILS.md) | language permitted and prohibited while the beta runs |

All seven are classified **INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED**.

---

## 8. Architecture and data flow, in one page

**What the product is.** Workplace safety inspection software. A safety professional records an
observation about a workplace condition. The system analyses it, identifies potential hazards,
reasons against a governed corpus of regulatory standards, and recommends controls.

**Two analysis paths, and the distinction matters legally:**

* **Deterministic HazLenz** — our own engine and our own governed knowledge base. No third party.
  Runs regardless of whether any AI provider responds.
* **Expert HazLenz** — the semantic reasoning is performed by a **hosted third-party AI model**
  (Anthropic, `claude-sonnet-5`). We did not build, train or host it.

**The data flow for an Expert analysis:**

```
participant types an observation (free text, their own words)
  → stored in our database (Neon, US)
  → observation text + analysis context transmitted to Anthropic over the internet
  → model returns a proposed analysis
  → OUR deterministic code validates it against our admission rules
      → fails validation  → REFUSED (nothing is shown as a finding)
      → passes validation → admitted as ADVISORY output, never authoritative
  → a qualified person reviews, confirms or overrides it, with rationale recorded
  → finding may then be relied upon
```

**Four properties counsel should know are enforced in code, not merely promised:**

1. Expert output is **advisory by type** and structurally cannot become an authoritative finding.
2. Where the analysis recognises a fact it cannot establish that controls the outcome, it **emits
   that unresolved fact and requires a human to settle it** rather than guessing.
3. The system **fails closed** — provider unavailable, validation unsatisfied, spend ceiling reached,
   or Expert disabled all produce an explicit refusal, never a reassuring empty result.
4. **Nothing learns from customer data.** The knowledge base changes only by an explicit reviewed
   governance process.

**What is NOT sent to the AI provider:** photographs, attached documents, credentials, passwords,
payment data.

**The sensitivity that matters most:** observation text is free-form and written by the participant.
It can name individual workers, describe their conduct, and record injuries or unsafe acts. The
product cannot detect this and does not prevent it. That text is what gets transmitted to the
third-party provider.

---

## 9. Service providers relevant to the beta

All verified against the live production configuration at §269–§270. All process in the United
States.

| provider | role | what reaches them |
|---|---|---|
| **Anthropic** | AI model provider (`claude-sonnet-5`) | observation text and analysis context for Expert analyses |
| **Render** | backend hosting (US, Oregon) | all data in transit; diagnostic logs |
| **Neon** | managed PostgreSQL (AWS, US East) | all stored records other than files |
| **Cloudflare R2** | object storage | photographs, documents, generated reports |
| **Vercel** | frontend hosting | requests to the web interface |
| **Resend** | transactional email | participant email address, for password reset |
| **Stripe** | payments | billing identifiers; card data goes to Stripe directly, never to us |

**Not yet done, and material to several questions below:** we have **not** completed a contractual
review of Anthropic's data retention, data use and training terms. The drafts therefore decline to
promise provider zero-retention. Whether that is sufficient disclosure is question 7.

---

## 10. Questions requiring a counsel decision

Ordered by how much they change the documents.

**Contracting and liability**

1. **Who contracts — and must an entity be formed first?** No entity exists (§271). The product
   owner's policy is to form one before admitting participants, with a single stated exception:
   counsel advising that an individual arrangement is appropriate here. **So the question is not
   "may an individual do this" in the abstract — it is whether this specific cohort (3–5 named,
   individually invited U.S. safety professionals, no fee charged, invitation-only, software that
   informs workplace safety decisions) justifies the exception, and what personal liability exposure
   accepting it would create.** If it does not, entity formation and its state of organisation are
   the first actions, and question 4 depends on the answer. See section 0 — this blocks everything
   else in this packet.
2. **Liability allocation.** Clause 11 of the Terms is deliberately undrafted. What cap, exclusions
   and carve-outs are appropriate where the product informs workplace safety decisions and a
   foreseeable failure mode is a hazard that goes unidentified?
3. **Indemnity.** Is any indemnity appropriate in either direction for a free, invitation-only beta?
4. **Governing law and venue**, given the participants' states.

**Safety exposure — the highest-consequence group**

5. **Is the safety-responsibility language sufficient** to establish that the qualified professional,
   not the software, is accountable? Document 4 describes an architecture that actively routes
   decisions to humans; is describing it accurately enough, or is more explicit contractual
   allocation required?
6. **Is the "silence is not clearance" framing adequate?** A participant could read an analysis that
   identifies no hazard as evidence there is none. The product says otherwise and the documents say
   otherwise. Is that sufficient?

**Data and AI**

7. **Third-party AI disclosure.** Is document 3 sufficient given that (a) free-text observations
   that may name individuals are transmitted to Anthropic, and (b) we have not reviewed Anthropic's
   retention terms and therefore promise nothing about them? Should the beta be blocked until that
   contractual review is complete?
8. **Product-improvement data rights.** Document 6 prohibits training on customer content and
   permits aggregate statistics only. Is that boundary drafted tightly enough, and is the feedback
   licence in Terms clause 8 appropriately separated from operational content?
9. **Retention and deletion representations.** There is **no automated deletion and no lifecycle
   rule**. Deletion is performed manually on request, and only the uploading user can delete a file
   through the product. The Privacy Notice states this plainly rather than implying automation.
   Is stating it sufficient, or does something need to change before participants are admitted?
10. **Confidentiality.** Is Terms clause 9 appropriate in both directions?

**Claims and process**

11. **Objective product claims.** Document 7 prohibits accuracy, completeness, compliance and
    professional-replacement claims, grounded in measured results — including that the formal
    evaluation of the advisory layer **failed and was not accepted**, and that identical input
    produced different verdicts. Are the permitted claims defensible as written?
12. **Acceptance mechanism.** The product owner has chosen a signed out-of-product agreement rather
    than in-product click-through, because the existing registration checkbox is client-side only
    and is never transmitted or persisted — there is no record anywhere that any user accepted
    anything. Is a signed agreement before account creation sufficient for this cohort, and does
    counsel require an in-product mechanism instead?

---

## What engineering attests, and what it does not

Engineering attests that these documents describe the system **as built and as verified live** at
§269 and §270 — the service-provider list is drawn from the live production configuration, the
limitations are measured with sources named, and the enforced architectural properties are real.

Engineering does **not** attest that the documents are legally sufficient, and no one here is
qualified to. That is the whole reason for this review.
