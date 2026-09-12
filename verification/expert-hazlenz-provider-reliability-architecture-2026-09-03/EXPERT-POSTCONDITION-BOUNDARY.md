# EXPERT POSTCONDITION BOUNDARY

§155. Which reliability questions a deterministic check may answer, and which require semantic
judgment. Implemented in `backend/scripts/lib/expert-reliability-postconditions.ts` as
`hazlenz.expert.reliability-postconditions.v1`.

---

## The test every check must pass

> **Could a careful engineer disagree with the verdict on the same bytes?**

If yes, it is not deterministic and it does not belong here, whatever it is called.

This boundary is not theoretical. §148 built a keyword reclassifier to "fix" `affectedDecision`
labels, measured it out of sample, and found it **corrupting labels that were already correct**: the
word "guardrail" pulled a question to `REQUIRED_CONTROL`, and the bare adverb "actually" pulled one
to `HAZARD_EXISTENCE`. The reclassifier was rejected on that evidence. A semantic heuristic wearing
the word "postcondition" would be the same thing with a better name.

---

## SAFE_DETERMINISTIC_POSTCONDITION

Nine checks. Each reads structure, identity or internal consistency, and none reads meaning.

| check | what it asserts | why it is safe |
|---|---|---|
| `DEGENERATE_STRUCTURAL_OUTPUT` | The frozen detector convicts on ≥2 independent structural signals, or on `ALL_PROSE_IS_PLACEHOLDER` | Whole-field equality against a fixed lexicon, never substring. `"UNPLACEHOLDER"` — a real key in §152's data — is not matched |
| `CLARIFICATION_LINK_UNRESOLVED` | A declared `relatesToCandidateKey` names no emitted candidate | Set membership over emitted keys |
| `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE` | `HAZARD_EXISTENCE` + a declared link + the linked candidate asserted `ACTIVE` | §139's arbitration condition, **restated, not re-decided** — arbitration owns the disposition |
| `REQUIRED_OBJECT_COMPLETENESS` | Contract-required fields are present | The wire schema's own question |
| `MEANINGLESS_IDENTIFIER` | A key of one alphanumeric character, or a repeated-character run ≤4 | Character counting. `c1`, `q1` and `cand-1` all pass — an earlier `length <= 2` draft was caught flagging them by its own tests |
| `EVIDENCE_REFERENCE_INTEGRITY` | Offsets in range; quoted text matches the source bytes | Byte comparison; already fatal at the boundary |
| `DUPLICATE_CANDIDATE_KEY` | Two candidates under one key | Identity |
| `COLLECTION_RELATIONSHIP_WELLFORMED` | e.g. an insight naming fewer than two participants | Counting |
| `WHOLLY_EMPTY_ANALYSIS` | Zero candidates and zero clarifications | **The FACT is deterministic. Whether it is CORRECT is not — see below** |

One check is new in §155 and worth naming: `CANDIDATE_WITHOUT_EVIDENCE_OR_BASIS` asserts that a
candidate stating a condition offered neither a quote nor a basis. It does **not** judge whether the
basis is any good.

---

## SEMANTIC_JUDGMENT_REQUIRED

Six questions that look like postconditions and are not.

### `IS_AN_EMPTY_ANALYSIS_CORRECT`

An empty Expert response is legal and frequently right — §149's US-H1 and §150's RB-I1 were both
empty and both correct. The *fact* of emptiness is deterministic and warns; the *verdict* on it is
not, and any rule that convicted emptiness would destroy the FORBIDDEN half of every probe this
programme runs.

### `IS_A_RETAINED_UNKNOWN_DECISION_CRITICAL`

**This is the finding that decides §155's architecture.** Measured over the 44 valid stored
executions, a correct retention and an incorrect one are *structurally identical*:

```
HS-H1  REQUIRED, a miss   "...cannot be determined from the observation alone, though this does
                           not change the present door-opening exposure being assessed."
HS-J1  FORBIDDEN, right   "...leaving the flammable-atmosphere risk unassessed, though this does
                           not change the currently observed and controlled inhalation exposure."
HS-R1  FORBIDDEN, right   "...which affects cumulative exposure duration but not the presence or
                           adequacy of the controls observed at this moment."
```

Same shape every time: an unresolved candidate, a stated uncertainty, no question, and an explicit
denial of decision-relevance. One is a miss and two are correct. **Nothing deterministic separates
them**, and any check that convicted the first would convict the other two. It is a trigger input,
never a gate.

### `DOES_THE_QUESTION_ADDRESS_THE_HIGHEST_VALUE_UNKNOWN`

The §152–§154 HS-H1 mechanism exactly: a fluent, well-formed question about the wrong fact. A
structural check sees a valid clarification and can see nothing else.

### `IS_THE_AFFECTED_DECISION_LABEL_CORRECT`

Refuted by measurement in §148. See above.

### `IS_THE_REASONING_SOUND`

Not a reliability question at all. Scorers and human adjudication answer it.

### `IS_THE_RESPONSE_TOO_SHORT`

The correlation is real and the rule is not. The four degenerate executions produced 473, 637, 287
and 240 output tokens against per-draw medians near 1,400 — but §152's HS-K1 produced **2,325 tokens
and was degenerate-free**, while a correct silence on a FORBIDDEN row is short by nature. A floor
convicts brevity. Token counts belong in observability, where a human reads them, not in a gate.

---

## Two rules that follow from the boundary

**1. Warnings never reject.** A postcondition warning routes to
`SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING`, which is a delivered state. Nothing in this
module can withhold a response from a customer.

**2. A structural warning does not escalate to the verifier.** An unresolved link or a meaningless
identifier is a structural defect a deterministic check has already named exactly; there is no
question left for a semantic judge, and paying a provider call to be told what the boundary already
recorded buys nothing. The single warning that *does* raise a semantic question — is an empty
analysis correct here? — is already its own trigger condition, so nothing is lost.

*Disclosure:* rule 2 was adopted after the first replay measurement, in which any postcondition
warning escalated and cost two escalations of REQUIRED rows that had answered correctly. Both
variants are measured and reported (34.1% vs 38.6% of valid calls, with identical miss capture at
4 of 5), and the argument above does not depend on those two rows.

---

## Verification

`backend/scripts/test-expert-reliability-architecture.ts`, cases A–P: 69 assertions, 0 failures,
0 provider calls. The classification table above is exported as
`POSTCONDITION_CLASSIFICATION` so a later operation cannot quietly move a member across the line
without the diff showing it.
