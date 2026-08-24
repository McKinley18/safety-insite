# L3-2n — PROVIDER QUALIFICATION FOR FINAL HazLenz ACCEPTANCE

> ## `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — NO_CURRENT_STABLE_HOSTED_MODEL_MEETS_REQUIREMENTS`
> ## `HOSTED DATA-HANDLING GATES P-05 / P-06 ARE SATISFIABLE — DATA HANDLING IS NOT THE BLOCKER`
> ## `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. **QUALIFICATION ONLY.** Zero production files, prompt bytes,
schema bytes, binder semantics, scorers or harnesses modified. Nothing committed, pushed or deployed;
no stash operation; **no sealed corpus opened**; L3-3 not begun; `L3-2l` not reopened;
`R1_MISSING_FIRST` not promoted. All measurement used **already-open diagnostic material** — the same
24-scenario shipped cohort `D-62` was measured on.

---

## 1 — What was measured, and on what instrument

The **existing locked machinery**, byte-unmodified: `activate-l32j-shipped-corpus.ts`
(`ONLY=V_PRE_ACTIVATION`) for the 24-scenario shipped cohort, and
`diagnose-l32k-shipped-residual.ts` (`D_WC09_LADDER`, `D_CS05_LADDER_B`) for the two `D-63`/`D-64`
residuals — the only instrument that runs `bindEvidenceSemantically` (§43.1). Transport is the
L3-2h shim at sha256 `0ba265bb…`, **byte-identical** to the adapter that produced every §39–§43
Gemini number.

**§38.3 process isolation held throughout:** one variant per process, the shim restarted between
every run, and each model's noise-floor control in its own process.

Instrument identity verified on every run: schema `a522cf5a…`, shipped prompt `b8cc50fc…` at
restored `v6` — **the same digests the `D-62` baseline carries**, so `D-60` and `D-61` are respected
and the comparison is like-for-like.

---

## 2 — The result `MEASURED`

`*` = recorded baseline, re-read from its frozen artifact, **not re-run by this phase**.

| model | MODEL tier | VALIDATED tier | false ACTIVE | clarification cand · scen · precision | validator rejections |
|---|---|---|---|---|---|
| `gemini-3.7-flash` run A | **13/13** | **7/13** | 0/11 | 5/5 · 5/5 · 100% | **7** |
| `gemini-3.7-flash` run B | **13/13** | **8/13** | 0/11 | 5/5 · 5/5 · 100% | **7** |
| `gemini-3.6-flash` run A | **13/13** | 10/13 | 0/11 | 5/5 · 5/5 · 100% | 4 |
| `gemini-3.6-flash` run B | **13/13** | 10/13 | 0/11 | 5/5 · 5/5 · 100% | 5 |
| `gemini-3.1-pro-preview` `*` | 13/13 | **13/13** | 0/11 | 5/5 · 5/5 · 100% | 1 |
| `qwen3-coder:30b` `*` | 12/13 | 11/13 | 0/11 | 5/5 · 5/5 · 100% | 1 |
| `gemini-2.5-pro` | — | — | — | — | **not callable, HTTP 404 ×48** |

> **The two tiers must never be reported as one number (`D-58`).** MODEL tier is
> `modelAssertsActive`; VALIDATED tier is `validatedAssertsActive`, computed here identically for
> every row. The `qwen` figures above are this fourth, consistently-computed metric and are **not**
> §41.2's `HC (model-asserted) 12/13`, which is a different denominator and is not restated.

**Every model ties at ceiling on false ACTIVE (0/11) and on both clarification denominators
(5/5, 5/5, 100% precision).** Those axes do not discriminate, exactly as `D-62` found. The
separation is entirely at the validator.

### 2.1 `gemini-2.5-pro` — the only stable Pro is not callable `DO_NOT_REDISCOVER`

```
POST /v1beta/models/gemini-2.5-pro:generateContent   ->   HTTP 404 NOT_FOUND
"This model models/gemini-2.5-pro is no longer available to new users.
 Please update your code to use models/gemini-3.1-pro-preview ..."
```

All 48 cohort calls failed identically; a `gemini-3.7-flash` control in the same probe returned
**HTTP 200**, so the credential and method are sound. It is still listed by `ListModels` and still
documented as stable.

