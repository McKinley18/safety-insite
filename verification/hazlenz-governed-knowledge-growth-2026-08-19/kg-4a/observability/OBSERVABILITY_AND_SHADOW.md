# KG-4A — observability and the server-side shadow contract (Phases 11, 12)

Live samples: **`governed-resolution-events.jsonl`** (captured from the governed E2E server).

## 1. What is recorded

`governed_resolution`, one per citation per analysis:

`mode` · `configuredMode` · `enablementReason` · `releaseId` · `requestedCitation` ·
`resolvedCitation` · `granularity` · `applicability` · `backing` · `deliveryState` ·
`fallbackReason` · `failureClass` · `resolverHealth` · `resolverSucceeded` ·
`governedProvenanceEligible` · `analysisTraceId` · `durationMs`

Example (real, from the E2E run):

```json
{"event":"governed_resolution","mode":"GOVERNED_WITH_FALLBACK","enablementReason":"ACCOUNT_ALLOWLISTED",
 "releaseId":"federal-core-2026-07-30.1","requestedCitation":"30 CFR 56.14132(a)",
 "resolvedCitation":"30 CFR 56.14132(a)","granularity":"SECTION_ONLY","applicability":"UNCERTAIN",
 "backing":"APPROVED_SECTION_ONLY","deliveryState":"LEGACY_TEXT_UNVERIFIED",
 "fallbackReason":"GOVERNED_SECTION_ONLY_NOT_PARAGRAPH","failureClass":"EXPECTED_FALLBACK",
 "resolverHealth":"OK","resolverSucceeded":true,"governedProvenanceEligible":false,"durationMs":1}
```

**That single line explains a governed/fallback decision completely** — which is the Phase 11
requirement.

## 2. Privacy

`assertNoSensitiveFields()` runs before every emission and **throws** on: a denylisted key
(`observation`, `standardText`, `plainLanguageSummary`, `summary`, `email`, `token`, `secret`,
`reportContent`, `evidenceFacts`, …), anything matching an email address, or any string over 200
characters. Citations, release ids, state names and digests are all far below that ceiling, so the
check is free in the normal case and catches the mistake that matters.

The guard is allowed to throw **inside** the emit try/catch: a developer adding a sensitive field sees
it fail in tests, while a customer request can never fail because of a logging bug.

**Observability is silent unless `GOVERNED_CUTOVER_OBSERVABILITY=enabled`** — a mechanism that is off
must be silent, or "default off" is not observable as off.

## 3. Shadow comparison (Phase 12)

`SHADOW` executes governed resolution, records a comparison, and returns **nothing consumable**:
`governedBackingInput` and `verifiedText` are hard-coded `null` for that mode, so a shadow run cannot
alter customer output even if a future caller forgets which mode it is in. This is why
`customerOutputUnchanged: true` on the event is a structural fact rather than a hope.

Mismatch categories: `EXACT_MATCH` · `GOVERNED_APPROVED_EQUIVALENT` · `CITATION_DIFFERENCE` ·
`GRANULARITY_DIFFERENCE` · `CONTENT_DIFFERENCE` · `MISSING_GOVERNED_RECORD` ·
`UNAPPROVED_GOVERNED_RECORD` · `APPLICABILITY_DISAGREEMENT` · `RESOLVER_FAILURE`.

Order is load-bearing: resolver failure is checked first (a failed resolution says nothing about
content), then the citation invariant (a violation is a defect in *this* system, not a corpus
property, and must never be filed under a content category where it would read as backlog).

Text is compared **by sha256 digest**; the bodies are never logged — asserted by checking the emitted
event does not contain the legacy text.

Shadow mismatch diagnostics are never sent to customers: a mismatch is a statement about the
governance backlog, not about the finding.
