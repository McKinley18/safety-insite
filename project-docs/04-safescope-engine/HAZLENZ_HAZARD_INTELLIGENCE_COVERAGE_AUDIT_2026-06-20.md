# HazLenz Hazard Intelligence Coverage Audit — 2026-06-20

## Scope and architecture

HazLenz currently reasons through several cooperating layers: evidence fusion and weighted classification, observation/equipment understanding, lightweight knowledge routing, jurisdiction-scoped standards retrieval, scenario/mechanism reasoning, evidence-gap generation, and advisory corrective-action enrichment. The architecture contains the requested reasoning chain, but taxonomy and mechanism names have historically drifted between the classifier, reasoning orchestrator, scenario registry, standards families, and action templates.

This audit reviewed:

- `backend/src/safescope-v2/classifier`, `understanding`, `hazard-domain-intelligence`, `reasoning-orchestrator`, `brain`, `risk`, and `tests`
- `backend/src/applicable-standards` and standards-intelligence/source-backed applicability modules
- hazard/scenario/standard-family registries and corrective-action templates
- approved and draft knowledge packs under `safescope-data/approved-knowledge`
- validation scripts and production runtime loading paths

Support ratings mean: **strong** = end-to-end deterministic coverage and useful source-backed candidates; **partial** = core reasoning exists but one or more of standards, evidence specificity, or tests are incomplete; **weak** = family-level advisory reasoning exists but approved citation support is insufficient; **missing** = no defensible route before this pass.

## Cross-cutting findings

1. Core acute-safety coverage is substantially stronger than specialty health/environmental coverage.
2. Late physical-hazard overrides often found the right condition but returned broad domains such as `health_exposure` or `environmental_exposure`, weakening downstream questions and tests.
3. Several mechanism outputs were equipment failure labels rather than stable injury-mechanism families.
4. Standards coverage is strongest for OSHA/MSHA guarding, electrical, HazCom, LOTO, walking surfaces, falls, mobile equipment, and compressed gas. Heat, ergonomics, water, dropped objects, and environmental releases should generally remain family-level or needs-more-evidence outputs unless jurisdiction and source facts are established.
5. Corrective-action templates existed for many domains, but display-label drift prevented some production actions from reaching the correct branch.
6. Evidence gaps were strong for core domains but generic for compressed gas, noise, heat, dropped objects, highwalls, water, and environmental pathways.
7. Existing test coverage was deep but fragmented. It did not provide one compact cross-domain benchmark asserting domain, mechanism, evidence, action, and governance together.

## Domain coverage matrix

Common implementation files: `hazard-universe.registry.ts`, `safescope-taxonomy.registry.ts`, `reasoning-orchestrator.service.ts`, `applicable-standards.service.ts`, `contextual-control.engine.ts`, and the new test-only `hazard-understanding-coverage-benchmark.ts`.

