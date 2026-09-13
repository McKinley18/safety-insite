# SafeScope v2 Gauntlet Failure Triage & Action Plan (Reviewed)

This document presents a comprehensive triage analysis and corrective action plan for the 136 failing scenarios in the **SafeScope AI Evaluation Gauntlet (v2)**.

## 1. High-Level Summary

- **Valid Engine Gaps**: 83 scenarios (SafeScope needs code/standards mapping updates)
- **Bad Generated Scenarios**: 9 scenarios (Dataset needs cleanup due to unrealistic location/equipment pairings)
- **Evaluator Alias Issues**: 44 scenarios (SafeScope's answers were safety-reasonable, but the evaluator expected a rigid label)

---

## 2. Top 10 Recommended SafeScope Engine Improvements
1. **Expand Taxonomy Seed**: Add dedicated categories and keywords in `taxonomy.seed.ts` for all 18 newly introduced safety families (e.g., *Chemical Storage*, *Compressed Air / Hose Safety*, *Compressed Gas Cylinders*, *Welding / Cutting / Hot Work*, *First Aid / Eyewash / Safety Shower Access*, *Scaffolds*, *Ladders*, *Trenching & Shoring*, *Confined Space*, *Fire Protection*, *Emergency Preparedness*).
2. **Implement Multi-Label Classification**: Allow the deterministic and weighted classifiers to output multiple highly relevant hazard families rather than forcing a single label (e.g., a hot work violation can be both *Welding / Cutting / Hot Work* and *Fire / Explosion*).
3. **Disambiguate Equipment Names**: Add negative weight rules to prevent generic machine components (like 'valves' or 'pulleys' in eyewash valves or oxygen regulators) from over-triggering *Machine Guarding* rules.
4. **Context-Aware Classification**: Incorporate basic spatial or activity context checks (e.g., if 'welding' is occurring, classify as *Welding / Cutting / Hot Work* even if 'breaker' or 'cable' keywords are present).
5. **Calibrate Confined Space Rules**: Stop treating all occurrences of the word 'tank' or 'vessel' as an automatic *Confined Space* entry. Only trigger confined space classification if entry-related terms (e.g., 'entry', 'cleanout', 'inside', 'washout', 'attendant') are present.
6. **Harmonize LOTO & Electrical Classifications**: Add a dedicated rule pathway that correctly identifies circuit breaker and electrical disconnect isolation tasks as *Lockout / Stored Energy* rather than blindly classifying them as *Electrical*.
7. **Improve Housekeeping Crossover Logic**: Differentiate simple housekeeping slip/trip conditions (like floor dust or minor water condensation) from structural *Walking/Working Surfaces* failures (like open perimeter edges or loose gratings).
8. **Enrich First Aid & Medical Standards**: Map MSHA 30 CFR 56.15001 / OSHA 1910.151 standards directly to emergency first aid, safety shower, and eyewash accessibility keywords in the rule engine.
9. **Refine Compressed Gas vs. Material Handling Rules**: Add explicit rules for compressed gas cylinders (securing upright, valve caps, segregation) to separate them from general warehouse *Material Handling* tasks.
10. **Calibrate Severity Scoring for Unsupported Families**: Adjust severity calculation triggers so that unsupported categories do not fall back to medium severity by default due to a lack of rule coverage.

---

## 3. Top 10 Recommended Dataset Cleanup Rules
1. **Enforce Spatial Compatibility**: Filter the generation matrix to prevent physically impossible equipment-to-location pairings (e.g., bulldozers, heavy scaffolding, or safety showers located *inside a conveyor drive motor housing*).
2. **Relax Rigid Evaluator Boundaries**: Expand the gauntlet evaluator's `expectedStandardFamily` matching list to recognize highly logical safety family aliases (e.g., treating *Fall Protection* as a valid alias for *Scaffolds* and *Walking/Working Surfaces* as a valid alias for *Housekeeping*).
3. **Calibrate Crossover Penalties**: Audit and relax the `unacceptableStandardFamilies` arrays in the gauntlet to ensure that safety-valid crossover recommendations (e.g., citing housekeeping standards for leaning timber piles) are not penalized as failures.
4. **Contextualize Ambient Noise / Location Details**: Remove highly specific location strings (like 'near the high-voltage substation fence') if they do not describe the hazard itself, as they confuse the keyword-based rule engine.
5. **Normalize Chemical Terminology**: Ensure chemical containers in the dataset are consistently categorized as *Chemical Storage* or *Hazard Communication* depending on whether they represent inventory segregation or label issues.
6. **Correct Synthesized Observations**: Remove artificial word repetitions introduced by the program generator (e.g., 'solvent drum spigot solvent drum spigot showing continuous slow drip').
7. **Validate Trench Shoring Contexts**: Ensure that *Trenching & Shoring* scenarios always specify excavation depths and soil details to prevent confusion with simple housekeeping shovel tasks.
8. **De-duplicate Seed Baseline Scenarios**: Manually resolve the pre-existing duplicate hoisting hook scenario (`GAUNTLET-047` and `GAUNTLET-066`) in `safescope-gauntlet.seed.json` to achieve true 100% uniqueness.
9. **Standardize Ambiguity Trace Requirements**: Ensure that all medium- and high-ambiguity scenarios have explicit instructions indicating that SafeScope should request human review.
10. **Separate Fire Protection Accessories**: Clarify vehicle fire extinguisher checks so they do not overlap with heavy vehicle braking alarms or operational traffic controls.

---

## 4. Failure counts by expected family

- Chemical Storage: 16
- Compressed Air / Hose Safety: 16
- Compressed Gas Cylinders: 16
- First Aid / Eyewash / Safety Shower Access: 16
- Scaffolds: 16
- Welding / Cutting / Hot Work: 16
- Housekeeping: 11
- Fire Protection: 10
- Material Handling: 7
- Lockout / Stored Energy: 4
- Hazard Communication: 2
- Mobile Equipment / Traffic: 2
- Confined Space: 1
- Emergency Preparedness: 1
- Fall Protection: 1
- Walking/Working Surfaces: 1

---

## 5. Detailed Triage Sheets
#### GAUNTLET-453 — score 35

**Observation:** chemical containment pallet acid and base drums stored on same rack at the secondary mill assembly station

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-454 — score 35

**Observation:** corrosive liquid tote chemical secondary containment tub full of water near the primary crusher storage vault

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Hazard Communication

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.1200', 'title': 'Hazard communication requirements for chemical containers and labels', 'family': 'osha_general', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified chemical storage/secondary containment issues as Hazard Communication, which is a highly related category under chemical standard rules (1910.1200), but was failed by a strict expected classification.
- recommendedAction: Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.

#### GAUNTLET-455 — score 35

**Observation:** incompatible acid base rack cracked outer jacket on corrosive chemical tote in the packaging room floor corridor

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Hazard Communication

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.1200', 'title': 'Hazard communication requirements for chemical containers and labels', 'family': 'osha_general', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified chemical storage/secondary containment issues as Hazard Communication, which is a highly related category under chemical standard rules (1910.1200), but was failed by a strict expected classification.
- recommendedAction: Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.

#### GAUNTLET-456 — score 35

**Observation:** chemical vault drain storing reactive chemicals without drainage containment along the active haulage transfer point

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-457 — score 35

**Observation:** solvent drum spigot solvent drum spigot showing continuous slow drip at the maintenance shop workbench B

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-458 — score 35

**Observation:** secondary containment tub incompatible chemical liquids touching in locker inside the chemical preparation gallery

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Confined Space

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.146', 'title': 'Permit-required confined space entry requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1926 Subpart AA', 'title': 'Confined spaces in construction requirements', 'family': 'osha_construction', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-459 — score 35

**Observation:** chemical containment pallet acid and base drums stored on same rack at the southern ventilation drift path

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Confined Space

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.146', 'title': 'Permit-required confined space entry requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1926 Subpart AA', 'title': 'Confined spaces in construction requirements', 'family': 'osha_construction', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-460 — score 35

**Observation:** corrosive liquid tote chemical secondary containment tub full of water near the main dock portal doorway

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Hazard Communication

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.1200', 'title': 'Hazard communication requirements for chemical containers and labels', 'family': 'osha_general', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified chemical storage/secondary containment issues as Hazard Communication, which is a highly related category under chemical standard rules (1910.1200), but was failed by a strict expected classification.
- recommendedAction: Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.

#### GAUNTLET-461 — score 35

**Observation:** incompatible acid base rack cracked outer jacket on corrosive chemical tote at the construction bridge platform B

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Fall Protection

**Unacceptable hits:** []

**Top standards:**

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-462 — score 35

**Observation:** chemical vault drain storing reactive chemicals without drainage containment near the high-voltage substation fence

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-463 — score 35

**Observation:** solvent drum spigot solvent drum spigot showing continuous slow drip at the quarry pit dump point lane

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-464 — score 35

**Observation:** secondary containment tub incompatible chemical liquids touching in locker inside the conveyor drive motor housing

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-465 — score 35

**Observation:** chemical containment pallet acid and base drums stored on same rack at the secondary mill assembly station (node reference check 364)

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-466 — score 35

**Observation:** corrosive liquid tote chemical secondary containment tub full of water near the primary crusher storage vault (node reference check 365)

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Hazard Communication

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.1200', 'title': 'Hazard communication requirements for chemical containers and labels', 'family': 'osha_general', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified chemical storage/secondary containment issues as Hazard Communication, which is a highly related category under chemical standard rules (1910.1200), but was failed by a strict expected classification.
- recommendedAction: Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.

#### GAUNTLET-467 — score 35

**Observation:** incompatible acid base rack cracked outer jacket on corrosive chemical tote in the packaging room floor corridor (node reference check 366)

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Hazard Communication

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.1200', 'title': 'Hazard communication requirements for chemical containers and labels', 'family': 'osha_general', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified chemical storage/secondary containment issues as Hazard Communication, which is a highly related category under chemical standard rules (1910.1200), but was failed by a strict expected classification.
- recommendedAction: Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Map 'Hazard Communication' as a valid alias or acceptable standard family for chemical storage container violations.

#### GAUNTLET-468 — score 35

**Observation:** chemical vault drain storing reactive chemicals without drainage containment along the active haulage transfer point (node reference check 367)

**Expected:** Chemical Storage / Chemical Storage

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Chemical Storage' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Chemical Storage' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-421 — score 45

**Observation:** compressor discharge valve air compressor hose without safety whipcheck at the secondary mill assembly station

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-422 — score 35

**Observation:** high pressure air line air nozzle pressure measured at fifty psi near the primary crusher storage vault

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-423 — score 35

**Observation:** air nozzle compressor using compressed air for clothing blowdown in the packaging room floor corridor

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-424 — score 35

**Observation:** air receiver tank damaged hose clamp connector showing cracks along the active haulage transfer point

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-425 — score 35

**Observation:** pneumatic tool fitting air receiver tank missing pressure relief valve at the maintenance shop workbench B

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-426 — score 35

**Observation:** whipcheck air hose kinked air line hose near assembly station inside the chemical preparation gallery

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-427 — score 45

**Observation:** compressor discharge valve air compressor hose without safety whipcheck at the southern ventilation drift path

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-428 — score 35

**Observation:** high pressure air line air nozzle pressure measured at fifty psi near the main dock portal doorway

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-429 — score 35

**Observation:** air nozzle compressor using compressed air for clothing blowdown at the construction bridge platform B

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Fall Protection

**Unacceptable hits:** []

**Top standards:**

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-430 — score 35

**Observation:** air receiver tank damaged hose clamp connector showing cracks near the high-voltage substation fence

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-431 — score 35

**Observation:** pneumatic tool fitting air receiver tank missing pressure relief valve at the quarry pit dump point lane

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-432 — score 35

**Observation:** whipcheck air hose kinked air line hose near assembly station inside the conveyor drive motor housing

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-433 — score 45

**Observation:** compressor discharge valve air compressor hose without safety whipcheck at the secondary mill assembly station (node reference check 332)

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-434 — score 35

**Observation:** high pressure air line air nozzle pressure measured at fifty psi near the primary crusher storage vault (node reference check 333)

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-435 — score 35

**Observation:** air nozzle compressor using compressed air for clothing blowdown in the packaging room floor corridor (node reference check 334)

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-436 — score 35

**Observation:** air receiver tank damaged hose clamp connector showing cracks along the active haulage transfer point (node reference check 335)

**Expected:** Compressed Air / Hose Safety / Compressed Air / Hose Safety

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Air / Hose Safety' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Air / Hose Safety' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-405 — score 35

**Observation:** acetylene gas cylinder oxygen and acetylene stored directly touching at the secondary mill assembly station

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-406 — score 35

**Observation:** oxygen manifold rack unsecured gas cylinder standing without chain near the primary crusher storage vault

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 12}
- {'citation': '1910.219', 'title': 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-407 — score 35

**Observation:** nitrogen cylinder cart protective valve cap missing from high pressure cylinder in the packaging room floor corridor

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-408 — score 35

**Observation:** gas cylinder valve cap compressed gas cylinder rack loose and rocking along the active haulage transfer point

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-409 — score 35

**Observation:** argon shielding tank storing cylinders next to active heat radiator at the maintenance shop workbench B

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-410 — score 35

**Observation:** propane cylinder rack handling regulator with oily gloves inside the chemical preparation gallery

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-411 — score 35

**Observation:** acetylene gas cylinder oxygen and acetylene stored directly touching at the southern ventilation drift path

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-412 — score 35

**Observation:** oxygen manifold rack unsecured gas cylinder standing without chain near the main dock portal doorway

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 12}
- {'citation': '1910.219', 'title': 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-413 — score 35

**Observation:** nitrogen cylinder cart protective valve cap missing from high pressure cylinder at the construction bridge platform B

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-414 — score 35

**Observation:** gas cylinder valve cap compressed gas cylinder rack loose and rocking near the high-voltage substation fence

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-415 — score 35

**Observation:** argon shielding tank storing cylinders next to active heat radiator at the quarry pit dump point lane

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-416 — score 35

**Observation:** propane cylinder rack handling regulator with oily gloves inside the conveyor drive motor housing

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-417 — score 35

**Observation:** acetylene gas cylinder oxygen and acetylene stored directly touching at the secondary mill assembly station (node reference check 316)

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-418 — score 35

**Observation:** oxygen manifold rack unsecured gas cylinder standing without chain near the primary crusher storage vault (node reference check 317)

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 12}
- {'citation': '1910.219', 'title': 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-419 — score 35

**Observation:** nitrogen cylinder cart protective valve cap missing from high pressure cylinder in the packaging room floor corridor (node reference check 318)

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-420 — score 35

**Observation:** gas cylinder valve cap compressed gas cylinder rack loose and rocking along the active haulage transfer point (node reference check 319)

**Expected:** Compressed Gas Cylinders / Compressed Gas Cylinders

**Actual classification:** Material Handling

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Compressed Gas Cylinders' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Compressed Gas Cylinders' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-485 — score 35

**Observation:** eyewash station basin safety eyewash station blocked by storage drums at the secondary mill assembly station

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-486 — score 35

**Observation:** emergency shower pullrod drench shower pull rod bent and out of reach near the primary crusher storage vault

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-487 — score 35

**Observation:** first aid cabinet eyewash plumbing valve showing corroded handle in the packaging room floor corridor

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-488 — score 35

**Observation:** eyewash plumbing valve missing visual weekly inspection tags on eyewash along the active haulage transfer point

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-489 — score 35

**Observation:** drench shower nozzle first aid box completely empty of safety supplies at the maintenance shop workbench B

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-490 — score 35

**Observation:** eyewash dust cover eyewash station basin covered in thick grease layers inside the chemical preparation gallery

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Confined Space

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.146', 'title': 'Permit-required confined space entry requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1926 Subpart AA', 'title': 'Confined spaces in construction requirements', 'family': 'osha_construction', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-491 — score 35

**Observation:** eyewash station basin safety eyewash station blocked by storage drums at the southern ventilation drift path

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Confined Space

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.146', 'title': 'Permit-required confined space entry requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1926 Subpart AA', 'title': 'Confined spaces in construction requirements', 'family': 'osha_construction', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-492 — score 35

**Observation:** emergency shower pullrod drench shower pull rod bent and out of reach near the main dock portal doorway

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-493 — score 35

**Observation:** first aid cabinet eyewash plumbing valve showing corroded handle at the construction bridge platform B

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Fall Protection

**Unacceptable hits:** []

**Top standards:**

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-494 — score 35

**Observation:** eyewash plumbing valve missing visual weekly inspection tags on eyewash near the high-voltage substation fence

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-495 — score 35

**Observation:** drench shower nozzle first aid box completely empty of safety supplies at the quarry pit dump point lane

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-496 — score 35

**Observation:** eyewash dust cover eyewash station basin covered in thick grease layers inside the conveyor drive motor housing

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-497 — score 35

**Observation:** eyewash station basin safety eyewash station blocked by storage drums at the secondary mill assembly station (node reference check 396)

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-498 — score 35

**Observation:** emergency shower pullrod drench shower pull rod bent and out of reach near the primary crusher storage vault (node reference check 397)

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-499 — score 35

**Observation:** first aid cabinet eyewash plumbing valve showing corroded handle in the packaging room floor corridor (node reference check 398)

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-500 — score 35

**Observation:** eyewash plumbing valve missing visual weekly inspection tags on eyewash along the active haulage transfer point (node reference check 399)

**Expected:** First Aid / Eyewash / Safety Shower Access / First Aid / Eyewash / Safety Shower Access

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'First Aid / Eyewash / Safety Shower Access' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'First Aid / Eyewash / Safety Shower Access' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-213 — score 75

**Observation:** biljax frame scaffold scaffold legs resting on stacked bricks at the secondary mill assembly station

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-214 — score 75

**Observation:** scaffold work platform missing guardrails on scaffold work platform near the primary crusher storage vault

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-215 — score 75

**Observation:** mobile scaffold tower cracked wood plank used as scaffold deck in the packaging room floor corridor

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-216 — score 75

**Observation:** scaffold outrigger leg scaffold tower erected without outrigger supports along the active haulage transfer point

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-217 — score 75

**Observation:** scaffold safety plank improper scaffold access forcing worker climb at the maintenance shop workbench B

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-218 — score 75

**Observation:** scaffold guardrail post scaffold base missing baseplates on soil inside the chemical preparation gallery

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-219 — score 75

**Observation:** biljax frame scaffold scaffold legs resting on stacked bricks at the southern ventilation drift path

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-220 — score 75

**Observation:** scaffold work platform missing guardrails on scaffold work platform near the main dock portal doorway

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-221 — score 75

**Observation:** mobile scaffold tower cracked wood plank used as scaffold deck at the construction bridge platform B

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-222 — score 75

**Observation:** scaffold outrigger leg scaffold tower erected without outrigger supports near the high-voltage substation fence

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-223 — score 75

**Observation:** scaffold safety plank improper scaffold access forcing worker climb at the quarry pit dump point lane

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-224 — score 75

**Observation:** scaffold guardrail post scaffold base missing baseplates on soil inside the conveyor drive motor housing

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 26}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-225 — score 75

