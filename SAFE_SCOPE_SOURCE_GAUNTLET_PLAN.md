# SafeScope Source-Grounded Gauntlet Plan

## Why Source-Grounded Testing?
While generated gauntlets (like the V2 500-scenario set) provide excellent coverage of systemic edge cases and engine logic, they are synthetic. Source-grounded testing validates SafeScope against the "ground truth" of actual, historical industrial accidents (MSHA/OSHA reports), ensuring the engine's reasoning aligns with real-world regulatory findings and established safety science.

## Source List
1. MSHA Fatality Reports (2024-2025)
2. OSHA Fatality Inspection Records
3. MSHA Hazard/Safety Alerts
4. OSHA Investigation Summaries

## Family Coverage Goals
- 40% MSHA (Mining)
- 40% OSHA (General Industry)
- 20% Mixed / Other
- Minimum 15 primary hazard families represented.

## Derivation Methodology
1. Select source report.
2. Isolate core mechanical or procedural failure.
3. Extract "field observation" style text.
4. Define expected primary family and standard mapping based on the investigation outcome.
5. Identify "prohibited overreach" to keep SafeScope focused on the evidence.

## Production-Readiness Thresholds
- Accuracy: >90% against source outcomes.
- Reasoning alignment: >85% match with root causes identified in official reports.
