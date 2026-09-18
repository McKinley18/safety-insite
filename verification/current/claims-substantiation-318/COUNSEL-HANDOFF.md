# §318 — CLAIMS AND DISCLOSURE HANDOFF FOR COUNSEL

**Engineering states the facts first.** Counsel is not asked to determine any engineering question
below; every "known limitation" is measured and cited. What counsel is asked is at the end of each
row, and nowhere else.

**Standing context:** FTC *Operation AI Comply* is active into 2026. The closest precedent the
project has identified is *FTC v. Evolv Technologies* (Nov 2024, settled Dec 2024) — an AI
**detection** product barred from unsubstantiated detection claims after failures to detect. HazLenz
is a hazard-detection-adjacent claim surface.

---

### 1. AI provenance and the name "HazLenz AI"

**Proposed factual boundary.** An AI layer exists and is real. The **reasoning model is a hosted
third-party model (Anthropic)**. What Safety InSite built is the governance, the deterministic
engine, the knowledge base, the validation boundary and the evaluation architecture. The
customer-authoritative path is the **deterministic** one and reaches a finding, a citation, a risk
band and a corrective action with **no provider involvement at all**.
**Known limitation.** "HazLenz AI" appears **84 times across 28 surfaces** and reads naturally as an
AI the company built. The AI provider disclosure exists as a document and is **reachable from no
customer surface**.
**Evidence.** `project-docs/legal/AI-PROVIDER-DISCLOSURE.md`; `CAPABILITY-REGISTER.md` §D; §318 term sweep.
**Counsel question.** Does the current usage require a disclosure adjacent to the term, and does any
applicable jurisdiction impose a specific AI-disclosure form or placement?

### 2. Regulatory standards — retrieval versus applicability versus compliance

**Proposed factual boundary.** The product **retrieves and cites** regulatory provisions selected by
governed, code-resident applicability rules, and presents them as **candidates for qualified
review**. It does **not** determine legal applicability and does **not** determine compliance. A
human may settle a named predicate, which changes the product's own confidence label and nothing in
law.
**Known limitation.** Citation selection is **independent of the regulatory corpus**; the corpus
supplies the displayed text and its review state. 22 of 23 emitted citations are backed by approved
governed content; **132 rule-declared citations have no governed record at all**. Two workflow
strings — `Applicable standard (N)` and `Applies` — use legal-applicability vocabulary.
**Evidence.** `STANDARDS-CITATION-ORIGIN-TRACE.md`; KG-3F.
**Counsel question.** Is "Applicable standard" / "Applies", as presented with the adjacent
qualifications, acceptable — or must the product use "potentially applicable" throughout?

### 3. Statutory records and recordkeeping

**Proposed factual boundary.** The product produces an inspection record and a report. It does
**not** perform a statutory examination and makes **no** representation that any output satisfies a
recordkeeping obligation.
**Known limitation.** Retention is **undefined** (ST-3). Reports and revisions are retained
indefinitely by construction; nothing states a period, an export guarantee, or what happens when the
Beta ends. An inspector may nonetheless treat the output as their examination record (RR-1). MSHA
30 CFR 56.18002 requires a competent person's record retained one year; OSHA 29 CFR 1904 imposes
separate duties.
**Counsel question.** What must Terms say to prevent reliance as a statutory record, and does a Beta
with no stated retention period create exposure independent of the wording?

### 4. Safety responsibility and professional judgment

**Proposed factual boundary.** Output is advisory. A qualified person must verify every finding
before finalization. Nothing auto-finalizes. Final safety, compliance and corrective-action
decisions remain with the user and their organization. No statutory responsibility transfers.
**Known limitation.** This language is present on `/legal`, the signup checkbox, the report basis
block and the workspace banner — and **absent from `/about`, `/pricing`, `/reports`,
`/safety-calendar` and the corrective-action surfaces** (SR-1).
**Counsel question.** Which surfaces must carry it contractually, and must acceptance be affirmative
rather than informational?

### 5. Workplace photographs of identifiable people

**Proposed factual boundary.** Participants photograph real workplaces; images may contain
identifiable individuals. Images are stored in the operator's cloud storage, are erased on account
deletion, and are retained in backup and recovery generations for their retention window.
**Known limitation.** The product has **no stated position, no consent posture and no retention
statement** for images of people, and the Privacy Notice is unapproved (PR-1).
**Counsel question.** What consent or notice posture is required of a Beta participant photographing
their own workforce, and what must the Privacy Notice say?

### 6. Security, deletion and recovery

**Proposed factual boundary.** Technical controls exist and are gated (§307: 334 assertions, 0
failed). Account deletion erases the account's evidence from live storage end to end and was
exercised in production (BR-7, and again at §317A). Evidence integrity is verified nightly by
full rehash of live bytes and fails closed (BR-8/BR-9); the last scheduled run reports
`INTEGRITY_HOLDS`, `AGGREGATE HEALTHY`.
**Known limitations, all material to wording.** (a) **Backups and recovery generations retain data
after deletion**, for their retention window. (b) Integrity verification is **detective, not
preventive** — nothing is tamper-*proof*. (c) The scheduler runs on a **laptop**, so "nightly"
depends on that machine. (d) The repository is **public**. (e) Local-report encryption is real
(AES-GCM) but **the key is stored unprotected beside the ciphertext and the PIN does not gate
decryption**.
**Counsel question.** What may be said about "deleted" given backup retention, and does the local
PIN/encryption presentation require correction before Beta on consumer-protection grounds?

### 7. Subscription, price and Beta mode

**Proposed factual boundary.** $24.99/month for Pro. Every account is created on Free; the Stripe
webhook promotes it. Production has Stripe configured. A comped account holds Pro through a bounded,
revocable grant with a stated end date and no payment method.
**Known limitations.** `/pricing`'s Pro column advertises **"Inspection planning and assignment
tools"** and **"Dashboards, analytics, and audit trail"** with **no customer-reachable surface for
either** (CS-2). Password-reset email **cannot be delivered** (EM-2), so a participant who forgets
their password is permanently locked out of that account. Expert is limited to **1 analysis per user
per 24 h** (HZ-11) and this ceiling is disclosed nowhere.
**Counsel question.** If the Beta charges real money, what disclosure, cancellation and refund terms
are required — and does advertising an unbuilt capability change the analysis?

### 8. Beta status itself

**Proposed factual boundary.** This is a pre-release product under an internal acknowledgement that
is explicitly **not** the Terms of Service and has **not** been reviewed by counsel.
**Known limitation.** The word "Beta" appears **once** in the entire rendered product — inside the
registration acknowledgement. Nothing on any working surface tells a participant they are using
pre-release software.
**Counsel question.** Must Beta status be persistently visible, and does the current
acknowledgement's `NOT_COUNSEL_REVIEWED` status affect its enforceability?

---

## WHAT COUNSEL IS **NOT** BEING ASKED

Whether HazLenz works; how the applicability rules operate; whether the encryption is real; what the
coverage is; whether the citation is correct. Those are engineering facts, they are stated above,
and each is traceable to frozen evidence in this repository.
