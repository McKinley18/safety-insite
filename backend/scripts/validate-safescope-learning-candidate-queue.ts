import { LearningCandidateQueueService } from '../src/safescope-v2/learning-candidate-queue/learning-candidate-queue.service';

async function validate() {
  const service = new LearningCandidateQueueService();
  
  // Test Case: Blocked HRLG
  const hrlgOutput = { learningEligibility: { eligibilityLevel: 'blocked' } };
  
  const result = service.createCandidate({}, hrlgOutput);
  
  console.log('Testing Blocked HRLG Input...');
  if (result.status !== 'blocked') {
    console.error('Expected blocked candidate status');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
