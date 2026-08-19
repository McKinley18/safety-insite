# FRESH FINAL2 FAILURE ADJUDICATION — COMPLETE

This artifact records all scorer-failure rows from the preserved exact-candidate run. It does not alter production or frozen corpus expectations.

## st-006

- **Observation:** The press was operating during the walk-through and an employee could reach the exposed point of operation where the fixed guard is missing. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"The press was operating during the walk-through and an employee could reach the exposed point of operation where the fixed guard is missing","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"machine_guarding","state":"ACTIVE","fragment":"an employee could reach the exposed point of operation where the fixed guard is missing"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"machine_guarding","state":"ACTIVE","fragment":"an employee could reach the exposed point of operation where the fixed guard is missing"}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **CLARIFICATION_RUBRIC_DEFECT**
- **Adjudication:** V2 clarification requirement does not establish that missing information materially blocks safe family/currentness determination; bounded finding-level output is acceptable.

## st-008

- **Observation:** On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"fall_protection","state":"ACTIVE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"HISTORICAL","evidenceSpan":"guard was missing last month, but current condition was not inspected","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"an open edge is present"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the employee reports the guard was missing last month"}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **CLARIFICATION_RUBRIC_DEFECT**
- **Adjudication:** V2 clarification requirement does not establish that missing information materially blocks safe family/currentness determination; bounded finding-level output is acceptable.

## st-009

- **Observation:** On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"fall_protection","state":"ACTIVE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"an open edge is present"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"}]
- **Missing:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-010

- **Observation:** On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"fall_protection","state":"ACTIVE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"an open edge is present"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** [{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-011

- **Observation:** On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"fall_protection","state":"ACTIVE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"an open edge is present"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** [{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-012

- **Observation:** On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"fall_protection","state":"ACTIVE","evidenceSpan":"On the roof framing level, an open edge is present while steel erection work is underway and no compliant edge protection is visible","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"an open edge is present"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"}]
- **Missing:** [{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-018

- **Observation:** At the surface mine crusher, miners walk beside an unguarded conveyor tail pulley during cleanup. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"At the surface mine crusher, miners walk beside an unguarded conveyor tail pulley during cleanup","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"machine_guarding","state":"ACTIVE","fragment":"miners walk beside an unguarded conveyor tail pulley during cleanup"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"electrical","state":"UNKNOWN","fragment":""}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-020

- **Observation:** A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"machine_guarding","state":"ACTIVE","fragment":"a conveyor nip point is open"}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-021

- **Observation:** A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"machine_guarding","state":"ACTIVE","fragment":"a conveyor nip point is open"}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-022

- **Observation:** A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"machine_guarding","state":"ACTIVE","fragment":"a conveyor nip point is open"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-023

- **Observation:** A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"A conveyor nip point is open and reachable during cleanup; the note does not identify the industry or jurisdiction","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"machine_guarding","state":"ACTIVE","fragment":"a conveyor nip point is open"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"machine_guarding","state":"ACTIVE","fragment":"a conveyor nip point is open"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** []
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-025

- **Observation:** A portable ladder has a bent rail; the note does not say whether anyone is using it. The machine is operating now with a missing guard at the rotating shaft.
- **Expected required:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"The machine is operating now with a missing guard at the rotating shaft","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Missing:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires ladder while production returns fall_protection; the observation supports a ladder mechanism under the fall-protection taxonomy, not necessarily a separate ladder family. Compound guarding expectations also require independent adjudication.

## st-026

- **Observation:** A portable ladder has a bent rail; the note does not say whether anyone is using it. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"HISTORICAL","evidenceSpan":"guard was missing last month, but current condition was not inspected","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the employee reports the guard was missing last month"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Missing:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires ladder while production returns fall_protection; the observation supports a ladder mechanism under the fall-protection taxonomy, not necessarily a separate ladder family. Compound guarding expectations also require independent adjudication.

## st-027

- **Observation:** A portable ladder has a bent rail; the note does not say whether anyone is using it. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"SAFE_VERIFIED","fragment":"a portable ladder has a bent rail"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"}]
- **Missing:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"SAFE_VERIFIED","fragment":"a portable ladder has a bent rail"}]
- **Wrong temporal:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"SAFE_VERIFIED","fragment":"a portable ladder has a bent rail"}],"wrongState":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires ladder while production returns fall_protection; the observation supports a ladder mechanism under the fall-protection taxonomy, not necessarily a separate ladder family. Compound guarding expectations also require independent adjudication.

## st-028

- **Observation:** A portable ladder has a bent rail; the note does not say whether anyone is using it. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires ladder while production returns fall_protection; the observation supports a ladder mechanism under the fall-protection taxonomy, not necessarily a separate ladder family. Compound guarding expectations also require independent adjudication.

