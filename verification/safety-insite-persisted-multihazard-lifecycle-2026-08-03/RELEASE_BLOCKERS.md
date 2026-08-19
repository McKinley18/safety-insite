# Release blockers

1. **High — per-finding risk governance.** `HumanReview` remains observation-scoped, so independent risk review/override and rationale cannot yet be proven for every durable finding. Add nullable finding FK, create one review per current finding, invalidate material stale reviews, and test finalization with one unreviewed finding.
2. **High — complete authorization matrix.** Current evidence covers owner, foreign report 404, and prior regression denials, but not every new finding/history/evidence/task/audit resource and same-organization role.
3. **High — audit completeness.** Finding materialization/reconciliation and all stale/duplicate denials are not yet fully represented in the audit chain.
4. **High — historical report versions.** Duplicate unchanged generation is safe; report version 2, source-snapshot immutability after a legitimate newer analysis, and concurrent generation remain incomplete.
5. **Medium — global frontend lint.** Known baseline remains 502 errors/115 warnings; targeted modified-file lint passes.
6. **Medium — offline, accessibility/responsive/theme, performance, live object storage, regulatory qualification, and operational rehearsal.** These remain outside this focused implementation proof or require external credentials/qualified review.
