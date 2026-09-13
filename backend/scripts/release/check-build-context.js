#!/usr/bin/env node
/**
 * §268 — PROVE THAT SECRETS CANNOT ENTER THE DOCKER BUILD CONTEXT.
 *
 * ===============================================================================================
 * WHAT IT MEASURES AND WHAT IT DOES NOT.
 *
 * It evaluates the repository's `.dockerignore` using Docker's own matching semantics and reports,
 * for a given path, whether the daemon WOULD include it in the build context. It does this without
 * a Docker daemon on purpose: this must be a gate that runs in `beta:readiness` and in CI on any
 * machine, not one that silently skips wherever Docker is not running.
 *
 * It is therefore a check of the RULES, evaluated exactly. It is not a check of a produced image.
 * A real `docker build` verification against a running daemon remains a separate, live step and is
 * recorded as such in the runbook — this does not claim to replace it.
 *
 * ===============================================================================================
 * IT ASSERTS IN BOTH DIRECTIONS, WHICH IS THE PART THAT MATTERS.
 *
 * An exclusion list is easy to make safe by excluding everything, and that produces an image that
 * does not run. So the guard checks two things:
 *
 *   MUST BE EXCLUDED   every real file in the context matching a secret-bearing pattern, plus a
 *                      set of synthetic paths that do not need to exist. The synthetic set is what
 *                      makes the check deterministic: it still fails if someone weakens the rules
 *                      on a machine that happens to have no `.env` today.
 *   MUST BE INCLUDED   the files the build and the runtime image actually need. This is what stops
 *                      a future broad exclusion from quietly removing the release migration script
 *                      or the datasource from the image.
 *
 * ===============================================================================================
 * MATCHING SEMANTICS.
 *
 * Docker matches each pattern against the path relative to the context root using Go's
 * `filepath.Match` per segment, with `**` spanning segments, and LAST MATCHING RULE WINS so that a
 * `!` re-include can override an earlier exclusion. A directory that matches excludes everything
 * beneath it. All four behaviours are implemented below rather than approximated, because a guard
 * that models the rules loosely reports a safety property it did not actually check.
 */
'use strict';

const { readFileSync, existsSync, readdirSync, statSync } = require('fs');
const { join, relative, sep } = require('path');

const CONTEXT = join(__dirname, '..', '..');
const DOCKERIGNORE = join(CONTEXT, '.dockerignore');

/** Patterns whose presence in a build context is a credential-exposure finding. */
const SECRET_PATTERNS = [
  /^\.env$/, /^\.env\..+/, /\.pem$/, /\.key$/, /\.p12$/, /\.pfx$/, /\.keystore$/,
  /^id_rsa/, /^id_ed25519/, /credentials.*\.json$/, /service-account.*\.json$/,
  /^\.npmrc$/, /^\.netrc$/,
];

/**
 * Synthetic paths that MUST be excluded whether or not they exist on this machine. Nothing is
 * created on disk; these are evaluated against the rules directly.
 */
const MUST_EXCLUDE = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.backup-before-clean-db-20260623-221649',
  '.npmrc',
  '.netrc',
  'server.key',
  'tls/private.pem',
  'id_rsa',
  'secrets/id_ed25519',
  'config/gcp-service-account.json',
  'config/aws-credentials.json',
  'node_modules/typeorm/package.json',
  '.git/config',
];

/** Paths the build stage or the runtime image genuinely requires. */
const MUST_INCLUDE = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'src/main.ts',
  'src/app.module.ts',
  'src/database/data-source.ts',
  'src/database/schema-readiness.ts',
  'src/database/migrations/1800000019000-ExpertAnalysisAuthorityFoundation.ts',
  'src/database/migrations/1800000020000-ExpertHumanConfirmation.ts',
  'src/database/migrations/1800000021000-ProducerScopedAnalysisCurrentness.ts',
  'scripts/render-start-diagnostic.js',
  'scripts/release/migrate.js',
  'scripts/release/verify-running-sha.js',
  // The four src/safescope-v2 data directories the runtime stage copies out of the build stage.
  'src/hazlenz/hazard-taxonomy-coverage',
  'src/hazlenz/site-policy-isolation',
  'src/hazlenz/scenario-expansion',
];

