import { MultiHazardDecompositionService } from '../src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service';
import { MultiHazardDecompositionValidator } from '../src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.validator';
import { FieldOutputComposerV1Service } from '../src/safescope-v2/field-output-composer-v1/field-output-composer-v1.service';

async function validate() {
  const service = new MultiHazardDecompositionService();
  const composer = new FieldOutputComposerV1Service();
  
  const testCases = [
    { 
        text: 'unguarded conveyor tail pulley', 
        multi: false, 
        count: 1, 
        domains: ['machine_guarding'],
        name: 'single hazard'
    },
    { 
        text: 'Forklift operating near pedestrians, damaged extension cord nearby, and blocked exit route.', 
        multi: true, 
        count: 3, 
        domains: ['mobile_equipment', 'electrical', 'emergency_egress'],
        name: 'triple hazard'
    },
    { 
        text: 'Unguarded conveyor tail pulley, employee not wearing eye protection while grinding nearby, and spill creating slip exposure.', 
        multi: true, 
        count: 3, 
        domains: ['machine_guarding', 'ppe', 'slips_trips_falls'],
        name: 'conveyor + ppe + slip'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing decomposition: ${tc.name} ---`);
      const result = service.decompose(tc.text);
      const errors = MultiHazardDecompositionValidator.validate(result);
      
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (result.isMultiHazard !== tc.multi) {
          console.error(`[FAIL] Expected multi=${tc.multi} for "${tc.name}", got ${result.isMultiHazard}`);
          process.exit(1);
      }
      
      if (result.hazardCount < tc.count) {
          console.error(`[FAIL] Expected count >= ${tc.count} for "${tc.name}", got ${result.hazardCount}`);
          process.exit(1);
      }

      // Check integration with composer
      const composition = await composer.compose(tc.text);
      if (tc.multi && !composition.fieldAssessment.includes('Multiple hazards detected')) {
          console.error(`[FAIL] Expected composer to mention multiple hazards for "${tc.name}"`);
          process.exit(1);
      }
  }

  console.log('✅ SafeScope multi-hazard decomposition validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
