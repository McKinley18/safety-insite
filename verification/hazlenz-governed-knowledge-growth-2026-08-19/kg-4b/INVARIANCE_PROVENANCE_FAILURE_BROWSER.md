# KG-4B — provenance, pinning, spoofing, failure injection, browser (Phases 6, 7, 8, 16, 18)

`npm run test:kg4b-shadow-adversarial` — **84/84**, on an owned disposable database.
Browser: **576/576**, real Chromium, four themes.

## Phase 6 — SHADOW never writes governed customer provenance

A deliberately mixed analysis (approved-exact + missing record + section-only paragraph) in SHADOW:

| Property | Result |
|---|---|
| `governedBackingInput` for any citation | **null**, including the approved one |
| `verifiedText` for any citation | **null** |
| `customerVisible` on any decision | **false** — the payload gains no key |
| `governedProvenanceEligible` on any decision | **false**, even where backing is `APPROVED_EXACT` |
| analysis `knowledgeReleaseId` | **NULL**, despite a pinned release and approved content |
| every finding `knowledgeReleaseId` | **NULL** |
| shadow comparison records still produced | **3** — telemetry is unaffected |

**Not vacuous:** the *same* analysis in `GOVERNED_WITH_FALLBACK` **does** record the release and is
correctly flagged `mixed`. And a non-SHADOW mode produces **zero** shadow comparison records.

**Confirmed through the real persistence path.** Both browser fixtures — one SHADOW account, one
legacy — persisted an analysis with `knowledgeReleaseId: null`, with identical citations.

## Phase 7 — one analysis, one pinned release

**Activation race.** A second release is created inside the owned clone specifically so the race is
not vacuous (the first run raced against `undefined` and passed for the wrong reason).

```
analysis pins R1 → resolves against R1
  ↓ pointer verified moved to R2 mid-analysis
analysis STILL resolves R1, same backing
every shadow comparison in that analysis names ONE release and ONE manifest
a LATER independent analysis correctly shadows against R2
```

**Approval race — and a corrected assertion.** A revocation landing mid-analysis does **not** change
that analysis: the context memoises per citation, so one analysis resolves a given citation exactly
once. That is a **stronger** property than "the approval is re-read each time", and it is what Phase 7
requires — a coherent comparison basis, with no half-old/half-new corpus. The first version of the
suite asserted the weaker (and false) behaviour; the code was right and the test was corrected.

The boundary is the **analysis**, not a stale cache: the *next* analysis sees the revocation
immediately and carries no text forward.

## Phase 8 — no client input can manufacture governed provenance

Ten attacks, all through `resolveKnowledgeReleaseId(snapshot, principal)`:

| Attack | Result |
|---|---|
| LEGACY + arbitrary release id | **NULL** |
| LEGACY + the REAL active release id | **NULL** |
| SHADOW + the real active release id | **NULL** |
| SHADOW + arbitrary release id | **NULL** |
| governed + NON-allowlisted principal | **NULL** |
| governed + allowlisted + wrong release id | **NULL** |
| governed + allowlisted + stale release id | **NULL** |
| governed + allowlisted + nonexistent release id | **NULL** |
| governed + allowlisted + another environment's release id (`kg3b-matrix.A`) | **NULL** |
| governed + allowlisted + two conflicting release ids | **NULL** |

**Not vacuous:** an allowlisted governed principal claiming the genuinely active release **does**
record it — the gate is not simply "always null".

Through the HTTP API, `body.governedMode`, `body.cutoverMode`, `body.mode`, `body.forceGoverned` and
`body.knowledgeReleaseId` are all **rejected by request validation (400)**.

## Phase 16 — failure injection

Every injection runs in SHADOW against the owned clone:

| Injection | backing | health | telemetry | customer |
|---|---|---|---|---|
| no active release | `NO_ACTIVE_RELEASE` | `NO_ACTIVE_RELEASE` | `RESOLVER_FAILURE` | **legacy** |
| stale schema (migration `1800000014000` absent) | `RESOLVER_UNAVAILABLE` | **`STALE_SCHEMA`** | **`INTEGRITY_FAILURE`** | **legacy** |
| malformed governed record (payload emptied) | `APPROVED_NO_TEXT` | `OK` | `GOVERNED_CITATION_ONLY` | **legacy** |
| revoked approval | `UNAPPROVED_RECORD` | `OK` | `GOVERNED_UNAPPROVED` | **legacy** |
| resolver DB error / no data source | `RESOLVER_UNAVAILABLE` | `QUERY_FAILED` | `RESOLVER_FAILURE` | **legacy** |
| activation change mid-analysis | pinned release unchanged | `OK` | one release per analysis | **legacy** |

For every one: **SHADOW did not throw** — an expected resolver failure is never a customer 500 —
exactly one comparison record was emitted, the record still asserts `customerOutputUnchanged`, and
`GOVERNED_WITH_FALLBACK` has a defined delivery state that keeps the citation.

A failed resolution supplies **no** governed backing input, so it cannot be laundered into an approval.

## Phase 18 — browser invariance

**576/576**, light · dark · mobile · mobile-dark, two accounts, on a server genuinely running SHADOW.
Screenshots: `browser/{shadow,legacy}-{light,dark,mobile,mobile-dark}.png`.

| Property | Result |
|---|---|
| same number of standard cards | ✔ all 4 themes |
| identical citations, identical order | ✔ |
| identical applicability confidence labels | ✔ |
| **neither** account shows a verified-text badge | ✔ — SHADOW grants nothing |
| identical badge / notice / caveat / summary-label state | ✔ |
| **the whole Standard Detail structure byte-identical between accounts** | ✔ |
| cards identical after a **reload** (persistence → rehydration) | ✔ both accounts, all themes |
| **32 forbidden internal terms** absent, before and after reload | ✔ |

The forbidden list includes the bare word **`SHADOW`** and `mismatch`, `correlationId`, `eventKey`,
`BLOCKING` — so a well-meaning "shadow mode active" badge would fail this pass rather than ship. It
did fire once, on a fixture named `KG-4B browser …SHADOW`; the check was right and the fixture was
renamed.
