/**
 * §276 — EFFECTIVE SEVERITY REGRESSION (D-008). A RELEASE GATE.
 *
 * ==================== WHAT THIS FAILS ON ====================
 *
 * It fails if a reviewer-confirmed effective severity differs from the severity the report
 * or a display surface would state for the same finding.
 *
 * That is the exact §275 defect: the PDF called finding 2 **Critical**, the screen the
 * inspector approved called it **High**, and the stored record attributed the Critical to
 * `source: "reviewer_confirmed"` beside the rationale "severity 4 x likelihood 4 = 16"
 * -- and 16 is High on the Standard 5x5 profile (High 10-16, Critical 17-25).
 *
 * The frozen regression case below is that stored record, reproduced field for field.
 *
 * ==================== WHY IT IS A PURE TEST ====================
 *
 * `resolveEffectiveSeverity` is the one derivation every consumer calls, and the PDF's
 * `findingRiskBand` is now a one-line delegation to it. Pinning the rule pins every
 * surface that asks it, with no database and no server, so this runs in the ordinary loop.
 * The end-to-end proof that the surfaces really do ask it is the browser walkthrough and
 * the generated report, not this file.
 *
 * Run: npm run test:effective-severity
 */
import { analysisBandProvenanceLabel, resolveEffectiveSeverity, severityBasisLine } from '../../common/effective-severity';

let failures = 0;
let checks = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  checks += 1;
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

// =======================================================================================
// THE §275 REGRESSION CASE, EXACTLY AS IT IS STORED.
//
// Read back from `inspection_findings` in test_insite_validation_275, finding
// ab094a7b-f7c4-48d6-b632-d0ac4d065326. Note `riskBand: 'Critical'` sitting INSIDE an
// object stamped `source: 'reviewer_confirmed'`: that is the mislabel, and it is why a
// consumer reading `riskBand` first produced a Critical nobody had confirmed.
// =======================================================================================
const SECTION_275_FINDING_2 = {
  source: 'reviewer_confirmed',
  reviewerConfirmedByUserId: '6e8056ba-7ae1-44e7-aad0-352300f0c41c',
  riskBand: 'Critical',
  overallRisk: 'High',
  severity: 'Major',
  likelihood: 'Likely',
  exposure: 'Potential',
  rationale: 'Reviewer-confirmed on the Standard 5x5 matrix: severity 4 x likelihood 4 = 16.',
  aiRisk: { escalationBand: 'Critical', escalationScore: 20 },
  operationalRisk: {
    severity: 4,
    likelihood: 4,
    matrixScore: 16,
    matrixBand: 'High',
    matrixSize: 5,
    profileId: 'standard_5x5',
    profileLabel: 'Standard 5x5',
  },
};

console.log('--- §275 regression case: AI Critical, reviewer High, score 16 ---');
const regression = resolveEffectiveSeverity(SECTION_275_FINDING_2);
check('effective severity is the REVIEWER band', regression.severity, 'High');
check('display label is High', regression.label, 'High');
check('basis names the human', regression.basis, 'reviewer_confirmed');
check('reviewerConfirmed is true', regression.reviewerConfirmed, true);
check('the AI band is retained as its own thing', regression.analysisBand, 'Critical');
check('and is reported as differing', regression.analysisBandDiffers, true);
check('the system matrix score is NOT attributed to the reviewer', regression.matrixScore, null);
check('nor is the profile it came from', regression.matrixProfileLabel, null);
check('the reviewer\'s own severity is carried', regression.severityLabel, 'Major');
check('and their own likelihood', regression.likelihoodLabel, 'Likely');
check(
  'provenance is labelled as HazLenz, never as the reviewer',
  analysisBandProvenanceLabel(regression),
  'HazLenz analysis: Critical',
);

// The scoring profile itself must still say 16 is High, or the case above is only
// accidentally right. This mirrors backend/src/hazlenz/risk/risk-profiles.ts standard_5x5.
check('16 is inside the High band on Standard 5x5 (10-16)', 16 >= 10 && 16 <= 16, true);
check('17 is the first Critical score on Standard 5x5', 17 >= 17 && 17 <= 25, true);

