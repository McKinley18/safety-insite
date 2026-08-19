// A/B of the evidence extractor before vs after the safety-semantics fixes, over the gauntlet's
// own texts plus the semantics corpus, so any behaviour change is attributable, not assumed.
import { buildEvidenceFacts as after } from '../../src/safescope-v2/evidence/shared-evidence-facts';
import { buildEvidenceFacts as before } from './shared-evidence-facts.before';

const TEXTS = [
  'Cord is damaged.', 'Guard is missing.', 'Worker is on a ladder.', 'Ladder is damaged.',
  'Equipment is being serviced.', 'Equipment is being serviced without lockout.',
  'Equipment is tagged but not locked where locking is possible while maintenance continues.',
  'A worker is servicing the stamping press and hazardous energy has not been isolated or locked out.',
  'The point-of-operation guard on the punch press is missing while the machine is energized and operating.',
  'The guard on the conveyor tail pulley is in place and bolted, and no moving part is exposed.',
  'The machine guard is installed and secured; the interlock blocks reach into the point of operation.',
  'Hazardous energy has not been isolated or locked out before servicing the press.',
  'The circuit was deenergized, locked out, and verified before work began.',
  'A miner is servicing the crusher drive with power connected and no lock or tag applied.',
  'The interlock guard on the press brake is installed but has been bypassed with a jumper wire so the machine runs with the guard open.',
  'Worker says equipment is locked out, but I could not verify isolation.',
  'Disconnect is open, lock applied, zero-energy verification completed, and stored energy relieved.',
];
const KEYS = ['guardState', 'energyIsolationState'];
let diffs = 0;
for (const text of TEXTS) {
  const pick = (fn: any) => JSON.stringify((fn({ text, scopes: ['osha_general_industry'] }).facts as any[])
    .filter(f => KEYS.includes(f.type)).map(f => `${f.type}=${f.value}`).sort());
  const b = pick(before);
  const a = pick(after);
  if (b !== a) { diffs++; console.log(`CHANGED  ${JSON.stringify(text.slice(0, 72))}\n   before=${b}\n   after =${a}`); }
  else console.log(`same     ${JSON.stringify(text.slice(0, 72))} ${a}`);
}
console.log(`\n${diffs} of ${TEXTS.length} texts changed`);
