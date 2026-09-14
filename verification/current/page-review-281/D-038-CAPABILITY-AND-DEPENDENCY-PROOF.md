# D-038 — the closed inspection cycle: dependency proof, capability comparison, and what was removed

§281. The product owner's decision was RETIRE, subject to one final bounded capability and
dependency proof. This is that proof.

---

## 1. The dependency proof

Every class of dependency the decision named, checked before anything was deleted. The method is
the one D-033 applied to `/inspection-quick`, strengthened where §280 showed it needed to be.

| Dependency class | Result |
|---|---|
| **Inbound navigation** | **None from outside the cycle.** The only reference to `/inspection-cover` anywhere in `app/`, `components/`, `lib/`, `hooks/` or `types/` was `app/inspection/page.tsx` — from inside the cycle. The two hits in `AppShell.tsx` were `activeRoots`, a navigation-*highlighting* matcher, not links |
| **Imports** | **None from outside the cycle.** Established by a full module import graph, not by grep — see §2 |
| **API dependency** | **None unique.** The cycle called the engine through `runHazLenzClassify` (`lib/hazlenzClient.ts`), a CLIENT-SIDE invocation. The active workflow reaches HazLenz through the server (`canonicalWorkflowApi` → the authoritative execution route). Removing the cycle removes a second, non-authoritative path to the engine |
| **Test dependency** | **Four gate-wired scripts, updated; two historical instruments, left untouched.** See §4 |
| **Documentation dependency** | Records only — the review document, historical `project-docs/historical/**`, and frozen evidence. **Frozen evidence is not edited** |
| **Deep-link requirement** | **None.** Absent from `public/sw.js` (`SHELL_ROUTES` is `/field-capture`, `/inspections`, `/command-center`), `app/manifest.webmanifest`, and the route tables. There is no `middleware.ts` and no sitemap |
| **Report paths** | **None shared.** The cycle generated reports LOCALLY (`lib/localExporter.ts` → jsPDF). The active product generates them SERVER-side (`GET /inspection-reports/:id/download`, `backend/src/reports/canonical-report-pdf-renderer.ts`) |
| **Persistence / data contracts** | **One, and it is RETAINED.** `lib/auth.ts` sweeps four device-global localStorage keys the cycle's `offlineInspectionStore` wrote. The sweep STAYS — see §5 |

### Browser reachability, measured twice

`frontend-next/scripts/measure-281-route-reachability.mjs`. Two independent passes that must BOTH
miss a route before it is called an orphan.

The first version of that instrument was a crawl alone, and it reported **eight** orphans —
including `/inspection-workspace`, the most important surface in the product. A crawl follows
visible anchors from where it happens to stand and therefore silently under-reports: a route
entered by `router.push`, from behind a closed menu, from a state the crawl did not reach, or from
an email is invisible to it. **Reporting those as orphans would have been the §280 defect in
reverse — the crawl's silence treated as proof of absence.**

The instrument now adds a SOURCE REACHABILITY FIXPOINT: a route counts as reachable when something
navigates to it *from a file that a reachable route can execute*. That last clause is what stops a
closed cycle from proving its own reachability by pointing at itself, which is exactly how
`/inspection` → `/inspection-review` → `/inspection` survived every previous inventory.

**Falsification.** The gate was deliberately falsified before it was trusted: one `<a
href="/inspection-cover">` added to `/reports` reclassified `/inspection-cover` — and, because the
cycle then links onward, `/inspection` and `/inspection-review` with it. Recorded in
`route-reachability-falsification.json`. The zero-orphan result after removal is therefore not
vacuous.

| | before removal | after removal |
|---|---|---|
| routes on disk | 23 | 20 |
| crawl-reached | 14 | 14 |
| source-reachable | 20 | 20 |
| `ACTIVE_REACHABLE` | 15 | 15 |
| `ACTIVE_DEEP_LINK` | 5 | 5 |
| **`LEGACY_ORPHAN`** | **3** — `/inspection`, `/inspection-cover`, `/inspection-review` | **0** |

---

## 2. What was actually removed, and why it is larger than §280 estimated

§280 described "a closed 1,511-line cycle". That is the three page files. The **deletion set is
101 files and 13,416 lines**, because the three pages were the entry points to a whole parallel
product that nothing else used.

