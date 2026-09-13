import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RegulatorySourceInventory, InventoryRecord } from './regulatory-source-audit.types';
import { RegulatoryCoverageMatrix, CoreStandardRequirement, CoverageStatus } from './regulatory-coverage-matrix.types';
import { RegulatorySourceAuditService } from './regulatory-source-audit.service';

export const CORE_STANDARD_REQUIREMENTS: CoreStandardRequirement[] = [
  { id: 'osha_gi_wws', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.22'], description: 'Walking-working surfaces / housekeeping' },
  { id: 'osha_gi_ladders', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.23'], description: 'Ladders' },
  { id: 'osha_gi_fall', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.28'], description: 'Fall protection' },
  { id: 'osha_gi_exit', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.37'], description: 'Emergency exit routes' },
  { id: 'osha_gi_noise', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.95'], description: 'Occupational noise' },
  { id: 'osha_gi_hazcom', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.1200'], description: 'Hazard communication' },
  { id: 'osha_gi_ppe', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.132'], description: 'PPE' },
  { id: 'osha_gi_respiratory', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.134'], description: 'Respiratory protection' },
  { id: 'osha_gi_confined', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.146'], description: 'Permit-required confined spaces' },
  { id: 'osha_gi_loto', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.147'], description: 'Lockout/tagout' },
  { id: 'osha_gi_fire', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.157'], description: 'Portable fire extinguishers' },
  { id: 'osha_gi_pit', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.178'], description: 'Powered industrial trucks' },
  { id: 'osha_gi_guarding', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.212'], description: 'Machine guarding' },
  { id: 'osha_gi_elec_general', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.303'], description: 'Electrical general requirements' },
  { id: 'osha_gi_elec_wiring', agency: 'OSHA', jurisdiction: 'osha_general_industry', expectedCitationPrefixes: ['1910.305'], description: 'Wiring methods' },

  { id: 'osha_const_fall', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart M', '1926.501', '1926.502', '1926.503'], description: 'Fall protection' },
  { id: 'osha_const_excavations', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart P', '1926.651', '1926.652'], description: 'Excavations' },
  { id: 'osha_const_elec', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart K', '1926.403', '1926.404', '1926.405'], description: 'Electrical' },
  { id: 'osha_const_ladders', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart X', '1926.1051', '1926.1052', '1926.1053'], description: 'Stairways/ladders' },
  { id: 'osha_const_cranes', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart CC', '1926.1400'], description: 'Cranes/derricks' },
  { id: 'osha_const_ppe', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart E', '1926.95'], description: 'PPE' },
  { id: 'osha_const_health', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926 Subpart D', '1926.55'], description: 'Health hazards' },
  { id: 'osha_const_hazcom', agency: 'OSHA', jurisdiction: 'osha_construction', expectedCitationPrefixes: ['1926.59'], description: 'Hazard communication' },

  { id: 'msha_mobile', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.9', '57.9'], description: 'Mobile equipment / traffic control' },
  { id: 'msha_guarding', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.14', '57.14'], description: 'Guarding' },
  { id: 'msha_elec', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.12', '57.12'], description: 'Electrical' },
  { id: 'msha_ground', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.3', '57.3'], description: 'Ground control' },
  { id: 'msha_explosives', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.6', '57.6'], description: 'Explosives' },
  { id: 'msha_ppe', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.15', '57.15'], description: 'PPE' },
  { id: 'msha_fire', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.4', '57.4'], description: 'Fire prevention' },
  { id: 'msha_berms', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.93', '57.93'], description: 'Berms, dumping, haul roads' },
  { id: 'msha_ladders', agency: 'MSHA', jurisdiction: 'msha', expectedCitationPrefixes: ['56.11', '57.11'], description: 'Ladders, travelways, platforms' },
];

@Injectable()
export class RegulatoryCoverageMatrixService {
  private readonly outputPath = path.resolve(__dirname, '../../../../safescope-data/source-audit/regulatory-coverage-matrix-v1.json');

  constructor(private readonly auditService: RegulatorySourceAuditService) {}

  async generateMatrix(): Promise<RegulatoryCoverageMatrix> {
    const inventory = await this.auditService.generateInventoryReport();
    
    const allRecords = [...inventory.details.approvedRecords, ...inventory.details.draftCandidates];
    
    const unknownMetadataRecords = allRecords.filter(r => 
        r.agency === 'UNKNOWN' || 
        r.jurisdiction === 'unknown' || 
        r.authorityTier === 'unknown' ||
        !r.citation ||
        r.citation === 'source_review_required' ||
        r.citation === 'unknown'
    );

    const duplicateOverlapCandidates: Record<string, InventoryRecord[]> = {};
    for (const [citation, ids] of Object.entries(inventory.citationMap)) {
        if (ids.length > 1) {
            duplicateOverlapCandidates[citation] = allRecords.filter(r => ids.includes(r.recordId));
        }
    }

    const coreStandardsCoverage = CORE_STANDARD_REQUIREMENTS.map(req => {
        const matchedRecords = allRecords.filter(r => 
            r.agency === req.agency && 
            (r.jurisdiction === req.jurisdiction || req.jurisdiction === 'msha') &&
            req.expectedCitationPrefixes.some(prefix => r.normalizedCitation && r.normalizedCitation.startsWith(prefix))
        );

        let status: CoverageStatus = 'missing';
        if (matchedRecords.some(r => r.status === 'approved')) {
            status = 'approved';
        } else if (matchedRecords.some(r => r.status === 'draft')) {
            status = 'draft';
        }

        return {
            requirement: req,
            status,
            matchedRecords
        };
    });

    const matrix: RegulatoryCoverageMatrix = {
        reportVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        summary: {
            totalCoreStandards: CORE_STANDARD_REQUIREMENTS.length,
            approvedCoreStandards: coreStandardsCoverage.filter(c => c.status === 'approved').length,
            draftCoreStandards: coreStandardsCoverage.filter(c => c.status === 'draft').length,
            missingCoreStandards: coreStandardsCoverage.filter(c => c.status === 'missing').length,
            totalApprovedRecords: inventory.summary.totalApprovedRecords,
            totalDraftRecords: inventory.summary.totalDraftRecords,
            unknownMetadataRecords: unknownMetadataRecords.length,
        },
        coverageByAgency: inventory.summary.byAgency,
        coverageByJurisdiction: inventory.summary.byJurisdiction,
        coverageByAuthorityTier: inventory.summary.byAuthorityTier,
        coverageByHazardFamily: inventory.summary.hazardFamilyCoverage,
        coreStandardsCoverage,
        unknownMetadataRecords,
        duplicateOverlapCandidates
    };

    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.outputPath, JSON.stringify(matrix, null, 2));

    return matrix;
  }
}