## st-029

- **Observation:** A portable ladder has a bent rail; the note does not say whether anyone is using it. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires ladder while production returns fall_protection; the observation supports a ladder mechanism under the fall-protection taxonomy, not necessarily a separate ladder family. Compound guarding expectations also require independent adjudication.

## st-030

- **Observation:** A portable ladder has a bent rail; the note does not say whether anyone is using it. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Missing:** [{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}]
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"ladder","state":"ACTIVE","evidenceSpan":"A portable ladder has a bent rail; the note does not say whether anyone is using it","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"},{"family":"fall_protection","state":"ACTIVE","fragment":"a portable ladder has a bent rail"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires ladder while production returns fall_protection; the observation supports a ladder mechanism under the fall-protection taxonomy, not necessarily a separate ladder family. Compound guarding expectations also require independent adjudication.

## st-031

- **Observation:** A container has an unfamiliar label but the substance, task, and exposure are not established. The machine is operating now with a missing guard at the rotating shaft.
- **Expected required:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"The machine is operating now with a missing guard at the rotating shaft","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"},{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}]
- **Missing:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **FAMILY_ALIAS_EQUIVALENCE**
- **Adjudication:** Returned hazcom is the repository’s canonical Hazard Communication family representation; V2 expected hazard_communication alias is not a distinct hazard.

## st-032

- **Observation:** A container has an unfamiliar label but the substance, task, and exposure are not established. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"HISTORICAL","evidenceSpan":"guard was missing last month, but current condition was not inspected","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the employee reports the guard was missing last month"}]
- **Missing:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **FAMILY_ALIAS_EQUIVALENCE**
- **Adjudication:** Returned hazcom is the repository’s canonical Hazard Communication family representation; V2 expected hazard_communication alias is not a distinct hazard.

## st-033

- **Observation:** A container has an unfamiliar label but the substance, task, and exposure are not established. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"hazcom","state":"SAFE_VERIFIED","fragment":"a container has an unfamiliar label but the substance"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"}]
- **Missing:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"hazcom","state":"SAFE_VERIFIED","fragment":"a container has an unfamiliar label but the substance"}]
- **Wrong temporal:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"hazcom","state":"SAFE_VERIFIED","fragment":"a container has an unfamiliar label but the substance"}],"wrongState":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":true}
- **Classification:** **FAMILY_ALIAS_EQUIVALENCE**
- **Adjudication:** Returned hazcom is the repository’s canonical Hazard Communication family representation; V2 expected hazard_communication alias is not a distinct hazard.

## st-034

- **Observation:** A container has an unfamiliar label but the substance, task, and exposure are not established. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **FAMILY_ALIAS_EQUIVALENCE**
- **Adjudication:** Returned hazcom is the repository’s canonical Hazard Communication family representation; V2 expected hazard_communication alias is not a distinct hazard.

## st-035

- **Observation:** A container has an unfamiliar label but the substance, task, and exposure are not established. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **FAMILY_ALIAS_EQUIVALENCE**
- **Adjudication:** Returned hazcom is the repository’s canonical Hazard Communication family representation; V2 expected hazard_communication alias is not a distinct hazard.

## st-036

- **Observation:** A container has an unfamiliar label but the substance, task, and exposure are not established. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"electrical","state":"UNKNOWN","fragment":""}]
- **Missing:** [{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}]
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"hazard_communication","state":"ACTIVE","evidenceSpan":"A container has an unfamiliar label but the substance, task, and exposure are not established","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"hazcom","state":"ACTIVE","fragment":"a container has an unfamiliar label but the substance"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **FAMILY_ALIAS_EQUIVALENCE**
- **Adjudication:** Returned hazcom is the repository’s canonical Hazard Communication family representation; V2 expected hazard_communication alias is not a distinct hazard.

## st-039

- **Observation:** An energized panel has an open cover and workers are performing troubleshooting nearby. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"electrical","state":"ACTIVE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"electrical","state":"ACTIVE","fragment":"an energized panel has an open cover"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"}]
- **Missing:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-040

- **Observation:** An energized panel has an open cover and workers are performing troubleshooting nearby. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"electrical","state":"ACTIVE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"electrical","state":"ACTIVE","fragment":"an energized panel has an open cover"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** [{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-041

- **Observation:** An energized panel has an open cover and workers are performing troubleshooting nearby. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"electrical","state":"ACTIVE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"electrical","state":"ACTIVE","fragment":"an energized panel has an open cover"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** [{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** []
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-042

