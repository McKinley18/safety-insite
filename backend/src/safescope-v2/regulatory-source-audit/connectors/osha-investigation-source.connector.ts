import { ConnectorFetchOptions, ConnectorMode, IRegulatorySourceConnector, RegulatorySourceConnectorResult } from './regulatory-source-connector.types';
import * as fs from 'fs';
import * as path from 'path';
import { RegulatoryLiveFetchService } from '../regulatory-live-fetch.service';
import { Jurisdiction } from '../../approved-knowledge-registry/approved-knowledge-record.types';

export class OshaInvestigationSourceConnector implements IRegulatorySourceConnector {
  public sourceId = 'osha_investigation_connector_v1';
  public sourceName = 'OSHA Investigation Summaries Connector';
  public authorityTier = 'official_guidance';
  public supportedJurisdictions: Jurisdiction[] = ['osha_general_industry', 'osha_construction'];
  public defaultMode: ConnectorMode = 'fixture';

  private fixturePath = path.resolve(__dirname, '../../../../../safescope-data/source-audit/fixtures/regulatory-source-audit-fixtures-v1.json');

  constructor(private readonly liveFetchService: RegulatoryLiveFetchService = new RegulatoryLiveFetchService()) {}

  async fetchCandidates(options?: ConnectorFetchOptions): Promise<RegulatorySourceConnectorResult[]> {
    const mode = options?.mode || this.defaultMode;

    if (mode === 'fixture') {
        if (fs.existsSync(this.fixturePath)) {
            const data = JSON.parse(fs.readFileSync(this.fixturePath, 'utf-8'));
            return data
                .filter((c: any) => c.sourceSystem === 'osha_investigation')
                .map((c: any) => ({ ...c, sourceId: this.sourceId, sourceName: this.sourceName, liveFetchUsed: false, governanceWarnings: [] }));
        }
        return [];
    }

    // Live mode
    const fetchResult = await this.liveFetchService.fetch({
        url: options?.source || 'https://www.osha.gov/investigations',
        allowNetwork: options?.allowNetwork
    });

    if (!fetchResult.success) {
        console.warn(`OSHA Investigation live fetch failed: ${fetchResult.error}`);
        return [];
    }

    return [
        {
            sourceId: this.sourceId,
            sourceName: this.sourceName,
            sourceSystem: 'osha_investigation',
            sourceType: 'summary',
            agency: 'OSHA',
            jurisdiction: 'osha_general_industry',
            sourceUrl: fetchResult.metadata.url,
            fetchedAt: fetchResult.metadata.fetchedAt,
            rawTitle: 'Live OSHA Investigation Draft',
            rawCitation: 'N/A',
            normalizedCitation: 'N/A',
            rawTextExcerpt: fetchResult.data || 'Failed to extract text.',
            contentHash: 'live-hash-' + Date.now(),
            contentFingerprint: 'live-print-' + Date.now(),
            hazardFamilies: [],
            recommendedUse: 'supplemental_context_candidate',
            ingestionRisk: 'high',
            reasons: ['Live parsed content requires rigorous manual review.'],
            liveFetchUsed: true,
            governanceWarnings: ['LIVE_FETCH_UNVERIFIED_CONTENT']
        }
    ];
  }
}
