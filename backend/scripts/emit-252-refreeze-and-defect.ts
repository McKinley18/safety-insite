/**
 * §252 -- SUCCESSOR CONFIRMATION RE-FREEZE AND THE alongsideControlConsidered DEFECT RECORD.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The re-freeze is built BY CONSTRUCTION from the §249 instrument: the substantive content is read
 * from that file and copied, never retyped, so a substantive change would have to be an explicit
 * edit rather than a transcription slip. Only mechanical identity fields are recomputed.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import {
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, envelopeBoundOptions, EXPERT_REQUEST_ENVELOPE,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import {
  ADMISSION_252_VERSION,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-252-structural-admission';
import {
  buildBasisEntryUnion247, CESSATION_ROLE_247,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const ROOT = join(__dirname, '..', '..');
const SRC249 = join(ROOT, 'verification',
  'expert-hazlenz-249-executable-binding-and-identity-hardening-2026-09-12',
  'SECTION-249-CONFIRMATION-REFREEZE.json');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** The six frozen observations, verbatim from the §250 executor. Not edited, not paraphrased. */
const CASES: readonly { id: string; observation: string; families: string[] }[] = [
  { id: 'H1', families: ['WORK_AT_HEIGHT'],
    observation: 'A scaffold with one missing guardrail section on the north face; the gap is '
      + 'physically barriered off with Heras fencing and the crew are working on the south face.' },
  { id: 'H2', families: ['CONFINED_SPACE'],
    observation: 'A confined-space entry in progress with gas testing current, a top-man posted, '
      + 'and no rescue plan on site.' },
  { id: 'H3', families: ['WORK_AT_HEIGHT', 'STRUCTURAL'],
    observation: 'A mobile elevating work platform being operated on a slab whose loading capacity '
      + 'the site file does not record.' },
  { id: 'H4', families: ['FIRE'],
    observation: 'A hot-works permit that expires at 16:00 with work due to finish at 15:30, '
      + 'weather clear.' },
  { id: 'H5', families: ['EXCAVATION'],
    observation: 'An excavation with battered sides in stable ground, spoil set back, and no ladder '
      + 'within 25 metres of the working position.' },
  { id: 'H6', families: ['LIFTING'],
    observation: 'A lifting operation with a valid thorough-examination certificate, a competent '
      + 'slinger, and an exclusion zone that one delivery driver has walked through once.' },
];

class Capture implements ExpertSemanticTransport {
  captured: ExpertLegRequest | null = null;
  async send(r: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (this.captured === null) this.captured = r;
    return { ok: false, toolInput: null, failureKind: 'CAPTURED_NOT_SENT', detail: '' };
  }
}

async function requestIdentityFor(c: typeof CASES[number]) {
  const input: any = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `ANL-252-${c.id}`,
    authoritativeSources: [{ sourceId: `obs-${c.id}`, kind: 'OBSERVATION', text: c.observation }],
    inspectionContext: { location: null, task: null },
    jurisdiction: 'GB',
    allowedHazardFamilies: c.families,
    deterministicFindings: [], familyDispositions: [], governedStandards: [],
    answeredClarifications: [],
  };
  const t = new Capture();
  await runExpertHazLenzAnalysis({
    input, observation: { sourceId: `obs-${c.id}`, text: c.observation },
    governedRecords: [], governedEvidence: [],
  }, t);
  const leg = t.captured!;
  const inputSchema = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(leg.wireSchema));
  const body = buildEnvelopeRequestBody({
    leg: 'FIRST_PASS', systemPrompt: leg.systemPrompt, userPrompt: leg.userPrompt,
    toolName: leg.toolName, toolDescription: leg.toolDescription, inputSchema,
  }) as Record<string, any>;
  return {
    caseId: c.id,
    observationSha256: sha(c.observation),
    system: sha(leg.systemPrompt),
    user: sha(leg.userPrompt),
    canonicalSchema: sha(JSON.stringify(leg.wireSchema)),
    transmittedSchema: sha(JSON.stringify(inputSchema)),
    strictOnTheWire: body.tools[0].strict,
    requestDigest: sha(JSON.stringify(body)),
  };
}

