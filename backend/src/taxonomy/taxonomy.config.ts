export const SEVERITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4,
  CRITICAL: 5,
};

export const HAZARD_CATEGORIES = [
  { code: 'fall_hazard', label: 'Fall Hazard' },
  { code: 'electrical', label: 'Electrical' },
  { code: 'chemical', label: 'Chemical' },
  { code: 'mechanical', label: 'Mechanical' },
];

export const CLASSIFICATION_RULES = [
  { code: 'fall_hazard', keywords: ['trip', 'fall', 'slip', 'ladder', 'height'], severity: 3 },
  { code: 'electrical', keywords: ['wire', 'spark', 'shock', 'electric', 'short'], severity: 4 },
  { code: 'chemical', keywords: ['spill', 'acid', 'chemical', 'toxic', 'fume'], severity: 4 },
  { code: 'mechanical', keywords: ['crush', 'gear', 'conveyor', 'machine', 'jam'], severity: 3 },
];
