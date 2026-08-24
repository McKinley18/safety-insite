# Official Google provider documentation — consulted 2026-08-24

Every mutable provider assertion below carries its source URL and retrieval date, as
`PROVIDER_REQUIREMENTS.md` requires. **No claim here is written from memory.**

| # | Assertion | Source | Retrieved |
|---|---|---|---|
| 1 | **Unpaid tier:** Google *"uses the content you submit to the Services and any generated responses to provide, improve, and develop Google products and services"*, and *"Human reviewers may read, annotate, and process your API input and output."* | https://ai.google.dev/gemini-api/terms (Effective 2026-03-23) | 2026-08-24 |
| 2 | **Paid tier:** *"Google doesn't use your prompts…or responses to improve our products."* No human review stated. | same | 2026-08-24 |
| 3 | **Paid-tier logging:** Google *"logs prompts and responses for a limited period of time, solely for detecting and preventing violations"* | same | 2026-08-24 |
| 4 | **Abuse-monitoring retention is 55 days** on the paid tier, held separately from other logs, and *not used to train or fine-tune any AI/ML models besides those used specifically for policy enforcement* | https://ai.google.dev/gemini-api/docs/logs-policy · https://ai.google.dev/gemini-api/docs/usage-policies | 2026-08-24 |
| 5 | **Zero Data Retention (ZDR)** is available **on approved request, per project, Paid Services only**: *"all user content (prompts and responses) and identifiable metadata (such as IP addresses and Google Account IDs) are cleared prior to logging."* | https://ai.google.dev/gemini-api/docs/zdr | 2026-08-24 |
| 6 | **ZDR-incompatible features:** Search/Maps grounding (mandatory 30-day), Interactions API, File API, explicit context caching. **HazLenz uses none of these** — it issues plain `generateContent` with a `responseSchema`. | same | 2026-08-24 |
| 7 | **EEA/Switzerland/UK:** paid-tier data protections apply to all services *"even though they are offered free of charge."* | https://ai.google.dev/gemini-api/terms | 2026-08-24 |
| 8 | **Version semantics.** *Stable*: "Points to a specific stable model. Stable models usually don't change. Most production apps should use a specific stable model." *Preview*: "may be used for production" with "at least 2 weeks notice". *Latest*: "will get hot-swapped with every new release". *Experimental*: "Not be suitable for production use". | https://ai.google.dev/gemini-api/docs/models | 2026-08-24 |
| 9 | **`gemini-3.7-flash` is documented STABLE**, GA **2026-08-13**, *"Our latest and most capable Flash model, built for complex coding, agentic workflows."* | https://ai.google.dev/gemini-api/docs/models · https://ai.google.dev/gemini-api/docs/changelog | 2026-08-24 |
| 10 | **There is NO stable Gemini 3.x Pro.** The only 3.x Pro text model documented is `gemini-3.1-pro-preview` (preview). The stable 3.x models are Flash tier only. | https://ai.google.dev/gemini-api/docs/models | 2026-08-24 |
| 11 | **Deprecation notice** is typically 60–90 days; no retirement date is published for `gemini-2.5-pro`, `gemini-3.1-pro-preview` or `gemini-3.7-flash`. Preview labels have been **silently redirected**: *"the preview models `gemini-2.5-pro-preview-05-06` and `gemini-2.5-pro-preview-03-25` are now redirecting to the latest stable version."* | https://ai.google.dev/gemini-api/docs/changelog | 2026-08-24 |
| 12 | **Structured output** supports schema-constrained generation; supported keywords include `type`, `properties`, `required`, `enum`, `items`, `minItems`, `maxItems`. **`minLength` is not supported.** Documentation guarantees *"syntactically correct JSON"* only and advises *"always validate values in your application"*. | https://ai.google.dev/gemini-api/docs/structured-output | 2026-08-24 |
| 13 | **Pricing (paid tier, per 1M tokens).** `gemini-3.7-flash` $0.75 in / $3.75 out (introductory, through 2026-12-31; $1.50/$7.50 thereafter). `gemini-3.5-flash` $1.50/$9.00. `gemini-2.5-pro` $1.25/$10.00 (≤200k). `gemini-3.1-pro-preview` $2.00/$12.00 (≤200k). Thinking tokens billed at the output rate. | https://ai.google.dev/gemini-api/docs/pricing | 2026-08-24 |
| 14 | **Free tier data use:** *"content used to improve our products"*; **paid tier:** *"content **not** used to improve our products"* | same | 2026-08-24 |

## Measured, not documented — the finding that matters most

> ### `gemini-2.5-pro` — the ONLY model at the Pro tier that describes itself as a stable release — IS NOT CALLABLE.

Direct `POST /v1beta/models/gemini-2.5-pro:generateContent`, retrieved 2026-08-24:

```
HTTP 404  NOT_FOUND
"This model models/gemini-2.5-pro is no longer available to new users.
 Please update your code to use models/gemini-3.1-pro-preview for the
 latest features and improvements."
```

A control call to `gemini-3.7-flash` in the same probe returned **HTTP 200**, so the credential and
method are sound. `gemini-2.5-pro` is still listed by `ListModels` and still documented as stable —
**the catalogue and the documentation both overstate availability**, and Google's own error text
directs a new account at a **preview** model as the Pro-tier replacement.

> **`ListModels` presence is not callability, and a documented "stable" label is not availability.**
> Both must be probed. This is the operational form of `D-67`.
