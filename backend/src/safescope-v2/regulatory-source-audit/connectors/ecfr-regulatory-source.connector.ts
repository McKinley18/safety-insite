import { IRegulatorySourceConnector, RegulatorySourceConnectorResult } from './regulatory-source-connector.types';
import * as fs from 'fs';
import * as path from 'path';

export class ECfrRegulatorySourceConnector implements IRegulatorySourceConnector {
  private fixturePath = path.resolve(__dirname, '../../../../../safescope-data/source-audit/fixtures/regulatory-source-audit-fixtures-v1.json');

  async fetchCandidates(filter?: any): Promise<RegulatorySourceConnectorResult[]> {
    // Local-first implementation using fixtures for staging readiness
    if (fs.existsSync(this.fixturePath)) {
        const data = JSON.parse(fs.readFileSync(this.fixturePath, 'utf-8'));
        return data.filter((c: any) => c.sourceSystem === 'ecfr' && (!filter || !filter.agency || c.agency === filter.agency));
    }
    return [];
  }
}
