# Sentinel Safety Visual Revamp Checkpoint

## Purpose

This checkpoint captures the app before the full visual revamp so the build stays organized, modular, and easy to recover.

## Current Frontend

Active frontend: frontend-next/

Primary styling files:
- frontend-next/app/globals.css
- frontend-next/lib/theme/*
- frontend-next/components/layout/AppShell.tsx
- frontend-next/components/ui/*

## Theme Layer

A centralized theme layer now exists at:
- frontend-next/lib/theme/sentinelTheme.ts
- frontend-next/lib/theme/pageShells.ts
- frontend-next/lib/theme/statusStyles.ts
- frontend-next/lib/theme/index.ts

## Theme Layer Purpose

The theme layer should:
- reduce repeated hardcoded styles across pages
- keep Sentinel Safety visually consistent
- make the app easier to revamp page-by-page
- centralize page shells, cards, buttons, forms, badges, status tones, priority tones, and risk tones
- preserve the modular build structure

## Current Global Visual Classes

The global CSS includes reusable Sentinel classes:
- sentinel-page-shell
- sentinel-page-header
- sentinel-eyebrow
- sentinel-page-title
- sentinel-page-subtitle
- sentinel-card
- sentinel-card-strong
- sentinel-card-muted
- sentinel-section-title
- sentinel-section-subtitle
- sentinel-metric-card
- sentinel-metric-label
- sentinel-metric-value
- sentinel-primary-button
- sentinel-secondary-button
- sentinel-input
- sentinel-status-pill

## Revamp Order

1. Shared UI components and global styles
2. Command Center
3. Inspections, Reports, Actions
4. Inspection workflow pages
5. Analytics, Calendar, Settings, Company, Profile
6. SafeScope intelligence pages
7. Public, auth, pricing, and marketing pages
8. Final mobile polish

## Current App Routes

- /
- /about
- /actions
- /analytics
- /command-center
- /company
- /forgot-password
- /inspection
- /inspection-cover
- /inspection-quick
- /inspection-review
- /inspection-walkthrough
- /inspections
- /legal
- /login
- /pricing
- /profile
- /register
- /reports
- /safescope
- /safescope-knowledge
- /safescope-knowledge/review
- /safety-calendar
- /settings
- /settings/workspace
- /unlock
- /upgrade

## Rules for Future Visual Edits

- Preserve working app logic.
- Keep styling modular.
- Prefer theme constants and shared Sentinel classes.
- Do not break Company-tier gating.
- Do not change auth behavior unless explicitly requested.
- Keep SafeScope advisory-only and qualified-review language intact.
- Preserve report and audit traceability features.
- Build after every batch.
- Commit locally only after clean builds.
- Do not push or deploy unless explicitly requested.

## Latest Known Build Status

npm run build passed on June 13, 2026 after creating the theme layer.

## Current Known Modified Files

At checkpoint time, the working tree contained:
- frontend-next/app/command-center/page.tsx
- frontend-next/app/globals.css
- frontend-next/components/inspection/InspectionWorkflowHeader.tsx
- docs/checkpoints/visual-revamp-checkpoint-2026-06-13.md
- frontend-next/lib/theme/*

The inspection workflow header should be inspected before committing because it was already modified before the theme layer work.
