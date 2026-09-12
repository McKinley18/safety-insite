# Customer question burden — design review

**§168, 2026-09-04. Design only. Zero provider calls. No frontend implementation, and none is
authorized.**

---

## 1. The separation this document turns on

| | measures | §167 evidence |
|---|---|---|
| `STRUCTURAL_QUESTION_BUDGET` | how many question *slots* the architecture will emit | HS-A1 mean 1.83 distinct facts/draw (max 2); HS-E1 1.00 (max 1) |
| `SEMANTIC_QUESTION_NECESSITY` | whether each question *needed* asking | **not measured, and not measurable from §167** |

The 1.83 / 1.00 figures are volume on two `REQUIRED` rows — rows where a question was the right
answer. They establish that the architecture does not multiply questions without bound on material
that warrants one. **They establish nothing about acceptable customer burden globally**, because
burden is dominated by the case §167 could not include: rows where the right answer is to ask
nothing. That is the same `FALSIFIER_D_TESTABLE = FALSE` gap, arriving from a different direction.

---

## 2. Should compound questions be split?

**Yes — and the cleanest fix is structural, not textual.**

Two HS-A1 draws returned one `question` string containing two questions, about **different
equipment** with **different immediate controls**. Under the §165 combination rule those two facts
fail the test (same decision, but not same equipment, and the adverse-answer actions differ), so
they should not have been combined.

Three ways to fix it, in increasing order of robustness:

| approach | how it works | assessment |
|---|---|---|
| **post-hoc string splitting** | HazLenz splits the returned string on a marker | **not recommended.** Splitting on `"and separately,"` is a lexical heuristic on model prose; it will mis-split, and a mis-split safety question is worse than a compound one |
| **refuse compound strings at admission** | the contract rejects a `question` containing two interrogatives | needs a structural test that does not read meaning. No such test exists — question-count-by-punctuation would refuse legitimate two-branch questions, as §168's own weak marker did on two draws |
| **give each declared fact its own question field** | the schema carries `question` for the binding and a separate question for the nomination | **recommended.** It cannot mis-split, it needs no heuristic, and the second fact is *already* structurally separate in the response — every nomination carried its own fully-proved object regardless of what the string said |

The third is a v3 schema revision and therefore its own authorization. It is small: one nullable
field, and the contract rule that a nomination must carry it.

## 3. Should multiple independent required-control facts appear as separate prompts?

**Yes**, when the §165 combination test fails — which is the normal case for facts on different
equipment. The rule already exists and is correct; what it lacks is reach over the verifier's
returned string (see `ARCHITECTURE-COMPONENT-STATUS.md` §8).

The HS-A1 shape is the illustrative case: the flame-failure fact and the auger fact have the same
`affectedDecision` but different equipment and **different immediate actions** if answered
adversely — shut down the burner versus stop the clearing work. Merging them into one prompt asks a
person to answer two different stop/continue decisions in one reply.

## 4. Can the UI present them sequentially?

Design position, not implementation:

- **Sequential, one decision-critical fact at a time**, is the right default. It keeps each answer
  attributable to one fact, which is what the owed-fact ledger needs to mark exactly one key covered.
- **Batching is acceptable only where the §165 combination test passes** — same decision, same
  equipment or task, both independently answerable in one reply.
- **A partial answer must be representable.** If a person answers the first fact and stops, the
  second must remain `UNRESOLVED` with the coverage warning live. Any UI that requires all questions
  to be answered before recording any of them would destroy that.
- **Deferral is recorded, never discarded** — already the budget's rule; the UI must not offer a
  "dismiss" that leaves no record.

## 5. Maximum unresolved life-critical facts shown at once

The §165 budget already fixes the safety-critical half of this and it should not be relaxed for
presentation:

- a `LIFE_CRITICAL` gap is **never** dropped to fit a budget;
- if one cannot be presented, the analysis surfaces `UNRESOLVED_SAFETY_STATE` rather than a tidy
  list, and the deterministic HazLenz findings still stand and are still shown.

**A presentation limit is therefore not a cap on what survives internally.** The open design
question is only how many are *shown simultaneously* — and the recommendation is **one at a time,
with the count of remaining unresolved life-critical facts visible**, so a person is never unaware
that more exist. Hiding the count would reproduce, at the UI layer, exactly the silent-drop failure
the architecture was built to prevent.

## 6. Follow-up sequencing and cognitive burden

- Ask the highest-priority unresolved fact first — the budget's ranking is already
  `LIFE_CRITICAL → REQUIRED_CONTROL → OTHER`, deterministic and stable.
- Re-evaluate coverage after **each** answer, so a later question is never asked about a fact an
  earlier answer settled.
- Carry the two-branch divergence into the presentation where it helps: a person answering is better
  served by knowing that one answer means work continues and the other means it stops than by the
  bare question. This is available for free — every owed fact already carries both branches and both
  decisions.
- Never re-ask a fact marked `SETTLED_BY_EVIDENCE` or `REJECTED_BY_ARBITRATION`.

---

## 7. What this design cannot settle, and must not be read as settling

**Acceptable customer burden is not established by §167 and cannot be.** Both rows warranted a
question. The burden that matters in production is the burden on the many observations where nothing
needs asking, and whether the architecture stays quiet on those is exactly `FALSIFIER_D`, which has
no denominator.

Concretely: a design that asks 1.83 questions on rows that need one is well-behaved. The same design
asking 1.83 questions on rows that need **none** would be unacceptable, and §167 cannot distinguish
those two worlds. **No customer-burden claim may rest on this operation.**

## 8. Design items for a future authorization

Recorded, not started:

1. a v3 schema revision giving the additive nomination its own question field *(recommended, small)*;
2. a UI sequencing specification implementing §4–§6;
3. a burden measurement that includes silence controls — blocked on the same missing truth as
   falsifier D.
