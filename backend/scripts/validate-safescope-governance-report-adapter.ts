import { GovernanceReportAdapterService } from '../src/safescope-v2/governance-report-adapter/governance-report-adapter.service';

async function validate() {
  const service = new GovernanceReportAdapterService();
  
  const result = service.adapt({}, {}, {}, {}, { evidenceQuestions: ['Question 1'] }, { preferredControlFamilies: ['guarding'] });
  
  console.log('Testing Report Adaptation...');
  if (!result.missingEvidenceQuestions.content.includes('Question 1')) {
    console.error('Expected evidence questions in summary');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
