/**
 * L3-2j -- BOTH CLARIFICATION DENOMINATORS, over the shipped-pipeline corpus runs. `D-58`.
 *
 * ============================ WHY THE LOCKED SCORER IS NOT USED UNMODIFIED ============================
 *
 * `rederive-l32g-resolution.ts` is the instrument that owns these two denominators, and it is NOT
 * touched here. It cannot score these runs, and the reason is worth stating rather than working
 * around silently: its scenario-level metric detects the CANDIDATE carrier by re-resolving
 * `row.derived[].facts` -- the six separated `stateFacts` -- because every run it has ever been given
 * came from a STRUCTURAL variant. The shipped prompt is the LADDER. It emits no `stateFacts`, so
 * `derived` is null on every row, and the locked scorer would score a run that carried all five of
 * its questions on hazard candidates as 0/5.
 *
 * That is not a defect in the locked scorer -- it is the boundary of what it was built to measure --
 * and quietly editing it to widen that boundary would have changed the instrument that produced
 * L3-2g's, L3-2h's and L3-2i's recorded numbers. So this program implements `D-58`'s two definitions
 * for LADDER rows, under the SAME names, and lifts the definition text verbatim out of a frozen
 * artifact the locked scorer itself emitted, so the wording provably cannot drift.
 *
 * ============================ WHAT IS AND IS NOT RENAMED ============================
 *
 * NOTHING IS RENAMED. `D-58` exists because a 75% travelled through two blueprint sections under the
 * wrong denominator. The candidate-conditioned metric keeps its meaning -- `CLARIFICATION_REQUIRED`
 * scenarios in which the provider emitted at least one candidate -- and the scenario-level metric
 * keeps its meaning -- ALL of them, a zero-candidate row a MISS. High-consequence and false-ACTIVE
 * are reported under a THIRD, separate name, `modelAssertedHighConsequenceRecall`, because on ladder
 * rows they cannot be the candidate-conditioned figures sections 37-39 recorded and must not be
 * mistaken for them.
 *
 * Run: IN=a.json,b.json OUT=... npx ts-node scripts/score-l32j-clarification-denominators.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const SCORER_VERSION = 'hazlenz.l32j.ladder-clarification-scorer.v1' as const;

/**
 * The two definitions, lifted verbatim from an artifact the LOCKED scorer emitted. Reading them
 * rather than retyping them is the same rule as importing a prompt variant rather than reproducing
 * it (section 34.1): a definition that has been retyped is a definition that can quietly differ.
 */
function metricDefinitionsFromFrozenArtifact(): Record<string, string> {
  const frozen = join(
    __dirname, '..', '..', 'verification', 'hazlenz-l3-2i-clarification-carrier-2026-08-24',
    'results', 'scenario-score-V_CARRIER.json',
  );
  const defs = JSON.parse(readFileSync(frozen, 'utf8')).metricDefinitions;
  if (!defs?.candidateConditionedClarificationRecall || !defs?.scenarioLevelClarificationRecall) {
    throw new Error('the frozen L3-2i artifact does not carry D-58\'s metric definitions');
  }
  return defs;
}

/** Which prompt each recorded run actually sent. The sha is the identity; the id is only a label. */
const REVISION_BY_PROMPT_SHA: Record<string, string> = {
  b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf: 'v6-no-declaration',
  b7f351115d71c6e51992c4430e4f88c46c5560bbe7f691e0bd52afacd52ea9b2: 'declaration-rev1',
  '45862b26e880faf317de73949872b72746d903737514acbb87764258ab8fd382': 'declaration-rev2',
};

interface Row {
  scenarioId: string; pole: string; variant: string;
  expectActive: boolean; expectClarification: boolean;
  candidateCount: number;
  modelAssertsActive: boolean;
  candidateBorneClarification: boolean;
  validatedProposalLevelClarification: boolean;
  clarificationCarriedAnywhere: boolean;
  validationState: string | null;
}

