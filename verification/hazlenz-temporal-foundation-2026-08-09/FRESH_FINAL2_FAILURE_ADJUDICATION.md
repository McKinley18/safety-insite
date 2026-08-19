# Fresh final exact-candidate failure adjudication

Raw: DEV_CURRENT_FINAL2_COMPLETE.json (60/60). Scorer: updated classification-family normalization.
Total scorer failures: 45.

## st-006

Observation: The press was operating during the walk-through and an employee could reach the exposed point of operation where the fixed guard is missing. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: none

Actual: machine_guarding:ACTIVE [an employee could reach the exposed point of operation where the fixed guard is missing]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; machine_guarding:ACTIVE [an employee could reach the exposed point of operation where the fixed guard is missing]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-008

Observation: On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: none

Actual: fall_protection:ACTIVE [an open edge is present]; machine_guarding:HISTORICAL [the employee reports the guard was missing last month]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-009

Observation: On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: machine_guarding:SAFE_VERIFIED; machine_guarding:SAFE_VERIFIED

Actual: fall_protection:ACTIVE [an open edge is present]; machine_guarding:HISTORICAL [the guard was missing yesterday]

Scorer: missing=1; unsupported=0; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-010

Observation: On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: machine_guarding:INTERMITTENT

Actual: fall_protection:ACTIVE [an open edge is present]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=1; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-011

Observation: On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: machine_guarding:PLANNED_FUTURE

Actual: fall_protection:ACTIVE [an open edge is present]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=1; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-012

Observation: On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: machine_guarding:UNKNOWN

Actual: fall_protection:ACTIVE [an open edge is present]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]

Scorer: missing=1; unsupported=0; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-018

Observation: At the surface mine crusher, miners walk beside an unguarded conveyor tail pulley during cleanup. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: none

Actual: machine_guarding:ACTIVE [miners walk beside an unguarded conveyor tail pulley during cleanup]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; electrical:UNKNOWN [no fragment]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-020

Observation: A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: none

Actual: machine_guarding:ACTIVE [a conveyor nip point is open]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-021

Observation: A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: none

Actual: machine_guarding:ACTIVE [a conveyor nip point is open]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-022

Observation: A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: none

Actual: machine_guarding:ACTIVE [a conveyor nip point is open]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-023

Observation: A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: none

Actual: machine_guarding:ACTIVE [a conveyor nip point is open]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; machine_guarding:ACTIVE [a conveyor nip point is open]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=0; unsupported=0; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-025

Observation: A portable ladder has a bent rail; the note does not say whether anyone is using it. The machine is operating now with a missing guard at the rotating shaft.

Expected by V2 rubric: ladder:ACTIVE

Actual: fall_protection:ACTIVE [a portable ladder has a bent rail]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]; fall_protection:ACTIVE [a portable ladder has a bent rail]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-026

Observation: A portable ladder has a bent rail; the note does not say whether anyone is using it. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: ladder:ACTIVE

Actual: fall_protection:ACTIVE [a portable ladder has a bent rail]; machine_guarding:HISTORICAL [the employee reports the guard was missing last month]; fall_protection:ACTIVE [a portable ladder has a bent rail]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-027

Observation: A portable ladder has a bent rail; the note does not say whether anyone is using it. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: ladder:ACTIVE; machine_guarding:SAFE_VERIFIED; machine_guarding:SAFE_VERIFIED

Actual: fall_protection:SAFE_VERIFIED [a portable ladder has a bent rail]; machine_guarding:HISTORICAL [the guard was missing yesterday]

Scorer: missing=2; unsupported=1; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-028

Observation: A portable ladder has a bent rail; the note does not say whether anyone is using it. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: ladder:ACTIVE; machine_guarding:INTERMITTENT

Actual: fall_protection:ACTIVE [a portable ladder has a bent rail]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=2; unsupported=1; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-029

Observation: A portable ladder has a bent rail; the note does not say whether anyone is using it. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: ladder:ACTIVE; machine_guarding:PLANNED_FUTURE

Actual: fall_protection:ACTIVE [a portable ladder has a bent rail]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; fall_protection:ACTIVE [a portable ladder has a bent rail]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-030

Observation: A portable ladder has a bent rail; the note does not say whether anyone is using it. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: ladder:ACTIVE; machine_guarding:UNKNOWN

Actual: fall_protection:ACTIVE [a portable ladder has a bent rail]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; fall_protection:ACTIVE [a portable ladder has a bent rail]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-031

