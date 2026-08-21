# KG-4A — the controlled-cutover architecture (Phases 1, 2, 6, 13)

## 1. The shape

```
finding evidence
  → HazLenz applicability reasoning          (evidence-foundation.ts — UNCHANGED by KG-4A)
  → GovernedCutoverContext.create()          ← the ONE seam; returns null unless enabled
       ├ resolveCutoverMode(env)             mode contract, defaults LEGACY
       ├ resolveCutoverEnablement(principal) allowlist, defaults OFF
       └ pinGovernedRelease()                ONE active-pointer read per analysis
  → context.resolveStandard(citation, applicability)
       ├ resolveGoverned()                   → GovernedResolutionResult (canonical)
       ├ decideFallback(mode, applic, back)  → FallbackDecision (the 84-row table)
       └ emitCutoverEvent()                  → categorical observability
  → resolveStandardsBacking({ …, governed }) the EXISTING KG-3C contract, one rule set
  → projectGovernedDisplay()                 delivery state overrides display
  → customer response
  → InspectionService.addAnalysis()          server-side provenance gate
  → hazlenz_analyses / inspection_findings   analysis- and finding-level provenance
  → CanonicalReportsService.knowledgeProvenance()
```

## 2. Why this seam

`resolveStandardsBacking()` was already the single decision point for content backing on **both**
customer paths, and it already accepted an optional pre-resolved `governed` input that nothing
customer-facing ever produced. KG-4A supplies that input. Consequences:

* `governed: undefined` reproduces today's behaviour **byte-for-byte**, so LEGACY is a structural
  no-op rather than a re-implementation;
* Path A (`suggest()`) and Path B (`hydrateFindingScopedStandards()`) cannot disagree, because they
  share the resolver;
* governed resolution in Path A runs **after** `rankedAndLimited` — after ranking, dedup,
  jurisdiction filtering and truncation — so it can never add, remove, reorder or re-truncate the
  candidate set. "A governance gap must never delete an evidence-derived citation" is therefore
  structural, not merely a policy the table happens to implement.

## 3. New modules

| File | Purpose |
|---|---|
| `standards/cutover/cutover-mode.ts` | mode + enablement contract. **Imports nothing** — asserted. |
| `standards/cutover/fallback-contract.ts` | the 84-row decision table, pure |
| `standards/cutover/governed-resolution.ts` | canonical result type, release pin, total resolver |
| `standards/cutover/governed-cutover-context.ts` | the seam; per-analysis pin + memo + provenance accumulator |
| `standards/cutover/governed-provenance.ts` | analysis/finding provenance, composed over KG-1 |
| `standards/cutover/cutover-observability.ts` | categorical events, shadow classification, privacy guard |

## 4. Mode contract

| Mode | Governed resolver runs? | Customer output | `knowledgeReleaseId` |
|---|---|---|---|
| `LEGACY` | **no** — context is `null` | today's, byte-identical | always NULL |
| `SHADOW` | yes | **byte-identical to LEGACY** | always NULL |
| `GOVERNED_WITH_FALLBACK` | yes | approved text preferred; fallback contract otherwise | only where governed content influenced output |
| `GOVERNED_STRICT` | yes | only exact approved content may be shown as text | as above |

`GOVERNED_STRICT` is **not** a candidate for the customer default: KG-3F measured 23 of 160 declared
citations as emitted-and-approved, so strict mode would strip HazLenz-authored text from the rest for
every customer at once. Strictness about **claims** is the goal; strictness about **display** is a
different and far more disruptive thing.

## 5. Default-safe parsing

* `resolveCutoverMode({})` → `LEGACY` / `DEFAULT_NO_CONFIGURATION`.
* Modes match an exact closed set after `trim().toUpperCase()`. `Boolean(env.X)` is never used, so
  every truthy non-mode string (`'true'`, `'1'`, `'yes'`, `'on'`, `'GOVERNED'`, `'{}'`, …) resolves to
  `LEGACY` with `INVALID_MODE_VALUE` — **22 such strings asserted**.
* Production requires a second, differently-named acknowledgement
  (`GOVERNED_CUTOVER_PRODUCTION_ACK=I_ACKNOWLEDGE_GOVERNED_CUTOVER`). A truthy-but-wrong value does
  not unlock it. Without it, startup **fails** via `validateProductionEnvironment()`.

## 6. Enablement boundary (Phase 13)

Evaluated: server env mode · explicit flag · account allowlist · organization allowlist ·
deterministic percentage cohort · combination.

**Chosen: server mode AND (account allowlist OR organization allowlist).** Two independent locks,
both defaulting off, so a single mistake cannot expose customers. A percentage cohort was rejected
for the *first* cutover: it names nobody, so an operator cannot say in advance who is affected, and
the brief asks for the narrowest reversible mechanism.

* A governed mode with **no** allowlist enables nobody (`NO_ALLOWLIST_CONFIGURED`).
* The principal comes from the authenticated JWT-derived user only. **No body, query, param or
  header can select a mode** — asserted by a source scan over all 573 customer-path files.
* Cutover configuration is read in exactly one file (`cutover-mode.ts`), which imports nothing.
