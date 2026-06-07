import { RealImageAnalysisService } from '../src/safescope-v2/real-image-analysis/real-image-analysis.service';
import { RealImageAnalysisValidator } from '../src/safescope-v2/real-image-analysis/real-image-analysis.validator';

async function validate() {
  const service = new RealImageAnalysisService();
  
  const testCases = [
    { 
        name: 'unguarded conveyor photo findings',
        input: {
          observationText: "Conveyor tail pulley is unguarded.",
          imageInputs: [{ id: 'img1', simulatedVisionFindings: ['missing guard'] }]
        },
        expectSignal: 'visible_missing_guard',
        expectSupport: 'supports_observation'
    },
    { 
        name: 'damaged cord near wet floor',
        input: {
          observationText: "Frayed electrical cord near puddle.",
          imageInputs: [{ id: 'img2', simulatedVisionFindings: ['damaged cord', 'spill'] }]
        },
        expectSignal: 'visible_damaged_cord',
        expectSupport: 'supports_observation'
    },
    { 
        name: 'blocked egress route',
        input: {
          observationText: "Emergency exit is blocked by pallets.",
          imageInputs: [{ id: 'img3', simulatedVisionFindings: ['blocked exit'] }]
        },
        expectSignal: 'visible_blocked_exit',
        expectSupport: 'supports_observation'
    },
    { 
        name: 'unlabeled chemical container',
        input: {
          observationText: "Secondary container has no label.",
          imageInputs: [{ id: 'img4', simulatedVisionFindings: ['no label'] }]
        },
        expectSignal: 'visible_unlabeled_container',
        expectSupport: 'supports_observation'
    },
    { 
        name: 'fall edge missing guardrail',
        input: {
          observationText: "Open edge on second floor with no railing.",
          imageInputs: [{ id: 'img5', simulatedVisionFindings: ['missing guardrail'] }]
        },
        expectSignal: 'visible_missing_guardrail',
        expectSupport: 'supports_observation'
    },
    { 
        name: 'conflicting visual evidence',
        input: {
          observationText: "Machine is unguarded.",
          imageInputs: [{ id: 'img6', caption: "Guard installed and secure" }]
        },
        expectSignal: 'visible_installed_guard',
        expectSupport: 'conflicts_with_observation'
    },
    { 
        name: 'negative phrase safety',
        input: {
          observationText: "Floor is dry.",
          imageInputs: [{ id: 'img7', fieldNotes: "no spill observed" }]
        },
        prohibitSignal: 'visible_spill'
    },
    { 
        name: 'substring safety',
        input: {
          observationText: "Equipment is unguarded.",
          imageInputs: [{ id: 'img8', simulatedVisionFindings: ['unguarded'] }]
        },
        expectSignal: 'visible_missing_guard',
        prohibitSignal: 'visible_installed_guard'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing real image analysis: ${tc.name} ---`);
      const result = service.evaluate(tc.input);
      
      const errors = RealImageAnalysisValidator.validate(result);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (tc.expectSignal && !result.visualSignals.some(s => s.signal === tc.expectSignal)) {
          console.error(`[FAIL] Expected signal "${tc.expectSignal}" for "${tc.name}". Found: ${result.visualSignals.map(s => s.signal).join(', ')}`);
          process.exit(1);
      }

      if (tc.expectSupport) {
          const sig = result.visualSignals.find(s => s.signal === tc.expectSignal);
          if (sig?.support !== tc.expectSupport) {
            console.error(`[FAIL] Expected support "${tc.expectSupport}" for "${tc.name}". Got: ${sig?.support}`);
            process.exit(1);
          }
      }

      if (tc.prohibitSignal && result.visualSignals.some(s => s.signal === tc.prohibitSignal)) {
          console.error(`[FAIL] Prohibited signal "${tc.prohibitSignal}" found for "${tc.name}"`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope real image analysis validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
