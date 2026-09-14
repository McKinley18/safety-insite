# §285 — Batch 4: inspection completion and reports

**Zero provider calls** — `EXPERT_EXECUTION_ENABLED=false`, `ANTHROPIC_API_KEY` deleted from the
child environment, synthetic HazLenz states only.
**Zero production contact of any kind.** No deployment, migration, write, configuration change or
read.

| | |
|---|---|
| HEAD reviewed | `0f36d49729c914c0c50a7e9118f3663877d057ef` |
| frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` — unchanged, not promoted |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — re-verified, 0 failures |
| disposable database | `test_insite_review_1789390933027_6013`, run `5740b8c4-…` — created, used, dropped |
| disposable object storage | `…/T/insite-review-storage-5740b8c4-…` — created, used, removed |
| Free account | `review-285@example.test` |
| **entitled** account | `review-285-pro@example.test` — billing tier `free`, active Pro grant |
| frontend | production `next build` + `next start`, `NEXT_PUBLIC_FRONTEND_VERSION=1.0.0`, `DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |

**Entitlement state is recorded in every evidence file**, per §285 instrument discipline. It
matters here more than anywhere so far: **report generation is Pro-only**, so the entire report half
of Batch 4 is unreachable on the tier most accounts start on.

---

## A. Active route inventory

`measure:281-route-reachability`, re-run before any route was treated as active.

**20 routes on disk · 20 source-reachable · 9 `ACTIVE_REACHABLE` · 11 `ACTIVE_DEEP_LINK` · ZERO
orphans.** Batch 4's surfaces are `/inspection-complete` and `/reports`, both `ACTIVE_DEEP_LINK`.

**There is no third report surface.** No `/reports/[id]` route exists; the library downloads the
PDF directly. The customer-reachable report surfaces are those two plus the PDF artifact itself.

---

## B. The completion policy, as the server actually enforces it

Measured on every seeded shape (`results/completion-readiness.json`). An inspection may become
`completed` only when **all** of:

1. it is `in_review` — `in_review → completed` is the only permitted edge;
2. **at least one observation** exists (`NO_OBSERVATION`);
3. **at least one active finding** exists (`NO_CURRENT_FINDING`);
4. **every** active finding is `finalized` or `dismissed`, carries a `finalReviewId`, and that
   review's status is `current` — a review invalidated by re-analysis does not count
   (`FINDING_NEEDS_REVIEW`);
5. the optimistic `version` matches;
6. reopening (`completed → draft`) requires ownership or manager access.

| case | result |
|---|---|
| normal completion | **completes**, stamps `completedAt` |
| incomplete (no observation) | refused — `NO_OBSERVATION` |
| observations but no finding | refused — `NO_CURRENT_FINDING` |
| unresolved HazLenz (state C) | **completable** |
| pending human confirmation (state D) | **completable** |
| multiple findings (state E) | **completable**, 3 findings, 3 reviewed, 3 reportable |
| confidence-limited (state F) | **completable** |
| no findings / safe-negated (state G) | **refused** |
| duplicate completion attempt | **refused, 409** — the version guard catches the replay, and the record is undamaged |

### PRODUCT QUESTION 1 — a safe inspection cannot be closed

**HazLenz state G identified no hazard, so the inspection has zero findings and completion is
refused.** An inspector who walks an area and finds nothing has no way to close the record. The
only routes to a closed record are to find something or to leave it open.

This is a completion-policy decision and §285 forbids inventing one, so **nothing was changed**. It
is raised because the incentive it creates — record a finding you do not believe in, or leave the
record open — is the wrong one for a safety product, and because "we inspected and it was sound" is
a result a client may need to be given.

---

## C. Objective defects found and repaired

### D-047 — the refusal told the inspector to do something that cannot help *(repaired)*

`evaluateCompletionReadiness` produced **three** `reasons` and **two** message branches. An
inspection with observations but no findings was told:

> *"Every current finding requires a completed human review before finalization."*

False, and unactionable: there are no findings, and reviewing nothing will never satisfy it.
Measured coming back verbatim for `NO_CURRENT_FINDING`. Repaired to derive the message from the
first blocking reason, in the order an inspector would act. The machine-readable `reasons` array is
unchanged. Asserted at C6/C7 against both the transition route and the readiness route the Finish
screen reads.

### D-048 — the report printed an internal identifier as the record's name *(repaired)*

The PDF cover printed **`Record reference 438D5D3C`** — the first eight characters of the
inspection's uuid, uppercased — on the one artifact that leaves the product and gets filed with a
client or a regulator. It also contradicted the identity rule the completion screen already states:
the record is **"Inspection #7"**, and the checksum is integrity metadata rather than a name.

