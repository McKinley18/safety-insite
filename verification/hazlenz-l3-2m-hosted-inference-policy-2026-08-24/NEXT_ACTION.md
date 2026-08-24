# L3-2m — what is decided, what is blocked, and the exact next action

## Terminal

> ### `HOSTED_INFERENCE_AUTHORIZED_IN_PRINCIPLE — §31.2 / §10 ADJUDICATED`
> ### `L3_FINAL_ACCEPTANCE_BLOCKED — STABLE_PROVIDER_MODEL_IDENTITY_REQUIRED`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Blueprint **§45**. Decisions **`D-66`** (policy) and **`D-67`** (the blocker), both additive.
`D-55` … `D-65` preserved. §29–§44 not rewritten. HEAD `1feda622`. **Nothing implemented, zero
inference calls.**

## Is the sealed acceptance run authorized?

**No.** And the reason has changed: the privacy boundary is cleared, and two prerequisites underneath
it are not.

---

## What L3-2m settled, so it is not re-derived

* **The privacy boundary is adjudicated.** Hosted egress of redacted observation text is permitted in
  principle. Three phases correctly refused to answer this with measurement; it was a product call
  and it has been made. **Do not reopen it as an engineering question.**
* **There is no stable non-preview Gemini Pro at the measured tier.** Exactly three models in the
  50-model catalogue assert stability, all 2.5 generation. Every 3.x Pro text model is a preview.
* **`D-62`'s entire result is a `gemini-3.1-pro-preview` fact.** It does not transfer to any other
  model, stable or otherwise.
* **No Gemini model of any tier is pinnable by content digest.** The strongest hosted identity is
  `name` + `version` + retrieval date. This is permanent and is the §45.4 ceiling.
* **Google was never scored against `P-01`…`P-14`.** `PROVIDER_SELECTION.md` scored only Anthropic
  Claude and the local model.
* **There is no production hosted path at all.** `reasoning-l3` declares only `L3_OLLAMA_*`;
  `backend/src` has zero hosted references; zero hosted SDK dependencies. Every Gemini measurement
  came through the verification-only shim.
* **`P-05` binds the acceptance run, not only production.** A provider that trains on submitted data
  would contaminate the single-use sealed corpus permanently.

### The dilemma, so nobody proposes a third branch

| branch | why it fails |
|---|---|
| sealed run on `gemini-3.1-pro-preview` | fails `P-07`; preview, no stability guarantee, dated 01-2026, no digest. Result not defensible; corpus spent |
| sealed run on a stable model | zero measured HazLenz evidence for any of them. Blind run on a single-use asset |

---

## The exact next action — NOT EXECUTED

**`PROVIDER_REQUIREMENTS.md`'s own selection procedure, steps 1–3, never executed for a hosted
candidate.** This measures the **provider**, not HazLenz — it is not a diagnostic phase and changes no
reasoning behaviour, prompt, binder or customer authority.

1. **Score Google against `P-01`…`P-14`** from current official documentation, recording source URL
   and retrieval date for every claim. **Start with `P-05` (no training on inputs) and `P-06`
   (retention window)** — they gate everything else, and `P-05` gates the corpus itself. Score
   **Anthropic Claude** the same way; it is already the documented strongest hosted candidate.
2. **Qualify the chosen stable model on the DEVELOPMENT cohort** — already-open material, **never the
   sealed corpus** — recording `name` + `version` + retrieval date. Candidates:
   * `gemini-2.5-pro` @ `2.5` — the only stable **Pro**;
   * `gemini-3.7-flash` @ `3.7-flash-08-2026` — the newest dated stable 3.x, Flash tier.
3. **Record the decision and the pinned model id in the blueprint**, with an explicit written
   acceptance of the §45.4 digest ceiling — or a decision to run acceptance locally, where
   `qwen3-coder:30b` @ `06c1097efce0…` gives a digest guarantee no hosted provider can.

### Before production, additionally — none of it started

* build a hosted provider adapter behind the existing `HazLenzReasoningProvider` interface (none
  exists);
* decide name-level redaction, or explicitly accept narrative PII egress;
* production credential management, rotation, least privilege;
* `P-11` egress telemetry and a hosted-dependency error taxonomy.

---

## Is further L3 engineering justified?

**No.** `L3-2l` closed the last open engineering question and nothing found here is an architecture
defect. **Do not create another diagnostic phase.**

> **Do not open the sealed corpus to qualify a provider.** §29.8 spends it once, and `D-55`'s rule
> that diagnostic-cohort evidence is never a production recommendation applies to a stable model
> exactly as it applied to the preview.
