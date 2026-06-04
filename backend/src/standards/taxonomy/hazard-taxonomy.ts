export const HAZARD_TAXONOMY = [
  {
    category: 'Fall Protection',
    keywords: ['fall', 'edge', 'unguarded', 'platform', 'opening', 'elevated'],
    msha: {
      surface: ['56.11012', '56.15005'],
      underground: ['57.11012', '57.15005'],
    },
    osha: ['1910.23', '1926.501'],
  },
  {
    category: 'Electrical',
    keywords: ['electric', 'energized', 'wiring', 'shock', 'panel'],
    msha: {
      surface: ['56.12004'],
      underground: ['57.12004'],
    },
    osha: ['1910.303', '1910.269'],
  },
  {
    category: 'Mobile Equipment',
    keywords: ['truck', 'vehicle', 'loader', 'haul', 'mobile equipment'],
    msha: {
      surface: ['56.14100', '56.14200'],
      underground: ['57.14100', '57.14200'],
    },
    osha: ['1910.178'],
  },
  {
    category: 'Confined Space',
    keywords: ['confined space', 'tank', 'permit space', 'vessel'],
    msha: {
      surface: ['56.18002'],
      underground: ['57.18002'],
    },
    osha: ['1910.146'],
  },
  {
    category: 'Ventilation',
    keywords: ['ventilation', 'airflow', 'dust', 'fume'],
    msha: {
      surface: ['56.5000'],
      underground: ['57.5000'],
    },
    osha: ['1910.94'],
  }
];
