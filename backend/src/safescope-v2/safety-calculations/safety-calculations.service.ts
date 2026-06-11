import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

export interface SafetyCalculationResult {
  engine: 'safescope_safety_calculations_v1';
  hasCalculations: boolean;
  insights: string[];
  measurementsExtracted: Record<string, string>;
  warnings: string[];
}

@Injectable()
export class SafeScopeSafetyCalculationsService {
  public analyze(observation: string): SafetyCalculationResult {
    const normalized = String(observation || '').toLowerCase();
    const insights: string[] = [];
    const warnings: string[] = [];
    const measurementsExtracted: Record<string, string> = {};
    let hasCalculations = false;

    // 1. Fall Clearance Calculation
    // Looks for: X feet lanyard, Y feet anchor, Z feet edge
    const fallHeightMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft|foot)\s*(?:fall|edge|high|drop|elevation)/);
    const lanyardMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft|foot)\s*(?:lanyard)/);
    
    if (lanyardMatch) {
      const lanyardLength = parseFloat(lanyardMatch[1]);
      const decelerationDistance = 3.5; // OSHA max
      const dRingShift = 1.0;
      const safetyFactor = 2.0;
      const workerHeight = 6.0; // average
      const totalClearanceRequired = lanyardLength + decelerationDistance + dRingShift + safetyFactor + workerHeight;
      
      measurementsExtracted['lanyard_length'] = `${lanyardLength} ft`;
      insights.push(`Calculated required fall clearance: ${totalClearanceRequired} ft (Lanyard: ${lanyardLength}ft + Deceleration: 3.5ft + D-Ring: 1ft + Safety Factor: 2ft + Worker: 6ft).`);
      hasCalculations = true;

      if (fallHeightMatch) {
        const fallHeight = parseFloat(fallHeightMatch[1]);
        measurementsExtracted['fall_height'] = `${fallHeight} ft`;
        if (fallHeight < totalClearanceRequired) {
          warnings.push(`DANGER: Available fall height (${fallHeight} ft) is LESS than the required clearance (${totalClearanceRequired} ft). Worker will strike the lower level.`);
        }
      }
    }

    // 2. Noise Exposure (dBA)
    const noiseMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:dba|decibel|db)/);
    if (noiseMatch) {
      const noiseLevel = parseFloat(noiseMatch[1]);
      measurementsExtracted['noise_level'] = `${noiseLevel} dBA`;
      hasCalculations = true;
      
      if (noiseLevel >= 90) {
        warnings.push(`Noise level (${noiseLevel} dBA) exceeds OSHA Permissible Exposure Limit (PEL) of 90 dBA. Feasible administrative or engineering controls are required.`);
      } else if (noiseLevel >= 85) {
        insights.push(`Noise level (${noiseLevel} dBA) meets the OSHA Action Level of 85 dBA. A Hearing Conservation Program (HCP) is required.`);
      } else {
        insights.push(`Noise level (${noiseLevel} dBA) is below the OSHA Action Level.`);
      }
    }

    // 3. Heat Stress (Temperature / WBGT)
    const tempMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:degrees|deg|f|fahrenheit)/);
    if (tempMatch) {
      const tempLevel = parseFloat(tempMatch[1]);
      measurementsExtracted['temperature'] = `${tempLevel} F`;
      hasCalculations = true;

      if (tempLevel >= 90) {
        warnings.push(`Temperature (${tempLevel}°F) is highly dangerous. Implement aggressive work/rest cycles, acclimatization, and provide shaded cooling areas.`);
      } else if (tempLevel >= 80) {
        insights.push(`Temperature (${tempLevel}°F) triggers heat stress precautions. Monitor workers, ensure hydration, and consider work/rest cycles.`);
      }
    }

    // 4. Trench Sloping / Excavation
    const trenchDepthMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft|foot)\s*(?:deep|trench|excavation)/);
    if (trenchDepthMatch) {
      const depth = parseFloat(trenchDepthMatch[1]);
      measurementsExtracted['trench_depth'] = `${depth} ft`;
      
      if (depth >= 5) {
        hasCalculations = true;
        warnings.push(`Trench depth (${depth} ft) requires a protective system (sloping, shoring, or shielding) unless made entirely of stable rock.`);
        insights.push(`For Type C soil (most conservative), a ${depth} ft trench requires sloping at 1.5:1, meaning the trench must be ${depth * 1.5} ft wide on each side at the top.`);
      }
    }

    return {
      engine: 'safescope_safety_calculations_v1',
      hasCalculations,
      insights,
      measurementsExtracted,
      warnings
    };
  }
}
