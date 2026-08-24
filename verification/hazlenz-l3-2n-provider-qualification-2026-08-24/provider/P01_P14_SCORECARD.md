# P-01 … P-14 scorecard — scored 2026-08-24

Requirements taken **verbatim and unchanged** from
`verification/hazlenz-level3-architecture-2026-08-22/PROVIDER_REQUIREMENTS.md`. **No requirement was
altered after seeing results.** `P-05` and `P-06` are the gating requirements.

Candidates are the **currently documented stable** Gemini models. `gemini-3.1-pro-preview` is shown
for reference only — it is a preview and is excluded from qualification by `P-07`.

| # | Requirement | `gemini-3.7-flash` (STABLE) | `gemini-3.6-flash` (STABLE) | `gemini-2.5-pro` (STABLE) | `gemini-3.1-pro-preview` (ref) |
|---|---|---|---|---|---|
| P-01 | Reliable structured output | **PASS** — `responseSchema`, 0 parse failures in 51 calls | **PASS** — 0 parse failures in 51 calls | **n/a** — not callable | PASS |
| P-02 | **≥99% valid after ≤1 retry** | **FAIL — 17/24 = 71%** valid; 7 rejections, **6 of 7 reproduce** across isolated processes | **FAIL — 20/24 = 83%** valid; 4–5 rejections, 3 reproduce | **n/a** | PASS — 23/24 = 96%, 1 rejection |
| P-03 | Contextual reasoning quality | **PASS — model tier 13/13**, `F-WC-09` and `F-WC-03` both correct | **PASS — model tier 13/13**, both correct | **n/a** | PASS — 13/13 |
| P-04 | Long-enough context | **PASS** — 1,048,576 in / 65,536 out; prompts ~2.4k | **PASS** — same | **n/a** | PASS |
| P-05 | **Zero training on submitted data, contractually** `GATING` | **PASS on PAID tier only** — *"Google doesn't use your prompts…or responses to improve our products"*. **FAIL on free tier** — content used to improve products, human reviewers may read it | same | same | same |
| P-06 | **Configurable/short retention, stated window** `GATING` | **PASS** — paid-tier abuse-monitoring retention is a stated **55 days**; **ZDR available on approved request** (paid only), clearing all user content and identifiable metadata before logging. HazLenz uses no ZDR-incompatible feature | same | same | same |
| P-07 | **Pinned, non-silently-updated model id** | **PASS** — documented stable, GA 2026-08-13; identity `models/gemini-3.7-flash` @ `3.7-flash-08-2026`. *Caveat: "stable models **usually** don't change"; no content digest exists* | **PASS** — @ `3.6-flash-07-2026` | **n/a** | **FAIL** — preview; and preview labels have been silently redirected to other models |
| P-08 | Deterministic-enough reproduction | **PARTIAL** — temperature 0, `seed` best-effort; **2 of 24 rows differ** across two isolated processes | **PARTIAL** — **3 of 24** differ | **n/a** | 0/24–2/24, instrument-dependent (`D-62`) |
| P-09 | Explicit timeout + retry, client-controllable | **PASS** | **PASS** | **n/a** | PASS |
| P-10 | Documented rate limits for tens of analyses/day | **PASS** — 102 calls completed with 0 rate-limit errors | **PASS** | **n/a** | PASS |
| P-11 | Production observability | **PASS at transport** — status, latency, token accounting captured. **Not implemented in HazLenz** (no hosted adapter exists) | same | **n/a** | same |
| P-12 | Availability/SLA adequate for an advisory surface | **PASS** — 102/102 successful, 0 transport failures, 0 truncation | **PASS** | **FAIL — HTTP 404, "no longer available to new users"** | PASS |
| P-13 | Multimodal available later without re-architecting | **PASS** | **PASS** | **n/a** | PASS |
| P-14 | Predictable cost per analysis | **PASS** — ~$0.004/analysis at $0.75/$3.75 per 1M | **PASS** | **n/a** | PASS |

## Verdicts

* **`gemini-2.5-pro` — DISQUALIFIED on `P-12`.** It is the only Pro-tier model documenting itself as
  a stable release, and it is **not callable**: `HTTP 404, "no longer available to new users"`, with
  Google's own error redirecting to a **preview** model.
* **`gemini-3.7-flash` — DISQUALIFIED on `P-02`.** 71% schema-contract validity against a ≥99% bar,
  and the failures are **largely deterministic**, so the permitted single retry cannot be assumed to
  rescue them.
* **`gemini-3.6-flash` — DISQUALIFIED on `P-02`.** 83% against the same bar.
* **`gemini-3.1-pro-preview` — meets every requirement except `P-07`**, which is the one that
  `D-67` already recorded and which `§29.8`'s single-use rule makes decisive.

**`P-05` and `P-06` — the gating pair — are SATISFIABLE** on a billing-enabled project, and fully
satisfiable with ZDR approval. **Data handling is not the blocker.**
