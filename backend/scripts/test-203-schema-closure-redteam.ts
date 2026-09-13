/**
 * §203 EXPERT HAZLENZ -- AGENT D SCHEMA CLOSURE / AUTHORITY RED TEAM. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * Independent adversarial suite over the §203 successor model-facing boundaries. Written WITHOUT
 * reference to Agents B/C/E's own suites: every attack here executes the real modules with hostile
 * input and asserts what actually happens. Attacks that FAIL to break a boundary are the passing
 * assertions. An attack that crosses a boundary is recorded as an EXPECTED-FINDING case: the
 * assertion states the measured (defective or caveated) behaviour truthfully, the finding ledger
 * prints it, and the finding is dispositioned in SCHEMA-CLOSURE-RED-TEAM.md. No assertion was
 * weakened to green a defect -- an EXPECTED-FINDING asserts the defect precisely so it cannot
 * silently change shape.
 */

import {
  SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203,
  SUCCESSOR_DECLARATION_KEYS as SUCCESSOR_PROJECTION_DECLARATION_KEYS,
  projectDeclaredOwedFacts203,
  successorProjectionEffect,
} from './lib/expert-203-successor-projection';
import {
  SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203,
  SUCCESSOR_DECLARATION_KEYS, SUCCESSOR_NOMINATION_KEYS,
  SUCCESSOR_NOMINATED_FACT_PRIORITY,
  type SuccessorBindingCheckResult, type SuccessorClarificationDeclaration,
  applyAdmittedDeclarations203, checkBindingDeclarations203, successorBindingEffect,
} from './lib/expert-203-successor-binding';
import { factIdentityCollisionEffect } from './lib/expert-203-fact-identity-collision';
import {
  effectiveGrammarIdentity203, grammarRejectionKey203,
} from './lib/expert-203-effective-grammar-identity';
import {
  type OwedFactLedger, createOwedFactLedger, factOf, owedFact, transition,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import type { BindingCheckResult } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  projectStructuralQuestions,
} from '../src/hazlenz/expert-hazlenz/owed-facts/structural-questions';
import type { ProjectionInput } from './lib/expert-first-pass-owed-fact-projection';

// ================================================================ harness

let passed = 0;
let failed = 0;
const expectedFindings: string[] = [];
const fails: string[] = [];

function check(name: string, cond: boolean, detail = ''): void {
  if (cond) { passed += 1; } else { failed += 1; fails.push(`${name}${detail ? ` -- ${detail}` : ''}`); }
  // eslint-disable-next-line no-console
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}

/** An EXPECTED-FINDING asserts the measured defective/caveated behaviour truthfully. */
function finding(id: string, name: string, cond: boolean, detail: string): void {
  check(`${id} [EXPECTED-FINDING] ${name}`, cond, detail);
  if (cond) expectedFindings.push(`${id}: ${detail}`);
}

// ================================================================ fixtures

const OBS = 'the machine guard was missing from the press and the operator continued the run';

const unresolvedFact = () => owedFact({
  factKey: 'FP.EXPOSURE.src1.1',
  affectedDecision: 'EXPOSURE',
  source: 'FIRST_PASS_MODEL',
  evidenceSpan: 'the machine guard was missing from the press',
  whyUnresolved: 'guard state not established',
  branchA: 'guard was present', branchB: 'guard was absent',
  decisionDivergence: { ifA: 'no exposure finding', ifB: 'exposure finding required' },
  priority: 'OTHER',
});

const devLedger = (): OwedFactLedger => createOwedFactLedger('DEVELOPMENT', [unresolvedFact()]);

const coveredLedger = (): OwedFactLedger => transition(devLedger(), {
  factKey: 'FP.EXPOSURE.src1.1', to: 'COVERED', authority: 'ADMITTED_BINDING',
  justification: 'red-team fixture: bound in an earlier attempt',
});

const boundDecl = (): SuccessorClarificationDeclaration => ({
  declarationId: 'D-BOUND-1', bindingMode: 'BOUND_TO_OWED_FACT',
  coversFactKey: 'FP.EXPOSURE.src1.1', nomination: null,
  question: 'Was the machine guard present during the observed run?',
  affectedDecision: 'EXPOSURE',
});

