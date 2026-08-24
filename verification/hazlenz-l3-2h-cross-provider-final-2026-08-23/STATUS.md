# L3-2h FINAL EXECUTION — CROSS-PROVIDER STRUCTURAL-STATE DISCRIMINATION

`EXECUTED` · `ARCHITECTURE_SELECTION_EVIDENCE, NOT ADVANCEMENT EVIDENCE` ·
`CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Zero production files, zero script files and zero scorer files
modified. No stash operation executed. No sealed corpus opened. Not committed, not pushed.

**The credential gate PASSED for the first time since §31.1** — three phases and four attempts after
the blocker was first recorded.

## 1 — Credential gate

| | §38.1 | §38.8 resume | this phase |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | unset | unset | unset |
| `OPENAI_API_KEY` | present, len 11 | **401 Unauthorized** | unchanged, not re-probed |
| Gemini credential | unset | unset | **present, `GET /v1beta/models` → HTTP 200** |

Authorized provider **Google** (`generativelanguage.googleapis.com`), authorized model
**`gemini-3.1-pro-preview`**, credential variable `GEMINI_API_KEY`. The provider and model were named
by the operator; both arrived as unfilled placeholders in the command text and were not chosen by
this phase after seeing any output.

The credential was carried only to the provider's own endpoint, never printed, logged, hashed or
persisted, and appears in **zero** artifacts (verified by scan). §38.8's 401 finding for
`OPENAI_API_KEY` was **not** re-derived — it is settled.

## 2 — Method: the locked harness ran BYTE-UNMODIFIED

`ablate-l32g-state-separation.ts` sha256 `73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521`,
identical before and after. All three companion scorers likewise unmodified and run **as-is on both
providers**, which is what makes the two columns below comparable rather than merely adjacent.

Adapter work was confined to **transport**, per §38.7, by putting an Ollama-protocol translation shim
(`adapter/gemini-ollama-shim.js`) in front of the Gemini API and pointing the harness's pre-existing
`L3_OLLAMA_ENDPOINT` hook at it. Scenario texts, expected labels, variants, prompts, JSON schema,
resolver orderings and scorers were never touched.

**§38.3's trap was honoured.** Three variants, three separate harness processes, with the shim also
restarted between them — the noise-floor control never shared a process with the variant it controls.
**72 calls, 0 transport errors, every `finishReason: STOP`, no truncation.**

**The pipeline is self-validating:** replaying it against the qwen baseline reproduces §38.2's
recorded numbers exactly — noise floor 0/24, order sensitivity 3/24 on `F-CL-01`/`F-CL-03`/`C-CS-05`,
HC 12/12, false ACTIVE 0/7, clarification 100/75, incoherence 7.1%/12%, control 5/6 and 6/6.

## 3 — The measured result

| measure | qwen3-coder:30b | gemini-3.1-pro-preview |
|---|---|---|
| noise floor (identical prompts, separate processes) | **0/24** | **1/24** (`F-CL-01`) |
| order sensitivity, one block moved | **3/24** | **2/24** |
| — differing scenarios | `F-CL-01`, `F-CL-03`, `C-CS-05` | `F-CL-01`, `B10` |
| internal fact incoherence | 7.1% / 12% / 6.9% | **4.3% / 3.8% / 4.0%** |
| — `CONDITIONAL_AND_ASSERTED` | **1 / 2 / 2** | **0 / 0 / 0** |
| control-reading correctness | 5/6, 6/6 (miss: `F-WC-02`) | 5/6 all three (miss: `F-COR-01`) |
| HC gate, all orderings | 12/12 | 12/12 |
| false ACTIVE under **shipped** resolver `R0` | **3/7, 5/7, 3/7** | **0/6, 0/8, 0/7** |
| clarification recall under `R0` | **0** | **100** |
| clarification precision / recall under `R1` | 100 / 75 | **100 / 100** |

## 4 — What this settles, and it is a SPLIT verdict

### 4.1 §37.5's provider indictment does NOT reproduce — terminal A confirmed, n = 2

§37.5 rested its provider reading on internal self-contradiction: `framing: CONDITIONAL` asserted
together with `hazardAsserted: true` about the same text, because **no ranking can explain an answer
that contradicts itself**. Across **74 Gemini candidates in three variants that class is empty.**

`C-CS-05` — the case §37.5 cited as flipping `asserted` under different block orders — comes back
from Gemini **identical on all three runs**: `(asserted=false, CONDITIONAL, no missing fact)`.

So the mechanism §37.5 named was **`PROVIDER_CAPABILITY_BOUND`**, and `qwen3-coder:30b` was the
limit. That question is closed at n = 2 rather than n = 1.

### 4.2 The residual is REPRESENTATION-BOUND, and this phase found its concrete cause

Gemini's facts are **perfectly stable wherever it emits candidates at all**. Every scenario that
moved, moved on one binary decision: *emit hazard candidates*, or *return `INSUFFICIENT_EVIDENCE`
with zero candidates*.

> #### `A CLARIFICATION CAN ONLY BE CARRIED ON A hazardCandidate`
> When the model correctly concludes the observation is underdetermined and returns
> `INSUFFICIENT_EVIDENCE` with an empty `hazardCandidates` array, **the schema gives the clarification
> nowhere to live.** The pipeline loses the clarification in exactly the case that most needs one.

Every one of Gemini's clarification misses is this and nothing else: `F-CL-01` (V_S_STRUCT) and `B10`
(V_S_STRUCT, V_S_STRUCT_REPEAT). Where Gemini emitted a candidate for those same scenarios it
produced identical facts `(asserted=false, ACTUAL, decisionCriticalFactMissing=true, NOT_STATED)` and
correctly owed a clarification.

This is `CONTRACT_REPRESENTATION_BOUND` — terminal **B** — for the clarification axis, with a
structural cause that a provider swap cannot fix. It is **not** the mechanism §37.5 proposed.

### 4.3 §37.4's resolver ordering was compensating for provider fact quality

`R1_MISSING_FIRST` was introduced in §37.4 because the shipped `R0_HAZARD_FIRST` dropped
clarifications on qwen's facts. **On Gemini's facts `R0` already scores 0 false ACTIVE and 100
clarification recall** — the repair is unnecessary. The resolver ordering problem was a property of
the provider's fact quality, not of the resolver.

### 4.4 A stable wrong answer, which is not noise

Gemini reads `F-COR-01`'s fitted blanking plate as `controlReading: ABSENT` (expected
`PREVENTS_CONTACT`) — **identically on all three runs**. qwen answers that one correctly and misses
`F-WC-02` instead. Both sit at 5/6. Each provider has exactly one deterministic control-reading
error, and they are different scenarios, which is a capability signature rather than instability.

## 5 — A SCORER ARTIFACT found in the existing pipeline `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `rederive-l32g-resolution.ts` DROPS ZERO-CANDIDATE ROWS BEFORE SCORING

