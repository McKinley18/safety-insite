# Stage-loss analysis

Stage tracing was enabled only with `debugMetadata=true` and opaque workspace IDs. It does not alter ordinary response output or import expected answers. The final trace covers all 32 originally failed family observations. Each expected family is present in the decomposition and serialized response, and is recognized in the final returned labels.

The observed loss was downstream visibility/taxonomy serialization: decomposition families were computed but not promoted into `additionalHazards` with stable display labels. A second issue was compatibility-adapter safe-state reintroduction of an UNKNOWN hazardous-energy candidate. Both were fixed generally. See `HAZLENZ_STAGE_LOSS_SUMMARY.json`.