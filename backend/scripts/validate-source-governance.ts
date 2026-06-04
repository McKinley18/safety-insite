import { SourceGovernanceService } from '../src/safescope-v2/brain/source-governance/source-governance.service';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const service = new SourceGovernanceService();

console.log("Running SourceGovernanceService validation...");

// Test: Existing approved source
assert(service.isAuthoritative('osha-1926-501') === true, "Failed to validate osha-1926-501");
console.log("Test 1 Passed: Approved source validated.");

// Test: Non-existent source
assert(service.validateSource('fake-id').valid === false, "Failed to reject fake-id");
console.log("Test 2 Passed: Fake source rejected.");

console.log("SourceGovernanceService validation passed.");
