import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  KnowledgeRecord,
  AuthorityTier,
  SourceType,
  HazardDomain,
  KnowledgeUseBoundary,
} from './knowledge-intake.types';
import { KnowledgeRecordValidatorService } from './knowledge-record-validator.service';

@Injectable()
export class ReputableSourceIngestionService {
  private readonly validator = new KnowledgeRecordValidatorService();
  private readonly quarantinedDir = path.join(__dirname, 'records/quarantined');
  private readonly approvedBundlePath = path.join(__dirname, 'records/approved/approved-knowledge-bundle.json');

  async ingestRawSource(raw: {
    recordId: string;
    sourceAuthority: string;
    sourceType: SourceType;
    citation: string;
    title: string;
    sourceUrl: string;
    jurisdiction: string;
    text?: string;
    sourceText?: string;
    standardIntent?: string;
    applicabilityTriggers?: string[];
    evidenceNeeded?: string[];
    nonApplicabilityQuestions?: string[];
  }): Promise<{
    success: boolean;
    record?: KnowledgeRecord;
    actionTaken: 'quarantined' | 'rejected' | 'duplicate_blocked';
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // 1. Guardrail Check: Block duplicate entries
    const isDuplicate = this.checkDuplicate(raw.citation, raw.sourceUrl, raw.title);
    if (isDuplicate) {
      return {
        success: false,
        actionTaken: 'duplicate_blocked',
        reasons: [`Duplicate detected for citation "${raw.citation}", url "${raw.sourceUrl}" or title "${raw.title}". Ingestion blocked.`],
      };
    }

    // 2. Credibility Classification
    const authorityTier = this.classifyCredibility(raw.sourceAuthority, raw.title, raw.sourceType);
    
    // 3. Map Hazard Domain & Families
    const hazardDomains = this.mapHazardDomains(raw.title, raw.text || raw.sourceText || raw.standardIntent || '');

    // 4. Source Boundary check - non-regulatory must be advisory, federal regulation must be mandatory
    let sourceBoundary: KnowledgeUseBoundary = 'advisory';
    if (authorityTier === 'federal_regulation') {
      sourceBoundary = 'mandatory';
    }

    // 5. Build Knowledge Record
    // FORCE unreviewed and approvedForUse = false (Strict Ingestion Guardrails)
    const record: KnowledgeRecord = {
      recordId: raw.recordId || `ingested-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceAuthority: raw.sourceAuthority,
      sourceType: raw.sourceType,
      authorityTier,
      citation: raw.citation,
      title: raw.title,
      sourceUrl: raw.sourceUrl,
      retrievedAt: new Date().toISOString(),
      jurisdiction: raw.jurisdiction || 'US_FEDERAL',
      hazardDomains,
      applicabilityTriggers: raw.applicabilityTriggers && raw.applicabilityTriggers.length > 0 ? raw.applicabilityTriggers : ['general'],
      standardIntent: raw.standardIntent || raw.text || raw.sourceText || 'No intent provided.',
      evidenceNeeded: raw.evidenceNeeded && raw.evidenceNeeded.length > 0 ? raw.evidenceNeeded : ['General field conditions'],
      nonApplicabilityQuestions: raw.nonApplicabilityQuestions && raw.nonApplicabilityQuestions.length > 0 ? raw.nonApplicabilityQuestions : ['Is it out of scope?'],
      sourceBoundary,
      reviewStatus: 'unreviewed', // Strict guardrail
      approvedForUse: false, // Strict guardrail
    };

    // 6. Validate constructed record
    const valResult = this.validator.validate(record);
    if (!valResult.isValid) {
      return {
        success: false,
        actionTaken: 'rejected',
        reasons: ['Validation failed: ' + valResult.errors.join('; ')],
      };
    }

    // 7. Write to quarantined directory (Never auto-approve/auto-promote)
    try {
      if (!fs.existsSync(this.quarantinedDir)) {
        fs.mkdirSync(this.quarantinedDir, { recursive: true });
      }
      const recordPath = path.join(this.quarantinedDir, `${record.recordId}.json`);
      fs.writeFileSync(recordPath, JSON.stringify(record, null, 2) + '\n', 'utf-8');
      
      return {
        success: true,
        record,
        actionTaken: 'quarantined',
        reasons: ['Record successfully validated and placed in quarantine for qualified human review.'],
      };
    } catch (e: any) {
      return {
        success: false,
        actionTaken: 'rejected',
        reasons: [`Failed to write record to file: ${e.message}`],
      };
    }
  }

  private classifyCredibility(authority: string, title: string, sourceType: SourceType): AuthorityTier {
    const authLower = authority.toLowerCase();
    const titleLower = title.toLowerCase();

    // Primary Regulations
    if (
      authLower.includes('osha') ||
      authLower.includes('msha') ||
      authLower.includes('epa') ||
      sourceType === 'cfr' ||
      titleLower.includes('29 cfr') ||
      titleLower.includes('30 cfr') ||
      titleLower.includes('regulation')
    ) {
      return 'federal_regulation';
    }

    // Agency Policy
    if (
      authLower.includes('niosh') ||
      authLower.includes('cdc') ||
      authLower.includes('directive') ||
      titleLower.includes('interpretation letter') ||
      titleLower.includes('policy manual') ||
      titleLower.includes('guidance')
    ) {
      return 'agency_policy';
    }

    // Industry Standards
    if (
      authLower.includes('ansi') ||
      authLower.includes('nfpa') ||
      authLower.includes('asme') ||
      authLower.includes('acgih') ||
      sourceType === 'technical_standard'
    ) {
      return 'industry_standard';
    }

    // Expert Reference
    return 'expert_reference';
  }

  private mapHazardDomains(title: string, text: string): HazardDomain[] {
    const combined = `${title} ${text}`.toLowerCase();
    const domains: HazardDomain[] = [];

    if (
      combined.includes('electrical') ||
      combined.includes('shock') ||
      combined.includes('arc flash') ||
      combined.includes('conductor') ||
      combined.includes('wiring') ||
      combined.includes('grounding')
    ) {
      domains.push('electrical');
    }
    if (
      combined.includes('chemical') ||
      combined.includes('sds') ||
      combined.includes('silica') ||
      combined.includes('dust') ||
      combined.includes('fumes') ||
      combined.includes('toxic') ||
      combined.includes('inhalation') ||
      combined.includes('lead') ||
      combined.includes('asbestos') ||
      combined.includes('solvent') ||
      combined.includes('biological') ||
      combined.includes('sewage') ||
      combined.includes('pathogen')
    ) {
      domains.push('chemical');
    }
    if (
      combined.includes('lockout') ||
      combined.includes('tagout') ||
      combined.includes('loto') ||
      combined.includes('guarding') ||
      combined.includes('machine') ||
      combined.includes('pulley') ||
      combined.includes('conveyor') ||
      combined.includes('gear') ||
      combined.includes('hydraulic') ||
      combined.includes('pneumatic') ||
      combined.includes('pressure') ||
      combined.includes('valve') ||
      combined.includes('cylinder') ||
      combined.includes('hose')
    ) {
      domains.push('mechanical');
    }
    if (
      combined.includes('fall protection') ||
      combined.includes('guardrail') ||
      combined.includes('scaffold') ||
      combined.includes('ladder') ||
      combined.includes('trench') ||
      combined.includes('excavation') ||
      combined.includes('floor hole') ||
      combined.includes('slip') ||
      combined.includes('trip') ||
      combined.includes('housekeeping')
    ) {
      domains.push('structural');
    }
    if (
      combined.includes('traffic') ||
      combined.includes('vehicle') ||
      combined.includes('forklift') ||
      combined.includes('crane') ||
      combined.includes('hoist') ||
      combined.includes('rigging') ||
      combined.includes('suspended load') ||
      combined.includes('haulage') ||
      combined.includes('berm') ||
      combined.includes('egress') ||
      combined.includes('exit') ||
      combined.includes('eyewash') ||
      combined.includes('training') ||
      combined.includes('contractor') ||
      combined.includes('corrective action') ||
      combined.includes('noise') ||
      combined.includes('hearing') ||
      combined.includes('heat stress') ||
      combined.includes('cold stress')
    ) {
      domains.push('operational');
    }

    if (domains.length === 0) {
      domains.push('operational');
    }

    return domains;
  }

  private checkDuplicate(citation: string, url: string, title: string): boolean {
    const normCitation = citation.trim().toLowerCase();
    const normUrl = url.trim().toLowerCase();
    const normTitle = title.trim().toLowerCase();

    // Helper to check standard fields
    const isMatch = (item: any) => {
      return (
        (item.citation && item.citation.trim().toLowerCase() === normCitation) ||
        (item.sourceUrl && item.sourceUrl.trim().toLowerCase() === normUrl) ||
        (item.title && item.title.trim().toLowerCase() === normTitle)
      );
    };

    // 1. Check approved bundle
    if (fs.existsSync(this.approvedBundlePath)) {
      try {
        const bundle = JSON.parse(fs.readFileSync(this.approvedBundlePath, 'utf-8'));
        if (bundle && Array.isArray(bundle.records)) {
          for (const item of bundle.records) {
            if (isMatch(item)) return true;
          }
        }
      } catch (e) {
        // ignore read error
      }
    }

    // 2. Check quarantined files
    if (fs.existsSync(this.quarantinedDir)) {
      try {
        const files = fs.readdirSync(this.quarantinedDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = JSON.parse(fs.readFileSync(path.join(this.quarantinedDir, file), 'utf-8'));
            if (isMatch(content)) return true;
          }
        }
      } catch (e) {
        // ignore read error
      }
    }

    return false;
  }
}
