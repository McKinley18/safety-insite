# Safety InSite — Controlled Beta Legal & Policy Minimum

**CLASSIFICATION FOR EVERY ARTIFACT IN THIS DIRECTORY:**

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED

Authored at §269. No attorney has reviewed, approved, or been engaged on any document here. Nothing
in this directory is legal advice, and no document here may be represented to any recipient as
attorney-approved. `docs/PRODUCT-CLAIMS-REGISTER.md` records
`FINAL_LEGAL_IP_LAUNCH_GATE = NOT_YET_EXECUTED`, and §269 does not change that.

These drafts exist because §266 found that no Terms, no Privacy Notice and no third-party model
disclosure existed at all, while the product's stated beta purpose is to put real workplace safety
information from real safety professionals into the system. The minimum defensible position before
that happens is that the people doing it have been told, in writing, what the product does, what it
does not do, what happens to their information, and that a third-party AI provider is involved.

---

## The seven artifacts

| # | artifact | file | covers |
|---|---|---|---|
| 1 | Controlled Beta Terms | [`CONTROLLED_BETA_TERMS.md`](CONTROLLED_BETA_TERMS.md) | invitation-only nature, permitted use, allocation of responsibility, availability, termination |
| 2 | Beta Privacy Notice | [`BETA_PRIVACY_NOTICE.md`](BETA_PRIVACY_NOTICE.md) | what is collected, why, who processes it, retention, choices |
| 3 | AI / third-party provider disclosure | [`AI_AND_THIRD_PARTY_PROVIDER_DISCLOSURE.md`](AI_AND_THIRD_PARTY_PROVIDER_DISCLOSURE.md) | that a hosted third-party model performs semantic reasoning, and what it is and is not permitted to decide |
| 4 | Safety responsibility statement | [`SAFETY_RESPONSIBILITY_STATEMENT.md`](SAFETY_RESPONSIBILITY_STATEMENT.md) | the qualified-professional boundary the architecture actually enforces |
| 5 | Product limitations | [`PRODUCT_LIMITATIONS.md`](PRODUCT_LIMITATIONS.md) | measured, specific limitations — not a generic disclaimer |
| 6 | Feedback & improvement boundary | [`FEEDBACK_AND_IMPROVEMENT_BOUNDARY.md`](FEEDBACK_AND_IMPROVEMENT_BOUNDARY.md) | what may and may not be done with beta content; the no-training commitment |
| 7 | Beta claims guardrails | [`BETA_CLAIMS_GUARDRAILS.md`](BETA_CLAIMS_GUARDRAILS.md) | language that may and may not be used while the beta runs |

Artifacts 4, 5 and 7 are internally consistent with `docs/PRODUCT-CLAIMS-REGISTER.md`, which remains
the authoritative claims inventory. This directory does not replace it and does not re-classify any
claim in it.

---

## §270 — geographic scope decision

**The initial controlled beta is UNITED STATES PARTICIPANTS ONLY.** Recorded by the product owner
at §270.

This resolves what the §269 Privacy Notice flagged as a blocking gap. All processing is in the
United States, no transfer out of it occurs for this cohort, and no transfer mechanism is therefore
required. It is **preserved as a future expansion requirement**: admitting any non-U.S. participant
requires a transfer mechanism and jurisdiction-specific rights disclosures, neither of which exists.
Re-check before widening the cohort.

## Placeholders — UNRESOLVED, and blocking

These are unknown to engineering and were deliberately **not invented**. §270 searched the
repository and found no legal entity, no registered address and no business contact address — only
development and test artefacts.

| placeholder | what it needs | status |
|---|---|---|
| `[LEGAL ENTITY]` | the contracting entity's exact registered name and form | **UNRESOLVED** |
| `[ENTITY ADDRESS]` | registered address | **UNRESOLVED** |
| `[CONTACT EMAIL]` | a monitored address for privacy and support contact | **UNRESOLVED** |
| `[GOVERNING LAW]` | governing law and venue | **UNRESOLVED** |
| `[BETA TERM]` | the beta's start and intended end date | **UNRESOLVED** |

