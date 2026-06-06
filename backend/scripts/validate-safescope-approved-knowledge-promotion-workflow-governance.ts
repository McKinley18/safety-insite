import { ApprovedKnowledgePromotionWorkflowGovernanceService } from '../src/safescope-v2/approved-knowledge-promotion-workflow-governance/approved-knowledge-promotion-workflow-governance.service';

async function validate() {
  const service = new ApprovedKnowledgePromotionWorkflowGovernanceService();
  
  // Test Case 3: Unknown source blocked by ASKIG remains blocked.
  const askigOutput = {
    intakeDecision: 'blocked',
    sourceAuthority: {
        authorityTier: 'unknown',
        agency: 'unknown',
        jurisdiction: 'unknown',
        citation: '',
        title: '',
        sourceDateStatus: 'unknown',
    },
    mappingGovernance: { mappingConfidence: 'insufficient' }
  };
  
  const result = await service.evaluatePromotion(askigOutput);
  
  console.log('Testing Blocked ASKIG Input...');
  if (result.promotionDecision !== 'blocked') {
    console.error('Expected blocked promotion for blocked ASKIG input');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
