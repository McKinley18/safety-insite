import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard, AgencyCode, StandardScope } from '../entities/standard.entity';
import { STANDARDS_INTELLIGENCE_SEED } from '../../safescope-v2/standards-intelligence/standards-intelligence.seed';

type AnyRecord = Record<string, any>;

const databaseUrl = process.env.DATABASE_URL;
const dryRun = !process.argv.includes('--apply');

const ds = new DataSource({
  type: 'postgres',
  url: databaseUrl || undefined,
  host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: databaseUrl ? undefined : process.env.DB_USERNAME || 'user',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || 'password',
  database: databaseUrl ? undefined : process.env.DB_NAME || 'safescope',
  entities: [Standard],
  synchronize: false,
});

function normalizeAgency(agency: string): AgencyCode | null {
  const normalized = String(agency || '').toUpperCase();
  if (normalized.includes('MSHA')) return 'MSHA' as AgencyCode;
  if (normalized.includes('OSHA')) return 'OSHA' as AgencyCode;
  return null;
}

function normalizeScope(scope: string | undefined, citation: string): StandardScope {
  const text = `${scope || ''} ${citation || ''}`.toLowerCase();

  if (text.includes('1926')) return 'construction' as StandardScope;
  if (text.includes('1910')) return 'general_industry' as StandardScope;

  if (
    text.includes('msha') ||
    text.includes('mining') ||
    text.includes('30 cfr') ||
    /\b(?:56|57|75|77)\./.test(text)
  ) {
    return 'mining' as StandardScope;
  }

  return (scope || 'general') as StandardScope;
}

function normalizePart(part: string | undefined, citation: string): string | undefined {
  if (part) return String(part);

  const match = String(citation || '').match(/\b(1910|1926|1904|56|57|75|77)\b/);
  return match?.[1];
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function severityWeight(record: AnyRecord): number {
  const severity = String(record.severityDefault || '').toLowerCase();

  if (severity === 'critical') return 5;
  if (severity === 'high') return 4;
  if (severity === 'medium') return 3;
  return 2;
}

function standardText(record: AnyRecord): string {
  return (
    record.plainLanguageSummary ||
    record.title ||
    `Standard intelligence metadata for ${record.citation}`
  );
}

function toPayload(record: AnyRecord): Partial<Standard> | null {
  const agencyCode = normalizeAgency(record.agency);
  const citation = String(record.citation || '').trim();

  if (!agencyCode || !citation) return null;

  const hazardCodes = dedupe([
    ...asArray(record.hazardFamilies),
    ...asArray(record.crossDomainLinks),
  ]);

  const keywords = dedupe([
    ...asArray(record.searchBoostTerms),
    ...asArray(record.equipmentTags),
    ...asArray(record.taskTags),
    ...asArray(record.exposureTags),
    ...asArray(record.controlTags),
    ...asArray(record.consequenceTags),
  ]);

  const requiredControls = dedupe([
    ...asArray(record.controlTags),
  ]);

  return {
    agencyCode,
    citation,
    partNumber: normalizePart(record.part, citation),
    subpart: record.subpart || null,
    title: record.title || citation,
    standardText: standardText(record),
    plainLanguageSummary: record.plainLanguageSummary || record.title || citation,
    scopeCode: normalizeScope(record.scope, citation),

    sourceKey: record.sourceKey || null,
    sourceName: record.sourceName || null,
    sourceType: record.sourceType || null,
    authorityTier: Number(record.authorityTier || 1),
    allowedUse: record.allowedUse || null,
    requiresApproval: Boolean(record.requiresApproval || false),
    approvedForAutoIngestion: Boolean(record.approvedForAutoIngestion ?? true),

    hazardCodes,
    requiredControls,
    keywords,
    severityWeight: severityWeight(record),
    isActive: true,
  };
}

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(Standard);

  const unique = new Map<string, AnyRecord>();

  for (const record of STANDARDS_INTELLIGENCE_SEED as AnyRecord[]) {
    const agencyCode = normalizeAgency(record.agency);
    const citation = String(record.citation || '').trim();

    if (!agencyCode || !citation) continue;

    const key = `${agencyCode}::${citation.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, record);
  }

  const planned = {
    seedRecords: (STANDARDS_INTELLIGENCE_SEED as AnyRecord[]).length,
    uniqueStandards: unique.size,
    insert: 0,
    update: 0,
    skipped: 0,
  };

  const byAgency = new Map<string, number>();

  for (const record of unique.values()) {
    const payload = toPayload(record);
    if (!payload?.agencyCode || !payload?.citation) {
      planned.skipped++;
      continue;
    }

    const agencyKey = String(payload.agencyCode);
    byAgency.set(agencyKey, (byAgency.get(agencyKey) || 0) + 1);

    const existing = await repo.findOne({
      where: {
        agencyCode: payload.agencyCode,
        citation: payload.citation,
      } as any,
    });

    if (existing) planned.update++;
    else planned.insert++;
  }

  console.log('==================================================');
  console.log('Standards Intelligence → standards_master Sync');
  console.log('==================================================');
  console.log(dryRun ? 'Mode: DRY RUN, no DB writes' : 'Mode: APPLY, DB writes enabled');
  console.table([planned]);
  console.table([...byAgency.entries()].map(([agency, count]) => ({ agency, count })));

  if (dryRun) {
    console.log('Dry run complete. Re-run with --apply to write changes.');
    await ds.destroy();
    return;
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const record of unique.values()) {
    const payload = toPayload(record);

    if (!payload?.agencyCode || !payload?.citation) {
      skipped++;
      continue;
    }

    const existing = await repo.findOne({
      where: {
        agencyCode: payload.agencyCode,
        citation: payload.citation,
      } as any,
    });

    if (existing) {
      Object.assign(existing, payload);
      await repo.save(existing);
      updated++;
    } else {
      await repo.save(repo.create(payload));
      inserted++;
    }
  }

  const counts = await repo
    .createQueryBuilder('s')
    .select('s.agencyCode', 'agency')
    .addSelect('COUNT(*)::int', 'count')
    .groupBy('s.agencyCode')
    .orderBy('count', 'DESC')
    .getRawMany();

  console.log('Applied standards intelligence sync.');
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.table(counts);

  await ds.destroy();
}

run().catch(async (error) => {
  console.error(error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
