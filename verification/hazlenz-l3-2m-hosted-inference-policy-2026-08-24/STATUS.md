# L3-2m — HOSTED-INFERENCE POLICY + FINAL ACCEPTANCE READINESS DECISION

> ## `L3_FINAL_ACCEPTANCE_BLOCKED — STABLE_PROVIDER_MODEL_IDENTITY_REQUIRED`
> ## `HOSTED_INFERENCE_AUTHORIZED_IN_PRINCIPLE — NO PROVIDER OR MODEL SELECTED`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. **POLICY + READINESS DECISION ONLY.** Zero production files,
zero prompt bytes, zero schema bytes, zero binder semantics, zero scorers and zero harnesses
modified. **Zero inference calls.** One metadata request. No sealed corpus opened, no provider
selected, L3-3 not begun, `L3-2l` not reopened, `R1_MISSING_FIRST` not promoted.

---

## 1 — The programme decision, recorded

**Safety InSite authorizes the use of a hosted AI inference provider as an internal HazLenz reasoning
component**, subject to privacy, security, data-handling, contractual and production controls.

This settles the question §42.10, §43.8 and §44.7 each handed back as *"the unadjudicated §31.2 / §10
privacy boundary"*. **That boundary is now adjudicated in principle: hosted egress of redacted
observation text is PERMITTED, subject to controls.** It is no longer a blocker in itself.

What the authorization explicitly does **not** do:

* it does **not** select Gemini, or any provider, as the production provider;
* it does **not** make the hosted model customer-authoritative — HazLenz remains the customer-facing
  system and the model remains an internal reasoning dependency;
* it does **not** relax `L3-INV-01`…`L3-INV-12`, the deterministic validator, the semantic binder,
  evidence binding, regulatory governance or any customer-facing safety control;
* it does **not** authorize the single-use sealed acceptance run, which §29.8 keeps as a separate
  explicit decision.

> **`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`** — unchanged since §31.1.

---

## 2 — Why the acceptance run is nevertheless BLOCKED `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

The privacy boundary was one of three prerequisites, and clearing it exposed the other two. This
phase measured the provider catalogue directly rather than asserting it from memory, which
`PROVIDER_REQUIREMENTS.md` requires.

### 2.1 The measured model is a PREVIEW, and no stable replacement exists at its tier

`GET /v1beta/models` — one request, credential header only, **zero content** — returned **50 models,
37 supporting `generateContent`**. Recorded in full at `provider/GEMINI_MODEL_CATALOGUE.json`.

> #### `EXACTLY THREE MODELS IN THE WHOLE CATALOGUE ASSERT STABILITY IN THEIR OWN DESCRIPTION, AND ALL THREE ARE THE 2.5 GENERATION`

| model | version | description |
|---|---|---|
| `gemini-2.5-pro` | `2.5` | **"Stable release (June 17th, 2025) of Gemini 2.5 Pro"** |
| `gemini-2.5-flash` | `001` | "Stable version … released in June of 2025" |
| `gemini-2.5-flash-lite` | `001` | "Stable version … released in July of 2025" |

**There is no stable, non-preview Gemini Pro at the 3.x tier.** Every 3.x Pro text model in the
catalogue is a preview:

| model | version |
|---|---|
| `gemini-3.1-pro-preview` — **the measured model** | `3.1-pro-preview-01-2026` |
| `gemini-3.1-pro-preview-customtools` | `3.1-pro-preview-01-2026` |

The stable 3.x models are **Flash tier only** — `gemini-3.5-flash` (`3.5-flash-05-2026`),
`gemini-3.6-flash` (`3.6-flash-07-2026`), `gemini-3.7-flash` (`3.7-flash-08-2026`),
`gemini-3.1-flash-lite` — and **none of them asserts stability in its description either**; they
carry only a dated version string.

The rolling aliases `gemini-pro-latest`, `gemini-flash-latest`, `gemini-flash-lite-latest` are the
**worst** option for `P-07`: they are silently updated by definition.

### 2.2 The dilemma this creates, and it has no third branch

`P-07` requires *"an addressable, **non-silently-updated** model id"*, because *"a silent model change
would invalidate a passed gate"*. §29.8 spends the sealed corpus **once**.

