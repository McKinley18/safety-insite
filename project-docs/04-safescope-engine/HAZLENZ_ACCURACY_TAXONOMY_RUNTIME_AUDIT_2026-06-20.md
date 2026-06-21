# HazLenz Accuracy, Taxonomy, and Runtime Audit — 2026-06-20

## Current architecture

HazLenz uses a staged advisory pipeline: observation/evidence fusion, weighted classification, risk evaluation, lightweight knowledge routing, scoped standards retrieval, optional full intelligence orchestration, and corrective-action enrichment. The intended reasoning chain exists, but multiple layers still infer taxonomy independently. Full intelligence is dynamically imported; core classification, standards, risk, and actions remain available in degraded mode.

Standards candidates come from compact database queries and focused approved shards. Candidates are ranked, deduplicated, jurisdiction-filtered, and then gated on hazard domain, mechanism, jurisdiction, required evidence, and disqualifying evidence. Unsupported candidates remain reviewable through `needsMoreEvidenceStandards` or `excludedStandards`.

## Highest-value findings

1. Corrective-action category matching used display labels inconsistently. `Walking/Working Surfaces`, `Machine Guarding`, and `Compressed Gas Cylinders` did not reach their intended contextual-control branches.
2. Compressed-gas cylinders lacked a focused route/index/shard despite active source-backed OSHA candidate support.
3. Electrical panel actions inherited generic damaged-component language instead of explicitly addressing open breaker slots and enclosure integrity.
4. Taxonomy identifiers drift across layers. This is currently a compatibility problem, not a safe candidate for a breaking rename.
5. The multi-megabyte scenario JSON datasets are validation/development assets and are not imported by the production application module. The larger request-time risk is importing the full intelligence graph when heap is already near a small Render instance limit.

## Taxonomy alias and migration map

| Current names | Canonical name | Primary affected areas | Migration path |
| --- | --- | --- | --- |
| `Compressed Gas Cylinders`, `compressed_gas_cylinders`, `compressed_gas` | `compressed_gas` | classifier, scenario intelligence, standards, router | Resolve aliases internally; preserve current response labels until a versioned contract migration. |
| `Hazard Communication`, `hazcom`, `hazard_communication`, `hazardous_materials`, `hazcom_chemical_exposure` | `hazard_communication` | classifier, scenario intelligence, approved knowledge, standards | Adopt canonical family internally; retain `chemical_exposure` as a mechanism/domain only where exposure is actually described. |
| `Walking/Working Surfaces`, `walking_working_surfaces`, `slip_trip_fall`, `housekeeping` | `walking_working_surfaces` | classifier, risk, scenario intelligence, router | Treat slip/trip/fall as mechanism and housekeeping as condition/context. |
| `Lockout / Stored Energy`, `loto`, `machine_guarding_loto`, `lockout_tagout` | `lockout_tagout` | classifier, scenario intelligence, standards | Preserve machine guarding as a separate concurrent family when independently evidenced. |
| `Mobile Equipment / Traffic`, `powered_mobile_equipment`, `mobile_equipment` | `mobile_equipment` | classifier, router, standards | Preserve `powered_haulage` only for its distinct regulatory/equipment scope. |

The reusable alias resolver is in `backend/src/safescope-v2/taxonomy/canonical-taxonomy-aliases.ts`. This pass uses it only for internal corrective-control routing; response contracts are unchanged.

## Memory impact

- Existing route-scoped standards queries and lazy full-orchestrator import remain intact.
- A production Render pre-import guard now skips the full intelligence graph when heap usage is at or above `HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB` (default 420 MB). Core advisory output remains available.
- No validation datasets or draft packs were moved because the import audit did not show them in the production request path.
- Expected effect: avoid the largest optional request-time allocation when the process is already near the reported 488 MB heap condition. This is an OOM prevention guard, not a claim that baseline RSS will fall by a fixed amount.

## Deferred work

- Consolidate domain inference behind one versioned taxonomy service.
- Expand evidence gates beyond current high-frequency standard families using approved source metadata.
- Measure cold-start and first/full-request RSS in a Render-equivalent container.
- Split the full intelligence orchestrator into independently lazy capability groups before changing default production behavior.
- Review exact citation applicability for portable oxygen-cylinder configurations with qualified regulatory reviewers.