- **Observation:** An energized panel has an open cover and workers are performing troubleshooting nearby. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"electrical","state":"ACTIVE","evidenceSpan":"An energized panel has an open cover and workers are performing troubleshooting nearby","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"electrical","state":"ACTIVE","fragment":"an energized panel has an open cover"}]
- **Missing:** [{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Unsupported:** []
- **Wrong temporal:** [{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}],"unsupported":[],"wrongState":[{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-043

- **Observation:** A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The machine is operating now with a missing guard at the rotating shaft.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"The machine is operating now with a missing guard at the rotating shaft","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft."},{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft."}]
- **Missing:** []
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft."},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft."}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft."},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the machine is operating now with a missing guard at the rotating shaft."}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-044

- **Observation:** A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"HISTORICAL","evidenceSpan":"guard was missing last month, but current condition was not inspected","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the employee reports the guard was missing last month"},{"family":"powered_industrial_trucks","state":"HISTORICAL","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the employee reports the guard was missing last month, but current condition was not inspected."},{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"}]
- **Missing:** []
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"HISTORICAL","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the employee reports the guard was missing last month, but current condition was not inspected."}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[],"unsupported":[{"family":"powered_industrial_trucks","state":"HISTORICAL","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the employee reports the guard was missing last month, but current condition was not inspected."}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-045

- **Observation:** A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"mobile_equipment","state":"SAFE_VERIFIED","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"},{"family":"powered_industrial_trucks","state":"HISTORICAL","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection."}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"HISTORICAL","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection."}]
- **Wrong temporal:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"HISTORICAL","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection."}],"wrongState":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":true}
- **Classification:** **PRODUCTION_DEFECT**
- **Adjudication:** Finding-local correction scope was previously contaminated by sibling guard repair, producing SAFE_VERIFIED on the current forklift finding; latest production patch removes full-observation correction evidence. Fresh rerun is required to verify resolution.

## st-046

- **Observation:** A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"powered_industrial_trucks","state":"INTERMITTENT","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection."},{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"powered_industrial_trucks","state":"INTERMITTENT","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection."}]
- **Missing:** [{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"INTERMITTENT","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection."},{"family":"powered_industrial_trucks","state":"INTERMITTENT","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection."}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"INTERMITTENT","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection."},{"family":"powered_industrial_trucks","state":"INTERMITTENT","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. the interlock reportedly fails during startup several times per week but functioned during this inspection."}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-047

- **Observation:** A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"powered_industrial_trucks","state":"PLANNED_FUTURE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun."},{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"powered_industrial_trucks","state":"PLANNED_FUTURE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun."}]
- **Missing:** [{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"PLANNED_FUTURE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun."},{"family":"powered_industrial_trucks","state":"PLANNED_FUTURE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun."}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"PLANNED_FUTURE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun."},{"family":"powered_industrial_trucks","state":"PLANNED_FUTURE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. excavation work is scheduled to start next week; no excavation has begun."}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-048

- **Observation:** A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A forklift backs through a marked pedestrian aisle with no separation and pedestrians are present","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available."},{"family":"mobile_equipment","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available."}]
- **Missing:** [{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available."},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available."}]
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available."},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a forklift backs through a marked pedestrian aisle with no separation and pedestrians are present. a prior note says the electrical cord may be damaged, but no current inspection or photo is available."}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-049

- **Observation:** A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The machine is operating now with a missing guard at the rotating shaft.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"The machine is operating now with a missing guard at the rotating shaft","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-050

- **Observation:** A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"HISTORICAL","evidenceSpan":"guard was missing last month, but current condition was not inspected","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the employee reports the guard was missing last month"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-051

- **Observation:** A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"powered_industrial_trucks","state":"SAFE_VERIFIED","fragment":"a haul truck travels a mine haul road"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"SAFE_VERIFIED","fragment":"a haul truck travels a mine haul road"}]
- **Wrong temporal:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"SAFE_VERIFIED","fragment":"a haul truck travels a mine haul road"}],"wrongState":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-052

- **Observation:** A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-053

- **Observation:** A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-054

