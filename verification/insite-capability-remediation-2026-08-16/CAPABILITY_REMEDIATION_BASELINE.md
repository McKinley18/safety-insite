# Phase 0 — Remediation Baseline

Date: 2026-08-16 (continuation of the same day's prior verification pass).

- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged since the prior phase's baseline)
- `git status --short` line count: 296 (identical to the end of the prior verification phase — no production files were touched between phases; the only additions are the prior phase's `verification/insite-hazlenz-capability-commercial-readiness-2026-08-16/` artifacts)
- Authoritative source for the four defects being repaired: `verification/insite-hazlenz-capability-commercial-readiness-2026-08-16/CAPABILITY_COMMERCIAL_IMPLEMENTATION_REPORT.md` plus `HAZLENZ_CAPABILITY_MATRIX.md`, `MULTI_HAZARD_VERIFICATION.md`, `DARK_MODE_COMPLETE_AUDIT.md`, `SUBSCRIPTION_PERMISSION_MATRIX.md`.

## Files expected to change this phase (pre-edit SHA-256 hashes)

```
b56104dbd302d3d5eb7a2ea57666693053caff3b2842aab20c3878bec83a5639  backend/src/safescope-v2/engine/deterministic-classifier.ts
6e48b3c0fb0f38d651cbc747eb056b78a4aa413b44b2769ed16075febe1828a8  backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts
acbd7282037153e40bd362cc440a5b094c7e1434991b590f095527d785f9912e  backend/src/safescope-v2/reasoning-orchestrator/negation-context.util.ts
c357b11e4a2a18f0ee6c1f95bc746f9091e82ef19cbd034184b25c1052291edb  backend/src/safescope-v2/evidence/shared-evidence-facts.ts
c533e3cf138751806e97845a0f4262fda858aced5d254c48d4a168ca8851fb06  backend/src/corrective-actions/corrective-actions.controller.ts
142d45bfcb9c2b2e7b8d436ab6f8254618de620a2bb57600192389c5b4a1d0f6  backend/src/corrective-actions/corrective-actions.service.ts
ecf91d48d8ddd9a78baddd6719e5bd32950eea8821e677001f1dd585646c5ad4  frontend-next/components/system/ThemeController.tsx
28f37c212a95b23ef1b5b831f7663389860413eb4c8709baa5cf62752de93134  frontend-next/lib/theme/themeTokens.ts
07714182616530797db1f4b40ad8298d5a0ba27c38bc63cd90f8af1ca0e99168  frontend-next/app/layout.tsx
b5af30ad97b4e0d504cae4ae3ecd3623805365796c6a676e668fd37a1fa8be08  frontend-next/app/hazlenz/page.tsx
01999103924fe5b615cba35f22a7968624dc17f025d8844906ac56a6148dc8fa  frontend-next/components/billing/BillingSettingsPanel.tsx
```

Note: this is the anticipated set based on the prior phase's root-cause pointers; the actual edited-file list is recorded in the final implementation report and may differ once root-causing is complete (e.g. corrective-actions gating may also require a frontend component not listed here, or the theme fix may land in a different file once fully traced).

## Protected/prior artifact state (not independently re-hashed this phase — reused from the prior verification's own records)

- V4 family matrix: 225/228 on the prior live run, all 3 misses confirmed transient-transport on retest (effectively 228/228 classification-correct) — see prior phase's `CAPABILITY_COMMERCIAL_REGRESSION.md`.
- V5-C01–C05, P1-02, PRA-002: not independently re-verified in the prior phase; this phase (Phase 25) re-runs them.
- Backend build: PASS. Frontend build: PASS. `git diff --check`: PASS. (Re-confirmed below.)
