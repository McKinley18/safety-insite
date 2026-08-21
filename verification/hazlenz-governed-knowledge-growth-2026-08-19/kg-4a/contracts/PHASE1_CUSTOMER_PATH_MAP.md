# KG-4A Phase 1 — the complete current customer standards path

Traced against the working tree at HEAD `5f05085` + the uncommitted KG-1…KG-3F work.

---

## 1. The two independent customer paths

There are **two** paths that put a regulatory citation and its text in front of a customer.
They are not variants of each other; they run in different stages and hydrate differently.

### Path A — `suggest()` (the candidate/search path)

```
observation text
  -> ApplicableStandardsService.suggest()                applicable-standards.service.ts:984
       stage 2   knowledge chunks     take(50)   SQL
       stage 4   focused standards    take(25)   SQL
       stage 6   fallback standards   take(50)   SQL   standards_master, is_active + jurisdiction
       stage 7   merge -> candidateStandardsMap
       stage 8-9 scenario boosts + semantic scoring
       stage 10  sort  (KG-3F terminal tie-break: specificity asc, then citationSortKey)
       stage 11  dedup by structured isCitationMatch, keeps FIRST
       stage 12  jurisdiction re-filter
       stage 13  applyCandidateEvidenceFit
       stage 14  active-before-inactive, slice(0, finalLimit=10)
       stage 15  BACKING ANNOTATION  <-- resolveStandardsBacking({... no governed })   :2370
  -> ApplicableStandardsController                       applicable-standards.controller.ts:17
  -> SafeScopeV2Service.analyze()                        safescope-v2.service.ts:1064
```

`suggest()` returns `standards_master` rows **directly**. This is the only place where governed
filtering could change **which** standards a customer sees rather than merely how they are labelled.

### Path B — `hydrateFindingScopedStandards()` (the finding/decision path)

```
evidence-foundation rule decisions (citation selected IN CODE, no corpus dependency)
  -> SafeScopeV2Service.hydrateFindingScopedStandards()  safescope-v2.service.ts:5509
       for key of [primaryStandards, suggestedStandards, standardDecisions]
         hydrate()  = ApplicableStandardsService.hydrateStandardReferences()     :877
                      standards_master, is_active, fuzzy citation ILIKE, NO release scope
         mark()     = BACKING ANNOTATION <-- resolveStandardsBacking({... no governed })  :5524
       for hazard of multiHazardDecomposition.hazards
         same over hazard.standardCandidates
  -> called from safescope-v2.controller.ts:319
  -> buildGuidedFindingResponse()                        guided-finding-response.ts
       backingStatus = record?.backingStatus ?? resolveStandardsBacking({...}).backingStatus  :204
       sourceStatus  = mapBackingToSourceStatus(...)                                          :244
       confidenceLimitReason / backingNotice                                              :262/268
  -> API response
  -> InspectionService.addAnalysis()  persists resultSnapshot + knowledgeReleaseId       inspection.service.ts:344
  -> reconcileDecompositionFindings() -> InspectionFinding.knowledgeReleaseId (inherited) :601/636
  -> Standard Detail (frontend-next/components/inspection/SafeScopeStandardsSection.tsx)
  -> CanonicalReportsService.knowledgeProvenance()        canonical-reports.service.ts:107
```

---

## 2. Where each concern enters

| Concern | Enters at | Notes |
|---|---|---|
| **Citation selection** | `evidence-foundation.ts` rules (Path B) and stages 4/6 SQL (Path A) | Path B selection is **entirely in code** — no corpus dependency (KG-3A §12) |
| **Applicability confidence** | `applicabilityDecisions[].status` / `.confidence` / `requiredPredicates` / `missingPredicates` | `SUPPORTED` / `UNKNOWN` / (unsupported ⇒ decision not emitted) |
| **Regulatory text** | `standards_master.standard_text` + `.plain_language_summary`, via `hydrateStandardReferences` | HazLenz-authored paraphrase, labelled as such (P1 label-integrity contract) |
| **Source / provenance** | `standards_master.source_key` / `source_name` / `source_type` | `starter-unverified:` prefix = synthesized placeholder |
| **Content backing claim** | `resolveStandardsBacking()` — **exactly two call sites** | Path A :2370, Path B :5524; display re-derives only as a `??` fallback |
| **Release provenance** | `resolveKnowledgeReleaseId()` at `inspection.service.ts:305` | today hard-wired to `unscoped_corpus` ⇒ **always NULL** |

---

## 3. What is persisted vs reconstructed on reload

| Item | Persisted? | Where |
|---|---|---|
| `resultSnapshot` (incl. `standardDecisions[].backingStatus`) | **yes** | `hazlenz_analyses.resultSnapshot` jsonb |
| `knowledgeReleaseId` (analysis) | **yes** | `hazlenz_analyses.knowledgeReleaseId` varchar(120), nullable |
| `knowledgeReleaseId` (finding) | **yes, inherited verbatim** | `inspection_findings.knowledgeReleaseId` |
| guided-finding response | **no — rebuilt** | `buildGuidedFindingResponse()` from the persisted snapshot |
| `backingNotice` / `confidenceLimitReason` / `sourceStatus` | **no — derived** | from persisted `backingStatus` |
| report knowledge provenance | **no — derived** | `knowledgeProvenance()` from persisted finding rows |

**Consequence for KG-4A:** `backingStatus` is the *persisted* atom. Anything the fallback contract
needs to survive a reload must either be persisted alongside it or be derivable from it.

---

## 4. The narrowest integration seam

`resolveStandardsBacking()` **already** accepts an optional pre-resolved `governed` input and is
already the single decision point for backing on both customer paths. It is called from exactly two
places and is pure/DB-free by design.

> **The seam is: resolve a governed backing input once per analysis, and pass it into the two
> existing `resolveStandardsBacking()` call sites.**

This satisfies "one explicit boundary, do not scatter governed lookup calls":

* no new call site inside `evidence-foundation.ts`, the ranking stages, the display adapter or the
  report service;
* Path A and Path B cannot disagree, because they share the resolver;
* `governed: null` (the default) reproduces today's behaviour **byte-for-byte**, which is what makes
  LEGACY mode a provable no-op rather than a re-implementation.

## 5. What Phase 1 shows is MISSING for a cutover

1. `resolveStandardsBacking()` takes a `governed` input but nothing customer-facing ever produces
   one — `governed-corpus-lookup.ts` has **zero** customer importers (KG-3F Phase 16, 9/9).
2. There is no mode contract, so there is nothing to switch.
3. `GovernedBackingInput` carries 4 fields; it cannot express *fallback*, *resolution granularity*,
   *resolver failure*, or *applicability*.
4. `resolveKnowledgeReleaseId()` is a zero-argument function returning a constant NULL. It has no
   way to learn that a governed release actually influenced this analysis.
5. There is no request-scoped release pin — every governed lookup would independently re-read the
   active pointer.
