# P1-02 — Corrective-Action Narrative Regression Repair — Implementation Report

Date: 2026-08-16. Repository: `/Users/mckinley/Desktop/Safety_InSite`, branch `main`.

## Completion status

**P1_02_CLOSED.** The authoritative 4-case benchmark is 4/4 PASS, and product-level verification (a real
API call through the full guard/orchestrator/sanitizer stack, not the unit benchmark alone) confirms the
corrected narrative reaches a real `generatedActions[0].description` — the field actually surfaced to
users.

## 1. Status

`P1_02_CLOSED`.

## 2. Release gate

Reassessed: `PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`. Rationale below (item 44).

## 3. P0 count

**0.**

## 4. P1 count

**0.** P1-02 was the sole remaining P1; it is now closed. No new P0/P1 was discovered during this phase
(see item 44 for the disposition of adversarial-matrix findings).

## 5. Authoritative benchmark before

1 passed, 3 failed (scenarios 1, 2, 3 failing on tailored-phrase and/or equipment-reference assertions;
scenario 4 passing) — reproduced exactly as documented in the midpoint audit and C05 regression records.

## 6. Authoritative benchmark after

**4 passed, 0 failed.** All four scenarios pass every assertion, including the exact tailored-phrase
strings.

## 7. Exact root cause

A newer, uncommitted domain-coarse fallback block was inserted before the pre-existing, more specific
`observationUnderstanding`-driven generator, and the specific generator's guard was changed from
`if (observationUnderstanding)` to `if (observationUnderstanding && !(domainIsWalking ||
domainIsElectrical || domainIsMobile || domainIsFall || domainIsGuarding))`. The excluded domain
categories are exactly the ones the specific generator specializes in, so it never ran for
guarding/electrical/fall observations regardless of how rich the actual parsed evidence was.

## 8. First incorrect decision point

The negated-domain exclusion clause on the specific generator's guard (originally simply
`if (observationUnderstanding)`, changed to exclude five domain categories that happen to be exactly the
categories the generator specializes in).

## 9. Production change

Reordered the two generators so the specific, `observationUnderstanding`-driven generator always runs
first (restored to its original, un-excluded guard) and sets a new boolean flag
(`handledByComponentAwareGenerator`) when it produces a result; the domain-coarse fallback (previously
unconditional) now only runs when that flag is false. No narrative wording changed. No new import, no
changed function signature, no changed return shape.

## 10. Why the fix is minimal

Single file touched. No new generator, no benchmark-specific strings inserted, no wording changed anywhere
— only control-flow ordering and gating. Every string in both generators is byte-identical to what existed
before the fix; only which generator's assignment "wins" changed. Diff is a reordering plus one new
boolean, not a rewrite.

## 11. Generic fallback behavior

Confirmed still correctly bounded: vague/unclassifiable observations (adversarial case H) fall through
both generators to the pre-existing generic top-of-function defaults, producing non-specific but safe
language ("Secure the area to prevent further hazard exposure...") — never inventing a specific
corrective action beyond what the evidence supports.

## 12. Component-aware behavior

Confirmed restored: for the four families it specializes in (guarding, electrical, fall, chemical), the
generator now runs whenever `observationUnderstanding` is present and matches, producing genuinely
component-specific narratives (naming the parsed component/equipment) — matching the exact wording the
authoritative benchmark expects.

## 13. Machine-guarding result

PASS. "Pause affected work and restrict access around the exposed rotating_shaft until guarding and
mechanical_rotation exposure controls are reviewed." / "Install permanent, secure guarding over the
exposed rotating_shaft..." — live-verified through the real `/safescope-v2/classify` API.

## 14. LOTO result

PASS (via the domain-coarse fallback, which the specific generator does not cover). "Stop servicing and
remove employees from the energy-release path until all hazardous energy is isolated." / "Apply locks/
tags, block or restrain stored energy, and restrict access until zero energy is verified." — genuinely
procedural, not generic training language.

## 15. Electrical result

PASS. "Isolate the affected [equipment] from service..." / "Replace damaged wiring assemblies with rated
replacement components..." — electrical-specific.

## 16. Fall result

PASS. "Restrict access to the open platform edge..." / "Erect engineered guardrails... around the
unprotected_edge..." — matches the exact benchmark-expected phrasing.

