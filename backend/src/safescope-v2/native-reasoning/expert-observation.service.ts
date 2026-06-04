import { Injectable } from '@nestjs/common';
import {
  ExpertObservationInput,
  ExpertObservationOutput,
  SafeScopeKnowledgeMatch,
} from '../types/knowledge-expansion.types';

type ExpertDomain = {
  keys: string[];
  hazardObservations: string[];
  healthObservations?: string[];
  exposurePathways: string[];
  failureModes: string[];
  evidenceQuestions: string[];
  correctiveActionNotes: string[];
  hierarchyNotes: string[];
  verificationSuggestions: string[];
  humanReviewTriggers?: string[];
};

const EXPERT_DOMAINS: ExpertDomain[] = [
  {
    keys: ['machine', 'guarding', 'conveyor', 'rotating', 'pinch', 'nip'],
    hazardObservations: [
      'Evaluate nip points, rotating parts, ingoing pinch points, unexpected startup, stored energy, and worker access.',
    ],
    exposurePathways: [
      'Worker contact with moving machine parts during operation, cleanup, adjustment, maintenance, or troubleshooting.',
    ],
    failureModes: [
      'Missing guard, inadequate guard coverage, bypassed interlock, poor lockout/tagout control, or exposure during cleanup.',
    ],
    evidenceQuestions: [
      'Can a worker contact the moving part during normal operation, cleanup, adjustment, or maintenance?',
      'What is the equipment state: operating, shut down, de-energized, locked out, blocked, or tested?',
    ],
    correctiveActionNotes: [
      'Guard the point of operation or hazardous motion and verify energy isolation before cleanup or maintenance.',
    ],
    hierarchyNotes: [
      'Prefer fixed guarding, interlocked guarding, isolation, and lockout/tagout over warning signs or PPE alone.',
    ],
    verificationSuggestions: [
      'Photograph the guard condition, point of operation, access path, equipment state, and any lockout/tagout controls.',
    ],
    humanReviewTriggers: [
      'Potential contact with moving equipment or uncertainty about energy state requires qualified review.',
    ],
  },
  {
    keys: ['electrical', 'energized', 'panel', 'conductor', 'arc', 'breaker', 'disconnect'],
    hazardObservations: [
      'Evaluate energized parts, enclosure condition, access control, grounding, disconnecting means, labeling, and task activity.',
    ],
    exposurePathways: [
      'Worker exposure to energized conductors, damaged components, arc flash potential, wet conditions, or inadvertent contact.',
    ],
    failureModes: [
      'Open enclosure, damaged insulation, missing cover, poor labeling, wet environment, inadequate de-energization, or unqualified access.',
    ],
    evidenceQuestions: [
      'Is the equipment energized, verified de-energized, locked out, guarded, or under qualified-person control?',
      'Are covers, labels, strain relief, grounding, and access restrictions intact?',
    ],
    correctiveActionNotes: [
      'Restrict access, verify energy state, repair damaged components, restore covers, and document qualified-person review.',
    ],
    hierarchyNotes: [
      'Prefer de-energization, guarding, enclosure integrity, and access control before relying on PPE.',
    ],
    verificationSuggestions: [
      'Document panel condition, covers, labels, disconnect status, qualified-person controls, and evidence of de-energization.',
    ],
    humanReviewTriggers: [
      'Energized exposure, damaged electrical equipment, or unknown energy state requires qualified review.',
    ],
  },
  {
    keys: ['fall', 'elevated', 'edge', 'roof', 'ladder', 'scaffold', 'opening', 'hole'],
    hazardObservations: [
      'Evaluate fall distance, edge exposure, anchor condition, walking-working surface, access method, rescue considerations, and dropped-object exposure.',
    ],
    exposurePathways: [
      'Worker exposure to an unprotected edge, elevated work platform, ladder, opening, scaffold, roof, or unstable surface.',
    ],
    failureModes: [
      'Missing guardrail, improper tie-off, inadequate anchor, poor ladder setup, incomplete hole/opening protection, or poor rescue planning.',
    ],
    evidenceQuestions: [
      'What is the working height and fall distance?',
      'What fall prevention or fall arrest system is in use, and is it installed correctly?',
    ],
    correctiveActionNotes: [
      'Install guardrails, covers, travel restraint, or fall arrest systems and verify anchorage, training, and rescue planning.',
    ],
    hierarchyNotes: [
      'Prefer eliminating elevated work, guardrails, covers, and work platforms before relying on personal fall arrest alone.',
    ],
    verificationSuggestions: [
      'Capture photos of edge protection, tie-off method, anchor point, work height, access method, and surface condition.',
    ],
    humanReviewTriggers: [
      'Unprotected elevated work or uncertain fall protection adequacy requires qualified review.',
    ],
  },
  {
    keys: ['confined', 'permit space', 'atmosphere', 'engulfment', 'oxygen', 'entrant'],
    hazardObservations: [
      'Evaluate entry classification, atmospheric hazards, engulfment, configuration hazards, isolation, rescue planning, attendant coverage, and permit controls.',
    ],
    healthObservations: [
      'Consider oxygen deficiency/enrichment, toxic gases, flammable atmosphere, heat stress, and respiratory exposure.',
    ],
    exposurePathways: [
      'Entrant exposure to hazardous atmosphere, engulfment, entrapment, mechanical energy, poor ventilation, or delayed rescue.',
    ],
    failureModes: [
      'No atmospheric testing, poor isolation, missing attendant, inadequate rescue plan, uncontrolled material flow, or unrecognized permit-required space.',
    ],
    evidenceQuestions: [
      'Has the space been evaluated for permit-required confined space hazards?',
      'What were the oxygen, flammable gas/vapor, and toxic atmosphere readings before and during entry?',
      'How are engulfment, mechanical energy, and material flow isolated?',
    ],
    correctiveActionNotes: [
      'Stop entry until classification, atmospheric testing, isolation, ventilation, attendant coverage, rescue planning, and permit controls are verified.',
    ],
    hierarchyNotes: [
      'Prefer eliminating entry, remote inspection, isolation, ventilation, and engineered access before relying on PPE alone.',
    ],
    verificationSuggestions: [
      'Document atmospheric readings, calibration status, permit, isolation points, ventilation setup, attendant, rescue plan, and entrant roster.',
    ],
    humanReviewTriggers: [
      'Any possible confined space entry with unclear atmospheric testing or rescue planning requires qualified review.',
    ],
  },
  {
    keys: ['trench', 'excavation', 'shoring', 'sloping', 'shield', 'cave-in'],
    hazardObservations: [
      'Evaluate excavation depth, soil/rock condition, protective system, spoil pile placement, water accumulation, access/egress, nearby loads, and competent-person inspection.',
    ],
    exposurePathways: [
      'Worker exposure to cave-in, struck-by falling material, mobile equipment, water accumulation, hazardous atmosphere, or access/egress failure.',
    ],
    failureModes: [
      'No protective system, inadequate sloping/shoring/shielding, spoil pile too close, no ladder/egress, water accumulation, or vibration from nearby traffic.',
    ],
    evidenceQuestions: [
      'What is the excavation depth and soil/rock condition?',
      'What protective system is installed and who verified it?',
      'Are spoil piles, mobile equipment, water, and access/egress controlled?',
    ],
    correctiveActionNotes: [
      'Restrict entry until a competent person verifies protective systems, access/egress, water controls, spoil placement, and adjacent load controls.',
    ],
    hierarchyNotes: [
      'Prefer preventing entry, benching/sloping, shielding, shoring, and engineered protective systems before administrative controls.',
    ],
    verificationSuggestions: [
      'Photograph excavation depth, protective system, spoil pile distance, ladder/egress, water condition, traffic exposure, and competent-person inspection record.',
    ],
    humanReviewTriggers: [
      'Any trench or excavation entry with unclear protective system requires qualified review.',
    ],
  },
  {
    keys: ['mobile equipment', 'traffic', 'haul truck', 'loader', 'forklift', 'pedestrian', 'vehicle'],
    hazardObservations: [
      'Evaluate pedestrian-equipment interaction, blind spots, traffic flow, berms, backup alarms, visibility, communication, seat belt use, and ground conditions.',
    ],
    exposurePathways: [
      'Worker exposure to struck-by, caught-between, runover, rollover, backing, dumping, loading, or line-of-fire hazards.',
    ],
    failureModes: [
      'No traffic separation, poor visibility, missing spotter controls, inadequate berm, slope instability, poor pre-use inspection, or uncontrolled backing.',
    ],
    evidenceQuestions: [
      'Are pedestrians separated from mobile equipment travel paths?',
      'Are visibility, alarms, lights, berms, communication, and ground conditions adequate?',
    ],
    correctiveActionNotes: [
      'Separate pedestrians, establish traffic controls, verify equipment condition, correct visibility issues, and document operator/supervisor verification.',
    ],
    hierarchyNotes: [
      'Prefer physical separation, traffic redesign, berms, barriers, proximity controls, and engineered visibility improvements over verbal instructions alone.',
    ],
    verificationSuggestions: [
      'Document traffic layout, pedestrian routes, equipment condition, alarms/lights, berms, visibility, ground conditions, and operator controls.',
    ],
    humanReviewTriggers: [
      'Pedestrian exposure to mobile equipment or line-of-fire conditions requires supervisor review.',
    ],
  },
  {
    keys: ['hazcom', 'chemical', 'label', 'sds', 'container', 'solvent', 'corrosive', 'flammable'],
    hazardObservations: [
      'Evaluate container labeling, SDS availability, chemical identity, compatibility, storage, secondary containment, PPE, ventilation, and employee understanding.',
    ],
    healthObservations: [
      'Consider inhalation, skin absorption, eye contact, ingestion, sensitization, acute toxicity, chronic toxicity, corrosivity, and flammability.',
    ],
    exposurePathways: [
      'Worker exposure through inhalation, skin/eye contact, spills, incompatible storage, unlabeled transfer containers, or poor ventilation.',
    ],
    failureModes: [
      'Unlabeled container, missing SDS, incompatible storage, poor secondary containment, inadequate PPE, or lack of task-specific hazard communication.',
    ],
    evidenceQuestions: [
      'What chemical is present and is the container labeled?',
      'Is the SDS available and consistent with the task, PPE, storage, and exposure controls?',
    ],
    correctiveActionNotes: [
      'Label containers, verify SDS access, correct storage/compatibility, improve ventilation/PPE, and document worker communication.',
    ],
    hierarchyNotes: [
      'Prefer substitution, closed transfer, ventilation, and isolation before relying on PPE alone.',
    ],
    verificationSuggestions: [
      'Photograph labels, containers, SDS access, storage condition, secondary containment, PPE, ventilation, and spill controls.',
    ],
    humanReviewTriggers: [
      'Unknown chemical identity, unlabeled container, or suspected acute/chronic health exposure requires review.',
    ],
  },
  {
    keys: ['respirable', 'silica', 'dust', 'fume', 'mist', 'gas', 'vapor', 'airborne', 'respiratory'],
    hazardObservations: [
      'Evaluate airborne contaminant source, task duration, frequency, ventilation, wet methods, enclosure, respiratory protection, and exposure monitoring history.',
    ],
    healthObservations: [
      'Consider acute irritation, chronic respiratory disease, sensitization, toxic exposure, oxygen displacement, and cumulative exposure.',
    ],
    exposurePathways: [
      'Worker inhalation exposure to dust, mist, fume, gas, vapor, aerosol, or oxygen-deficient atmosphere.',
    ],
    failureModes: [
      'No exposure assessment, poor ventilation, dry sweeping, ineffective wet method, inadequate respirator selection, no fit testing, or poor housekeeping.',
    ],
    evidenceQuestions: [
      'What contaminant may be present and what task generated it?',
      'Are exposure monitoring, ventilation, wet methods, housekeeping, and respiratory protection documented?',
    ],
    correctiveActionNotes: [
      'Control the source, improve ventilation or wet methods, conduct exposure assessment, verify respirator program elements, and document monitoring results.',
    ],
    hierarchyNotes: [
      'Prefer elimination, substitution, enclosure, local exhaust, wet methods, and process changes before respirators.',
    ],
    verificationSuggestions: [
      'Document task, material, visible emissions, ventilation, wet controls, housekeeping, respirator selection, fit testing, and exposure monitoring.',
    ],
    humanReviewTriggers: [
      'Unknown airborne exposure, visible dust/fume, or missing exposure assessment requires qualified health review.',
    ],
  },
  {
    keys: ['fire', 'hot work', 'welding', 'cutting', 'grinding', 'flammable', 'combustible', 'explosion'],
    hazardObservations: [
      'Evaluate ignition sources, combustibles, flammable liquids/vapors, hot work permit, fire watch, ventilation, gas testing, and emergency response.',
    ],
    exposurePathways: [
      'Worker exposure to fire, explosion, burns, smoke, welding fumes, oxygen displacement, or secondary ignition.',
    ],
    failureModes: [
      'No hot work permit, combustibles not removed, no fire watch, poor gas testing, inadequate ventilation, or poor cylinder/flame control.',
    ],
    evidenceQuestions: [
      'What ignition source is present and what combustibles or flammables are nearby?',
      'Is hot work authorized, monitored, ventilated, and controlled with fire watch and extinguishing equipment?',
    ],
    correctiveActionNotes: [
      'Remove or isolate combustibles, verify atmosphere, establish fire watch, improve ventilation, and document hot work authorization.',
    ],
    hierarchyNotes: [
      'Prefer eliminating hot work, relocating work, isolating combustibles, and engineering ventilation before administrative controls.',
    ],
    verificationSuggestions: [
      'Document permit, fire watch, extinguisher, combustible clearance, gas testing, ventilation, cylinder storage, and post-work inspection.',
    ],
    humanReviewTriggers: [
      'Hot work near combustibles, flammables, or unknown atmosphere requires qualified review.',
    ],
  },
  {
    keys: ['lockout', 'tagout', 'loto', 'hazardous energy', 'stored energy', 'de-energize'],
    hazardObservations: [
      'Evaluate hazardous energy sources, isolation points, stored energy, verification of zero energy, affected employees, and task scope.',
    ],
    exposurePathways: [
      'Worker exposure to unexpected startup, release of stored energy, movement, electrical energy, hydraulic/pneumatic pressure, gravity, or thermal energy.',
    ],
    failureModes: [
      'Incomplete isolation, no verification, missing lock/tag, unrecognized stored energy, poor group lockout, or task performed under production mode.',
    ],
    evidenceQuestions: [
      'What energy sources exist and how were they isolated, locked, tagged, relieved, blocked, and verified?',
      'Who performed the lockout and who verified zero energy?',
    ],
    correctiveActionNotes: [
      'Stop work until hazardous energy is isolated, locked/tagged, stored energy controlled, and zero energy verified.',
    ],
    hierarchyNotes: [
      'Prefer full de-energization, isolation, blocking, bleeding, and verification before procedural controls alone.',
    ],
    verificationSuggestions: [
      'Document isolation points, locks/tags, stored-energy controls, try/test verification, affected employees, and release authorization.',
    ],
    humanReviewTriggers: [
      'Unclear energy state or maintenance/cleanup near hazardous energy requires qualified review.',
    ],
  },
  {
    keys: ['ergonomic', 'ergonomics', 'lifting', 'strain', 'sprain', 'repetition', 'awkward posture'],
    hazardObservations: [
      'Evaluate force, repetition, posture, duration, reach, grip, vibration, load weight, frequency, and recovery time.',
    ],
    healthObservations: [
      'Consider musculoskeletal strain, cumulative trauma, fatigue, hand-arm vibration, and overexertion.',
    ],
    exposurePathways: [
      'Worker exposure to high force, repetitive motion, awkward posture, sustained exertion, vibration, or manual material handling.',
    ],
    failureModes: [
      'Poor task design, excessive weight, long reach, twisting, repetitive force, no mechanical aid, or insufficient staffing.',
    ],
    evidenceQuestions: [
      'What is the load, frequency, posture, duration, and recovery period?',
      'Can the task be redesigned, mechanically assisted, staged, or team-lifted?',
    ],
    correctiveActionNotes: [
      'Reduce force, improve work height/reach, add mechanical assistance, rotate tasks cautiously, and verify worker feedback.',
    ],
    hierarchyNotes: [
      'Prefer redesign, mechanical aids, lift assists, workstation changes, and material flow changes before training-only controls.',
    ],
    verificationSuggestions: [
      'Document task photos/video, load weight, frequency, posture, reach distance, mechanical aids, and worker feedback.',
    ],
  },
  {
    keys: ['heat', 'cold', 'temperature', 'thermal', 'heat stress', 'cold stress'],
    hazardObservations: [
      'Evaluate environmental conditions, workload, acclimatization, hydration, rest breaks, shade, clothing/PPE burden, and medical symptoms.',
    ],
    healthObservations: [
      'Consider heat exhaustion, heat stroke, dehydration, cold stress, hypothermia, frostbite, and fatigue-related error.',
    ],
    exposurePathways: [
      'Worker exposure to heat/cold stress through environmental temperature, radiant heat, workload, PPE burden, wind, moisture, or poor recovery.',
    ],
    failureModes: [
      'No acclimatization plan, poor hydration/rest access, inadequate supervision, symptoms ignored, or no emergency response plan.',
    ],
    evidenceQuestions: [
      'What are the environmental conditions, workload, duration, PPE/clothing, and acclimatization status?',
      'Are water, rest, shade/warm-up, symptom checks, and emergency response available?',
    ],
    correctiveActionNotes: [
      'Adjust work/rest cycles, provide hydration and recovery areas, monitor symptoms, train supervisors, and document emergency readiness.',
    ],
    hierarchyNotes: [
      'Prefer schedule changes, shade/cooling/warming, mechanization, reduced workload, and engineering controls before PPE-only controls.',
    ],
    verificationSuggestions: [
      'Document conditions, workload, break schedule, water/rest access, acclimatization, supervisor checks, and symptoms reported.',
    ],
    humanReviewTriggers: [
      'Symptoms of heat or cold illness require immediate escalation.',
    ],
  },
  {
    keys: ['ppe', 'personal protective', 'respirator', 'glove', 'eye protection', 'hearing protection'],
    hazardObservations: [
      'Evaluate whether PPE is appropriate for the hazard, properly selected, fitted, maintained, used, and supported by higher-level controls.',
    ],
    healthObservations: [
      'Consider residual exposure when PPE is the primary control for respiratory, noise, chemical, thermal, or impact hazards.',
    ],
    exposurePathways: [
      'Worker exposure due to absent, wrong, damaged, poorly fitted, contaminated, or improperly used PPE.',
    ],
    failureModes: [
      'Wrong PPE type, no hazard assessment, poor fit, no training, damaged PPE, no replacement schedule, or PPE used instead of feasible engineering controls.',
    ],
    evidenceQuestions: [
      'What hazard assessment supports the PPE selection?',
      'Is the PPE appropriate, available, fitted, maintained, and actually used for the task?',
    ],
    correctiveActionNotes: [
      'Verify hazard assessment, select task-specific PPE, train workers, replace damaged PPE, and document higher-level control evaluation.',
    ],
    hierarchyNotes: [
      'PPE is the last line of defense and should not replace feasible engineering or administrative controls.',
    ],
    verificationSuggestions: [
      'Document PPE type, condition, fit, training, hazard assessment, task exposure, and higher-level controls considered.',
    ],
  },
];

