/**
 * L3-2e -- OLD CHECK vs NEW CHECK, measured on the same strings.
 *
 * The sealed holdout produced three fatal rejections. Two possibilities had to be told apart and NOT
 * guessed at: behaviour L3-2e CHANGED, and behaviour that was always this way. This program
 * reimplements the retired L3-2d decisions verbatim -- pure `hasAny` presence tests -- and runs them
 * beside the current role-aware ones.
 *
 * Run: OUT=... npx ts-node scripts/diff-l32e-check-behaviour.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { findTokenOccurrences, nounPhraseHead, asserts } from '../src/safescope-v2/reasoning-l3/predicate-role';
import { negationScopes, governingNegation } from '../src/safescope-v2/reasoning-l3/negation-scope';

const CORRECTION_TOKENS = ['corrected', 'repaired', 'replaced', 'replacement', 'fixed', 'reset', 'restored', 'remediated',
  'resolved', 'reinstalled', 'closed out', 'addressed', 'applied', 'destroyed', 'scrapped', 'discarded', 'rectified', 'made good', 'new one'];
const CONTROL_IN_PLACE_TOKENS = ['in place', 'installed', 'interlocked', 'guarded', 'barricaded', 'ventilated', 'grounded',
  'secured', 'anchored', 'tested', 'functioning', 'operational', 'effective', 'wearing', 'in use', 'locked out', 'lockout',
  'lock', 'shut down', 'shutdown', 'de-energized', 'deenergized', 'isolated', 'isolation', 'verified', 'zero energy',
  'blanked', 'blinded', 'bled down', 'tagged'];
const HAZARD_NEGATION_OBJECTS = ['access', 'exposure', 'damage', 'deficienc', 'injur', 'violation', 'hazard', 'defect',
  'issue', 'problem', 'concern', 'finding', 'discrepanc', 'incident', 'harm'];

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hasAny(h: string, tokens: string[]): string | null {
  const s = h.toLowerCase();
  for (const t of tokens) {
    if (t.includes(' ')) { if (s.includes(t)) return t; continue; }
    if (new RegExp(`\\b${escape(t)}\\b`, 'i').test(s)) return t;
  }
  return null;
}

/** L3-2d state support: pure presence. TRUE = the claimed state is supported. */
const oldStateSupported = (text: string, tokens: string[]) => hasAny(text, tokens) !== null;
/** L3-2e state support: the marker must be an ASSERTED, unnegated predicate. */
const newStateSupported = (text: string, tokens: string[]) =>
  findTokenOccurrences(text, tokens, (s, e) => governingNegation(text, s, e) !== null).some(o => asserts(o.role));

/** L3-2d hazard-negation: substring anywhere in the governed span. TRUE = contradiction fires. */
function oldHazardNegation(text: string): boolean {
  for (const sc of negationScopes(text)) {
    const governed = text.slice(sc.from, sc.to).toLowerCase();
    if (HAZARD_NEGATION_OBJECTS.some(o => governed.includes(o))) return true;
  }
  return false;
}
/** L3-2e hazard-negation: the NP HEAD must be the hazard object. TRUE = contradiction fires. */
function newHazardNegation(text: string): { fires: boolean; head: string | null; matched: string | null } {
  for (const sc of negationScopes(text)) {
    const head = nounPhraseHead(text, sc.tokenStart + sc.token.length);
    if (!head) continue;
    const o = HAZARD_NEGATION_OBJECTS.find(x => head.includes(x));
    if (o) return { fires: true, head, matched: o };
  }
  return { fires: false, head: null, matched: null };
}

const CASES = [
  { id: 'E-FLD-147', kind: 'stateSupport/CONTROLLED', tokens: CONTROL_IN_PLACE_TOKENS, shouldSupport: false,
    text: 'An active floor opening is marked with standard warning tape next to an unprotected edge.' },
  { id: 'E-CS-01', kind: 'stateSupport/CORRECTED', tokens: CORRECTION_TOKENS, shouldSupport: true,
    text: 'A damaged sling was found on the crane hook and the slinger cut it up and drew a replacement from the store before the next lift.' },
  { id: 'PAIR/CORRECTED-predicate', kind: 'stateSupport/CORRECTED', tokens: CORRECTION_TOKENS, shouldSupport: true,
    text: 'The cracked socket outlet at the bench was replaced with a new one before the end of the shift.' },
  { id: 'PAIR/CONTROLLED-real', kind: 'stateSupport/CONTROLLED', tokens: CONTROL_IN_PLACE_TOKENS, shouldSupport: true,
    text: 'A double guardrail with toeboard was in place along the open edge and was fixed at every standard.' },
];

const stateRows = CASES.map(c => {
  const o = oldStateSupported(c.text, c.tokens);
  const n = newStateSupported(c.text, c.tokens);
  return {
    id: c.id, kind: c.kind, text: c.text, shouldSupport: c.shouldSupport,
    oldSupports: o, newSupports: n, changedByL32e: o !== n,
    verdict: o === n
      ? (n === c.shouldSupport ? 'UNCHANGED_AND_CORRECT' : 'UNCHANGED_PRE_EXISTING_GAP')
      : (n === c.shouldSupport ? 'IMPROVED_BY_L3_2E' : 'REGRESSED_BY_L3_2E'),
  };
});

const NEG = [
  { id: 'E-FAM-04', shouldFire: false, text: 'Operators are working a full shift beside the pneumatic hammer in the fettling bay with no hearing protection issued and no signage at the entrance.' },
  { id: 'DISC-03/labels', shouldFire: false, text: 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind.' },
  { id: 'PAIR/negated-hazard', shouldFire: true, text: 'The inspection of the switch room found no damage and no exposed conductors anywhere on the panels.' },
  { id: 'PAIR/no-deficiencies', shouldFire: true, text: 'The audit recorded no deficiencies against the storage standard.' },
];
const negRows = NEG.map(c => {
  const o = oldHazardNegation(c.text);
  const n = newHazardNegation(c.text);
  return {
    id: c.id, text: c.text, shouldFire: c.shouldFire,
    oldFires: o, newFires: n.fires, negatedHead: n.head, matchedObject: n.matched,
    changedByL32e: o !== n.fires,
    verdict: o === n.fires
      ? (n.fires === c.shouldFire ? 'UNCHANGED_AND_CORRECT' : 'UNCHANGED_PRE_EXISTING_GAP')
      : (n.fires === c.shouldFire ? 'IMPROVED_BY_L3_2E' : 'REGRESSED_BY_L3_2E'),
  };
});

const out = { stage: 'L3-2e OLD vs NEW CHECK BEHAVIOUR', generatedAt: new Date().toISOString(), stateRows, negRows };
const path = process.env.OUT || '../verification/hazlenz-l3-2e-syntactic-role-2026-08-23/rootcause/check-behaviour-diff.json';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
for (const r of stateRows) console.log(`${r.verdict.padEnd(28)} ${r.id.padEnd(26)} old=${String(r.oldSupports).padEnd(5)} new=${String(r.newSupports).padEnd(5)} want=${r.shouldSupport}  ${r.kind}`);
for (const r of negRows) console.log(`${r.verdict.padEnd(28)} ${r.id.padEnd(26)} old=${String(r.oldFires).padEnd(5)} new=${String(r.newFires).padEnd(5)} want=${r.shouldFire}  head=${r.negatedHead} matched=${r.matchedObject}`);
