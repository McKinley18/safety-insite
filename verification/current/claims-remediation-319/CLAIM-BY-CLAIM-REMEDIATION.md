# §319 — THE FIVE CLAIMS, CORRECTED

Each entry records the surface, the exact old wording, why it exceeded the evidence, the replacement,
and the evidence supporting the replacement. **No replacement is artificially weak and none is
promotional beyond the evidence.** Every word comes from the §318 approved vocabulary.

---

## 1 · `/hazlenz` — the reasoning trace

**OLD** — *"Every finding includes a full visual and step-by-step AI Reasoning Trace. This allows
safety managers to inspect the exact reasoning sequence, inputs used, and matched logic that led to
the recommendations."*

**WHY IT EXCEEDED THE EVIDENCE.** The string `Reasoning Trace` appeared in the entire frontend
**exactly once — in that sentence**. No such surface exists. The nearest real thing is `Show analysis
record` in the **Expert** panel: Pro-only, capped at one analysis per user per 24 h in production,
and disable-able. The word *"Every"* made it a universal about a surface that does not exist at all.

**REPLACEMENT** — *"Each finding records the facts HazLenz used and where each one came from — your
observation text, your confirmation, or the inspection's regulatory context — the passage it flagged
from, why a standard was or was not supported, and what the conclusion does not cover. The generated
report carries the same basis, so a reviewer can evaluate the finding rather than take it on trust."*

**EVIDENCE.** Every element named is rendered today and was captured in the §318 corpus: per-fact
provenance (`Source: user text · observed`, `user confirmation · confirmed`, `inspection context ·
confirmed`, `human assertion · confirmed`), the quoted span (*"Flagged from what you recorded: …"*),
the decision explanation (*"Why: Candidate only; missing: moving or accessible energy."*),
*"What limits this conclusion"*, *"What this assessment does not cover"*, and the report's *Basis and
Limitations* block.

**CM-3 DISPOSITION: copy corrected, surface not built** — per §319's direction, and because the
capability that exists is worth describing accurately rather than replacing with a feature invented
to rescue a sentence.

---

## 2 · `/hazlenz` — autonomy

**OLD** — *"**Autonomously** identifies missing or ambiguous parameters—such as worker proximity,
equipment operational state, or control status—and flags them as critical questions to resolve
before finalizing findings."*

**WHY.** `CLAIMS-GUARDRAILS.md` prohibits *"autonomous"* — *"the architecture is
advisory-with-human-review by construction"* — and `CAPABILITY-REGISTER.md` classifies it
`NOT_CURRENTLY_SUPPORTABLE`. This was its **only live use**, attached to the one feature whose entire
purpose is to **stop and ask a person**.

**REPLACEMENT** — *"Identifies missing or ambiguous facts — worker proximity, equipment operational
state, control status — and raises them as questions to settle before a finding is finalised. When a
fact it depends on is unresolved, it says so and lowers its own confidence rather than assuming an
answer."*

**EVIDENCE.** §318 measured the behaviour live: the unresolved fact *"moving or accessible energy"*
was named, the settling question was offered, the standard stayed `Candidate · Confidence: Low` until
a person answered, and *"Unknown facts stay unknown; they are never treated as observed"* is on the
screen. The capability was always real; the adverb was the claim.

---

## 3 · `/hazlenz` — benchmark validation

**OLD** — *"To support **repeatable validation and reasoning consistency**, the engine's observation
understanding is supported by an automated multi-scenario benchmark covering core industrial hazard
scenarios."*

**WHY.** Refuted by the project's own §158 measurement: two executions of **byte-identical** verifier
input, provider-attested at 4,598 metered input tokens on both, returned **different verdicts**.
"consistent", "repeatable" and "reproducible analysis" are all prohibited.

**REPLACEMENT**, moved into *"What HazLenz does not do"* — *"An automated multi-scenario benchmark
exercises the deterministic engine's observation understanding during development. It is a
development instrument, not a measured product accuracy rate, and we do not publish one. The Expert
layer's answers are not guaranteed to be identical between runs on identical input."*

**EVIDENCE.** The benchmark exists, so it is still described. §158 for the instability; the formal
evaluation **failed and was not accepted**, so no rate is published.

---

## 4 · `/unlock` — encryption and the PIN

**OLD** — *"Create a PIN to protect **encrypted** local inspection reports on this device."*
(and, when a PIN exists, *"Enter your PIN to unlock encrypted local inspection reports on this
device."*)

**WHY.** The encryption is real — AES-GCM through `crypto.subtle`. But `getDeviceKey()` writes 32
random bytes **base64 in cleartext to `localStorage`**, beside the ciphertext, and `pinSecurity.ts`
stores a salted SHA-256 of the PIN in the same store and compares it client-side. **It never touches
the key.** The PIN does not gate decryption; anyone with the device holds both halves.

**REPLACEMENT** — heading copy becomes *"Add a PIN lock for local inspection reports on this device"*
/ *"Enter your PIN to unlock this device's local inspection reports"*, and the panel now carries:
*"This PIN is a lock screen for this device. Local reports are stored encrypted on the device, and
the key is held on the device too — so the PIN keeps a passer-by out of the app, and it is not
protection against someone who has the device itself. Your inspections on your Safety InSite account
are not affected by this PIN."*

**EVIDENCE.** `lib/encryption.ts` and `lib/pinSecurity.ts`, traced at §318. **The mechanism was not
changed** — deriving the key from the PIN is a real cryptographic change whose consequence is that a
forgotten PIN makes local reports permanently unrecoverable, and that is a product decision. CM-3
stays open for it.

---

## 5 · `/hazlenz` — standards matching

**OLD** — *"**Matches** structured observations against **approved** MSHA and OSHA (General Industry
and Construction) regulatory frameworks to surface potentially applicable standard families and
standards-informed references for qualified safety review."*

