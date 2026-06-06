import { EvidenceQuestionGenerationService } from '../src/safescope-v2/evidence-question-generation/evidence-question-generation.service';

async function validate() {
  const service = new EvidenceQuestionGenerationService();
  
  const result = service.generateQuestions({}, {}, {});
  
  console.log('Testing Evidence Question Generation...');
  if (result.evidenceQuestions.length === 0) {
    console.error('Expected evidence questions');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
