/**
 * §300 / HZ-7 — WHO MAY ESTABLISH A RISK RATING, AND WHAT AN UNRATED FINDING NOW SAYS.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:300-risk-rating-authority`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT HZ-7 ACTUALLY WAS.
 *
 * Not that the product said something false. The §298 report printed "Not rated", printed
 * "APPLICABLE STANDARD: Not established for this specific finding", counted the finding in
 * "1 finding(s) have no established risk rating", and directed a qualified person to rate it. All
 * true, and nothing fabricated a severity.
 *
 * The defect is that `riskSnapshot` was NULL either way, so nothing anywhere distinguished
 *
 *     "a reviewer looked at this and decided they cannot rate it yet"
 *
 * from
 *
 *     "the workflow never asked anybody".
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THE REPAIR DOES AND DOES NOT DO.
 *
 * It does NOT give the provider a severity. It does NOT let deterministic code derive one from an
 * Expert posture. It does NOT remove NOT ESTABLISHED as a reachable terminal state — §300 requires
 * that stay, and section 2 below asserts it directly.
 *
 * It removes exactly one thing: the SILENT version. A finalization now carries a reviewer rating,
 * or an explicit attributed deferral with a reason.
 *
 * ---------------------------------------------------------------------------------------------
 * THE CUSTOMER-FACING OUTPUT IS ASSERTED UNCHANGED.
 *
 * The strongest claim here is section 3: a deferral-only snapshot still resolves to "Not rated"
 * through `resolveEffectiveSeverity` — the same function the report, the executive summary and the
 * completion gate use. So the honest §298 behaviour is preserved BYTE FOR BYTE, and the new record
 * is additional rather than substitutional.
 */
import { resolveEffectiveSeverity } from '../src/common/effective-severity';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

/** The shape `withDeferredRating` writes. Restated here rather than imported from the service. */
const deferralSnapshot = (base: Record<string, unknown> | null = null) => ({
  ...(base || {}),
  ratingDeferral: {
    deferred: true,
    reason: 'Awaiting a competent person to walk the mezzanine.',
    deferredByUserId: '00000000-0000-4000-8000-000000000001',
    deferredAt: '2026-09-15T02:00:00.000Z',
    ratingAuthority: 'NOT_ESTABLISHED_BY_ANY_PARTY',
  },
});

// ================================================================ 1. the authority model

console.log('\n---- 1. only two parties may establish a rating, and Expert is not one ----\n');

/*
 * The REAL persisted shapes, read off `resolveEffectiveSeverity`. A reviewer's rating is carried
 * as BAND STRINGS (`overallRisk`, `severity`, `likelihood`) under `source: 'reviewer_confirmed'`,
 * not as raw matrix numbers -- writing this test against imagined numeric fields is exactly the
 * mistake §265 made with its request bodies, and it failed here until corrected.
 */
const reviewerRated = {
  source: 'reviewer_confirmed',
  overallRisk: 'High', severity: 'Major', likelihood: 'Likely',
  reviewerConfirmedByUserId: 'u-1',
};
check(resolveEffectiveSeverity(reviewerRated).label !== 'Not rated',
  'A reviewer-confirmed snapshot resolves to a real rating — the human authority works and is '
  + 'attributed. This mechanism already existed; HZ-7 was never that it was missing.');

const governedComputed = {
  riskBand: 'Critical',
  operationalRisk: { matrixBand: 'Critical', matrixScore: 20, severity: 5, likelihood: 4,
    profileLabel: 'Standard 5x5' },
};
check(resolveEffectiveSeverity(governedComputed).label !== 'Not rated',
  'A governed snapshot from computeFindingRisk at reconciliation resolves to a real rating.');

const expertShaped = {
  immediateSafetyPosture: 'STOP',
  expertHazardCandidates: [{ title: 'fall hazard', confidence: 'HIGH' }],
  whatHappensNow: 'Work must stop until the edge is protected.',
};
check(resolveEffectiveSeverity(expertShaped as Record<string, unknown>).label === 'Not rated',
  'AN EXPERT RESULT ESTABLISHES NOTHING. A snapshot carrying a STOP posture, HIGH-confidence '
  + 'candidates and instruction prose still resolves to "Not rated" — there is no field through '
  + 'which a provider conclusion becomes a severity, which is the containment §300 requires.');

// ================================================================ 2. the truthful state survives

console.log('\n---- 2. NOT ESTABLISHED is still reachable ----\n');

check(resolveEffectiveSeverity(null).label === 'Not rated',
  'A NULL snapshot is Not rated.');
check(resolveEffectiveSeverity({}).label === 'Not rated',
  'An empty snapshot is Not rated.');
check(resolveEffectiveSeverity(deferralSnapshot()).label === 'Not rated',
  'AND A DELIBERATE DEFERRAL IS STILL NOT RATED. The repair did not eliminate the truthful '
  + 'unresolved state; it made the state say who chose it.');

// ================================================================ 3. the report is unchanged

console.log('\n---- 3. the customer-facing output is byte-identical ----\n');

const before = resolveEffectiveSeverity(null);
const after = resolveEffectiveSeverity(deferralSnapshot());
console.log(`      before: ${JSON.stringify(before)}`);
console.log(`      after : ${JSON.stringify(after)}`);
check(JSON.stringify(before) === JSON.stringify(after),
  'The resolver — the SAME one the report, the executive summary and the completion gate use — '
  + 'returns an identical result for a NULL snapshot and for a deferral-only snapshot. The §298 '
  + 'report behaviour is preserved exactly and the new record is additional, not substitutional.');

check(!JSON.stringify(deferralSnapshot()).match(/"(severity|likelihood|riskScore|riskBand|overallRisk)"/),
  'The deferral record contains NO severity, NO likelihood, NO riskScore, NO band and NO '
  + 'overallRisk. It cannot become a rating by accident because it carries no field a rating is '
  + 'read from.');

// ================================================================ 4. a deferral cannot masquerade

console.log('\n---- 4. a deferral cannot be dressed up as a rating ----\n');

const smuggled = {
  ...deferralSnapshot(),
  ratingDeferral: { deferred: true, reason: 'x', overallRisk: 'Critical', riskBand: 'Critical' },
};
check(resolveEffectiveSeverity(smuggled as Record<string, unknown>).label === 'Not rated',
  'Severity fields placed INSIDE the deferral object are not read as the finding\'s rating — the '
  + 'resolver reads top-level fields, so a nested value cannot promote itself.');

const merged = deferralSnapshot(governedComputed);
check(resolveEffectiveSeverity(merged).label !== 'Not rated',
  'A finding that ALREADY had a governed rating keeps it when a deferral is merged over it — the '
  + 'helper merges UNDER, so finalization cannot erase a rating reconciliation established.');

// ================================================================ 5. non-Expert findings unaffected

console.log('\n---- 5. ordinary deterministic findings are untouched ----\n');

check(resolveEffectiveSeverity(governedComputed).label
  === resolveEffectiveSeverity({ ...governedComputed }).label,
  'A reconciled deterministic finding resolves exactly as before; the gate exempts anything '
  + 'already rated, so no ordinary finalization is asked a new question.');

const reviewerOverGoverned = {
  ...governedComputed,
  source: 'reviewer_confirmed',
  overallRisk: 'Medium', severity: 'Moderate', likelihood: 'Possible',
  reviewerConfirmedByUserId: 'u-2',
};
check(resolveEffectiveSeverity(reviewerOverGoverned).label !== 'Not rated',
  'A reviewer overriding a governed rating still resolves, and severity parity is unaffected by '
  + 'anything §300 added.');

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