**WHY.** Citation selection is **code-resident and corpus-independent** — KG-3F's own words:
*"citation SELECTION entirely in code with no database access"*. The corpus supplies the displayed
regulatory **text** and its review state, not the match. 132 rule-declared citations have no governed
record at all. "Matches against approved frameworks" describes a corpus operation the product does
not perform. The second half of the sentence was always right.

**REPLACEMENT** — *"Applies governed applicability rules to the observation to suggest potentially
applicable MSHA and OSHA (General Industry and Construction) standards for qualified review. It shows
how confident it is and whether the regulatory text for each citation has completed source review. It
does not decide which standard legally applies."*

**EVIDENCE.** `standard-applicability.rules.ts`; KG-3F's rule-to-corpus map; and the product's own
`confidenceLimitReason`, which already tells the customer when the regulatory text has not completed
source review.

---

## ALSO CORRECTED IN THE SAME PASS

| surface | old | new | reason |
|---|---|---|---|
| `/hazlenz` hero | *"…reasons across equipment, task, exposure, energy, and control factors…"* | scoped to *"For the hazard families its knowledge base covers…"* | §318 finding 7, `NEEDS_SUBSTANTIATION`: six assertions implying a population that was never measured. Coverage was 5 of 9 truth families; electrical is a known gap (D-030) |
| workspace | heading `Applicable standard(s)`; badge `Applies`; review summary `· applies` | `Suggested standard(s)` with *"Suggested for your review, not a determination that the standard legally applies"*; badge `Supported by the evidence`; summary `· supported by the evidence` | **CM-2** |
| `/pricing`, `/upgrade` | *"**Applicable** MSHA and OSHA standards are suggested…"* | *"**Potentially applicable** … are suggested … for your review…"* | CM-2 consistency — the sentence mixed both vocabularies |
| `/pricing` Pro list | *"Inspection planning and assignment tools"* | **removed** | **CS-2.** Assignment is Company/Team, deferred at §305A. Nothing true remained |
| `/pricing` Pro list | *"Dashboards, analytics, and audit trail"* | *"Report revision history — reissuing a report keeps the one it replaced"* | **CS-2.** The real record-keeping capability underneath it (D-046, §286) |
| `/pricing` comparison | *"Advanced review controls and audit trail"* | *"Human review recorded against each finding"* | **CS-2.** What exists: the reviewer's decision, rationale and settled facts are persisted and appear in the report |
| `/pricing` comparison | *"Inspection planning and assignment tools"*, *"Advanced dashboards"* | **removed** | **CS-2.** No advanced dashboard exists, and the dashboard that does is available on Free |
| `/forgot-password` hero | *"Enter your email to start a secure password reset."* | reads the same capability as the §317 notice; falls back when unknown | The hero invited an action three lines above the notice saying it would not reach anyone |
| workspace banner | — | *"What HazLenz does, and what it does not"* link to `/hazlenz` | §318: the AI disclosure was reachable from **no** customer surface |
| review step | — | the canonical aid/authority boundary | **SR-1** |
| `/reports` | — | *"Reports record what this inspection captured… does not determine compliance."* | **SR-1**, at the point of distribution |

## CS-2 — SIX INSTANCES, NOT THREE

§319 was told to **re-derive** rather than work from §318's list, and that mattered: the plan
comparison table carried **three more** instances than §318 counted (*Advanced review controls and
audit trail*, *Inspection planning and assignment tools*, *Advanced dashboards*). Three were reworded
to what exists; three were removed because nothing true remained.

## SR-1 — SURFACES EVALUATED, AND THE TWO DELIBERATELY LEFT ALONE

**Evaluated:** `/hazlenz`, the HazLenz analysis/review step, the regulatory citation presentation,
the inspection review/confirmation step, `/reports`, `/about`, `/pricing`, `/safety-calendar` and the
corrective-action surfaces.

**Changed:** `/hazlenz` (a whole *"What HazLenz does not do"* group), the citation presentation, the
review/confirmation step, `/reports`, and the workspace banner's disclosure link.

**Already carried it and were left alone:** `/about` and `/pricing`. §318's placement table listed
both as absent; **re-derivation at §319 found the boundary already present on each** — `/about`
carries *"HazLenz AI is advisory decision support…"* and `/pricing` carries *"HazLenz supports the
review rather than replacing your judgment."* Recorded as a correction to §318's table.

**Deliberately not changed:** `/safety-calendar` and the corrective-action surfaces. They show work
that follows a decision already made and reviewed; no HazLenz conclusion is represented there. §319's
direction is decision-relevant placement and explicitly *not* a disclaimer wall, and this is where
that line falls.
