# KG-4E — Report / PDF SHADOW invariance closure

**Slice:** KG-4E · **Started and ended at** `5f050858227ca11cf90d2f6bf64148e70a018b64` ·
**Branch** `release/insite-rc-2026-08-18` · **Nothing committed, pushed or deployed.**

**Result:** `KG_4E_COMPLETE — TECHNICAL_GATES_COMPLETE_FOR_STAGE_1_PRODUCTION_SHADOW`

---

## What this slice was for

KG-4D closed four of the five customer-facing surfaces through the running product — API response,
persistence, reload and Standard Detail — and recorded honestly (CAVEAT-11) that the fifth was never
exercised: **the generated report and its PDF**. KG-4E is that surface and nothing else. No report
was redesigned, no cutover architecture was added, and **no production code was changed** — because
none needed to be.

---

## The headline

| Question | Answer | Evidence |
|---|---|---|
| Do LEGACY and SHADOW produce the same customer report? | **8/8 invariant** across three oracles | `phase3-report-invariance.json` |
| Does any SHADOW or governed vocabulary reach a page? | **0 hits, 38 forbidden patterns, 42 pages** | same |
| Can a governed field reach a page at all? | **No — structurally.** 33/33 reports byte-identical after poisoning with 38 governed/shadow/telemetry fields at every object depth | `npm run test:kg4e-report-field-exclusion` |
| Can mixed internal governed states flip the customer report? | **No.** 5 of 7 analyses saw mixed states; all recorded NULL provenance and delivered legacy text | `npm run test:kg4e-report-provenance` (32/32) |
| Do SHADOW failures affect report delivery? | **No.** Kill switch and a real resolver failure both produce 8/8 invariant reports | `phase7-failure-*.json` |
| Does the oracle actually work? | **Yes** — it fails 8/8 with 176 forbidden-term hits against a deliberately leaking control | `control-mutation-must-fail.json` |

---

## Phase 0 — baseline

`HEAD` = `5f050858…` (expected), branch `release/insite-rc-2026-08-18`, 4 stashes, 23 tags,
`kg-3e/unrelated-worktree-changes.sha256` **18/18 OK**. No `GOVERNED_CUTOVER_*` variable set in the
environment or in `backend/.env*`. No server was running at start.

Databases created and owned by this slice, both disposable, both marked:

| Database | Marker `owner_suite` | Purpose |
|---|---|---|
| `test_kg4e_report_20260821` | `kg-4e-report-invariance` | cloned from `test_kg4d_e2e_20260821`, then re-marked |
| `test_kg4e_stale_20260821` | `kg-4e-resolver-failure` | the failure-injection clone |

The KG-4D source database's own marker was re-read afterwards and is unchanged
(`test:kg4d-integration-e2e` / `own_1zvfixnctc3mt2yizlh`). `safescope`, `sentinel_dev` and
`sentinel_safety` were never connected to.

## Phase 1 — the report input trace

`kg-4e/contracts/report-input-trace.json` carries the full path and the consumed-field allowlist.

Two facts that matter, and they point in opposite directions:

* The **frozen report snapshot DOES carry governed state.** `snapshotInspection()` spreads the whole
  finding row and copies each analysis verbatim, so `knowledgeReleaseId` and the entire
  `resultSnapshot` are inside it, and `generate()` adds a `knowledgeProvenance` block. Confirmed
  present in **41/41** frozen snapshots. That is what makes the next fact meaningful rather than
  vacuous: the field is present and NULL, not missing.
* The **PDF renderer cannot print it.** `canonical-report-pdf-renderer.ts` projects a closed
  allowlist of fields and never spreads, serialises or enumerates the snapshot. There is no default
  path by which a *future* governed field reaches a page either.

**No production code was changed**, because no leakage risk was found to correct.

## Phase 2 — mirrored LEGACY / SHADOW cases

Eight observations spanning three regimes, run identically on both sides with the **same site row**,
the same inspection title, the same regulatory context, the same observation text, the same review
rationale, the same finding conclusion and the same corrective action with a literal due date. The
only thing left differing is the inspection's own identity.

Which mismatch category each case exercised was **read from the emitted telemetry**, never asserted
by the harness (`kg-4e/contracts/case-coverage.json`). All five required classes were covered:

