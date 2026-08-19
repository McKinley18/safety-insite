# Accepted HazLenz changes

1. Evidence-bound preservation of active hot work, chemical release, chemical identity/label gaps, and explicit powered-industrial-truck evidence when a generic route dominates. Safe-state exclusions remain explicit.
2. Canonical promotion of decomposition hazards into `additionalHazards` with stable family keys and human-readable classification labels. This closes a real serialization boundary loss without changing the decomposition decision.
3. Controlled-condition compatibility guard preventing safe-state outputs from inheriting unrelated UNKNOWN applicability candidates.

Protected negative cases include closed/labeled/no-release containers, parked or out-of-service trucks, generic hot-work mentions without active work, and verified controlled conditions.
# Accepted precision iteration (2026-08-07)

- Fragment-scoped condition suppression: verified controls suppress only the affected family and preserve active siblings.
- General contradiction extraction for current same-subject energy, leak, guard, and exposed-conductor conflicts.
- Explicit `conditionState` and evidence propagation into guided responses.

Evidence: frozen 180-case recall remained 100%, safe-state unsupported rate remained 0%, life-critical misses remained 0/60, and transport failures remained 0. The focused production-path regression passed 13/13.

Third iteration additions:

- Context-free fallback boundary: generic equipment concerns now remain unknown rather than inheriting machine-guarding/LOTO/electrical families.
- Temporal decomposition metadata: fragments carry condition state, temporal evidence, current condition, and correction status.
- Historical hazards are first-class advisory records; current additional hazards exclude historical/safe fragments.
- Final frozen run: 100% recall, 0 non-safe forbidden rows, 0 state-aware unsupported promotions, 0 life-critical misses, 0 transport failures.
