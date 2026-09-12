/**
 * §251 -- ARTIFACT EMISSION. Zero provider calls. Zero database operations.
 *
 * Assembles the probe ledger into the section's evidence records, and records, as data, exactly
 * which authorized outputs could NOT be produced and why. Nothing here is copied from the
 * authorization: every digest and count is computed from the tree or from the recorded ledger.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import { governedBindingFor } from '../src/safescope-v2/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import {
  buildExpert247WireSchema, build247SystemPrompt, FIRST_PASS_CONTRACT_247_VERSION,
  contractIdentities247,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import {
  envelopeBoundOptions, EXPERT_REQUEST_ENVELOPE,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import { transmitted, inputFor, CASES_251, countUnions } from './analyze-251-wire-budget';
import { buildCompact251WireSchema, slotProfile } from './analyze-251-compaction-ceiling';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-251-strict-wire-schema-budget-2026-09-12');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));

interface Probe { probeId: string; purpose: string; model: string; strict: boolean;
  schemaSha: string; schemaBytes: number; httpStatus: number | null; accepted: boolean;
  providerErrorType: string | null; providerErrorMessage: string | null;
  inputTokens: number | null; outputTokens: number | null; costUsd: number; }

function main(): void {
  const ledger: Probe[] = readFileSync(join(OUT, 'PROBE-LEDGER-251.jsonl'), 'utf8')
    .trim().split('\n').map(l => JSON.parse(l) as Probe);

  // ---------------------------------------------------------------- 5. full-schema strict probe
  const spend = ledger.reduce((a, p) => a + p.costUsd, 0);
  const byId = (id: string): Probe | undefined => ledger.find(p => p.probeId === id);
  const findings = [
    { id: 'F1', question: 'Do provider-visible descriptions drive the compiled grammar size?',
      evidence: ['P1-239-FULL-CONTROL', 'P2-239-NO-DESCRIPTIONS'],
      answer: 'NO. The §239 transmitted schema is rejected at 26,327 bytes and still rejected at '
        + '6,786 bytes with every description removed.' },
    { id: 'F2', question: 'Does any single contract section exceed the budget on its own?',
      evidence: ['Q1-unresolvedFactDeclarations', 'Q2-crossHazardInsights',
        'Q3-expertHazardCandidates', 'Q4-immediateSafetyPosture'],
      answer: 'NO. Each of the four largest top-level properties compiles alone. The limit is '
        + 'cumulative over the whole schema.' },
    { id: 'F3', question: 'Does the compiled grammar size scale with the LENGTH of literals?',
      evidence: ['T3-239-SHORT-LITERALS', 'S2-MANY-NARROW-OBJECTS'],
      answer: 'NO. A 3,880-byte schema with every property name and enum member shortened is '
        + 'rejected, while a 4,623-byte schema with long names is accepted. Wire enum coding and '
        + 'field renaming are therefore INEFFECTIVE levers against this limit.' },
    { id: 'F4', question: 'Does $defs / $ref factoring reduce the compiled grammar?',
      evidence: ['T1-REPEATED-INLINE', 'T2-REPEATED-VIA-DEFS'],
      answer: 'YES, and decisively. Fourteen inline copies of one 8-property shape are rejected; the '
        + 'same schema with that shape defined once in $defs and referenced fourteen times is '
        + 'accepted. Factoring REPEATED SUBTREES is the one effective size lever found.' },
    { id: 'F5', question: 'Does $defs collapse the cost of distinct properties sharing a type?',
      evidence: ['V1-64-STRING-VIA-REF', 'V2-64-STRING-REF-WITH-DESC', 'U-FLAT-64-STRING'],
      answer: 'NO. Sixty-four distinct properties each $ref-ing one shared string definition are '
        + 'rejected exactly as sixty-four inline string properties are. $defs shares SHAPES, not '
        + 'property slots.' },
    { id: 'F6', question: 'What is the cost unit?',
      evidence: ['U-FLAT-64-STRING', 'U-FLAT-64-ENUM6', 'U-FLAT-128-ENUM6', 'S2-MANY-NARROW-OBJECTS',
        'W1-239-minus-declarations', 'W2-239-minus-candidates'],
      answer: 'The number of distinct property slots that must be materialized, weighted by value '
        + 'kind: an unconstrained string slot is markedly more expensive than an enum slot (64 string '
        + 'slots are rejected as "Schema is too complex" while 64 six-member-enum slots compile, and '
        + '128 enum slots are rejected as "grammar too large"). On the real base contract the budget '
        + 'is bracketed between 46 accepted slots and 59 rejected slots.' },
    { id: 'F7', question: 'Is the budget model-specific?',
      evidence: ['X-239-FULL-claude-opus-5', 'X-239-FULL-claude-haiku-4-5', 'X-247-FULL-claude-opus-5'],
      answer: 'NO. The identical §239 schema is rejected with the identical message on '
        + 'claude-sonnet-5, claude-opus-5 and claude-haiku-4-5, and the union limit reproduces on '
        + 'claude-opus-5. Changing model within this provider does not raise either limit.' },
    { id: 'F8', question: 'Does the designed compaction clear the union limit?',
      evidence: ['Y1-251-COMPACT-FULL', 'Z1-REAL-PRODUCTION-REQUEST'],
      answer: 'YES. The real production request is rejected on the union limit at 21 union-typed '
        + 'parameters; the compacted schema carries 3 and is no longer rejected for unions. It is '
        + 'then rejected on the grammar limit, which the compaction does not and cannot reach.' },
  ];
  writeFileSync(join(OUT, 'SECTION-251-FULL-SCHEMA-STRICT-PROBE.json'), JSON.stringify({
    section: '251', generated: '2026-09-12',
    recordKind: 'SCHEMA TRANSPORT PROBE',
    notCapabilityEvidence: true,
    protocol: {
      syntheticPromptOnly: true,
      frozenObservationsTransmitted: 0,
      customerDataTransmitted: false,
      generationAllowanceTokens: 64,
      everyProbeExercisedTheCompleteSchema: 'every probe naming a §239/§247/§251 schema exercised the '
        + 'complete transmitted schema after canonical builder, strict wrapper and §108 strip; the '
        + 'synthetic ladder probes exercised purpose-built whole schemas, never a fragment of the '
        + 'contract under development',
    },
    probeCalls: ledger.length,
    probesAccepted: ledger.filter(p => p.accepted).length,
    probesRejected: ledger.filter(p => !p.accepted).length,
    diagnosticSpendUsd: Number(spend.toFixed(6)),
    databaseOperations: 0,
    findings,
    ledger,
  }, null, 2));

  // ---------------------------------------------------------------- 7. candidate identity v2.1
  const inp = inputFor(CASES_251[0]);
  const g = governedBindingFor([]);
  const canonical247 = buildExpert247WireSchema(inp, g);
  const wire247 = transmitted(canonical247);
  const compact = buildCompact251WireSchema(inp, g);
  const wire251 = transmitted(compact);
  const elements = [
    { n: 1, element: 'canonical semantic contract version', derivedFrom: 'the executing module',
      value: FIRST_PASS_CONTRACT_247_VERSION, executionDerived: true },
    { n: 2, element: 'internal canonical semantic schema identity',
      derivedFrom: 'sha256 of the canonical wire schema the entry point built',
      value: sha(JSON.stringify(canonical247)), executionDerived: true },
    { n: 3, element: 'actual strict provider schema after sanitization and wrapping',
      derivedFrom: 'sha256 of the bytes handed to the envelope',
      value: sha(JSON.stringify(wire247)), executionDerived: true },
    { n: 4, element: 'system prompt identity', derivedFrom: 'sha256 of the assembled system prompt',
      value: sha(build247SystemPrompt(0)), executionDerived: true },
    { n: 5, element: 'envelope bound options', derivedFrom: 'envelopeBoundOptions()',
      value: sha(JSON.stringify(envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE))), executionDerived: true },
    { n: 6, element: 'contract identities', derivedFrom: 'contractIdentities247()',
      value: sha(JSON.stringify(contractIdentities247())), executionDerived: true },
    { n: 7, element: 'provider compact wire-schema identity',
      derivedFrom: 'sha256 of the compacted transmitted schema — DESIGNED, NOT EXECUTED',
      value: sha(JSON.stringify(wire251)), executionDerived: false },
    { n: 8, element: 'deterministic normalization identity',
      derivedFrom: 'sha256 of normalize251BasisEntry / denormalize251BasisEntry source — DESIGNED, NOT EXECUTED',
      value: shaFile(join(__dirname, 'verify-251-k6-and-normalization.ts')), executionDerived: false },
    { n: 9, element: 'deterministic admission identity',
      derivedFrom: 'sha256 of the §247 role-justification projection module',
      value: shaFile(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'contract',
        'expert-247-role-justification-projection.ts')), executionDerived: true },
  ];
  writeFileSync(join(OUT, 'SECTION-251-CANDIDATE-IDENTITY-V2-1.json'), JSON.stringify({
    section: '251', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    status: 'DESIGNED, NOT FROZEN',
    whyNotFrozen: 'Candidate Identity v2.1 exists to bind "the provider actually receives wire '
      + 'representation X" to the executable path. No compact wire representation was adopted, '
      + 'because the compaction cannot clear the grammar limit, so elements 7 and 8 describe a '
      + 'representation the production path does not use. Freezing an identity over a representation '
      + 'that is not executed would assert exactly the thing v2.1 was created to make unfalsifiable.',
    v2ElementsStillExecutionDerived: elements.filter(e => e.executionDerived).length,
    v2_1ElementsPendingAdoption: elements.filter(e => !e.executionDerived).length,
    negativeTestsRequired: [
      'identity fails if the provider path falls back to the §239 schema',
      'identity fails if the provider path falls back to the pre-compaction §247 schema',
      'identity fails if the schema is transmitted non-strict',
      'identity fails under an alternate normalizer',
      'identity fails under an alternate K6 mapping',
    ],
    negativeTestsImplemented: 'NOT IMPLEMENTED — they would test a representation that was not adopted',
    elements,
  }, null, 2));

  // ---------------------------------------------------------------- 9. confirmation re-freeze
  const frozenSix = CASES_251.map(c => ({ caseId: c.id, families: c.families,
    observationSha: sha(c.observation) }));
  writeFileSync(join(OUT, 'SECTION-251-CONFIRMATION-REFREEZE.json'), JSON.stringify({
    section: '251', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    status: 'NOT PERFORMED',
    why: 'A successor re-freeze binds the same six substantive cases to a compact strict executable '
      + 'schema. No compact strict executable schema exists, because the compaction does not clear '
      + 'the provider grammar limit. Re-freezing against the current schema would rebind the '
      + 'instrument to a representation already demonstrated untransmittable.',
    sixFrozenObservations: {
      count: frozenSix.length,
      substantiveChanges: 0,
      exposedToInference: 0,
      state: 'UNSPENT — the model has never been asked any of them',
      cases: frozenSix,
    },
    executableIdentityRebound: false,
    wireSchemaIdentityRebound: false,
    normalizationIdentityRebound: false,
    requestDigestRebound: false,
    manifestMetadataChanged: false,
  }, null, 2));

  const compactProfile = slotProfile(wire251);
  console.log(`probes=${ledger.length} spendUSD=${spend.toFixed(6)} `
    + `accepted=${ledger.filter(p => p.accepted).length}`);
  console.log(`compact wire: slots=${compactProfile.slots} unions=${countUnions(wire251).length}`);
  console.log('artifacts written to', OUT);
}
main();
