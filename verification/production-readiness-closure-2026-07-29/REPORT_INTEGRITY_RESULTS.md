# Report Integrity Results

The private report suite passed 12 scenarios. It persisted one report, two immutable versions, two private storage objects, and two audit events. Version checksums were distinct in the verified run. Foreign-user download returned 404.

The authenticated browser gate generated a real report from the persisted observation, HazLenz snapshot, human review, finding, corrective action, and task, then confirmed the report remained after reload.

Generated versions are marked successful only after PDF validation and durable object storage. Older generated versions are superseded rather than mutated or deleted.
