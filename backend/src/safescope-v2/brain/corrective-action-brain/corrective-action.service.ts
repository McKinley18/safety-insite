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

    // Generator selection contract (P1-02 fix): the specific, evidence-bound,
    // observationUnderstanding-driven generator below always runs first and is
    // never preempted by hazard domain/category. The domain-coarse fallback that
    // follows only fires when that specific generator did not produce a result
    // (observationUnderstanding absent, or present but outside its four known
    // families) — never on domain category alone, since the categories it once
    // excluded are exactly the ones the specific generator handles best.
    let handledByComponentAwareGenerator = false;

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
        handledByComponentAwareGenerator = true;
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
        handledByComponentAwareGenerator = true;
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
        handledByComponentAwareGenerator = true;
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
        handledByComponentAwareGenerator = true;
      }
    }

    // Evidence-bound fallback specificity: production callers do not always have
    // the optional observationUnderstanding object, or it may not match any of the
    // four families above. Use the already-classified domain/mechanism to select a
    // concrete control without inventing measurements or site facts. This prevents
    // generic boilerplate from replacing useful, hazard-specific guidance. Only
    // runs when the specific generator above did not already produce a result.
    if (!handledByComponentAwareGenerator) {
      const fallbackScenario: any = scenarioIntelligence as any;
      const fallbackContext = `${fallbackScenario.hazardDomain || ''} ${fallbackScenario.hazardCategory || ''} ${fallbackScenario.candidateStandardFamily || ''} ${scenarioIntelligence.mechanismOfInjury || ''} ${scenarioIntelligence.scenarioFamilyId || ''}`.toLowerCase();
      const explicitDomain = String(fallbackScenario.hazardDomain || fallbackScenario.hazardCategory || fallbackScenario.candidateStandardFamily || '').toLowerCase();
      const domainIsWalking = /walking|slip|surface|housekeeping|egress/.test(explicitDomain);
      const domainIsElectrical = /electrical|electric/.test(explicitDomain);
      const domainIsMobile = /mobile|traffic|haul|powered.?industrial/.test(explicitDomain);
      const domainIsFall = /fall|ladder|scaffold|elevated/.test(explicitDomain);
      const domainIsGuarding = /guard|machine/.test(explicitDomain);
      if (domainIsWalking) {
        immediateActionNarrative = 'Restrict the affected travel path and provide a safe alternate route while the observed walking-surface condition is corrected.';
        interimControlNarrative = 'Barricade or clearly mark the affected area and remove the immediate slip/trip source before workers use the path.';
        permanentCorrectionNarrative = 'Remove the spill, obstruction, or damaged surface and restore a clean, dry, unobstructed walking route appropriate to the work area.';
        verificationNarrative = 'Walk the route after correction and document that the surface is clean, dry, level, and free of remaining exposure.';
      } else if (domainIsElectrical) {
        immediateActionNarrative = 'Restrict access and remove the affected electrical equipment from service until qualified personnel assess the exposure.';
        interimControlNarrative = 'De-energize and secure the boundary around the exposed electrical parts; do not rely on PPE as the primary control.';
        permanentCorrectionNarrative = 'Restore the enclosure or replace damaged electrical components with equipment-rated parts, then verify insulation and enclosure integrity before re-energizing.';
        verificationNarrative = 'Retain qualified electrical inspection and test evidence showing the enclosure and protective barriers are intact before return to service.';
      } else if (domainIsMobile) {
        immediateActionNarrative = 'Pause the conflicting movement and separate people from the vehicle path until a controlled route is established.';
        interimControlNarrative = 'Use a barricade, spotter, or temporary exclusion zone to prevent pedestrian entry into the active travel path.';
        permanentCorrectionNarrative = 'Engineer durable pedestrian/vehicle separation and a defined traffic-control layout matched to the observed route and visibility limits.';
        verificationNarrative = 'Walk the route with operators and pedestrians, verify separation and visibility controls, and retain the completed traffic-control check.';
      } else if (domainIsFall) {
        immediateActionNarrative = 'Stop exposed work and restrict access to the unprotected edge or elevated access point.';
        interimControlNarrative = 'Install a temporary physical barrier or controlled exclusion zone that prevents a worker from reaching the edge.';
        permanentCorrectionNarrative = 'Install compliant guardrails or another engineered fall-protection system suited to the identified edge and task before work resumes.';
        verificationNarrative = 'Inspect the installed edge protection at the point of exposure and document that it remains continuous and secure before reopening the area.';
      } else if (domainIsGuarding) {
        immediateActionNarrative = 'Stop access to the exposed moving interface and keep the affected equipment out of service until guarding and isolation are verified.';
        interimControlNarrative = 'Use a physical barrier or controlled exclusion zone that prevents reaching the exposed moving parts while the permanent control is designed.';
        permanentCorrectionNarrative = 'Install or restore a fixed or interlocked guard at the identified point of operation, then function-test the guard before return to service.';
        verificationNarrative = 'Document a competent-person inspection and functional test confirming the guard prevents access during normal operation.';
      } else if (!observationUnderstanding || permanentCorrectionNarrative.includes('Implement permanent engineered controls, such as')) {
        if (/guard|nip|rotat|machine/.test(fallbackContext)) {
          immediateActionNarrative = 'Stop access to the exposed moving interface and keep the affected equipment out of service until guarding and isolation are verified.';
          interimControlNarrative = 'Use a physical barrier or controlled exclusion zone that prevents reaching the exposed moving parts while the permanent control is designed.';
          permanentCorrectionNarrative = 'Install or restore a fixed or interlocked guard at the identified point of operation, then function-test the guard before return to service.';
          verificationNarrative = 'Document a competent-person inspection and functional test confirming the guard prevents access during normal operation.';
        } else if (/lockout|stored|energ|energy|isolation/.test(fallbackContext)) {
          immediateActionNarrative = 'Stop servicing and remove employees from the energy-release path until all hazardous energy is isolated.';
          interimControlNarrative = 'Apply locks/tags, block or restrain stored energy, and restrict access until zero energy is verified.';
          permanentCorrectionNarrative = 'Identify every energy source, isolate and lock/tag it, release stored energy, and verify zero energy before work resumes.';
          verificationNarrative = 'Record the zero-energy test and an authorized-person verification before removing the isolation.';
        } else if (/electrical|shock|arc|conductor|wiring/.test(fallbackContext)) {
          immediateActionNarrative = 'Restrict access and remove the affected electrical equipment from service until qualified personnel assess the exposure.';
          interimControlNarrative = 'De-energize and secure the boundary around the exposed electrical parts; do not rely on PPE as the primary control.';
          permanentCorrectionNarrative = 'Restore the enclosure or replace damaged electrical components with equipment-rated parts, then verify insulation and enclosure integrity before re-energizing.';
          verificationNarrative = 'Retain qualified electrical inspection and test evidence showing the enclosure and protective barriers are intact before return to service.';
        } else if (/fall|edge|roof|ladder|gravity/.test(fallbackContext)) {
          immediateActionNarrative = 'Stop exposed work and restrict access to the unprotected edge or elevated access point.';
          interimControlNarrative = 'Install a temporary physical barrier or controlled exclusion zone that prevents a worker from reaching the edge.';
          permanentCorrectionNarrative = 'Install compliant guardrails or another engineered fall-protection system suited to the identified edge and task before work resumes.';
          verificationNarrative = 'Inspect the installed edge protection at the point of exposure and document that it remains continuous and secure before reopening the area.';
        } else if (/spill|chemical|solvent|caustic|toxic|mist/.test(fallbackContext)) {
          immediateActionNarrative = 'Stop the release or transfer if safe to do so, restrict access, and protect workers from the observed chemical path.';
          interimControlNarrative = 'Use compatible containment and access controls while the source is isolated; consult the supplied chemical information before selecting PPE or cleanup methods.';
          permanentCorrectionNarrative = 'Repair or replace the failed transfer component and provide containment or ventilation appropriate to the confirmed substance and exposure pathway.';
          verificationNarrative = 'Verify the source is no longer releasing, inspect the affected surface, and document cleanup and control checks before restoring normal work.';
        } else if (/mobile|forklift|truck|traffic|haul|pedestrian/.test(fallbackContext)) {
          immediateActionNarrative = 'Pause the conflicting movement and separate people from the vehicle path until a controlled route is established.';
          interimControlNarrative = 'Use a barricade, spotter, or temporary exclusion zone to prevent pedestrian entry into the active travel path.';
          permanentCorrectionNarrative = 'Engineer durable pedestrian/vehicle separation and a defined traffic-control layout matched to the observed route and visibility limits.';
          verificationNarrative = 'Walk the route with operators and pedestrians, verify separation and visibility controls, and retain the completed traffic-control check.';
        } else if (/slip|trip|walking|surface|housekeeping|egress|spill/.test(fallbackContext)) {
          immediateActionNarrative = 'Restrict the affected travel path and provide a safe alternate route while the observed walking-surface condition is corrected.';
          interimControlNarrative = 'Barricade or clearly mark the affected area and remove the immediate slip/trip source before workers use the path.';
          permanentCorrectionNarrative = 'Remove the spill, obstruction, or damaged surface and restore a clean, dry, unobstructed walking route appropriate to the work area.';
          verificationNarrative = 'Walk the route after correction and document that the surface is clean, dry, level, and free of remaining exposure.';
        }
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
