import { HazardInformationAbsorptionService } from '../src/safescope-v2/hazard-information-absorption/hazard-information-absorption.service';

async function validate() {
  const service = new HazardInformationAbsorptionService();
  
  const result = await service.absorb('conveyor guarding issue', {});
  
  console.log('Testing Absorption...');
  if (result.primaryDomain !== 'machine_guarding') {
    console.error('Expected machine_guarding primaryDomain');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
