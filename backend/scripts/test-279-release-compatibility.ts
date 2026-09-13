/**
 * §279 — THE RELEASE COMPATIBILITY RULE. A RELEASE GATE.
 *
 * ==================== WHAT THIS EXISTS TO PREVENT ====================
 *
 * Two opposite failures, and the rule has to avoid BOTH:
 *
 *   1. A tab running a bundle from three releases ago goes on writing safety-critical records
 *      against a server that no longer means the same thing by them. §279 Part A measured that
 *      this was possible indefinitely, because nothing in the product ever asked.
 *
 *   2. An inspector standing in a plant on a marginal connection is told the application is
 *      obsolete because a version request timed out, and stops recording a hazard.
 *
 * The second is the more dangerous one, which is why every case below that produces no evidence
 * must resolve to UNKNOWN and block nothing. A gate that only tested (1) would be passed by a
 * rule that simply refused everything.
 *
 * The lettered cases are the §279 update-delivery test plan. NO NETWORK, NO DATABASE, NO BROWSER:
 * the rule is a pure function, so it is proven against literal fixtures.
 *
 * Run: npm run test:279-release-compatibility
 */
import {
  type ReleaseContract,
  compatibilityNotice,
  parseVersion,
  resolveClientCompatibility,
} from '../src/common/release-contract';
import { getReleaseContract, MINIMUM_SUPPORTED_FRONTEND_VERSION, SHIPPED_FRONTEND_VERSION }
  from '../src/common/release-identity';

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

/** A server that ships frontend 1.4.0 and still supports anything from 1.2.0 up. */
function server(overrides: Partial<ReleaseContract> = {}): ReleaseContract {
  return {
    releaseVersion: '1.4.0',
    gitSha: 'a'.repeat(40),
    buildTimestamp: '2026-09-13T12:00:00.000Z',
    backendVersion: '1.4.0',
    frontendVersion: '1.4.0',
    minimumSupportedFrontendVersion: '1.2.0',
    schemaCompatibilityVersion: '1800000021000',
    versionSourceStatus: 'RENDER_GIT_COMMIT',
    buildTimestampSourceStatus: 'BUILD_TIMESTAMP',
    ...overrides,
  };
}

console.log('\n§279 — RELEASE COMPATIBILITY\n');

// =========================================================================================
// A. CURRENT FRONTEND / CURRENT BACKEND -> NORMAL.
// =========================================================================================
{
  const r = resolveClientCompatibility('1.4.0', server());
  ok('A1 a client on the shipped version is CURRENT', r.state === 'CURRENT', r.state);
  ok('A2 and nothing is blocked', !r.blocksSafetyCriticalWrites);
  ok('A3 and it is shown no notice at all', compatibilityNotice(r.state) === '');
}

// =========================================================================================
// B. OLDER BUT SUPPORTED FRONTEND -> ALLOWED.
//
// This is the case that makes a release window a window rather than a cliff. Render and Vercel
// cannot deploy atomically with respect to each other, so a client one release behind is the
// NORMAL state during every switchover, not an exception.
// =========================================================================================
{
  const atFloor = resolveClientCompatibility('1.2.0', server());
  ok('B1 a client exactly at the supported floor is not blocked', !atFloor.blocksSafetyCriticalWrites, atFloor.state);
  const between = resolveClientCompatibility('1.3.7', server());
  ok('B2 a client between the floor and the shipped version is not blocked',
    !between.blocksSafetyCriticalWrites, between.state);
  ok('B3 a supported-but-old client is never told it must update',
    atFloor.state !== 'UPDATE_REQUIRED' && between.state !== 'UPDATE_REQUIRED');
}

// =========================================================================================
// C. COMPATIBLE UPDATE AVAILABLE -> UPDATE NOTICE.
// =========================================================================================
{
  const r = resolveClientCompatibility('1.3.0', server());
  ok('C1 an older supported client reports UPDATE_AVAILABLE', r.state === 'UPDATE_AVAILABLE', r.state);
  ok('C2 which does not block writes', !r.blocksSafetyCriticalWrites);
  ok('C3 and a refresh would resolve it', r.refreshResolves);
  ok('C4 the notice names the product and offers, rather than demands',
    compatibilityNotice(r.state) === 'A newer version of Safety InSite is available.',
    compatibilityNotice(r.state));
}

