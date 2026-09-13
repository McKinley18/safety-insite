#!/usr/bin/env node
/**
 * §268 — "WHAT EXACT COMMIT IS SERVING REQUESTS?"
 *
 * Answers it by asking the running instance and comparing against the commit the operator intended
 * to deploy. Used at the runbook's VERIFY RUNNING SHA step, between DEPLOY and VERIFY READINESS.
 *
 *   node scripts/release/verify-running-sha.js --url=https://… --expected=<sha>
 *
 * ===============================================================================================
 * WHY IT IS A COMPARISON AND NOT A REPORT.
 *
 * `/health/version` already existed and already returned the commit. What did not exist was a way
 * to establish that the commit serving traffic is the commit that was reviewed, migrated for and
 * intended. With Render autoDeploy ON, "a deploy happened" and "the deploy you meant happened" are
 * different facts, and only the second one licenses the live smoke.
 *
 * ===============================================================================================
 * IT REFUSES AN UNTRUSTWORTHY ANSWER RATHER THAN ACCEPTING A MATCHING ONE.
 *
 * `getBuildMetadata()` reports `versionSourceStatus` — which of the candidate environment
 * variables actually supplied the commit, or `BUILD_FALLBACK` when none did and the checked-in
 * `src/build-info.ts` literal answered instead. That fallback is a build-time constant that is not
 * stamped by the pipeline, so it can name a commit from months ago. A run that matches against it
 * would be confirming a coincidence.
 *
 * So `BUILD_FALLBACK` and `unknown` are treated as NOT ESTABLISHED and exit non-zero even if the
 * strings happen to be equal, unless `--allow-unstamped` is passed deliberately.
 *
 * Prefixes are compared, so a 7-character short SHA and a full 40-character SHA compare equal in
 * whichever direction the operator supplied them.
 */
'use strict';

function arg(name) {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}

const url = arg('url');
const expected = (arg('expected') || '').trim();
const allowUnstamped = process.argv.includes('--allow-unstamped');
const TRUSTWORTHY_SOURCE = /^(RENDER_GIT_COMMIT|GIT_COMMIT|GIT_SHA|COMMIT_SHA|VERCEL_GIT_COMMIT_SHA|SOURCE_VERSION)$/;

function fail(message) {
  console.error(`RUNNING SHA VERIFICATION FAILED: ${message}`);
  process.exit(1);
}

if (!url) fail('--url=<base url of the running instance> is required.');
if (!expected) fail('--expected=<git sha> is required.');

(async () => {
  let payload;
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/health/version`);
    if (!response.ok) fail(`/health/version answered HTTP ${response.status}.`);
    payload = await response.json();
  } catch (error) {
    fail(`the instance could not be reached: ${String((error && error.message) || error)}`);
  }

  const running = String(payload.gitCommit || '').trim();
  const source = String(payload.versionSourceStatus || 'unknown');
  console.log(`running gitCommit    ${running}`);
  console.log(`version source       ${source}`);
  console.log(`expected             ${expected}`);

  if (!TRUSTWORTHY_SOURCE.test(source)) {
    const message = `the running instance reported its commit from "${source}", which is not a `
      + 'pipeline-stamped source. The value cannot establish what is deployed. Stamp GIT_COMMIT '
      + '(or deploy on a platform that sets one) and re-verify.';
    if (!allowUnstamped) fail(message);
    console.warn(`WARNING (--allow-unstamped): ${message}`);
  }

  const a = running.toLowerCase();
  const b = expected.toLowerCase();
  const matches = a.length && b.length && (a.startsWith(b) || b.startsWith(a));
  if (!matches) {
    fail(`the running commit does not match the intended release commit. Do NOT proceed to the `
      + 'live smoke; establish which deploy is actually serving first.');
  }
  console.log('\nRUNNING SHA OK — the instance is serving the intended release commit.');
})();
