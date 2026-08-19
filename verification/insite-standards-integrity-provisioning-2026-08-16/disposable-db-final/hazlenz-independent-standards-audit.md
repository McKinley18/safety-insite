# HazLenz Independent Standards Audit

This is an automated regulatory-applicability audit. It is not a professional legal or safety certification.

## Summary

```json
{
  "total": 19,
  "pass": 7,
  "qualifiedPass": 12,
  "needsReview": 0,
  "criticalFailures": 0,
  "clearPositiveCases": 9,
  "safeControlledNegativeCases": 5,
  "ambiguousCases": 2,
  "jurisdictionTrapCases": 0,
  "multiHazardCases": 1,
  "primaryCitationRecall": 1,
  "primaryCaseRecall": 1,
  "unsupportedCitationRate": 0,
  "falsePositiveCount": 0,
  "mitigationEssentialControlCoverage": 1
}
```

## Case Results

### msha-conveyor-jam-energized - pass

Observation: A miner is clearing a jammed conveyor while the belt is energized and the tail pulley guard has been removed.

Applicability basis: Mine context, moving conveyor parts, removed guard, jam-clearing/mechanical work, and energized state satisfy both guarding and energy-isolation predicates.

Source: MSHA 30 CFR 56.14107(a), guarding of moving machine parts. MSHA 30 CFR 56.12016, locking/tagging electrically powered equipment before mechanical work.

Classification: Lockout / Stored Energy

Active citations: 30 CFR 56.12016, 30 CFR 56.11009, 30 CFR 56.14113, 30 CFR 56.14107(a)

Questions: none

Failures: none

### msha-conveyor-locked-out - pass

Observation: A miner is clearing a conveyor jam after the conveyor was locked out, zero-energy verified, and access was restricted.

Applicability basis: The same task terms are present, but verified lockout and no unexpected-startup exposure suppress active violation promotion.

Source: MSHA 30 CFR 56.12016, locking/tagging electrically powered equipment before mechanical work.

Classification: Controlled Condition

Active citations: none

Questions: none

Failures: none

### osha-gi-operating-unguarded-shaft - qualified-pass

Observation: Operator reaches near an exposed rotating shaft because the machine guard is missing while the production line is running.

Applicability basis: General-industry machine, exposed rotating shaft, missing guard, operation, and operator exposure satisfy machine-guarding predicates.

Source: OSHA 29 CFR 1910.212(a)(1), machine guarding for point of operation, nip points, rotating parts, flying chips/sparks.

Classification: Machine Guarding

Active citations: 29 CFR 1910.219(c), 29 CFR 1910.212(a)(1), 29 CFR 1910.215

Questions: Was the worker operating, cleaning, maintaining, repairing, or clearing a jam? | Was a guard removed, missing, damaged, bypassed, or was lockout/tagout applied and verified?

Failures: none

### osha-gi-guard-removed-isolated - qualified-pass

Observation: Machine guard was removed for maintenance while the machine is locked out, zero energy verified, and the area is restricted.

Applicability basis: Guard-removal words are disqualified by verified isolation and restricted access; only verification items remain.

Source: OSHA 29 CFR 1910.147(a)(1)-(a)(2), control of hazardous energy during servicing/maintenance. OSHA 29 CFR 1910.212(a)(1), machine guarding for point of operation, nip points, rotating parts, flying chips/sparks.

Classification: Controlled Condition

Active citations: none

Questions: What exact equipment, opening, edge, container, or travel path is involved? | Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled? | Are workers exposed directly, or is the issue only a general concern without a specific hazard path?

Failures: none

### osha-gi-damaged-cord-wet-exposed - pass

Observation: Employee is using an extension cord with exposed copper conductors in a wet washdown area.

Applicability basis: In-use flexible cord, damaged insulation/exposed conductors, wet location, and employee exposure support electrical hazard and cord/wiring standards.

Source: OSHA 29 CFR 1910.305(g), flexible cords and cable condition/use requirements.

Classification: Electrical

Active citations: 29 CFR 1910.305(g)(1)(iii), 1910.303(b)(1), 29 CFR 1910.305(g)(2)(iii)

Questions: Were internal conductors or energized parts exposed, or was the damage limited to the outer jacket? | Was GFCI protection present for the wet or damp location?

Failures: none

### osha-gi-discarded-damaged-cord - pass

Observation: Damaged extension cord is unplugged, tagged out of service, and locked in a disposal bin where employees cannot use it.

