# V5-C05 — Phase 3: Legacy vs Canonical Capability Diff

For each capability: legacy support / canonical support / divergence assessment.

| Capability | Legacy (`/inspection`) | Canonical (`/inspection-workspace`) | Divergence |
|---|---|---|---|
| Inspection creation | No setup required — direct entry via CTA/cover page, no site selection | Requires a saved site (`inspections/page.tsx:135-138`) and creates a server row before capture | Legacy allows zero-setup start; canonical enforces site + entitlement first |
| Inspection resume | **Not actually supported** — `sentinel_inspection_autosave` is write-only (zero readers, confirmed repo-wide); in-memory `findings` array is lost on reload unless the user already ran `generateReport()` (moves data into encrypted `reportStorage`, retrievable via `/inspection-review` → "Edit") | Resumes via `sentinel_selected_inspection_context.persistedInspectionId` (`inspection-workspace/page.tsx:181-234`), but only while that one key still points at the inspection — no "my in-progress inspections" list is rendered anywhere (`listPersistedInspections` results are only used for a count, `inspections/page.tsx:273`) | Neither flow has robust multi-session resume. Legacy is strictly worse for uncommitted work; canonical is strictly worse once a second inspection is started (overwrites the resume key) |
| Observation capture | Yes, manual per-finding | Yes, structured per-finding within guided flow | No material gap |
| Photo/media handling | `photoEvidenceService`/`AnnotationEditor` | `uploadInspectionEvidence` | Different plumbing, no capability gap |
| HazLenz analysis invocation | Yes, per finding, via `hazlenzInspectionService.ts` | Yes, per finding, via `canonicalWorkflowApi.ts` | No gap |
| Multi-hazard findings | Decomposition banner shown (informational only); no mechanism to auto-create separate findings per hazard | Structured `findingCandidates`/`selectedSegmentKeys` splitting one observation into multiple findings with independent review (939-982) | Canonical materially ahead — this is part of the P1-01 root cause |
| Finding-scoped risk | **Absent** — `finding.safeScopeResult.risk` shared/observation-level (confirmed live, P1-01 reproduction) | Present — `finding.riskSnapshot`, independently computed per hazard (C01, metamorphic-proven) | **The core P1-01 gap** |
| Finding review | `FindingReviewEditor`/`RiskReviewSection` (shared components, also used by legacy's step renderer) | Native to workspace flow | Same review components underlie both, but data source differs (see risk row) |
| Corrective actions | Manual + generated actions, `CorrectiveActionsSection.tsx` | Server `createPersistedCorrectiveAction`/`createPersistedTask` | No capability gap; different plumbing |
| Clarification | `clarifyingQuestions` rendered advisory-only | `clarificationQuestions` rendered advisory-only | Equivalent (both non-blocking) |
| Local/offline state | **The one genuine LEGACY_ONLY_CAPABILITY**: `hazlenzInspectionService.ts:35-51` calls `runHazLenzOffline` (local knowledge-pack classifier, no network) when offline mode is set; the full report-build/edit/PDF-export loop (`/inspection` → `/inspection-review`, local exporter) works purely against encrypted `localStorage` with zero network calls until the user explicitly clicks "Save to Cloud" | **No offline equivalent at all** — every action in `canonicalWorkflowApi.ts` is a bare `fetch` with no retry/queue/local fallback; a failed `analyzeObservation` simply leaves the user stuck with an error message | Real, working legacy-only capability. Blocks a bare redirect unless explicitly addressed |
| Server persistence | Only via explicit "Save to Cloud" (separate, effectively orphaned legacy `/reports` resource — see Census doc) | Native, continuous | Canonical materially ahead |
| Edit/reload | Legacy: edit via `/inspection-review` → "Edit" (round-trips through encrypted localStorage, not true live reload) | Canonical: reload resumes from server via the one resume key | Different mechanisms, roughly comparable robustness (both have gaps, see "resume" row) |
| Mobile behavior | Responsive, no distinct mobile-only code paths found | Responsive, no distinct mobile-only code paths found | No material gap identified |
| Accessibility | ~1 `aria-`/`role=` occurrence at the page level in `inspection/page.tsx` (semantics may be pushed into child components not fully audited) | ~10 occurrences in `inspection-workspace/page.tsx` (aria-live status region, aria-current step nav, role="alert", labelled fieldsets) | Suggestive, not conclusive — canonical appears more deliberate about accessibility; treat as a secondary consideration, not a blocker |
| Subscription/entitlement gating | **None** — zero `hasPlanEntitlement` references anywhere in the legacy tree; no middleware/route guard exists (`middleware.ts` does not exist) | Enforces `hasPlanEntitlement(workflow.entitlement, planCode)` for both Quick (`quickCapture`) and Full (`guidedInspection`) (`inspections/page.tsx:134,287`) | **A real product/policy decision, not a technical blocker** — see below |
| Error recovery | HazLenz failures caught and shown as a status string; nothing else is lost since state stays in memory/localStorage | Every API failure sets a status via try/catch with no local fallback; a failed `analyzeObservation` leaves the user stuck with nothing persisted for that turn | Legacy is more resilient to transient failures; canonical is more fragile |

## What would make a bare redirect (Strategy A) unsafe

1. **Entitlement leak reversal.** Redirecting `/inspection` straight to `/inspection-workspace` would
   immediately paywall a currently-free path (the dashboard CTA today reaches full guided inspection +
   HazLenz review with zero gating). This is a legitimate product decision the business may want to make
   deliberately, but it must not happen as a silent side effect of a routing fix.
2. **Loss of true offline capability.** The one real legacy-only feature — offline HazLenz classification
   plus a fully local report build/edit/export loop with zero network dependency — has no canonical
   equivalent. Canonical fails hard (stuck screen, no local fallback) on any network error. A bare
   redirect removes field-offline usage entirely with no substitute.
3. **Orphaned local report data.** Users with reports already sitting in `sentinel_encrypted_reports`/
   `latest_report` (encrypted localStorage) would lose their only entry point (`/inspection-review`) to
   view/edit/export/cloud-save that data if `/inspection` were redirected without also preserving
   `/inspection-review` as a compatibility surface.
4. **Dead-code false confidence.** `offlineInspectionWiring.ts`/`offlineInspectionStore.ts` and
   `sentinel_inspection_autosave` look like active resilience infrastructure but are write-only — they
   must not be treated as a capability requiring migration, and their presence should not be read as
   evidence the legacy flow currently protects users from data loss on reload (it does not).

`/inspection-cover` is safe to canonicalize-link (thin wrapper, no independent capability).
`/inspection-quick` requires no migration — it is dead and can be removed in Phase 14 once confirmed safe.
