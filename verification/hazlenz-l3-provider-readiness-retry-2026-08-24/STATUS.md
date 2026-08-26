# L3 PROVIDER READINESS GATE, RETRY — STILL BLOCKED AT PHASE 3

> ## `L3_PROVIDER_READINESS_BLOCKED — CREDENTIAL_OR_CALLABILITY_FAILURE`
> ## `PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · **`HOLDOUT_SPENT = FALSE`**
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **Zero provider calls, zero API requests, zero
egress, $0.00.** No credential was obtained, so none was printed, logged, hashed, persisted or
counted. **The frozen holdout was not opened and not spent.** `G1`…`G10` untouched.

**The retry was authorized on the premise that a credential had been provisioned. It has not
been — not in this environment, and not in any file or profile a sealed run would resolve.**

---

## 1 — The measured result `PHASE 3`

```
ANTHROPIC_API_KEY_PRESENT = FALSE          (unchanged from D-90)
```

| path | state |
|---|---|
| current execution environment | **ABSENT** |
| login shell `zsh -l -c` — reads `~/.zprofile`, `~/.zshenv` | **ABSENT** |
| interactive shell `zsh -i -c` — reads `~/.zshrc` | **ABSENT** |
| `.env` / `.env.local` / `backend/.env` / `backend/.env.local` | **ABSENT** — the variable *name* is not declared |
| repository-wide name-anchored scan (`*.env*`, `*.sh`, `*.json`) | **0 files declare the name** |
| `.claude/settings.local.json` `env` block | **no `env` keys at all** |

Every check tested non-emptiness with `[ -n … ]`, or listed **filenames only** via `grep -rl`, or
listed **key names only**. **No branch of any check could emit the value.**

### 1.1 Why a credential exported in another terminal would not be seen `THE LIKELY GAP`

A process inherits its environment **at launch**. An `export` typed into a different terminal
window after this session started does not propagate into it, and shell state does not persist
between individual commands here either.

**But that is not the whole story, and the evidence rules it out as the only explanation.** The
login-shell and interactive-shell probes exist precisely to catch the durable case — they read
`~/.zprofile`, `~/.zshenv` and `~/.zshrc`, and they found nothing. **The credential was not
persisted anywhere.** The absence is genuine, not an artifact of how this session was invoked.

---

## 2 — Three terminals this is *not*

> **NOT `MODEL_IDENTITY_MISMATCH`.** A mismatch is a **measured disagreement** between a requested
> and a returned identity. **Nothing was returned.** Identity was not inferred from the request and
> not inferred from prior `L3-2o` evidence — this phase's contract forbids both, and neither was
> attempted.

> **NOT a callability failure that was measured.** `PROVIDER_CALLABILITY` is **UNKNOWN**, not
> `FAIL`. No request was issued, so nothing about Anthropic's reachability was learned.

> **NOT a model failure.** `claude-sonnet-5` was **not called and not probed**. `D-70` and `D-77`
> are unchanged and untested here. **There is no model performance result in this phase.**

---

## 3 — What was refused

| shortcut | taken? |
|---|---|
| another Claude model, "just to prove the path" | **NO** |
| Gemini / OpenAI / Ollama / a local model | **NO** |
| Claude Code's own claude.ai session as the experiment credential | **NO** — §47.7, not attempted |
| **a mocked or stubbed provider response, so Phase 7 could report `PASS`** | **NO** — a simulated response proves nothing about callability; reporting it as compatibility evidence would be a fabricated result |
| an acceptance row or reserved row instead of the synthetic probe | **NO** |
| spending the holdout without a passing gate | **NO** |

**`PROVIDER_CALLABILITY`, `MODEL_IDENTITY` and `EXECUTION_PATH_COMPATIBILITY` are all recorded
`UNKNOWN`.** The required `PASS / PASS / PASS` was not obtained, so the success terminal is not
available and was not written.

---

## 4 — The canonical Attempt-2 package, resolved by evidence `PHASE 0`

The task left the package directory as a placeholder. It was resolved **mechanically — by asking
which directory contains a holdout file at all**, not by reading a name:

| directory | `holdout/` | `scorer/` | verdict |
|---|---|---|---|
| `…-holdout-frozen-2026-08-24/` | **0 files** | 0 files | **Attempt 1** (`D-87`, §54) — INVALIDATED; empty **by design**, Phase 5 was never reached there |
| `…-holdout-construction-2026-08-24/` | **0 files** | 0 files | the construction-authorization record; not an artifact package |
| **`…-holdout-attempt2-2026-08-24/`** | **1 file** | 3 files | **CANONICAL** (`D-89`, §56) — holds `69665e41…` |