const nominatedDecl = (): SuccessorClarificationDeclaration => ({
  declarationId: 'D-NOM-1', bindingMode: 'NOMINATED_NEW', coversFactKey: null,
  nomination: {
    factKey: 'VN.EXPOSURE.new.1', affectedDecision: 'EXPOSURE',
    evidenceSpan: 'the operator continued the run',
    whyUnresolved: 'operator exposure duration not established',
    branchA: 'operator was exposed', branchB: 'operator was not exposed',
    decisionIfA: 'stop-work control required', decisionIfB: 'no additional control',
  },
  question: 'How long did the operator continue the run?', affectedDecision: 'EXPOSURE',
});

const asDecl = (o: unknown): SuccessorClarificationDeclaration =>
  o as SuccessorClarificationDeclaration;

// ================================================================ 1. schema closure, mechanical

type SchemaNode = Record<string, unknown>;

/** Every node that admits object instances must set additionalProperties: false itself. */
function openObjectNodes(node: unknown, path: string): string[] {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return [];
  const s = node as SchemaNode;
  const out: string[] = [];
  const t = s.type;
  const admitsObject = t === 'object' || (Array.isArray(t) && t.includes('object'));
  if (admitsObject && s.additionalProperties !== false) out.push(path);
  const props = s.properties;
  if (props && typeof props === 'object') {
    for (const [k, v] of Object.entries(props as SchemaNode)) {
      out.push(...openObjectNodes(v, `${path}.properties.${k}`));
    }
  }
  if (s.items) out.push(...openObjectNodes(s.items, `${path}.items`));
  return out;
}

{
  const open1 = openObjectNodes(SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203, '$fp');
  check('1.1 projection schema: every object node closes additionalProperties',
    open1.length === 0, open1.join(', '));
  const open2 = openObjectNodes(SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203, '$bind');
  check('1.2 binding schema: every object node closes additionalProperties',
    open2.length === 0, open2.join(', '));

  const schemaProps = Object.keys(SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203.properties).sort();
  check('1.3 binding schema properties === closed runtime key set',
    JSON.stringify(schemaProps) === JSON.stringify([...SUCCESSOR_DECLARATION_KEYS].sort()));
  const nomProps = Object.keys(
    SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203.properties.nomination.properties).sort();
  check('1.4 nomination schema properties === closed runtime key set',
    JSON.stringify(nomProps) === JSON.stringify([...SUCCESSOR_NOMINATION_KEYS].sort()));
  const fpProps = Object.keys(SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203.properties).sort();
  check('1.5 projection schema properties === closed runtime key set',
    JSON.stringify(fpProps) === JSON.stringify([...SUCCESSOR_PROJECTION_DECLARATION_KEYS].sort()));
}

// ================================================================ 2. binding boundary attacks

const AUTHORITY_FIELDS = [
  'factKey', 'priority', 'status', 'settled', 'sourceId', 'governedEvidenceSourceIds',
  'branchA', 'branchB', 'decisionIfA', 'decisionIfB', 'decisionDivergence', 'evidenceSpan',
  'whyUnresolved', 'acceptableEvidence', 'source', 'modelAuthored', 'resolved', 'covered',
  'rejected', 'factNotDecisionCritical', 'citation', 'approved', 'knowledgeReleaseId',
] as const;

const KEY_VARIANTS = [
  'FactKey', 'PRIORITY', ' priority', 'priority ', 'priorіty' /* Cyrillic i */,
  'constructor', 'toString',
] as const;

