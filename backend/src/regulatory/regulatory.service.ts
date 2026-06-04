import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatorySection } from './entities/regulatory-section.entity';
import { RegulatoryPart } from './entities/regulatory-part.entity';
import { StandardMatchFeedback } from '../standards/entities/standard-match-feedback.entity';

@Injectable()
export class RegulatoryService {
  constructor(
    @InjectRepository(RegulatorySection)
    private sectionRepo: Repository<RegulatorySection>,
    @InjectRepository(RegulatoryPart)
    private partRepo: Repository<RegulatoryPart>,
    @InjectRepository(StandardMatchFeedback)
    private feedbackRepo: Repository<StandardMatchFeedback>,
  ) {}

  private readonly GENERIC_NOISE = new Set([
    'shall', 'be', 'provide', 'required', 'maintained', 'least', 'directions', 
    'equipment', 'materials', 'secretary', 'approved', 'comply', 'accordance', 
    'subpart', 'standard', 'general', 'requirements', 'provision', 'specified', 
    'person', 'operator', 'intended', 'units', 'problem', 'broken', 'effective', 
    'appropriate', 'suitable', 'necessary', 'whenever', 'unless', 'except',
    'provisions', 'ensure', 'cases', 'within', 'under', 'made', 'available', 'applicable',
    'regarding', 'identified', 'observed', 'remediation', 'maintained', 'maintain'
  ]);

  async getParts(agency: string) {
    return await this.partRepo.find({ where: { agencyCode: agency } });
  }

  // 🔷 SAFESCOPE v15.0: MACHINE LEARNING FEEDBACK ENGINE
  async matchStandard(input: { 
    description: string; 
    category?: string; 
    agency?: string; 
    part?: string;
  }) {
    const { description, category, agency, part: manualPart } = input;
    
    const cleanText = description.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const combinedInput = `${category || ''} ${cleanText}`.toLowerCase();
    const rawWords = combinedInput.trim().split(/\s+/);
    
    const techTokens = rawWords.filter(w => w.length > 3 && !this.GENERIC_NOISE.has(w));
    if (techTokens.length === 0) return [];

    // 🔷 1. THE LEARNING LAYER (Historical ML Feedback)
    let learnedBoostCitations: string[] = [];
    if (category) {
        // Query the database for past successful matches utilizing BOTH category and description proximity
        const pastSuccesses = await this.feedbackRepo.createQueryBuilder('f')
            .where('f.hazardCategory = :category AND f.action = :action', { category, action: 'accepted' })
            .andWhere('similarity(f.queryText, :desc) > 0.3', { desc: description })
            .getMany();
        
        learnedBoostCitations = pastSuccesses.map(f => f.citation);
    }

    const detectedPartNumbers = rawWords.filter(w => /^\d{2,4}$/.test(w));
    
    const tsPrec = techTokens.map(w => `${w}:*`).join(' & ');
    const tsRecall = techTokens.map(w => `${w}:*`).join(' | ');

    // 🔷 2. THE CORRELATION LAYER (Multi-Vector)
    let queryBuilder = this.sectionRepo.createQueryBuilder('s')
      .addSelect(`(
        ts_rank_cd(s.ts, to_tsquery('english', :prec), 32) * 30.0 + 
        ts_rank_cd(s.ts, to_tsquery('english', :recall), 1) * 2.0 +
        similarity(s.heading, :raw) * 12.0 +
        similarity(s."textPlain", :raw) * 3.0 +
        (CASE WHEN s.citation ILIKE ANY (ARRAY[:...citations]) THEN 50.0 ELSE 0 END) +
        (CASE WHEN s.citation = ANY(ARRAY[:...learnedCitations]) THEN 1000.0 ELSE 0 END) +
        (CASE WHEN s.agencyCode = :agencyPref THEN 10.0 ELSE 0 END)
      )`, "relevance_score")
      .where("(s.ts @@ to_tsquery('english', :recall) OR s.heading % :raw)", { 
        prec: tsPrec,
        recall: tsRecall, 
        raw: combinedInput,
        citations: detectedPartNumbers.length > 0 ? detectedPartNumbers.map(n => `%${n}%`) : ['NONE'],
        learnedCitations: learnedBoostCitations.length > 0 ? learnedBoostCitations : ['NONE'],
        agencyPref: agency || 'NONE'
      });

    if (manualPart) {
        queryBuilder = queryBuilder.andWhere('s.part = :manualPart', { manualPart });
    }

    if (agency) queryBuilder = queryBuilder.andWhere('s.agencyCode = :agency', { agency });

    const results = await queryBuilder
      .orderBy("relevance_score", "DESC")
      .take(10)
      .getRawAndEntities();

    return results.entities.map((ent, idx) => {
        const score = parseFloat(results.raw[idx].relevance_score);
        return {
            ...ent,
            confidence: score,
            match_quality: score > 60 ? 'LEARNED_EXACT' : score > 30 ? 'EXACT' : score > 15 ? 'HIGH' : 'RELEVANT'
        };
    }).filter(res => res.confidence > 1.0);
  }

  async searchSections(agency: string, part: string, query?: string) {
    return await this.matchStandard({ description: query || '', agency, part });
  }

  async getSection(citation: string) {
    return await this.sectionRepo.findOne({ where: { citation } });
  }
}
