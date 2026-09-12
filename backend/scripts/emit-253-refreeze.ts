/**
 * §253 -- SUCCESSOR CONFIRMATION RE-FREEZE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The candidate identity changed, so the instrument's candidate-binding metadata must be rebound.
 * NOTHING ELSE MAY MOVE. The substantive half is read from the §252 instrument and COPIED, never
 * retyped, and this file then proves mechanically that:
 *
 *   the six observation payloads are byte-identical to the §252 freeze;
 *   the substantive half is deep-equal to the §252 freeze;
 *   every top-level key whose value differs is on a declared metadata-only allowlist.
 *
 * The cases are not redrawn, not reworded and not adapted to anything §252 or §253 found. Freshness
 * is preserved because nothing about what the instrument asks has changed.
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
import { ADMISSION_252_VERSION }
  from '../src/safescope-v2/expert-hazlenz/contract/expert-252-structural-admission';
import { FIRST_PASS_CONTRACT_253_VERSION, contractIdentities253 }
  from '../src/safescope-v2/expert-hazlenz/contract/expert-253-posture-contract';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const ROOT = join(__dirname, '..', '..');
const SRC252 = join(ROOT, 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12',
  'SECTION-252-CONFIRMATION-REFREEZE.json');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-253-alongside-control-contract-closure-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** The six frozen observations, verbatim. Byte-compared against the §252 freeze below. */
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

/** The ONLY keys §253 is permitted to change. Anything else differing aborts the freeze. */
const METADATA_ONLY_KEYS: readonly string[] = [
  'instrumentVersion', 'supersedes', 'executableBinding', 'mechanicallyUpdatedOnly',
  'substantiveChangesFrom249', 'substantiveChangesFrom252', 'substantiveContentVerifiedUnchanged',
  'metadataOnlyDifference', 'instrumentDigest',
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
  const prior = JSON.parse(readFileSync(SRC252, 'utf8'));
  const identity253 = JSON.parse(readFileSync(
    join(OUT, 'SECTION-253-CANDIDATE-IDENTITY-V2-3.json'), 'utf8'));

  // ---- the six observation payloads, byte-compared against the §252 freeze.
  const priorDigests: Record<string, string> = Object.fromEntries(
    (prior.sixFrozenObservations.observationDigests as { id: string; sha256: string }[])
      .map(d => [d.id, d.sha256]));
  const payloadCheck = CASES.map(c => ({
    id: c.id,
    section252Sha256: priorDigests[c.id] ?? null,
    section253Sha256: sha(c.observation),
    identical: priorDigests[c.id] === sha(c.observation),
  }));
  const payloadsIdentical = payloadCheck.every(p => p.identical)
    && payloadCheck.length === prior.sixFrozenObservations.count;
  if (!payloadsIdentical) {
    throw new Error('§253 REFREEZE ABORT: an observation payload is not byte-identical to §252');
  }

  const perCase = [];
  for (const c of CASES) perCase.push(await requestIdentityFor(c));

  // ---- the substantive half, COPIED from §252.
  const SUBSTANTIVE_KEYS = [
    'substantiveContent', 'substantiveSourceDocument', 'substantiveSourceSha256', 'caseCount',
    'cases', 'underRestrictionTraps', 'overRestrictionTraps', 'gates', 'successFloor',
    'historicalLevel', 'allGatesMustHold', 'thresholdFrozenBeforeExecution',
    'thresholdMayBeLoweredAfterResults', 'stoppingRule', 'spendDesign', 'authoringLimitation',
    'sixFrozenObservations', 'executed', 'providerCalls', 'spendUsd', 'status',
    'substantiveContentCopiedNotRetyped',
  ] as const;
  const substantive: Record<string, unknown> = {};
  for (const k of SUBSTANTIVE_KEYS) substantive[k] = prior[k];

  const refreeze: Record<string, unknown> = {
    instrumentVersion: 'hazlenz.expert.driver-role-confirmation.253.v1',
    supersedes: {
      section: '252',
      status: 'FROZEN — never executed',
      reason: 'the candidate identity changed when §253 closed the alongsideControlConsidered '
        + 'contract-consistency defect. The instrument is rebound to the new candidate and nothing '
        + 'substantive moves.',
      mutated: false,
    },
    ...substantive,
    substantiveChangesFrom249: prior.substantiveChangesFrom249,
    substantiveChangesFrom252: 0,
    mechanicallyUpdatedOnly: [
      'executable candidate identity', 'contract version', 'wire-schema identity',
      'request identity', 'derived hashes', 'freeze metadata',
    ],
    executableBinding: {
      invokedPromptBuilder: 'build247SystemPrompt',
      invokedSchemaBuilder: 'buildExpert253WireSchema',
      invokedContractVersion: FIRST_PASS_CONTRACT_253_VERSION,
      contractIdentities253: contractIdentities253(),
      structuralAdmission: ADMISSION_252_VERSION,
      strictSchema: EXPERT_REQUEST_ENVELOPE.strictSchema,
      envelope: envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE),
      candidateIdentityVersion: identity253.version,
      candidateIdentityDigest: identity253.identityDigest,
      perCaseRequestIdentity: perCase,
    },
  };

  // ---- prove the difference is metadata-only, key by key.
  const allKeys = [...new Set([...Object.keys(prior), ...Object.keys(refreeze)])].sort();
  const differing = allKeys.filter(
    k => JSON.stringify(prior[k]) !== JSON.stringify(refreeze[k]));
  const outsideAllowlist = differing.filter(k => !METADATA_ONLY_KEYS.includes(k));
  if (outsideAllowlist.length > 0) {
    throw new Error('§253 REFREEZE ABORT: keys changed outside the metadata-only allowlist: '
      + outsideAllowlist.join(', '));
  }

  refreeze.metadataOnlyDifference = {
    keysCompared: allKeys.length,
    keysDiffering: differing,
    keysOutsideAllowlist: outsideAllowlist,
    substantiveHalfDeepEqualToSection252: SUBSTANTIVE_KEYS.every(
      k => JSON.stringify(prior[k]) === JSON.stringify(refreeze[k])),
    observationPayloads: payloadCheck,
    observationPayloadsByteIdentical: payloadsIdentical,
    perCaseRequestDigestChanged: perCase.map((p, i) => ({
      caseId: p.caseId,
      section252: (prior.executableBinding.perCaseRequestIdentity as any[])[i].requestDigest,
      section253: p.requestDigest,
      changed: (prior.executableBinding.perCaseRequestIdentity as any[])[i].requestDigest
        !== p.requestDigest,
      why: 'the transmitted schema carries the §253 justification representation',
    })),
  };
  refreeze.substantiveContentVerifiedUnchanged = true;
  refreeze.instrumentDigest = sha(JSON.stringify(refreeze));

  writeFileSync(join(OUT, 'SECTION-253-CONFIRMATION-REFREEZE.json'), JSON.stringify(refreeze, null, 2));

  console.log(`observation payloads byte-identical: ${payloadsIdentical}`);
  console.log(`substantive changes from §252: 0`);
  console.log(`keys differing: ${differing.join(', ')}`);
  console.log(`keys outside the metadata-only allowlist: ${outsideAllowlist.length}`);
  console.log(`strict on the wire: ${JSON.stringify(perCase.map(p => p.strictOnTheWire))}`);
  console.log(`successor instrument digest ${refreeze.instrumentDigest}`);
}
void main();
