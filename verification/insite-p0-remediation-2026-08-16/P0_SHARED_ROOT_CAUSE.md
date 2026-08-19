# P0 Shared Root-Cause Check

## Do P0-02 and P0-03 share a root cause?

**No — proven, not assumed.** They are two independent defects with two independent mechanisms, though both live in the same general architectural pattern (a single object computed for the "primary"/first-processed hazard of a multi-hazard observation, reused indiscriminately for sibling hazards):

- **P0-03**'s confirmed mechanism is server-side: `SafescopeV2Service.buildEnhancedGeneratedActions()` free-text keyword-matches over insufficiently-scoped evidence text (the finding's own request text, contaminated by a synthetic `"Hazard category: <stale label>"` preamble and empty-field placeholder boilerplate), independently of the finding's own correctly-computed classification.
- **P0-02**'s confirmed mechanism is client-side and read-only: the canonical workspace's candidate-standard display panel reads a single shared `analysis.guidedFinding.primaryStandard` (computed once, for the observation's primary hazard only) without checking whether the currently-selected finding is actually that hazard.

Both are instances of a broader pattern — **"one computation done for the primary/first hazard of a multi-hazard observation, reused without re-checking identity for sibling hazards"** — but they occur in different processes (backend action generation vs. frontend display), touch different code (`safescope-v2.service.ts` vs. `inspection-workspace/page.tsx`), and were fixed independently with no shared code change. Fixing one did not fix the other; each required its own root-cause trace and its own fix.

## Other candidate shared mechanisms checked and ruled out

- **Stale observation-scoped state**: contributes to P0-02 (confirmed) and to one of P0-03's two contamination paths (the `evidenceTexts`/`priorStructuredObservation` carryover mechanism, confirmed by the investigating trace, though the dominant mechanism actually reproduced live was the `"Hazard category:"` hint line, not this one). Not a *shared fix* — the P0-02 fix is a frontend display resolver; the P0-03 fix is a backend text-scoping change. No single change touches both.
- **Oversized composite API result**: real (per the prior audit's payload-bloat findings) but not implicated in either P0-02 or P0-03's confirmed mechanism.
- **Sibling result reuse**: description matches P0-02 exactly (`primaryStandard` reused across siblings) and partially matches one P0-03 path (`evidenceTexts` carried across turns) — same *pattern*, different *code*, confirmed by tracing both to distinct files/functions.
- **Ambiguous frontend selection state**: ruled out for P0-02 — `selectedFindingId` itself was proven correct at every stage; only one specific display panel failed to key off it.
- **Snapshot ownership**: not implicated in either confirmed mechanism.

## Conclusion

No single narrow fix addresses both P0-02 and P0-03. Two separate, narrow fixes were required and applied, each scoped to its own confirmed root cause. This is reported honestly rather than forcing a shared narrative that the evidence does not support.
