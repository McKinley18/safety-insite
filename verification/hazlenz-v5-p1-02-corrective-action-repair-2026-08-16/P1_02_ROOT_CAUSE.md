# P1-02 — Phase 1-2: Root Cause

## Pipeline trace

`finding` → `hazard/family` (`scenarioIntelligence.candidateStandardFamily`/`hazardDomain`,
`mechanismOfInjury`) → `evidence` (`observationUnderstanding`, computed by
`ObservationUnderstandingService.evaluate(text)`, populating `equipment`/`task`/`exposure`/`energy`/
`controls`/`mechanismCandidates`) → `CorrectiveActionBrainService.evaluate(scenarioIntelligence,
evidenceGaps, observationUnderstanding)` → narrative generator selection (the defective logic) →
`CorrectiveActionReasoning` object (`immediateActionNarrative` etc.) → this is the object the benchmark
inspects directly, and is the same object that flows to persistence/API/frontend in the live pipeline
(confirmed `CorrectiveActionBrainService` is `LIVE_AND_EFFECTIVE`, output surfaces as
`correctiveActionReasoning` in the `/safescope-v2/classify` response, per the midpoint audit's capability
map).

## Exact root cause (proven via `git diff HEAD`)

The pre-existing (HEAD, committed) code guarded the component-aware, `observationUnderstanding`-driven
narrative generator with a single condition:

```ts
if (observationUnderstanding) {
  // ... equipment/component-specific narrative branches (guarding, electrical, fall, chemical) ...
}
```

The current uncommitted working-tree diff (verified via `git diff HEAD -- .../corrective-action.service.ts`)
makes exactly one structural change: it **inserts a new 77-line domain-coarse fallback block before** this
guard, and **changes the guard itself** to:

```ts
if (observationUnderstanding && !(domainIsWalking || domainIsElectrical || domainIsMobile || domainIsFall || domainIsGuarding)) {
```

The five `domainIs*` booleans are derived from `scenarioIntelligence.hazardDomain`/`hazardCategory`/
`candidateStandardFamily` — the **coarse, already-assigned hazard family**, not from
`observationUnderstanding` at all. For all three failing benchmark scenarios, this coarse family is
exactly one of the five excluded categories:

| Scenario | `hazardDomain` | Domain boolean tripped | Consequence |
|---|---|---|---|
| 1. Conveyor tail pulley | `machine_guarding` | `domainIsGuarding` (`/guard|machine/`) | Component-aware guard block never runs; new generic guarding block (line ~70) wins |
| 2. Damaged electrical cord | `electrical` | `domainIsElectrical` (`/electrical|electric/`) | Component-aware electrical block never runs; new generic electrical block wins |
| 3. Open platform edge | `fall_protection` | `domainIsFall` (`/fall|ladder|scaffold|elevated/`) | Component-aware fall block never runs; new generic fall block wins |
| 4. Chemical transfer | `ppe` | none of the five | Component-aware block still runs correctly (its chemical branch matches on `mechanismOfInjury`/`energyLabel`, not on the excluded domain categories) — **this is exactly why scenario 4 alone passes** |

## First incorrect decision point

The negated-domain exclusion clause added to the component-aware guard:
`!(domainIsWalking || domainIsElectrical || domainIsMobile || domainIsFall || domainIsGuarding)`.

This is the single line where the regression is introduced. Everything else — the new domain-coarse
block's own internal wording, the benchmark, the rest of the file — is unchanged and not itself defective.

## Why the new block was added (legitimate intent, per its own comment)

```
// Evidence-bound fallback specificity: production callers do not always have
// the optional observationUnderstanding object. Use the already-classified
// domain/mechanism to select a concrete control without inventing measurements
// or site facts. This prevents generic boilerplate from replacing useful,
// hazard-specific guidance.
```

This is a real, defensible goal: some callers of `CorrectiveActionBrainService.evaluate()` do not supply
`observationUnderstanding` (the midpoint audit's V5-C02 census independently confirmed several raw-text
consumers were deliberately not migrated to richer evidence structures), and without any domain-level
fallback those callers would fall through to the truly generic top-of-function defaults (`'Halt affected
work in the area immediately...'` / `'Secure the area to prevent further hazard exposure...'`) — much
worse than the new block's domain-aware text. **The intent was sound; the implementation regressed a
higher-quality existing path by excluding it on the wrong condition (domain category) instead of the
right one (whether `observationUnderstanding` was actually present/useful).**

## Root cause classification

**Generator-ordering / predicate-scope defect.** Not data loss (`observationUnderstanding` is passed
through unmodified and fully populated in all four benchmark calls — confirmed by scenario 4 still using
it correctly). Not an early return (the function is straight-line; two structurally independent `if`
blocks both reassign the same narrative variables, and are mutually exclusive by construction because the
second block's guard negates exactly the categories the first block positively matches). The defect is
that a newer, coarser-grained generator was placed **before** an existing, more specific generator and
given veto power over it via a domain-category exclusion, rather than being scoped as a **fallback that
only applies when the specific generator did not produce a result**.

## Substantive vs. wording-only impact

**Substantive, not merely wording.** Compare the "permanent correction" (the actual control recommendation,
not just phrasing) for scenario 1: the shadowed component-aware output is *"Install permanent, secure
guarding over the exposed **{component}** to completely eliminate the {mechanism} hazard"* — genuinely more
specific about which physical component needs the guard. The generic output that wins today is *"Install or
restore a fixed or interlocked guard at **the identified point of operation**"* — same control type
(guarding), strictly less specific about location/component. For scenario 2, both recommend isolating/
de-energizing electrical equipment — same control category, less specific naming. **No control-hierarchy
level changes and no control type is substituted for a weaker one; the regression is a loss of
component-level specificity, not a loss of correct control-category recommendation.** This bounds the
severity: the shadowed output was never unsafe, only less defensible/specific than the pre-existing
generator could provide.

## Phase 2 — working-tree history discipline observed

Only `git diff HEAD` (a read-only, non-destructive comparison) was used to establish this trace. No
`reset`, `checkout --`, `restore`, `stash`, or `revert` was run at any point. The file's only change since
HEAD is the one described above — confirmed by reading the full current file content and the full diff
together (214 lines total, diff shows a single contiguous insertion plus a one-line guard-condition
change, no other hunks).
