# Sentinel Safety Modularization Findings Summary

## Current State

Sentinel Safety is already structured around clear frontend routes, reusable components, frontend libraries, and modular backend services. The backend is more modular than the frontend. The frontend has useful reusable components already, but many pages still duplicate Tailwind class patterns directly inside page files.

## Existing Reusable UI Components

Current shared UI components:

- frontend-next/components/ui/EmptyState.tsx
- frontend-next/components/ui/MetricBlock.tsx
- frontend-next/components/ui/OperationalRow.tsx
- frontend-next/components/ui/PageHeader.tsx
- frontend-next/components/ui/PrimaryButton.tsx
- frontend-next/components/ui/SecondaryButton.tsx
- frontend-next/components/ui/SectionHeader.tsx
- frontend-next/components/ui/SentinelCard.tsx
- frontend-next/components/ui/StatusBadge.tsx

Current inspection layout components:

- frontend-next/components/inspection/layout/InspectionFieldGroup.tsx
- frontend-next/components/inspection/layout/InspectionMetricGrid.tsx
- frontend-next/components/inspection/layout/InspectionSectionCard.tsx
- frontend-next/components/inspection/layout/InspectionStatusMessage.tsx
- frontend-next/components/inspection/layout/InspectionStepShell.tsx

## Main Problem

The app has repeated visual patterns scattered across pages. This makes future UI changes slower because similar cards, buttons, inputs, badges, and title sections must be updated page-by-page.

## Highest-Value Consolidation Targets

### 1. AppButton

Repeated button patterns use:

- bg-[#102A43]
- bg-[#1D72B8]
- bg-[#F97316]
- rounded-xl
- font-black
- hover transitions
- disabled states

Recommended consolidation:

- AppButton variant="primary"
- AppButton variant="secondary"
- AppButton variant="accent"
- AppButton variant="danger"
- AppButton size="sm" | "md" | "lg"

### 2. AppInput / AppSelect / AppTextarea

Repeated input patterns use:

- rounded-xl
- border border-slate-300
- bg-white or bg-slate-50
- px-4 py-3
- text-sm font-bold
- outline-none
- focus:border-[#1D72B8]

Recommended consolidation:

- AppInput
- AppSelect
- AppTextarea

### 3. AppPanel / SentinelPanel

Repeated white card patterns use:

- rounded-2xl
- border border-slate-200
- bg-white
- p-4 or p-5
- shadow-sm

Recommended consolidation:

- AppPanel variant="default"
- AppPanel variant="subtle"
- AppPanel variant="dashed"
- AppPanel padding="sm" | "md" | "lg"

### 4. HeroPanel

Repeated dark header/hero panels use:

- overflow-hidden
- rounded-[1.75rem]
- bg-[#0B1320]
- p-5
- text-white
- shadow-sm
- sm:p-6

Recommended consolidation:

- HeroPanel align="left" | "center"
- HeroPanel tone="navy" | "slate"

### 5. Badge / StatusPill

Repeated badges use:

- rounded-full
- uppercase
- tracking-wide
- text-[10px] or text-xs
- font-black
- color variants

Recommended consolidation:

- Badge tone="slate" | "blue" | "orange" | "green" | "red" | "amber"

### 6. Page/Section Titles

Repeated title/subtitle styles use:

- text-slate-900
- text-slate-500
- font-black
- uppercase
- tracking-wide

Recommended consolidation:

- PageHeader already exists and should be used consistently.
- SectionHeader already exists and should be used consistently.
- Create smaller text primitives only if PageHeader/SectionHeader are insufficient.

## First Safe Patch Recommendation

The first patch should only add shared UI primitives. It should not refactor existing pages yet.

Recommended files to add:

- frontend-next/components/ui/AppButton.tsx
- frontend-next/components/ui/AppInput.tsx
- frontend-next/components/ui/AppPanel.tsx
- frontend-next/components/ui/HeroPanel.tsx
- frontend-next/components/ui/Badge.tsx

Recommended files to inspect before creating duplicates:

- frontend-next/components/ui/PrimaryButton.tsx
- frontend-next/components/ui/SecondaryButton.tsx
- frontend-next/components/ui/SentinelCard.tsx
- frontend-next/components/ui/StatusBadge.tsx
- frontend-next/components/ui/PageHeader.tsx
- frontend-next/components/ui/SectionHeader.tsx
- frontend-next/lib/design/tokens.ts

## First Refactor Target

After shared components are created and build passes, refactor one low-risk page only.

Best first candidates:

1. frontend-next/app/forgot-password/page.tsx
2. frontend-next/app/profile/page.tsx
3. frontend-next/app/settings/page.tsx

Avoid first-pass refactors in:

- frontend-next/app/inspection/page.tsx
- frontend-next/app/settings/workspace/page.tsx
- frontend-next/app/inspection-review/page.tsx
- frontend-next/components/inspection/*
- frontend-next/components/inspection/SafeScope*.tsx

## No-Visual-Change Rule

The first implementation pass must preserve the exact current appearance. The goal is to move repeated class strings into reusable components, not redesign the UI.

## Verification Required After Every Patch

Run:

./verify-local.sh

Then confirm:

git status --short
git diff --stat
git diff -- frontend-next | head -200

## Rollback

If anything looks wrong:

git restore frontend-next
git status --short

If the change was committed locally:

git reset --hard HEAD~1
