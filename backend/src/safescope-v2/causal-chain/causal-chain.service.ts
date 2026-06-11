import * as natural from 'natural';
import {
  SafeScopeCausalChainInput,
  SafeScopeCausalChainOutput,
  SafeScopeCausalChainConfidence,
} from './causal-chain.types';

function cleanText(value: any): string {
  return String(value || '').trim();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(cleanText).filter(Boolean)));
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  
  // Use NLP stemming for semantic matching
  const tokenizer = new natural.WordTokenizer();
  const haystackTokens = tokenizer.tokenize(lower) || [];
  const stemmedHaystack = haystackTokens.map(t => natural.PorterStemmer.stem(t));

  return terms.some((term) => {
    const termLower = term.toLowerCase();
    if (lower.includes(termLower)) return true;
    
    // Check if any stemmed token matches the stemmed term
    const stemmedTerm = natural.PorterStemmer.stem(termLower);
    return stemmedHaystack.includes(stemmedTerm);
  });
}

export class SafeScopeCausalChainService {
  evaluate(input: SafeScopeCausalChainInput): SafeScopeCausalChainOutput {
    const classification = cleanText(input.classification) || 'Unclassified';
    const observationText = cleanText(input.observationText);
    const combined = `${classification} ${observationText}`.toLowerCase();

    // Extract dynamic contextual keywords using TF-IDF
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(combined);
    const contextKeywords = tfidf.listTerms(0).slice(0, 3).map(t => t.term);
    const dynamicContext = contextKeywords.length > 0 ? ` involving ${contextKeywords.join(', ')}` : '';

    const mechanism = input.mechanismIntelligence || {};
    const exposure = input.exposureIntelligence || {};
    const evidence = input.evidenceSufficiency || {};
    const action = input.actionQuality || {};

    const initiatingEvents: string[] = [];
    const energyOrExposureTransfer: string[] = [];
    const injuryOrIllnessMechanisms: string[] = [];
    const likelyConsequences: string[] = [];
    const failedOrMissingControls: string[] = [];
    const criticalBreakPoints: string[] = [];
    const evidenceNeededToConfirmChain: string[] = [];
    const correctiveControlTargets: string[] = [];
    const uncertaintyFlags: string[] = [];

    if (includesAny(combined, ['machine', 'guard', 'conveyor', 'nip', 'pinch', 'rotating'])) {
      initiatingEvents.push(
        `Employee reaches, slips, adjusts, cleans, troubleshoots, or works near moving equipment${dynamicContext}.`,
        'Unexpected startup or continued motion occurs while an employee is within the danger zone.',
      );
      energyOrExposureTransfer.push('Mechanical motion transfers energy through contact with rotating, reciprocating, shearing, or pinch-point components.');
      injuryOrIllnessMechanisms.push('caught_in_or_between', 'crush', 'amputation', 'laceration');
      likelyConsequences.push('Serious injury, amputation, crushing injury, or fatality potential.');
      failedOrMissingControls.push(`Missing or inadequate guarding${dynamicContext}.`, 'Unverified equipment state or hazardous-energy control.');
      criticalBreakPoints.push('Prevent access to moving parts.', 'Stop, isolate, lock/tag, block, and verify zero energy before work in the danger zone.');
      evidenceNeededToConfirmChain.push('Document guard condition, access path, employee task, equipment state, and lockout/tagout or zero-energy verification.');
      correctiveControlTargets.push('Install fixed or interlocked guarding.', 'Verify energy isolation and prevent exposure during cleanup, adjustment, maintenance, or troubleshooting.');
    }

    if (includesAny(combined, ['electrical', 'energized', 'panel', 'conductor', 'arc', 'breaker'])) {
      initiatingEvents.push(
        `Employee opens, contacts, troubleshoots, or works near energized electrical components${dynamicContext}.`,
        'Damaged, exposed, or improperly controlled electrical equipment allows contact or fault energy release.',
      );
      energyOrExposureTransfer.push('Electrical energy transfers through direct contact, arc flash, thermal energy, or secondary fall/startle response.');
      injuryOrIllnessMechanisms.push('electrocution_or_shock', 'arc_flash_or_burn', 'fire_or_explosion');
      likelyConsequences.push('Shock, electrocution, arc flash burn, fire, explosion, or secondary fall injury.');
      failedOrMissingControls.push('Missing cover, inadequate guarding, poor labeling, damaged insulation, or lack of qualified-person control.');
      criticalBreakPoints.push('De-energize where feasible.', 'Restrict access to qualified persons.', 'Verify covers, labels, disconnects, and test-before-touch controls.');
      evidenceNeededToConfirmChain.push('Document energized/de-energized state, voltage if known, panel condition, covers, labels, access restrictions, and qualified-person review.');
      correctiveControlTargets.push('Restore enclosure integrity.', 'Restrict unauthorized access.', 'Verify de-energization and qualified review before work.');
    }

    if (includesAny(combined, ['fall', 'edge', 'roof', 'ladder', 'scaffold', 'opening', 'hole', 'elevated'])) {
      initiatingEvents.push(
        `Employee slips, trips, missteps, loses balance, climbs, transitions, or works near an unprotected elevation change${dynamicContext}.`,
        'Surface instability, missing protection, poor access, or dropped object exposure creates fall or struck-by potential.',
      );
      energyOrExposureTransfer.push('Gravity converts elevation difference into kinetic energy during a fall or falling-object event.');
      injuryOrIllnessMechanisms.push('fall_to_lower_level', 'fall_same_level', 'struck_by');
      likelyConsequences.push('Fracture, head injury, internal injury, impalement, fatality, or struck-by injury below.');
      failedOrMissingControls.push('Missing guardrail, cover, fall restraint, anchor, safe access, scaffold component, ladder securement, or rescue planning.');
      criticalBreakPoints.push('Eliminate elevated work where feasible.', 'Install guardrails/covers/platforms.', 'Verify fall protection, access, anchorage, and rescue controls.');
      evidenceNeededToConfirmChain.push('Document work height, edge/opening protection, ladder/scaffold condition, tie-off method, anchor point, access route, and rescue considerations.');
      correctiveControlTargets.push('Install guardrails, covers, platforms, or travel restraint.', 'Correct ladder/scaffold setup and verify fall-protection system suitability.');
    }

    if (includesAny(combined, ['confined', 'permit space', 'atmosphere', 'oxygen', 'engulfment', 'entrant'])) {
      initiatingEvents.push(
        `Employee enters or works near a restricted space with uncertain atmosphere, isolation, engulfment, or rescue conditions${dynamicContext}.`,
        'Atmospheric, mechanical, chemical, or material-flow hazard develops or remains uncontrolled during entry.',
      );
      energyOrExposureTransfer.push('Atmospheric hazard, chemical exposure, engulfment material, or mechanical energy affects the entrant before escape or rescue.');
      injuryOrIllnessMechanisms.push('asphyxiation', 'inhalation_exposure', 'engulfment', 'caught_in_or_between');
      likelyConsequences.push('Asphyxiation, poisoning, engulfment, entrapment, delayed rescue, or multiple-fatality potential.');
      failedOrMissingControls.push('Missing permit, atmospheric testing, isolation, attendant, ventilation, retrieval, or rescue plan.');
      criticalBreakPoints.push('Eliminate entry where feasible.', 'Classify the space.', 'Test atmosphere, isolate hazards, ventilate, provide attendant and rescue plan.');
      evidenceNeededToConfirmChain.push('Document space classification, atmospheric readings, calibration, isolation points, ventilation, attendant, permit, and rescue method.');
      correctiveControlTargets.push('Implement permit-space controls, verified isolation, atmospheric monitoring, ventilation, attendant coverage, and non-entry rescue where feasible.');
    }

    if (includesAny(combined, ['dust', 'silica', 'fume', 'vapor', 'gas', 'mist', 'noise', 'heat', 'cold', 'chemical', 'solvent', 'hazcom'])) {
      initiatingEvents.push(
        `Employee performs a task that generates or contacts a harmful agent, contaminant, physical stressor, or chemical exposure${dynamicContext}.`,
        'Exposure continues because identity, concentration, duration, route, controls, or PPE effectiveness is not fully verified.',
      );
      energyOrExposureTransfer.push('Exposure transfers through inhalation, skin/eye contact, ingestion, noise dose, thermal stress, or mixed routes.');
      injuryOrIllnessMechanisms.push(...unique([
        ...(Array.isArray(mechanism.injuryMechanisms) ? mechanism.injuryMechanisms : []),
        exposure.exposureRoute === 'noise' ? 'noise_induced_hearing_loss' : '',
        exposure.exposureRoute === 'inhalation' ? 'inhalation_exposure' : '',
      ]));
      likelyConsequences.push('Acute symptoms, chronic occupational illness, hearing loss, respiratory disease, chemical injury, heat illness, or delayed health effects.');
      failedOrMissingControls.push(`Missing exposure assessment, SDS/label, ventilation, wet method, containment, sampling data, fit testing, or effective higher-order controls${dynamicContext}.`);
      criticalBreakPoints.push('Identify the agent and route.', 'Measure or verify exposure when needed.', 'Control exposure at the source before relying on PPE.');
      evidenceNeededToConfirmChain.push('Document agent identity, task, route, concentration if measured, duration, sampling basis, controls, PPE, ventilation, and exposed employee count.');
      correctiveControlTargets.push('Use substitution, enclosure, local exhaust, wet methods, isolation, process change, housekeeping, or verified PPE/respiratory protection as applicable.');
    }

    const mechanismPathways = Array.isArray(mechanism.credibleAccidentPathways)
      ? mechanism.credibleAccidentPathways
      : [];

    const mechanismEvidence = Array.isArray(mechanism.evidenceNeeded)
      ? mechanism.evidenceNeeded
      : [];

    const evidenceMissing = Array.isArray(evidence.missingCriticalEvidence)
      ? evidence.missingCriticalEvidence
      : [];

    const actionBlockers = Array.isArray(action.closureBlockers)
      ? action.closureBlockers
      : [];

    const highRisk =
      input.risk?.riskBand === 'High' ||
      input.risk?.riskBand === 'Critical' ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    if (!observationText) {
      uncertaintyFlags.push('Observation text is missing or too limited to support a strong causal chain.');
    }

    if (!mechanismPathways.length && !initiatingEvents.length) {
      uncertaintyFlags.push('No strong mechanism pathway was identified from the available evidence.');
    }

    if (evidenceMissing.length) {
      uncertaintyFlags.push('Evidence sufficiency layer reports missing critical evidence.');
    }

    if (actionBlockers.length) {
      uncertaintyFlags.push('Corrective action quality layer reports closure blockers.');
    }

    const causalPathways = unique([
      ...mechanismPathways,
      ...initiatingEvents.map((event) => {
        const transfer = energyOrExposureTransfer[0] || 'Hazard energy or exposure reaches the worker.';
        const consequence = likelyConsequences[0] || 'Injury, illness, or incident may occur.';
        return `${event} ${transfer} ${consequence}`;
      }),
    ]);

    const confidence = this.getConfidence({
      causalPathwayCount: causalPathways.length,
      evidenceMissingCount: evidenceMissing.length,
      uncertaintyCount: uncertaintyFlags.length,
      hasMechanism: Boolean(mechanismPathways.length || injuryOrIllnessMechanisms.length),
    });

    return {
      engine: 'safescope_causal_chain',
      mode: 'deterministic_offline',
      classification,
      hazardCondition: observationText || `${classification} hazard condition requires further description.`,
      exposedPersonOrTask: this.inferExposedPersonOrTask(combined),
      initiatingEvents: unique(initiatingEvents),
      energyOrExposureTransfer: unique([
        ...energyOrExposureTransfer,
        ...(Array.isArray(mechanism.primaryEnergySources)
          ? mechanism.primaryEnergySources.map((source: string) => `Potential energy source: ${source}`)
          : []),
      ]),
      injuryOrIllnessMechanisms: unique([
        ...injuryOrIllnessMechanisms,
        ...(Array.isArray(mechanism.injuryMechanisms) ? mechanism.injuryMechanisms : []),
      ]),
      likelyConsequences: unique(likelyConsequences),
      failedOrMissingControls: unique([
        ...failedOrMissingControls,
        ...(Array.isArray(mechanism.failureModes) ? mechanism.failureModes : []),
      ]),
      causalPathways,
      criticalBreakPoints: unique(criticalBreakPoints),
      evidenceNeededToConfirmChain: unique([
        ...evidenceNeededToConfirmChain,
        ...mechanismEvidence,
        ...evidenceMissing,
      ]),
      correctiveControlTargets: unique(correctiveControlTargets),
      uncertaintyFlags: unique(uncertaintyFlags),
      confidence,
      requiresQualifiedReview:
        Boolean(highRisk) ||
        confidence !== 'high' ||
        Boolean(uncertaintyFlags.length) ||
        Boolean(mechanism.requiresQualifiedReview) ||
        Boolean(exposure.requiresIndustrialHygieneReview),
      canInventCausation: false,
      canDetermineRootCauseWithoutEvidence: false,
      canReduceHumanReview: false,
      sourceBoundary:
        'SafeScope causal chain intelligence explains plausible hazard-to-injury pathways using available evidence, mechanism intelligence, exposure intelligence, evidence sufficiency, and action quality signals. It cannot invent causation, determine root cause without evidence, override OSHA/MSHA requirements, or reduce required qualified human review.',
    };
  }

