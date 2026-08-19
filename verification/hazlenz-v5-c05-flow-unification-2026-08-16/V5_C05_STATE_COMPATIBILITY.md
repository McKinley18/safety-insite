# V5-C05 — Phase 5 detail: State Compatibility Matrix

| Scenario | Legacy identifiers involved | Effect of C05 change | Verified |
|---|---|---|---|
| New inspection (legacy) | `findings` (in-memory), `sentinel_inspection_autosave` (write-only, unread) | None — new button only reachable after HazLenz review returns ≥2 decomposed hazards | Code trace: no new state, no modified persistence call |
| New inspection (canonical) | `persistedInspectionId`, server `InspectionFinding` rows, `riskSnapshot` | None — zero canonical files touched | Confirmed by diff (0 canonical files changed) |
| Existing in-progress canonical inspection | Same as above | None | Confirmed by diff |
| Existing in-progress legacy inspection | `findings` array (in-memory, lost on reload regardless — pre-existing, not caused or fixed by C05) | None for a user who never clicks the new button; for one who does, `addNewFinding()` (unmodified) runs exactly as it already does today via "Save & Add New Finding" | Code trace + live browser reproduction (this session) |
| Browser refresh | `sentinel_selected_inspection_context` (canonical resume key), `sentinel_encrypted_reports` (legacy saved-report store) | Neither key's read/write logic was touched | Confirmed by diff |
| Direct deep link to `/inspection`, `/inspection-review`, `/inspection-cover`, `/inspection-workspace`, `/inspections` | Route table (`app/*/page.tsx` file-based routing) | No route added, removed, or redirected | Confirmed: `command-center/page.tsx:419` still `href="/inspection"`, unmodified |
| Back/forward navigation | Browser history + `currentStep` React state | Identical to pre-existing "Save & Add New Finding" behavior (`resetCurrentFinding()` sets `currentStep` to 1); new button reuses this exact function, does not introduce a new navigation primitive | Code trace |

## Orphaned-data risk carried forward (not introduced or worsened by C05)

The two pre-existing orphaned-data risks identified in `V5_C05_FLOW_CENSUS.md` — the write-only
`offlineInspectionWiring.ts`/`sentinel_inspection_autosave`, and the orphaned legacy `/reports`
cloud-save resource whose data no live UI re-displays — are unchanged by this phase. They were not in
scope for C05 (the task's own Phase 5 instruction is to prevent C05 from *creating* new stranded state,
not to retroactively fix pre-existing gaps), and no C05 change touches either mechanism.

## Conclusion

No inspection state — new, in-progress, canonical, or legacy — can be stranded, corrupted, or silently
lost as a result of this phase's changes. The change is additive-only and reuses existing, unmodified
save/reset primitives.