**Observation:** biljax frame scaffold scaffold legs resting on stacked bricks at the secondary mill assembly station (node reference check 124)

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-226 — score 75

**Observation:** scaffold work platform missing guardrails on scaffold work platform near the primary crusher storage vault (node reference check 125)

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-227 — score 75

**Observation:** mobile scaffold tower cracked wood plank used as scaffold deck in the packaging room floor corridor (node reference check 126)

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-228 — score 75

**Observation:** scaffold outrigger leg scaffold tower erected without outrigger supports along the active haulage transfer point (node reference check 127)

**Expected:** Scaffolds / Scaffolds

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified scaffolding safety controls as Fall Protection, which is a highly reasonable and standard-compliant safety category, but was failed because the evaluator expected 'Scaffolds' exactly.
- recommendedAction: Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Fall Protection' and 'Walking/Working Surfaces' as acceptable standard family aliases for Scaffolds in the gauntlet evaluation mapping.

#### GAUNTLET-469 — score 35

**Observation:** arc welder generator welding generator lead showing damaged insulation at the secondary mill assembly station

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-470 — score 35

**Observation:** oxyacetylene torch nozzle arc welding performed without safety flash screen near the primary crusher storage vault

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-471 — score 35

**Observation:** welding flash screen oxyacetylene torch missing flashback arrestor in the packaging room floor corridor

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-472 — score 35

