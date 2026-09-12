# §244 — Revalidation Recommendation

Zero provider calls. This is a design envelope only. No cohort is specified and none may be frozen
until the remediation design is implemented and its scope is known.

## The permanent fact

§243 is permanently D HOLD RELEASE. No remediation converts it into a pass. Any repaired candidate is
a new successor candidate with its own identity, and §243 becomes its provenance, not its evidence.

## Four tiers, in order, each gating the next

**Tier 1 — exact regression tests for repaired mechanisms. Zero provider calls.**

Offline and deterministic, one suite per slice. For Slice 1, assert the assembled request body carries
the strict flag and that the acceptance caller and the production caller agree on every bound
element. For Slice 2, assert the schema's admissible role-and-carrier set equals
`DRIVER_ROLE_REF_KINDS_239` in both directions, and that M2's exact frozen payload is now
unrepresentable. For Slice 3, replay the frozen §243 outputs against the new contract and record,
per case, which refusals change and which do not; this is replay against preserved bytes, not a new
draw. For Slice 4, assert each added packet field is present and populated from the frozen §243 state,
and that the three HS14 occurrences would now surface.

Tier 1 is where most of the confidence should come from, because every repair in this design is
either a configuration change, a representability change, or a copying change.

**Tier 2 — local protected regression for previously passing invariants. Zero provider calls.**

Re-run the existing protected ladder and the §239, §237, §235 and §233 consistency suites unchanged.
The purpose is to prove the slices did not destabilise what passed. Slice 4 touches two protected
modules, so it additionally requires the property-authority and settlement-review suites to pass
byte-identically in behaviour, and the reconstruction proofs to still hold.

**Tier 3 — small hosted confirmation, only where provider behaviour changed. Bounded.**

Only Slices 1, 2 and 3 change what the provider is asked or what it returns. Slice 4 changes nothing
the provider sees and needs no hosted call at all.

The honest purpose of a Tier 3 run is narrow: find out whether Slice 3 moves role-presence coherence.
That is a single question with a preregistered answer, and it should be sized for that question and
nothing else. A handful of cases drawn to exercise established-condition disposition, with the
expectation written down before the call, and a stopping rule that says a null result sends the
question to a capability decision rather than to a fourth contract layer.

Do not use Tier 3 to re-measure anything that passed.

**Tier 4 — minimum whole-product reacceptance, because the candidate changed. Bounded.**

Required only because candidate identity changed, not because capability is in doubt everywhere. Its
size should be proportionate to the slices actually implemented.

If only Slices 1, 2 and 4 ship, the semantic contract is unchanged and the case for a full fresh
whole-product cohort is weak; a targeted reacceptance over the five demonstrated blocker families
plus the human-review shapes would carry the decision.

If Slice 3 ships, the first-pass semantic contract has changed and a wider reacceptance is warranted,
because posture and declaration behaviour could move on any case.

In either event the §242A instrument is spent evidence and may not serve as the successor cohort. A
new instrument must be authored and frozen before execution, and its scope decided then.

## What must not happen

Do not default to another twenty-four-case fresh acceptance. Do not reuse the §242A cases. Do not
decide the hosted cohort now. Do not let a repaired mechanism be confirmed by the same outputs that
diagnosed it.
