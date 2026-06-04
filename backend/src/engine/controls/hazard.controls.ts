// ===== HAZARD → REQUIRED CONTROLS MAP (OSHA + MSHA) =====

export const HazardControlMap: Record<string, string[]> = {
  // FALL
  fall_hazard_from_lift: [
    "fall_protection",
    "tie_off",
    "anchor_point"
  ],

  fall_hazard_general: [
    "guardrails",
    "fall_protection"
  ],

  // FIRE
  missing_fire_extinguisher: [
    "fire_extinguisher"
  ],

  fire_hazard: [
    "fire_extinguisher",
    "flammable_storage"
  ],

  // ELECTRICAL
  electrical_exposure: [
    "lockout_tagout",
    "electrical_ppe",
    "isolation"
  ],

  // MOBILE EQUIPMENT (MSHA)
  struck_by_mobile_equipment: [
    "traffic_control",
    "high_visibility_ppe",
    "equipment_separation"
  ],

  caught_between_equipment: [
    "pinch_point_guarding",
    "safe_positioning"
  ],

  // CONFINED SPACE
  confined_space: [
    "permit",
    "air_monitoring",
    "attendant"
  ],

  // DUST / AIR
  silica_exposure: [
    "respirator",
    "dust_control"
  ],

  // PPE
  missing_ppe: [
    "ppe_required"
  ]
};