**Observation:** hot work fire blanket hot work executed without active fire watch standby along the active haulage transfer point

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Fire / Explosion

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.106', 'title': 'Flammable liquids handling and storage requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.157', 'title': 'Portable fire extinguisher requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.4100', 'title': 'Firefighting equipment requirements at surface metal/nonmetal mines', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified hot work fire watch deficiencies under 'Fire / Explosion', which is a correct and defensible classification for open fire/spark hazards (1910.157, 30 CFR 56.4100), but was penalized by a rigid expected standard family.
- recommendedAction: Allow 'Fire / Explosion' and 'Fire Protection' as acceptable standard families for hot work fire watch scenarios.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Allow 'Fire / Explosion' and 'Fire Protection' as acceptable standard families for hot work fire watch scenarios.

#### GAUNTLET-473 — score 35

**Observation:** welding electrode holder welding sparks falling directly on trash bin at the maintenance shop workbench B

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-474 — score 35

**Observation:** torch flashback arrestor damaged gas hose on cutting torch line inside the chemical preparation gallery

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Confined Space

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.146', 'title': 'Permit-required confined space entry requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1926 Subpart AA', 'title': 'Confined spaces in construction requirements', 'family': 'osha_construction', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-475 — score 35

**Observation:** arc welder generator welding generator lead showing damaged insulation at the southern ventilation drift path

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Confined Space

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.146', 'title': 'Permit-required confined space entry requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1926 Subpart AA', 'title': 'Confined spaces in construction requirements', 'family': 'osha_construction', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-476 — score 35