| branch | consequence |
|---|---|
| run the sealed corpus on **`gemini-3.1-pro-preview`** — the only model with measured HazLenz evidence (`D-62`) | fails `P-07`. A preview carries no stability guarantee, its label is not a content digest (§42.8 item 5, `MUST_REVERIFY` **re-armed**), and it is dated **01-2026** against a catalogue that has since reached 3.7. **The acceptance result would not be defensible or reproducible**, and the corpus is spent |
| run the sealed corpus on a **stable** model (`gemini-2.5-pro`, or a 3.x Flash) | **zero measured HazLenz evidence exists for any of them.** `D-62`'s entire result — the 5/5 clarification axes, the two-scenario delta, `F-WC-09` surviving to `ACTIVE` — is a `gemini-3.1-pro-preview` fact. Spending a single-use asset on an unmeasured model is a blind run |

**Neither branch can be authorized on current evidence.** That is the blocker, and it is
independent of the privacy adjudication.

### 2.3 Google has never been scored against `P-01`…`P-14` at all

`PROVIDER_SELECTION.md` scored exactly two candidates with sources and retrieval dates: **Anthropic
Claude** (the documented strongest hosted candidate) and the **local Ollama** model that was selected.
It records `GEMINI_API_KEY` as *unset* at the time. **Google appears nowhere in it.**

Google entered the programme at §39 purely as an *architecture-selection comparator*, because a
credential became available — and `D-55` says so explicitly: *"A hosted **preview** model measured on
24 diagnostic scenarios is architecture-selection evidence, **never a production recommendation**."*

> **Step 1 of the selection procedure has never been executed for Google, and step 2 — run the
> DEVELOPMENT cohort — has never been executed for ANY hosted candidate.** §31.1 recorded that step 2
> *could not* run because no hosted credential was resolvable. A credential is now resolvable. The
> step is outstanding, already specified, and is **not** a new diagnostic phase.

### 2.4 A ceiling that no action removes, stated plainly

`qwen3-coder:30b` is pinned by **content digest** `06c1097efce0…`. **No Gemini model can be.** Google
publishes no weight hash; the strongest recordable identity is `name` + `version` + retrieval date —
for example `models/gemini-2.5-pro` @ `2.5`, retrieved 2026-08-24.

That is materially weaker than a digest and it is **permanent**. A hosted acceptance result will
always carry the residual risk that the weights behind a stable label moved. The user must either
accept that risk explicitly and record it, or execute the acceptance run locally where the digest
guarantee holds.

---

## 3 — Privacy and data handling — what the authorization still requires

### 3.1 What actually leaves the machine

`§31.2`'s exclusion is **structural at the field level** — `ReasoningInputRequest` has no field for a
personal name, site identity, account id, credential, billing datum or governed review state — and a
second, **pattern-based** redactor runs before the text becomes canonical, so evidence offsets index
the redacted string. Its seven rules, read from `reasoning-input-builder.ts`:

`email` · `phone` · `ssn` · `street_address` · `mine_id` · `employee_id` · `url`

> **A pattern redactor cannot catch a personal name, an informal site reference, or narrative
> identifying detail.** "Bob Martinez was working under the press without LOTO" transmits verbatim.
> That is not a defect — the module documents itself as a second layer for *identifiers an inspector
> typed into the text* — but it is exactly what changes meaning when the destination stops being
> `127.0.0.1`. **What a hosted provider receives is inspector-authored narrative prose.**

### 3.2 The controls the authorization requires, and their current state

| # | control | state |
|---|---|---|
| `P-05` | **zero training on submitted data, contractually** | **UNEVIDENCED for Google.** No artifact in this repository records any data-handling term for this credential. The endpoint in use is the developer API surface (`generativelanguage.googleapis.com` with a bare `GEMINI_API_KEY`), not an enterprise agreement |
| `P-06` | **configurable/short retention, stated window** | **UNEVIDENCED for Google**, same reason |
| — | name-level redaction or explicit acceptance of narrative PII egress | **NOT IMPLEMENTED and not decided** |
| — | production credential management, rotation, least privilege | **NOT IMPLEMENTED** |
| — | egress telemetry and an error taxonomy for a hosted dependency (`P-11`) | **NOT IMPLEMENTED** |

`P-05` is not merely a production concern: **if the provider trains on submitted data, transmitting
the single-use sealed corpus contaminates it permanently**, and every future evaluation of that
provider against it is tainted. That makes `P-05` binding for the acceptance run itself.

### 3.3 There is no production hosted path, at all

Verified from source, not assumed:

* `reasoning-l3` contains exactly three providers — `hazlenz-reasoning-provider.ts` (the interface),
  `ollama-reasoning-provider.ts`, `unavailable-reasoning-provider.ts`. **No hosted adapter.**
* the only environment variables it declares are `L3_OLLAMA_ENDPOINT`, `L3_OLLAMA_MODEL`,
  `L3_OLLAMA_TIMEOUT_MS`;
* `grep` over all of `backend/src` for `GEMINI` · `generativelanguage` · `googleapis` · `anthropic` ·
  `openai` returns **nothing**;
* `backend/package.json` carries **zero** hosted-provider SDK dependencies.

Every Gemini measurement in §39–§43 was produced through
`verification/hazlenz-l3-2h-cross-provider-final-2026-08-23/adapter/gemini-ollama-shim.js` — a
**verification-only** Ollama-protocol translator living entirely outside `backend/src`, which is why
§42.9 could state that *no hosted credential became required for customer execution, and none can*.

> **HazLenz cannot use hosted inference in production today, because the code to do so does not
> exist.** Authorizing the policy does not create the adapter.

---

## 4 — Terminal state and the minimum action to clear it

> ### `L3_FINAL_ACCEPTANCE_BLOCKED — STABLE_PROVIDER_MODEL_IDENTITY_REQUIRED`

Concurrent unsatisfied prerequisites, recorded so none is hidden: **data handling** (`P-05`/`P-06`
unevidenced for Google, §3.2) and **no production hosted adapter** (§3.3). Either would independently
block production; the model-identity blocker independently blocks the acceptance run.

### The minimum concrete action — already specified, not newly invented

`PROVIDER_REQUIREMENTS.md`'s own selection procedure, whose steps 1 and 2 have never been executed
for a hosted candidate:

1. **Score Google against `P-01`…`P-14` from current official documentation**, recording the source
   URL and retrieval date for every claim — `P-05` and `P-06` first, since they gate everything else.
   Do the same for Anthropic Claude, which `PROVIDER_SELECTION.md` already scored and which remains
   the documented strongest hosted candidate.
2. **Choose the stable model to qualify** and run **step 2** — the DEVELOPMENT cohort, on
   **already-open material, never the sealed corpus** — recording `name` + `version` + retrieval date.
   The candidates are `gemini-2.5-pro` (the only stable Pro) and the newest dated stable 3.x,
   `gemini-3.7-flash` @ `3.7-flash-08-2026`.
3. **Record the decision and the pinned model id in the blueprint**, together with an explicit
   acceptance of the §2.4 digest ceiling.

**This is provider qualification, not a HazLenz diagnostic phase.** It measures the provider; it
changes no reasoning behaviour, no prompt, no binder and no customer authority. **No further L3
engineering is justified** — `L3-2l` closed the last open engineering question, and nothing found
here is an architecture defect.

> **Do not open the sealed corpus to qualify a provider.** §29.8 spends it once, and `D-55`'s rule
> that diagnostic-cohort evidence is never a production recommendation applies to the stable model
> exactly as it applied to the preview.

---

## 5 — Preservation, authority and egress

**Preservation.** HEAD `1feda622`, branch `release/insite-rc-2026-08-18`, upstream 0/0, 23 tag
objects, 4 stash entries with **no stash operation**, all 19 `reasoning-l3` modules byte-identical,
shipped prompt `b8cc50fc` at `v6`, run schema `a522cf5a`. **Sealed corpus hash-verified identical and
NOT OPENED**: `49aa40fd…`, `a95e5480…`, `6f6897f1…`.

**Customer authority.** Unchanged by construction — no production file was modified, and §3.3 shows
no hosted path exists to change it.

**Egress.** One destination, `generativelanguage.googleapis.com`. **1 HTTP request**:
`GET /v1beta/models`, credential in the `x-goog-api-key` header and nothing else. **0 inference
calls. 0 local calls.** No scenario text, no evidence, no corpus content, no customer or production
data, no sealed-corpus bytes. The credential was read only into the request header — never printed,
logged, hashed or persisted — and **appears in zero artifacts**, verified by scanning the written
catalogue for the literal value.

**`GEMINI_MODEL` was NOT substituted.** The operator shell exports
`GEMINI_MODEL=gemini-3.1-flash-lite-preview`, which is not an authorized model. This phase read no
model from the environment and ran no inference; every model identity here comes from the provider's
own catalogue response.
