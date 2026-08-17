import 'dotenv/config';
import { createHash } from 'crypto';
import { dataSource } from '../src/database/data-source';
import { LegacyReportQuarantine } from '../src/reports/entities/legacy-report-quarantine.entity';

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function main() {
  const apply = process.argv.includes('--apply');
  await dataSource.initialize();
  const exists = await dataSource.query(`SELECT to_regclass('public.reports') AS table_name`);
  const rows = exists[0]?.table_name ? await dataSource.query(`SELECT * FROM "reports" ORDER BY "id"`) : [];
  const classifications = rows.map((row: any) => {
    const path = row.frontendReportJson?.pdfPath || row.frontendReportJson?.url || row.filePath || row.url;
    const ambiguousOwnership = !row.organizationId;
    const classification = ambiguousOwnership ? 'ownership_ambiguous'
      : path ? 'unsafe_path_reference' : 'missing_artifact';
    const reason = ambiguousOwnership
      ? 'Legacy report has no defensible canonical owner or organization scope.'
      : path ? 'Legacy report references a path or URL that is not an authorized storage object.'
        : 'Legacy report has no durable artifact.';
    return {
      sourceTable: 'reports', sourceId: String(row.id), classification, reason,
      sourcePayloadSha256: createHash('sha256').update(stable(row)).digest('hex'),
      metadata: { organizationId: row.organizationId || null, hasUnsafePath: !!path },
    };
  });
  if (apply) {
    await dataSource.transaction(async manager => {
      const repository = manager.getRepository(LegacyReportQuarantine);
      for (const item of classifications) {
        const existing = await repository.findOne({ where: { sourceTable: item.sourceTable, sourceId: item.sourceId } });
        if (!existing) await repository.save(repository.create(item));
      }
    });
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', sourceCount: rows.length, classifications }, null, 2));
  await dataSource.destroy();
}
main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
