export const RISK_MATRIX = {
  severity: {
    minor: 1,
    moderate: 2,
    serious: 3,
    major: 4,
    critical: 5,
  },

  likelihood: {
    rare: 1,
    unlikely: 2,
    possible: 3,
    likely: 4,
    frequent: 5,
  },

  fatalityPotential: {
    low: 1,
    medium: 2,
    high: 3,
  },

  exposureFrequency: {
    isolated: 1,
    periodic: 2,
    routine: 3,
    constant: 4,
  },

  environmentMultiplier: {
    office: 0.8,
    warehouse: 1.0,
    manufacturing: 1.2,
    construction: 1.35,
    mining: 1.5,
  },

  imminentDangerTriggers: [
    'live wire',
    'open edge',
    'unguarded conveyor',
    'confined space',
    'mobile equipment traffic',
    'energized panel',
    'fall protection missing',
  ],
};
