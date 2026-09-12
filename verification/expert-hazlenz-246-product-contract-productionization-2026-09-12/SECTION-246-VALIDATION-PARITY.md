# §246 — Phase 6, Validation Caller Parity

Zero provider calls. Parity is established structurally; no acceptance run was executed.

## The claim, stated precisely

After §246 there is **one semantic implementation**, at
`src/safescope-v2/expert-hazlenz/contract/`, and both the product and the harnesses resolve to it.

The harness side resolves through re-export shims at the historical `scripts/lib/` paths. A shim is a
single `export * from '<production path>'` statement and nothing else; §246 check B2 asserts that for
all 39 and fails on any line of logic. So every existing acceptance script, evidence builder and
regression suite now executes production code while keeping its historical import path.

## What each side may and may not have

| | Production | Harness |
|---|---|---|
| first-pass contract | shared | shared |
| posture / driver-role contract | shared | shared |
| verifier contract | shared | shared |
| deterministic projections | shared | shared |
| request envelope | shared | shared |
| frozen input injection | no | yes |
| deterministic tracing | no | yes |
| evidence capture | no | yes |
| adjudication metadata | no | yes |
| frozen truth, cohort, gates, preregistration | **no** | yes |

The last row is the one the boundary exists to enforce. The seven retained modules — acceptance
cohort, gates, preregistration, protocols, truth specification, the §208 recovery harness and the
§243 assembly — are 6,504 lines of acceptance instrument that the product cannot reach. §246 check E4
asserts the production entry point imports none of them.

## Evidence of parity

| Check | Result |
|---|---|
| C1 — no production module imports `scripts/` | pass, 0 offenders |
| B1 — every promoted module has a shim at its historical path | pass, 39/39 |
| B2 — no shim carries logic | pass |
| E3 — the entry point composes six named contract modules from the production tree | pass |
| E4 — the entry point reaches no harness module | pass |
| A3 — promoted modules are byte-identical or import-path-only | pass, 26/13/0 |

Behavioural confirmation that relocation moved no meaning comes from the protected suites, which were
run after the move: §235 posture stabilization 209/0, §237 posture closure 204/0, §239 contract
binding closure 336/0, §220 KR-1 property authority 43/43, §224 declaration capability 33/0, §226
property selection capability 31/0, and the no-call harness 141/0.

## The honest gap

The authorization asks that the acceptance harness call "the production Expert entry point or a
deliberately thin test adapter around it." What has been established is the weaker of the two
readings: the harness calls the **same semantic modules**, through shims, and the suites prove the
behaviour is unchanged. No acceptance harness yet drives `runExpertHazLenzAnalysis` itself.

That is a real distinction and it is not being glossed. Driving the entry point requires a replay
transport implementing `ExpertSemanticTransport` over preserved bytes, which is straightforward but
belongs with the rebased remediation plan, where a successor acceptance instrument is designed. The
§243 executor itself is spent historical evidence and was deliberately not rewritten — editing the
record of what was executed would corrupt the evidence rather than improve the architecture.

## Two consequences of relocation, disclosed

**The protected composite digest changed.** `verify-229-protected-identities.ts` recomputes the
29-module composite as `d5d66f2e…` against the frozen `37ce9eb8…`, because 8 of its 29 members now
resolve through shims. This is the new development successor lineage the authorization creates. The
frozen value is not rewritten, and the pre-move digests of all 39 modules were captured before the
move so the historical lineage stays verifiable.

**Two kinds of path-scanning check now fail.** `test-218-structured-property-verifier` reports 7
failures: 6 module digest pins computed by historical path, and C15, whose third conjunct is a regex
over the concatenated source text at those same paths. None is semantic. The rule C15 exists to
protect — the §210E whole-field filler rule, `isNonSemanticFiller` — is present and unchanged in the
promoted module, which §246 check G2 asserts directly. Repointing those pins at the production tree
is mechanical and is left for the rebase so that this section changes no suite it did not have to.

Similarly, `tsconfig.scripts-239.json` and `tsconfig.scripts-240.json` scope by glob over
`scripts/lib/expert-2NN-*.ts` and now match shims rather than the implementation.
