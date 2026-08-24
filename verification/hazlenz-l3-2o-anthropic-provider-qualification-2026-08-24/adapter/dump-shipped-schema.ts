/** L3-2o -- read-only schema census. Imports the SHIPPED builder; changes nothing. */
import { buildReasoningInput } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { buildProposalSchema } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-prompt';
const { input } = buildReasoningInput({
  analysisId: 'l32o-schema-census', observationText: 'The guard on the conveyor is missing and the belt is running.',
  regulatoryContext: { value: 'OSHA_GENERAL_INDUSTRY' as any, provenance: 'USER_CONFIRMED' },
  allowedHazardFamilies: ['MACHINE_GUARDING', 'FALL_PROTECTION'] as any,
});
console.log(JSON.stringify(buildProposalSchema(input), null, 1));
