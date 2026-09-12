# §229 — CLEANUP LOG

Every change made, and every change considered and refused. The core rule was: clean the repository
without changing Expert HazLenz behaviour, and where that cannot be **shown**, report instead of act.

**Totals: 2,131 files deleted · 6 files archived · 1 file created · 1 file modified · 0 files moved
within code · 0 files merged · 0 renames.**

---

## PERFORMED

### 1. Generated build and diagnostic artifacts — 10 deleted

`build_errors.txt`, `build_errors_current.txt`, `build_output.txt`, `npm_build_diagnostics.txt`,
`tsc_diagnostics.txt`, `server_logs.txt`, `report.pdf`, `generated-tests.json`,
`feedback-store.json`, `pico.save` — all directly under `backend/`.

All seven deletion conditions checked and met for each: not frozen evidence, not referenced by
runtime, not referenced by tests, not referenced by active validation tooling, not the only record of
an architectural decision, **named in zero `.sha256` manifests and zero code or config references**,
and regenerable. All were tracked, so `git checkout` restores any of them. A copy of each was also
retained in the session scratch directory.

`.gitignore` was extended in the same change so they do not return.

### 2. macOS Finder duplicate-copy files — 2,121 deleted

Files matching `* 2.<ext>`. Each was admitted only after confirming a non-suffixed sibling exists
**and** the filename appears in none of the 2,706 entries across every `.sha256` manifest in the
repository. A 200-file random sample was hashed against its sibling: **199 byte-identical, 1 a stale
older copy.** None of the first 400 sampled was tracked in git.

**One candidate was blocked and left in place:**
`verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3e/source-evidence/ecfr-1910-146 2.xml`
has no non-suffixed sibling, because the original is deleted in the working tree. It may be the only
remaining copy of that source evidence, so it was not touched.

**20 of these duplicates were being compiled into the production build.** Removing them removed 60
emitted artifacts and nothing else. See the verification results.

### 3. Superseded §209 documentation — 6 archived, 1 redirect created

`docs/expert-hazlenz/*.md` moved unchanged to `docs/hazlenz/validation/superseded-209/`. The package
stops at §209 and still described itself as "the primary entry point for every future session", which
now misleads.

Frozen evidence reports from §205 onward cite the old paths and are immutable, so
`docs/expert-hazlenz/README.md` was created as a redirect. No evidence file was edited.

### 4. Documentation and discoverability

Created or refreshed: the source-of-truth map, the historical archive index, the improvement
register, and the three `docs/hazlenz/current/` documents. No code was moved to achieve
discoverability; it was achieved with documentation, which is behaviour-neutral by construction.

---

## REFUSED — and why

Each of these appears in the §223 plan. Each was measured here and found not to be behaviour-
preserving, or not provably so.

### Moving `src/safescope-v2/tests/` out of the production build — REFUSED

The §223 plan lists this as "safe now". It is not.

- **9 modules under `backend/scripts/` import from it.**
- **24 `package.json` scripts reference the path.**

Every one would need rewriting, and each rewrite is a chance to break a protected harness. The payoff
is build size, not correctness. No runtime module imports it — that part of the §223 finding is
confirmed — but the harness and script surface makes the move a 33-edit change that cannot be shown
equivalent without re-running suites that need a database, and database operations are zero here.

### Moving `expert-hazlenz/fixtures/` out of `src/` — REFUSED, and it would break a protected assertion

- **62 modules under `backend/scripts/` import from it.**
- `scripts/test-expert-nocall-harness.ts:211` **walks `src/safescope-v2/expert-hazlenz` recursively**
  and asserts that no network primitive, endpoint or credential appears in any `.ts` file beneath it.
  Moving `fixtures/` out of that tree silently narrows what that assertion scans. The suite would
  still report PASS while covering less, which is worse than failing.

### Moving `src/**/maintenance/verify-*.ts` — REFUSED

Zero code imports them, but **10 `package.json` scripts** invoke them by path. Same reasoning.

### Moving the pinned contract modules from `scripts/lib/` into `src/` — BLOCKED, as designed

This is the §223 plan's own sequencing constraint and the §229 authorization repeats it. `tsconfig.json`
includes all of `src/**/*`, so moving a contract module into `src/` puts it inside the production
build and changes runtime reachability. The boundary is doing real work: the build confirms
`backend/scripts/` contributes nothing to the 1,091 emitted files.

Moving them would also require a recorded, verified successor mapping for every module digest in
`INTEGRATED-PREREGISTRATION-221.json`. Not attempted. **Discoverability was addressed with the
source-of-truth map instead.**

### Archiving the 84 `scripts/lib/` modules off the §221 closure — REFUSED

§223 proposed archiving 99 modules off the §221 closure. Measured against every entry point rather
than §221 alone, **82 of the 84 are still reachable from a live harness.** Archiving them would have
broken those harnesses. Only two are orphaned, and neither is safely deletable:

| module | status | why it was not deleted |
|---|---|---|
| `scripts/lib/classify-reserved-rows.ts` | ARCHIVE_CANDIDATE | unreachable by import, but named as a string literal in three probe scripts, so "no active consumer" is not cleanly confirmed |
| `scripts/lib/test-database-ownership.{d.ts,js,js.map}` | DELETE_CANDIDATE | stale compiler output beside the authored `.ts`. All 11 consumers import the extensionless specifier, which `tsx` resolves to the `.ts` — but proving the `.js` is unreachable needs the database suites, and database operations are zero here |

### Deleting unreferenced `tsconfig.scripts-NNN.json` — REFUSED

15 of 22 are unreferenced by `package.json`. They are small and they record how each closed section
was compiled, which is provenance. Classified RETAIN.

### Splitting `expert-prompt.ts` (1,636 lines) — REFUSED

A split is a semantic-surface change to a prompt source. §229 forbids prompt changes and the split
cannot be shown byte-equivalent without building and diffing the composed output, which is
§223 step 5 work.

### Consolidating the 95 local `sha` helpers — REFUSED

Behaviour-identical in principle, but it edits 95 files including several whose module digest is
pinned in `INTEGRATED-PREREGISTRATION-221.json`. Any edit to a pinned module breaks its identity.
**This is the clearest example of why the pinned set must not be touched by tidying.**

---

## Net effect

| | |
|---|---|
| Expert HazLenz semantic behaviour | **unchanged** |
| pinned module digests | **all 29 unchanged** |
| production build content | **zero files differ; 60 artifacts removed, all compiled Finder duplicates** |
| protected ladder | **17/17 before, 17/17 after** |
| historical evidence | **not modified** |