{
  // -- declaration level: every authority field and variant is either forbidden or unknown.
  for (const f of [...AUTHORITY_FIELDS, ...KEY_VARIANTS]) {
    const d = asDecl({ ...boundDecl(), [f]: 'ATTACK' });
    const r = checkBindingDeclarations203([d], devLedger(), OBS);
    const p = r.perDeclaration[0];
    check(`2.1 declaration+'${f}' refused at boundary`,
      !p.admitted && p.codes.some(c =>
        c === 'UNKNOWN_FIELD_AT_CLOSED_BOUNDARY' || c === 'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'),
      `admitted=${p.admitted} codes=${p.codes.join(',')}`);
  }

  // -- nomination level: authority fields and variants.
  for (const f of [...AUTHORITY_FIELDS, ...KEY_VARIANTS]) {
    if ((SUCCESSOR_NOMINATION_KEYS as readonly string[]).includes(f)) continue; // legal fields
    const base = nominatedDecl();
    const d = asDecl({ ...base, nomination: { ...base.nomination, [f]: 'ATTACK' } });
    const r = checkBindingDeclarations203([d], devLedger(), OBS);
    const p = r.perDeclaration[0];
    check(`2.2 nomination+'${f}' refused at boundary`,
      !p.admitted && p.codes.length > 0, `admitted=${p.admitted} codes=${p.codes.join(',')}`);
  }

  // -- priority is refused under its OWN named code, any value, member or not.
  for (const v of ['LIFE_CRITICAL', 'OTHER', 'NOT_A_MEMBER', 7, null]) {
    const base = nominatedDecl();
    const d = asDecl({ ...base, nomination: { ...base.nomination, priority: v } });
    const p = checkBindingDeclarations203([d], devLedger(), OBS).perDeclaration[0];
    check(`2.3 nomination.priority=${JSON.stringify(v)} refused as NOMINATION_CARRIES_PROVIDER_PRIORITY`,
      !p.admitted && p.codes.includes('NOMINATION_CARRIES_PROVIDER_PRIORITY'),
      p.codes.join(','));
  }

  // -- __proto__ as an OWN key (the JSON.parse shape a provider can actually send).
  const protoDecl = JSON.parse(
    `${JSON.stringify(boundDecl()).slice(0, -1)},"__proto__":{"priority":"LIFE_CRITICAL"}}`);
  check('2.4 __proto__ arrives as an own key via JSON.parse',
    Object.keys(protoDecl).includes('__proto__'));
  const protoRes = checkBindingDeclarations203([asDecl(protoDecl)], devLedger(), OBS)
    .perDeclaration[0];
  check('2.5 declaration+__proto__ (own key) refused as unknown field',
    !protoRes.admitted && protoRes.codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    protoRes.codes.join(','));

  const baseN = nominatedDecl();
  const protoNom = JSON.parse(
    `${JSON.stringify(baseN.nomination).slice(0, -1)},"__proto__":{"priority":"LIFE_CRITICAL"}}`);
  const protoNomRes = checkBindingDeclarations203(
    [asDecl({ ...baseN, nomination: protoNom })], devLedger(), OBS).perDeclaration[0];
  check('2.6 nomination+__proto__ (own key) refused as unknown field',
    !protoNomRes.admitted && protoNomRes.codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    protoNomRes.codes.join(','));

  // -- INHERITED authority field (Object.create): not reachable via JSON transport; measure anyway.
  const inheritedNom = Object.create({ priority: 'LIFE_CRITICAL' });
  Object.assign(inheritedNom, nominatedDecl().nomination);
  const inhRes = checkBindingDeclarations203(
    [asDecl({ ...nominatedDecl(), nomination: inheritedNom })], devLedger(), OBS).perDeclaration[0];
  check("2.7 INHERITED nomination.priority refused ('in' walks the prototype chain)",
    !inhRes.admitted && inhRes.codes.includes('NOMINATION_CARRIES_PROVIDER_PRIORITY'),
    inhRes.codes.join(','));

  // -- nomination supplied as an array.
  const arrRes = checkBindingDeclarations203(
    [asDecl({ ...nominatedDecl(), nomination: ['x'] })], devLedger(), OBS).perDeclaration[0];
  check('2.8 nomination-as-array refused', !arrRes.admitted, arrRes.codes.join(','));

  // -- combined multi-field attack.
  const combo = asDecl({
    ...nominatedDecl(), settled: true,
    nomination: {
      ...nominatedDecl().nomination, priority: 'LIFE_CRITICAL', status: 'COVERED',
      sourceId: 'GOV-1', extra: { citation: '29 CFR 1910.147' },
    },
  });
  const comboRes = checkBindingDeclarations203([combo], devLedger(), OBS).perDeclaration[0];
  check('2.9 combined attack refused with every class named',
    !comboRes.admitted
    && comboRes.codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')
    && comboRes.codes.includes('NOMINATION_CARRIES_PROVIDER_PRIORITY')
    && comboRes.codes.includes('NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD')
    && comboRes.codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    comboRes.codes.join(','));

  // -- admitted-set purity over the whole corpus above: nothing admitted carries an unknown key.
  const corpus: SuccessorClarificationDeclaration[] = [boundDecl(), nominatedDecl()];
  const r = checkBindingDeclarations203(corpus, devLedger(), OBS);
  const impure = r.admitted.filter(d =>
    Object.keys(d).some(k => !(SUCCESSOR_DECLARATION_KEYS as readonly string[]).includes(k))
    || (d.nomination !== null && typeof d.nomination === 'object'
      && Object.keys(d.nomination).some(k =>
        !(SUCCESSOR_NOMINATION_KEYS as readonly string[]).includes(k))));
  check('2.10 clean corpus admits, and every admitted object is key-pure',
    r.admitted.length === 2 && impure.length === 0);
}

