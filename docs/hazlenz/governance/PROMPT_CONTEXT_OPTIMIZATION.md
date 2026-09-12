# PROMPT AND CONTEXT OPTIMIZATION

**No provider prompt was changed in §223.** This document is an inventory and a set of graded
recommendations. Every item carries a qualitative token-reduction estimate and a change class.

Change classes: **SAFE NOW** · **REQUIRES REGRESSION** · **DO NOT CHANGE**.

---

## 1. What is actually on the wire

Measured locally from `expert-221-assembly.ts`, across the ten §221 cases, with zero provider calls.

| component | average bytes per first-pass call | share |
|---|---|---|
| system prompt | 57,027 | 72% |
| wire schema | 19,317 | 24% |
| user prompt | 2,554 | 3% |
| **total** | **78,898** | |

The verifier leg adds a 24,210-byte system prompt and an 8,247-byte response schema.

**The prompt is dense, not redundant.** Of 632 distinct lines longer than 40 characters in the
composed §210J system prompt, exactly one repeats, costing 65 bytes. There is no byte-level
duplication to reclaim. Any material reduction means removing content, and most of this content is
load-bearing.

---

## 2. Prompt source inventory

Eight first-pass instruction modules and ten verifier contract/instruction modules exist under
`backend/scripts/lib/`, plus `expert-prompt.ts` (v15, 1,636 lines) under `src/`.

**Seventeen of the eighteen variants are on the active §221 import closure.** They are not dead
copies. The first-pass contract is an additive successor chain — `210b2 → 210c → 210e → 210g →
vNext → 210J` — in which each layer inserts a block into its predecessor's text and can reconstruct
that predecessor byte for byte. The pinned identity
`7f1000b84f466586e227852fc43b03349673d9390039ee1c1fe69418004a939c` is the digest of the composing
module, not of a flattened string.

Only four prompt-ish modules are off the §221 closure:
`expert-202-governed-binding-contract.ts` (1,326 lines), `expert-205-first-pass-instruction-r2.ts`,
`expert-verifier-instruction.ts`, `expert-verifier-instruction-v2.ts`.

---

## 3. Recommendations

### R1 — Flatten the additive prompt-ancestor chain into one authored file
**Token reduction: NONE. Change class: DO NOT CHANGE.**
Listed first because it is the obvious-looking move and it is wrong. Flattening produces identical
wire bytes, destroys byte-for-byte reconstruction of every pinned ancestor identity, and breaks the
`reconstruct210gSystemPrompt` and `reconstructBaseWireSchema` guards that prove a successor added
only what it claims to have added. The chain costs reading effort, not tokens.

### R2 — Archive the four off-closure prompt modules
**Token reduction: LOW (development context only). Change class: SAFE NOW.**
They contribute zero wire bytes. Moving them to `backend/validation/archive/` stops an engineer
reading a superseded governed-binding contract and believing it is current. `expert-202-governed-binding-contract.ts`
alone is 1,326 lines.

### R3 — Enable provider prompt caching on the 57 KB system prompt
**Token reduction: HIGH (cost, not content). Change class: REQUIRES REGRESSION — and a governance
decision first.**
The system prompt is byte-identical across every call in a cohort. The §221 freeze recorded
`cachingPosture: DISABLED — no cache_control constructed anywhere`, deliberately, so that every call
was an independent draw. Enabling caching changes the experimental character of a run and must not be
decided inside an engineering slice. Raise it as a product-owner decision for cohorts where
independence of draws is not the point.

### R4 — Move deterministic-findings and governed-record framing out of the user prompt
**Token reduction: LOW. Change class: REQUIRES REGRESSION.**
The user prompt is 2,554 bytes, 3% of the call. Even eliminating it entirely would not matter. Not
worth the regression risk.

### R5 — Replace prose schema-field descriptions with shorter references
**Token reduction: MEDIUM. Change class: DO NOT CHANGE.**
The 19 KB wire schema carries long prose descriptions on semantic fields — for example the
`decisionWhileUnresolved` description that tells the model it is not a truth claim and not a third
branch. §221's own transport accounting records that the as-sent schema measures 19,127 bytes,
*above* the 19,060-byte size at which §199 was refused on grammar complexity, and the freeze treated
the first call as a deliberate compatibility canary. The margin is real, so shrinking the schema is
tempting. It is still DO NOT CHANGE, because these descriptions carry counterfactual and epistemic
discipline that the §221 results show is already under strain, and removing them would confound the
open Class A capability question.

### R6 — Remove context the deterministic engine already knows
**Token reduction: LOW. Change class: DO NOT CHANGE.**
The user prompt states deterministic findings as authoritative and unchangeable. That is not
redundancy; it is the boundary that stops the model contradicting established truth.

### R7 — Split `expert-prompt.ts` into one file per prompt section
**Token reduction: MEDIUM (development context only). Change class: SAFE NOW.**
1,636 lines and 114 KB in one file means any change to one block costs a full read. Splitting changes
no bytes on the wire if the composer reproduces the current string exactly, which is assertable in a
test.

### R8 — Stop loading historical validation narrative into development prompts
**Token reduction: HIGH. Change class: SAFE NOW.**
This is the largest available reduction anywhere in the programme, and it is not a provider-prompt
change at all. `docs/INSITE_ENGINEERING_BLUEPRINT.md` is roughly 308,000 words. The superseded
`docs/expert-hazlenz/` package is roughly 6,800. `CONTEXT_INDEX.md` and the two documents it marks as
always-read total about 2,600 words and are sufficient for ordinary work.

---

## 4. What prompt optimization may never remove

Stated explicitly so no future slice trades one of these for tokens:

- semantic property identity and how a property is named;
- independent preservation of each unresolved fact;
- epistemic discipline — absence of evidence is not adverse truth;
- counterfactual discipline — `decisionWhileUnresolved` is not a truth claim and not a third branch;
- governed evidence boundaries and the prohibition on invented authority;
- settlement semantics and the separation of property authority from evidence authority;
- clarification quality — name both answers and both outcomes before asking.

---

## 5. One observation to carry to the next phase, not to act on here

The composed first-pass user prompt contains a restraint instruction: every typed list starts empty,
an empty list is a complete and correct answer, and an entry must not be added because the list
exists. On IG1 and IG8 the model returned a well-formed empty declarations array while naming the
concern in prose — the Class A silent-non-declaration defect.

Whether that restraint language contributes to under-declaration is **a hypothesis, not a finding.**
It cannot be settled by reading the prompt, and it must not be answered by editing the prompt and
re-running a hosted probe. It belongs in a preregistered instrument in the next authorized phase,
where recall and restraint are measured against each other rather than traded blind.
