// Regression coverage for the single most severe standards-matching defect found during the
// 2026-08-18 core-closure/standards-validation phase, reproduced live end-to-end (Chromium +
// direct DB inspection) before being traced to root cause: evaluate() in evidence-foundation.ts
// gated every jurisdiction-specific standards rule behind an EXACT jurisdiction match
// (`e.jurisdiction === 'msha' | 'osha-general-industry' | 'osha-construction'`), using the same
// plain boolean both as the rule's entry gate and as the jurisdiction predicate's value. The
// frontend's default inspection agency mode is "all" (frontend-next/app/inspection/page.tsx),
// which resolves to `scopes: undefined` on the wire (getHazLenzScopesForAgencyMode), which in turn
// makes buildEvidenceFacts() extract jurisdiction as the literal string 'unknown'. Because
// 'unknown' matches none of the three exact-jurisdiction checks, `mine`/`gi`/`construction` were
// ALL false, so every jurisdiction-gated rule's `if (mine && ...)`/`if (gi && ...)`/
// `if (construction && ...)` was skipped entirely -- not one candidate standard was ever produced
// for ANY finding, however textbook the violation, unless a user manually picked a specific
// regulatory scope before running HazLenz. This is the default, unmodified path every new
// inspection takes. The fix separates the rule-entry GATE (which now also proceeds when
// jurisdiction is merely unconfirmed) from the jurisdiction PREDICATE value passed into decision()
// (which now honestly reports UNKNOWN rather than falsely reporting CONTRADICTED when jurisdiction
// is simply unknown) -- a confirmed *different* jurisdiction still excludes the rule exactly as
// before; only the previously-unhandled "not yet confirmed" case changes.
import { applyFindingScopedStandards, applyEvidenceFoundation } from '../evidence/evidence-foundation';

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

function candidatesFor(fragment: string, mechanism: string, scopes: string[] | undefined) {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{ hazardId: 'haz-1', domainId: 'lockout_tagout', hazardFamily: 'lockout_tagout',
        observationFragment: fragment, mechanism, supportingSignals: [] }],
    },
  };
  applyFindingScopedStandards(result, { text: fragment, scopes } as any);
  return result.multiHazardDecomposition.hazards[0].standardCandidates as any[];
}

const lotoText = 'A technician is servicing the hydraulic baler and hazardous energy has not been isolated or locked out.';

// Default agency mode ("all" -> scopes: undefined -> jurisdiction 'unknown') must not silently
// discard an otherwise textbook LOTO match. It must surface it as an honest UNKNOWN/candidate,
// never as SUPPORTED (jurisdiction itself is still unconfirmed) and never as nothing at all.
{
  const candidates = candidatesFor(lotoText, 'lockout/tagout deficiency', undefined);
  const citations = candidates.map(c => c.citation);
  check('Unknown jurisdiction: LOTO finding still surfaces 29 CFR 1910.147 as a candidate (not silently dropped)',
    citations.includes('29 CFR 1910.147'), candidates);
  check('Unknown jurisdiction: 1910.147 candidate is UNKNOWN status, never fabricated as SUPPORTED',
    candidates.find(c => c.citation === '29 CFR 1910.147')?.status === 'UNKNOWN', candidates);
  check('Unknown jurisdiction: 30 CFR 56.12016 (MSHA sibling) is also surfaced as a candidate',
    citations.includes('30 CFR 56.12016'), candidates);
}

// Confirmed general-industry jurisdiction with complete evidence must still reach SUPPORTED --
// the fix must not weaken a genuinely confirmed match down to a permanent UNKNOWN.
{
  const candidates = candidatesFor(
    'A worker is servicing the energized press and hazardous energy has not been isolated or locked out.',
    'lockout/tagout deficiency', ['osha_general_industry']);
  const hit = candidates.find(c => c.citation === '29 CFR 1910.147');
  check('Confirmed general-industry jurisdiction: 1910.147 reaches SUPPORTED with complete evidence',
    !!hit && hit.status === 'SUPPORTED', candidates);
}

// Confirmed MSHA jurisdiction must still exclude the OSHA General Industry sibling rule entirely
// -- the *Gate change must not cause cross-jurisdiction leakage once jurisdiction IS confirmed.
{
  const candidates = candidatesFor(lotoText, 'lockout/tagout deficiency', ['msha']);
  const citations = candidates.map(c => c.citation);
  check('Confirmed MSHA jurisdiction: OSHA General Industry 1910.147 does not appear at all',
    !citations.includes('29 CFR 1910.147'), candidates);
}

// Confirmed construction jurisdiction must still exclude both the MSHA and OSHA GI LOTO rules --
// there is no construction-scoped LOTO rule in evaluate(), so this must legitimately be empty.
{
  const candidates = candidatesFor(lotoText, 'lockout/tagout deficiency', ['osha_construction']);
  check('Confirmed construction jurisdiction: no LOTO rule exists for this jurisdiction, candidates list is empty (not fabricated)',
    candidates.length === 0, candidates);
}

// The jurisdiction fact itself must still read 'unknown' (never silently upgraded to a guessed
// jurisdiction) when no scope was provided -- the fix changes what evaluate() DOES with an unknown
// jurisdiction, not whether extraction honestly reports it as unknown.
{
  const withFoundation: any = applyEvidenceFoundation({ hazards: [] }, { text: lotoText, scopes: undefined } as any);
  const jurisdictionFact = withFoundation.evidenceSnapshot.facts.find((f: any) => f.type === 'jurisdiction');
  check('Jurisdiction fact remains honestly \'unknown\' (not guessed) when no scope is provided',
    jurisdictionFact?.value === 'unknown', jurisdictionFact);
}

