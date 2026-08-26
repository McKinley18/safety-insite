# L3-2r — L3 FINAL ACCEPTANCE PRE-AUTHORIZATION CLOSURE

> ## `READY_TO_AUTHORIZE_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`
> ## `P05_ACCEPTANCE_DATA_USE_SATISFIED` · `ZDR_RECOMMENDED_NOT_ACCEPTANCE_BLOCKING`
> ## `MODEL_IDENTITY_CEILING_ACCEPTED — PINNED_HOSTED_MODEL_ID_IS_SUFFICIENT_FOR_ACCEPTANCE`
> ## `ACCEPTANCE_CREDENTIAL_MUST_BE_PROVIDED_AT_EXECUTION`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **PRE-AUTHORIZATION CLOSURE ONLY.**
**Zero inference of any kind — hosted or local — at $0.00.** Three documentation fetches, no API
requests, no credential read. No prompt, schema, validator, binder, scorer, harness or `B08` byte
changed. **The sealed corpus was NOT opened and its semantic contents were NOT inspected.** L3-3 not
begun; no production provider selected; no adapter built; nothing committed, pushed or deployed; no
stash operation. `FINAL_ACCEPTANCE_PROVIDER_ELIGIBLE — ANTHROPIC — claude-sonnet-5` is **not
re-derived**; `P-02R`/`P-08R`/`P-09R` are **not modified**.

**READY means every prerequisite required BEFORE the corpus is opened is satisfied.** It does **not**
mean the corpus has been opened, that L3-3 has passed, that a production provider is selected, or
that customer authority has changed.

---

## 1 — `P-05` — commercial governance and data use `SATISFIED`

> ### `THE COMMERCIAL TERMS GOVERN API-KEY USE BY THEIR OWN SCOPE CLAUSE, AND BIND ON FIRST ACCESS. NO SEPARATE AGREEMENT EXISTS TO OBTAIN.`

L3-2o recorded `P-05` as PASS with one caveat: *"Precondition, unverifiable from the API: the
credential's organization must be under those terms."* **That caveat is now closed from the terms'
own text**, not from the API:

| question | determination | source |
|---|---|---|
| Is first-party Anthropic API usage governed as **commercial** usage? | **YES.** *"They govern Customer's use of **Anthropic API keys**…"* and *"Services under these Terms are not for consumer use. Our consumer offerings (e.g., Claude.ai) are governed by our Consumer Terms of Service instead."* An API key is on the commercial side **by definition**; the consumer terms govern claude.ai, not `api.anthropic.com` | A1, A3 |
| Does it require an **additional agreement** or a tier? | **NO.** Effective on *"the earlier of the date that Customer first electronically consents … and the date that Customer **first accesses the Services**."* Acceptance is by access; there is no commercial tier to purchase and no signature step | A2 |
| Are prompts/responses used for **training** by default? | **NO, unconditionally.** *"Anthropic may not train models on Customer Content from Services."* Note the modal — *may not*, a prohibition, not an opt-out | A4 |
| Who owns inputs and outputs? | *"Customer (a) retains all rights to its Inputs, and (b) owns its Outputs."* | A5 |

**Contrast with Google, and why it matters.** `D-68` found the equivalent Gemini gate **tier-conditional** — PASS on paid, FAIL on free, where *"human reviewers may read, annotate, and process your API input and output"*. Anthropic's is **not tier-conditional**, so the precondition that blocked authorization is structural rather than a setting someone must remember to have enabled.

> ### `P05_ACCEPTANCE_DATA_USE_SATISFIED`
>
> **This is the finding that unblocks authorization.** `P-05` binds the acceptance run and not only production, because a provider that trained on submitted data would **contaminate the single-use corpus permanently**. That risk is now closed by contract, on the terms' own scope and acceptance clauses.

### 1.1 Retention and the exceptions, stated exactly

* **Default:** *"Conversation content (your prompts and Claude's outputs) is **not retained by default**; the exception is Covered Models, which require 30-day retention."* `claude-sonnet-5` is **not** a Covered Model (only Fable 5 and Mythos 5 are).
* **Commitments:** *"Retained data is never used for model training without your express permission"*; *"purged on the shortest practical time to live."*
* **The one exception that survives every arrangement, including ZDR:** *"Even with ZDR or HIPAA arrangements in place, Anthropic may retain data where required by law or where it has been flagged by Anthropic's automated trust and safety systems. As a result, if a chat or session is flagged, Anthropic may retain inputs and outputs for **up to 2 years**."*

