# Safety InSite — Controlled Beta Legal & Policy Minimum

**CLASSIFICATION FOR EVERY ARTIFACT IN THIS DIRECTORY:**

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED

Authored at §269. No attorney has reviewed, approved, or been engaged on any document here. Nothing
in this directory is legal advice, and no document here may be represented to any recipient as
attorney-approved. `project-docs/current/CAPABILITY-REGISTER.md` records
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
| 1 | Controlled Beta Terms | [`CONTROLLED-BETA-TERMS.md`](CONTROLLED-BETA-TERMS.md) | invitation-only nature, permitted use, allocation of responsibility, availability, termination |
| 2 | Beta Privacy Notice | [`BETA-PRIVACY-NOTICE.md`](BETA-PRIVACY-NOTICE.md) | what is collected, why, who processes it, retention, choices |
| 3 | AI / third-party provider disclosure | [`AI-PROVIDER-DISCLOSURE.md`](AI-PROVIDER-DISCLOSURE.md) | that a hosted third-party model performs semantic reasoning, and what it is and is not permitted to decide |
| 4 | Safety responsibility statement | [`SAFETY-RESPONSIBILITY.md`](SAFETY-RESPONSIBILITY.md) | the qualified-professional boundary the architecture actually enforces |
| 5 | Product limitations | [`PRODUCT-LIMITATIONS.md`](PRODUCT-LIMITATIONS.md) | measured, specific limitations — not a generic disclaimer |
| 6 | Feedback & improvement boundary | [`FEEDBACK-AND-DATA-USE.md`](FEEDBACK-AND-DATA-USE.md) | what may and may not be done with beta content; the no-training commitment |
| 7 | Beta claims guardrails | [`CLAIMS-GUARDRAILS.md`](CLAIMS-GUARDRAILS.md) | language that may and may not be used while the beta runs |

Artifacts 4, 5 and 7 are internally consistent with `project-docs/current/CAPABILITY-REGISTER.md`, which remains
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

## §271 — contracting entity policy

**Confirmed by the product owner at §271: no legal operating entity exists.** Counsel has not been
engaged.

The standing policy, recorded so it is not quietly eroded later:

> The controlled beta does **not** default to an informal individual or sole-proprietor contracting
> arrangement. The intended legal operating entity is established **before** outside beta
> participants are admitted — unless qualified counsel specifically advises that an individual
> arrangement is appropriate.

Engineering has no view on which way that should go. What engineering can say is that the exception
has to be asked for explicitly rather than arrived at by default, which is why it is question 1 of
the counsel packet rather than an assumption anywhere in these documents.

Governing law must be **confirmed by counsel**, not inferred from the formation state or from the
product owner's residence.

## Placeholders — UNRESOLVED, and blocking

These are unknown to engineering and were deliberately **not invented**. §270 searched the
repository and found no legal entity, no registered address and no business contact address — only
development and test artefacts; §271 confirmed with the product owner that none exists.

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
[`COUNSEL-REVIEW-PACKET.md`](COUNSEL-REVIEW-PACKET.md) question 1.

## The counsel review packet

[`COUNSEL-REVIEW-PACKET.md`](COUNSEL-REVIEW-PACKET.md) — prepared at §270. It bundles all seven
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

---

## The legal handoff checklist

Added at **§278**, when the local product baseline was accepted and frozen. Engineering has
stopped; this is the complete list of what the **product owner** must provide or obtain before
engineering release work can resume. Nothing on it is engineering work, and no amount of
engineering shortens it.

Re-confirmed against the documents themselves at §278: all seven artifacts still carry
`LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`, and all five placeholders are still unresolved.

### A. Decisions and facts only the product owner can supply

| # | what | resolves | why it blocks |
|---|---|---|---|
| A1 | **Establish the contracting entity** — or obtain counsel's specific advice that an individual arrangement is appropriate for this cohort | `[LEGAL ENTITY]`, `[ENTITY ADDRESS]` | Counsel review cannot meaningfully begin without knowing who contracts. Who controls the data and which law governs both follow from it. The §271 policy is that this is **not** defaulted to an informal individual arrangement; the exception must be asked for, not arrived at |
| A2 | **A monitored contact address** for privacy and support | `[CONTACT EMAIL]` | A privacy notice naming an unmonitored or non-existent address is not a defensible notice |
| A3 | **The beta's start and intended end date** | `[BETA TERM]` | Terms and the retention representations both reference it |
| A4 | **Confirm the participant cohort** — 3–5 named U.S. safety professionals across 1–2 organisations | scope of the counsel review | The review is deliberately scoped to this cohort. A larger or non-U.S. cohort changes the documents: §270 recorded U.S.-only, and admitting any non-U.S. participant requires a transfer mechanism and jurisdiction-specific rights disclosures, neither of which exists |
| A5 | **Decide D-030** — narrowly governed electrical coverage later (option A), or explicit limitation/disclosure during the initial beta (option B) | `PRODUCT-LIMITATIONS.md` | **Sequencing matters.** If option B is chosen, `PRODUCT-LIMITATIONS.md` gains a limitation entry and must change **before** counsel review, not after — otherwise counsel reviews a limitations document that omits a known limitation. See `../current/CAPABILITY-REGISTER.md` section B |

### B. Obtained from counsel

| # | what | note |
|---|---|---|
| B1 | **Engage counsel** and deliver [`COUNSEL-REVIEW-PACKET.md`](COUNSEL-REVIEW-PACKET.md) | The packet is prepared and complete: all seven artifacts, a one-page architecture and data-flow summary, the verified service-provider list, and twelve questions ordered by how much each changes the documents |
| B2 | **Governing law and venue**, determined by counsel | `[GOVERNING LAW]`. Engineering must not infer this from the formation state or from the product owner's residence, and has not |
| B3 | **Answers to the twelve packet questions** | Two are structural rather than editorial: question 2 (liability allocation) and question 3 (indemnity) correspond to Terms clause 11, which is **deliberately undrafted** — there is no draft language for counsel to edit, by design |
| B4 | **Counsel approval of all seven artifacts**, reclassifying each from `LEGAL COUNSEL REVIEW REQUIRED BEFORE BETA` | Engineering does not change these classifications. Only counsel's decision does |
| B5 | **The signed beta acknowledgement instrument**, for out-of-product execution | The §269 Option A decision. Each participant returns a signed acknowledgement **before** their account is created, and the signed copies are retained outside the product |

### C. What engineering will do once A and B are complete

Nothing further is owed before then. On clearance, the work is **execution of an existing
procedure**, not development:
[`../current/CONTROLLED-RELEASE-HANDOFF.md`](../current/CONTROLLED-RELEASE-HANDOFF.md),
fifteen steps, currently blocked at Step 1.

### What engineering deliberately did NOT do at §278

No substantive legal language was edited. No legal fact was inferred. No governing law was
selected. No document was marked approved, and no classification was changed. The registration
checkbox at `frontend-next/app/register/page.tsx:79` remains client-side only and **must not**
be relied upon as evidence of acceptance — there is no record anywhere in the system that any
user accepted anything, which is precisely why Option A exists.
