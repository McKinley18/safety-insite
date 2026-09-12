# Verifier instruction v2 → v3 — classified semantic diff

**hazlenz.expert.verifier-instruction.v2** `ffc63119b5a30ec88e09a078b75ae45e…` → **hazlenz.expert.verifier-instruction.v3** `678160c95bc7db385d49f3b4d5077fb8…`

105 lines → 145 lines · **42 added, 2 removed** (12 of the added lines are blank).

| classification | lines |
|---|---|
| `BINDING_PROTOCOL_REQUIRED` | 39 |
| `SCHEMA_ALIGNMENT_REQUIRED` | 5 |
| **`SUBSTANTIVE_SEMANTIC_CHANGE`** | **0** |

`V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL = TRUE`

The classification table is checked in BOTH directions against the real diff: an actual
change with no table entry is `UNCLASSIFIED_CHANGE`, and a table entry with no actual
change is `STALE_CLASSIFICATION`. Both are empty (0 and 0).

---

## Removed lines — all of them

- `SCHEMA_ALIGNMENT_REQUIRED`
  ```
       A fact that would change what is done now is not asked about. Supply the question, and say
  ```
  the second half of the sentence names v2's either/or source-mode choice, which v3 replaces with an explicit binding key that may coexist with a nomination
- `SCHEMA_ALIGNMENT_REQUIRED`
  ```
       whether it came from a SUPPLIED_FACT or from a NOMINATED_FACT of your own.
  ```
  names v2 fields under a v2 exclusivity that v3 removes

Those two lines are the ENTIRE removal set. Everything else in v3 is an insertion.

## Added lines, by classification

### `SCHEMA_ALIGNMENT_REQUIRED` — 3 non-blank lines

```
     A fact that would change what is done now is not asked about. Supply the question. If it
```
the same instruction, re-wrapped because the trailing clause changed

```
     answers one of the facts you were given, put that fact's key in bindingFactKey. You may ALSO
```
names the v3 field that replaces the v2 source-mode choice

```
     nominate one fact of your own in the same answer.
```
states the coexistence v3 adds; under v2 this shape was refused by the contract

### `BINDING_PROTOCOL_REQUIRED` — 27 non-blank lines

```
EACH UNRESOLVED FACT YOU ARE GIVEN CARRIES A factKey. Those keys are fixed, and they are the only
```
introduces the closed set the binding protocol depends on

```
way to refer to those facts. Copy a key exactly when you use one: a key you invent, abbreviate or
```
states the exact-copy requirement the contract enforces by string equality

```
respell is not a key, and a verdict carrying one is discarded whole.
```
states the whole-verdict refusal the contract already performs

```
   A NOMINATION IS ADDED TO THE FACTS YOU WERE GIVEN. It never replaces one and never answers
```
states the additive invariant; v2 had no way to express coexistence so had nothing to say

```
   one. You may nominate at the same time as answering a supplied fact, and doing both is the
```
states the new permitted response shape

```
   right answer whenever both are genuinely needed now.
```
completes the sentence above; adds no new test of decision-criticality

```
     THIS VERDICT RESOLVES NOTHING. It says only that YOU propose no question. It does not mark
```
states the coverage consequence of silence; v2 had no owed-fact ledger to speak about

```
     any fact you were given as answered, and it never removes one from the list.
```
completes the sentence above

```
6. NOW ACCOUNT FOR EVERY FACT YOU WERE GIVEN, ONE LINE EACH, BY ITS factKey.
```
the declaration step itself

```
   This is bookkeeping, not a second judgement. For each fact say exactly one of:
```
explicitly denies that step 6 adds a judgement, which is what keeps it representational

```
   BOUND_BY_CLARIFICATION
```
declaration member name

```
     The question you are supplying answers THIS fact. At most one fact may carry this, and its
```
states the one-binding ceiling the contract enforces

```
     key must be the key you put in bindingFactKey.
```
states the agreement the contract checks between the declaration and the binding field

```
   STILL_UNRESOLVED
```
declaration member name