## 17. Failed-control result

**Finding, not a full pass** (adversarial case E). A damaged-but-present guard receives the same "install"
language as a missing guard — does not distinguish repair/restore from install-where-none-exists.
**Confirmed pre-existing** (present in HEAD's committed code before the P1-02 regression ever existed;
`failedControlsLabel` was computed but never referenced in any narrative template at HEAD either). Not
fixed in this phase — see item 43.

## 18. Effective-control result

**Finding, not a pass** (adversarial case F). A guard confirmed installed and functioning still triggers a
full "pause work, install guarding" recommendation — the generator does not check
`observationUnderstanding.controls.existingControls` before recommending. **Confirmed pre-existing**, same
root cause as item 17. Not fixed in this phase — see item 43.

## 19. Unknown-control result

**Finding, not a pass** (adversarial case G). An observation with no control-state language at all
produces the same output as a confirmed-missing-guard case — UNKNOWN is treated as ABSENT. **Confirmed
pre-existing**, same root cause as items 17-18. Not fixed in this phase — see item 43.

## 20. Vague-input result

PASS. Bounded generic output, no invented specificity (adversarial case H).

## 21. Multi-hazard result

PASS. Two findings derived from one multi-hazard observation, each scoped to its own fragment, produced
zero cross-contamination of vocabulary between findings (adversarial case I).

## 22. Hierarchy-of-controls result

PASS. All hazard-supported cases recommend physical/engineering-level controls as the primary action;
administrative follow-up remains a distinct, supplementary field in every case; no case demanded an
unsupported elimination/substitution/engineering control, and no case defaulted to administrative-only
language when physical/procedural control was evidenced (LOTO case is the clearest confirmation).

## 23. Browser/product verification

Real API call (not the isolated unit benchmark) through the full NestJS guard/orchestrator/sanitizer stack
against a disposable database confirmed the fixed narrative reaches `correctiveActionReasoning
.immediateActionNarrative`/`.permanentCorrectionNarrative` **and** the final `generatedActions[0]
.description` string — the field a real user's report/UI would render. Full raw response saved at
`scripts/live-classify-response-scenario1.json`. A full browser click-through was not additionally
performed; the API-level trace already crosses every transformation layer between generation and the
string a user sees, and C05 (same session) already established the frontend renders this class of
HazLenz-generated text faithfully without further mutation.

## 24. Persistence/reload result

Not separately re-exercised; unaffected by this change (P1-02 touches only narrative *content* selection,
not the persistence layer, which is identical before and after).

## 25. Report result

Confirmed via the API-level trace (item 23) that the fixed narrative reaches the field
(`generatedActions[].description`) that report generation consumes.

## 26. V4 regression

None. Protected files byte-identical to baseline hash.

## 27. V5-C01 regression

None. Files byte-identical; `test-finding-scoped-reviews.ts` re-confirmed `passed:true` live.

## 28. V5-C02 regression

None. Files byte-identical, untouched.

## 29. V5-C03 regression

None. Files byte-identical, untouched.

## 30. V5-C04 regression

None. Deleted-file count unchanged (15), all 6 paths still deleted.

## 31. V5-C05 regression

None. All 5 C05-modified files byte-identical to their post-C05 hashes.

## 32. PRA-002 regression

None. `test-finding-scoped-reviews.ts`: `passed:true`.

## 33. Clarification regression

None — no code-path overlap between this fix and clarification machinery.

## 34. Authorization regression

None. Real per-user auth boundaries exercised successfully in both regression scripts run this phase.

## 35. Protected hashes

All confirmed byte-identical to the P1-02 baseline except the one intentionally modified file
(`corrective-action.service.ts`, hash changed from `b76b99484d232c851ab47f8d4bac59ad02d68e2e` to
`32f057a670499f59e1de78e4b299b5805f6059e1`).

## 36. Backend build

`cd backend && npm run build` (`tsc`) — **PASS**, exit 0.

## 37. Frontend build

**Omitted, justified.** Zero frontend files modified; the API response's field names/types are unchanged
(only narrative string values differ for domain-matched observations), so no frontend compilation or
type-checking surface is affected.

## 38. git diff --check

**PASS**, clean, exit 0.

