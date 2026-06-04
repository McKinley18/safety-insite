You are fixing a Vercel frontend build failure in Sentinel Safety.

Problem:
Vercel failed during Next.js TypeScript build with:

frontend-next/lib/safescope/export/narrative-export.bridge.ts:1:51
Type error: Cannot find module '../../../backend/src/safescope-v2/brain/narrative-generator/narrative.types' or its corresponding type declarations.

Cause:
The frontend is importing backend source files directly. Vercel builds the frontend app and cannot resolve backend-relative imports. Frontend code must not import from backend/src.

Current repo state:
- main is pushed to GitHub.
- HEAD should be 6560b16 Add SafeScope AI readiness manifest.
- Do not deploy manually. Do not push until local build passes.
- Fix locally, validate, commit, then show status.

Goal:
Fix the Vercel build by removing frontend imports from backend/src and replacing them with frontend-local SafeScope narrative/intelligence types.

Requirements:
1. Inspect:
   - frontend-next/lib/safescope/export/narrative-export.bridge.ts
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - backend/src/safescope-v2/brain/narrative-generator/narrative.types.ts
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
2. Do not import backend files into frontend code.
3. Create or update frontend-local type definitions under a frontend-safe path, such as:
   - frontend-next/lib/safescope/types/intelligence.types.ts
   - frontend-next/lib/safescope/types/narrative.types.ts
   or a single frontend-next/lib/safescope/types.ts
4. Move/copy only the minimal type shapes needed by the frontend:
   - SafeScopeNarrative
   - NarrativeMode
   - SafeScopeIntelligenceResult or frontend-safe equivalent
   - any display adapter input/output types needed
5. Update frontend imports to use the frontend-local type file.
6. Preserve the existing frontend adapter/export behavior.
7. Do not change backend logic unless necessary.
8. Run local validation:
   - cd frontend-next && npm run build
   - any available typecheck command if package.json defines one
9. Commit locally only after build passes with:
Fix frontend SafeScope backend type imports
10. After committing, show:
   - git status
   - git log --oneline -8
   - git show --stat --oneline HEAD
11. Do not push yet. Report results first.
