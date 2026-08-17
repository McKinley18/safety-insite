/**
 * V5-C01 (finding-scoped risk). Maps a decomposed hazard's machine-derived family/domain
 * key (e.g. "machine_guarding") to the classification label risk/risk-engine.ts'
 * evaluateRisk() already recognizes for its severity/fatality-potential boosts (e.g.
 * "Machine Guarding"). This is purely additive local data -- it does not modify
 * risk-engine.ts, the classifier, or the decomposition engine. An unmapped family falls
 * back gracefully to a title-cased version of the raw key, which evaluateRisk() treats
 * as an unrecognized classification (moderate defaults) rather than an error.
 */
export const HAZARD_FAMILY_RISK_CLASSIFICATION: Record<string, string> = {
  electrical: 'Electrical',
  machine_guarding: 'Machine Guarding',
  machine_guarding_loto: 'Machine Guarding',
  lockout_tagout: 'Lockout / Stored Energy',
  fall_protection: 'Fall Protection',
  falls: 'Fall',
  confined_space: 'Confined Space',
  fire_protection: 'Fire / Explosion',
  emergency_egress: 'Emergency Egress',
  compressed_gas: 'Compressed Gas Cylinders',
  compressed_gas_cylinders: 'Compressed Gas Cylinders',
  mobile_equipment: 'Mobile Equipment / Traffic',
  powered_industrial_trucks: 'Powered Mobile Equipment',
  powered_mobile_equipment: 'Powered Mobile Equipment',
  suspended_loads: 'Mobile Equipment / Traffic',
  rigging_lifting: 'Mobile Equipment / Traffic',
  housekeeping: 'Housekeeping',
  walking_working_surfaces: 'Housekeeping',
  excavation_trenching: 'Confined Space',
};

export function hazardFamilyToRiskClassification(hazardFamily: string | undefined | null): string {
  const key = String(hazardFamily || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (!key) return 'Review Required';
  if (HAZARD_FAMILY_RISK_CLASSIFICATION[key]) return HAZARD_FAMILY_RISK_CLASSIFICATION[key];
  return key
    .split('_')
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}
