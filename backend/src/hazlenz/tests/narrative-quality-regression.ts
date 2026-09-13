import { NarrativeGeneratorService } from '../brain/narrative-generator/narrative.service';

const engine = new NarrativeGeneratorService();
const narrative = engine.generate({
  scenarioIntelligence: {
    scenarioFamilyId: 'conveyor_cleanup',
    hazardCategory: 'Machine Guarding',
    equipment: 'conveyor',
    task: 'jam clearing',
    unsafeCondition: 'guard missing while belt is running',
    operationalState: 'running',
    energySource: 'mechanical',
    mechanismOfInjury: 'rotating nip point',
    exposedPersonActivity: 'worker reaching into the belt',
    candidateStandardFamily: 'machine_guarding',
    confidenceSignals: { score: 0.9, reasoning: [] },
  },
  evidenceGapQuestions: [{ question: 'Was the belt isolated before the worker reached into the nip point?' }],
} as any, 'professional');
const enriched = engine.enrich(narrative, {
  correctiveActionReasoning: {
    immediateActions: ['Stop access to the nip point until isolation is verified.'],
    permanentCorrections: ['Install effective guarding and an accessible stop control.'],
    verificationSteps: ['Test the guard and stop control before restart.'],
  },
  riskReasoning: { initialRiskLevel: 'high', credibleWorstCaseOutcome: 'caught-in injury' },
  standardFamilyCandidates: [{ standardFamily: 'machine_guarding' }],
  evidenceGapQuestions: [{ question: 'Was the belt isolated before the worker reached into the nip point?' }],
});

for (const value of [enriched.findingSummary, enriched.mechanismOfInjuryNarrative, enriched.correctiveActionNarrative, enriched.verificationNarrative]) {
  if (!value || /Review recommended corrective actions|Apply temporary controls|Implement permanent engineered controls|Follow standard administrative procedures/i.test(value)) {
    throw new Error(`Narrative remained generic: ${value}`);
  }
}
if (!/nip point/i.test(enriched.mechanismOfInjuryNarrative) || !/guarding/i.test(enriched.correctiveActionNarrative)) {
  throw new Error('Narrative did not preserve mechanism and corrective-action reasoning.');
}
console.log('narrative-quality-regression: PASS');
