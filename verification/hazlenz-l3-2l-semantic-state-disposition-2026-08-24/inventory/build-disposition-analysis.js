/**
 * L3-2l -- the measured counterfactual behind the CLASS A decision.
 *
 * READ-ONLY over already-open diagnostic artifacts. Zero inference, zero production import.
 * It reads the inventory this package's build-inventory.js produced and computes, for each
 * disposition A-D, what would have happened on every recorded SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE
 * rejection in the programme.
 *
 * The scorer semantics it models are the SHIPPED ones, read from score-l32f-reasoning.ts:
 *   asserts            := some surviving candidate has conditionState === 'ACTIVE'
 *   hazardFound        := expect.hazardEstablished === true  && asserts
 *   highConsequenceMiss:= expect.hazardEstablished === true  && expect.highConsequence && !asserts
 *   falseActive        := expect.hazardEstablished !== true  && asserts
 *   clarificationUnnecessary := expect.clarificationExpected === false && some candidate carries one
 */
const fs = require('fs'), path = require('path');
const HERE = __dirname;
const { rows } = JSON.parse(fs.readFileSync(path.join(HERE, 'semantic-state-rejection-inventory.json'), 'utf8'));

// One row per (scenario, proposedState). Repeat runs of the same pair are collapsed and counted.
const byPair = new Map();
for (const r of rows) {
  const k = r.scenario + '|' + r.proposedState;
  if (!byPair.has(k)) byPair.set(k, { ...r, occurrences: 0, artifacts: new Set() });
  const e = byPair.get(k); e.occurrences += 1; e.artifacts.add(r.artifact);
}
const pairs = [...byPair.values()].map(p => ({ ...p, artifacts: [...p.artifacts] }));

const kindOf = r => r.expectHazard === true ? 'REAL_HAZARD'
                  : r.expectHazard === false ? 'NEGATIVE_CONTROL' : 'NO_GROUND_TRUTH';

// Under EVERY disposition the surviving state is non-ACTIVE except under C, which invents ACTIVE.
const dispositions = {
  A_DELETE:            { survives: false, state: null,                   inventsDecidedState: false },
  B_DEMOTE_UNDECIDED:  { survives: true,  state: 'INSUFFICIENT_EVIDENCE', inventsDecidedState: false },
  C_REDERIVE_ACTIVE:   { survives: true,  state: 'ACTIVE',                inventsDecidedState: true  },
  D_PRESERVE_REJECT:   { survives: true,  state: 'INSUFFICIENT_EVIDENCE', inventsDecidedState: false },
};

const out = {};
for (const [name, d] of Object.entries(dispositions)) {
  const t = {
    hazardRecovered: 0, highConsequenceRecovered: 0, highConsequenceStillMissed: 0,
    falseActiveIntroduced: 0, falseActiveIds: [],
    negativeControlCandidatesPreserved: 0, unnecessaryClarificationsIntroduced: 0,
    unnecessaryClarificationIds: [], candidatesStillDeleted: 0,
  };
  for (const r of pairs) {
    const kind = kindOf(r);
    const asserts = d.survives && d.state === 'ACTIVE';
    if (!d.survives) t.candidatesStillDeleted += 1;
    if (kind === 'REAL_HAZARD') {
      if (asserts) { t.hazardRecovered += 1; if (r.expectHC) t.highConsequenceRecovered += 1; }
      else if (r.expectHC) t.highConsequenceStillMissed += 1;
    } else if (kind === 'NEGATIVE_CONTROL') {
      if (d.survives) t.negativeControlCandidatesPreserved += 1;
      if (asserts) { t.falseActiveIntroduced += 1; t.falseActiveIds.push(r.scenario); }
      // a demoted candidate at an UNDECIDED state carries a clarification by the L3-2c precedent
      if (d.survives && !asserts && r.expectClar === false) {
        t.unnecessaryClarificationsIntroduced += 1; t.unnecessaryClarificationIds.push(r.scenario);
      }
    }
  }
  out[name] = t;
}

const result = {
  phase: 'L3-2l',
  role: 'ARCHITECTURE_DECISION_EVIDENCE -- READ ONLY OVER ALREADY-OPEN ARTIFACTS, ZERO INFERENCE',
  generatedAt: new Date().toISOString(),
  code: 'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE',
  corpus: {
    artifactsScanned: 34,
    recordsCarryingBinderOutput: 1871,
    rejectionOccurrences: rows.length,
    distinctScenarioStatePairs: pairs.length,
    distinctScenarios: new Set(rows.map(r => r.scenario)).size,
  },
  structuralFinding: {
    statesThisCheckCanRefuse: ['CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL', 'CONTROLLED'],
    activeIsOutOfScope: true,
    everRefusedAnActiveCandidate: rows.some(r => r.proposedState === 'ACTIVE'),
    consequence:
      'checkStateSupported can only ever refuse a NON-ACTIVE state. Every candidate it deletes was ' +
      'already non-ACTIVE, so deletion and demotion are BOTH non-asserting. The delete-vs-demote ' +
      'choice therefore cannot move hazard detection, false ACTIVE, or the high-consequence gate.',
  },
  breakdown: {
    REAL_HAZARD: pairs.filter(r => kindOf(r) === 'REAL_HAZARD').length,
    NEGATIVE_CONTROL: pairs.filter(r => kindOf(r) === 'NEGATIVE_CONTROL').length,
    NO_GROUND_TRUTH: pairs.filter(r => kindOf(r) === 'NO_GROUND_TRUTH').length,
  },
  dispositionCounterfactual: out,
  realHazardRows: pairs.filter(r => kindOf(r) === 'REAL_HAZARD').map(r => ({
    scenario: r.scenario, proposedState: r.proposedState, expectState: r.expectState,
    highConsequence: r.expectHC, controlAdequacy: r.controlAdequacy, occurrences: r.occurrences,
    artifacts: r.artifacts,
  })),
  negativeControlRows: pairs.filter(r => kindOf(r) === 'NEGATIVE_CONTROL').map(r => ({
    scenario: r.scenario, proposedState: r.proposedState, text: r.text,
    clarificationExpected: r.expectClar, controlAdequacy: r.controlAdequacy, occurrences: r.occurrences,
  })),
};
fs.writeFileSync(path.join(HERE, 'DISPOSITION_ANALYSIS.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ structuralFinding: result.structuralFinding, breakdown: result.breakdown, dispositionCounterfactual: out }, null, 1));
