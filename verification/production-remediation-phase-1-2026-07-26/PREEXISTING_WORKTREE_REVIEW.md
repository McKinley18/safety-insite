# Pre-existing worktree review

Baseline: `main` at `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.

The five modified files below predated this phase. Their combined baseline diff was 938 insertions and 27 deletions. They were inspected before remediation and were not edited in this phase.

| File | Purpose and assessment |
|---|---|
| `inspection-citation-ranking.service.ts` | Adds spill and walking-surface citation ranking/suppression. Coherent HazLenz accuracy work; unrelated to foundation blockers. |
| `inspection-citation-recovery.service.ts` | Adds hazard-specific citation recovery for excavation, noise, stored energy, ladders, mine controls, asbestos and lead. Large but internally targeted; leave untouched. |
| `inspection-condition-assessment.service.ts` | Expands safe/unsafe evidence recognition. Accuracy work; leave untouched. |
| `standard-applicability.rules.ts` | Extends MSHA stored-energy applicability. Accuracy work; leave untouched. |
| `safescope-v2.service.ts` | Large integrated jurisdiction, clarification, citation, control and corrective-action changes. Monolithic and high-risk, but builds successfully; preserve for later focused review. |

Pre-existing untracked directories were `verification/full-production-audit-2026-07-26/` and `verification/hazlenz-authentic-validation-2026-07-22/`. Both were preserved.

`npm run build` in `backend/` passed with the five files present before and after foundation changes.