| Required class | Cases | Comparisons |
|---|---|---|
| approved exact governed standard | FALL-01, GUARD-01, LOTO-01, ELEC-01, MULTI-01 | 5 |
| expected governed-missing fallback | FALL-01, GUARD-01, MSHA-01, ELEC-01 | 6 |
| granularity difference | MSHA-01, MULTI-01 | 6 |
| applicability difference | GUARD-01, MSHA-01, MULTI-01, SILICA-01 | 7 |
| multi-finding / mixed | GUARD-01 and MULTI-01 carry 2 findings each; 5 of 7 analyses saw mixed governed states | — |

24 v2 events, 24 distinct event keys, 0 duplicates, 0 BLOCKING, mean 0.667 ms per comparison,
`fallbackState` `LEGACY_TEXT_UNVERIFIED` on all 24. `CONTROL-01` — the affirmatively-controlled
observation — produced **no** comparisons, because it produces no citation, and still produced a
full report. It is the negative control and it is recorded as such rather than counted as coverage.

**56 PDFs were generated in total** through the real `CanonicalReportsService.generate()`, stored
through the real storage service and fetched back over the real authenticated download route:
`legacy-A`, `legacy-B`, `legacy-C`, `shadow-A`, `shadow-killswitch`, `shadow-resolverfail` and the
deliberately-wrong `mutation-control`, 8 each.

## Phase 3 — normalized report invariance

**Byte equality between two inspections is inappropriate and unnecessary** — an inspection carries
its own uuid and PDFKit stamps a timestamp and a random file id. So volatility was *derived*, using
KG-4B's methodology at the report level: two LEGACY reports from two identically-parameterised
inspections establish what differs between two runs of identical code.

The derived volatile set is **exactly one line position per report** — page 1, line 9, the cover's
`Record reference <8 hex>` — plus `/CreationDate`, `/ModDate` and `/ID` in the document metadata.
Nothing else. `kg-4e/contracts/report-volatility.json`.

**Non-circular control:** a third LEGACY run (`legacy-C`), which contributed nothing to the
derivation, compares **8/8 invariant** against `legacy-A`.

Three oracles, because one can be satisfied for the wrong reason:

1. **structural** — page count, per-page line counts, section headings and order, embedded fonts, page size, PDF version, Producer;
2. **positional** — line *i* of page *p* against line *i* of page *p*, volatile positions excluded;
3. **token multiset** — drawn from the non-volatile positions, so content that *moved* between pages is still caught.

Result **LEGACY vs SHADOW: 8/8 INVARIANT**. 42 pages, 636 extracted lines, 8 volatile positions,
628 lines and 2045 stable distinct tokens compared. Same fonts (`Helvetica`, `-Bold`, `-Oblique`),
same page size, same PDF version, same section headings in the same order.

## Phase 4 — PDF text / structure and forbidden terms

Extraction is poppler `pdftotext -layout` / `pdfinfo` / `pdffonts` — the content stream the
generator actually wrote. **No OCR was used or needed.**

**38 forbidden patterns**, asserted over every extracted line of every page: the bare word `SHADOW`,
`governedDeliveryState`, `governedFallbackReason`, `governedTextUnavailable`, the bare word
`governed`, `knowledgeReleaseId`, a `federal-core-*` release literal, `manifestChecksum`,
`approvalDigest`, `correlationId`, `eventKey`, `findingKey`, `mismatch`, `BLOCKING`, every mismatch
category name, every backing-state name, every delivery-state name, every governed mode name, the
`GOVERNED_CUTOVER_` env prefix, `STAGE_n_*`, `circuit breaker`, `kill switch`, `privacy canary`,
`telemetry`, `allowlist`, `cutover`.

**0 hits across all 42 SHADOW pages, and 0 across the LEGACY side.**

`SHADOW` is matched as a bare word rather than a substring on purpose: a test that cannot tell
`shadow` from `overshadowed` gets disabled the first time it fires on ordinary prose.

## Phase 5 — visual review

Every page of three representative reports was rendered at 100 dpi and compared, then looked at.

**13 of 16 page images are pixel-identical between LEGACY and SHADOW.** The three that differ are
all page 1, and the difference is the eight-character record reference — confirmed by reading both
covers side by side.

Inspected directly: covers, executive summary, detailed findings for a single-finding report, a
two-finding decomposed report, and the MSHA report. No clipping, no overlap, no accidental blank
page (the minimum non-empty line count on any page is 6), unchanged citation presentation, unchanged
confidence and applicability wording, unchanged risk presentation, identical running header and
footer, and no internal terminology anywhere.