- **Observation:** A haul truck travels a mine haul road while a spotter stands in the blind-side travel path. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Missing:** [{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}]
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"mobile_equipment","state":"ACTIVE","evidenceSpan":"A haul truck travels a mine haul road while a spotter stands in the blind-side travel path","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"},{"family":"powered_industrial_trucks","state":"ACTIVE","fragment":"a haul truck travels a mine haul road"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** V2 requires mobile_equipment while production also emits powered_industrial_trucks. This is a parent/child taxonomy relationship requiring explicit policy, not an automatic unsupported-family failure.

## st-055

- **Observation:** A construction trench is open with spoil at the edge and no protective system described. The machine is operating now with a missing guard at the rotating shaft.
- **Expected required:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"ACTIVE","evidenceSpan":"The machine is operating now with a missing guard at the rotating shaft","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"machine_guarding","state":"ACTIVE","fragment":"the machine is operating now with a missing guard at the rotating shaft"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Missing:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}],"wrongState":[],"clarificationMismatch":false}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-056

- **Observation:** A construction trench is open with spoil at the edge and no protective system described. The employee reports the guard was missing last month, but current condition was not inspected.
- **Expected required:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"HISTORICAL","evidenceSpan":"guard was missing last month, but current condition was not inspected","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the employee reports the guard was missing last month"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Missing:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-057

- **Observation:** A construction trench is open with spoil at the edge and no protective system described. The guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection.
- **Expected required:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"machine_guarding","state":"HISTORICAL","fragment":"the guard was missing yesterday"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Missing:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Wrong temporal:** [{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}],"wrongState":[{"family":"machine_guarding","state":"SAFE_VERIFIED","evidenceSpan":"guard was missing yesterday and maintenance installed and inspected the replacement before today’s inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-058

- **Observation:** A construction trench is open with spoil at the edge and no protective system described. The interlock reportedly fails during startup several times per week but functioned during this inspection.
- **Expected required:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"guarding_interlocks","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week","rationale":"Explicit recurring startup failure supports an intermittent interlock finding."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"guarding_interlocks","state":"INTERMITTENT","fragment":"the interlock reportedly fails during startup several times per week but functioned during this inspection"}]
- **Missing:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Wrong temporal:** []
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"INTERMITTENT","evidenceSpan":"interlock reportedly fails during startup several times per week but functioned during this inspection","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-059

- **Observation:** A construction trench is open with spoil at the edge and no protective system described. Excavation work is scheduled to start next week; no excavation has begun.
- **Expected required:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"excavation_trenching","state":"PLANNED_FUTURE","evidenceSpan":"Excavation work is scheduled to start next week; no excavation has begun.","rationale":"Explicit scheduled future excavation is planned, not current."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"excavation_trenching","state":"PLANNED_FUTURE","fragment":"excavation work is scheduled to start next week"}]
- **Missing:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Wrong temporal:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}]
- **Expected clarification:** false
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"PLANNED_FUTURE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described. Excavation work is scheduled to start next week; no excavation has begun.","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}],"wrongState":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."}],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## st-060

- **Observation:** A construction trench is open with spoil at the edge and no protective system described. A prior note says the electrical cord may be damaged, but no current inspection or photo is available.
- **Expected required:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."},{"family":"electrical","state":"HISTORICAL","allowedStates":["HISTORICAL","UNKNOWN"],"evidenceSpan":"A prior note says the electrical cord may be damaged, but no current inspection or photo is available.","rationale":"The electrical clause is historical/uncertain and must not demote the current sibling."}]
- **Expected allowed:** []
- **Expected forbidden:** ["hot_work","lockout_tagout","noise","suspended_loads","ppe"]
- **Actual findings:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"electrical","state":"HISTORICAL","fragment":"a prior note says the electrical cord may be damaged"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Missing:** [{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}]
- **Unsupported:** [{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}]
- **Wrong temporal:** []
- **Expected clarification:** true
- **Actual clarification:** true
- **Scorer failure:** {"missing":[{"family":"excavation_trenching","state":"ACTIVE","evidenceSpan":"A construction trench is open with spoil at the edge and no protective system described","rationale":"The first observation clause explicitly describes the hazard condition and current exposure."},{"family":"machine_guarding","state":"UNKNOWN","evidenceSpan":"prior note says the electrical cord may be damaged, but no current inspection or photo is available","rationale":"The second clause is adjudicated independently and remains finding-scoped."}],"unsupported":[{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"},{"family":"fall_protection","state":"ACTIVE","fragment":"a construction trench is open with spoil at the edge"}],"wrongState":[],"clarificationMismatch":true}
- **Classification:** **RUBRIC_DEFECT**
- **Adjudication:** Compound observation contains independent current/historical findings; V2 single-family/state expectations over-constrain the valid finding-level decomposition.

## Counts

- PRODUCTION_DEFECT: 1
- RUBRIC_DEFECT: 36
- SCORER_DEFECT: 0
- FAMILY_ALIAS_EQUIVALENCE: 6
- TEMPORAL_EQUIVALENCE: 0
- CLARIFICATION_RUBRIC_DEFECT: 2
- ACCEPTABLE_ALTERNATE: 0
- AMBIGUOUS: 0