**Exactly one of the three contains a holdout, and its SHA-256 is the required one.** The
historical Attempt-1 directory cannot be mistaken for the acceptance artifact.

---

## 5 — Everything a credential does not gate passed `PHASES 1, 2, 4, 8`

**Acceptance-artifact identity**, recomputed from disk and again after the phase:

```
189a3cbf780d859d45f753ea41e616591cb4fdfa9dd2d86b8d44ef4871f1cb1f    MATCH
```
16/16 components, **line-for-line identical** to the recorded manifest. Holdout `69665e41…` MATCH.
Scorer `ea5e50ae…` MATCH.

**15 frozen identity checks — `OK = 15`, `MISMATCH = 0`.** Eleven outer file digests, and **four
inner identities re-derived from the shipped source**: `hazlenz.l3.prompt.v6` ·
`sha256(L3_SYSTEM_PROMPT)` `b8cc50fc…` · **serialised run schema `a522cf5a…`, re-serialised through
`buildProposalSchema()` rather than accepted from an outer file hash** · locked cohort harness
`73f74131…`.

**No frozen identity was modified, and none would have needed to be.** The shim `76d3e039` already
reads `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL_ID`, already defaults to `claude-sonnet-5`, and
already logs the provider-returned `model` — the exact field Phase 6 binds against. **The blocker
is the credential alone.**

---

## 6 — The probe was authored and frozen, then not sent `PHASE 2`

| | |
|---|---|
| classification | `NON_HOLDOUT_PROVIDER_READINESS_PROBE` |
| artifact | `probe/probe-observation.json` — `a818b09f…` |
| `observationText` sha256 | `52520318956ac8d0bf0d33b1430816edd91da8b64ed0477e374a378d2491f5be` |
| transmitted | **NO** |

**Hashed before the credential result was acted on, deliberately.** A probe frozen before the
provider is known to be reachable **cannot have been shaped by observed provider behaviour**, and
any change to it on a later retry is mechanically visible.

Its non-holdout status is established **by construction, not by search** — the string was authored
for that file and existed nowhere before it. Testing membership by searching the protected sources
would require opening rows this phase is forbidden to open.

> The boundary reduces to a rule needing no offset arithmetic: the reserved offsets exhaust **every
> row of all three protected sources**, so *no row of any protected source or of the holdout is
> opened, read for content, or transmitted.*

---

## 7 — The holdout is unspent `PHASE 8`

| check | result |
|---|---|
| frozen holdout sha256 before · after | `69665e41…` · `69665e41…` **identical**, 105561 bytes |
| rows | **92** — 38 + 29 + 25, counted **structurally**; **no `observation` value read, printed or serialised** |
| three protected sources | **byte-identical before and after** |
| holdout rows read for provider input · transmitted | **0 · 0** |
| reserved rows read for provider input · transmitted | **0 · 0** |
| acceptance scorer executions on provider output · at all | **0 · 0** |
| acceptance result artifacts | **0 — none exists** |
| `G1`–`G10` evaluated · tuning · remediation | **NO · NO · NO** |
| provider calls · destinations · cost | **0 · 0 · $0.00** |
| network-primitive audit of this package's 1 script | **ZERO** |
| `git diff HEAD -- backend/src` | **0 lines** |

**`HOLDOUT_SPENT = FALSE`. Nothing is retired.**

---

## 8 — What the operator must actually do

The blocker is a credential that is **durably visible to this session's shells**. Exporting it in
another terminal will not work. Three mechanisms will:

1. **Add it to a shell profile** — `~/.zshrc` or `~/.zprofile` — since this session's shells are
   initialized from the user's profile. This is the most direct fix, and the login/interactive
   probes above will then report `PRESENT`.
2. **Add it to `.claude/settings.local.json`** under an `env` block, which the harness applies to
   the execution environment. That file currently has **no `env` keys at all**.
3. **Relaunch the session** with the variable exported in the parent shell, so it is inherited at
   launch.

The credential must belong to an organization under the **Anthropic Commercial Terms** (`D-79`) —
that is what makes `P-05`'s no-training guarantee hold, and it is the one precondition of `D-70`
that the repository cannot verify for itself.

> **Passing this gate still would not authorize spending the holdout.** A **separate explicit user
> authorization** remains required before the first single-use acceptance call, which flips
> `HOLDOUT_SPENT` to `true` and retires gauntlet offset `0` and realism offset `3` permanently,
> **whatever the result** (§29.8). `D-72` stands.
