import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeCitationNormalizationService } from '../approved-knowledge-registry/approved-knowledge-citation-normalization.service';
import { RegulatorySourceAuditService } from './regulatory-source-audit.service';
import { RegulatoryCoverageMatrixService } from './regulatory-coverage-matrix.service';
import { RegulatoryMetadataNormalizationService } from './regulatory-metadata-normalization.service';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class RegulatoryDraftPromotionService {
    private readonly draftPath = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/draft-candidates');
    private readonly registryPath = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/registry');

    constructor(
        private readonly normalizationService: ApprovedKnowledgeCitationNormalizationService,
        private readonly auditService: RegulatorySourceAuditService,
        private readonly matrixService: RegulatoryCoverageMatrixService,
        private readonly metadataService: RegulatoryMetadataNormalizationService
    ) {}

    async promoteCandidate(candidateId: string, packId: string, userContext: any): Promise<void> {
        // 1. Role-based check (simplified for this workflow)
        if (!userContext.role || !['compliance_admin', 'osha_reviewer', 'msha_reviewer'].includes(userContext.role)) {
            throw new UnauthorizedException('User role not authorized for promotion.');
        }

        // 2. Load candidate
        const packFile = path.join(this.draftPath, `${packId}.json`);
        if (!fs.existsSync(packFile)) {
            console.log('Pack file not found:', packFile);
            throw new BadRequestException('Pack not found.');
        }
        const packData = JSON.parse(fs.readFileSync(packFile, 'utf-8'));
        const candidate = packData.records.find((r: any) => r.recordId === candidateId);
        if (!candidate) {
            console.log('Candidate not found. Records:', packData.records.map((r: any) => r.recordId));
            throw new BadRequestException('Candidate not found.');
        }

        // 3. Governance validations
        this.validateCandidate(candidate);

        // 4. Duplicate check
        const registryFiles = fs.readdirSync(this.registryPath);
        const existingRecords: ApprovedKnowledgeRecord[] = [];
        for (const f of registryFiles) {
            const data = JSON.parse(fs.readFileSync(path.join(this.registryPath, f), 'utf-8'));
            const records = Array.isArray(data) ? data : (data.records || [data]);
            existingRecords.push(...records);
        }
        const duplicateCheck = this.normalizationService.evaluateOverlap(candidate, existingRecords);
        if (duplicateCheck.status === 'duplicate_blocked') {
            throw new BadRequestException('Duplicate record found.');
        }

        // 5. Promote: Move to registry
        const promotedRecord: ApprovedKnowledgeRecord = {
            ...candidate,
            status: 'approved'
        };
        fs.writeFileSync(path.join(this.registryPath, `${candidateId}.json`), JSON.stringify(promotedRecord, null, 2));

        // 6. Remove from draft
        packData.records = packData.records.filter((r: any) => r.recordId !== candidateId);
        fs.writeFileSync(packFile, JSON.stringify(packData, null, 2));

        // 7. Deterministic re-run of reports
        await this.auditService.generateInventoryReport();
        await this.matrixService.generateMatrix();
        await this.metadataService.generateNormalizationReport();
    }

    private validateCandidate(candidate: any) {
        if (!candidate.authority || !candidate.authority.citation || candidate.authority.citation === 'source_review_required') {
            throw new BadRequestException('Insufficient metadata for promotion.');
        }
        if (candidate.governance.advisoryOnly !== true) {
            throw new BadRequestException('Record must be advisoryOnly.');
        }
        
        // Only check content fields for prohibited language
        const textToCheck = [
            candidate.authority.title,
            candidate.applicability?.plainLanguageSummary,
            candidate.mapping?.evidenceQuestions?.join(' ')
        ].join(' ').toLowerCase();
        
        if (textToCheck.includes('violation') || textToCheck.includes('citation')) {
            throw new BadRequestException('Record contains prohibited regulatory language.');
        }
    }
}
