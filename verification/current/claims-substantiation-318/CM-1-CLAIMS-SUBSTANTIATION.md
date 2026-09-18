# §318 — CM-1: WHAT WE HAVE ACTUALLY PROVEN, AND WHAT WE MAY SAY

**This is not marketing copy, not new capability work, and not legal approval.** It is the
engineering answer to six questions, so that counsel and the product owner can answer theirs.

## METHOD

**38 customer-facing surfaces were captured as RENDERED TEXT**, not read from source, on a
production build of the deployed code (`5c84f1d0`) against a database built by migrations alone,
with every development bypass off and every `<details>` opened first. Both entitlement states were
walked — Free and a comped Pro grant — so plan-gated copy was reached. The generated report's
backend-authored claim block was added from source because it renders into a PDF rather than a page.

Surfaces: the marketing home, `/login`, `/register`, `/pricing`, `/about`, `/hazlenz`, `/legal`,
`/terms`, `/privacy`, `/forgot-password`, `/reset-password` (with and without a token), 404, the
dashboard, `/inspections` (both the Free and the Pro-gated card), `/settings`, `/profile`,
`/reports` (empty and populated), `/safety-calendar` (empty and populated), `/upgrade` (Free and
Pro), `/unlock`, `/field-capture`, `/inspection-complete`, the empty workspace, observation entry,
the Free entitlement boundary, the HazLenz analysis with an unresolved predicate, the analysis after
human confirmation, risk and corrective action, review, save, completion, and the generated report.

**The §317 claims inventory was used as an input and was NOT assumed exhaustive.** It covered nine
public surfaces; this covers thirty-eight, and four of the five material findings below are on
surfaces it did not reach.

## THE HEADLINE

**The product's limitation language is strong, consistent and unusually good.** There are **zero**
safety-outcome claims — no "prevents injuries", no "keeps workers safe", no "eliminates hazards" —
and **zero** numerical accuracy claims anywhere in the rendered product. The workspace states its
own limits per analysis, names the provenance of every fact it used, and says "unknown facts stay
unknown". That is the opposite of the failure mode CM-1 was opened against.

**Five material claims exceed the evidence, and four of the five are on one page — `/hazlenz`.**

---

## COUNTS

| | |
|---|---|
| customer-facing surfaces swept | **38** |
| material claims classified | **41** |
| `SUPPORTED_AS_WRITTEN` | **24** |
| `SUPPORTED_WITH_QUALIFICATION` | **7** |
| `NEEDS_SUBSTANTIATION` | **2** |
| `MISLEADING_OR_OVERSTATED` | **5** |
| `COUNSEL_REVIEW_REQUIRED` | **3** (additionally carried by 9 others) |
| `REMOVE_BEFORE_EXTERNAL_BETA` | **0** as a sole verdict — the five overstated claims are removable *or* rewordable, and which is a product decision |

**By category** — AI/terminology **99** occurrences across 28 surfaces; regulatory **104** across 20;
accuracy/reliability **1**; safety-outcome **0**; security/privacy **3**; offline **20** across 5;
subscription/Beta **75** across 17.

---

## THE FIVE THAT EXCEED THE EVIDENCE

### 1. `MISLEADING_OR_OVERSTATED` — "Every finding includes a full visual and step-by-step AI Reasoning Trace."

**Surface** `/hazlenz` · **category** traceability/explainability
**A reasonable user understands:** every finding carries an inspectable, step-by-step record of how
the AI reached it.
**Evidence:** the string `Reasoning Trace` appears in the entire frontend **exactly once — in this
sentence.** No such surface exists. The nearest real thing is `Show analysis record` in the **Expert**
panel, which requires Pro, is ceiling-limited to **1 analysis per user per 24 h** in production, and
may be disabled entirely. The deterministic path — the one every Pro user actually gets — shows fact
provenance and a decision explanation, which is real and valuable and is **not** what this sentence
describes.
**Evidence strength:** conclusive, from the deployed bundle.
**Safe factual boundary:** *"Each finding records the facts HazLenz used, where each came from, and
why the standard was offered, so a reviewer can evaluate it."*

### 2. `MISLEADING_OR_OVERSTATED` — "Autonomously identifies missing or ambiguous parameters…"

