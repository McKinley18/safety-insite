# §252 — §243 Structural Failure Register

Zero provider calls. Zero database operations. Every row is traced from the preserved §243 provider
bytes in `RAW-243-FIRST-PASS.jsonl`, which were read and never rewritten. The machine-readable form
is `SECTION-252-SECTION243-STRUCTURAL-REPLAY.json`.

This is not a capability rescore. §243 stands at D HOLD RELEASE and no semantic judgement, posture
expectation or driver-role expectation is revisited. Correct refusal is an acceptable outcome and no
§243 output was repaired to make it usable.

## The classes, and how the candidate handles each

For every class: the exact malformed output, the deterministic path that receives it, whether the
candidate accepts or refuses, whether any semantic content is invented, whether unresolved
decision-critical truth survives, and whether an unsafe authorization can escape.

### 1. Required-field conformance failure — G4, G8, C3

**The output.** Generation stopped after `expertExplanation`. On G4 and G8 four root fields never
arrived, including `immediateSafetyPosture`; on C3 only `outcome` was missing. G8 additionally
returned two `tool_use` blocks for the same tool.

**Path.** `gateExpertOutput252` → `projectPosture239` → §233 P1.

**Disposition.** REFUSE. The gate alone reports five violations on G4 and G8 and one on C3, before
any posture check runs. §233 independently raises `POSTURE_MISSING` and §235 raises
`WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT`. Three independent layers refuse the same output.

**Invention.** None. Absent root fields are recorded as absent and nothing is supplied for them.

**Unresolved truth.** None was identified on these outputs, so nothing was owed and nothing was lost.

**Escape.** No. The posture never enters canonical state, so no authorization exists to escape.

### 2. Placeholder / schema-artifact wrapper — C7, M5

**The output.** C7's tool input had the single key `parameters`; M5's had the single key
`$PARAMETER_NAME`.

**A correction to the §244 characterization, from the bytes.** §244 recorded that neither carried
analysis content. The preserved bytes show otherwise: **both wrappers contained a complete
nine-field analysis.** What differs is only the wrapper key.

**Path.** §235 envelope unwrapping → the gate → the posture projection.

**Disposition.** Different, and correctly so. `parameters` is a member of the closed inert-wrapper
set, so C7 is unwrapped, passes the gate cleanly, and is then refused by
`POSTURE_BASIS_REF_DUPLICATED` on its own content. `$PARAMETER_NAME` is not a member, so M5 is left
wrapped fail-closed, and the gate reports ten violations — nine absent root fields and one undeclared
property. Refusing to unwrap an unrecognised key is a deliberate narrowness, not an oversight:
"it looks like a wrapper" is a reading, and this layer does not read.

**Invention.** None on either.

**Unresolved truth.** None identified on either.

**Escape.** No.

### 3. K6-invalid role/carrier structure — M2

**The output.** A `requiredBy` entry giving `UNRESOLVED_RESPONSE_OR_FOLLOW_UP` to a
`HAZARD_CANDIDATE`, one of the four inadmissible pairs.

**Path.** The gate admits it — a bare `refKind`/`driverRole` pair is structurally well formed — and
`checkPosture239` D2 refuses it as `DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND`.

**Disposition.** REFUSE, deterministically, with the provider asked to enforce nothing. The matrix
reproduces this as fixture F05 and Candidate Identity element 20 proves by execution that the
production entry point still refuses it.

**Invention.** None. The intended pair is never guessed.

**Unresolved truth.** The declaration itself was admitted in §243; the posture was not. Nothing was
coerced.

**Escape.** No.

### 4. Malformed declaration shape — G1

**The output.** A second declaration missing `branchB`, alongside a posture missing
`whatHappensNow`.

**Path.** The gate → §210J declaration projection → §205 RR-7 preservation.

**Disposition.** PRESERVE_UNRESOLVED. The gate reports both absences; the declaration is refused; and
because it had identified a property, RR-7 preserves that property as a structurally-invalid record
that can never be settled and can never close the analysis. This is the only §243 output on which
unresolved truth had to be preserved, and it was.

**Invention.** None. The preserved record carries the identified property verbatim and the fields
that did arrive; it composes nothing. The invention audit examines exactly that surface and returns
empty.

**Escape.** No. The record is marked inadmissible, unsettleable and requiring upstream repair.

### 5. Semantic-coherence refusal — C1, C4, C6, C7, C8, M2, M4, M6, G1, G2

**The output.** Resume conditions under a permitting posture, cessation drivers under a non-STOP
posture, duplicated basis references, and a driver role contradicting the candidate's own state.

**Path.** §233 P2/P8 and §239 D3/D4, unchanged by §252.

**Disposition.** REFUSE, exactly as in §243. These are not conformance failures and the gate does not
duplicate them; it sits in front of them and they still run.

**Invention.** None.

**Escape.** No.

### 6. A required-field failure §243 did not catch structurally — M4

Worth naming on its own because it is the clearest evidence the gate does work the old pipeline did
not. On M4 `crossHazardInsights[0].confidence` is absent. §243 refused M4, but on
`ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE` — a semantic-coherence code. The missing
required field went unreported. The §252 gate reports it directly.

## The measurement

| | |
|---|---|
| Historical outputs replayed | 24 |
| Fully admitted by the current candidate | 2 (G7, M7) |
| Refused | 22 |
| Unresolved truth preserved | 1 (G1) |
| **Unsafe malformed output admitted** | **0** |
| **Deterministic semantic invention events** | **0** |

"Unsafe admission" is defined mechanically rather than by inspection: an output the §243 run itself
refused which the §252 path now admits. There are none.

## The conformance gate on its own

The gate is the only component §252 adds, so its verdict is taken separately against the §239 schema
each output was actually generated with, and cross-tabulated against what the §243 pipeline concluded
on the same bytes.

| | Cases |
|---|---|
| §243 admitted, gate admits | G3, G5, G6, G7, C2, C5, M1, M3, M7, M8 — all ten |
| §243 admitted, gate refuses | none |
| §243 refused, gate refuses | G1, G2, G4, G8, C3, M4, M5 |
| §243 refused, gate admits | C1, C4, C6, C7, C8, M2, M6 |

The gate over-restricts nothing on the historical corpus: it admits every output §243 admitted. The
seven it admits that §243 refused were refused on semantic coherence, which the gate does not
duplicate and which still runs and still refuses. The gate is an addition in front of the existing
checks, never a replacement for them.
