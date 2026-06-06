import { CorrectiveActionControlMapService } from '../src/safescope-v2/corrective-action-control-map/corrective-action-control-map.service';

async function validate() {
  const service = new CorrectiveActionControlMapService();
  
  const result = service.mapControls('hazard', 'mechanism', []);
  
  console.log('Testing Control Mapping...');
  if (result.preferredControlFamilies.length === 0) {
    console.error('Expected preferred control families');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
