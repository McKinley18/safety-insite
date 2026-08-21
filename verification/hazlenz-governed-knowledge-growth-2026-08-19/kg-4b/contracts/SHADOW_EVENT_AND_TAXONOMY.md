# KG-4B — the shadow event contract and the mismatch taxonomy (Phases 1, 2, 12, 13)

Machine-readable form: **`shadow-taxonomy.json`** — schema version, all 15 categories, 3 severities,
11 root-cause buckets, the 29-field event allowlist, the severity map, the KG-4A projection, and a
real example event.

## 1. One taxonomy, not two

KG-4A's nine-value `ShadowMismatchCategory` is retained **only** as a backward-compatible projection
(`toLegacyMismatchCategory`) of the KG-4B taxonomy. There is exactly one classification engine, so
the two vocabularies cannot drift. The projection is asserted total in both directions: every KG-4B
category maps onto a KG-4A name, and **all nine** KG-4A names remain reachable.

## 2. The event — `kg4b.shadow-comparison.v1`

29 fields, every one an identifier, a categorical state, a digest or a number.

| Group | Fields |
|---|---|
| identity | `schemaVersion` `event` `observedAt` `correlationId` `findingKey` `eventKey` |
| mode + release | `mode` `releaseId` `releaseManifestChecksum` |
| citations | `requestedCitation` `legacyCitation` `governedResolvedCitation` |
| the two axes | `applicability` · `legacyBackingState` `governedBackingState` |
| approval identity | `approvalContractVersion` `approvalDigest` |
| outcome | `fallbackState` `mismatch` `dimensions` `severity` `rootCause` `resolverHealth` |
| content | `legacyTextDigest` `governedTextDigest` — **digests only** |
| aggregation | `hazardFamily` `jurisdiction` `latencyMs` |
| obligation | `customerOutputUnchanged` |

`releaseManifestChecksum` is captured in the **same query** as the active-pointer read, so the two
can never describe different releases, and a corpus can be tied back to an exact corpus state without
consulting the database that produced it.

## 3. Primary category + secondary dimensions

A real mismatch usually has several dimensions at once. Forcing that into one enum throws away most
of what an operator needs, so every comparison carries **one primary category** (for counting) and
**ten independent boolean dimensions** (for filtering), both from the same function.

Proven by a stacked fixture: with integrity failure, citation difference, jurisdiction difference,
ordering difference and applicability uncertainty all true simultaneously, the primary category is
`INTEGRITY_FAILURE` **and every secondary dimension is still recorded**.

### Precedence, and why

| # | Category | Why it outranks what follows |
|---|---|---|
| 1 | `INTEGRITY_FAILURE` | corruption says the corpus cannot be trusted at all |
| 2 | `RESOLVER_FAILURE` | *"we do not know"* must never be filed as a content finding |
| 3 | `CITATION_DIFFERENCE` | a violation of **this system's** invariant, not a corpus property |
| 4 | `JURISDICTION_DIFFERENCE` | the most dangerous legal disagreement |
| 5 | `GRANULARITY_DIFFERENCE` | section/paragraph, before the generic "missing" |
| 6 | backing-derived | `GOVERNED_MISSING` · `GOVERNED_UNAPPROVED` · `GOVERNED_CITATION_ONLY` |
| 7 | content comparison | only reachable once backing is `APPROVED_EXACT` |
| 8 | `ORDERING_DIFFERENCE` | last — the weakest signal |

`APPLICABILITY_DIFFERENCE` is promoted only where it is the most informative thing to say: the corpus
fully backs the exact citation while HazLenz cannot establish that the rule applies. That is the cell
KG-3F built the 56.14132 predicate for, and the one where a reader is most likely to mistake a
verified-text badge for a statement about applicability.

**All 15 categories are proven reachable** by an input that produces each, and classification is
identical across five repeated calls for every one.

## 4. Severity (Phase 12)

| Severity | Categories | Reasoning |
|---|---|---|
| **BLOCKING** | `JURISDICTION_DIFFERENCE` · `CITATION_DIFFERENCE` · `INTEGRITY_FAILURE` · `CONTENT_DIFFERENCE` | each would put a materially wrong claim in front of a customer |
| **REVIEW** | `GRANULARITY_DIFFERENCE` · `GOVERNED_UNAPPROVED` · `GOVERNED_CITATION_ONLY` · `APPLICABILITY_DIFFERENCE` · `RESOLVER_FAILURE` | worth a look before widening a cutover; not disqualifying |
| **INFORMATIONAL** | `EXACT_MATCH` · `CONTENT_EQUIVALENT` · `GOVERNED_APPROVED_EXACT` · `GOVERNED_MISSING` · `ORDERING_DIFFERENCE` · `PROVENANCE_DIFFERENCE` | no cutover risk |

Two judgement calls, stated so they can be argued with:

* **A missing governed record is NOT blocking.** Under `GOVERNED_WITH_FALLBACK` the customer receives
  exactly today's legacy behaviour for that state. Calling it blocking would make the corpus
  unreadable and misdirect remediation — and it is a *governance backlog* item, not a defect.
* **Two different texts for one citation IS blocking.** One of them would be shown to a customer as
  verified regulation. That must be adjudicated before any cutover.

Severity is assigned **separately from category**, because "different" and "wrong" are not the same
claim, and conflating them is exactly the pressure that leads someone to weaken a predicate to make a
number go up.

## 5. Root cause (Phase 13)

`HAZLENZ_SELECTION` · `CORPUS_CONTENT` · `CITATION_GRANULARITY` · `GOVERNANCE_APPROVAL` ·
`SOURCE_PROVENANCE` · `APPLICABILITY_EVIDENCE` · `JURISDICTION` · `PRESENTATION_ONLY` ·
`RESOLVER_FAILURE` · `EXPECTED_FALLBACK` · `NONE`

`EXPECTED_FALLBACK` is deliberately first-class: the contract behaving as designed is an *outcome*,
not a defect. And an unreviewed record splits by provenance — `GOVERNANCE_APPROVAL` when the remedy is
review, `SOURCE_PROVENANCE` when the source key is a placeholder and the remedy is sourcing.

## 6. Content equivalence is conservative on purpose

`CONTENT_EQUIVALENT` normalises case, unicode quote/dash variants, whitespace and terminal
punctuation — and **nothing else**. It does not normalise `shall`/`must`, numerals, or any word that
could carry legal weight. Calling two differently-worded requirements equivalent is precisely the
error this programme exists to prevent.
