# §244 — Failure Trace Matrix

Zero provider calls. Zero database operations. Every row is traced from the persisted §243 raw
provider bytes and the deterministic derivations in
`verification/expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12/`.

## The ten admitted cases, driver roles as emitted

`EST-NONE` is ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION, `EST-CTRL` is
ESTABLISHED_CONDITION_REQUIRING_CONTROLS, `EST-CEASE` is
ESTABLISHED_CONDITION_REQUIRING_CESSATION, `UNRES-CTRL` is
UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION, `UNRES-FU` is UNRESOLVED_RESPONSE_OR_FOLLOW_UP.

| Case | Δ rank | Roles emitted | Frozen role expectation breached | Gate |
|---|---|---|---|---|
| G3 | 0 | CAND:EST-CEASE, CAND:EST-CTRL, CAND:UNRES-CTRL, DECL:UNRES-CTRL | EST-CTRL expected NONE | none |
| G5 | +1 | CAND:EST-CTRL ×3, DECL:UNRES-CTRL | UNRES-CTRL expected NONE | none |
| G6 | 0 | CAND:UNRES-CTRL ×2, CAND:EST-CTRL, DECL:UNRES-CTRL | EST-CTRL expected NONE | none |
| G7 | 0 | none emitted | none | none |
| C2 | 0 | CAND:UNRES-CTRL ×3, DECL:UNRES-CTRL ×3 | none | none |
| C5 | +2 | CAND:EST-CEASE ×2, DECL:UNRES-FU | EST-CEASE expected NONE; EST-CTRL expected at least one | HS15 |
| M1 | +1 | CAND:EST-CTRL, CAND:EST-NONE, DECL:UNRES-FU | EST-CTRL expected NONE | none |
| M3 | 0 | CAND:EST-CEASE ×2 | none | none |
| M7 | 0 | none emitted | none | none |
| M8 | +1 | CAND:EST-CTRL ×3, DECL:UNRES-CTRL | EST-CTRL expected NONE; UNRES-CTRL expected NONE | HS15 |

Every posture miss is accompanied by a role-presence breach, and there is no posture miss without
one. Two cases breached role presence while still emitting the correct posture label. The set of
posture misses is a strict subset of the set of role breaches.

## Family A — the eight manufactured declarations and where each was routed

| Case | Declaration | Driver role given | Controlling? | Posture consequence |
|---|---|---|---|---|
| G5 | hold-to-run mode availability | UNRES-CTRL | yes | lifted continue-with-controls to hold |
| G5 | hall noise level | not in basis | no | none |
| C2 | pad seal capability | UNRES-CTRL | yes | none, hold was already correct |
| C2 | today's pre-use check | UNRES-CTRL | yes | none, hold was already correct |
| C5 | duty officer notified | UNRES-FU | no | none |
| M1 | nozzle replacement assigned | UNRES-FU | no | none |
| M8 | storm cell inside trigger distance | UNRES-CTRL | yes | lifted continue to continue-with-controls |

Four of the seven manufactured declarations that reached the posture basis were routed to a
controlling role and three were correctly routed to follow-up. C5 and M1 each manufactured a
declaration and then subordinated it correctly, so on those two cases the manufactured fact is a
precision and restraint defect with no posture consequence at all.

**C5's restriction was not caused by its false owed fact.** The STOP came from two established
conditions carried as cessation drivers. This matters for the repair target.

## Family A — the two sub-mechanisms, by occurrence

| Sub-mechanism | Cases | Description |
|---|---|---|
| A1 established-condition role inflation | C5, M1, M8, and non-consequential on G3 and G6 | an established condition is given a driver role one step more restrictive than the frozen truth allows, on observations that state the negating facts explicitly |
| A2 manufactured fact promoted to controlling | G5, M8, and non-consequential on C2 | a fact the frozen truth does not owe is given the continuation-controlling role rather than follow-up |

M8 is the only case exhibiting both.

## Family B — review artifact, per exercise

| Case | Shape | Packet built | Frozen items surfaced | Missing | State half |
|---|---|---|---|---|---|
| G3 | catch imperfection | yes | 4 of 5 | the adjacent established fact that makes an assurance a proxy | exact |
| G4 | confirm | no | not exercised | no upstream fact existed | not exercised |
| C2 | refuse unsupported | **no packet exists** | 0 of 5 | all five, including that property authority is not obtained | exact |
| C6 | reviewable uncertainty | yes | 4 of 5 | the open sibling property | exact |
| M2 | confirm ×2 | yes | 5 of 5 | none | exact |

In all four exercised cases the authority state machine behaved exactly as frozen. The failure is
confined to what the artifact shows a human.

## Family C — the fifteen calls that were not clean and admitted

| Class | Calls | Codes |
|---|---|---|
| A, conformance, plausibly prevented by provider strict enforcement | G4, G8, C3, C7, M5 | POSTURE_MISSING, WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT, and two schema-artifact placeholder payloads |
| B, semantic coherence, strict enforcement cannot solve | G1, G2, C1, C4, C6, C8, M4, M6 | driver role contradicting candidate state, established cessation driver under non-STOP posture, resume condition under permitting posture, duplicated basis reference |
| C, K6 known-contract refusal | M2 | DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND |
| D, other | C2 verifier | scope containment refused an additive nomination outside the single supplied target |

Five, eight, one and one. Total fifteen.

C7 returned a tool input whose only key was `parameters`; M5 returned one whose only key was
`$PARAMETER_NAME`. Neither carried analysis content.

## Family D — K6, observed

| Step | Observed on M2 |
|---|---|
| model output | `requiredBy` entry `{ref: "measurement-tool-unavailable", refKind: "HAZARD_CANDIDATE", driverRole: "UNRESOLVED_RESPONSE_OR_FOLLOW_UP"}` |
| contract validation | `DRIVER_ROLE_REF_KINDS_239` binds the follow-up role to UNRESOLVED_DECLARATION only |
| refusal | DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND |
| unresolved-truth handling | the declaration itself was admitted; the posture was not. Nothing was coerced |
| product consequence | the user receives no analysis on M2; the case is withdrawn from semantic denominators and counted against Q13 |

C5 and M1 used the same role correctly, on UNRESOLVED_DECLARATION carriers, and were admitted. So
the model can place the role correctly and did so twice; M2 is a carrier error, not a
misunderstanding of the role.

## Family E — posture and controls share one representation

| Link | Where it is enforced |
|---|---|
| a cessation driver forces STOP | `ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE` refuses any other posture |
| requiredControls exist only under continue-with-controls | the transmitted contract states "Required only when the posture is CONTINUE_WITH_CONTROLS"; the projection raises `CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS` and `CONTROLS_PRESENT_UNDER_CONTINUE` |

C5 emitted two cessation drivers. The contract then required STOP, and STOP structurally excludes
required controls. The absent controls are a deterministic consequence of the role error, not an
independent defect. A repair that corrected the posture label without correcting role selection
would be refused by the contract.
