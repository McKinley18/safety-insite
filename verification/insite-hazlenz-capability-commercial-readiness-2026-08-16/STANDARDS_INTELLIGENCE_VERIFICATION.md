# Standards Intelligence & Regulatory Text UX Honesty — Verification

**Date:** 2026-08-16
**Target:** verification backend `http://127.0.0.1:4001` (PID 16494, `DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/test_hazlenz_verify_20260816`) — confirmed via `ps eww 16494`, never the `safescope` dev DB.
**Method:** Live `POST /safescope-v2/classify` calls as `verify-pro-20260816@example.com` (Pro entitlement), direct read-only `psql` queries against `test_hazlenz_verify_20260816`, and static reading of `backend/src` and `frontend-next/`.

## 1. Classification-to-citation relevance — 5 test cases

| # | Hazard narrative | `classification` field | Citation-relevant to narrative? | HazLenz summary present? | Official regulation text present? | Provenance/agency shown? |
|---|---|---|---|---|---|---|
| A | Machine guarding — missing conveyor pulley guard, exposed chain | **"Lockout / Stored Energy"** (mismatched — see below) | Partially. `primaryCitation` = `29 CFR 1910.219(c)` (guarding of shafting/pulleys) is topically on-point, but `standardDecisions` (the field the frontend actually renders as the primary standard) carries `title: null, standardText: null` | No, for the primary decision (null). Yes, for the `supportingStandards` MSHA record (30 CFR 57.14107(a)) | No (regulatory_section table absent) | agency correctly resolved OSHA via citation-prefix heuristic |
| B | Electrical — bare exposed conductors in temporary wiring through a doorway | "Electrical" (matches) | Yes. `primaryCitation` = `29 CFR 1910.305(g)(2)(iii)` (flexible cords/temporary wiring) — directly relevant | Yes, in `supportingStandards[0].summary` ("Confirm exact subsection text..."); No for `standardDecisions` primary (null) | No | agency = OSHA (correct) |
| C | LOTO — contractor servicing machine, disconnect not verified locked out | **"Lockout / Stored Energy"** (matches label) but `explanation` field says **"HazLenz AI matched weighted Electrical signals"** (mismatched internally) | **No citation at all.** `primaryCitation` = `""`, `supportingStandards` = `[]`, `standardsMatchExplanations` = `[]`, `standardDecisions` = `[]`, `standardApplicability.matchedRules` = `[]` | No | No | N/A — nothing surfaced |
| D | Fall protection — guardrail removed on 12-ft elevated platform | "Fall Protection" (matches) | Yes. `primaryCitation` = `29 CFR 1910.28(b)`, `supportingStandards` includes `29 CFR 1926.501` (Duty to have fall protection) — both on-topic | Yes, in `supportingStandards`; No for `standardDecisions` primary (null) | No | agency = OSHA (correct) |
| E | MSHA — unguarded moving pulley on mining conveyor, pinch points | "Machine Guarding" (matches) | Yes. `primaryCitation` = `30 CFR 56.14107(a)` — direct, high-confidence (0.96) MSHA machine-guarding match | Yes, `supportingStandards[0].summary` present; No for `standardDecisions` primary (null) | No | agency = MSHA (correct) |

**Both A and C show the top-level `classification` field self-contradicting the `excludedHazards` list** — in both cases the winning classification also appears inside `excludedHazards` with reason `"Insufficient weighted signal evidence."` (case A) or the same (case C). Raw evidence:

```
case A: classification="Lockout / Stored Energy", explanation="...Machine Guarding signals."
        excludedHazards includes {"classification":"Lockout / Stored Energy","reason":"Insufficient weighted signal evidence."}
case C: classification="Lockout / Stored Energy", explanation="...matched weighted Electrical signals."
        excludedHazards includes {"classification":"Lockout / Stored Energy","reason":"Insufficient weighted signal evidence."}
```

This is an internal-consistency bug in the classification/exclusion pipeline, not a standards-intelligence issue per se, but it directly undermines trust in the classification the standards are attached to. Case C — the clearest textbook LOTO narrative of the five — is also the one case that produced **zero standards output** despite the seeded corpus containing directly relevant MSHA rows (`30 CFR 56.12016` "Work on electrically powered equipment", `30 CFR 56.14105` "Procedures during repairs or maintenance" — confirmed present via `psql` query below) that were never surfaced.

