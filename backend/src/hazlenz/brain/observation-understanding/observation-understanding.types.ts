export type HazLenzObservationEntityKind =
  | 'equipment'
  | 'emergency_equipment'
  | 'chemical_container'
  | 'walking_surface'
  | 'electrical_equipment'
  | 'mobile_equipment'
  | 'fall_exposure'
  | 'ppe'
  | 'tool'
  | 'material_storage'
  | 'environmental_condition'
  | 'hot_work'
  | 'confined_space'
  | 'excavation'
  | 'rigging_equipment'
  | 'egress'
  | 'unknown';

export type HazLenzObservationCondition =
  | 'blocked'
  | 'missing'
  | 'damaged'
  | 'not_legible'
  | 'unlabeled'
  | 'unguarded'
  | 'exposed'
  | 'not_accessible'
  | 'not_inspected'
  | 'defective'
  | 'unsecured'
  | 'unstable'
  | 'not_worn'
  | 'not_separated'
  | 'poor_visibility'
  | 'poor_air_quality'
  | 'unclear'
  | 'unknown';

export type HazLenzObservationJurisdictionHint =
  | 'msha'
  | 'osha_general_industry'
  | 'osha_construction'
  | 'unclear';

export type HazLenzObservationUnderstandingFinding = {
  entityKind: HazLenzObservationEntityKind;
  entityLabel: string;
  conditions: HazLenzObservationCondition[];
  taskSignals: string[];
  exposureSignals: string[];
  energySignals: string[];
  likelyDomainHints: string[];
  likelyMechanismHints: string[];
  jurisdictionHints: HazLenzObservationJurisdictionHint[];
  negativeDomainHints: string[];
  evidenceGaps: string[];
  confidence: 'high' | 'moderate' | 'low';
  reasonCodes: string[];
};

export type HazLenzObservationUnderstandingResult = {
  engine: 'safescope_observation_understanding_v1';
  mode: 'read_only_semantic_extraction';
  inputText: string;
  findings: HazLenzObservationUnderstandingFinding[];
  summary: {
    primaryEntityKind: HazLenzObservationEntityKind;
    primaryEntityLabel: string;
    primaryCondition: HazLenzObservationCondition;
    likelyDomainHints: string[];
    likelyMechanismHints: string[];
    negativeDomainHints: string[];
    evidenceGaps: string[];
    confidence: 'high' | 'moderate' | 'low';
  };
  boundary: {
    readOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotOverrideProductionDecision: true;
    requiresValidationBeforeRouting: true;
  };
};