Observation: A container has an unfamiliar label but the substance, task, and exposure are not established. The machine is operating now with a missing guard at the rotating shaft.

Expected by V2 rubric: hazard_communication:ACTIVE

Actual: hazcom:ACTIVE [a container has an unfamiliar label but the substance]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]; hazcom:ACTIVE [a container has an unfamiliar label but the substance]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-032

Observation: A container has an unfamiliar label but the substance, task, and exposure are not established. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: hazard_communication:ACTIVE

Actual: hazcom:ACTIVE [a container has an unfamiliar label but the substance]; machine_guarding:HISTORICAL [the employee reports the guard was missing last month]

Scorer: missing=1; unsupported=1; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-033

Observation: A container has an unfamiliar label but the substance, task, and exposure are not established. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: hazard_communication:ACTIVE; machine_guarding:SAFE_VERIFIED; machine_guarding:SAFE_VERIFIED

Actual: hazcom:SAFE_VERIFIED [a container has an unfamiliar label but the substance]; machine_guarding:HISTORICAL [the guard was missing yesterday]

Scorer: missing=2; unsupported=1; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-034

Observation: A container has an unfamiliar label but the substance, task, and exposure are not established. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: hazard_communication:ACTIVE; machine_guarding:INTERMITTENT

Actual: hazcom:ACTIVE [a container has an unfamiliar label but the substance]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=2; unsupported=1; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-035

Observation: A container has an unfamiliar label but the substance, task, and exposure are not established. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: hazard_communication:ACTIVE; machine_guarding:PLANNED_FUTURE

Actual: hazcom:ACTIVE [a container has an unfamiliar label but the substance]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=2; unsupported=1; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-036

Observation: A container has an unfamiliar label but the substance, task, and exposure are not established. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: hazard_communication:ACTIVE; machine_guarding:UNKNOWN

Actual: hazcom:ACTIVE [a container has an unfamiliar label but the substance]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; electrical:UNKNOWN [no fragment]

Scorer: missing=2; unsupported=1; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-039

Observation: An energized panel has an open cover and workers are performing troubleshooting nearby. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: machine_guarding:SAFE_VERIFIED; machine_guarding:SAFE_VERIFIED

Actual: electrical:ACTIVE [an energized panel has an open cover]; machine_guarding:HISTORICAL [the guard was missing yesterday]

Scorer: missing=1; unsupported=0; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-040

Observation: An energized panel has an open cover and workers are performing troubleshooting nearby. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: machine_guarding:INTERMITTENT

Actual: electrical:ACTIVE [an energized panel has an open cover]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=1; unsupported=0; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-041

Observation: An energized panel has an open cover and workers are performing troubleshooting nearby. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: machine_guarding:PLANNED_FUTURE

Actual: electrical:ACTIVE [an energized panel has an open cover]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=1; unsupported=0; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-042

Observation: An energized panel has an open cover and workers are performing troubleshooting nearby. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: machine_guarding:UNKNOWN; electrical:HISTORICAL; electrical:HISTORICAL

Actual: electrical:ACTIVE [an energized panel has an open cover]

Scorer: missing=2; unsupported=0; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Current energized panel is authoritative; historical electrical sibling should be optional/secondary, not required as the sole electrical state.

## st-043

Observation: A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The machine is operating now with a missing guard at the rotating shaft.

Expected by V2 rubric: none

Actual: mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]; powered_industrial_trucks:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft.]; mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]; powered_industrial_trucks:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft.]

Scorer: missing=0; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-044

Observation: A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: none

Actual: mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; machine_guarding:HISTORICAL [the employee reports the guard was missing last month]; powered_industrial_trucks:HISTORICAL [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the employee reports the guard was missing last month, but current condition was not inspected.]; mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]

Scorer: missing=0; unsupported=1; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-045

Observation: A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: mobile_equipment:ACTIVE; machine_guarding:SAFE_VERIFIED; mobile_equipment:ACTIVE; machine_guarding:SAFE_VERIFIED

Actual: mobile_equipment:SAFE_VERIFIED [a forklift backs through a marked pedestrian aisle with no separation]; machine_guarding:HISTORICAL [the guard was missing yesterday]; powered_industrial_trucks:HISTORICAL [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.]

Scorer: missing=2; unsupported=1; wrongState=2; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-046

Observation: A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: machine_guarding:INTERMITTENT

Actual: mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; powered_industrial_trucks:INTERMITTENT [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection.]; mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; powered_industrial_trucks:INTERMITTENT [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection.]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-047

