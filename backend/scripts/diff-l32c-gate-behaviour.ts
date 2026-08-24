/**
 * L3-2c -- OLD GATE vs NEW GATE, side by side, on the same strings.
 *
 * The L3-2c suite found three negative-control fixtures where the binder leaves an ACTIVE claim
 * standing. Two possibilities had to be told apart and NOT guessed at: behaviour L3-2c CHANGED, and
 * behaviour that was always this way. This program reimplements the retired L3-2b decision exactly
 * as it was written -- a `SUBJECTIVE_IMPRESSION_TOKENS` hit plus the `hasUnhedgedFact` scan over
 * `FACTUAL_CONDITION_TOKENS` -- and runs it beside `assessImpression` so the difference is measured.
 *
 * Run: OUT=... npx ts-node scripts/diff-l32c-gate-behaviour.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { assessImpression } from '../src/safescope-v2/reasoning-l3/impression-scope';

// ---- the retired L3-2b implementation, copied verbatim from the pre-L3-2c source.
const SUBJECTIVE_IMPRESSION_TOKENS = [
  'look right', 'looked right', 'looks right', 'look safe', 'looked off', 'looks off',
  'seemed', 'seems', 'seem ', 'appears to', 'appeared to', 'might be', 'may be', 'maybe',
  'possibly', 'probably', 'i think', 'i believe', 'i feel', 'to me', 'felt like', 'feels like',
  'not sure', 'unsure', 'questionable', 'suspicious', 'concerned about', 'concerning',
  'seemed unsafe', 'sketchy', 'iffy', "doesn't look", 'did not look', 'didn\'t look',
];
const FACTUAL_CONDITION_TOKENS = [
  'missing', 'broken', 'cracked', 'exposed', 'damaged', 'unguarded', 'loose', 'frayed',
  'corroded', 'bent', 'blocked', 'energized', 'leaking', 'spilled', 'torn', 'severed',
  'unlabeled', 'unlabelled', 'open ', 'removed', 'disconnected', 'bypassed', 'defeated',
  'worn through', 'no guard', 'without', 'inches', 'feet', 'foot', 'inch', 'psi', 'volts',
];
const HEDGE_TOKENS = ['might be', 'may be', 'maybe', 'possibly', 'probably', 'i think', 'i believe', 'seemed', 'seems', 'appears to be', 'appeared to be', 'looked', 'looks', 'could be', 'not sure', 'unsure'];
const lower = (s: string) => s.toLowerCase();
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hasAny(haystack: string, tokens: string[]): string | null {
  const h = lower(haystack);
  for (const t of tokens) {
    if (t.includes(' ')) { if (h.includes(t)) return t.trim(); continue; }
    if (new RegExp(`\\b${escape(t)}\\b`, 'i').test(h)) return t;
  }
  return null;
}
function hasUnhedgedFact(text: string): boolean {
  const h = lower(text);
  for (const fact of FACTUAL_CONDITION_TOKENS) {
    let from = 0;
    for (;;) {
      const at = h.indexOf(lower(fact), from);
      if (at < 0) break;
      from = at + 1;
      const windowStart = Math.max(0, at - 30);
      let preceding = h.slice(windowStart, at);
      const lastBreak = Math.max(preceding.lastIndexOf(' and '), preceding.lastIndexOf(','), preceding.lastIndexOf(';'));
      if (lastBreak >= 0) preceding = preceding.slice(lastBreak);
      if (!HEDGE_TOKENS.some(hedge => preceding.includes(hedge))) return true;
    }
  }
  return false;
}
/** TRUE means the OLD gate refused the ACTIVE claim. */
function oldGateRefuses(cited: string): boolean {
  const subjective = hasAny(cited, SUBJECTIVE_IMPRESSION_TOKENS);
  if (!subjective) return false;
  return !hasUnhedgedFact(cited);
}
/** TRUE means the NEW gate refuses the ACTIVE claim. */
const newGateRefuses = (cited: string) => assessImpression(cited).onlyImpression;

const CASES: Array<{ id: string; kind: string; text: string; shouldRefuse: boolean }> = [
  { id: 'H-AM-05', kind: 'R1 recall pole', shouldRefuse: false, text: 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone' },
  { id: 'H-AM-02', kind: 'R1 precision pole', shouldRefuse: true, text: 'One of the sling legs on the spreader bar may be cut' },
  { id: 'B10', kind: 'protected', shouldRefuse: true, text: 'The rail on the platform did not look right to me' },
  { id: 'H-AM-01', kind: 'latent false ACTIVE', shouldRefuse: true, text: 'The overhead door track struck me as odd when I walked underneath it' },
  { id: 'possibly-leaking', kind: 'protected (L3-2b fixture)', shouldRefuse: true, text: 'The drum is possibly leaking' },
  { id: 'impression-plus-fact', kind: 'protected (L3-2b fixture)', shouldRefuse: false, text: 'The handrail seemed loose and three balusters are missing from the run' },
  { id: 'NC-hazard-negated', kind: 'negative control', shouldRefuse: true, text: 'A full survey of the packaging hall found no unguarded nip points and no exposed drive shafts' },
  { id: 'NC-positive-impression-plus-control', kind: 'negative control', shouldRefuse: true, text: 'The whole grinding bay looked right to me and the wheel guards are all fitted' },
  { id: 'NC-negated-across-and', kind: 'negative control', shouldRefuse: true, text: 'The battery room was checked and no acid spillage was present and the eyewash discharged clear' },
];

const rows = CASES.map(c => {
  const oldR = oldGateRefuses(c.text);
  const newR = newGateRefuses(c.text);
  return {
    id: c.id, kind: c.kind, shouldRefuse: c.shouldRefuse,
    oldGateRefuses: oldR, newGateRefuses: newR,
    changedByL32c: oldR !== newR,
    verdict: oldR === newR
      ? (newR === c.shouldRefuse ? 'UNCHANGED_AND_CORRECT' : 'UNCHANGED_PRE_EXISTING_GAP')
      : (newR === c.shouldRefuse ? 'IMPROVED_BY_L3_2C' : 'REGRESSED_BY_L3_2C'),
  };
});

const out = { stage: 'OLD_VS_NEW_GATE', generatedAt: new Date().toISOString(), rows };
const path = process.env.OUT || '../verification/hazlenz-l3-2c-gate-polarity-2026-08-22/rootcause/gate-behaviour-diff.json';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
for (const r of rows) console.log(`${r.verdict.padEnd(28)} ${r.id.padEnd(36)} old=${String(r.oldGateRefuses).padEnd(5)} new=${String(r.newGateRefuses).padEnd(5)} want=${r.shouldRefuse}`);
