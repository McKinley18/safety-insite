export const hazardControlMap: Record<string, string[]> = {
  // FALL
  fall_hazard_from_lift: ["fall_protection", "harness", "tie_off", "anchor_point"],
  fall_hazard_general: ["fall_protection"],

  // FIRE
  missing_fire_extinguisher_on_lift: ["fire_extinguisher"],

  // ELECTRICAL
  electrical_exposure: ["lockout_tagout", "ppe"],

  // MOBILE EQUIPMENT
  struck_by_mobile_equipment: ["high_visibility", "traffic_control"],

  // DEFAULT
  unclassified: []
};

export const enforceControls = (hazards: string[]) => {
  const controls = hazards.flatMap(h => hazardControlMap[h] || []);
  return Array.from(new Set(controls));
};
