import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RegulatorySourceInventory, InventoryRecord } from './regulatory-source-audit.types';
import { 
    RegulatoryMetadataNormalizationReport, 
    NormalizationCandidate, 
    MetadataSuggestion, 
    PromotionReadinessStatus 
} from './regulatory-metadata-normalization.types';
import { RegulatorySourceAuditService } from './regulatory-source-audit.service';

@Injectable()
export class RegulatoryMetadataNormalizationService {
  private readonly outputPath = path.resolve(__dirname, '../../../../safescope-data/source-audit/regulatory-metadata-normalization-v1.json');

  constructor(private readonly auditService: RegulatorySourceAuditService) {}

  async generateNormalizationReport(): Promise<RegulatoryMetadataNormalizationReport> {
    const inventory = await this.auditService.generateInventoryReport();
    const allRecords = [...inventory.details.approvedRecords, ...inventory.details.draftCandidates];
    
    const candidates: NormalizationCandidate[] = [];
    
    let totalUnknown = 0;
    let suggestionsCount = 0;
    let counts = {
        ready: 0,
        lookup: 0,
        duplicate: 0,
        unsafe: 0,
        insufficient: 0
    };

    for (const record of allRecords) {
        const isUnknown = this.isUnknownMetadata(record);
        if (isUnknown) totalUnknown++;

        // We only attempt to normalize drafts that have unknown metadata, 
        // OR we can process everything and just return null suggestion if it's already approved.
        // The prompt says "inspect approved and draft... produce normalized metadata suggestions".
        // Let's only produce suggestions for those with unknown metadata, but we'll include all in the loop.
        
        let suggestion: MetadataSuggestion | null = null;
        let readiness: PromotionReadinessStatus = 'insufficient_metadata';
        let warnings: string[] = [];

        if (record.status === 'approved') {
             // Already approved, it doesn't need normalization for promotion
             // unless it's fundamentally broken, which the coverage matrix flags.
             readiness = 'unsafe_to_promote'; // Can't promote what's approved
             warnings.push('Record is already approved.');
        } else if (isUnknown) {
            suggestion = this.generateSuggestion(record);
            if (suggestion) {
                suggestionsCount++;
                if (suggestion.confidence === 'high') {
                    readiness = 'needs_source_lookup'; // Even high confidence needs real source lookup
                } else {
                    readiness = 'needs_source_lookup';
                }
            }
        } else {
             // It's a draft but has known metadata. Is it a duplicate?
             if (inventory.citationMap[record.normalizedCitation] && inventory.citationMap[record.normalizedCitation].length > 1) {
                 readiness = 'duplicate_or_overlap';
             } else {
                 readiness = 'ready_for_reviewer';
             }
        }

        if (readiness === 'ready_for_reviewer') counts.ready++;
        if (readiness === 'needs_source_lookup') counts.lookup++;
        if (readiness === 'duplicate_or_overlap') counts.duplicate++;
        if (readiness === 'unsafe_to_promote') counts.unsafe++;
        if (readiness === 'insufficient_metadata') counts.insufficient++;

        if (isUnknown || record.status === 'draft') {
            candidates.push({
                recordId: record.recordId,
                title: record.title,
                originalAgency: record.agency,
                originalJurisdiction: record.jurisdiction,
                originalCitation: record.citation,
                originalHazardFamilies: record.hazardFamilies,
                suggestion,
                promotionReadiness: readiness,
                governanceWarnings: warnings
            });
        }
    }

    const report: RegulatoryMetadataNormalizationReport = {
        reportVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        summary: {
            totalRecordsProcessed: allRecords.length,
            totalUnknownMetadataFound: totalUnknown,
            suggestionsGenerated: suggestionsCount,
            readyForReviewerCount: counts.ready,
            needsSourceLookupCount: counts.lookup,
            duplicateOverlapCount: counts.duplicate,
            unsafeToPromoteCount: counts.unsafe,
            insufficientMetadataCount: counts.insufficient
        },
        candidates
    };

    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));

    return report;
  }

  private isUnknownMetadata(record: InventoryRecord): boolean {
      return record.agency === 'UNKNOWN' || 
             record.agency === 'unknown' as any ||
             record.jurisdiction === 'unknown' || 
             record.authorityTier === 'unknown' ||
             !record.citation ||
             record.citation === 'source_review_required' ||
             record.citation === 'unknown';
  }

  private generateSuggestion(record: InventoryRecord): MetadataSuggestion | null {
      const titleLower = record.title.toLowerCase();
      const hf = record.hazardFamilies;
      
      let agency: any = 'UNKNOWN';
      let jurisdiction: any = 'unknown';
      let citation = 'source_review_required';
      let tier: any = 'primary_regulation';
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let reason = 'Unable to determine metadata deterministically.';

      // MSHA specific
      if (titleLower.includes('mine') || titleLower.includes('msha') || titleLower.includes('berm') || titleLower.includes('highwall')) {
          agency = 'MSHA';
          jurisdiction = 'msha';
          citation = '30 CFR 56/57 Subpart (Review Required)';
          confidence = 'medium';
          reason = 'Keywords suggest MSHA MNM Surface jurisdiction.';
          return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      // Construction specific
      if (titleLower.includes('excavation') || titleLower.includes('trench')) {
          agency = 'OSHA';
          jurisdiction = 'osha_construction';
          citation = '1926.651 / 1926.652';
          confidence = 'high';
          reason = 'Excavation terminology strongly maps to OSHA Construction Subpart P.';
          return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      if (titleLower.includes('scaffold') || titleLower.includes('aerial lift') || titleLower.includes('crane')) {
           agency = 'OSHA';
           jurisdiction = 'osha_construction';
           citation = '1926 Subpart L / CC (Review Required)';
           confidence = 'medium';
           reason = 'Equipment type often maps to Construction, but may apply to General Industry.';
           return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      // Hazard families mapping
      if (hf.includes('confined_space')) {
          agency = 'OSHA';
          jurisdiction = 'osha_general_industry';
          citation = '1910.146';
          confidence = 'medium';
          reason = 'Confined space typically maps to OSHA 1910.146 unless construction context is explicit.';
          return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      if (hf.includes('electrical')) {
          agency = 'OSHA';
          jurisdiction = 'osha_general_industry';
          citation = '1910 Subpart S (1910.303 / .305 / .333)';
          confidence = 'medium';
          reason = 'Electrical hazards typically map to OSHA 1910 Subpart S.';
          return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      if (hf.includes('hazard_communication') || titleLower.includes('sds') || titleLower.includes('chemical label')) {
          agency = 'OSHA';
          jurisdiction = 'osha_general_industry'; // Or mixed
          citation = '1910.1200';
          confidence = 'high';
          reason = 'HazCom strictly maps to OSHA 1910.1200 globally.';
          return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      if (hf.includes('fall_protection')) {
          agency = 'OSHA';
          jurisdiction = 'osha_general_industry'; // Could be construction
          citation = '1910.28 / 1926 Subpart M (Review Required)';
          confidence = 'low';
          reason = 'Fall protection requires explicit jurisdiction context (GI vs Construction).';
          return { agency, jurisdiction, authorityTier: tier, normalizedCitation: citation, hazardFamilies: hf, confidence, reason };
      }

      return null;
  }
}