**Observation:** oxyacetylene torch nozzle arc welding performed without safety flash screen near the main dock portal doorway

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-477 — score 35

**Observation:** welding flash screen oxyacetylene torch missing flashback arrestor at the construction bridge platform B

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Fall Protection

**Unacceptable hits:** []

**Top standards:**

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-478 — score 35

**Observation:** hot work fire blanket hot work executed without active fire watch standby near the high-voltage substation fence

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-479 — score 35

**Observation:** welding electrode holder welding sparks falling directly on trash bin at the quarry pit dump point lane

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Fire / Explosion

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '1910.106', 'title': 'Flammable liquids handling and storage requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.157', 'title': 'Portable fire extinguisher requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.4100', 'title': 'Firefighting equipment requirements at surface metal/nonmetal mines', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified hot work fire watch deficiencies under 'Fire / Explosion', which is a correct and defensible classification for open fire/spark hazards (1910.157, 30 CFR 56.4100), but was penalized by a rigid expected standard family.
- recommendedAction: Allow 'Fire / Explosion' and 'Fire Protection' as acceptable standard families for hot work fire watch scenarios.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Allow 'Fire / Explosion' and 'Fire Protection' as acceptable standard families for hot work fire watch scenarios.

#### GAUNTLET-480 — score 35

