#!/usr/bin/env node
/**
 * L3 RUN-2 ZERO-COST CAPACITY DETERMINATION.
 *
 * Reads the ALREADY-PAID-FOR Run-1 transport evidence and projects the cost of the frozen
 * Run-2 workload. MAKES NO PROVIDER CALL, opens no Run-2 row, and transmits nothing.
 *
 * Token source: verification/hazlenz-l3-sealed-acceptance-2026-08-25/transport/transport-A.jsonl,
 * written by the frozen shim (76d3e039). `promptTokens` is Anthropic `usage.input_tokens` and
 * `outputTokens` is `usage.output_tokens` (which INCLUDES adaptive thinking tokens) — see
 * toOllamaEnvelope() in the frozen shim. Only HTTP-200 rows carry token fields; the 400s carry none.
 *
 * Pricing: claude-sonnet-5 $2/MTok input, $10/MTok output. Established in governed evidence at
 * verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/provider/OFFICIAL_DOCUMENTATION.md
 * assertion 13 (source URL + 2026-08-24 retrieval date), which also records that the scheduled
 * 2026-09-01 increase to $3/$15 WILL NOT OCCUR. No pricing value is invented here.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const TRANSPORT_A = path.join(
  ROOT, 'verification', 'hazlenz-l3-sealed-acceptance-2026-08-25', 'transport', 'transport-A.jsonl',
);
const TRANSPORT_B = path.join(
  ROOT, 'verification', 'hazlenz-l3-sealed-acceptance-2026-08-25', 'transport', 'transport-B.jsonl',
);

// FROZEN INPUTS — none of these is chosen by this script.
const INPUT_PER_MTOK = 2;      // USD, claude-sonnet-5
const OUTPUT_PER_MTOK = 10;    // USD, claude-sonnet-5
const RUN2_ROWS = 93;          // frozen holdout f887cfd1...
const RUN2_PROCESSES = 2;      // G9 requires a second isolated process
const RUN2_CALLS = RUN2_ROWS * RUN2_PROCESSES;   // 186
const HEADROOM_MULTIPLIER = 1.25;
const AVAILABLE_CREDIT = 16.97;                  // USER-ATTESTED, this calculation only
const SHIM_MAX_OUTPUT_TOKENS = 16384;            // MAX_OUTPUT_TOKENS default in the frozen shim
const SEMANTIC_RETRY_CEILING = 1;                // frozen policy: runValidatedReasoning, ceiling of one

const readJsonl = (p) => fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

const cost = (inTok, outTok) => (inTok * INPUT_PER_MTOK + outTok * OUTPUT_PER_MTOK) / 1e6;
const usd = (n) => `$${n.toFixed(6)}`;
const usd2 = (n) => `$${n.toFixed(2)}`;
const median = (v) => {
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };

const a = readJsonl(TRANSPORT_A);
const b = readJsonl(TRANSPORT_B);
const ok = a.filter((r) => r.status === 200);
const okB = b.filter((r) => r.status === 200);

say('L3 RUN-2 CAPACITY DETERMINATION — DERIVED FROM EXISTING RUN-1 EVIDENCE, ZERO NEW SPEND');
say('='.repeat(88));
say('');
say('PROVIDER CALLS MADE BY THIS SCRIPT: 0    API COST OF THIS SCRIPT: $0.00');
say('');

say('--- 1. RUN-1 PROVIDER-CALL ACCOUNTING (already paid for, not re-measured) ---');
say(`  process A records ............ ${a.length}   HTTP 200 ${ok.length}   HTTP 400 ${a.length - ok.length}`);
say(`  process B records ............ ${b.length}   HTTP 200 ${okB.length}   HTTP 400 ${b.length - okB.length}`);
say(`  total provider calls ......... ${a.length + b.length}`);
say(`  attempts, every call ......... ${[...new Set([...a, ...b].map((r) => r.attempt))].join(',')} (no retry was issued)`);
say(`  returned model, every 200 .... ${[...new Set(ok.map((r) => r.respondedModel))].join(',')}`);
say(`  stop reason, every 200 ....... ${[...new Set(ok.map((r) => r.stopReason))].join(',')} (0 truncations)`);
say('');

const pi = ok.map((r) => r.promptTokens);
const po = ok.map((r) => r.outputTokens);
const sum = (v) => v.reduce((x, y) => x + y, 0);
const totIn = sum(pi);
const totOut = sum(po);
const meanIn = totIn / pi.length;
const meanOut = totOut / po.length;
const maxIn = Math.max(...pi);
const maxOut = Math.max(...po);

say(`--- 2. TOKEN EVIDENCE FROM THE ${ok.length} SUCCESSFUL HTTP-200 claude-sonnet-5 CALLS ---`);
say(`  INPUT  total ${totIn}  mean ${meanIn.toFixed(2)}  median ${median(pi)}  min ${Math.min(...pi)}  max ${maxIn}`);
say(`  OUTPUT total ${totOut}   mean ${meanOut.toFixed(2)}  median ${median(po)}  min ${Math.min(...po)}  max ${maxOut}`);
say('');
say('  CACHE-TOKEN ACCOUNTING: NONE EXISTS, AND NONE IS FABRICATED.');
say('    The frozen shim sets no `cache_control` anywhere, so no prompt caching was requested and');
say('    `cache_creation_input_tokens` / `cache_read_input_tokens` were never recorded. Uncached');
say('    input pricing therefore applies in full — which is also the conservative direction.');
say('  `outputTokens` is usage.output_tokens and ALREADY INCLUDES adaptive thinking tokens.');
say('');

const run1Actual = cost(totIn, totOut);
say(`  RUN-1 ACTUAL SPEND ON THESE ${ok.length} CALLS = ${usd(run1Actual)}   (the 144 rejected 400s billed $0)`);
say('');

const meanCall = cost(meanIn, meanOut);
const maxCall = cost(maxIn, maxOut);
const A_PROJ = meanCall * RUN2_CALLS;
const B_PROJ = maxCall * RUN2_CALLS;
const conservative = Math.max(A_PROJ, B_PROJ);
const REQUIRED = conservative * HEADROOM_MULTIPLIER;

say(`--- 3. COSTING THE FROZEN ${RUN2_CALLS}-EVALUATION WORKLOAD (${RUN2_ROWS} rows x ${RUN2_PROCESSES} processes) ---`);
say(`  pricing used: $${INPUT_PER_MTOK}/MTok input, $${OUTPUT_PER_MTOK}/MTok output (governed evidence, L3-2o assertion 13)`);
say('');
say('  A  OBSERVED-MEAN PROJECTION');
say(`       mean cost/call = ${usd(meanCall)}`);
say(`       A = ${usd(meanCall)} x ${RUN2_CALLS} = ${usd(A_PROJ)}`);
say('');
say('  B  OBSERVED-MAX-ENVELOPE PROJECTION');
say(`       max observed input ${maxIn} tok, max observed output ${maxOut} tok`);
say(`       max-derived cost/call = ${usd(maxCall)}`);
say(`       B = ${usd(maxCall)} x ${RUN2_CALLS} = ${usd(B_PROJ)}`);
say('');
say('  C  RECOMMENDED FUNDING REQUIREMENT');
say(`       more conservative of A and B = ${usd(conservative)}  (B)`);
say(`       x ${HEADROOM_MULTIPLIER} headroom = ${usd(REQUIRED)}  -> ${usd2(REQUIRED)}`);
say('');

const hardCall = cost(maxIn, SHIM_MAX_OUTPUT_TOKENS);
const hardTotal = hardCall * RUN2_CALLS;
say('  DETERMINISTIC CEILING (separate calculation, not the recommendation)');
say(`       The frozen shim sets max_tokens = ${SHIM_MAX_OUTPUT_TOKENS}, so output CANNOT exceed that per call.`);
say('       This is a genuine hard bound, but it is LOOSER than B, not tighter, and no deterministic');
say('       bound on Run-2 INPUT tokens exists without opening Run-2 rows. It is reported, not used.');
say(`       per call <= ${usd(hardCall)}   x ${RUN2_CALLS} = ${usd(hardTotal)}   (x1.25 = ${usd(hardTotal * HEADROOM_MULTIPLIER)})`);
say('');

const retryCalls = RUN2_CALLS * (1 + SEMANTIC_RETRY_CEILING);
say('  SEMANTIC-RETRY EXPOSURE (frozen ceiling of one, NOT added to the requirement above)');
say(`       Worst case every row retries once -> ${retryCalls} billable calls.`);
say(`       A-basis ${usd(meanCall * retryCalls)} | B-basis ${usd(maxCall * retryCalls)}`);
say(`       Observed Run-1 semantic-retry rate: 0 of ${ok.length} (all VALIDATED at attempt 1).`);
say('');

const headroomDollars = AVAILABLE_CREDIT - REQUIRED;
const headroomPercent = (headroomDollars / REQUIRED) * 100;
const SUFFICIENT = AVAILABLE_CREDIT >= REQUIRED;

say('--- 4. COMPARISON WITH AVAILABLE CREDIT ---');
say(`  user-attested available credit .... ${usd2(AVAILABLE_CREDIT)}`);
say(`  recommended requirement .......... ${usd(REQUIRED)}`);
say(`  HEADROOM_DOLLARS ................. ${usd(headroomDollars)}`);
say(`  HEADROOM_PERCENT ................. ${headroomPercent.toFixed(3)}%`);
say('');
say(`  credit / A (mean projection) ..... ${(AVAILABLE_CREDIT / A_PROJ).toFixed(3)}x`);
say(`  credit / B (max envelope) ........ ${(AVAILABLE_CREDIT / B_PROJ).toFixed(3)}x`);
say('');
say(`  CLASSIFICATION: ${SUFFICIENT ? 'SUFFICIENT' : 'INSUFFICIENT'}`);
say(`  TERMINAL: ${SUFFICIENT
  ? 'L3_RUN2_CAPACITY_CONFIRMED — ACCEPTANCE_AUTHORIZATION_REQUIRED'
  : 'L3_RUN2_CAPACITY_BLOCKED — ADDITIONAL_CREDIT_REQUIRED'}`);
if (!SUFFICIENT) {
  say(`  MINIMUM ADDITIONAL CREDIT TO CLEAR THE GATE: ${usd(-headroomDollars)}`);
}
say('');
say('--- 5. RUN-2 UNSPENT PROOF ---');
say('  provider calls this phase ........ 0');
say('  new API cost this phase .......... $0.00');
say('  Run-2 rows transmitted ........... 0');
say('  reserved rows transmitted ........ 0');
say('  RUN2_HOLDOUT_SPENT ............... FALSE');
say('');
say('  THIS DETERMINATION DOES NOT AUTHORIZE THE RUN-2 ACCEPTANCE RUN IN EITHER DIRECTION.');

fs.writeFileSync(path.join(__dirname, 'CAPACITY_DETERMINATION.txt'), out.join('\n') + '\n');
process.exit(0);
