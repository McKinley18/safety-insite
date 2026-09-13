/**
 * §270 — THE BUILD METADATA RESOLUTION CHAIN AND ITS FALLBACK.
 *
 * §269 found /health/version reporting a buildTimestamp four months older than the running build,
 * because `buildTimestamp` read a checked-in literal and had no environment chain — while
 * `gitCommit` had one and was therefore accurate. This exercises the chain §270 added, including
 * the cases that matter most: a malformed pipeline value must be REJECTED rather than echoed onto
 * a health endpoint, and the literal must identify itself as a fallback rather than passing for a
 * real stamp.
 */
import { getBuildMetadata } from '../src/utils/build-metadata';

const TIMESTAMP_VARS = ['BUILD_TIMESTAMP', 'RENDER_BUILD_TIMESTAMP',
  'VERCEL_DEPLOYMENT_CREATED_AT', 'SOURCE_DATE_EPOCH'];
const COMMIT_VARS = ['RENDER_GIT_COMMIT', 'GIT_COMMIT', 'GIT_SHA', 'COMMIT_SHA',
  'VERCEL_GIT_COMMIT_SHA', 'SOURCE_VERSION', 'npm_package_version'];

let pass = 0; let fail = 0;
const ok = (label: string, condition: boolean, detail = ''): void => {
  if (condition) { pass++; console.log(`  ok    ${label}${detail ? `  [${detail}]` : ''}`); }
  else { fail++; console.log(`  FAIL  ${label}${detail ? `  [${detail}]` : ''}`); }
};

function withEnv(vars: Record<string, string | undefined>, run: () => void): void {
  const saved: Record<string, string | undefined> = {};
  for (const key of [...TIMESTAMP_VARS, ...COMMIT_VARS]) { saved[key] = process.env[key]; delete process.env[key]; }
  for (const [key, value] of Object.entries(vars)) { if (value !== undefined) process.env[key] = value; }
  try { run(); } finally {
    for (const key of [...TIMESTAMP_VARS, ...COMMIT_VARS]) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
}

console.log('\n§270 — BUILD METADATA RESOLUTION\n');

console.log('TIMESTAMP SOURCE PRECEDENCE\n');
withEnv({ BUILD_TIMESTAMP: '2026-09-13T12:00:00Z' }, () => {
  const m = getBuildMetadata();
  ok('an explicit BUILD_TIMESTAMP wins', m.buildTimestampSourceStatus === 'BUILD_TIMESTAMP', m.buildTimestamp);
  ok('and is normalised to ISO-8601', m.buildTimestamp === '2026-09-13T12:00:00.000Z');
});
withEnv({ BUILD_TIMESTAMP: '2026-09-13T12:00:00Z', RENDER_BUILD_TIMESTAMP: '2020-01-01T00:00:00Z' }, () => {
  ok('BUILD_TIMESTAMP outranks a platform value',
    getBuildMetadata().buildTimestampSourceStatus === 'BUILD_TIMESTAMP');
});
withEnv({ SOURCE_DATE_EPOCH: '1789300000' }, () => {
  const m = getBuildMetadata();
  ok('SOURCE_DATE_EPOCH is accepted as Unix seconds',
    m.buildTimestampSourceStatus === 'SOURCE_DATE_EPOCH' && m.buildTimestamp.endsWith('Z'), m.buildTimestamp);
});

console.log('\nFALLBACK — THE §269 DEFECT\n');
withEnv({}, () => {
  const m = getBuildMetadata();
  ok('with no source supplied it falls back to the literal',
    m.buildTimestampSourceStatus === 'BUILD_FALLBACK', m.buildTimestamp);
  ok('and the fallback IDENTIFIES ITSELF rather than passing for a stamp',
    m.buildTimestampSourceStatus !== 'BUILD_TIMESTAMP');
});

console.log('\nMALFORMED INPUT IS REJECTED, NOT ECHOED\n');
withEnv({ BUILD_TIMESTAMP: 'not-a-date' }, () => {
  const m = getBuildMetadata();
  ok('a malformed BUILD_TIMESTAMP does not reach the health endpoint',
    m.buildTimestamp !== 'not-a-date');
  ok('and it falls through to the next usable source',
    m.buildTimestampSourceStatus === 'BUILD_FALLBACK', m.buildTimestampSourceStatus);
});
withEnv({ BUILD_TIMESTAMP: 'not-a-date', RENDER_BUILD_TIMESTAMP: '2026-09-13T09:30:00Z' }, () => {
  ok('a malformed value falls through to a VALID later source',
    getBuildMetadata().buildTimestampSourceStatus === 'RENDER_BUILD_TIMESTAMP');
});

console.log('\nCOMMIT RESOLUTION IS UNCHANGED\n');
withEnv({ RENDER_GIT_COMMIT: 'de655d2f6e4c0ff7b0de17f9ccfbd3668138a936' }, () => {
  const m = getBuildMetadata();
  ok('RENDER_GIT_COMMIT still wins', m.versionSourceStatus === 'RENDER_GIT_COMMIT');
  ok('and is reported verbatim', m.gitCommit === 'de655d2f6e4c0ff7b0de17f9ccfbd3668138a936');
});
withEnv({}, () => {
  ok('with no commit source it reports BUILD_FALLBACK, which release:verify-sha refuses',
    getBuildMetadata().versionSourceStatus === 'BUILD_FALLBACK');
});

console.log(`\n§270 BUILD METADATA: ${fail === 0 ? 'PASS' : `FAIL (${fail})`}  —  ${pass} checks passed\n`);
process.exit(fail === 0 ? 0 : 1);
