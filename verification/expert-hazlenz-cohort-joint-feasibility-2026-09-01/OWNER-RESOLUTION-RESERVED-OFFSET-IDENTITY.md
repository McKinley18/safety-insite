# Owner resolution — the governance identity of "gauntlet offset 2 / offset 3"

Recorded 2026-09-01, in response to the §131 finding that the repository contained two different
partition schemes designating different row sets under the same names.

## The resolution

> For any future irreversible reserve-opening decision, **"gauntlet offset 2" and "gauntlet offset 3"
> shall refer to the D-86 retirement-registry partition scheme `i % 4`**, not the analytical `i % 5`
> partition used by §123.
>
> Reason: D-86 / the retirement registry is the governance surface controlling open-once / retired
> state. The §123 modulo-5 partition may remain as historical analytical evidence but does not
> designate the governance identity of an irreversible reserved partition.

## What this settles

| | |
|---|---|
| authoritative rule | `D-86`: sort `scenarioId` CMP ascending (UTF-8 byte-wise, no case folding, no collation, no normalization), 0-based index, `m = 4`, `i % 4 === k`, `k = parseInt(sha256.slice(-8),16) % 4` |
| artifact | `safescope-data/gauntlets/safescope-gauntlet.source.v1.json` |
| artifact sha256 | `a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4` — matches the registry, artifact byte-unchanged |
| derived `k` | 0 |
| partition sizes | 38 / 38 / 37 / 37 |
| `GAUNTLET_OFFSET_2` | `i % 4 === 2`, **37 rows** |
| `GAUNTLET_OFFSET_3` | `i % 4 === 3`, **37 rows** |

The §123 artifact `verification/expert-hazlenz-cohort-source-blockers-2026-08-31/reserved/NEGATIVE-CONTROL-DETERMINATION.json`
records `i % 5` partitions of 30 rows each. Its "offset 2" shares only **8 rows** with the
governance "offset 2"; the same is true of offset 3. That artifact is **preserved unmodified** as
historical analytical evidence and is no longer to be read as designating a reserved partition.

## What this does NOT do

**This resolution does not authorize opening `GAUNTLET_OFFSET_2` or `GAUNTLET_OFFSET_3`.**

```
GAUNTLET_OFFSET_2 = RESERVED, UNOPENED
GAUNTLET_OFFSET_3 = RESERVED, UNOPENED
```

Both remain reserved and unopened after this operation. Nothing here changes
`CORPUS_RETIREMENT_REGISTRY`, and the registry file was not edited.

## Consequence for the recorded capability figures

Under the now-settled `i % 4` scheme, the retirement registry itself records the eligible
contribution, and it is the only authoritative figure under the governance scheme:

| partition | rows | recorded negative-control-capable |
|---|---|---|
| `GAUNTLET_OFFSET_2` | 37 | **8** (§124, label metadata only) |
| `GAUNTLET_OFFSET_3` | 37 | **8** (label metadata only) |
| **total** | 74 | **16** |

This agrees with §126's recorded `OFFSET_2_3_FORBIDDEN_CAPABILITY = 16`. It supersedes, for
governance purposes, the §123 figure of `9 + 9 = 18`, which was computed over the `i % 5` sets.

§131's raw count of `35 + 36 = 71` is a **label-only upper bound with no eligibility filter** and is
not a capability claim. It remains on record as an upper bound only.