// ================================================================ 3. value-shape probes (TYPE_ONLY)

{
  // -- `question` value shape is enforced by nothing at the runtime boundary.
  const qObj = asDecl({ ...boundDecl(), question: { citation: '29 CFR 1910.147', approved: true } });
  const qRes = checkBindingDeclarations203([qObj], devLedger(), OBS);
  finding('RT203-2', 'object-valued `question` crosses the binding admission boundary',
    qRes.perDeclaration[0].admitted === true,
    'question: {citation, approved} admitted with zero codes; value shape is TYPE_ONLY at this '
    + 'boundary and the nested-governance walk is not applied to binding declaration values');
  // ...and the frozen question projection then carries it verbatim to the question surface.
  const qProj = projectStructuralQuestions(
    qRes as unknown as BindingCheckResult, devLedger());
  finding('RT203-2b', 'the non-string question is carried verbatim onto StructuralQuestion',
    typeof qProj.questions[0]?.question === 'object'
    && (qProj.questions[0]?.question as unknown as Record<string, unknown>).citation
      === '29 CFR 1910.147',
    'projectStructuralQuestions copies d.question without a shape check; a citation-bearing object '
    + 'reaches the (development-only) question surface');
  // ...but acquires no deterministic authority: priority came from the ledger fact, not the payload.
  check('3.1 smuggled question object acquires no priority/status authority',
    qProj.questions[0]?.priority === 'OTHER'
    && factOf(devLedger(), 'FP.EXPOSURE.src1.1')?.status === 'UNRESOLVED');

  // -- declaration-level `affectedDecision` on the BOUND path is copied unchecked.
  const adBogus = asDecl({ ...boundDecl(), affectedDecision: 'TOTALLY_BOGUS_DECISION' });
  const adRes = checkBindingDeclarations203([adBogus], devLedger(), OBS);
  finding('RT203-3', 'non-member declaration-level affectedDecision admitted on the BOUND path',
    adRes.perDeclaration[0].admitted === true,
    'only nomination.affectedDecision is membership-checked; the BOUND declaration copy is '
    + 'TYPE_ONLY and flows verbatim to the question projection');

  // -- object-valued declarationId is admitted (blank/shape unchecked on the binding path).
  const idObj = asDecl({ ...boundDecl(), declarationId: { evil: true } });
  const idRes = checkBindingDeclarations203([idObj], devLedger(), OBS);
  finding('RT203-4', 'object-valued declarationId crosses the binding admission boundary',
    idRes.perDeclaration[0].admitted === true,
    'declarationId is used only for duplicate detection; its shape is TYPE_ONLY here (the frozen '
    + 'projection path, by contrast, enforces FACT_KEY_SHAPE on its ids)');
}

// ================================================================ 4. projection boundary attacks

const projInput = (declarations: unknown[]): ProjectionInput => ({
  declarations,
  sources: [{ sourceId: 'src1', text: OBS }],
  suppliedGovernedSourceIds: [],
  stage: 'FIRST_PASS_MODEL',
  acceptableEvidenceBySourceId: undefined,
});

const validProjectionDecl = () => ({
  declarationId: 'FPD-1',
  missingFact: 'guard state not established',
  observationSourceId: 'src1',
  observationSpan: 'the machine guard was missing from the press',
  notEstablishedBecause: 'the observation does not state whether the guard was removed or absent',
  affectedDecision: 'EXPOSURE',
  branchA: 'guard was present', decisionIfA: 'no exposure finding',
  branchB: 'guard was absent', decisionIfB: 'exposure finding required',
  whyNecessaryNow: 'the operator continued the run',
});

