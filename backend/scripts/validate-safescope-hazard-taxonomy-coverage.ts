import { HazardTaxonomyCoverageService } from '../src/safescope-v2/hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';

async function validate() {
  const service = new HazardTaxonomyCoverageService();
  
  const domains = service.getAllDomains();
  if (domains.length < 40) {
    console.error('Fewer than 40 domains');
    process.exit(1);
  }
  
  const testCases = [
    { text: 'unguarded conveyor tail pulley', expectedDomain: 'machine_guarding' },
    { text: 'forklift pedestrian blind spot', expectedDomain: 'mobile_equipment' },
    { text: 'confined space atmospheric testing', expectedDomain: 'confined_space' },
    { text: 'unlabeled secondary chemical container', expectedDomain: 'hazcom' },
    { text: 'open edge fall exposure', expectedDomain: 'fall_protection' },
    { text: 'trench without protective system', expectedDomain: 'excavation_trenching' },
    { text: 'damaged electrical cord', expectedDomain: 'electrical' },
    { text: 'blocked emergency exit', expectedDomain: 'emergency_egress' },
    { text: 'damaged rigging sling', expectedDomain: 'rigging_lifting' },
    { text: 'hot work without fire watch', expectedDomain: 'hot_work' }
  ];
  
  for (const tc of testCases) {
      const result = service.route(tc.text);
      if (result.domainId !== tc.expectedDomain) {
          console.error(`Route failed for ${tc.text}: expected ${tc.expectedDomain}, got ${result.domainId}`);
          process.exit(1);
      }
  }
  
  console.log('✅ SafeScope hazard taxonomy coverage validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
