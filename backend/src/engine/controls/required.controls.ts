export const evaluateRequiredControls = (text: string) => {
  const t = text.toLowerCase();

  const controls: any[] = [];

  if (
    t.includes("lift") ||
    t.includes("scissor lift") ||
    t.includes("manlift") ||
    t.includes("aerial")
  ) {
    controls.push({
      control: "fire_extinguisher",
      severity: "HIGH",
      weight: 0.4,
      description: "Fire extinguisher must be present on mobile equipment",
      standard: "MSHA 56.4100"
    });

    controls.push({
      control: "fall_protection",
      severity: "CRITICAL",
      weight: 0.7,
      description: "Fall protection required when working from elevated equipment",
      standard: "MSHA 56.15005"
    });
  }

  return controls;
};

