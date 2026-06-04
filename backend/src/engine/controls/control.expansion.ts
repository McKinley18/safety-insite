const HazardControlMap: Record<string, string[]> = {
  // FALL
  fall_hazard: ["fall_protection", "harness", "tie_off", "anchor_point"],

  // ELECTRICAL
  electrical_hazard: ["lockout_tagout", "insulated_tools", "ground_fault_protection"],

  // FIRE
  fire_hazard: ["fire_extinguisher", "fire_watch", "proper_storage"],

  // MOBILE EQUIPMENT
  struck_by: ["high_visibility", "equipment_separation", "warning_systems"],
  caught_between: ["machine_guarding", "lockout_tagout", "safe_clearance"],

  // CONFINED SPACE
  confined_space: ["permit_system", "atmospheric_testing", "attendant"],

  // AIR
  silica_exposure: ["respiratory_protection", "dust_control"],
  ventilation_issue: ["ventilation_system", "air_monitoring"],

  // CHEMICAL
  chemical_exposure: ["chemical_ppe", "spill_control", "labeling"],

  // NOISE
  noise_exposure: ["hearing_protection"],

  // SLIP/TRIP
  slip_trip: ["housekeeping", "walking_surfaces"]
};

export function expandControlsFromHazards(hazards: string[]) {
  return hazards.flatMap(h => HazardControlMap[h] || []);
}
