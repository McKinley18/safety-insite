# INDEX — L3 Provider Readiness Gate, credential-provisioned final retry (2026-08-25)

Terminal: **`READY_TO_AUTHORIZE_L3_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`**

| path | what it is |
|---|---|
| `STATUS.md` | the result, the three gates, what was refused |
| `NEXT_ACTION.md` | the one prerequisite that remains, and what it costs irreversibly |
| `preservation/PRESERVATION_PRE.txt` | HEAD, branch, upstream, divergence, full worktree, staged, 4 stashes, 23 tags — **before** |
| `preservation/FROZEN_ARTIFACT_REPROOF_PRE.txt` | canonical package resolved mechanically; holdout, scorer, 16-component identity and the frozen probe, all recomputed from disk |
| `preservation/recomputed-manifest.txt` | the 16 component digests, recomputed, line-for-line identical to the recorded manifest |
| `preservation/PRESERVATION_POST.txt` | the same repository facts **after** the provider call, plus 11/11 frozen digests re-checked |
| `boundary/PROHIBITED_INPUT_SET.txt` | Phase 2, written **before** the credential was touched |
| `provider/CREDENTIAL_GATE.txt` | Phase 3 — `ANTHROPIC_API_KEY_PRESENT = TRUE`, presence-only, with a negative control |
| `identities/outer-digests.txt` | 11 outer file digests, `OK = 11`, `MISMATCH = 0` |
| `identities/INNER_IDENTITY_REDERIVATION.txt` | 4 inner identities re-derived from shipped source, run schema **re-serialised through `buildProposalSchema()`** |
| `identities/derive-frozen-identities.ts` | the read-only derivation, no network primitive |
| `identities/FROZEN_IDENTITIES.txt` | Phase 4 combined result — `OK = 15`, `MISMATCH = 0` |
| `runner/readiness-probe-call.ts` | the disposable single-call runner; one `fetch`, mechanically refuses a second call |
| `runner/shim.log` | the frozen shim's own startup line and its three counted deviations |
| `transport/transport-readiness.jsonl` | **1 record** — status 200, attempt 1, `respondedModel` (**the identity evidence**) |
| `results/readiness-call.json` | the structural result: envelope, parse, binder, validator; **no model prose** |
| `provider/PROVIDER_CALL_AND_MODEL_IDENTITY.txt` | Phases 5–6, including where the returned identity comes from and where it does not |
| `compat/EXECUTION_PATH_COMPATIBILITY.txt` | Phase 7, structural only, and what it deliberately does not claim |
| `unspent/HOLDOUT_UNSPENT_PROOF.txt` | Phase 8 — `HOLDOUT_SPENT = FALSE`, re-proved after the call |
| `FINAL_STATE.txt` | the terminal and the state bits |

**Not in this package, because it was not done:** any acceptance result, any scorer output, any
`G1`–`G10` evaluation, any holdout row, any reserved row, any model prose.
