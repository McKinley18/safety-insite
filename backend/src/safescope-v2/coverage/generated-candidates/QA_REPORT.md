# HazLenz Warm-Shard Candidate QA and Promotion Report

This report summarizes the bulk QA audit and promotion-readiness status for the generated HazLenz warm-shard candidates.

## Audit Summary

* **Total Candidate Files**: 10
* **Pass Count (Clean)**: 0
* **Warning Count**: 10
* **Fail Count**: 0

---

## Per-Candidate QA Details

| Candidate File / Shard Key | Priority | Status | Citations | Source Keys | Notes / Errors / Warnings |
|---|---|---|---|---|---|
| **candidate-msha-electrical-electrical-panel-electrical-contact.json**<br>`msha/electrical/electrical_panel/electrical_contact` | `critical` | 🟡 WARN | 5 | 5 | ⚠️ Citation "30 CFR 56.12004" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.12016" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.12017" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.12018" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.12028" not found in active standards_master database |
| **candidate-msha-fall-protection-platform-fall-from-height.json**<br>`msha/fall_protection/platform/fall_from_height` | `critical` | 🟡 WARN | 5 | 5 | ⚠️ Citation "30 CFR 56.11001" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.11002" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.11012" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.11014" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.15005" not found in active standards_master database |
| **candidate-osha-construction-excavation-trenching-unknown-caught-in-between.json**<br>`osha_construction/excavation_trenching/unknown/caught_in_between` | `critical` | 🟡 WARN | 3 | 3 | ⚠️ Citation "29 CFR 1926.650" not found in active standards_master database<br>⚠️ Citation "29 CFR 1926.651" not found in active standards_master database<br>⚠️ Citation "29 CFR 1926.652" not found in active standards_master database |
| **candidate-osha-general-industry-machine-guarding-machine-guarding-guarding.json**<br>`osha_general_industry/machine_guarding/machine_guarding/guarding` | `critical` | 🟡 WARN | 3 | 3 | ⚠️ Citation "29 CFR 1910.212" not found in active standards_master database |
| **candidate-osha-general-industry-walking-working-surfaces-platform-fall-from-height.json**<br>`osha_general_industry/walking_working_surfaces/platform/fall_from_height` | `critical` | 🟡 WARN | 5 | 5 | ⚠️ Citation "29 CFR 1910.22" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.23" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.28" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.29" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.140" not found in active standards_master database |
| **candidate-msha-fire-extinguisher-unknown-unknown.json**<br>`msha/fire_extinguisher/unknown/unknown` | `high` | 🟡 WARN | 4 | 4 | ⚠️ Citation "30 CFR 56.4200" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.4201" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.4202" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.4101" not found in active standards_master database |
| **candidate-msha-housekeeping-unknown-housekeeping-slip-trip.json**<br>`msha/housekeeping/unknown/housekeeping_slip_trip` | `high` | 🟡 WARN | 3 | 3 | ⚠️ Citation "30 CFR 56.20003" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.20011" not found in active standards_master database<br>⚠️ Citation "30 CFR 56.11001" not found in active standards_master database |
| **candidate-osha-construction-ladders-ladder-fall-from-height.json**<br>`osha_construction/ladders/ladder/fall_from_height` | `high` | 🟡 WARN | 2 | 2 | ⚠️ Citation "29 CFR 1926.1053" not found in active standards_master database<br>⚠️ Citation "29 CFR 1926.1060" not found in active standards_master database |
| **candidate-osha-construction-scaffolds-platform-fall-from-height.json**<br>`osha_construction/scaffolds/platform/fall_from_height` | `high` | 🟡 WARN | 3 | 3 | ⚠️ Citation "29 CFR 1926.451" not found in active standards_master database<br>⚠️ Citation "29 CFR 1926.452" not found in active standards_master database<br>⚠️ Citation "29 CFR 1926.454" not found in active standards_master database |
| **candidate-osha-general-industry-ppe-unknown-unknown.json**<br>`osha_general_industry/ppe/unknown/unknown` | `high` | 🟡 WARN | 7 | 7 | ⚠️ Citation "29 CFR 1910.132" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.133" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.134" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.135" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.136" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.138" not found in active standards_master database<br>⚠️ Citation "29 CFR 1910.95" not found in active standards_master database |

