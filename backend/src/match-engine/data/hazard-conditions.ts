export const HAZARD_FAMILIES = {
  guarding: { keywords: ['guard', 'unguarded', 'pinch point', 'exposed'], conditions: ['conveyor_guarding', 'pulley_guarding', 'shaft_guarding', 'machine_guarding'] },
  electrical: { keywords: ['electrical', 'wire', 'cord', 'panel', 'junction box'], conditions: ['damaged_cord', 'exposed_wire', 'panel_open'] },
  fall_protection: { keywords: ['fall', 'height', 'edge', 'harness', 'guardrail'], conditions: ['roof_edge', 'elevated_platform', 'unprotected_edge'] },
  housekeeping: { keywords: ['oil', 'spill', 'slip', 'trip', 'trash', 'debris', 'clutter'], conditions: ['oil_slick', 'trip_hazard', 'debris_buildup'] }
};
