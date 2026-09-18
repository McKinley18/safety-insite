# §318 — THE HAZLENZ CAPABILITY BOUNDARY

Every classification below is grounded in project evidence and distinguishes **IMPLEMENTED** (code
exists) from **VALIDATED** (measured against a held expectation) from **PRODUCTION-PROVEN**
(exercised in production). A capability is never inferred from the existence of code.

## THE ARCHITECTURAL SPLIT THAT EVERY CLAIM DEPENDS ON

| | contribution |
|---|---|
| **Provider (hosted third-party model)** | Semantic authoring in the **Expert** layer only: the hazard reading, the posture, the justification. It authors semantics and nothing else — it admits no structure, grants no authority, and writes no record. **Expert is ceiling-limited to 1 analysis per user per 24 h in production and may be disabled entirely.** |
| **HazLenz-owned deterministic/governed logic** | Everything a Free-to-Pro user actually meets: the applicability rules, predicate model, unresolved-fact detection, citation selection, risk banding, corrective-action families, evidence boundary, admission, refusal and authority gates. **Citation selection is code-resident and corpus-independent** (KG-3F). |
| **HazLenz-owned state/context** | The governed knowledge base, the release/approval model, fact provenance, the analysis record, the inspection and finding lifecycle. |
| **Human confirmation** | The settlement of named unresolved predicates, the reviewer's risk cell, the corrective-action wording, and finalization. **Nothing auto-finalizes.** |
| **Third-party dependency** | Anthropic (Expert), Stripe (billing), Render/Vercel/Neon/Cloudflare R2 (hosting and storage), Resend (selected, uncredentialed). |

**The single most important consequence for claims:** the deterministic path is the
customer-authoritative one and reaches a finding, a citation, a risk band and a corrective action
**without any provider involvement at all** — proven at §317 on a database with no corpus and no
API key. "HazLenz AI" is therefore attached, 84 times, to a product whose main path is not the AI.

---

## CAPABILITY CLASSIFICATION

| capability | class | basis |
|---|---|---|
| **Natural-language observation understanding** | **BOUNDED** | Implemented and exercised end to end. Bounded to the **governed hazard families**: coverage on the hardened development set was **5 of 9 truth families**, and the strict selector denominator after HS-H1's removal is two draws over two rows, which cannot carry a rate |
| **Hazard candidate generation** | **BOUNDED** | Produced correctly for machine guarding on a corpus-free database. Bounded by the same family coverage, and by **D-030: electrical is a KNOWN LIMITATION** — an exposed-live-parts condition yields **zero** proposed hazards, deliberately, because no governed standard backs it |
| **Multi-hazard reasoning** | **PARTIAL** | Decomposition is implemented and claimed on `/hazlenz`. §317/§318 exercised a **single-hazard** observation only. Not measured here; not disproven |
| **Clarification** | **PROVEN** | Measured live: *"HazLenz could not establish the following, and it affects this conclusion: moving or accessible energy"* with the settling question and the statement that it materially changes applicability |
| **Unresolved-property handling** | **PROVEN** | *"Unknown facts stay unknown; they are never treated as observed."* Verified by behaviour — the predicate stayed unresolved and the standard stayed `Candidate · Low` until a person answered |
| **Risk / severity** | **BOUNDED** | Deterministic banding produced High (16) from a 5×5 matrix with a reviewer-editable cell, and the due date derived from the band (High → 3 days). It is a **governed scoring model**, not a measured prediction of harm. No claim of predictive accuracy is supportable |
| **Corrective-action support** | **PROVEN as advisory** | Three layered actions on the hierarchy of controls — immediate, permanent correction, verification — with owner and due date. The report labels them *"Candidate only, qualified review required"* |
| **Regulatory applicability (OSHA)** | **PARTIAL — and the sharpest boundary in the product** | It **retrieves and cites**; it does **not determine legal applicability**. 22 of 23 emitted citations are backed by approved governed content; **132 rule-declared citations have no governed record at all**; selection is corpus-independent. See `STANDARDS-CITATION-ORIGIN-TRACE.md` |
| **Regulatory applicability (MSHA)** | **PARTIAL**, and weaker than OSHA | Same mechanism. KG-3F's single unbacked **emitted** citation was MSHA: `30 CFR 56.14132(a)`, `SOURCE_AND_INGEST_REQUIRED` |
| **OSHA citation correctness** | **BOUNDED** | `29 CFR 1910.212(a)(1)` is exact-match, approved, authoritative text available. The corpus-integrity regression exists because two citations once carried **titles copied from a different paragraph**. Correct where governed; not verified per request |
| **Evidence grounding** | **PROVEN** | Every fact carries provenance — `user text · observed`, `user confirmation · confirmed`, `inspection context · confirmed`, `human assertion · confirmed` — and the analysis quotes the observation span it flagged from |
| **Human settlement** | **PRODUCTION-PROVEN as a mechanism** | One answer moved the standard from `Candidate · Low` to `Applies · High` and the explanation names *which* predicate a person settled and that it was settled *by a person rather than by the observation* |
| **Traceability** | **BOUNDED — and over-claimed** | Fact provenance, the decision explanation, the analysis record and the report's basis block are real. A *"full visual and step-by-step AI Reasoning Trace"* is **NOT PROVEN — no such surface exists** |
| **Contradiction handling** | **IMPLEMENTED, NOT MEASURED HERE** | `doNotSelectWhen` exclusions and a defeated-control contradiction regression exist. §318 did not exercise them |
| **Negation / negative statements** | **PROVEN** | §281's D-040 exists precisely for this: the negated result no longer describes a finding that does not exist, and states that an absence of findings is not a finding of safety |
| **Decision-critical facts** | **PROVEN** | The unresolved fact is emitted as a structured property with the proposition whose truth controls the conclusion, and the UI says the answer *"materially changes … applicability"* |
| **Consistency / repeatability of the advisory layer** | **KNOWN LIMITATION** | §158: byte-identical input, provider-attested identical token counts, **different verdicts**. Any consistency claim is refuted by our own measurement |
| **Accuracy rate of any kind** | **NOT PROVEN** | The formal evaluation **failed and was not accepted**. Development figures come from 16-row sets across 3 draws and are explicitly not production rates |
| **Silent degradation disclosure** | **KNOWN LIMITATION** | HZ-12: the server reports `degraded`, `fullIntelligenceAvailable: false` and a `fallbackReason`; **no frontend reader exists** |

---

## WHAT WOULD BE REQUIRED BEFORE ANY RATE CLAIM

None of the following may be stated until the corresponding work exists. §318 manufactures no
percentage and extrapolates no development result.

| claim type | prerequisite |
|---|---|
| percentage accuracy | a frozen, preregistered evaluation over a population representative of Beta observations, with truth authored by a qualified person who is not the graded model, and an accepted acceptance program. The last formal attempt **failed and was not accepted** |
| sensitivity / recall | a truth set with known hazards deliberately present and absent, sized to carry a rate. Current coverage is **5 of 9 truth families** |
| false-negative rate | the same, plus a decision about what counts as a miss when the architecture deliberately under-surfaces ungoverned families (D-030) |
| standard-selection accuracy | per-citation adjudication against the gold set **and** governed backing for the emitted set. KG-3F's emitted set is 23 citations — a denominator too small to carry a rate |
| hazard-recognition accuracy | all of the above, on the deterministic path, separated from the advisory path, because they behave differently and only one is draw-stable |
