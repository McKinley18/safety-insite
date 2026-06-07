import { ScenarioExpansionService } from '../src/safescope-v2/scenario-expansion/scenario-expansion.service';

async function validate() {
  const service = new ScenarioExpansionService();
  
  const scenarios = service.search({});
  if (scenarios.length < 60) {
    console.error(`Expected >= 60 scenarios, found ${scenarios.length}`);
    process.exit(1);
  }
  
  const testCases = [
    { text: 'unguarded conveyor tail pulley', expectedDomain: 'machine_guarding' },
    { text: 'damaged electrical cord', expectedDomain: 'electrical' },
    { text: 'unlabeled secondary chemical container', expectedDomain: 'hazcom' },
    { text: 'confined space atmosphere testing', expectedDomain: 'confined_space' },
    { text: 'trench without protective system', expectedDomain: 'excavation_trenching' },
    { text: 'damaged rigging sling', expectedDomain: 'rigging_lifting' }
  ];
  
  for (const tc of testCases) {
      const matches = service.search({ domainId: tc.expectedDomain, text: tc.text });
      if (matches.length === 0) {
          console.error(`Failed: No scenario matches for "${tc.text}" (expected domain ${tc.expectedDomain})`);
          process.exit(1);
      }
  }
  
  console.log('✅ SafeScope scenario expansion pack v1 validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
