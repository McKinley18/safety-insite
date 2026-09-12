# §237 — POSTURE ARCHITECTURE CLOSED

**0 provider calls · 0 database operations · 0 protected modules mutated · §233 and §235 unmodified ·
§234 and §236 evidence unmodified and unrescored · no commit, push, tag or deploy.**

`EXPERT_HAZLENZ_POSTURE_ARCHITECTURE_CLOSED — FINAL_SMALL_SEMANTIC_CONFIRMATION_AUTHORIZATION_REQUIRED`

Six new files. Nothing existing was edited, so the §233 and §235 digests the frozen §236 protocol
records still hold and §236 stays reproducible from the tree. The §237 prompt and schema reduce to
§233 byte for byte.

---

## 1. Was the cessation state deterministically derivable? No

The candidate contract carries eight properties and **not one of them expresses consequence.** They
are candidateKey, hazardFamily, assertedConditionState, groundingStatus, evidence and evidenceBasis,
reasoning, confidence, relationshipToDeterministic and requiresUserConfirmation.
`assertedConditionState` says whether a condition obtains. It never says what the condition requires
of anyone.

Four derivation rules were considered and each is refuted, not merely disliked:

- **ACTIVE implies cessation.** §234 D2 asserts a molten zinc kettle ACTIVE on a case whose correct
  posture is CONTINUE, and §236 A2 runs a poultry line with ACTIVE hazards at
  CONTINUE_WITH_CONTROLS. The authorization forbids it independently.
- **ACTIVE and in the basis and not accepted.** Every §234 CONTINUE_WITH_CONTROLS case and §236 A2
  carry exactly that shape and correctly permit work.
- **Derive it from the required controls.** Controls are not linked to candidates, and the inference
  is circular.
- **Derive it from the declaration branch decisions.** Both are prose, and invariant 3 forbids it.

**The information that exists only in the cessation list is whether an established condition's
consequence is cessation rather than control** — whether any immediate control can make continued
exposure acceptable. That is a judgment about controllability of a hazard, and nothing in the
contract encodes it.

So the judgment is kept. **The duplication is not.**

## 2 and 3. What replaced it, and why the field was removed

`requiredBy: [{ ref, refKind }]` becomes `requiredBy: [{ ref, refKind, driverRole }]`.

The separate `establishedConditionsRequiringCessation` array is gone, and with it seven refusal
codes. Three reasons, in order of weight:

- It duplicated candidate identity, and two of its three rules did nothing but check the copy
  against its original. That is the anti-pattern the authorization named.
- It was separately omissible, and §236 proved it: **all four contract refusals came from that one
  field**, absent on three of nine and malformed on a fourth, while nothing else in the contract
  refused anything.
- **It never once fired.** On all six §236 calls where it arrived, it agreed with the posture. As a
  cross-check it contributed nothing and cost four admissions.

The reference now appears exactly once, on an entry the model produced correctly on nine of nine
§236 calls. There is no second field to omit, nothing to malform separately, and no copy-consistency
rule left to enforce.

The five roles, permissive first, are: requiring no immediate action, requiring controls, requiring
cessation, an unresolved property controlling continuation, and an unresolved response or follow-up.
The first exists so a model naming a real, present, properly controlled hazard as a reason for
CONTINUE has a truthful member to use.

## 4. The posture floor

`ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE` refuses any analysis carrying a cessation
driver under a posture other than STOP. The derived cessation set is `requiredBy` filtered on one
enum member: no default, no inference, no prose. It is deterministic, auditable, reproducible and
structurally complete, and it cannot silently disappear because there is no separate field to omit.
A missing role refuses the entry rather than reading as an empty set.

The floor is enforced from the other side too.
`NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER` refuses a STOP whose only drivers
require controls, so an analysis cannot contradict itself in either direction.

It is not "established hazard means STOP". Nothing infers STOP from severity, from a candidate
existing, or from ACTIVE.

## 5. Response uncertainty

The rule is that only uncertainty about a decision-controlling safety property may change the
immediate work posture by requiring verification before continuation. A posture that does not permit
work must carry at least one driver that is a cessation condition or an unresolved property
controlling continuation. **At least one, not every one**, so a legitimate hold that also declares a
follow-up question is admitted. The repair removes an escalation, never a declaration.

The authorization asked whether an existing property could carry this, and named the right
candidate: `affectedDecision`, a governed enum including REQUIRED_CONTROL. **The §236 evidence
settles it against.** All six declarations across all nine calls came back REQUIRED_CONTROL: on two
legitimate holds, on a CONTINUE, on a CONTINUE_WITH_CONTROLS, on a STOP, and on the C2 defect itself.
The property has no discriminating power on exactly the distinction it looks like it should carry.

