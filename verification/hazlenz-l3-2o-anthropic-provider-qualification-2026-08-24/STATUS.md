# L3-2o — ANTHROPIC PROVIDER QUALIFICATION FOR FINAL HazLenz ACCEPTANCE

> ## `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — ANTHROPIC_FAILS_EXISTING_REQUIREMENTS`
> ## `P-05 / P-06 SATISFIED — HOSTED DATA HANDLING IS NOT THE BLOCKER`
> ## `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. **QUALIFICATION ONLY.** Zero production files, prompt bytes,
schema bytes, binder semantics, scorers or harnesses modified. Nothing committed, pushed or deployed;
no stash operation; **no sealed corpus opened**; L3-3 not begun; `L3-2l` not reopened. All
measurement used **already-open diagnostic material** — the same 24-scenario shipped cohort `D-62`
and `L3-2n` were measured on. §46.6 route 2 named this run and estimated 51 calls; it took **exactly
51**.

---

## 1 — What was measured, and on what instrument

The **existing locked machinery**, byte-unmodified: `activate-l32j-shipped-corpus.ts`
(`ONLY=V_PRE_ACTIVATION`) for the 24-scenario shipped cohort, and
`diagnose-l32k-shipped-residual.ts` (`D_WC09_LADDER`, `D_CS05_LADDER_B`) for the two `D-63`/`D-64`
residuals — the only instrument that runs `bindEvidenceSemantically` (§43.1). Both harness digests
equal their L3-2n recorded values.

Transport is a **new** shim, `adapter/anthropic-ollama-shim.js` @ `76d3e039…`, structurally mirroring
the L3-2h shim `0ba265bb…` (which is unchanged and was not used here). It speaks the Ollama wire
protocol the harness already emits, so the harness ran byte-unmodified against a **third** provider.

**§38.3 process isolation held throughout:** one variant per process, the shim restarted between
every run, and the noise-floor control in its own process.

Instrument identity verified on every run: schema `a522cf5a…`, shipped prompt `b8cc50fc…` at `v6`
(`v6PromptIsByteIdentical: true`), locked ablation harness unchanged, cohort **24 parsed / 24 in the
frozen artifact / 0 disagreements** — **the same digests the `D-62` and `L3-2n` baselines carry**, so
`D-60` and `D-61` are respected and the comparison is like-for-like.

---

## 2 — The result `MEASURED`

`*` = recorded baseline, re-read from its frozen artifact, **not re-run by this phase**.

| model | MODEL tier | VALIDATED tier | false ACTIVE | clar cand · scen | precision | validator rejections |
|---|---|---|---|---|---|---|
| **`claude-sonnet-5` run A** | **13/13** | **13/13** | 0/11 | 5/5 · 5/5 | **5/6** | **1** |
| **`claude-sonnet-5` run B** | **13/13** | **13/13** | 0/11 | 5/5 · 5/5 | **5/6** | **2** |
| `gemini-3.7-flash` A `*` | 13/13 | 7/13 | 0/11 | 5/5 · 5/5 | 5/5 | 7 |
| `gemini-3.6-flash` A `*` | 13/13 | 10/13 | 0/11 | 5/5 · 5/5 | 5/5 | 4 |
| `gemini-3.1-pro-preview` `*` | 13/13 | 13/13 | 0/11 | 5/5 · 5/5 | 5/5 | 1 |
| `qwen3-coder:30b` `*` | 12/13 | 11/13 | 0/11 | 5/5 · 5/5 | 5/5 | 1 |

> **The two tiers are never reported as one number (`D-58`).** MODEL tier is `modelAssertsActive`;
> VALIDATED tier is `validatedAssertsActive`, computed identically for every row by the L3-2n scorer,
> reused byte-identically.

### 2.1 Anthropic produces the best reasoning result on record `NEW_EVIDENCE`

**`claude-sonnet-5` is the only STABLE, CALLABLE model to reach 13/13 at the validated tier — and it
did it twice, in two isolated processes.** It ties `gemini-3.1-pro-preview`, which `D-67` disqualified
for being a preview, and it beats both stable Flash models by 3 to 6 high-consequence findings.

It also clears the two requirements that disqualified the Gemini candidates:

* **`P-07`** — *"Every Claude model ID is a pinned snapshot … a dateless format that is also a pinned
  snapshot, **not an evergreen pointer**."* Lifecycle **Active**, retirement *"not sooner than June
  30, 2027"*, ≥60 days' notice. This is categorically stronger than *"stable models **usually** don't
  change"*, and it is the exact requirement `gemini-3.1-pro-preview` failed.