function score(rows: Row[]) {
  const clarRequired = rows.filter(r => r.expectClarification);
  const withCandidates = clarRequired.filter(r => r.candidateCount > 0);

  // CANDIDATE-CONDITIONED. Denominator excludes zero-candidate scenarios, exactly as recorded in
  // sections 37.2/37.4 and 38.2. DIAGNOSTIC.
  const ccHit = withCandidates.filter(r => r.candidateBorneClarification).length;

  // SCENARIO-LEVEL. Denominator is ALL of them; either carrier counts. ADVANCEMENT-RELEVANT.
  const slHit = clarRequired.filter(r => r.clarificationCarriedAnywhere).length;

  const raised = rows.filter(r => r.candidateBorneClarification || r.validatedProposalLevelClarification);
  const hcRows = rows.filter(r => r.expectActive);
  const nonActive = rows.filter(r => !r.expectActive);

  return {
    candidateConditionedClarificationRecall: {
      hit: ccHit, expected: withCandidates.length,
      percent: withCandidates.length ? +(ccHit / withCandidates.length * 100).toFixed(1) : null,
      excludedZeroCandidateIds: clarRequired.filter(r => r.candidateCount === 0).map(r => r.scenarioId),
    },
    scenarioLevelClarificationRecall: {
      hit: slHit, expected: clarRequired.length,
      percent: clarRequired.length ? +(slHit / clarRequired.length * 100).toFixed(1) : null,
      missedIds: clarRequired.filter(r => !r.clarificationCarriedAnywhere).map(r => r.scenarioId),
      zeroCandidateMissIds: clarRequired
        .filter(r => !r.clarificationCarriedAnywhere && r.candidateCount === 0).map(r => r.scenarioId),
      carriedByCandidate: clarRequired.filter(r => r.candidateBorneClarification).map(r => r.scenarioId),
      carriedByProposalLevelCarrier: clarRequired
        .filter(r => r.validatedProposalLevelClarification && !r.candidateBorneClarification).map(r => r.scenarioId),
    },
    clarificationPrecision: {
      hit: raised.filter(r => r.expectClarification).length, raised: raised.length,
      percent: raised.length ? +(raised.filter(r => r.expectClarification).length / raised.length * 100).toFixed(1) : null,
      unnecessaryIds: raised.filter(r => !r.expectClarification).map(r => r.scenarioId),
    },
    modelAssertedHighConsequenceRecall: {
      note: 'A THIRD, SEPARATELY NAMED metric. NOT the candidate-conditioned high-consequence figure '
        + 'recorded in sections 37-39, which is computed over resolved stateFacts and does not exist '
        + 'for ladder rows. Denominator: every scenario the cohort expects to assert ACTIVE.',
      recovered: hcRows.filter(r => r.modelAssertsActive).length, expected: hcRows.length,
      missedIds: hcRows.filter(r => !r.modelAssertsActive).map(r => r.scenarioId),
    },
    modelAssertedFalseActive: {
      count: nonActive.filter(r => r.modelAssertsActive).length, of: nonActive.length,
      ids: nonActive.filter(r => r.modelAssertsActive).map(r => r.scenarioId),
    },
    validation: {
      valid: rows.filter(r => r.validationState === 'VALID').length, of: rows.length,
      nonValid: rows.filter(r => r.validationState !== 'VALID')
        .map(r => ({ scenarioId: r.scenarioId, state: r.validationState })),
    },
  };
}

function main() {
  const inPaths = (process.env.IN || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!inPaths.length) throw new Error('IN=<one or more corpus artifacts, comma separated> is required');

  const out: any = {
    phase: 'L3-2j', role: 'BOTH_CLARIFICATION_DENOMINATORS_OVER_LADDER_RUNS',
    generatedAt: new Date().toISOString(),
    scorerVersion: SCORER_VERSION,
    providerVariance: 'ZERO_BY_CONSTRUCTION -- no inference is performed; rows are read from the corpus runs',
    lockedScorerNotUsed:
      'rederive-l32g-resolution.ts detects the candidate carrier through resolved stateFacts, which '
      + 'ladder rows do not have. It is BYTE-UNCHANGED by this phase and its recorded numbers stand.',
    metricDefinitions: metricDefinitionsFromFrozenArtifact(),
    variants: {} as Record<string, unknown>,
  };

  for (const p of inPaths) {
    const a = JSON.parse(readFileSync(p, 'utf8'));
    // Two runs can share a variant id and be different experiments -- the declaration lived in the
    // shipped prompt while the recorded runs were taken, so `V_ACTIVATED` names revision 1 in one
    // directory and revision 2 in another. The prompt sha is what actually distinguishes them, so it
    // is what the key is built from.
    const revision = REVISION_BY_PROMPT_SHA[a.shippedPath.promptUsedSha256] ?? 'UNKNOWN_PROMPT';
    const key = `${a.variant.id} [${revision}${a.variant.carrierPresentInSchema ? '+schema' : ''}] pid${a.processIsolation.pid}`;
    out.variants[key] = {
      source: p,
      label: a.variant.label,
      declarationRevision: a.variant.declarationRevision ?? a.variant.carrierDeclared ?? null,
      carrierPresentInSchema: a.variant.carrierPresentInSchema ?? null,
      promptSha256: a.shippedPath.promptUsedSha256,
      pid: a.processIsolation.pid,
      ...score(a.rows as Row[]),
    };
  }

  const dest = process.env.OUT || 'score-l32j.json';
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log(`\nBOTH CLARIFICATION DENOMINATORS -- ${SCORER_VERSION}  (D-58: never rename one into the other)\n`);
  console.log(pad('variant', 52) + pad('cand-cond', 12) + pad('scenario', 12) + pad('precision', 11)
    + pad('HC(model)', 11) + pad('falseACT', 10) + 'unnecessary');
  for (const [id, v] of Object.entries<any>(out.variants)) {
    console.log(
      pad(id, 52)
      + pad(`${v.candidateConditionedClarificationRecall.hit}/${v.candidateConditionedClarificationRecall.expected}`, 12)
      + pad(`${v.scenarioLevelClarificationRecall.hit}/${v.scenarioLevelClarificationRecall.expected}`, 12)
      + pad(v.clarificationPrecision.percent ?? '-', 11)
      + pad(`${v.modelAssertedHighConsequenceRecall.recovered}/${v.modelAssertedHighConsequenceRecall.expected}`, 11)
      + pad(`${v.modelAssertedFalseActive.count}/${v.modelAssertedFalseActive.of}`, 10)
      + (v.clarificationPrecision.unnecessaryIds.join(',') || '-'));
  }
  console.log('\ncand-cond = candidate-conditioned (DIAGNOSTIC). scenario = scenario-level (ADVANCEMENT-RELEVANT).');
  console.log('HC(model) is a THIRD metric and is NOT sections 37-39\'s candidate-conditioned figure.');
  console.log(`\nwrote ${dest}`);
}

main();