A minimal field was therefore necessary, and it is two of five members on an entry that already
exists rather than a new taxonomy.

## 6 and 7. Files and contract

Created: the §237 contract, projection, consistency registry, fixtures and suite, plus the §238
design. Modified: nothing. The §235 wire normalizer is imported whole and unchanged, because §236
proved the transport layer sound and the authorization forbids reopening it.

| | removed | added |
|---|---|---|
| posture properties | 1 | 0 |
| basis entry members | 0 | 1 |
| transmitted rules | 4 | 4 |
| refusal codes | 7 | 5 |

**The payload did not shrink.** The role vocabulary and its definitions cost more than the removed
property saved, about two per cent up on §235. What changed is not size but where the obligation
sits.

Bidirectional alignment holds, with two directions added because removal is where alignment breaks:
nothing retired survives anywhere in the transmission, and each of the eight rules carried forward
from §235 is byte-identical to its original. The check earned its place on the first run by catching
a stale citation: `POSTURE_BASIS_ITEM_MALFORMED` cited the basis required list, which §237 changed by
adding the role, so the citation was restated rather than left to rot.

## 8 and 9. Local results

All fourteen authorized validation items pass.

| | |
|---|---|
| §237 local suite | 204 passed, 0 failed |
| §237 contract consistency | 8 / 8, plus two tests that watch it fail |
| §235 contract consistency, still green | 6 / 6 |
| §235 suite | 209 passed, 0 failed |
| §233 suite | 109 passed, 0 failed |
| protected ladder | 17 / 17, 0 failed, 0 missing |
| production typecheck | PASS |
| protected composite identity | `37ce9eb8…`, unchanged |

The two §236 failure modes are now structurally impossible rather than merely unlikely. A model that
omits the retired field cannot lose the floor, because the field does not exist. A model that still
emits it in the exact wrong shape §236 observed is neither refused for it nor helped by it, and a
populated stray list cannot manufacture a floor the roles do not give.

Regression: all fourteen §233 scenarios produce identical §233 codes and admission; the retained
resume-coherence rule produces the same outcome on the §235 fixtures; no union type appears; no root
property and no posture sub-property is added; the acceptance-list entry is byte-identical to §233;
and every prose field can be replaced with arbitrary text without changing a single verdict.

## 11. What is not fixed

**D4 is a floor, not a fix.** It refuses a hold whose drivers are all labelled response-only. A model
that believes a response question is decision-controlling will label it so, and no deterministic
rule refutes that without reading prose. §236 C2 would be caught only if the model labelled the
unit-seven question as response uncertainty. The same caveat applies to the cessation role, inherited
from §235 unchanged.

Relocating the obligation onto the basis entry is a reasoned bet that a member on an entry the model
produced correctly nine times out of nine will arrive more reliably than a separate required array.
**It is not proven.** A dropped role still refuses the analysis.

No §237 change has been exercised against a provider. Invariant 27 governs.

## 12 and 13. The final confirmation, proposed not authored

**Six calls, one arm, first-pass only.** Two established STOP cases with distractor uncertainty, one
distractor being an unavailable measurement and one the C2 response shape. Two legitimate HOLD cases,
one of them with a mixed basis, as the mandatory overcorrection guard. Two permissive cases carrying
response or follow-up uncertainty, at least one being the C2 shape precisely: it is unknown whether
somebody has already taken the action the analysis would otherwise ask for.

| | |
|---|---|
| projected spend | USD 0.6549 |
| worst case | USD 0.6861 |
| recommended hard ceiling | USD 0.85 |
| retries | 0 |

Costed from the §236 measured mean of USD 0.105961 over nine calls with a three per cent payload
uplift. Nothing is carried over from §231 or §234.

The pass rule scores driver-role identity **separately** from posture identity, because a right
posture reached through a wrong role is not a clean pass. A refusal on the new rule is also a failed
case, and it must be reported apart from a mislabel: a refusal means the contract caught it and a
mislabel means it did not.

The six observations are deliberately not authored, the gate §233 used before §234 and §235 used
before §236.

**This is the last intermediate posture cohort the programme may run.** The four product-level
options are written into the design document now, before the result is known: accept a human-review
containment boundary, move the distinction into stronger governed logic, redesign the semantic
component, or hold the Expert release.

---

**TERMINAL:
`EXPERT_HAZLENZ_POSTURE_ARCHITECTURE_CLOSED —
FINAL_SMALL_SEMANTIC_CONFIRMATION_AUTHORIZATION_REQUIRED`**
