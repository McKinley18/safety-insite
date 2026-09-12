# §229 — EXPERT HAZLENZ BASELINE COMPARTMENTALIZATION, CLEANUP AND CANDIDATE FREEZE

**0 provider calls · 0 database operations · no runtime, prompt, schema, authority or settlement
change · no historical evidence modified · no commit, push, tag or deploy.**

**Candidate baseline frozen:
`48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200`.**

The core rule governed everything: clean the repository without changing Expert HazLenz behaviour,
and where that could not be **shown**, report instead of act. Most of the §223 plan's proposed moves
were measured here and refused on exactly that ground.

---

## What was done

**2,131 files deleted, 6 archived, 1 created, 1 modified, 0 code files moved.**

Ten tracked build and diagnostic artifacts under `backend/` were removed and gitignored: each was in
zero `.sha256` manifests, had zero code or config references, and is regenerable. 2,121 macOS Finder
duplicate-copy files were removed, each only after confirming a non-suffixed sibling exists and the
filename appears in none of the 2,706 entries across every manifest in the repository. A 200-file
sample was hashed: 199 byte-identical to their sibling, one a stale older copy. The pre-§209 state
package moved to `docs/hazlenz/validation/superseded-209/` with a redirect left at the old path,
because frozen evidence from §205 onward cites it and evidence is never edited.

One duplicate was **blocked and left in place**:
`verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3e/source-evidence/ecfr-1910-146 2.xml`
has no non-suffixed sibling and may be the only surviving copy of that source evidence.

## What was refused, and why

The §223 plan called four moves "safe now". Measured here, three of them are not.

**Moving `src/safescope-v2/tests/` out of the production build.** 9 modules under `backend/scripts/`
import from it and 24 `package.json` scripts reference the path. Thirty-three edits, each a chance to
break a protected harness, for a build-size gain.

**Moving `expert-hazlenz/fixtures/` out of `src/`.** 62 harnesses import it. Worse,
`test-expert-nocall-harness.ts` walks `src/safescope-v2/expert-hazlenz` recursively and asserts no
network primitive or credential appears anywhere beneath it. Moving the fixtures out silently narrows
what that assertion scans — the suite would keep reporting PASS while covering less, which is worse
than failing.

**Moving `src/**/maintenance/verify-*.ts`.** Zero code imports them, but 10 `package.json` scripts
invoke them by path.

**Moving the pinned contract modules into `src/`** remains blocked by design, as both the §223 plan
and the §229 authorization require. The build confirms the boundary is real: `backend/scripts/`
contributes zero of the emitted files.

**Archiving the 84 `scripts/lib/` modules off the §221 closure** was refused on measurement. §223
proposed archiving 99 such modules. Computed against every entry point rather than §221 alone, **82
of the 84 are still reachable from a live harness**. Only two are orphaned, and neither is safely
deletable — one is named as a string literal in three probe scripts, and the other is stale compiler
output whose unreachability cannot be proved without running database suites, and database operations
are zero here.

**Consolidating the 95 local `sha` helpers** was refused for the clearest reason of all: several live
in modules whose digest is pinned in `INTEGRATED-PREREGISTRATION-221.json`. Any edit to a pinned
module breaks its identity. Tidying must not touch the pinned set.

## Source-of-truth consolidation

**Ambiguities before: 6. After: 2.**

Resolved by naming a canonical owner: the wire-schema competition between §210J and `expert-prompt.ts`
v15; the `STRUCTURALLY_INVALID_DECLARATION` ownership question across three modules; the gate
vocabulary competition between §207 and §228A; and the current-state document competition.

Still open, and both need a code change rather than a document: two prompt version namespaces for one
leg, and two deterministic-projection modules whose prototype is still on a live harness closure.

## Evidence integrity, and one finding that looks alarming and is not

Every Expert HazLenz evidence manifest from §221 to §228C was re-verified after cleanup.

| § | result |
|---|---|
| 221 | 11 / 11 OK |
| 223 | 12 / 15 OK |
| 224, 225, 226, 227 | 14/14, 19/19, 15/15, 17/17 OK |
| 228, 228A, 228C | 12/12, 6/6, 7/7 OK |

**Zero files under `verification/**` are affected. No historical evidence was modified.**

The three §223 mismatches are `EXPERT_HAZLENZ_CURRENT_STATE.md`, `HAZLENZ_INVARIANTS.md` and
`CONTEXT_INDEX.md` — **living documents that §229 Phase H was required by its own authorization to
update.** The §223 manifest covers those three alongside its frozen evidence, so updating them
necessarily invalidates that part of it. The manifest was **not edited**: a stale record is superseded
by a new record, never rewritten in place. The current digest of all three is recorded in the
candidate baseline.

