# EXACT NEXT PREREQUISITE — NOT EXECUTED

**A credential that this process can actually see. Nothing else is missing.**

Three attempts (`D-90`, `D-91`, this one) have now measured `ANTHROPIC_API_KEY_PRESENT = FALSE`.
This attempt additionally proved, with a positive control on every probe path, that **the
instrument would have detected a present credential**. So the diagnosis is no longer ambiguous.

## Why the third attempt still measured absence

The authorizing statement said the key was exported **into the parent environment from which this
Claude process was launched**. Two facts decide what that means:

1. **A process inherits its environment at launch.** An `export` typed into a *different* terminal,
   or into the same terminal *after* this session started, cannot reach it. Shell state does not
   persist between individual tool commands.
2. **But the durable paths were checked directly and are also empty.** `zsh -l -c` reads
   `~/.zprofile` and `~/.zshenv`; `zsh -i -c` reads `~/.zshrc`. Both were probed, both reported
   ABSENT, and the positive control confirms both probes work. **The credential is not persisted in
   any shell profile**, and no `env` block exists in project or user Claude settings.

The conclusion is the same one `D-91` reached, now with the instrument itself verified: **the
credential was never made durably visible to this session.**

## The three mechanisms that would work

| # | mechanism | why it reaches this session |
|---|---|---|
| 1 | `export ANTHROPIC_API_KEY=…` in **`~/.zshrc` or `~/.zprofile`** | this session's shells are initialized from the user's profile, so every subsequent tool command inherits it |
| 2 | an **`env` block in `.claude/settings.local.json`** | the harness applies it to the execution environment directly |
| 3 | **relaunch the session** with the variable exported in the parent shell **first** | inheritance happens at launch |

**Mechanism 1 or 2 is recommended over 3**, because both are durable and independently verifiable
by re-running the Phase-3 probe, whereas 3 depends on launch ordering that cannot be checked after
the fact.

The credential must belong to an organization under the **Anthropic Commercial Terms** (`D-79`) —
the one precondition of `D-70`'s `P-05` PASS that the repository cannot verify for itself.

## Then re-run this readiness gate

**Send the already-frozen probe** — `observationText` sha256
`52520318956ac8d0bf0d33b1430816edd91da8b64ed0477e374a378d2491f5be`, 185 bytes, artifact
`a818b09f…`. **A different hash means the probe was changed, and that is mechanically visible.**

Phases 5–7 then execute as specified, sending **zero** holdout rows: exactly one real Anthropic
call requesting `claude-sonnet-5` through the frozen shim `76d3e039`, the returned `model` field
bound against the requested one, and structural traversal of shim → schema boundary → validator.
**No scorer. No `G1`–`G10`. No tuning. No remediation.**

## Passing that gate still does not authorize spending the holdout

A **separate explicit user authorization** is required before the first single-use acceptance call,
which flips `HOLDOUT_SPENT` to `true` and **permanently retires gauntlet offset `0` and realism
offset `3`, whatever the result** (§29.8).

`D-72` stands: a failed gate is a failed gate, never reinterpreted as a quality KPI, and a
non-scorable run is never a pass.
