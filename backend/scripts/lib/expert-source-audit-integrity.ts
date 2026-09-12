/**
 * §193 -- SOURCE AUDIT INTEGRITY. Classification: AUDIT_TOOLING_RELIABILITY.
 * Zero provider calls, zero database operations. No verifier behaviour is touched by this module.
 *
 * ==================== THE FAILURE MODE THIS EXISTS TO PREVENT ====================
 *
 * `expert-verifier-v2-v3-diff.ts` carried four LITERAL NUL bytes, written as control characters
 * where the source clearly intended the two-character escape `\0` inside a template literal. The
 * runtime string was correct. The consequence was entirely in the tooling:
 *
 *   file(1)   classified 20KB of TypeScript as "data"
 *   grep      treated it as binary and returned NOTHING, silently
 *
 * That is the dangerous part. `grep -n "export" file.ts` returned no output and exit code 0 — the
 * same observable result as a file that genuinely contains no matches. **A silent no-match is
 * indistinguishable from a clean audit.** Any grep-driven check over that file — a protected-pattern
 * scan, a forbidden-string scan, an integrity audit — would have reported clean while inspecting
 * nothing at all.
 *
 * So the rule is not merely "no NUL bytes". It is: AN AUDIT THAT CANNOT ACTUALLY READ ITS TARGET
 * MUST FAIL LOUDLY RATHER THAN RETURN CLEAN.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

export const SOURCE_AUDIT_INTEGRITY_VERSION = 'hazlenz.expert.source-audit-integrity.v1' as const;

/** Extensions whose files are expected to be textually auditable. */
export const AUDITABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.txt'] as const;

export type AuditabilityFailure =
  /** A literal NUL byte. Makes grep treat the file as binary and report nothing. */
  | 'EMBEDDED_NUL_BYTE'
  /** Not decodable as UTF-8, so any text tool is reading something other than the source. */
  | 'NOT_VALID_UTF8';

export interface FileAuditability {
  readonly path: string;
  readonly auditable: boolean;
  readonly failures: readonly AuditabilityFailure[];
  readonly nulCount: number;
  readonly bytes: number;
}

/**
 * Decide whether a file can actually be inspected by ordinary text tooling.
 *
 * Deliberately narrow: it decides TOOLING READABILITY, not content. It says nothing about whether
 * the source is correct, and it is never a semantic gate.
 */
export function checkFileAuditability(path: string): FileAuditability {
  const buf = readFileSync(path);
  const failures: AuditabilityFailure[] = [];
  let nulCount = 0;
  for (const b of buf) if (b === 0) nulCount += 1;
  if (nulCount > 0) failures.push('EMBEDDED_NUL_BYTE');
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    failures.push('NOT_VALID_UTF8');
  }
  return { path, auditable: failures.length === 0, failures, nulCount, bytes: buf.length };
}

/** Walk a directory for auditable-extension files, skipping build and dependency output. */
export function collectAuditableFiles(root: string, skip: readonly string[] = [
  'node_modules', 'dist', 'build', '.git', 'coverage', '.next',
]): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    let entries: string[];
    try { entries = readdirSync(dir); } catch { return; }
    for (const e of entries) {
      if (skip.includes(e)) continue;
      const p = join(dir, e);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) walk(p);
      else if ((AUDITABLE_EXTENSIONS as readonly string[]).includes(extname(p))) out.push(p);
    }
  };
  walk(root);
  return out;
}

export interface AuditSweep {
  readonly scanned: number;
  readonly unauditable: readonly FileAuditability[];
  readonly clean: boolean;
}

export function sweepAuditability(root: string): AuditSweep {
  const files = collectAuditableFiles(root);
  const unauditable = files.map(checkFileAuditability).filter(f => !f.auditable);
  return { scanned: files.length, unauditable, clean: unauditable.length === 0 };
}

/**
 * A grep that cannot silently succeed.
 *
 * `grepAuditable` refuses to report "no matches" for a file it could not actually read. Callers get
 * a discriminated result: `SEARCHED` carries real matches, `UNAUDITABLE` is a LOUD failure and must
 * never be treated as zero matches.
 *
 * This is the whole point of the module. The NUL bytes were harmless; the silent clean audit was not.
 */
export type GrepOutcome =
  | { readonly kind: 'SEARCHED'; readonly path: string; readonly matches: readonly string[] }
  | { readonly kind: 'UNAUDITABLE'; readonly path: string; readonly failures: readonly AuditabilityFailure[] };

export function grepAuditable(path: string, pattern: RegExp): GrepOutcome {
  const a = checkFileAuditability(path);
  if (!a.auditable) return { kind: 'UNAUDITABLE', path, failures: a.failures };
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  const text = readFileSync(path, 'utf8');
  const matches = text.split('\n').filter(l => { re.lastIndex = 0; return re.test(l); });
  return { kind: 'SEARCHED', path, matches };
}

/** Throwing form, for use inside an audit that must abort rather than report a false clean. */
export function assertTextuallyAuditable(path: string): void {
  const a = checkFileAuditability(path);
  if (!a.auditable) {
    throw new Error(
      `AUDIT_TOOLING_FAILURE: ${path} cannot be textually inspected (${a.failures.join(', ')}; `
      + `${a.nulCount} NUL byte(s)). A text audit over this file would report no matches while `
      + 'inspecting nothing. Refusing to report a clean result.');
  }
}