> **`ListModels` presence is not callability, and a documented "stable" label is not availability.**
> Google's own error directs a new account at a **preview** model as the Pro-tier replacement. This
> is `D-67` in operational form, and it is stronger than the documentation reading that produced it:
> **at the Pro tier there is currently no stable option at all for this account.**

### 2.2 The stable Flash models fail `P-02`, and the mechanism is one code

**All 7 rejections on 3.7-flash and all 4–5 on 3.6-flash are `UNGROUNDED_CORRECTIVE_ACTION`** — a
single, general mechanism. `deterministic-safety-validator.ts` requires a candidate's
`correctiveActionIntent.groundedInEvidence` to reference spans **among that candidate's own
evidence**; the stable Flash models routinely ground a corrective action in a span they did not also
cite as hazard evidence, and the whole proposal is rejected.

| | 3.7-flash | 3.6-flash | 3.1-pro-preview `*` |
|---|---|---|---|
| schema-contract validity | **71%** (17/24) | **83%** (20/24) | 96% (23/24) |
| rejections reproducing across two isolated processes | **6 of 7** | 3 of 4–5 | — |

**`P-02` requires ≥99% valid after ≤1 retry.** Because the failures largely reproduce across separate
processes, the permitted single retry **cannot be assumed to rescue them** — that is measured, not
argued.

> **In every rejected case the model had the hazard RIGHT.** MODEL tier is 13/13 for both stable
> Flash models; the entire validated-tier loss — 5 or 6 high-consequence findings — is the corrective
> action field taking a correct proposal down with it.

### 2.3 The validator is correct and was not touched `ROOT_CAUSE_BEFORE_REMEDIATION`

The rule is `L3-INV-02` (evidence-bound findings) applied to corrective action, and §29.6 specifies
that a contract violation is rejected. **Two other providers satisfy it at 23 of 24**, so the
contract is demonstrably satisfiable. Under §22 and §24 this is **provider non-conformance with a
correct, pre-existing contract** — not a HazLenz defect, and **not a reason to weaken the validator**.

> **Nothing in HazLenz was changed to make a provider pass, and nothing should be.** If a future
> phase ever revisits the corrective-action grounding rule it must do so on its own root cause and
> its own evidence — never to qualify a provider. This phase records the observation and stops.

### 2.4 `F-WC-09` and `C-CS-05` — both stable Flash models get them RIGHT `NEW_EVIDENCE`

Through the **full** shipped path including `bindEvidenceSemantically`:

| scenario | 3.7-flash | 3.6-flash | qwen `*` | 3.1-pro-preview `*` |
|---|---|---|---|---|
| **`F-WC-09`** | `ACTIVE` → binder keeps → **delivered** | `ACTIVE` → **delivered** | `CONTROLLED` → **binder deletes → no hazard at all** | `ACTIVE` → delivered |
| **`F-WC-03`** | `ACTIVE` → delivered | `ACTIVE` → delivered | `ACTIVE` → delivered | `ACTIVE` → delivered |
| **`C-CS-05`** | `HYPOTHETICAL`, no question ✓ | `HYPOTHETICAL`, no question ✓ | `HYPOTHETICAL`, no question ✓ | ✓ |

Both stable Flash models read *"the two-hand control has been strapped down with tape"* as defeating
the control — `3.7-flash`'s corrective action names it explicitly: *"removing tape from the two-hand
control"*. **`D-63`'s residual is a `qwen` property, and it does not reproduce on any Gemini model
tested.** `D-64`'s `C-CS-05` is correct on the shipped variant B for both, as `D-64` predicted.

### 2.5 Reproducibility, transport and cost

Noise floor across two isolated processes: **2 of 24** rows differ on 3.7-flash, **3 of 24** on
3.6-flash — above the 0/24–2/24 band `D-62` recorded for Gemini and worth carrying as a `P-08`
qualification.

Transport over all 153 requests this phase: **102 × HTTP 200**, 51 × 404 (the entire
`gemini-2.5-pro` run), **0 truncation** (`finishReason` `STOP` throughout), **0 harness errors** on
the callable models, 0 rate-limit errors. Tokens over the 102 successful calls: prompt 246,770,
output 45,029, thought 16,455. **Total qualification cost ≈ $0.42** at 3.7-flash paid rates —
roughly **$0.004 per analysis**, which settles `P-14` comfortably.

---

## 3 — Terminal state

