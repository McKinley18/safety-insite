# §246 — Phases 2, 3 and 5, Productionization Architecture

Zero provider calls. Zero database operations. No semantic redesign.

## Phase 2 — the module boundary

The production tree is the repository's existing convention extended by one directory:

    src/safescope-v2/expert-hazlenz/                the Expert module, as it already was
      contract/                                     NEW: the promoted semantic contract, 39 modules
      owed-facts/                                   unchanged: authority, settlement, ledger
      expert-hazlenz-analysis.ts                    NEW: the production entry point
    src/safescope-v2/expert-hazlenz-adapters/       the vendor sibling, as it already was
      expert-request-envelope.ts                    NEW: the canonical request envelope
      expert-semantic-transport.ts                  NEW: the vendor transport

A new top-level `src/expert-hazlenz/` was rejected. The Expert already lives inside `safescope-v2`
alongside `owed-facts/`, which holds property authority and settlement and is imported by the
contract. Moving the contract to a second top-level tree would have split one subsystem across two
roots and forced the authority modules to move with it or be imported across roots.

The adapter split is load-bearing rather than stylistic. `test:expert-nocall-harness` section D reads
every file under `src/safescope-v2/expert-hazlenz/` and fails on a network primitive, an endpoint, a
credential or a vendor name. The 39 promoted modules were scanned against those exact rules **before**
the move and returned zero offenders, which is why they could enter that directory at all. Everything
vendor-bound — the envelope and the transport — went to the sibling adapter directory, exactly as the
existing provider adapter does.

The direction is now the one the authorization requires:

    scripts/  →  src/safescope-v2/expert-hazlenz/contract/

and never the reverse. §246 check C1 scans every production file for an import of `scripts/` and
returns none. The `rootDir` protection in `tsconfig.json` was not weakened; it did not need to be,
because nothing in `src/` reaches sideways any more.

## Phase 3 — how the promotion was performed

The operation was relocation plus one mechanical import repair, and nothing else. No logic was
rewritten, no prompt edited, no schema redesigned, nothing renamed and nothing cleaned up.

Exactly one rewrite rule was applied, to the only five import specifiers that crossed trees:

    '../../src/safescope-v2/expert-hazlenz/'   →   '../'

**Equivalence result: 26 modules byte-identical, 13 differing only on import-path lines, 0 other
changes.** The check is mechanical — for each changed line it asserts the after-text equals the
before-text with that one substitution applied — so "import-only" is proved rather than asserted.
It is re-runnable: `SECTION_246_PREMOVE_DIR=<snapshot> ts-node scripts/test-246-productionization.ts`.

Historical paths keep a one-line re-export shim:

    export * from '../../src/safescope-v2/expert-hazlenz/contract/<module>';

There are roughly three hundred consumers under `scripts/` — `expert-first-pass-instruction-vnext`
alone has 74 — and repairing them all would have been a large diff across evidence tooling for no
behavioural gain. The shims carry no logic; §246 check B2 asserts each one is exactly a single
re-export statement and fails on any other code.

## Phase 5 — the competing implementation, and what it actually was

The §245 framing was that `src/` shipped a rival Expert contract to be removed. The dependency map
falsified that. `expert-prompt.ts` is the **base layer** of the validated chain: vNext extends its
system prompt, wire schema and user prompt, and reconstructs each byte for byte. Deleting it would
have deleted the foundation of the contract the product owner just designated as the product.

So the module is **retained, as part of the canonical implementation**. Its disposition is not
"removed" and not "adapter" in the sense of a wrapper around something else; it is the first link of
the one chain.

What genuinely remained competing is narrower and is stated plainly: the base contract can still be
*run on its own*. `expert-runner.ts` calls a provider, `expert-normalization.ts` validates against
the base schema, and `mergeExpertIntelligence` places the result beside protected authority — a path
that produces Expert conclusions without any §210J/§233/§235/§237/§239 layer.

That path has **no production caller**, and never had one; §245 established that and §246 did not
create one for it. The single production-callable path is now `runExpertHazLenzAnalysis`, which
composes the full §239 chain. The base-only path is reachable only from probes and harnesses under
`scripts/`.

**This is reported as a residual, not as closed.** Reducing it to zero means either deleting the
base-only run path or binding it behind an explicit development-only boundary, and both touch
`anthropic-expert-provider.ts`, which is inside the frozen 29-module protected composite. §246
authorized mechanical relocation and refactoring; it did not name that module, and a protected module
is a stop-and-ask boundary. The recommended disposition, for separate authorization, is the
development-boundary pattern the repository already uses in
`owed-facts/verifier-v3-development-boundary.ts`: keep the path for probes, make it unable to present
itself as the product path.

## What was not done

No semantic change of any kind. No safety-property, owed-fact, driver-role, posture, authority,
settlement, governed-evidence, verifier-responsibility or provider-responsibility meaning was
altered. `property-authority.ts` and `settlement-review.ts` were not modified and the §245
authorization to modify them remains unconsumed. The K6 representation was left exactly as it is —
§246 check G4 asserts the four inadmissible role/carrier pairs are still expressible, so the
migration cannot be mistaken for the remediation.