> **This corrects L3-2o assertion 3 on new evidence.** L3-2o recorded a **30-day** default deletion window from the privacy centre. The platform documentation now states content is **not retained by default at all**. The correction is *favourable* and is recorded rather than glossed; §47.1's `P-06` PASS is unaffected in direction.

---

## 2 — ZDR disposition

> ### `ZDR_RECOMMENDED_NOT_ACCEPTANCE_BLOCKING`

| question | answer |
|---|---|
| Does ZDR exist? | Yes — *"Anthropic does not store customer prompts or responses at rest after the API response is returned."* |
| Self-serve? | **No.** *"To request ZDR for your organization, contact the Anthropic sales team."* |
| Scope? | *"ZDR is enabled **per organization**; each new organization requires ZDR to be enabled separately."* |
| Is `/v1/messages` eligible? | **Yes**, explicitly, and `claude-sonnet-5` is not a Covered Model |
| Is HazLenz's feature set eligible? | **Yes.** Structured outputs is `Yes (qualified)` — *"Your prompts and Claude's outputs are not stored. Only the JSON schema is cached, for up to 24 hours since last use."* HazLenz's schema is the frozen proposal schema `a522cf5a…` and **contains no observation content whatsoever**, so the qualification is bounded and empty of risk here. HazLenz uses **none** of the "No" features (Batch, Files, code execution, programmatic tool calling, MCP) |

### 2.1 Does `P-06` actually require ZDR?

**`P-06` reads: *"Configurable/short retention, with a stated window."*** Measured against the current documentation, the **standard commercial arrangement already satisfies it**:

* prompts and outputs are **not retained by default** — a shorter window than any ZDR request could produce for the same data;
* the window is **stated**, and the Covered-Model exception is named and does not apply to `claude-sonnet-5`;
* the residual — flagged content up to 2 years — **is not removed by ZDR**, since it survives *"even with ZDR … in place."*

> **ZDR would not change the acceptance run's data-handling posture in any respect that `P-06` measures.** Declaring it blocking would be **silently creating a new hard requirement**, which this phase was told not to do — and `D-70` already recorded `P-06` as PASS *without* ZDR.

