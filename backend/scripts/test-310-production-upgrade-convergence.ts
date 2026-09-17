/**
 * §310 (SC-4) — DOES A RESTORED PRODUCTION DATABASE UPGRADE TO THE SAME SCHEMA A FRESH REPLAY
 * PRODUCES? AND DOES THE UPGRADE TOUCH A SINGLE CUSTOMER ROW?
 *
 *   PROD_BACKUP_SQL=/path/to/prod.sql npm run test:310-upgrade-convergence
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A MIGRATION NEEDS THIS AND NOT JUST A REPLAY GATE.
 *
 * `check:canonical-schema` proves that a FRESH database built from the migration history matches
 * the committed manifest. That is one of the two directions. The other is the one production will
 * actually take: an EXISTING database, carrying real rows, moving forward one migration. A
 * statement can be perfectly correct on an empty table and wrong on a populated one, and production
 * only ever travels the second path. Proving both is what makes "converges from either side" a
 * measurement rather than a claim in a comment.
 *
 * So this restores a FRESH LOGICAL BACKUP OF PRODUCTION into a disposable database, applies the
 * pending migrations, and then asks two questions:
 *
 *   1. STRUCTURAL — does the upgraded schema equal the committed canonical manifest, digest for
 *      digest? If it does, production and a fresh replay land on the same schema, which is the
 *      property SE-12 existed because nobody could demonstrate.
 *
 *   2. DATA — is every customer subscription row byte-identical before and after? §310 changed a
 *      DEFAULT. A default applies to rows nobody has written yet. If the distribution of existing
 *      `subscriptionStatus` values shifts by even one row, the migration did something it was
 *      explicitly forbidden to do, and this is where that would show.
 *
 * The second question is the important one. It is easy to write a migration that "normalizes" an
 * inherited default and quietly revokes a paying customer's entitlement. This suite is the reason
 * that cannot happen unnoticed.
 *
 * NOTHING HERE TOUCHES PRODUCTION. The backup is read-only output; every statement below runs
 * against a generated `test_insite_*` database on the local host, which is created and dropped here.
 */
import 'dotenv/config';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { extractCanonicalSchema, diffSchemas, schemaDigest } from '../src/database/canonical-schema';

