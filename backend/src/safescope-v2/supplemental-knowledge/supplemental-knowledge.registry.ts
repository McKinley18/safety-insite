export type SupplementalAuthorityTier =
  | 'primary_enforceable'
  | 'incorporated_by_reference'
  | 'supplemental_consensus'
  | 'industry_guidance'
  | 'company_policy';

export type SupplementalKnowledgeEntry = {
  id: string;
  family:
    | 'hazard_communication'
    | 'compressed_gas'
    | 'electrical'
    | 'machine_guarding'
    | 'lockout_tagout'
    | 'walking_working_surfaces'
    | 'fall_protection'
    | 'fire_emergency'
    | 'industrial_hygiene'
    | 'mobile_equipment'
    | 'mining';
  authorityName: string;
  authorityTier: SupplementalAuthorityTier;
  shortUse: string;
  applicabilityGuardrail: string;
  reasoningUses: string[];
};

export const HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY: SupplementalKnowledgeEntry[] = [
  {
    id: 'nfpa_fire_chemical_storage',
    family: 'hazard_communication',
    authorityName: 'NFPA fire and chemical storage guidance',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports fire, flammable-liquid, compatibility, storage, and emergency-control reasoning.',
    applicabilityGuardrail:
      'Use as supplemental guidance unless adopted by regulation, local fire code, AHJ requirement, contract, or company policy.',
    reasoningUses: ['chemical storage', 'flammable liquids', 'fire prevention', 'secondary containment', 'emergency response'],
  },
  {
    id: 'dot_hazmat_transport',
    family: 'hazard_communication',
    authorityName: 'DOT hazardous materials transportation requirements',
    authorityTier: 'primary_enforceable',
    shortUse: 'Supports hazardous-material transportation, shipping, marking, labeling, and packaging when transport is involved.',
    applicabilityGuardrail:
      'Use only when the observation involves transportation, shipment, packaging for transport, placarding, marking, or regulated hazmat movement.',
    reasoningUses: ['shipping', 'transportation', 'placarding', 'marking', 'hazmat packaging'],
  },
  {
    id: 'niosh_acgih_exposure_guidance',
    family: 'industrial_hygiene',
    authorityName: 'NIOSH/ACGIH exposure guidance',
    authorityTier: 'industry_guidance',
    shortUse: 'Supports exposure assessment, sampling, respiratory protection, and health-hazard reasoning.',
    applicabilityGuardrail:
      'Use as guidance unless the exposure limit or method is adopted by regulation, policy, or a qualified industrial hygiene program.',
    reasoningUses: ['dust', 'fumes', 'noise', 'heat stress', 'chemical exposure', 'sampling'],
  },
  {
    id: 'cga_compressed_gas_guidance',
    family: 'compressed_gas',
    authorityName: 'Compressed Gas Association guidance',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports cylinder storage, securing, valve protection, separation, and handling controls.',
    applicabilityGuardrail:
      'Use as supplemental guidance unless adopted by regulation, contract, supplier requirement, or company policy.',
    reasoningUses: ['cylinder storage', 'valve protection', 'securing cylinders', 'fuel gas separation'],
  },
  {
    id: 'nfpa_55_compressed_gases',
    family: 'compressed_gas',
    authorityName: 'NFPA 55 compressed gases guidance',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports compressed gas storage, quantity, separation, ventilation, and fire-protection reasoning.',
    applicabilityGuardrail:
      'Use as supplemental guidance unless adopted by local code, AHJ, regulation, contract, or company policy.',
    reasoningUses: ['compressed gas storage', 'separation', 'ventilation', 'fire protection'],
  },
  {
    id: 'nfpa_70_nec_electrical',
    family: 'electrical',
    authorityName: 'NFPA 70 / National Electrical Code',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports electrical installation, equipment listing, enclosure, wiring, and installation-integrity reasoning.',
    applicabilityGuardrail:
      'Use as supplemental guidance unless adopted by jurisdiction, code, contract, AHJ, or company policy.',
    reasoningUses: ['electrical installation', 'panel integrity', 'wiring methods', 'listing', 'enclosures'],
  },
  {
    id: 'nfpa_70e_electrical_safe_work',
    family: 'electrical',
    authorityName: 'NFPA 70E electrical safe work practices',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports electrical safe work, energized-work, shock/arc-flash, and qualified-person controls.',
    applicabilityGuardrail:
      'Use as supplemental safe-work guidance unless adopted by employer policy, contract, jurisdiction, or regulation.',
    reasoningUses: ['energized work', 'arc flash', 'shock exposure', 'qualified electrical work', 'PPE'],
  },
  {
    id: 'ansi_b11_machine_guarding',
    family: 'machine_guarding',
    authorityName: 'ANSI B11 machine safety guidance',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports machine guarding, risk reduction, safeguarding selection, and verification reasoning.',
    applicabilityGuardrail:
      'Use as supplemental guidance unless adopted by contract, manufacturer instruction, company policy, or regulation.',
    reasoningUses: ['machine guarding', 'safeguarding', 'risk reduction', 'verification'],
  },
  {
    id: 'ansi_assp_fall_protection',
    family: 'fall_protection',
    authorityName: 'ANSI/ASSP fall protection guidance',
    authorityTier: 'supplemental_consensus',
    shortUse: 'Supports fall-protection planning, equipment selection, inspection, anchorage, and rescue planning.',
    applicabilityGuardrail:
      'Use as supplemental guidance unless adopted by contract, manufacturer instruction, company policy, or regulation.',
    reasoningUses: ['fall arrest', 'guardrails', 'anchors', 'rescue planning', 'equipment inspection'],
  },
  {
    id: 'manufacturer_instructions_general',
    family: 'machine_guarding',
    authorityName: 'Manufacturer instructions and equipment manuals',
    authorityTier: 'industry_guidance',
    shortUse: 'Supports equipment-specific guarding, maintenance, inspection, and operating controls.',
    applicabilityGuardrail:
      'Use as supporting guidance and ask for manufacturer instructions when equipment-specific requirements matter.',
    reasoningUses: ['equipment-specific controls', 'maintenance', 'inspection', 'guarding', 'safe operation'],
  },
];