| # | Domain | Support | Classification | Mechanism | Standards | Corrective actions | Tests | Highest FP / FN risk | Recommended next improvement |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Compressed gas cylinders | Strong | `compressed_gas` / display label supported | Projectile or gas release | Source-backed `1910.101`; specific oxygen/welding citations gated | Restraint, upright storage, valve protection, traffic protection | Hardening + 25-domain benchmark | FP: generic container as cylinder; FN: unusual gas-bottle wording | Add qualified review of state/fire-code storage overlays without auto-citing. |
| 2 | HazCom / labels / SDS | Strong | `hazard_communication` aliases normalize from `hazardous_materials` | Unknown-substance contact/inhalation | Strong `1910.1200` route and evidence gates | Identify, remove from use, label, verify SDS | Strong golden/hardening/benchmark | FP: any unlabeled nonchemical item; FN: illegible supplier labels | Separate labeling-only from actual exposure mechanisms while retaining one family. |
| 3 | Electrical panels/cords/wiring | Strong | `electrical` | Shock or arc flash | Strong OSHA/MSHA mappings with jurisdiction gates | Access control, de-energization, listed covers/fillers, qualified repair | Strong | FP: nearby panel with no defect; FN: indirect grounding/GFCI facts | Expand component-specific evidence gates for cords, temporary power, and wet locations. |
| 4 | Machine guarding | Strong | `machine_guarding` | Caught-in, entanglement, crushing | Strong OSHA/MSHA guarding support | Stop use, physical guard, LOTO for service, verification | Strong | FP: “guardrail” interpreted as machine guard; FN: unusual point-of-operation wording | Continue negation and access-path tests. |
| 5 | Conveyors/pinch points | Strong | Machine guarding with conveyor context | In-running nip/caught-in | Strong MSHA/OSHA route support | Stop exposure, fixed guard, LOTO, safer cleanup method | Strong | FP: stationary belt reference; FN: return roller terminology | Add operating-state and miner-access evidence to citation confidence. |
| 6 | LOTO/stored energy | Strong | Canonical `lockout_tagout` from legacy `machine_guarding_loto` | Unexpected startup/stored-energy release | Strong OSHA/MSHA candidates | Stop work, identify/isolate energy, lockout, try/test | Strong | FP: routine operation mentioning energy; FN: “locking out” grammatical variants | Expand hydraulic/gravity blocking scenarios. |
| 7 | Walking-working surfaces | Strong | Canonical `walking_working_surfaces` | Same-level slip/trip/fall | Strong `1910.22`/MSHA housekeeping support | Barricade, clean, correct source, verify traction | Strong | FP: walkway as location context; FN: subtle surface defects | Preserve mechanism-plus-surface evidence gate. |
| 8 | Fall protection/ladders/scaffolds | Strong | `fall_protection` with scaffold/ladder subcontexts | Fall to lower level | Strong construction; partial general-industry subtype depth | Restrict access, guardrails/covers/PFAS, inspect | Strong | FP: “roof” as ground control; FN: nonstandard edge language | Version ladder/scaffold subfamilies without changing top-level contract. |
| 9 | Mobile equipment/pedestrians | Strong | `mobile_equipment` | Struck-by/caught-between | Strong MSHA; OSHA PIT support where facts fit | Separation, traffic plan, exclusion zones, communication | Strong | FP: stationary equipment; FN: mixed traffic without “pedestrian” | Add operating state and route-layout questions. |
| 10 | Fire/flammable/hot work | Partial | `fire_protection` / hot-work aliases | Ignition, fire, explosion | Coverage exists but exact flammable-storage applicability needs stronger approved facts | Control ignition/fuel, permits, fire watch, post-work check | Benchmark + scenario fixtures | FP: “hot” heat-stress text; FN: vapor pathway without “flammable” | Add fuel-vapor/ignition/quantity evidence gate before citation activation. |
| 11 | Emergency exits/egress | Partial | Canonical `emergency_egress` from `emergency_preparedness` | Delayed/prevented evacuation | Family mappings exist; jurisdiction-specific exact citations need evidence | Clear route, prevent storage, verify route/door | Benchmark + existing egress tests | FP: ordinary access blockage; FN: exit-door hardware issues | Add route width, door operation, signage, and occupancy questions. |
| 12 | Confined space | Strong | `confined_space`, now requiring entry/atmosphere context for tank cases | Atmospheric asphyxiation/toxic exposure | Strong OSHA family support | Stop entry, classify, test, isolate, ventilate, attendant/rescue | Strong | FP: any tank; FN: pits/vaults without “confined” | Add engulfment and configuration-based entry evidence. |
| 13 | Excavation/trenching | Strong | `excavation_trenching` | Cave-in/crushing/engulfment | Strong construction family and draft depth | Remove workers, slope/shore/shield, competent review | Strong | FP: excavation equipment only; FN: vertical wall wording | Add depth/soil/protective-system applicability scoring. |
| 14 | PPE | Partial | Canonical `personal_protective_equipment` from `ppe` | Exposure-specific; eye/face now flying-particle injury | PPE standards exist but must remain secondary to source controls | Stop task, select task-specific eye/face or other PPE, verify training/fit | PPE suite + benchmark | FP: PPE mention with no deficiency; FN: “without a face shield” phrasing | Expand PPE subtype mechanism map while preventing PPE-only primary controls. |
| 15 | Respiratory/silica/dust/fumes | Partial | Canonical `respirable_dust_silica` from `health_respiratory` | Respirable inhalation | Silica mappings/draft packs exist; exact tables/tasks need facts | Wet methods, LEV/dust collection, exposure evaluation, respirator program | Existing silica tests + benchmark | FP: nuisance dust; FN: “dry cuts” inflection | Add material composition, task duration, and control-table evidence. |
| 16 | Noise/hearing conservation | Partial | Explicit `noise_exposure` | Noise-induced hearing loss | `1910.95` family support exists; measured dose is usually missing | Limit exposure, measure dose, engineering controls, HPD/program review | Benchmark | FP: merely “loud”; FN: communication interference wording | Gate active citations on jurisdiction plus measured/credible exposure basis. |
| 17 | Heat/cold stress | Weak | Explicit `heat_stress`; `cold_stress` canonicalized | Heat illness / cold injury | Guidance-level support; do not force citations | Water/rest/shade/acclimatization; cold controls remain follow-up | Benchmark covers heat; existing override covers cold | FP: “hot work” as heat; FN: radiant heat or wet-cold context | Add a cold-stress benchmark and environmental measurement questions. |
| 18 | Ergonomics/material handling | Weak | `ergonomics` | Musculoskeletal overexertion/strain | Guidance/family-level only | Lift aids, raise work height, redesign, team lift | Benchmark + existing ergonomics validation | FP: mechanical lifting/rigging; FN: repetition without “heavy” | Add frequency, load, posture, reach, duration scoring; avoid invented citations. |
| 19 | Crane/rigging/hoisting | Partial | `cranes_rigging_hoisting` | Rigging failure/dropped load | OSHA construction/general-industry mappings exist with context | Remove sling, qualified rigger, inspection/capacity/exclusion zone | Strong fixtures + benchmark | FP: ergonomic “lifting”; FN: missing tag without “damaged” | Separate crane, hoist, and below-the-hook applicability facts. |
| 20 | Welding/cutting/brazing | Partial | Canonical fire/hot-work route | Ignition of combustibles/vapors | Welding standards available; fuel-gas citations now require welding/fuel-gas evidence | Control combustibles, permit, fire watch, extinguishing equipment | Benchmark | FP: oxygen cylinder alone; FN: brazing terminology | Add ventilation/fume and cylinder subhazards as independently evidenced secondary hazards. |
| 21 | Forklift/industrial trucks | Strong | `mobile_equipment` with PIT context | Struck-by/caught-between; load instability remains secondary | `1910.178` route where PIT facts exist | Lower/stabilize load, segregate pedestrians, traffic controls | Benchmark + mobile tests | FP: parked forklift; FN: elevated load without pedestrian wording | Add load-height/stability mechanism and operating-state questions. |
| 22 | Dropped/falling objects | Partial | Explicit `dropped_objects` | Struck by falling object | Construction falling-object support exists; broad exact coverage is incomplete | Secure/tether tools, toe boards/containers, exclusion zone | Benchmark | FP: fall-protection platform language; FN: unsecured small parts | Add elevation, retention method, exposure-below evidence gate before citations. |
| 23 | Mining highwall/ground control | Partial | `ground_control` with highwall context | Fall of ground/material | MSHA context exists; exact highwall citations require mine type/exam facts | Barricade/setback, competent examination, scale/stabilize | Existing fixtures + benchmark | FP: roof edge as ground control (corrected); FN: sloughing without “highwall” | Separate surface highwall from underground roof/rib families. |
| 24 | Water/drowning | Weak | Explicit `water_drowning` | Fall into water/drowning | No sufficiently broad approved exact citation route; hold for review | PFD, barriers/fall prevention, ring buoy/retrieval/rescue | Benchmark | FP: water provided for heat; FN: sumps/ponds without “open water” | Add jurisdiction-specific approved sources and rescue-equipment evidence gates. |
| 25 | Environmental spill/release pathway | Weak | Explicit `environmental_release` | Release to drain/soil/water | Regulatory applicability is jurisdiction/material/quantity dependent; no forced citation | Close container, block drain, secondary containment, recovery/review | Benchmark | FP: ordinary housekeeping oil spill; FN: unlabeled open container near soil | Add material, quantity, reportability, drain destination, and environmental jurisdiction facts. |

