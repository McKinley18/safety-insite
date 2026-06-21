export const HAZLENZ_HAZARD_FAMILY_ALIASES: Record<string, string> = {
  electrical: 'electrical',
  'machine guarding': 'machine_guarding',
  machine_guarding: 'machine_guarding',
  machine: 'machine_guarding',
  'lockout / stored energy': 'lockout_tagout',
  lockout_tagout: 'lockout_tagout',
  machine_guarding_loto: 'lockout_tagout',
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
  health_respiratory: 'respirable_dust_silica',
  'respirable dust / silica': 'respirable_dust_silica',
  noise_exposure: 'noise_exposure',
  heat_stress: 'heat_stress',
  ergonomics: 'ergonomics',
  cranes_rigging_hoisting: 'cranes_rigging_hoisting',
  lifting_rigging: 'cranes_rigging_hoisting',
  fire_protection: 'fire_protection',
  'fire / explosion': 'fire_protection',
  welding_cutting_hot_work: 'fire_protection',
  cold_stress: 'cold_stress',
  emergency_preparedness: 'emergency_egress',
  'emergency egress': 'emergency_egress',
  confined_space: 'confined_space',
  excavation_trenching: 'excavation_trenching',
  dropped_objects: 'dropped_objects',
  ground_control: 'ground_control',
  roof_rib_control: 'ground_control',
  water_drowning: 'water_drowning',
  environmental_release: 'environmental_release',
  'fall protection': 'fall_protection',
  fall_protection: 'fall_protection',
  fall: 'fall_protection',
  'mobile equipment / traffic': 'mobile_equipment',
  'powered mobile equipment': 'mobile_equipment',
  mobile_equipment: 'mobile_equipment',
  ppe: 'personal_protective_equipment',
  personal_protective_equipment: 'personal_protective_equipment',
  cranes_hoists_rigging: 'cranes_rigging_hoisting',
  material_handling: 'ergonomics',
};

export function resolveCanonicalHazardFamily(value: string, observation = ''): string {
  const normalized = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const context = String(observation || '').toLowerCase();
  if (normalized === 'health_exposure' && /\b(noise|loud|hearing|decibel|dba|dosimetry)\b/.test(context)) {
    return 'noise_exposure';
  }
  if (normalized === 'environmental_exposure' && /\b(heat|hot|shade|water|acclimat|wbgt)\b/.test(context)) {
    return 'heat_stress';
  }
  if (normalized === 'environmental_exposure' && /\b(cold|freezing|frostbite|hypothermia|wind chill)\b/.test(context)) {
    return 'cold_stress';
  }
  return HAZLENZ_HAZARD_FAMILY_ALIASES[normalized] || normalized.replace(/[\s/-]+/g, '_');
}
