# REPOSITORY COMPARTMENTALIZATION PLAN

**Authored in §223. Nothing in this plan was executed in §223.** No file was moved, renamed, merged,
archived or deleted. Every destructive proposal below carries the evidence that justifies it and the
check that must pass before it is carried out.

Scope: the Expert HazLenz surface and the repository structures that make it expensive to work in.
Deliberately out of scope: the deterministic HazLenz customer path, the frontend, and anything whose
movement would change runtime behaviour.

---

## 1. What the inventory found

| surface | location | size |
|---|---|---|
| Expert HazLenz runtime modules | `backend/src/safescope-v2/expert-hazlenz/` | 17 files, 8,034 lines |
| Owed-fact / authority / settlement | `.../expert-hazlenz/owed-facts/` | 9 files, 2,914 lines |
| Provider adapters | `.../expert-hazlenz-adapters/` | 2 files, 665 lines |
| Fixtures | `.../expert-hazlenz/fixtures/` | 18 files, 10,889 lines |
| Experiment and contract modules | `backend/scripts/lib/` | 158 files, 136 expert-prefixed |
| Harness entry points | `backend/scripts/` | 749 files |
| npm script surface | `backend/package.json` | 358 scripts |
| Validation evidence | `verification/` | 283 directories, 1.9 GB |
| Test/benchmark files inside the runtime tree | `backend/src/safescope-v2/tests/` | 68 files |

Two structural facts frame everything else.

**There are zero import cycles.** All 200 files across the runtime and experiment surfaces were
walked; the graph is acyclic and the dependency direction is one-way, `scripts → src`, on all 201
crossing imports. No validation code is reachable from the runtime tree by import.

**Expert HazLenz has no runtime consumer.** No NestJS controller, service, module or provider imports
it. The validated pipeline is assembled by `backend/scripts/lib/expert-221-assembly.ts`, not by a
production orchestrator. This is intentional — deterministic HazLenz remains the only
customer-authoritative path — but it means the repository's most safety-critical semantic contracts
live in a directory named `scripts`.

---

## 2. Evaluation against the fifteen named risks

| # | risk | finding |
|---|---|---|
| 1 | duplicated responsibility | **Present, bounded.** `expert-deterministic-projection.ts` exists twice: a §116 diagnostic prototype in `scripts/lib/` and its §119 production promotion in `src/`. Both files document the relationship in their headers. |
| 2 | circular dependencies | **None.** Verified across 200 files. |
| 3 | validation code leaking into runtime | **Present.** 68 benchmark, golden-test and regression files live under `backend/src/safescope-v2/tests/`, plus 12 `verify-*.ts` under `src/**/maintenance/`. They are inside `tsconfig.json`'s `include: ["src/**/*"]` and therefore inside the production build. |
| 4 | runtime logic inside experimental harnesses | **Present, and deliberate.** The §221-pinned first-pass contract, declaration projection, scope containment, verifier payload and both §218 verifier modules all live under `scripts/lib/`. Placing them there is what keeps them out of the production build. The cost is that the semantic contract is not discoverable where an engineer would look for it. |
| 5 | obsolete experimental code still appearing authoritative | **Present.** `scripts/lib/` holds 136 expert-prefixed modules; only 37 are on the §221 assembly closure. Nothing in the filenames distinguishes them. |
| 6 | competing definitions of the same contract | **Present.** See `SOURCE_OF_TRUTH_MAP.md`. |
| 7 | duplicate schemas/types | **Present.** Eight first-pass instruction variants and ten verifier contract/instruction variants. |
| 8 | duplicate prompt sources | **Present.** See `PROMPT_CONTEXT_OPTIMIZATION.md`. |
| 9 | unnecessary giant source files | **Present.** `expert-prompt.ts` is 1,636 lines / 114 KB. `docs/INSITE_ENGINEERING_BLUEPRINT.md` is ~308,000 words. |
| 10 | historical evidence mixed with active source | **Present at the top level.** `verification/` sits beside `backend/` and `docs/` with no active/archive split and no index. |
| 11 | generated artifacts mixed with authored code | **Present.** `backend/` tracks `build_errors.txt`, `build_errors_current.txt`, `build_output.txt`, `npm_build_diagnostics.txt`, `tsc_diagnostics.txt`, `server_logs.txt`, `report.pdf`, `generated-tests.json`, `feedback-store.json`, `pico.save`. |
| 12 | unclear naming | **Present.** Section-numbered filenames (`expert-210j-*`, `expert-218-*`) encode provenance but not role or currency. |
| 13 | dead files | **Likely, unproven.** 99 of 136 expert modules in `scripts/lib/` are off the §221 closure, but some are on other live harness closures. Not yet separated. |
| 14 | stale temporary scripts | **Present.** 393 of 903 files under `backend/scripts/` are untracked, including 49 one-off `analyze-*`, `probe-*`, `diagnose-*` and `_present_batch.ts`. |
| 15 | excessive imports / context coupling | **Present.** The §221 assembly transitively pulls 37 lib modules and 8 src modules, most of them superseded prompt ancestors. |

Additionally: **2,091 macOS duplicate-copy files** (`... 2.md`, `... 2.json`) exist under
`verification/`, 80 under `backend/`, 11 under `frontend-next/`, 1 under `docs/`. These are Finder
artifacts, not evidence.

---

## 3. Target structure

The existing layout supports a better target than the generic one, because the production-build
boundary is already doing real work and must be preserved. The proposal keeps that boundary and
makes it legible.

