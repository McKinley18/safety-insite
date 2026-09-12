/**
 * §188 -- PROVIDER SPEND ACCOUNTING REGRESSION. ZERO PROVIDER REQUESTS.
 *
 * There is no provider, no fetch, no credential read and no network in this file. Every number is
 * either arithmetic over `ProviderSpendLedger` or is read from the PERSISTED §187A evidence on
 * disk, so the assertions measure the real defect rather than a description of it.
 *
 * ==================== WHAT THIS HAS TO PROVE ====================
 *
 * §187A reported `TOTAL_ACTUAL_COST_USD = 1.22255` for a run that spent $0.26255. The $0.96
 * difference is fifteen frozen worst-case reservations of $0.064, charged for fifteen HTTP 400
 * credit rejections that consumed zero tokens and cost nothing.
 *
 * The assertions are deliberately exact -- `=== 0.26255`, not `<= 1.22255` -- because a spend
 * report that is merely bounded above by the truth is the defect, not a repair of it. Section C
 * reconstructs both figures from the persisted artifacts, so if either the ledger or the evidence
 * moves, this test fails rather than the claim quietly becoming false.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  ProviderSpendLedger, legacySingleCounterTotalUsd, computeCallCostUsd,
  type ProviderCallOutcome, type ProviderPricing,
} from './lib/expert-provider-spend-accounting';

const ROOT = join(__dirname, '..', '..');
const EVID187 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05');

/** The §187A preregistered rates. Read from the frozen preregistration rather than restated. */
const PREREG = JSON.parse(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));
const PRICING: ProviderPricing = {
  inputUsdPerMTok: PREREG.provider_model.inputUsdPerMTok,
  outputUsdPerMTok: PREREG.provider_model.outputUsdPerMTok,
};
const WORST_VERIFIER_USD: number = PREREG.caps.worstCaseVerifierUsd;

