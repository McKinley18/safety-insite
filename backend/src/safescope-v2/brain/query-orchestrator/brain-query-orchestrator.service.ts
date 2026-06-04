import { removeNegatedClauses } from '../../reasoning-orchestrator/negation-context.util';
import { SafeScopeRegulatoryBrainService } from '../regulatory-brain/regulatory-brain.service';
import { SafeScopeMechanismBrainService } from '../mechanism-brain/mechanism-brain.service';
import { SafeScopeControlsBrainService } from '../controls-brain/controls-brain.service';
import { SafeScopeEvidenceBrainService } from '../evidence-brain/evidence-brain.service';
import { SafeScopeScenarioDisambiguationService } from '../scenario-disambiguation/scenario-disambiguation.service';
import { SafeScopeEvidenceGapIntelligenceService } from '../evidence-gap-intelligence/evidence-gap-intelligence.service';
import { SafeScopeDecisionConfidenceService } from '../decision-confidence/decision-confidence.service';
import { SafeScopeLearningMemoryService } from '../learning-memory/learning-memory.service';
import { SafeScopeImprovementCandidateEngineService } from '../improvement-candidate-engine/improvement-candidate-engine.service';
import { SafeScopeObservationUnderstandingService } from '../observation-understanding/observation-understanding.service';
import { hasAnyNonNegatedTerm } from '../../reasoning-orchestrator/negation-context.util';
import {
  SafeScopeBrainCompartmentSummary,
  SafeScopeBrainQueryOrchestratorInput,
  SafeScopeBrainSituationalAwarenessPacket,
} from './brain-query-orchestrator.types';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  return hasAnyNonNegatedTerm(text, terms);
}

function resolveCraneRiggingMechanismOverride(text: string): string | undefined {
  const value = normalized(text);

  if (
    includesAny(value, ['suspended load', 'hoisted load', 'under the load', 'under suspended load', 'load path', 'fall zone', 'tag line', 'crane load', 'standing under', 'employee under'])
  ) {
    return 'struck_by_suspended_load';
  }

  if (
    includesAny(value, ['damaged sling', 'frayed sling', 'frayed synthetic sling', 'missing identification', 'missing sling tag', 'rigging defect', 'overloaded sling', 'wire rope', 'shackle', 'hook', 'pre-use inspection']) &&
    includesAny(value, ['rigging', 'sling', 'hoist', 'hoisting', 'lifting', 'material lifting'])
  ) {
    return 'rigging_failure';
  }

  if (
    includesAny(value, ['dropped load', 'falling load', 'load shift', 'lost load control'])
  ) {
    return 'dropped_load';
  }

  return undefined;
}


