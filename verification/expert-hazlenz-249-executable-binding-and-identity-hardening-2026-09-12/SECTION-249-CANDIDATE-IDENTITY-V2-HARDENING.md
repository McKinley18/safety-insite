# §249 — Candidate Identity v2 Hardening

Zero provider calls. Zero database operations.

## The established weakness

§247's identity reported 17 of 17 and still missed that the executable path invoked the §239 builders
while the identity named the §247 ones. It was **declaration-derived**: it began with a list of
expected modules and proved those modules existed. Existence is not invocation, and element 3's proof
checked only that the entry point imported from the contract directory — never which contract version
it called.

The §247 result is preserved as historical evidence of what that procedure concluded. It has not been
edited, and §247's claims have not been retrospectively narrowed.

## The principle now applied

**EXECUTION-DERIVED, not DECLARATION-DERIVED.** The procedure starts from the assembled request —
the bytes the production entry point actually produced — and resolves each load-bearing element by
matching those bytes against candidate implementations. It does not read a module list.

Concretely, element 5 does not resolve because someone wrote `build247SystemPrompt` in a table. It
resolves because the assembled system prompt **reproduces `build247SystemPrompt(governedCount)`
exactly**, and would instead report `build239SystemPrompt` if it reproduced that. Element 6 works the
same way on the wire schema. Element 17 is read off the transmitted schema, not off a contract
module, so a successor that exists but is not sent cannot satisfy it.

Module digests are attached to an element only **after** the bytes have named which implementation it
is. The order is the point.

## Elements 5, 6, 7 and 17

Re-derived from the executable path, not pointed manually at the §247 builders:

| Element | Resolved to | Because |
|---|---|---|
| 5 first-pass prompt | `build247SystemPrompt` | the assembled system prompt reproduces it exactly |
| 6 first-pass schema | `buildExpert247WireSchema` | the assembled wire schema reproduces it exactly |
| 7 driver-role/posture contract | `expert-247-posture-contract.ts` | resolved from the builders the bytes reproduce |
| 17 K6 representation | `anyOf` + `const`, 6 admissible / 0 inadmissible | read off the transmitted schema |

## Element 3, strengthened

The proof now establishes the exact contract successor invoked by the executable entry point, and
requires the compatibility adapter to invoke the same one. It fails if the two paths diverge, and it
fails if the entry point reverts to §239 while the §247 modules remain present in the same directory.

A static companion check lives in `test-246-productionization` E3 and E3b, which name the successor
and assert the §239 builders are not invoked.

## The six required negative fixtures

Each feeds the derivation an assembled request differing in exactly one load-bearing way. **All six
correctly break the identity.** A 17 of 17 that cannot be broken by these is not evidence.

| Fixture | Condition | Identity |
|---|---|---|
| N1 | §239 prompt invoked while the §247 prompt exists | **FAILS** |
| N2 | §239 schema invoked while the §247 schema exists | **FAILS** |
| N3 | K6 successor exists but the invoked schema permits 10 combinations | **FAILS** |
| N4 | `roleJustification` contract exists but the request omits it | **FAILS** |
| N5 | production and adapter invoke different contract versions | **FAILS** |
| N6 | strict schema disabled on an executable path | **FAILS** |

N1 and N2 are the §248 defect itself, reproduced as fixtures. The procedure that missed it now cannot.

## Result

17 of 17 mechanically resolved, 0 written declarations, 0 unresolved elements.

    executable identity digest
    e59cbf26b67a030068a091e8df84f57333c7b19dda28c8718a749d757c8993e6

This binds the new executable lineage. The §247 identity digest is not reused.

## What a "17 / 17" now means

That the executable product is actually the candidate being identified. Under the previous procedure
it meant that a set of named modules existed on disk — which was true throughout §248 while the
product transmitted something else entirely.