`displayNumber` was absent from the report snapshot, so the renderer had nothing else to print.
Repaired: the snapshot now carries it and the cover prints `Inspection #3`. **The uuid fallback is
kept** for records created before numbering existed.

*Note for the product owner:* adding a field to the snapshot changes `sourceFingerprint`, so the
next generation of an existing report will legitimately produce one new revision. That is correct —
the report content did change — and it is one-time.

---

## D. Report authority and provenance — the high-priority dimension

### The snapshot can express every provenance class §285 names

Each finding in the report snapshot carries: `source` (`hazlenz_decomposition` | `user_authored`),
`status`, `finalReviewId` **and the embedded `finalReview`**, `reviewerDisposition`,
`originatingAnalysisId`, `selectedAnalysisId`, `knowledgeReleaseId`, and its own `riskSnapshot`.
Findings are nested **under their observation**, which is the right shape.

| assertion | result |
|---|---|
| every reported finding declares its source | **PASS** |
| no `superseded` or `dismissed` finding reaches the report | **PASS** |
| every reported finding carries the review that finalized it | **PASS** |
| the review itself travels with the finding, so the report can say *who* | **PASS** |
| a HazLenz-derived finding names the analysis it came from | **PASS** |
| reviewer disposition is carried separately from HazLenz's conclusion | **PASS** |

### And the PDF does not overstate what it knows

This is the strongest result in the section. On a finding with no established risk rating and no
established standard, the generated report says:

- Risk: **"Not rated"** — it does not invent a severity
- Standard: **"Not established for this specific finding."** — it does not borrow one
- Executive summary: *"1 finding does not yet carry an established risk rating and should be rated
  by a qualified person before closure."*
- Review line: **"QUALIFIED-PERSON REVIEW — Accepted"** with the reviewer's own rationale, kept
  distinct from anything HazLenz said
- Basis: *"HazLenz AI output is advisory and requires qualified human review; this report reflects
  findings as reviewed at the time of generation."*

**A HazLenz-only conclusion is not presented as reviewer-confirmed, an unresolved fact is not
presented as resolved, and a missing rating is stated rather than filled in.**

### A structural gap worth recording

**The report snapshot is not reachable through any customer API.** `GET /inspection-reports/:id`
returns generation metadata and `.../revisions` returns the ledger; neither carries
`sourceSnapshot`. The provenance above is genuinely recorded, and genuinely unreadable except
through the PDF or the database.

---

## E. Severity and risk — **NOT_EXERCISED**, and why

Every seeded finding has **`riskSnapshot = NULL`**. `computeFindingRisk` runs on the real HazLenz
materialization path, and the synthetic fixtures persist findings without entering it.

So the §276/§277 single-effective-severity rule, and its parity across the workspace, the finding
review, the report record and the PDF, **was not exercised by this run**. Recording it as a pass
would be vacuous; recording it as a failure would convert a fixture hole into a severity verdict.

**A fixture that populates `riskSnapshot` is a prerequisite for that dimension** and is the first
thing the next section needs. What §285 *can* say is the thing above: with no rating present, the
report says "Not rated" rather than inventing one.

---

## F. Multiple findings — separation holds

State E, three independent findings from one observation:

| | |
|---|---|
| distinct findings in the report | **3 of 3**, distinct ids |
| own hazard category each | Egress · Powered industrial trucks · Energy control |
| standards cross-contamination | **none** — `1910.37(a)(3)` / `1910.178(m)(5)(i)` / `1910.147(c)(4)`, no two alike |
| bound to its own observation | **yes** |
| severity bleed | **NOT_EXERCISED** — no finding carries a risk snapshot (see E) |

---

## G. Report revision and immutability — D-028 reverified

Reopen → change a material value → complete again → regenerate:

| | |
|---|---|
| the issued revision is **retained** — a successor was ADDED, not substituted | **PASS** |
| revision 1 marked `superseded` | **PASS** |
| revision 1 linked to its successor | **PASS** |
| revision 1's recorded checksum unchanged | **PASS** |
| revision 1 **still downloadable** after the successor exists | **PASS (200)** |
| **and byte-identical** to what was issued | **PASS** — same sha256, same byte length |
| the successor is a genuinely different artifact | **PASS** |
| the successor's bytes hash to its own recorded checksum | **PASS** |
| exactly one revision is `isCurrent` | **PASS** |
| regenerating with nothing changed manufactures no revision | **PASS** |

