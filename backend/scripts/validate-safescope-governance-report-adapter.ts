import { GovernanceReportAdapterService } from '../src/safescope-v2/governance-report-adapter/governance-report-adapter.service';

async function validate() {
  const service = new GovernanceReportAdapterService();
  
  const result = service.adapt({}, {}, {});
  
  console.log('Testing Report Adaptation...');
  if (!result.safetyFindingSummary.advisoryDisclaimer.includes('Advisory')) {
    console.error('Expected advisory disclaimer in summary');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
