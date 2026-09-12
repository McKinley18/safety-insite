# TOKEN-WASTE-MATRIX-210A

Every row is classified `SAFE_TO_REMOVE` · `SAFE_TO_LOCALIZE` · `SAFE_TO_CACHE` ·
`REQUIRES_SEMANTIC_EXPERIMENT` · `DO_NOT_REMOVE`.

**Nothing is proposed for removal because it is large.** Three of the largest components below are
`DO_NOT_REMOVE`.

| # | Stage / component | Semantic purpose | Historical contribution | Necessary? | Candidate optimization | Risk if removed | Class |
|---|---|---|---|---|---|---|---|
| 1 | First-pass instruction + schema block | defines the task, the grammar and the authority boundary | ≥24,388 tok × 24 = **≥585,312** (≥99.5% of first-pass input) | Yes, every call | Cache as a stable prefix; reorder so case-varying schema enums follow the stable prose | None if content is byte-identical; caching changes transmission only | **SAFE_TO_CACHE** |
| 2 | Verifier system prompt + schema + wrapper | defines the verification task and the admission contract | ≥8,759 tok × 24 = **≥210,216** (≥91% of verifier input); **1 distinct identity each** | Yes, every call | Cache; already byte-identical, so no reordering needed | None | **SAFE_TO_CACHE** |
| 3 | Sibling OwedFacts in the verifier payload | none for the target fact | ≤794 tok of cohort spread; present on 6 of 13 adjudicated L rows | **No** | Remove — supply only the target OwedFact | **This is the G6 defect.** 6 of 6 L slots on multi-fact rows drifted | **SAFE_TO_REMOVE** |
| 4 | Sibling clarifications in the verifier payload | none for the target fact | within the same spread; AC-03 carried 2 clarifications for 1 fact | **No** | Remove — supply only the clarification bound to the target fact | AC-03.FACT1.L drifted onto the sibling clarification | **SAFE_TO_REMOVE** |
| 5 | Full hazard-candidate block in the verifier payload | disambiguates the fact's origin | `candidateCount` 2–3 on every row | **Partly** | Localize to the candidate(s) the target fact derives from | AC-22.FACT1.L drifted onto the other two candidates — but AC-21 had 3 candidates and passed. Evidence is 1 of 2 | **REQUIRES_SEMANTIC_EXPERIMENT** |
| 6 | Full observation text in downstream calls | lets the model interpret the evidence span safely | part of the static-bounded payload | **Partly** | Localize to the evidence span + minimum surrounding facts, failing **open** to more context | Truncating context that disambiguates a property would create new RC-A/RC-C failures. TBR-8 forbids silent truncation | **SAFE_TO_LOCALIZE** (with fail-open) |
| 7 | Governed corpus sent to the governed stage | applicability and grounding judgement | 2 sourceIds supplied for AC-22 (`GOV-ECP-01`, `GOV-PPE-02`); 2,778 input tokens total | Yes | **None.** Already bounded to plausibly relevant records | Removing authoritative text is what produced the G14 misgrounding risk in the first place | **DO_NOT_REMOVE** |
| 8 | `missingFact` on the declaration | names the owed property in the model's own words | small | **Yes — critically** | None | **AC-10 proves the cost.** The projection already drops `missingFact`, and the before/after proving qualifier was lost with it (G5) | **DO_NOT_REMOVE** |
| 9 | `branchA` / `branchB` / `decisionIfA` / `decisionIfB` | the partition and the divergence; distinct semantic jobs | small | **Yes** | None — they are not duplicates of each other | Collapsing them recreates D15-style loss; G9 already turns on `decisionIfA` alone (AC-07, AC-18) | **DO_NOT_REMOVE** |
| 10 | `whyUnresolved` / `evidenceSpan` / `acceptableEvidence` | why it is open, where, and what would settle it | small | Yes | None | Each carries a distinct axis (C, D, M). TBR-7 protects them explicitly | **DO_NOT_REMOVE** |
| 11 | Verifier calls on rows with zero admitted facts | none | **0 — already elided** on AC-04, AC-06, AC-23, AC-24 | No | Already done | — | **ALREADY_ELIDED** |
| 12 | Governed stage on rows with zero admitted facts | none | **0 — already elided** on AC-23, AC-24 | No | Already done | — | **ALREADY_ELIDED** |
| 13 | §208 verifier leg re-execution | none — superseded | 207,019 tok / $0.6045 already spent | No | Never re-run; §208B supersedes it | — | **SAFE_TO_REMOVE** (historical) |
| 14 | Repeated per-call schema serialization instability | none | 24 distinct schema hashes for 3 grammars | No | Stabilize serialization; order stable prose before case enums | Breaks prefix caching, which is the single largest saving | **SAFE_TO_CACHE** (blocked by this) |

## What this adds up to

- **Largest saving is entirely semantics-neutral.** Rows 1, 2 and 14: ~$1.36 of a $2.32 run,
  **≈59%**, by transmitting the same bytes in a cacheable order and instrumenting cache tokens.
- **Second saving is also the G6 fix.** Rows 3 and 4 remove material that is both unnecessary and
  implicated in every multi-fact drift. Token saving is small (hundreds of tokens per call); the
  *capability* gain is the reason to do it.
- **Six components are protected.** Rows 7–10 are `DO_NOT_REMOVE`, and AC-10 is the standing proof
  that the field set is already lossy rather than redundant.

## Optimizations explicitly REJECTED for safety

| Rejected optimization | Why |
|---|---|
| Batch several OwedFacts into one verifier call to cut 24 calls to ~15 | Directly contradicted by the G6 evidence: every multi-fact payload drifted. TBR-10. |
| Drop `missingFact` from the declaration since the projection does not carry it | Inverts the finding. AC-10 shows the projection dropping it is the **defect**, not a licence. |
| Collapse `branchA`/`decisionIfA` into one field | Distinct semantic jobs; G9 turns on the decision half alone. TBR-7. |
| Trim the observation to the evidence span only | Would silently remove the surrounding facts that make a property interpretable. TBR-8 requires fail-open. |
| Reduce the governed record text to summaries | The G14 failure is a *grounding* failure; less authoritative text makes grounding harder, not easier. |
| Shorten the first-pass instruction to cut its 24k tokens | It is not duplicated *within* a call — it is duplicated *across* calls. Caching removes the waste without removing a word. |
