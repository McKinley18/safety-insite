# BLUEPRINT-STATUS-210A

TBR-1 … TBR-15 assessed against the frozen §208/§208B/§209 evidence only. No provider call was made,
so anything requiring execution to observe is `NOT_YET_MEASURED` rather than assumed.

| Rule | Status | Evidence |
|---|---|---|
| **TBR-1** Minimum sufficient semantic context | **PARTIALLY_SATISFIED** | Nothing decision-critical was withheld from the first pass. But AC-10 shows the *projection* dropping `missingFact` and the clarification, so the verifier received **less** than sufficient context for the property it was judging — a TBR-1 violation in the downstream direction (G5). |
| **TBR-2** Single-fact verifier isolation | **NOT_SATISFIED** | Sibling OwedFacts, sibling clarifications and the full candidate block are all supplied. 6 of 6 axis-L slots on multi-fact rows drifted; none passed. This is the G6 failure. |
| **TBR-3** Static/dynamic separation | **NOT_SATISFIED** | Verifier: system prompt, schema and wrapper have **1 distinct identity each** across 24 calls and were re-sent in full every time. First pass: **24 distinct schema hashes** for 3 grammars, so the stable prose is not a cacheable prefix. |
| **TBR-4** Deterministic call elision | **ALREADY_SATISFIED** | Verifier elided on AC-04, AC-06, AC-23, AC-24 (zero admitted facts); governed elided on AC-23, AC-24. Exactly the authorized shape, and no semantic inference was used to decide it. |
| **TBR-5** No semantic repair calls | **ALREADY_SATISFIED** | No repair stage exists. `PROJECTION-208-CORRECTED` refuses rather than reconstructs; G11 records that no repair path exists. The RC-D detector explored in this slice is explicitly detect-and-refuse only. |
| **TBR-6** Governed retrieval not corpus dumping | **ALREADY_SATISFIED** | AC-22 received 2 sourceIds (`GOV-ECP-01`, `GOV-PPE-02`), 2,778 input tokens total. The G14 failure is a *grounding* defect, not an evidence-supply defect — the product owner recorded the provider-visible text was sufficient to judge grounding. |
| **TBR-7** Remove representational duplication only | **PARTIALLY_SATISFIED** | No duplicated field was found to remove. The opposite is true: the projection already drops `missingFact`, and AC-10 lost the before/after proving qualifier through exactly that gap. The contract is lossy, not redundant. |
| **TBR-8** Observation-span localization | **NOT_SATISFIED** | Full observation text is carried into downstream calls. No localization mechanism exists, so the fail-open requirement is untested. |
| **TBR-9** Provider calls require a semantic purpose | **ALREADY_SATISFIED** | Three stages, three distinct semantic jobs: first pass authors properties; verifier judges binding and sufficiency; governed stage judges applicability and grounding. No stage duplicates another's semantic work. |
| **TBR-10** No unsafe semantic batching | **PARTIALLY_SATISFIED** | Calls are correctly 1-per-admitted-fact (24/24). But the *payload* batches independent facts even though the call does not — which is the same hazard by another route, and G6 is the evidence. |
| **TBR-11** Compact machine contracts | **PARTIALLY_SATISFIED** | Structured enums and stable keys are used. But `assertedConditionState` carries five values across the cohort — `ACTIVE` (24), `INSUFFICIENT_EVIDENCE` (16), `UNKNOWN` (6), `CONTROLLED` (2), `CORRECTED` (1) — with `UNKNOWN` and `INSUFFICIENT_EVIDENCE` apparently used for the same epistemic state by different cases. That is an interpretability weakness, not compactness. |
| **TBR-12** Progressive evidence loading | **PARTIALLY_SATISFIED** | The first pass correctly receives no verifier material and the governed stage no unrelated candidate state. The verifier, however, receives the whole row. |
| **TBR-13** Cache immutable work | **NOT_SATISFIED** | No cache-read or cache-write token field exists in either ledger; caching was not merely ineffective but uninstrumented. Deterministic projections are persisted and reused correctly, so the deterministic half of the rule holds. |
| **TBR-14** Targeted development validation | **ALREADY_SATISFIED (so far)** | This slice is zero-provider and analysed the existing 24-case cohort as diagnostic evidence. No new broad cohort was constructed. Compliance continues only if §210B stays bounded. |
| **TBR-15** Token / cost telemetry | **PARTIALLY_SATISFIED / NOT_YET_MEASURED** | Input, output, cost, latency and per-stage attribution **are** recorded and were sufficient to build a real baseline. **Cached tokens are not recorded at all**, so the cached-token half of TBR-15 is unmeasurable from frozen evidence. |

## Summary

- **ALREADY_SATISFIED: 5** — TBR-4, TBR-5, TBR-6, TBR-9, TBR-14
- **PARTIALLY_SATISFIED: 6** — TBR-1, TBR-7, TBR-10, TBR-11, TBR-12, TBR-15
- **NOT_SATISFIED: 4** — TBR-2, TBR-3, TBR-8, TBR-13

The four unsatisfied rules are not independent. **TBR-2/TBR-10** are the G6 defect. **TBR-3/TBR-13**
are the caching gap and account for ~59% of run cost. **TBR-8** is a prerequisite for doing TBR-2
safely. Two coherent workstreams, not four.

Worth stating plainly: the token-efficiency rules that are *unsatisfied* are the ones that cost money,
and the safety rules that are *satisfied* (TBR-4, TBR-5, TBR-6, TBR-9) are the ones that protect
capability. Nothing in this slice found a case where satisfying a token rule would require weakening a
safety rule — the two largest savings are transmission-order changes that remove no semantic content.
