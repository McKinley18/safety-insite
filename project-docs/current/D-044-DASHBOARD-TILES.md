# D-044 — the four dashboard tiles: current set, and the minimal correction

**§284 changed nothing.** The direction was: report the actual current set first, and if Open
Actions is present but the fourth metric differs, return the set and a proposed minimal correction
**before** implementing a subjective metric change. That is what this is.

---

## The actual current four tiles

Read from `app/command-center/page.tsx:239-242`, which is the only place they are defined.

| # | key | label | description under the figure | source |
|---|---|---|---|---|
| 1 | `inspections` | **Inspections** | Records on this account | `listPersistedInspections()` — server |
| 2 | `reports` | **Reports** | Generated report packages | `listPersistedReports()` — server |
| 3 | `openActions` | **Open Actions** | Active follow-up work | `getSafetyCalendarSnapshot()` — server, reconciled |
| 4 | `overdue` | **Overdue** | Needs attention | the same snapshot, filtered to due-before-today and still open |

Every one is a `DataValue`, so a tile that did not reach the server renders an em dash and a
caption rather than a zero (§281, D-041).

## Against the preferred set

| preferred | present? | |
|---|---|---|
| INSPECTIONS | **yes** | tile 1, exact match |
| FINDINGS | **no** | |
| OPEN ACTIONS | **yes** | tile 3, exact match |
| OVERDUE ACTIONS | **yes, as `Overdue`** | tile 4. Same metric — it is derived from the same calendar snapshot as Open Actions and counts only actions — but the **label omits the noun** |

So: **three of four match. Open Actions is present. The fourth metric differs: the board carries
`Reports` where the preferred set asks for `Findings`.**

## Why `Findings` is not there, and what it would cost

This is not an oversight and it is not a subjective preference. §281 removed a Findings tile
because it was **structurally always zero**: it counted from `lib/reportStorage` /
`lib/actionStorage` / `lib/activityStorage`, three device-local stores whose only writers lived in
the `/inspection` cycle D-038 retired. Measured against a real account with seven inspections and
nine observations on the server, fully online, the board read `0 REPORTS 0 FINDINGS 0 OPEN ACTIONS
0 OVERDUE`. The tile was replaced with Inspections, which the server answers exactly for every plan.

**The obstacle is still there.** There is no unprivileged server aggregate for "findings across my
inspections":

- `GET /inspections` returns bare inspection rows with no findings relation.
- Per-inspection detail carries `findings`, but one call per inspection is not a dashboard load.
- `/dashboard/*` is behind the paid `analytics` entitlement, so a Free account cannot read it —
  and the dashboard is the first screen a Free account sees.

Restoring Findings therefore needs **server support**, not a frontend change. A frontend-only
version would either fan out N+1 requests on first paint or show an em dash for every Free account,
and the second is what D-041 exists to prevent.

## Proposed minimal correction

Two parts, and the first is free.

**1. Rename tile 4 `Overdue` → `Overdue Actions`.** Pure label. It already counts exactly overdue
actions; the noun is missing and the preferred set names it. One line, no metric change, no server
work. *(Check the 390px layout when doing it — the tiles are a two-column grid at
`max-w-[360px]`, and this is the longest label on the board.)*

**2. Add an unprivileged findings aggregate, then swap tile 2.** `Reports` → `Findings`, sourced
from a new count the server answers for every plan. The shape that fits the existing design is a
count on the inspection list rows, or a small unprivileged counts endpoint returning
`{inspections, findings, openActions, overdue}` — the latter would also collapse the dashboard's
current three reads into one.

**`Reports` is not worthless and should not be dropped silently.** It is a real, server-answered
count of generated report packages. If both matter, the honest options are a five-tile board or
moving Reports elsewhere — and which of those is right is a product decision, not an engineering
one.

## Recommendation

**Part 1 now** — it is a label, it costs nothing, and it makes the board say what it counts.

**Part 2 scheduled with its server work** — and not before. Swapping the label without the
aggregate would put back exactly the structurally-zero tile §281 removed.

**§284 implemented neither**, per the direction to return the current set and the proposal first.
