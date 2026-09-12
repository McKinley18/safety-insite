/**
 * §210B-3A -- WHAT ACTUALLY VARIES IN THE TOOL SCHEMA. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * The cache preflight established that all eight tool blocks are distinct and that they diverge
 * 839 bytes in. This names the diverging fields, so the stop report states a cause rather than an
 * observation, and so the product owner can see whether the variance is semantic request content
 * (which may not be changed) or incidental transport shape (which might be).
 */

import { PROBE_CASES, toolBlockFor } from './preflight-210b3-cache';

const first = PROBE_CASES[0]!;
const a = JSON.parse(JSON.stringify(toolBlockFor(first)));

/** Walk two JSON values and report every path where they differ. */
function diff(x: unknown, y: unknown, path: string, out: string[]): void {
  if (JSON.stringify(x) === JSON.stringify(y)) return;
  const bothObj = x !== null && y !== null && typeof x === 'object' && typeof y === 'object'
    && !Array.isArray(x) && !Array.isArray(y);
  if (bothObj) {
    const keys = new Set([...Object.keys(x as object), ...Object.keys(y as object)]);
    for (const k of keys) {
      diff((x as any)[k], (y as any)[k], `${path}.${k}`, out);
    }
    return;
  }
  const short = (v: unknown): string => {
    const s = JSON.stringify(v);
    return s === undefined ? 'undefined' : s.length > 120 ? `${s.slice(0, 117)}...` : s;
  };
  out.push(`${path}\n      PB-01: ${short(x)}\n      other: ${short(y)}`);
}

console.log('================ TOOL SCHEMA VARIANCE ACROSS THE FROZEN CASES');
console.log('  (zero provider calls; local construction only)\n');

const allPaths = new Map<string, number>();
for (const c of PROBE_CASES.slice(1)) {
  const b = JSON.parse(JSON.stringify(toolBlockFor(c)));
  const out: string[] = [];
  diff(a, b, 'tools[0]', out);
  console.log(`  ---- ${c.caseId}: ${out.length} differing path(s) vs PB-01`);
  for (const line of out) {
    console.log(`    ${line}`);
    const p = line.split('\n')[0] as string;
    allPaths.set(p, (allPaths.get(p) ?? 0) + 1);
  }
  console.log('');
}

console.log('================ DIVERGING PATHS, BY HOW MANY CASES DIFFER FROM PB-01');
for (const [p, n] of [...allPaths.entries()].sort((l, r) => r[1] - l[1])) {
  console.log(`  ${String(n).padStart(2)}/7  ${p}`);
}
console.log('\n  ZERO PROVIDER CALLS WERE MADE.');
