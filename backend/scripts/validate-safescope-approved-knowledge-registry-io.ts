import { ApprovedKnowledgeRegistryIoService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry-io.service';

async function validate() {
  const service = new ApprovedKnowledgeRegistryIoService();
  
  const result = service.validateRegistry();
  
  console.log('Testing Registry IO...');
  if (result.draftCandidateCount < 3) {
    console.error('Expected draft candidate count >= 3');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
