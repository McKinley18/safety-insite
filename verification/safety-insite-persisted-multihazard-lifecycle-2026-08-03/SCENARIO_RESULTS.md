# Browser lifecycle scenarios

| Scenario | Browser/persistence evidence | Result |
|---|---|---|
| Electrical + fall | Inspection `90fded51-5dbf-4d80-ba2b-5eca811a8fe7`; reload retained 4 active routed findings; 4 actions/tasks; completed; report downloaded with checksum `41a424e50a111164e2dd80911dde597375612236d0206142eab082207175ceb4`. | PASS for durable decomposition/lifecycle evidence; engine emitted additional routed hazards, so exact two-card expectation is not claimed. |
| Guarding + energy | Fresh browser run retained two persisted finding cards after reload; latest completed inspection `7e09abad-ab41-4267-988a-dd6eea6d1811`; report `090212a0-afe7-45d3-99e6-8978d09a8006` v1, 2597 bytes, SHA-256 `b4ba17023eb5ca7cfde03429d48f4b3ec03861a62d19808c85e74130d57875e4`. | PASS for persisted finding/reload/report grouping; per-finding risk governance remains partial. |
| Hot work + gas | Inspection `e03e7e4b-91a4-46ab-a38c-83e7fb2e39f8`; 3 active routed findings, 3 actions/tasks; report `c83d1b52-3028-4437-9467-88b96a75895a` v1, 2917 bytes, SHA-256 `e3e456e757e6060936a274b55b55b4d468922581cfb01c6ec2da17c4a61b3bdd`. | PASS for distinct persistence and evidence-gated compressed-gas handling. |

The PDF renderer now excludes superseded findings from current snapshots. Visual QA of `report-latest-filtered.pdf` showed separate finding lines and hazard-specific corrective actions with no clipping or overlap.
