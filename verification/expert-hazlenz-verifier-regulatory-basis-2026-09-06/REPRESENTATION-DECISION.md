# §194 — Representation decision

## The three §193 options, and which was taken

§193 escalated three routes. The authorization named the first as preferred, and the analysis
supports that — with one caveat recorded below.

**1. Structured regulatory basis — TAKEN.** Existing architecture supports it cleanly. The verifier
input has always carried `governedEvidence[{ sourceId, text }]`, and the first pass has always bound
model claims to those ids with `EVIDENCE_SOURCE_UNKNOWN`. §194 is an application of an established
pattern to a path that lacked it, not new architecture.

**2. Reword the fail-closed claim — SUBSUMED.** Option 2 would have made the contract truthful by
narrowing the promise. Option 1 makes it truthful by making the promise keepable: raw citation is
refused whole (deterministic), and regulatory reliance now has a legitimate route that is validated
rather than inferred. The prohibition's fail-closed claim becomes accurate for *citing or quoting* —
which is what it always literally said.

**3. Accept the residual — REJECTED.** It would have left a stated fail-closed consequence the
architecture does not deliver, which is the defect §193 named.

## What remains outside deterministic reach, stated plainly

**Option 1 does not make every regulatory proposition decidable.** A verifier can still write a
regulatory-sounding sentence in prose and declare `NONE`, and no deterministic rule catches that —
for exactly the reason §193 established. What changes is the architecture's relationship to it:

- there is now a **legitimate route**, so a verifier with real governed backing has somewhere to put
  it, and declining to use it is a choice rather than an absence;
- reliance is **fail-closed where it is claimed** — an unsupported claim of authority cannot be
  admitted;
- an undeclared prose assertion is now a **semantic reviewable** rather than a contract hole, and it
  is reviewable against a declaration that says `NONE`.

That is a genuine improvement and it is not total. It should not be described as closing the
prose-assertion class.

## Why not enumerate sourceIds into the schema, as the first pass does

`expert-prompt.ts` puts supplied ids into the wire schema as an `enum`, making an invented id
**provider-side** invalid. Strictly stronger, and it was considered.

It was **not** taken because it makes the response schema per-request, and the verifier protocol's
identity hash would stop being a single stable value. §187–§192 have shown how much this programme
rests on a stable protocol hash: preregistrations pin it, integrity gates assert it, and populations
are defined by it. The same guarantee is obtained deterministically at admission —
`SOURCE_ID_NOT_IN_SUPPLIED_SET` — which is exactly what v3 already does for `bindingFactKey`.

Worth revisiting if a future cohort shows providers inventing ids at a rate that wastes executions.
The evidence for that does not exist yet.

## Naming

`regulatoryBasis`, with `reliance` / `sourceIds` / `proposition`. The authorization invited a better
canonical concept if one existed; none does — *reliance* appears in the repository only in unrelated
advisory prose. The **concept** names that matter, `sourceId` and closed-set membership, are canonical
and reused verbatim.

## Scope held

No clarification-frequency change, no conjunctive-sufficiency change, no adjacent-property change, no
challenge change, no owed-fact targeting change, no settlement change. Ten §191/§166 passages are
asserted byte-identical in v3.2 (proof suite C.1), and the inserted block is checked against four
frequency-directive patterns (C.2). `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` (12).
