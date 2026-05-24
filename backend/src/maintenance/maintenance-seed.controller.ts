import { Body, Controller, Headers, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Standard } from '../standards/entities/standard.entity';
import { SafeScopeKnowledgeDocument } from '../safescope-knowledge/entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../safescope-knowledge/entities/safescope-knowledge-chunk.entity';
import { starterKnowledge } from '../safescope-knowledge/seed/starter-knowledge';

const standards: Partial<Standard>[] = [
  {
    agencyCode: 'MSHA',
    citation: '30 CFR 56.14107(a)',
    partNumber: '56',
    title: 'Moving machine parts shall be guarded',
    standardText:
      'Moving machine parts shall be guarded to protect persons from contacting gears, sprockets, chains, drive, head, tail, and takeup pulleys, flywheels, couplings, shafts, fan blades, and similar moving parts.',
    plainLanguageSummary: 'Guard moving machine parts that could contact employees.',
    scopeCode: 'mining',
    sourceKey: 'msha-30-cfr-56-14107-a',
    sourceName: 'MSHA 30 CFR 56.14107(a)',
    sourceType: 'regulation',
    authorityTier: 1,
    allowedUse: 'citation',
    requiresApproval: false,
    approvedForAutoIngestion: true,
    hazardCodes: ['machine_guarding'],
    requiredControls: ['fixed guarding', 'machine guarding', 'prevent contact with moving parts'],
    keywords: ['guard', 'machine guarding', 'moving parts', 'conveyor', 'pulley', 'shaft', 'drive', 'chain', 'gear'],
    severityWeight: 4,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.212(a)(1)',
    partNumber: '1910',
    title: 'Machine guarding',
    standardText:
      'One or more methods of machine guarding shall be provided to protect the operator and other employees from hazards including point of operation, ingoing nip points, rotating parts, flying chips and sparks.',
    plainLanguageSummary: 'Provide guards to protect employees from machine hazards.',
    scopeCode: 'general_industry',
    sourceKey: 'osha-1910-212-a-1',
    sourceName: 'OSHA 1910.212(a)(1)',
    sourceType: 'regulation',
    authorityTier: 1,
    allowedUse: 'citation',
    requiresApproval: false,
    approvedForAutoIngestion: true,
    hazardCodes: ['machine_guarding'],
    requiredControls: ['machine guarding', 'point of operation guarding', 'nip point guarding'],
    keywords: ['machine guarding', 'guard', 'point of operation', 'nip point', 'rotating parts', 'moving parts'],
    severityWeight: 4,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.219',
    partNumber: '1910',
    title: 'Mechanical power-transmission apparatus',
    standardText:
      'Mechanical power-transmission apparatus shall be guarded where required to prevent employee contact with belts, pulleys, shafts, gears, chains, and other transmission components.',
    plainLanguageSummary: 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.',
    scopeCode: 'general_industry',
    sourceKey: 'osha-1910-219',
    sourceName: 'OSHA 1910.219',
    sourceType: 'regulation',
    authorityTier: 1,
    allowedUse: 'citation',
    requiresApproval: false,
    approvedForAutoIngestion: true,
    hazardCodes: ['machine_guarding'],
    requiredControls: ['guard belts', 'guard pulleys', 'guard shafts', 'guard gears'],
    keywords: ['belt', 'pulley', 'shaft', 'gear', 'chain', 'power transmission', 'mechanical power'],
    severityWeight: 4,
    isActive: true,
  },
];

function chunkText(rawText: string) {
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

function summarizeChunk(text: string) {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
  return firstSentence?.slice(0, 280) || null;
}

function extractHeading(text: string) {
  const firstLine = text.split('\n').find(Boolean)?.trim();
  if (!firstLine) return null;
  return firstLine.length <= 160 ? firstLine : null;
}

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

@Controller('maintenance')
export class MaintenanceSeedController {
  constructor(private readonly dataSource: DataSource) {}

  @Post('seed-safescope')
  async seedSafeScope(@Headers('x-maintenance-token') token: string, @Body() body: any) {
    if (process.env.ENABLE_MAINTENANCE_SEED !== 'true') {
      throw new NotFoundException();
    }

    if (!process.env.MAINTENANCE_SEED_TOKEN || token !== process.env.MAINTENANCE_SEED_TOKEN) {
      throw new UnauthorizedException('Invalid maintenance token');
    }

    if (body?.confirm !== 'seed-production-safescope') {
      throw new UnauthorizedException('Missing confirmation phrase');
    }

    await this.dataSource.query(`
      ALTER TABLE "standards_master"
      ADD COLUMN IF NOT EXISTS "source_key" varchar,
      ADD COLUMN IF NOT EXISTS "source_name" varchar,
      ADD COLUMN IF NOT EXISTS "source_type" varchar,
      ADD COLUMN IF NOT EXISTS "authority_tier" integer NOT NULL DEFAULT 3,
      ADD COLUMN IF NOT EXISTS "allowed_use" varchar NOT NULL DEFAULT 'reference',
      ADD COLUMN IF NOT EXISTS "requires_approval" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "approved_for_auto_ingestion" boolean NOT NULL DEFAULT true
    `);

    await this.dataSource.synchronize(false);

    const standardRepo = this.dataSource.getRepository(Standard);
    const documentRepo = this.dataSource.getRepository(SafeScopeKnowledgeDocument);
    const chunkRepo = this.dataSource.getRepository(SafeScopeKnowledgeChunk);

    let standardsSeeded = 0;

    for (const standard of standards) {
      const existing = await standardRepo.findOne({
        where: {
          agencyCode: standard.agencyCode,
          citation: standard.citation,
        },
      });

      if (existing) {
        Object.assign(existing, standard);
        await standardRepo.save(existing);
      } else {
        await standardRepo.save(standardRepo.create(standard));
      }

      standardsSeeded += 1;
    }

    let documentsSeeded = 0;
    let chunksSeeded = 0;

    for (const item of starterKnowledge) {
      const existing = await documentRepo.findOne({
        where: { citation: item.citation },
      });

      const documentToSave = existing || new SafeScopeKnowledgeDocument();
      Object.assign(documentToSave, item);

      const saved = await documentRepo.save(documentToSave);

      await chunkRepo.delete({ documentId: saved.id });

      const chunks = chunkText(saved.rawText).map((chunk, index) =>
        chunkRepo.create({
          documentId: saved.id,
          document: saved,
          chunkIndex: index,
          sectionHeading: extractHeading(chunk),
          chunkText: chunk,
          chunkSummary: summarizeChunk(chunk),
          citation: saved.citation,
          authorityTier: saved.authorityTier,
          hazardTags: saved.hazardTags || [],
          equipmentTags: saved.equipmentTags || [],
          taskTags: saved.taskTags || [],
          standardTags: saved.standardTags || [],
          lessonTags: saved.lessonTags || [],
          confidenceWeight: authorityWeight(saved.authorityTier),
        }),
      );

      const savedChunks = await chunkRepo.save(chunks);

      documentsSeeded += 1;
      chunksSeeded += savedChunks.length;
    }

    return {
      ok: true,
      standardsSeeded,
      documentsSeeded,
      chunksSeeded,
    };
  }
}
