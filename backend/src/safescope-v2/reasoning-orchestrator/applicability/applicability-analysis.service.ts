import * as natural from 'natural';
import { KnowledgeRecord } from '../../knowledge-intake/knowledge-intake.types';
import {
  ApplicabilityAnalysisInput,
  ApplicabilityAnalysisResult,
  ApplicabilityRecordAnalysis,
  ApplicabilityStatus,
} from './applicability-analysis.types';

function normalize(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function includesMeaningfulText(haystack: string, needle: string): boolean {
  const normalizedNeedle = normalize(needle);
  if (!normalizedNeedle) return false;

  const words = normalizedNeedle
    .split(/[^a-z0-9.]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);

  if (words.length === 0) return false;

  const haystackTokens = natural.WordTokenizer ? new natural.WordTokenizer().tokenize(haystack) : haystack.split(/[^a-z0-9.]+/i);
  const stemmedHaystack = haystackTokens.map(t => natural.PorterStemmer.stem(t));

  return words.some((word) => {
    const stemmedWord = natural.PorterStemmer.stem(word);
    return haystack.includes(word) || stemmedHaystack.includes(stemmedWord);
  });
}

export class SafeScopeApplicabilityAnalysisService {
  analyze(input: ApplicabilityAnalysisInput): ApplicabilityAnalysisResult {
    const classifier = new natural.BayesClassifier();
    
    input.approvedRecords.forEach((record) => {
      record.applicabilityTriggers.forEach(t => classifier.addDocument(t, record.recordId));
      record.evidenceNeeded.forEach(e => classifier.addDocument(e, record.recordId));
      if (record.title) classifier.addDocument(record.title, record.recordId);
    });
    
    if (input.approvedRecords.length > 0) {
      classifier.train();
    }

    const observation = normalize(input.hazardObservation);
    const contextualMatches = input.approvedRecords.length > 0 ? classifier.getClassifications(observation) : [];

    const recordAnalyses = input.approvedRecords.map((record) => {
      const aiContextScore = contextualMatches.find(c => c.label === record.recordId)?.value || 0;
      return this.analyzeRecord(input, record, aiContextScore);
    });

    const summary = {
      likelyApplicableCount: recordAnalyses.filter((item) => item.status === 'likely_applicable').length,
      possiblyApplicableCount: recordAnalyses.filter((item) => item.status === 'possibly_applicable').length,
      insufficientEvidenceCount: recordAnalyses.filter((item) => item.status === 'insufficient_evidence').length,
      notApplicableCount: recordAnalyses.filter((item) => item.status === 'not_applicable_based_on_known_facts').length,
    };

    return {
      engine: 'safescope_applicability_analysis_v1',
      mode: 'deterministic_test_only_advisory',
      productionReasoningModified: false,
      jurisdiction: input.jurisdiction,
      hazardDomain: input.hazardDomain,
      recordAnalyses,
      summary,
      conclusionBoundary: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private analyzeRecord(input: ApplicabilityAnalysisInput, record: KnowledgeRecord, aiContextScore: number = 0): ApplicabilityRecordAnalysis {
    const observation = normalize(input.hazardObservation);
    const reasoning: string[] = [];

    const triggerMatches = record.applicabilityTriggers.filter((trigger) =>
      includesMeaningfulText(observation, trigger),
    );

    const evidenceMatches = record.evidenceNeeded.filter((evidence) =>
      includesMeaningfulText(observation, evidence),
    );

    const missingEvidenceNeeded = record.evidenceNeeded.filter(
      (evidence) => !evidenceMatches.includes(evidence),
    );

    const highEvidenceGaps = input.missingEvidence.filter((gap) => gap.importance === 'high');

    let confidenceScore = 0;

    if (triggerMatches.length > 0) {
      confidenceScore += Math.min(triggerMatches.length * 25, 50);
      reasoning.push('One or more applicability triggers matched the hazard observation.');
    } else {
      reasoning.push('No applicability triggers clearly matched the hazard observation.');
    }

    if (evidenceMatches.length > 0) {
      confidenceScore += Math.min(evidenceMatches.length * 15, 30);
      reasoning.push('Some expected evidence terms were present in the hazard observation.');
    } else {
      reasoning.push('Expected evidence terms were not clearly present in the hazard observation.');
    }

    // AI Semantic Context Boost
    if (aiContextScore > 0.05) {
      const boost = Math.min(25, Math.round(aiContextScore * 100));
      confidenceScore += boost;
      reasoning.push(`SafeScope NLP context learning matched situational relevance (Boost: +${boost}).`);
    }

    if (record.sourceBoundary === 'mandatory') {
      confidenceScore += 10;
      reasoning.push('The record has a mandatory source boundary.');
    } else {
      reasoning.push('The record is not mandatory and must not be treated as binding regulation.');
    }

    if (highEvidenceGaps.length > 0) {
      confidenceScore -= Math.min(highEvidenceGaps.length * 15, 45);
      reasoning.push('High-importance evidence gaps remain.');
    }

    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    const status = this.determineStatus(confidenceScore, triggerMatches.length, highEvidenceGaps.length);

    if (status === 'likely_applicable') {
      reasoning.push('Known facts support likely applicability, subject to qualified review.');
    }

    if (status === 'possibly_applicable') {
      reasoning.push('Known facts suggest possible applicability, but more evidence is needed.');
    }

    if (status === 'insufficient_evidence') {
      reasoning.push('Known facts are not sufficient for a defensible applicability conclusion.');
    }

    if (status === 'not_applicable_based_on_known_facts') {
      reasoning.push('Known facts do not currently support applicability.');
    }

    return {
      recordId: record.recordId,
      citation: record.citation,
      title: record.title,
      sourceAuthority: record.sourceAuthority,
      sourceBoundary: record.sourceBoundary,
      status,
      triggerMatches,
      evidenceMatches,
      missingEvidenceNeeded,
      nonApplicabilityQuestions: record.nonApplicabilityQuestions,
      reasoning,
      confidenceScore,
    };
  }

  private determineStatus(
    confidenceScore: number,
    triggerMatchCount: number,
    highEvidenceGapCount: number,
  ): ApplicabilityStatus {
    if (triggerMatchCount === 0 && confidenceScore < 25) {
      return 'not_applicable_based_on_known_facts';
    }

    if (highEvidenceGapCount >= 2 || confidenceScore < 35) {
      return 'insufficient_evidence';
    }

    if (confidenceScore >= 70 && highEvidenceGapCount === 0) {
      return 'likely_applicable';
    }

    return 'possibly_applicable';
  }
}
