import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeRecord } from '../knowledge-intake.types';
import {
  ApprovedKnowledgeQueryInput,
  ApprovedKnowledgeQueryMatch,
  ApprovedKnowledgeQueryResult,
} from './approved-knowledge-query.types';

type ApprovedKnowledgeBundle = {
  records?: KnowledgeRecord[];
};

function clean(value: unknown): string {
  return String(value || '').trim();
}

function normalized(value: unknown): string {
  return clean(value).toLowerCase();
}

function includesText(source: unknown, needle: unknown): boolean {
  const n = normalized(needle);
  if (!n) return false;
  return normalized(source).includes(n);
}

function addScore(
  matchedFields: string[],
  fieldName: string,
  condition: boolean,
  weight: number,
): number {
  if (!condition) return 0;
  matchedFields.push(fieldName);
  return weight;
}

export class ApprovedKnowledgeQueryService {
  constructor(
    private readonly bundlePath = path.join(
      process.cwd(),
      'backend/src/safescope-v2/knowledge-intake/records/approved/approved-knowledge-bundle.json',
    ),
  ) {}

  query(input: ApprovedKnowledgeQueryInput): ApprovedKnowledgeQueryResult {
    const limit = Math.max(1, Math.min(input.limit || 10, 50));
    const records = this.loadApprovedRecords();

    const matches = records
      .map((record) => this.scoreRecord(record, input))
      .filter((match) => match.score > 0 || this.isEmptyQuery(input))
      .sort((a, b) => b.score - a.score || a.record.citation.localeCompare(b.record.citation))
      .slice(0, limit);

    return {
      engine: 'safescope_approved_knowledge_query',
      mode: 'read_only_human_reviewed_bundle',
      query: input,
      totalApprovedRecordsAvailable: records.length,
      matchCount: matches.length,
      matches,
      guardrails: {
        readOnly: true,
        approvedRecordsOnly: true,
        cannotApproveRecords: true,
        cannotModifyRecords: true,
        cannotDeclareViolations: true,
        cannotOverrideRegulations: true,
      },
    };
  }

  private loadApprovedRecords(): KnowledgeRecord[] {
    if (!fs.existsSync(this.bundlePath)) return [];

    const bundle = JSON.parse(fs.readFileSync(this.bundlePath, 'utf-8')) as ApprovedKnowledgeBundle;
    const records = Array.isArray(bundle.records) ? bundle.records : [];

    return records.filter(
      (record) =>
        record.reviewStatus === 'approved_by_human' &&
        record.approvedForUse === true &&
        record.sourceBoundary !== 'prohibited',
    );
  }

  private isEmptyQuery(input: ApprovedKnowledgeQueryInput): boolean {
    return ![
      input.text,
      input.citation,
      input.sourceAuthority,
      input.sourceType,
      input.authorityTier,
      input.hazardDomain,
      input.sourceBoundary,
    ].some((value) => clean(value));
  }

  private scoreRecord(record: KnowledgeRecord, input: ApprovedKnowledgeQueryInput): ApprovedKnowledgeQueryMatch {
    const matchedFields: string[] = [];
    let score = 0;

    score += addScore(matchedFields, 'citation', includesText(record.citation, input.citation), 50);
    score += addScore(matchedFields, 'sourceAuthority', includesText(record.sourceAuthority, input.sourceAuthority), 20);
    score += addScore(matchedFields, 'sourceType', record.sourceType === input.sourceType, 15);
    score += addScore(matchedFields, 'authorityTier', record.authorityTier === input.authorityTier, 15);
    score += addScore(matchedFields, 'hazardDomain', Boolean(input.hazardDomain && record.hazardDomains.includes(input.hazardDomain)), 20);
    score += addScore(matchedFields, 'sourceBoundary', record.sourceBoundary === input.sourceBoundary, 10);

    if (input.text) {
      const textFields = [
        ['title', record.title],
        ['standardIntent', record.standardIntent],
        ['applicabilityTriggers', record.applicabilityTriggers.join(' ')],
        ['evidenceNeeded', record.evidenceNeeded.join(' ')],
        ['nonApplicabilityQuestions', record.nonApplicabilityQuestions.join(' ')],
        ['citation', record.citation],
      ] as const;

      for (const [field, value] of textFields) {
        score += addScore(matchedFields, field, includesText(value, input.text), 10);
      }
    }

    return {
      record,
      score,
      matchedFields: Array.from(new Set(matchedFields)),
    };
  }
}