Applicability basis: The cord is damaged, but unplugged, tagged, inaccessible, and locked for disposal; active employee electrical exposure is not established.

Source: OSHA 29 CFR 1910.305(g), flexible cords and cable condition/use requirements.

Classification: Electrical

Active citations: 29 CFR 1910.422

Questions: Were internal conductors or energized parts exposed, or was the damage limited to the outer jacket?

Failures: none

### construction-edge-eight-feet - qualified-pass

Observation: Construction worker is framing beside an unprotected floor edge eight feet above the lower level without guardrails or fall arrest.

Applicability basis: Construction, unprotected edge, lower level, and eight-foot height satisfy 1926 Subpart M edge protection predicates.

Source: OSHA 29 CFR 1926.501(b)(1), construction unprotected side/edge at 6 feet or more.

Classification: Walking/Working Surfaces

Active citations: 29 CFR 1926.1423, 29 CFR 1926.501(b)(1), 29 CFR 1926.501

Questions: Was the issue a defective ladder, incorrect ladder use, an unprotected edge/opening, scaffold, roof, or platform?

Failures: none

### osha-gi-same-level-trip - qualified-pass

Observation: Employee could trip over a loose hose across the same-level aisle.

Applicability basis: Same-level aisle obstruction is a walking-working surface/trip issue, not an elevated-fall case.

Source: OSHA 29 CFR 1910.22(a), walking-working surfaces kept clean, orderly, sanitary, and free of hazards.

Classification: Walking/Working Surfaces

Active citations: 29 CFR 1910.22(a), 29 CFR 1910.22(a)(3), 29 CFR 1910.24

Questions: none

Failures: none

### osha-gi-unlabeled-secondary-solvent - qualified-pass

Observation: Unlabeled spray bottle of solvent is used by multiple employees at the parts washer.

Applicability basis: Unlabeled workplace secondary container in shared use supports workplace labeling and HazCom controls.

Source: OSHA 29 CFR 1910.1200(f), workplace container labeling and hazard communication.

Classification: Hazard Communication

Active citations: 29 CFR 1910.1200(f)(6), 29 CFR 1910.1200(f)(1), 29 CFR 1910.1200

Questions: What substance was involved, and was the container labeled or identified? | Were inhalation, skin contact, vapor, ingestion, drain, or walking-surface exposure pathways possible?

Failures: none

### osha-gi-immediate-use-cup - qualified-pass

Observation: Worker poured solvent into a small unlabeled cup for immediate use during the same shift and kept control of it.

Applicability basis: Immediate-use, under-control transfer language suppresses a final workplace-container labeling violation absent contrary facts.

Source: OSHA 29 CFR 1910.1200(f), workplace container labeling and hazard communication.

Classification: Hazard Communication

Active citations: none

Questions: What substance was involved, and was the container labeled or identified? | Were inhalation, skin contact, vapor, ingestion, drain, or walking-surface exposure pathways possible? | What exact equipment, opening, edge, container, or travel path is involved? | Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled?

Failures: none

### msha-backup-alarm-reversing - pass

Observation: At a quarry, a loader is backing through a blind area with a broken backup alarm while miners are on foot nearby.

Applicability basis: Mine, self-propelled mobile equipment, backing/blind-area operation, broken alarm, and miner exposure satisfy audible-warning/traffic-control predicates.

Source: MSHA 30 CFR 56.14132(a), maintaining audible warning devices on self-propelled mobile equipment.

Classification: Mobile Equipment / Traffic

Active citations: 30 CFR 56.14132(a), 30 CFR 56.9100(a), 30 CFR 56.9100

Questions: none

Failures: none

### msha-backup-alarm-parked-out - pass

Observation: At a quarry, the loader backup alarm is broken but the loader is parked out of service with the key removed and no reverse operation.

Applicability basis: A defect exists, but out-of-service/key-removed/no-reverse facts suppress active traffic exposure; repair verification remains appropriate.

Source: MSHA 30 CFR 56.14132(a), maintaining audible warning devices on self-propelled mobile equipment.

Classification: Mobile Equipment / Traffic

Active citations: none

Questions: What exact equipment, opening, edge, container, or travel path is involved? | Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled? | Are workers exposed directly, or is the issue only a general concern without a specific hazard path?

Failures: none

### tank-entry-vague - qualified-pass

Observation: Worker went into the tank.

Applicability basis: Tank entry suggests possible confined-space exposure, but permit-space predicates require more facts before exact citation promotion.

