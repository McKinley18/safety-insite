# Marketing Claims Correction — HazLenz Hazard Reasoning Copy

Date: 2026-08-16

## Ground truth relied on (established this session, not re-derived here)

- `backend/src/safescope-v2/engine/deterministic-classifier.ts` is a keyword/phrase-weighted
  scorer (`score += 3/2/1` per match tier, confidence thresholds off the summed score) — it does
  not model "physical energy pathways" or "barrier failure modes."
- No external LLM is called anywhere in the classify path — HazLenz is deterministic/structured
  reasoning over authored rules and an evidence graph, not generative AI.
- A separate, real, concurrently-worked defect: the classifier does not yet reliably distinguish
  "control present but broken" from "control verified effective." Copy must not claim more
  precision on control-effectiveness than that.

## Edit 1 — primary false claim (fixed)

File: `frontend-next/app/hazlenz/page.tsx`, `sections` array, entry originally at lines 13-16
(now lines 13-16 post-edit, same position in the array).

**Old (title + body):**
> Hazard mechanism reasoning
>
> "Instead of simple keyword matching, the engine analyzes physical energy pathways (e.g., mechanical rotation, gravity, electrical) and barrier failure modes to identify plausible ways harm could occur in a given scenario."

**New (title + body):**
> Hazard pattern reasoning
>
> "The engine recognizes hazard patterns and terminology across free-text safety observations, and when a single observation describes more than one hazard, it decomposes the passage into separate, independently tracked findings rather than folding them into one general note."

**Justification:** The old copy explicitly claimed physics-based causal modeling ("energy
pathways," "barrier failure modes") that the deterministic classifier does not perform — it is a
weighted keyword/phrase scorer. The new copy describes two capabilities independently verified
this session: (1) recognition of hazard patterns/terminology in free text, and (2) decomposition
of a single observation into multiple independent hazard findings when more than one hazard is
described. It also drops the old "instead of simple keyword matching" framing, since the engine
is in fact keyword/phrase-weighted — asserting otherwise was the core defect. No claim of
guaranteed/exhaustive detection, energy-pathway/barrier-failure-mode analysis, or LLM use is
made.

## Edit 2 — adjacent overstated claim (softened)

Same file, `sections` array, "Structured observation understanding" entry, line 11.

**Old:**
> "...including equipment category, components in use, active worker tasks, exposure pathways, energy sources, and control failures."

**New:**
> "...including equipment category, components in use, active worker tasks, exposure pathways, energy sources, and control-related details."

**Justification:** "control failures" asserted a specific determination (that a control is broken)
which the classifier cannot yet reliably distinguish from "control present and verified
effective" — a known, separately-tracked defect. "Control-related details" describes the same
extracted field without implying a precision the system doesn't currently have.

## Claim reviewed and left unchanged

File: `frontend-next/components/pricing/PricingContent.tsx:391` (note: actual path is
`components/pricing/PricingContent.tsx`, not `app/pricing/PricingContent.tsx` as referenced in
the task — no `app/pricing/PricingContent.tsx` exists; `app/pricing/page.tsx` renders this
component).

**Text (unchanged):**
> "Don't just record hazards. Understand them, correct them, and prove they were addressed."

**Justification for no change:** This is a generic marketing headline/value-proposition
statement, not a specific technical capability claim about how hazard analysis is performed (no
mention of mechanism, method, or precision level). It does not assert energy-pathway/barrier
analysis, exhaustive detection, or replacement of professional judgment. Read in context of the
qualified-review disclaimers present elsewhere on the site, it is reasonably hedged as-is and was
left as-is per the task's guidance to keep claims that already read as adequately hedged.

## Verification performed

1. Read full `frontend-next/app/hazlenz/page.tsx` before editing to confirm current line numbers
   and match voice/length of sibling sections.
2. Applied both edits via the `Edit` tool (targeted string replacement — no other page content
   touched).
3. Confirmed no `backend/`, `ThemeController.tsx`, `lib/theme/**`, `app/layout.tsx`, or
   corrective-actions files were touched.
4. `curl http://127.0.0.1:3001/hazlenz` (dev server, already running against disposable backend
   on :4001) returned HTTP 200; grepped rendered HTML and confirmed:
   - New strings present: "Hazard pattern reasoning", "recognizes hazard patterns and
     terminology...", "control-related details".
   - Old strings absent: "energy pathways", "barrier failure modes".
5. `npm run build` (production build, Next.js 16.2.12 / Turbopack) completed successfully —
   compiled, type-checked, and statically generated all 26 routes including `/hazlenz` with no
   errors.

## Files changed

- `frontend-next/app/hazlenz/page.tsx` (2 string edits, both inside the `sections` array; no
  other lines touched)

## Repository/worktree state

No commits made. No files staged or pushed. `components/pricing/PricingContent.tsx` was read
only, not modified. No files under `backend/`, `ThemeController.tsx`, `lib/theme/**`,
`app/layout.tsx`, or corrective-actions components were touched.
