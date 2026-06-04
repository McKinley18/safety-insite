import { Injectable } from '@nestjs/common';

export type EvidenceFusionResult = {
  combinedNarrative: string;
  inferredThemes: string[];
  signalDensity: number;
  reasoning: string[];
};

@Injectable()
export class EvidenceFusionService {
  synthesize(inputs: string[]): EvidenceFusionResult {
    const normalized = inputs
      .filter(Boolean)
      .map((x) => x.toLowerCase().trim())
      .filter(Boolean);

    const combinedNarrative = normalized.join(' | ');
    const inferredThemes: string[] = [];
    const reasoning: string[] = [];

    const has = (term: string) => normalized.some((x) => x.includes(term));

    if (has('forklift') && (has('walkway') || has('pedestrian'))) {
      inferredThemes.push('pedestrian mobile-equipment interaction');
      reasoning.push('Forklift and pedestrian/travelway signals were detected together.');
    }

    if (has('blind corner') || has('obstructed') || has('blocked view')) {
      inferredThemes.push('visibility restriction');
      reasoning.push('Visibility restriction signals were detected.');
    }

    if ((has('live wire') || has('electrical') || has('cord')) && has('walkway')) {
      inferredThemes.push('electrical exposure along travel path');
      reasoning.push('Electrical hazard and pedestrian travel path signals were detected together.');
    }

    if ((has('oil') || has('spill')) && (has('walkway') || has('aisle'))) {
      inferredThemes.push('walking-working surface contamination');
      reasoning.push('Spill/contamination and travel path signals were detected together.');
    }

    if ((has('edge') || has('guardrail')) && (has('forklift') || has('vehicle'))) {
      inferredThemes.push('mobile equipment near fall exposure');
      reasoning.push('Mobile equipment and fall exposure signals were detected together.');
    }

    return {
      combinedNarrative,
      inferredThemes: [...new Set(inferredThemes)],
      signalDensity: normalized.length,
      reasoning,
    };
  }
}