// =========================================================================================
// D. UNSUPPORTED OLD FRONTEND -> UPDATE REQUIRED.
// =========================================================================================
{
  const r = resolveClientCompatibility('1.1.9', server());
  ok('D1 a client below the floor reports UPDATE_REQUIRED', r.state === 'UPDATE_REQUIRED', r.state);
  ok('D2 and safety-critical writes are blocked', r.blocksSafetyCriticalWrites);
  ok('D3 and the remedy offered is one that works', r.refreshResolves);
  ok('D4 the notice says what happened and what to do',
    compatibilityNotice(r.state) === 'Safety InSite has been updated. Refresh to continue.',
    compatibilityNotice(r.state));

  const ancient = resolveClientCompatibility('0.9.0', server());
  ok('D5 a client a whole MAJOR below the floor is UPDATE_REQUIRED, not INCOMPATIBLE, '
    + 'because refreshing does fix it', ancient.state === 'UPDATE_REQUIRED', ancient.state);
  ok('D6 and it is blocked', ancient.blocksSafetyCriticalWrites);
}

// =========================================================================================
// E. SIMULATED INCOMPATIBLE VERSION -> REFUSED CLEANLY.
//
// A client a MAJOR ahead of the server is what a backend rollback under an un-rolled-back
// frontend looks like. The distinction that matters is the REMEDY: telling this user to refresh
// would be telling them to do something that cannot work, because the server is the old one.
// =========================================================================================
{
  const r = resolveClientCompatibility('2.0.0', server());
  ok('E1 a client a major ahead of the server is INCOMPATIBLE', r.state === 'INCOMPATIBLE', r.state);
  ok('E2 and is blocked from safety-critical writes', r.blocksSafetyCriticalWrites);
  ok('E3 and is NOT told to refresh, because refreshing cannot resolve it', !r.refreshResolves);
  ok('E4 the notice directs to support rather than to a refresh',
    /Contact support/.test(compatibilityNotice(r.state)), compatibilityNotice(r.state));

  const aheadWithinMajor = resolveClientCompatibility('1.5.0', server());
  ok('E5 a client merely a MINOR ahead is supported, not incompatible — a frontend deployed '
    + 'minutes before its backend is an ordinary switchover',
    aheadWithinMajor.state === 'SUPPORTED' && !aheadWithinMajor.blocksSafetyCriticalWrites,
    aheadWithinMajor.state);
}

// =========================================================================================
// F. NO EVIDENCE -> NEVER CLAIM THE CLIENT IS OBSOLETE.
//
// The most important block in this file. Every one of these is a client that learned NOTHING,
// and a client that learned nothing must keep working.
// =========================================================================================
{
  const cases: Array<[string, unknown, Partial<ReleaseContract> | null]> = [
    ['the server was unreachable, so there is no contract at all', '1.4.0', null],
    ['the server answered something that is not a contract', '1.4.0', {}],
    ['the server declared no frontendVersion', '1.4.0', server({ frontendVersion: '' as string })],
    ['the server declared a malformed frontendVersion', '1.4.0', server({ frontendVersion: 'latest' })],
    ['the server declared a malformed floor', '1.4.0',
      server({ minimumSupportedFrontendVersion: 'v1' })],
    ['the client does not know its own version', undefined, server()],
    ['the client version is a placeholder', 'unknown', server()],
  ];
  for (const [label, client, contract] of cases) {
    const r = resolveClientCompatibility(client, contract);
    ok(`F ${label} -> UNKNOWN`, r.state === 'UNKNOWN', r.state);
    ok(`F ${label} -> blocks nothing`, !r.blocksSafetyCriticalWrites);
  }
  ok('F8 and UNKNOWN shows no notice, so nothing appears on screen either',
    compatibilityNotice('UNKNOWN') === '');
}

