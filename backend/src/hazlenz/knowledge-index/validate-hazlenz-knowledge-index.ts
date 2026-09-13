import { HazLenzKnowledgeIndexService } from './hazlenz-knowledge-index.service';
import { Jurisdiction, HazardFamily, EquipmentFamily, TaskMechanism } from './hazlenz-knowledge-index.types';

async function validate() {
    console.log("Running HazLenz Knowledge Index validation...");
    
    const service = new HazLenzKnowledgeIndexService();
    
    try {
        // Test 1 & 3 & 5: Load and validate entries + scenarios
        service.validateIndex();
        
        // Test 2: Check for duplicates (bundleIds)
        const entries = service.listKnowledgeIndexEntries();
        const bundleIds = entries.flatMap(e => e.bundleIds);
        const uniqueBundleIds = new Set(bundleIds);
        if (uniqueBundleIds.size !== bundleIds.length) {
            throw new Error("Duplicate bundle IDs found");
        }
        
        // Test 4: Common scenarios resolution (already covered by validateIndex, but let's be explicit)
        const summary = service.getIndexSummary();
        
        // Test 5: Negative validation (No overmatching)
        const overmatchScenarios: { 
          jurisdiction: Jurisdiction; 
          hazardFamily: HazardFamily; 
          equipmentFamily: EquipmentFamily; 
          taskMechanism: TaskMechanism 
        }[] = [
            { jurisdiction: 'msha', hazardFamily: 'other', equipmentFamily: 'unknown', taskMechanism: 'unknown' },
            { jurisdiction: 'osha_general_industry', hazardFamily: 'other', equipmentFamily: 'unknown', taskMechanism: 'unknown' }
        ];

        for (const scenario of overmatchScenarios) {
            const matches = service.resolveKnowledgeRoute(scenario);
            // These vague routes should NOT match specific bundles like conveyor or electrical
            const hasSpecificMatch = matches.some(m => m.bundleIds.length > 0 && !m.bundleIds.some(b => b.includes('general')));
            if (hasSpecificMatch) {
                throw new Error(`Overmatch detected for scenario: ${JSON.stringify(scenario)}`);
            }
        }
        
        console.log("Validation Passed!");
        console.log(`- Total entries: ${summary.totalEntries}`);
        console.log(`- Total jurisdictions covered: ${summary.jurisdictions.length}`);
        process.exit(0);
    } catch (error) {
        console.error("Validation Failed!");
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

validate();
