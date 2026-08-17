import { enforceHazLenzEvidenceBoundary } from '../src/safescope-v2/display/hazlenz-evidence-boundary';
import { ClassifyDto } from '../src/safescope-v2/dto/classify.dto';

const baseResult = () => ({
  primaryCitation: '29 CFR 1910.147',
  primaryStandards: [{ citation: '29 CFR 1910.147', title: 'Energy control', standardText: 'Authoritative text' }],
  risk: { riskScore: 19, riskBand: 'Critical', requiresShutdown: true },
  generatedActions: [{ title: 'Lock out' }],
});
function apply(request: Partial<ClassifyDto>) {
  return enforceHazLenzEvidenceBoundary(baseResult(), {
    text: request.text || 'Machine observation',
    ...request,
  } as ClassifyDto);
}
function assert(value: unknown, message: string) {
  if (!value) throw new Error(message);
}

const controlled = apply({
  text: 'Machine is locked out and zero energy was verified.',
  structuredObservation: { energyState: 'locked-out', controlsPresent: ['personal locks', 'zero energy'], controlsMissing: [] },
});
assert(controlled.primaryCitation === '', 'Controlled condition retained a primary citation.');
assert(controlled.candidatePrimaryCitation === '29 CFR 1910.147', 'Controlled candidate citation was not preserved.');
assert(controlled.risk.riskBand === 'Controlled' && controlled.risk.requiresShutdown === false, 'Controlled risk was not recalibrated.');

const incomplete = apply({
  structuredObservation: { unknownFacts: ['energy state'], controlsPresent: [], controlsMissing: [] },
});
assert(incomplete.primaryCitation === '', 'Incomplete evidence retained a primary citation.');
assert(incomplete.assessmentDisposition === 'insufficient_evidence', 'Incomplete disposition is wrong.');

const contradictory = apply({
  structuredObservation: {
    unresolvedContradictions: [{ field: 'energy', originalValue: 'on', answerValue: 'off', reason: 'sources conflict' }],
  },
});
assert(contradictory.primaryCitation === '', 'Contradictory evidence retained a primary citation.');
assert(contradictory.regulatoryConclusion.evidenceStatus === 'contradictory', 'Contradiction status is missing.');

const unsafe = apply({
  text: 'Mechanic reaches into an operating machine with no lock.',
  structuredObservation: { energyState: 'operating', controlsPresent: [], controlsMissing: ['energy isolation'] },
});
assert(unsafe.primaryCitation === '29 CFR 1910.147', 'Sufficient unsafe evidence was incorrectly suppressed.');
assert(unsafe.standardDecisions[0].standardText === 'Authoritative text', 'Hydrated standard text was not retained.');

const notSure = apply({
  clarificationAnswers: [{ questionId: 'energy-state', answer: 'Not sure' }],
});
assert(notSure.primaryCitation === '', 'Not-sure answer retained a primary citation.');

const negatedExposure = apply({
  text: "No employee entered the trench and no cave-in exposure occurred; the word 'trench' appears only on the permit.",
  structuredObservation: { controlsPresent: [], controlsMissing: [], unknownFacts: [] },
});
assert(negatedExposure.primaryCitation === '', 'Explicitly negated exposure retained a primary citation.');
assert(negatedExposure.assessmentDisposition === 'controlled_condition', 'Explicitly negated exposure was not classified as controlled.');

console.log(JSON.stringify({ passed: true, assertions: 13 }));