**Surface** `/hazlenz` · **category** AI/autonomy
**Evidence:** the project's own `CLAIMS-GUARDRAILS.md` lists **"autonomous"** as *prohibited*
("the architecture is advisory-with-human-review by construction") and `CAPABILITY-REGISTER.md`
classifies it `NOT_CURRENTLY_SUPPORTABLE`. This is the **only live use** in the product, and it sits
on the one feature whose whole purpose is to **stop and ask a person**.
**Safe factual boundary:** *"Identifies missing or ambiguous parameters and raises them as questions
to resolve before the finding is finalized."* The capability is real; only the adverb is not.

### 3. `MISLEADING_OR_OVERSTATED` — "To support **repeatable validation and reasoning consistency**, the engine's observation understanding is supported by an automated multi-scenario benchmark…"

**Surface** `/hazlenz` · **category** accuracy/reliability
**Evidence:** directly contradicted by the project's own §158 measurement — two executions of
**byte-identical** verifier input, provider-attested at 4,598 metered input tokens on both, returned
**different verdicts**. `CAPABILITY-REGISTER.md`: *"any claim of consistent or repeatable analysis"*
= `NOT_CURRENTLY_SUPPORTABLE`. `CLAIMS-GUARDRAILS.md` prohibits "consistent", "repeatable",
"reproducible analysis".
**Note:** the benchmark exists. It is the words *repeatable* and *consistency* that the evidence
refutes, and they describe the **advisory** layer where instability was measured.
**Safe factual boundary:** state that a multi-scenario benchmark exercises the deterministic
engine's observation understanding, name its scope, and claim nothing about consistency.

### 4. `MISLEADING_OR_OVERSTATED` — "Create a PIN to protect **encrypted** local inspection reports on this device."

**Surface** `/unlock` · **category** security
**A reasonable user understands:** the PIN protects encrypted reports on the device.
**Evidence — traced in code:** the encryption is **real** (AES-GCM via `crypto.subtle`). But the key
is 32 random bytes written **in cleartext to `localStorage`** under
`sentinel_device_encryption_key_v1`, beside the ciphertext. And `pinSecurity.ts` stores a salted
SHA-256 of the PIN in the **same** `localStorage` and compares it client-side — it **never touches
the encryption key**. **The PIN does not gate decryption.** Anyone with the device holds both halves
and can clear the PIN hash.
**Evidence strength:** conclusive, from source.
**Safe factual boundary:** *"A PIN adds a lock screen on this device. Local reports are stored
encrypted at rest; the key is held on the device, so the PIN is a convenience lock and not
protection against someone who has the device."* Whether that boundary is acceptable for Beta is a
product decision; the current sentence is not.

### 5. `MISLEADING_OR_OVERSTATED` (mechanism) — "Matches structured observations against **approved** MSHA and OSHA … regulatory frameworks…"

**Surface** `/hazlenz` · **category** regulatory
**Evidence:** citation **selection is code-resident and corpus-independent** — KG-3F's own words.
The corpus supplies the displayed regulatory **text** and its review state, not the match. KG-3F
measured **132 rule-declared citations with no governed record at all**. "Matches against approved
frameworks" describes a corpus operation the product does not perform.
**Redeeming detail:** the rest of the same sentence is exactly right — *"surface **potentially
applicable** standard families and standards-informed references **for qualified safety review**."*
The defect is the word *approved* and the word *matches*.
**Safe factual boundary:** *"Applies governed applicability rules to the observation to surface
potentially applicable MSHA and OSHA standards for qualified review, and shows whether the
regulatory text for each has completed source review."*

---

## THE TWO THAT NEED SUBSTANTIATION

### 6. `NEEDS_SUBSTANTIATION` — "Applicable standard (N)" and "Applies · Confidence: High"

**Surface** the HazLenz step · **category** regulatory. Registered as **CM-2**. Full trace in
`STANDARDS-CITATION-ORIGIN-TRACE.md`. These are the only two strings in the workflow whose
vocabulary is stronger than the mechanism (regex + one human predicate answer). Everything around
them is correctly hedged.

### 7. `NEEDS_SUBSTANTIATION` — "A governed hazard intelligence engine that … **reasons across** equipment, task, exposure, energy, and control factors"

