# L3 PROVIDER READINESS GATE — BLOCKED AT PHASE 3 BY CREDENTIAL ABSENCE

> ## `L3_PROVIDER_READINESS_BLOCKED — CREDENTIAL_OR_CALLABILITY_FAILURE`
> ## `PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · **`HOLDOUT_SPENT = FALSE`**
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **Zero provider calls, zero API requests, zero
egress, $0.00.** No credential was obtained, so none was printed, logged, hashed, persisted or
counted. **The frozen holdout was not opened and not spent.** Nothing committed, pushed, deployed
or stashed. `G1`…`G10` untouched.

**The exam still exists. It still has not been sat, and this phase came no closer to sitting it.**

---

## 1 — The one thing that failed `PHASE 3`

```
ANTHROPIC_API_KEY_PRESENT = FALSE
```

Presence-only, across every path a sealed run would resolve:

| path | state |
|---|---|
| current execution environment | **ABSENT** |
| login shell (`zsh -l -c`) | **ABSENT** |
| interactive shell (`zsh -i -c`) | **ABSENT** |
| repository `.env` / `.env.local` | **ABSENT** — the variable *name* is not declared |
| `backend/.env` / `backend/.env.local` | **ABSENT** — the variable *name* is not declared |

Every check tested non-emptiness with `[ -n … ]` or a name-anchored `grep -q`. **No branch of any
check could emit the value**, because no branch echoes the variable or a matched line.

**This is the same blocker `L3-FA` hit** (§52, `D-85`). It is unchanged, and this phase does not
pretend otherwise.

---

## 2 — What that stopped, and the terminal it is *not*

Phases **5, 6 and 7 were never reached**. `probe/PROBE_NOT_EXECUTED.txt` records exactly what does
not exist so no reader mistakes an absence for an omission.

> **This is NOT `MODEL_IDENTITY_MISMATCH`.** A mismatch is a *measured disagreement* between a
> requested and a returned identity. **No identity was returned**, so there is nothing to compare.
> Recording a mismatch here would be inventing a provider result.

> **This is NOT `HOLDOUT_CONTAMINATION`.** No holdout row, no reserved row and no protected source
> row was opened, read for content, or transmitted.

> **This is NOT a model failure.** `claude-sonnet-5` was **not called and not probed**. Its
> qualification (`D-70`, `D-77`) is unchanged and untested here. **There is no model performance
> result in this phase.**

---

## 3 — What was NOT substituted `THE POINT OF THE GATE`

| tempting shortcut | taken? |
|---|---|
| another Claude model, to "prove the path works" | **NO** |
| Gemini / OpenAI / Ollama / a local model as a stand-in | **NO** |
| Claude Code's own claude.ai session as the experiment credential | **NO** — forbidden by §47.7, and not attempted |
| a mocked or stubbed provider response, so Phase 7 could report a `PASS` | **NO** — a simulated response proves nothing about callability, and reporting it as compatibility evidence would be a fabricated result |
| a "spare" source row instead of a synthetic probe | **NO** — and there is no such thing; see §5 |
| spending the holdout without a passing gate | **NO** — this is the outcome the gate exists to produce |

---

## 4 — Everything the phase *could* verify without a credential, it did `PHASES 0, 1, 2, 4, 8`

### 4.1 Acceptance-artifact identity, recomputed from the files rather than copied

All 16 component hashes recomputed from disk, sorted, and the manifest hashed:

```
189a3cbf780d859d45f753ea41e616591cb4fdfa9dd2d86b8d44ef4871f1cb1f
```

**MATCH**, 16/16, and **line-for-line identical** to the recorded
`ACCEPTANCE_ARTIFACT_MANIFEST.txt` block. Recomputed **again after** the phase: unchanged.

### 4.2 Frozen execution-path identities — 14 checks, 14 MATCH

**Ten outer file digests** re-derived: prompt `426302a4` · contract types `5f70281c` · validator
`942ac7cc` · binder `c1f9d29d` · input builder `2865ae91` · cohort harness `73f74131` ·
shipped-corpus harness `0b3b8d86` · residual harness `d90cb89c` · Anthropic shim `76d3e039` ·
`score.js` `7d748111`. **OK = 10, MISMATCH = 0.**

**Four inner identities re-derived from the shipped source**, not accepted from a prior record:

| | derived | required |
|---|---|---|
| `L3_PROMPT_VERSION` | `hazlenz.l3.prompt.v6` | MATCH |
| `sha256(L3_SYSTEM_PROMPT)` | `b8cc50fc…` | MATCH |
| **serialised run schema** | **`a522cf5a…`** | **MATCH** |
| locked cohort harness | `73f74131…` | MATCH |

