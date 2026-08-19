# Memory / CPU / Scaling

## Method and honesty note
Measurements use the backend's own built-in `/health` memory reporting (RSS/heap, already instrumented in the running app — no code added) plus wall-clock timing from the performance corpus. No dedicated profiler (e.g. `--prof`, clinic.js) was attached, and no CPU percentage metric was captured — local tooling in this pass supports only approximate RSS/heap tracking, and this is reported as an approximation, not precise resource accounting.

## Measured memory
| Point in session | RSS | Heap used | Heap total |
|---|---|---|---|
| Cold startup (first backend launch) | 868-877 MB | 684-691 MB | — |
| After ~30 classify requests + full browser walkthrough (register, login, multiple inspections, multi-hazard decomposition, risk confirmation, finalize attempts) | 850 MB | 643 MB | 703 MB |

RSS and heap-used both went **down** slightly from cold start to warmed/loaded state (likely GC activity and/or cold-start module-loading overhead settling), not up. **No evidence of a memory leak** was found from repeated classify requests at this sample size (~30 requests over roughly 30 minutes of mixed activity).

## Cost by scenario type (derived from `HAZLENZ_PIPELINE_TIMINGS.md`, as a latency proxy for CPU cost — no direct CPU measurement was taken)
- Single-hazard, short text: fastest (~38-69ms warm).
- Single-hazard, long text (`long_single_hazard`, a 3-sentence paragraph): slowest of the successfully-measured items (~147-204ms) — text length, not hazard count, was the stronger driver of latency in this sample.
- 3+ hazard, multi-sentence text: mid-range (~75-78ms) — cheaper than the single long-text scenario, reinforcing that length matters more than hazard count for latency in this pipeline.

## Nonlinear scaling
No clearly nonlinear (e.g. quadratic) scaling was observed in the sample collected — latency increases were roughly proportional to input length across the corpus, not explosive. This is a small sample (n=30, single-process, sequential requests only) and should not be read as a guarantee at production scale or under concurrent load, which was not tested in this pass.

## What was not measured (explicit gaps)
- CPU percentage / core utilization during a request.
- Behavior under concurrent (parallel) request load — everything in this pass was sequential.
- Frontend (browser tab) memory/CPU during a long inspection session.
- True cold-start latency isolated from JIT/connection-pool warmup (the very first request after backend boot was not separately isolated).