---

## Recommended Promotion Order

Candidates are ordered below by backlog priority (Critical first, then High) and represent the recommended sequence for human-in-the-loop review and promotion.

### 1. Tier 1: Critical Priority Candidates
* [ ] `msha/electrical/electrical_panel/electrical_contact` (File: [candidate-msha-electrical-electrical-panel-electrical-contact.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-msha-electrical-electrical-panel-electrical-contact.json)) - *Backlog: MSHA electrical conductors, circuits, lockout, guarding, and grounding*
* [ ] `msha/fall_protection/platform/fall_from_height` (File: [candidate-msha-fall-protection-platform-fall-from-height.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-msha-fall-protection-platform-fall-from-height.json)) - *Backlog: MSHA ladders, platforms, walkways, conveyor crossings, and safety belts/lines*
* [ ] `osha_construction/excavation_trenching/unknown/caught_in_between` (File: [candidate-osha-construction-excavation-trenching-unknown-caught-in-between.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-osha-construction-excavation-trenching-unknown-caught-in-between.json)) - *Backlog: OSHA construction excavation and trenching*
* [ ] `osha_general_industry/machine_guarding/machine_guarding/guarding` (File: [candidate-osha-general-industry-machine-guarding-machine-guarding-guarding.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-osha-general-industry-machine-guarding-machine-guarding-guarding.json)) - *Backlog: OSHA general industry machine guarding and energy control*
* [ ] `osha_general_industry/walking_working_surfaces/platform/fall_from_height` (File: [candidate-osha-general-industry-walking-working-surfaces-platform-fall-from-height.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-osha-general-industry-walking-working-surfaces-platform-fall-from-height.json)) - *Backlog: OSHA general industry walking-working surfaces and fall protection*

### 2. Tier 2: High Priority Candidates
* [ ] `msha/fire_extinguisher/unknown/unknown` (File: [candidate-msha-fire-extinguisher-unknown-unknown.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-msha-fire-extinguisher-unknown-unknown.json)) - *Backlog: MSHA fire prevention, extinguishers, and flammable materials*
* [ ] `msha/housekeeping/unknown/housekeeping_slip_trip` (File: [candidate-msha-housekeeping-unknown-housekeeping-slip-trip.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-msha-housekeeping-unknown-housekeeping-slip-trip.json)) - *Backlog: MSHA housekeeping, travelways, and slipping/tripping hazards*
* [ ] `osha_construction/ladders/ladder/fall_from_height` (File: [candidate-osha-construction-ladders-ladder-fall-from-height.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-osha-construction-ladders-ladder-fall-from-height.json)) - *Backlog: OSHA construction ladders*
* [ ] `osha_construction/scaffolds/platform/fall_from_height` (File: [candidate-osha-construction-scaffolds-platform-fall-from-height.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-osha-construction-scaffolds-platform-fall-from-height.json)) - *Backlog: OSHA construction scaffolds*
* [ ] `osha_general_industry/ppe/unknown/unknown` (File: [candidate-osha-general-industry-ppe-unknown-unknown.json](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/candidate-osha-general-industry-ppe-unknown-unknown.json)) - *Backlog: OSHA general industry PPE, respiratory protection, and hearing conservation*

### 3. Tier 3: Medium/Later Priority Candidates
*No medium or lower priority candidates remaining.*

---

## Risks Requiring Human Review

> [!IMPORTANT]
> 1. **Generic Drafts**: The generated evidence needed, corrective actions, and applicability criteria are generic safety statements. A qualified safety engineer must tailor them to align with domain practices before production use.
> 2. **Regulatory Posture**: Candidates must remain strictly advisory. Under no circumstances should they declare that a violation exists or is confirmed.
> 3. **Validation Warnings**: Any warning flagged above (e.g., citations missing corresponding standard records) must be verified against the eCFR source before shard promotion.