**The server half of D-028 is sound.** Nothing is regenerated in place.

### D-046 — the customer cannot reach any of it *(objective, NOT repaired)*

The server exposes `GET /inspection-reports/:id/revisions` and
`GET /inspection-reports/:id/versions/:version/download`. **The client calls neither.** It uses only
the list and the current-version download.

So, from the customer's side, of D-028's five requirements: retained **yes**, byte-identical
**yes**, downloadable **no**, marked superseded **no**, linked to successor **no**.

`/reports` states this as product intent — *"Every completed inspection has one report. Finishing an
inspection again replaces its report."* — which is **not what the server does**. An inspector who
filed revision 1 with a client cannot see that it exists, cannot tell which revision they filed, and
cannot retrieve it.

**Not repaired here.** Surfacing revision history is a product-design decision — what a customer
should see, how a superseded report is labelled, whether the copy that denies versions exist should
change — and §285 authorises objective repairs, not product redesign. **It is the principal
product-owner decision from this section.**

---

## H. Browser review — 16 visits, 2 surfaces × 2 themes × 4 widths

`results/batch4-measurements.json`, 390 / 768 / 1280 / 1440, light and dark.

**Zero objective defects.** Zero console errors, zero HTTP 4xx/5xx, zero transport failures, zero
uncaught page errors, no horizontal overflow, no unnamed controls, no raw uuids on a customer
surface, no developer vocabulary, no retired brand, correct page titles, exactly one `h1` and one
`main` per surface.

### Instrument discipline applied (§285)

Four classes recorded **separately** and never conflated — `consoleErrors`, `httpErrors` (status
≥ 400, from the `response` event: the class §279–§281 could not see at all), `requestFailures`
(transport only), `navigationAborts` (harness-caused), `pageErrors`. Account entitlement state
recorded in the file.

---

## I. Offline inventory (D-037 continued) — measured, not built

Against a production build with a **controlling service worker**; the instrument refuses to run
without one.

| surface | OFFLINE | DATA_LOSS_RISK |
|---|---|---|
| `/inspection-complete` | **REQUIRES_NETWORK** | **NONE_KNOWN** |
| `/reports` | **REQUIRES_NETWORK** | **NONE_KNOWN** |

`DATA_LOSS_RISK` is `NONE_KNOWN` because neither surface accepts input — one reads a finished
record, the other is a library. That is a statement about **these two surfaces**, not about the
workflow that precedes them.

`/inspection-complete` refuses honestly: *"NO CONNECTION · This page needs a connection · Safety
InSite could not reach the network, and this screen was not saved on this device. Field Capture
still works."*

### The six questions

| question | answer |
|---|---|
| Can an inspection be completed offline? | **No.** `/inspections` is unreachable; completion is a server transition. |
| Can a report be generated offline? | **No.** Generation is a server operation. |
| Can an already-generated report be viewed offline? | **No.** The download is a live API fetch, not a cached asset. |
| What happens if connectivity disappears during completion? | The transition never reaches the server. **No partial completion state was observed**, and `completedAt` is stamped server-side inside the transition. |
| What happens if connectivity disappears during report generation? | **NOT_EXERCISED** — see below. |
| Can any failure create duplicate completion or report state? | **Not on the paths exercised.** Duplicate completion is refused by the version guard (409); duplicate generation with an unchanged fingerprint is replayed to the existing revision rather than creating one. |

**The interruption case is NOT_EXERCISED and is reported as such.** The abort raced a fast local
server and lost: the generate request completed (201) before the abort fired, so no interruption
occurred. The revision count moved because the generation **succeeded** — which evidences nothing
about a dropped connection. Measuring it properly needs the connection cut at the transport, and
that belongs with **D-042**.

Recovery on reconnect: `/reports` returns to normal without a manual reload.

---

## J. Field / app-format findings — for the Pre-Production App-Format gate

**`/reports`' two primary actions are the smallest controls on the page.** "Download PDF" is
109×36 and "View inspection" is 114×36, at **every** width including 390. Every other control on
that page — navigation, avatar — is 44×44.

This is **not a defect against this product's own standard**: §73.3 set the mobile touch floor at
36px and `AppButton`'s `sm` meets it. It is below the **44px** iOS Human Interface Guidelines
minimum (and WCAG 2.5.5 AAA), which is the lens a future installed or wrapped app would be judged
against. Recorded as `BELOW_NATIVE_TOUCH_GUIDELINE_44`, **not** repaired — raising a shared button
size across the product is not a bounded repair, and the floor was set deliberately.