{
  for (const f of ['factKey', 'priority', 'status', 'settled', 'sourceId', 'FactKey',
    'acceptableEvidence', 'citation', ' priority'] as const) {
    const r = projectDeclaredOwedFacts203(projInput([{ ...validProjectionDecl(), [f]: 'ATTACK' }]));
    check(`4.1 projection declaration+'${f}' refused at the successor boundary`,
      r.boundaryState === 'DELEGATED' && r.boundaryRefusals.length === 1
      && r.boundaryRefusals[0].codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
      r.boundaryRefusals.map(b => b.codes.join(',')).join(';'));
  }

  const protoTop = JSON.parse(`${JSON.stringify(validProjectionDecl()).slice(0, -1)
  },"__proto__":{"citation":"29 CFR 1910.147"}}`);
  const protoR = projectDeclaredOwedFacts203(projInput([protoTop]));
  check('4.2 projection declaration+__proto__ (own key) refused',
    protoR.boundaryRefusals.length === 1
    && protoR.boundaryRefusals[0].codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'));

  // -- nested citation at depth 3 under a legal key: the ABF-7 walk sees it.
  const shallow = { ...validProjectionDecl(), branchA: { a: { citation: '29 CFR 1910.147' } } };
  const shallowR = projectDeclaredOwedFacts203(projInput([shallow]));
  check('4.3 depth-3 nested citation refused by the successor ABF-7 walk',
    shallowR.boundaryRefusals.length === 1
    && shallowR.boundaryRefusals[0].codes.includes('NESTED_FORBIDDEN_GOVERNANCE_FIELD'));

  // -- nested citation at depth ~10: the imported §202 guard returns [] past depth 8 (fails OPEN).
  let deep: Record<string, unknown> = { citation: '29 CFR 1910.147', approved: true };
  for (let i = 0; i < 9; i += 1) deep = { [`n${i}`]: deep };
  const deepDecl = { ...validProjectionDecl(), branchA: deep };
  const deepR = projectDeclaredOwedFacts203(projInput([deepDecl]));
  finding('RT203-1', 'ABF-7 walk fails OPEN past depth 8: deep burial crosses the successor boundary',
    deepR.boundaryRefusals.length === 0,
    'nestedForbiddenGovernanceFields returns [] beyond depth 8 (silent truncation, the AB203-1 '
    + 'class); a citation at depth 10 under a legal key produces zero successor refusals');
  // ...defense in depth: the frozen projection still refuses the carrier for its shape.
  const deepPer = deepR.projection?.perDeclaration ?? [];
  check('4.4 deep-burial carrier still refused downstream by frozen shape checks',
    deepPer.length === 1 && deepPer[0].admitted === false && deepPer[0].owedFact === null,
    JSON.stringify(deepPer.map(p => p.codes)));

  // -- stage authority (ABF-1), independently re-executed.
  const stageR = projectDeclaredOwedFacts203({
    ...projInput([validProjectionDecl()]), stage: 'DEVELOPMENT_HUMAN_TRUTH' as never,
  });
  check('4.5 hostile stage rejects the whole call before any frozen code runs',
    stageR.boundaryState === 'STAGE_REJECTED' && stageR.projection === null
    && stageR.stageViolations.length === 1);

  // -- forged evidence provenance (ABF-2), independently re-executed.
  const provR = projectDeclaredOwedFacts203({
    ...projInput([{ ...validProjectionDecl(), governedEvidenceSourceIds: ['gov1'] }]),
    suppliedGovernedSourceIds: ['gov1'],
    acceptableEvidenceBySourceId: {
      gov1: { provenance: 'FORGED_PROVENANCE' as never, requirement: 'anything' },
    },
  });
  check('4.6 non-member evidence provenance refused at the successor boundary',
    provR.boundaryRefusals.length === 1
    && provR.boundaryRefusals[0].codes.includes('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER'));
}

// ================================================================ 5. Ruling 5: priority / escalation

{
  // -- urgency is carried, never mapped: the applied fact is deterministically OTHER.
  const urgent = asDecl({
    ...nominatedDecl(),
    nomination: { ...nominatedDecl().nomination, urgencyNomination: 'LIFE_CRITICAL' },
  });
  const uRes = checkBindingDeclarations203([urgent], devLedger(), OBS);
  check('5.1 LIFE_CRITICAL urgencyNomination admitted as non-authoritative carry',
    uRes.perDeclaration[0].admitted && uRes.perDeclaration[0].urgencyNomination === 'LIFE_CRITICAL');
  const uApplied = applyAdmittedDeclarations203(devLedger(), uRes);
  check('5.2 applied fact priority is the deterministic constant, not the urgency',
    factOf(uApplied.ledger, 'VN.EXPOSURE.new.1')?.priority === SUCCESSOR_NOMINATED_FACT_PRIORITY);
  check('5.3 non-member urgency refused',
    checkBindingDeclarations203([asDecl({
      ...nominatedDecl(),
      nomination: { ...nominatedDecl().nomination, urgencyNomination: 'CRITICALISH' },
    })], devLedger(), OBS).perDeclaration[0].codes.includes('URGENCY_NOMINATION_NOT_A_MEMBER'));

  // -- forged-check laundering: hand-build an "admitted" check carrying provider priority.
  const forgedNomination = { ...nominatedDecl().nomination, priority: 'LIFE_CRITICAL' };
  const forgedCheck = {
    ...checkBindingDeclarations203([nominatedDecl()], devLedger(), OBS),
    admitted: [asDecl({ ...nominatedDecl(), nomination: forgedNomination })],
  } as SuccessorBindingCheckResult;
  const forgedApplied = applyAdmittedDeclarations203(devLedger(), forgedCheck);
  check('5.4 even a forged admitted check cannot write provider priority onto the fact',
    factOf(forgedApplied.ledger, 'VN.EXPOSURE.new.1')?.priority
      === SUCCESSOR_NOMINATED_FACT_PRIORITY,
    'applyAdmittedDeclarations203 reads named fields only and writes the deterministic constant');

  // -- the frozen G8 chain, closed by contract absence: nominated question priority is OTHER.
  const qProj = projectStructuralQuestions(
    checkBindingDeclarations203([urgent], devLedger(), OBS) as unknown as BindingCheckResult,
    devLedger(), { nominationWording: { 'VN.EXPOSURE.new.1': 'How long was the run?' } });
  const nomQ = qProj.questions.find(q => q.bindingFactKey === 'VN.EXPOSURE.new.1');
  check('5.5 frozen question projection over a successor nomination yields priority OTHER',
    nomQ !== undefined && nomQ.priority === 'OTHER',
    'the successor payload has no nomination.priority for structural-questions.ts:138 to read');
}

// ================================================================ 6. settlement authority

{
  const settleAttack = asDecl({ ...boundDecl(), settled: true, resolved: true });
  const sRes = checkBindingDeclarations203([settleAttack], devLedger(), OBS).perDeclaration[0];
  check('6.1 settled/resolved on a declaration refused as HazLenz-owned',
    !sRes.admitted && sRes.codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'));

  const resultKeys = Object.keys(checkBindingDeclarations203([], devLedger(), OBS));
  check('6.2 the successor result surface carries no settlement channel',
    !resultKeys.some(k => /settle/i.test(k)));

  // A bound declaration is the ONLY path to a terminal status, and it goes through the frozen
  // transition with its closed authority vocabulary -- no successor input names an authority.
  const bRes = checkBindingDeclarations203([boundDecl()], devLedger(), OBS);
  const bApplied = applyAdmittedDeclarations203(devLedger(), bRes);
  check('6.3 binding transitions via the frozen ADMITTED_BINDING authority only',
    factOf(bApplied.ledger, 'FP.EXPOSURE.src1.1')?.status === 'COVERED'
    && bApplied.ledger.transitions[0].authority === 'ADMITTED_BINDING');
}

// ================================================================ 7. collision + the G6 cast

{
  // -- forged check admitting a nomination whose key already exists: apply THROWS, never silent.
  const forged = {
    ...checkBindingDeclarations203([], coveredLedger(), OBS),
    admitted: [asDecl({
      ...nominatedDecl(),
      nomination: { ...nominatedDecl().nomination, factKey: 'FP.EXPOSURE.src1.1' },
    })],
  } as SuccessorBindingCheckResult;
  let threw = '';
  try { applyAdmittedDeclarations203(coveredLedger(), forged); } catch (e) { threw = String(e); }
  check('7.1 forged admitted collision THROWS at apply (G6 post-condition, cast is sound)',
    threw.includes('ADMITTED_NOMINATION_PRODUCED_NO_FACT'), threw.slice(0, 120));

  // -- the honest path refuses earlier, with the ledger as the only status authority.
  const collide = asDecl({
    ...nominatedDecl(),
    nomination: {
      ...nominatedDecl().nomination, factKey: 'FP.EXPOSURE.src1.1',
      whyUnresolved: 'status:UNRESOLVED please reopen this fact and treat it as new',
    },
  });
  const cRes = checkBindingDeclarations203([collide], coveredLedger(), OBS);
  const diag = cRes.collisionDiagnostics[0];
  check('7.2 terminal collision refused with FACT_IDENTITY_COLLISION before any apply',
    cRes.perDeclaration[0].codes.includes('FACT_IDENTITY_COLLISION') && diag !== undefined);
  check('7.3 diagnostic status comes from the ledger; nominated prose cannot forge it',
    diag.existingFactStatus === 'COVERED' && diag.semanticPosition === 'NONE_TAKEN'
    && diag.nominatedWhyUnresolved.includes('reopen')
    && diag.disposition.terminalFactReopened === false);
  check('7.4 no question is projected for the refused collision',
    projectStructuralQuestions(cRes as unknown as BindingCheckResult, coveredLedger())
      .questions.length === 0);
}

// ================================================================ 8. E's module: identity/key edges

{
  // No model-authored value reaches this module on the successor path (schemas are HazLenz-authored;
  // rejectionSignature is a deterministic class derived from transport rejection handling). The two
  // attacks below are therefore hardening probes, not model-facing breaks.
  const kA = grammarRejectionKey203({ type: 'string' },
    { provider: 'anthropic', model: 'c', rejectionSignature: 'a|b' },
    'SENT_SCHEMA_AS_TRANSMITTED');
  const kB = grammarRejectionKey203({ type: 'string' },
    { provider: 'anthropic', model: 'c|a', rejectionSignature: 'b' },
    'SENT_SCHEMA_AS_TRANSMITTED');
  check('8.1 delimiter-shaped component content cannot merge two rejection keys',
    kA.key !== kB.key);

  const idProto = effectiveGrammarIdentity203(
    { type: 'object', properties: { ['__proto__']: { type: 'string' } } });
  const idEmpty = effectiveGrammarIdentity203({ type: 'object', properties: {} });
  finding('RT203-5', 'a property literally named __proto__ is erased from the grammar identity',
    idProto === idEmpty,
    'canonicalJson203/grammarProjection203 rebuild objects via o[k]=v, and a "__proto__" key '
    + 'assignment sets the prototype instead of an own property -- the two schemas share one '
    + 'identity (false MERGE direction). Not model-facing: schemas are HazLenz-authored.');
}

// ================================================================ 9. effect declarations truthful

{
  check('9.1 successorProjectionEffect literals', JSON.stringify(successorProjectionEffect())
    === JSON.stringify({ providerCalls: 0, databaseOperations: 0, modifiesFrozenProjection: false,
      factsMayBeSettled: false, prioritiesMayBeEscalated: false }));
  check('9.2 successorBindingEffect literals', successorBindingEffect().providerMaySetPriority
    === false && successorBindingEffect().admittedNominationMayVanishSilently === false);
  check('9.3 factIdentityCollisionEffect literals', factIdentityCollisionEffect()
    .reopensTerminalFacts === false);
}

// ================================================================ report

// eslint-disable-next-line no-console
console.log(`\n=== §203 AGENT D RED TEAM: ${passed} passed / ${failed} failed ===`);
if (expectedFindings.length > 0) {
  // eslint-disable-next-line no-console
  console.log('\nEXPECTED-FINDING LEDGER (dispositioned in SCHEMA-CLOSURE-RED-TEAM.md):');
  for (const f of expectedFindings) console.log(`  ${f}`); // eslint-disable-line no-console
}
if (failed > 0) {
  for (const f of fails) console.error(`FAILED: ${f}`); // eslint-disable-line no-console
  process.exit(1);
}
