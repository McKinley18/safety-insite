# §247 — Architecture Closure B: Stale §218 Relocation References

Zero provider calls. Validation maintenance, not product remediation.

## The seven failures

§246 left `test-218-structured-property-verifier` at 106 of 113. All seven failures were caused by the
authorized relocation and none was semantic.

- **Six digest pins.** The suite hashes module files by repository-relative path. Six of those paths
  were promoted into the production tree in §246 and now hold one-line re-export shims, so the hash
  no longer matched.
- **One source-text scan.** C15 has three conjuncts. The two semantic ones — that a placeholder field
  fails closed and raises `PROPERTY_REVIEW_FIELD_PLACEHOLDER` — were unaffected. The third is a regex
  for `isNonSemanticFiller` over the concatenated source of three §218 modules, read at their
  historical paths. Those three were also promoted, so the concatenation was three shims.

## The repair

A single resolver, applied to both mechanisms:

    canonicalModulePath(name)  ->  the promoted module when it exists in the production
                                   contract tree, otherwise the historical scripts/lib path

The pins now hash the implementation wherever it canonically lives; the source scan now concatenates
the implementation rather than the shims. Modules that were never relocated — `expert-218-fixtures`,
`expert-218-legacy-compatibility`, `expert-218-hosted-readiness` — resolve to `scripts/lib` exactly as
before.

## Nothing was weakened, and the proof is arithmetic

**Every one of the six pinned modules moved byte-identically in §246.** Their post-move SHA-256 values
equal the frozen expected values already written in the suite:

| Module | Frozen expected digest |
|---|---|
| `expert-verifier-contract-v3.ts` | unchanged |
| `expert-212-verifier-protocol.ts` | `12214a2f…` |
| `expert-212-challenge-vocabulary.ts` | `f35a1bea…` |
| `expert-214-scope-containment.ts` | `244d3581…` |
| `expert-216-disposition-remediation.ts` | `00b7aed2…` |
| `expert-verifier-instruction-v3-2.ts` | `9ab03212…` |

So not one expected digest was edited, recomputed or relaxed. Only the path the bytes are read from
changed. Had any module moved non-identically, the repair would have required a new digest and a
provenance note; none did.

No assertion was deleted, no assertion was softened, and no assertion was replaced by a weaker one.
C15 still requires all three of its conjuncts.

## Result

`test-218-structured-property-verifier`: **113 of 113 pass, 0 fail.** Relocation-caused failures
remaining: **0**.

## One related item deliberately left alone

`tsconfig.scripts-239.json` and `tsconfig.scripts-240.json` scope by glob over
`scripts/lib/expert-2NN-*.ts` and now match shims rather than implementations. They are experiment
scope typechecks, not assertions about behaviour, and the frozen TypeScript provenance they encode is
preserved untouched under this authorization. Repointing them changes what a scoped typecheck reads
and belongs with a section that is authorized to touch that frozen provenance.
