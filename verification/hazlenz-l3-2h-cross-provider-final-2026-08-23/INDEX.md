# L3-2h FINAL — evidence index

`L3_2H_COMPLETE — TERMINAL_A — CURRENT_EVALUATION_PROVIDER_NOT_VALIDATED_FOR_ADVANCEMENT` ·
`CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE — REPRESENTATION_BOUND` *(preserved separately)*
Baseline HEAD `1feda622`, unchanged. Blueprint **§39**; decision log **`D-55`**, **`D-56`**.
**No sealed set was opened. No scorer was patched. No production, source or script file changed.**

## Read in this order

| file | what it settles |
|---|---|
| `STATUS.md` | the full result — credential gate, method, the split verdict, the scorer artifact |
| `NEXT_ACTION.md` | the terminal, what not to re-derive, and the fixed L3-2i order |
| `preservation-evidence.txt` | HEAD, upstream, locked-harness and scorer digests, sealed-corpus hashes, stash, tags |
| `adapter/` | the transport-only shim and the run/score drivers — **read `run-l32h.sh` for the §38.3 process isolation** |
| `results/` | scored output, **the same byte-unmodified scorers on both providers** |
| `transport/` | per-call token and latency accounting for all 72 calls |

## Method artifacts

| file | contents |
|---|---|
| `adapter/gemini-ollama-shim.js` | Ollama-protocol translation in front of the Gemini API. **Transport only** — the harness's pre-existing `L3_OLLAMA_ENDPOINT` hook was pointed at it; no scenario, label, variant, prompt, schema, resolver ordering or scorer was touched |
| `adapter/run-l32h.sh` | **three separate harness processes**, shim restarted between them — §38.3's requirement that the noise-floor control never share a process with the variant it controls |
| `adapter/score-l32h.sh` | scores Gemini **and** the qwen baseline with the same byte-unmodified scorers; the only marshalling is concatenating three per-variant row sets |
| `adapter/truerecall.py` | the full-cohort recount behind `D-56` — counts a zero-candidate row as a clarification miss |

## Scored results

| file | headline |
|---|---|
| `results/l32h-gemini-V_S_STRUCT.json` · `-V_S_STRUCT_MOVE1.json` · `-V_S_STRUCT_REPEAT.json` | one file per variant, one process per file |
| `results/l32h-gemini-merged.json` | the three variants concatenated verbatim — **72 rows** |
| `results/gemini-order-sensitivity.json` | noise floor **1/24** (`F-CL-01`); one block moved **2/24** (`F-CL-01`, `B10`). **The `V_S_STRUCT_INV` row reports `scenariosCompared: 0` — a non-comparison, not a zero. The six-block reversal was not run this phase (§38.7 fixed the run at three variants) and must not be quoted as a result** |
| `results/gemini-fact-coherence.json` | incoherence **4.3% / 3.8% / 4.0%**; **`CONDITIONAL_AND_ASSERTED` = 0 in every variant** across 74 candidates; control-reading 5/6 all three, the miss being `F-COR-01` **identically each run** |
| `results/gemini-resolution.json` | HC **12/12** under all three orderings; false ACTIVE **0**; clarification 100/100 on the scored cohort — under the **shipped `R0`**, not only `R1` |
| `results/qwen-order-sensitivity.json` | noise floor **0/24**; one block moved **3/24** (`F-CL-01`, `F-CL-03`, `C-CS-05`) — §38.2 reproduced |
| `results/qwen-fact-coherence.json` | incoherence **7.1% / 12% / 6.9%**; `CONDITIONAL_AND_ASSERTED` **1 / 2 / 2** — the §37.5 mechanism |
| `results/qwen-resolution.json` | `R0` recall **0**; `R1` **100 / 75** — the 75% that `D-56` corrects to 60% |
| `transport/transport-V_S_STRUCT*.jsonl` | 72 calls, **0 transport errors**, every `finishReason: STOP`, no retries |

## Two figures a reader must not take from the wrong place

1. **Mean thought tokens per call is `527`, not `~584`.** `STATUS.md` §6.1 carries an earlier
   **interim** figure. The measurement is `transport/transport-V_S_STRUCT*.jsonl`: **37,444 thought
   tokens over the 71 of 72 calls that reported a count** (one call reported none), range 232–1,023
   — mean **527**. `STATUS.md` is **left exactly as written**: a verification artifact is not edited
   to suit a later recount. Blueprint §39.9 carries `527`, and that is the figure to cite.
2. **`STATUS.md` §4.2 says "terminal B" for the clarification finding.** It is using **§37's**
   lettering, where `B` means *representation-bound* — correct in that system. Under the **L3-2h
   entry contract's** lettering, `B` means *the second provider showed substantially the same
   instability*, which is **not** what was measured. Blueprint **§39.7** disambiguates both
   four-letter systems in full. The canonical terminal letter for this phase is the entry contract's
   **`A`**.

## Production code changed by this phase

**None.** Zero production files, zero source files, zero script files, zero scorer files. The locked
harness `ablate-l32g-state-separation.ts` (`73f74131…`) and all three companion scorers
(`7e3481f9…`, `4ecaada4…`, `57064e2f…`) are byte-identical before and after and were run **as-is on
both providers**, which is what makes the two columns comparable rather than merely adjacent.

The one implementation-shaped finding — `rederive-l32g-resolution.ts:94` dropping zero-candidate rows
before clarification scoring — is **reported, not patched**. Patching it is the **first** ordered step
of L3-2i, taken **before** any contract change (`D-56`).

## Egress and preservation

`generativelanguage.googleapis.com` — **73 calls** (1 auth probe carrying the credential and nothing
else, 72 inference). `127.0.0.1:11434` — **0 calls**. Only already-opened diagnostic scenarios were
transmitted: **no customer data, no production data, no sealed corpus, no credential in any
artifact.** HEAD `1feda622` with 0/0 upstream divergence, **4** stash entries with no stash operation
run, **23** tags recorded as tag *objects* per §38.8's lesson, sealed corpus `a95e5480…` /
`49aa40fd…` / `6f6897f1…` hash-verified and **not opened**.

## The one-line summary

The second provider was finally obtainable, and it **exonerated the contract's incoherence axis and
convicted the model**: §37.5's self-contradiction class is empty on Gemini, so that mechanism is
provider-bound at n = 2 and Terminal A stands. What it did **not** do is close the clarification
axis — that residual is a representation defect no provider swap can move, and the figure the
programme had been quoting for it was inflated by a scorer that could not see the failure.
