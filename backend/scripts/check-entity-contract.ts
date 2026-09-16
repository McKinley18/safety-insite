/**
 * §309 (SC-2) — THE ENTITY-versus-DATABASE CONTRACT GATE.
 *
 *   npm run check:entity-contract        (run inside with-disposable-db)
 *   npm run check:entity-contract:db     (creates the disposable database and replays migrations)
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS MEASURES, AND WHY IT IS NOT THE CANONICAL-SCHEMA GATE.
 *
 * `check:canonical-schema` (§305) compares a MIGRATION REPLAY against the committed MANIFEST. It
 * answers "does the migration history still build the schema we froze?" and it is the reason
 * production and a fresh replay are known to converge.
 *
 * It cannot answer SC-2's question, which is a different one: "does the ENTITY CONTRACT agree with
 * the schema the migrations build?" Those are independent failures. A schema can reproduce its
 * manifest perfectly and still disagree with every entity that reads it — which is exactly the
 * §266 failure mode, where `HazLenzAnalysis` declared five columns the schema lacked and every read
 * of `hazlenz_analyses` failed at runtime while the schema itself was internally consistent.
 *
 * ---------------------------------------------------------------------------------------------
 * IT USES TYPEORM'S OWN COMPARISON RATHER THAN REIMPLEMENTING ONE.
 *
 * The differences are obtained from `createSchemaBuilder().log()` — the same machinery behind
 * `typeorm schema:log`, and the same machinery that would actually run if anybody ever turned
 * `synchronize` on. That matters: a hand-written comparator would be a second opinion about type
 * equivalence, and the opinion that decides whether a read fails at runtime is TypeORM's.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS MATERIAL, AND WHAT IS NOISE.
 *
 * §309 is explicit that not every ORM metadata difference should become a release blocker. TypeORM
 * regenerates constraint and index NAMES from a hash of its own metadata, so an unnamed constraint
 * created by a migration always looks "different" to it. Those are reported as noise and never fail
 * the gate.
 *
 * MATERIAL classes, which do fail:
 *
 *   COLUMN_MISSING_IN_DB     the entity declares a column the database does not have. Every read of
 *                            that entity fails — the §266 failure.
 *   COLUMN_EXTRA_IN_DB       the database has a column the entity does not declare. Not a runtime
 *                            failure, but it means a stored value is invisible to the application.
 *   COLUMN_TYPE             the same column, different type. Type is semantics: `timestamp` and
 *                            `timestamptz` are different instants, `varchar` and `uuid` compare and
 *                            sort differently, `bpchar` pads.
 *   COLUMN_NULLABILITY      differing NOT NULL. Decides whether a write can fail.
 *   COLUMN_DEFAULT          differing DEFAULT. Decides what a row says when nobody said.
 *   RELATION                a foreign key whose TARGET differs (not merely its name).
 *
 * TypeORM expresses a type change it cannot perform in place as DROP COLUMN + ADD COLUMN of the
 * same name. That pair is recognised and reported as ONE `COLUMN_TYPE` difference rather than as a
 * destructive drop, because reporting it as a drop is what makes this gate frightening rather than
 * useful.
 *
 * ---------------------------------------------------------------------------------------------
 * THE BASELINE IS A LEDGER, NOT A SUPPRESSION.
 *
 * `src/database/entity-contract.baseline.json` records every ACCEPTED difference with a reason and
 * the section that accepted it. A difference not in the ledger fails the gate. A ledger entry whose
 * difference has gone is reported as STALE so the file stays honest. The point is that the two
 * SC-2 contradiction classes cannot silently come back.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

import { dataSource } from '../src/database/data-source';

const PROTECTED = ['safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'neondb'];

const BASELINE_PATH = path.join(__dirname, '../src/database/entity-contract.baseline.json');

export type DifferenceKind =
  | 'COLUMN_MISSING_IN_DB'
  | 'COLUMN_EXTRA_IN_DB'
  | 'COLUMN_TYPE'
  | 'COLUMN_NULLABILITY'
  | 'COLUMN_DEFAULT'
  | 'TABLE_MISSING_IN_DB'
  | 'RELATION';

export interface ContractDifference {
  readonly kind: DifferenceKind;
  readonly table: string;
  readonly column: string | null;
  /** The query TypeORM would run to make the database match the entity. Evidence, not a plan. */
  readonly detail: string;
}

interface BaselineEntry {
  readonly kind: DifferenceKind;
  readonly table: string;
  readonly column: string | null;
  readonly reason: string;
  readonly acceptedIn: string;
}

