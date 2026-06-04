export type IndustryMode = 'MSHA' | 'OSHA_GENERAL_INDUSTRY' | 'OSHA_CONSTRUCTION';

export type StandardIntelligenceProfile = {
  citation: string;
  agency: 'MSHA' | 'OSHA';
  industryModes: IndustryMode[];
  hazardFamilies: string[];
  equipment: string[];
  components: string[];
  conditions: string[];
  exposureTriggers: string[];
  fieldPhrases: string[];
  exclusions: string[];
  severityHint: 'low' | 'moderate' | 'high' | 'critical';
  correctiveThemes: string[];
};

export const STANDARD_INTELLIGENCE_PROFILES: StandardIntelligenceProfile[] = [
  {
    citation: '30 CFR 56.14107',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['guarding', 'machine_guarding', 'conveyor_guarding'],
    equipment: ['conveyor', 'crusher', 'screen plant', 'belt drive', 'pulley', 'shaft'],
    components: ['tail pulley', 'head pulley', 'takeup pulley', 'drive belt', 'shaft', 'coupling', 'fan blade'],
    conditions: ['missing guard', 'removed guard', 'unguarded', 'exposed moving parts', 'pinch point'],
    exposureTriggers: ['worker access', 'adjacent walkway', 'contact exposure', 'running equipment', 'maintenance access'],
    fieldPhrases: [
      'tail pulley missing guard',
      'conveyor tail pulley no guard',
      'unguarded conveyor pulley',
      'belt drive uncovered',
      'pinch point exposed',
      'guard removed from conveyor',
      'moving parts exposed',
      'pulley exposed near walkway'
    ],
    exclusions: ['locked out and removed from service', 'guard installed', 'no worker exposure'],
    severityHint: 'high',
    correctiveThemes: ['install guard', 'remove from service until guarded', 'verify guard construction']
  },
  {
    citation: '30 CFR 56.14109',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['conveyor_guarding', 'travelway'],
    equipment: ['conveyor'],
    components: ['travelway', 'walkway', 'emergency stop', 'pull cord'],
    conditions: ['unguarded conveyor adjacent travelway', 'no emergency stop', 'unguarded conveyor walkway'],
    exposureTriggers: ['adjacent travelway', 'fall against conveyor', 'worker travel route'],
    fieldPhrases: [
      'unguarded conveyor next to walkway',
      'conveyor beside travelway no guard',
      'no pull cord by conveyor walkway',
      'conveyor travelway exposure'
    ],
    exclusions: ['not adjacent to travelway', 'guarded conveyor', 'emergency stop present'],
    severityHint: 'high',
    correctiveThemes: ['install emergency stop', 'guard conveyor', 'restrict travelway access']
  },
  {
    citation: '30 CFR 56.11003',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['access', 'ladders'],
    equipment: ['ladder', 'fixed ladder', 'portable ladder', 'stairs', 'platform'],
    components: ['rung', 'side rail', 'handrail', 'step'],
    conditions: ['damaged ladder', 'bent side rail', 'broken rung', 'unsafe access'],
    exposureTriggers: ['worker climbing', 'access route', 'elevated access'],
    fieldPhrases: [
      'busted ladder rung',
      'bent ladder side rail',
      'damaged ladder at crusher platform',
      'ladder unsafe to climb',
      'broken rung on access ladder'
    ],
    exclusions: ['ladder removed from service', 'no access required'],
    severityHint: 'high',
    correctiveThemes: ['remove ladder from service', 'repair or replace ladder', 'provide safe access']
  },
  {
    citation: '30 CFR 56.12004',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['electrical'],
    equipment: ['extension cord', 'electrical cable', 'panel', 'junction box', 'conductor'],
    components: ['insulation', 'conductor', 'cord jacket', 'panel cover'],
    conditions: ['damaged insulation', 'exposed conductor', 'frayed cord', 'electrical damage'],
    exposureTriggers: ['energized', 'wet location', 'worker contact', 'temporary power'],
    fieldPhrases: [
      'frayed electrical cord',
      'cord insulation torn',
      'exposed conductor',
      'damaged extension cord',
      'wet cord in walkway',
      'wire insulation damaged'
    ],
    exclusions: ['deenergized and locked out', 'cord removed from service'],
    severityHint: 'critical',
    correctiveThemes: ['remove damaged cord', 'repair electrical defect', 'protect from wet conditions']
  },
  {
    citation: '30 CFR 56.14105',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['lockout', 'energy_control'],
    equipment: ['crusher', 'conveyor', 'screen plant', 'mobile equipment', 'machinery'],
    components: ['power source', 'hydraulic energy', 'stored energy'],
    conditions: ['no lockout', 'working on energized equipment', 'clearing jam without lockout'],
    exposureTriggers: ['maintenance', 'repair', 'clearing jam', 'unexpected startup'],
    fieldPhrases: [
      'no lockout clearing crusher jam',
      'working on conveyor without lockout',
      'maintenance without lockout',
      'power not isolated',
      'crusher jam cleared while energized'
    ],
    exclusions: ['locked out', 'blocked against motion', 'verified zero energy'],
    severityHint: 'critical',
    correctiveThemes: ['lock out equipment', 'verify zero energy', 'block against hazardous motion']
  },
  {
    citation: '30 CFR 56.5001',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['health', 'respiratory', 'dust'],
    equipment: ['crusher', 'screen plant', 'drill', 'conveyor transfer point'],
    components: ['dust collector', 'water spray', 'ventilation'],
    conditions: ['excessive dust', 'visible dust cloud', 'airborne contaminant'],
    exposureTriggers: ['worker breathing zone', 'poor visibility', 'dry crushing', 'inadequate controls'],
    fieldPhrases: [
      'crusher dust cloud',
      'excessive dust at screen plant',
      'dust blocking visibility',
      'silica dust exposure',
      'no water spray dust'
    ],
    exclusions: ['dust controls effective', 'no worker exposure'],
    severityHint: 'high',
    correctiveThemes: ['restore dust control', 'use water spray', 'evaluate respiratory exposure']
  },
  {
    citation: '30 CFR 56.4201',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['fire', 'emergency'],
    equipment: ['fire extinguisher', 'fuel storage', 'service truck', 'hot work area'],
    components: ['extinguisher', 'access path', 'inspection tag'],
    conditions: ['blocked extinguisher', 'missing extinguisher', 'not readily accessible'],
    exposureTriggers: ['fire response delay', 'hot work', 'fuel area'],
    fieldPhrases: [
      'fire extinguisher blocked',
      'extinguisher not accessible',
      'blocked fire bottle',
      'missing extinguisher at fuel area'
    ],
    exclusions: ['extinguisher accessible', 'not required at location'],
    severityHint: 'moderate',
    correctiveThemes: ['clear extinguisher access', 'replace missing extinguisher', 'inspect extinguisher']
  },
  {
    citation: '30 CFR 56.20003',
    agency: 'MSHA',
    industryModes: ['MSHA'],
    hazardFamilies: ['housekeeping', 'slips_trips'],
    equipment: ['walkway', 'shop floor', 'stairs', 'platform'],
    components: ['walking surface', 'floor', 'stairs'],
    conditions: ['oil spill', 'debris', 'slip hazard', 'trip hazard'],
    exposureTriggers: ['worker walkway', 'poor traction', 'frequent access'],
    fieldPhrases: [
      'oil slick on stairs',
      'oil spill on walkway',
      'trash in walkway',
      'trip hazard by shop entrance',
      'debris on platform'
    ],
    exclusions: ['area barricaded', 'spill cleaned'],
    severityHint: 'moderate',
    correctiveThemes: ['clean spill', 'remove debris', 'maintain safe walking surface']
  },
  {
    citation: '29 CFR 1910.212',
    agency: 'OSHA',
    industryModes: ['OSHA_GENERAL_INDUSTRY'],
    hazardFamilies: ['guarding', 'machine_guarding'],
    equipment: ['machine', 'press', 'belt drive', 'pulley', 'shaft', 'fan'],
    components: ['point of operation', 'rotating part', 'ingoing nip point'],
    conditions: ['unguarded machine', 'exposed moving parts', 'missing guard'],
    exposureTriggers: ['operator exposure', 'contact exposure', 'normal operation'],
    fieldPhrases: [
      'machine guard missing',
      'exposed rotating shaft',
      'belt drive uncovered',
      'point of operation unguarded'
    ],
    exclusions: ['guard installed', 'no employee exposure'],
    severityHint: 'high',
    correctiveThemes: ['install machine guarding', 'guard point of operation', 'restrict access']
  },
  {
    citation: '29 CFR 1910.303',
    agency: 'OSHA',
    industryModes: ['OSHA_GENERAL_INDUSTRY'],
    hazardFamilies: ['electrical'],
    equipment: ['electrical equipment', 'panel', 'cord', 'junction box'],
    components: ['wiring', 'insulation', 'cover', 'conductor'],
    conditions: ['electrical hazard', 'damaged wiring', 'exposed conductor'],
    exposureTriggers: ['energized', 'wet location', 'worker contact'],
    fieldPhrases: [
      'frayed extension cord',
      'exposed electrical conductor',
      'panel cover missing',
      'wet electrical cord'
    ],
    exclusions: ['deenergized', 'removed from service'],
    severityHint: 'critical',
    correctiveThemes: ['repair electrical hazard', 'remove damaged equipment', 'protect conductors']
  },
  {
    citation: '29 CFR 1926.501',
    agency: 'OSHA',
    industryModes: ['OSHA_CONSTRUCTION'],
    hazardFamilies: ['fall_protection'],
    equipment: ['roof', 'leading edge', 'platform', 'scaffold'],
    components: ['open edge', 'walking working surface', 'guardrail'],
    conditions: ['no fall protection', 'unprotected edge', 'missing guardrail'],
    exposureTriggers: ['height exposure', 'worker at edge', 'construction activity'],
    fieldPhrases: [
      'worker near roof edge without tie off',
      'open edge no fall protection',
      'no harness on elevated work',
      'missing guardrail at leading edge'
    ],
    exclusions: ['fall protection provided', 'edge protected'],
    severityHint: 'critical',
    correctiveThemes: ['provide fall protection', 'install guardrail', 'use personal fall arrest']
  }
];