**Observation:** torch flashback arrestor damaged gas hose on cutting torch line inside the conveyor drive motor housing

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-481 — score 35

**Observation:** arc welder generator welding generator lead showing damaged insulation at the secondary mill assembly station (node reference check 380)

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-482 — score 35

**Observation:** oxyacetylene torch nozzle arc welding performed without safety flash screen near the primary crusher storage vault (node reference check 381)

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-483 — score 35

**Observation:** welding flash screen oxyacetylene torch missing flashback arrestor in the packaging room floor corridor (node reference check 382)

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Welding / Cutting / Hot Work' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Welding / Cutting / Hot Work' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-484 — score 35

**Observation:** hot work fire blanket hot work executed without active fire watch standby along the active haulage transfer point (node reference check 383)

**Expected:** Welding / Cutting / Hot Work / Welding / Cutting / Hot Work

**Actual classification:** Fire / Explosion

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.106', 'title': 'Flammable liquids handling and storage requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.157', 'title': 'Portable fire extinguisher requirements', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.4100', 'title': 'Firefighting equipment requirements at surface metal/nonmetal mines', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified hot work fire watch deficiencies under 'Fire / Explosion', which is a correct and defensible classification for open fire/spark hazards (1910.157, 30 CFR 56.4100), but was penalized by a rigid expected standard family.
- recommendedAction: Allow 'Fire / Explosion' and 'Fire Protection' as acceptable standard families for hot work fire watch scenarios.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Allow 'Fire / Explosion' and 'Fire Protection' as acceptable standard families for hot work fire watch scenarios.

