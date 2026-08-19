# V4 Governance Closure Milestone

## Current Candidate (production, unchanged)
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- safescope hash: `f076a568396a76e810191fd3b82b40acb342bd6781ee072ef4254e33ad5c986a`
- multi-hazard hash: `6e48b3c0fb0f38d651cbc747eb056b78a4aa413b44b2769ed16075febe1828a8`
- taxonomy-map hash: `1d75b2a517d359d59860f00a17868ac2116821a1540df4dea43bbd9da3359470`
- Disposable DB: `phase127_v4tier3_20260815` (torn down after run); original `safescope` untouched.

## V3 (immutable, historical)
- Result: 227/228 (positive 76/76, negative 76/76, ambiguity 37/38, safe/control 38/38)
- `HAZLENZ_FAMILY_MATRIX_V3_ENGINEERING_CLOSED`: true
- All V3 source hashes verified unchanged at both start and end of this pass.

## V4 Live Authoritative Result

| Kind | Pass/Total |
|---|---|
| Positive | 76/76 |
| Negative | 76/76 |
| Ambiguity | **38/38** |
| Safe/control | 38/38 |
| **Overall** | **228/228 (100%)** |

Transport failures: 0. Non-FM-155 changed outcomes: 0.

## FM-155 Under V4
- `hot_work`: ACTIVE (unchanged, unsuppressed — production emitted the identical finding it always has)
- `welding_fumes`: absent (unchanged — never falsely promoted, exactly as under V3)
- Scoring rule applied: `V4_FAMILY_RELATIVE` (forbiddenFamilies=`["welding_fumes"]`, hot_work not forbidden)
- Outcome: PASS
- **Production was not modified to obtain this result.**

## Static Proof (pre-live)
Re-scored the existing `CURRENT_20260815F` raw findings under V3 and V4 rules: V3 = 227/228, V4 = 228/228, exactly 1 changed outcome (FM-155), 227/227 other rows byte-identical.

## Family Capability (V4)
- Confirmed: 38/38
- Partial: 0
- Failing: 0
- Engineering defects: 0
- Adjudication defects: 0

## Decision
**HAZLENZ_FAMILY_MATRIX_V4_CLOSED.**
`HAZLENZ_FAMILY_MATRIX_V3_ENGINEERING_CLOSED` remains separately true and historically reproducible.

This declares the frozen family matrix closed under the V4 adjudicated contract. It does **not** declare the application production-ready — that requires separate final release validation.