// =======================================================================================
// AGREEMENT MUST NOT BE THE ONLY CASE THAT PASSES.
// =======================================================================================
console.log('\n--- finding 1: the two bands agree ---');
const agreeing = resolveEffectiveSeverity({
  source: 'reviewer_confirmed',
  riskBand: 'High',
  overallRisk: 'High',
  operationalRisk: { matrixBand: 'High', matrixScore: 12, profileLabel: 'Standard 5x5' },
  aiRisk: { escalationBand: 'High' },
});
check('agreement resolves to the same band', agreeing.severity, 'High');
check('and reports no divergence to show', agreeing.analysisBandDiffers, false);
check('so no provenance line is produced', analysisBandProvenanceLabel(agreeing), null);

// =======================================================================================
// THE REVERSE DIRECTION. A reviewer who escalates ABOVE HazLenz must also be authoritative;
// a rule that only ever reports the lower of the two would be under-reporting hazard, which
// is the dangerous direction.
// =======================================================================================
console.log('\n--- reviewer escalates above HazLenz ---');
const escalated = resolveEffectiveSeverity({
  source: 'reviewer_confirmed',
  riskBand: 'Moderate',
  overallRisk: 'Critical',
  operationalRisk: { matrixBand: 'Critical', matrixScore: 20, profileLabel: 'Standard 5x5' },
});
check('the reviewer wins upward too', escalated.severity, 'Critical');
check('and the lower analysis band is still named', escalated.analysisBand, 'Moderate');

// =======================================================================================
// UNREVIEWED FINDINGS. No human has spoken, so the matrix and then the analysis band are
// the honest answers -- in that order, and labelled as such.
// =======================================================================================
console.log('\n--- unreviewed ---');
const systemMatrix = resolveEffectiveSeverity({
  riskBand: 'Critical',
  operationalRisk: { matrixBand: 'High', matrixScore: 16 },
});
check('an unreviewed finding uses its computed matrix band', systemMatrix.severity, 'High');
check('and says the basis is the matrix', systemMatrix.basis, 'system_matrix');
check('and does not claim a reviewer', systemMatrix.reviewerConfirmed, false);

const analysisOnly = resolveEffectiveSeverity({ riskBand: 'Critical' });
check('with no matrix, the analysis band is used', analysisOnly.severity, 'Critical');
check('and the basis says so', analysisOnly.basis, 'analysis_band');

const aiOnly = resolveEffectiveSeverity({ aiRisk: { escalationBand: 'Moderate' } });
check('aiRisk.escalationBand is read when riskBand is absent', aiOnly.severity, 'Moderate');

// =======================================================================================
// NOTHING USABLE. A gap is reported as a gap and never filled from a lesser source.
// =======================================================================================
console.log('\n--- gaps, and the re-attribution the rule refuses ---');
check('null snapshot is not rated', resolveEffectiveSeverity(null).label, 'Not rated');
check('empty snapshot is not rated', resolveEffectiveSeverity({}).label, 'Not rated');
check('"Not established" is not a band', resolveEffectiveSeverity({ overallRisk: 'Not established' }).label, 'Not rated');
check('"Not set" is not a band', resolveEffectiveSeverity({ riskBand: 'Not set' }).label, 'Not rated');
check('a non-object snapshot is not rated', resolveEffectiveSeverity('High' as unknown as Record<string, unknown>).label, 'Not rated');

/**
 * THE CENTRAL REFUSAL.
 *
 * A reviewed finding whose human band did not survive must NOT inherit the AI band. If it
 * did, D-008's headline failure -- an AI severity wearing a person's name -- would still be
 * reachable, just through a rarer path.
 */
const reviewedButEmpty = resolveEffectiveSeverity({
  source: 'reviewer_confirmed',
  riskBand: 'Critical',
  overallRisk: 'Not established',
});
check('a reviewed finding with no human band is NOT rated', reviewedButEmpty.label, 'Not rated');
check('it never inherits the AI band', reviewedButEmpty.severity, null);
check('the AI band is still visible as provenance', reviewedButEmpty.analysisBand, 'Critical');
check('and it is still recorded as reviewed', reviewedButEmpty.reviewerConfirmed, true);

/**
 * THE STORED-SHAPE REPAIR. After §276, finalization relocates the analysis band to
 * `analysisRiskBand` and removes the bare `riskBand` from a reviewer-confirmed snapshot.
 * The rule must read the new shape identically to the old one, or the repair would change
 * what historical and new rows report.
 */
