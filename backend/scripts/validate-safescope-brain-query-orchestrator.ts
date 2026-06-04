import { SafeScopeBrainQueryOrchestratorService } from '../src/safescope-v2/brain/query-orchestrator/brain-query-orchestrator.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const orchestrator = new SafeScopeBrainQueryOrchestratorService();

const forkliftPacket = orchestrator.query({
  scenarioLabel: 'forklift pedestrian interaction',
  jurisdiction: 'osha_general_industry',
  industryScope: 'general_industry',
  hazardDomain: 'mobile_equipment',
  text: 'Forklift operating near pedestrians in a warehouse aisle with no separation or traffic control.',
  approvedOnly: true,
  limit: 5,
});

assert(
  forkliftPacket.summary.likelyMechanism === 'pedestrian_strike',
  `Expected forklift packet mechanism pedestrian_strike, got ${forkliftPacket.summary.likelyMechanism}.`,
);

assert(
  forkliftPacket.summary.likelyCitation === '29 CFR 1910.178(l)',
  `Expected forklift packet citation 29 CFR 1910.178(l), got ${forkliftPacket.summary.likelyCitation}.`,
);

assert(
  forkliftPacket.summary.likelyControls.some((control) => control.toLowerCase().includes('pedestrian')),
  'Forklift packet should include pedestrian separation controls.',
);

assert(
  forkliftPacket.summary.criticalEvidenceQuestions.length > 0,
  'Forklift packet should include critical evidence questions.',
);

const undergroundGuardingPacket = orchestrator.query({
  scenarioLabel: 'underground MNM conveyor guarding',
  jurisdiction: 'msha',
  industryScope: 'mining',
  mineScope: 'metal_nonmetal_underground',
  hazardDomain: 'machine_guarding',
  mechanism: 'rotating_equipment',
  text: 'Underground metal/nonmetal conveyor rotating component has missing guard with exposed moving parts.',
  approvedOnly: true,
  limit: 5,
});

assert(
  undergroundGuardingPacket.summary.likelyCitation === '30 CFR 57.14107',
  `Expected underground MNM guarding citation 30 CFR 57.14107, got ${undergroundGuardingPacket.summary.likelyCitation}.`,
);

assert(
  undergroundGuardingPacket.summary.likelyMechanism === 'rotating_equipment',
  `Expected underground MNM guarding mechanism rotating_equipment, got ${undergroundGuardingPacket.summary.likelyMechanism}.`,
);

const silicaPacket = orchestrator.query({
  scenarioLabel: 'construction silica exposure',
  jurisdiction: 'osha_construction',
  industryScope: 'construction',
  hazardDomain: 'health_respiratory',
  mechanism: 'silica_inhalation',
  text: 'Construction employee dry cutting concrete with visible silica dust and no wet methods or dust collection.',
  approvedOnly: true,
  limit: 5,
});

assert(
  silicaPacket.summary.likelyCitation === '29 CFR 1926.1153(c)(1)',
  `Expected silica citation 29 CFR 1926.1153(c)(1), got ${silicaPacket.summary.likelyCitation}.`,
);

assert(
  silicaPacket.summary.criticalEvidenceQuestions.some((question) =>
    question.toLowerCase().includes('silica') ||
    question.toLowerCase().includes('exposure') ||
    question.toLowerCase().includes('dust'),
  ),
  'Silica packet should include silica/exposure evidence questions.',
);

for (const packet of [forkliftPacket, undergroundGuardingPacket, silicaPacket]) {
  assert(packet.boundary.readOnly === true, `${packet.input.scenarioLabel} must be read-only.`);
  assert(packet.boundary.canCreateCitation === false, `${packet.input.scenarioLabel} must not create citations.`);
  assert(packet.boundary.canDeclareViolation === false, `${packet.input.scenarioLabel} must not declare violations.`);
  assert(packet.boundary.canOverrideRegulation === false, `${packet.input.scenarioLabel} must not override regulations.`);
  assert(packet.boundary.canBypassHumanReview === false, `${packet.input.scenarioLabel} must not bypass human review.`);
  assert(packet.boundary.canModifyProductionReasoning === false, `${packet.input.scenarioLabel} must not modify production reasoning.`);
  assert(packet.boundary.requiresQualifiedReview === true, `${packet.input.scenarioLabel} must require qualified review.`);
  assert(packet.summary.compartmentSummaries.length === 10, `${packet.input.scenarioLabel} must summarize all ten Brain compartments.`);

  assert(
    packet.summary.compartmentSummaries.some((summary) => summary.compartment === 'learning_memory'),
    `${packet.input.scenarioLabel} must include Learning Memory compartment.`,
  );

  assert(
    packet.summary.compartmentSummaries.some((summary) => summary.compartment === 'observation_understanding'),
    `${packet.input.scenarioLabel} must include Observation Understanding compartment.`,
  );

  assert(
    packet.observationUnderstanding.boundary.readOnly === true,
    `${packet.input.scenarioLabel} Observation Understanding must be read-only.`,
  );

  assert(
    typeof packet.summary.observationPrimaryEntityLabel === 'string' &&
      packet.summary.observationPrimaryEntityLabel.length > 0,
    `${packet.input.scenarioLabel} must include an observation primary entity label.`,
  );


  assert(
    typeof packet.summary.learningMemoryRecordCount === 'number',
    `${packet.input.scenarioLabel} must include Learning Memory record count.`,
  );

  assert(
    packet.summary.compartmentSummaries.some((summary) => summary.compartment === 'improvement_candidate_engine'),
    `${packet.input.scenarioLabel} must include Improvement Candidate Engine compartment.`,
  );

  assert(
    typeof packet.summary.improvementCandidateCount === 'number',
    `${packet.input.scenarioLabel} must include Improvement Candidate count.`,
  );

  assert(
    packet.improvementCandidateResult.boundary.readOnly === true,
    `${packet.input.scenarioLabel} Improvement Candidate Engine must be read-only.`,
  );

  assert(
    packet.improvementCandidateResult.boundary.canAutoApply === false,
    `${packet.input.scenarioLabel} Improvement Candidate Engine must not auto-apply.`,
  );
  assert(
    packet.decisionConfidence.boundary.readOnly === true,
    `${packet.input.scenarioLabel} Decision Confidence must be read-only.`,
  );
  assert(
    typeof packet.summary.defensibilityScore === 'number',
    `${packet.input.scenarioLabel} must include a defensibility score.`,
  );
  assert(
    packet.summary.compartmentSummaries.some((summary) => summary.compartment === 'decision_confidence'),
    `${packet.input.scenarioLabel} must summarize Decision Confidence.`,
  );

  assert(
    packet.summary.evidenceGapDisposition === 'proceed_with_advisory_context' ||
      packet.summary.evidenceGapDisposition === 'proceed_with_human_review' ||
      packet.summary.evidenceGapDisposition === 'hold_for_critical_evidence',
    `${packet.input.scenarioLabel} must include an evidence gap disposition.`,
  );

  assert(
    packet.evidenceGapIntelligence.boundary.readOnly === true,
    `${packet.input.scenarioLabel} evidence gap intelligence must be read-only.`,
  );
}

console.log('✅ SafeScope Brain Query Orchestrator validation passed.');
console.log(`Forklift citation: ${forkliftPacket.summary.likelyCitation}`);
console.log(`Forklift mechanism: ${forkliftPacket.summary.likelyMechanism}`);
console.log(`Underground guarding citation: ${undergroundGuardingPacket.summary.likelyCitation}`);
console.log(`Silica citation: ${silicaPacket.summary.likelyCitation}`);
