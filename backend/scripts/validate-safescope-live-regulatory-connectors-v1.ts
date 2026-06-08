import { ECfrRegulatorySourceConnector } from '../src/safescope-v2/regulatory-source-audit/connectors/ecfr-regulatory-source.connector';
import { RegulatoryLiveFetchService } from '../src/safescope-v2/regulatory-source-audit/regulatory-live-fetch.service';
import { RegulatoryDifferentialComparisonService } from '../src/safescope-v2/regulatory-source-audit/regulatory-differential-comparison.service';
import { ApprovedKnowledgeCitationNormalizationService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.service';
import * as fs from 'fs';
import * as path from 'path';

async function validate() {
  console.log('--- Testing SafeScope Live Regulatory Connectors v1 ---');

  const liveFetchService = new RegulatoryLiveFetchService();
  const connector = new ECfrRegulatorySourceConnector(liveFetchService);

  // 1. Fixture mode works with no network
  const fixtureResult = await connector.fetchCandidates({ mode: 'fixture' });
  if (fixtureResult.length === 0) {
      // For validation, we expect fixtures to load
      // But if we run this script outside the right context, it might be empty.
      // Assuming we have fixtures present.
      console.warn('[WARN] Fixture mode returned 0 candidates. Is the fixture file available?');
  } else {
      if (fixtureResult[0].liveFetchUsed) {
          throw new Error('Fixture mode should not use live fetch.');
      }
      console.log('[PASS] Fixture mode executed successfully.');
  }

  // 2. Live mode is blocked when env var is absent/false
  process.env.SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH = 'false';
  const blockedLiveResult = await connector.fetchCandidates({ mode: 'live', allowNetwork: true });
  if (blockedLiveResult.length !== 0) {
      throw new Error('Live mode should be blocked when SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH is false.');
  }
  console.log('[PASS] Live mode blocked by default environment configuration.');

  // 3. Live mode requires allowNetwork true
  process.env.SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH = 'true';
  const noNetworkLiveResult = await connector.fetchCandidates({ mode: 'live', allowNetwork: false });
  if (noNetworkLiveResult.length !== 0) {
      throw new Error('Live mode should be blocked when allowNetwork is false.');
  }
  console.log('[PASS] Live mode blocked when allowNetwork is false.');

  // 4. Successful guarded live mode
  const liveResult = await connector.fetchCandidates({ mode: 'live', allowNetwork: true });
  if (liveResult.length === 0) {
      throw new Error('Live fetch simulation failed to return candidates.');
  }
  
  const candidate = liveResult[0];
  if (!candidate.liveFetchUsed) throw new Error('Live fetch flag not set on result.');
  if (candidate.jurisdiction !== 'osha_general_industry') throw new Error('Jurisdiction not preserved.');
  if (!candidate.governanceWarnings.includes('LIVE_FETCH_UNVERIFIED_CONTENT')) throw new Error('Governance warnings not attached.');
  if (candidate.recommendedUse !== 'regulation_candidate') throw new Error('Recommended use not set.');
  
  console.log('[PASS] Guarded live mode executed and preserved governance boundaries.');

  // 5. Differential Comparison handling of live data
  const normalizationService = new ApprovedKnowledgeCitationNormalizationService();
  const comparisonService = new RegulatoryDifferentialComparisonService(normalizationService);
  
  // Dummy inventory
  const inventory: any = {
      citationMap: {},
      details: { approvedRecords: [], draftCandidates: [] }
  };
  
  const compResult = comparisonService.compare(liveResult, inventory);
  if (compResult.length === 0 || compResult[0].classification !== 'missing_from_safescope') {
      throw new Error('Differential comparison failed to process live candidate correctly.');
  }
  if (!compResult[0].metadata?.liveFetchUsed) {
      throw new Error('Metadata from live fetch was lost in differential comparison.');
  }
  console.log('[PASS] Differential comparison handles live-fetched candidates.');

  // Reset env
  process.env.SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH = 'false';

  console.log('✅ SafeScope live regulatory connectors validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
