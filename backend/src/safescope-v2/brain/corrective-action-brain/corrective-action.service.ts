import { CorrectiveActionReasoning } from './corrective-action.types';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';

export class CorrectiveActionBrainService {
  evaluate(
    scenarioIntelligence: ScenarioIntelligence,
    evidenceGaps: string[],
    observationUnderstanding?: any
  ): CorrectiveActionReasoning {
    const isCritical = scenarioIntelligence.mechanismOfInjury.includes('rotating_equipment') || scenarioIntelligence.mechanismOfInjury.includes('electrical_shock');
    const isHighRisk = scenarioIntelligence.missingOrFailedControls.length > 0;
    
    let urgency: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
    if (isCritical) urgency = 'critical';
    else if (isHighRisk) urgency = 'high';

    const immediateActions = isCritical 
        ? ['Immediately stop all work in the affected zone', 'Lock out and tag out all energy sources']
        : ['Assess current hazard exposure', 'Secure the area'];

    const interimControls = isHighRisk 
        ? ['Implement temporary physical barriers', 'Assign a dedicated safety spotter']
        : ['Restrict access until controls are verified'];

    const permanentCorrections = scenarioIntelligence.scenarioFamilyId === 'conveyor-cleanup' 
        ? ['Install permanent interlocked guarding system', 'Develop authorized lockout procedures']
        : ['Implement permanent engineered solutions specific to hazard'];

    let immediateActionNarrative = isCritical 
        ? 'Halt affected work in the area immediately and isolate potential energy before servicing.' 
        : 'Secure the area to prevent further hazard exposure and notify the area supervisor.';
    let interimControlNarrative = 'Deploy temporary physical safeguards or implement access restrictions until permanent engineered controls are validated.';
    let permanentCorrectionNarrative = `Implement permanent engineered controls, such as ${scenarioIntelligence.missingOrFailedControls.join(' or ') || "barriers"}, to eliminate exposure to ${scenarioIntelligence.mechanismOfInjury || "identified injury mechanisms"}.`;
    let administrativeFollowUpNarrative = 'Review and update the hazard control plan; conduct a mandatory safety briefing for all personnel affected by this work activity.';
    let verificationNarrative = 'Perform a formal inspection and functional verification by a competent person before removing interim controls or resuming normal operations.';

    if (observationUnderstanding) {
      const eq = observationUnderstanding.equipment || {};
      const tk = observationUnderstanding.task || {};
      const ex = observationUnderstanding.exposure || {};
      const en = observationUnderstanding.energy || {};
      const ct = observationUnderstanding.controls || {};
      const topMech = observationUnderstanding.mechanismCandidates?.[0]?.mechanism || scenarioIntelligence.mechanismOfInjury || "";

      const equipmentLabel = eq.specificEquipment || eq.category || "affected equipment";
      const componentLabel = eq.component || "";
      const motionLabel = eq.motion || "";
      const taskLabel = tk.activity || "active work";
      const energyLabel = en.primaryEnergySource || "";
      const failedControlsLabel = ct.failedControls?.join(", ") || "";
      const missingControlsLabel = ct.missingControls?.join(", ") || "";

      // 1. Conveyor / machine guarding scenario (e.g. rotating shaft/conveyor/tail pulley)
      if (
        equipmentLabel.toLowerCase().includes("conveyor") || 
        equipmentLabel.toLowerCase().includes("shaft") || 
        equipmentLabel.toLowerCase().includes("rotating") ||
        topMech.toLowerCase().includes("rotating_equipment") ||
        topMech.toLowerCase().includes("nip_point")
      ) {
        immediateActionNarrative = `Pause affected work and restrict access around the exposed ${componentLabel || "tail pulley"} until guarding and ${energyLabel || "mechanical-rotation"} exposure controls are reviewed.`;
        interimControlNarrative = `Verify that temporary physical guards are positioned to isolate workers from the ${motionLabel || "moving"} components before continuing other work in the zone.`;
        permanentCorrectionNarrative = `Install permanent, secure guarding over the exposed ${componentLabel || "rotating shaft"} to completely eliminate the ${topMech.replaceAll("_", " ") || "entanglement"} hazard.`;
        administrativeFollowUpNarrative = `Update task-specific safety guidelines for ${taskLabel} and retrain teams on proper guarding inspection requirements.`;
      }
      // 2. Electrical scenario
      else if (
        equipmentLabel.toLowerCase().includes("cord") || 
        equipmentLabel.toLowerCase().includes("electrical") || 
        energyLabel.toLowerCase() === "electrical" ||
        topMech.toLowerCase().includes("electrical") ||
        topMech.toLowerCase().includes("shock")
      ) {
        immediateActionNarrative = `Isolate the affected ${equipmentLabel} from service and route damaged electrical-integrity concerns for qualified review before reuse.`;
        interimControlNarrative = `Tag out the power supply source and enforce strict physical clearance from the affected ${componentLabel || "wiring"} area.`;
        permanentCorrectionNarrative = `Replace damaged wiring assemblies with rated replacement components appropriate for the affected equipment and environment to ensure continuous, safe electrical-integrity barriers.`;
        administrativeFollowUpNarrative = `Perform a comprehensive workspace electrical audit and conduct a toolbox safety briefing on de-energization procedures.`;
      }
      // 3. Fall protection scenario
      else if (
        equipmentLabel.toLowerCase().includes("platform") || 
        equipmentLabel.toLowerCase().includes("roof") || 
        equipmentLabel.toLowerCase().includes("scaffold") || 
        equipmentLabel.toLowerCase().includes("ladder") ||
        topMech.toLowerCase().includes("fall_from_height") ||
        energyLabel.toLowerCase() === "gravity"
      ) {
        immediateActionNarrative = `Restrict access to the open platform edge and verify temporary edge protection or fall-protection controls before affected work continues.`;
        interimControlNarrative = `Establish clear warning lines and restrict the area around the ${componentLabel || "edge"} to authorized personnel using proper fall arrest gear.`;
        permanentCorrectionNarrative = `Erect engineered guardrails or qualified-review approved edge-protection controls around the ${componentLabel || "unprotected edge"} to resolve fall exposures.`;
        administrativeFollowUpNarrative = `Conduct a mandatory safety briefing on elevated work requirements and verify that active fall protection certificates are current.`;
      }
      // 4. Chemical / PPE scenario
      else if (
        energyLabel.toLowerCase() === "chemical" ||
        topMech.toLowerCase().includes("chemical") ||
        topMech.toLowerCase().includes("toxicity")
      ) {
        immediateActionNarrative = `Confirm eye/face splash exposure controls for the chemical transfer task and review PPE/barrier controls before continuing the task.`;
        interimControlNarrative = `Ensure that a readily accessible eyewash/emergency rinse capability appropriate for the chemical exposure scenario is immediately accessible and secondary chemical containers are properly labeled.`;
        permanentCorrectionNarrative = `Implement localized engineering controls or ventilation systems to eliminate the risk of respiratory chemical inhalation and direct liquid contact.`;
        administrativeFollowUpNarrative = `Ensure all safety data sheets (SDS) are verified and accessible, and retrain workers on safe decanting procedures.`;
      }
    }

    return {
      scenarioFamilyId: scenarioIntelligence.scenarioFamilyId,
      hazardDomain: scenarioIntelligence.candidateStandardFamily || 'unknown',
      mechanismOfInjury: scenarioIntelligence.mechanismOfInjury,
      exposurePathway: scenarioIntelligence.exposedPersonActivity,
      missingOrFailedControls: scenarioIntelligence.missingOrFailedControls,
      immediateActions: immediateActions,
      interimControls: interimControls,
      permanentCorrections: permanentCorrections,
      administrativeFollowUps: ['Perform hazard analysis update', 'Conduct targeted tool-box safety briefing'],
      verificationSteps: ['Competent person verification of controls', 'Document functional test results'],
      evidenceNeededBeforeFinalizing: evidenceGaps,
      responsibleRoleSuggestions: ['Safety Manager', 'Operations Supervisor'],
      urgencyLevel: urgency,
      controlHierarchyLevel: scenarioIntelligence.hierarchyLevel,
      standardFamilyReviewLinks: [],
      confidence: scenarioIntelligence.confidenceSignals.score,
      humanReviewTriggers: ['Qualified safety review required due to high hazard complexity'],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      },
      // Narrative fields
      immediateActionNarrative,
      interimControlNarrative,
      permanentCorrectionNarrative,
      administrativeFollowUpNarrative,
      verificationNarrative
    };
  }
}