// The "Essential clarification" UI asks "Can you confirm: general-industry jurisdiction?" (id
// `predicate-29-cfr-1910-147-general-industry-jurisdiction`) whenever a jurisdiction-pending
// candidate like this one is surfaced. Answering "Yes" must actually resolve the candidate to
// SUPPORTED at finding scope -- not leave the clarification loop as a dead end that reproduces the
// same "no standard established" result after the user has already confirmed the missing fact.
{
  const findingText = 'A worker is servicing the energized press and hazardous energy has not been isolated or locked out.';
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{ hazardId: 'haz-1', domainId: 'lockout_tagout', hazardFamily: 'lockout_tagout',
        observationFragment: findingText, mechanism: 'lockout/tagout deficiency', supportingSignals: [] }],
    },
  };
  applyFindingScopedStandards(result, {
    text: findingText,
    clarificationAnswers: [{ questionId: 'predicate-29-cfr-1910-147-general-industry-jurisdiction', answer: 'Yes' }],
  } as any);
  const candidates = result.multiHazardDecomposition.hazards[0].standardCandidates as any[];
  const hit = candidates.find(c => c.citation === '29 CFR 1910.147');
  check('Answering "Yes" to the general-industry jurisdiction clarification question resolves 1910.147 to SUPPORTED at finding scope',
    !!hit && hit.status === 'SUPPORTED', candidates);
  check('Confirming general-industry jurisdiction via clarification excludes the MSHA sibling candidate entirely',
    !candidates.some(c => c.citation === '30 CFR 56.12016'), candidates);
}

// Multi-round clarification: the workspace resends the FULL accumulated clarificationAnswers
// history on every reanalyze round (inspection-workspace/page.tsx `clarificationAnswerHistory`)
// and additionally persists an answered jurisdiction onto the inspection itself. A jurisdiction
// answered on round 1 must therefore still resolve on round 2, when the user answers a different
// question -- the clarification loop must never re-ask a fact the user already confirmed.
{
  const findingText = 'A worker is servicing the stamping press and hazardous energy has not been isolated or locked out.';
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{ hazardId: 'haz-1', domainId: 'lockout_tagout', hazardFamily: 'lockout_tagout',
        observationFragment: findingText, mechanism: 'lockout/tagout deficiency', supportingSignals: [] }],
    },
  };
  // Round 2 request: the accumulated history carries round 1's jurisdiction answer plus this
  // round's energy-state answer.
  applyFindingScopedStandards(result, {
    text: findingText,
    clarificationAnswers: [
      { questionId: 'predicate-29-cfr-1910-147-general-industry-jurisdiction', answer: 'Yes' },
      { questionId: 'predicate-29-cfr-1910-147-hazardous-energy-present-or-capable', answer: 'Yes' },
    ],
  } as any);
  const candidates = result.multiHazardDecomposition.hazards[0].standardCandidates as any[];
  const hit = candidates.find(c => c.citation === '29 CFR 1910.147');
  check('A jurisdiction confirmed on an earlier round (carried in the accumulated clarificationAnswers history) is not forgotten',
    !!hit && hit.status === 'SUPPORTED', candidates);
  check('Accumulated-round jurisdiction correctly excludes the MSHA sibling candidate',
    !candidates.some(c => c.citation === '30 CFR 56.12016'), candidates);
}

// Provenance honesty: a resent evidenceSnapshot fact must NOT be able to re-label jurisdiction as
// user-confirmed by itself. The client echoes every previous-round fact back with
// source='user_confirmation'/status='confirmed' regardless of how it was originally established,
// so honoring it here would let a HazLenz-INFERRED (or unknown) regime masquerade as USER_CONFIRMED.
// Jurisdiction provenance is owned by: persisted inspection context > explicit request >
// answered clarification > inference > unknown -- never by an echoed snapshot fact.
{
  const findingText = 'A worker is servicing the stamping press and hazardous energy has not been isolated or locked out.';
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{ hazardId: 'haz-1', domainId: 'lockout_tagout', hazardFamily: 'lockout_tagout',
        observationFragment: findingText, mechanism: 'lockout/tagout deficiency', supportingSignals: [] }],
    },
  };
  applyFindingScopedStandards(result, {
    text: findingText,
    evidenceSnapshot: {
      schemaVersion: '1.0',
      facts: [
        { id: 'fact-1', type: 'jurisdiction', value: 'osha-general-industry', source: 'user_confirmation', status: 'confirmed' },
      ],
    },
  } as any);
  const candidates = result.multiHazardDecomposition.hazards[0].standardCandidates as any[];
  check('An echoed snapshot jurisdiction fact alone does not confirm jurisdiction (candidates stay honest UNKNOWN in both regimes, nothing fabricated as SUPPORTED)',
    candidates.some(c => c.citation === '29 CFR 1910.147' && c.status === 'UNKNOWN') &&
    candidates.some(c => c.citation === '30 CFR 56.12016' && c.status === 'UNKNOWN') &&
    !candidates.some(c => c.status === 'SUPPORTED'), candidates);
}

console.log('='.repeat(60));
if (failures > 0) {
  console.error(`HazLenz jurisdiction-unknown standards regression: ${failures} FAILED`);
  process.exit(1);
}
console.log('HazLenz jurisdiction-unknown standards regression: all invariants passed, 0 failed');
