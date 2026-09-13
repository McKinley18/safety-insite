import { Injectable } from '@nestjs/common';
import { SourceIntelligenceIngestionPreviewDto } from './dto/source-ingestion-preview.dto';

@Injectable()
export class SourceIngestionService {
  previewImportSummary(preview: any) {
    return {
      source_documents: preview.source_documents?.length || 0,
      source_hazard_lessons: preview.source_hazard_lessons?.length || 0,
      source_controls: preview.source_controls?.length || 0,
      source_citation_hints: preview.source_citation_hints?.length || 0,
      source_gauntlet_links: preview.source_gauntlet_links?.length || 0
    };
  }

  validateIngestionPreview(preview: SourceIntelligenceIngestionPreviewDto) {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!preview || typeof preview !== 'object') {
        return { valid: false, counts: null, errors: ["Invalid preview object"], warnings, governance: { databaseWriteAllowed: false, requiresHumanReview: true, verifiedOnly: true } };
    }

    const docs = preview.source_documents || [];
    if (!Array.isArray(docs)) errors.push("source_documents must be an array");
    
    const seenIds = new Set();
    const seenUrls = new Set();

    docs.forEach(doc => {
        if (!doc.id || !doc.candidateId || !doc.sourceAgency || !doc.sourceTitle || !doc.sourceUrl || !doc.verificationStatus) {
            errors.push(`Missing fields in document ${doc.id}`);
        }
        if (doc.verificationStatus !== "verified") errors.push(`Document ${doc.id} not verified`);
        if (seenIds.has(doc.id)) errors.push(`Duplicate doc ID: ${doc.id}`);
        seenIds.add(doc.id);
        if (seenUrls.has(doc.sourceUrl)) errors.push(`Duplicate URL: ${doc.sourceUrl}`);
        seenUrls.add(doc.sourceUrl);
    });

    if ((preview.source_hazard_lessons?.length || 0) < docs.length) warnings.push("Hazard lessons count less than documents");
    if ((preview.source_controls?.length || 0) === 0) warnings.push("No source controls found");

    return {
        valid: errors.length === 0,
        counts: {
            source_documents: docs.length,
            source_hazard_lessons: preview.source_hazard_lessons?.length || 0,
            source_controls: preview.source_controls?.length || 0,
            source_citation_hints: preview.source_citation_hints?.length || 0,
            source_gauntlet_links: preview.source_gauntlet_links?.length || 0,
        },
        errors,
        warnings,
        governance: {
            databaseWriteAllowed: false,
            requiresHumanReview: true,
            verifiedOnly: true
        }
    };
  }
}
