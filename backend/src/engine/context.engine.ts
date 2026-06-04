export type ContextFlags = {
  energized: boolean;
  maintenance: boolean;
  elevated: boolean;
  confined: boolean;
  mobileEquipment: boolean;
  fireRisk: boolean;
};

export function detectContext(text: string): ContextFlags {
  const t = text.toLowerCase();

  return {
    energized:
      includesAny(t, ["energized", "live", "powered", "exposed wire", "wiring"]),

    maintenance:
      includesAny(t, ["maintenance", "repair", "servicing", "working on"]),

    elevated:
      includesAny(t, ["elevated", "height", "lift", "ladder", "platform"]),

    confined:
      includesAny(t, ["confined space", "tank", "vessel", "permit-required"]),

    mobileEquipment:
      includesAny(t, ["truck", "loader", "equipment", "conveyor", "belt", "vehicle"]),

    fireRisk:
      includesAny(t, ["flammable", "combustible", "ignition", "sparks", "hot work"]),
  };
}

// 🔥 Helper function (prevents repetitive includes logic)
function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}