**ZDR remains recommended** as defence in depth for eventual production, where volume, tenancy and duration all differ. **Exact operator action, NOT performed and NOT claimed:** an authorized operator contacts the Anthropic sales team (https://claude.com/contact-sales) and requests ZDR for the specific organization behind the credential; enablement is per organization and does not extend to others.

---

## 3 — Sealed-corpus PII / egress rule `DECIDED`

**The sealed corpus was NOT opened and its semantic contents were NOT inspected.** Everything below comes from §37.10's own characterisation — a section explicitly titled *"IDENTIFIED, CHARACTERISED, **NOT OPENED**"* — and from the source of `reasoning-input-builder.ts`.

### 3.1 The material fact §45.5 did not have `NEW_EVIDENCE`

§45.5 described what a hosted provider receives as *"inspector-authored narrative prose"*. **For the sealed corpus that is not what it is.** §37.10 records `safescope-gauntlet.source.v1.json` as **150 rows derived from real regulator records** — 66 fatality reports, 51 inspection violations, 33 investigation summaries, OSHA 84 / MSHA 66 — and `safescope-field-realism-pack-v2.v1.json` as an independently authored complement.

Two consequences, and they point in opposite directions:

1. **It is not InSite customer data at all.** No InSite customer, site, account, user or inspection is represented. **§10 and §31.2 govern *customer* data, and the sealed run transmits none.** The boundary those sections draw is not engaged.
2. **But it is real, and it is not synthetic.** Published regulator narratives routinely name **employers, facilities and locations**. The pattern redactor does **not** catch a company name, a facility name or a person's name — §45.5 said exactly this, and it is now known to be load-bearing rather than hypothetical.

### 3.2 What the harness does automatically, verified from source

`reasoning-input-builder.ts` is *"the ONLY sanctioned way to construct a `ReasoningInput`"*, and **all three locked harnesses import it** (`activate-l32j-shipped-corpus.ts`, `diagnose-l32k-shipped-residual.ts`, `ablate-l32g-state-separation.ts`). Redaction is therefore **structural and unbypassable**, not a convention:

| layer | what it removes |
|---|---|
| **Structural field exclusion** | `ReasoningInputRequest` has **no parameter** for a personal name, site identity, account id, credential, billing datum, unrelated record, governed review state, release id or standards text. *"Everything the §10 inventory excludes is excluded STRUCTURALLY here"* |
| **Deterministic redactor**, `hazlenz.l3.redaction.v1`, run **before** the text becomes the canonical source | `email` · `phone` · `ssn` · `street_address` · `mine_id` (MSHA/Mine ID `nn-nnnnn`) · `employee_id` · `url` |
| **Provenance** | every row records `redactionVersion` and a per-rule `redactions` count |

Because redaction precedes canonicalisation, **evidence offsets index the redacted string and a returned span can never quote text that was never sent.**

### 3.3 `THE ACCEPTANCE-RUN PRIVACY RULE` `PROTECTED_DECISION`

> **1. The sanctioned builder is MANDATORY.** The sealed acceptance run constructs every input through `reasoning-input-builder.ts` @ `2865ae91…`. No path may bypass it. All three locked harnesses already satisfy this and must not be modified to avoid it.
>
> **2. `hazlenz.l3.redaction.v1` runs on every row**, and `redactionVersion` plus per-rule counts are recorded in the acceptance evidence for every row, including rows where the count is zero.
>
> **3. NO customer data is transmitted, by construction.** The corpus derives from published regulator records; there is no InSite customer, site, account or inspection in it. **§10 / §31.2's customer-data boundary is not engaged by the sealed run**, and that is the reason the run is permissible at all.
>
> **4. Name-level redaction is NOT required for the acceptance run, and MUST NOT be built in this phase.** The two reasons are independent and both must hold: the text is **already public** — published regulator records — and it is **not customer data**. Building a name redactor now would also alter the input bytes and invalidate the comparison against every recorded baseline.
>
> **5. DISCLOSED RESIDUAL, requiring the authorizer's explicit acceptance.** Real employer, facility and location names in published regulator narratives **will leave `127.0.0.1`** and reach `api.anthropic.com`. They are covered by §1's no-training prohibition and by non-retention-by-default, and they are already public. **Authorizing the sealed run IS the act that accepts this**, and it is recorded here so that acceptance is explicit rather than implied.
>
> **6. THIS RULE DOES NOT EXTEND TO PRODUCTION.** In production the text is genuinely customer-authored, private, and about a paying customer's site. §45.5's name-level-redaction decision remains **open and required before any customer use** — a production prerequisite this phase does not close and must not be read as closing.

---

## 4 — Model identity and the digest ceiling

| question | determination |
|---|---|
| Is `claude-sonnet-5` a pinned snapshot? | **YES.** *"Every Claude model ID is a pinned snapshot … Starting with the Claude 4.6 generation, model IDs use a dateless format that is **also a pinned snapshot, not an evergreen pointer**."* |
| Is it an evergreen alias? | **NO.** The alias-indirection carve-out applies only *"for models **before the 4.6 generation**"*. Sonnet 5 postdates it, and its **Claude API ID and Claude API alias are the same string**, `claude-sonnet-5` — there is no pointer layer that could move |
| Otherwise mutable? | **Not by any documented mechanism.** Lifecycle **Active**, deprecated **N/A**, retirement *"Not sooner than June 30, 2027"*, with *"at least 60 days' notice"* |
| Does Anthropic publish a content digest? | **NO.** No weight hash, checksum or content digest is published for any Claude model. §45.4's ceiling is real, permanent, and not closable by any action available here |

> ### `MODEL_IDENTITY_CEILING_ACCEPTED — PINNED_HOSTED_MODEL_ID_IS_SUFFICIENT_FOR_ACCEPTANCE`

**Accepted on three grounds, stated so the acceptance is not mistaken for indifference.** *(a)* A pinned snapshot with a contractual 60-day retirement notice is the strongest identity any hosted provider has offered this programme — it is the exact requirement `gemini-3.1-pro-preview` failed (`D-67`). *(b)* The alternative is `qwen3-coder:30b`, digest-pinnable at `06c1097efce0…` but **failing `P-02R` axes B and C** (one high-consequence rejection, validated HC 11/13) — trading a real safety axis for an identity axis. *(c)* The residual is bounded and **recordable**: the run captures the full identity set below, so a future dispute is answerable with evidence rather than memory.

> **The residual is not removed, only accepted.** A hosted acceptance result permanently carries the risk that the weights behind a stable label moved. **`MUST_REVERIFY`.**

### 4.1 `THE EXACT IDENTITY TO CAPTURE WITH THE ACCEPTANCE EVIDENCE` `PROTECTED_DECISION`

| field | value to record |
|---|---|
| provider | `Anthropic`, `https://api.anthropic.com` |
| model ID | `claude-sonnet-5` — **and** the `GET /v1/models/claude-sonnet-5` body at run time (`id`, `display_name`, `created_at`, `max_input_tokens`, `max_tokens`, `capabilities`) |
| retrieval date | the run date, on every documentation and catalogue assertion |
| API version / configuration | `anthropic-version` header; endpoint `POST /v1/messages`; `output_config.format` present; **`thinking` and `output_config.effort` OMITTED** (adaptive at default effort `high`, exactly as L3-2o ran); `temperature`/`top_p`/`top_k`/`seed` **not transmitted** — inexpressible (`D-72`) |
| prompt digest | `b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf` (shipped `L3_SYSTEM_PROMPT`, `v6`) **and** file `reasoning-prompt.ts` `426302a4c79d64ed1ecf122b216b3ff96295f26d54c2575956d3823cf22b19d5` |
| schema digest | run schema `a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385`; contract types `5f70281ce5ba14228a2002f3ae00eca0d0ae9668881f19eb0c84fe3d913d91b1` |
| validator digest | `942ac7cc20c2153c03ba5a6af2f7ecb62d1a5769b411ec849f32efb7eb69c298` |
| binder digest | `c1f9d29dea446d6b86237b7cce305514de6734bec5dae8e879768492d7e6eb47` |
| **input builder digest** | `2865ae91a7f50ff5794ea5d116399662e01116a2e9f34a585ac0ff276dbccc9e` — **added by this phase**, because §3's privacy rule is only auditable if the redactor's identity is pinned with the result |
| harness digests | `activate-l32j-shipped-corpus.ts` `0b3b8d86…` · `diagnose-l32k-shipped-residual.ts` `d90cb89c…` · cohort `ablate-l32g-state-separation.ts` `73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521` |
| transport | `anthropic-ollama-shim.js` `76d3e0397c138e72a3eeafec2ebbd8bf23f5f387dea8b7d8a365392ad895a083`, **byte-identical to L3-2o**, and its six recorded deviations re-asserted |
| sealed corpus | the three hashes in §6, recorded **before** opening and **again** after |
| redaction | `hazlenz.l3.redaction.v1` + per-rule counts for every row |

---

## 5 — Credential readiness

> ### `ACCEPTANCE_CREDENTIAL_MUST_BE_PROVIDED_AT_EXECUTION`

Presence-only check: **`ANTHROPIC_API_KEY` is NOT present** in this environment. Not printed, not hashed, not persisted, no prefix or suffix revealed, **no metadata or auth probe issued and no inference request made** — no programme rule requires one at this stage, and §45.6 stands that no production hosted path exists.

**This does not invalidate `claude-sonnet-5`'s qualification.** `D-70` recorded `P-12` by measurement on 2026-08-24 (Models API 200, Messages 200); credential presence is a *measurement of a moment* and is already a standing `MUST_REVERIFY`. It is an **execution-time** item, not a pre-authorization blocker.

---

## 6 — The single-use rule `§29.8 RECONCILED`

| confirmation | state |
|---|---|
| sealed corpus opened | **NO** — hashes re-derived this phase and identical: `49aa40fd…`, `a95e5480…`, `6f6897f1…` |
| semantic contents inspected | **NO** — §3 rests on §37.10's characterisation, not on the files |
| diagnostic tuning stopped | **YES** — L3-2p, L3-2q and L3-2r ran **zero inference** between them, and all three declined §47.8 route 1 |
| provider qualification stopped | **YES** — L3-2o was the last; `D-77` closed eligibility |
| prompt tuning stopped | **YES** — shipped prompt `b8cc50fc…` at `v6` since §41; §36.7 recorded the variant trade and shipped **B** *"chosen before the sealed set was opened and not revisited after"* |
| provider/model eligibility established | **YES** — `D-77`, not re-derived here |
| opening spends the asset | **YES** — §29.8: opened *"once per acceptance run and then retired"* |

### 6.1 `WHAT HAPPENS IF THE ACCEPTANCE RUN FAILS` `PROTECTED_DECISION — INDEPENDENCE RULE, NOT WEAKENED`

> #### `A FAILED ACCEPTANCE RUN SPENDS THE STRIDE. IT DOES NOT RETURN IT.`

1. **The result stands and is recorded as measured**, whatever it says. `L3-3` does **not** start: the gate requires zero high-consequence misses **and** the clarification axis at **100/100 — precision AND recall** (`D-78`), on fresh sealed evidence.
2. **The opened stride is retired permanently.** It never becomes a development, tuning or regression set. Nothing may be tuned *against* it and then re-labelled independent acceptance — that is the single prohibition this rule exists to enforce, and §22's `ROOT_CAUSE_BEFORE_REMEDIATION` sequence governs any remediation that follows.
3. **Remediation, if any, is a normal engineering slice** against already-open material, root-caused under §22 and owned under §23 — never against the opened stride.
4. **Re-acceptance requires a FRESH, UNOPENED stride.** §37.10 records **366 independent rows, roughly four future runs if each takes a stride** — so a failure is survivable, but the budget is finite and visibly counted down.
5. **A failure is not a reason to change a provider requirement.** `D-72`'s rule is standing: *"changing a requirement is the user's call, never a response to a provider failing it."* It binds `P-02R`, `P-08R` and `P-09R` exactly as it bound `P-02` and `P-08`.
6. **Customer authority does not move either way.** `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` until L3-3 through L3-6 complete; passing acceptance does not deploy anything.

---

## 7 — Pre-authorization decision

> ### `READY_TO_AUTHORIZE_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`

The five prerequisites L3-2q left open, closed or correctly dispositioned:

| # | L3-2q prerequisite | L3-2r outcome |
|---|---|---|
| 1 | Confirm the credential's organization is under the Commercial Terms | **CLOSED.** The terms govern API-key use by their own scope clause and bind on first access; there is no separate agreement and no tier. `P05_ACCEPTANCE_DATA_USE_SATISFIED` |
| 2 | Request ZDR | **NOT BLOCKING.** Content is not retained by default; `P-06` is satisfied without it. Recommended for production; operator action recorded, **not claimed as done** |
| 3 | Decide name-level redaction or accept narrative PII egress | **DECIDED — §3.3.** The corpus is published regulator records, not customer data; the mandatory builder + `hazlenz.l3.redaction.v1` apply; the entity-name residual is disclosed and accepted **by the act of authorizing** |
| 4 | Explicitly accept the digest ceiling | **ACCEPTED — §4**, on three stated grounds, with the full identity set to pin |
| 5 | Re-probe credential presence | **DONE — ABSENT.** An **execution-time** item, not a pre-authorization blocker |

**No prerequisite required before corpus opening remains outstanding.**

> **What READY does NOT mean.** The corpus is **not** opened. L3-3 has **not** passed and may not start. **No production provider is selected** — `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`. Customer authority is unchanged. No adapter was built. The authorization itself is **a separate, explicit user act under §29.8 that this phase does not perform.**

---

## 8 — Regression, egress and preservation

No code changed, so no suite could move, and none did: **15 suites, 1,085 assertions, 0 failed**, `tsc --noEmit` exit 0 — identical to §43.7, §44.6, §46.5, §47.7, §48.8 and §49.8.

**Egress:** **zero inference calls, hosted or local; zero API requests; $0.00.** Three documentation fetches to `platform.claude.com` and `anthropic.com` carrying **no content, no credential and no scenario text**. No credential was read; Claude Code authentication unchanged.

**Preservation:** HEAD `a7b21a26` at 0/0, 23 tags, 4 stashes with no stash operation, all 19 `reasoning-l3` modules and every locked harness digest byte-identical, **sealed corpus hash-verified and NOT OPENED**, `B08` unaltered, protected excluded product work unstaged and byte-identical, 0 index entries staged.
