export class CrossDomainInteractionService {
  evaluate(input: {
    domainIntelligence?: Record<string, any>;
    text?: string;
  }) {
    const domains = input.domainIntelligence || {};
    const textLower = String(input.text || '').toLowerCase();

    const interactions: string[] = [];
    const escalationRisks: string[] = [];
    const reviewFocus: string[] = [];

    // Core Domain Interactions
    if (domains.confinedSpace && domains.loto) {
      interactions.push('confined_space + energy_isolation');
      escalationRisks.push('Confined space entry may require isolation of mechanical, electrical, hydraulic, pneumatic, or atmospheric energy sources.');
      reviewFocus.push('Verify permit controls, isolation, zero-energy verification, ventilation, attendant, and rescue readiness.');
    }

    if (domains.confinedSpace && domains.hazcomGhs) {
      interactions.push('confined_space + chemical_exposure');
      escalationRisks.push('Chemical or atmospheric hazards may accumulate or intensify in confined spaces.');
      reviewFocus.push('Verify SDS, atmospheric testing, ventilation, exposure limits, PPE, and rescue planning.');
    }

    if (domains.mobileEquipment && domains.trenching) {
      interactions.push('mobile_equipment + trenching_excavation');
      escalationRisks.push('Mobile equipment near excavation edges may create surcharge loading, struck-by exposure, or collapse risk.');
      reviewFocus.push('Verify setback distance, barricades, traffic routing, spoil placement, and competent-person inspection.');
    }

    if (domains.electrical && domains.loto) {
      interactions.push('electrical + energy_isolation');
      escalationRisks.push('Electrical work may require strict de-energization, lockout/tagout, and absence-of-voltage verification.');
      reviewFocus.push('Verify qualified-person involvement, lockout/tagout, test-before-touch, and arc-flash controls.');
    }

    if (domains.liftingRigging && domains.mobileEquipment) {
      interactions.push('lifting_rigging + mobile_equipment');
      escalationRisks.push('Lifting activity near mobile equipment can compound struck-by, caught-between, and load-path exposure.');
      reviewFocus.push('Verify exclusion zones, traffic separation, lift communication, spotter control, and load path.');
    }

    // Advanced Situational & Environmental Awareness Modifiers
    const environmentalFactors: string[] = [];

    if (/(wet|water|rain|puddle|moisture|damp|muddy|flooded|leak)/i.test(textLower)) {
      environmentalFactors.push('wet_conditions');
      interactions.push('environmental_hazard: wet_conditions');
      escalationRisks.push('SITUATIONAL HAZARD: Presence of water or wet walking-working surfaces significantly reduces skin-contact resistance (multiplying electrocution risk) and reduces traction (compounding slip/trip hazards).');
      reviewFocus.push('Mandate GFCI-protected equipment, non-conductive fiberglass tools, and slip-resistant insulated safety boots.');
    }

    if (/(night|dark|low light|flashlight|poor visibility|evening|dim|shadow)/i.test(textLower)) {
      environmentalFactors.push('low_visibility');
      interactions.push('environmental_hazard: low_visibility');
      escalationRisks.push('SITUATIONAL HAZARD: Operating under low light or night conditions exponentially increases human-factor errors, struck-by hazards, and misidentified risk states.');
      reviewFocus.push('Deploy portable light towers, mandate Class 3 reflective apparel, and require active flashing wearable beacons.');
    }

    if (/(contractor|temp worker|third party|hired help|visitor|untrained)/i.test(textLower)) {
      environmentalFactors.push('external_personnel');
      interactions.push('situational_factor: contractor_presence');
      escalationRisks.push('SITUATIONAL FACTOR: External contractors or temporary personnel introduce coordination barriers and may lack familiarity with site-specific emergency egress routes and LOTO procedures.');
      reviewFocus.push('Conduct comprehensive pre-task joint safety briefings, verify contractor training logs, and implement close supervisor oversight.');
    }

    // Deep Multi-Hazard Cross-Domain Interaction & Analytical Compounding
    const isConfined = domains.confinedSpace || textLower.includes('confined space') || textLower.includes('tank');
    const isLoto = domains.loto || textLower.includes('lockout') || textLower.includes('loto') || textLower.includes('de-energiz');
    const isElectrical = domains.electrical || textLower.includes('electrical') || textLower.includes('energized') || textLower.includes('panel') || textLower.includes('wire');
    const isMobileEquipment = domains.mobileEquipment || textLower.includes('mobile equipment') || textLower.includes('forklift') || textLower.includes('truck');

    if (isElectrical && environmentalFactors.includes('wet_conditions')) {
      interactions.push('compound_critical: electrical_hazard_in_wet_area');
      escalationRisks.push('COMPOUND CRITICAL RISK: Live electrical components or damaged conductors in wet or flooded areas create an immediate high-probability pathway for lethal electric shock or electrocution.');
      reviewFocus.push('IMMEDIATE CORRECTION REQUIRED: Completely de-energize and lock out all affected power feeds before handling equipment, and verify active GFCI protection.');
    }

    if (isMobileEquipment && environmentalFactors.includes('low_visibility')) {
      interactions.push('compound_critical: mobile_equipment_in_low_visibility');
      escalationRisks.push('COMPOUND CRITICAL RISK: Operating heavy mobile machinery in dim or night environments exponentially increases blind-spot pedestrian strike hazards.');
      reviewFocus.push('IMMEDIATE CORRECTION REQUIRED: Enforce a strict pedestrian exclusion zone, verify equipment flashing strobe lights are active, and designate dedicated spotters.');
    }

    if (isConfined && environmentalFactors.includes('wet_conditions')) {
      interactions.push('compound_risk: confined_space_wet_conditions');
      escalationRisks.push('COMPOUND RISK: Wet or flooded conditions inside a permit-required confined space multiply engulfment, slippery footing, and electrical tool shock hazards.');
      reviewFocus.push('IMMEDIATE CORRECTION REQUIRED: Pump out standing water, utilize low-voltage (24V) or pneumatic lighting/tools, and continuous ventilation.');
    }

    if (isLoto && environmentalFactors.includes('external_personnel')) {
      interactions.push('compound_risk: contractor_loto_coordination');
      escalationRisks.push('COMPOUND RISK: Multi-employer contractor operations during energy isolation introduce critical communications gaps and risk of premature lock removal.');
      reviewFocus.push('IMMEDIATE CORRECTION REQUIRED: Standardize Group Lockout/Tagout procedures, mandate individual contractor safety locks on the lockout box, and run dual-sign-off verification.');
    }

    let interactionSeverity = 'none';
    if (interactions.some(i => i.startsWith('compound_critical'))) {
      interactionSeverity = 'CRITICAL COMPOUND THREAT';
    } else if (interactions.some(i => i.startsWith('compound_risk')) || interactions.some(i => i.startsWith('environmental_hazard'))) {
      interactionSeverity = 'HIGH COMPOUND RISK';
    } else if (interactions.length >= 2) {
      interactionSeverity = 'ELEVATED';
    } else if (interactions.length === 1) {
      interactionSeverity = 'MODERATE';
    }

    return {
      interactions,
      escalationRisks,
      reviewFocus,
      interactionSeverity,
      interactionSummary:
        interactions.length > 0
          ? 'SafeScope detected compounding situational and cross-domain interaction patterns that elevate risk dynamics.'
          : 'No cross-domain interaction pattern detected from available domain intelligence.',
    };
  }
}