## 39. HEAD before/after

`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` before and after. Unchanged. No commits made.

## 40. Files modified/added/deleted

**Modified (1):** `backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts`.

**Added:** this phase's own audit directory and artifacts/scripts
(`verification/hazlenz-v5-p1-02-corrective-action-repair-2026-08-16/`).

**Deleted:** none.

## 41. Working-tree preservation

Confirmed: modified-file count 100 (unchanged — `corrective-action.service.ts` was already counted as
modified before this phase, since it was already part of the pre-existing P1-02 regression; editing it
further does not add a new entry), deleted-file count 15 (unchanged), untracked-file count 162 (161 + this
phase's own new audit directory). No pre-existing unrelated work was touched, reset, stashed, or
discarded.

## 42. Disposable infrastructure teardown

Backend dev server (port 4056) stopped. Disposable database `p102_repair_20260816` dropped, confirmed
absent via `pg_database` query after drop. `safescope`'s migrations count re-verified at 35 (unchanged)
immediately before the drop.

## 43. Remaining corrective-action debt

The adversarial matrix (Phase 6) surfaced a genuine, **pre-existing** (confirmed present at HEAD, not
introduced by P1-02 or this fix) gap: the component-aware generator's four hazard-family branches match
purely on equipment/mechanism keywords and never consult `observationUnderstanding.controls`
(existing/failed/missing), so a confirmed-effective control still triggers a full corrective-action
recommendation (case F), and a failed-but-present control receives the same "install" language as a
missing one (case E) rather than "repair/restore" (case E), and an unstated/unknown control state is
treated identically to a confirmed-missing one (case G). This is the same underlying architectural gap
already tracked as P2 item #1 in the midpoint audit's release-gate reassessment ("Control-effectiveness
intelligence is dead code on both flows; risk scoring is control-blind") — this phase's adversarial testing
extends that finding from risk-scoring into corrective-action narrative selection specifically. Not fixed
in this phase per the explicit instruction to repair only the shadowing regression and avoid a broad
corrective-action refactor. Recommended as a well-scoped future phase: "wire `observationUnderstanding
.controls` state into the four component-aware branches to distinguish missing/failed/effective/unknown
control states" — narrow, testable, and independent of the ordering fix delivered here.

## 44. Final P1-02 disposition

**P1_02_CLOSED.** No new P0/P1 was discovered during this phase — the adversarial-matrix findings (item
43) reinforce an already-tracked P2 issue rather than constituting a new P1; they do not corrupt data,
crash any workflow, or contradict the safety-bound evidence rule (the generator's output, while sometimes
imprecise about control state, never recommends removing a needed control or claims a hazard is resolved
when it is not — see `P1_02_ROOT_CAUSE.md`'s substantive-impact analysis and `P1_02_ADVERSARIAL_MATRIX.md`'s
finding-by-finding disposition).

**Release-gate reassessment (per the explicit rule):** P0 = 0, P1 = 0 → the gate is reassessed for return
to `PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`. The midpoint audit's remaining P2 (6 items) and P3
(3 items) were explicitly triaged there as non-blocking — none represents a data-integrity, safety-
override, or crash-class defect; each is a specificity/UX/explainability gap with a documented, bounded
workaround (human review remains required and visible throughout). This phase's own new finding (item 43)
is an instance of an already-counted P2 item, not an additional one. **No remaining P2/P3 issue, individually
or in combination, justifies retaining the stronger `PRODUCTION_READY_WITH_TRACKED_P1_ISSUES` warning now
that the tracked P1 is closed. Gate returns to `PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`.**

## 45. Recommended next step

Return to the midpoint audit's re-ranked backlog (`verification/hazlenz-v5-midpoint-audit-2026-08-16/
V5_MIDPOINT_BACKLOG.md`) for the next HIGH-priority item, now that both tracked P1s are closed. Its
top-ranked HIGH item — wiring live control/domain-intelligence into risk scoring — is directly adjacent to
this phase's newly-documented corrective-action control-state gap (item 43); consider scoping a single
future phase to address both together, since they share the same root cause (control-effectiveness
signal computed but never consulted downstream) and the same evidence source
(`observationUnderstanding.controls` / `ControlIntelligenceService`).
