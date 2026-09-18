# §319 — COUNSEL HANDOFF, UPDATED WITH ACTUAL PROPOSED RUNTIME WORDING

This supersedes nothing in `../claims-substantiation-318/COUNSEL-HANDOFF.md`; it adds the wording
that is now **in the candidate build** and separates three things that must not be confused.

| marker | meaning |
|---|---|
| **ENGINEERING FACT** | Measured or traced in this repository. Not a matter of opinion and not counsel's to determine. |
| **PRODUCT COPY** | Wording §319 wrote and placed. Factual, derived from the evidence boundary, and changeable. |
| **COUNSEL APPROVAL REQUIRED** | Not approved by anyone. §319 marks it; §319 does not clear it. |

**Nothing below is marked approved. No substantive legal language was drafted.** Every placement
states engineering facts and deliberately contains no waiver, no limitation of liability and no
allocation of legal responsibility beyond what the product already said.

---

## 1. AI provenance — now disclosed in the product for the first time

**ENGINEERING FACT.** The semantic reasoning in an Expert review is performed by a hosted
third-party model operated by Anthropic. Safety InSite did not build, train or host it. The
observation text and analysis context are transmitted; photographs and attached documents are not.
The deterministic engine reaches a finding, a citation, a risk band and a corrective action without
the provider at all. Before §319 this disclosure existed only as an internal document reachable
from **no** customer surface.

**PRODUCT COPY**, now on `/hazlenz` under *"HazLenz Expert, and the third-party model behind it"*:

> **What the provider does.** The semantic reasoning in an Expert review is performed by a hosted
> third-party AI model operated by Anthropic. We did not build, train or host that model. When you
> request an Expert review, the text of your observation and its analysis context are sent to that
> provider. Photographs and attached documents are not.
>
> **What the provider cannot do.** It cannot finalise a finding, certify anything as safe, or decide
> whether its own answer is admissible. Every response is checked against our rules by our code, and
> one that does not satisfy them is refused rather than repaired. The deterministic analysis above is
> unaffected by whether the provider answers.

**PLACEMENT.** `/hazlenz`, reachable from the inspection workspace by a link on the advisory banner
(*"What HazLenz does, and what it does not"*), from the public footer, and from the signed-in account
menu.

**COUNSEL APPROVAL REQUIRED.** Whether this discharges any applicable AI-disclosure obligation;
whether the placement is sufficient or the disclosure must be adjacent to each use of "HazLenz AI";
whether naming the provider is required, permitted or inadvisable.

## 2. Regulatory standards — the vocabulary now matches the mechanism

**ENGINEERING FACT.** Citation selection is performed by governed rules **in code**, independent of
the regulatory corpus; the corpus supplies the displayed regulatory text and its review state. A
human may settle one named predicate. 22 of 23 emitted citations are backed by approved governed
content; 132 rule-declared citations have no governed record at all; citation existence is not
verified per request.

**PRODUCT COPY.** The heading `Applicable standard(s)` is now **`Suggested standard(s)`**, followed by:

> Suggested for your review, not a determination that the standard legally applies. Applicability
> depends on facts, jurisdiction and the current authoritative source.

and the state badge `Applies` is now **`Supported by the evidence`** (`Candidate` unchanged). The
review step's summary line uses the same words. `/hazlenz` states: *"It does not decide which standard
legally applies."*

**COUNSEL APPROVAL REQUIRED.** Whether "Supported by the evidence" is the right formulation, or
whether it should be weaker still; whether the three-way distinction — **suggested citation** vs
**verified legal applicability** vs **compliance determination** — is adequately drawn for a reader
who is not a lawyer.

## 3. Safety responsibility at the point of decision

**ENGINEERING FACT.** Nothing auto-finalises. The reviewer settles unresolved facts, sets risk,
confirms the action and decides whether the finding stands. The assessment can only use facts it was
given.

**PRODUCT COPY**, now on the review step, immediately above the save control:

> HazLenz assists this analysis; the judgement is yours. A suggested standard is for your review
> rather than a determination that it legally applies, and the assessment can only use facts it was
> given — conditions you did not record, and facts about this site or jurisdiction it does not hold,
> are not part of it. Saving this finding does not move any safety or regulatory responsibility from
> you or your organisation.

