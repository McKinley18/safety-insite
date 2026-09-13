import { Injectable } from '@nestjs/common';

export interface MultidisciplinaryExpertInput {
  classification: string;
  observationText: string;
  causalRiskReasoning?: any;
  exposurePathIntelligence?: any;
  siteMemory?: any;
}

export interface ExpertSynthesisResult {
  safetyAndHealth: {
    hopFactors: string[];
    systemicRootCauses: string[];
    expertAdvisory: string;
  };
  laborLawyer: {
    defensibilityStrategy: string;
    precedentCaseLawRefs: string[];
    penaltyExposureRisk: string;
  };
  industrialHygiene: {
    pelStelTwaConcerns: string[];
    noiseDustSilicaRisks: string[];
    healthAdvisory: string;
  };
  environmental: {
    epaComplianceConcerns: string[];
    spccRcraApplicability: string;
  };
  executiveSummary: string;
}

@Injectable()
export class MultidisciplinaryExpertService {
  evaluate(input: MultidisciplinaryExpertInput): ExpertSynthesisResult {
    const textLower = (input.observationText || '').toLowerCase();
    const classLower = (input.classification || '').toLowerCase();

    // 1. Safety & Health Expert (Root Cause & HOP)
    const hopFactors: string[] = [];
    const systemicRootCauses: string[] = [];
    let shAdvisory = 'Standard corrective actions apply.';

    if (textLower.includes('removed') || textLower.includes('bypassed') || classLower.includes('guard')) {
      hopFactors.push('Production pressure may be overriding safe work procedures.');
      systemicRootCauses.push('Deviation in equipment maintenance or operational workflow design.');
      shAdvisory = 'Do not just replace the guard. Analyze WHY the operator felt the need to bypass the control to perform their task.';
    }

    if (input.siteMemory?.recurringRiskDetected) {
      systemicRootCauses.push('Sustained breakdown in administrative supervision and enforcement.');
      hopFactors.push('Normalization of deviance: Unsafe conditions have become the accepted baseline.');
    }

    // 2. Labor Lawyer (Case Law & Penalty Defense)
    const precedentCaseLawRefs: string[] = [];
    let defensibilityStrategy = 'Routine violation defense. Document immediate abatement.';
    let penaltyExposureRisk = 'moderate';

    if (classLower.includes('fall') || classLower.includes('lockout') || classLower.includes('guard')) {
      penaltyExposureRisk = 'high';
      defensibilityStrategy = 'Acknowledge hazard but document "Unpreventable Employee Misconduct" if training records and enforcement are pristine. Prepare for Serious or Willful classification.';
      if (classLower.includes('lockout')) precedentCaseLawRefs.push('Secretary of Labor v. General Motors Corp (LOTO Precedent)');
      if (classLower.includes('fall')) precedentCaseLawRefs.push('Secretary of Labor v. L.R. Willson and Sons (Fall Protection Burden of Proof)');
    }

    if (input.siteMemory?.recurringRiskDetected) {
      penaltyExposureRisk = 'critical_repeat_willful';
      defensibilityStrategy = 'High risk of Repeat/Willful citation. Legal counsel should prepare abatement verification logs immediately to mitigate multiplier penalties.';
    }

    // 3. Industrial Hygiene (Exposure & Health)
    const pelStelTwaConcerns: string[] = [];
    const noiseDustSilicaRisks: string[] = [];
    let ihAdvisory = 'No immediate acute IH sampling required.';

    if (textLower.includes('dust') || textLower.includes('silica') || textLower.includes('dry') || textLower.includes('sweep')) {
      noiseDustSilicaRisks.push('Respirable Crystalline Silica (RCS) exposure potential.');
      pelStelTwaConcerns.push('8-hour TWA PEL for Silica is 50 µg/m3.');
      ihAdvisory = 'Initiate objective air sampling or implement OSHA Table 1 engineered wet-methods. Cease dry sweeping immediately.';
    }

    if (textLower.includes('noise') || textLower.includes('loud') || classLower.includes('hearing')) {
      noiseDustSilicaRisks.push('Occupational Noise Exposure exceeding 85 dBA Action Level.');
      ihAdvisory = 'Conduct personal noise dosimetry. Verify enrollment in Hearing Conservation Program.';
    }

    if (classLower.includes('chemical') || textLower.includes('fumes') || textLower.includes('vapor')) {
      pelStelTwaConcerns.push('Verify SDS for STEL (Short-Term Exposure Limit) and Ceilings.');
      ihAdvisory = 'Evaluate need for local exhaust ventilation (LEV) before issuing respirators (Hierarchy of Controls).';
    }

    // 4. Environmental Expert (EPA Compliance)
    const epaComplianceConcerns: string[] = [];
    let spccRcraApplicability = 'Low environmental impact probability.';

    if (textLower.includes('spill') || textLower.includes('leak') || textLower.includes('oil') || textLower.includes('fuel')) {
      epaComplianceConcerns.push('Potential discharge into navigable waters or storm drains.');
      spccRcraApplicability = 'Triggers SPCC (Spill Prevention, Control, and Countermeasure) review if aggregate oil capacity > 1,320 gallons.';
    }

    if (textLower.includes('chemical') || textLower.includes('waste') || textLower.includes('drum')) {
      epaComplianceConcerns.push('Hazardous waste accumulation area compliance (RCRA).');
      spccRcraApplicability = 'Verify secondary containment and RCRA weekly inspection logs.';
    }

    // Synthesis
    const executiveSummary = `Multidisciplinary Synthesis: ${
      penaltyExposureRisk === 'critical_repeat_willful' || penaltyExposureRisk === 'high' 
        ? 'HIGH LEGAL EXPOSURE. ' 
        : 'Routine operational hazard. '
    } Requires systemic HOP evaluation ${
      pelStelTwaConcerns.length > 0 ? 'and Industrial Hygiene sampling' : ''
    }${
      epaComplianceConcerns.length > 0 ? ' alongside Environmental (SPCC/RCRA) mitigation' : ''
    }.`;

    return {
      safetyAndHealth: {
        hopFactors,
        systemicRootCauses,
        expertAdvisory: shAdvisory,
      },
      laborLawyer: {
        defensibilityStrategy,
        precedentCaseLawRefs,
        penaltyExposureRisk,
      },
      industrialHygiene: {
        pelStelTwaConcerns,
        noiseDustSilicaRisks,
        healthAdvisory: ihAdvisory,
      },
      environmental: {
        epaComplianceConcerns,
        spccRcraApplicability,
      },
      executiveSummary,
    };
  }
}
