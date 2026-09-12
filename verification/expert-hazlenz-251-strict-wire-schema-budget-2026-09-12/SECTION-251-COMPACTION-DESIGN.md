# §251 — Compaction Design

Zero provider calls were made to produce this design; the probes that validate it are recorded in
`SECTION-251-FULL-SCHEMA-STRICT-PROBE.json`. **The design is NOT ADOPTED into production.** It is
built and proved as an analysis artifact in `backend/scripts/analyze-251-compaction-ceiling.ts`,
because it clears C1 but cannot clear C2, and adopting a representation that still cannot be
transmitted would change the production path for no obtainable benefit.

## The invariant this design obeys

The internal HazLenz semantic model stays exactly as §247 left it. The provider-facing schema is
allowed to differ only where a deterministic, lossless, non-semantic mapping exists in both
directions. Deterministic code here renames nothing, infers nothing, chooses no role and no posture,
and supplies no value the wire did not carry. It moves named fields between two levels of one object,
and that is all.

## Applied in the authorized order

### 1. Remove provider-unnecessary nullability

`unresolvedElement` is today **both optional and nullable**, so three states are expressible:
a string, an explicit null, and absence. No deterministic rule anywhere distinguishes null from
absence — `checkRoleJustification247` never reads the field at all — so the null adds a state that
carries no meaning. It is removed and the field's own description now says to omit the field, which
keeps the transmitted instruction and the schema saying the same thing.

`alongsideControlConsidered` and `whyAlongsideControlInsufficient` **keep their null.** On the
cessation branch they are required, so null is their only way to express "the observation states no
such control at all", which is what their descriptions instruct. Removing it there would change what
the model is asked, so it was not removed.

That leaves two nullable fields, both on one branch.

### 2. Factor the repeated object shape into `$defs`

The justification object is replicated verbatim across all five role branches. The narrative core —
`factualBasis`, `unresolvedElement`, `whyDecisionMaterial`, `whyControllingNotFollowUp` — is identical
in every branch and is defined once as `#/$defs/justificationCore`, referenced five times.

`epistemicCharacter` cannot live in the shared core, because its admissible enum is per-role and that
per-role restriction is the whole of the A2 repair. It is **hoisted to the basis entry**, where each
branch restricts it to the characters its own role admits. Deterministic normalization folds it back
inside `roleJustification`, so the canonical representation is unchanged.

### 3. Reduce the union cross-product with per-role property sets

The three role-scoped fields appear in every branch today, although their own descriptions scope each
to a single role and the deterministic projection reads each only under that role. Each branch now
carries only the fields its role actually uses:

| Branch | Extra properties | Nullable |
|---|---|---|
| `ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION` | none | 0 |
| `ESTABLISHED_CONDITION_REQUIRING_CONTROLS` | `dischargingControlRef` (required) | 0 |
| `ESTABLISHED_CONDITION_REQUIRING_CESSATION` | `alongsideControlConsidered`, `whyAlongsideControlInsufficient` (both required) | 2 |
| `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` | none | 0 |
| `UNRESOLVED_RESPONSE_OR_FOLLOW_UP` | none | 0 |

This states on the wire what the contract already meant. It removes no field the contract asks any
role to supply.

### 4, 5 and 6 — not applied, and why

**Provider-wire enum coding and field renaming (levers 4 and 6) were tested and refuted.** Finding F3
shows a schema with every literal shortened is rejected while a longer-literalled schema is accepted,
so short wire codes buy nothing against the grammar limit. Applying them would have cost the model
readable field names for no measurable gain, so they were not applied.

**No redundant provider-facing structure was found (lever 5).** `driverRole` is a `const` per branch
and is the discriminant itself; `refKind` is the carrier statement and is not derivable from anything
else transmitted.

**A dedicated `Expert247ProviderWire` (lever 6) was not built.** It would only pay if the residual
excess were factorable, and F5 shows it is not.

## Result

| | §247 as transmitted | §251 compacted | Limit | Target |
|---|---|---|---|---|
| Union-typed parameters | 21 | **3** | 16 | ≤ 12 |
| — of which `type` arrays | 20 | 2 | | |
| — of which `anyOf` | 1 | 1 | | |
| Property slots | 129 | 101 | 46–59 bracket | — |
| Object nodes | 23 | 19 | | |
| `$defs` entries | 0 | 1 | | |
| Transmitted bytes | 39,076 | 29,705 | | |

C1 clears with headroom of thirteen against the limit and nine against the target. C2 does not clear,
and the base contract alone would not clear it even if every §247 addition were deleted.

## The one thing deliberately left unrepaired

`alongsideControlConsidered` is transmitted as nullable and its description invites null where the
observation states no alongside control, but `checkRoleJustification247` refuses a null through
`nonEmpty()` and raises `CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT`. The transmitted
contract and the validator therefore disagree about one admissible value, and they did so before
§251.

Making the field non-nullable would remove two of the three remaining unions and would align the wire
with the rule that already governs. It was **not** done, because it changes what the model is asked
to write in a case the §247 description explicitly contemplates, and §251 is transport engineering.
This is recorded as a product-owner item, not repaired here.