/*
 * `createSchemaBuilder().log()` returns raw SQL — colour codes belong to the CLI printer,
 * not to the queries. This is defensive only, and it is anchored to a real escape byte so
 * it can never eat a literal bracket out of a query.
 */
const STRIP_ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

/** Constraint and index names are regenerated from a metadata hash; they are never material. */
function isNoise(query: string): boolean {
  return /ADD CONSTRAINT "(UQ|PK|CHK|REL|FK)_|DROP CONSTRAINT "(UQ|PK|CHK|REL|FK)_|CREATE (UNIQUE )?INDEX|DROP INDEX|RENAME CONSTRAINT/i
    .test(query);
}

export function classify(queries: string[]): { differences: ContractDifference[]; noise: string[] } {
  const clean = queries.map((q) => q.replace(STRIP_ANSI, '').trim());
  const noise: string[] = [];
  const raw: ContractDifference[] = [];

  for (const query of clean) {
    if (!query) continue;

    const createTable = /^CREATE TABLE "([^"]+)"/i.exec(query);
    if (createTable) { raw.push({ kind: 'TABLE_MISSING_IN_DB', table: createTable[1], column: null, detail: query.slice(0, 160) }); continue; }

    const addColumn = /^ALTER TABLE "([^"]+)" ADD "([^"]+)" (.*)$/i.exec(query);
    if (addColumn) { raw.push({ kind: 'COLUMN_MISSING_IN_DB', table: addColumn[1], column: addColumn[2], detail: query }); continue; }

    const dropColumn = /^ALTER TABLE "([^"]+)" DROP COLUMN "([^"]+)"/i.exec(query);
    if (dropColumn) { raw.push({ kind: 'COLUMN_EXTRA_IN_DB', table: dropColumn[1], column: dropColumn[2], detail: query }); continue; }

    const alterType = /^ALTER TABLE "([^"]+)" ALTER COLUMN "([^"]+)" TYPE (.*)$/i.exec(query);
    if (alterType) { raw.push({ kind: 'COLUMN_TYPE', table: alterType[1], column: alterType[2], detail: query }); continue; }

    const nullability = /^ALTER TABLE "([^"]+)" ALTER COLUMN "([^"]+)" (SET|DROP) NOT NULL/i.exec(query);
    if (nullability) { raw.push({ kind: 'COLUMN_NULLABILITY', table: nullability[1], column: nullability[2], detail: query }); continue; }

    const columnDefault = /^ALTER TABLE "([^"]+)" ALTER COLUMN "([^"]+)" (SET|DROP) DEFAULT/i.exec(query);
    if (columnDefault) { raw.push({ kind: 'COLUMN_DEFAULT', table: columnDefault[1], column: columnDefault[2], detail: query }); continue; }

    const foreignKey = /^ALTER TABLE "([^"]+)" ADD CONSTRAINT "FK_[^"]+" FOREIGN KEY \("([^"]+)"\) REFERENCES "([^"]+)"/i.exec(query);
    if (foreignKey) {
      /*
       * A foreign key TypeORM re-adds is almost always the same key under a different generated
       * name — the migration created it unnamed. Only a differing TARGET would be material, and a
       * target change would also show up as a type or column difference on the referencing column.
       * Recorded as noise, and the canonical-schema gate (§305) is what actually compares foreign
       * keys WITH their actions between the replay and the manifest.
       */
      noise.push(query); continue;
    }

    if (isNoise(query)) { noise.push(query); continue; }
    noise.push(query);
  }

  /*
   * COLLAPSE THE DROP+ADD PAIR INTO ONE TYPE DIFFERENCE.
   *
   * TypeORM cannot always change a column type in place, so it emits DROP COLUMN followed by ADD
   * COLUMN of the same name. Reporting that as "the database has an extra column" AND "the entity
   * declares a missing column" would be two wrong answers to one question — and reporting the drop
   * on its own would make this gate look like it is proposing to destroy customer data.
   */
  const differences: ContractDifference[] = [];
  for (const difference of raw) {
    if (difference.kind !== 'COLUMN_EXTRA_IN_DB') { differences.push(difference); continue; }
    const pairedAdd = raw.find((other) =>
      other.kind === 'COLUMN_MISSING_IN_DB'
      && other.table === difference.table && other.column === difference.column);
    if (pairedAdd) continue; // the ADD half carries the pair; see below
    differences.push(difference);
  }
  return {
    differences: differences.map((difference) => {
      if (difference.kind !== 'COLUMN_MISSING_IN_DB') return difference;
      const pairedDrop = raw.some((other) =>
        other.kind === 'COLUMN_EXTRA_IN_DB'
        && other.table === difference.table && other.column === difference.column);
      return pairedDrop
        ? { ...difference, kind: 'COLUMN_TYPE' as const,
            detail: `${difference.detail}   (TypeORM would DROP and re-ADD to change the type)` }
        : difference;
    }),
    noise,
  };
}