@Injectable()
export class SafeScopeExpertObservationService {
  public generateExpertObservations(
    input: ExpertObservationInput,
  ): ExpertObservationOutput {
    const classification = input.classification || 'Unclassified';
    const normalizedClassification = classification.toLowerCase();

    const knowledgeMatches = Array.isArray(input.knowledgeMatches)
      ? input.knowledgeMatches
      : [];

    const relatedHazardObservations: string[] = [];
    const relatedHealthObservations: string[] = [];
    const likelyExposurePathways: string[] = [];
    const likelyFailureModes: string[] = [];
    const missingEvidenceQuestions: string[] = [];
    const correctiveActionQualityNotes: string[] = [];
    const hierarchyOfControlsFeedback: string[] = [];
    const verificationEvidenceSuggestions: string[] = [];
    const relatedStandardsCautions: string[] = [];
    const confidenceCautions: string[] = [];
    const humanReviewTriggers: string[] = [];

    for (const match of knowledgeMatches as SafeScopeKnowledgeMatch[]) {
      const type = String(match.knowledgeType || match.type || '').toLowerCase();
      const title =
        match.title || match.summary || match.citation || 'approved knowledge signal';

      if (type === 'hazard_mechanism') {
        relatedHazardObservations.push(`Related hazard mechanism: ${title}`);
      }

      if (type === 'health_exposure') {
        relatedHealthObservations.push(`Related health exposure consideration: ${title}`);
      }

      if (Array.isArray(match.evidenceQuestions)) {
        missingEvidenceQuestions.push(...match.evidenceQuestions);
      }

      if (Array.isArray(match.verificationRequirements)) {
        verificationEvidenceSuggestions.push(...match.verificationRequirements);
      }

      if (Array.isArray(match.correctiveActionPatterns)) {
        correctiveActionQualityNotes.push(...match.correctiveActionPatterns);
      }

      if (Array.isArray(match.healthExposureNotes)) {
        relatedHealthObservations.push(...match.healthExposureNotes);
      }

      if (Array.isArray(match.observationPatterns)) {
        relatedHazardObservations.push(...match.observationPatterns);
      }

      if (match.citation && match.reviewStatus !== 'approved') {
        relatedStandardsCautions.push(
          `${match.citation} should be reviewed before being treated as a supported compliance reference.`,
        );
      }
    }

    const matchedDomains = EXPERT_DOMAINS.filter((domain) =>
      domain.keys.some((key) => normalizedClassification.includes(key)),
    );

    for (const domain of matchedDomains) {
      relatedHazardObservations.push(...domain.hazardObservations);
      relatedHealthObservations.push(...(domain.healthObservations || []));
      likelyExposurePathways.push(...domain.exposurePathways);
      likelyFailureModes.push(...domain.failureModes);
      missingEvidenceQuestions.push(...domain.evidenceQuestions);
      correctiveActionQualityNotes.push(...domain.correctiveActionNotes);
      hierarchyOfControlsFeedback.push(...domain.hierarchyNotes);
      verificationEvidenceSuggestions.push(...domain.verificationSuggestions);
      humanReviewTriggers.push(...(domain.humanReviewTriggers || []));
    }

    if (!matchedDomains.length) {
      relatedHazardObservations.push(
        'Evaluate the hazard mechanism, worker exposure, energy or exposure pathway, existing controls, task context, and foreseeable failure modes.',
      );
      likelyExposurePathways.push(
        'Worker exposure may occur through contact, struck-by, caught-in/between, fall, inhalation, ingestion, absorption, injection, thermal exposure, or energy release.',
      );
      likelyFailureModes.push(
        'Potential failure modes include missing controls, ineffective controls, poor supervision, inadequate training, poor maintenance, uncontrolled energy, or incomplete verification.',
      );
      missingEvidenceQuestions.push(
        'What task was being performed, who was exposed, what controls were present, and what evidence confirms the condition?',
      );
      correctiveActionQualityNotes.push(
        'Corrective actions should address the hazard source, exposure pathway, responsible role, due date, and closure verification.',
      );
      hierarchyOfControlsFeedback.push(
        'Apply the hierarchy of controls before relying on administrative controls or PPE alone.',
      );
      verificationEvidenceSuggestions.push(
        'Capture photos, task context, exposure details, control condition, responsible person, and closure evidence.',
      );
    }

    const missingInputs = Array.isArray(input.evidenceContract?.missingInputs)
      ? input.evidenceContract.missingInputs
      : [];

    for (const missing of missingInputs) {
      missingEvidenceQuestions.push(`Clarify missing evidence: ${missing}`);
    }

    if (!input.evidenceContract || Object.keys(input.evidenceContract).length === 0) {
      missingEvidenceQuestions.push(
        'Evidence contract is missing or empty. Capture worker exposure, task, equipment/material state, controls present, and verification evidence.',
      );
      confidenceCautions.push(
        'SafeScope confidence should be limited until structured evidence is available.',
      );
      humanReviewTriggers.push('Structured evidence is incomplete.');
    }

    if (!input.suggestedStandards?.length) {
      relatedStandardsCautions.push(
        'No standards candidate was available. Do not make a compliance claim without an approved source.',
      );
      humanReviewTriggers.push('No supported standards candidate available.');
    }

    correctiveActionQualityNotes.push(
      'Corrective actions should control the exposure, identify the responsible role, include a due date, and require verification evidence.',
    );

    hierarchyOfControlsFeedback.push(
      'Prefer elimination, substitution, engineering controls, isolation, and process redesign before relying on administrative controls or PPE alone.',
    );

    verificationEvidenceSuggestions.push(
      'Document before/after photos, responsible person, completion date, supervisor verification, and any remaining exposure.',
    );

    if (input.learningGovernance?.prohibitedInfluence?.length) {
      confidenceCautions.push(
        'Learning signals are governance-limited and cannot override standards, citations, high-risk flags, or human review.',
      );
    }

    if (input.learningMemory?.canReduceHumanReview === false) {
      humanReviewTriggers.push(
        'Learning memory cannot reduce required human review.',
      );
    }

    return {
      engine: 'safescope_expert_observations',
      mode: 'deterministic_offline',
      classification,
      relatedHazardObservations: Array.from(new Set(relatedHazardObservations)),
      relatedHealthObservations: Array.from(new Set(relatedHealthObservations)),
      likelyExposurePathways: Array.from(new Set(likelyExposurePathways)),
      likelyFailureModes: Array.from(new Set(likelyFailureModes)),
      missingEvidenceQuestions: Array.from(new Set(missingEvidenceQuestions)),
      correctiveActionQualityNotes: Array.from(new Set(correctiveActionQualityNotes)),
      hierarchyOfControlsFeedback: Array.from(new Set(hierarchyOfControlsFeedback)),
      verificationEvidenceSuggestions: Array.from(new Set(verificationEvidenceSuggestions)),
      relatedStandardsCautions: Array.from(new Set(relatedStandardsCautions)),
      confidenceCautions: Array.from(new Set(confidenceCautions)),
      humanReviewTriggers: Array.from(new Set(humanReviewTriggers)),
      sourceBoundary:
        'SafeScope expert observations are deterministic native decision support. They may improve questions, observations, and corrective-action quality, but they cannot invent citations, override standards, or replace qualified review.',
      canInventCitations: false,
      canOverrideStandards: false,
      canReduceHumanReview: false,
    };
  }
}