> ### `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — NO_CURRENT_STABLE_HOSTED_MODEL_MEETS_REQUIREMENTS`

Not `DATA_HANDLING_REQUIREMENTS_NOT_ESTABLISHED`: `P-05` and `P-06` **are** establishable — paid tier
gives *"Google doesn't use your prompts…or responses to improve our products"*, abuse-monitoring
retention is a stated **55 days**, and **ZDR is available on approved request** for paid projects,
clearing all user content before logging. HazLenz uses no ZDR-incompatible feature.

The blocker is the pair `P-07` + `P-02`, and it has no current resolution:

| | |
|---|---|
| the only model that clears every requirement | `gemini-3.1-pro-preview` — **fails `P-07`**, and §29.8 spends the corpus once |
| the only stable **Pro** | `gemini-2.5-pro` — **not callable**, Google redirects to the preview |
| the stable **Flash** models | `gemini-3.7-flash` 71% and `gemini-3.6-flash` 83% schema validity — **fail `P-02`**'s ≥99% bar, largely deterministically |

---

## 4 — Minimum concrete blocker, and the next action

> **Minimum blocker: no currently callable STABLE Gemini model reaches `P-02`'s ≥99% schema-contract
> validity, and the Pro tier has no callable stable model at all.**

The narrowest things that would clear it, in order of cost — **none is a HazLenz engineering phase**:

1. **Wait for, or obtain access to, a stable Gemini 3.x Pro.** `gemini-3.1-pro-preview` already meets
   every other requirement at 23/24; its GA release would qualify it immediately. Re-probe
   `ListModels` **and callability** before relying on any label.
2. **Qualify a second vendor.** `PROVIDER_SELECTION.md` already documents **Anthropic Claude** as the
   strongest hosted candidate — constrained-decoding structured output, an addressable pinned
   version, and zero-data-retention agreements available — and it has **never been executed** because
   no credential was resolvable (§31.1). One credential makes it a 51-call run on this same
   already-open cohort.
3. **Run acceptance locally.** `qwen3-coder:30b` @ `06c1097efce0…` is the only candidate pinnable by
   **content digest**, satisfies `P-05`/`P-06` absolutely at `127.0.0.1`, and scores 11/13 validated
   with the clarification axes at ceiling — carrying `F-WC-09`'s deletion as `D-63`'s known,
   quantified, one-scenario cost.

**Before any hosted production use, additionally:** confirm the project is **billing-enabled** (the
`P-05` gate is tier-conditional), request **ZDR**, build a hosted adapter behind the existing
`HazLenzReasoningProvider` interface (**none exists**, §45.6), decide name-level redaction or
explicitly accept narrative PII egress (§45.5), and implement `P-11` egress telemetry.

**No further HazLenz engineering is justified.** `L3-2l` closed the last open engineering question;
`UNGROUNDED_CORRECTIVE_ACTION` is provider non-conformance against a correct contract, and the two
`D-63`/`D-64` residuals do not reproduce on either stable Flash model.

---

## 5 — Preservation, authority and egress

**Preservation.** HEAD `1feda622`, upstream 0/0, 23 tag objects, 4 stash entries with **no stash
operation**, all 19 `reasoning-l3` modules byte-identical, shipped prompt `b8cc50fc` at `v6`, run
schema `a522cf5a`. **Sealed corpus hash-verified identical and NOT OPENED**: `49aa40fd…`,
`a95e5480…`, `6f6897f1…`.

**Customer authority.** Unchanged by construction — no production file modified, and no hosted
adapter exists in `backend/src` to change it.

**Egress.** One destination, `generativelanguage.googleapis.com`. **153 harness requests** (102×200,
51×404) plus **1 `ListModels` metadata call** and **3 isolation probes** carrying the string
`"Reply ok"` only. Transmitted content: the **24 already-open diagnostic scenarios** and the
`F-WC-09` / `F-WC-03` / `C-CS-05` texts — all previously transmitted under §42/§43. **No customer or
production data, no sealed-corpus bytes.** The credential rode only in the `x-goog-api-key` header,
was never printed, logged, hashed or persisted, and appears in **zero** artifacts.

> **`GEMINI_MODEL` was NOT substituted.** The operator shell exports
> `gemini-3.1-flash-lite-preview`, which is not an authorized model. Every run set `GEMINI_MODEL_ID`
> explicitly, and each artifact records the model it actually used.
