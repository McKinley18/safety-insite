# INDEX — L3 Provider Readiness Gate, Credential-Provisioned Final Retry (2026-08-24)

Terminal: **`L3_PROVIDER_READINESS_BLOCKED — CREDENTIAL_OR_CALLABILITY_FAILURE`**
Decision: **`D-92`** · Blueprint: **§59**

| file | what it records |
|---|---|
| `STATUS.md` | the terminal, the measured result, the method strengthening, what was refused |
| `NEXT_ACTION.md` | the exact next prerequisite and the three mechanisms that would work |
| `FINAL_STATE.txt` | terminal, state bits, and the full required final-report table |
| `preservation/PRESERVATION_PRE.txt` | HEAD, branch, upstream, divergence, worktree, staged state, stash identities, tag objects, digests of every modified tracked file — **pre-phase** |
| `preservation/PRESERVATION_POST.txt` | the same, **post-phase**, proving unrelated work is byte-for-byte preserved |
| `preservation/FROZEN_ARTIFACT_REPROOF_PRE.txt` | canonical package resolved mechanically; holdout, scorer, 16-component acceptance identity and frozen probe all recomputed from disk — **pre-provider** |
| `preservation/recomputed-manifest.txt` | the 16 acceptance components recomputed from disk |
| `boundary/PROHIBITED_INPUT_SET.txt` | the zero-holdout-exposure boundary, written **before** the credential was touched |
| `provider/CREDENTIAL_GATE.txt` | Phase 3, presence-only, every path, including the sandbox-disabled control |
| `provider/PRESENCE_INSTRUMENT_SELF_TEST.txt` | **the new evidence** — a positive control proving every probe path detects a present variable |
| `provider/PHASES_5_6_7_NOT_REACHED.txt` | 0 calls, UNKNOWN not PASS/FAIL, the three terminals this is not, what was refused |
| `identities/FROZEN_IDENTITIES.txt` | 15 identity checks — 11 outer digests + 4 inner re-derivations, OK = 15 |
| `identities/outer-digests.txt` | the 11 outer file digests, each verified against its frozen value |
| `identities/INNER_IDENTITY_REDERIVATION.txt` | raw output of the re-derivation, including the run schema re-serialised through `buildProposalSchema()` |
| `identities/derive-frozen-identities.ts` | the read-only script, copied byte-identical from the retry package |
| `probe/PROBE_IDENTITY.txt` | the frozen probe re-verified, **not** regenerated |
| `probe/probe-observation.frozen-copy.json` | byte-identical copy (`a818b09f…`); the canonical artifact stays in the retry package, unmodified |
| `unspent/HOLDOUT_UNSPENT_PROOF.txt` | Phase 8 — holdout, acceptance identity, three protected sources, 92 rows, full expenditure ledger |

**No provider was called. `HOLDOUT_SPENT = FALSE`. Nothing is retired.**