The set was computed under the strict reading of the decision — *"the closed cycle and code
**solely** supporting it"* — as a fixpoint: a module is deletable only when **every** file that
imports it is itself deletable. Full list: `d038-deletion-set.txt`.

The strict rule matters. A naive "reachable from the cycle but not from the active product"
closure would have taken 107 files, and six of those are held alive by something else:

| held back | because |
|---|---|
| `components/evidence/AnnotationEditor.tsx`, `AnnotationPreview.tsx`, `AnnotationShapeRenderer.tsx`, `AnnotationEditorFooter.tsx`, `AnnotationToolbar.tsx` | imported by `components/reports/ReportCard.tsx` |
| `lib/offlineQueue.ts` | imported by `lib/localVault.ts` |

`ReportCard.tsx` and `localVault.ts` are themselves orphans — **separate, pre-existing ones with
zero importers anywhere**, unrelated to this cycle. They are NOT removed: D-038 authorises the
retirement of a named cycle, not an opportunistic sweep of every dead module the work happened to
walk past. They are raised as **D-043**.

---

## 3. The capability comparison

> *Does the closed cycle contain any capability, data transformation, validation, API interaction,
> report behaviour, persistence behaviour, evidence handling, review behaviour, accessibility
> behaviour or UX concept that the ACTIVE workflow still requires?*

**No.** The active workflow runs end to end without any of it. But the cycle did contain product
concepts the active product does not have, and deleting the code deletes the only description of
them, so they are recorded here rather than discovered missing later.

### 3a. Capabilities the active workflow REQUIRES and the cycle uniquely provided

**None.** Every capability the active workflow uses is either in the active architecture already or
is server-side.

### 3b. Capabilities present ONLY in the retired cycle — NOT required, and now lost

These are **product-owner decisions, not engineering gaps**. Nothing is blocked by their absence;
the active product has never offered any of them to a customer, because no customer could reach
the pages that did.

| # | Capability | Where it lived | What the active product has instead |
|---|---|---|---|
| **C-1** | **Report cover page fields** — organization name, additional inspectors, inspection team | `app/inspection-cover/page.tsx`, `lib/inspection/reportBuilder.ts` | The canonical server report's cover carries site name, inspection title, date, the preparing inspector, finding count and a record reference. It has **no** organization name and **no** additional inspectors |
| **C-2** | **Company logo on the report cover** | `reportBuilder` → `localExporter` | Not present in the canonical report. `POST /upload/logo` exists server-side and nothing on the active path consumes it for a report |
| **C-3** | **Confidentiality marker** — "Privileged & Confidential" stamped on the report | `reportBuilder` → `localExporter` | The report entity carries a `confidential` boolean; the canonical PDF renderer does **not** render a marker |
| **C-4** | **Plan-tiered report packages** — Field / Professional / Advanced, each including or excluding executive summary, HazLenz traceability, evidence gaps, confidence, repeat intelligence, company metadata, assignments, trend summary | `lib/reportPackages.ts` (82 lines) | The active product gates *access* to reports by entitlement. It does **not** vary report CONTENT by plan |
| **C-5** | **Local (client-side) PDF export** | `lib/localExporter.ts` (713 lines) and five `pdf*` helper modules | Server-side generation only. This is the better architecture — one renderer, one output, auditable — and the loss is the ability to produce a report with no connection |
| **C-6** | **Photo annotation** — draw on evidence photos before attaching | `components/evidence/Annotation*` (5 modules) | Field Capture attaches photos unannotated. **The annotation modules are NOT deleted** (see §2) and remain available to a future decision |
| **C-7** | **A local offline inspection store** — inspections, report drafts and a sync queue in localStorage | `lib/inspection/offlineInspectionStore.ts`, `offlineInspectionWiring.ts` | Field Capture's per-user IndexedDB store (`lib/offline/`), which is account-namespaced and is the D-037 direction. The removed store was device-global with no account namespace — a cross-account leak that `lib/auth.ts` had to sweep |
| **C-8** | **The HazLenz reasoning presentation family** — ~25 components rendering evidence quality, confidence reason codes, barrier analysis, energy transfer, cross-domain correlation, decision explainability, trend intelligence and more | `components/inspection/HazLenz*.tsx` | The workspace's own HazLenz step, plus §281's D-040 decision panel. **Checked specifically:** none of these 25 components rendered `criticalUnknowns`, `multiHazardReview` or `confidenceLimitReason` either — the D-040 defect was not "the good presentation was on the dead page" |
| **C-9** | **Report review actions** — edit, delete and add a finding from a finalized report; save a report to the cloud from the review screen | `app/inspection-review/page.tsx` | Finding review happens inside the workspace before completion. Post-completion report editing is a §277 concern (a corrected report must not overwrite the one already issued) |

