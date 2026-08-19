# P1-02 — Phase 3: Generator Selection Contract

## Selection order (defined, then implemented in Phase 4)

1. **Component-aware / hazard-specific generator** (existing `observationUnderstanding`-driven block,
   4 families: machine guarding, electrical, fall protection, chemical/PPE). Runs whenever
   `observationUnderstanding` is present **and** matches one of its four known families based on parsed
   equipment/mechanism/energy signal. Produces the most specific defensible narrative, naming the actual
   observed component/equipment/task where evidence supports it.
2. **Domain-coarse bounded fallback** (existing new block, 7 families via `explicitDomain`/
   `fallbackContext`: walking, electrical, mobile, fall, guarding, lockout/stored-energy, chemical/spill).
   Runs **only when generator 1 did not produce a result** — either because `observationUnderstanding` is
   absent, or because it is present but does not match any of generator 1's four families (e.g., walking-
   surface or mobile-equipment observations, or lockout/stored-energy findings, none of which generator 1
   has a branch for). Uses only the already-classified domain/mechanism fields — never invents equipment,
   component, or measurement detail beyond what the domain classification itself supports.
3. **Generic top-of-function default** (existing, unchanged: `isCritical`/`isHighRisk`-based one-line
   narratives). Last resort — runs when neither generator above produces a match (e.g., an
   unclassifiable/vague observation with no domain signal at all).

This restores the ordering the task's Phase 3 specifies: "specific validated generator → bounded fallback
→ generic fallback," with the fallback boundary based on **whether the more specific generator actually
produced a result**, not on hazard-domain category (the bug).

## Safety rule enforced (unchanged, not weakened)

No new inference is introduced anywhere in this fix. Generator 1's four branches already only reference
fields `observationUnderstanding` itself supplies (`equipment.specificEquipment`, `.category`,
`.component`, `.motion`; `task.activity`; `energy.primaryEnergySource`; `mechanismCandidates`) — it never
invents a component name; when a specific field is absent it falls back to a bounded generic noun already
present in the code (`"affected equipment"`, `"tail pulley"` as an illustrative default only inside the
machine-guarding branch's already-existing template, `"moving"`, `"unprotected edge"`, etc. — all
pre-existing, unmodified strings). Generator 2 references only domain/mechanism classification fields it
already had access to. No benchmark-specific string is inserted anywhere; the fix changes control flow
(order + gating), not narrative content.

## What determines "generator 1 produced a result"

A new boolean, `handledByComponentAwareGenerator`, set to `true` only inside each of generator 1's four
existing internal branches (immediately after the existing narrative assignments in each branch — no
change to what those branches assign). This flag is the sole new piece of state introduced by the fix.