#### GAUNTLET-437 — score 75

**Observation:** wood mill floor sweepings walkway water condensation creating slip hazard at the secondary mill assembly station

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 179}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-439 — score 75

**Observation:** warehouse dock trash spilled oil pool left clean on main aisleway in the packaging room floor corridor

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-440 — score 75

**Observation:** walkway water condensation trash pile blocking conveyor maintenance stairs along the active haulage transfer point

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'unsupported family' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'unsupported family' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'unsupported family' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-441 — score 75

**Observation:** packaging floor debris grease drips under gearbox coating travel walkway at the maintenance shop workbench B

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 167}
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-442 — score 75

**Observation:** spilled hydraulic fluid packaging floor covered with slick plastic scrap bands inside the chemical preparation gallery

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-443 — score 75

**Observation:** wood mill floor sweepings walkway water condensation creating slip hazard at the southern ventilation drift path

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 179}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-445 — score 75

**Observation:** warehouse dock trash spilled oil pool left clean on main aisleway at the construction bridge platform B

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Fall Protection

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'unsupported family' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'unsupported family' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'unsupported family' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-447 — score 75

**Observation:** packaging floor debris grease drips under gearbox coating travel walkway at the quarry pit dump point lane

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 167}
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-449 — score 75

**Observation:** wood mill floor sweepings walkway water condensation creating slip hazard at the secondary mill assembly station (node reference check 348)

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 179}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-451 — score 75

**Observation:** warehouse dock trash spilled oil pool left clean on main aisleway in the packaging room floor corridor (node reference check 350)

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified physical walkway obstructions/spills as Walking/Working Surfaces, which directly covers housekeeping slip/trip safety rules under 1910.22, but was failed because the evaluator expected exactly 'Housekeeping'.
- recommendedAction: Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Walking/Working Surfaces' as an acceptable alias for Housekeeping in the gauntlet evaluator.

#### GAUNTLET-452 — score 75

**Observation:** walkway water condensation trash pile blocking conveyor maintenance stairs along the active haulage transfer point (node reference check 351)

**Expected:** Housekeeping / Housekeeping

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'unsupported family' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'unsupported family' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'unsupported family' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-310 — score 35

**Observation:** class a water extinguisher pressure gauge dial needle in red zone near the primary crusher storage vault

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-311 — score 35

**Observation:** dry chemical extinguisher monthly visual inspection tag completely missing in the packaging room floor corridor

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-312 — score 75

**Observation:** extinguisher wall bracket fire hose cabinet blocked by pallet stack along the active haulage transfer point

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Emergency Egress

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.36', 'title': 'Design and construction requirements for exit routes', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.37', 'title': 'Maintenance, safeguards, and operational features for exit routes', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified blocked fire hose cabinets as 'Emergency Egress' (or exit route maintenance), which is highly reasonable under OSHA 1910.37 exit route safety rules, but was failed by the evaluator.
- recommendedAction: Add 'Emergency Egress' or 'Emergency Preparedness' as an acceptable standard family for blocked fire protection equipment.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Emergency Egress' or 'Emergency Preparedness' as an acceptable standard family for blocked fire protection equipment.

#### GAUNTLET-313 — score 35

**Observation:** sprinkler valve casing extinguisher nozzle clogged with debris at the maintenance shop workbench B

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-316 — score 35

**Observation:** class a water extinguisher pressure gauge dial needle in red zone near the main dock portal doorway

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-317 — score 35

**Observation:** dry chemical extinguisher monthly visual inspection tag completely missing at the construction bridge platform B

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Fall Protection

**Unacceptable hits:** []

**Top standards:**

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-319 — score 35

**Observation:** sprinkler valve casing extinguisher nozzle clogged with debris at the quarry pit dump point lane

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-322 — score 35

**Observation:** class a water extinguisher pressure gauge dial needle in red zone near the primary crusher storage vault (node reference check 221)

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-323 — score 35

**Observation:** dry chemical extinguisher monthly visual inspection tag completely missing in the packaging room floor corridor (node reference check 222)

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Fire Protection' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Fire Protection' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-324 — score 75

**Observation:** extinguisher wall bracket fire hose cabinet blocked by pallet stack along the active haulage transfer point (node reference check 223)

**Expected:** Fire Protection / Fire Protection

**Actual classification:** Emergency Egress

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.36', 'title': 'Design and construction requirements for exit routes', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.37', 'title': 'Maintenance, safeguards, and operational features for exit routes', 'family': 'osha_general', 'score': 100}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified blocked fire hose cabinets as 'Emergency Egress' (or exit route maintenance), which is highly reasonable under OSHA 1910.37 exit route safety rules, but was failed by the evaluator.
- recommendedAction: Add 'Emergency Egress' or 'Emergency Preparedness' as an acceptable standard family for blocked fire protection equipment.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Emergency Egress' or 'Emergency Preparedness' as an acceptable standard family for blocked fire protection equipment.

