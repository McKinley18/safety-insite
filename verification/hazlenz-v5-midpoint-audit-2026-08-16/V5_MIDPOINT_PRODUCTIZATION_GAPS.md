# V5 Midpoint Audit — Phase 2: Productization Gap Audit

Method: for each intelligence output, determine whether it is computed correctly but fails to
meaningfully reach the user's product experience. Only gaps that would help a user make/understand a
safety decision are flagged — a backend field existing is not itself a gap.

| Concept | Gap? | Classification | Evidence |
|---|---|---|---|
| `resultStage`/`mayFinalize` | Yes | **WORKFLOW_GAP** | No UI badge/banner for "this analysis is provisional, human review required." `inspection.service.ts` completion path never checks it — a finding flagged not-yet-finalizable can be finalized identically to a fully-supported one, with no visible distinction. |
| Evidence-sufficiency reasons (`sufficiencyLevel`, `factScores`, `missingCriticalFacts`) | Yes | **EXPLAINABILITY_GAP** | `evidenceSufficiency` is deleted by `hazlenz-display-sanitizer.ts:77` before the response leaves the server — the interactive review UI (`inspection-workspace/page.tsx`) has zero access to it. A separate, differently-named object (`auditReadyReasoningTrace`) does carry `missingCriticalFacts` into the legacy PDF exporter (`pdfAppendixRenderer.ts:101-117`), but only via `app/inspection-review/page.tsx`, never the interactive screen where the human decision happens. |
| Shared evidence provenance (`evidenceFactTrace`) | No (as currently scoped) | **NO_PRODUCT_VALUE** | Zero frontend matches; purely additive internal provenance not yet wired to any decision surface. Flag only if a future phase turns it into a "why this evidence mattered" explanation. |
| Finding-scoped risk (C01) | Partial | — / **WORKFLOW_GAP** | Well-surfaced in the canonical `/inspection-workspace` flow (explicit "independent of other findings" text, and in `canonical-reports.service.ts:35`). **Not surfaced at all in the legacy `/inspection-review` flow**, which is reachable from the app's primary dashboard CTA — see `V5_MIDPOINT_USER_JOURNEY.md`. This is the most significant single gap found in this audit. |
| Corrective-action reasoning | No | — | Genuinely surfaced via `SafeScopeRationaleVisualizer.tsx:40`, `HazLenzFindingSummary.tsx:226-227`, and the legacy PDF appendix. |
| Control-effectiveness intelligence (`present_but_ineffective`, etc.) | Yes | **SAFETY_DECISION_GAP** | Computed in 8 backend files but **zero frontend matches anywhere**. A user cannot distinguish "no control present" from "control present but ineffective" — directly relevant to what corrective action is actually needed. Compounded by the risk engine itself being control-blind (see Phase 8, scenarios #4/#5). |
| Standards/applicability explanations | No | — | Well-built: "Why HazLenz selected this," confidence label, confidence-limit reason, "details that would increase confidence" all render in the canonical flow. |
| Clarification state | Yes | **SAFETY_DECISION_GAP** | Questions render, but nothing enforces or tracks whether a clarification question was answered before a finding is reviewed/finalized. A finding (and the whole inspection) can be finalized with `resultStage: "provisional"` and no warning. |
| Confidence/uncertainty | Yes | **EXPLAINABILITY_GAP** | Per-standard confidence is shown; observation-level evidentiary weakness (the sufficiency tier) is not — a reviewer sees local confidence but not the global evidence-sufficiency picture. |
| Historical/planned-future semantics | Yes | **SAFETY_DECISION_GAP** | Historical: risk badge is not recomputed after reclassification, so a "Historical condition" badge can sit beside a stale HIGH/CRITICAL risk tile — an internal contradiction. Planned-future: `conditionState` is computed but **no label is ever assigned** for it — renders identically to an open, unaddressed hazard, with no risk adjustment or "correction in motion" messaging. |
| Report representation of the above | Yes | **REPORTING_GAP** | The canonical/versioned report (`canonical-reports.service.ts:33-35`) renders only `conclusion`, `status`, `riskBand` — none of the standards reasoning, confidence, evidence-sufficiency, or finalization-gate context shown (or missing) in the live UI carries into the permanent report artifact. |

## Summary

Confirmed productization gaps, ranked by safety significance:

1. **Finding-scoped risk not reaching the legacy/primary flow** (SAFETY_DECISION_GAP / WORKFLOW_GAP) — highest significance; affects the majority of production traffic.
2. **Control-effectiveness never surfaced, and risk scoring is control-blind** (SAFETY_DECISION_GAP).
3. **Historical/planned-future semantics inconsistently or never surfaced** (SAFETY_DECISION_GAP).
4. **Clarification non-enforcement** (SAFETY_DECISION_GAP) — provisional analyses can be finalized silently.
5. **Evidence-sufficiency reasons stripped from the interactive review UI** (EXPLAINABILITY_GAP).
6. **`resultStage`/`mayFinalize` orphaned** (WORKFLOW_GAP) — correct but inert; lowest urgency of the confirmed gaps because nothing currently displays it incorrectly, it simply displays nothing.
7. **Report omits most explainability signals** (REPORTING_GAP).

No gap was found to justify UI work purely because a backend field exists (`evidenceFactTrace` explicitly excluded on that basis).
