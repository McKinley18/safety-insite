# §208 — PREREGISTRATION DEFECT REGISTER

**APPEND-ONLY.** Entries are added, never edited or removed.

The §208 rule this register exists to honour, stated verbatim from the authorization:

> Once §208 execution begins, DO NOT change the frozen truth specification even if later review
> suggests an answer-key item was wrong. If a materially incorrect preregistered truth item is
> discovered, classify it as `PREREGISTRATION_DEFECT`. Preserve the original frozen truth, the
> discovered issue, when the issue was discovered, and which case / fact / judgments / gates it
> affects. Do not silently repair the truth and continue grading against the repaired version. Do
> not use knowledge of model output to author replacement truth.

**Frozen preregistration identity for this run:**
`879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4` — unchanged, and unchanged by
anything in this register.

---

## ENTRY 1 — BLOCK H HEADER MISDESCRIBES WHERE GOVERNED EVIDENCE IS SUPPLIED

- **Discovered:** 2026-09-08, while building the §208 executor, **BEFORE the first provider call**
  and therefore before any model output existed. Recorded here rather than repaired.
- **Classification:** `PREREGISTRATION_DEFECT`.
- **Materiality:** **NON-MATERIAL to every judgment and every gate.** See the assessment below.

**The frozen text, verbatim** (`expert-207-truth-specification.ts`, block H header):

> 1. THE FIRST PASS SEES THE RECORD TEXT THROUGH `redactCitationTokens`. So no case's truth may
>    depend on the model reading a citation out of a governed record. Each fact below is open, and
>    its two branches are what they are, ENTIRELY on the observation.

**What is actually true under the frozen architecture.** §202's separate governed stage — the
architecture §205 routed, §206 hosted-proved, and §207 preregistered — makes the first pass
**capability-ABSENT on every case, governed or not**. Its wire schema carries no governed-binding
property, and the §206 pre-transmission guard (carried into §208 unchanged) refuses to transmit a
first-pass request containing one anywhere. Consequently the first pass receives **no governed
records at all**, redacted or otherwise; the governed relation crosses on its own later call.
Supplying the records to the first pass would have reconstructed the retired capability-PRESENT
shape that §199 recorded as `COMPILED_GRAMMAR_TOO_LARGE`.

**Why it is non-material.**

1. The **constraint the sentence produces** — that no case's truth may depend on the model reading a
   governed citation — is satisfied *more strongly* under the real architecture than under the
   description. The truth was authored conservatively, and the conservatism was not wasted.
2. **No frozen expectation changes.** Every governed case's owed fact, branch partition, essential
   qualifiers, prohibited claims and settling evidence are stated entirely on the observation. The
   §207 suite asserts this independently (`TRUTH.governed-facts-do-not-depend-on-reading-a-citation`).
3. **No gate applicability, denominator or threshold changes.** G12's scan runs on every case
   regardless; G14's coverage is measured on the governed-stage output; axes N, S and T are
   adjudicated on the governed-stage result, which is where the frozen `containmentAndAuthority
   Expectation` for AC-22 already located them: *"the governed-binding stage returns ids and a
   bearing statement only; it returns no HazLenz-owned field and settles nothing."*

**What is affected, precisely.** Nothing in the answer key. One descriptive sentence in a block
header is wrong about which stage receives governed text. The axis names inherited from §200
(`FIRST_PASS_GOVERNED_SOURCE_ID_BINDING`, `FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`) carry
the same stale locator for the same reason and are likewise not repaired here.

**Cases affected:** AC-22, AC-23, AC-24 (descriptive text only).
**Facts affected:** none.
**Judgments affected:** none.
**Gates affected:** none.

**Action taken:** none, by rule. The frozen truth is graded as frozen. The defect is recorded so a
reader of the evidence is not misled about where governed evidence entered the pipeline, and so a
future slice can correct the wording in a *new* preregistration rather than in this one.
