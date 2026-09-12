# TBR-20 — CACHE PREFIX MUST BE MEASURED FROM PROVIDER SERIALIZATION ORDER

Recorded additively at product-owner direction (§210B-3B authorization, 2026-09-09). The frozen
§210A blueprint package is **not edited**; TBR-1 … TBR-15 there stand as written.

## The rule

A block is not cacheable merely because its own bytes are stable.

Cross-request cache reuse requires **every provider-visible block preceding the cache boundary** to
remain cache-compatible under the provider's actual request serialization and cache hierarchy.

For the current Expert first-pass architecture, case-specific tool-schema content precedes the stable
system instruction. **System-prompt stability alone therefore does NOT imply cross-case prompt-cache
reuse.**

Future cache optimization must analyse

    TOOLS -> SYSTEM -> MESSAGES

as one ordered provider-visible prefix, not as independent blocks.

## Evidence this rule was derived from

Measured locally in `CACHE-PREFLIGHT-210B3A.json`, zero provider calls:

| Quantity | Value |
|---|---|
| Distinct tool blocks across 8 frozen cases | 8 of 8 |
| Distinct system blocks across 8 frozen cases | 2 of 8 |
| Shared leading bytes across tool blocks | 839 of ~18,800 |
| System prompt treated as cacheable by §210B-3A | 46,306 bytes (65.9%) |

Diverging schema paths, all frozen semantic request content:

- `expertHazardCandidates.items.properties.hazardFamily.enum` — 7/7 cases
- `expertHazardCandidates.items.properties.evidence.items.properties.sourceId.enum` — 7/7
- `unresolvedFactDeclarations.items.properties.observationSourceId.enum` — 7/7
- `unresolvedFactDeclarations.items.properties.governedEvidenceSourceIds` — PB-02 only
- `unresolvedFactDeclarations.items.required` — PB-02 only

## Prohibition

**Do not weaken semantic schema constraints merely to create cache hits.**

Any future stable-tool-grammar design must be separately demonstrated to preserve:

- hazard-family constraints;
- source-id constraints;
- structured-output validation;
- grammar identity;
- safety semantics;

before it can replace the current request grammar.

## Relationship to the existing blueprint

TBR-3 (static/dynamic separation) and TBR-13 (cache immutable work) were assessed `NOT_SATISFIED` in
§210A, and §210A already observed "24 distinct schema hashes for 3 grammars, so the stable prose is
not a cacheable prefix". TBR-20 states the *general* reason that observation generalizes, and makes
the ordering explicit so a future optimization cannot repeat the §210B-3A modelling error.

## Historical estimates, superseded as realizable fractions

The §210B-3A figures **65.9% cacheable prefix** and the derived **~83.0% cache-ready prefix** are
preserved as historical MODELLED estimates whose prefix assumption was invalidated. They must **not**
be treated as realizable provider cache fractions for this architecture.