// ------------------------------------------------------------------ dockerignore evaluation

function parsePatterns(text) {
  const rules = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const negated = line.startsWith('!');
    const body = (negated ? line.slice(1) : line).trim().replace(/^\.\//, '').replace(/\/$/, '');
    if (!body) continue;
    rules.push({ negated, pattern: body, regex: toRegex(body) });
  }
  return rules;
}

/** Go filepath.Match semantics per segment, plus `**` spanning segments. */
function toRegex(pattern) {
  const segments = pattern.split('/');
  const parts = segments.map(segment => {
    if (segment === '**') return '(?:[^/]+/)*[^/]+';
    let out = '';
    for (const ch of segment) {
      if (ch === '*') out += '[^/]*';
      else if (ch === '?') out += '[^/]';
      else out += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    return out;
  });
  // A matching path also matches everything beneath it, which is how Docker excludes a directory.
  return new RegExp(`^${parts.join('/')}(?:/.*)?$`);
}

function isExcluded(rules, path) {
  let excluded = false;
  // LAST MATCHING RULE WINS — a `!` rule later in the file re-includes what an earlier rule removed.
  for (const rule of rules) {
    if (rule.regex.test(path)) excluded = !rule.negated;
  }
  return excluded;
}

// ------------------------------------------------------------------ the real context, walked

const SKIP_WALK = new Set(['node_modules', '.git', 'dist', 'coverage']);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(CONTEXT, abs).split(sep).join('/');
    let stat;
    try { stat = statSync(abs); } catch { continue; }
    if (stat.isDirectory()) {
      // These are excluded wholesale and walking them costs minutes for no added assurance; their
      // exclusion is asserted directly through MUST_EXCLUDE instead.
      if (SKIP_WALK.has(entry)) { acc.push(rel); continue; }
      walk(abs, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

// ------------------------------------------------------------------ run

let failures = 0;
const ok = (condition, message, detail = '') => {
  if (condition) console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`);
  else { failures += 1; console.log(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
};

console.log('§268 — Docker build-context secret guard\n');

if (!existsSync(DOCKERIGNORE)) {
  console.log('FAIL  backend/.dockerignore exists');
  console.log('\nBUILD CONTEXT GUARD: FAIL');
  process.exit(1);
}
ok(true, 'backend/.dockerignore exists');

const rules = parsePatterns(readFileSync(DOCKERIGNORE, 'utf8'));
ok(rules.length > 0, 'the .dockerignore declares at least one rule', `${rules.length} rules`);

console.log('\n---- synthetic paths that must never enter the build context ----\n');
for (const path of MUST_EXCLUDE) {
  ok(isExcluded(rules, path), `excluded: ${path}`);
}

console.log('\n---- files actually present in this build context ----\n');
const present = walk(CONTEXT);
const realSecrets = present.filter(path => {
  const base = path.split('/').pop();
  return SECRET_PATTERNS.some(re => re.test(base));
});
if (realSecrets.length === 0) {
  console.log('ok    no secret-bearing file is present in the context right now');
  console.log('      (the synthetic set above is what keeps this check meaningful anyway)');
} else {
  for (const path of realSecrets) {
    ok(isExcluded(rules, path), `present-and-excluded: ${path}`);
  }
}
ok(true, `${present.length} context entries scanned`);

console.log('\n---- files the build and the runtime image require ----\n');
for (const path of MUST_INCLUDE) {
  const exists = existsSync(join(CONTEXT, path));
  ok(exists && !isExcluded(rules, path), `included: ${path}`,
    exists ? '' : 'MISSING FROM DISK');
}

console.log(`\nBUILD CONTEXT GUARD: ${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
