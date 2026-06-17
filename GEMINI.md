# Gemini Operating Guide

Use these current InSite / HazLenz AI transition documents as the source of truth:

1. INSITE_HAZLENZ_TRANSITION_PHASES.md
2. INSITE_CURRENT_BUILD_BLUEPRINT_REVISED.md
3. INSITE_CURRENT_BUILD_BLUEPRINT.md

Current product identity:
- App/platform: InSite
- AI engine: HazLenz AI

Legacy/internal names may still exist temporarily:
- Sentinel Safety
- SafeScope
- ReviewCore
- GuideGuard
- SightSignal
- AuditAlly

Follow the transition phases before making code changes.

Important guardrails:
- Keep InSite inspection-first.
- Update visible copy before internal service names.
- Do not rename backend/src/safescope-v2 yet.
- Do not change /safescope-v2/classify yet.
- Add HazLenz-named wrappers/aliases before deeper service refactors.
- Keep frontend and backend builds passing.
- Do not push or deploy unless explicitly instructed.
