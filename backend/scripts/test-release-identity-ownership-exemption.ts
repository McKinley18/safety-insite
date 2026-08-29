// Protected gate for THE OWNERSHIP EXEMPTION IN THE RELEASE-IDENTITY GUARD.
//
// THE DEFECT THIS ANSWERS.
//
// `assertManifestMatchesDefinition` (release-identity.ts) refuses to finalize a release
// identifier that no version-controlled definition registers — UNLESS the finalizer is running
// against a database carrying the KG-4C ownership marker. That exemption exists so governance
// harnesses can finalize synthetic fixture releases (`kg3a-release.A`,
// `federal-core-kg3f-contract.1`) over deliberately fabricated corpora, which is how the
// integrity and approval machinery is proven to refuse what it should.
//
// `test:release-identity-immutability` already asserts that exemption as a PURE FUNCTION, by
// passing `{ ownedDisposable: true }` directly. That proves the branch exists. It does not prove
// the thing that actually protects production: that the flag can only ever be TRUE because a
// suite wrote an ownership marker into a database it created, and can never be true for a
// database nobody claimed. A caller-supplied boolean asserted by the test is exactly the
// "claim by the caller, where the caller is the thing being guarded" shape KG-4C rejected.
//
// So this gate asserts the exemption END TO END, through the real finalizer, against real
// databases, in both states — and asserts that the production path cannot reach the exempt state
// at all.
//
// THE INVARIANT: the disposable-fixture exemption is conferred ONLY by an ownership marker a
// suite wrote into a database it created, it never extends to a REGISTERED release identity, and
// no production database can obtain it.
//
//   npm run test:release-identity-ownership-exemption
//
// Requires a local postgres and the KG-3F contract corpus (`SOURCE_DB`, default
// `test_kg3f_contract_20260820`) as a READ-ONLY pg_dump source. Every database this gate writes
// to it creates itself and drops on the way out.

import { execFileSync } from 'child_process';
import {
  DatabaseOwnershipRefused,
  claimDatabaseOwnership,
  inspectDatabaseOwnership,
} from './lib/test-database-ownership';
import { loadReleaseDefinition } from '../src/standards/releases/release-definition';

const HOST = process.env.DB_HOST || 'localhost';
const USER = process.env.DB_USERNAME || process.env.USER || 'postgres';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg3f_contract_20260820';

/** Every database this gate creates. Named for the gate so no other suite's corpus is reachable. */
const UNOWNED_DB = 'test_release_identity_exemption_unowned';
const OWNED_DB = 'test_release_identity_exemption_owned';

/** The synthetic fixture identity. Deliberately unregistered — no definitions/ file names it. */
const FIXTURE_RELEASE = 'federal-core-kg3f-contract.1';
/** A REGISTERED identity whose pin cannot possibly match a 34-record fixture corpus. */
const REGISTERED_RELEASE = 'federal-core-2026-07-30.1';

const SUITE = 'release-identity-ownership-exemption';

function guard(db: string): string {
  if (!/^test_[a-z0-9_]+$/i.test(db) || db === 'safescope') {
    throw new Error(`Refusing to touch database '${db}'.`);
  }
  return db;
}

function url(db: string): string {
  return `postgresql://${USER}@${HOST}/${db}`;
}

function dropIfExists(db: string): void {
  guard(db);
  try {
    execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', db], { stdio: 'pipe' });
  } catch { /* nothing to drop */ }
}

/**
 * Creates a disposable database and restores the read-only fixture corpus into it. Deliberately
 * does NOT claim ownership: whether the marker is present is the variable this gate manipulates.
 */
