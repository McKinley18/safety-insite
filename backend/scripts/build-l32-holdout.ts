/**
 * L3-2 -- builds the FINAL HOLDOUT by deterministic translation of the frozen capability-acceptance
 * matrix onto the Level-3 axes.
 *
 * WHY DERIVE RATHER THAN AUTHOR. Phase 9 requires a holdout "not authored solely by the
 * implementation under test". The strongest provenance available on this machine is
 * `hazlenz-acceptance-matrix.json`: 66 scenarios written and frozen BEFORE execution by an earlier
 * phase (`frozenBeforeExecution: true`), with an oracle correction already recorded against it.
 * Nothing in it was written with knowledge of the L3-2 adapter, the prompt or the semantic binder.
 *
 * THE TRANSLATION IS FIXED BEFORE ANY RESULT IS SEEN, and it neither relaxes nor tightens a frozen
 * expectation:
 *
 *   frozen expects exactly ACTIVE              -> L3 must establish a hazard in state ACTIVE
 *   frozen alternation PERMITS but does not
 *     require ACTIVE                           -> genuinely ambiguous; scored on neither side
 *   frozen alternation EXCLUDES ACTIVE         -> L3 must not assert ACTIVE (any other state passes)
 *
 * The Level-1 vocabulary (SAFE_VERIFIED / NO_VIOLATION / HISTORICAL) has no 1:1 image in the eight
 * Level-3 states, so it is deliberately NOT mapped member-for-member. What those rows actually
 * assert is "no present uncontrolled exposure", and `ACTIVE` is the only Level-3 state that claims
 * one -- so that is the single axis carried across. Inventing a finer mapping would be inventing
 * expectations the frozen matrix never made.
 *
 * Run: npx ts-node scripts/build-l32-holdout.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..');
const MATRIX = join(REPO, 'verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json');
const OUT = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval/holdout-l32.json');

/**
 * Declared BEFORE any result is observed. A miss on one of these families is a hard gate under
 * EVALUATION_AND_GATES.md ("zero high-consequence misses"), so the list cannot be edited afterwards
 * without invalidating the run.
 */
const HIGH_CONSEQUENCE = [
  'fall', 'trench', 'excavation', 'cave_in', 'loto', 'energy', 'confined',
  'electrical', 'struck_by', 'mobile_equipment', 'scaffold', 'hole', 'opening',
  'impalement', 'rebar', 'explosion', 'ground_control',
];

const L3_STATES = [
  'ACTIVE', 'CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE',
  'NEGATED', 'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN',
];

interface MatrixScenario {
  id: string; cohort: string; regime: string; title: string; text: string;
  expectedHazards?: Array<{ family: string; state: string }>;
  expectedNonHazards?: string[];
  expectedConditionState: string;
  clarificationRequired?: boolean;
  contract?: string;
}

function main(): void {
  const matrixRaw = readFileSync(MATRIX, 'utf8');
  const matrixHash = createHash('sha256').update(matrixRaw).digest('hex');
  const matrix = JSON.parse(matrixRaw) as { matrixId: string; frozenBeforeExecution: boolean; scenarios: MatrixScenario[] };

  if (!matrix.frozenBeforeExecution) throw new Error('source matrix is not marked frozen; refusing to build a holdout from it');

  const scenarios = matrix.scenarios.map((s) => {
    const states = s.expectedConditionState.split('|').map(x => x.trim()).filter(Boolean);
    const permitsActive = states.includes('ACTIVE');
    const requiresActive = states.length === 1 && permitsActive;
    const familyPattern = (s.expectedHazards || []).map(h => h.family).join('|');
    const highConsequence = HIGH_CONSEQUENCE.some(k => familyPattern.includes(k));

    const expect = requiresActive
      ? {
          hazardEstablished: true,
          conditionState: 'ACTIVE',
          familyPattern,
          highConsequence,
          ambiguous: false,
        }
      : permitsActive
        ? {
            hazardEstablished: null,
            acceptableStates: L3_STATES,
            familyPattern,
            highConsequence: false,
            ambiguous: true,
          }
        : {
            hazardEstablished: false,
            acceptableStates: L3_STATES.filter(x => x !== 'ACTIVE'),
            familyPattern,
            highConsequence: false,
            ambiguous: false,
          };

    return {
      id: s.id,
      cohort: s.cohort,
      failureMode: s.title,
      regime: s.regime,
      text: s.text,
      expect,
      expectedNonHazards: s.expectedNonHazards || [],
      sourceContract: s.contract || null,
      frozenExpectedConditionState: s.expectedConditionState,
    };
  });

  const counts = scenarios.reduce<Record<string, number>>((acc, s) => {
    const k = s.expect.ambiguous ? 'ambiguous' : s.expect.hazardEstablished ? 'hazard_expected' : 'no_active_expected';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const holdout = {
    setId: 'l3-2-holdout-2026-08-22',
    role: 'FINAL_HOLDOUT',
    visibleDuringTuning: false,
    derivedFrom: {
      artifact: 'verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json',
      matrixId: matrix.matrixId,
      sha256: matrixHash,
      frozenBeforeExecution: matrix.frozenBeforeExecution,
    },
    provenanceNote:
      'Scenario text and expectations authored by the capability-acceptance phase and frozen before that phase executed. '
      + 'Not authored by, and not visible to, the L3-2 prompt-tuning work. The translation onto Level-3 axes is the '
      + 'deterministic rule in scripts/build-l32-holdout.ts, fixed before the first holdout run.',
    limitation:
      'These scenarios are novel to the Level-3 implementation but were previously executed against the Level-1 engine. '
      + 'They are therefore a valid holdout for Level 3 and NOT an unseen set for Level 1; the Level-1 side of the '
      + 'comparison must be read with that in mind.',
    highConsequenceFamilies: HIGH_CONSEQUENCE,
    counts,
    scenarios,
  };

  const serialized = JSON.stringify(holdout, null, 2) + '\n';
  writeFileSync(OUT, serialized);
  const holdoutHash = createHash('sha256').update(serialized).digest('hex');
  process.stdout.write(`source matrix sha256 : ${matrixHash}\n`);
  process.stdout.write(`holdout scenarios     : ${scenarios.length}\n`);
  process.stdout.write(`composition           : ${JSON.stringify(counts)}\n`);
  process.stdout.write(`holdout sha256        : ${holdoutHash}\n`);
  process.stdout.write(`written               : ${OUT}\n`);
}

main();