function resolveHighPriorityPhysicalMechanismOverride(text: string): string | undefined {
  const value = normalized(text);
  if (
    includesAny(value, ['exposed energized wiring', 'exposed live wiring', 'exposed energized conductor', 'exposed conductor', 'energized wiring', 'live conductor']) &&
    includesAny(value, ['exposed', 'energized', 'live', 'wiring', 'conductor', 'shock', 'electrical'])
  ) {
    return 'shock';
  }

  if (
    includesAny(value, ['travelway housekeeping', 'housekeeping trip', 'trip hazard', 'obstructed travelway', 'walking path obstruction']) &&
    includesAny(value, ['trip', 'travelway', 'housekeeping', 'obstruction', 'debris', 'walkway'])
  ) {
    return 'trip';
  }


  if (
    includesAny(value, ['heat stress', 'heat illness', 'hot environment', 'wbgt', 'heat index', 'high temperature', 'radiant heat', 'dehydration', 'working in heat']) &&
    includesAny(value, ['worker', 'employee', 'exposure', 'outdoor', 'hydration', 'shade', 'acclimatization', 'work rest', 'work-rest', 'symptom', 'cooling', 'water', 'heat'])
  ) {
    return 'heat_illness';
  }

  if (
    includesAny(value, ['cold stress', 'cold exposure', 'hypothermia', 'frostbite', 'wind chill', 'freezing temperature', 'cold weather', 'cold work', 'freezing conditions', 'cold injury']) &&
    includesAny(value, ['worker', 'employee', 'exposure', 'outdoor', 'prolonged', 'glove', 'gloves', 'hands', 'feet', 'symptom', 'warming', 'warm up', 'wet clothing'])
  ) {
    return 'cold_stress';
  }

  if (
    includesAny(value, ['noise', 'loud', 'decibel', 'dba', 'sound level', 'hearing conservation', 'audiogram', 'dosimetry']) &&
    includesAny(value, ['exposure', 'worker', 'employee', 'crusher', 'saw', 'jackhammer', 'hearing protection', 'survey', 'monitoring', 'dose'])
  ) {
    return 'noise_induced_hearing_loss';
  }

  if (
    includesAny(value, ['manual lifting', 'heavy lift', 'lifting heavy', 'awkward posture', 'repetitive motion', 'overexertion', 'ergonomic', 'ergonomics', 'twisting', 'material handling by hand']) &&
    includesAny(value, ['worker', 'employee', 'lift', 'lifting', 'handling', 'repetitive', 'posture', 'reach', 'strain', 'sprain'])
  ) {
    return 'overexertion';
  }

  if (
    includesAny(value, ['fire extinguisher', 'extinguisher', 'portable fire extinguisher']) &&
    includesAny(value, [
      'blocked',
      'obstructed',
      'not accessible',
      'missing',
      'expired',
      'inspection tag',
      'monthly inspection',
      'not legible',
      'illegible',
      'unreadable',
      'label not legible',
      'tag not legible',
      'inspection tag not legible',
      'cannot be verified',
      'not identified',
      'unidentified',
    ])
  ) {
    return 'fire_extinguisher_access_failure';
  }

  if (
    includesAny(value, [
      'welding cylinder',
      'welding cylinders',
      'fuel gas cylinder',
      'fuel gas cylinders',
      'fuel-gas cylinder',
      'fuel-gas cylinders',
      'oxygen cylinder',
      'oxygen cylinders',
      'acetylene cylinder',
      'acetylene cylinders',
      'oxygen and fuel gas',
      'oxygen and fuel-gas',
      'oxygen and acetylene',
      'fuel gas and oxygen',
      'acetylene and oxygen',
      'cylinder separation',
      'cylinders stored together',
      'oxygen and fuel gas cylinders stored together',
      'fuel gas cylinders stored together',
      'oxygen cylinders stored with fuel gas cylinders',
      'not separated',
      'separation distance',
      'noncombustible barrier',
    ]) &&
    includesAny(value, [
      'welding',
      'cutting',
      'hot work',
      'fuel gas',
      'fuel-gas',
      'oxygen',
      'acetylene',
      'cylinder',
      'cylinders',
      'separation',
    ])
  ) {
    return 'fire_explosion';
  }

  if (includesAny(value, ['hot work', 'welding', 'cutting', 'torch cutting', 'grinding sparks']) && includesAny(value, ['fire watch', 'combustible', 'flammable', 'sparks', 'ignition'])) {
    return 'hot_work_ignition';
  }

  if (
    includesAny(value, [
      'without eye protection',
      'without face protection',
      'without eye and face protection',
      'without eye or face protection',
      'no eye protection',
      'no face protection',
      'no eye and face protection',
      'no eye or face protection',
      'missing eye protection',
      'missing face protection',
      'missing eye and face protection',
      'not wearing safety glasses',
      'not wearing goggles',
      'not wearing face shield',
      'grinding without eye',
      'grinding without face',
      'grinding without eye and face',
    ]) ||
    (
      includesAny(value, ['eye protection', 'face shield', 'safety glasses', 'goggles', 'eye and face protection']) &&
      includesAny(value, ['without', 'no ', 'missing', 'not wearing'])
    )
  ) {
    return 'eye_face_ppe_gap';
  }

  if (includesAny(value, ['hand protection', 'gloves', 'cut resistant', 'sharp material', 'sharp metal', 'sharp edge']) && includesAny(value, ['without', 'no ', 'missing', 'not wearing', 'handling'])) {
    return 'hand_ppe_gap';
  }

  if (includesAny(value, ['grinder', 'abrasive wheel', 'cutoff wheel', 'cut-off wheel', 'grinding wheel']) && includesAny(value, ['missing guard', 'guard removed', 'no guard', 'damaged guard', 'wheel guard'])) {
    return 'abrasive_wheel_failure';
  }

  if (includesAny(value, ['defective tool', 'damaged tool', 'broken handle', 'portable power tool', 'power tool', 'hand tool', 'tool cord', 'extension cord']) && includesAny(value, ['defective', 'damaged', 'broken', 'frayed cord', 'damaged cord', 'cord insulation', 'missing ground pin', 'cracked', 'unsafe', 'tagged out', 'removed from service'])) {
    return 'defective_tool_contact';
  }

  if (
    includesAny(value, ['stacked unevenly', 'unevenly stacked', 'leaning into', 'leaning pallet', 'palletized material', 'unstable stack', 'improper stacking']) &&
    includesAny(value, ['aisle', 'employee aisle', 'travelway', 'falling material', 'falling material exposure', 'material storage', 'warehouse'])
  ) {
    return 'unstable_stack_collapse';
  }

  if (includesAny(value, ['overhead storage', 'stored overhead', 'overhead stored', 'falling object', 'falling material', 'object fell', 'material fell', 'material stored overhead', 'stored above employees'])) {
    return 'falling_object_material';
  }

  if (includesAny(value, ['unstable stack', 'stacked unevenly', 'unevenly stacked', 'leaning into', 'leaning pallet', 'leaning into employee aisle', 'leaning into an employee aisle', 'palletized material', 'stacked material', 'material was stacked', 'improper stacking', 'stacked unevenly', 'unevenly stacked', 'stacked material', 'leaning pallet', 'improper stacking', 'rack collapse', 'pallets stacked', 'stacked boxes', 'leaning stack', 'unstable pallet'])) {
    return 'unstable_stack_collapse';
  }

  return undefined;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export class SafeScopeBrainQueryOrchestratorService {
  constructor(
    private readonly regulatoryBrain = new SafeScopeRegulatoryBrainService(),
    private readonly mechanismBrain = new SafeScopeMechanismBrainService(),
    private readonly controlsBrain = new SafeScopeControlsBrainService(),
    private readonly evidenceBrain = new SafeScopeEvidenceBrainService(),
    private readonly scenarioDisambiguation = new SafeScopeScenarioDisambiguationService(),
    private readonly evidenceGapIntelligence = new SafeScopeEvidenceGapIntelligenceService(),
    private readonly decisionConfidence = new SafeScopeDecisionConfidenceService(),
    private readonly learningMemory = new SafeScopeLearningMemoryService(),
    private readonly improvementCandidateEngine = new SafeScopeImprovementCandidateEngineService(),
    private readonly observationUnderstanding = new SafeScopeObservationUnderstandingService(),
  ) {}

  query(input: SafeScopeBrainQueryOrchestratorInput): SafeScopeBrainSituationalAwarenessPacket {
    const baseLimit = input.limit || 5;
    const reasoningText = removeNegatedClauses(input.text || '');

    const craneRiggingMechanismOverride =
      input.hazardDomain === 'cranes_rigging_hoisting'
        ? resolveCraneRiggingMechanismOverride(reasoningText)
        : undefined;

    const observationUnderstanding = this.observationUnderstanding.analyze(reasoningText);

    const highPriorityPhysicalMechanismOverride =
      resolveHighPriorityPhysicalMechanismOverride(reasoningText);

    const scenarioDisambiguation = this.scenarioDisambiguation.query({
      text: reasoningText,
      jurisdiction: input.jurisdiction,
      industryContext: input.industryScope,
      siteType: input.mineScope,
      taskContext: input.scenarioLabel,
      equipmentInvolved: undefined,
      limit: baseLimit,
    });

    const scenarioSelected = scenarioDisambiguation.selected;
    const confidentScenarioSelected =
      scenarioSelected && ['high', 'moderate'].includes(scenarioSelected.confidence)
        ? scenarioSelected
        : undefined;

    const scenarioMechanism =
      scenarioSelected?.confidence === 'high'
        ? scenarioSelected.record.targetMechanism
        : undefined;

    const mechanism = this.mechanismBrain.query({
      hazardDomain: input.hazardDomain,
      mechanismId: craneRiggingMechanismOverride || highPriorityPhysicalMechanismOverride || scenarioMechanism || input.mechanism,
      text: reasoningText,
      limit: baseLimit,
    });

    const inferredMechanism =
      craneRiggingMechanismOverride ||
      highPriorityPhysicalMechanismOverride ||
      scenarioMechanism ||
      input.mechanism ||
      mechanism.matches[0]?.record.mechanismId;

    const regulatory = this.regulatoryBrain.query({
      ...input,
      mechanism: inferredMechanism,
      approvedOnly: input.approvedOnly ?? true,
      limit: baseLimit,
    });

    const controls = this.controlsBrain.query({
      hazardDomain: input.hazardDomain,
      mechanism: inferredMechanism,
      text: reasoningText,
      limit: baseLimit,
    });

    const evidence = this.evidenceBrain.query({
      ...input,
      mechanism: inferredMechanism,
      limit: baseLimit,
    });

    const evidenceGapIntelligence = this.evidenceGapIntelligence.query({
      text: reasoningText,
      jurisdiction: input.jurisdiction,
      hazardDomain: input.hazardDomain,
      mechanism: inferredMechanism,
      citation: input.citation,
      limit: baseLimit,
    });

    const decisionConfidence = this.decisionConfidence.assess({
      nativePrimaryCitation: input.citation,
      brainLikelyCitation: regulatory.matches[0]?.record.citation,
      nativeMechanism: input.mechanism,
      brainLikelyMechanism: inferredMechanism,
      scenarioConfidence: scenarioSelected?.confidence,
      scenarioHumanReviewRecommended: scenarioSelected?.humanReviewRecommended,
      evidenceGapHighestSeverity: evidenceGapIntelligence.highestSeverity,
      evidenceGapDisposition: evidenceGapIntelligence.recommendedDisposition,
      criticalEvidenceQuestionCount: evidence.matches.filter((match) => match.record.importance === 'critical' || match.score >= 40).length,
      likelyControlCount: controls.matches.length,
      regulatoryMatchCount: regulatory.matches.length,
      mechanismMatchCount: mechanism.matches.length,
      evidenceMatchCount: evidence.matches.length,
      controlMatchCount: controls.matches.length,
    });

    const relatedLearningMemories = this.learningMemory.query({
      jurisdiction: input.jurisdiction,
      domain: input.hazardDomain,
      citation: input.citation || regulatory.matches[0]?.record.citation,
      mechanism: inferredMechanism,
      scenarioId: scenarioSelected?.record.scenarioId,
      limit: baseLimit,
    });

    const learningMemorySummary = this.learningMemory.summarize();

    const improvementCandidateResult = this.improvementCandidateEngine.generate({
      memories: this.learningMemory.list(),
      minimumSupportCount: 1,
      limit: baseLimit,
    });

    const likelyCitation = regulatory.matches[0]?.record.citation;
    const likelyMechanism = inferredMechanism;

    /*
     * Mechanism-aligned field output:
     * Some records share broad domains, such as fire_protection, but represent
     * very different situations. For example, a blocked extinguisher should not
     * inherit hot-work permits, fire-watch controls, or hot-work questions unless
     * hot_work_ignition is the inferred mechanism.
     */
    const conflictsWithInferredMechanism = (recordMechanisms: string[] = []): boolean => {
      if (!inferredMechanism) return false;

      const conflictingMechanismPairs: Record<string, string[]> = {
        fire_extinguisher_access_failure: ['hot_work_ignition', 'fire_explosion', 'fire_watch_gap'],
        hot_work_ignition: ['fire_extinguisher_access_failure'],
        fire_explosion: ['fire_extinguisher_access_failure'],
        air_quality_contaminant_buildup: ['hot_work_ignition', 'fire_explosion'],
      };

      const conflicts = conflictingMechanismPairs[inferredMechanism] || [];
      return recordMechanisms.some((mechanism) => conflicts.includes(mechanism));
    };

    const prioritizeFieldFacingMatches = <
      T extends { score: number; record: { mechanisms?: string[]; hazardDomains?: string[] } },
    >(
      matches: T[],
    ): T[] => {
      const exactMechanismMatches = matches.filter((match) =>
        inferredMechanism &&
        Array.isArray(match.record.mechanisms) &&
        match.record.mechanisms.includes(inferredMechanism),
      );

      const safeDomainMatches = matches.filter((match) => {
        if (exactMechanismMatches.includes(match)) return false;
        if (conflictsWithInferredMechanism(match.record.mechanisms || [])) return false;
        return Boolean(input.hazardDomain && (match.record.hazardDomains || []).includes(input.hazardDomain));
      });

      const safeHighScoreMatches = matches.filter((match) => {
        if (exactMechanismMatches.includes(match)) return false;
        if (safeDomainMatches.includes(match)) return false;
        if (conflictsWithInferredMechanism(match.record.mechanisms || [])) return false;
        return match.score >= 40;
      });

      return [
        ...exactMechanismMatches,
        ...safeDomainMatches,
        ...safeHighScoreMatches,
      ];
    };

    const fieldFacingControlMatches = prioritizeFieldFacingMatches(controls.matches);

    const likelyControls = uniqueStrings(
      fieldFacingControlMatches.flatMap((match) => [
        match.record.immediateControl,
        match.record.permanentControl,
        ...match.record.verificationEvidence,
      ]),
    ).slice(0, 12);

    const fieldFacingEvidenceMatches = prioritizeFieldFacingMatches(evidence.matches);

    const criticalEvidenceQuestions = uniqueStrings(
      fieldFacingEvidenceMatches
        .filter((match) => match.record.importance === 'critical' || match.score >= 40)
        .map((match) => match.record.question),
    ).slice(0, 8);

    const compartmentSummaries: SafeScopeBrainCompartmentSummary[] = [
      {
        compartment: 'observation_understanding',
        topRecordId: observationUnderstanding.summary.primaryEntityKind,
        topLabel: observationUnderstanding.summary.primaryEntityLabel,
        matchCount: observationUnderstanding.findings.length,
        reasonCodes: observationUnderstanding.findings[0]?.reasonCodes || [],
      },
      {
        compartment: 'regulatory_brain',
        topRecordId: regulatory.matches[0]?.record.recordId,
        topLabel: regulatory.matches[0]?.record.citation,
        topScore: regulatory.matches[0]?.score,
        matchCount: regulatory.matches.length,
        reasonCodes: regulatory.matches[0]?.reasonCodes || [],
      },
      {
        compartment: 'mechanism_brain',
        topRecordId: mechanism.matches[0]?.record.mechanismId,
        topLabel: mechanism.matches[0]?.record.label,
        topScore: mechanism.matches[0]?.score,
        matchCount: mechanism.matches.length,
        reasonCodes: mechanism.matches[0]?.reasonCodes || [],
      },
      {
        compartment: 'controls_brain',
        topRecordId: controls.matches[0]?.record.controlId,
        topLabel: controls.matches[0]?.record.immediateControl,
        topScore: controls.matches[0]?.score,
        matchCount: controls.matches.length,
        reasonCodes: controls.matches[0]?.reasonCodes || [],
      },
      {
        compartment: 'evidence_brain',
        topRecordId: evidence.matches[0]?.record.evidenceId,
        topLabel: evidence.matches[0]?.record.question,
        topScore: evidence.matches[0]?.score,
        matchCount: evidence.matches.length,
        reasonCodes: evidence.matches[0]?.reasonCodes || [],
      },
      {
        compartment: 'scenario_disambiguation',
        topRecordId: scenarioSelected?.record.scenarioId,
        topLabel: scenarioSelected?.record.label,
        topScore: scenarioSelected?.score,
        matchCount: scenarioDisambiguation.matches.length,
        reasonCodes: scenarioSelected?.reasonCodes || [],
      },
      {
        compartment: 'evidence_gap_intelligence',
        topRecordId: evidenceGapIntelligence.matches[0]?.record.gapId,
        topLabel: evidenceGapIntelligence.matches[0]?.record.label,
        topScore: evidenceGapIntelligence.matches[0]?.score,
        matchCount: evidenceGapIntelligence.matches.length,
        reasonCodes: evidenceGapIntelligence.matches[0]?.reasonCodes || [],
      },
      {
        compartment: 'decision_confidence',
        topRecordId: decisionConfidence.confidenceLevel,
        topLabel: decisionConfidence.recommendedDisposition,
        topScore: decisionConfidence.defensibilityScore,
        matchCount: decisionConfidence.reasonCodes.length,
        reasonCodes: decisionConfidence.reasonCodes,
      },
      {
        compartment: 'learning_memory',
        topRecordId: learningMemorySummary.topCorrectionTargets[0],
        topLabel: learningMemorySummary.recommendedImprovementBacklog[0],
        topScore: learningMemorySummary.totalRecords,
        matchCount: relatedLearningMemories.length,
        reasonCodes: learningMemorySummary.topCorrectionTargets,
      },
      {
        compartment: 'improvement_candidate_engine',
        topRecordId: improvementCandidateResult.candidates[0]?.candidateId,
        topLabel: improvementCandidateResult.candidates[0]?.title,
        topScore: improvementCandidateResult.summary.totalCandidates,
        matchCount: improvementCandidateResult.candidates.length,
        reasonCodes: improvementCandidateResult.summary.topTargets,
      },
    ];

    const reasoningNotes = [
      'SafeScope Brain Query Orchestrator is read-only.',
      'The packet is situational-awareness context only.',
      'The packet may identify likely references, mechanisms, controls, and evidence needs, but it does not declare violations.',
      'No Brain result may bypass qualified human review.',
      'Production SafeScope reasoning is not modified by this service.',
    ];

    return {
      engine: 'safescope_brain_query_orchestrator',
      mode: 'read_only_situational_awareness',
      input,
      regulatory,
      mechanism,
      controls,
      evidence,
      scenarioDisambiguation,
      evidenceGapIntelligence,
      decisionConfidence,
      learningMemorySummary,
      relatedLearningMemories,
      improvementCandidateResult,
      observationUnderstanding,
      summary: {
        likelyCitation,
        likelyMechanism,
        observationPrimaryEntityKind: observationUnderstanding.summary.primaryEntityKind,
        observationPrimaryEntityLabel: observationUnderstanding.summary.primaryEntityLabel,
        observationPrimaryCondition: observationUnderstanding.summary.primaryCondition,
        observationLikelyDomainHints: observationUnderstanding.summary.likelyDomainHints,
        observationLikelyMechanismHints: observationUnderstanding.summary.likelyMechanismHints,
        observationNegativeDomainHints: observationUnderstanding.summary.negativeDomainHints,
        observationEvidenceGaps: observationUnderstanding.summary.evidenceGaps,
        selectedScenarioId: confidentScenarioSelected?.record.scenarioId,
        selectedScenarioLabel: confidentScenarioSelected?.record.label,
        scenarioConfidence: scenarioSelected?.confidence,
        scenarioHumanReviewRecommended: scenarioSelected?.humanReviewRecommended,
        evidenceGapDisposition: evidenceGapIntelligence.recommendedDisposition,
        evidenceGapHighestSeverity: evidenceGapIntelligence.highestSeverity,
        evidenceGapCriticalQuestions: evidenceGapIntelligence.criticalQuestions,
        decisionConfidenceLevel: decisionConfidence.confidenceLevel,
        defensibilityScore: decisionConfidence.defensibilityScore,
        decisionRecommendedDisposition: decisionConfidence.recommendedDisposition,
        decisionWarnings: decisionConfidence.warnings,
        learningMemoryRecordCount: learningMemorySummary.totalRecords,
        learningMemoryCorrectionTargets: learningMemorySummary.topCorrectionTargets,
        learningMemoryRecommendedBacklog: learningMemorySummary.recommendedImprovementBacklog,
        improvementCandidateCount: improvementCandidateResult.summary.totalCandidates,
        improvementCandidateTopTargets: improvementCandidateResult.summary.topTargets,
        improvementCandidateCriticalCount: improvementCandidateResult.summary.criticalCandidates,
        improvementCandidateHighCount: improvementCandidateResult.summary.highCandidates,
        likelyControls,
        criticalEvidenceQuestions,
        compartmentSummaries,
        reasoningNotes,
      },
      boundary: {
        readOnly: true,
        canCreateCitation: false,
        canDeclareViolation: false,
        canOverrideRegulation: false,
        canBypassHumanReview: false,
        canModifyProductionReasoning: false,
        requiresQualifiedReview: true,
      },
    };
  }

  private resolveHighPriorityPhysicalMechanism(value: string): string | undefined {
    if (
      includesAny(value, [
        'defective portable power tool',
        'defective power tool',
        'damaged power tool',
        'damaged hand tool',
        'defective hand tool',
        'portable drill',
        'portable tool',
        'power tool',
        'hand tool',
        'tool cord',
        'damaged cord',
        'frayed cord',
        'cracked housing',
        'cracked tool',
        'broken handle',
        'missing ground pin',
      ]) &&
      includesAny(value, ['defective', 'damaged', 'broken', 'cracked', 'frayed', 'unsafe', 'available for use', 'cord', 'housing'])
    ) {
      return 'defective_tool_contact';
    }

    if (
      includesAny(value, ['unstable stack', 'stacked unevenly', 'unevenly', 'leaning', 'leaning into', 'palletized material', 'improper stacking', 'employee aisle']) &&
      includesAny(value, ['stack', 'stacked', 'pallet', 'palletized', 'material storage', 'aisle'])
    ) {
      return 'unstable_stack_collapse';
    }

    if (
      includesAny(value, ['falling object', 'falling material', 'overhead storage', 'stored overhead', 'stored overhead on a rack', 'without restraint', 'falling object protection'])
    ) {
      return 'falling_object_material';
    }

    return undefined;
  }

}