The `GOVERNED_MISSING` case (`30 CFR 56.9100`, `NOT_IN_RELEASE`) shows the citation with HazLenz
text and no caution — the KG-4A fallback decision, unchanged. The mixed case shows
`29 CFR 1910.212(a)(1)` — internally `APPROVED_EXACT` — with **legacy** text, no verified badge and
no provenance, which is the SHADOW obligation working.

## Phase 6 — mixed provenance

`npm run test:kg4e-report-provenance` → **32 passed, 0 failed.**

* 0 of **45** persisted analyses and 0 of **59** persisted findings carry a governed release id.
* 41/41 frozen report snapshots carry the provenance column, carry a `knowledgeProvenance` block,
  and name **zero** knowledge releases.
* **5 of 7** analyses produced genuinely mixed internal governed states —
  `APPROVED_EXACT+NOT_IN_RELEASE`, and for MSHA-01 and MULTI-01
  `APPROVED_EXACT+APPROVED_SECTION_ONLY(+NOT_IN_RELEASE)`. Every one recorded NULL customer
  provenance, left customer output invariant, substituted no citation, and **still delivered legacy
  text for every citation**.
* The shadow saw `APPROVED_EXACT` governed content **12 times**, and not one produced
  `GOVERNED_VERIFIED_TEXT` delivery. The absence of governed text in the report is a refusal, not an
  empty corpus.

## Phase 7 — failure cases

Two SHADOW-only failures, both through the real request path, both followed by real report
generation:

| Injection | What the shadow did | The report |
|---|---|---|
| `GOVERNED_CUTOVER_KILL_SWITCH=engaged` | 0 v2 events emitted; shadow never ran | **8/8 invariant, 0 forbidden terms** |
| governed record table made unreadable to the resolver only | 24/24 `INTEGRITY_FAILURE`, `BLOCKING`, `RESOLVER_UNAVAILABLE`, `STALE_SCHEMA` | **8/8 invariant, 0 forbidden terms** |

All HARD provenance assertions also hold on the failure database: 0 of 53 analyses and 0 of 69
findings stamped, 49/49 frozen snapshots naming no release.

**A negative result worth recording.** The first resolver injection — dropping the four
approval-contract columns from `regulatory_release_records` — did **not** fail the resolver.
`resolveGovernedCitation()` never selects those columns; it reads `payload`, `recordChecksum` and the
effective review state. `resolverHealth` stayed `OK` on all 24 comparisons. The blueprint's
"migration 1800000014000 absent → `STALE_SCHEMA`" is about the migration being absent in full, not
about those four columns being read on this path. A genuine failure required making the record table
itself unreadable. Reported as measured rather than as intended.

## Phase 8 — regression

