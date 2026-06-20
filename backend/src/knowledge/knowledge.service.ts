import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { KnowledgeChunk } from './entities/knowledge-chunk.entity';
import {
  KnowledgeApprovalStatus,
  KnowledgeDocument,
  KnowledgeSourceType,
} from './entities/knowledge-document.entity';
import { KnowledgeRetrievalLog } from './entities/knowledge-retrieval-log.entity';

type CreateKnowledgeDocumentDto = {
  title: string;
  agency?: string;
  sourceType?: KnowledgeSourceType;
  authorityTier?: number;
  citation?: string;
  sourceUrl?: string;
  publishedAt?: string;
  approvalStatus?: KnowledgeApprovalStatus;
  summary?: string;
  rawText: string;
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  standardTags?: string[];
};

type SearchKnowledgeDto = {
  query: string;
  agency?: string;
  sourceTypes?: string[];
  approvedOnly?: boolean;
  limit?: number;
  reportId?: string;
  findingId?: string;
};

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly documentRepo: Repository<KnowledgeDocument>,
    @InjectRepository(KnowledgeChunk)
    private readonly chunkRepo: Repository<KnowledgeChunk>,
    @InjectRepository(KnowledgeRetrievalLog)
    private readonly retrievalLogRepo: Repository<KnowledgeRetrievalLog>,
  ) {}

  async createDocument(dto: CreateKnowledgeDocumentDto) {
    const document = this.documentRepo.create({
      title: dto.title,
      agency: (dto.agency as any) || 'Other',
      sourceType: dto.sourceType || 'other',
      authorityTier: dto.authorityTier ?? this.defaultAuthorityTier(dto.sourceType),
      citation: dto.citation || null,
      sourceUrl: dto.sourceUrl || null,
      publishedAt: dto.publishedAt || null,
      approvalStatus: dto.approvalStatus || 'draft',
      summary: dto.summary || null,
      rawText: dto.rawText,
      hazardTags: dto.hazardTags || [],
      equipmentTags: dto.equipmentTags || [],
      taskTags: dto.taskTags || [],
      standardTags: dto.standardTags || [],
    });

    const saved = await this.documentRepo.save(document);
    await this.rebuildChunks(saved.id);

    return this.findDocument(saved.id);
  }

  async listDocuments() {
    return this.documentRepo.find({
      order: { updatedAt: 'DESC' },
      take: 100,
    });
  }

  async findDocument(id: string) {
    const document = await this.documentRepo.findOne({
      where: { id },
      relations: { chunks: true },
      order: { chunks: { chunkIndex: 'ASC' } as any },
    });

    if (!document) throw new NotFoundException('Knowledge document not found');

    return document;
  }

  async approveDocument(id: string) {
    const document = await this.findDocument(id);
    document.approvalStatus = 'approved';
    return this.documentRepo.save(document);
  }

  async rejectDocument(id: string) {
    const document = await this.findDocument(id);
    document.approvalStatus = 'rejected';
    return this.documentRepo.save(document);
  }

  async rebuildChunks(documentId: string) {
    const document = await this.documentRepo.findOne({ where: { id: documentId } });
    if (!document) throw new NotFoundException('Knowledge document not found');

    await this.chunkRepo.delete({ documentId });

    const chunks = this.chunkText(document.rawText).map((chunkText, index) =>
      this.chunkRepo.create({
        documentId: document.id,
        document,
        chunkIndex: index,
        sectionHeading: this.extractHeading(chunkText),
        chunkText,
        chunkSummary: this.summarizeChunk(chunkText),
        citation: document.citation || null,
        authorityTier: document.authorityTier,
        hazardTags: document.hazardTags || [],
        equipmentTags: document.equipmentTags || [],
        taskTags: document.taskTags || [],
        standardTags: document.standardTags || [],
        confidenceWeight: this.authorityWeight(document.authorityTier),
      }),
    );

    return this.chunkRepo.save(chunks);
  }

  async search(dto: SearchKnowledgeDto) {
    const limit = Math.min(Math.max(dto.limit || 8, 1), 25);
    const query = (dto.query || '').trim();

    if (!query) {
      return {
        query,
        matches: [],
        confidence: 0,
        reasoning: {
          evidenceGaps: ['Enter a hazard description or search phrase.'],
        },
      };
    }

    const terms = this.extractTerms(query);

    const chunks = await this.chunkRepo.find({
      where: terms.length
        ? terms.map((term) => ({
            chunkText: ILike(`%${term}%`),
          }))
        : {},
      relations: { document: true },
      take: 250,
    });

    const filtered = chunks.filter((chunk) => {
      if (dto.approvedOnly !== false && chunk.document?.approvalStatus !== 'approved') {
        return false;
      }

      if (dto.agency && dto.agency !== 'all' && chunk.document?.agency !== dto.agency) {
        return false;
      }

      if (dto.sourceTypes?.length && !dto.sourceTypes.includes(chunk.document?.sourceType)) {
        return false;
      }

      return true;
    });

    const scored = filtered
      .map((chunk) => {
        const score = this.scoreChunk(query, terms, chunk);
        return {
          chunk,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const matches = scored.map(({ chunk, score }) => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      title: chunk.document?.title,
      agency: chunk.document?.agency,
      sourceType: chunk.document?.sourceType,
      authorityTier: chunk.authorityTier,
      citation: chunk.citation,
      sectionHeading: chunk.sectionHeading,
      excerpt: chunk.chunkText.slice(0, 900),
      tags: {
        hazards: chunk.hazardTags,
        equipment: chunk.equipmentTags,
        tasks: chunk.taskTags,
        standards: chunk.standardTags,
      },
      score,
      reason: this.explainMatch(terms, chunk),
    }));

    const confidence = matches.length
      ? Number(Math.min(0.95, matches[0].score / 100).toFixed(2))
      : 0;

    await this.retrievalLogRepo.save(
      this.retrievalLogRepo.create({
        reportId: dto.reportId || null,
        findingId: dto.findingId || null,
        queryText: query,
        retrievedChunkIds: matches.map((match) => match.chunkId),
        selectedChunkIds: matches.slice(0, 5).map((match) => match.chunkId),
        confidence,
        reasoningJson: {
          evidenceGaps: this.evidenceGaps(query, matches),
          topAuthorityTier: matches[0]?.authorityTier || null,
        },
      }),
    );

    return {
      query,
      confidence,
      matches,
      reasoning: {
        evidenceGaps: this.evidenceGaps(query, matches),
        caution:
          'HazLenz AI references supporting knowledge and likely applicability. Final compliance decisions require qualified review.',
      },
    };
  }

  private chunkText(rawText: string) {
    const clean = String(rawText || '').replace(/\r/g, '').trim();
    if (!clean) return [];

    const paragraphs = clean.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
    const chunks: string[] = [];
    let current = '';

    for (const paragraph of paragraphs) {
      if ((current + '\n\n' + paragraph).length > 1800 && current) {
        chunks.push(current.trim());
        current = paragraph;
      } else {
        current = current ? `${current}\n\n${paragraph}` : paragraph;
      }
    }

    if (current.trim()) chunks.push(current.trim());

    return chunks.length ? chunks : [clean.slice(0, 1800)];
  }

  private extractHeading(text: string) {
    const firstLine = text.split('\n').find(Boolean)?.trim();
    if (!firstLine) return null;
    return firstLine.length <= 160 ? firstLine : null;
  }

  private summarizeChunk(text: string) {
    const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
    return firstSentence?.slice(0, 280) || null;
  }

  private extractTerms(query: string) {
    return Array.from(
      new Set(
        query
          .toLowerCase()
          .replace(/[^a-z0-9\s/-]/g, ' ')
          .split(/\s+/)
          .filter((term) => term.length >= 4)
          .slice(0, 12),
      ),
    );
  }

  private scoreChunk(query: string, terms: string[], chunk: KnowledgeChunk) {
    const haystack = [
      chunk.chunkText,
      chunk.chunkSummary,
      chunk.citation,
      ...(chunk.hazardTags || []),
      ...(chunk.equipmentTags || []),
      ...(chunk.taskTags || []),
      ...(chunk.standardTags || []),
      chunk.document?.title,
      chunk.document?.sourceType,
      chunk.document?.agency,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const termScore = terms.reduce((score, term) => {
      return score + (haystack.includes(term) ? 10 : 0);
    }, 0);

    const phraseScore = haystack.includes(query.toLowerCase()) ? 25 : 0;
    const authorityScore = Math.max(0, 30 - chunk.authorityTier * 4);
    const tagScore =
      [...(chunk.hazardTags || []), ...(chunk.equipmentTags || []), ...(chunk.taskTags || [])]
        .filter((tag) => query.toLowerCase().includes(String(tag).toLowerCase()))
        .length * 8;

    return termScore + phraseScore + authorityScore + tagScore;
  }

  private explainMatch(terms: string[], chunk: KnowledgeChunk) {
    const text = chunk.chunkText.toLowerCase();
    const matchedTerms = terms.filter((term) => text.includes(term));

    const reasons = [];
    if (matchedTerms.length) reasons.push(`Matched terms: ${matchedTerms.join(', ')}`);
    reasons.push(`Authority tier ${chunk.authorityTier}`);
    if (chunk.citation) reasons.push(`Citation/reference available: ${chunk.citation}`);

    return reasons.join(' · ');
  }

  private evidenceGaps(query: string, matches: any[]) {
    const gaps = [];
    const lower = query.toLowerCase();

    if (!/(photo|image|visible|observed)/.test(lower)) {
      gaps.push('Confirm visible evidence or attach a supporting photo.');
    }

    if (!/(energized|locked|deenergized|maintenance|operating)/.test(lower)) {
      gaps.push('Confirm operating/energy state and whether maintenance is involved.');
    }

    if (!/(exposed|guard|missing|damaged|unguarded|blocked)/.test(lower)) {
      gaps.push('Clarify the exact exposure or failed control.');
    }

    if (!matches.length) {
      gaps.push('No approved knowledge match found yet; add or approve reference material.');
    }

    return gaps;
  }

  private defaultAuthorityTier(sourceType?: KnowledgeSourceType) {
    if (sourceType === 'regulation') return 1;
    if (['policy', 'interpretation', 'directive'].includes(String(sourceType))) return 2;
    if (['accident_report', 'fatality_report'].includes(String(sourceType))) return 3;
    if (['journal', 'case_study'].includes(String(sourceType))) return 4;
    return 5;
  }

  private authorityWeight(authorityTier: number) {
    return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
  }
}
