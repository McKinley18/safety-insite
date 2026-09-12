# §210B-3A — PREREGISTRATION DEFECT REGISTER

Recorded beside the frozen text, never into it. The frozen artifact
`verification/expert-hazlenz-210b3-probe-preregistration-2026-09-08/PROBE-PREREGISTRATION-210B3A.json`
(sha256 `7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5`) is unmodified, and its own
note requires exactly this treatment:

> "Once presented for product-owner review this file is not edited; a truth defect found later is
> recorded as a PREREGISTRATION_DEFECT beside the frozen text, never silently repaired."

DEFECTS 1 and 2 are in the **cache and spend model** and were found with zero provider calls.
DEFECT 3 is an **architecture / transport** defect found during §210B-3B execution, when the frozen
PB-02 request shape was rejected by the provider before inference.

None of the three touches the frozen **semantic** truth. The stimuli, the axes, the evaluation
questions and the pass rule are unaffected and remain usable exactly as frozen. DEFECT 3 does remove
PB-02 from execution in its frozen form, so axis I is `NOT_EXERCISED` — which is a statement about
the instrument, not about model behaviour.

Database operations: **0**. The frozen artifact is unmodified and still hashes to the authorized
value.

---

## DEFECT 1 — the modelled cacheable prefix is not a cacheable prefix

**Severity: BLOCKING.** It is the sole basis of the projection that brought the probe inside its own
hard ceiling.

### What the preregistration froze

`tokenPlan.expectedStablePrefixBytes = 46306` and `expectedCacheablePrefixPercent = 65.9`. That
46,306-byte figure is exactly the byte length of the plain §210B-2 first-pass system prompt, measured
locally and confirmed in `CACHE-PREFLIGHT-210B3A.json`. The projection treats the system prompt as
the cacheable prefix and derives `cacheDecision.projectionWithCaching.costUsd = 0.3519`, against
`projectionWithoutCaching.costUsd = 0.5965` and a hard ceiling of `0.50`.

### Why it does not hold

Anthropic renders the cached prefix in a fixed order: **`tools` → `system` → `messages`**. A
`cache_control` breakpoint on the last system block caches tools *and* system together, so the tool
definitions sit **ahead of** the system prompt in every cache key. The system prompt can only be read
from cache if the tool block preceding it is byte-identical.

It is not. Each case carries its own wire schema, and all eight tool blocks are distinct:

| Case | tool block sha256 (first 12) | bytes | system prompt sha256 (first 12) |
|---|---|---|---|
| PB-01 | `4de5a9008297` | 18,807 | `55d10ae6da5d` |
| PB-02 | `dc119bba2db6` | 19,249 | `994b378e259d` |
| PB-03 | `5653e889614d` | 18,812 | `55d10ae6da5d` |
| PB-04 | `ce29cd769401` | 18,825 | `55d10ae6da5d` |
| PB-05 | `d5df03cf411e` | 18,827 | `55d10ae6da5d` |
| PB-06 | `db8c5e4cbb6f` | 18,819 | `55d10ae6da5d` |
| PB-07 | `7ddb0260832c` | 18,825 | `55d10ae6da5d` |
| PB-08 | `b60b7a39fbdd` | 18,838 | `55d10ae6da5d` |

The tool blocks share only their first **839 bytes** and then diverge — 4.5% of an 18.8 kB block, and
the divergence occurs long before the system prompt is reached.

### What diverges, and why it may not be changed

Three schema paths differ on all seven cases against PB-01, and two more on PB-02 alone:

| Diverging path | Cases |
|---|---|
| `expertHazardCandidates.items.properties.hazardFamily.enum` | 7/7 |
| `expertHazardCandidates.items.properties.evidence.items.properties.sourceId.enum` | 7/7 |
| `unresolvedFactDeclarations.items.properties.observationSourceId.enum` | 7/7 |
| `unresolvedFactDeclarations.items.properties.governedEvidenceSourceIds` | 1/7 (PB-02) |
| `unresolvedFactDeclarations.items.required` | 1/7 (PB-02) |

Every one is **frozen semantic request content**: the per-case allowed hazard families and the
per-case observation `sourceId`, which constrain what the model may emit and which the §203 grammar
identity pins. They are not transport shape. Making the tool block stable across cases would mean
sending each case a grammar that permits hazard families and source ids belonging to other cases —
a change to the semantic request, which the authorization forbids.

Reordering keys inside the schema cannot rescue it either: there is a single tool, so the only
available breakpoint boundary is *after* the whole tool definition, and the diverging enums would
still fall inside the prefix that precedes the system prompt.

### Consequence

For this request shape there is **no achievable cross-case cache read**. The documented behaviour of
a `cache_control` marker on a prefix that differs per request is that it writes a fresh entry every
time at the 1.25× write multiplier and reads none of them — strictly more expensive than not caching.
The documented instruction for this exact situation is: *"Prompts that change from the beginning
every time — don't cache."*

Recomputed against the frozen token plan (24,500 logical input tokens, 2,324 output tokens per call,
$2/$10 per MTok, ×1.25 write, ×0.1 read, 8 calls):

