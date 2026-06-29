import * as process from 'process';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

type Check = {
  name: string;
  passed: boolean;
  detail?: string;
};

async function tableExists(dataSource: DataSource, tableName: string) {
  const result = await dataSource.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName],
  );

  return Boolean(result?.[0]?.exists);
}

async function rowCount(dataSource: DataSource, tableName: string) {
  const result = await dataSource.query(`SELECT COUNT(*)::int AS count FROM "${tableName}"`);
  return Number(result?.[0]?.count || 0);
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const dataSource = app.get(DataSource);
  const checks: Check[] = [];

  const documentsExists = await tableExists(dataSource, 'safescope_knowledge_documents');
  const chunksExists = await tableExists(dataSource, 'safescope_knowledge_chunks');

  checks.push({
    name: 'safescope_knowledge_documents table exists',
    passed: documentsExists,
  });

  checks.push({
    name: 'safescope_knowledge_chunks table exists',
    passed: chunksExists,
  });

  if (documentsExists) {
    const count = await rowCount(dataSource, 'safescope_knowledge_documents');
    checks.push({
      name: 'safescope_knowledge_documents has rows',
      passed: count > 0,
      detail: `count=${count}`,
    });
  }

  if (chunksExists) {
    const count = await rowCount(dataSource, 'safescope_knowledge_chunks');
    checks.push({
      name: 'safescope_knowledge_chunks has rows',
      passed: count > 0,
      detail: `count=${count}`,
    });
  }

  console.log('\nHazLenz knowledge source readiness\n');

  for (const check of checks) {
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}${check.detail ? ` (${check.detail})` : ''}`);
  }

  await app.close();

  const failed = checks.filter((check) => !check.passed);

  if (failed.length) {
    console.error(`\n${failed.length} HazLenz knowledge source readiness check(s) failed.`);
    console.error('HazLenz fallback reasoning may still work, but standards/source-backed retrieval is not production-complete.');
    process.exit(1);
  }

  console.log('\nHazLenz knowledge source readiness checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