## 2. `regulatory_section` — empty/missing table and API behavior

Confirmed via direct `psql` against the verification DB:

```
$ psql -h 127.0.0.1 -U mckinley -d test_hazlenz_verify_20260816 -c "select count(*) from regulatory_section;"
ERROR:  relation "regulatory_section" does not exist
```

`\dt` against `test_hazlenz_verify_20260816` lists 46 tables — no `regulatory_section`, `regulatory_part`, `regulatory_agency`, `regulatory_subpart`, or `regulatory_paragraph` table exists at all. The migration `1800000005800-RegulatorySectionCorpus.ts` (uncommitted, per the task's supplied context) was never run against this database. This is more than "empty" — the table is entirely absent.

The `standards_master` table (backing HazLenz's own citation/summary output) does exist and is seeded with 19 rows (13 OSHA, 6 MSHA — matches expected seed count), confirmed via:
```
 agency_code | count
-------------+-------
 OSHA        |    13
 MSHA        |     6
```
Sample row confirms `standard_text` and `plain_language_summary` are **byte-for-byte identical** for seeded rows, e.g. `30 CFR 57.14107(a)`: both columns = `"Underground metal/nonmetal moving machine parts must be guarded when contact exposure exists."` This is HazLenz's own paraphrase stored in a column literally named `standard_text`, not verbatim regulatory language — see `backend/src/standards/entities/standard.entity.ts:38-39` where `standard_text` and `plain_language_summary` are two separate nullable-independent columns, but the seed data populates them with the same string.

**Live API behavior when the table is missing:**

- `GET /regulatory/sections` with no `q` param → `200 []` — but this is a **coincidence, not graceful handling**: `RegulatoryService.searchSections()` → `matchStandard()` short-circuits with `if (techTokens.length === 0) return [];` (`backend/src/regulatory/regulatory.service.ts:36-37`) before ever touching the database when the query is empty.
- `GET /regulatory/sections?agency=OSHA&part=1910&q=guarding` (real query, forces a DB hit) → **`500 {"statusCode":500,"message":"Internal server error"}`**
- `GET /regulatory/section?citation=<anything>` (including a trivial `citation=test`) → **`500 {"statusCode":500,"message":"Internal server error"}`** every time, because `RegulatoryService.getSection()` (`backend/src/regulatory/regulatory.service.ts:111-113`) does `this.sectionRepo.findOne({ where: { citation } })` against a table that does not exist.

So the **raw backend contract is not honest** — it throws an opaque 500, not a clean "not found"/"unavailable" response, whenever the missing table is actually queried.

**However, the frontend never lets a user see that 500.** `frontend-next/lib/canonicalWorkflowApi.ts:403-433` (`fetchRegulatorySectionByCitation` / `getRegulatorySection`) wraps the call in `try { ... } catch { return null; }` with an explicit code comment: *"Fails soft to null on any error -- offline, no network, not-yet-ingested citation, or auth lapse -- so the existing honest 'not currently available' panel is always a safe fallback, never a hard error."* This is then rendered by `StandardCitationHeading` in `frontend-next/components/inspection/SafeScopeStandardsSection.tsx:66-71`:

```tsx
) : (
  <p className="mt-1 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
    The verbatim text of {citation || "this standard"} is not currently available in HazLenz's local standards
    corpus. The summary below is a HazLenz-authored overview, not the official regulation language — consult
    the cited regulation directly for the verbatim requirement.
  </p>
)}
```

So end-to-end, a real user clicking "Standard detail" today sees the honest disclosure, not an error — the backend's ungraceful 500 is fully absorbed by the frontend's fail-soft design. The gap is that the *backend contract itself* is not honest/self-documenting (a 500 is indistinguishable from a real server fault, e.g. a DB connection outage, from a client's perspective) — only this particular frontend consumer happens to paper over it correctly.

### Important context: the feature has been built and proven elsewhere, just not populated in this DB

A separate report in this repo, `verification/insite-production-polish-p1-inspection-standards-2026-08-16/STANDARDS_TEXT_FOUNDATION.md`, documents that in a **different** disposable database (`test_polish1_20260816`) the same migration was applied and real ingestion was run against live `govinfo.gov` bulk XML for OSHA §1910 (163 sections) and MSHA §56 (422 sections), including a data-extraction bug fix for nested-XML paragraph text. It also documents the exact section-vs-subsection disclosure design (`matchScope: "exact" | "parent-section"`, `frontend-next/lib/canonicalWorkflowApi.ts:396-400`) and the amber "Showing the full text of X — this specific subsection is not separately available" banner (`SafeScopeStandardsSection.tsx:52-56`), which was working. **In `test_hazlenz_verify_20260816` (this verification's target DB) that ingestion was never run**, so live testing here only exercises the "not currently available" branch, not the "exact" or "parent-section" branches. Both branches exist in code and are traceable, but only the empty-state branch was observed live in this session.

## 3. Frontend citation-rendering UX — code-level findings

File: `frontend-next/components/inspection/SafeScopeStandardsSection.tsx`; helpers in `frontend-next/lib/inspection/standardDisplay.ts` and `frontend-next/lib/hazlenzStandardHelpers.ts`.

**There is a genuine, deliberate label taxonomy distinguishing HazLenz's own text from official text.** `standardDisplay.ts:130-198` (`getStandardDisplayText`) returns one of four explicit labels — `"HazLenz standard summary"`, `"Summary"`, `"HazLenz explanation"`, or `"Unavailable"` — never claiming to be official regulation text. The code comment directly above it (`standardDisplay.ts:120-125`) states:

> `// NOTE: standardText/regulatoryText/regulationText/fullText are populated by`
> `// hand-typed or auto-derived paraphrases (see safescope-standards.seed.ts and`
> `// sync-standards-intelligence-to-master.ts's` `standardText()` `helper), never`
> `// by verbatim CFR/MSHA source text ... This tier`
> `// must never be labeled as official/authoritative regulatory language.`

The "Standard detail" expandable panel (`StandardCitationHeading`, lines 7-77) is a **separate, distinct affordance** from the summary card — it makes an on-demand `getRegulatorySection(citation)` call and explicitly labels its content "Official regulation text" (line 46) only when real corpus text is returned, with the parent-section disclosure banner and the honest-unavailable fallback both present as shown above. This is the correct architecture for Phase 6's requirement.

**Gap found: the "primary matched standard" card is frequently empty of real content.** `frontend-next/lib/inspection/hazlenzStandardCandidates.ts:73-86` (`getHazLenzPrimaryStandards`) prioritizes the API's `standardDecisions` array over `primaryStandards`/`suggestedStandards` whenever `standardDecisions` is non-empty:

```ts
export function getHazLenzPrimaryStandards(result: any): any[] {
  const canonical = getHazLenzStandardDecisions(result);
  if (canonical.length) {
    ...
    return unique.slice(0, 3);
  }
  const raw = [ ...asArray(result?.primaryStandards)... ];
```

But in all 4 of the 5 live test cases that returned a citation (A, B, D, E), `standardDecisions[0]` had `title: null, standardText: null, source: null` — only `citation`, `status: "applicable_after_human_review"`, and a boilerplate `rationale: "The citation is advisory and must be confirmed against the facts, jurisdiction, and authoritative text by a qualified reviewer."` `hazlenzStandardHelpers.ts:123-139` (`candidateFrom`) then sets `title: title || citation` (falls back to the bare citation string) and `standardText: cleanText(value.standardText...) || undefined` (stays undefined). Downstream, `getStandardDisplayText` falls through past `standardText` (empty) and `plainLanguageSummary` (empty) to the `rationale` tier, labeled `"HazLenz explanation"` — meaning the **"Primary Matched Standard" card an inspector actually sees shows only the bare citation plus the generic "must be confirmed" boilerplate, not the plain-language summary of what that standard requires.** The real plain-language content (e.g., "Underground metal/nonmetal moving machine parts must be guarded...") only surfaces in the secondary "Supporting Standards / Related References" section, sourced from a different response field (`supportingStandards`) that bypasses `standardDecisions` entirely.

**Severity finding, case C (LOTO):** because `standardDecisions`, `primaryStandards`, `suggestedStandards`, `candidateStandards`, `standards`, `inspectionIntelligence.candidateStandards`, and `executiveJudgment.topStandard` were all empty/absent, and `isVague === false` (so the component doesn't take the "no specific standard selected yet" branch either), `SafeScopeStandardsSection.tsx:248-250` (`if (!totalCount) return null;`) causes **the entire Standards Review UI section to not render at all** for that finding. A working inspector filing a clear lockout/tagout finding today would see no standards panel whatsoever — not an honest "no standard found" message, just nothing.

## 4. `standard.entity.ts` and the "Unconfirmed" agency default

`backend/src/standards/entities/standard.entity.ts:23-24` defines `agencyCode: AgencyCode` (`"OSHA" | "MSHA"`) as a required, non-nullable column — every seeded row does have a real agency (confirmed by the `psql` `agency_code` breakdown above: 13 OSHA / 6 MSHA, no nulls/blanks). The `standards_master` table itself never stores `"Unconfirmed"` as an agency value.

The `"Unconfirmed"` value we were told to expect comes from a **display-layer fallback**, not the entity default: `backend/src/safescope-v2/display/guided-finding-response.ts:187-188`:

```ts
agency: text(record?.agency || record?.agencyCode) ||
  (citation.includes('30 CFR') ? 'MSHA' : citation.includes('29 CFR') ? 'OSHA' : 'Unconfirmed'),
```

This only fires in the `guidedFinding.primaryStandard` compatibility-adapter path, when `matchingRecord()` (`guided-finding-response.ts:30-37`) fails to find a matching record in `response.primaryStandards`/`response.suggestedStandards`/`response.standards` (notably **not** `response.supportingStandards`) and the citation string itself doesn't start with a recognizable `"29 CFR"`/`"30 CFR"` prefix. None of our 5 live test citations triggered `"Unconfirmed"` (all were standard `29 CFR`/`30 CFR` strings), but the same `matchingRecord()` miss is what caused the separate `guidedFinding.primaryStandard.title` bug observed in cases A, B, D: `title: text(record?.title || record?.heading) || family` (line 186) falls back to the **hazard family/classification name** (e.g. `"Lockout / Stored Energy"`) instead of the real regulation title (e.g. "Guarding horizontal, vertical, or inclined shafting") whenever `matchingRecord()` misses — which happened in 3 of 5 cases because that helper only searches 3 of the 4 arrays that actually carry standard records (it misses `supportingStandards`, where cases A, B, D, and E's real title/summary content actually lives).

Implication for provenance claims: the `"Unconfirmed"` fallback and the `family`-as-`title` fallback both exist specifically because the `guidedFinding` compatibility layer's citation-matching logic is narrower than the fields the main classify response actually populates — a maintenance gap, not a deliberate honesty mechanism.

## Overall verdict: **PARTIALLY_PROVEN**

A marketing claim like *"surfaces authoritative regulation text where available"* is defensible in narrow, literal terms — the code path, labeling taxonomy, and fail-soft error handling described in section 3 are real, deliberate, and (per the sibling `STANDARDS_TEXT_FOUNDATION.md` report) have been proven to work end-to-end with genuine `govinfo.gov`-sourced text in a different disposable database. The "not currently available, this is HazLenz's own summary" honesty message is a real, well-built feature, not vaporware.

But relative to what a customer would infer from that claim in day-to-day use, standards intelligence is **overstated in two concrete ways** proven live in this session:

1. **Coverage is unreliable, not just "sometimes low-confidence."** A textbook LOTO hazard (case C) produced zero citations end-to-end (empty `primaryCitation`, `supportingStandards`, `standardApplicability`, `standardDecisions`) despite directly relevant MSHA rows existing in the seeded corpus, and the frontend Standards Review panel does not render at all for that finding — no citation, no honest "none found" message, nothing.
2. **The primary standard the UI foregrounds is frequently content-free.** In 4 of 5 cases, the "Primary Matched Standard" card (sourced from `standardDecisions`, which the frontend prioritizes over the fields that actually carry title/summary text) shows only a bare citation code plus generic advisory boilerplate — the real plain-language content lives in a secondary, less prominent "Supporting Standards" section powered by a different field.

Additionally, the classification pipeline itself showed a self-contradiction bug (the returned `classification` simultaneously appearing in `excludedHazards`, in 2 of 5 cases) that undermines confidence in which standard is even "primary."

The regulatory-text honesty layer (Phase 6) is the strongest, best-evidenced part of this investigation: it is real, its failure mode is genuinely graceful today, and it has documented, verified proof of working with live government source text elsewhere in the repo. The standards-matching completeness and the primary-citation content pipeline (parts of Phase 5) are the weaker parts — proven to be unreliable, with two independently reproducible defects (empty-citation LOTO case; null-content primary-standard card) rather than proven solid.