let passed = 0; let failed = 0;
function assert(label: string, ok: boolean, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}${detail ? '  -- ' + detail : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

const ok = (i: number, o: number): ProviderCallOutcome =>
  ({ ok: true, inputTokens: i, outputTokens: o, worstCaseUsd: WORST_VERIFIER_USD });
/** An HTTP 400 before inference: no usage of any kind came back. */
const rejected = (): ProviderCallOutcome =>
  ({ ok: false, inputTokens: null, outputTokens: null, worstCaseUsd: WORST_VERIFIER_USD });

function main(): void {
  console.log('\nA. A FAILED CALL WITH NO PROVIDER USAGE COSTS NOTHING\n');

  {
    const l = new ProviderSpendLedger(PRICING);
    l.record(rejected());
    const r = l.report();
    assert('A.1 actual spend for one zero-usage rejection is exactly 0',
      r.actualProviderSpendUsd === 0, `$${r.actualProviderSpendUsd}`);
    assert('A.2 the guard still reserves the frozen worst case',
      r.budgetReservedUsd === WORST_VERIFIER_USD, `$${r.budgetReservedUsd}`);
    assert('A.3 the reservation is reported separately and named as synthetic',
      r.syntheticReservationUsd === WORST_VERIFIER_USD, `$${r.syntheticReservationUsd}`);
    assert('A.4 the zero-usage call is counted', r.callsWithNoProviderUsage === 1);
  }

  {
    const l = new ProviderSpendLedger(PRICING);
    for (let i = 0; i < 15; i += 1) l.record(rejected());
    const r = l.report();
    assert('A.5 fifteen zero-usage rejections still cost exactly 0',
      r.actualProviderSpendUsd === 0, `$${r.actualProviderSpendUsd}`);
    assert('A.6 fifteen reservations stand in the guard',
      r.budgetReservedUsd === 0.96, `$${r.budgetReservedUsd}`);
  }

  console.log('\nB. A SUCCESSFUL CALL IS PRICED FROM PROVIDER-RETURNED USAGE\n');

  {
    const l = new ProviderSpendLedger(PRICING);
    const cost = l.record(ok(20159, 1547));
    const r = l.report();
    assert('B.1 cost comes from the returned token counts',
      Math.abs(cost - computeCallCostUsd({ inputTokens: 20159, outputTokens: 1547 }, PRICING)) < 1e-12,
      `$${cost.toFixed(6)}`);
    assert('B.2 a successful call carries no synthetic reservation',
      r.syntheticReservationUsd === 0, `$${r.syntheticReservationUsd}`);
    assert('B.3 actual and reserved agree when every call reported usage',
      r.actualProviderSpendUsd === r.budgetReservedUsd);
  }

  {
    // A failure that DID consume tokens is charged its real usage, not zero and not the worst case.
    const l = new ProviderSpendLedger(PRICING);
    l.record({ ok: false, inputTokens: 1000, outputTokens: 100, worstCaseUsd: WORST_VERIFIER_USD });
    const r = l.report();
    assert('B.4 a failure that reported usage is charged that usage',
      Math.abs(r.actualProviderSpendUsd - 0.003) < 1e-9, `$${r.actualProviderSpendUsd}`);
    assert('B.5 and receives no worst-case reservation on top',
      r.syntheticReservationUsd === 0, `$${r.syntheticReservationUsd}`);
  }

  console.log('\nC. THE §187A RUN, RECONSTRUCTED FROM THE PERSISTED EVIDENCE\n');

  const stimuli = JSON.parse(readFileSync(join(EVID187, 'FIRST-PASS-STIMULI.json'), 'utf8'));
  const runSummary = JSON.parse(readFileSync(join(EVID187, 'RUN-SUMMARY.json'), 'utf8'));
  const costCorrection = JSON.parse(readFileSync(join(EVID187, 'COST-CORRECTION.json'), 'utf8'));

  const firstPass: ProviderCallOutcome[] = stimuli.stimuli.map((s: any) => ({
    ok: s.telemetry.httpStatus === 200,
    inputTokens: s.telemetry.promptTokens,
    outputTokens: s.telemetry.outputTokens,
    worstCaseUsd: PREREG.caps.worstCaseFirstPassUsd,
  }));
  assert('C.1 five first-pass calls are on disk and all returned usage',
    firstPass.length === 5 && firstPass.every(c => (c.inputTokens ?? 0) > 0));

  const verifierAttempts: ProviderCallOutcome[] = Array.from({ length: 15 }, rejected);

  const ledger = new ProviderSpendLedger(PRICING);
  for (const c of [...firstPass, ...verifierAttempts]) ledger.record(c);
  const r = ledger.report();

  assert('C.2 the corrected ledger reproduces the actual §187A spend exactly',
    r.actualProviderSpendUsd === 0.26255, `$${r.actualProviderSpendUsd}`);
  assert('C.3 which is the figure COST-CORRECTION.json records',
    r.actualProviderSpendUsd === costCorrection.actualMoneySpentUsd,
    `$${costCorrection.actualMoneySpentUsd}`);
  assert('C.4 the guard position is the conservative $1.22255',
    r.budgetReservedUsd === 1.22255, `$${r.budgetReservedUsd}`);
  assert('C.5 the synthetic reservation is exactly the $0.96 §187A misreported',
    r.syntheticReservationUsd === 0.96, `$${r.syntheticReservationUsd}`);
  assert('C.6 twenty calls attempted, fifteen of them with no provider usage',
    r.callsAttempted === 20 && r.callsWithNoProviderUsage === 15);

  const legacy = legacySingleCounterTotalUsd([...firstPass, ...verifierAttempts], PRICING);
  assert('C.7 the legacy single counter reproduces the erroneous historical figure',
    legacy === 1.22255, `$${legacy}`);
  assert('C.8 which is what RUN-SUMMARY.json still reports, unedited, as run evidence',
    legacy === runSummary.TOTAL_ACTUAL_COST_USD, `$${runSummary.TOTAL_ACTUAL_COST_USD}`);
  assert('C.9 the corrected and legacy figures differ -- this is the defect, in one line',
    legacy !== r.actualProviderSpendUsd,
    `legacy $${legacy} vs actual $${r.actualProviderSpendUsd}`);

  console.log('\nD. THE GUARD STILL GUARDS\n');

  {
    const l = new ProviderSpendLedger(PRICING);
    for (let i = 0; i < 15; i += 1) l.record(rejected());
    assert('D.1 reservations count toward the ceiling, so a failing run cannot overrun',
      l.wouldExceedCeiling(WORST_VERIFIER_USD, 1.00) === true);
    assert('D.2 and a run within budget is not blocked',
      l.wouldExceedCeiling(WORST_VERIFIER_USD, 2.00) === false);
  }

  console.log('\nE. §187B DID NOT REPRODUCE THE DEFECT\n');

  const resume = JSON.parse(readFileSync(join(EVID187, 'RESUME-RUN-SUMMARY.json'), 'utf8'));
  const behavioral = readFileSync(join(EVID187, 'RESUMED-VERIFIER-EXECUTIONS.jsonl'), 'utf8')
    .trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
    .filter((x: any) => x.behavioralExecution === true);
  const l187b = new ProviderSpendLedger(PRICING);
  for (const x of behavioral) {
    l187b.record({
      ok: x.providerOk === true,
      inputTokens: x.usage?.inputTokens ?? null,
      outputTokens: x.usage?.outputTokens ?? null,
      worstCaseUsd: WORST_VERIFIER_USD,
    });
  }
  const r187b = l187b.report();
  assert('E.1 fifteen behavioral executions are on disk', behavioral.length === 15);
  assert('E.2 the corrected ledger reproduces the §187B reported spend',
    r187b.actualProviderSpendUsd === resume.ACTUAL_PROVIDER_SPEND_USD,
    `$${r187b.actualProviderSpendUsd} vs $${resume.ACTUAL_PROVIDER_SPEND_USD}`);
  assert('E.3 §187B carried no synthetic reservation',
    r187b.syntheticReservationUsd === 0, `$${r187b.syntheticReservationUsd}`);
  assert('E.4 cumulative actual §187A + §187B is $0.54182',
    Number((0.26255 + r187b.actualProviderSpendUsd).toFixed(5)) === 0.54182,
    `$${(0.26255 + r187b.actualProviderSpendUsd).toFixed(5)}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0');
  if (failed > 0) process.exit(1);
}

main();
