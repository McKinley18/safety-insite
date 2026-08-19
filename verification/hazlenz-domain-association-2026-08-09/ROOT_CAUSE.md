# Root cause

The walking-surface finding was correctly classified (`slip_trip_fall`, `walking_working_surfaces`, `slip_trip_fall_same_level`), but `CorrectiveActionBrainService` selected its branch from `observationUnderstanding.equipment`, `energy.primaryEnergySource`, and `mechanismCandidates` before honoring the finding's explicit domain. A stale/observation-level electrical context therefore selected electrical repair actions for a walking-surface finding.

This was not a phrase-specific walking rule. The generalized defect was precedence and context ownership: finding-scoped domain was not authoritative. The fix establishes explicit domain precedence for walking, electrical, mobile, fall, and guarding contexts; only when no explicit domain exists does the service use broader observation understanding.
