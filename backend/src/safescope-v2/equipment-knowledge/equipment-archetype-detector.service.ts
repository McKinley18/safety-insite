import {
  SafeScopeEquipmentArchetypeId,
  SafeScopeEquipmentArchetypeRecord,
} from './equipment-archetype.types';
import { SAFESCOPE_EQUIPMENT_ARCHETYPE_REGISTRY } from './equipment-archetype.registry';
import {
  SafeScopeHarmMechanism,
  SafeScopeTaskContext,
} from './equipment-task-mechanism.types';
import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeEquipmentArchetypeDetectionInput = {
  description: string;
  taskContext?: SafeScopeTaskContext;
};

export type SafeScopeEquipmentArchetypeDetectionMatch = {
  archetypeId: SafeScopeEquipmentArchetypeId;
  label: string;
  description: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  matchedTerms: string[];
  matchedSignals: string[];
  exampleEquipment: string[];
  commonComponentClasses: string[];
  commonTasks: SafeScopeTaskContext[];
  harmMechanisms: SafeScopeHarmMechanism[];
  likelyHazardDomains: SafeScopeReasoningDomain[];
  evidenceQuestions: string[];
  immediateCautions: string[];
  correctiveActionThemes: string[];
  verificationEvidence: string[];
  specificRecordHandoffHints: string[];
  guardrails: SafeScopeEquipmentArchetypeRecord['guardrails'];
};

export type SafeScopeEquipmentArchetypeDetectionResult = {
  matched: boolean;
  reasoningMode: 'archetype_fallback_context' | 'no_archetype_context';
  primaryMatch?: SafeScopeEquipmentArchetypeDetectionMatch;
  matches: SafeScopeEquipmentArchetypeDetectionMatch[];
  evidenceGaps: string[];
  cautions: string[];
  detectorNotes: string[];
};

type ScoredArchetypeCandidate = {
  record: SafeScopeEquipmentArchetypeRecord;
  score: number;
  matchedTerms: Set<string>;
  matchedSignals: Set<string>;
};

const CONFIDENCE_THRESHOLDS = {
  high: 30,
  medium: 18,
  low: 10,
};

export class SafeScopeEquipmentArchetypeDetectorService {
  detect(input: SafeScopeEquipmentArchetypeDetectionInput): SafeScopeEquipmentArchetypeDetectionResult {
    const description = normalizeText(input.description);

    if (!description) {
      return {
        matched: false,
        reasoningMode: 'no_archetype_context',
        matches: [],
        evidenceGaps: ['No observation text was provided for equipment archetype reasoning.'],
        cautions: ['SafeScope cannot infer an equipment archetype without observation details.'],
        detectorNotes: ['Equipment archetype detector skipped because description was empty.'],
      };
    }

    const matches = SAFESCOPE_EQUIPMENT_ARCHETYPE_REGISTRY.records
      .map((record) => this.scoreRecord(record, description, input.taskContext))
      .filter((candidate) => candidate.score >= CONFIDENCE_THRESHOLDS.low)
      .sort((a, b) => b.score - a.score || a.record.archetypeId.localeCompare(b.record.archetypeId))
      .slice(0, 5)
      .map((candidate) => this.toMatch(candidate));

    const primaryMatch = matches[0];

    return {
      matched: Boolean(primaryMatch),
      reasoningMode: primaryMatch ? 'archetype_fallback_context' : 'no_archetype_context',
      primaryMatch,
      matches,
      evidenceGaps: primaryMatch
        ? primaryMatch.evidenceQuestions.slice(0, 5)
        : [
            'Identify the equipment or equipment class involved.',
            'Identify the component, energy source, movement, load, access point, or work area involved.',
            'Clarify the task being performed and whether employees were exposed.',
            'Clarify whether energy, movement, elevation, traffic, collapse, electrical, or material-release hazards were controlled.',
          ],
      cautions: primaryMatch
        ? primaryMatch.immediateCautions
        : [
            'Do not infer a violation or final classification from unclear equipment context.',
            'Use archetype reasoning only as a context aid until a qualified person confirms the equipment, task, exposure, and applicable standard.',
          ],
      detectorNotes: [
        'Archetype detection is generalized equipment reasoning and is context-only.',
        'It is designed to support fallback reasoning when a specific equipment/task-mechanism record is unavailable or incomplete.',
        'It does not create citations, declare violations, or override qualified regulatory review.',
      ],
    };
  }

