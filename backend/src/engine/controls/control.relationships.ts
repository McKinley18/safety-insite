import { HazardControlMap } from "./hazard.controls";

export const evaluateHazardControls = (
  hazardTypes: string[],
  existingControls: any[]
) => {
  const existing = existingControls.map(c =>
    (c.control || "").toLowerCase()
  );

  const missingControls: string[] = [];

  for (const hazard of hazardTypes) {
    const required = HazardControlMap[hazard] || [];

    for (const control of required) {
      if (!existing.includes(control)) {
        missingControls.push(control);
      }
    }
  }

  return Array.from(new Set(missingControls));
};
