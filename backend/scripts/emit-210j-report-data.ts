import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  type ExpertAnalysisInput, EXPERT_INPUT_CONTRACT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  instructionIdentities210j, schemaDelta210j, UNRESOLVED_ACTION_FIELD,
} from './lib/expert-210j-first-pass-contract';
import { buildAncestrySuccessor } from './lib/expert-210j-ancestry-successor';
import {
  FIXTURE_SOURCES_210J, F1_UNRESOLVED_HOLD, F2_UNRESOLVED_CONTINUE,
  F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B, F10_SECOND_FACT,
} from './lib/expert-210j-fixtures';

const BPT = 69968 / 24512;
const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-210j-epistemic-schema-remediation-2026-09-09');

const input: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'AN-210J-COST',
  authoritativeSources: FIXTURE_SOURCES_210J.map(s => ({
    sourceId: s.sourceId, sourceType: 'observation' as const, text: s.text,
  })),
  inspectionContext: { location: 'cost measurement', task: 'cost measurement' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['temporary_works'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};

const ident = instructionIdentities210j() as any;
const absent = schemaDelta210j(input, governedBindingFor([])) as any;
const present = schemaDelta210j(input, governedBindingFor([{ sourceId: 'GS-1', text: 'x' }])) as any;

const values = [F1_UNRESOLVED_HOLD, F2_UNRESOLVED_CONTINUE,
  F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B, F10_SECOND_FACT]
  .map(d => d.decisionWhileUnresolved);
// JSON overhead for one added key: `"decisionWhileUnresolved":"",` = key + quotes + colon + comma.
const keyOverhead = UNRESOLVED_ACTION_FIELD.length + 5;
const outBytes = values.map(v => v.length + keyOverhead);
const meanOut = Math.round(outBytes.reduce((a, b) => a + b, 0) / outBytes.length);

const cost = {
  version: 'hazlenz.expert.210j.cost-and-compatibility.v1',
  basis: 'OBSERVED_BYTES_PER_TOKEN = 69968 / 24512 = ' + BPT.toFixed(4)
    + ', derived from the frozen §208 first-pass leg. An estimate from real cohort data, not a '
    + 'tokenizer result, and NOT a production cost claim.',
  instruction: {
    addedChars: ident.withoutGovernedBinding.addedChars,
    estimatedAddedTokens: ident.withoutGovernedBinding.estimatedAddedTokens,
    identicalInBothVariants:
      ident.withoutGovernedBinding.addedChars === ident.withGovernedBinding.addedChars,
    oldIdentity: ident.withoutGovernedBinding.oldIdentity,
    newIdentity: ident.withoutGovernedBinding.newIdentity,
    netProseRemoved: ident.netProseRemoved,
  },
  schema: {
    capabilityAbsent: {
      addedBytes: absent.addedBytes, estimatedAddedTokens: absent.estimatedAddedTokens,
      grammarIdentityBefore: absent.grammarIdentityBefore,
      grammarIdentityAfter: absent.grammarIdentityAfter,
      grammarMoved: absent.grammarMoved,
    },
    capabilityPresent: {
      addedBytes: present.addedBytes, estimatedAddedTokens: present.estimatedAddedTokens,
      grammarMoved: present.grammarMoved,
    },
  },
  requestTotal: {
    estimatedAddedInputTokens:
      ident.withoutGovernedBinding.estimatedAddedTokens + absent.estimatedAddedTokens,
    section210hMedianInputTokens: 27167,
    percentOfSection210hMedianInput: Number(
      (100 * (ident.withoutGovernedBinding.estimatedAddedTokens + absent.estimatedAddedTokens)
        / 27167).toFixed(2)),
  },
  output: {
    measuredOn: 'the four §210J design fixtures, not model output',
    fixtureValueBytes: outBytes,
    meanBytesPerDeclaration: meanOut,
    estimatedAddedOutputTokensPerDeclaration: Math.round(meanOut / BPT),
    section210hMedianOutputTokens: 2329,
    percentOfSection210hMedianOutput: Number(
      (100 * Math.round(meanOut / BPT) / 2329).toFixed(2)),
  },
  verifierPayload: {
    addedFields: 1,
    transform: 'byte-exact copy of the model-authored string',
    estimatedAddedBytesPerFact: meanOut - keyOverhead,
    note: 'the sidecar carries the same string the declaration carried; nothing is duplicated '
      + 'inside the pinned ProjectedOwedFact',
  },
  ancestry: buildAncestrySuccessor(),
};

writeFileSync(join(DIR, 'COST-AND-ANCESTRY-210J.json'), JSON.stringify(cost, null, 2) + '\n');
console.log(JSON.stringify({
  instruction: cost.instruction, schema: cost.schema.capabilityAbsent,
  requestTotal: cost.requestTotal, output: cost.output,
  ancestry: { classification: cost.ancestry.classification, current: cost.ancestry.currentSha256 },
}, null, 2));
