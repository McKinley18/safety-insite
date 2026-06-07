import { FieldEvidenceWeightingService } from '../src/safescope-v2/field-evidence-weighting/field-evidence-weighting.service';
import { FieldEvidenceWeightingValidator } from '../src/safescope-v2/field-evidence-weighting/field-evidence-weighting.validator';

async function validate() {
  const service = new FieldEvidenceWeightingService();
  
  const testCases = [
    { text: 'The machine was energized but also de-energized.', expect: 'conflicting', contradictions: 1, name: 'energized/de-energized' },
    { text: 'The panel was locked out and not locked out.', expect: 'conflicting', contradictions: 1, name: 'locked out/not locked out' },
    { text: 'A guarded conveyor with the guard removed.', expect: 'conflicting', contradictions: 1, name: 'guarded/removed' },
    { text: 'No exposure to the hazard, but an employee was within reach.', expect: 'conflicting', contradictions: 1, name: 'no exposure/within reach' },
    { text: 'The spill was cleaned up, but the area is still leaking.', expect: 'conflicting', contradictions: 1, name: 'cleaned/leaking' },
    { text: 'The tag was inspected but it was also expired.', expect: 'conflicting', contradictions: 1, name: 'inspected/expired' },
    { text: 'A labeled container that was unlabeled.', expect: 'conflicting', contradictions: 1, name: 'labeled/unlabeled' },
    { text: 'The area was barricaded with no barricade.', expect: 'conflicting', contradictions: 1, name: 'barricaded/no barricade' },
    { text: 'Unguarded conveyor tail pulley with employee access during cleanup and no guarding in place.', expect: 'moderate', name: 'strong evidence' },
    { text: 'A vague observation.', expect: 'insufficient', missingFacts: 1, name: 'vague' },
    { text: 'Worker saw that equipment is unguarded.', expect: 'weak', name: 'substring safety unguarded'},
    { text: 'Employee saw that container is unlabeled.', expect: 'weak', name: 'substring safety unlabeled'}
  ];

  for (const tc of testCases) {
      console.log(`--- Testing case: ${tc.name} ---`);
      const result = service.evaluate(tc.text);
      const errors = FieldEvidenceWeightingValidator.validate(result);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      if (result.evidenceGrade !== tc.expect) {
          console.error(`[FAIL] Expected grade ${tc.expect} for "${tc.name}", but got ${result.evidenceGrade}`);
          process.exit(1);
      }
      if (tc.contradictions && result.detectedContradictions.length !== tc.contradictions) {
          console.error(`[FAIL] Expected ${tc.contradictions} contradictions for "${tc.name}", but got ${result.detectedContradictions.length}`);
          process.exit(1);
      }
       if (tc.missingFacts && result.missingCriticalFacts.length !== tc.missingFacts) {
          console.error(`[FAIL] Expected ${tc.missingFacts} missing facts for "${tc.name}", but got ${result.missingCriticalFacts.length}`);
          process.exit(1);
      }
      if (result.detectedContradictions.length > 0 && result.reviewerQuestions.length === 0) {
          console.error(`[FAIL] Expected reviewer questions for contradiction case "${tc.name}"`);
          process.exit(1);
      }
      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope field evidence weighting validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