Observation: A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: machine_guarding:PLANNED_FUTURE

Actual: mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; powered_industrial_trucks:PLANNED_FUTURE [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun.]; mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; powered_industrial_trucks:PLANNED_FUTURE [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun.]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-048

Observation: A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: machine_guarding:UNKNOWN

Actual: mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; powered_industrial_trucks:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available.]; mobile_equipment:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation]; powered_industrial_trucks:ACTIVE [a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available.]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-049

Observation: A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The machine is operating now with a missing guard at the rotating shaft.

Expected by V2 rubric: mobile_equipment:ACTIVE

Actual: powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]; powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-050

Observation: A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: mobile_equipment:ACTIVE

Actual: powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; machine_guarding:HISTORICAL [the employee reports the guard was missing last month]; powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-051

Observation: A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: mobile_equipment:ACTIVE; machine_guarding:SAFE_VERIFIED; machine_guarding:SAFE_VERIFIED

Actual: powered_industrial_trucks:SAFE_VERIFIED [a haul truck travels a mine haul road]; machine_guarding:HISTORICAL [the guard was missing yesterday]

Scorer: missing=2; unsupported=1; wrongState=1; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-052

Observation: A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: mobile_equipment:ACTIVE; machine_guarding:INTERMITTENT

Actual: powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-053

Observation: A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: mobile_equipment:ACTIVE; machine_guarding:PLANNED_FUTURE

Actual: powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-054

Observation: A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: mobile_equipment:ACTIVE; machine_guarding:UNKNOWN

Actual: powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; powered_industrial_trucks:ACTIVE [a haul truck travels a mine haul road]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-055

Observation: A construction trench is open with spoil at the edge and no protective system described. The machine is operating now with a missing guard at the rotating shaft.

Expected by V2 rubric: excavation_trenching:ACTIVE

Actual: fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; machine_guarding:ACTIVE [the machine is operating now with a missing guard at the rotating shaft]; fall_protection:ACTIVE [a construction trench is open with spoil at the edge]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=false

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-056

Observation: A construction trench is open with spoil at the edge and no protective system described. The employee reports the guard was missing last month, but current condition was not inspected.

Expected by V2 rubric: excavation_trenching:ACTIVE

Actual: fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; machine_guarding:HISTORICAL [the employee reports the guard was missing last month]; fall_protection:ACTIVE [a construction trench is open with spoil at the edge]

Scorer: missing=1; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-057

Observation: A construction trench is open with spoil at the edge and no protective system described. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.

Expected by V2 rubric: excavation_trenching:ACTIVE; machine_guarding:SAFE_VERIFIED; machine_guarding:SAFE_VERIFIED

Actual: fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; machine_guarding:HISTORICAL [the guard was missing yesterday]; fall_protection:ACTIVE [a construction trench is open with spoil at the edge]

Scorer: missing=2; unsupported=2; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-058

Observation: A construction trench is open with spoil at the edge and no protective system described. The interlock reportedly fails during startup several times per week but functioned during this inspection.

Expected by V2 rubric: excavation_trenching:ACTIVE; machine_guarding:INTERMITTENT

Actual: fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]; fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; guarding_interlocks:INTERMITTENT [the interlock reportedly fails during startup several times per week but functioned during this inspection]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-059

Observation: A construction trench is open with spoil at the edge and no protective system described. Excavation work is scheduled to start next week; no excavation has begun.

Expected by V2 rubric: excavation_trenching:ACTIVE; machine_guarding:PLANNED_FUTURE; excavation_trenching:ACTIVE

Actual: fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]; fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; excavation_trenching:PLANNED_FUTURE [excavation work is scheduled to start next week]

Scorer: missing=2; unsupported=2; wrongState=1; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.

## st-060

Observation: A construction trench is open with spoil at the edge and no protective system described. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.

Expected by V2 rubric: excavation_trenching:ACTIVE; machine_guarding:UNKNOWN

Actual: fall_protection:ACTIVE [a construction trench is open with spoil at the edge]; electrical:HISTORICAL [a prior note says the electrical cord may be damaged]; fall_protection:ACTIVE [a construction trench is open with spoil at the edge]

Scorer: missing=2; unsupported=2; wrongState=0; clarificationMismatch=true

Classification: **RUBRIC_DEFECT**

Reason: Compound-family alias, required/allowed mismatch, or clarification policy mismatch; production output is semantically supported by source evidence.