* **`P-12`** — `GET /v1/models/claude-sonnet-5` **200** and `POST /v1/messages` **200**. Catalogue
  presence and callability agree, which for `gemini-2.5-pro` they did not (§46.2).

### 2.2 And it fails `P-02` anyway `MEASURED`

| | run A | run B |
|---|---|---|
| schema-contract validity | **23/24 = 95.8%** | **22/24 = 91.7%** |
| rejections | `F-COR-01` | `F-NC-01`, `F-COR-01` |
| code | `UNGROUNDED_CORRECTIVE_ACTION` | `UNGROUNDED_CORRECTIVE_ACTION` |

**`F-COR-01` rejects in BOTH isolated processes.** `P-02` allows one retry; a rejection that
reproduces deterministically across separate processes cannot be assumed to be rescued by it — that
is measured, not argued, and it is exactly the test §46.3 applied to the Flash models.

> **This verdict does not depend on how `P-02` is read.** On the strict numeric reading, 95.8% < 99%.
> On L3-2n's applied reading — a non-reproducing rejection is rescued by the permitted retry —
> `F-NC-01` would be rescued but `F-COR-01` would not. **Both readings give FAIL.** The ≥99% bar was
> not moved, and nothing in HazLenz was changed to make Anthropic pass.

**The mechanism is the one §46.3 already root-caused and must not be re-derived.**
`deterministic-safety-validator.ts` requires `correctiveActionIntent.groundedInEvidence` to reference
spans among that candidate's **own** evidence; `L3-INV-02` applied to corrective action; §29.6
specifies rejection on contract violation. Under §22 and §24 this is **provider non-conformance with
a correct, pre-existing contract — not a HazLenz defect, and not a reason to weaken the validator.**

**One difference from the Flash models is worth recording.** Both of Anthropic's rejections landed on
`DECIDED_NON_ACTIVE` rows, so **no high-consequence finding was lost** — the validated tier stayed
13/13. On `gemini-3.7-flash` the same code cost 5–6 high-consequence findings. Same rule, same code,
materially different consequence.

### 2.3 `P-08` fails independently, and structurally `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `ON CLAUDE 4.7 AND LATER THERE IS NO DETERMINISM CONTROL AT ALL`

`temperature`, `top_p` and `top_k` are deprecated and *"Return a 400 error when set to a non-default
value"*; there is **no `seed` parameter**. The harness's `temperature: 0` and `seed: 20260822` are
therefore **not transmissible** — not dropped by choice, but inexpressible.

Measured consequence: **6 of 24 rows differ across two isolated processes**
(`F-CL-01`, `F-CL-03`, `B08`, `H-AM-05`, `H-NG-02`, `F-NC-01`) — against 0/24–2/24 for `D-62`, 2/24
for 3.7-flash and 3/24 for 3.6-flash. **The worst reproducibility of any provider measured**, and
`P-08` exists precisely because *"evaluation must be re-runnable"*.

Note where the instability lands: `F-CL-01`, `F-CL-03` and `B08` are the same
clarification/uncertainty cohort §38.4 identified as sitting near a decision boundary. That
corroboration is now `n = 3` providers.

### 2.4 A new discriminating axis: clarification precision `NEW_EVIDENCE`

**`B08` raises a clarification it should not, on both runs.** Every model in `D-62` and `L3-2n` tied
at 5/5 precision; Anthropic is the first at **5/6 = 83%**, reproducibly. `B08` is a
`REGRESSION_ACTIVE` row: the hazard is still correctly ACTIVE and delivered, so nothing is lost at
the safety tier — but §29.5's `L3-INV-06` makes clarification a decision-boundary contract, and an
unnecessary question is a real cost to an inspector. **The axis `D-62` recorded as non-discriminating
now discriminates.**

### 2.5 `F-WC-09` and `C-CS-05` are both CORRECT `NEW_EVIDENCE`

Through the **full** shipped path including `bindEvidenceSemantically`:

| scenario | `claude-sonnet-5` | `qwen` `*` |
|---|---|---|
| **`F-WC-09`** | `ACTIVE` → binder keeps → **delivered** | `CONTROLLED` → binder deletes → no hazard at all |
| **`F-WC-03`** | `ACTIVE` → delivered | `ACTIVE` → delivered |
| **`C-CS-05`** | `HYPOTHETICAL`, no question ✓ | ✓ |

`control-adequacy` recorded `CONTROL_ABSENT` on *"strapped down"* for `F-WC-09`. **`D-63`'s residual
is confirmed once more to be a `qwen` property**, now on a third provider; `D-64`'s `C-CS-05` is
correct on shipped variant B, as `D-64` predicted.