// =========================================================================================
// ORDERING. The two blocking states are reachable at once; which one wins is not arbitrary.
// =========================================================================================
{
  // Client 3.0.0 against a server shipping 1.4.0 with a floor of 4.0.0: below the floor AND a
  // major ahead. Below-the-floor wins, because a refresh onto the server's own frontend fixes it.
  const r = resolveClientCompatibility('3.0.0', server({ minimumSupportedFrontendVersion: '4.0.0' }));
  ok('O1 below-the-floor outranks major-ahead, because its remedy is the one that works',
    r.state === 'UPDATE_REQUIRED' && r.refreshResolves, r.state);
}

// =========================================================================================
// VERSION PARSING. The rule is only as good as what it will accept as a version.
// =========================================================================================
{
  ok('V1 major.minor.patch parses', parseVersion('1.2.3') !== null);
  ok('V2 a pre-release suffix parses and is ignored for ordering',
    JSON.stringify(parseVersion('1.2.3-beta.4')) === JSON.stringify(parseVersion('1.2.3')));
  for (const bad of ['1.2', 'v1.2.3', '1.2.3.4', '', 'unknown', 'latest', null, undefined, 42, {}]) {
    ok(`V3 rejects ${JSON.stringify(bad)}`, parseVersion(bad) === null);
  }
  ok('V4 numeric comparison, not lexical: 1.10.0 is newer than 1.9.0',
    resolveClientCompatibility('1.9.0', server({ frontendVersion: '1.10.0' })).state === 'UPDATE_AVAILABLE');
}

// =========================================================================================
// THE SERVED CONTRACT. What this build would actually publish at GET /version.
// =========================================================================================
{
  const contract = getReleaseContract();
  ok('S1 it declares a parseable frontendVersion', parseVersion(contract.frontendVersion) !== null,
    contract.frontendVersion);
  ok('S2 it declares a parseable supported floor',
    parseVersion(contract.minimumSupportedFrontendVersion) !== null,
    contract.minimumSupportedFrontendVersion);
  ok('S3 the frontend this backend ships with is CURRENT against its own contract',
    resolveClientCompatibility(SHIPPED_FRONTEND_VERSION, contract).state === 'CURRENT');
  ok('S4 and the floor is not above it, which would obsolete the product on release day',
    !resolveClientCompatibility(MINIMUM_SUPPORTED_FRONTEND_VERSION, contract).blocksSafetyCriticalWrites);
  ok('S5 schemaCompatibilityVersion is derived from the shipped migrations, not invented',
    /^\d{10,}$/.test(contract.schemaCompatibilityVersion), contract.schemaCompatibilityVersion);
  ok('S6 it reports where its commit came from rather than presenting it bare',
    typeof contract.versionSourceStatus === 'string' && contract.versionSourceStatus.length > 0,
    contract.versionSourceStatus);

  // §279 removed npm_package_version from the commit chain. npm sets it for every script it runs,
  // so this process has it set right now — which is exactly the condition that used to make
  // /health/version answer "1.0.0" with the confidence of a real commit.
  ok('S7 a package version is never reported as a commit, even though npm has set one here',
    contract.versionSourceStatus !== 'npm_package_version'
    && contract.gitSha !== process.env.npm_package_version,
    `${contract.gitSha} via ${contract.versionSourceStatus}`);

  const publicFields = Object.keys(contract).sort();
  const allowed = [
    'backendVersion', 'buildTimestamp', 'buildTimestampSourceStatus', 'frontendVersion', 'gitSha',
    'minimumSupportedFrontendVersion', 'releaseVersion', 'schemaCompatibilityVersion',
    'versionSourceStatus',
  ];
  ok('S8 the contract carries EXACTLY the public release fields and nothing else — it is served '
    + 'unauthenticated, so an added field is an added disclosure',
    JSON.stringify(publicFields) === JSON.stringify(allowed), publicFields.join(','));
  const serialised = JSON.stringify(contract).toLowerCase();
  ok('S9 and nothing in it looks like a credential or a connection string',
    !/(secret|password|token|api[_-]?key|postgres:|postgresql:|bearer )/.test(serialised));
}

console.log(`\n${pass} passed, ${fail} failed.`);
if (fail > 0) {
  console.error(`\nFAILED: ${failures.join(', ')}`);
  console.error('A client may be declared unusable only on positive evidence from the server, and '
    + 'every failure to obtain that evidence must leave it working.');
  process.exit(1);
}
console.log('§279 release compatibility: PASS');