| Suite | Result |
|---|---|
| `test:kg4d-orchestration` | 151/151 |
| `test:kg4d-default-off` | 119/119 |
| `test:kg4d-integration-e2e` (real HTTP, real rows, non-eligible B account) | 42/42 |
| `test:kg4a-cutover-contract` | 146/146 |
| `test:kg4a-provenance-pinning` | 53/53 |
| `test:kg4a-default-off` | 51/51 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg4b-default-off` (against the KG-4E default-off server) | 48/48 |
| `test:kg4c-production-shadow-contract` | 438/438 |
| `test:kg4c-disabled-deployment` | 80/80 |
| `test:kg4c-db-ownership` | 31/31 |
| `test:kg4b-privacy-review` (KG-4B corpus, unchanged) | 26/26 |
| `test:kg4e-telemetry-privacy-v2` — the v2 runtime guard over the 48 REAL KG-4E events | 48/48 safe, 35 fields, 0 outside the allowlist, 12 canary patterns |
| `npm run build` | exit 0 |
| `(cd frontend-next && npx tsc --noEmit)` | exit 0 |
| `test:kg4e-report-field-exclusion` | 9/9 |
| `test:kg4e-report-provenance` | 32/32 |

**`test:kg4b-privacy-review` reports 2 failures when pointed at KG-4E's telemetry, and that is a
schema-version mismatch, not a privacy result.** It classifies the 29 v1 fields and cannot classify
the six KG-4C added (`stage`, `eligibilitySource`, `outputInvarianceVerdict`, `outputInvarianceHash`,
`outputInvarianceDifferingPaths`, `shadowProvenanceNull`). Every substantive assertion in it passed —
no customer content, no email-shaped string, no token, no regulatory body text, no field over 200
characters, all 36 digests 32-hex. The authority for v2 is the runtime guard the write path itself
uses, run above over all 48 real events: **48/48 safe, 0 fields outside the allowlist.** The v1 suite
was left as written, per the "do not edit prior evidence" rule.

**The browser suite was not re-run, and that is a reasoned assessment rather than a claim of
coverage.** KG-4E changed no production code at all — no display code, no payload, no persistence,
no report code — so the KG-4D browser pass (128/128, four themes) has identical inputs. The report
surface itself was closed by better means than a browser could give: the actual PDF bytes the server
serves were fetched over the real authenticated download route and inspected page by page. The
app-side report UI reads only `metadata()`, which carries no snapshot. KG-4C's precedent for skipping
a browser pass was criticised in KG4D-DISC-01 because its modules were *about* to be integrated;
here nothing was integrated because nothing was written.

---

## Discoveries

### KG4E-DISC-01 — a volatility set of literal VALUES cannot generalise

The token-set oracle's first version derived volatility as the set of token *values* that differed
between the two LEGACY probes — `{E45BD25A, 8D498838}` for the record reference. The SHADOW run
necessarily carries a *third* value (`0122BDE6`), which is in neither set, so all eight cases
reported a difference for a field the oracle had already recognised as volatile. The positional
oracle was right throughout and reported zero differences. Fixed by drawing the token bag from
non-volatile *positions*. **Volatility must be derived as a position or a role, never as a value.**

### KG4E-DISC-02 — the shadow taxonomy and the risk model share the word "severity"

The field-exclusion suite's first poison set stamped `severity: 'BLOCKING'` onto every object, and
`riskSnapshot.operationalRisk.severity` is a field the report legitimately **prints**. The suite
failed on a collision of vocabulary rather than on a governance leak. The obvious "fix" would have
been to widen the normalisation until it stopped noticing — which would also have stopped it
noticing real changes. The shadow-specific spellings are poisoned instead and the risk model keeps
its own word.

### KG4E-DISC-03 — `GET /inspection-reports` returns the entire frozen snapshot

The list endpoint uses `leftJoinAndSelect('report.versions')` and returns raw
`InspectionReportVersion` entities, so every caller receives every version's full `sourceSnapshot` —
**3.4 MB for 41 versions** in this verification database. `GET /inspection-reports/:id` does not: it
maps through `metadata()`.

This is **pre-existing and mode-independent**: the LEGACY and SHADOW servers return the same shape,
`canonical-reports.service.ts` was last touched 2026-08-19 — before any KG-4x cutover work — and
under SHADOW every `knowledgeReleaseId` in it is `null` (94 occurrences, one distinct value). It is
therefore **not a shadow leak and not a KG-4E blocker**, and no production code was changed for it.
It is recorded as an `OPEN_ITEM`: under a future *governed delivery* mode this endpoint would carry
real release ids and full governed state to every list caller, and it is a payload-size problem
today regardless.

### KG4E-DISC-04 — the exclusion was demonstrated by accident before it was demonstrated by design

KG-4E's own harness wrote `kg4e-shadow-A-<case>` into `traceId` and `idempotencyKey`. Those strings
sit inside 8/8 SHADOW frozen report snapshots. The word `shadow` appears **0 times** in all 8
corresponding PDFs. A natural canary, not a designed one, and stronger for it.

---

## What did NOT change

No production code. No commit, no push, no deploy, no tag, no stash, no migration against any
protected database. `GOVERNED_CUTOVER_MODE` remains unset in every production environment and
`GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` has still never been set anywhere.

Added: five verification scripts under `backend/scripts/` and five `npm` script entries.

---

## Remaining human / operational prerequisites for Stage 1

Unchanged by KG-4E, and all three are decisions rather than engineering:

1. Confirm the platform log pipeline collects and **retains** `kg4c.shadow-comparison.v2` events.
2. Name the single internal Stage-1 account — never an ordinary customer.
3. Set the four locks in one deliberate change, per `kg-4c/PRODUCTION_SHADOW_RUNBOOK.md`.

KG-4E adds no fourth prerequisite. The operator-triggered instant kill switch, the 137
declared-but-unemitted citations and KG4E-DISC-03 remain open items and none of them gates Stage 1.
