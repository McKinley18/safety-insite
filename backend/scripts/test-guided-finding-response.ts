import * as assert from 'node:assert/strict';
import { attachGuidedFindingResponse } from '../src/safescope-v2/display/guided-finding-response';

const baseRequest: any = {
  text: 'Employee can reach an unguarded moving coupling while the machine is operating.',
  scopes: ['osha-general-industry'],
  structuredObservation: {
    narrative: 'Employee can reach an unguarded moving coupling while the machine is operating.',
    jurisdiction: 'osha-general-industry',
  },
};
const supported: any = attachGuidedFindingResponse({
  classification: 'Machine guarding',
  primaryCitation: '29 CFR 1910.212(a)(1)',
  primaryStandards: [{
    citation: '29 CFR 1910.212(a)(1)',
    title: 'Machine guarding',
    plainLanguageSummary: 'Provide guarding against contact with hazardous moving parts.',
    agencyCode: 'OSHA',
  }],
  applicabilityDecisions: [{
    citation: '29 CFR 1910.212(a)(1)',
    family: 'Machine guarding',
    status: 'SUPPORTED',
    confidence: 0.93,
    requiredPredicates: [
      { name: 'accessible moving part', status: 'SUPPORTED' },
      { name: 'guard absent', status: 'SUPPORTED' },
    ],
    missingPredicates: [],
    contradictoryEvidence: [],
    source: { authority: 'regulation', bundle: 'federal-core', version: '1' },
  }],
  clarificationQuestions: [],
  risk: { riskBand: 'High', reasoning: ['Contact with the moving coupling could cause serious injury.'] },
  evidenceSnapshot: { id: 'ev-1', offlineBundle: { version: '1' }, criticalUnknowns: [] },
  correctiveActionReasoning: {
    immediateActionNarrative: 'Restrict access until the coupling is guarded.',
    permanentCorrectionNarrative: 'Install a secure coupling guard.',
    verificationNarrative: 'Verify the guard prevents contact before startup.',
  },
}, baseRequest);

assert.equal(supported.guidedFinding.contractVersion, 'guided-finding-v1');
assert.equal(supported.guidedFinding.primaryStandard.citation, '29 CFR 1910.212(a)(1)');
assert.equal(supported.guidedFinding.primaryStandard.applicability, 'direct');
assert.equal(supported.guidedFinding.primaryStandard.confidenceLabel, 'High');
assert.equal(supported.guidedFinding.primaryStandard.sourceStatus, 'provisional-versioned-regulation');
assert.match(supported.guidedFinding.primaryStandard.confidenceLimitReason, /approval|coverage/i);
assert.match(supported.guidedFinding.primaryStandard.whyOffered, /accessible moving part/i);
assert.equal(supported.guidedFinding.additionalStandards.length, 0);
assert.equal(supported.guidedFinding.riskAssessment.provisional, false);
assert.equal(supported.guidedFinding.riskAssessment.reviewerConfirmed, false);
assert.match(supported.guidedFinding.correctiveAction.immediateAction, /restrict access/i);
assert.match(supported.guidedFinding.correctiveAction.permanentCorrection, /guard/i);
assert.match(supported.guidedFinding.correctiveAction.verificationStep, /verify/i);
assert.equal(supported.guidedFinding.reviewStatus.status, 'qualified-review-required');
assert.equal(supported.guidedFinding.provenance.deterministicInputHash.length, 64);

const candidate: any = attachGuidedFindingResponse({
  applicabilityDecisions: [{
    citation: '29 CFR 1910.147',
    family: 'Hazardous energy control',
    status: 'UNKNOWN',
    confidence: 0.45,
    requiredPredicates: [{ name: 'energy capable', status: 'UNKNOWN' }],
    missingPredicates: ['equipment operating or capable'],
    source: { authority: 'regulation', bundle: 'federal-core', version: '1' },
  }],
  clarificationQuestions: [{
    id: 'energy-state',
    question: 'Was the equipment operating or capable of being energized?',
    reason: 'This determines whether hazardous-energy controls apply.',
    options: ['Yes', 'No', 'Unknown', 'Not applicable'],
    impactedDecisions: ['standard-applicability', 'risk'],
  }, {
    id: 'energy-state',
    question: 'Duplicate question',
  }],
  evidenceSnapshot: { id: 'ev-2', offlineBundle: { version: '1' }, criticalUnknowns: [] },
}, { ...baseRequest, text: 'Mechanic was near the drive; energy state was not observed.' });

assert.equal(candidate.guidedFinding.primaryStandard.applicability, 'candidate');
assert.equal(candidate.guidedFinding.primaryStandard.confidenceLabel, 'Low');
assert.equal(candidate.guidedFinding.clarificationQuestions.length, 1);
assert.equal(candidate.guidedFinding.clarificationQuestions[0].id, 'energy-state');
assert.equal(candidate.guidedFinding.riskAssessment.provisional, true);
assert.match(candidate.guidedFinding.primaryStandard.whyOffered, /candidate/i);
assert.equal(candidate.guidedFinding.limitations.length, 3);
assert.equal(candidate.guidedFinding.multiHazardReview.requiresSplitReview, false);

const repeated: any = attachGuidedFindingResponse({
  applicabilityDecisions: candidate.applicabilityDecisions,
  clarificationQuestions: candidate.clarificationQuestions,
  evidenceSnapshot: { id: 'ev-2', offlineBundle: { version: '1' }, criticalUnknowns: [] },
}, { ...baseRequest, text: 'Mechanic was near the drive; energy state was not observed.' });
assert.equal(
  repeated.guidedFinding.provenance.deterministicInputHash,
  candidate.guidedFinding.provenance.deterministicInputHash,
);

const multi: any = attachGuidedFindingResponse({
  applicabilityDecisions: [
    {
      citation: '29 CFR 1910.212(a)(1)', family: 'Machine guarding', status: 'SUPPORTED', confidence: 0.9,
      requiredPredicates: [{ name: 'accessible moving part', status: 'SUPPORTED', factIds: ['f1'] }],
      source: { authority: 'regulation', bundle: 'federal-core', version: '1' },
    },
    {
      citation: '29 CFR 1910.303(b)(1)', family: 'Electrical equipment', status: 'SUPPORTED', confidence: 0.88,
      requiredPredicates: [{ name: 'damaged energized conductor', status: 'SUPPORTED', factIds: ['f2'] }],
      source: { authority: 'regulation', bundle: 'federal-core', version: '1' },
    },
  ],
}, baseRequest);
assert.equal(multi.guidedFinding.multiHazardReview.requiresSplitReview, true);
assert.equal(multi.guidedFinding.findingCandidates.length, 2);
assert.deepEqual(multi.guidedFinding.findingCandidates[0].evidenceFactIds, ['f1']);

console.log(JSON.stringify({ passed: true, assertions: 27 }));