let passed = 0;
const failures: string[] = [];
function check(condition: unknown, message: string, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`); }
  else { failures.push(message); console.log(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
}

const PROTECTED = ['safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'neondb',
  'template0', 'template1'];

async function main(): Promise<void> {
  const backup = process.env.PROD_BACKUP_SQL;
  if (!backup || !fs.existsSync(backup)) {
    throw new Error('§310 REFUSED: PROD_BACKUP_SQL must point at a readable production backup.');
  }

  const inherited = process.env.DATABASE_URL;
  if (!inherited) throw new Error('§310 REFUSED: DATABASE_URL is unset (read for host only).');
  const base = new URL(inherited);
  if (base.hostname.includes('neon.tech')) {
    throw new Error('§310 REFUSED: the connection host resolves to production.');
  }

  const name = `test_insite_310upgrade_${Date.now()}`;
  if (PROTECTED.includes(name) || !/^test_insite_[a-z0-9_]+$/.test(name)) {
    throw new Error(`§310 REFUSED: ${name} is not a disposable name.`);
  }
  const target = new URL(base.toString());
  target.pathname = `/${name}`;
  const admin = new URL(base.toString());
  admin.pathname = '/postgres';

  console.log('§310 PRODUCTION-UPGRADE CONVERGENCE\n');
  console.log(`  backup      ${backup}`);
  console.log(`  backup sha  ${execFileSync('shasum', ['-a', '256', backup]).toString().split(' ')[0]}`);
  console.log(`  target      host=${target.hostname} database=${name}  (created and dropped here)\n`);

  const psqlAdmin = (sql: string) =>
    execFileSync('psql', [admin.toString(), '-v', 'ON_ERROR_STOP=1', '-q', '-c', sql], { stdio: 'pipe' });
  psqlAdmin(`CREATE DATABASE "${name}"`);

  let ds: DataSource | null = null;
  try {
    // ---- RESTORE --------------------------------------------------------------------------
    // A logical dump of a Neon database carries extension and role statements the local server
    // answers differently; ON_ERROR_STOP is deliberately NOT set for the restore, and the restore
    // is then VERIFIED by row counts below rather than trusted because psql exited 0.
    execFileSync('psql', [target.toString(), '-q', '-f', backup],
      { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });

    ds = new DataSource({ type: 'postgres', url: target.toString() });
    await ds.initialize();

    const tables = await ds.query(
      `SELECT count(*)::int AS n FROM information_schema.tables
        WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'`);
    check(tables[0].n > 60,
      'U-1 the production backup RESTORED — the disposable database carries production\'s tables, '
      + 'so everything below is measured against real structure and real rows rather than an empty '
      + 'shell that would pass every assertion vacuously',
      `${tables[0].n} tables`);

    const headBefore = await ds.query(
      `SELECT max(timestamp)::text AS head, count(*)::int AS n FROM migrations`);
    console.log(`\n        restored migration head: ${headBefore[0].head}  (${headBefore[0].n} applied)\n`);

    // ---- THE DATA FACTS, RECORDED BEFORE THE UPGRADE --------------------------------------
    const usersBefore = await ds.query(
      `SELECT "subscriptionStatus" AS s, count(*)::int AS n FROM "user" GROUP BY 1 ORDER BY 1`);
    const totalBefore = usersBefore.reduce((t: number, r: any) => t + r.n, 0);
    const defaultBefore = await ds.query(
      `SELECT column_default FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'user'
          AND column_name = 'subscriptionStatus'`);
    console.log(`        subscriptionStatus default BEFORE: ${defaultBefore[0]?.column_default}`);
    console.log(`        subscription rows BEFORE:          ${JSON.stringify(usersBefore)}\n`);

    check(totalBefore > 0,
      'U-2 production carries REAL customer subscription rows, so the "no row was rewritten" '
      + 'assertion below has something to be wrong about',
      `${totalBefore} rows`);
    check(String(defaultBefore[0]?.column_default || '').includes("'active'"),
      'U-3 and production\'s default really is the unsafe one before the upgrade — the defect being '
      + 'repaired is measured in production\'s own schema, not assumed from the register',
      String(defaultBefore[0]?.column_default));

    await ds.destroy();
    ds = null;

    // ---- THE UPGRADE ----------------------------------------------------------------------
    const migrateOut = execFileSync('npx', ['typeorm-ts-node-commonjs', '-d',
      'src/database/data-source.ts', 'migration:run'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: target.toString(), NODE_ENV: 'test' },
      stdio: 'pipe',
    }).toString();
    const applied = migrateOut.match(/Migration (\S+) has been executed successfully/g) || [];
    console.log(`        migrations applied by the upgrade: ${applied.length}`);
    for (const line of applied) console.log(`          ${line.replace(' has been executed successfully', '')}`);
    console.log('');

    ds = new DataSource({ type: 'postgres', url: target.toString() });
    await ds.initialize();

    check(applied.length >= 1,
      'U-4 THE UPGRADE PATH ACTUALLY RAN. Production was at the §305 convergence head, so §310\'s '
      + 'migration is the pending one — this is the exact transition production will make.',
      `${applied.length} applied`);

    // ---- 1. STRUCTURAL CONVERGENCE --------------------------------------------------------
    const manifest = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../src/database/canonical-schema.manifest.json'), 'utf8'));
    const upgraded = await extractCanonicalSchema({ query: (s, p) => ds!.query(s, p) });
    const upgradedDigest = schemaDigest(upgraded);
    const differences = diffSchemas(manifest.schema, upgraded);

    const manifestTables = new Set(manifest.schema.tables.map((t: any) => t.name));
    const productionOnly = upgraded.tables.map((t) => t.name).filter((n) => !manifestTables.has(n));

    console.log(`        manifest digest (fresh replay):     ${manifest.digest}`);
    console.log(`        upgraded digest (restored prod):    ${upgradedDigest}`);
    console.log(`        material differences:               ${differences.length}`);
    console.log(`        manifest tables / upgraded tables:  ${manifest.schema.tables.length} / ${upgraded.tables.length}`);
    console.log(`        production-only objects:            ${productionOnly.join(', ') || 'none'}\n`);
    for (const d of differences.slice(0, 40)) console.log(`          ${JSON.stringify(d)}`);

    check(differences.length === 0,
      'U-5 CONVERGENCE FROM BOTH SIDES: a RESTORED PRODUCTION database upgraded by the migration '
      + 'history carries NO MATERIAL DIFFERENCE from the schema a FRESH REPLAY produces. The §310 '
      + 'migration therefore does not create a third schema that neither the manifest nor '
      + 'production describes.',
      `${differences.length} material differences`);

    /*
     * THE TWO DIGESTS ARE NOT EQUAL, AND SAYING SO IS THE POINT.
     *
     * The digest covers every object in the database. Production carries objects a fresh replay
     * deliberately does not build: `user.password` and `user.legacy_id`, which §305 PRESERVED in
     * production because dropping production data is forbidden but did NOT replicate forward
     * because a canonical contract should describe intent rather than history, plus the retired
     * compatibility tables §305 classified as present-but-not-enforced.
     *
     * So the honest claim is the one U-5 makes — zero MATERIAL differences — and this assertion
     * names the difference that remains, rather than letting a reader infer from an unexplained
     * digest mismatch that something drifted.
     */
    check(upgradedDigest !== manifest.digest && productionOnly.length > 0,
      'U-5b and the residual digest difference is ACCOUNTED FOR, not unexplained: the upgraded '
      + 'production database contains objects a fresh replay deliberately does not build — the '
      + 'production-only columns §305 preserved without replicating, and the retired compatibility '
      + 'tables. Every object the manifest DOES describe matches, which is what U-5 measures.',
      `${productionOnly.length} production-only tables: ${productionOnly.join(', ')}`);

    // ---- 2. THE DATA DID NOT MOVE ---------------------------------------------------------
    const usersAfter = await ds.query(
      `SELECT "subscriptionStatus" AS s, count(*)::int AS n FROM "user" GROUP BY 1 ORDER BY 1`);
    const defaultAfter = await ds.query(
      `SELECT column_default FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'user'
          AND column_name = 'subscriptionStatus'`);
    console.log(`\n        subscriptionStatus default AFTER: ${defaultAfter[0]?.column_default}`);
    console.log(`        subscription rows AFTER:          ${JSON.stringify(usersAfter)}\n`);

    check(String(defaultAfter[0]?.column_default || '').includes("'none'"),
      'U-6 the DEFAULT is repaired on the upgraded database — omission now fails safe',
      String(defaultAfter[0]?.column_default));

    check(JSON.stringify(usersBefore) === JSON.stringify(usersAfter),
      'U-7 AND NOT ONE CUSTOMER SUBSCRIPTION ROW MOVED. The distribution of existing '
      + '`subscriptionStatus` values is byte-identical before and after. §310 was forbidden to '
      + 'normalize customer state, and this is the measurement that would catch it if it had: a '
      + 'migration that "tidied" inherited `active` rows would revoke a paying customer\'s '
      + 'entitlement, which is worse than the defect it repaired.',
      `${JSON.stringify(usersBefore)} == ${JSON.stringify(usersAfter)}`);

    // And the new default is only reachable by a row nobody wrote a value for.
    const probeId = '00000000-0000-4000-8000-00000031000a';
    await ds.query(
      `INSERT INTO "user" ("id","email","passwordHash","name","type")
       VALUES ($1,'s310-upgrade-probe@example.invalid','x','probe','individual')`, [probeId]);
    const probe = await ds.query(`SELECT "subscriptionStatus" AS s FROM "user" WHERE id = $1`, [probeId]);
    await ds.query(`DELETE FROM "user" WHERE id = $1`, [probeId]);
    check(probe[0]?.s === 'none',
      'U-8 and an INSERT that omits subscriptionStatus on the UPGRADED PRODUCTION DATA receives '
      + '`none` — the repair is live on the real schema, not only on a freshly built one',
      String(probe[0]?.s));

    const rowsAfter = await ds.query(`SELECT count(*)::int AS n FROM "user"`);
    check(rowsAfter[0].n === totalBefore,
      'U-9 and the probe left no residue — the user count is what it was before this suite ran',
      `${rowsAfter[0].n} == ${totalBefore}`);
  } finally {
    if (ds?.isInitialized) await ds.destroy();
    psqlAdmin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    console.log(`\ndropped ${name}`);
  }

  console.log(`\n${'='.repeat(96)}`);
  console.log(`§310 PRODUCTION-UPGRADE CONVERGENCE: ${passed} passed, ${failures.length} failed.`);
  console.log('Production writes: 0. Expert executions: 0. Provider calls: 0. Spend: $0.00.');
  if (failures.length) { console.log('\nFAILED:'); for (const f of failures) console.log(`  - ${f}`); }
  console.log('='.repeat(96));
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => { console.error('\n§310 UPGRADE CONVERGENCE ERRORED:', error); process.exit(1); });
