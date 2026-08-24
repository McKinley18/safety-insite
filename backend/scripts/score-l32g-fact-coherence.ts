/**
 * L3-2g -- FACT-LEVEL COHERENCE AND CORRECTNESS. This is what separates Question C's three answers.
 *
 * THE ARGUMENT. Once the six questions are structurally separated they no longer compete: each is
 * asked on its own, about its own span, and answering one does not consume the slot another needed.
 * So if the answers are STILL wrong or STILL unstable, the cause cannot be that one obligation
 * out-ranked another -- there is no ranking left to blame. What remains is the provider's ability to
 * answer a direct semantic question, which is `PROVIDER_CAPABILITY_BOUND`.
 *
 * Conversely, if the facts come back individually correct and stable but the STATE is still wrong,
 * the fault is in the resolution layer and the finding is `CONTRACT_REPRESENTATION_BOUND`.
 *
 * TWO MEASUREMENTS.
 *
 *   INTERNAL COHERENCE  pairs of facts that cannot both be true of the same text. These need no
 *                       expected labels at all -- they are contradictions the model makes with
 *                       ITSELF, which is the cleanest possible capability signal, free of any
 *                       judgement by this phase about what the right answer was.
 *
 *   CONTROL-READING CORRECTNESS  the one fact with an unambiguous expected value on the
 *                       control-adequacy cohort, which is §36.4's axis. Warning tape is WARNS_ONLY;
 *                       a strapped-down two-hand control is DEFEATED. If the model answers this
 *                       correctly in isolation, the contract can express what §36.4 needed.
 *
 * Run: IN1=... IN2=... OUT=... npx ts-node scripts/score-l32g-fact-coherence.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { L3StateFacts } from '../src/safescope-v2/reasoning-l3/state-facts';

interface Row {
  scenarioId: string; pole: string; variant: string;
  derived: Array<{ facts?: L3StateFacts; family?: string }> | null;
}

/**
 * Contradictions the text cannot license. Each is stated so that a violation is unarguable -- these
 * are not close judgement calls, and none depends on this phase's opinion of the scenario.
 */
const INCOHERENCE_CHECKS: Array<{ id: string; why: string; test: (f: L3StateFacts) => boolean }> = [
  {
    id: 'DENIED_AND_ASSERTED',
    why: 'the same condition cannot be both explicitly denied and asserted as fact',
    test: f => f.hazardExplicitlyDenied && f.hazardAsserted,
  },
  {
    id: 'CONDITIONAL_AND_ASSERTED',
    why: 'a purely contingent framing cannot also assert the condition as presently existing',
    test: f => f.framing === 'CONDITIONAL' && f.hazardAsserted,
  },
  {
    id: 'ASSERTED_WITHOUT_QUOTE',
    why: 'hazardAsserted is true but no span was supplied to carry it',
    test: f => f.hazardAsserted && f.hazardAssertionQuote.trim() === '',
  },
  {
    id: 'MISSING_WITHOUT_FACT',
    why: 'decisionCriticalFactMissing is true but the missing fact was not named',
    test: f => f.decisionCriticalFactMissing && !f.missingFact,
  },
  {
    id: 'CONTROL_CLAIMED_WITHOUT_QUOTE',
    why: 'a specific control reading was asserted with no span describing any control',
    test: f => ['PREVENTS_CONTACT', 'DEFEATED', 'WARNS_ONLY'].includes(f.controlReading) && !f.controlQuote,
  },
  {
    id: 'CORRECTED_AND_ABSENT_CONTROL',
    why: 'the hazard is said to have been put right while a required control is said to be absent',
    test: f => f.disposition === 'CORRECTED' && f.controlReading === 'ABSENT',
  },
];

