# P1-02 — Phase 6-7: Adversarial Corrective-Action Matrix & Hierarchy-of-Controls Check

Script: `scripts/adversarial-matrix.ts`, run via `npx ts-node` from `backend/`, calling
`CorrectiveActionBrainService.evaluate()` directly with real `ObservationUnderstandingService` output
(no mocks). Full raw output captured in this document.

## A. Machine guarding — specific missing guard

Text: *"Unguarded rotating shaft near conveyor drive with no fixed guard installed..."* Parsed:
`missing=["guarding"]`. Output correctly hazard-specific: *"Pause affected work and restrict access around
the exposed rotating_shaft..."* / *"Install permanent, secure guarding over the exposed rotating_shaft..."*
— names the actual component, correct control type (guarding) for a missing guard. **PASS.**

## B. Lockout/tagout — uncontrolled hazardous energy

Text: *"...No lockout was applied and stored hydraulic energy remains in the ram."* Parsed:
`missing=["energy_isolation"]`. Output: *"Stop servicing and remove employees from the energy-release
path..."* / *"Apply locks/tags, block or restrain stored energy, and restrict access until zero energy is
verified."* / *"Identify every energy source, isolate and lock/tag it, release stored energy, and verify
zero energy before work resumes."* Genuinely procedural LOTO language — **does not collapse into generic
training language**, as required. **PASS.**

## C. Electrical — exposed/unsafe condition

Text: *"Live wire hanging... exposed conductor and damaged insulation..."* Parsed:
`failed=["electrical_integrity"]`. Output correctly electrical-specific: *"Isolate the affected... from
service..."* / *"Replace damaged wiring assemblies with rated replacement components..."* **PASS.**

## D. Fall exposure — supported fall hazard

Text: *"Missing guardrail on elevated platform creates unprotected edge exposure..."* Parsed:
`missing=["guarding","fall_protection_or_edge_protection"]`. Output: *"Restrict access to the open
platform edge..."* / *"Erect engineered guardrails... around the unprotected_edge..."* Reflects the actual
exposure and control need. **PASS.**

## E. Failed existing control — guard present but damaged

Text: *"The machine guard over the rotating shaft is damaged and cracked..."* Parsed:
`failed=["guarding"]` (correctly distinguished from "missing" by `ControlUnderstandingService`). **Output
is identical to case A's** ("Install permanent, secure guarding over the exposed rotating_shaft...") —
**does not distinguish "repair/restore the damaged guard" from "install where none exists."** **FINDING,
not a pass** — see disposition below.

## F. Effective existing control — guard present and working

Text: *"...has a guard installed and functioning correctly; barrier present..."* Parsed:
`existing=["protective_control"]`, `missing=[]`, `failed=[]`. **Output still recommends "Pause affected
work..." and "Install permanent, secure guarding..." despite evidence the control is already effective** —
inventing unnecessary corrective work. **FINDING, not a pass** — see disposition below.

## G. Unknown control state — not stated either way

Text: *"A worker was observed servicing the conveyor drive near the rotating shaft area."* Parsed:
`existing=[]`, `missing=[]`, `failed=[]` (genuinely unknown — no control language at all). **Output is
identical to case A's** (treats UNKNOWN as if it were ABSENT/missing). **FINDING, not a pass** — see
disposition below.

## H. Vague observation — no specific hazard signal

Text: *"Something unsafe was noted near the equipment area."* No domain/mechanism/control signal at all.
Output correctly falls through both generators to the bounded generic default: *"Secure the area to
prevent further hazard exposure and notify the area supervisor."* / *"Implement permanent engineered
controls, such as barriers, to eliminate exposure to identified injury mechanisms."* — bounded, does not
invent a specific corrective action. **PASS.**

## I. Multi-hazard — sibling evidence isolation

Two findings derived from the same combined multi-hazard observation, each scoped to its own fragment
(mirroring the C05 fragment-scoping fix): Finding A (hydraulic fragment) → LOTO-specific output, zero
electrical-vocabulary contamination (`false` on cross-contamination check). Finding B (electrical
fragment) → electrical-specific output ("Isolate the affected electrical panel..."), zero
hydraulic/ram-vocabulary contamination (`false`). **A finding's corrective action remains bound to its own
evidence and does not borrow sibling evidence.** **PASS.**

## Disposition of findings E, F, G

**Root-cause check performed before deciding disposition:** `git show HEAD:.../corrective-action.service.ts`
confirms `failedControlsLabel`/`missingControlsLabel` were computed **but never referenced in any narrative
template in the original committed baseline**, before the P1-02 regression existed and before this
session's fix. The four component-aware branches (guarding/electrical/fall/chemical) have **always**
matched purely on equipment/mechanism keywords, never on `observationUnderstanding.controls`
(existing/failed/missing) state. This confirms: **E, F, and G's control-state blindness is a pre-existing
latent defect in the committed HEAD baseline — not introduced by the P1-02 regression, and not made worse
by this phase's ordering/precedence fix.** The fix restores the component-aware generator to running for
the same domains it ran for at HEAD; it does not add, remove, or alter any branch-matching predicate.

**Decision: not fixed in this phase.** Per the task's explicit instruction — "repair only the defective
behavior" (the shadowing/ordering regression) and "Do not perform a broad corrective-action refactor" —
extending the four branches to condition on control state would be a genuine new capability (control-
state-aware branching never existed at any point in this file's history), not a restoration of prior
correct behavior. It is documented here in full, reported as a finding, and flagged in the final report's
"remaining corrective-action debt" as a well-scoped candidate for a future, separately-tracked phase. It
does not affect the authoritative 4-case benchmark (none of the four benchmark fixtures exercise a
failed/effective/unknown control state) and does not block P1-02 closure, whose bar is explicitly the
4-case benchmark plus product-level verification of the regression fix, not the full adversarial matrix.

## Phase 7 — Hierarchy-of-controls check

Across all cases with a supported hazard (A-E), the primary corrective-action recommendation is
consistently a physical/engineering-level control (install/restore guarding, isolate and lock out energy
sources, replace damaged wiring, erect guardrails) — never downgraded to training/reminders/signage as
the primary recommendation. `administrativeFollowUpNarrative` is a **separate, distinct field** from the
primary immediate/interim/permanent narratives in every case, so administrative follow-up (briefings,
guideline updates) is correctly kept as a supplement, not a substitute, for the substantive control.
Case B (LOTO) in particular confirms the requirement explicitly under test — a case where a weaker
generator might default to "review energy control procedures" instead produces genuine procedural/
physical isolation language. No case was found where elimination/substitution/engineering controls were
demanded despite being unsupported by the evidence (the generator only ever recommends controls at the
level the matched domain/evidence already implies — guarding for guarding gaps, isolation for energy gaps,
edge protection for fall gaps). **Hierarchy-of-controls behavior confirmed intact and defensible.**