Other app-format observations:

- **Report access is a direct authenticated GET returning a PDF stream.** In a native wrapper this
  is a download-and-hand-off, not an in-app view; there is no in-app PDF surface today.
- **No sharing or export affordance** beyond the download.
- **"Download PDF" shows a `Downloading…` label while in flight** — real feedback, and the control
  is disabled during it, so an accidental repeat cannot double-fire.
- **Generation is long-running with no progress surface**; the interrupted case is undefined
  (see I).

---

## K. Report content and legal — recorded, nothing written

Present and correct: Safety InSite branding, running header, site, inspection title, inspection
date, inspector, findings-documented count, report-generated date, record reference (now the record
number), executive summary, risk distribution, inspection record panel, findings summary table,
detailed findings with observation / standard / qualified-person review, ruled "Assigned To" and
"NOTES" field-use areas (deliberate, for handwriting — not blank-value defects), page numbers
(`Page 1 of 3`), and a **basis-and-limitations** footer naming the regulatory context and the
advisory status of HazLenz output.

**No new legal language was written**, per direction. For the Pre-Production Legal gate:

1. There is **no report revision number or superseded marking on the artifact itself** — a filed PDF
   cannot be told apart from its successor by reading it. This is D-046's consequence on the
   document rather than the screen.
2. The disclaimer is a single sentence inside "Basis and limitations"; whether that placement and
   weight are sufficient for a document filed with a regulator is a legal question, not an
   engineering one.
3. No confidentiality, distribution or retention statement appears on the report.

---

## L. Gates executed

| gate | result |
|---|---|
| `measure:281-route-reachability` | **20 routes, 0 orphans** |
| `validate-285-completion-and-report` (new) | **PASS — 47 checks, 4 recorded observations** |
| `validate:285-dashboard-kpis` (new) | **PASS — 18/18**, including three falsifications |
| `review-285-completion-report-batch` (new) | 16 visits, **0 objective**, 8 app-format |
| `measure-285-completion-report-offline` (new) | inventory recorded; interruption NOT_EXERCISED |
| `frontend-next: npx tsc --noEmit` | **PASS** |
| `frontend-next: npm run build` | **PASS** |
| `validate:279-update-delivery` | **PASS — 26/26** |
| `validate:280-workspace-draft-persistence` | **PASS — 11/11** |
| `validate:281-offline-data-state` | **PASS — 12/12** |
| `check:page-titles` · `check:orange-semantics` · `check:expert-authority-boundary` | **PASS** |
| `test:expert-presentation` · `test:expert-api-failure-mapping` · `test:expert-entitlement-presentation` | **PASS** |
| `backend: npm run build` | **PASS** |
| `backend: test:284-entitlement-denial-audit` | **PASS** |
| `backend: verify:274-successor-identity` | **PASS** — 22 elements, 0 failures |
| `backend: hazlenz:verify` | **PASS** — 29/29 protected modules, 0 accepted-evidence drift |
| `backend: brand:audit` | **PASS** |

---

## M. Instrument defects found

- **I-12. The review stack could not reach the report half of the product at all.** It configured no
  object storage, so `StorageService` fell through to S3 and report generation answered
  `500 STORAGE_S3_BUCKET is required`. This is why `hazlenz:verify` has reported report generation
  `ENVIRONMENTALLY_BLOCKED` since §283, and it meant no page-review batch could ever exercise a
  generated report, a checksum or a revision. **Repaired**: the stack now creates a run-scoped
  `local_test` storage root and removes it with the database.
- **I-13. Route globs matched the application's own pages.** `**/inspections` in the KPI gate
  intercepted document navigation and Next.js prefetches as well as the API call, which presented as
  the product failing to sign in. Scoped to the API origin.
- **I-14. Absolute revision counts assumed a fresh database.** Replaced with deltas, so the
  instrument is rerunnable against a live stack.
- **I-15. `.every()` on an empty array passes.** Four multi-finding assertions passed vacuously
  against a snapshot traversed with the wrong key. Non-vacuity guards added.
- **I-16. A whole-page assertion asserted more than the decision claimed** — carried over from §284
  and avoided here by scoping to the surface under review.

---

## N. Left open

**D-042** — not implemented, per direction; the interruption case above is its first concrete
requirement.
**D-043** — preserved, not migrated: `project-docs/current/D-043-ANNOTATION-DESIGN-PRESERVATION.md`.
**D-046** — raised, not repaired. Product-owner decision.
**Severity/risk parity** — NOT_EXERCISED; needs a fixture that populates `riskSnapshot`.
