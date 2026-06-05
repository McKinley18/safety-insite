import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

const allowedHazardFamilies = [
    'machine_guarding', 'conveyor_powered_haulage', 'mobile_equipment', 'berm_roadway_edge_protection',
    'electrical', 'lockout_hazardous_energy', 'fall_protection', 'scaffolds_platforms_ladders',
    'excavation_trenching', 'hazcom_chemical_exposure', 'fire_protection', 'emergency_access_egress',
    'housekeeping_walking_working_surfaces', 'ppe_exposure_controls', 'confined_space_atmospheric',
    'ventilation', 'welding_cutting_hot_work', 'material_handling_struck_by', 'workplace_exam_documentation'
];

const allowedScenarioFamilies = [
    'conveyor_cleanup', 'unguarded_conveyor_pulley', 'rotating_shaft_guarding', 'point_of_operation_guarding',
    'energized_troubleshooting', 'loto_ambiguity', 'damaged_cord_wet_location', 'electrical_panel_access',
    'mobile_equipment_pedestrian_interaction', 'backup_alarm_visibility', 'haul_road_berm_deficiency',
    'dump_point_edge_protection', 'forklift_load_visibility', 'scaffold_guardrail_planking', 'ladder_access_setup',
    'elevated_work_fall_exposure', 'excavation_protective_system_ambiguity', 'spoil_pile_setback',
    'chemical_label_sds_ppe', 'ventilation_exposure_uncertainty', 'fire_extinguisher_access_inspection',
    'emergency_exit_blockage', 'housekeeping_slip_trip', 'confined_space_atmospheric_ambiguity',
    'hot_work_fire_watch', 'workplace_exam_documentation_ambiguity'
];

console.log("Validating Field Taxonomy Quality...");

let placeholderCount = 0;
let invalidCount = 0;
const hazardFamilyCounts: Record<string, number> = {};
const scenarioFamilyCounts: Record<string, number> = {};

for (const record of dataset) {
    if (record.expectedHazardFamily.startsWith('family-')) placeholderCount++;
    else if (!allowedHazardFamilies.includes(record.expectedHazardFamily)) invalidCount++;
    
    if (record.expectedScenarioFamily.startsWith('scenario-')) placeholderCount++;
    else if (!allowedScenarioFamilies.includes(record.expectedScenarioFamily)) invalidCount++;

    hazardFamilyCounts[record.expectedHazardFamily] = (hazardFamilyCounts[record.expectedHazardFamily] || 0) + 1;
    scenarioFamilyCounts[record.expectedScenarioFamily] = (scenarioFamilyCounts[record.expectedScenarioFamily] || 0) + 1;
}

console.log(`Total Cases: ${dataset.length}`);
console.log(`Placeholder count: ${placeholderCount}`);
console.log(`Invalid taxonomy count: ${invalidCount}`);
console.log("Hazard Family Counts:", hazardFamilyCounts);
console.log("Scenario Family Counts:", scenarioFamilyCounts);

if (placeholderCount > 0 || invalidCount > 0) {
    console.error("Taxonomy Quality: FAILED");
    process.exit(1);
} else {
    console.log("Taxonomy Quality: PASSED");
}
