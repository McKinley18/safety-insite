# L3-2k — evidence index

Blueprint **§43**. Decisions **`D-63`** (`F-WC-09`) and **`D-64`** (`C-CS-05`), both additive.
HEAD `1feda622`. **DIAGNOSIS ONLY — nothing repaired, no production file changed.**

| file | what it carries |
|---|---|
| `STATUS.md` | the two root causes, the traces, both classifications, the shared boundary, the instrumentation ledger, the provider-decision implication, 10 acceptance gates |
| `NEXT_ACTION.md` | why L3-3 is still ineligible, and the programme decision handed over — including why the remaining gap is a **policy** gap, not a measurement one |
| `preservation-pre.txt` / `PRESERVATION_POST.txt` | HEAD, 23 tag objects, 4 stashes, the locked instrument and scorers, the shipped prompt and schema, all 19 modules, the sealed corpus, and every file of the L3-2g / L3-2h-final / L3-2i / L3-2j / L3-2j-closure packages — before and after |

## Root cause

| file | what it is |
|---|---|
| `rootcause/CASE_TRACES.json` | **the deliverable.** Every stage for every run: raw candidate identity, family, `conditionState`, verbatim rationale, evidence binding, validator state and issues, semantic-binder issues, whether §34.2's gate fired, `clarificationsDropped`, binder rejections and their codes, `controlAdequacy`, and the two final decision axes |
| `instrumentation/l32k-artifact-table.txt` | the **EXISTING-ARTIFACT** sweep that came first — 80 recorded rows for the two scenarios across L3-2g, L3-2h, L3-2h-final, L3-2i, L3-2j and L3-2j-closure |

## Minimum reproduction — 12 variants, 12 processes (§38.3), pids in every artifact

| file | what it is |
|---|---|
| `results/qwen/D_WC09_LADDER.json` + `_REPEAT` | `F-WC-09` **and the `F-WC-03` control** through the full shipped sequence. `CONTROLLED` → validator `VALID` → **binder REJECTS** → `boundHazards: []`. The control is `ACTIVE` → kept → delivered |
| `results/qwen/D_CS05_LADDER_B*.json` (×4) | `C-CS-05` on the **shipped** v6 prompt: `HYPOTHETICAL`, **no question**, 4 of 4 |
| `results/qwen/D_CS05_LADDER_A*.json` (×4) | `C-CS-05` on §36.7's variant A, digest-pinned to the frozen `a6dea73f`: a question in **4 of 4**, the state demoted in **1 of 4**, §34.2's gate firing in **3 of 4** |
| `results/gemini/D_WC09_LADDER.json` + `_REPEAT` | the one unresolved provider-side question: Gemini's `F-WC-09` candidate is `ACTIVE`, **survives the binder**, and reaches the customer — twice |
| `transport/*.jsonl` | 4 hosted calls, all HTTP 200, `finishReason: STOP`, no retries, no truncation. No credential, no prompt text, no scenario text |

## Instrumentation

`instrumentation/diagnose-l32k-shipped-residual.ts` — the disposable instrument. It **imports** the
shipped schema builder, user-prompt builder, normalizer, validator **and semantic binder** and
reproduces none of them; it asserts the shipped prompt is restored v6 and that variant A reproduces
the frozen digest before it will run; it **refuses more than one variant per process**. It modifies no
production file, no shipped prompt, no shipped schema, no provider adapter, no historical harness and
no historical scorer.

`instrumentation/run-l32k-gemini.sh` — the two hosted runs, own process each, shim restarted between.

## Regression

`regression/` — all 10 L3 offline suites (**814 assertions, 0 failed**, identical to §41.8 and §42.9
suite for suite), six KG contract suites, `hazlenz-core` (**206 pass / 2 fail**, the two documented
§13.1 failures only), and both `tsc --noEmit` runs (exit 0, with the new script present).

## What is NOT here, deliberately

**No repair. No prompt or schema edit. No patched scorer or harness. No new holdout. No sealed corpus
opened. No production provider selected.**