**C-8 is the one worth reading twice.** The natural fear when deleting 25 HazLenz components is
that the engine's best presentation is being thrown away. It is not: those components render a
different, older intelligence contract, they were reachable only from a page no customer could
open, and the specific fields D-040 is about were absent from them as well.

### 3c. A collateral benefit, recorded because it is measurable

The retired cycle carried the **retired `safeScope` brand** as an internal field name in 45 of the
67 files that mention it. Removing the cycle removes those 45. The remaining occurrences are on
active surfaces and are unchanged by this work.

---

## 4. Test and instrument dependencies

The D-033 precedent: update what is wired to a gate; leave historical instruments alone so the runs
they produced stay reproducible as they were.

| script | wired to an npm gate? | disposition |
|---|---|---|
| `scripts/check-hydration.mjs` | **yes** (`check:hydration`) | three routes removed from the enumeration |
| `scripts/check-action-workflow-visibility.mjs` | **yes** (`check:action-workflow`) | `/inspection` and `/inspection-review` replaced by `/inspection-workspace` and `/inspection-complete`. **A separate instrument defect was found and fixed here — see §6** |
| `scripts/validate-279-update-delivery.mjs` | **yes** (`validate:279-update-delivery`) | typed into `/inspection-cover`'s "Inspector name"; now the dashboard's "Task title" |
| `scripts/review-279-page-batch.mjs` | **yes** (`review:page-batch`) | `/inspection` removed from batch 2, `/inspection-cover` from batch 1 |
| `scripts/validate-275-product-surface.mjs` | no | **left untouched** — historical instrument |
| `scripts/check-visual-acceptance.mjs` | no | **left untouched** — historical instrument |

§279 and §280 evidence is **not** edited. A run's evidence is not rewritten because a later
decision changed the product.

---

## 5. The one persistence dependency, and why it is retained

`lib/auth.ts` sweeps four device-global localStorage keys on sign-out:

```
insite_offline_inspections_v1
insite_offline_report_drafts_v1
insite_offline_inspection_sync_queue_v1
insite_active_local_inspection_id
```

They were written by `lib/inspection/offlineInspectionStore.ts`, which is now deleted. **The sweep
stays.** A device that ran any earlier build still holds whatever it wrote — raw observation text,
local findings and report drafts, with no account namespace — and that content does not expire
because the code that produced it was removed. Deleting the sweep along with the writer would
reopen the exact cross-account leak V1-OFFLINE-ISO-01 closed, on every device that has ever used
the product.

---

## 6. One objective defect found while doing this, and repaired

**The navigation's "you are here" indicator did not cover the product's most-used page.**

`AppShell`'s `activeRoots` are matched as `pathname === root || pathname.startsWith(root + "/")` —
an exact segment match, not a string prefix. `/inspection` therefore never covered
`/inspection-workspace`, and `/inspection-workspace` was not in the list. Walking into the
workspace highlighted **no** navigation item at all. The presence of `/inspection` and
`/inspection-cover` in that list is what made the omission look deliberate.

Repaired: the list is now `/inspections`, `/inspection-workspace`, `/inspection-complete`,
`/field-capture`.

---

## 7. Verification after removal

| check | result |
|---|---|
| `tsc --noEmit` | clean, no source-level error |
| `next build` | **exit 0.** 20 routes emitted; the three retired routes no longer appear |
| `check:hydration` | PASS |
| `check:page-titles` | PASS |
| `check:orange-semantics` | PASS |
| `check:action-workflow` | PASS (after the instrument repair in §6 of the review document) |
| `check:risk-band-parity` | PASS |
| `check:expert-authority-boundary` | PASS |
| `validate:280-workspace-draft-persistence` | PASS |
| route reachability | 0 `LEGACY_ORPHAN` |
| `hazlenz:verify` (backend) | PASS — 29/29 protected modules, 0 accepted-evidence drift, §274 identity re-verified |

Every deleted file was tracked at `HEAD` and carried no uncommitted modification, so the removal is
recoverable in full from git.
