export type SafeScopeStandardMapping = {
  citation: string;
  agency: 'MSHA' | 'OSHA';
  scope: 'msha' | 'osha_general' | 'osha_construction';
  rationale: string;
};

export const STANDARDS_MAPPING: Record<string, SafeScopeStandardMapping[]> = {
  Electrical: [
    {
      citation: '30 CFR 56.12016',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Electrical conductors exposed to mechanical damage',
    },
    {
      citation: '1910.303(b)(1)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Electric equipment must be free from recognized hazards',
    },
  ],

  "Machine Guarding": [
    {
      citation: '30 CFR 56.14107(a)',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Moving machine parts shall be guarded',
    },
    {
      citation: '1910.212(a)(1)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Machine guarding required for points of operation',
    },
    {
      citation: '1910.219',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Mechanical power-transmission apparatus must be guarded',
    },
  ],

  Machine: [
    {
      citation: '30 CFR 56.14107(a)',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Moving machine parts shall be guarded',
    },
    {
      citation: '1910.212(a)(1)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Machine guarding required for points of operation',
    },
  ],

  Fall: [
    {
      citation: '30 CFR 56.11012',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Openings above, below, or near travelways must be protected',
    },
    {
      citation: '1926.501(b)(1)',
      agency: 'OSHA',
      scope: 'osha_construction',
      rationale: 'Fall protection required for unprotected sides and edges',
    },
  ],

  PPE: [
    {
      citation: '1910.132(a)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Protective equipment required where hazards exist',
    },
    {
      citation: '1910.135(a)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Protective helmets required where head injury hazards exist',
    },
    {
      citation: '1910.133(a)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Eye and face protection required where hazards exist',
    },
  ],

  Housekeeping: [
    {
      citation: '1910.22(a)',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Walking-working surfaces must be maintained clean and orderly',
    },
    {
      citation: '30 CFR 56.20003',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Workplaces, passageways, and travelways must be kept clean and orderly',
    },
  ],

  'Powered Mobile Equipment': [
    {
      citation: '1910.178',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Powered industrial truck operation and safety requirements',
    },
    {
      citation: '30 CFR 56.9100',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Mobile equipment operators must maintain control of equipment',
    },
    {
      citation: '30 CFR 56.9200',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Traffic control and safe movement of equipment near persons',
    },
  ],

  'Mobile Equipment / Traffic': [
    {
      citation: '1910.178',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Powered industrial truck operation and safety requirements',
    },
    {
      citation: '30 CFR 56.9100',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Mobile equipment operators must maintain control of equipment',
    },
    {
      citation: '30 CFR 56.9200',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Traffic control and safe movement of equipment near persons',
    },
  ],

  'Hazard Communication': [
    {
      citation: '1910.1200',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Hazard communication requirements for chemical containers and labels',
    },
  ],

  "Confined Space": [
    {
      citation: '1910.146',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Permit-required confined space entry requirements',
    },
    {
      citation: '1926 Subpart AA',
      agency: 'OSHA',
      scope: 'osha_construction',
      rationale: 'Confined spaces in construction requirements',
    },
  ],

  "Fire / Explosion": [
    {
      citation: '1910.106',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Flammable liquids handling and storage requirements',
    },
    {
      citation: '1910.157',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Portable fire extinguisher requirements',
    },
    {
      citation: '30 CFR 56.4100',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Firefighting equipment requirements at surface metal/nonmetal mines',
    },
  ],

  "Lockout / Stored Energy": [
    {
      citation: '1910.147',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Control of hazardous energy during servicing and maintenance',
    },
    {
      citation: '30 CFR 56.12016',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Electrical work must be de-energized before work is performed',
    },
    {
      citation: '30 CFR 56.14105',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Repairs or maintenance must not be performed until machinery is blocked against hazardous motion',
    },
  ],

  "Respirable Dust / Silica": [
    {
      citation: '1910.1053',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Respirable crystalline silica exposure controls',
    },
    {
      citation: '1926.1153',
      agency: 'OSHA',
      scope: 'osha_construction',
      rationale: 'Respirable crystalline silica in construction',
    },
    {
      citation: '30 CFR 56.5001',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Exposure limits for airborne contaminants',
    },
  ],

  "Emergency Egress": [
    {
      citation: '1910.36',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Design and construction requirements for exit routes',
    },
    {
      citation: '1910.37',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Maintenance, safeguards, and operational features for exit routes',
    },
  ],

  Access: [
    {
      citation: '30 CFR 56.11001',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Safe access must be provided and maintained',
    },
  ],

  "Trenching & Shoring": [
    {
      citation: '1926.651',
      agency: 'OSHA',
      scope: 'osha_construction',
      rationale: 'Specific excavation requirements and cave-in protection',
    },
    {
      citation: '1926.652',
      agency: 'OSHA',
      scope: 'osha_construction',
      rationale: 'Requirements for protective systems in excavations',
    },
  ],

  "Lifting & Rigging": [
    {
      citation: '1910.184',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Sling safety requirements and visual inspection daily',
    },
    {
      citation: '1926.251',
      agency: 'OSHA',
      scope: 'osha_construction',
      rationale: 'Rigging equipment for material handling requirements',
    },
    {
      citation: '30 CFR 56.16007',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Hoisting hook safety latches and strap safety requirements',
    },
  ],

  "Material Handling": [
    {
      citation: '1910.101',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Compressed gas cylinder storage, handling, and security',
    },
    {
      citation: '30 CFR 56.16005',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'Securing gas cylinders upright with chains and caps',
    },
    {
      citation: '30 CFR 56.13021',
      agency: 'MSHA',
      scope: 'msha',
      rationale: 'High-pressure air hose safety chains or whipchecks',
    },
  ],

  "Powered Industrial Trucks": [
    {
      citation: '1910.178',
      agency: 'OSHA',
      scope: 'osha_general',
      rationale: 'Powered industrial truck operator training and safety seatbelts',
    },
  ],
};
