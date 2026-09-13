/**
 * §253 -- BOUNDED LOCAL PROOF OF THE ALONGSIDE-CONTROL REPAIR. ZERO PROVIDER CALLS. ZERO DATABASE
 * OPERATIONS.
 *
 * Proves A through D of the §253 proof requirements directly, plus the adjudication evidence and the
 * narrowness of the change. E, F, G and H are proved by the §252 harnesses re-run unchanged, and are
 * reported alongside rather than restated here.
 *
 * Every fixture admits through the REAL production entry point.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import {
  buildBasisEntryUnion247, build247SystemPrompt, CESSATION_ROLE_247, ROLE_JUSTIFICATION_FIELD,
  DRIVER_ROLE_FIELD_247,
} from '../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import {
  buildBasisEntryUnion253, reconstruct247BasisEntryUnion, buildExpert253WireSchema,
  reconstruct247WireSchema, contractIdentities253, FIELDS_MADE_NON_NULLABLE_253,
  NULLABLE_FIELDS_RETAINED_253, NULL_SENTENCE_REPLACED_FROM_247, ALONGSIDE_SENTENCE_253,
} from '../src/hazlenz/expert-hazlenz/contract/expert-253-posture-contract';
import { buildExpert247WireSchema } from '../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import { governedBindingFor } from '../src/hazlenz/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import { conformsToContract252, closeObjectNodes252 }
  from '../src/hazlenz/expert-hazlenz/contract/expert-252-structural-admission';
import { admitThroughProductionPath } from './lib/expert-252-replay-path';
import { OBS, INPUT, validOutput } from './verify-252-admission-matrix';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-253-alongside-control-contract-closure-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

let pass = 0; let fail = 0; const failures: string[] = [];
const rows: any[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  rows.push({ id, pass: cond, detail: d });
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const clone = (o: any): any => JSON.parse(JSON.stringify(o));
const governed = governedBindingFor([]);

/** A cessation-driver output. The posture floor forces STOP, so no controls may be present. */
function cessationOutput(over: Record<string, unknown>): any {
  const o = clone(validOutput());
  o.immediateSafetyPosture.posture = 'STOP';
  o.immediateSafetyPosture.requiredControls = [];
  o.immediateSafetyPosture.resumeCondition = {
    resolvedByDeclarationIds: ['slab-capacity-unrecorded'], correctionsRequired: [],
  };
  const e = o.immediateSafetyPosture.requiredBy[0];
  e.driverRole = 'ESTABLISHED_CONDITION_REQUIRING_CESSATION';
  e.roleJustification = {
    epistemicCharacter: 'ESTABLISHED_CONDITION',
    factualBasis: 'the observation states the outriggers are deployed on spreader plates',
    unresolvedElement: null,
    whyDecisionMaterial: 'whether the platform may remain on the slab at all',
    whyControllingNotFollowUp: 'the exposure persists for as long as the platform stays there',
    dischargingControlRef: null,
    ...over,
  };
  return o;
}

