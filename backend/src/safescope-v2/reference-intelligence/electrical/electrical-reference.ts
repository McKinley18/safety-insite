export const ELECTRICAL_REFERENCE = {
  domain: 'electrical_safety',

  indicators: [
    'electrical',
    'energized',
    'panel',
    'breaker',
    'switchgear',
    'arc flash',
    'arc blast',
    'shock',
    'exposed conductor',
    'temporary wiring',
    'extension cord',
    'gfci',
    'lockout',
    'de-energized',
    'voltage',
    'live parts',
    'junction box',
  ],

  hazardModes: [
    'electric shock',
    'arc flash',
    'arc blast',
    'electrocution',
    'burn injury',
    'unexpected energization',
    'fire ignition',
  ],

  requiredControls: [
    'de-energize before work',
    'verify absence of voltage',
    'lockout tagout',
    'qualified person verification',
    'arc flash PPE',
    'maintain approach boundaries',
    'ground fault protection',
    'proper guarding/enclosures',
    'inspect cords and wiring',
  ],

  failureModes: [
    'panel left energized',
    'missing electrical cover',
    'exposed live parts',
    'improper temporary wiring',
    'damaged extension cord',
    'no GFCI protection',
    'work performed by unqualified personnel',
    'absence of voltage not verified',
  ],

  escalationPatterns: [
    'worker contacts energized component',
    'arc flash during troubleshooting',
    'damaged insulation progresses to shock hazard',
    'temporary wiring exposed to wet conditions',
    'electrical fire propagation',
  ],

  standards: {
    OSHA_GENERAL_INDUSTRY: [
      '29 CFR 1910 Subpart S',
      '29 CFR 1910.333',
      '29 CFR 1910.335',
    ],
    OSHA_CONSTRUCTION: [
      '29 CFR 1926 Subpart K',
      '29 CFR 1926.416',
      '29 CFR 1926.417',
    ],
    MSHA: [
      '30 CFR 56.12004',
      '30 CFR 56.12016',
      '30 CFR 57.12004',
      '30 CFR 57.12016',
    ],
  },
};
