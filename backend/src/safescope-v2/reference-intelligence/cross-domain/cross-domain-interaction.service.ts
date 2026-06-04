export class CrossDomainInteractionService {
  evaluate(input: {
    domainIntelligence?: Record<string, any>;
  }) {
    const domains = input.domainIntelligence || {};

    const interactions: string[] = [];
    const escalationRisks: string[] = [];
    const reviewFocus: string[] = [];

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

    const interactionSeverity =
      interactions.length >= 2
        ? 'high'
        : interactions.length === 1
          ? 'elevated'
          : 'none';

    return {
      interactions,
      escalationRisks,
      reviewFocus,
      interactionSeverity,
      interactionSummary:
        interactions.length > 0
          ? 'SafeScope detected interacting safety domains that may compound exposure, controls, or escalation pathways.'
          : 'No cross-domain interaction pattern detected from available domain intelligence.',
    };
  }
}
