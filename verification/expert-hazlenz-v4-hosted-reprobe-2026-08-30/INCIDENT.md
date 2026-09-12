# INCIDENT — §104's raw hosted-probe evidence was overwritten during the §106 v4 re-probe (2026-08-30)

## What happened

`backend/scripts/probe-expert-hosted-transport.ts` wrote its output to a **fixed, date-stamped
directory** — `verification/expert-hazlenz-hosted-transport-probe-2026-08-29/` — rather than one
scoped to each run. That directory held the account owner's real, successful hosted probe result
(7/7 HTTP 200, run by the owner in their own terminal after provisioning `ANTHROPIC_API_KEY`).

Executing `npm run probe:expert-hosted-transport` for this session's authorized v4 re-probe used the
same script, unmodified, exactly as instructed. It wrote into the same fixed directory and **silently
overwrote**:

- `results/hosted-probe-summary.json`
- `transport/hosted-probe.jsonl`

with the v4 re-probe's own output (which is itself a `BLOCKED` transport result — see
`REPORT.md` in this directory). The original files are not recoverable: the directory was never
committed to git (`git ls-files` on it returns nothing), and no other copy of the raw JSON existed on
disk.

## What was lost, and what was not

**Lost:** the pristine raw JSON artifacts of the owner's real hosted run.

**Not lost:** every figure derived from those artifacts. This assistant had, in the prior session
turn, already read and printed the full top-level structure (provider, model, routing totals,
grounding totals, all 18 gates with verdicts and notes) and the complete per-row detail for 5 of the
7 fixtures (`R1`, `R5`, `R6`, `H7`, `H8`) to its own conversation transcript before writing blueprint
§105, `docs/INSITE_CURRENT_STATE.json`, and
`verification/expert-hazlenz-hosted-behavior-repair-2026-08-30/SUMMARY.md`. Those durable documents
already contained the correct figures and were not corrupted by this incident. Two rows (`R2`, `R4`)
had their nested `score`/`grounding` sub-objects truncated in that transcript dump; their top-line
counts, tokens, latency and cost are exact, but their internal verdict detail is not recovered.

## What was reconstructed

`verification/expert-hazlenz-hosted-transport-probe-2026-08-29/results/hosted-probe-summary.RECONSTRUCTED-2026-08-30.json`,
assembled from the transcript, field-by-field labeled `_RECONSTRUCTION: EXACT` or
`_RECONSTRUCTION: PARTIAL`. All aggregate figures (the ones every downstream document actually
depends on) are exact.

## What was corrected

1. **`probe-expert-hosted-transport.ts`** — the output path now checks whether a prior summary
   already exists at the base directory. If one does, the run is diverted to a sibling directory
   suffixed with its own start time instead of overwriting it. A first run at a clean path is
   unaffected. This is a tooling fix; it changes no Expert HazLenz prompt, schema, contract, or
   normalization behaviour.
2. **Blueprint §105.0** — a new preface subsection recording the reconstructed real hosted-run
   figures and correcting a **separate, pre-existing citation defect**: §105's original text cited
   "§104" nine times to mean the owner's successful run, but blueprint §104 actually documents a
   different, earlier event (the credential-blocked attempt at the start of this session). Those
   nine citations, plus one in decision-log entry D-117, were retargeted to §105.0.
3. **`docs/INSITE_CURRENT_STATE.json`** — the `source` field on `authoritativeHostedProbeResult`
   corrected to record the destruction and point at the reconstruction.
4. **`verification/expert-hazlenz-hosted-behavior-repair-2026-08-30/SUMMARY.md`** — a correction
   notice appended rather than rewriting the document throughout.

## Where today's v4 re-probe's own evidence now lives

`results/hosted-probe-summary.json` and `transport/hosted-probe.jsonl` in THIS directory
(`verification/expert-hazlenz-v4-hosted-reprobe-2026-08-30/`) are the genuine, unmodified output of
today's blocked v4 run, moved here from the shared directory they were briefly and mistakenly
written into.