**Surface** `/hazlenz`. Six capability assertions in one sentence. The mechanism chains, control
principles and predicate model in `standard-applicability.rules.ts` are real and do address these
factors. What has not been measured is whether that holds **across the population** the sentence
implies. Coverage on the hardened development set was **5 of 9 truth families**, and **electrical is
a known gap (D-030)**: an exposed-live-parts condition yields **zero proposed hazards**.
**Safe factual boundary:** scope it to the governed families, and say which.

---

## SUPPORTED WITH QUALIFICATION — 7

| claim | qualification the evidence requires |
|---|---|
| **"HazLenz AI"** — **84 occurrences across 28 surfaces**, the most-used claim in the product | The reasoning model is a hosted third-party model. The register's sharpest item, now up from 57. Permitted only where the AI disclosure is reachable by the reader — and **the disclosure is not currently reachable from any customer surface** |
| "proprietary … decision-support intelligence" (`/legal`, ×3) | Attach to the governed knowledge base, deterministic engine, scorers and evaluation architecture — ours. Never to the reasoning model |
| "Field Capture works offline" (`/inspections`) | Correctly scoped, and the same card already says *"HazLenz AI analysis and reports still need a connection"*. Supported **because** it is scoped to Field Capture; any blanket "works offline" would not be |
| "Suggested MSHA / OSHA standards" (`/pricing`, `/upgrade`) | "Suggested" is the right verb and is supported. Must not drift to "applicable" or "correct" |
| "secure checkout" (`/register`) | True — Stripe-hosted. Says nothing about the product's own security |
| "Audit-ready safety records" (`/login`) | Aspirational framing of record-keeping. Must not imply a record satisfies a statutory retention duty — RR-1 |
| "Safety InSite 1.0.0 … Up to date with the Safety InSite service" (`/settings`) | Accurate; it reports build identity, not capability |

---

## SUPPORTED AS WRITTEN — 24 (the limitation and boundary copy)

Every one of these is true of the deployed system today and is the reason CM-1 is closable rather
than a remediation project:

*"HazLenz AI is advisory. Applicability depends on facts and jurisdiction; a qualified safety
professional must verify every finding before finalization."* · *"Candidate standards are not
confirmed violations."* · *"Applicability depends on verified facts, jurisdiction, and the current
authoritative source."* · *"Unknown facts stay unknown; they are never treated as observed."* ·
*"It does not replace qualified safety review, declare violations, create citations, determine
compliance, or make final decisions."* · *"It never auto-finalizes findings…"* · *"No compliance
determination."* · *"Do not rely on Safety InSite or HazLenz AI as the sole basis for safety,
compliance, disciplinary, legal, medical, engineering, emergency-response, or operational
decisions."* · *"Users are responsible for the accuracy and completeness of the information they
enter."* · *"Final safety, compliance, and corrective action decisions remain the responsibility of
qualified personnel and the user organization."* · *"HazLenz AI output is advisory and requires
qualified human review"* (report) · *"This report states what this inspection recorded and what a
qualified person reviewed; it does not assess conditions that were not recorded."* (report) ·
*"Candidate only, qualified review required"* (report) · *"Jurisdiction inferred by HazLenz from the
observation wording (not user-confirmed)"* (report) · *"…do not yet carry an established risk rating
and should be rated by a qualified person before closure."* (report) · *"Every account is created on
Free."* · *"Observation saved. HazLenz AI analysis is a Pro feature."* · *"Your observation, photo
evidence, and site details are saved to this inspection and stay exactly as you entered them."* ·
*"No Expert analysis has been produced for this observation. That is not a finding that there are no
hazards."* · *"It will be recorded as identified by you, with no standard attached unless HazLenz
later finds one."* · *"No reset email can be sent right now."* · *"Included — nothing is billed to
this account."* · *"Changes are saved to your account, not to this device."* · *"Nothing here blocks
saving the finding."*

## COUNSEL_REVIEW_REQUIRED — 3 standalone, 9 carried

Standalone: the **"HazLenz" and "Safety InSite" marks** (no clearance — TM-1); the **customer-facing
AI disclosure obligation** (jurisdictional and moving); **whether "HazLenz AI" as used crosses a line**
given third-party provenance. Carried additionally by the nine regulatory and responsibility claims
above — engineering states the facts, counsel states what may be said.
