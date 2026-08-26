# L3 PROVIDER READINESS GATE — CREDENTIAL-PROVISIONED FINAL RETRY (2026-08-24)

## `L3_PROVIDER_READINESS_BLOCKED — CREDENTIAL_OR_CALLABILITY_FAILURE`
## `PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · `HOLDOUT_SPENT = FALSE`
## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

This attempt was authorized on the statement that `ANTHROPIC_API_KEY` had been **intentionally
provisioned into the parent environment from which this Claude process was launched**.

**It measured the same absence, for the third consecutive attempt — and this time proved the
instrument could have seen it.**

```
ANTHROPIC_API_KEY_PRESENT = FALSE          (unchanged from D-90 and D-91)
```

| path | state |
|---|---|
| current execution environment, `[ -n … ]` | **ABSENT** |
| variable **name** declared at all, `${VAR+set}` | **NO** |
| `env(1)` name-anchored match count | **0** |
| the same check with the command sandbox **explicitly disabled** | **ABSENT — identical** |
| login shell `zsh -l -c` — `~/.zprofile`, `~/.zshenv` | **ABSENT** |
| interactive shell `zsh -i -c` — `~/.zshrc` | **ABSENT** |
| `.env` · `.env.local` · `backend/.env` | **ABSENT — the name is not declared** |
| `backend/.env.local` | file does not exist |
| `.claude/settings.local.json` `env` | **no `env` keys at all** |
| `~/.claude/settings.json` `env` | **no `env` keys at all** |

Every check tested non-emptiness with `[ -n … ]`, counted matches, or listed **key names only**.
**No branch of any check could emit the value, a prefix, a suffix, a length or a hash.** Claude
Code's own authentication was neither inspected nor used (§47.7). The credential appears in **zero
artifacts because none was obtained**.

## The method strengthening this attempt contributes

**The presence instrument was self-tested with a positive control.** A negative result is only
evidence if the instrument could have returned a positive one. A disposable control variable
carrying no secret was pushed through **every probe path Phase 3 uses**:

| probe path | control variable |
|---|---|
| `[ -n … ]` in the current shell | **DETECTED** |
| `env(1)` name-anchored match | **DETECTED (count 1)** |
| inherited through `zsh -l -c` | **DETECTED** |
| inherited through `zsh -i -c` | **DETECTED** |
| `${VAR+set}` set-but-empty discrimination | **DETECTED AS SET** |

**Every path detected it.** A subprocess *does* inherit its parent's environment through this tool,
through both login and interactive shells. **`ANTHROPIC_API_KEY_PRESENT = FALSE` is therefore a
measurement, not an instrument failure** — and it is not an artifact of sandboxing, because the
check was repeated with the sandbox explicitly disabled and returned the identical result.

`D-90` and `D-91` asserted absence. **This attempt proves the probe would have seen a present
credential.**

## What this does *not* say

> **NOT `MODEL_IDENTITY_MISMATCH`.** Nothing was returned, so there is nothing to compare.
> Identity was **not inferred** from the request string, from local configuration, from shim
> defaults, or from prior `L3-2o` evidence — all four are forbidden and none was attempted.

> **NOT a measured callability failure.** `PROVIDER_CALLABILITY` is **UNKNOWN**, not `FAIL`. No
> request was issued, so nothing was learned about Anthropic's reachability.

> **NOT A MODEL FAILURE.** `claude-sonnet-5` was **not called and not probed**. `D-70` and `D-77`
> are unchanged and untested here. **There is no model performance result in this phase.**

`PROVIDER_CALLABILITY`, `MODEL_IDENTITY` and `EXECUTION_PATH_COMPATIBILITY` are all **UNKNOWN,
never PASS**. The required `PASS / PASS / PASS` was not obtained, so the success terminal
`READY_TO_AUTHORIZE_L3_SEALED_ACCEPTANCE` was **not written**.

## What was refused

