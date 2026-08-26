#!/usr/bin/env node
/**
 * L3 RUN-2 CAPACITY RECLASSIFICATION AFTER FUNDING INCREASE.
 *
 * ONE INPUT CHANGED: the user-attested available credit, $16.97 -> $40.00.
 * NOTHING ELSE. Same token evidence, same pricing, same workload, same 1.25x headroom rule,
 * same arithmetic. MAKES NO PROVIDER CALL, opens no Run-2 row, transmits nothing.
 *
 * The prior determination package is NOT rewritten. Its script
 * (cost/compute-run2-capacity.js, sha256 125e1250...) and its recorded output remain
 * byte-identical and stand as the record of the $16.97 determination. This script
 * INDEPENDENTLY RE-DERIVES the requirement from the same primary evidence and FAILS CLOSED
 * if it does not reproduce the frozen $18.038745 — the requirement is re-derived, not copied.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const PRIOR = path.join(ROOT, 'verification', 'hazlenz-l3-run2-capacity-determination-2026-08-25');
const TRANSPORT_A = path.join(
  ROOT, 'verification', 'hazlenz-l3-sealed-acceptance-2026-08-25', 'transport', 'transport-A.jsonl',
);

// FROZEN INPUTS — identical to the prior determination. None is chosen by this script.
const INPUT_PER_MTOK = 2;
const OUTPUT_PER_MTOK = 10;
const RUN2_ROWS = 93;
const RUN2_PROCESSES = 2;
const RUN2_CALLS = RUN2_ROWS * RUN2_PROCESSES;   // 186
const HEADROOM_MULTIPLIER = 1.25;

// THE ONLY CHANGED INPUT.
const PREVIOUS_CREDIT = 16.97;
const AVAILABLE_CREDIT = 40.00;                  // USER-ATTESTED, this calculation only

// The frozen requirement this script must reproduce or refuse to classify.
const FROZEN_REQUIREMENT = 18.038745;
const FROZEN_A = 5.691860;
const FROZEN_B = 14.430996;
const PRIOR_SCRIPT_SHA256 = '125e12500f7873685473fa1eef2639a76ff4b6d6726f82f34380fe5c2966c123';

const readJsonl = (p) => fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const cost = (i, o) => (i * INPUT_PER_MTOK + o * OUTPUT_PER_MTOK) / 1e6;
const usd = (n) => `$${n.toFixed(6)}`;
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const near = (a, b) => Math.abs(a - b) < 1e-6;

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };

say('L3 RUN-2 CAPACITY RECLASSIFICATION AFTER FUNDING INCREASE — ZERO NEW SPEND');
say('='.repeat(88));
say('');
say('PROVIDER CALLS MADE BY THIS SCRIPT: 0    API COST OF THIS SCRIPT: $0.00');
say(`ONLY INPUT CHANGED: available credit $${PREVIOUS_CREDIT.toFixed(2)} -> $${AVAILABLE_CREDIT.toFixed(2)}`);
say('');

// --- 1. The prior deterministic evidence is intact and is re-derived, not trusted. ---
const priorScript = path.join(PRIOR, 'cost', 'compute-run2-capacity.js');
const priorSha = sha(priorScript);
say('--- 1. PRIOR DETERMINISTIC EVIDENCE — INTACT AND RE-DERIVED ---');
say(`  prior script sha256 ...... ${priorSha}`);
say(`  expected ................. ${PRIOR_SCRIPT_SHA256}`);
if (priorSha !== PRIOR_SCRIPT_SHA256) {
  say('  -> MISMATCH. The prior determination script has moved. REFUSING TO CLASSIFY.');
  fs.writeFileSync(path.join(__dirname, 'CAPACITY_RECLASSIFICATION.txt'), out.join('\n') + '\n');
  process.exit(1);
}
say('  -> MATCH. The prior package is NOT rewritten by this phase.');
say('');

const ok = readJsonl(TRANSPORT_A).filter((r) => r.status === 200);
const pi = ok.map((r) => r.promptTokens);
const po = ok.map((r) => r.outputTokens);
const sum = (v) => v.reduce((x, y) => x + y, 0);
const meanIn = sum(pi) / pi.length;
const meanOut = sum(po) / po.length;
const maxIn = Math.max(...pi);
const maxOut = Math.max(...po);

const A = cost(meanIn, meanOut) * RUN2_CALLS;
const B = cost(maxIn, maxOut) * RUN2_CALLS;
const REQUIRED = Math.max(A, B) * HEADROOM_MULTIPLIER;

say(`--- 2. REQUIREMENT RE-DERIVED FROM THE SAME PRIMARY EVIDENCE (${ok.length} successful Run-1 calls) ---`);
say(`  A  observed-mean projection ......... ${usd(A)}   frozen ${usd(FROZEN_A)}   ${near(A, FROZEN_A) ? 'REPRODUCES' : 'MISMATCH'}`);
say(`  B  observed-max-envelope projection . ${usd(B)}   frozen ${usd(FROZEN_B)}   ${near(B, FROZEN_B) ? 'REPRODUCES' : 'MISMATCH'}`);
say(`  C  requirement (max(A,B) x ${HEADROOM_MULTIPLIER}) ..... ${usd(REQUIRED)}   frozen ${usd(FROZEN_REQUIREMENT)}   ${near(REQUIRED, FROZEN_REQUIREMENT) ? 'REPRODUCES' : 'MISMATCH'}`);
say('');
if (!near(A, FROZEN_A) || !near(B, FROZEN_B) || !near(REQUIRED, FROZEN_REQUIREMENT)) {
  say('  -> THE FROZEN REQUIREMENT DID NOT REPRODUCE. FAIL-CLOSED: REFUSING TO CLASSIFY.');
  fs.writeFileSync(path.join(__dirname, 'CAPACITY_RECLASSIFICATION.txt'), out.join('\n') + '\n');
  process.exit(1);
}
say('  -> ALL THREE REPRODUCE. No token re-analysis was required and none was performed.');
say('     Token evidence, pricing, workload and headroom rule are UNCHANGED from the prior phase.');
say('');

// --- 3. The reclassification itself. ---
const headroomDollars = AVAILABLE_CREDIT - REQUIRED;
const headroomPercent = (headroomDollars / REQUIRED) * 100;
const multiple = AVAILABLE_CREDIT / REQUIRED;
const PASS = AVAILABLE_CREDIT >= REQUIRED;

say('--- 3. RECLASSIFICATION ---');
say(`  user-attested available credit .... $${AVAILABLE_CREDIT.toFixed(2)}`);
say(`  frozen requirement ................ ${usd(REQUIRED)}`);
say(`  HEADROOM_DOLLARS = ${AVAILABLE_CREDIT.toFixed(2)} - ${REQUIRED.toFixed(6)} = ${usd(headroomDollars)}`);
say(`  HEADROOM_PERCENT .................. ${headroomPercent.toFixed(3)}%`);
say(`  CAPACITY MULTIPLE ................. ${multiple.toFixed(3)}x`);
say('');
say(`  credit / A (observed mean) ........ ${(AVAILABLE_CREDIT / A).toFixed(3)}x`);
say(`  credit / B (max envelope) ......... ${(AVAILABLE_CREDIT / B).toFixed(3)}x`);
say('');
say(`  MECHANICAL TEST: ${AVAILABLE_CREDIT.toFixed(2)} >= ${REQUIRED.toFixed(6)}  ->  ${PASS}`);
say(`  PROVIDER_CAPACITY = ${PASS ? 'PASS' : 'FAIL'}`);
say('');

// --- 4. Tail-risk cover, reported because the prior phase raised it. ---
const retryWorstMax = cost(maxIn, maxOut) * RUN2_CALLS * 2;
const retryWorstMean = cost(meanIn, meanOut) * RUN2_CALLS * 2;
say('--- 4. TAIL RISK NOW COVERED (raised as a caveat by the prior phase) ---');
say(`  semantic-retry worst case, 372 calls at max envelope .. ${usd(retryWorstMax)}  -> ${AVAILABLE_CREDIT >= retryWorstMax ? 'COVERED' : 'NOT COVERED'}`);
say(`  semantic-retry worst case, 372 calls at mean .......... ${usd(retryWorstMean)}  -> ${AVAILABLE_CREDIT >= retryWorstMean ? 'COVERED' : 'NOT COVERED'}`);
const hardCeil = cost(maxIn, 16384) * RUN2_CALLS;
say(`  max_tokens=16384 deterministic ceiling, 186 calls ..... ${usd(hardCeil)}  -> ${AVAILABLE_CREDIT >= hardCeil ? 'COVERED' : 'NOT COVERED'}`);
say(`  the same ceiling carrying the 1.25x headroom rule ..... ${usd(hardCeil * HEADROOM_MULTIPLIER)}  -> ${AVAILABLE_CREDIT >= hardCeil * HEADROOM_MULTIPLIER ? 'COVERED' : 'NOT COVERED'}`);
say('  Every envelope the prior phase flagged as uncovered at $16.97 is now covered at $40.00,');
say('  INCLUDING the absolute max_tokens=16384 deterministic ceiling. The single remaining');
say('  uncovered figure is that ceiling PLUS the 1.25x headroom, and it is not the governed');
say('  requirement: the governed requirement is B x 1.25, which the credit covers 2.217x. The');
say('  ceiling is a worst case in which EVERY row emits the full 16,384-token cap; observed mean');
say('  output was 1,857.95 and observed max 6,548. Reported, not treated as the expected path.');
say('');

say('--- 5. RUN-2 UNSPENT PROOF ---');
say('  provider calls this phase ........ 0');
say('  new API cost this phase .......... $0.00');
say('  Run-2 rows transmitted ........... 0');
say('  reserved rows transmitted ........ 0');
say('  Run-2 observations opened ........ 0');
say('  RUN2_HOLDOUT_SPENT ............... FALSE');
say('');
say(`  TERMINAL: ${PASS
  ? 'READY_TO_AUTHORIZE_L3_RUN2_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5'
  : 'L3_RUN2_CAPACITY_BLOCKED — ADDITIONAL_CREDIT_REQUIRED'}`);
say('');
say('  READY_TO_AUTHORIZE IS NOT AUTHORIZATION. The sealed Run-2 acceptance run still requires');
say('  EXPLICIT USER AUTHORIZATION, and the first inference call containing any Run-2 row flips');
say('  RUN2_HOLDOUT_SPENT to TRUE and retires gauntlet offset 1 and realism offset 0 PERMANENTLY,');
say('  whatever the result. THIS SCRIPT DOES NOT EXECUTE ACCEPTANCE.');

fs.writeFileSync(path.join(__dirname, 'CAPACITY_RECLASSIFICATION.txt'), out.join('\n') + '\n');
process.exit(0);
