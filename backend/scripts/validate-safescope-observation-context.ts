import { ObservationContextService } from '../src/safescope-v2/brain/observation-context/observation-context.service';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const service = new ObservationContextService();

console.log("Running ObservationContextService validation...");

// Test Case 1: Conveyor Cleaning
const result1 = service.normalize("cleaning conveyor spillage while belt running");
assert(result1.detectedTasks.includes('maintenance'), "Failed to detect cleanup task");
assert(result1.detectedOperationalStates.includes('running'), "Failed to detect running state");
console.log("Test Case 1 Passed");

// Test Case 2: Unguarded Pulley
const result2 = service.normalize("tail pulley guard missing and damaged");
assert(result2.detectedUnsafeConditions.includes('unguarded'), "Failed to detect unguarded condition");
assert(result2.matchedTerms.includes('no_guard'), "Failed to match no_guard alias");
console.log("Test Case 2 Passed");

// Test Case 3: Electrical Damage
const result3 = service.normalize("open panel with exposed wire");
assert(result3.detectedEquipment.includes('electrical equipment'), "Failed to detect electrical equipment");
assert(result3.matchedTerms.includes('electrical_damage'), "Failed to match electrical_damage alias");
console.log("Test Case 3 Passed");

console.log("ObservationContextService validation passed.");