> **A strengthening, recorded as such.** The Attempt-2 freeze carried the run-schema digest *"of
> record at `D-84` / §51.3, carried by `reasoning-contract.types.ts` @ `5f70281c` (outer digest
> MATCHED)"* — i.e. by **file** hash. This phase **re-serialised the schema through
> `buildProposalSchema()`** on the locked cohort's first scenario and re-derived the digest
> directly. It agrees. That is the check `D-F` would demand of a declared identity, and it is
> stronger than the one it replaces.

### 4.3 No frozen identity would have needed changing

The shim at `76d3e039` **already** reads `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL_ID` from the
environment and **already** defaults the model to `claude-sonnet-5`, and **already** logs
`respondedModel` from the provider payload — the exact field Phase 6's identity gate needs.
**The probe required no code change. The blocker is the credential and nothing else.**

---

## 5 — Why the probe had to be synthetic, and why that mattered before it mattered `PHASE 2`

The prohibited input set was written **before** the credential was touched. Working it through
produced a result worth recording: **`P4`–`P8` between them cover every row of all three protected
sources** — gauntlet offsets 0,1,2,3; realism offsets 0,1,2,3; the whole `gauntlet.seed` tranche.

> **There is no non-reserved row anywhere in the three sources.** There is no "harmless spare" to
> borrow, and borrowing one would retire a reservation to run a readiness check. **Authoring a
> disposable observation is the only construction that spends nothing** — which is why the contract
> requires it, and why the boundary reduces to a rule needing no offset arithmetic at all:
> *no row of any protected source or of the holdout is opened, read for content, or transmitted.*

In the event, the credential gate stopped the phase first, so **no probe observation was ever
authored** and there is no probe identity to record.

---

## 6 — The holdout is unspent `PHASE 8`

| check | result |
|---|---|
| frozen holdout sha256 before · after | `69665e41…` · `69665e41…` **identical**, 105561 bytes |
| rows | **92** — 38 `INDEPENDENT_GAUNTLET` + 29 `INDEPENDENT_REALISM` + 25 `AUTHORED_CONTROL`, counted **structurally**; **no `observation` value was read, printed or serialised** |
| three protected sources | `a95e5480…` · `49aa40fd…` · `6f6897f1…` **byte-identical before and after** |
| holdout rows read for provider input · transmitted | **0 · 0** |
| reserved source rows read for provider input · transmitted | **0 · 0** |
| acceptance scorer executed on provider output · at all | **0 · 0** |
| acceptance result artifact anywhere | **0 — none exists** |
| `G1`–`G10` evaluated · tuning · semantic remediation | **NO · NO · NO** |
| provider calls · destinations contacted · cost | **0 · 0 · $0.00** |
| network-primitive audit of this phase's 1 script | **ZERO** occurrences |
| `git diff HEAD -- backend/src` | **0 lines** |

**`HOLDOUT_SPENT = FALSE`.** Gauntlet offset `0` and realism offset `3` remain **reserved and
unspent**; gauntlet `1`,`2`,`3` and realism `0`,`1`,`2` remain reserved; the entire `gauntlet.seed`
tranche remains unopened. **Nothing is retired.**

---

## 7 — One recorded discrepancy, not silently resolved

The task statement located the frozen holdout at
`hazlenz-l3-acceptance-holdout-frozen-2026-08-24/holdout/holdout-l3-acceptance-attempt2.json`.
**That directory is Attempt 1** (`D-87`, §54), whose `holdout/` and `scorer/` are **empty by
design** — Phase 5 was never reached there. The frozen holdout bearing the required SHA-256
`69665e41…` is the **Attempt-2** artifact (`D-89`, §56).

**The identity binds exactly; only the directory name differs.** Recorded in
`preservation/ACCEPTANCE_ARTIFACT_REVERIFICATION.txt`. Attempt 1 was read and **not modified**.

---

## 8 — What must exist before this gate can pass

**One thing, and it is not remediable inside this phase's boundaries.**

Export `ANTHROPIC_API_KEY` for an organization under the Anthropic Commercial Terms (`D-79`),
then re-run this readiness gate. Phases 5–7 then execute as specified: the synthetic disposable
probe through the `76d3e039` shim, the exact-identity gate on the returned `model` field, and the
structural pass through the frozen parser → binder → validator.

> **Passing that gate still would not authorize spending the holdout.** A **separate explicit user
> authorization** is required before the first single-use acceptance call, which flips
> `HOLDOUT_SPENT` to `true` and retires gauntlet offset `0` and realism offset `3` permanently,
> **whatever the result** (§29.8). `D-72` stands: a failed gate is a failed gate, never
> reinterpreted as a quality KPI, and a non-scorable run is never a pass.