### 2.6 Transport fidelity — the deviations were measured AND proved benign

Six deviations were forced, all recorded in the shim header. Three are schema strips, each
established by submitting the construct to the live API rather than by reading prose:

| | deviation | why | independently enforced by |
|---|---|---|---|
| D1 | `minItems: 2` stripped (1 site) | 400 — only 0/1 supported | validator → `INVALID_CLARIFICATION_DEPENDENCY` |
| D2 | `maxItems: 0` stripped (1 site) | 400 — unsupported | validator → `UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE` |
| D3 | empty `enum: []` stripped (1 site) | 400 — must be non-empty | validator → `INVENTED_REGULATORY_CANDIDATE` (`L3-INV-01`) |
| D4 | `temperature: 0` not forwarded | deprecated, 400 on non-default | — (this is the `P-08` failure) |
| D5 | `seed: 20260822` dropped | no equivalent exists | — (same) |
| D6 | `num_ctx: 8192` dropped | no equivalent; context is 1M | — (truncation impossible in that direction) |

> **The strips were proved harmless, not assumed harmless.** Across all **51 rows**, the only
> validator code observed at all is `UNGROUNDED_CORRECTIVE_ACTION` (×3). Occurrences of every code
> that D1/D2/D3 could have caused — `INVENTED_REGULATORY_CANDIDATE`,
> `UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE`, `REGULATORY_TEXT_NOT_PERMITTED`,
> `INVALID_CLARIFICATION_DEPENDENCY`, `SCHEMA_INVALID` — is **zero**. The `P-02` failure is therefore
> attributable to the provider, not to the shim.

**`minLength` is accepted at the wire level**, so only `minItems` needed stripping — the portability
cost is *smaller* than `PROVIDER_SELECTION.md` predicted on 2026-08-22, and `type: ["object","null"]`
unions need no `anyOf` rewrite. **The validator was not weakened to accommodate Anthropic.**

### 2.7 Transport, cost and regression

**51 requests, 51 × HTTP 200, 0 non-200, 0 truncation** (`stop_reason: end_turn` throughout), 0
harness errors, 0 rate-limit errors. Tokens: prompt **307,401**, output **81,325**. **Total
qualification cost $1.43** at the documented $2/$10 per MTok — **$0.028 per analysis**, about 7×
Gemini's $0.004 and still absolutely small. Latency mean **17.4 s**, max **79.6 s**, against §31.7's
proposed (explicitly non-authoritative) p95 ≤ 12 s.

> **Cost and latency were measured at PROVIDER DEFAULTS and nothing was tuned.** `thinking` and
> `output_config.effort` were both omitted, which on `claude-sonnet-5` means adaptive thinking at the
> documented default effort `high`. Lower effort levels are available and **untested**; they would
> reduce cost and latency and might move `P-02` or `P-08` in either direction. Tuning them to obtain
> a passing result was not attempted and would not have been legitimate.

**L3 offline: 814 assertions over 10 suites, 0 failed** — identical suite for suite to §43.7, §44.6
and §46.5 (49 + 189 + 105 + 86 + 71 + 82 + 77 + 57 + 61 + 37). KG contracts unchanged:
`kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51, `kg4b-shadow` 123/123,
`kg3f-56-14132-predicate` 16/16, `evidence-foundation` clean. Backend `tsc --noEmit` exits 0.

---

## 3 — Terminal state

> ### `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — ANTHROPIC_FAILS_EXISTING_REQUIREMENTS`

Not `DATA_HANDLING_REQUIREMENTS_NOT_ESTABLISHED`: `P-05` and `P-06` **are** established, and less
conditionally than for Google. `P-05` rests on the Commercial Terms — *"Anthropic may not train
models on Customer Content from Services"* — which is **not tier-conditional**. `P-06` is a stated
30 days, with **ZDR available on request**, the Messages API explicitly ZDR-eligible, and
`claude-sonnet-5` **not** among the models that require 30-day retention.

Not `CREDENTIAL_OR_AVAILABILITY`: the credential is valid and the pre-authorized model is callable.

**The blocker is `P-02`, with `P-08` failing independently:**

| | |
|---|---|
| `P-02` ≥99% schema-contract validity after ≤1 retry | **95.8% / 91.7%**, and the common rejection **reproduces across isolated processes** |
| `P-08` deterministic-enough reproduction | **6/24 rows differ**; `temperature` deprecated and no `seed` — **no determinism control exists** |

**Everything else passes, including the two requirements that disqualified Gemini.** Anthropic is the
closest any hosted provider has come, and it is still not qualified.