A document issued with an unresolved placeholder is not a defensible document, and a counsel review
cannot meaningfully begin without knowing who is contracting — who contracts, who controls the data
and which law governs all follow from it.

Tracked as `LEGAL_ENTITY_AND_CONTRACTING_PARTY_UNRESOLVED` in
`verification/current/BETA-BLOCKERS.json`. If no entity has been formed, whether the beta may be run
by an individual is itself the first question for counsel — see
[`COUNSEL_REVIEW_PACKET.md`](COUNSEL_REVIEW_PACKET.md) question 1.

## The counsel review packet

[`COUNSEL_REVIEW_PACKET.md`](COUNSEL_REVIEW_PACKET.md) — prepared at §270. It bundles all seven
artifacts with a one-page architecture and data-flow summary, the verified service-provider list,
and **twelve specific questions** requiring a counsel decision, ordered by how much each changes the
documents. It scopes the review deliberately: 3–5 named U.S. participants across 1–2 organisations,
not enterprise agreements or public-launch terms.

---

## Beta acknowledgement — the §269 decision

**DECISION: Option A. An out-of-product, signed beta agreement, executed before account creation.
No new in-product consent UI is to be built for this cohort.**

The reasoning, and its limits:

* The cohort is 3–5 named safety professionals across 1–2 organisations, all invited individually.
  Every participant is known, reachable and onboarded by hand. A signed agreement exchanged with the
  invitation reaches 100% of that cohort with certainty that a click-through does not.
* Building in-product acceptance means changing application code and deploying it. §269 forbids
  both, and the smallest defensible mechanism is explicitly preferred.
* **The existing registration checkbox must not be relied upon as evidence of acceptance.** At
  `frontend-next/app/register/page.tsx:79` the `acceptedTerms` checkbox is evaluated client-side
  only. It is never transmitted to the backend and never persisted. There is therefore no record,
  anywhere in the system, that any user ever accepted anything. Treating that control as consent
  evidence would be relying on a record that does not exist.

**What Option A requires in practice, and all of it is required:**

1. Counsel review of these drafts before issue (see the gate below).
2. Each participant receives artifacts 1–4 with their invitation.
3. Each participant returns a signed acknowledgement **before** their account is created.
4. The signed acknowledgements are retained outside the product, by the operator.
5. Account creation is manual and gated on step 3.

**This decision expires with this cohort.** In-product acceptance becomes necessary before any of:
self-service registration is enabled; the cohort grows beyond individually-invited named users; or
any participant outside the originally agreed organisations is admitted. That is a product
requirement, recorded here so it is not rediscovered late.

---

## The counsel gate

§269 requires each artifact to carry one of three classifications. All seven currently carry the
third:

* `INTERNAL BETA DRAFT ACCEPTED FOR CONTROLLED TEST` — not claimed for any artifact.
* `LEGAL COUNSEL APPROVED` — not claimed for any artifact. No counsel has been engaged.
* **`LEGAL COUNSEL REVIEW REQUIRED BEFORE BETA` — the current status of all seven.**

Engineering's position, stated plainly so the product owner can weigh it: items 2, 3 and 4 carry the
highest exposure. A Privacy Notice describing processing that does not occur, an AI disclosure that
understates third-party involvement, or a safety-responsibility statement that a court reads as
narrower than the product's actual behaviour are the three failures that a controlled beta's small
size does not mitigate. Engineering can attest that these drafts describe the system as built and
as verified at §269. Engineering cannot attest that they are legally sufficient, and the difference
between those two statements is the whole reason this gate exists.

**Because material items require counsel approval that has not occurred, the §269 legal P0 remains
OPEN.** It is open on a review dependency, not on a drafting or engineering dependency: the drafts
exist, they are complete, and nothing further is owed by engineering.
