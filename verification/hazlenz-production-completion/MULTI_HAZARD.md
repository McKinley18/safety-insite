# Multi-hazard persistence

Implemented:

- durable `segmentKey`, source-candidate snapshot, and reviewer disposition on findings
- unique observation/segment/revision identity
- separate version chains per segment
- frontend reviewer selection of multiple hazard candidates
- segmentation decision persisted in the human review
- separate findings, actions, and tasks for selected hazards

Verified in the canonical workflow with a guarding plus damaged-cord observation: two findings persisted, common observation evidence remained shared, and the workflow remained reload-safe at the database layer.

Still required: full browser split/merge/dismiss interaction and report rendering verification for all eight requested multi-hazard families.

