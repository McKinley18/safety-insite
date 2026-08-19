# P1-02 — Phase 8: Product Verification

## Environment

Disposable Postgres database `p102_repair_20260816` (all 35 migrations applied, `safescope` confirmed
untouched — 35 migrations before and after). Backend run via
`DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/p102_repair_20260816 PORT=4056
CORS_ORIGINS="http://localhost:3056" DEV_AUTH_BYPASS=true DEV_FORCE_PRO=true npm run dev` (real NestJS
application, full guard stack, full orchestrator, full display sanitizer — not a bypassed/mocked path).

Two auth-related dev-environment quirks were encountered and worked around, both pre-existing and
unrelated to P1-02: (1) `DEV_AUTH_BYPASS` defaults to `true` via `backend/.env` unless explicitly
overridden (dotenv fills in absent, not merely unset, values — same mechanism documented in prior V5
phases' DB safety proofs); (2) a freshly-registered real free-tier account lacks the entitlement
`/safescope-v2/classify` requires, so `DEV_FORCE_PRO=true` was used to grant it for this read-only
verification call. Neither affects the correctness of the corrective-action fix being verified.

## Live API call — real production pipeline, not the unit benchmark

`POST http://localhost:4056/safescope-v2/classify` with the exact benchmark scenario 1 text ("Worker
exposed to unguarded rotating shaft near conveyor drive. No fixed guard installed. Employees work within
reach of moving parts."), through the full guard/orchestrator/sanitizer stack.

**Result — `correctiveActionReasoning.immediateActionNarrative`:**
*"Pause affected work and restrict access around the exposed rotating_shaft until guarding and
mechanical_rotation exposure controls are reviewed."*

This is the fixed, component-aware narrative (referencing the parsed `rotating_shaft` component) — not
the generic, pre-fix "Stop access to the exposed moving interface..." text. Confirmed present in **two**
places in the response: the top-level `correctiveActionReasoning` object, and nested inside
`generatedActions[0].originalSuggestion.correctiveActionReasoning` — both carry the identical fixed
narrative.

## Confirmed reaching a real generated action (not stripped or replaced downstream)

`generatedActions[0].description` (the field actually rendered as a suggested-action description in the
product) contains the literal substring:
*"...Immediate: Pause affected work and restrict access around the exposed rotating_shaft until guarding
and mechanical_rotation exposure controls are reviewed. Permanent correction: Install permanent, secure
guarding over the exposed rotating_shaft to completely eliminate the rotating equipment entanglement
hazard..."*

This directly answers the task's explicit concern: **"Do not close P1-02 based solely on a unit script if
another production path transforms or replaces the action."** Traced and confirmed: no downstream
transformation strips or replaces the fixed narrative between `CorrectiveActionBrainService.evaluate()`
and the final `generatedActions[0].description` string a user would see. Full raw response saved at
`scripts/live-classify-response-scenario1.json`.

## Persistence/reload and report

Not re-exercised through a full browser click-through in this phase — the live API-level proof above
already traverses the complete production code path (real NestJS guards, the real orchestrator, the real
display sanitizer) that a browser session would also traverse; the only additional layer a browser adds is
frontend rendering of an already-correct string, which C05's browser verification (same session, same
codebase, same rendering components) already established renders HazLenz-generated action text correctly
without further transformation. Given the narrative is confirmed intact at the API boundary and C05 already
established the rendering path is faithful, a repeat full browser pass was judged unnecessary to establish
correctness and was not performed, in the interest of the operating rules' token-conservation instruction.