`rows.filter(r => r.derived && r.derived.length)` removes any scenario where the model emitted no
candidates. Clarification recall is therefore computed on a **reduced denominator**, and a provider
is never charged for a clarification it failed to raise by emitting nothing at all.

This is **pre-existing, affects both providers, and affects previously recorded numbers.** qwen drops
`B10` in all three variants, so §37/§38's recorded **75% recall is 3/4, not 3/5** — the true
full-cohort figure is 60%.

Recomputed on the full 24 scenarios, counting a zero-candidate row as a miss (shipped `R0` resolver):

| | qwen | gemini |
|---|---|---|
| HC | 13/13 | 13/13 |
| false ACTIVE | 3/11, 5/11, 3/11 | **0/11 all three** |
| clarification recall | **0/5 all three** | 3/5, 5/5, 4/5 |

The relative conclusion is unchanged and in fact strengthens. The absolute recorded recall figures in
§37 and §38 are optimistic for both providers and should be corrected rather than reused.

## 6 — Fidelity deviations, recorded rather than hidden

1. **Reasoning could not be equalised.** `thinkingLevel: low` is the floor for Gemini 3 Pro; it still
   spent a mean of ~584 thought tokens per call. qwen ran with no extended reasoning. This is the
   largest confound and it cuts in Gemini's favour.
2. **`num_ctx` has no Gemini equivalent** (8192 vs a fixed ~1M window). Silent truncation, which the
   local setting existed to prevent, is not possible in that direction.
3. **`additionalProperties: false` was dropped** in schema conversion — unsupported by Gemini's
   OpenAPI-subset `responseSchema`. Field order was preserved explicitly via `propertyOrdering`.
4. **`seed` is best-effort** on Gemini. Its 1/24 non-zero noise floor against qwen's 0/24 reflects
   that, and it is why the order-sensitivity margin (2 vs a floor of 1) is **narrow and should not be
   over-read**.
5. **A preview model label is not a content digest.** qwen was pinned at `06c1097efce0…`;
   `gemini-3.1-pro-preview` can change under its label, so this run is less reproducible than the
   baseline it is compared against.

## 7 — Egress, authority, preservation

**Egress:** `generativelanguage.googleapis.com` — **73 calls** (1 auth probe carrying the credential
and nothing else, 72 inference). `127.0.0.1:11434` — **0 calls**; no local inference this phase.
Only already-opened diagnostic scenarios were transmitted. **No customer data, no sealed corpus, no
credential in any artifact.**

**Customer authority preserved by construction** — zero production files changed; seam, call site,
`backend/src/standards/` and all of `reasoning-l3/` byte-unmodified vs HEAD.

**Preservation** (`preservation-evidence.txt`): HEAD `1feda622`, 0/0 upstream divergence, locked
harness and all three scorers digest-verified, sealed corpus `a95e5480…` / `49aa40fd…` / `6f6897f1…`
hash-verified and **not opened**, 4 stash entries with no stash operation run, 23 tags.

**Regression is inherited, not re-measured**, and stated that way: no code changed and every input is
hash-identical, so §38.6's 715 offline assertions / 0 failed and `test:hazlenz-core` 206 pass / 2 fail
(the two documented §13.1 failures only, **not** reclassified) stand.

## 8 — What was deliberately NOT done

No prompt remediation or tuning · no architecture redesign · no scenario or label edits · no scorer
edits (the §5 artifact is **reported, not patched**) · no sealed corpus opened · no production
provider selected · no L3-3 · no commit, no push.

## 9 — Exact next phase

1. **Fix the clarification-carriage gap in §4.2** — a clarification must be representable when
   `outcome = INSUFFICIENT_EVIDENCE` with no candidates. This is a contract change, and it is now the
   top item on the Level-3 critical path.
2. **Correct the §5 scorer denominator** and restate §37/§38's clarification recall figures. Do not
   silently reuse the old numbers.
3. **`PRODUCTION_PROVIDER_SELECTION` remains OPEN.** This run is architecture-selection evidence on
   24 diagnostic scenarios; it is explicitly **not** a production recommendation, and §10's privacy
   boundary — which the local provider satisfied absolutely — is a live consideration against a
   hosted one for customer text.
4. **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
   the clarification axis still at 100/100.** Unchanged. This phase opened no sealed evidence and
   does not advance it.
