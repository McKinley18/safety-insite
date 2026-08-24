# L3-2d — root cause, demonstrated before any patch

`ROOT_CAUSE_BEFORE_REMEDIATION`. Every claim here was produced by executing the **unpatched** code.
The proof markers are in `rootcause/PROVEN.txt`, recorded before the first implementation edit.

## The method — an ablation, because a prompt cannot be reasoned about

L3-2c's `NEXT_ACTION.md` asserted that its R3 prompt edit caused both remaining gate failures. That
is a hypothesis about a prompt, and prompts do not yield to reading. `scripts/ablate-l32d-prompt.ts`
holds the **model, seed, temperature, schema, user prompt and observation text constant** and varies
**only** the system prompt. Any behavioural difference is therefore attributable to the prompt region
and to nothing else.

The L3-2b prompt was recovered by inverting the three L3-2c edits, and the reconstruction was
**validated empirically** rather than asserted: under it, `H-NG-02` reproduces the `electrical/ACTIVE`
candidate L3-2b actually recorded. `scripts/freeze-l32d-prompt-variants.ts` later froze both
historical texts, and the regenerated hashes matched the ablation's originals exactly:

| variant | sha256 | lines |
|---|---|---|
| v2 (L3-2b) | `676eb15ea839d9de0030f948ef8382e2317a25d6df7d9eabf3ad040d1d3f2e69` | 72 |
| v3 (L3-2c) | `c62ff3eab5559cca534d0269ffed713072ac30eac1e79927d143a8732fcba852` | 76 |
| v4 (L3-2d) | `850192574758e32d4edd3020485e60a8577f76043671f0d1de4e07b0757321be` | 83 |

## D1 — clarification precision `D1_ROOT_CAUSE_PROVEN`

| fixture | v2 (L3-2b) | v3 (L3-2c) | where the question sat |
|---|---|---|---|
| `C-FLD-138` | ACTIVE, no question | ACTIVE, **question** | a DECIDED state |
| `C-CS-05` | HYPOTHETICAL, no question | HYPOTHETICAL, **question** | a DECIDED state |
| `C-AM-04` | ACTIVE, no question | ACTIVE, **question** | a DECIDED state |
| `C-AM-06` | ACTIVE, no question | ACTIVE *or* INSUFFICIENT_EVIDENCE, **question in both** | mixed |

**D1 is two sub-causes, and L3-2c filed them as one.**

* **D1a** — the clarification is attached to a candidate whose condition state is **already decided**.
  Nothing in the L3-2c prompt forbade this: its `you MUST ... filled-in clarification` out-ranked the
  advisory `a question attached to a hazard you can already classify is noise too` seven lines from
  the end of the prompt.
* **D1b** — `C-AM-06`'s **state** is wrong, and given that state its question is legitimate. That is
  the D2 defect wearing D1's clothes.

> **NEW EVIDENCE, contradicting L3-2c's `NEXT_ACTION.md`.** `C-AM-06` was filed there as one of four
> clarification-precision failures. Half its behaviour is D2. Recorded, not silently merged.

## D2 — the ACTIVE rung `D2_ROOT_CAUSE_PROVEN`

| fixture | v2 (L3-2b) | v3 (L3-2c) |
|---|---|---|
| `H-NG-02` | 1 candidate, `electrical/ACTIVE` | **0 candidates** |
| `H-NG-03` | 1 candidate, ACTIVE | **0 candidates** |
| `C-AM-06` | ACTIVE | INSUFFICIENT_EVIDENCE (sometimes) |

L3-2c inserted a **9-line** `THIS BRANCH HAS A REQUIRED OUTPUT SHAPE` block **inside** the ordered
condition-state ladder, directly beneath the ACTIVE rung, making `INSUFFICIENT_EVIDENCE` the longest
rung in the ladder — 10 lines against ACTIVE's 4. **A ladder presented as an ordered test is read as
a ranking; raising one rung lowered the one above it.**

> **NEW EVIDENCE, contradicting L3-2c's `NEXT_ACTION.md`.** `C-NG-05` returns **zero candidates under
> both prompts**. It is a pre-existing provider limitation, not an L3-2c regression, and L3-2c was
> wrong to list it as "the same shape". Recorded.

## Independence — neither proof rests on the other

* Every D2 fixture contains **no subjective, hedged or impression language**, so no clarification
  rule can reach it. The defect is candidate **suppression**, measured as `n = 0`.
* Every D1a fixture keeps its **correct condition state under both prompts** — ACTIVE stays ACTIVE,
  HYPOTHETICAL stays HYPOTHETICAL. Only the presence of a question changes. The defect is
  **attachment**, not state.

## Determinism of the proof

Three repeats per variant per fixture, 24 groups, 22 identical on
`(outcome, candidateCount, anyActive, anyClarification)`. Two borderline groups flip:
`v2/H-AM-01` between 0 candidates and 1-with-a-question, and `v3/C-AM-06` between ACTIVE and
INSUFFICIENT_EVIDENCE — **carrying a question in both forms**. Every D1 and D2 conclusion above holds
in every repeat.

**Recorded as a standing caveat:** at temperature 0 with a fixed seed, borderline scenarios on this
server can still flip. Reproducibility must therefore be measured per phase, not assumed. The L3-2d
sealed holdout measured **77 of 77**.
