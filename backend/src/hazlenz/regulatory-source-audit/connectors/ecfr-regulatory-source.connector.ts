import { ConnectorFetchOptions, ConnectorMode, IRegulatorySourceConnector, RegulatorySourceConnectorResult } from './regulatory-source-connector.types';
import * as fs from 'fs';
import * as path from 'path';
import { RegulatoryLiveFetchService } from '../regulatory-live-fetch.service';
import { Jurisdiction } from '../../approved-knowledge-registry/approved-knowledge-record.types';

export class ECfrRegulatorySourceConnector implements IRegulatorySourceConnector {
  public sourceId = 'ecfr_connector_v1';
  public sourceName = 'eCFR Official Connector';
  public authorityTier = 'primary_regulation';
  public supportedJurisdictions: Jurisdiction[] = ['osha_general_industry', 'osha_construction', 'msha'];
  public defaultMode: ConnectorMode = 'fixture';

  private fixturePath = path.resolve(__dirname, '../../../../../safescope-data/source-audit/fixtures/regulatory-source-audit-fixtures-v1.json');

  constructor(private readonly liveFetchService: RegulatoryLiveFetchService = new RegulatoryLiveFetchService()) {}

  async fetchCandidates(options?: ConnectorFetchOptions): Promise<RegulatorySourceConnectorResult[]> {
    const mode = options?.mode || this.defaultMode;

    if (mode === 'fixture') {
        if (fs.existsSync(this.fixturePath)) {
            const data = JSON.parse(fs.readFileSync(this.fixturePath, 'utf-8'));
            return data
                .filter((c: any) => c.sourceSystem === 'ecfr' && (!options?.jurisdiction || c.jurisdiction === options.jurisdiction))
                .map((c: any) => ({ ...c, sourceId: this.sourceId, sourceName: this.sourceName, liveFetchUsed: false, governanceWarnings: [] }));
        }
        return [];
    }

    // Live mode
    const fetchResult = await this.liveFetchService.fetch({
        url: options?.source || 'https://www.ecfr.gov/api/admin/v1/titles',
        allowNetwork: options?.allowNetwork
    });

    if (!fetchResult.success) {
        console.warn(`eCFR live fetch failed: ${fetchResult.error}`);
        return [];
    }

    // Simulate conservative parsing of live data
    return [
        {
            sourceId: this.sourceId,
            sourceName: this.sourceName,
            sourceSystem: 'ecfr',
            sourceType: 'regulation',
            agency: 'OSHA',
            jurisdiction: options?.jurisdiction || 'osha_general_industry',
            sourceUrl: fetchResult.metadata.url,
            fetchedAt: fetchResult.metadata.fetchedAt,
            rawTitle: 'Live eCFR Regulation Draft',
            rawCitation: '1910.UNKNOWN',
            normalizedCitation: '1910.UNKNOWN',
            rawTextExcerpt: fetchResult.data || 'Failed to extract text.',
            contentHash: 'live-hash-' + Date.now(),
            contentFingerprint: 'live-print-' + Date.now(),
            hazardFamilies: [],
            recommendedUse: 'regulation_candidate',
            ingestionRisk: 'high',
            reasons: ['Live parsed content requires rigorous manual review.'],
            liveFetchUsed: true,
            governanceWarnings: ['LIVE_FETCH_UNVERIFIED_CONTENT']
        }
    ];
  }
}
