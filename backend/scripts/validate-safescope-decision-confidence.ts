import { SafeScopeDecisionConfidenceService } from '../src/safescope-v2/brain/decision-confidence/decision-confidence.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeDecisionConfidenceService();

const strong = service.assess({
  nativePrimaryCitation: '30 CFR 56.14107',
  brainLikelyCitation: '30 CFR 56.14107',
  nativeMechanism: 'rotating_equipment_nip_point',
  brainLikelyMechanism: 'rotating_equipment_nip_point',
  scenarioConfidence: 'high',
  scenarioHumanReviewRecommended: false,
  evidenceGapHighestSeverity: 'low',
  evidenceGapDisposition: 'proceed_with_advisory_context',
  criticalEvidenceQuestionCount: 5,
  likelyControlCount: 5,
  regulatoryMatchCount: 3,
  mechanismMatchCount: 3,
  evidenceMatchCount: 3,
  controlMatchCount: 3,
});

assert(strong.confidenceLevel === 'high', `Expected high confidence, got ${strong.confidenceLevel}`);
assert(strong.defensibilityScore >= 85, `Expected strong defensibility score, got ${strong.defensibilityScore}`);
assert(strong.recommendedDisposition === 'proceed_with_advisory_output', `Expected advisory output disposition, got ${strong.recommendedDisposition}`);
assert(strong.reasonCodes.includes('citation-aligned'), 'Strong result should include citation alignment.');
assert(strong.reasonCodes.includes('mechanism-aligned'), 'Strong result should include mechanism alignment.');

const misaligned = service.assess({
  nativePrimaryCitation: '29 CFR 1910.212(a)(3)(ii)',
  brainLikelyCitation: '29 CFR 1910.147(c)(1)',
  nativeMechanism: 'pinch_point',
  brainLikelyMechanism: 'unexpected_startup',
  scenarioConfidence: 'moderate',
  scenarioHumanReviewRecommended: true,
  evidenceGapHighestSeverity: 'medium',
  evidenceGapDisposition: 'proceed_with_human_review',
  criticalEvidenceQuestionCount: 3,
  likelyControlCount: 4,
  regulatoryMatchCount: 2,
  mechanismMatchCount: 2,
  evidenceMatchCount: 2,
  controlMatchCount: 2,
});

assert(misaligned.confidenceLevel !== 'high', 'Misaligned result should not be high confidence.');
assert(misaligned.recommendedDisposition === 'proceed_with_human_review', `Expected human review, got ${misaligned.recommendedDisposition}`);
assert(misaligned.reasonCodes.includes('citation-misaligned'), 'Misaligned result should flag citation mismatch.');
assert(misaligned.reasonCodes.includes('mechanism-misaligned'), 'Misaligned result should flag mechanism mismatch.');

const hold = service.assess({
  nativePrimaryCitation: '30 CFR 75.517',
  brainLikelyCitation: '30 CFR 75.517',
  nativeMechanism: 'shock_arc_flash',
  brainLikelyMechanism: 'shock_arc_flash',
  scenarioConfidence: 'high',
  scenarioHumanReviewRecommended: false,
  evidenceGapHighestSeverity: 'critical',
  evidenceGapDisposition: 'hold_for_critical_evidence',
  criticalEvidenceQuestionCount: 5,
  likelyControlCount: 5,
  regulatoryMatchCount: 3,
  mechanismMatchCount: 3,
  evidenceMatchCount: 3,
  controlMatchCount: 3,
});

assert(hold.confidenceLevel === 'hold', `Expected hold confidence, got ${hold.confidenceLevel}`);
assert(hold.recommendedDisposition === 'hold_for_critical_evidence', `Expected hold disposition, got ${hold.recommendedDisposition}`);
assert(hold.reasonCodes.includes('critical-evidence-gap-present'), 'Hold result should flag critical evidence gap.');

for (const result of [strong, misaligned, hold]) {
  assert(result.boundary.readOnly === true, 'Decision Confidence must be read-only.');
  assert(result.boundary.advisoryOnly === true, 'Decision Confidence must be advisory only.');
  assert(result.boundary.canDeclareViolation === false, 'Decision Confidence must not declare violations.');
  assert(result.boundary.canCreateCitation === false, 'Decision Confidence must not create citations.');
  assert(result.boundary.canOverrideRegulation === false, 'Decision Confidence must not override regulations.');
  assert(result.boundary.canBypassHumanReview === false, 'Decision Confidence must not bypass human review.');
}

console.log('✅ SafeScope Decision Confidence v1 validation passed.');
console.log(`Strong score: ${strong.defensibilityScore} / ${strong.confidenceLevel}`);
console.log(`Misaligned score: ${misaligned.defensibilityScore} / ${misaligned.confidenceLevel}`);
console.log(`Hold score: ${hold.defensibilityScore} / ${hold.confidenceLevel}`);