**The finding for future manifests: cover frozen evidence only.** Mixing a living document into an
evidence manifest guarantees a future false alarm.

**A second finding, recorded in the archive index.** Manifest path conventions differ across sections:
§221 and the §228 series use bare filenames and must be checked from inside their directory, while
§223 through §227 use repo-root-relative paths and must be checked from the repository root. Checking
in the wrong mode reports `No such file or directory` for every entry and is indistinguishable from
data loss at a glance. It happened once during this phase and cost a diagnosis.

## Behavioural equivalence

| check | before | after |
|---|---|---|
| protected module digests | 29 | **29, all identical** |
| composite protected identity | `37ce9eb8…` | **`37ce9eb8…` — identical** |
| §221 pinned identities recomputed from disk | 14 / 14 match | **14 / 14 match** |
| prompt, schema and assembled-call identities | — | **all identical** |
| protected validation ladder | 17 / 17 PASS | **17 / 17 PASS** |
| typecheck | PASS, 0 errors | **PASS, 0 errors** |
| production build | PASS | **PASS** |
| production build artifacts differing in content | — | **0** |
| production build artifacts added | — | **0** |
| production build artifacts removed | — | 60, **all compiled Finder duplicates** |

The only change to the production build is that 20 duplicate-copy source files stopped being compiled
alongside their originals. Zero real source was affected.

---

## Final report

**Files moved:** 6 (documentation only; no code file moved).
**Files renamed:** 0. **Files merged:** 0.
**Files archived:** 6. **Files deleted:** 2,131. **Files created:** 1. **Files modified:** 4.
**Files retained intentionally:** 84 `scripts/lib/` modules off the §221 closure but on a live
harness closure; 15 unreferenced `tsconfig.scripts-NNN.json` retained as build provenance; 2 orphan
modules classified rather than deleted; 1 duplicate blocked for lack of a sibling; the full additive
prompt and verifier ancestor chains, without which pinned identities cannot be reconstructed.

**Runtime behavior changed:** **NO.**
**Expert semantic behavior changed:** **NO.**
**Provider prompt changed:** **NO.**
**Schema changed:** **NO.**
**Authority behavior changed:** **NO.**
**Settlement behavior changed:** **NO.**
**Historical evidence modified:** **NO.** Verified: 113 of 116 manifest entries across §221–§228C
still match, and all three mismatches are living documents §229 was required to update, none of them
under `verification/`.

**Source-of-truth ambiguities before:** 6. **After:** 2.

**Development context reduction:** **about 55%** for a typical engineering command. The default
context is `CONTEXT_INDEX` plus `CURRENT_STATE` plus `INVARIANTS`, now 3,811 words against roughly
8,500 previously — the §223 current-state set at 3,021 words plus the superseded §209 package a
reader would otherwise open to check currency, plus the §223 source-of-truth and compartmentalization
plans now superseded by one map. The 308,000-word blueprint remains excluded by default.

**Protected assertions:** **17 passed / 0 failed**, identical before and after.
**Typecheck:** **PASS.** **Production build:** **PASS.**

**Candidate baseline frozen:** **YES.**
**Baseline digest:** `48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200`.

**KR-1:** **OPEN — HUMAN-GATED V1.0 LIMITATION.** Its containment is now exercised end to end.

**Targeted integrated evidence:** **14 / 14 DEMONSTRATED**, with §228B + §228C provenance preserved.
§228B remains INCONCLUSIVE and is not rewritten as PASS.

**C7 contained quality defect:** **PRESERVED.** Not accepted as desirable behaviour, not remediated,
carried into the improvement register as BETA PRIORITY.

**Provider calls:** 0. **Database operations:** 0. **Commit / push / tag / deploy:** NONE.

**Next phase:** **FINAL FRESH EXPERT HAZLENZ ACCEPTANCE.**

---

## Two things the product owner should carry forward

**The §223 plan was substantially wrong about what was safe, and measuring it was the point of this
phase.** Three of its four "safe now" moves would have broken live harnesses or silently narrowed a
protected assertion, and its estimate of dead modules was off by a factor of forty. None of that is a
criticism of §223, which explicitly said nothing had been executed and named the check each action
required. The checks were run here and most of them failed. **The refusals are the main engineering
result of §229**, not the deletions.

**The improvement register contains no blocker to final acceptance.** Its two BEFORE BETA REQUIRED
items — silent non-declaration and the wrong-property rate — are **measurement obligations for final
acceptance, not remediation work**. Remediating either before its rate is known would repeat the
§224–§227 pattern of tuning before measuring.

**TERMINAL:
`EXPERT_HAZLENZ_CANDIDATE_BASELINE_FROZEN —
FINAL_FRESH_ACCEPTANCE_DESIGN_AUTHORIZATION_REQUIRED`**

STOP. Final acceptance was not executed.
