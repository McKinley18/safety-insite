import { Injectable } from '@nestjs/common';
import {
  EvidenceSufficiencyInput,
  EvidenceSufficiencyOutput,
  SafeScopeEvidenceConfidenceImpact,
} from './evidence-sufficiency.types';

function unique(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => String(item || '').trim())
        .filter(Boolean),
    ),
  );
}

function includesAny(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

@Injectable()
export class SafeScopeEvidenceSufficiencyService {
  evaluate(input: EvidenceSufficiencyInput): EvidenceSufficiencyOutput {
    const classification = input.classification || 'Unclassified';
    const observationText = input.observationText || '';
    const evidenceTexts = Array.isArray(input.evidenceTexts)
      ? input.evidenceTexts
      : [];
    const suggestedStandards = Array.isArray(input.suggestedStandards)
      ? input.suggestedStandards
      : [];

    const combinedEvidence = [observationText, ...evidenceTexts]
      .join(' ')
      .toLowerCase();

    const missingCriticalEvidence: string[] = [];
    const recommendedEvidenceToCapture: string[] = [];
    const evidenceStrengths: string[] = [];
    const evidenceWeaknesses: string[] = [];
    const requiredHumanReviewReasons: string[] = [];

    const evidenceContractMissing = Array.isArray(
      input.aiEvidenceContract?.missingInputs,
    )
      ? input.aiEvidenceContract.missingInputs
      : [];

    for (const missing of evidenceContractMissing) {
      missingCriticalEvidence.push(`Clarify missing evidence: ${missing}`);
    }

    const contractReviewTriggers = Array.isArray(
      input.aiEvidenceContract?.reviewTriggers,
    )
      ? input.aiEvidenceContract.reviewTriggers
      : [];

    requiredHumanReviewReasons.push(...contractReviewTriggers);

    if (!observationText.trim()) {
      missingCriticalEvidence.push('Hazard observation text is missing.');
      evidenceWeaknesses.push('No narrative observation was provided.');
    } else {
      evidenceStrengths.push('Narrative observation text is available.');
    }

    if (!evidenceTexts.length) {
      evidenceWeaknesses.push(
        'No supporting evidence text, photo notes, measurements, or field details were provided.',
      );
      recommendedEvidenceToCapture.push(
        'Add photos, measurements, witness/task notes, equipment/material state, and control-condition evidence.',
      );
    } else {
      evidenceStrengths.push('Supporting evidence text is available.');
    }

    if (!suggestedStandards.length) {
      missingCriticalEvidence.push(
        'No standards candidate is available to support regulatory applicability.',
      );
      requiredHumanReviewReasons.push(
        'Standards applicability cannot be finalized without a supported candidate source.',
      );
    } else {
      evidenceStrengths.push('At least one standards candidate is available.');
    }

    if (
      input.risk?.riskBand === 'High' ||
      input.risk?.riskBand === 'Critical' ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential
    ) {
      requiredHumanReviewReasons.push(
        'High-consequence risk indicators require qualified human review.',
      );
    }

    if (input.mechanismIntelligence?.requiresQualifiedReview) {
      requiredHumanReviewReasons.push(
        'Mechanism intelligence indicates qualified review is required.',
      );
    }

    if (input.exposureIntelligence?.requiresIndustrialHygieneReview) {
      requiredHumanReviewReasons.push(
        'Exposure intelligence indicates industrial hygiene review is required.',
      );
    }

    if (Array.isArray(input.expertObservations?.humanReviewTriggers)) {
      requiredHumanReviewReasons.push(
        ...input.expertObservations.humanReviewTriggers,
      );
    }

    this.addDomainSpecificEvidenceNeeds({
      classification,
      combinedEvidence,
      missingCriticalEvidence,
      recommendedEvidenceToCapture,
      evidenceWeaknesses,
      requiredHumanReviewReasons,
    });

    const criticalCount = unique(missingCriticalEvidence).length;
    const reviewCount = unique(requiredHumanReviewReasons).length;

    const sufficientForHazardRecognition =
      Boolean(observationText.trim()) || evidenceTexts.length > 0;

    const sufficientForStandardsRecommendation =
      sufficientForHazardRecognition &&
      suggestedStandards.length > 0 &&
      criticalCount <= 2;

    const sufficientForCorrectiveAction =
      sufficientForHazardRecognition && criticalCount <= 3;

    const sufficientForClosure =
      sufficientForStandardsRecommendation &&
      sufficientForCorrectiveAction &&
      criticalCount === 0 &&
      reviewCount === 0 &&
      !input.exposureIntelligence?.requiresIndustrialHygieneReview;

    const confidenceImpact = this.getConfidenceImpact(
      criticalCount,
      reviewCount,
      evidenceTexts.length,
    );

    if (!sufficientForClosure) {
      evidenceWeaknesses.push(
        'Evidence is not sufficient for unattended closure or final compliance determination.',
      );
    }

    return {
      engine: 'safescope_evidence_sufficiency',
      mode: 'deterministic_offline',
      classification,

      sufficientForHazardRecognition,
      sufficientForStandardsRecommendation,
      sufficientForCorrectiveAction,
      sufficientForClosure,

      missingCriticalEvidence: unique(missingCriticalEvidence),
      recommendedEvidenceToCapture: unique(recommendedEvidenceToCapture),
      evidenceStrengths: unique(evidenceStrengths),
      evidenceWeaknesses: unique(evidenceWeaknesses),

      requiredHumanReviewReasons: unique(requiredHumanReviewReasons),
      confidenceImpact,

      canInventEvidence: false,
      canFinalizeWithoutEvidence: false,
      canReduceHumanReview: false,

      sourceBoundary:
        'SafeScope evidence sufficiency intelligence evaluates whether available field evidence supports hazard recognition, standards recommendation, corrective action, and closure. It cannot invent evidence, replace measurements, reduce required review, or finalize compliance decisions without adequate support.',
    };
  }

  private addDomainSpecificEvidenceNeeds(input: {
    classification: string;
    combinedEvidence: string;
    missingCriticalEvidence: string[];
    recommendedEvidenceToCapture: string[];
    evidenceWeaknesses: string[];
    requiredHumanReviewReasons: string[];
  }) {
    const classification = input.classification.toLowerCase();

    if (
      includesAny(classification, [
        'machine',
        'guarding',
        'conveyor',
        'rotating',
        'pinch',
        'nip',
      ])
    ) {
      this.requireEvidence(input, [
        {
          terms: ['running', 'operating', 'stopped', 'shutdown', 'locked', 'tagged', 'de-energized'],
          missing: 'Equipment operating/energy state is not documented.',
          capture:
            'Document whether equipment was operating, stopped, de-energized, locked/tagged, blocked, or otherwise controlled.',
        },
        {
          terms: ['access', 'reach', 'contact', 'exposed', 'employee', 'worker'],
          missing: 'Worker access to the hazard zone is not documented.',
          capture:
            'Photograph and describe whether workers can reach or contact the moving part during operation, cleanup, adjustment, or maintenance.',
        },
        {
          terms: ['guard', 'cover', 'barrier', 'interlock'],
          missing: 'Guard/barrier/interlock condition is not documented.',
          capture:
            'Capture guard coverage, opening size, bypass evidence, interlock condition, and point-of-operation access.',
        },
      ]);
    }

    if (
      includesAny(classification, [
        'electrical',
        'energized',
        'panel',
        'conductor',
        'arc',
      ])
    ) {
      this.requireEvidence(input, [
        {
          terms: ['energized', 'de-energized', 'voltage', 'verified', 'tested'],
          missing: 'Electrical energy state or voltage verification is not documented.',
          capture:
            'Document energized/de-energized state, voltage indicators, testing/verification, and qualified-person controls.',
        },
        {
          terms: ['cover', 'panel', 'enclosure', 'door', 'guard'],
          missing: 'Electrical enclosure or cover condition is not documented.',
          capture:
            'Photograph covers, doors, openings, exposed conductors, labeling, disconnects, and access restrictions.',
        },
      ]);
    }

    if (
      includesAny(classification, [
        'fall',
        'ladder',
        'scaffold',
        'roof',
        'edge',
        'opening',
      ])
    ) {
      this.requireEvidence(input, [
        {
          terms: ['height', 'feet', 'ft', 'elevated', 'distance'],
          missing: 'Fall height/distance is not documented.',
          capture:
            'Document working height, fall distance, surface below, and nearby impalement or struck-by hazards.',
        },
        {
          terms: ['guardrail', 'tie-off', 'anchor', 'harness', 'cover', 'platform'],
          missing: 'Fall prevention/arrest control condition is not documented.',
          capture:
            'Photograph guardrails, covers, tie-off method, anchor point, ladder/scaffold condition, and rescue considerations.',
        },
      ]);
    }

    if (
      includesAny(classification, [
        'confined',
        'permit space',
        'atmosphere',
        'oxygen',
        'entrant',
      ])
    ) {
      this.requireEvidence(input, [
        {
          terms: ['oxygen', 'lel', 'flammable', 'toxic', 'monitor', 'reading'],
          missing: 'Atmospheric testing results are not documented.',
          capture:
            'Document oxygen, flammable gas/vapor, toxic readings, monitor calibration, timing, and continuous monitoring status.',
        },
        {
          terms: ['permit', 'attendant', 'rescue', 'entrant', 'ventilation', 'isolation'],
          missing: 'Permit entry controls, attendant, rescue, ventilation, or isolation evidence is incomplete.',
          capture:
            'Capture permit, entrant roster, attendant, isolation points, ventilation setup, and rescue plan.',
        },
      ]);
      input.requiredHumanReviewReasons.push(
        'Confined space evidence requires qualified review before final determination.',
      );
    }

    if (
      includesAny(classification, [
        'chemical',
        'hazcom',
        'silica',
        'dust',
        'fume',
        'noise',
        'respirable',
        'exposure',
      ])
    ) {
      this.requireEvidence(input, [
        {
          terms: ['sample', 'sampling', 'monitor', 'measurement', 'ppm', 'mg/m3', 'db', 'dose', 'twa'],
          missing: 'Quantitative exposure measurement or sampling basis is not documented.',
          capture:
            'Document contaminant/agent, sampling method, sample type, concentration, duration, shift length, controls, PPE, and applicable exposure limit source.',
        },
      ]);
      input.requiredHumanReviewReasons.push(
        'Health/exposure assessment requires qualified industrial hygiene or competent review.',
      );
    }

    if (
      includesAny(classification, [
        'mobile equipment',
        'powered haulage',
        'traffic',
        'forklift',
        'haul truck',
      ])
    ) {
      this.requireEvidence(input, [
        {
          terms: ['pedestrian', 'route', 'traffic', 'blind', 'berm', 'spotter', 'alarm', 'visibility'],
          missing: 'Mobile equipment traffic interaction controls are not documented.',
          capture:
            'Document pedestrian routes, traffic pattern, blind spots, alarms/lights, berms, spotter controls, visibility, and ground conditions.',
        },
      ]);
    }
  }

  private requireEvidence(
    input: {
      combinedEvidence: string;
      missingCriticalEvidence: string[];
      recommendedEvidenceToCapture: string[];
      evidenceWeaknesses: string[];
    },
    requirements: Array<{ terms: string[]; missing: string; capture: string }>,
  ) {
    for (const requirement of requirements) {
      if (!includesAny(input.combinedEvidence, requirement.terms)) {
        input.missingCriticalEvidence.push(requirement.missing);
        input.recommendedEvidenceToCapture.push(requirement.capture);
        input.evidenceWeaknesses.push(requirement.missing);
      }
    }
  }

  private getConfidenceImpact(
    criticalCount: number,
    reviewCount: number,
    evidenceTextCount: number,
  ): SafeScopeEvidenceConfidenceImpact {
    if (criticalCount >= 4 || reviewCount >= 4) return 'high';
    if (criticalCount >= 2 || reviewCount >= 2) return 'medium';
    if (criticalCount >= 1 || evidenceTextCount === 0) return 'low';
    return 'none';
  }
}
