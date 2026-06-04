export const HazardRules: any = {
  working_from_lift: {
    immediateAction: "Ensure all required safety controls are in place before operating lift.",
    prioritizedActions: [
      "Verify fall protection is properly used",
      "Ensure fire extinguisher is mounted and accessible",
      "Inspect lift prior to use",
      "Confirm operator training and authorization"
    ],
    correctiveAction: "Implement full pre-operation safety controls for aerial lift use.",
    standards: ["MSHA 56.11001", "MSHA 56.15005", "MSHA 56.4100"]
  },

  missing_fire_extinguisher_on_lift: {
    immediateAction: "IMMEDIATE ACTION REQUIRED: Remove equipment from service until required fire protection is installed.",
    prioritizedActions: [
      "Install approved fire extinguisher on lift",
      "Verify extinguisher is charged and accessible",
      "Inspect all mobile equipment for compliance",
      "Train operators on inspection requirements"
    ],
    correctiveAction: "Equip lift with compliant fire extinguisher and implement inspection program.",
    standards: ["MSHA 56.4100", "MSHA 56.4201"]
  },

  fall_hazard_from_lift: {
    immediateAction: "Ensure fall protection is in place before working at elevation.",
    prioritizedActions: [
      "Install fall protection system",
      "Ensure proper harness use",
      "Inspect anchor points",
      "Train personnel on fall hazards"
    ],
    correctiveAction: "Implement fall protection system for elevated work.",
    standards: ["MSHA 56.15005"]
  },

  electrical_exposure: {
    immediateAction: "De-energize and secure electrical sources before work begins.",
    prioritizedActions: [
      "Lockout/tagout electrical source",
      "Verify zero energy state",
      "Maintain safe distance from lines",
      "Train personnel on electrical hazards"
    ],
    correctiveAction: "Apply electrical safety controls and isolation procedures.",
    standards: ["MSHA 56.12016"]
  }
};

// ===== HAZARD → STANDARD MAP (OSHA + MSHA) =====
export const HazardStandardMap: Record<string, string[]> = {
  fall_hazard_from_lift: ["MSHA 56.15005"],
  missing_fire_extinguisher: ["MSHA 56.4100"],
  electrical_exposure: ["MSHA 56.12016"],
  confined_space: ["OSHA 1910.146"],
  slip_trip_hazard: ["OSHA 1910.22"],
  missing_ppe: ["OSHA 1910.132"]
};
