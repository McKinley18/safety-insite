import { Injectable } from '@nestjs/common';
import { CrossDomainCausalChainResult, ChainConfidence, CompoundRiskLevel } from './cross-domain-causal-chain.types';
import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';

@Injectable()
export class CrossDomainCausalChainService {

  analyze(input: {
    observationText: string;
    multiHazardDecomposition: MultiHazardDecompositionResult;
    evidenceWeighting: EvidenceWeightingResult;
  }): CrossDomainCausalChainResult {
    const { observationText, multiHazardDecomposition, evidenceWeighting } = input;
    const lowerText = observationText.toLowerCase();

    const primaryCausalChain: string[] = [];
    const contributingHazards: string[] = [];
    const initiatingConditions: string[] = [];
    const escalationFactors: string[] = [];
    const exposurePathways: string[] = [];
    const controlBreakdownPathways: string[] = [];
    const plausibleInjuryMechanisms: string[] = [];
    const missingCausalFacts: string[] = [...evidenceWeighting.missingCriticalFacts];
    const contradictionLimits: string[] = [...evidenceWeighting.detectedContradictions];
    const reviewerQuestions: string[] = [...evidenceWeighting.reviewerQuestions];

    let compoundRiskLevel: CompoundRiskLevel = 'moderate';
    
    // Deterministic Logic Families

    // A. Machine guarding / LOTO interaction
    const hasMachineSignals = /conveyor|pulley|rotating|nip point|guard/.test(lowerText);
    const hasLOTOSignals = /energized|running|locked out|unexpected startup/.test(lowerText);
    const isUnguarded = /unguarded|guard removed|guard missing/.test(lowerText);
    
    if (hasMachineSignals && isUnguarded) {
        primaryCausalChain.push('Mechanical energy source with guarding failure.');
        initiatingConditions.push('Guarding not in place on rotating equipment.');
        exposurePathways.push('Access to rotating parts during operation or maintenance.');
        plausibleInjuryMechanisms.push('Caught-in/nip-point injury.');
        
        if (hasLOTOSignals) {
            contributingHazards.push('Energy control (LOTO) uncertainty.');
            escalationFactors.push('Unexpected startup pathway if equipment is energized.');
            controlBreakdownPathways.push('Inadequate hazardous energy control.');
            compoundRiskLevel = 'high';
        }
    }

    // B. Electrical + wet/slip interaction
    const hasElectricalSignals = /damaged.*cord|exposed.*wire|electrical.*panel|live|energized/.test(lowerText);
    const hasWetSignals = /wet.*floor|water|spill|damp/.test(lowerText);
    
    if (hasElectricalSignals && hasWetSignals) {
        primaryCausalChain.push('Electrical hazard amplified by conductive environmental surface.');
        initiatingConditions.push('Exposed or damaged electrical components in wet area.');
        escalationFactors.push('Moisture increasing conductivity and slip risk.');
        exposurePathways.push('Electrical shock pathway via conductive surface contact.');
        plausibleInjuryMechanisms.push('Electrical shock or electrocution.');
        compoundRiskLevel = 'high';
    }

    // C. Mobile equipment + pedestrian interaction
    const hasMobileSignals = /forklift|loader|haul truck|mobile equipment|traffic/.test(lowerText);
    const hasPedestrianSignals = /pedestrian|walkway|blind spot|poor visibility|no separation/.test(lowerText);
    
    if (hasMobileSignals && hasPedestrianSignals) {
        primaryCausalChain.push('Mobile equipment traffic with pedestrian interaction pathway.');
        initiatingConditions.push('Pedestrians and mobile equipment sharing space.');
        escalationFactors.push('Blind spots or poor visibility for operator.');
        controlBreakdownPathways.push('Segregation or visibility control failure.');
        plausibleInjuryMechanisms.push('Struck-by mobile equipment.');
        compoundRiskLevel = 'high';
    }

    // D. HazCom + spill/SDS uncertainty
    const hasHazComSignals = /unlabeled|no label|chemical container|sds missing/.test(lowerText);
    const hasSpillSignals = /spill|leaking|unknown chemical/.test(lowerText);
    
    if (hasHazComSignals && hasSpillSignals) {
        primaryCausalChain.push('Chemical spill with identification and control information gap.');
        initiatingConditions.push('Unidentified chemical release.');
        escalationFactors.push('Missing Safety Data Sheet (SDS) for emergency response.');
        controlBreakdownPathways.push('Hazard Communication (HazCom) failure.');
        plausibleInjuryMechanisms.push('Inhalation, ingestion, or skin absorption of unknown agent.');
        compoundRiskLevel = 'high';
    }

    // E. Fall + material handling interaction
    const hasFallSignals = /open edge|elevated platform|unprotected edge|guardrail missing/.test(lowerText);
    const hasMaterialSignals = /stacked material|staging|unstable load|stored material/.test(lowerText);
    
    if (hasFallSignals && hasMaterialSignals) {
        primaryCausalChain.push('Fall from height hazard exacerbated by material placement.');
        initiatingConditions.push('Work at height near unprotected edges with stored materials.');
        escalationFactors.push('Unstable loads near edge or housekeeping obstructions.');
        exposurePathways.push('Fall to lower level or struck-by falling object.');
        plausibleInjuryMechanisms.push('Blunt force trauma from fall or falling object.');
        compoundRiskLevel = 'high';
    }

    // F. Confined space + emergency response interaction
    const hasConfinedSignals = /confined space|tank|vessel|pit/.test(lowerText);
    const hasERSignals = /no.*atmospheric.*testing|oxygen|toxic|flammable|rescue|attendant/.test(lowerText);
    
    if (hasConfinedSignals && hasERSignals) {
        primaryCausalChain.push('Confined space entry with atmospheric and rescue readiness gaps.');
        initiatingConditions.push('Entry into permit-required confined space.');
        escalationFactors.push('Lack of atmospheric monitoring or rescue standby.');
        controlBreakdownPathways.push('Confined space permit system or emergency response failure.');
        plausibleInjuryMechanisms.push('Asphyxiation or toxic exposure.');
        compoundRiskLevel = 'critical';
    }

    // Chain Confidence Mapping
    let chainConfidence: ChainConfidence = 'moderate';
    if (evidenceWeighting.evidenceGrade === 'conflicting') {
        chainConfidence = 'conflicting';
    } else if (evidenceWeighting.evidenceGrade === 'insufficient') {
        chainConfidence = 'insufficient';
    } else if (evidenceWeighting.evidenceGrade === 'weak') {
        chainConfidence = 'weak';
    } else if (evidenceWeighting.evidenceGrade === 'strong' && primaryCausalChain.length > 0) {
        chainConfidence = 'strong';
    }

    // Final result
    return {
      version: 'v1',
      primaryCausalChain,
      contributingHazards,
      initiatingConditions,
      escalationFactors,
      exposurePathways,
      controlBreakdownPathways,
      plausibleInjuryMechanisms,
      compoundRiskLevel: primaryCausalChain.length === 0 ? 'uncertain' : compoundRiskLevel,
      chainConfidence,
      missingCausalFacts,
      contradictionLimits,
      reviewerQuestions,
      advisoryBoundary: 'SafeScope causal chain reasoning is advisory only.',
      doesNotDeclareViolation: true,
      requiresQualifiedReview: true
    };
  }
}