```
backend/src/safescope-v2/expert-hazlenz/
  contracts/        first-pass contract, wire schema, projection, verifier schema
  owed-facts/       ledger, binding, types, structural questions      (unchanged)
  authority/        property-authority.ts, expert-authority-*.ts
  settlement/       settlement-review.ts
  governed-evidence/governed-evidence-derivation.ts, citation boundary
  prompts/          expert-prompt.ts split by section
  providers/        (today: ../expert-hazlenz-adapters/)
  orchestration/    the one assembly path

backend/test/                       moved out of the production build
  unit/  integration/  regression/  golden/

backend/validation/
  active/      harnesses for the current open question
  archive/     superseded section harnesses, read-only
  fixtures/    the 18 fixture modules
  harness/     shared execution, ledger and digest utilities

docs/hazlenz/
  current/        state, invariants, context index         (created in §223)
  architecture/   pipeline and contract design
  governance/     these plans                              (created in §223)
  validation/     archive index
```

Moving contract modules from `scripts/lib/` into `src/.../contracts/` **requires** a replacement
production-build boundary first, because `tsconfig.json` includes all of `src/**/*`. Options: a
`tsconfig.build.json` with an explicit exclude, or a compile-time gate of the kind
`verifier-v3-development-boundary.ts` already uses. **Do not move any contract module before that
boundary exists and is tested.** This is the single most important sequencing constraint in the plan.

---

## 4. Proposed actions

### KEEP AS IS

- `backend/src/safescope-v2/expert-hazlenz/owed-facts/` — clean, cohesive, correctly placed.
- `expert-hazlenz-adapters/` separation from `expert-hazlenz/` — the header explains that the
  no-call harness scans every file in `expert-hazlenz/`, so the adapters must sit outside it. That
  is a working invariant; do not "tidy" it.
- Every `verification/**` directory and every `.sha256` manifest.
- The additive prompt-ancestor chain. See `PROMPT_CONTEXT_OPTIMIZATION.md`; flattening it would
  break byte-for-byte reconstruction of pinned identities.

### MOVE

| from | to | rationale |
|---|---|---|
| `src/safescope-v2/tests/` (68 files) | `backend/test/golden/` | removes benchmark and golden-test code from the production build |
| `src/**/maintenance/verify-*.ts` (12) | `backend/test/integration/` | same |
| `src/.../expert-hazlenz/fixtures/` (18) | `backend/validation/fixtures/` | fixtures are validation inputs, not runtime code |
| `scripts/lib/expert-2*-*` off the §221 closure (99) | `backend/validation/archive/` | superseded harness modules should not sit beside active contracts |
| `scripts/lib/` §221-closure contracts (7 pinned modules) | `src/.../expert-hazlenz/contracts/` | **blocked** on the build boundary above |

### RENAME

- Prefix each `scripts/lib/` module with its status once moved: `active-`, `archive-`. Section
  numbers stay; they are the provenance link to the evidence.
- `backend/scripts/` → `backend/validation/harness/` for the ~200 section-numbered entry points,
  leaving genuine operational scripts behind.

### MERGE

- `expert-prompt.ts` (1,636 lines): split rather than merge — one file per prompt section, one
  composer. Reduces the read cost of touching any single block.
- 28 local `const sha = ...` definitions across `scripts/lib/`: one shared digest utility.
- 95 ad-hoc digest helpers across `backend/scripts/`: same.

### ARCHIVE

- `docs/expert-hazlenz/` (6 files) → `docs/hazlenz/validation/superseded-209/`. Superseded at §209;
  it still claims to be "the primary entry point for every future session", which now misleads.
- Section harness entry points for closed sections (§187–§220) → `backend/validation/archive/`.

### DELETE-CANDIDATE

Nothing is deleted in §223. Each item below states the check that must pass first.

| candidate | count | evidence | required check |
|---|---|---|---|
| macOS duplicate-copy files (`* 2.*`) | 2,183 | Finder artifacts; byte-identical or stale copies of a sibling | for each, confirm a non-suffixed sibling exists and that the file is named in no `.sha256` manifest |
| tracked build/diagnostic output in `backend/` | 10 | `build_errors.txt`, `tsc_diagnostics.txt`, `server_logs.txt`, `report.pdf`, `pico.save` and peers are regenerable | confirm each is regenerable and add to `.gitignore` in the same change |
| untracked one-off analysis scripts | 49 | `analyze-*`, `probe-*`, `diagnose-*`, `_present_batch.ts`, never committed | confirm each is referenced by no `package.json` script and no evidence report |
| `scripts/lib/expert-deterministic-projection.ts` | 1 | §116 diagnostic prototype, superseded by the §119 promotion in `src/` | confirm no live harness imports the prototype |
| `backend/tsconfig.scripts-NNN.json` for closed sections | 21 | one per section; sections through §220 are closed | confirm the matching `package.json` scripts are also archived |

---

## 5. Ordering

1. `.gitignore` additions and the generated-artifact cleanup. Zero risk.
2. Duplicate-copy sweep under `verification/`, manifest-checked. Zero runtime risk.
3. Archive `docs/expert-hazlenz/` and add the validation archive index.
4. Move tests and fixtures out of `src/`. Verify the production build is unchanged.
5. Build the replacement production-build boundary and test it.
6. Only then, move the pinned contract modules.

Steps 1 through 4 are safe now. Steps 5 and 6 require their own authorization, because step 6 changes
where a pinned identity's bytes live and every module digest recorded in `INTEGRATED-PREREGISTRATION-221.json`
would need a recorded, verified successor mapping.
