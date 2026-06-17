import { SafeScopeReasoningDomain, SafeScopeJurisdiction } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type StandardsApplicabilityEntry = {
  jurisdiction: SafeScopeJurisdiction;
  domain: SafeScopeReasoningDomain;
  primaryCitation: string;
  acceptableCitations: string[];
  rationale: string;
};

export const STANDARDS_APPLICABILITY_REGISTRY: StandardsApplicabilityEntry[] = [
  {
    jurisdiction: 'osha_general_industry',
    domain: 'fire_protection',
    primaryCitation: '29 CFR 1910.157(c)(1)',
    acceptableCitations: ['29 CFR 1910.157(c)(1)', '29 CFR 1910.157'],
    rationale: 'OSHA general industry portable fire extinguisher availability, mounting, and access requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'fire_protection',
    primaryCitation: '29 CFR 1926.150(a)(1)',
    acceptableCitations: ['29 CFR 1926.150(a)(1)', '29 CFR 1926.150'],
    rationale: 'OSHA construction fire protection program and equipment availability requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'scaffolds',
    primaryCitation: '29 CFR 1926.451(g)(1)',
    acceptableCitations: ['29 CFR 1926.451(g)(1)', '29 CFR 1926.451'],
    rationale: 'OSHA construction scaffold fall protection and structural integrity requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'excavation_trenching',
    primaryCitation: '29 CFR 1926.652(a)(1)',
    acceptableCitations: ['29 CFR 1926.652(a)(1)', '29 CFR 1926.652', '29 CFR 1926.651'],
    rationale: 'OSHA construction excavation protective systems (shoring, shielding, sloping) requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'excavation_trenching',
    primaryCitation: '29 CFR 1926.651(c)(2)',
    acceptableCitations: ['29 CFR 1926.651(c)(2)', '29 CFR 1926.651(c)', '29 CFR 1926.651'],
    rationale: 'OSHA construction excavation access and egress stairway, ladder, ramp, or other safe means requirements for excavations 4 feet or more in depth.'
  },
  {
    jurisdiction: 'msha',
    domain: 'fire_protection',
    primaryCitation: '30 CFR 56.4201',
    acceptableCitations: ['30 CFR 56.4201', '30 CFR 57.4201'],
    rationale: 'MSHA surface and underground metal/nonmetal fire protection, extinguisher, and hot work requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'emergency_preparedness',
    primaryCitation: '29 CFR 1910.151(c)',
    acceptableCitations: ['29 CFR 1910.151(c)', '29 CFR 1910.151'],
    rationale: 'Emergency eyewash or shower access is required where employees may be exposed to injurious corrosive materials.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'hazcom' as SafeScopeReasoningDomain,
    primaryCitation: '29 CFR 1910.1200',
    acceptableCitations: ['29 CFR 1910.1200', '29 CFR 1910.1200(f)(1)'],
    rationale: 'Hazard Communication general chemical identity, labeling, SDS, and training requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'health_exposure' as SafeScopeReasoningDomain,
    primaryCitation: '29 CFR 1910.1030',
    acceptableCitations: ['29 CFR 1910.1030'],
    rationale: 'Bloodborne pathogen exposure control requirements for sharps or bodily-fluid exposure.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'bloodborne_pathogens' as SafeScopeReasoningDomain,
    primaryCitation: '29 CFR 1910.1030',
    acceptableCitations: ['29 CFR 1910.1030'],
    rationale: 'Bloodborne pathogen exposure control requirements for sharps or bodily-fluid exposure.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'industrial_hygiene' as SafeScopeReasoningDomain,
    primaryCitation: '29 CFR 1910.1000',
    acceptableCitations: ['29 CFR 1910.1000', '29 CFR 1910.1000(a)'],
    rationale: 'OSHA air contaminants standards governing exposure limits for toxic substances, dusts, gases, or vapors.'
  },
  {
    jurisdiction: 'msha',
    domain: 'industrial_hygiene' as SafeScopeReasoningDomain,
    primaryCitation: '30 CFR 56.5001',
    acceptableCitations: ['30 CFR 56.5001', '30 CFR 57.5001'],
    rationale: 'MSHA air contaminants limits and monitoring requirements for toxic gases, dusts, and chemical vapors.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'ergonomics' as SafeScopeReasoningDomain,
    primaryCitation: '29 CFR 1910.176(b)',
    acceptableCitations: ['29 CFR 1910.176(b)', '29 CFR 1910.176'],
    rationale: 'Secure storage and ergonomic handling guidelines to prevent lifting and materials handling strain injuries.'
  },
  {
    jurisdiction: 'msha',
    domain: 'ergonomics' as SafeScopeReasoningDomain,
    primaryCitation: '30 CFR 56.16007',
    acceptableCitations: ['30 CFR 56.16007', '30 CFR 57.16007'],
    rationale: 'MSHA safe materials handling guidelines to prevent physical strain injuries during manual handling.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'material_handling',
    primaryCitation: '29 CFR 1910.101(b)',
    acceptableCitations: ['29 CFR 1910.101(b)', '29 CFR 1910.101'],
    rationale: 'Compressed gas cylinders must be handled, stored, and used to prevent cylinder release or valve-damage hazards.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'welding_cutting_hot_work',
    primaryCitation: '29 CFR 1910.253(b)(2)(ii)',
    acceptableCitations: ['29 CFR 1910.253(b)(2)(ii)', '29 CFR 1910.253'],
    rationale: 'Oxygen and fuel-gas cylinder storage requires separation or equivalent fire-resistant barrier protection.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'slips_trips_falls',
    primaryCitation: '29 CFR 1926.1052(c)(1)',
    acceptableCitations: ['29 CFR 1926.1052(c)(1)', '29 CFR 1926.1052'],
    rationale: 'Construction stairway access requires stair rails or handrails when applicable.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'struck_by' as SafeScopeReasoningDomain,
    primaryCitation: '29 CFR 1926.501(c)',
    acceptableCitations: ['29 CFR 1926.501(c)'],
    rationale: 'Construction employees exposed to falling objects must be protected by controls such as toeboards, screens, barricades, or canopies.'
  },
  {
    jurisdiction: 'msha',
    domain: 'ventilation',
    primaryCitation: '30 CFR 57.8520',
    acceptableCitations: ['30 CFR 57.8520', '30 CFR 75.333'],
    rationale: 'Underground metal/nonmetal ventilation issues should distinguish Part 57 air-quality ventilation from underground coal methane ventilation controls.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'health_respiratory',
    primaryCitation: '29 CFR 1926.1153(c)(1)',
    acceptableCitations: ['29 CFR 1926.1153(c)(1)', '29 CFR 1926.1153'],
    rationale: 'OSHA construction respirable crystalline silica exposure control requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'hazardous_materials',
    primaryCitation: '29 CFR 1910.1200(f)(1)',
    acceptableCitations: ['29 CFR 1910.1200(f)(1)', '29 CFR 1910.1200'],
    rationale: 'OSHA Hazard Communication container labeling requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'confined_space',
    primaryCitation: '29 CFR 1910.146(c)(1)',
    acceptableCitations: ['29 CFR 1910.146(c)(1)', '29 CFR 1910.146'],
    rationale: 'OSHA permit-required confined space evaluation and entry-control requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'electrical',
    primaryCitation: '30 CFR 56.12004',
    acceptableCitations: ['30 CFR 56.12004'],
    rationale: 'MSHA electrical conductor protection requirements for damaged or exposed conductors.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'machine_guarding',
    primaryCitation: '29 CFR 1910.212(a)(3)(ii)',
    acceptableCitations: ['29 CFR 1910.212(a)(3)(ii)', '29 CFR 1910.212'],
    rationale: 'OSHA general industry point-of-operation guarding requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'roof_rib_control',
    primaryCitation: '30 CFR 75.202(a)',
    acceptableCitations: ['30 CFR 75.202(a)'],
    rationale: 'Underground coal roof, face, and ribs must be supported or otherwise controlled to protect persons from hazards related to falls of roof, face, or ribs.'
  },
  {
    jurisdiction: 'msha',
    domain: 'ventilation',
    primaryCitation: '30 CFR 75.333',
    acceptableCitations: ['30 CFR 75.333'],
    rationale: 'Underground coal ventilation controls must be maintained to control airflow and prevent hazardous accumulations.'
  },
  {
    jurisdiction: 'msha',
    domain: 'emergency_preparedness',
    primaryCitation: '30 CFR 75.380',
    acceptableCitations: ['30 CFR 75.380'],
    rationale: 'Underground coal escapeways must be maintained and available for safe emergency travel.'
  },
  {
    jurisdiction: 'msha',
    domain: 'machine_guarding_loto',
    primaryCitation: '30 CFR 56.14105',
    acceptableCitations: ['30 CFR 56.14105', '30 CFR 56.12016'],
    rationale: 'MSHA machinery blocking and power-off requirements during repairs or maintenance.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'machine_guarding_loto',
    primaryCitation: '29 CFR 1910.147(c)(1)',
    acceptableCitations: ['29 CFR 1910.147(c)(1)', '29 CFR 1910.147'],
    rationale: 'OSHA control of hazardous energy requirements for servicing and maintenance.'
  },
  {
    jurisdiction: 'msha',
    domain: 'mobile_equipment',
    primaryCitation: '30 CFR 56.9300',
    acceptableCitations: ['30 CFR 56.9300'],
    rationale: 'MSHA surface metal/nonmetal berms or guardrails on roadways where a drop-off hazard exists.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'mobile_equipment',
    primaryCitation: '29 CFR 1926.602(a)(9)',
    acceptableCitations: ['29 CFR 1926.602(a)(9)', '29 CFR 1926.601'],
    rationale: 'OSHA construction earthmoving/mobile equipment visibility, backup alarm, and struck-by control context.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'mobile_equipment',
    primaryCitation: '29 CFR 1910.178(l)',
    acceptableCitations: ['29 CFR 1910.178(l)', '29 CFR 1910.178'],
    rationale: 'Powered industrial truck operator training and safe operation/pedestrian interaction context.'
  },
  {
    jurisdiction: 'msha',
    domain: 'machine_guarding',
    primaryCitation: '30 CFR 56.14107',
    acceptableCitations: ['30 CFR 56.14107', '30 CFR 57.14107'],
    rationale: 'Mandatory machine guarding for rotating parts in mining.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'excavation_trenching',
    primaryCitation: '29 CFR 1926.652(a)(1)',
    acceptableCitations: ['29 CFR 1926.652(a)(1)'],
    rationale: 'Required protective systems for excavations 5 feet or deeper.'
  },
  {
    jurisdiction: 'msha',
    domain: 'ground_control',
    primaryCitation: '30 CFR 75.202(a)',
    acceptableCitations: ['30 CFR 75.202(a)'],
    rationale: 'Roof control requirements for underground mining.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'electrical',
    primaryCitation: '29 CFR 1910.303(g)(2)(i)',
    acceptableCitations: ['29 CFR 1910.303(g)(2)(i)'],
    rationale: 'Guarding of live parts for electrical equipment.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'electrical',
    primaryCitation: '29 CFR 1910.305(g)(1)(iii)',
    acceptableCitations: ['29 CFR 1910.305(g)(1)(iii)', '29 CFR 1910.305(g)', '29 CFR 1910.305'],
    rationale: 'OSHA general industry flexible cords and cables prohibited uses and damage protection.'
  },
  {
    jurisdiction: 'msha',
    domain: 'fall_protection',
    primaryCitation: '30 CFR 56.15005',
    acceptableCitations: ['30 CFR 56.15005', '30 CFR 56.11027'],
    rationale: 'MSHA surface metal/nonmetal fall protection and elevated work exposure controls.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'fall_protection',
    primaryCitation: '29 CFR 1926.501(b)(1)',
    acceptableCitations: ['29 CFR 1926.501(b)(1)', '29 CFR 1926.451(g)(4)'],
    rationale: 'OSHA construction fall protection for unprotected sides, edges, and scaffold guardrail exposure.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'scaffolds',
    primaryCitation: '29 CFR 1926.451(g)(4)',
    acceptableCitations: ['29 CFR 1926.451(g)(4)', '29 CFR 1926.451'],
    rationale: 'Scaffold guardrail requirements for elevated scaffold platforms.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'ladders',
    primaryCitation: '29 CFR 1926.1053(b)(1)',
    acceptableCitations: ['29 CFR 1926.1053(b)(1)', '29 CFR 1926.1053'],
    rationale: 'Portable ladder access and extension requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'slip_trip_fall',
    primaryCitation: '30 CFR 56.20003',
    acceptableCitations: ['30 CFR 56.20003', '30 CFR 56.20003(a)'],
    rationale: 'MSHA housekeeping and clean travelway requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'slip_trip_fall',
    primaryCitation: '29 CFR 1910.22(a)(2)',
    acceptableCitations: ['29 CFR 1910.22(a)(2)', '29 CFR 1910.22(a)'],
    rationale: 'OSHA general industry walking-working surface housekeeping and clean/dry surface requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'electrical',
    primaryCitation: '29 CFR 1910.303(g)(1)',
    acceptableCitations: ['29 CFR 1910.303(g)(1)', '29 CFR 1910.303(g)'],
    rationale: 'OSHA general industry workspace clearance and working space around electrical equipment.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'electrical',
    primaryCitation: '29 CFR 1910.305(b)(1)',
    acceptableCitations: ['29 CFR 1910.305(b)(1)', '29 CFR 1910.305(b)', '29 CFR 1910.305'],
    rationale: 'OSHA general industry dead-front integrity, inner covers, and enclosure opening requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'electrical',
    primaryCitation: '29 CFR 1910.333',
    acceptableCitations: ['29 CFR 1910.333', '29 CFR 1910.333(a)'],
    rationale: 'OSHA safety-related work practices, energized troubleshooting, and electrical isolation/testing.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'electrical',
    primaryCitation: '29 CFR 1926.404(b)(1)(ii)',
    acceptableCitations: ['29 CFR 1926.404(b)(1)(ii)', '29 CFR 1926.404(b)', '29 CFR 1926.404'],
    rationale: 'OSHA construction temporary wiring ground-fault protection (GFCI) or assured equipment grounding.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'ppe',
    primaryCitation: '29 CFR 1910.132(a)',
    acceptableCitations: ['29 CFR 1910.132(a)', '29 CFR 1910.133(a)(1)'],
    rationale: 'OSHA general industry personal protective equipment provision, use, and maintenance requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'ppe',
    primaryCitation: '29 CFR 1926.95(a)',
    acceptableCitations: ['29 CFR 1926.95(a)', '29 CFR 1926.102(a)(1)'],
    rationale: 'OSHA construction personal protective equipment provision, use, and criteria requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'ppe',
    primaryCitation: '30 CFR 56.15006',
    acceptableCitations: ['30 CFR 56.15006'],
    rationale: 'MSHA surface metal/nonmetal special protective equipment and protective clothing requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'mobile_equipment',
    primaryCitation: '29 CFR 1910.178(p)(1)',
    acceptableCitations: ['29 CFR 1910.178(p)(1)'],
    rationale: 'OSHA general industry powered industrial truck unsafe equipment removal and repair requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'mobile_equipment',
    primaryCitation: '29 CFR 1926.602(a)(9)(ii)',
    acceptableCitations: ['29 CFR 1926.602(a)(9)(ii)'],
    rationale: 'OSHA construction earthmoving equipment reverse signal alarm and spotter requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'mobile_equipment',
    primaryCitation: '30 CFR 56.9100(a)',
    acceptableCitations: ['30 CFR 56.9100(a)'],
    rationale: 'MSHA rules of the road surface mine traffic safety and rules of movement requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'powered_haulage',
    primaryCitation: '29 CFR 1910.178(p)(1)',
    acceptableCitations: ['29 CFR 1910.178(p)(1)'],
    rationale: 'OSHA general industry powered industrial truck unsafe equipment removal and repair requirements.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'powered_haulage',
    primaryCitation: '29 CFR 1926.602(a)(9)(ii)',
    acceptableCitations: ['29 CFR 1926.602(a)(9)(ii)'],
    rationale: 'OSHA construction earthmoving equipment reverse signal alarm and spotter requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'powered_haulage',
    primaryCitation: '30 CFR 56.9100(a)',
    acceptableCitations: ['30 CFR 56.9100(a)'],
    rationale: 'MSHA rules of the road surface mine traffic safety and rules of movement requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'walking_working_surfaces',
    primaryCitation: '29 CFR 1910.22',
    acceptableCitations: ['29 CFR 1910.22'],
    rationale: 'OSHA general industry walking-working surfaces housekeeping and condition requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'ladders',
    primaryCitation: '29 CFR 1910.23',
    acceptableCitations: ['29 CFR 1910.23'],
    rationale: 'OSHA general industry ladder maintenance and safe-use requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'fall_protection',
    primaryCitation: '29 CFR 1910.28',
    acceptableCitations: ['29 CFR 1910.28', '29 CFR 1910.29'],
    rationale: 'OSHA general industry fall protection duty and systems criteria.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'fall_protection',
    primaryCitation: '29 CFR 1926.501',
    acceptableCitations: ['29 CFR 1926.501', '29 CFR 1926.502'],
    rationale: 'OSHA construction fall protection requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'fall_protection',
    primaryCitation: '30 CFR 56.15005',
    acceptableCitations: ['30 CFR 56.15005'],
    rationale: 'MSHA surface mining safety belts and lines requirements for fall danger.'
  },
  {
    jurisdiction: 'msha',
    domain: 'access_safety',
    primaryCitation: '30 CFR 56.11001',
    acceptableCitations: ['30 CFR 56.11001'],
    rationale: 'MSHA safe access requirements for all working places.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'walking_working_surfaces',
    primaryCitation: '29 CFR 1910.22',
    acceptableCitations: ['29 CFR 1910.22'],
    rationale: 'OSHA general industry walking-working surfaces housekeeping and condition requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'ladders',
    primaryCitation: '29 CFR 1910.23',
    acceptableCitations: ['29 CFR 1910.23'],
    rationale: 'OSHA general industry ladder maintenance and safe-use requirements.'
  },
  {
    jurisdiction: 'osha_general_industry',
    domain: 'fall_protection',
    primaryCitation: '29 CFR 1910.28',
    acceptableCitations: ['29 CFR 1910.28', '29 CFR 1910.29'],
    rationale: 'OSHA general industry fall protection duty and systems criteria.'
  },
  {
    jurisdiction: 'osha_construction',
    domain: 'fall_protection',
    primaryCitation: '29 CFR 1926.501',
    acceptableCitations: ['29 CFR 1926.501', '29 CFR 1926.502'],
    rationale: 'OSHA construction fall protection requirements.'
  },
  {
    jurisdiction: 'msha',
    domain: 'fall_protection',
    primaryCitation: '30 CFR 56.15005',
    acceptableCitations: ['30 CFR 56.15005'],
    rationale: 'MSHA surface mining safety belts and lines requirements for fall danger.'
  },
  {
    jurisdiction: 'msha',
    domain: 'access_safety',
    primaryCitation: '30 CFR 56.11001',
    acceptableCitations: ['30 CFR 56.11001'],
    rationale: 'MSHA safe access requirements for all working places.'
  }
];