/** The control-adequacy cohort, where the expected control reading is not in dispute. */
const EXPECTED_CONTROL_READING: Record<string, { expect: string[]; why: string }> = {
  'E-FLD-147': { expect: ['WARNS_ONLY'], why: 'standard warning tape marks the opening; it prevents no contact' },
  'F-WC-02': { expect: ['WARNS_ONLY'], why: 'a DANGER sign fixed to a post beside an open pit is a warning' },
  'F-WC-03': { expect: ['WARNS_ONLY'], why: 'a morning briefing and an instruction to step around it are administrative' },
  'F-WC-09': { expect: ['DEFEATED'], why: 'the two-hand control has been strapped down with tape' },
  'E-OA-07': { expect: ['ABSENT'], why: '"unsupported roof" states the required support is absent' },
  'F-COR-01': { expect: ['PREVENTS_CONTACT'], why: 'a proper blanking plate was fitted' },
};

function main() {
  const paths = [process.env.IN1, process.env.IN2].filter(Boolean) as string[];
  const rows: Row[] = [];
  for (const p of paths) rows.push(...JSON.parse(readFileSync(p, 'utf8')).rows);
  const structural = rows.filter(r => r.derived && r.derived.length);

  const byVariant: Record<string, any> = {};
  const incoherenceRows: any[] = [];
  const controlRows: any[] = [];

  for (const r of structural) {
    const v = byVariant[r.variant] ||= {
      candidates: 0, incoherent: 0, byCheck: {} as Record<string, number>,
      controlScored: 0, controlCorrect: 0,
    };
    for (const d of r.derived!) {
      const f = d.facts;
      if (!f) continue;
      v.candidates += 1;
      let bad = false;
      for (const c of INCOHERENCE_CHECKS) {
        if (c.test(f)) {
          bad = true;
          v.byCheck[c.id] = (v.byCheck[c.id] || 0) + 1;
          incoherenceRows.push({ scenarioId: r.scenarioId, variant: r.variant, check: c.id, why: c.why, facts: f });
        }
      }
      if (bad) v.incoherent += 1;
    }
    const exp = EXPECTED_CONTROL_READING[r.scenarioId];
    if (exp) {
      // Score the candidate whose control reading is most specific; a multi-candidate answer counts
      // as correct if ANY candidate read the control correctly, which is the generous direction.
      const readings = r.derived!.map(d => d.facts?.controlReading).filter(Boolean) as string[];
      const ok = readings.some(x => exp.expect.includes(x));
      v.controlScored += 1; if (ok) v.controlCorrect += 1;
      controlRows.push({ scenarioId: r.scenarioId, variant: r.variant, expected: exp.expect, got: readings, correct: ok, why: exp.why });
    }
  }

  for (const v of Object.values<any>(byVariant)) {
    v.incoherencePct = v.candidates ? +(v.incoherent / v.candidates * 100).toFixed(1) : null;
    v.controlAccuracy = v.controlScored ? `${v.controlCorrect}/${v.controlScored}` : 'n/a';
  }

  const out = {
    phase: 'L3-2g', role: 'FACT_LEVEL_COHERENCE_AND_CORRECTNESS_FOR_QUESTION_C',
    generatedAt: new Date().toISOString(),
    checks: INCOHERENCE_CHECKS.map(c => ({ id: c.id, why: c.why })),
    expectedControlReadings: EXPECTED_CONTROL_READING,
    byVariant, incoherenceRows, controlRows,
  };
  const dest = process.env.OUT || 'fact-coherence.json';
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log('\n' + pad('variant', 22) + pad('cands', 8) + pad('incoherent', 13) + pad('control-reading', 18) + 'checks tripped');
  for (const [k, v] of Object.entries<any>(byVariant)) {
    console.log(pad(k, 22) + pad(v.candidates, 8) + pad(`${v.incoherent} (${v.incoherencePct}%)`, 13)
      + pad(v.controlAccuracy, 18) + JSON.stringify(v.byCheck));
  }
  console.log('\ncontrol-reading detail:');
  for (const c of controlRows) {
    console.log(`  ${c.correct ? 'ok  ' : 'WRONG'} ${pad(c.scenarioId, 12)}${pad(c.variant, 20)} expected ${c.expected} got ${JSON.stringify(c.got)}`);
  }
  console.log(`\nwrote ${dest}`);
}

main();
