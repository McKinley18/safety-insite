# EXPERT HAZLENZ — PROVIDER TRANSPORT PROBE (2026-08-29)

> ### `EXPERT_HAZLENZ_PROVIDER_TRANSPORT_PROBE_INCONCLUSIVE — NO_EVALUATION_SPEND_AUTHORIZED`
> ### 14 / 14 hard transport gates **PASSED** · 6 calls · **$0.00** · production untouched
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

**The adapter and the validation boundary passed every gate. The provider question did not get
answered, and the verdict attaches to that — not to the adapter.** Two independent reasons, either
of which alone is sufficient, are in §5 and §6.

HEAD unchanged: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`, `main`, 0 ahead / 0 behind.

---

## 1. Provider selection was forced by measurement, not chosen

No hosted provider credential is resolvable on this machine:

| credential | state |
|---|---|
| `ANTHROPIC_API_KEY` | **absent** |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | **absent** |
| `OPENAI_API_KEY` | present but an **11-character `sk-` stub** — not a usable key |

No value was printed, logged, hashed or persisted; only presence and length were measured, and the
length is reported because it is what proves the OpenAI value is a stub rather than a key.

This is the position `D-92` recorded for the L3 programme, and the resolution is the same one
`ollama-reasoning-provider.ts` already documents: **probe the locally hosted model, and report the
hosted question as open rather than as answered.**

```
provider   local-ollama
model      qwen3-coder:30b   (30.5B, Q4_K_M, served on loopback)
endpoint   127.0.0.1:11434   — no egress; no observation text leaves the host
cost       $0.00 actual — no metered API was contacted
```

**This is not a production provider recommendation.** A local 30B model is not the customer-facing
Expert layer, and nothing measured here transfers to a hosted one.

## 2. Adapter architecture — the core stayed provably pure

`test:expert-nocall-harness` section D reads every file in `expert-hazlenz/` and fails on any
network primitive, endpoint, credential or vendor name. The adapter contains four of those five by
necessity, so it lives in a **sibling directory**:

```
src/safescope-v2/expert-hazlenz/            core — 10 files, still 0 network primitives, 0 vendor names
src/safescope-v2/expert-hazlenz-adapters/   ollama-expert-provider.ts  (the only file that calls out)
```

The dependency direction is one-way and total: the adapter imports the contract; the contract knows
no vendor and has no adapter registry. **A guard written before the adapter existed is what decided
where the adapter went** — the boundary was enforced by a test rather than by a convention.

`analyze()` returns raw `unknown`, so the adapter cannot assert that validation happened. Everything
it produces still crosses `normalizeExpertOutput()`.

### The quote binder, and why it is not a weakening

A model cannot reliably produce character offsets — L3 measured that the expensive way, with an
`EVIDENCE_OUT_OF_BOUNDS` on a `highConsequence` row taking three gates down with it. So the model is
never asked for an offset. It is asked for the exact quote, and the adapter resolves the span.

A quote that **is** in the source binds to a real span, which the core validator then re-checks by
exact equality. A quote that **is not** binds to `[-1, -1)` and the core validator rejects it. **The
unbindable quote is never dropped** — dropping it would hide a fabrication behind a smaller,
cleaner-looking result.

## 3. Calls — 6 attempted, 6 completed, ceiling 12, no early stop

| | scenario | HTTP | status | latency | tok in/out | cand | clar | ins | dis | protected halves |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | multi-hazard, real interaction | 200 | PRESENT | 10 175 ms | 736 / 315 | 0 | 0 | 0 | 0 | **byte-identical** |
| P2 | **underdetermined — gate 6** | 200 | PRESENT | 7 510 ms | 668 / 518 | **0** | **1** | 0 | 0 | **byte-identical** |
| P3 | negated / safe state | 200 | PRESENT | 4 697 ms | 682 / 319 | 0 | 0 | 0 | 0 | **byte-identical** |
| P4 | governed record supplied — gate 12 | 200 | PRESENT | 4 887 ms | 720 / 331 | 0 | 0 | 0 | 0 | **byte-identical** |
| P5 | life-critical — gate 7 | 200 | PRESENT | 5 083 ms | 716 / 346 | 0 | 0 | 0 | 0 | **byte-identical** |
| P2R | repeatability, identical seed | 200 | PRESENT | 7 561 ms | 668 / 518 | **0** | **1** | 0 | 0 | **byte-identical** |

Totals: **4 190 prompt tokens, 2 347 output tokens**, p50 **7 510 ms**, max **10 175 ms**, **$0.00**.
Zero HTTP/API failures. Zero normalization rejections. Zero merge-invariant violations across all six.

**Cheap repeatability: P2 and P2R produced identical collection counts and identical token counts**
under `temperature=0, seed=20260829`. Both parameters **are** forwardable on this transport — which
is precisely what was *not* true of the hosted provider that made L3's G9 gate unreachable. That is
recorded as a property of **this** transport, not as a general fact.

## 4. The fourteen hard transport gates — all PASSED

| gate | result | evidence |
|---|---|---|
| G01 provider callable | **PASS** | 6/6 HTTP 200 |
| G02 no credential/config failure blocks intended use | **PASS** | local transport reads no credential |
| G03 all intended calls return at transport level | **PASS** | 6/6 |
| G04 structured output parseable | **PASS** | 6/6 parsed as JSON |
| G05 validates against the internal schema after normalization | **PASS** | 6/6 reached `PRESENT` |
| G06 **clarification with ZERO hazard candidates** | **PASS** | **2 live responses** carried a question with no candidate |
| G07 no response mutated the deterministic/governed halves | **PASS** | 6/6 byte-identical, 0 invariant violations |
| G08 model identity captured | **PASS** | `qwen3-coder:30b`, read from the provider's own response body, never echoed from the request |
| G09 token usage captured | **PASS** | prompt + output counts on every 200 |
| G10 latency measured | **PASS** | p50 7 510 ms |
| G11 actual/best-computable cost recorded | **PASS** | **$0.00 actual** |
| G12 no fabricated citation/provenance accepted | **PASS** | 0 citation-shaped strings in any accepted advisory block |
| G13 malformed output fails closed *if encountered* | **PASS (vacuous)** | **not encountered live** — proved deterministically in `test:expert-provider-failure` |
| G14 protected customer path untouched | **PASS** | no controller, service or module imports the Expert module or its adapter |

**G06 is the one worth pausing on.** A real model, given a genuinely underdetermined observation,
returned an empty hazard list and a populated question list — twice — and that question survived the
adapter, the boundary and the merge. The case the entire carrier architecture was built for now has
live evidence behind it, not only a fixture.

**G13 passed vacuously and is labelled as such.** No malformed output occurred in six calls. The
gate is conditional and its condition did not arise; the behaviour remains proved deterministically.

## 5. The finding that decides the verdict — and it is OUR defect, not the model's

Five of six responses returned empty typed collections. The counts alone would suggest a weak model.
**One diagnostic call proved that reading wrong**, and the distinction changes the remediation
completely.

Given the electrical-cord-in-standing-water observation, the model returned `NOTHING_TO_ADD` with
empty collections — and an `expertExplanation` containing:

> `howConditionsInteract`: *"Worker reaching into the pump housing while electrical equipment is
> energized in wet conditions increases risk of electrocution"*
>
> `whatIsMissing`: *no information about whether the worker was properly de-energized* · *whether
> lockout/tagout procedures were followed* · *whether the worker had proper PPE for wet conditions* ·
> *whether the sump pump was properly isolated from power*
>
> `whatMatters`: *"The sump pump housing is a confined space with potential for entrapment or asphyxiation"*

**The reasoning was there. It landed in the wrong collections.** Four decision-critical missing facts
went into `expertExplanation.whatIsMissing` and `uncertainty.statements` instead of
`decisionCriticalClarifications`. A genuine cross-hazard interaction went into
`howConditionsInteract` instead of `crossHazardInsights`. A plausible additional hazard went into
`whatMatters` instead of `expertHazardCandidates`.

This is a **prompt/schema design defect**: the free-text explanation fields are easier sinks than the
typed collections, and they are starving them. It is the same class of failure the L3 programme kept
hitting — the reasoning exists and the representation loses it — which is exactly why the diagnostic
call was worth making instead of recording "the model added nothing."

**Consequence, and it is decisive:** running the seventeen-measure evaluation now would score
`M09_CLARIFICATION_QUALITY` and `M11_CROSS_HAZARD_REASONING` near zero and **attribute our prompt
defect to the provider**, burning a reserved single-use cohort to measure our own bug.

## 6. The second, independent reason — the hosted provider was never reached

Every gate above was measured against a local stand-in. **No hosted provider's transport was
measured at all**, because no credential exists. If the evaluation is intended for a hosted model —
and a local 30B is not a customer-facing Expert layer — then its transport readiness is **unmeasured**,
and a PASS terminal here would tee up spend on evidence from a different provider entirely.

## 7. Verdict

`EXPERT_HAZLENZ_PROVIDER_TRANSPORT_PROBE_INCONCLUSIVE — NO_EVALUATION_SPEND_AUTHORIZED`

**Not FAILED**: nothing failed. The adapter, the boundary, the merge and all fourteen gates hold.
**Not PASSED**: a PASS carries `BOUNDED_PROVIDER_EVALUATION_AUTHORIZATION_REQUIRED`, and asking for
evaluation authorization would be asking the owner to fund a measurement that a known prompt defect
would corrupt, on a provider that is not the candidate.

A transport pass does not mean the provider is validated, the reasoning is validated, a production
provider is selected, or customer activation is authorized. None of those changed.

## 8. Protected regression (Phase 8) — executed

| suite | result |
|---|---|
| `test:expert-contract-foundation` | **56 / 0** |
| `test:expert-authority-merge` | **51 / 0** |
| `test:expert-provider-failure` | **131 / 0** |
| `test:expert-nocall-harness` | **141 / 0** — core still 10 files, **0** network primitives, **0** vendor names |
| `test:l32i-clarification-carrier` | **61 / 0** — Level-3 quarantine intact |
| `test:l32j-carrier-activation` | **37 / 0** — Level-3 quarantine intact |
| `test:kg4a-cutover-contract` · `test:kg4a-default-off` | exit 0 · exit 0 |
| backend `tsc --noEmit` | **exit 0** |

A full production regression was not required and was not run: the adapter is isolated from every
production-authority module, proved below rather than asserted.

**Confinement, by dependency inspection.** `grep -rl expert-hazlenz` over `backend/src`,
`backend/scripts` and `frontend-next` returns exactly eight files: the adapter, one core file, and
six scripts. **No controller, service or module references it** — the customer path cannot reach the
Expert layer. The only tracked production file modified across both Expert operations remains
`backend/package.json` (script registrations).

## 9. Residual debt

Carried forward unchanged: `test:kg5b-operator-cli` 64/65 · unresolved-jurisdiction ranking ·
`directObjectStatus: NOT_VERIFIED_LOCAL_TEST_PROVIDER` · `LIVE_PAYMENT_PROOF = FALSE`.

Closed by this operation: the Expert contract **now has** a prompt and a structured-output schema
(§99.8 item 5).

New:

1. **`EXPERT_PROMPT_COLLECTION_ROUTING_DEFECT`** — free-text explanation fields absorb content that
   belongs in the typed collections. Measured on 6 of 6 calls, root cause established from one
   diagnostic call. **The correct next work item, and it is deterministic and free to iterate on.**
2. **Hosted-provider transport is unmeasured.** Re-running `probe:expert-transport` against a hosted
   provider needs a credential the owner would have to provision, plus its own spend decision.
3. **G13 passed vacuously.** Live malformed-output behaviour remains unobserved.

## 10. Exact next operation

**Repair the collection-routing defect and re-run this probe locally at `$0.00`.** The probe now
exists, the gates are written, and the loop costs nothing — so the prompt can be iterated until the
typed collections carry what the model already demonstrably reasons, *before* any hosted credential
is provisioned or any spend is authorized. Only then is a hosted transport probe worth its
credential, and only after that is the seventeen-measure evaluation worth a reserved cohort.

Nothing was committed, pushed, tagged or deployed. `autoDeploy=yes` on `main` means preserving this
work in git remains a separate decision.
