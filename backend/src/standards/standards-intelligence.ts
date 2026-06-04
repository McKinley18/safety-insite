export type RoutedSiteType = 'mining' | 'construction' | 'general_industry' | 'mixed';

export const SYNONYM_GROUPS: Record<string, string[]> = {
  machine_guarding: [
    'unguarded', 'missing guard', 'guard removed', 'guard detached', 'pulley guard detached', 'guard bent', 'belt rubbing', 'side frame', 'exposed moving part',
    'rotating shaft', 'tail pulley', 'head pulley', 'pinch point', 'nip point',
    'belt drive', 'chain drive', 'sprocket', 'coupling', 'fan blade',
    'point of operation', 'press', 'machine hazard'
  ],
  lockout_tagout: [
    'loto', 'lock out', 'tag out', 'lockout', 'tagout', 'stored energy',
    'unexpected startup', 'energized equipment', 'maintenance while running'
  ],
  fall_protection: [
    'fall hazard', 'unprotected edge', 'leading edge', 'roof edge',
    'no guardrail', 'open side', 'elevated platform', 'working at height',
    'fall arrest', 'harness', 'lanyard', 'fall protection', 'tie off', 'roof'
  ],
  ladder_safety: [
    'ladder', 'extension ladder', 'portable ladder', 'step ladder',
    'not extended', 'three feet', '3 feet', 'landing access'
  ],
  excavation: [
    'trench', 'excavation', 'cave in', 'cave-in', 'shoring',
    'trench box', 'shielding', 'sloping', 'benching'
  ],
  scaffold: [
    'scaffold', 'scaffolding', 'platform', 'midrail', 'middle rail',
    'plank', 'guardrail', '2nd level'
  ],
  mobile_equipment: [
    'forklift', 'seat belt', 'haul truck', 'loader', 'backup alarm', 'reverse alarm',
    'weak sound', 'horn', 'audible warning', 'skid steer', 'powered industrial truck',
    'mobile equipment', 'aerial lift', 'bucket gate', 'not latched'
  ],
  electrical: [
    'frayed cord', 'damaged cord', 'exposed wire', 'missing ground',
    'electrical panel', 'panel', 'energized', '480 volt', 'missing screws', 'cover door', 'breaker', 'extension cord', 'temporary power', 'metal doorway', 'doorway damaged',
    'frayed conductor', 'electrical conductor', 'damaged conductor',
    'cable', 'mechanical damage'
  ],
  workplace_exam: [
    'workplace exam', 'working place exam', 'work place exam',
    'documented exam', 'exam record', 'pre shift exam', 'pre-shift exam',
    'shift examination', 'competent person exam', 'miners began work',
    'before miners began work', 'condition not recorded'
  ],
  housekeeping: [
    'housekeeping', 'debris', 'clutter', 'trip hazard', 'slip hazard',
    'oil spill', 'oil leak', 'floor grate', 'compressor', 'walking surface', 'walking-working surface', 'passageway',
    'blocked', 'boxes', 'shipping dock'
  ],
  exit_route: [
    'exit sign', 'exit route', 'blocked exit', 'blocked by boxes',
    'stack of boxes', 'shipping dock', 'egress', 'unobstructed'
  ],
  eye_face_protection: [
    'eye protection', 'face protection', 'safety glasses', 'face shield',
    'grinding', 'cutting', 'flying particles', 'concrete dust'
  ],
  impalement: [
    'rebar', 'impalement', 'impale', 'unprotected rebar', 'slab pour'
  ],
  respiratory: [
    'dust', 'respirable dust', 'respirable silica', 'silica', 'airborne contaminant',
    'crusher feed dust', 'high dust'
  ],
  roadway_berm: [
    'berm', 'missing berm', 'low berm', 'drop off', 'drop-off',
    'haul road edge', 'dump point', 'roadway edge'
  ],
};

export function expandObservationTerms(input: string): {
  expandedText: string;
  detectedHazardFamilies: string[];
} {
  const base = input.toLowerCase();
  const detectedHazardFamilies: string[] = [];
  const expanded: string[] = [base];

  for (const [family, terms] of Object.entries(SYNONYM_GROUPS)) {
    const matched = terms.some((term) => base.includes(term));
    if (matched) {
      detectedHazardFamilies.push(family);
      expanded.push(family.replace(/_/g, ' '), ...terms);
    }
  }

  return {
    expandedText: [...new Set(expanded)].join(' '),
    detectedHazardFamilies,
  };
}

export function routeJurisdiction(input: {
  siteType?: RoutedSiteType;
  observation: string;
  locationType?: string;
  equipmentType?: string;
  activityType?: string;
  detectedLabels?: string[];
}): {
  preferredScope: RoutedSiteType;
  reasons: string[];
} {
  if (input.siteType && input.siteType !== 'mixed') {
    return {
      preferredScope: input.siteType,
      reasons: [`User selected ${input.siteType} scope`],
    };
  }

  const text = [
    input.observation,
    input.locationType,
    input.equipmentType,
    input.activityType,
    ...(input.detectedLabels ?? []),
  ].filter(Boolean).join(' ').toLowerCase();

  const miningTerms = ['mine', 'pit', 'quarry', 'crusher', 'plant', 'haul road', 'berm', 'dump point', 'conveyor'];
  const constructionTerms = ['construction', 'roof', 'scaffold', 'trench', 'excavation', 'framing', 'leading edge'];
  const generalTerms = ['warehouse', 'manufacturing', 'shop', 'forklift', 'assembly', 'production line'];

  const miningScore = miningTerms.filter((t) => text.includes(t)).length;
  const constructionScore = constructionTerms.filter((t) => text.includes(t)).length;
  const generalScore = generalTerms.filter((t) => text.includes(t)).length;

  const scores = [
    { scope: 'mining' as RoutedSiteType, score: miningScore },
    { scope: 'construction' as RoutedSiteType, score: constructionScore },
    { scope: 'general_industry' as RoutedSiteType, score: generalScore },
  ].sort((a, b) => b.score - a.score);

  if (scores[0].score === 0 || scores[0].score === scores[1].score) {
    return {
      preferredScope: 'mixed',
      reasons: ['No clear jurisdiction from context; using mixed regulatory search'],
    };
  }

  return {
    preferredScope: scores[0].scope,
    reasons: [`Context suggests ${scores[0].scope} scope`],
  };
}
