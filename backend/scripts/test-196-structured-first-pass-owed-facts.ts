/**
 * §196 EXPERT HAZLENZ -- STRUCTURED FIRST-PASS OWED-FACT PROOF MATRIX.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * Cases A-O are the §196 authorization's matrix, in its order, with its letters. Cases P-U are the
 * protocol-preservation and carrier-independence proofs the authorization requires separately:
 * that vNext minus its additions reproduces v15 exactly, that the fifth collection is a sibling
 * rather than a carrier hung off a hazard candidate, and that the comparison pattern used for
 * citation reuse never reaches text the canonical detector would not also have caught.
 */

import { createHash } from 'crypto';
import type {
  ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  CITATION_SHAPED_PATTERN,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, stableStringify,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  createOwedFactLedger, unresolvedFacts,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  projectOwedFactsForVerifier, PROJECTION_FORBIDDEN_FIELDS,
} from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import type {
  AcceptableEvidence,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';

import {
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING as UNRESOLVED_FACT_DECLARATION_LINES,
  UNRESOLVED_FACT_DECLARATIONS_FIELD, CLARIFICATION_DECLARATION_BACKREF_FIELD,
  buildExpertVNextWireSchema, reconstructV15SystemPrompt, reconstructV15WireSchema,
  FIRST_PASS_VNEXT_CHANGE_LEDGER, EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
} from './lib/expert-first-pass-instruction-vnext';
import {
  type StructuredUnresolvedFactDeclaration,
  projectDeclaredOwedFacts, resolveClarificationLinks, computeFactKey,
  OWED_FACT_FIELD_PROVENANCE, NON_PROJECTING_DECLARATION_FIELDS, FACT_IDENTITY_CLAIMS,
  FIRST_PASS_PROJECTED_PRIORITY, PROJECTED_STATUS, firstPassProjectionEffect,
  REQUIRED_DECLARATION_STRING_FIELDS, PROJECTION_RESIDUAL_LIMITS,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  citationTokens, decideCitationReuse, canonicalCitationToken, CITATION_TOKEN_PATTERN,
  CITATION_ADMISSION_MATRIX, QUOTATION_BOUNDARY_STATEMENT,
} from './lib/expert-governed-citation-reuse';
import {
  checkVerifierV3_2Output,
} from './lib/expert-verifier-contract-v3-2';
import {
  checkVerifierV3_3Output, UNAUTHORISED_REGULATORY_CITATION, type V3_3AdmissionInput,
} from './lib/expert-verifier-contract-v3-3';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import { K3_HISTORICAL_ASSERTION } from './lib/expert-superseded-claims';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ---------------------------------------------------------------- fixtures
//
// PROTOCOL fixtures, not evaluation truth. They exercise the boundary's rules; nothing here is a
// human-authored expectation about what a model SHOULD say, and no measure is computed from them.

const OBSERVATION =
  'Bench grinder in the maintenance bay was running with the work rest gap measured at 3/16 inch. '
  + 'The tongue guard position could not be determined from where the inspector stood. '
  + 'A lockout box was mounted on the wall beside the panel; no tags were visible on it.';

const GOVERNED_TEXT =
  'Abrasive wheel machinery. The work rest shall be kept adjusted closely to the wheel with a '
  + 'maximum clearance of one-eighth inch. See 29 CFR 1910.215(a)(4) for the governing text.';

const ANALYSIS_ID = 'AN-196-1';

const INPUT: ExpertAnalysisInput = {
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: ANALYSIS_ID,
  authoritativeSources: [{ sourceId: 'OBS-1', sourceType: 'observation', text: OBSERVATION }],
  inspectionContext: { location: 'maintenance bay', task: 'bench grinding' },
  jurisdiction: 'US-OSHA',
  allowedHazardFamilies: ['machine_guarding', 'lockout_tagout'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};

const GOVERNED_BINDING = { governedEvidenceSourceIds: ['GOV-WORKREST-01'] };
const SOURCES = [{ sourceId: 'OBS-1', text: OBSERVATION }];

const decl = (
  over: Partial<Record<keyof StructuredUnresolvedFactDeclaration, unknown>> & Record<string, unknown>,
): Record<string, unknown> => ({
  declarationId: 'D1',
  missingFact: 'whether the tongue guard is adjusted to within the required distance of the wheel',
  observationSourceId: 'OBS-1',
  observationSpan: 'The tongue guard position could not be determined',
  notEstablishedBecause: 'the observation records only that the position could not be seen from '
    + 'where the inspector stood, which does not establish either an adjusted or an unadjusted guard',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the tongue guard is fitted and adjusted to within the required distance of the wheel',
  decisionIfA: 'record the guard as verified and close the item with no corrective action',
  branchB: 'the tongue guard is absent, or is set further from the wheel than permitted',
  decisionIfB: 'take the grinder out of service until the guard is adjusted and re-verified',
  whyNecessaryNow: 'the machine is in use today and the answer decides whether it may keep running',
  governedEvidenceSourceIds: [],
  ...over,
});

const project = (
  declarations: readonly unknown[],
  opts: { criteria?: Record<string, AcceptableEvidence>; governed?: readonly string[] } = {},
) => projectDeclaredOwedFacts({
  declarations,
  sources: SOURCES,
  suppliedGovernedSourceIds: opts.governed ?? GOVERNED_BINDING.governedEvidenceSourceIds,
  stage: 'FIRST_PASS_MODEL',
  acceptableEvidenceBySourceId: opts.criteria,
});

// ================================================================ A. ZERO OWED FACTS

const zero = project([]);
ok('A1. an empty declaration list projects to zero owed facts',
  zero.facts.length === 0 && zero.perDeclaration.length === 0 && zero.refusedCount === 0,
  '0 facts, 0 refusals, nothing fabricated');
ok('A2. zero facts is not an error state and produces no placeholder',
  JSON.stringify(zero.facts) === '[]'
  && Object.keys(zero.declarationIdToFactKey).length === 0);

// ================================================================ B. ONE OWED FACT

const one = project([decl({})]);
const fact = one.facts[0];
ok('B1. a well-formed declaration projects to exactly one owed fact',
  one.facts.length === 1 && one.refusedCount === 0, fact?.factKey ?? '(none)');
ok('B2. the projected fact survives createOwedFactLedger unchanged',
  (() => {
    const l = createOwedFactLedger('DEVELOPMENT', one.facts);
    return l.facts.length === 1 && unresolvedFacts(l).length === 1;
  })());

// Every OwedFact field is covered by exactly one provenance row, and no row is left over.
const factKeys = Object.keys(fact ?? {}).sort();
const provenanceKeys = OWED_FACT_FIELD_PROVENANCE.map(p => p.owedFactField).sort();
ok('B3. the provenance table covers the projected OwedFact exactly — no field without a row, no '
  + 'row without a field',
  JSON.stringify(factKeys) === JSON.stringify(provenanceKeys),
  `${factKeys.length} fields`);

const d0 = decl({}) as Record<string, string>;
ok('B4. every EXPLICIT_UPSTREAM_FIELD is byte-equal to the declaration field it names',
  fact !== undefined
  && fact.affectedDecision === d0.affectedDecision
  && fact.evidenceSpan === d0.observationSpan.trim()
  && fact.whyUnresolved === d0.notEstablishedBecause
  && fact.branchA === d0.branchA
  && fact.branchB === d0.branchB
  && fact.decisionDivergence.ifA === d0.decisionIfA
  && fact.decisionDivergence.ifB === d0.decisionIfB);
ok('B5. every MECHANICAL_DERIVATION is the stated constant or the stated computation',
  fact?.priority === FIRST_PASS_PROJECTED_PRIORITY
  && fact?.status === PROJECTED_STATUS
  && fact?.source === 'FIRST_PASS_MODEL'
  && fact?.modelAuthored === true,
  `${fact?.priority} · ${fact?.status} · modelAuthored=${String(fact?.modelAuthored)}`);
ok('B6. the computed factKey is reproducible from the declaration alone',
  fact?.factKey === computeFactKey({
    stage: 'FIRST_PASS_MODEL',
    affectedDecision: 'REQUIRED_CONTROL',
    observationSourceId: 'OBS-1',
    startOffset: OBSERVATION.indexOf(d0.observationSpan),
    endOffset: OBSERVATION.indexOf(d0.observationSpan) + d0.observationSpan.length,
    ordinal: 1,
  }), fact?.factKey);
ok('B7. the projection is byte-stable across repeated calls',
  stableStringify(project([decl({})]).facts) === stableStringify(one.facts));
ok('B8. the wire carries no factKey field, so identity cannot be provider-chosen',
  !('factKey' in decl({})) && FACT_IDENTITY_CLAIMS.NOT_CHOOSABLE_BY_THE_PROVIDER,
  'identity computed, never accepted');
ok('B9. a declaration that sends a factKey is refused rather than silently stripped',
  project([decl({ factKey: 'FP.MINE.1' })])
    .perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'));

// ================================================================ C. MULTIPLE OWED FACTS

const DECL_1 = decl({ declarationId: 'D1' }) as Record<string, string>;
const DECL_2 = decl({
  declarationId: 'D2',
  missingFact: 'whether the lockout box holds the locks and tags for this machine',
  observationSpan: 'no tags were visible on it',
  notEstablishedBecause: 'the observation records only that no tags were visible on the box, '
    + 'which does not establish whether an isolation was performed',
  affectedDecision: 'EXPOSURE',
  branchA: 'the machine was isolated and the locks are held elsewhere by the person working on it',
  decisionIfA: 'record the isolation as accounted for and take no further action on the box',
  branchB: 'no isolation is in place and the box is simply empty',
  decisionIfB: 'stop the maintenance task and require a documented isolation before restart',
  whyNecessaryNow: 'a maintenance task is under way beside the panel today',
}) as Record<string, string>;
const multi = project([DECL_1, DECL_2]);
ok('C1. two independent declarations project to two facts',
  multi.facts.length === 2 && multi.refusedCount === 0);
ok('C2. the two facts carry distinct identities and distinct affected decisions',
  multi.facts[0].factKey !== multi.facts[1].factKey
  && multi.facts[0].affectedDecision !== multi.facts[1].affectedDecision,
  `${multi.facts[0].factKey} · ${multi.facts[1].factKey}`);
ok('C3. neither fact borrowed a field from the other',
  multi.facts[0].evidenceSpan !== multi.facts[1].evidenceSpan
  && multi.facts[0].branchA !== multi.facts[1].branchA
  && multi.facts[0].decisionDivergence.ifB !== multi.facts[1].decisionDivergence.ifB);
ok('C4. a refused declaration does not destroy its well-formed siblings',
  (() => {
    const mixed = project([decl({ declarationId: 'D1' }), decl({ declarationId: 'D2', branchB: '' }),
      decl({ declarationId: 'D3', observationSpan: 'no tags were visible on it' })]);
    return mixed.facts.length === 2 && mixed.refusedCount === 1
      && mixed.perDeclaration[1].admitted === false;
  })(), 'per-declaration refusal, never whole-response');

// ================================================================ D. MISSING SEMANTIC FIELD

for (const field of REQUIRED_DECLARATION_STRING_FIELDS) {
  if (field === 'declarationId') continue;
  const r = project([decl({ [field]: '' })]);
  ok(`D1.${field}. a declaration missing ${field} is refused, not inferred`,
    r.facts.length === 0 && r.refusedCount === 1
    && r.perDeclaration[0].codes.some(c => c === 'REQUIRED_FIELD_MISSING'
      || c === 'AFFECTED_DECISION_NOT_A_MEMBER'));
}
ok('D2. a refused declaration yields no partial fact',
  project([decl({ branchB: '' })]).perDeclaration[0].owedFact === null);
ok('D3. a declaration missing branchB is not repaired from branchA',
  !JSON.stringify(project([decl({ branchB: '' })])).includes('"branchB"'));

// ================================================================ E. NON-VERBATIM SPAN

ok('E1. a paraphrased span is refused',
  (() => {
    const r = project([decl({ observationSpan: 'the tongue guard could not be seen' })]);
    return r.facts.length === 0
      && r.perDeclaration[0].codes.includes('EVIDENCE_SPAN_NOT_VERBATIM');
  })());
ok('E2. a span from a source that was not supplied is refused',
  project([decl({ observationSourceId: 'OBS-9' })])
    .perDeclaration[0].codes.includes('OBSERVATION_SOURCE_UNKNOWN'));
ok('E3. a span joined from two fragments is refused, because it is not contiguous',
  project([decl({ observationSpan: 'The tongue guard ... could not be determined' })])
    .perDeclaration[0].codes.includes('EVIDENCE_SPAN_NOT_VERBATIM'));
ok('E4. surrounding whitespace is trimmed, and trimming is the only normalisation',
  (() => {
    const r = project([decl({ observationSpan: '  The tongue guard position  ' })]);
    return r.facts.length === 1 && r.facts[0].evidenceSpan === 'The tongue guard position';
  })());

// ================================================================ F. INVALID / DUPLICATE IDENTITY

ok('F1. two declarations sharing a declarationId — the second is refused',
  (() => {
    const r = project([decl({ declarationId: 'D1' }),
      decl({ declarationId: 'D1', observationSpan: 'no tags were visible on it' })]);
    return r.facts.length === 1
      && r.perDeclaration[1].codes.includes('DUPLICATE_DECLARATION_ID');
  })());
ok('F2. a restatement of the same fact — same decision, same span, same branches — is refused',
  (() => {
    const r = project([decl({ declarationId: 'D1' }), decl({ declarationId: 'D2' })]);
    return r.facts.length === 1
      && r.perDeclaration[1].codes.includes('DECLARATION_DUPLICATES_ANOTHER_DECLARATION');
  })());
ok('F3. two genuinely different facts anchored to the SAME span both survive, with distinct keys',
  (() => {
    const r = project([
      decl({ declarationId: 'D1' }),
      decl({
        declarationId: 'D2',
        branchA: 'the guard is fitted but the inspector simply could not see it from that position',
        decisionIfA: 'return to the machine and inspect the guard from the operator side',
        branchB: 'no guard is fitted at all',
        decisionIfB: 'remove the grinder from service immediately',
      }),
    ]);
    return r.facts.length === 2 && r.facts[0].factKey !== r.facts[1].factKey
      && r.facts[0].factKey.endsWith('.1') && r.facts[1].factKey.endsWith('.2');
  })(), 'multi-gap on one sentence is preserved, not deduplicated away');
ok('F4. a malformed declarationId is refused',
  project([decl({ declarationId: 'has spaces' })])
    .perDeclaration[0].codes.includes('DECLARATION_ID_MALFORMED'));
ok('F5. every admitted key is unique within the analysis',
  (() => {
    const keys = multi.facts.map(f => f.factKey);
    return new Set(keys).size === keys.length;
  })());

// ================================================================ G. CONJUNCTIVE FACT

const CONJ_A = 'the wheel is guarded AND the work rest is set within the permitted clearance';
const CONJ_B = 'either the wheel is unguarded OR the work rest exceeds the permitted clearance';
const conj = project([decl({
  missingFact: 'whether the wheel guard is fitted and the work rest is within the permitted gap',
  branchA: CONJ_A,
  branchB: CONJ_B,
  decisionIfA: 'record both conditions as met and close the item',
  decisionIfB: 'raise a finding naming whichever of the two conditions is not met',
})]);
ok('G1. an A AND B branch survives projection with both conjuncts intact',
  conj.facts[0]?.branchA === CONJ_A && conj.facts[0]?.branchB === CONJ_B,
  'no conjunct dropped, no split on a conjunction');
ok('G2. nothing in the projection splits a branch on a conjunction',
  conj.facts.length === 1, 'one declaration, one fact — never two halves');

// ================================================================ H. DECISION DIVERGENCE

ok('H1. both decisions survive byte-exactly',
  fact?.decisionDivergence.ifA === d0.decisionIfA
  && fact?.decisionDivergence.ifB === d0.decisionIfB);
ok('H2. a declaration whose two decisions agree is refused rather than given a difference',
  (() => {
    const same = 'record the guard as verified and close the item with no corrective action';
    const r = project([decl({ decisionIfA: same, decisionIfB: same })]);
    return r.facts.length === 0
      && r.perDeclaration[0].codes.includes('DECISIONS_DO_NOT_DIVERGE');
  })());
ok('H3. two branches stating the same thing are refused',
  project([decl({ branchB: 'the tongue guard is fitted and adjusted to within the required '
    + 'distance of the wheel' })])
    .perDeclaration[0].codes.includes('BRANCHES_IDENTICAL'));

// ================================================================ I. ACCEPTABLE EVIDENCE

const CRITERION: AcceptableEvidence = {
  requirement: 'Evidence establishing work rest clearance by a verification method the governed '
    + 'record recognises.',
  examples: ['measured clearance recorded on the machine inspection sheet'],
  insufficientExamples: ['a visual impression that the gap looks small'],
  provenance: 'GOVERNED_EVIDENCE',
};
const withCriterion = project([decl({ governedEvidenceSourceIds: ['GOV-WORKREST-01'] })],
  { criteria: { 'GOV-WORKREST-01': CRITERION } });
ok('I1. a HazLenz-held criterion reaches the projected fact unaltered',
  JSON.stringify(withCriterion.facts[0]?.acceptableEvidence) === JSON.stringify(CRITERION));
ok('I2. null acceptableEvidence is the normal case and stays valid',
  one.facts[0]?.acceptableEvidence === null);
ok('I3. the declaration may NAME a governed id but may not carry a criterion',
  project([decl({ acceptableEvidence: CRITERION })])
    .perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'),
  'acceptableEvidence is HazLenz task state projected INTO a request, never back out of one');
ok('I4. naming a governed id HazLenz holds no criterion for leaves the fact with null',
  project([decl({ governedEvidenceSourceIds: ['GOV-WORKREST-01'] })])
    .facts[0]?.acceptableEvidence === null);

// ================================================================ J. VERIFIER HANDOFF

const ledger = createOwedFactLedger('DEVELOPMENT', multi.facts);
const projectedForVerifier = projectOwedFactsForVerifier(ledger);
ok('J1. projected facts enter the verifier projection with no harness augmentation',
  projectedForVerifier.length === 2
  && projectedForVerifier.every(p => p.evidenceSpan.length > 0 && p.branchA.length > 0));
ok('J2. every semantic string in the verifier projection is byte-equal to the declaration that '
  + 'produced it — nothing was authored between the two stages',
  [DECL_1, DECL_2].every((d, i) => {
    const p = projectedForVerifier[i];
    return p !== undefined
      && p.whyUnresolved === d.notEstablishedBecause
      && p.branchA === d.branchA
      && p.branchB === d.branchB
      && p.decisionDivergence.ifA === d.decisionIfA
      && p.decisionDivergence.ifB === d.decisionIfB
      && p.evidenceSpan === d.observationSpan.trim()
      && p.affectedDecision === d.affectedDecision;
  }), `${projectedForVerifier.length} facts, 7 fields each, all upstream`);
ok('J3. no forbidden field reaches the verifier projection',
  PROJECTION_FORBIDDEN_FIELDS.every(f => !JSON.stringify(projectedForVerifier).includes(`"${f}"`)));

const suppliedKeys = multi.facts.map(f => f.factKey);
const verdict = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
  analysisId: ANALYSIS_ID,
  verdict: 'ADD_OR_REPLACE_CLARIFICATION',
  rationale: 'the supplied fact is not settled by the observation and a question is owed',
  clarificationSourceMode: 'SUPPLIED_FACT',
  proposedClarification: {
    question: 'What was the measured distance between the tongue guard and the wheel?',
    whyItMatters: 'a guard outside the permitted distance takes the machine out of service today',
    affectedDecision: 'REQUIRED_CONTROL',
    evidenceGap: 'the guard position was not determined at the time of the observation',
  },
  bindingFactKey: suppliedKeys[0],
  nominatedFact: null,
  owedFactDeclarations: suppliedKeys.map((k, i) => ({
    factKey: k,
    declaration: i === 0 ? 'BOUND_BY_CLARIFICATION' : 'STILL_UNRESOLVED',
    challengeReason: null,
  })),
  regulatoryBasis: { reliance: 'NONE', sourceIds: [], proposition: null },
  ...over,
});

const handoff = checkVerifierV3_2Output(verdict(), {
  analysisId: ANALYSIS_ID,
  observation: OBSERVATION,
  suppliedOwedFactKeys: suppliedKeys,
  suppliedGovernedSourceIds: [],
});
ok('J4. a verifier verdict binding a PROJECTED key is admitted by v3.2 unchanged',
  handoff.admitted && handoff.bindingAdmitted,
  handoff.admitted ? `bound ${suppliedKeys[0]}` : handoff.codes.join(','));
ok('J5. a computed key satisfies the v3 closed-set binding shape',
  suppliedKeys.every(k => /^[A-Za-z0-9][A-Za-z0-9_:.\-]{0,127}$/.test(k)));

// ================================================================ K. UNKNOWN GOVERNED SOURCE

ok('K1. a governed sourceId nobody supplied is refused',
  (() => {
    const r = project([decl({ governedEvidenceSourceIds: ['GOV-INVENTED-99'] })]);
    return r.facts.length === 0
      && r.perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET');
  })());
ok('K2. with no governed evidence supplied, naming any id is refused',
  project([decl({ governedEvidenceSourceIds: ['GOV-WORKREST-01'] })], { governed: [] })
    .perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET'));
/**
 * K3 — SUPERSEDED BY §198, AND REPLACED RATHER THAN DELETED.
 *
 * HISTORICAL_ASSERTION (§196, 2026-09-06):
 *   "with no governed evidence supplied, the wire schema forbids naming one at all"
 *   implemented as `governedEvidenceSourceIds.maxItems === 0`
 *   summarised as "transport refuses it, and the boundary refuses it again".
 *
 * WHAT §197 OBSERVED: twelve hosted requests carrying that schema were rejected with HTTP 400
 * BEFORE INFERENCE — "For 'array' type, property 'maxItems' is not supported". The transport did
 * not refuse the id; it refused the whole request. The claimed independent transport layer did not
 * exist on the hosted path.
 *
 * CURRENT_ARCHITECTURE (§198, product-owner Option B): the property is OMITTED ENTIRELY when the
 * supplied set is empty. That is a stronger guarantee than a bounded field and one the transport
 * accepts, and it is what this case now asserts.
 *
 * The §196 evidence package is NOT edited. `verification/…-2026-09-06/TEST-OUTPUT.txt` still
 * records the original 91/91 run including the original K3 line, and
 * `SUPERSEDED-CLAIMS.md` in the §198 package carries the correction. What changes here is the
 * PROSPECTIVE regression semantics, which must track the architecture that actually ships.
 */
ok('K3. §198 — with no governed evidence supplied, the property is OMITTED from the wire schema',
  (() => {
    const s: any = buildExpertVNextWireSchema(INPUT, { governedEvidenceSourceIds: [] });
    const item = s.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
    return item.properties.governedEvidenceSourceIds === undefined
      && !item.required.includes('governedEvidenceSourceIds')
      && !JSON.stringify(s).includes('maxItems');
  })(), 'capability omission — absent from properties, absent from required, no maxItems anywhere');
ok('K3b. the §196 transport claim is recorded as superseded, not silently dropped',
  K3_HISTORICAL_ASSERTION.status === 'SUPERSEDED_BY_SECTION_198'
  && K3_HISTORICAL_ASSERTION.historicalEvidencePreserved === true,
  K3_HISTORICAL_ASSERTION.supersededBecause.slice(0, 60) + '…');
ok('K4. a duplicated governed id is refused',
  project([decl({ governedEvidenceSourceIds: ['GOV-WORKREST-01', 'GOV-WORKREST-01'] })])
    .perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_DUPLICATED'));

// ================================================================ L. AUTHORISED CITATION REUSE

const V33_INPUT: V3_3AdmissionInput = {
  analysisId: ANALYSIS_ID,
  observation: OBSERVATION,
  suppliedOwedFactKeys: suppliedKeys,
  suppliedGovernedSourceIds: ['GOV-WORKREST-01'],
  suppliedGovernedEvidence: [{ sourceId: 'GOV-WORKREST-01', text: GOVERNED_TEXT }],
};

const RELIANT = {
  reliance: 'SUPPLIED_GOVERNED_EVIDENCE',
  sourceIds: ['GOV-WORKREST-01'],
  proposition: 'the supplied record at 29 CFR 1910.215(a)(4) sets a maximum work rest clearance',
};

const v32Reuse = checkVerifierV3_2Output(verdict({ regulatoryBasis: RELIANT }), {
  ...V33_INPUT,
});
ok('L1. §195 collision reproduced — v3.2 refuses a citation copied from the supplied source',
  !v32Reuse.admitted && v32Reuse.codes.includes('PROHIBITED_REGULATORY_CITATION' as never),
  'unchanged: v3.2 is byte-identical and still refuses');

const v33Reuse = checkVerifierV3_3Output(verdict({ regulatoryBasis: RELIANT }), V33_INPUT);
ok('L2. v3.3 admits the same verdict as authorised supplied-source reuse',
  v33Reuse.admitted && v33Reuse.citationReuseAdmitted,
  v33Reuse.admitted ? v33Reuse.citationReuse?.admittedReuse.join(',') : v33Reuse.codes.join(','));
ok('L3. the withdrawal restores the v3-layer outcomes the refusal had suppressed',
  v33Reuse.bindingAdmitted && v33Reuse.boundSourceIds.join(',') === 'GOV-WORKREST-01'
  && v33Reuse.regulatoryRelianceDeclared);
ok('L4. a paraphrasing verdict is still admitted — the paraphrase route is not closed',
  checkVerifierV3_3Output(verdict({
    regulatoryBasis: {
      reliance: 'SUPPLIED_GOVERNED_EVIDENCE',
      sourceIds: ['GOV-WORKREST-01'],
      proposition: 'the supplied record sets a maximum work rest clearance for this wheel type',
    },
  }), V33_INPUT).admitted);
ok('L5. whitespace and case differences do not defeat the match, and nothing else is normalised',
  canonicalCitationToken('29 cfr  1910.215(a)(4)') === canonicalCitationToken('29CFR1910.215(A)(4)'));

// ================================================================ M. PROVIDER-INVENTED CITATION

const invented = checkVerifierV3_3Output(verdict({
  regulatoryBasis: {
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE',
    sourceIds: ['GOV-WORKREST-01'],
    proposition: 'the supplied record read with 29 CFR 1910.147 requires an isolation procedure',
  },
}), V33_INPUT);
ok('M1. a citation absent from every authorised source is refused',
  !invented.admitted && invented.codes.includes(UNAUTHORISED_REGULATORY_CITATION as never),
  invented.unauthorisedCitations.join(','));
ok('M2. an ALTERED citation — a paragraph the source does not carry — is refused',
  (() => {
    const r = checkVerifierV3_3Output(verdict({
      regulatoryBasis: {
        reliance: 'SUPPLIED_GOVERNED_EVIDENCE',
        sourceIds: ['GOV-WORKREST-01'],
        proposition: 'the supplied record at 29 CFR 1910.215(b)(9) sets the clearance',
      },
    }), V33_INPUT);
    return !r.admitted && r.unauthorisedCitations.includes('29CFR1910.215(B)(9)');
  })(), 'exact comparison over the whole identifier, never a prefix');
ok('M3. one authorised token beside one invented token refuses the verdict whole',
  (() => {
    const r = checkVerifierV3_3Output(verdict({
      regulatoryBasis: {
        reliance: 'SUPPLIED_GOVERNED_EVIDENCE',
        sourceIds: ['GOV-WORKREST-01'],
        proposition: 'the supplied record at 29 CFR 1910.215(a)(4), read with 29 CFR 1910.147, '
          + 'sets the clearance',
      },
    }), V33_INPUT);
    return !r.admitted && r.unauthorisedCitations.length === 1;
  })());
ok('M4. reuse is never assessed when any non-citation code stands',
  (() => {
    const r = checkVerifierV3_3Output(verdict({
      regulatoryBasis: {
        reliance: 'SUPPLIED_GOVERNED_EVIDENCE',
        sourceIds: ['GOV-NOT-SUPPLIED'],
        proposition: 'the record at 29 CFR 1910.215(a)(4) sets the clearance',
      },
    }), V33_INPUT);
    return !r.admitted && r.citationReuse === null
      && r.codes.includes('SOURCE_ID_NOT_IN_SUPPLIED_SET' as never);
  })(), 'an invalid reliance declaration can never authorise its own citation');

// ================================================================ N. NONE + NEW AUTHORITY

ok('N1. reliance NONE with a citation is refused',
  (() => {
    const r = checkVerifierV3_3Output(verdict({
      rationale: 'the observation does not settle this; 29 CFR 1910.215 requires a closer rest',
      regulatoryBasis: { reliance: 'NONE', sourceIds: [], proposition: null },
    }), V33_INPUT);
    return !r.admitted && r.codes.includes(UNAUTHORISED_REGULATORY_CITATION as never);
  })(), 'no authorised source text exists, so every token is refused');
ok('N2. NONE with sourceIds is still refused by v3.2 before reuse is considered',
  (() => {
    const r = checkVerifierV3_3Output(verdict({
      regulatoryBasis: { reliance: 'NONE', sourceIds: ['GOV-WORKREST-01'], proposition: null },
    }), V33_INPUT);
    return !r.admitted && r.codes.includes('SOURCE_IDS_PRESENT_WITHOUT_RELIANCE' as never);
  })());
ok('N3. the first pass gets NO reuse allowance — a citation in a declaration is refused',
  project([decl({ notEstablishedBecause: 'the record at 29 CFR 1910.215 is not satisfied here' })])
    .perDeclaration[0].codes.includes('PROHIBITED_REGULATORY_CITATION'),
  'v15 HARD PROHIBITIONS is not weakened by vNext');

// ================================================================ O. NO SETTLEMENT AUTHORITY

ok('O1. every projected fact enters UNRESOLVED',
  multi.facts.every(f => f.status === 'UNRESOLVED') && conj.facts.every(f => f.status === 'UNRESOLVED'));
ok('O2. the projection records no transition and confers no authority',
  (() => {
    const l = createOwedFactLedger('DEVELOPMENT', multi.facts);
    return l.transitions.length === 0;
  })());
ok('O3. the projection effect is false on every axis',
  Object.values(firstPassProjectionEffect()).every(v => v === false),
  Object.keys(firstPassProjectionEffect()).join(', '));
ok('O4. a declaration cannot claim to settle, resolve or cover anything',
  ['settled', 'resolved', 'covered', 'rejected', 'status'].every(f =>
    project([decl({ [f]: true })])
      .perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')));
ok('O5. a model-authored fact is flagged as such and cannot be mistaken for a derived one',
  multi.facts.every(f => f.modelAuthored === true && f.source === 'FIRST_PASS_MODEL'));

// ================================================================ P. PROTOCOL RECONSTRUCTION

ok('P1. vNext minus its prompt block reproduces v15 byte-identically',
  sha(reconstructV15SystemPrompt()) === sha(EXPERT_SYSTEM_PROMPT),
  sha(EXPERT_SYSTEM_PROMPT).slice(0, 16));
ok('P2. vNext minus its two schema additions reproduces v15 byte-identically',
  stableStringify(reconstructV15WireSchema(INPUT, GOVERNED_BINDING))
    === stableStringify(buildExpertWireSchema(INPUT)));
ok('P3. the vNext prompt is strictly longer than v15 and contains it in order',
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT.length
    === EXPERT_SYSTEM_PROMPT.length + UNRESOLVED_FACT_DECLARATION_LINES.join('\n').length + 1);
ok('P4. expert-prompt.ts is untouched by §196 — vNext composes and never mutates',
  EXPERT_SYSTEM_PROMPT.indexOf('STATING AN UNRESOLVED FACT IN FULL') === -1);
ok('P5. the change ledger names exactly the edits made',
  FIRST_PASS_VNEXT_CHANGE_LEDGER.length === 3
  && FIRST_PASS_VNEXT_CHANGE_LEDGER.filter(c => c.kind === 'SCHEMA').length === 2
  && FIRST_PASS_VNEXT_CHANGE_LEDGER.filter(c => c.kind === 'INSTRUCTION').length === 1);

// ================================================================ Q. CARRIER INDEPENDENCE

const vnextSchema: any = buildExpertVNextWireSchema(INPUT, GOVERNED_BINDING);
ok('Q1. unresolvedFactDeclarations is a top-level sibling, not a candidate-owned field',
  vnextSchema.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD] !== undefined
  && vnextSchema.properties.expertHazardCandidates.items
    .properties[UNRESOLVED_FACT_DECLARATIONS_FIELD] === undefined
  && vnextSchema.properties.decisionCriticalClarifications.items
    .properties[UNRESOLVED_FACT_DECLARATIONS_FIELD] === undefined,
  'no carrier hung off a hazard candidate — D-56 is not reintroduced');
ok('Q2. a declaration projects with zero hazard candidates and zero clarifications present',
  project([decl({})]).facts.length === 1);
ok('Q3. the clarification back-reference is optional and never in `required`',
  vnextSchema.properties.decisionCriticalClarifications.items
    .properties[CLARIFICATION_DECLARATION_BACKREF_FIELD] !== undefined
  && !vnextSchema.properties.decisionCriticalClarifications.items.required
    .includes(CLARIFICATION_DECLARATION_BACKREF_FIELD));
ok('Q4. a back-reference naming a real declaration resolves to its computed factKey',
  (() => {
    const links = resolveClarificationLinks(
      [{ clarificationId: 'C1', answersUnresolvedFactDeclarationId: 'D2' }], multi);
    return links[0].factKey === multi.facts[1].factKey && links[0].unresolved === false;
  })());
ok('Q5. a back-reference naming nothing is recorded unresolved and the question survives',
  (() => {
    const links = resolveClarificationLinks(
      [{ clarificationId: 'C1', answersUnresolvedFactDeclarationId: 'D-NOPE' }], multi);
    return links[0].unresolved === true && links[0].factKey === null;
  })());
ok('Q6. a clarification with no back-reference is not treated as broken',
  resolveClarificationLinks([{ clarificationId: 'C1' }], multi)[0].unresolved === false);

// ================================================================ R. CITATION PATTERN DISCIPLINE

ok('R1. every token the comparison pattern matches is also matched by the canonical detector',
  ['29 CFR 1910.215(a)(4)', '29CFR1910.147', '29 CFR 1926.501(b)(1)']
    .every(s => citationTokens(s).length === 1 && CITATION_SHAPED_PATTERN.test(s)),
  'the comparison pattern only ever extends a canonical match rightwards');
ok('R2. the comparison pattern carries /g, so a fresh instance is used per call',
  CITATION_TOKEN_PATTERN.flags.includes('g')
  && citationTokens('29 CFR 1910.215').length === 1
  && citationTokens('29 CFR 1910.215').length === 1,
  'no lastIndex carry-over between calls');
ok('R3. text with no citation is clean and admits nothing',
  (() => {
    const v = decideCitationReuse(['the supplied record sets a maximum clearance'], [GOVERNED_TEXT]);
    return v.clean && v.allReuse === false && v.admittedReuse.length === 0;
  })(), 'clean is not the same as reuse-admitted');
ok('R4. an empty authorised set refuses every token',
  decideCitationReuse(['29 CFR 1910.215(a)(4)'], []).refused.length === 1);
ok('R5. the admission matrix and the quotation boundary are recorded as data',
  CITATION_ADMISSION_MATRIX.length === 7
  && QUOTATION_BOUNDARY_STATEMENT.SECTION_196_CREATES_A_LICENCE_TO_QUOTE_AT_LENGTH === false
  && QUOTATION_BOUNDARY_STATEMENT.QUOTATION_LENGTH_LIMIT_EXISTS_ON_THE_VERIFIER_PATH === false);

// ================================================================ S. HONESTY OF THE CLAIMS

ok('S1. cross-analysis semantic identity is explicitly NOT claimed',
  FACT_IDENTITY_CLAIMS.SEMANTIC_IDENTITY_ACROSS_ANALYSES === false
  && FACT_IDENTITY_CLAIMS.INDEPENDENT_OF_GENERATED_RATIONALE_PROSE === true);
ok('S2. the residual limits are recorded, including the LIFE_CRITICAL gap and the owed property',
  PROJECTION_RESIDUAL_LIMITS.length === 4
  && PROJECTION_RESIDUAL_LIMITS.some(l => l.includes('LIFE_CRITICAL'))
  && PROJECTION_RESIDUAL_LIMITS.some(l => l.includes('owed property')));
ok('S3. every non-projecting declaration field has a recorded reason',
  NON_PROJECTING_DECLARATION_FIELDS.length === 5
  && NON_PROJECTING_DECLARATION_FIELDS.every(f => f.role.length > 40));
ok('S4. the protocol declares its own version and its base',
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION === 'hazlenz.expert.first-pass-instruction.vNext');

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