| Configuration | Projected 8-call spend | Within $0.50 ceiling |
|---|---|---|
| No caching | **$0.5779** | NO |
| Caching, write-only — what this probe would actually get | **$0.6425** | NO |
| Caching with cross-case reads — modelled, unachievable | $0.3826 | (yes, but unreachable) |
| Frozen `projectionWithCaching` | $0.3519 | (yes, but unreachable) |

**Every achievable configuration exceeds the hard ceiling.** The preregistration's own headline
finding — "AT 8 CALLS WITHOUT CACHING THE PROBE EXCEEDS ITS OWN HARD CEILING" — is correct; its
proposed remedy does not exist for this request shape.

---

## DEFECT 2 — the designated cache preflight pair cannot detect a cache read

**Severity: MATERIAL.** It would have produced a null result read as evidence either way.

The authorization designates PB-01 and PB-02 as the two-call cache preflight, to be inspected for
cache telemetry before deciding whether to continue. PB-02 is the **only** governed case in the
probe (`executionPlan.governedEvidenceSuppliedInFirstPass = ["PB-02"]`), so it is the one case that
uses the governed instruction variant, `994b378e…`, rather than the plain `55d10ae6…`.

PB-01 and PB-02 therefore differ in **both** components of the cacheable prefix — the tool block and
the system prompt. Even under the preregistration's own (optimistic) cache model, the second call
could not read the first call's entry, because it shares no prefix with it. The pair would have
returned two cache creations and zero cache reads.

That observation is indistinguishable from the healthy first-two-calls behaviour of a working cache,
so it could not have discriminated. Continuing on it would have projected savings that were never
demonstrated; stopping on it would have blamed the transport for the probe's own design.

Had a read-capable preflight been wanted, it needed two cases sharing a prefix — which, given
DEFECT 1, no pair in this probe does.

---

## What is NOT defective

- The eight stimuli, their frozen truth, the prohibited proxies and the decision-neutral unknowns.
- The nine axes A–I and their frozen `NOT_APPLICABLE` assignments. (Axis I is `NOT_EXERCISED` in
  §210B-3B for the transport reason in DEFECT 3, which is not a defect in the axis.)
- The 26 evaluation questions.
- The pass rule, including no partial credit and no aggregate compensation.
- The instruction identities: the repo builds `55d10ae6…` (plain) and `994b378e…` (governed),
  byte-identical to the frozen values, and all eight stimuli in
  `backend/scripts/lib/section-210b3-probe-preregistration.ts` are byte-identical to the frozen JSON.

The probe's semantic content is intact. Seven of the eight cases are executable as frozen; PB-02
requires an architecture change and its own preregistration (DEFECT 3).

---

## DEFECT 3 — PB-02 supplies governed evidence to the first pass, a shape the provider structurally rejects

**Severity: BLOCKING for PB-02 only. Discovered during §210B-3B execution, at the cost of one call
that reached no inference and was not billed.**

### What the preregistration froze

`executionPlan.governedEvidenceSuppliedInFirstPass: ["PB-02"]`. PB-02 is the sole case exercising
axis I (`GOVERNED_NORMATIVE_DESCRIPTIVE_BOUNDARY`) and the sole consumer of the governed instruction
variant `994b378e…`. Supplying `GOV-SE-11` to the first pass makes the request capability-PRESENT:
the wire schema grows a `governedEvidenceSourceIds` property and a corresponding `required` entry.

### What the provider did

```
HTTP 400  invalid_request_error
The compiled grammar is too large, which would cause performance issues.
Simplify your tool schemas or reduce the number of strict tools.
```

### Why this was foreseeable from frozen evidence

This is the failure §199 recorded as `COMPILED_GRAMMAR_TOO_LARGE`, and the §208 executor names it in
its own header as the reason the first pass is capability-ABSENT on **every** case:

> "Supplying the records to the first pass would send the retired capability-PRESENT shape that §199
> recorded as COMPILED_GRAMMAR_TOO_LARGE."

The frozen §202 architecture, hosted-proven in §206, crosses the governed relation on a **separate
governed-stage call**. §210B-3A departed from that architecture for PB-02 without re-establishing
that the capability-PRESENT first-pass shape is transmissible. It is not.

### Consequence, and what it is NOT

PB-02 is **structurally unexecutable in its frozen form**. It was drawn exactly once, rejected before
inference, billed nothing, and not retried — no second draw was authorized or taken.

This is a **TRANSPORT / ARCHITECTURE** fact about one request's shape. It is emphatically **not**:

- a semantic failure of the §210B-2 remediation;
- evidence about S6 or about model behaviour of any kind;
- a failed probe case;
- evidence about any other case, all of which are capability-ABSENT and transmitted normally.

Axis I is therefore recorded **NOT_EXERCISED**, never `PASS`, `FAIL` or `CORRECT`. There was no
genuine opportunity for the model to succeed or fail on it, because no model ever saw the request.

### What a future §210B-3C would need

Exercising S6 requires either the separate governed stage (the frozen §202/§206 architecture, which
is known transmissible), or a demonstrated reduction of the capability-PRESENT first-pass grammar
below the provider's compiled-grammar limit. Either is a change to the request architecture and needs
its own preregistration. It may not be improvised inside an execution authorization.
