import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { RiskVerificationResidualRiskValidator } from '../src/safescope-v2/risk-verification-residual-risk/risk-verification-residual-risk.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'unguarded conveyor + retrain only',
        text: 'Unguarded conveyor tail pulley.',
        context: { completedActions: ['retrain employees'] },
        expectStatus: 'verification_needed',
        expectResidual: 'high',
        expectWeak: true
    },
    { 
        name: 'damaged cord + removed',
        text: 'Damaged electrical cord.',
        context: { completedActions: ['remove from service'] },
        expectStatus: 'partially_verified',
        expectResidual: 'low'
    },
    { 
        name: 'wet floor + clean only',
        text: 'Spill on wet floor.',
        context: { completedActions: ['clean up area'] },
        expectStatus: 'residual_risk_remaining',
        expectResidual: 'moderate'
    },
    { 
        name: 'conflicting energized',
        text: 'The machine was energized and de-energized.',
        expectStatus: 'escalation_required'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing risk verification: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text, tc.context);
      const verification = retrieval.riskVerification;
      
      const errors = RiskVerificationResidualRiskValidator.validate(verification);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (verification.verificationStatus !== tc.expectStatus) {
          console.error(`[FAIL] Expected status ${tc.expectStatus} for "${tc.name}". Got: ${verification.verificationStatus}`);
          process.exit(1);
      }
      
      if (tc.expectResidual && verification.residualRiskLevel !== tc.expectResidual) {
          console.error(`[FAIL] Expected residual risk ${tc.expectResidual} for "${tc.name}". Got: ${verification.residualRiskLevel}`);
          process.exit(1);
      }

      if (tc.expectWeak && verification.weakActionWarnings.length === 0) {
          console.error(`[FAIL] Expected weak action warning for "${tc.name}"`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope risk verification and residual risk validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