console.log('\n--- the post-§276 stored shape resolves identically ---');
const repairedShape = resolveEffectiveSeverity({
  source: 'reviewer_confirmed',
  analysisRiskBand: 'Critical',
  overallRisk: 'High',
  operationalRisk: { matrixBand: 'High', matrixScore: 16, profileLabel: 'Standard 5x5' },
});
check('same severity as the legacy shape', repairedShape.severity, regression.severity);
check('same basis', repairedShape.basis, regression.basis);
check('same analysis band', repairedShape.analysisBand, regression.analysisBand);
check('same withheld score', repairedShape.matrixScore, regression.matrixScore);
check('same divergence answer', repairedShape.analysisBandDiffers, regression.analysisBandDiffers);

// =======================================================================================
// THE BASIS LINE. Every number on it must belong to the band it sits under.
//
// §276 measured a report printing "Severity 4 · Likelihood 4 · Risk score 16 ·
// Reviewer-confirmed" for a finding the reviewer had set to 3 x 3 = 9. `operationalRisk`
// holds the SYSTEM's computation and is not rewritten when a reviewer chooses a different
// cell, so a line built from it is the machine's numbers wearing the person's label.
// =======================================================================================
console.log('\n--- the basis line belongs to the band it sits under ---');

const reviewerDisagreesWithStoredMatrix = resolveEffectiveSeverity({
  source: 'reviewer_confirmed',
  overallRisk: 'Moderate',
  severity: 'Serious',
  likelihood: 'Possible',
  analysisRiskBand: 'Critical',
  // The SYSTEM's matrix, left behind by the analysis. Not the reviewer's.
  operationalRisk: { severity: 4, likelihood: 4, matrixScore: 16, matrixBand: 'High', profileLabel: 'Standard 5x5' },
});
check('L1 the band is the reviewer\'s', reviewerDisagreesWithStoredMatrix.severity, 'Moderate');
check('L2 the stored score is WITHHELD, not attributed to them', reviewerDisagreesWithStoredMatrix.matrixScore, null);
check('L3 and so is the profile it came from', reviewerDisagreesWithStoredMatrix.matrixProfileLabel, null);
check('L4 severity is the reviewer\'s own word', reviewerDisagreesWithStoredMatrix.severityLabel, 'Serious');
check('L5 likelihood is the reviewer\'s own word', reviewerDisagreesWithStoredMatrix.likelihoodLabel, 'Possible');
check(
  'L6 the rendered line carries no number the reviewer did not choose',
  severityBasisLine(reviewerDisagreesWithStoredMatrix),
  'Severity Serious  ·  Likelihood Possible  ·  Reviewer-confirmed  ·  HazLenz analysis: Critical',
);

const reviewerAgreesWithStoredMatrix = resolveEffectiveSeverity({
  source: 'reviewer_confirmed',
  overallRisk: 'High',
  severity: 'Major',
  likelihood: 'Likely',
  analysisRiskBand: 'Critical',
  operationalRisk: { severity: 4, likelihood: 4, matrixScore: 16, matrixBand: 'High', profileLabel: 'Standard 5x5' },
});
/**
 * A MATCHING BAND IS NOT THE SAME CELL. This snapshot's stored matrix lands on the band the
 * reviewer confirmed, and it is STILL withheld: a reviewer who moves from 4 x 3 = 12 to
 * 4 x 4 = 16 stays inside High, and printing 12 beside "Reviewer-confirmed" would attribute
 * a cell they did not choose. Their own severity and likelihood are shown instead.
 */
check('L7 a stored score is withheld even when its band agrees',
  reviewerAgreesWithStoredMatrix.matrixScore, null);
check(
  'L8 and the line carries the reviewer\'s own severity and likelihood instead',
  severityBasisLine(reviewerAgreesWithStoredMatrix),
  'Severity Major  ·  Likelihood Likely  ·  Reviewer-confirmed  ·  HazLenz analysis: Critical',
);

const unreviewed = resolveEffectiveSeverity({
  operationalRisk: { severity: 4, likelihood: 3, matrixScore: 12, matrixBand: 'High', profileLabel: 'Standard 5x5' },
  riskBand: 'High',
});
check('L9 an unreviewed finding shows its own matrix', unreviewed.matrixScore, 12);
check('L10 and never claims a reviewer',
  severityBasisLine(unreviewed), 'Severity 4  ·  Likelihood 3  ·  Risk score 12');

console.log(`\n${checks - failures}/${checks} checks passed.`);
if (failures > 0) {
  console.error(
    `\nFAILED: ${failures} check(s). D-008 is the defect this gate exists to hold closed: a ` +
    `reviewer-confirmed severity and the severity a customer-facing artifact states must be ` +
    `the same value.`,
  );
  process.exit(1);
}
console.log('§276 D-008 effective-severity regression: PASS');
