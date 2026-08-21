/**
 * KG-4A (Phases 2, 3, 4, 6, 13) -- the cutover mode contract and the fallback decision table.
 *
 * PURE. No database, no network, no fixtures. Every assertion here is a property of the contract
 * itself, which is why this suite is the one that can be run anywhere, cannot damage any evidence
 * database, and is safe to run first.
 *
 * WHAT IT PROVES.
 *   Part 1  the mode parser cannot be tricked into enabling cutover  (Phase 2, hard criterion 13)
 *   Part 2  the enablement boundary defaults OFF and is server-only  (Phase 13, criterion 13/14)
 *   Part 3  all 84 fallback rows exist and are internally coherent   (Phase 3, criterion 3/10)
 *   Part 4  applicability and backing never contaminate each other   (Phase 4, criterion 4)
 *   Part 5  no citation is ever suppressed or substituted            (criterion 5/6)
 *   Part 6  provenance eligibility tracks real influence only        (Phase 7, criterion 7)
 *   Part 7  LEGACY and SHADOW deliver identical customer decisions   (criterion 1/2)
 *
 * Usage: npx ts-node scripts/test-kg4a-cutover-contract.ts [--emit <matrix.json>]
 */
import 'dotenv/config';
import { writeFileSync } from 'fs';
import {
  resolveCutoverMode, resolveCutoverEnablement, assertCutoverConfigurationSafeForProduction,
  modeInfluencesCustomerOutput, modeExecutesGovernedResolution,
  GOVERNED_CUTOVER_MODES, DEFAULT_CUTOVER_MODE,
  CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV, CUTOVER_PRODUCTION_ACK_ENV,
  type GovernedCutoverMode,
} from '../src/standards/cutover/cutover-mode';
import {
  decideFallback, buildFallbackMatrix, toApplicabilityState,
  disclosureIsIndependentOfBacking, backingDecisionIsIndependentOfApplicability,
  fallbackCustomerDisclosure,
  ALL_APPLICABILITY_STATES, ALL_BACKING_STATES,
} from '../src/standards/cutover/fallback-contract';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(title: string) { console.log(`\n--- ${title}`); }

// ============================================================ Part 1 -- mode parsing
section('Part 1 — mode parsing cannot enable cutover by accident');

assert(resolveCutoverMode({}).mode === 'LEGACY', 'empty environment resolves to LEGACY');
assert(resolveCutoverMode({}).reason === 'DEFAULT_NO_CONFIGURATION', 'empty environment reports DEFAULT_NO_CONFIGURATION');
assert(DEFAULT_CUTOVER_MODE === 'LEGACY', 'the declared default is LEGACY');

// The truthy-string class of bug, exhaustively. Every one of these is truthy in JavaScript.
const TRUTHY_NON_MODES = [
  'true', 'TRUE', '1', 'yes', 'on', 'enabled', 'governed', 'false', '0', 'off', 'no', 'disabled',
  'GOVERNED', 'STRICT', 'SHADOW_MODE', 'legacy ', ' shadow', 'GOVERNED_WITH_FALLBACK_PLEASE',
  '{}', '[]', 'null', 'undefined', 'NaN', '-1', '0.0',
];
for (const value of TRUTHY_NON_MODES) {
  const resolved = resolveCutoverMode({ [CUTOVER_MODE_ENV]: value });
  const trimmedIsRealMode = GOVERNED_CUTOVER_MODES.includes(value.trim().toUpperCase() as GovernedCutoverMode);
  if (trimmedIsRealMode) {
    // ' shadow' and 'legacy ' legitimately trim to real modes; assert they parse, not that they fail.
    assert(resolved.mode === value.trim().toUpperCase(), `'${value}' trims to a real mode and parses as one`);
  } else {
    assert(resolved.mode === 'LEGACY' && resolved.reason === 'INVALID_MODE_VALUE',
      `truthy non-mode '${value}' resolves to LEGACY with INVALID_MODE_VALUE`);
  }
}
assert(resolveCutoverMode({ [CUTOVER_MODE_ENV]: '   ' }).reason === 'DEFAULT_NO_CONFIGURATION',
  'whitespace-only mode is treated as unset, not as invalid');