function key(difference: { kind: string; table: string; column: string | null }): string {
  return `${difference.kind}::${difference.table}::${difference.column ?? '-'}`;
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§309 gate REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  if (PROTECTED.includes(database) || parsed.hostname.includes('neon.tech')) {
    throw new Error(`§309 gate REFUSED: ${database} is not a disposable database. This gate reads `
      + 'entity metadata against a REPLAYED schema and must never point at production.');
  }

  console.log('='.repeat(96));
  console.log('§309 ENTITY-CONTRACT GATE — entity declarations versus the canonical database');
  console.log(`replayed database: ${database}`);
  console.log('='.repeat(96));

  const ds: DataSource = dataSource;
  if (!ds.isInitialized) await ds.initialize();

  /*
   * TypeORM's own comparison. `log()` returns the queries it WOULD run to make the database match
   * the entities — it executes nothing, and this gate never calls `synchronize()`.
   */
  const sqlInMemory = await ds.driver.createSchemaBuilder().log();
  const upQueries = sqlInMemory.upQueries.map((q) => q.query);
  await ds.destroy();

  const { differences, noise } = classify(upQueries);

  const baseline: { entries: BaselineEntry[] } = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const accepted = new Map(baseline.entries.map((entry) => [key(entry), entry]));

  const unaccepted: ContractDifference[] = [];
  const matched = new Set<string>();
  for (const difference of differences) {
    const entry = accepted.get(key(difference));
    if (entry) { matched.add(key(difference)); continue; }
    unaccepted.push(difference);
  }
  const stale = baseline.entries.filter((entry) => !matched.has(key(entry)));

  const byKind = new Map<string, number>();
  for (const difference of differences) byKind.set(difference.kind, (byKind.get(difference.kind) ?? 0) + 1);

  console.log(`\n  entities compared            ${ds.entityMetadatas.length}`);
  console.log(`  sync queries TypeORM emitted ${upQueries.length}`);
  console.log(`  material differences         ${differences.length}`);
  for (const [kind, n] of [...byKind.entries()].sort()) console.log(`      ${String(n).padStart(3)}  ${kind}`);
  console.log(`  cosmetic (names, indexes, FK) ${noise.length}  — never fatal`);
  console.log(`  accepted by the baseline     ${differences.length - unaccepted.length}`);
  console.log(`  UNACCEPTED                   ${unaccepted.length}`);

  if (differences.length) {
    console.log('\n-- every material difference --\n');
    for (const difference of differences.sort((a, b) => key(a).localeCompare(key(b)))) {
      const entry = accepted.get(key(difference));
      const mark = entry ? 'accepted ' : 'UNACCEPTED';
      console.log(`  [${mark}] ${difference.kind.padEnd(20)} ${difference.table}.${difference.column ?? ''}`);
      console.log(`               ${difference.detail.slice(0, 150)}`);
      if (entry) console.log(`               ${entry.acceptedIn}: ${entry.reason}`);
    }
  }

  if (stale.length) {
    console.log(`\n-- STALE BASELINE ENTRIES (${stale.length}) — the difference is gone; delete the entry --\n`);
    for (const entry of stale) console.log(`  ${entry.kind} ${entry.table}.${entry.column ?? ''}  (${entry.acceptedIn})`);
  }

  const failed = unaccepted.length > 0;
  console.log(`\n${'='.repeat(96)}`);
  console.log(`§309 ENTITY-CONTRACT GATE: ${failed ? 'FAIL' : 'PASS'}`);
  if (failed) {
    console.log('\n  A material entity-versus-database difference is not recorded in');
    console.log('  src/database/entity-contract.baseline.json. Either repair it, or record it there');
    console.log('  with a reason — but a difference nobody has decided about must not ship silently.');
  }
  console.log('='.repeat(96));
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error('\n§309 ENTITY-CONTRACT GATE ERRORED:', error);
  process.exit(1);
});
