# §235 — POSTURE CONTRACT STABILIZED AND THE MANUFACTURED-UNCERTAINTY DEFECT CONSTRAINED

**0 provider calls · 0 database operations · 0 protected modules mutated · §233 unmodified · §234
evidence unmodified and unrescored · no commit, push, tag or deploy.**

Seven new files. Nothing existing was edited. The §233 implementation still carries the digest
`5517337d…` that the frozen §234 protocol records, so the §234 result stays reproducible from the
tree, and the §235 prompt and schema reduce to the §233 ones byte for byte.

`EXPERT_HAZLENZ_POSTURE_CONTRACT_STABILIZED — SMALL_HOSTED_CONFIRMATION_AUTHORIZATION_REQUIRED`

---

## The twelve local validation items

| | |
|---|---|
| contract-consistency tests | 6 / 6 PASS, plus two tests that prove the check fails when it should |
| safe wrapper normalization | PASS |
| JSON-string normalization | PASS |
| malformed strings fail closed | PASS |
| root omission fails closed | PASS |
| manufactured-uncertainty trap | PASS |
| legitimate HOLD cases remain valid | PASS |
| established STOP with a separate unresolved property preserves STOP | PASS |
| coverage rules present in the transmitted instruction | PASS |
| §233 local suite | 109 passed, 0 failed |
| protected ladder | 17 / 17 passed, 0 failed, 0 missing |
| production typecheck | PASS |

The §235 local suite is 209 passed, 0 failed. The §233 and §234 evidence manifests both verify
clean, 6 / 6 and 18 / 18.

---

## Work item one. Wire stabilization

All six §234 anomalies are classified, and the fix is governed by one rule stated before any code:
**normalization may change the container and may never change the content.**

| §234 cases | class | normalized |
|---|---|---|
| F4, S4 | the whole analysis wrapped in a `parameters` or `parameter name` object | yes |
| F3 | three fields each a JSON string holding an object keyed by the field's own name | yes |
| E1 | four required root fields, the posture among them, simply not emitted | no |
| E3, F1 | the posture as a JSON string carrying a trailing brace, so it does not parse | no |
| E3 | an invented near-duplicate root key | no |

An envelope comes off only when the outer object has exactly one key, that key is in a closed
literal set, the outer object carries no declared root field, and the inner object carries at least
one. The last condition is what makes it unambiguous: there is no root content outside the wrapper
that removing it could discard.

A JSON string is parsed only when it parses and the parsed value **exactly satisfies the schema as
transmitted for that field**. A strict structural validator over the subset this programme sends
does that check. Nothing is supplied, edited or guessed, and a shortfall leaves the value exactly as
it arrived.

The self-naming field wrapper is worth calling out because it looks like a liberty and is not. In
§234 F3 the hazard candidates arrived as the string `{"expertHazardCandidates":[ ... ]}`. The
wrapper key is the field's own name, so there is no second candidate for the intended value, and the
unwrapped value is then checked against the schema like any other. It is applied only inside the
JSON-string path, because that is the shape that was observed. An unstringified self-named object is
not unwrapped: an unobserved normalization is speculative surface area on a safety boundary.

### A fail-open the local suite caught

A fixture with an unparseable candidate array was admitted, because a candidate array left as a
string reads as **no candidates at all**, so coverage was satisfied vacuously and a CONTINUE posture
passed on an output whose hazard list never arrived. That is now refused: anything the normalizer
declines to undo means the output did not arrive intact, and the analysis is refused whole. This is
wider than §233 on purpose, since it refuses on a base-contract field the posture projection never
reads. The transmitted schema declared it required, so an output without it is not the output the
contract asked for.

### What the §234 outputs do under the new normalizer

Replaying the sixteen frozen §234 outputs through normalization, with the §233 rules unchanged:

- three of the six wire-shape casualties now reach the projection intact, and one of those is
  admitted outright;
- the other two recovered cases then fail on a coverage rule §234 never stated and §235 now does,
  which is work item two rather than work item one;
- three stay fail-closed, and correctly: the absent-field case and the two malformed strings.

**This is not a rescore and not a prediction.** Those outputs were produced under the §233 contract
by a model that was never told the three rules and never had the new field. Only the container
handling is measurable this way. The frozen 5 / 16 stands untouched.

---

## Work item two. Instruction and validator alignment

Twelve rules are now transmitted verbatim to the model, and a registry binds each one to the
deterministic code that enforces it. The consistency test fails in **both** directions: a code with
no provider-visible statement fails C1, and a rule transmitted with no code behind it fails C3. The
suite proves both by removing a registry entry and by transmitting an unbacked rule and asserting
each check goes red.

The authorization named three gaps. The check found five more:

