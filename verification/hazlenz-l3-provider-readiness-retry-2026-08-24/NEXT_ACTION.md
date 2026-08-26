# What happens next

> ## `L3_PROVIDER_READINESS_BLOCKED — CREDENTIAL_OR_CALLABILITY_FAILURE`
> ## Unchanged from `D-90`. The exam exists, and it has still not been sat.

`PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · **`HOLDOUT_SPENT = FALSE`**

---

## The blocker, stated exactly `USER ACTION`

`ANTHROPIC_API_KEY` is **not visible to this execution environment and is not persisted anywhere**
— not in `~/.zshrc`, `~/.zprofile` or `~/.zshenv`, not in any `.env`, not in
`.claude/settings.local.json`, and not in any file in the repository that declares the name.

**An `export` in a separate terminal window does not reach this session** — a process inherits its
environment at launch, and shell state does not persist between commands here. But that alone does
not explain the result: the login- and interactive-shell probes read the profile files directly and
found nothing, so **the credential was not persisted at all**.

### Three mechanisms that will work

1. **Shell profile** — add `export ANTHROPIC_API_KEY=…` to `~/.zshrc` or `~/.zprofile`. This
   session's shells are initialized from the profile, so the next run of the gate will see it.
2. **Harness env block** — add it to `.claude/settings.local.json` under `env`. That file currently
   has no `env` keys at all.
3. **Relaunch** with the variable exported in the parent shell, so it is inherited at launch.

The credential must belong to an organization under the **Anthropic Commercial Terms** (`D-79`).
That contractual precondition is the one part of `D-70`'s `P-05` PASS the repository cannot verify
for itself.

---

## Then re-run this gate, and nothing more

Everything else is already in place and was re-verified from the files this session:

- canonical Attempt-2 package resolved by evidence; acceptance identity `189a3cbf…`, 16/16;
- **15 frozen identity checks, `OK = 15`, `MISMATCH = 0`**, including the run schema `a522cf5a…`
  **re-derived from shipped source**;
- the synthetic probe **already authored, classified `NON_HOLDOUT_PROVIDER_READINESS_PROBE`, and
  hashed** — `observationText` `52520318…`. **Send exactly this probe.** A different hash on the
  next attempt means the probe was changed, and that is visible;
- **no code change is needed**: the shim `76d3e039` already reads the key, already defaults to
  `claude-sonnet-5`, and already logs the provider-returned `model`.

Phases 5–7 then execute: one request through the frozen path, an **exact** bind of
`RETURNED_MODEL` to `claude-sonnet-5` with no inference from the request or from prior `L3-2o`
evidence, and a structural pass through the frozen parser → binder → validator. **Zero holdout rows
are sent at any point.**

---

## Then, and only then — a separate explicit authorization

> **Passing the readiness gate does not authorize spending the holdout.**

A final explicit user authorization is required before the first single-use acceptance call. That
call flips **`HOLDOUT_SPENT` → `true`** and **retires gauntlet offset `0` and realism offset `3`
permanently, whatever the result** (§29.8). It is scored against the frozen `G1`–`G10` by
`acceptance-scorer.js` `ea5e50ae…`, whose behaviour is already fixed and already synthetically
validated before any model output exists. **The gates cannot move afterwards** — `D-72` stands.

---

## What remains reserved

**Nothing is retired.** Gauntlet offsets `0`,`1`,`2`,`3`; realism offsets `0`,`1`,`2`,`3`; the
entire `gauntlet.seed` tranche, unopened.

---

## Explicitly NOT done by this phase

No provider called or probed · no credential obtained, printed, logged, hashed, persisted or
counted · no Claude Code authentication inspected or used · no inference · the synthetic probe
authored and frozen but **not transmitted** · no holdout or reserved row opened or transmitted ·
no acceptance result · no scorer run · no `G1`–`G10` evaluation · no tuning · no remediation · no
substitute model, family or provider · **no mocked provider response** · identity **not inferred**
from the request or from prior `L3-2o` evidence · `G1`–`G10` unchanged · prompt, schema, validator,
binder, input builder, harnesses and shim unchanged · governing plan read-only · **the prior
blocked attempt preserved as historical evidence and NOT rewritten as though the credential had
been present** · Attempt 1 not rewritten · no production code modified · no production provider
selected · L3-3 not begun · nothing committed, pushed, merged, rebased, reset, restored, cleaned,
deployed or stashed.
