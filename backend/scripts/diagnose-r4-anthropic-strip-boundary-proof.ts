/**
 * EXPERT HAZLENZ -- R4 STRUCTURAL LOSS-POINT PROOF (2026-08-30/31). ZERO NETWORK CALLS, $0.00.
 *
 * `diagnose-r4-r6-local-repair.ts` established that R4 does NOT reproduce against the local
 * provider across 10 varied-seed repetitions, and that the Anthropic-facing request (built by the
 * real, unmodified `buildAnthropicRequestBody`) carries ZERO `minLength`/`minItems` keywords where
 * the local/canonical schema carries 14/1. This script completes the argument: it proves that a
 * wire object satisfying every requirement EXCEPT the stripped-away non-empty-string constraint
 * reproduces the EXACT hosted R4 issue signature (PRESENT layer, 0 surviving candidates,
 * `CANDIDATE_MALFORMED` + `EXPLANATION_MALFORMED`) when run through the real, unmodified
 * `normalizeExpertOutput`.
 */
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';

const NOW = '2026-08-30T00:00:00.000Z';
const R4 = ROUTING_FIXTURES.find(f => f.id === 'R4')!;

const cases: Array<{ label: string; wire: Record<string, unknown> }> = [
  {
    label: 'empty candidateKey/evidenceBasis/reasoning + empty explanation.summary',
    wire: {
      contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION, analysisId: R4.input.analysisId,
      expertHazardCandidates: [{
        candidateKey: '', hazardFamily: 'confined_space', assertedConditionState: 'ACTIVE',
        groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
        evidenceBasis: '', reasoning: '', confidence: 'LOW',
        relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: true,
      }],
      decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
      expertExplanation: { summary: '' },
      uncertainty: { statements: [] },
      outcome: 'ANALYZED',
    },
  },
  {
    label: 'only reasoning empty, everything else populated',
    wire: {
      contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION, analysisId: R4.input.analysisId,
      expertHazardCandidates: [{
        candidateKey: 'c1', hazardFamily: 'confined_space', assertedConditionState: 'ACTIVE',
        groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
        evidenceBasis: 'below-grade sump entered through a 24-inch opening', reasoning: '',
        confidence: 'LOW', relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
        requiresUserConfirmation: true,
      }],
      decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
      expertExplanation: { summary: 'A confined-space entry hazard is possible at the sump.' },
      uncertainty: { statements: [] },
      outcome: 'ANALYZED',
    },
  },
  {
    label: 'candidate well-formed, ONLY explanation.summary empty',
    wire: {
      contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION, analysisId: R4.input.analysisId,
      expertHazardCandidates: [{
        candidateKey: 'c1', hazardFamily: 'confined_space', assertedConditionState: 'ACTIVE',
        groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
        evidenceBasis: 'below-grade sump entered through a 24-inch opening',
        reasoning: 'entrapment and atmospheric risk in a below-grade confined space',
        confidence: 'LOW', relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
        requiresUserConfirmation: true,
      }],
      decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
      expertExplanation: { summary: '' },
      uncertainty: { statements: [] },
      outcome: 'ANALYZED',
    },
  },
];

console.log('EXPERT HAZLENZ -- R4 STRUCTURAL LOSS-POINT PROOF (offline, $0.00, no network)\n');
console.log('Hosted R4 signature to match: layerStatus PRESENT (item-level, not analysis-fatal), '
  + '0 surviving candidates, issues include CANDIDATE_MALFORMED and EXPLANATION_MALFORMED.\n');

let anyMatch = false;
for (const c of cases) {
  const result = normalizeExpertOutput(c.wire, R4.input, NOW);
  const candidateCount = result.validated?.analysis.expertHazardCandidates.length ?? 0;
  const codes = result.issues.map(i => i.code);
  const layerPresent = result.state === 'VALID'; // item-level rejection still yields VALID/PRESENT
  const matches = layerPresent && candidateCount === 0
    && codes.includes('CANDIDATE_MALFORMED') && codes.includes('EXPLANATION_MALFORMED');
  anyMatch = anyMatch || matches;
  console.log(`  CASE: ${c.label}`);
  console.log(`    state=${result.state}  candidates=${candidateCount}  issues=${codes.join(',') || '-'}`);
  console.log(`    matches hosted R4 signature exactly?  ${matches}\n`);
}

console.log(`ANY CASE MATCHES HOSTED SIGNATURE: ${anyMatch}`);
console.log('\nEach case above is legal under the ANTHROPIC-facing schema (buildAnthropicRequestBody(),');
console.log('minLength=0/minItems=0, verified in diagnose-r4-r6-local-repair.ts) and illegal only under');
console.log('the local/canonical schema (minLength=14/minItems=1) and the boundary\'s own isNonEmptyString');
console.log('checks -- which is exactly where the hosted-only asymmetry comes from.');
process.exit(anyMatch ? 0 : 1);