Source: OSHA 29 CFR 1910.146, permit-required confined spaces.

Classification: Confined Space

Active citations: none

Questions: What exact equipment, opening, edge, container, or travel path is involved? | Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled? | Are workers exposed directly, or is the issue only a general concern without a specific hazard path?

Failures: none

### permit-space-entry-positive - qualified-pass

Observation: Employee entered a permit-required process tank with possible toxic atmosphere, no attendant, and no pre-entry atmospheric test.

Applicability basis: Entry, permit-space wording, atmospheric hazard, missing attendant, and missing testing satisfy permit-space control predicates.

Source: OSHA 29 CFR 1910.146, permit-required confined spaces.

Classification: Confined Space

Active citations: 29 CFR 1910.146

Questions: none

Failures: none

### trench-deep-no-protection - qualified-pass

Observation: Construction employee is working in a six-foot trench with vertical walls and no shoring, shielding, or sloping.

Applicability basis: Construction, employee entry, six-foot trench, vertical walls, and no protective system support excavation protective-system requirements.

Source: OSHA 29 CFR 1926.651 and 1926.652, excavation access, exposure, and protective systems.

Classification: Trenching & Shoring

Active citations: 29 CFR 1926.651(c)(2), 29 CFR 1926.651(j)(2), 29 CFR 1926.10, 29 CFR 1926.1416, 29 CFR 1926.15, 29 CFR 1926.16, 29 CFR 1926.2, 29 CFR 1926.453, 29 CFR 1926.501, 29 CFR 1926.804, 29 CFR 1926.854, 29 CFR 1926.959, 29 CFR 1926.652(a)(1)

Questions: none

Failures: none

### trench-shallow-no-entry - qualified-pass

Observation: A three-foot landscaping excavation is barricaded, no employee entry is occurring, and no cave-in indicators were observed.

Applicability basis: Depth, no entry, and barricade facts suppress protective-system citation; access/inspection questions may remain.

Source: OSHA 29 CFR 1926.651 and 1926.652, excavation access, exposure, and protective systems.

Classification: Confined Space

Active citations: 29 CFR 1926.3

Questions: What exact equipment, opening, edge, container, or travel path is involved? | Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled? | Are workers exposed directly, or is the issue only a general concern without a specific hazard path?

Failures: none

### ladder-bad-vague - qualified-pass

Observation: Ladder is bad.

Applicability basis: A vague ladder adjective does not identify defect, misuse, height, use, or jurisdiction predicates.

Source: OSHA 29 CFR 1910.23(b), ladder condition and use requirements. OSHA 29 CFR 1926.1053(b), construction ladder use/defect requirements.

Classification: Fall Protection

Active citations: none

Questions: What was the approximate working height or fall distance? | Was the issue a defective ladder, incorrect ladder use, an unprotected edge/opening, scaffold, roof, or platform? | What specific equipment, task, or physical condition is unsafe? | Are employees currently exposed to the condition?

Failures: none

### construction-damaged-ladder - qualified-pass

Observation: On a construction site, employees are using a portable ladder with a cracked side rail and loose rung.

Applicability basis: Construction, portable ladder, active use, cracked side rail, and loose rung support construction ladder defect requirements.

Source: OSHA 29 CFR 1926.1053(b), construction ladder use/defect requirements.

Classification: Fall Protection

Active citations: 29 CFR 1926.1053(b)(16), 29 CFR 1926.1423, 29 CFR 1926.501

Questions: What was the approximate working height or fall distance? | Was the issue a defective ladder, incorrect ladder use, an unprotected edge/opening, scaffold, roof, or platform?

Failures: none

### multi-hazard-conveyor-and-oil - pass

Observation: In a manufacturing plant, an operating conveyor has an exposed nip point and oil is leaking onto the aisle used by employees.

Applicability basis: Two independent hazards must remain separated: exposed moving parts and contaminated walking surface.

Source: OSHA 29 CFR 1910.212(a)(1), machine guarding for point of operation, nip points, rotating parts, flying chips/sparks. OSHA 29 CFR 1910.22(a), walking-working surfaces kept clean, orderly, sanitary, and free of hazards.

Classification: Walking/Working Surfaces

Active citations: 29 CFR 1910.22(a), 29 CFR 1910.22(a)(2), 29 CFR 1910.212(a)(1), 29 CFR 1910.212(a)(3)(ii)

Questions: Was a guard removed, missing, damaged, bypassed, or was lockout/tagout applied and verified?

Failures: none
