import * as fs from 'fs';
import * as path from 'path';
import { RegulatorySourceAuditService } from '../src/safescope-v2/regulatory-source-audit/regulatory-source-audit.service';
import { RegulatoryDifferentialComparisonService } from '../src/safescope-v2/regulatory-source-audit/regulatory-differential-comparison.service';
import { RegulatorySourceIngestionAdapter } from '../src/safescope-v2/regulatory-source-audit/regulatory-source-ingestion.adapter';
import { ECfrRegulatorySourceConnector } from '../src/safescope-v2/regulatory-source-audit/connectors/ecfr-regulatory-source.connector';
import { MshaFatalitySourceConnector } from '../src/safescope-v2/regulatory-source-audit/connectors/msha-fatality-source.connector';
import { OshaFatalitySourceConnector } from '../src/safescope-v2/regulatory-source-audit/connectors/osha-fatality-source.connector';
import { OshaInvestigationSourceConnector } from '../src/safescope-v2/regulatory-source-audit/connectors/osha-investigation-source.connector';
import { ApprovedKnowledgeCitationNormalizationService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.service';

// Mock dependencies
class StubReviewerCandidateConsoleService {
    candidates: any[] = [];
    async addCandidate(candidate: any) {
        this.candidates.push(candidate);
        return candidate;
    }
}

async function validate() {
  console.log('--- Testing SafeScope Regulatory Source Audit + Differential Ingestion v1 ---');

  const normalizationService = new ApprovedKnowledgeCitationNormalizationService();
  const auditService = new RegulatorySourceAuditService(normalizationService);
  const comparisonService = new RegulatoryDifferentialComparisonService(normalizationService);
  const consoleService = new StubReviewerCandidateConsoleService();
  const ingestionAdapter = new RegulatorySourceIngestionAdapter(consoleService as any);

  // 1. Audit Existing Inventory
  const inventory = await auditService.generateInventoryReport();
  if (inventory.summary.totalApprovedRecords === 0 && inventory.summary.totalDraftRecords === 0) {
      // It's possible the test runs in an environment with no records, but usually there are some.
      console.warn('[WARN] No approved or draft records found in local inventory.');
  } else {
      console.log(`[PASS] Inventory generated. Approved: ${inventory.summary.totalApprovedRecords}, Drafts: ${inventory.summary.totalDraftRecords}`);
  }

  // 2. Fetch from Connectors (Fixtures)
  const ecfrConnector = new ECfrRegulatorySourceConnector();
  const mshaFatalityConnector = new MshaFatalitySourceConnector();
  const oshaInvestigationConnector = new OshaInvestigationSourceConnector();

  const ecfrCandidates = await ecfrConnector.fetchCandidates();
  const mshaFatalityCandidates = await mshaFatalityConnector.fetchCandidates();
  const oshaInvestigationCandidates = await oshaInvestigationConnector.fetchCandidates();

  // Also manually load the unknown blog for testing rejection
  const fixturePath = path.resolve(__dirname, '../../safescope-data/source-audit/fixtures/regulatory-source-audit-fixtures-v1.json');
  const allFixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  const unknownCandidates = allFixtures.filter((c: any) => c.sourceSystem === 'unknown_blog');

  const allSourceCandidates = [
      ...ecfrCandidates, 
      ...mshaFatalityCandidates, 
      ...oshaInvestigationCandidates,
      ...unknownCandidates
  ];

  if (allSourceCandidates.length === 0) {
      throw new Error('Failed to load source candidates from fixtures.');
  }

  // 3. Differential Comparison
  const comparisons = comparisonService.compare(allSourceCandidates, inventory);

  // Verify classifications
  let foundUnknownRejection = false;
  let foundSupplemental = false;

  comparisons.forEach(comp => {
      // console.log(`Comp: ${comp.classification} for ${comp.candidate.sourceSystem}`);
      if (comp.classification === 'rejected_unknown_authority') foundUnknownRejection = true;
      if (comp.classification === 'supplemental_candidate') foundSupplemental = true;
  });

  if (!foundUnknownRejection) throw new Error('Failed to reject unknown authority candidate.');
  if (!foundSupplemental) {
      console.log('Comparisons:', comparisons.map(c => ({ sys: c.candidate.sourceSystem, cls: c.classification })));
      throw new Error('Failed to classify supplemental candidate.');
  }

  console.log('[PASS] Differential comparison completed and verified.');

  // 4. Governed Ingestion
  await ingestionAdapter.ingestCandidates(comparisons);

  if (consoleService.candidates.length === 0) {
      // It's possible all were already covered, but the fixtures include fatalities which are supplemental
      throw new Error('No candidates were ingested.');
  }

  let foundProhibitedLanguage = false;
  consoleService.candidates.forEach(c => {
      const text = JSON.stringify(c).toLowerCase();
      if (text.includes('is a violation') || text.includes('legal determination')) {
          foundProhibitedLanguage = true;
      }
      if (!c.requiredReviewSteps || c.requiredReviewSteps.length === 0) {
          throw new Error('Ingested candidate missing required review steps.');
      }
  });

  if (foundProhibitedLanguage) throw new Error('Prohibited language detected in ingested candidates.');

  console.log(`[PASS] Governed ingestion created ${consoleService.candidates.length} candidates.`);
  console.log('✅ SafeScope regulatory source audit and ingestion validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
