export const HAZLENZ_HAZARD_FAMILY_ALIASES: Record<string, string> = {
  electrical: 'electrical',
  'machine guarding': 'machine_guarding',
  machine_guarding: 'machine_guarding',
  machine: 'machine_guarding',
  'lockout / stored energy': 'lockout_tagout',
  lockout_tagout: 'lockout_tagout',
  loto: 'lockout_tagout',
  'walking/working surfaces': 'walking_working_surfaces',
  'walking-working surfaces': 'walking_working_surfaces',
  walking_working_surfaces: 'walking_working_surfaces',
  housekeeping: 'walking_working_surfaces',
  slip_trip_fall: 'walking_working_surfaces',
  'hazard communication': 'hazard_communication',
  hazard_communication: 'hazard_communication',
  hazcom: 'hazard_communication',
  hazardous_materials: 'hazard_communication',
  'compressed gas cylinders': 'compressed_gas',
  compressed_gas_cylinders: 'compressed_gas',
  compressed_gas: 'compressed_gas',
  'fall protection': 'fall_protection',
  fall_protection: 'fall_protection',
  fall: 'fall_protection',
  'mobile equipment / traffic': 'mobile_equipment',
  'powered mobile equipment': 'mobile_equipment',
  mobile_equipment: 'mobile_equipment',
  ppe: 'personal_protective_equipment',
  personal_protective_equipment: 'personal_protective_equipment',
};

export function resolveCanonicalHazardFamily(value: string): string {
  const normalized = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return HAZLENZ_HAZARD_FAMILY_ALIASES[normalized] || normalized.replace(/[\s/-]+/g, '_');
}
