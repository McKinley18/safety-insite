import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

const allowedHazardFamilies = [
    'machine_guarding', 'electrical', 'fall_protection', 'mobile_equipment', 'hazcom_chemical_exposure'
];

const allowedScenarioFamilies = [
    'conveyor_cleanup', 'unguarded_conveyor_pulley', 'rotating_shaft_guarding', 'point_of_operation_guarding',
    'electrical_panel_access', 'damaged_cord_wet_location', 'scaffold_guardrail_planking', 'ladder_access_setup',
    'elevated_work_fall_exposure', 'mobile_equipment_pedestrian_interaction', 'backup_alarm_visibility', 
    'haul_road_berm_deficiency', 'dump_point_edge_protection', 'forklift_load_visibility',
    'chemical_label_sds_ppe', 'ventilation_exposure_uncertainty'
];

console.log("Validating Field Taxonomy Quality...");

let pilotErrors = 0;
let fullDatasetErrors = 0;
let fakeMechanismCount = 0;
let numberedScenarioCount = 0;
let blankControlFailureCount = 0;
let blankExposurePatternCount = 0;
let blankLocationContextCount = 0;
const riskBands = new Set<string>();

for (let i = 0; i < dataset.length; i++) {
    const record = dataset[i];
    const isPilot = i < 20;
    
    // Taxonomy Checks
    if (record.expectedMechanism.startsWith('mechanism_')) fakeMechanismCount++;
    if (/\d+$/.test(record.expectedScenarioFamily)) numberedScenarioCount++;
    
    // Blank Field Checks (Pilot Only)
    if (isPilot) {
        if (!record.controlFailure) blankControlFailureCount++;
        if (!record.exposurePattern) blankExposurePatternCount++;
        if (!record.locationContext) blankLocationContextCount++;
        
        riskBands.add(record.expectedRiskBand);
        
        if (record.expectedMechanism.startsWith('mechanism_') || /\d+$/.test(record.expectedScenarioFamily) || !record.controlFailure || !record.exposurePattern || !record.locationContext) {
            pilotErrors++;
        }
    }
    
    if (record.expectedMechanism.startsWith('mechanism_') || /\d+$/.test(record.expectedScenarioFamily)) {
        fullDatasetErrors++;
    }
}

console.log(`Total Cases: ${dataset.length}`);
console.log(`Pilot Cases (0-19) Errors: ${pilotErrors}`);
console.log(`Full Dataset Errors: ${fullDatasetErrors}`);
console.log(`Fake mechanism count: ${fakeMechanismCount}`);
console.log(`Numbered scenario count: ${numberedScenarioCount}`);
console.log(`Blank controlFailure (pilot): ${blankControlFailureCount}`);
console.log(`Blank exposurePattern (pilot): ${blankExposurePatternCount}`);
console.log(`Blank locationContext (pilot): ${blankLocationContextCount}`);
console.log(`Risk Bands found (pilot): ${riskBands.size}`);

const pilotPass = pilotErrors === 0 && riskBands.size >= 4;
const fullDatasetPass = fullDatasetErrors === 0;

console.log(`pilotPass: ${pilotPass}`);
console.log(`fullDatasetPass: ${fullDatasetPass}`);

if (!pilotPass) {
    console.error("Taxonomy Quality: PILOT FAILED");
    process.exit(1);
} else {
    console.log("Taxonomy Quality: PASSED");
}
