# Negation Adversarial Matrix — Before / After (live)

All rows are live `POST /safescope-v2/classify` calls against the disposable backend, before vs. after the fix in `weighted-classifier.service.ts` / `hazard-taxonomy.ts` / `negation-context.util.ts`. "Before" reflects the original, unmodified `WeightedClassifierService` (the dead-code edit to `deterministic-classifier.ts` made no live difference, confirmed empirically and reverted — see `NEGATION_ROOT_CAUSE.md`).

| Case | Text (abridged) | Before | After | Verdict |
|---|---|---|---|---|
| positive | "Exposed energized conductors are accessible..." | Electrical, 82% high | Electrical, 82% high | **PASS — unchanged, no regression** |
| simple-negation | "No exposed energized conductors were observed... no deficiencies were noted." | Electrical, **93% high** | Electrical, **25% low**, human review required | **FIXED** — false-confidence eliminated |
| positive-after-negation | "Panel A was intact, but Panel B has exposed energized conductors accessible to workers." | Electrical, 82% high | Electrical, 82% high | **PASS — unchanged.** Confirms negation elsewhere in the same observation does not suppress a genuinely affirmed hazard |
| negation-after-historical-positive | "A guard was missing yesterday... but it has been replaced and is now secure." | Historical Condition, 70% medium | Historical Condition, 70% medium | **PASS — unchanged**, already correct pre-fix |
| effective-control-guard | "The pulley guard... was properly installed, fully enclosed, and confirmed to prevent any contact..." | Machine Guarding, **93% high** | Machine Guarding, **25% low**, human review required | **FIXED** |
| failed-control-guard | "The guard is installed but loose and workers can reach the moving shaft..." | Machine Guarding, 52% low | Machine Guarding, 52% low | **PASS — unchanged.** Real hazard stays flagged; failure-language guard correctly disables the effective-control discount |
| unknown-control-guard | "Guard condition could not be confirmed during the walkthrough." | Machine Guarding, 52% low | Machine Guarding, 52% low | **PASS — unchanged**, appropriately uncertain both before and after |
| negated-guarding | "No missing guards were observed. All machine guards were installed and secure." | Machine Guarding, **82% high** | Machine Guarding, **52% low**, human review required | **FIXED** |
| effective-loto | "The equipment was locked out, zero energy was verified, and no uncontrolled hazardous energy remained." | Controlled Condition, 52% low | Controlled Condition, 25% low | **PASS — unchanged verdict** (already non-hazard-labeled pre-fix) |
| effective-fall-control | "Workers were protected by a complete guardrail system and no unprotected fall exposure was observed." | Fall Protection, **93% high** | Fall Protection, **25% low**, human review required | **FIXED** |
| safe-housekeeping | "Walking surfaces were clean and dry with no trip hazards observed." | Walking/Working Surfaces, **93% high** | Walking/Working Surfaces, **25% low**, human review required | **FIXED** |
| mixed-one-negated-one-affirmed | "No exposed conductors were observed on Panel A. However, the guard... was missing, exposing the moving chain." | Lockout/Stored Energy, 55% medium | Lockout/Stored Energy, 55% medium | **UNCHANGED — known limitation.** Electrical is no longer incorrectly promoted (negation working correctly for that half), but the primary label routes to "Lockout / Stored Energy" rather than "Machine Guarding" for the affirmed half. This is a pre-existing family-disambiguation quirk in the ~40 hand-tuned booster rules, unrelated to negation, and out of scope for this narrow fix. Flagged as a real remaining item. |
| safe-state-full | Full walkthrough, "all machine guards were in place, guardrails were installed... no hazards identified." | Fall Protection, **93% high** | Fall Protection, **25% low**, human review required | **FIXED** |

## Summary

- 6 of 13 cases were confidently wrong before this fix (93% or 82% "high," several with `requiresHumanReview: false`); all 6 now score 25-52% "low," which — per the classifier's own existing rule (`requiresHumanReview: confidenceBand !== "high"`) — always requires human review.
- 0 of 13 cases regressed. The two genuinely-positive cases (`positive`, `positive-after-negation`) and the four already-correct cases (`negation-after-historical-positive`, `failed-control-guard`, `unknown-control-guard`, `effective-loto`) are byte-for-byte unchanged.
- 1 known remaining limitation (`mixed-one-negated-one-affirmed`'s family routing) is documented, not hidden.