```
     You are not answering this fact. That is a normal and frequent answer, and it is the right
```
mirrors v2's existing "NO is a good answer" posture onto the new field rather than introducing a new one

```
     one whenever you are unsure. The fact stays open.
```
completes the sentence above

```
   CHALLENGE_FACT_VALIDITY
```
declaration member name

```
     You believe this fact should not have been raised: the observation already settles it, or
```
restates v2 step 1 and step 2 as the two grounds for a challenge; introduces no new test

```
     answering it either way leads to the same thing being done today. Give your reason.
```
restates v2 step 2's two-branch test as the challenge ground

```
     THIS IS A REQUEST, NOT A DECISION. The fact stays open until it is reviewed, and nothing
```
states the boundary that keeps arbitration HazLenz-owned

```
     you write here removes it.
```
completes the sentence above

```
   Every key must appear exactly once. A fact you do not mention is not thereby handled.
```
states the completeness rule the contract enforces

```
   AND ONE FACT DOES NOT COVER ANOTHER. Answering the fact keyed A leaves the fact keyed B
```
states the no-implicit-sibling-coverage rule

```
   exactly where it was, however closely related the two sound.
```
completes the sentence above

```
YOU ALSO MAY NOT mark a supplied fact answered by any route other than bindingFactKey. Saying in
```
extends v2's existing YOU MAY NOT list to the new field; adds no new judgement

```
your reasoning that a fact is covered does not cover it.
```
completes the sentence above

```
There is no expected number of bindings and no expected number of challenges either.
```
extends v2's existing no-quota statement to the new fields, so the new fields inherit the same absence of a target that questions, silences and nominations already have

## v2 blocks that must survive, checked positively

A diff reporting no change to a block and the block still being present are different
claims. Only the second one supports the preservation argument, so each is checked by
substring against the v3 text.

| block | present in v3 |
|---|---|
| the "usually NO" nomination prior | **yes** |
| step 1, what is actually unresolved | **yes** |
| step 2, the two-branch decision test | **yes** |
| the MAGNITUDE anti-pattern | **yes** |
| the unseen-control rule | **yes** |
| step 3, is it already asked | **yes** |
| the DO NOT nominate list | **yes** |
| the nomination proof burden | **yes** |
| the no-invented-hazard rule | **yes** |
| the ABSTAIN definition | **yes** |
| the YOU MAY NOT authority list | **yes** |
| the no-quota closing | **yes** |

## Contract diff

| field / rule | op | classification | why |
|---|---|---|---|
| `bindingFactKey` | ADDED | `BINDING_PROTOCOL_REQUIRED` | the closed-set binding declaration §165 proved v2 could not express. Checked by exact string equality against the supplied keys — no fuzzy match, no normalisation |
| `owedFactDeclarations` | ADDED | `BINDING_PROTOCOL_REQUIRED` | one explicit line per supplied fact, so silence about a fact becomes impossible and a challenge becomes a recorded request rather than an inference |
| `clarificationSourceMode` | REDEFINED | `SCHEMA_ALIGNMENT_REQUIRED` | v2's two members are preserved and SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION is added for the shape v2 refused with NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE. The contract checks the declared mode against the actual payload, so it cannot disagree with it |
| `aboutUnresolvedFactRef` | REMOVED | `SCHEMA_ALIGNMENT_REQUIRED` | superseded by bindingFactKey, which is the same idea checked against a closed set. Two fields meaning one thing is how a binding gets asserted in one and denied in the other |
| `NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT (rule)` | REMOVED | `SCHEMA_ALIGNMENT_REQUIRED` | v2 caught a renamed supplied fact with a 0.8 content-overlap threshold. v3 addresses supplied facts by key, so the structural rule NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY replaces it. The lexical threshold is DROPPED rather than tightened because an overlap score is a free-text semantic gate, and §160 FINDING 1 is why this programme does not run one |
| `proposedClarification` | REDEFINED | `SCHEMA_ALIGNMENT_REQUIRED` | replacesClarificationId is not carried into the v3 schema; the field was never populated in any executed draw and a binding now expresses what it gestured at |

Contract `SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = 0`.