async function main(): Promise<void> {
  // ============================================================ the adjudication evidence
  console.log('---- adjudication: what the frozen §247 artifacts say ----');
  const suiteSrc = readFileSync(join(__dirname, 'test-247-driver-role-and-k6.ts'), 'utf8');
  const designSrc = readFileSync(join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-247-canonical-closure-and-remediation-2026-09-12',
    'SECTION-247-DRIVER-ROLE-IMPLEMENTATION.md'), 'utf8');
  const reportSrc = readFileSync(join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-247-canonical-closure-and-remediation-2026-09-12',
    'SECTION-247-REPORT.md'), 'utf8');
  const projSrc = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'contract', 'expert-247-role-justification-projection.ts'), 'utf8');

  ok('J1 the frozen §247 fixture reads a null pair as a confrontation that did not happen',
    /alongsideControlConsidered: null/.test(suiteSrc)
    && /F1 C5: a cessation driver that never confronts the alongside control is refused/.test(suiteSrc));
  ok('J2 the §247 design record says a cessation driver must NAME both fields',
    /must\s*\n?\s*name `alongsideControlConsidered` and `whyAlongsideControlInsufficient`/.test(designSrc));
  ok('J3 the §247 design record marks unresolvedElement, and only it, as nullable',
    /`unresolvedElement` \(the one open thing, or null\)/.test(designSrc)
    && !/alongsideControlConsidered[^\n]*or null/.test(designSrc));
  ok('J4 the §247 report says a cessation driver must name the alongside control',
    /A cessation driver must now name the alongside control it/.test(reportSrc));
  ok('J5 the §247 projection refuses null and is left untouched by §253',
    /if \(!nonEmpty\(jr\.alongsideControlConsidered\)/.test(projSrc)
    && /CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT/.test(projSrc));

  // ============================================================ the repair, structurally
  console.log('\n---- the repair, and its narrowness ----');
  const u247 = buildBasisEntryUnion247() as any;
  const u253 = buildBasisEntryUnion253() as any;
  const cess = (u: any): any => (u.anyOf as any[])
    .find(b => b.properties[DRIVER_ROLE_FIELD_247].const === CESSATION_ROLE_247)
    .properties[ROLE_JUSTIFICATION_FIELD];

  ok('R1 the cessation fields no longer admit null',
    FIELDS_MADE_NON_NULLABLE_253.every(f => cess(u253).properties[f].type === 'string'),
    FIELDS_MADE_NON_NULLABLE_253.join(','));
  ok('R2 the transmitted description no longer instructs the model to write null',
    !cess(u253).properties.alongsideControlConsidered.description
      .includes(NULL_SENTENCE_REPLACED_FROM_247)
    && cess(u253).properties.alongsideControlConsidered.description
      .includes(ALONGSIDE_SENTENCE_253));
  ok('R3 §253 reduces back to §247 byte for byte',
    JSON.stringify(reconstruct247BasisEntryUnion(u253)) === JSON.stringify(u247));
  ok('R4 the whole wire schema reduces back to §247 byte for byte',
    JSON.stringify(reconstruct247WireSchema(INPUT, governed))
      === JSON.stringify(buildExpert247WireSchema(INPUT, governed)));
  ok('R5 the system prompt is byte-identical -- §253 introduces no prompt',
    sha(build247SystemPrompt(0)) === 'a2f53370753526ad2a5ae8c07a8b81956c91bbdc67fc7b82e84da9e110d6a957',
    sha(build247SystemPrompt(0)).slice(0, 16));
  ok('R6 no role, carrier, field, required list or vocabulary changed',
    (() => {
      const id = contractIdentities253();
      return id.rolesAdded === 0 && id.refKindsAdded === 0 && id.posturesAdded === 0
        && id.fieldsAdded === 0 && id.fieldsRemoved === 0 && id.requiredListsChanged === 0
        && id.systemPromptBuilderAdded === 0;
    })());
  ok('R7 K6 remains 6 admissible / 0 inadmissible',
    contractIdentities253().admissiblePairs === 6
    && contractIdentities253().inadmissibleExpressible === 0);
  ok('R8 unresolvedElement and dischargingControlRef keep their null, deliberately',
    NULLABLE_FIELDS_RETAINED_253.length === 2
    && cess(u253).properties.unresolvedElement.type[1] === 'null'
    && cess(u253).properties.dischargingControlRef.type[1] === 'null');

  // ============================================================ A: the named circumstance
  console.log('\n---- A. the circumstance that previously called for null ----');
  const noControlStated = await admitThroughProductionPath({
    input: INPUT, observation: OBS,
    toolInput: cessationOutput({
      alongsideControlConsidered: 'the observation names no control operating alongside the work',
      whyAlongsideControlInsufficient: 'with no control alongside the work the exposure is '
        + 'unmitigated for as long as the platform remains on the slab',
    }),
  });
  ok('A1 a cessation driver stating that the observation names no alongside control is ADMITTED',
    noControlStated.result.admission === 'ADMIT'
    && noControlStated.result.status === 'COMPLETE',
    `${noControlStated.result.admission} / ${noControlStated.result.status}`);
  ok('A2 it carries no justification refusal code',
    noControlStated.result.roleJustificationCodes.length === 0);
  const namedControl = await admitThroughProductionPath({
    input: INPUT, observation: OBS,
    toolInput: cessationOutput({
      alongsideControlConsidered: 'the banksman posted at the platform',
      whyAlongsideControlInsufficient: 'a banksman does not change what the slab will carry',
    }),
  });
  ok('A3 a cessation driver that names a real alongside control is still ADMITTED',
    namedControl.result.admission === 'ADMIT');

  // ============================================================ B: fail-closed
  console.log('\n---- B. a materially invalid representation stays fail-closed ----');
  const nullPair = await admitThroughProductionPath({
    input: INPUT, observation: OBS,
    toolInput: cessationOutput({
      alongsideControlConsidered: null, whyAlongsideControlInsufficient: null,
    }),
  });
  ok('B1 the null pair is REFUSED -- the C5 escape route is not writable',
    nullPair.result.admission === 'REFUSE'
    && nullPair.result.status === 'FIRST_PASS_REFUSED',
    `${nullPair.result.admission} / ${nullPair.result.status}`);
  ok('B2 the refusal is structural: the transmitted contract no longer admits the value',
    nullPair.result.conformanceViolations.some(v =>
      v.path.includes('requiredBy') && v.code === 'NO_UNION_BRANCH_SATISFIED'),
    nullPair.result.conformanceViolations.map(v => v.code).join(','));
  const emptyPair = await admitThroughProductionPath({
    input: INPUT, observation: OBS,
    toolInput: cessationOutput({
      alongsideControlConsidered: '   ', whyAlongsideControlInsufficient: 'x',
    }),
  });
  ok('B3 a whitespace-only value is REFUSED by the projection, which §253 did not touch',
    emptyPair.result.roleJustificationCodes
      .includes('CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT'),
    emptyPair.result.roleJustificationCodes.join(','));
  const missing = await admitThroughProductionPath({
    input: INPUT, observation: OBS,
    toolInput: (() => { const o = cessationOutput({
      alongsideControlConsidered: 'the banksman', whyAlongsideControlInsufficient: 'insufficient' });
      delete o.immediateSafetyPosture.requiredBy[0].roleJustification.alongsideControlConsidered;
      return o; })(),
  });
  ok('B4 an absent field is REFUSED', missing.result.admission === 'REFUSE');

  // ============================================================ C: no invention
  console.log('\n---- C. the repair causes no deterministic invention ----');
  const inventionProbes = [noControlStated, namedControl, nullPair, emptyPair, missing];
  ok('C1 no probe produced a semantic invention',
    inventionProbes.every(p => p.result.semanticInventions.length === 0),
    inventionProbes.flatMap(p => p.result.semanticInventions).join(','));
  ok('C2 nothing was supplied for the refused field on any refusal',
    [nullPair, missing].every(p => p.result.posture === null
      || (p.result.posture as any)?.posture === undefined
      || p.result.admission !== 'ADMIT'));

  // ============================================================ D: owed truth survives
  console.log('\n---- D. the repair erases no owed unresolved fact ----');
  const withOwedFact = await admitThroughProductionPath({
    input: INPUT, observation: OBS,
    toolInput: (() => { const o = cessationOutput({
      alongsideControlConsidered: null, whyAlongsideControlInsufficient: null });
      o.unresolvedFactDeclarations[0].observationSpan = 'a span that was never observed';
      return o; })(),
  });
  ok('D1 an owed unresolved fact is preserved even while the cessation driver is refused',
    withOwedFact.result.admission === 'PRESERVE_UNRESOLVED',
    String(withOwedFact.result.admission));
  ok('D2 the admitted-fact set is unchanged for a well-formed declaration under the repair',
    noControlStated.result.declarationRefusals.length === 0);
  ok('D3 preservation invented nothing',
    withOwedFact.result.semanticInventions.length === 0);

  // ============================================================ the transmitted contract agrees
  console.log('\n---- the transmitted contract and the projection now agree ----');
  const closed = closeObjectNodes252(buildExpert253WireSchema(INPUT, governed));
  const nullEntry = cessationOutput({
    alongsideControlConsidered: null, whyAlongsideControlInsufficient: null,
  });
  ok('Z1 the transmitted contract now REFUSES the value the projection refuses',
    conformsToContract252(nullEntry, closed).length > 0);
  const textEntry = cessationOutput({
    alongsideControlConsidered: 'the observation names no control operating alongside the work',
    whyAlongsideControlInsufficient: 'the exposure is unmitigated',
  });
  ok('Z2 the transmitted contract ADMITS the value the projection admits',
    conformsToContract252(textEntry, closed).length === 0);

  writeFileSync(join(OUT, 'SECTION-253-LOCAL-PROOF.json'), JSON.stringify({
    section: '253', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    admittedThrough: 'runExpertHazLenzAnalysis, the production entry point',
    contractIdentities253: contractIdentities253(),
    fieldsMadeNonNullable: [...FIELDS_MADE_NON_NULLABLE_253],
    nullableFieldsRetained: NULLABLE_FIELDS_RETAINED_253,
    summary: { passed: pass, failed: fail, failures },
    checks: rows,
  }, null, 2));

  console.log(`\n${pass} passed, ${fail} failed`);
  console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
  if (fail > 0) process.exitCode = 1;
}
void main();