#### GAUNTLET-373 — score 75

**Observation:** compressor highpressure hose spill kit blocked by high pallet stack at the secondary mill assembly station

**Expected:** Material Handling / Material Handling

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 24}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-375 — score 75

**Observation:** safety chain connector unstable timber stack leaning toward walkway in the packaging room floor corridor

**Expected:** Material Handling / Material Handling

**Actual classification:** Material Handling

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 12}
- {'citation': '1910.219', 'title': 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-379 — score 75

**Observation:** compressor highpressure hose spill kit blocked by high pallet stack at the southern ventilation drift path

**Expected:** Material Handling / Material Handling

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 24}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-381 — score 75

**Observation:** safety chain connector unstable timber stack leaning toward walkway at the construction bridge platform B

**Expected:** Material Handling / Material Handling

**Actual classification:** Material Handling

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 12}
- {'citation': '1910.219', 'title': 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-383 — score 35

**Observation:** scrap metal rack loose banding strap bands cluttering dock corridor at the quarry pit dump point lane

**Expected:** Material Handling / Material Handling

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** []

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-385 — score 75

**Observation:** compressor highpressure hose spill kit blocked by high pallet stack at the secondary mill assembly station (node reference check 284)

**Expected:** Material Handling / Material Handling

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 24}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-387 — score 75

**Observation:** safety chain connector unstable timber stack leaning toward walkway in the packaging room floor corridor (node reference check 286)

**Expected:** Material Handling / Material Handling

