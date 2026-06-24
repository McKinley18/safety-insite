# Safety InSite Naming Policy

## Current customer-facing names

- App / platform: Safety InSite
- AI engine: HazLenz AI

## Legacy names

The following names are legacy and should not appear in customer-facing copy:

- Sentinel Safety
- SafeScope
- ReviewCore
- GuideGuard
- SightSignal
- AuditAlly

## Internal compatibility

Some internal code identifiers, API routes, database fields, and local-storage keys may temporarily keep legacy names to avoid breaking the app.

Examples that may remain temporarily:

- `/safescope-v2/classify`
- `safeScopeResult`
- `SafeScopeStandardsSection`
- `includeSafeScopeNotesInReport`
- `safescope_*` internal engine IDs

These should be hidden behind adapters/constants and renamed only during controlled refactor passes.

## Refactor rule

Do not perform broad find-and-replace across the whole repo unless imports, routes, storage keys, report fields, and API contracts are covered by compatibility aliases.