| shortcut | taken? |
|---|---|
| another Claude model, "just to prove the path" | **NO** |
| Gemini / OpenAI / Ollama / a local model | **NO** |
| Claude Code's own claude.ai session as the experiment credential | **NO** — §47.7, not attempted |
| **a mocked or stubbed provider response, so Phase 7 could report `PASS`** | **NO** |
| an acceptance row or reserved row in place of the synthetic probe | **NO** |
| editing, replacing or regenerating the frozen probe | **NO** |
| changing prompt, schema, validator, binder, input builder, shim or scorer | **NO** |
| spending the holdout without a passing gate | **NO** |

## Everything a credential does not gate passed

**Acceptance-artifact identity, recomputed from disk before and again after the phase:**
`189a3cbf780d859d45f753ea41e616591cb4fdfa9dd2d86b8d44ef4871f1cb1f` — **MATCH**, 16/16 components,
**line-for-line identical** to the recorded manifest, unchanged post-phase.

**Frozen holdout** `69665e41…`, **105561 bytes** — MATCH. **Acceptance scorer** `ea5e50ae…` — MATCH.

**15 frozen identity checks — `OK = 15`, `MISMATCH = 0`** — 11 outer file digests plus 4 inner
identities re-derived from shipped source, including the **run schema `a522cf5a…` re-serialised
through `buildProposalSchema()`** rather than accepted from an outer file hash.

**The canonical Attempt-2 package was resolved mechanically, not by name:** of three candidate
directories, `…-holdout-frozen-…` (Attempt 1, `D-87`) and `…-holdout-construction-…` hold **0**
holdout files each — empty by design — and only `…-holdout-attempt2-…` holds one, whose sha256 is
the required `69665e41…`.

**The frozen probe was re-verified, not regenerated:** artifact `a818b09f…`, `observationText`
**`52520318956ac8d0bf0d33b1430816edd91da8b64ed0477e374a378d2491f5be`**, 185 bytes — all MATCH.

**No frozen identity was modified, and none would have needed to be.** The shim `76d3e039` already
reads `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL_ID`, already defaults to `claude-sonnet-5`, and
already logs the provider-returned `model` — the exact field Phase 6 binds against. **The blocker
is the credential alone, for the third consecutive attempt.**

## The holdout is unspent

| check | result |
|---|---|
| frozen holdout sha256 before · after | `69665e41…` · `69665e41…` **identical**, 105561 bytes |
| rows | **92** — `INDEPENDENT_GAUNTLET` 38 + `INDEPENDENT_REALISM` 29 + `AUTHORED_CONTROL` 25, all MATCH; 92 distinct `rowId`s, 0 duplicates; counted **structurally**, **no `observation` value read** |
| three protected sources | `a95e5480…` · `49aa40fd…` · `6f6897f1…` — **all MATCH**, file digests only, no row opened |
| holdout rows read for provider input · transmitted | **0 · 0** |
| reserved rows transmitted · `gauntlet.seed` rows transmitted | **0 · 0** |
| acceptance scorer executions on provider output · at all | **0 · 0** |
| `G1`–`G10` evaluations · tuning · remediation | **0 · NO · NO** |
| acceptance result artifacts | **0 — none exists** |
| provider calls · destinations · cost | **0 · 0 · $0.00** |
| network-primitive audit of this package's 1 script | **ZERO** |
| `git diff HEAD` — `backend/src` · `safescope-data` | **0 · 0 lines** |

**`HOLDOUT_SPENT = FALSE`.** Gauntlet offset `0` and realism offset `3` remain reserved and
unspent; gauntlet `1`,`2`,`3` and realism `0`,`1`,`2` remain reserved; the entire `gauntlet.seed`
tranche remains unopened. **Nothing is retired.**

> **`D-90`, `D-91`, §57 and §58 are preserved as historical evidence and are NOT rewritten as
> though their credentials had been present.** `D-79`…`D-91` are not rewritten. `D-83` remains
> **SATISFIED**. Attempt 1 remains **INVALIDATED**.
> **L3-3 remains unauthorized. Production-provider selection remains OPEN. The current Level-1
> engine remains customer-authoritative.**