- filler in the posture narrative was refused and never forbidden;
- the BLOCKING-clarification rule was enforced and never stated;
- controls under CONTINUE were refused on an implication rather than a statement;
- the concurrent-control sequencing rule, the §231 G10 shape, was enforced and never stated;
- and one running the **other way**, which is the §234 E2 finding: the schema already told the model
  to leave the resume lists empty when work may continue, and nothing enforced it.

Field-for-field agreement is checked across five descriptions of the same object: the schema
properties, the schema required list, the declared inventory, the TypeScript interface by
compile-time exhaustiveness, and the fields the projection actually reads.

---

## Work item three. Manufactured uncertainty

The invariant is that an unresolved fact may not be created solely to delay, weaken or replace a
posture that an established controlling property already determines.

The smallest constraint that expresses it is **one required posture field and one rule**. The model
names, from its own hazard candidates, anything whose current established state already requires
cessation, withdrawal or isolation independently of anything still being verified. If that list is
not empty, the posture must be STOP.

An instruction alone would not have been enough. The defect is a representation gap: §233 gave the
model no way to say *this established condition already requires cessation* other than the posture
itself, so an invented unknown could stand between the two with nothing to contradict it. The field
makes the judgment explicit and the contradiction checkable.

The §234 autoclave appears nowhere in the implementation or the fixtures. The local trap is a paper
guillotine with a bypassed two-hand control, and the rule is asserted at every non-STOP posture
rather than at HOLD alone.

**It is a floor, not a fix, and it is disclosed as one.** A model that simply never populates the
list is never refused by it. What the field removes is the ability to name an established cessation
condition and then not stop.

### Not overcorrecting

The rule is about a property whose truth **already determines** cessation. It is not "established
hazard means STOP", and six guards hold that line:

- the instruction says leave the list empty before it says anything else, and the suite asserts that
  the restraint sentence precedes the constraint in the transmitted prompt;
- an empty list constrains nothing, asserted at all four postures;
- a legitimate HOLD on a genuinely unresolved controlling property is admitted unchanged;
- an active, serious, properly controlled hazard accepted without action under CONTINUE is admitted
  unchanged;
- CONTINUE_WITH_CONTROLS is untouched;
- an established STOP alongside a genuinely separate unresolved property is admitted, the STOP is
  preserved, and the separate declaration is still carried and subordinated.

---

## Two scope decisions

**The resume-condition finding was fixed**, because it is trivial, deterministic and required for
coherence: the schema already told the model the rule and nothing enforced it, so leaving it would
have failed the very standard §235 is being held to. It is recorded separately and is not claimed to
explain anything about §234.

**The scorer console label was not fixed.** It is trivial but not isolated. The §234 scorer digest is
recorded in the frozen §234 protocol precisely to prove the scoring code predates the output it
scored, and editing it now would spend that guarantee on a console line whose stored data is already
correct. The fix is carried forward into the §236 scorer instead.

---

## What is not proven

No §235 change has been exercised against a provider. Whether the aligned instruction changes
behaviour, and whether the roughly five per cent larger payload worsens arrival, are hosted
questions. Invariant 27 governs: a schema change is never evidence that a behavioural defect is
repaired.

There is a real tension in this slice and it is recorded rather than resolved. The §234 evidence
suggests payload size may bear on wire-shape stability, and §235 grows the payload while adding the
normalization that recovers half of the §234 casualties. The §236 wire-arrival slot exists to
measure exactly that.

---

## The small hosted confirmation, proposed not authored

**Nine calls, one arm, first-pass only. Three wire-arrival stress cases, three established-property
traps, three neighbouring-degree cases.**

| | |
|---|---|
| projected spend | USD 0.945 |
| worst case | USD 1.28 |
| recommended hard ceiling | USD 1.40 |
| retries, transport or HTTP only | 1 |
| maximum total calls | 10 |

Costed from the §234 measured mean of USD 0.099861 over sixteen calls, with a five per cent payload
uplift. No estimate is carried over from §231.

One of the three traps must be a case whose correct answer is HOLD. That is the overcorrection
guard and it is not optional: a §235 that turns holds into stops has failed, not passed. One of the
two STOP traps must also carry a genuinely separate unresolved property, so the correct answer is a
stop with a real declaration beside it rather than a stop with nothing declared.

**The nine observations are deliberately not authored.** That is the gate §233 used before §234: the
product owner approves the composition, the budget and the pass rule first, and the cases are
authored, preflighted and frozen inside the authorized slice.

---

**TERMINAL:
`EXPERT_HAZLENZ_POSTURE_CONTRACT_STABILIZED —
SMALL_HOSTED_CONFIRMATION_AUTHORIZATION_REQUIRED`**