## Implemented in this pass

- Added explicit compact taxonomy entries for compressed gas, noise, heat, dropped objects, water/drowning, and environmental releases.
- Removed the overly broad `roof` ground-control alias that conflicted with roof-edge fall protection.
- Added context-aware canonical aliases while preserving existing response labels.
- Added canonical mechanism families for the benchmarked domains.
- Added focused evidence gaps/questions for compressed gas, noise, heat, dropped objects, highwall, water, and environmental releases.
- Added practical hierarchy-aware controls across the weak/common domains.
- Tightened standalone compressed-gas citation selection so oxygen-cylinder storage does not imply welding/fuel-gas applicability.
- Added a compact 25-scenario test-only benchmark. It is not imported by production modules.

## Memory and runtime impact

The new production taxonomy entries and mechanism map are compact TypeScript constants. The 25 scenarios live only in a directly executed test file and are not referenced by `AppModule`, `SafescopeV2Module`, or the classify path. No approved/draft packs or large JSON datasets were added to production imports. The existing Render heap guard and lazy full-intelligence import remain unchanged.

## Deferred work

- Version and migrate response taxonomy fields rather than changing existing public labels in place.
- Add source-backed evidence gates for fire/flammable storage, noise, dropped objects, water, and environmental release families.
- Add mechanism-specific likelihood/severity calibration for chronic health domains.
- Split `reasoning-orchestrator.service.ts` into smaller domain resolvers after contract tests cover each extraction boundary.
- Measure precision/recall against reviewed field observations rather than synthetic benchmark text alone.
