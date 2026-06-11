import * as natural from 'natural';
import { Injectable } from '@nestjs/common';
import { EvidenceQuestionOutput } from './evidence-question-generation.types';

@Injectable()
export class EvidenceQuestionGenerationService {
  
  generateQuestions(observation: any, domainScaffold: any, recordMapping: any): EvidenceQuestionOutput {
    const text = String(observation || '').toLowerCase();
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text) || [];
    const stemmedTokens = tokens.map(t => natural.PorterStemmer.stem(t));

    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);
    const keywords = tfidf.listTerms(0).slice(0, 5).map(t => t.term);

    const missingFacts: string[] = [];
    const evidenceQuestions: string[] = [];
    const priorityQuestions: string[] = [];

    const hasStem = (stem: string) => stemmedTokens.includes(stem);

    if (hasStem('machine') || hasStem('guard') || hasStem('conveyor')) {
      if (!hasStem('lock') && !hasStem('loto') && !hasStem('de-energized')) {
        missingFacts.push('Energy control state');
        evidenceQuestions.push('Was the equipment locked out/tagged out (LOTO) prior to the observation?');
        priorityQuestions.push('Was hazardous energy isolated?');
      }
    }

    if (hasStem('fall') || hasStem('height') || hasStem('roof') || hasStem('ladder')) {
      if (!hasStem('harness') && !hasStem('tie') && !hasStem('anchor')) {
        missingFacts.push('Fall protection usage');
        evidenceQuestions.push('Was a personal fall arrest system (PFAS) in use and properly anchored?');
        priorityQuestions.push('What was the fall protection method?');
      }
    }

    if (hasStem('chemical') || hasStem('spill') || hasStem('container')) {
      if (!hasStem('label') && !hasStem('sds') && !hasStem('identifi')) {
        missingFacts.push('Chemical identification');
        evidenceQuestions.push('Was the chemical container properly labeled and was an SDS available?');
        priorityQuestions.push('Was the substance clearly identified?');
      }
    }

    // Dynamic AI question generation based on extracted context
    if (keywords.length > 0 && evidenceQuestions.length === 0) {
      evidenceQuestions.push(`Can you provide more evidence or context regarding the ${keywords.join(', ')}?`);
    }
    
    return {
      evidenceQuestions: evidenceQuestions.length > 0 ? evidenceQuestions : ['Please provide more detail to complete the assessment.'],
      priorityQuestions: priorityQuestions.length > 0 ? priorityQuestions : ['Are all critical safety controls in place?'],
      reviewerOnlyQuestions: ['Confirm all critical facts related to the hazard observation.'],
      missingFacts,
      questionSourceTrace: ['SafeScope NLP Dynamic Evidence Generator'],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }
}
