# L3 RUN-2 FINAL PRE-SPEND EXECUTION GUARD — INDEX

`READY_TO_AUTHORIZE_L3_RUN2_SEALED_ACCEPTANCE — D_K_WIRED — ANTHROPIC — claude-sonnet-5`
`D_K_ABORT = WIRED_AND_VERIFIED` · `RUN2_HOLDOUT_SPENT = FALSE` · provider calls `0` · `$0.00`

| path | what it is |
|---|---|
| `STATUS.md` | the phase record: the frozen rule, the seam, process-pair behaviour, verification, replay, identity impact, the unspent proof |
| `NEXT_ACTION.md` | the single outstanding gate, and the command shape — **not executed** |
| `PACKAGE_MANIFEST.txt` | `sha256  relative-path` for every file in this package |
| **`guard/dk-abort-guard.ts`** | the frozen `D-K` predicate wired: `D-G.3` classification (pure, content-blind, fail-closed) and the global process-pair abort. **No clear/reset/unfire operation exists.** |
| **`guard/acceptance-execution-loop.ts`** | **the execution seam.** The single loop every required Run-2 provider evaluation passes through, in both processes. Global gate pre-issue, `D-K` fires post-classification. |
| `runner/run-run2-acceptance.ts` | the Run-2 sealed run driver. Frozen stages only; declares `providerEvaluated`; schedules through the loop. **NOT EXECUTED.** |
| `runner/run-run2-sealed.sh` | the two-isolated-process driver, sharing one global abort file. Refuses to start B under an established abort. **NOT EXECUTED.** |
| `verification/synthetic-dk-tests.ts` | the 12 required assertion groups, driving the REAL guard, loop, shipped provider, frozen retry policy and frozen v2 scorer |
| `verification/fixture-transport-server.js` | the local `127.0.0.1` Ollama-protocol fixture. No credential, no outbound primitive. |
| `verification/SYNTHETIC_DK_VERIFICATION.txt` | its verbatim output — **92 assertions, 92 PASS, 0 FAIL** |
| `verification/tsconfig.guard.json` | type-check under the project's own strict config — **0 errors** |
| `replay/run1-counterfactual-replay.ts` | Run-1 structural replay from transport/error metadata only |
| `replay/RUN1_COUNTERFACTUAL_REPLAY.txt` | its verbatim output — abort at **A row 41**, **143 doomed calls prevented**, 7/7 checks |
| `preservation/PRESERVATION_PRE.txt` | HEAD, upstream, divergence, worktree, staged, 4 stashes, 23 tags, before any change |
| `preservation/artifact-identity-impact.js` | the Phase-7 determination, mechanical |
| `preservation/ARTIFACT_IDENTITY_IMPACT.txt` | **`RUN2_ACCEPTANCE_ARTIFACT_IDENTITY_UNCHANGED`**, 0 collisions, and `RUN2_EXECUTION_GUARD_IDENTITY` |
| `preservation/prove-unspent.js` | frozen-identity re-proof, egress audit, unspent proof, worktree preservation |
| `preservation/FROZEN_IDENTITY_AND_UNSPENT_PROOF.txt` | its verbatim output — **40 checks, 40 PASS, 0 FAIL** |

## Reproduction — all zero-cost, none contacts a provider

```
cd backend
./node_modules/.bin/ts-node --transpile-only ../verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/verification/synthetic-dk-tests.ts
./node_modules/.bin/ts-node --transpile-only ../verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/replay/run1-counterfactual-replay.ts
./node_modules/.bin/tsc -p ../verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/verification/tsconfig.guard.json
cd ..
node verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/preservation/artifact-identity-impact.js
node verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/preservation/prove-unspent.js
```

**`runner/run-run2-sealed.sh` is NOT a reproduction command.** Running it transmits Run-2 rows and
flips `RUN2_HOLDOUT_SPENT` to `true` permanently, whatever the result. It requires explicit user
authorization.
