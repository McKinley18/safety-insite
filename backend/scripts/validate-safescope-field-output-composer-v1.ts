import { FieldOutputComposerV1Service } from '../src/safescope-v2/field-output-composer-v1/field-output-composer-v1.service';
import { FieldOutputComposerV1Validator } from '../src/safescope-v2/field-output-composer-v1/field-output-composer-v1.validator';

async function validate() {
  const service = new FieldOutputComposerV1Service();
  
  const testCases = [
    'unguarded conveyor tail pulley',
    'damaged electrical cord',
    'unlabeled secondary chemical container',
    'vague observation requiring review'
  ];
  
  for (const text of testCases) {
      const output = await service.compose(text, {});
      const errors = FieldOutputComposerV1Validator.validate(output);
      
      if (errors.length > 0) {
          console.error(`Validation failed for "${text}":`, errors);
          process.exit(1);
      }
      
      if (output.cannotDeclareViolation !== true) {
          console.error(`Violation declaration guardrail failed for "${text}"`);
          process.exit(1);
      }
  }
  
  console.log('✅ SafeScope field output composer v1 validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
