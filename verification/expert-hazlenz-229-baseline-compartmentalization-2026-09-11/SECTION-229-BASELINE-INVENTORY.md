# §229 — BASELINE INVENTORY

Captured before anything was changed. Zero provider calls, zero database operations.

## Working tree at entry

| | |
|---|---|
| modified | 16 |
| deleted | 1 |
| untracked | 2,775 |
| total dirty paths | 2,792 |

## Runtime source

| surface | path | count |
|---|---|---|
| Expert HazLenz modules | `backend/src/safescope-v2/expert-hazlenz/*.ts` | 17 |
| owed-facts / authority / settlement | `.../expert-hazlenz/owed-facts/*.ts` | 9 |
| fixtures | `.../expert-hazlenz/fixtures/*.ts` | 18 |
| provider adapters | `.../expert-hazlenz-adapters/*.ts` | 2 |
| benchmark and golden tests inside `src/` | `backend/src/safescope-v2/tests/` | 67 |
| maintenance verifiers inside `src/` | `src/**/maintenance/verify-*.ts` | 10 |

## Experiment and contract surface

| | count |
|---|---|
| `backend/scripts/*.ts` entry points | 734 |
| `backend/scripts/lib/*.ts` modules | 166 |
| of those, `expert-` prefixed | 148 |
| **on the active import closure** | **82** |
| off the active closure but reachable from some other harness | 82 |
| **orphaned from every entry point** | **2** |

The active closure is the transitive import set of the §221, §227, §228A, §228B and §228C entry
points plus all 17 protected-ladder suites.

**This corrects the §223 estimate.** §223 recorded "99 of 136 off the §221 closure" and proposed
archiving them. Measured against every entry point rather than §221 alone, only **two** modules are
genuinely unreachable. Archiving the other 82 would have broken live harnesses.

## Validation evidence

| | |
|---|---|
| `verification/` directories | 290 |
| Expert HazLenz evidence directories | 142 |
| section-numbered among those | 33 |
| carrying a `.sha256` manifest | 27 |
| `verification/` on disk | 1.9 GB |

## Generated and duplicate material

| | count |
|---|---|
| tracked build/diagnostic artifacts in `backend/` | 10 |
| macOS Finder duplicate-copy files (`* 2.*`) repo-wide | 2,123 |
| of those under `verification/` | 2,090 |
| duplicate-copy files being compiled into the production build | 20 |
| `tsconfig.scripts-NNN.json` | 22, of which 15 unreferenced by `package.json` |
| stale compiler output beside authored source in `scripts/lib/` | 3 |

## Protected identities at entry

**29 modules digested. Composite identity `37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb`.**

Every identity §221 pinned was recomputed from disk and compared:

| pinned identity | §221 | on disk at §229 |
|---|---|---|
| first-pass contract module | `7f1000b8…` | **match** |
| first-pass projection module | `0f0918b2…` | **match** |
| verifier instruction module | `c253e900…` | **match** |
| verifier schema module | `35c766fc…` | **match** |
| verifier consistency module | `a3d55021…` | **match** |
| verifier payload module | `6728aa94…` | **match** |
| scope containment module | `244d3581…` | **match** |
| property authority module | `fb10ef70…` | **match** |
| settlement review module | `7f8b51b5…` | **match** |
| owed-fact ledger module | `4fe33190…` | **match** |
| §221 instrument module | `f1603b4f…` | **match** |
| §221 assembly module | `8d301bd5…` | **match** |
| verifier system prompt | `9c3ff0c4…` | **match** |
| verifier response schema | `0769b676…` | **match** |

**14 of 14 match. Zero drift since §221.**

## Build boundary at entry

`backend/tsconfig.json` sets `include: ["src/**/*"]` with no `exclude`. Confirmed by building:

- **1,091 JavaScript files emitted.**
- `backend/scripts/` is **not** in the production build. The semantic contract modules under
  `scripts/lib/` are therefore unreachable from the production build, which is the intended boundary.
- 67 benchmark and golden test files, 10 maintenance verifiers and 18 expert fixtures **are** inside
  the production build.

## Protected ladder at entry

**17 of 17 suites passed**, zero provider calls, zero database operations. Typecheck PASS.
Production build PASS.
