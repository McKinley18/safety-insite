# §318 — THE CANONICAL CLAIM VOCABULARY

**This is the input the final page-by-page review will check every sentence against.** §318 does not
perform that review and changes no runtime copy. This supersedes nothing in
`project-docs/legal/CLAIMS-GUARDRAILS.md`; it extends it with what §278–§318 measured.

---

## A. APPROVED VOCABULARY — evidence-backed, usable as written

**About what the product is**
"decision support for qualified safety professionals" · "governed safety-analysis system" ·
"advisory" · "aid" · "supports professional judgment" · "inspection and corrective-action platform"

**About what it does**
"records what you saw" · "surfaces potentially applicable standards" · "suggested MSHA / OSHA
standards" · "candidate standards" · "raises questions it cannot resolve" · "asks a person to
decide" · "records the facts it used and where each came from" · "does not auto-finalize findings" ·
"runs a deterministic analysis that works whether or not any AI provider responds" · "keeps the
finding, evidence, review and action connected"

**About limits** — all of it, verbatim; this is the product's strongest material
"Candidate standards are not confirmed violations." · "Applicability depends on verified facts,
jurisdiction, and the current authoritative source." · "Unknown facts stay unknown; they are never
treated as observed." · "does not replace qualified safety review, declare violations, create
citations, determine compliance, or make final decisions" · "That is not a finding that there are no
hazards." · "qualified review remains required"

**About scope**
"Field Capture works offline" *(scoped to Field Capture only)* · "HazLenz AI analysis and reports
still need a connection" · "Every account is created on Free."

---

## B. PROHIBITED VOCABULARY — do not use anywhere

Carried forward from `CLAIMS-GUARDRAILS.md` and **extended by §318**. Each entry states why the
evidence forbids it.

| prohibited | why |
|---|---|
| "autonomous", **"autonomously"** | advisory-with-human-review by construction. **§318: one live use on `/hazlenz`, on the feature whose purpose is to stop and ask** |
| "repeatable", "consistent", "reproducible", **"reasoning consistency"** | §158 measured different verdicts on byte-identical input. **§318: one live use on `/hazlenz`** |
| "Reasoning Trace", "step-by-step AI reasoning trace" | **§318: no such surface exists anywhere in the product** |
| "matches against approved regulatory frameworks" | **§318: selection is code-resident and corpus-independent; 132 rule citations have no governed record** |
| any accuracy percentage; "highly accurate"; "always accurate" | the formal evaluation failed and was not accepted |
| "identifies all hazards"; "catches every hazard"; "comprehensive hazard detection" | coverage was 5 of 9 truth families; electrical yields zero candidates (D-030) |
| "guarantees compliance"; "ensures compliance"; "OSHA compliant"; "meets OSHA/MSHA" | an outcome guarantee about a regulatory obligation; software cannot be OSHA compliant |
| "complete inspection"; "all applicable standards" | the product analyses what was recorded and nothing else |
| "replaces safety professionals"; "your virtual safety expert"; "no safety expert needed" | highest-liability class in the register |
| "definitive"; "authoritative"; "legal determination"; "regulatory determination" | advisory by type |
| "learns from your data"; "self-learning"; "gets smarter as you use it"; "adaptive" | nothing learns from customer data |
| "our AI"; "proprietary AI model"; "we built the AI" *(unqualified)* | the reasoning model is a hosted third party |
| "fully local"; "on-device"; "your data never leaves" | observation text is transmitted to a third-party provider on the Expert path |
| "real-time monitoring"; "continuous monitoring" | the product analyses submitted observations; it monitors nothing |
| "prevents injuries"; "prevents incidents"; "keeps workers safe"; "eliminates hazards"; "reduces injuries"; "improves safety outcomes" | no measured outcome exists. **§318: zero such claims are currently in use — this entry is preventive** |
| "tamper-proof"; "immutable" | **§318 addition.** Evidence integrity is *detective* (nightly rehash, fail-closed), not *preventive* |
| "the PIN protects your reports" | **§318 addition.** The PIN does not gate decryption and the key sits beside the ciphertext |

---

## C. QUALIFICATION-REQUIRED VOCABULARY

| term | required qualification |
|---|---|
| **"HazLenz AI"** — 84 uses, 28 surfaces | permitted **only where the AI provider disclosure is reachable by the reader**. It is currently reachable from **no** customer surface. Either place it or reduce the term |
| "proprietary" | attach to the governed knowledge base, the deterministic engine, the scorers or the evaluation architecture. Never to the reasoning model |
| "expert" | "Expert HazLenz" is an internal layer name. Telling a participant they are getting a safety expert is a different claim and is prohibited |
| "real-time" | interactive responsiveness only. Measured 5.7–38.2 s, median 15.7 s |
| "current standards" / "regulatory-current" | state the corpus date and scope in the same copy |
| "encrypted" | state that the key is held on the device, so it is at-rest encryption rather than protection from someone holding the device |
| "offline" | name the scope. Field capture, drafts and photo evidence: yes. HazLenz analysis, reports, actions, sync: no |
| "applicable standard" / "applies" | the strongest vocabulary in the workflow. Prefer "potentially applicable", "candidate", "suggested" — or keep it and place the qualification adjacent, not subordinate |
| "audit-ready", "audit trail" | must not imply the record satisfies a statutory retention duty (RR-1), and **"audit trail" currently has no implementing surface (CS-2)** |
| "backed up" / "recoverable" | true for the database and for evidence, on the stated schedule, subject to the scheduler limitation. Never "guaranteed" |
| "deleted" / "permanently deleted" | account deletion erases evidence from live storage; **backups and recovery generations retain data for their retention window**. Say which |
| "monitored" | an operator alerting channel exists and fires on a 5-errors-in-5-minutes aggregation. It is not uptime monitoring and is not 24/7 human watch |
| "secure" / "private" | technical controls exist (§307: 334 assertions). Never an absolute guarantee |

---

## D. SURFACES REQUIRING A DISCLOSURE PLACEMENT DECISION

For SR-1 and LG-3 to close, someone must decide **where** each of these lands. §318 states the need,
not the placement.

| disclosure | surfaces that need it |
|---|---|
| **Aid / not-a-replacement** | present: `/legal`, signup checkbox, report basis block, workspace banner. **Absent: `/about`, `/pricing`, `/reports`, `/safety-calendar`, the corrective-action surfaces** |
| **AI provider disclosure** | **reachable from no customer surface today.** Needed wherever "HazLenz AI" appears — which is 28 surfaces |
| **Product limitations** (families covered, D-030 electrical, no accuracy rate) | `/hazlenz`, `/pricing`, and a reachable limitations document |
| **Beta status and known limitations** | currently **one** occurrence, inside the registration acknowledgement. Needed at minimum on the dashboard or the shell |
| **HazLenz usage ceiling** (HZ-11) | the Expert control and the plan surfaces |
| **Transactional-email limitation** (EM-2) | `/forgot-password` — **already placed at §317** — and the Beta invitation |
| **Offline boundary** | `/inspections`, `/field-capture` — already scoped correctly; keep it scoped |
| **Degraded-analysis disclosure** (HZ-12) | the HazLenz step, if option 1 is chosen |
| **Retention and deletion** (ST-3, PR-1) | `/profile` deletion flow, the privacy notice, the Beta terms |