async function main(): Promise<void> {
  const prior = JSON.parse(readFileSync(SRC249, 'utf8'));
  const identity252 = JSON.parse(readFileSync(
    join(OUT, 'SECTION-252-CANDIDATE-IDENTITY-V2-2.json'), 'utf8'));

  const perCase = [];
  for (const c of CASES) perCase.push(await requestIdentityFor(c));

  // ---- the substantive half is COPIED from §249, never retyped.
  const substantive = {
    substantiveContent: prior.substantiveContent,
    substantiveSourceDocument: prior.substantiveSourceDocument,
    substantiveSourceSha256: prior.substantiveSourceSha256,
    caseCount: prior.caseCount,
    cases: prior.cases,
    underRestrictionTraps: prior.underRestrictionTraps,
    overRestrictionTraps: prior.overRestrictionTraps,
    gates: prior.gates,
    successFloor: prior.successFloor,
    historicalLevel: prior.historicalLevel,
    allGatesMustHold: prior.allGatesMustHold,
    thresholdFrozenBeforeExecution: prior.thresholdFrozenBeforeExecution,
    thresholdMayBeLoweredAfterResults: prior.thresholdMayBeLoweredAfterResults,
    stoppingRule: prior.stoppingRule,
    spendDesign: prior.spendDesign,
    authoringLimitation: prior.authoringLimitation,
  };
  const substantiveUnchanged =
    JSON.stringify(substantive) === JSON.stringify({
      substantiveContent: prior.substantiveContent,
      substantiveSourceDocument: prior.substantiveSourceDocument,
      substantiveSourceSha256: prior.substantiveSourceSha256,
      caseCount: prior.caseCount, cases: prior.cases,
      underRestrictionTraps: prior.underRestrictionTraps,
      overRestrictionTraps: prior.overRestrictionTraps, gates: prior.gates,
      successFloor: prior.successFloor, historicalLevel: prior.historicalLevel,
      allGatesMustHold: prior.allGatesMustHold,
      thresholdFrozenBeforeExecution: prior.thresholdFrozenBeforeExecution,
      thresholdMayBeLoweredAfterResults: prior.thresholdMayBeLoweredAfterResults,
      stoppingRule: prior.stoppingRule, spendDesign: prior.spendDesign,
      authoringLimitation: prior.authoringLimitation,
    });

  const refreeze: Record<string, unknown> = {
    instrumentVersion: 'hazlenz.expert.driver-role-confirmation.252.v1',
    supersedes: {
      section: '249 / 250',
      status: '§250 INVALID — SIX REQUESTS REJECTED BEFORE INFERENCE',
      reason: 'the §249 instrument was bound to a strict executable configuration that the provider '
        + 'cannot compile. §251 closed that configuration; §252 binds the same six cases to the '
        + 'non-strict candidate with deterministic structural admission.',
      mutated: false,
    },
    ...substantive,
    substantiveChangesFrom249: 0,
    substantiveContentCopiedNotRetyped: true,
    substantiveContentVerifiedUnchanged: substantiveUnchanged,
    mechanicallyUpdatedOnly: [
      'executable candidate identity', 'provider strict setting', 'structural admission identity',
      'request identity', 'derived hashes', 'manifest', 'freeze metadata',
    ],
    executableBinding: {
      invokedPromptBuilder: 'build247SystemPrompt',
      invokedSchemaBuilder: 'buildExpert247WireSchema',
      invokedContractVersion: 'hazlenz.expert.first-pass.247',
      structuralAdmission: ADMISSION_252_VERSION,
      strictSchema: EXPERT_REQUEST_ENVELOPE.strictSchema,
      envelope: envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE),
      candidateIdentityVersion: identity252.version,
      candidateIdentityDigest: identity252.identityDigest,
      perCaseRequestIdentity: perCase,
    },
    sixFrozenObservations: {
      count: CASES.length,
      exposedToInference: 0,
      state: 'UNSPENT — no case was transmitted in §251 or §252',
      observationDigests: CASES.map(c => ({ id: c.id, sha256: sha(c.observation) })),
    },
    executed: false,
    providerCalls: 0,
    spendUsd: 0,
    status: 'FROZEN — AWAITING EXPLICIT PRODUCT-OWNER EXECUTION AUTHORIZATION',
  };
  refreeze.instrumentDigest = sha(JSON.stringify(refreeze));
  writeFileSync(join(OUT, 'SECTION-252-CONFIRMATION-REFREEZE.json'), JSON.stringify(refreeze, null, 2));

  // ================================================================ the defect record, mechanically

  const union = buildBasisEntryUnion247() as any;
  const cessationBranch = union.anyOf.find(
    (b: any) => b.properties.driverRole.const === CESSATION_ROLE_247);
  const field = cessationBranch.properties.roleJustification.properties.alongsideControlConsidered;
  const requiredOnCessation =
    cessationBranch.properties.roleJustification.required.includes('alongsideControlConsidered');
  const projectionSrc = readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz',
    'contract', 'expert-247-role-justification-projection.ts'), 'utf8');
  const projectionRefusesNull =
    /const nonEmpty = \(v: unknown\): v is string => typeof v === 'string'/.test(projectionSrc)
    && /if \(!nonEmpty\(jr\.alongsideControlConsidered\)/.test(projectionSrc);

  const defect = {
    section: '252', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    classification: 'CONTRACT CONSISTENCY DEFECT',
    resolved: false,
    providerSchemaPermitsNull: Array.isArray(field.type) && field.type.includes('null'),
    providerSchemaType: field.type,
    providerSchemaRequiredOnCessation: requiredOnCessation,
    providerSchemaInstruction: field.description,
    deterministicProjectionRefusesNull: projectionRefusesNull,
    deterministicProjectionCode: 'CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT',
    mechanicallyEstablishedByFrozenContract: false,
    whyNotEstablished:
      'both statements are frozen §247 artifacts and they contradict each other directly. The '
      + 'transmitted description instructs the model to write null in a named case; the projection '
      + 'refuses that exact value. Nothing else in §247 adjudicates between them: the epistemic '
      + 'character table, the K6 binding and the A2 rule are all silent on this field, and the §247 '
      + 'report records no decision about it. Choosing A or B would therefore be a new semantic '
      + 'decision rather than a reading of the frozen contract.',
    optionA: 'NULL has legitimate semantic meaning (the observation states no alongside control at '
      + 'all) and the projection must admit it, treating an absent control as a satisfied '
      + 'confrontation rather than a missing one.',
    optionB: 'NULL has no legitimate semantic meaning on a cessation driver, and the provider '
      + 'contract should no longer invite it. This would also remove two of the three union-typed '
      + 'parameters §251 measured.',
    consequenceToday: 'a model that follows the description and writes null has its whole analysis '
      + 'refused fail-closed. That is safe and it is not silent, but it refuses an output the '
      + 'contract itself invited.',
    disposition: 'RETURNED AS ONE BOUNDED FOLLOW-UP ITEM. Not repaired in §252.',
  };
  writeFileSync(join(OUT, 'SECTION-252-ALONGSIDE-CONTROL-DEFECT.json'), JSON.stringify(defect, null, 2));

  console.log(`refreeze instrumentDigest ${refreeze.instrumentDigest}`);
  console.log(`substantive changes from §249: 0 (verified ${substantiveUnchanged})`);
  console.log(`strict on the wire: ${JSON.stringify(perCase.map(p => p.strictOnTheWire))}`);
  console.log(`defect: schema permits null=${defect.providerSchemaPermitsNull} `
    + `projection refuses null=${defect.deterministicProjectionRefusesNull} `
    + `mechanically established=${defect.mechanicallyEstablishedByFrozenContract}`);
}
void main();
