/**
 * §273 — DOCUMENTATION LINK AND SOURCE-OF-TRUTH CHECK. READ-ONLY.
 *
 * Two questions, both of which a documentation consolidation can silently get wrong:
 *
 *   1. Does every relative Markdown link in ACTIVE documentation resolve to a file that exists?
 *      Moving documents is exactly the operation that breaks links, and a broken link in a runbook
 *      is worse than no link, because it is read under time pressure.
 *
 *   2. Does any path referenced from CODE point at documentation that no longer exists? A prose
 *      mention that has gone stale is cosmetic; a `readFileSync` that has gone stale is a bug.
 *
 * Frozen evidence under `verification/` is NOT checked. Those packages intentionally reference the
 * paths that existed when they were frozen, and "repairing" them would rewrite accepted evidence.
 * Historical documentation under `project-docs/historical/` is likewise excluded from link repair:
 * it is preserved as written.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve, relative, sep } from 'path';

const BACKEND = join(__dirname, '..', '..');
const REPO = join(BACKEND, '..');

/** Active documentation: everything under project-docs except the historical archive, plus roots. */
const ACTIVE_DOC_ROOTS = ['project-docs/current', 'project-docs/architecture',
  'project-docs/operations', 'project-docs/legal'];
const ACTIVE_DOC_FILES = ['README.md', 'project-docs/README.md', 'docs/README.md',
  'project-docs/historical/README.md'];

const SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'verification']);

function walk(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const full = join(dir, e);
    let st; try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (e.endsWith('.md')) out.push(full);
  }
}

export interface Broken { readonly from: string; readonly link: string; readonly kind: string; }

function checkMarkdown(): Broken[] {
  const files: string[] = [];
  for (const r of ACTIVE_DOC_ROOTS) walk(join(REPO, r), files);
  for (const f of ACTIVE_DOC_FILES) { const p = join(REPO, f); if (existsSync(p)) files.push(p); }

  const broken: Broken[] = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = m[1].trim();
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      target = target.split('#')[0];
      if (!target) continue;
      const abs = resolve(dirname(file), target);
      if (!existsSync(abs)) {
        broken.push({ from: relative(REPO, file).split(sep).join('/'), link: m[1], kind: 'markdown' });
      }
    }
  }
  return broken;
}

/**
 * Code that READS a documentation path. Prose mentions are not checked: several are inside frozen,
 * digested instruments that must not be edited, so flagging them would demand an edit that is
 * forbidden.
 */
function checkCodeReads(): Broken[] {
  const files: string[] = [];
  const collect = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir)) {
      if (SKIP.has(e)) continue;
      const full = join(dir, e);
      let st; try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) collect(full);
      else if (/\.(ts|js|mjs)$/.test(e)) files.push(full);
    }
  };
  collect(join(BACKEND, 'scripts'));
  collect(join(BACKEND, 'src'));

  const broken: Broken[] = [];
  const reader = /(?:readFileSync|existsSync|readFile)\s*\([^)]*?['"`]([^'"`]*(?:docs|project-docs)\/[^'"`]+\.(?:md|json))['"`]/g;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(reader)) {
      const target = m[1];
      if (!existsSync(join(REPO, target))) {
        broken.push({ from: relative(REPO, file).split(sep).join('/'), link: target, kind: 'code-read' });
      }
    }
  }
  return broken;
}

/** One subject, one active document. A second file with the same stem is a competing truth. */
function checkDuplicateTruth(): string[] {
  const seen = new Map<string, string[]>();
  const files: string[] = [];
  for (const r of ACTIVE_DOC_ROOTS) walk(join(REPO, r), files);
  for (const f of files) {
    const stem = f.split(sep).pop()!.replace(/\.md$/, '').toUpperCase().replace(/[_-]/g, '');
    const rel = relative(REPO, f).split(sep).join('/');
    seen.set(stem, [...(seen.get(stem) ?? []), rel]);
  }
  return [...seen.entries()].filter(([, v]) => v.length > 1)
    .map(([k, v]) => `${k}: ${v.join('  vs  ')}`);
}

function main(): void {
  const md = checkMarkdown();
  const code = checkCodeReads();
  const dup = checkDuplicateTruth();

  console.log('\nSafety InSite — documentation link check (read-only, 0 provider calls)\n');
  console.log(`  Markdown links in active docs        ${md.length === 0 ? 'PASS' : 'FAIL'}   ${md.length} broken`);
  for (const b of md) console.log(`            ${b.from}  ->  ${b.link}`);
  console.log(`  Documentation paths READ by code     ${code.length === 0 ? 'PASS' : 'FAIL'}   ${code.length} broken`);
  for (const b of code) console.log(`            ${b.from}  ->  ${b.link}`);
  console.log(`  Competing active source-of-truth     ${dup.length === 0 ? 'PASS' : 'FAIL'}   ${dup.length} collision(s)`);
  for (const d of dup) console.log(`            ${d}`);

  console.log('\n  Not checked, deliberately:');
  console.log('            verification/                 frozen evidence — references the paths that existed when frozen');
  console.log('            project-docs/historical/      preserved as written; not repaired');

  console.log(JSON.stringify({
    brokenMarkdownLinks: md.length, brokenCodeReads: code.length,
    competingSourceOfTruth: dup.length,
    providerCalls: 0, databaseOperations: 0, filesWritten: 0,
  }));

  if (md.length || code.length || dup.length) { console.log('\nDOC LINK CHECK FAIL\n'); process.exit(1); }
  console.log('\nDOC LINK CHECK PASS\n');
}

if (require.main === module) main();
