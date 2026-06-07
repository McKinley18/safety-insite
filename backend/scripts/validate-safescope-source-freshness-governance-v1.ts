import { SourceFreshnessGovernanceService } from '../src/safescope-v2/source-freshness-governance/source-freshness-governance.service';
import { SourceFreshnessGovernanceValidator } from '../src/safescope-v2/source-freshness-governance/source-freshness-governance.validator';
import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';

async function validate() {
  const service = new SourceFreshnessGovernanceService();
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'current OSHA primary',
        input: { 
            agency: 'OSHA', 
            authorityTier: 'primary_regulation', 
            sourceDateStatus: 'current',
            effectiveDate: '2026-01-01'
        },
        expectStatus: 'current',
        expectRestriction: 'allowed'
    },
    { 
        name: 'missing dates',
        input: { 
            agency: 'MSHA', 
            authorityTier: 'primary_regulation'
        },
        expectStatus: 'missing_source_date',
        expectRestriction: 'review_required'
    },
    { 
        name: 'stale source',
        input: { 
            agency: 'OSHA', 
            authorityTier: 'primary_regulation',
            sourceDateStatus: 'stale'
        },
        expectStatus: 'stale',
        expectRestriction: 'caution'
    },
    { 
        name: 'superseded source',
        input: { 
            agency: 'OSHA', 
            authorityTier: 'primary_regulation',
            sourceDateStatus: 'superseded',
            supersededBy: 'app-mg-02'
        },
        expectStatus: 'superseded',
        expectRestriction: 'blocked'
    },
    { 
        name: 'company policy',
        input: { 
            agency: 'Acme Corp', 
            authorityTier: 'company_policy',
            sourceDateStatus: 'current',
            effectiveDate: '2026-01-01'
        },
        expectAuthority: 'company_policy'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing freshness: ${tc.name} ---`);
      const result = service.evaluate(tc.input);
      const errors = SourceFreshnessGovernanceValidator.validate(result);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (tc.expectStatus && result.freshnessStatus !== tc.expectStatus) {
          console.error(`[FAIL] Expected status ${tc.expectStatus} for "${tc.name}". Got: ${result.freshnessStatus}`);
          process.exit(1);
      }
      
      if (tc.expectRestriction && result.useRestriction !== tc.expectRestriction) {
          console.error(`[FAIL] Expected restriction ${tc.expectRestriction} for "${tc.name}". Got: ${result.useRestriction}`);
          process.exit(1);
      }

      if (tc.expectAuthority && result.authorityStatus !== tc.expectAuthority) {
          console.error(`[FAIL] Expected authority ${tc.expectAuthority} for "${tc.name}". Got: ${result.authorityStatus}`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  // Integration test (simulated)
  console.log('--- Testing retrieval integration ---');
  const retrieval = await retrievalService.retrieve('unguarded conveyor');
  if (!retrieval.sourceFreshnessGovernanceResults) {
      console.error('[FAIL] Retrieval output missing sourceFreshnessGovernanceResults');
      process.exit(1);
  }

  console.log('✅ SafeScope source freshness governance validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