for (const mode of GOVERNED_CUTOVER_MODES) {
  assert(resolveCutoverMode({ [CUTOVER_MODE_ENV]: mode }).mode === mode, `'${mode}' parses to itself`);
  assert(resolveCutoverMode({ [CUTOVER_MODE_ENV]: mode.toLowerCase() }).mode === mode,
    `lowercase '${mode.toLowerCase()}' parses to '${mode}'`);
}

// Production double-lock.
for (const mode of ['SHADOW', 'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const) {
  const guarded = resolveCutoverMode({ NODE_ENV: 'production', [CUTOVER_MODE_ENV]: mode });
  assert(guarded.mode === 'LEGACY' && guarded.productionGuardTriggered,
    `'${mode}' in production without acknowledgement forces LEGACY`);
  let threw = false;
  try { assertCutoverConfigurationSafeForProduction({ NODE_ENV: 'production', [CUTOVER_MODE_ENV]: mode }); }
  catch { threw = true; }
  assert(threw, `startup validation refuses production '${mode}' without acknowledgement`);

  const acked = resolveCutoverMode({
    NODE_ENV: 'production', [CUTOVER_MODE_ENV]: mode,
    [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
  });
  assert(acked.mode === mode, `'${mode}' in production WITH the exact acknowledgement is honoured`);
}
assert(resolveCutoverMode({
  NODE_ENV: 'production', [CUTOVER_MODE_ENV]: 'GOVERNED_STRICT', [CUTOVER_PRODUCTION_ACK_ENV]: 'true',
}).mode === 'LEGACY', 'a truthy-but-wrong production acknowledgement does not unlock governed mode');

let invalidThrew = false;
try { assertCutoverConfigurationSafeForProduction({ NODE_ENV: 'production', [CUTOVER_MODE_ENV]: 'GOVERNED' }); }
catch { invalidThrew = true; }
assert(invalidThrew, 'startup validation refuses an unrecognised production mode value');
assert((() => { try { assertCutoverConfigurationSafeForProduction({ NODE_ENV: 'test', [CUTOVER_MODE_ENV]: 'GOVERNED' }); return true; } catch { return false; } })(),
  'startup validation does not refuse non-production environments');

// ============================================================ Part 2 -- enablement boundary
section('Part 2 — enablement defaults OFF and is server-controlled');

const PRINCIPAL = { userId: 'user-A', organizationId: 'org-1' };
for (const mode of ['SHADOW', 'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const) {
  const noList = resolveCutoverEnablement(PRINCIPAL, { [CUTOVER_MODE_ENV]: mode });
  assert(noList.effectiveMode === 'LEGACY' && noList.reason === 'NO_ALLOWLIST_CONFIGURED',
    `'${mode}' with no allowlist enables nobody`);

  const listed = resolveCutoverEnablement(PRINCIPAL,
    { [CUTOVER_MODE_ENV]: mode, [CUTOVER_ALLOWLIST_ENV]: 'user-A' });
  assert(listed.effectiveMode === mode && listed.reason === 'ACCOUNT_ALLOWLISTED',
    `'${mode}' with the account allowlisted enables that account`);

  const other = resolveCutoverEnablement({ userId: 'user-B', organizationId: 'org-9' },
    { [CUTOVER_MODE_ENV]: mode, [CUTOVER_ALLOWLIST_ENV]: 'user-A' });
  assert(other.effectiveMode === 'LEGACY' && other.reason === 'NOT_ALLOWLISTED',
    `'${mode}' does NOT leak to a non-allowlisted account (tenancy isolation)`);

  const org = resolveCutoverEnablement({ userId: 'user-Z', organizationId: 'org-1' },
    { [CUTOVER_MODE_ENV]: mode, [CUTOVER_ORG_ALLOWLIST_ENV]: 'org-1' });
  assert(org.effectiveMode === mode && org.reason === 'ORGANIZATION_ALLOWLISTED',
    `'${mode}' honours the organization allowlist`);

  const anon = resolveCutoverEnablement(null, { [CUTOVER_MODE_ENV]: mode, [CUTOVER_ALLOWLIST_ENV]: 'user-A' });
  assert(anon.effectiveMode === 'LEGACY' && anon.reason === 'NO_PRINCIPAL',
    `'${mode}' with no principal stays LEGACY`);
}
assert(resolveCutoverEnablement(PRINCIPAL, { [CUTOVER_MODE_ENV]: 'LEGACY', [CUTOVER_ALLOWLIST_ENV]: 'user-A' })
  .reason === 'MODE_IS_LEGACY', 'an allowlist alone never enables anything');
assert(resolveCutoverEnablement({ userId: 'user-A ' },
  { [CUTOVER_MODE_ENV]: 'GOVERNED_STRICT', [CUTOVER_ALLOWLIST_ENV]: ' user-A , user-C ' }).enabled,
  'allowlist entries and principals are trimmed consistently');
assert(!resolveCutoverEnablement({ userId: 'user-AA' },
  { [CUTOVER_MODE_ENV]: 'GOVERNED_STRICT', [CUTOVER_ALLOWLIST_ENV]: 'user-A' }).enabled,
  'allowlist matching is exact, not prefix-based');

assert(modeInfluencesCustomerOutput('GOVERNED_WITH_FALLBACK') && modeInfluencesCustomerOutput('GOVERNED_STRICT'),
  'only the two governed modes are declared to influence customer output');
assert(!modeInfluencesCustomerOutput('LEGACY') && !modeInfluencesCustomerOutput('SHADOW'),
  'LEGACY and SHADOW are declared NOT to influence customer output');
assert(!modeExecutesGovernedResolution('LEGACY') && modeExecutesGovernedResolution('SHADOW'),
  'LEGACY does not execute governed resolution; SHADOW does');

// ============================================================ Part 3 -- the matrix
section('Part 3 — the fallback decision table is total and coherent');

const matrix = buildFallbackMatrix();
assert(matrix.length === 4 * 3 * 7, `matrix enumerates all ${4 * 3 * 7} combinations (got ${matrix.length})`);
assert(new Set(matrix.map(r => `${r.mode}|${r.applicability}|${r.backing}`)).size === matrix.length,
  'every combination appears exactly once');
assert(matrix.every(r => r.showCitation === true),
  'HARD: the citation is shown in every one of the 84 rows — governance never suppresses a citation');
assert(matrix.every(r => !r.textIsVerified || r.showText),
  'text can only be VERIFIED if it is also SHOWN');
assert(matrix.every(r => r.textIsVerified === (r.deliveryState === 'GOVERNED_VERIFIED_TEXT')),
  'verified text and the GOVERNED_VERIFIED_TEXT delivery state are the same condition');
assert(matrix.every(r => r.deliveryState !== 'CITATION_ONLY_NO_TEXT' || r.discloseTextUnavailable),
  'HARD: every citation-only row discloses that verified text is unavailable');
assert(matrix.every(r => !r.discloseTextUnavailable || !r.showText),
  'the unavailable disclosure is never shown alongside displayed text');
assert(matrix.filter(r => r.textIsVerified).every(r => r.backing === 'APPROVED_EXACT'),
  'HARD: ONLY APPROVED_EXACT is ever presented as verified regulatory text');
assert(matrix.filter(r => r.backing === 'APPROVED_SECTION_ONLY').every(r => !r.textIsVerified),
  'HARD: section-level approval NEVER confers verified text on a paragraph (no parent/child promotion)');
assert(matrix.filter(r => r.backing === 'UNAPPROVED_RECORD').every(r => !r.textIsVerified),
  'an unapproved record is never presented as verified');
assert(matrix.every(r => fallbackCustomerDisclosure(r) === null || r.discloseTextUnavailable),
  'customer disclosure copy is emitted only where the decision requires it');

// ============================================================ Part 4 -- axis independence
section('Part 4 — applicability and content backing stay separate');

for (const mode of GOVERNED_CUTOVER_MODES) {
  for (const applicability of ALL_APPLICABILITY_STATES) {
    assert(disclosureIsIndependentOfBacking(mode, applicability),
      `[${mode}/${applicability}] governed backing cannot change the applicability disclosure`);
  }
  for (const backing of ALL_BACKING_STATES) {
    assert(backingDecisionIsIndependentOfApplicability(mode, backing),
      `[${mode}/${backing}] applicability cannot change the text/verification/provenance decision`);
  }
}
assert(matrix.every(r => r.discloseApplicabilityUncertain === (r.applicability === 'UNCERTAIN')),
  'HARD: the applicability disclosure is a function of applicability alone, in all 84 rows');

// EVIDENCE_UNKNOWN vs GOVERNANCE_FILTER_EMPTY, tested independently as Phase 4 requires.
const uncertainApproved = decideFallback('GOVERNED_WITH_FALLBACK', 'UNCERTAIN', 'APPROVED_EXACT');
assert(uncertainApproved.textIsVerified && uncertainApproved.discloseApplicabilityUncertain,
  'EVIDENCE_UNKNOWN: approved text may be shown, and the missing trigger is STILL disclosed');
const supportedApproved = decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'APPROVED_EXACT');
assert(!supportedApproved.discloseApplicabilityUncertain,
  'EVIDENCE_UNKNOWN: a supported applicability carries no uncertainty disclosure');
assert(uncertainApproved.deliveryState === supportedApproved.deliveryState,
  'HARD: governed availability does NOT convert applicability uncertainty into certainty (same delivery, different disclosure)');
const filterEmpty = decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'NOT_IN_RELEASE');
assert(filterEmpty.deliveryState === 'LEGACY_TEXT_UNVERIFIED' && !filterEmpty.discloseApplicabilityUncertain,
  'GOVERNANCE_FILTER_EMPTY: a content-availability gap never reports itself as evidence uncertainty');
assert(filterEmpty.reasonCode === 'GOVERNED_RECORD_ABSENT' && filterEmpty.failureClass === 'EXPECTED_FALLBACK',
  'GOVERNANCE_FILTER_EMPTY is an EXPECTED_FALLBACK with its own distinct reason code');

assert(toApplicabilityState('UNKNOWN') === 'UNCERTAIN', 'UNKNOWN maps to UNCERTAIN');
assert(toApplicabilityState('SUPPORTED') === 'SUPPORTED', 'SUPPORTED maps to SUPPORTED');
assert(toApplicabilityState('CONTRADICTED') === 'UNSUPPORTED', 'CONTRADICTED maps to UNSUPPORTED');
assert(toApplicabilityState('NOT_SUPPORTED') === 'UNSUPPORTED', 'NOT_SUPPORTED maps to UNSUPPORTED');
assert(toApplicabilityState('some-new-status') === 'UNCERTAIN',
  'an unrecognised applicability status degrades to UNCERTAIN, never to SUPPORTED');
assert(toApplicabilityState(null) === 'UNCERTAIN', 'a null applicability status degrades to UNCERTAIN');

// ============================================================ Part 5 -- failure classification
section('Part 5 — failure modes are classified, not improvised');

// Mode-aware on purpose. In LEGACY and SHADOW the resolver's finding is not part of the customer
// decision at all -- LEGACY never runs it, and SHADOW discards it -- so there is no failure to
// classify and `failureClass` is NONE. Asserting INTEGRITY_FAILURE across all four modes would be
// asserting that a mode which ignores the resolver still reports the resolver's health, which is
// the opposite of the isolation those modes exist to provide.
assert(matrix.filter(r => r.backing === 'RESOLVER_UNAVAILABLE' && (r.mode === 'GOVERNED_WITH_FALLBACK' || r.mode === 'GOVERNED_STRICT'))
  .every(r => r.failureClass === 'INTEGRITY_FAILURE'),
  'a resolver failure is classified INTEGRITY_FAILURE in both governed modes');
assert(matrix.filter(r => r.mode === 'LEGACY' || r.mode === 'SHADOW').every(r => r.failureClass === 'NONE'),
  'HARD: LEGACY and SHADOW report NO failure class — the resolver never enters their customer decision');
assert(matrix.filter(r => r.backing === 'APPROVED_EXACT').every(r => r.failureClass === 'NONE'),
  'an exact approved resolution is not a failure of any kind');
assert(matrix.filter(r => !['RESOLVER_UNAVAILABLE', 'APPROVED_EXACT'].includes(r.backing) && r.mode !== 'LEGACY' && r.mode !== 'SHADOW')
  .every(r => r.failureClass === 'EXPECTED_FALLBACK'),
  'every other governed-mode backing state is an EXPECTED_FALLBACK');
assert(matrix.filter(r => r.mode === 'GOVERNED_WITH_FALLBACK' && r.backing === 'RESOLVER_UNAVAILABLE')
  .every(r => r.deliveryState === 'LEGACY_TEXT_UNVERIFIED'),
  'HARD: a resolver failure under GOVERNED_WITH_FALLBACK degrades to legacy text — never an error');
assert(matrix.filter(r => r.mode === 'GOVERNED_STRICT' && r.backing === 'RESOLVER_UNAVAILABLE')
  .every(r => r.deliveryState === 'CITATION_ONLY_NO_TEXT'),
  'a resolver failure under GOVERNED_STRICT degrades to citation-only — never an error');
assert(new Set(matrix.map(r => r.deliveryState)).size === 3,
  'there are exactly three delivery states; no implicit suppression state exists');

// ============================================================ Part 6 -- provenance eligibility
section('Part 6 — governed provenance only where governed data influenced the customer');

assert(matrix.filter(r => r.mode === 'LEGACY' || r.mode === 'SHADOW').every(r => !r.governedProvenanceEligible),
  'HARD: LEGACY and SHADOW never make governed provenance eligible');
assert(matrix.filter(r => r.governedProvenanceEligible)
  .every(r => r.deliveryState !== 'LEGACY_TEXT_UNVERIFIED'),
  'HARD: a row whose customer output is identical to legacy never claims governed provenance');
assert(matrix.filter(r => r.mode === 'GOVERNED_WITH_FALLBACK' && r.governedProvenanceEligible)
  .every(r => r.backing === 'APPROVED_EXACT' || r.backing === 'APPROVED_NO_TEXT'),
  'under fallback, only an approved record (with or without text) yields governed provenance');
assert(matrix.filter(r => r.backing === 'RESOLVER_UNAVAILABLE' || r.backing === 'NO_ACTIVE_RELEASE')
  .every(r => !r.governedProvenanceEligible),
  'HARD: a failed or absent release never yields governed provenance');

// ============================================================ Part 7 -- LEGACY / SHADOW identity
section('Part 7 — SHADOW is customer-identical to LEGACY');

let identical = 0;
for (const applicability of ALL_APPLICABILITY_STATES) {
  for (const backing of ALL_BACKING_STATES) {
    const legacy = decideFallback('LEGACY', applicability, backing);
    const shadow = decideFallback('SHADOW', applicability, backing);
    const customerVisible = (d: typeof legacy) =>
      `${d.deliveryState}|${d.showCitation}|${d.showText}|${d.textIsVerified}|` +
      `${d.discloseTextUnavailable}|${d.discloseApplicabilityUncertain}|${d.governedProvenanceEligible}`;
    if (customerVisible(legacy) === customerVisible(shadow)) identical++;
    else console.log(`FAIL  SHADOW differs from LEGACY at ${applicability}/${backing}`);
  }
}
assert(identical === 21, `HARD: SHADOW matches LEGACY on all 21 applicability x backing combinations (got ${identical})`);
assert(ALL_BACKING_STATES.every(b => decideFallback('SHADOW', 'SUPPORTED', b).reasonCode === 'SHADOW_MODE_CUSTOMER_UNAFFECTED'),
  'every SHADOW row reports SHADOW_MODE_CUSTOMER_UNAFFECTED regardless of what the resolver found');

// ============================================================ emit + summary
const emitIndex = process.argv.indexOf('--emit');
if (emitIndex > -1 && process.argv[emitIndex + 1]) {
  writeFileSync(process.argv[emitIndex + 1], JSON.stringify({
    generatedBy: 'test-kg4a-cutover-contract.ts',
    modes: GOVERNED_CUTOVER_MODES,
    applicabilityStates: ALL_APPLICABILITY_STATES,
    backingStates: ALL_BACKING_STATES,
    rowCount: matrix.length,
    rows: matrix,
  }, null, 2));
  console.log(`\nmatrix written: ${process.argv[emitIndex + 1]}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
