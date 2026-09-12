# §198 — source diff, with before/after hashes

Every hash was computed from the file on disk. The "before" column is a manifest taken **before any
§198 edit**; `SOURCE-INTEGRITY.txt` recomputes the current values independently.

## Files MODIFIED — three, all under `backend/scripts/`

| file | before | after |
|---|---|---|
| `scripts/lib/expert-first-pass-instruction-vnext.ts` | `ec89b349d246e983…` | `88e75812ba037ad1…` |
| `scripts/lib/expert-first-pass-owed-fact-projection.ts` | `f5b602a008606286…` | `aab67e0b2e9c7303…` |
| `scripts/test-196-structured-first-pass-owed-facts.ts` | `67ea52d14e51522a…` | `f248b6f30d60eef8…` |

**`expert-first-pass-instruction-vnext.ts`** — Option B. The declaration block is split into a head,
a liftable governed-binding paragraph and a tail; two system-prompt variants are built from them;
`unresolvedFactDeclarationItemSchema` omits `governedEvidenceSourceIds` entirely when the supplied
set is empty; `buildExpertVNextUserPrompt` and `renderAvailableGovernedEvidence` expose the exact
`sourceId`s; `reconstructV15SystemPrompt` takes the binding so both variants are provably reversible.

**`expert-first-pass-owed-fact-projection.ts`** — one change: when no governed source was supplied
**and** the declaration carries no governed field, there is nothing to check. Previously the parser
refused a non-array, which after Option B would have refused every well-formed declaration on ten of
twelve rows. Fail-closed is unchanged where the field is present.

**`test-196-structured-first-pass-owed-facts.ts`** — K3 corrected additively (asserts the current
architecture), K3b added (asserts the supersession is registered), and the prompt-lines import
renamed. **91 → 92 cases.** The §196 *evidence* is untouched; only the executable regression moved.

## Files ADDED — seven

| file | sha256 |
|---|---|
| `scripts/lib/expert-pre-inference-circuit-breaker.ts` | `4b4d6b96a51b087a…` |
| `scripts/lib/expert-empty-run-safety.ts` | `a34ebff758e9a23f…` |
| `scripts/lib/expert-source-semantic-scan.ts` | `862ef3eb7dfa0468…` |
| `scripts/lib/expert-superseded-claims.ts` | `ff2dd1426c3289a4…` |
| `scripts/test-198-transport-remediation.ts` | `bf62667fc7d906ad…` |
| `scripts/verify-198-source-integrity-2026-09-07.ts` | `1a6c28a5cd72ad79…` |
| `scripts/emit-198-request-compatibility-2026-09-07.ts` | `e23757f93cc90917…` |
| `tsconfig.scripts-198.json` | `c0e2ece8f8137481…` |

## Files DELIBERATELY UNCHANGED — verified, not assumed

| file | status |
|---|---|
| `backend/src/**` — **every file** | **NO file under `src/` was modified by §198** |
| `src/…/expert-prompt.ts` | byte-unchanged; v15 prompt still `20979d90c0fe0b81…` |
| `src/…/owed-facts/*.ts` | all four §187-pinned hashes unchanged |
| `scripts/lib/expert-verifier-contract-v3*.ts`, `expert-verifier-instruction-v3*.ts` | unchanged |
| `scripts/lib/expert-governed-citation-reuse.ts` | unchanged |
| `scripts/lib/expert-197-cohort-2026-09-07.ts` | unchanged |
| `scripts/lib/expert-source-audit-integrity.ts` | `d20210d005a7f755…` before and after |
| `scripts/score-197-deterministic-2026-09-07.ts` | `dd56ed8c2a0a7253…` before and after |
| `scripts/execute-197-structured-e2e-2026-09-07.ts` | `0f6b9128b211b98a…` before and after |
| `scripts/verify-197-source-integrity-2026-09-07.ts` | `c8c13d5490ac72eb…` before and after |

The three §197 instruments are unchanged **on purpose**: they are historical, they produced frozen
evidence, and the §197 executor's abort on a moved prompt hash is the mechanism that retires the
protocol instance.

### One thing that had to be undone

Mid-slice, the §198 empty-run module was wired into the §197 scorer and the scorer was run — which
**rewrote `§197/DETERMINISTIC-RESULTS.json`**. Caught immediately against the pre-edit manifest. The
patch was inverted, the scorer restored to its §197 form, the file regenerated, and all 28 §196/§197
evidence files verified byte-identical to baseline. The §197 scorer therefore keeps its correction
in place, and the permanent invariant lives in the new shared module instead.

## Protocol identity

| | sha256 | |
|---|---|---|
| v15 base | `20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979` | **UNCHANGED** |
| vNext, capability **ABSENT** | `bdb3af044340dac164b979672ab61be8f14e5d190abbd7e496b82dd5010b4f7b` | NEW |
| vNext, capability **PRESENT** | `669bde6933e19bd1e1c35acde9a8db2a24020666917d9fe79c0718d5344df44b` | NEW |
| §197 pinned vNext | `05e1ad22efd1353d72f04406f63ee3985892072ca566aed5ceb34c4c29881db6` | **RETIRED — no longer produced** |

There are now **two** system-prompt hashes, one per capability variant, and the wire schema is
per-request **and** per-capability. A successor preregistration must freeze both prompts and freeze
the schema per row.

## Evidence packages

- **ADDED**: `verification/expert-hazlenz-structured-pipeline-transport-remediation-2026-09-07/`
- **UNCHANGED**: §196 (14 files) and §197 (14 files), asserted by package digest in the §198 gate.

## Git

**NO COMMIT. NO PUSH. NO TAG. NO DEPLOY. NO BRANCH CREATED.** All §198 files are untracked or, for
the three modified scripts and the two documents, already-modified paths carrying substantial
pre-existing uncommitted work from earlier slices, which §198 preserved.
