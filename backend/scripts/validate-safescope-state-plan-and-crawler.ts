import { ReviewerCandidateConsoleService } from '../src/safescope-v2/reviewer-candidate-console/reviewer-candidate-console.service';
import { RegulatoryCrawlerService } from '../src/safescope-v2/regulatory-crawler/regulatory-crawler.service';
import { SafeScopePersistenceService } from '../src/safescope-v2/persistence/persistence.service';
import { RoleBasedApprovalGatesService } from '../src/safescope-v2/role-based-approval-gates/role-based-approval-gates.service';
import { WorkspaceGovernanceAccessService } from '../src/safescope-v2/workspace-governance-access/workspace-governance-access.service';
import { JurisdictionApplicabilityDecisionTreeService } from '../src/safescope-v2/jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function validate() {
  console.log('--- Testing SafeScope State-Plans and Regulatory Crawler ---');

  const persistence = new SafeScopePersistenceService();
  const gates = new RoleBasedApprovalGatesService();
  const access = new WorkspaceGovernanceAccessService();
  const consoleService = new ReviewerCandidateConsoleService(persistence, gates, access);
  
  const crawler = new RegulatoryCrawlerService(consoleService);
  const decisionTree = new JurisdictionApplicabilityDecisionTreeService();

  // Case 1: Regulatory Crawler Ingestion Loop
  console.log('  Testing Case 1: Regulatory Crawler crawl and auto-ingest candidate registration');
  const initialCandidates = await consoleService.listCandidates();
  
  const crawledCandidates = await crawler.checkForUpdates();
  assert(crawledCandidates.length > 0, 'Crawler must discover and auto-register draft candidates.');
  
  const updatedCandidates = await consoleService.listCandidates();
  assert(updatedCandidates.length > initialCandidates.length, 'Candidate console registry should expand.');
  
  const heatStressCandidate = updatedCandidates.find(c => c.sourceSystem === 'regulatory_crawler_v1');
  assert(heatStressCandidate, 'Must register the crawler heat stress candidate.');
  assert(heatStressCandidate.priority === 'critical', 'Candidate should possess CRITICAL priority.');
  assert(heatStressCandidate.jurisdiction === 'osha_general_industry', 'Crawler candidate should map to general industry.');

  // Case 2: State-Plan Routing (Cal/OSHA California)
  console.log('  Testing Case 2: State-Plan routing (Cal/OSHA)');
  const resCal = decisionTree.evaluate({
    observationText: 'Unsafe warehousing material stack in a Los Angeles warehouse according to title 8 cal-osha rules.',
  });

  assert(resCal.primaryJurisdiction === 'cal_osha', `Should map to cal_osha, got ${resCal.primaryJurisdiction}`);
  assert(resCal.applicabilityConfidence === 'high', 'Confidence must be high.');
  assert(resCal.matchedJurisdictionSignals.includes('title 8'), 'Must match title 8 signal.');

  // Case 3: State-Plan Routing (Washington DOSH / WISHA)
  console.log('  Testing Case 3: State-Plan routing (WA DOSH)');
  const resWA = decisionTree.evaluate({
    observationText: 'Deep excavation trench barricades missing. WA DOSH wisha chapter 296 audit failure.',
  });

  assert(resWA.primaryJurisdiction === 'wa_dosh', `Should map to wa_dosh, got ${resWA.primaryJurisdiction}`);
  assert(resWA.matchedJurisdictionSignals.includes('wisha'), 'Must match wisha signal.');

  console.log('✅ SafeScope State-Plans and Regulatory Crawler validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
