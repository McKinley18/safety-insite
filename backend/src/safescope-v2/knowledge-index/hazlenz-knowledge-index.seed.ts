import { KnowledgeEntry } from './hazlenz-knowledge-index.types';

export const KNOWLEDGE_MANIFEST: KnowledgeEntry[] = [
  {
    jurisdiction: 'msha',
    hazardFamily: 'conveyors',
    equipmentFamily: 'conveyor',
    taskMechanism: 'guarding',
    bundleIds: ['bundle-msha-conveyor-guarding'],
    sourceKeys: ['msha-30-cfr-56-14107'],
    approvedOnly: true,
    tier: 'pro'
  },
  {
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'electrical',
    equipmentFamily: 'electrical_panel',
    taskMechanism: 'electrical_contact',
    bundleIds: ['bundle-osha-electrical-panel'],
    sourceKeys: ['osha-1910-303'],
    approvedOnly: true,
    tier: 'pro'
  },
  {
    jurisdiction: 'unclear',
    hazardFamily: 'mobile_equipment',
    equipmentFamily: 'mobile_equipment',
    taskMechanism: 'struck_by',
    bundleIds: ['bundle-general-mobile-eq'],
    sourceKeys: ['general-pedestrian-safety'],
    approvedOnly: true,
    tier: 'pro'
  },
  {
    jurisdiction: 'osha_construction',
    hazardFamily: 'fall_protection',
    equipmentFamily: 'platform',
    taskMechanism: 'fall_from_height',
    bundleIds: ['bundle-osha-fall-prot'],
    sourceKeys: ['osha-1926-501'],
    approvedOnly: true,
    tier: 'pro'
  },
  {
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'chemical_exposure',
    equipmentFamily: 'unknown',
    taskMechanism: 'chemical_exposure',
    bundleIds: ['bundle-osha-hazcom'],
    sourceKeys: ['osha-1910-1200'],
    approvedOnly: true,
    tier: 'basic'
  },
  {
    jurisdiction: 'msha',
    hazardFamily: 'lockout_tagout',
    equipmentFamily: 'unknown',
    taskMechanism: 'energy_isolation',
    bundleIds: ['bundle-msha-loto'],
    sourceKeys: ['msha-30-cfr-56-12016'],
    approvedOnly: true,
    tier: 'pro'
  }
];