and on the report library:

> Reports record what this inspection captured and what a qualified person reviewed. HazLenz assists
> the analysis; it does not assess conditions that were not recorded, and it does not determine
> compliance.

**COUNSEL APPROVAL REQUIRED — the most counsel-sensitive wording §319 wrote.** The final clause
*"does not move any safety or regulatory responsibility from you or your organisation"* is a
statement about where responsibility sits. Engineering's basis for it is architectural — the product
neither performs the examination nor finalises anything without a person — but **whether it is
correctly stated, sufficient, or needs contractual support in Terms is counsel's**, and it
interacts with RR-1 and SU-2.

## 4. Local encryption and the PIN

**ENGINEERING FACT.** AES-GCM through `crypto.subtle` is real. `getDeviceKey()` writes 32 random
bytes base64 **in cleartext to `localStorage`**, in the same store as the ciphertext.
`pinSecurity.ts` stores a salted SHA-256 of the PIN in that same store and compares it client-side;
it never touches the key. **The PIN does not gate decryption.**

**PRODUCT COPY**, now on `/unlock`:

> This PIN is a lock screen for this device. Local reports are stored encrypted on the device, and
> the key is held on the device too — so the PIN keeps a passer-by out of the app, and it is not
> protection against someone who has the device itself. Your inspections on your Safety InSite
> account are not affected by this PIN.

**COUNSEL APPROVAL REQUIRED.** Whether describing the limitation plainly is sufficient, or whether
offering a PIN at all alongside the word "encrypted" carries residual consumer-protection risk. **CM-3
remains open** for the separate product decision of whether to derive the key from the PIN.

## 5. Paid-plan capability claims

**ENGINEERING FACT.** Three advertised Pro capabilities had no customer-reachable surface:
*"Inspection planning and assignment tools"*, *"Dashboards, analytics, and audit trail"* / *"Advanced
dashboards"* / *"Advanced review controls and audit trail"*, and *"Every finding includes a full
visual and step-by-step AI Reasoning Trace"*.

**PRODUCT COPY.** Assignment and dashboards are **removed** — nothing true remained to say.
Audit-trail language is **reworded** to what exists: *"Report revision history — reissuing a report
keeps the one it replaced"* and *"Human review recorded against each finding"*. The reasoning-trace
sentence is replaced with a description of the basis a reviewer can actually open.

**COUNSEL APPROVAL REQUIRED.** None for the corrections themselves — they remove claims rather than
make them. **One residual fact counsel should know:** the entitlement flags `inspectionAssignments`,
`analytics` and `auditTrail` remain `true` for Pro in the API. Nothing on a customer path reads them,
so nothing is promised; CS-2 stays open to make the flags agree with the copy.

## 6. Recovery

**ENGINEERING FACT.** Production reports `passwordResetEmail NOT_CONFIGURED`. A reset request mints a
token, fails delivery, and rolls the token back, so nothing is written and nothing is sent. A
participant who forgets their password is permanently locked out of that account. **EM-2 is open and
§319 activated no email.**

**PRODUCT COPY.** The hero now reads, when the service reports the capability unavailable:

> Password reset by email is not switched on yet, so this form cannot reach you. If you cannot sign
> in, contact the person who invited you.

It reads from the same capability as the §317 notice, so the two cannot drift apart, and falls back
to the original sentence when the capability is unknown.

**COUNSEL APPROVAL REQUIRED.** Whether a Beta may run with no self-serve recovery, and what the Beta
terms must say about it.

---

## QUESTIONS STILL OPEN FROM §318 AND NOT ADDRESSED BY §319

Unchanged and still counsel's: the **"HazLenz" and "Safety InSite" marks** (TM-1); **statutory
records and retention** (RR-1, ST-3); **workplace photographs of identifiable people** (PR-1);
**backup retention versus "deleted"**; **Beta status visibility and the enforceability of an
acknowledgement marked `NOT_COUNSEL_REVIEWED`** (SU-2, LG-1/LG-2/LG-3); and **what changes if the
Beta charges real money**.
