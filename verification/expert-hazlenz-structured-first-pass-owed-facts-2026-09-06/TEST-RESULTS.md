# §196 — deterministic test results

```
npm run test:196-structured-owed-facts

  91/91 PASS  ·  0 FAIL
  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE
```

Full per-case output: `TEST-OUTPUT.txt`, captured from the executed run.

```
npm run verify:196-source-integrity

  RESULT: PASS   34/34
```

Full gate output: `SOURCE-INTEGRITY.txt`, recomputed from the files on disk.

Both were executed. Neither result is inferred.

## The authorization's matrix, A–O

| id | requirement | cases | result |
|---|---|---|---|
| **A** | zero owed facts — valid output projects to zero without fabricated gaps | A1–A2 | **PASS** — `[]`, no placeholder, no refusal |
| **B** | one owed fact — every projected field has explicit provenance | B1–B9 | **PASS** — provenance table covers the projected `OwedFact` exactly (12 fields, no orphan row); every upstream field byte-equal; key reproducible from the declaration alone |
| **C** | multiple owed facts — two independent facts with distinct identities and decisions | C1–C4 | **PASS** — including per-declaration refusal that leaves siblings intact |
| **D** | missing required semantic field — projection refuses rather than infers | D1 ×10, D2, D3 | **PASS** — every required field tested individually; no partial fact; no repair from a sibling field |
| **E** | non-verbatim evidence span — refused | E1–E4 | **PASS** — paraphrase refused, unknown source refused, joined fragments refused; whitespace trimming is the only normalisation |
| **F** | invalid / duplicate fact identity — refused | F1–F5 | **PASS** — duplicate handle refused, restatement refused, malformed handle refused, and **two different facts on one span both survive** with `.1`/`.2` |
| **G** | conjunctive fact — A AND B survives without dropping a conjunct | G1–G2 | **PASS** — branch byte-identical, nothing splits on a conjunction |
| **H** | decision divergence — A/B decisions survive exactly | H1–H3 | **PASS** — and a declaration whose decisions agree is refused rather than given a manufactured difference |
| **I** | acceptable-evidence guidance survives if represented | I1–I4 | **PASS** — a HazLenz-held criterion reaches the fact unaltered; `null` remains valid and normal; a declaration carrying a criterion is refused |
| **J** | verifier handoff — projected `OwedFact` enters verifier-v3.2 with no harness-authored semantic augmentation | J1–J5 | **PASS** — a real v3.2 verdict binding a computed key is admitted by the unmodified §194 boundary; every semantic string byte-equal to its declaration |
| **K** | unknown governed source — refused | K1–K4 | **PASS** — refused at the boundary, and made unrepresentable in the transport when nothing was supplied |
| **L** | authorised supplied citation reuse — allowed under valid structured reliance and exact supplied-source match | L1–L5 | **PASS** — §195's collision reproduced against unmodified v3.2, then admitted by v3.3, with the paraphrase route still open |
| **M** | provider-invented citation — refused | M1–M4 | **PASS** — absent token, altered paragraph, mixed authorised/invented, and reuse never assessed while any other code stands |
| **N** | `NONE` + new citation authority — refused | N1–N3 | **PASS** — including the first pass, which gets no reuse allowance at all |
| **O** | no settlement authority — unchanged | O1–O5 | **PASS** — every fact `UNRESOLVED`, no transition recorded, effect false on every axis, HazLenz-owned fields refused |

## Beyond the matrix

| id | what it proves | result |
|---|---|---|
| **P1–P5** | vNext minus its prompt block reproduces v15 byte-identically; vNext minus its two schema additions reproduces v15's schema byte-identically; `expert-prompt.ts` is untouched; the change ledger names exactly three edits | **PASS** |
| **Q1–Q6** | `unresolvedFactDeclarations` is a top-level sibling with no candidate-owned or clarification-owned twin; a declaration projects with zero candidates and zero clarifications; the back-reference is optional, resolves when real, and leaves the question alive when it names nothing | **PASS** |
| **R1–R5** | the citation comparison pattern never matches text the canonical detector would not; no `lastIndex` carry-over on a `/g` regex; clean ≠ reuse-admitted; an empty authorised set refuses everything; the admission matrix and quotation boundary are data | **PASS** |
| **S1–S4** | cross-analysis semantic identity is explicitly **not** claimed; the four residual limits are recorded including the `LIFE_CRITICAL` gap and the missing owed-property field; every non-projecting declaration field has a recorded reason | **PASS** |

## Source integrity, 34/34

- v3, v3.1 prompts, schemas and the v3 admission validator — byte-identical to §187's and §192's
  pinned hashes
- v3.2 prompt and schema — byte-identical to §195's frozen `PROTOCOL-HASHES.txt`
- `expert-prompt.ts` and `EXPERT_SYSTEM_PROMPT` — byte-identical to §187's pinned hashes;
  `EXPERT_PROMPT_VERSION` still `hazlenz.expert.prompt.v15`
- all four `owed-facts/` module hashes — unchanged
- `CITATION_SHAPED_PATTERN` — reused, not redefined
- §189 human gate — still `65 / 112`, **UNMEASURED**
- §195 — `EXECUTED = false`, 0 calls, $0.00, and **each of the eleven execution artifacts still
  absent**, checked individually
- both reconstruction claims — re-proven against the files on disk, independently of the suite
- `backend/scripts` auditability sweep — clean

## One finding the gate produced about §196's own work

The first draft of `expert-first-pass-owed-fact-projection.ts` contained **two literal NUL bytes**,
written where string separators were intended. The §193 auditability sweep caught it and the gate
failed 33/34.

That is the §193 failure mode exactly: a NUL byte makes `grep` treat a file as binary and return
nothing, silently — and **a silent no-match is indistinguishable from a clean audit**. Any
grep-driven scan over that file would have reported clean while inspecting nothing. The separators
were replaced, the file is valid UTF-8 with zero NUL bytes, and the gate now passes 34/34. Recorded
here rather than quietly fixed, because a gate that catches something and is not reported might as
well not have run.

## What these results do NOT establish

- **No hosted behaviour.** vNext has never been sent to a provider; v3.3 has never judged a real
  verdict. Both carry `HOSTED VALIDATED = FALSE`.
- **No first-pass quality.** Nothing here measures whether a model will declare the right facts,
  write possible branches, or anchor a real span. Every case supplies its declarations.
- **No semantic correctness.** A declaration can be perfectly well-formed and completely wrong, and
  the boundary will project it. Whether the two branches are genuinely possible, whether the
  divergence is real, and whether the span shows the fact is open are `REQUIRES_HUMAN_TRUTH`.
- **No §195 result.** §195 remains inconclusive before spend.
- **No §189 measurement.** The human semantic gate is still `UNMEASURED` at 65/112.