  private inferExposedPersonOrTask(combined: string): string {
    if (includesAny(combined, ['maintenance', 'repair', 'service', 'cleanup', 'adjust'])) {
      return 'Employee performing maintenance, service, cleanup, adjustment, or troubleshooting task.';
    }
    if (includesAny(combined, ['operator', 'equipment', 'conveyor', 'machine'])) {
      return 'Equipment operator or nearby employee with access to the hazard area.';
    }
    if (includesAny(combined, ['pedestrian', 'traffic', 'haul', 'truck', 'forklift', 'loader'])) {
      return 'Pedestrian, operator, spotter, or worker exposed to mobile equipment interaction.';
    }
    if (includesAny(combined, ['entrant', 'confined'])) {
      return 'Entrant, attendant, rescuer, or nearby worker involved with confined-space activity.';
    }
    if (includesAny(combined, ['welding', 'dust', 'silica', 'chemical', 'noise', 'heat'])) {
      return 'Employee performing or working near the exposure-generating task.';
    }
    return 'Potentially exposed employee, contractor, operator, or nearby worker.';
  }

  private getConfidence(input: {
    causalPathwayCount: number;
    evidenceMissingCount: number;
    uncertaintyCount: number;
    hasMechanism: boolean;
  }): SafeScopeCausalChainConfidence {
    if (!input.hasMechanism || input.causalPathwayCount === 0) return 'low';
    if (input.evidenceMissingCount >= 3 || input.uncertaintyCount >= 2) return 'medium';
    if (input.evidenceMissingCount || input.uncertaintyCount) return 'medium';
    return 'high';
  }
}