**Actual classification:** Material Handling

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.101', 'title': 'Compressed gas cylinder storage, handling, and security', 'family': 'osha_general', 'score': 100}
- {'citation': '30 CFR 56.16005', 'title': 'Securing gas cylinders upright with chains and caps', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.13021', 'title': 'High-pressure air hose safety chains or whipchecks', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 12}
- {'citation': '1910.219', 'title': 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope's classification of material handling obstructions (e.g., leaning lumber, blocked spill kits) as Walking/Working Surfaces or Material Handling is highly defensible, but it failed due to overly strict unacceptable crossover checks.
- recommendedAction: Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Material Handling to allow walking-working surfaces crossover citations.

#### GAUNTLET-166 — score 35

**Observation:** mixer motor breaker energy isolation disconnect not locked out near the primary crusher storage vault

**Expected:** Lockout / Stored Energy / Lockout / Stored Energy

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified motor breaker lockouts as Electrical hazards, which directly overlap with electrical de-energization compliance (30 CFR 56.12016), but was failed due to a rigid 'Lockout' expectation.
- recommendedAction: Add 'Electrical' as a valid alternative or acceptable standard family for electrical energy lockout scenarios.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Electrical' as a valid alternative or acceptable standard family for electrical energy lockout scenarios.

#### GAUNTLET-172 — score 35

**Observation:** mixer motor breaker energy isolation disconnect not locked out near the main dock portal doorway

**Expected:** Lockout / Stored Energy / Lockout / Stored Energy

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified motor breaker lockouts as Electrical hazards, which directly overlap with electrical de-energization compliance (30 CFR 56.12016), but was failed due to a rigid 'Lockout' expectation.
- recommendedAction: Add 'Electrical' as a valid alternative or acceptable standard family for electrical energy lockout scenarios.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Electrical' as a valid alternative or acceptable standard family for electrical energy lockout scenarios.

#### GAUNTLET-175 — score 35

**Observation:** hydraulic accumulator valve failure to bleed hydraulic residual pressure at the quarry pit dump point lane

**Expected:** Lockout / Stored Energy / Lockout / Stored Energy

**Actual classification:** Machine Guarding

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Lockout / Stored Energy' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Lockout / Stored Energy' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Lockout / Stored Energy' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-178 — score 35

**Observation:** mixer motor breaker energy isolation disconnect not locked out near the primary crusher storage vault (node reference check 77)

**Expected:** Lockout / Stored Energy / Lockout / Stored Energy

**Actual classification:** Electrical

**Unacceptable hits:** []

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope classified motor breaker lockouts as Electrical hazards, which directly overlap with electrical de-energization compliance (30 CFR 56.12016), but was failed due to a rigid 'Lockout' expectation.
- recommendedAction: Add 'Electrical' as a valid alternative or acceptable standard family for electrical energy lockout scenarios.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Add 'Electrical' as a valid alternative or acceptable standard family for electrical energy lockout scenarios.

#### GAUNTLET-281 — score 75

**Observation:** chemical solvent drum hazcom training records missing for shop employees at the maintenance shop workbench B

**Expected:** Hazard Communication / Hazard Communication

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Hazard Communication' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Hazard Communication' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Hazard Communication' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-287 — score 75

**Observation:** chemical solvent drum hazcom training records missing for shop employees at the quarry pit dump point lane

**Expected:** Hazard Communication / Hazard Communication

**Actual classification:** Walking/Working Surfaces

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 100}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Hazard Communication' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Hazard Communication' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Hazard Communication' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-106 — score 75

**Observation:** pit dozer operating near pedestrian walkway without spotter inside the chemical preparation gallery

**Expected:** Mobile Equipment / Traffic / Powered Mobile Equipment

**Actual classification:** Mobile Equipment / Traffic

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '30 CFR 56.9100', 'title': 'Mobile equipment operators must maintain control of equipment', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.9200', 'title': 'Traffic control and safe movement of equipment near persons', 'family': 'msha', 'score': 100}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: evaluator_alias_issue
- reason: SafeScope correctly classified the hazard family but was penalized by minor standard overlaps (e.g., recommending 1910.22 alongside vehicle controls due to 'walkway' keyword).
- recommendedAction: Relax unacceptable standard family boundaries for Mobile Equipment / Traffic to permit general industry walking-working surfaces citations.
- codeFixNeeded: no
- datasetFixNeeded: no
- evaluatorFixNeeded: yes

**Recommended fix:** Relax unacceptable standard family boundaries for Mobile Equipment / Traffic to permit general industry walking-working surfaces citations.

#### GAUNTLET-112 — score 75

**Observation:** pit dozer operating near pedestrian walkway without spotter inside the conveyor drive motor housing

**Expected:** Mobile Equipment / Traffic / Powered Mobile Equipment

**Actual classification:** Mobile Equipment / Traffic

**Unacceptable hits:** ['Walking/Working Surfaces']

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '30 CFR 56.9100', 'title': 'Mobile equipment operators must maintain control of equipment', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.9200', 'title': 'Traffic control and safe movement of equipment near persons', 'family': 'msha', 'score': 100}
- {'citation': '1910.22(a)', 'title': 'Keep walking-working surfaces clean, orderly, and free of hazards.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-265 — score 75

**Observation:** acid digester pit rescue retrieval line not attached to entrant at the maintenance shop workbench B

**Expected:** Confined Space / Confined Space

**Actual classification:** Lockout / Stored Energy

**Unacceptable hits:** ['Electrical']

**Top standards:**
- {'citation': '1910.178', 'title': 'Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).', 'family': 'general_industry', 'score': 110}
- {'citation': '1910.147', 'title': 'Use lockout/tagout to control hazardous energy during service or maintenance.', 'family': 'general_industry', 'score': 100}
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work must be de-energized before work is performed', 'family': 'msha', 'score': 100}
- {'citation': '30 CFR 56.14105', 'title': 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion', 'family': 'msha', 'score': 100}
- {'citation': '1910.146', 'title': 'Control confined space entry with permits, testing, attendants, and rescue planning.', 'family': 'general_industry', 'score': 12}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Confined Space' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Confined Space' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Confined Space' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.

#### GAUNTLET-336 — score 75

**Observation:** illuminated exit sign exit door opening inward against egress direction inside the conveyor drive motor housing

**Expected:** Emergency Preparedness / Emergency Preparedness

**Actual classification:** Machine Guarding

**Unacceptable hits:** ['Machine Guarding']

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-192 — score 75

**Observation:** safety harness harness unprotected perimeter side exposing workers inside the conveyor drive motor housing

**Expected:** Fall Protection / Fall Protection

**Actual classification:** Machine Guarding

**Unacceptable hits:** ['Machine Guarding']

**Top standards:**
- {'citation': '30 CFR 56.14107(a)', 'title': 'Guard moving machine parts that could contact employees.', 'family': 'mining', 'score': 90}

**Triage:**
- triageCategory: bad_generated_scenario
- reason: The scenario places equipment (e.g., scaffold, bulldozer, chemical storage, eyewash station) in a physically impossible or highly unrealistic location (conveyor drive motor housing), creating contradictory data signals.
- recommendedAction: Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.
- codeFixNeeded: no
- datasetFixNeeded: yes
- evaluatorFixNeeded: no

**Recommended fix:** Clean up the generator location pairing matrix to restrict heavy scaffolding, mobile equipment, and facilities from conveyor drive housing locations.

#### GAUNTLET-206 — score 75

**Observation:** warehouse aisleway wet floor surface without warning signs near the high-voltage substation fence

**Expected:** Walking/Working Surfaces / Housekeeping

**Actual classification:** Electrical

**Unacceptable hits:** ['Electrical']

**Top standards:**
- {'citation': '30 CFR 56.12016', 'title': 'Electrical work or energized electrical exposure requires de-energization and safe electrical controls.', 'family': 'msha', 'score': 90}

**Triage:**
- triageCategory: valid_engine_gap
- reason: SafeScope's classifier and rule engine currently lacks taxonomy keywords, rules, and standards mapping for the newly introduced 'Walking/Working Surfaces' safety family, leading to incorrect default classifications (like Machine Guarding).
- recommendedAction: Expand 'taxonomy.seed.ts' to include the 'Walking/Working Surfaces' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
- codeFixNeeded: yes
- datasetFixNeeded: no
- evaluatorFixNeeded: no

**Recommended fix:** Expand 'taxonomy.seed.ts' to include the 'Walking/Working Surfaces' family and populate it with specific keywords (e.g., pressure relief, cylinder, eyewash, torch) and map them to appropriate standards.