  private scoreRecord(
    record: SafeScopeEquipmentArchetypeRecord,
    description: string,
    taskContext: SafeScopeTaskContext | undefined,
  ): ScoredArchetypeCandidate {
    const candidate: ScoredArchetypeCandidate = {
      record,
      score: 0,
      matchedTerms: new Set<string>(),
      matchedSignals: new Set<string>(),
    };

    for (const signal of record.detectionSignals.strong) {
      if (containsTerm(description, signal)) {
        candidate.score += 12;
        candidate.matchedTerms.add(normalizeText(signal));
        candidate.matchedSignals.add('strong_archetype_signal');
      }
    }

    for (const signal of record.detectionSignals.medium) {
      if (containsTerm(description, signal)) {
        candidate.score += 7;
        candidate.matchedTerms.add(normalizeText(signal));
        candidate.matchedSignals.add('medium_archetype_signal');
      }
    }

    for (const signal of record.detectionSignals.weak) {
      if (containsTerm(description, signal)) {
        candidate.score += 3;
        candidate.matchedTerms.add(normalizeText(signal));
        candidate.matchedSignals.add('weak_archetype_signal');
      }
    }

    for (const equipment of record.exampleEquipment) {
      if (containsTerm(description, equipment)) {
        candidate.score += 5;
        candidate.matchedTerms.add(normalizeText(equipment));
        candidate.matchedSignals.add('example_equipment_signal');
      }
    }

    for (const componentClass of record.commonComponentClasses) {
      if (containsTerm(description, componentClass)) {
        candidate.score += 5;
        candidate.matchedTerms.add(normalizeText(componentClass));
        candidate.matchedSignals.add('component_class_signal');
      }
    }

    for (const mechanism of record.harmMechanisms) {
      const mechanismTerm = mechanism.replace(/_/g, ' ');
      if (containsTerm(description, mechanismTerm)) {
        candidate.score += 4;
        candidate.matchedTerms.add(mechanismTerm);
        candidate.matchedSignals.add('harm_mechanism_signal');
      }
    }

    if (taskContext && record.commonTasks.includes(taskContext)) {
      candidate.score += 4;
      candidate.matchedTerms.add(taskContext);
      candidate.matchedSignals.add('task_context_signal');
    }

    return candidate;
  }

  private toMatch(candidate: ScoredArchetypeCandidate): SafeScopeEquipmentArchetypeDetectionMatch {
    return {
      archetypeId: candidate.record.archetypeId,
      label: candidate.record.label,
      description: candidate.record.description,
      score: candidate.score,
      confidence: confidenceForScore(candidate.score),
      matchedTerms: Array.from(candidate.matchedTerms).sort(),
      matchedSignals: Array.from(candidate.matchedSignals).sort(),
      exampleEquipment: candidate.record.exampleEquipment,
      commonComponentClasses: candidate.record.commonComponentClasses,
      commonTasks: candidate.record.commonTasks,
      harmMechanisms: candidate.record.harmMechanisms,
      likelyHazardDomains: candidate.record.likelyHazardDomains,
      evidenceQuestions: candidate.record.evidenceQuestions,
      immediateCautions: candidate.record.immediateCautions,
      correctiveActionThemes: candidate.record.correctiveActionThemes,
      verificationEvidence: candidate.record.verificationEvidence,
      specificRecordHandoffHints: candidate.record.specificRecordHandoffHints,
      guardrails: candidate.record.guardrails,
    };
  }
}

function confidenceForScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= CONFIDENCE_THRESHOLDS.high) {
    return 'high';
  }

  if (score >= CONFIDENCE_THRESHOLDS.medium) {
    return 'medium';
  }

  return 'low';
}

function containsTerm(text: string, rawTerm: string): boolean {
  const term = normalizeText(rawTerm);

  if (!term) {
    return false;
  }

  return text.includes(term);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_/-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