function provisionUnclaimed(db: string): string {
  guard(db); guard(SOURCE_DB);
  dropIfExists(db);
  execFileSync('createdb', ['-h', HOST, '-U', USER, db], { stdio: 'pipe' });
  execFileSync('/bin/sh', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${db}`],
    { stdio: 'pipe' });
  return url(db);
}

interface FinalizeOutcome { ok: boolean; output: string }

/**
 * Runs the REAL finalizer. `DATABASE_URL` is set explicitly because this repository's data source
 * honours it over the discrete `DB_*` variables, so an ambient `backend/.env` value would
 * otherwise redirect the run at the developer corpus.
 */
function finalize(databaseUrl: string, releaseId: string, version: string): FinalizeOutcome {
  try {
    const stdout = execFileSync('npx', ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        REGULATORY_RELEASE_ID: releaseId,
        REGULATORY_RELEASE_VERSION: version,
      },
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { ok: true, output: String(stdout) };
  } catch (error: any) {
    const combined = [error?.stdout, error?.stderr, error?.message]
      .map(part => (part == null ? '' : String(part))).join('\n');
    return { ok: false, output: combined };
  }
}

async function releaseRowCount(databaseUrl: string, releaseId: string): Promise<number> {
  const out = execFileSync('psql', ['-t', '-A', '-h', HOST, '-U', USER,
    new URL(databaseUrl).pathname.replace('/', ''),
    '-c', `SELECT COUNT(*) FROM regulatory_release_records WHERE "releaseId" = '${releaseId}'`],
    { stdio: 'pipe', encoding: 'utf8' });
  return Number(String(out).trim());
}

interface Check { name: string; run: () => Promise<void> }

function expect(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const checks: Check[] = [
  // ---------------------------------------------------------------- E: the production path
  {
    name: 'E1 a PROTECTED production database can never be claimed, whatever the caller asks for',
    run: async () => {
      let refusal: string | null = null;
      try {
        await claimDatabaseOwnership({
          suite: SUITE, databaseUrl: 'postgresql://u@localhost/safescope', initializeOwnership: true,
        });
      } catch (error) {
        expect(error instanceof DatabaseOwnershipRefused, `unexpected error: ${error}`);
        refusal = (error as DatabaseOwnershipRefused).refusal;
      }
      expect(refusal === 'PROTECTED_DATABASE',
        `claiming 'safescope' was refused as '${refusal}', expected PROTECTED_DATABASE`);
    },
  },
  {
    name: 'E2 a production-shaped name outside test_* can never be claimed, even with initializeOwnership',
    run: async () => {
      let refusal: string | null = null;
      try {
        await claimDatabaseOwnership({
          suite: SUITE, databaseUrl: 'postgresql://u@localhost/insite_production', initializeOwnership: true,
        });
      } catch (error) {
        expect(error instanceof DatabaseOwnershipRefused, `unexpected error: ${error}`);
        refusal = (error as DatabaseOwnershipRefused).refusal;
      }
      expect(refusal === 'NAME_NOT_DISPOSABLE',
        `claiming 'insite_production' was refused as '${refusal}', expected NAME_NOT_DISPOSABLE`);
    },
  },
  {
    name: 'E3 an UNMARKED database is refused and the refusal writes nothing (self-claim is impossible)',
    run: async () => {
      const databaseUrl = provisionUnclaimed(UNOWNED_DB);
      let refusal: string | null = null;
      try {
        // No `initializeOwnership`, and KG_TEST_DB_INITIALIZE_OWNERSHIP does not name this
        // database — the only two ways an unmarked database may be claimed.
        await claimDatabaseOwnership({ suite: SUITE, databaseUrl });
      } catch (error) {
        expect(error instanceof DatabaseOwnershipRefused, `unexpected error: ${error}`);
        refusal = (error as DatabaseOwnershipRefused).refusal;
      }
      expect(refusal === 'UNCLAIMED_DATABASE',
        `an unmarked database was refused as '${refusal}', expected UNCLAIMED_DATABASE`);
      const after = await inspectDatabaseOwnership(databaseUrl);
      expect(after.markerPresent === false,
        'the refused claim created an ownership marker — a refusal must perform zero writes');
    },
  },

  // ---------------------------------------------------------------- B: unowned cannot exempt
  {
    name: 'B  an UNOWNED disposable database cannot finalize an UNREGISTERED release id',
    run: async () => {
      const databaseUrl = url(UNOWNED_DB); // provisioned, still unmarked, by E3
      const before = await inspectDatabaseOwnership(databaseUrl);
      expect(before.markerPresent === false, 'precondition: the database must still be unmarked');

      const outcome = finalize(databaseUrl, FIXTURE_RELEASE, 'kg3f-contract.1');
      expect(!outcome.ok, 'finalizing an unregistered release id in an UNOWNED database succeeded');
      expect(outcome.output.includes('ownedDisposable=false'),
        `the finalizer did not report ownedDisposable=false:\n${outcome.output}`);
      expect(outcome.output.includes('no version-controlled release definition'),
        `refusal was not the release-identity guard:\n${outcome.output}`);
      expect(await releaseRowCount(databaseUrl, FIXTURE_RELEASE) === 0,
        'a refused finalization still wrote release records');
    },
  },

  // ---------------------------------------------------------------- A: owned fixture works
  {
    name: 'A  a database the suite CREATED and CLAIMED may finalize an UNREGISTERED fixture release',
    run: async () => {
      const databaseUrl = provisionUnclaimed(OWNED_DB);
      const claim = await claimDatabaseOwnership({
        suite: SUITE, databaseUrl, initializeOwnership: true,
      });
      expect(claim.freshlyClaimed, 'the gate did not freshly claim the database it just created');

      const outcome = finalize(databaseUrl, FIXTURE_RELEASE, 'kg3f-contract.1');
      expect(outcome.ok,
        `finalizing the fixture release in an OWNED disposable database was refused:\n${outcome.output}`);
      const count = await releaseRowCount(databaseUrl, FIXTURE_RELEASE);
      expect(count > 0, `the owned fixture finalization wrote ${count} release records`);
    },
  },

  // ------------------------------------------- C / D: ownership never excuses a REGISTERED id
  {
    name: 'C  a REGISTERED id whose computed manifest disagrees with its pin is refused IN THE '
      + 'OWNED disposable database',
    run: async () => {
      const databaseUrl = url(OWNED_DB); // owned, marker present, from check A
      const owner = await inspectDatabaseOwnership(databaseUrl);
      expect(owner.markerPresent && owner.ownerSuite === SUITE,
        'precondition: the database must be owned by this suite');

      // The KG-3F corpus already carries release rows under this identity at manifest
      // `6043d639…` — itself an artifact of the very defect the release-identity guard was built
      // to close, since that is not the manifest the definition pins. So the invariant here is
      // not "zero rows"; it is that the REFUSED run changes nothing it found.
      const definition = loadReleaseDefinition(REGISTERED_RELEASE);
      const before = await releaseRowCount(databaseUrl, REGISTERED_RELEASE);
      const outcome = finalize(databaseUrl, REGISTERED_RELEASE, '2026-07-30.1');
      expect(!outcome.ok,
        `a registered release identity was re-pointed at a different corpus:\n${outcome.output}`);
      expect(outcome.output.includes('ownedDisposable=true'),
        `precondition: the finalizer did not see the ownership marker:\n${outcome.output}`);
      expect(outcome.output.includes(definition.expectedManifestChecksum!),
        `the refusal did not name the pinned manifest:\n${outcome.output}`);
      expect(outcome.output.includes('names exactly one immutable manifest'),
        `refusal was not the release-identity immutability guard:\n${outcome.output}`);
      const after = await releaseRowCount(databaseUrl, REGISTERED_RELEASE);
      expect(after === before,
        `the refused registered-identity finalization changed ${REGISTERED_RELEASE} from `
        + `${before} to ${after} records`);
      const [stored] = execFileSync('psql', ['-t', '-A', '-h', HOST, '-U', USER, OWNED_DB, '-c',
        `SELECT "manifestChecksum" FROM regulatory_releases WHERE "releaseId" = '${REGISTERED_RELEASE}'`],
        { stdio: 'pipe', encoding: 'utf8' }).trim().split('\n');
      expect(stored !== definition.expectedManifestChecksum,
        'precondition: the corpus manifest must differ from the pin for this check to mean anything');
    },
  },
  {
    name: 'D  ownership does not permit MUTATING an already-finalized registered release under a '
      + 'mismatched manifest',
    run: async () => {
      // The fixture release is finalized in this database (check A). Re-finalizing the SAME id
      // after the corpus changes must refuse rather than rewrite it — ownership is not a licence
      // to mutate a frozen artifact, only to mint a fixture identity in the first place.
      const databaseUrl = url(OWNED_DB);
      const before = await releaseRowCount(databaseUrl, FIXTURE_RELEASE);
      expect(before > 0, 'precondition: the fixture release must already be finalized here');

      const dbName = new URL(databaseUrl).pathname.replace('/', '');
      execFileSync('psql', ['-q', '-h', HOST, '-U', USER, dbName, '-c',
        "DELETE FROM standards_master WHERE citation = (SELECT citation FROM standards_master ORDER BY citation LIMIT 1)"],
        { stdio: 'pipe' });

      const outcome = finalize(databaseUrl, FIXTURE_RELEASE, 'kg3f-contract.1');
      expect(!outcome.ok,
        `re-finalizing a frozen fixture release over a CHANGED corpus succeeded:\n${outcome.output}`);
      const after = await releaseRowCount(databaseUrl, FIXTURE_RELEASE);
      expect(after === before,
        `the refused re-finalization changed the frozen release from ${before} to ${after} records`);
    },
  },
];

async function main(): Promise<void> {
  console.log(`[gate] source corpus (read-only): ${SOURCE_DB}`);
  console.log(`[gate] databases created and dropped by this gate: ${UNOWNED_DB}, ${OWNED_DB}\n`);

  const failures: string[] = [];
  try {
    for (const check of checks) {
      try {
        await check.run();
        console.log(`  [PASS] ${check.name}`);
      } catch (error: any) {
        console.log(`  [FAIL] ${check.name}\n         ${error?.message || error}`);
        failures.push(`${check.name}: ${error?.message || error}`);
      }
    }
  } finally {
    dropIfExists(UNOWNED_DB);
    dropIfExists(OWNED_DB);
  }

  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`\n${failures.length} failure(s) across ${checks.length} checks`);
    process.exit(1);
  }
  console.log(`PASS release identity ownership exemption (${checks.length} checks)`);
}

main().catch(error => { console.error(error); process.exit(1); });
