# §251 — Strict Structured-Output Wire-Schema Budget Remediation: Final Report

Zero database operations. No commit, no push, no tag, no deploy. No production module was modified.

## Terminal

    EXPERT_HAZLENZ_SINGLE_CALL_STRICT_SCHEMA_INFEASIBLE —
    PRODUCT_OWNER_ARCHITECTURE_DECISION_REQUIRED

The union-typed parameter limit was solved losslessly, from 21 parameters to 3 against a limit of 16
and a target of 12. The compiled-grammar limit was not, and cannot be from within this section: the
**base contract exceeds it with every §247 addition removed and every description stripped**, and the
excess is not of a kind that factoring can reach.

## Required report fields

| Field | Value |
|---|---|
| §243 | **D HOLD RELEASE — PRESERVED** |
| §248 | INVALID — ZERO PROVIDER EXPOSURE |
| §250 | INVALID — PRE-INFERENCE PROVIDER REJECTION |
| Driver-role capability evidence from §250 | **NONE** |
| Frozen cases exposed to inference | **0 / 6** |
| Strict enforcement | **PRESERVED** |
| Provider interaction architecture | **SINGLE CALL** — unchanged |
| Canonical semantic contract changed | **NO** |
| Provider wire representation changed | **NO** — the compaction was designed and proved, not adopted |
| Pre-remediation union parameters | 21 counted locally; 20 counted by the provider |
| Post-remediation union parameters | **3** (2 `type` arrays, 1 `anyOf`) — designed, not adopted |
| Full §239 strict grammar | historically rejected; **reproduced in-session** |
| New full successor strict grammar | **REJECTED** — compiled grammar too large |
| Full real schema probed | **YES** — the complete request assembled by the production entry point |
| Fragment-only proof relied upon | **NO** |
| `roleJustification` semantic content | **PRESERVED** — all eight subfields, no boolean reduction |
| K6 canonical invariant | **6 admissible / 0 inadmissible** |
| Normalization deterministic | **YES** — 10 / 10 round trips, identity |
| Semantic inference in normalizer | **NO** |
| Production / adapter parity | **PASS** — both paths unchanged and identical |
| Candidate Identity | v2 elements remain execution-derived; **v2.1 DESIGNED, NOT FROZEN** |
| Identity elements | 9 designed; 7 execution-derived today, 2 pending an adoption that did not happen |
| Local regression | **PASS** — 15 suites, 1,472 assertions, 0 failures |
| Provider schema probes | **24** |
| Capability-provider calls | **0** |
| Diagnostic spend | **USD 0.043044** |
| Database operations | **0** |
| Frozen six cases | **UNCHANGED and UNSPENT** |
| Substantive instrument changes | **0** |
| New instrument digest | none — no successor instrument was frozen |
| Commit / push / tag / deploy | **NONE** |

## Success conditions

| | Condition | Verdict |
|---|---|---|
| A | complete §247-successor semantic contract remains represented | **MET** in the design |
| B | full actual provider wire schema accepted under strict | **NOT MET** |
| C | union-typed parameter count below the limit with explicit headroom | **MET** — 3 against 16 |
| D | no "compiled grammar too large" error | **NOT MET** |
| E | K6 remains 6 admissible / 0 inadmissible | **MET** |
| F | `roleJustification` semantic content preserved | **MET** |
| G | production and adapter paths use the compact strict schema | **NOT MET** — not adopted |
| H | Candidate Identity v2 derives the compact wire schema from actual execution | **NOT MET** |
| I | validation path uses the identical schema | **MET** — both paths unchanged |
| J | protected semantic regression suites pass | **MET** |
| K | no new TypeScript errors | **MET** |
| L | only the known `POSTURE_REF_KINDS_237` provenance error remains | **MET** |

B, D, G and H fail on one cause. Reauthorization for hosted driver-role confirmation is therefore not
requested.

## Root cause, established by measurement

Twenty-four synthetic schema transport probes, none carrying a frozen observation or customer data,
established seven facts. They are set out in full in `SECTION-251-WIRE-SCHEMA-BUDGET-ANALYSIS.md`;
the four that decide the outcome are:

- **Descriptions are not the cost.** §239 is rejected at 26,327 bytes and still rejected at 6,786
  bytes with every description removed.
- **Literal length is not the cost.** A 3,880-byte schema with every name shortened is rejected while
  a 4,623-byte schema with the original names is accepted. Wire enum coding and field renaming —
  levers 4 and 6 of the authorized order — buy nothing here and were not applied.
- **`$defs` factoring works, but shares shapes rather than property slots.** Fourteen inline copies of
  one shape fail and fourteen references to one definition pass; but sixty-four distinct properties
  all referencing one shared string definition still fail. A contract whose size comes from many
  distinct fields cannot be factored smaller.
- **The budget is provider-wide.** The same schema is rejected identically on `claude-sonnet-5`,
  `claude-opus-5` and `claude-haiku-4-5`.

The arithmetic that ends the section: the base contract needs **72 property slots**; the budget is
bracketed between **46 accepted and 59 rejected**, measured on two independent real subsets. Reaching
it means removing roughly twenty-two slots, on the order of two whole top-level contract sections.
That is the capability reduction §251 forbids, so the section stops rather than taking it.

## What was and was not done

Designed, proved and **not adopted**: the compacted wire representation. It removes the redundant
nullability on `unresolvedElement`, defines the justification narrative core once in `$defs` and
references it five times, hoists `epistemicCharacter` to the basis entry where its per-role enum
lives, and gives each role branch only the fields its role uses. K6 stays 6 / 0, normalization round
trips as the identity on all ten admissible shapes, and no field is deleted or reduced to a flag.

Not done, deliberately: no schema, prompt, envelope, contract or instrument in production was
changed; no semantic content was removed to make anything fit; the six frozen observations were not
touched and were not transmitted; no successor instrument was frozen, because there is no compact
strict executable schema to bind one to; and Candidate Identity v2.1 was not frozen, because freezing
an identity over a representation the production path does not execute would defeat the property v2.1
exists to guarantee.

## One finding that needs a separate decision

`alongsideControlConsidered` is transmitted as nullable and its description invites null where no
alongside control exists, but `checkRoleJustification247` refuses null and raises
`CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT`. The transmitted contract and the validator
disagree about one admissible value, and did so before §251. Removing the null would clear two of the
three remaining unions and align the two, but it changes what the model is asked to write in a case
§247 explicitly contemplates. It is reported, not repaired.

## The decision this returns

The complete Expert semantic contract cannot be transmitted as a single strict tool schema to this
provider without semantic reduction. §251's escalation boundary applies, and the four options are the
product owner's to weigh, not mine:

**A — multi-call strict decomposition.** Split the contract across several strict tool calls, each
within budget. Preserves strict enforcement and every field. Costs more per analysis, and introduces
cross-call coherence as a new failure mode that would need its own gate.

**B — non-strict single call with deterministic validation.** Transmits today, at the price of the
five structural failure modes §244 attributed to the missing strict flag. §243 ran this way. It would
be a deliberate, recorded reversal of the §246/§247 parity repair, not a silent one.

**C — provider or transport change.** Measured and weakened in this section: the limits are identical
across three models on this provider, so this means a different provider or a different structured-
output surface, not a different model.

**D — product-scope reduction.** Remove roughly two top-level contract sections from what Expert
emits. This is the only option that fits the current architecture unchanged, and it is a capability
decision.

STOP.
