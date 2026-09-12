# §251 — Strict Wire-Schema Budget Analysis

Zero database operations. No commit, no push, no tag, no deploy. No production module was modified.
Twenty-four provider calls, all SCHEMA TRANSPORT PROBES under the synthetic protocol, USD 0.043044.
None is capability evidence and no frozen §250 observation was transmitted in any of them.

## What this section was asked to settle

§250 rejected all six frozen cases before inference on two distinct provider limits. §251 authorized a
bounded remediation to make the existing canonical Expert semantic contract transmissible through the
strict structured-output path, without shrinking the Expert job.

The answer this analysis reaches is that **C1 is solvable and C2 is not**, and that C2 is a property of
the base contract rather than of anything §247 added.

## The two limits, measured rather than inferred

| Limit | Provider message | Documented? |
|---|---|---|
| C1 union-typed parameters | `too many parameters with union types (20 …) … limit: 16` | Undocumented; observed only |
| C2 compiled grammar size | `The compiled grammar is too large` | Undocumented; observed only |
| C3 schema complexity | `Schema is too complex.` | Undocumented; newly observed in §251 |

The published structured-outputs documentation states which JSON Schema keywords are supported and
rejected, and confirms that `$ref`, `$defs` and `definitions` are supported and that external `$ref`
is not. It documents **no** numeric limit on unions, grammar size, property counts, enum members,
nesting depth or description length. Every number below is therefore a measurement, not a citation.

## Baseline: what the product actually transmits

Measured on the complete transmitted schema, after the canonical builder, the strict wrapper and the
§108 compatibility strip, for the H1 frozen case shape.

| | §239 base | §247 successor |
|---|---|---|
| Transmitted bytes | 26,327 | 39,076 |
| Bytes with descriptions removed | 6,786 | 10,858 |
| Property slots | 72 | 129 |
| Object nodes | 14 | 23 |
| Unconstrained string slots | 35 | 54 |
| Enum members | 87 | 92 |
| Union-typed parameters | 0 | 21 |

The twenty union-typed parameters the provider counts are the four nullable justification fields
replicated across the five role branches of the K6 union. The twenty-first, the `anyOf` itself, the
provider does not count.

## Seven findings

**F1 — descriptions are not the cost.** The §239 schema is rejected at 26,327 bytes and still rejected
at 6,786 bytes with every description removed. Nothing is gained by moving instruction text off the
schema, so no such change was made.

**F2 — no single section is over budget.** Each of the four largest top-level properties compiles on
its own. The limit is cumulative across the whole schema.

**F3 — literal length does not matter.** A 3,880-byte schema with every property name and enum member
replaced by a short code is rejected, while a 4,623-byte schema carrying the original long names is
accepted. **This refutes compaction levers 4 and 6 of the authorized order:** provider-wire enum
coding and field renaming buy nothing against this limit, and were therefore not pursued.

**F4 — `$defs` factoring works, and is the one effective size lever.** Fourteen inline copies of a
single 8-property shape are rejected; the identical schema with that shape defined once and
referenced fourteen times is accepted. This validates lever 2.

**F5 — `$defs` shares shapes, not property slots.** Sixty-four distinct properties each referencing
one shared string definition are rejected exactly as sixty-four inline string properties are. A
contract whose size comes from many *distinct* fields cannot be factored smaller.

**F6 — the cost unit is the distinct property slot, weighted by value kind.** Sixty-four unconstrained
string slots are rejected; sixty-four six-member-enum slots compile; one hundred and twenty-eight enum
slots are rejected. Unconstrained strings are markedly the more expensive. On the real base contract
the budget is bracketed between **46 slots accepted** and **59 slots rejected**.

**F7 — the budget is provider-wide, not model-specific.** The identical §239 schema is rejected with
the identical message on `claude-sonnet-5`, `claude-opus-5` and `claude-haiku-4-5`, and the union
limit reproduces on `claude-opus-5`. Changing model within this provider raises neither limit.

## The decisive arithmetic

The base contract needs **72 property slots**. The budget sits between 46 and 59. Two independent
59-slot subsets of the real base — the whole contract minus `unresolvedFactDeclarations`, and the
whole contract minus `expertHazardCandidates` — are both rejected.

Three consequences follow, and the third is the one that ends the section.

1. The base §239 contract exceeds the strict grammar budget **with §247 removed entirely and with
   every description stripped**. This is the floor of the current semantic contract, not a ceiling
   imposed by the §247 addition.
2. F5 shows the excess cannot be factored away, because it comes from distinct narrative and
   enumerated fields rather than from repetition.
3. Therefore **no compaction scoped to §247 can make the contract transmissible.** Reaching the
   budget requires removing roughly twenty-two property slots — on the order of two whole top-level
   contract sections — which is the capability reduction §251 forbids.

## What the compaction does achieve

The compaction designed in `SECTION-251-COMPACTION-DESIGN.md` takes union-typed parameters from
**21 to 3**, against a limit of 16 and a target of 12. C1 is fully and losslessly solved with material
headroom. The compacted schema is then rejected on C2, and the real production request, assembled by
driving the production entry point, is rejected on C1 exactly as §250 recorded.

C2 is not reachable from here.
