import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InventoryRecord, RegulatorySourceInventory } from './regulatory-source-audit.types';
import { ApprovedKnowledgeCitationNormalizationService } from '../approved-knowledge-registry/approved-knowledge-citation-normalization.service';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class RegulatorySourceAuditService {
  private readonly registryPath = path.resolve(__dirname, '../../../../../safescope-data/approved-knowledge/registry');
  private readonly draftPath = path.resolve(__dirname, '../../../../../safescope-data/approved-knowledge/draft-candidates');
  private readonly outputPath = path.resolve(__dirname, '../../../../../safescope-data/source-audit/regulatory-source-inventory-v1.json');

  constructor(private readonly normalizationService: ApprovedKnowledgeCitationNormalizationService) {}

  async generateInventoryReport(): Promise<RegulatorySourceInventory> {
    const approvedRecords = this.loadApprovedRecords();
    const draftCandidates = this.loadDraftCandidates();

    const inventory: RegulatorySourceInventory = {
      reportVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      summary: {
        totalApprovedRecords: approvedRecords.length,
        totalDraftRecords: draftCandidates.length,
        byAgency: {},
        byJurisdiction: {},
        byAuthorityTier: {},
        hazardFamilyCoverage: {},
      },
      details: {
        approvedRecords,
        draftCandidates,
      },
      metadataGaps: {
        missingSourceUrl: [],
        missingDates: [],
        missingJurisdiction: [],
        missingAuthorityTier: [],
      },
      governanceCompliance: {
        placeholderCount: 0,
        missingEvidenceCount: 0,
        missingApplicabilityCount: 0,
        missingAdvisoryGuardrailCount: 0,
      },
      citationMap: {},
    };

    this.processRecords(approvedRecords, inventory, 'approved');
    this.processRecords(draftCandidates, inventory, 'draft');

    this.ensureDirectory(path.dirname(this.outputPath));
    fs.writeFileSync(this.outputPath, JSON.stringify(inventory, null, 2));

    return inventory;
  }

  private processRecords(records: InventoryRecord[], inventory: RegulatorySourceInventory, type: 'approved' | 'draft') {
    records.forEach((r) => {
      // Summary Counts
      inventory.summary.byAgency[r.agency] = (inventory.summary.byAgency[r.agency] || 0) + 1;
      inventory.summary.byJurisdiction[r.jurisdiction] = (inventory.summary.byJurisdiction[r.jurisdiction] || 0) + 1;
      inventory.summary.byAuthorityTier[r.authorityTier] = (inventory.summary.byAuthorityTier[r.authorityTier] || 0) + 1;
      r.hazardFamilies.forEach((hf) => {
        inventory.summary.hazardFamilyCoverage[hf] = (inventory.summary.hazardFamilyCoverage[hf] || 0) + 1;
      });

      // Citation Map
      if (!inventory.citationMap[r.normalizedCitation]) {
        inventory.citationMap[r.normalizedCitation] = [];
      }
      inventory.citationMap[r.normalizedCitation].push(r.recordId);

      // Metadata Gaps
      if (!r.sourceUrl) inventory.metadataGaps.missingSourceUrl.push(r.recordId);
      if (!r.effectiveDate && !r.revisionDate) inventory.metadataGaps.missingDates.push(r.recordId);
      if (r.jurisdiction === 'unknown') inventory.metadataGaps.missingJurisdiction.push(r.recordId);
      if (r.authorityTier === 'unknown') inventory.metadataGaps.missingAuthorityTier.push(r.recordId);
    });
  }

  private loadApprovedRecords(): InventoryRecord[] {
    const records: InventoryRecord[] = [];
    if (!fs.existsSync(this.registryPath)) return records;

    const files = fs.readdirSync(this.registryPath).filter((f) => f.endsWith('.json'));
    files.forEach((file) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.registryPath, file), 'utf-8'));
        const array = Array.isArray(data) ? data : [data];
        array.forEach((item: ApprovedKnowledgeRecord) => {
          if (item.recordId) {
            records.push({
              recordId: item.recordId,
              status: 'approved',
              agency: item.authority.agency,
              jurisdiction: item.authority.jurisdiction,
              authorityTier: item.authority.authorityTier,
              citation: item.authority.citation,
              normalizedCitation: this.normalizationService.normalize(item.authority.citation, item.authority.agency).canonical,
              title: item.authority.title,
              sourceUrl: item.authority.sourceUrl,
              effectiveDate: item.authority.effectiveDate,
              revisionDate: item.authority.revisionDate,
              hazardFamilies: item.mapping.hazardFamilies || [],
            });
          }
        });
      } catch (e) {
        console.error(`Failed to load approved record ${file}:`, e);
      }
    });
    return records;
  }

  private loadDraftCandidates(): InventoryRecord[] {
    const records: InventoryRecord[] = [];
    if (!fs.existsSync(this.draftPath)) return records;

    const files = fs.readdirSync(this.draftPath).filter((f) => f.endsWith('.json'));
    files.forEach((file) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.draftPath, file), 'utf-8'));
        // Drafts might have a different shape depending on implementation, 
        // but often they mirror ApprovedKnowledgeRecord or close to it.
        const array = Array.isArray(data) ? data : [data];
        array.forEach((item: any) => {
          if (item.candidateId || item.recordId) {
            const auth = item.authority || item.normalizedSource;
            if (!auth) return;
            records.push({
              recordId: item.candidateId || item.recordId,
              status: 'draft',
              agency: auth.agency,
              jurisdiction: auth.jurisdiction,
              authorityTier: auth.authorityTier,
              citation: auth.citation,
              normalizedCitation: this.normalizationService.normalize(auth.citation, auth.agency).canonical,
              title: auth.title,
              sourceUrl: auth.sourceUrl,
              effectiveDate: auth.effectiveDate,
              revisionDate: auth.revisionDate,
              hazardFamilies: (item.mapping?.hazardFamilies) || [],
            });
          }
        });
      } catch (e) {
        console.error(`Failed to load draft candidate ${file}:`, e);
      }
    });
    return records;
  }

  private ensureDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
