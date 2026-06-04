export type ControlStateType =
  | "present"
  | "missing"
  | "unknown"
  | "verified";

export interface ControlState {
  control: string;
  state: ControlStateType;
  source: "text" | "hazard" | "user" | "ai";
  confidence: number;
}

const normalize = (v: any) =>
  String(v || "").toLowerCase().trim().replace(/\s+/g, "_");

export function buildControlStates(
  hazardTypes: string[],
  controlFindings: any[],
  requiredControls: string[]
): ControlState[] {
  const states: ControlState[] = [];

  const detected = (controlFindings || []).map(c =>
    normalize(c.control)
  );

  // Required → default missing
  for (const ctrl of requiredControls) {
    states.push({
      control: normalize(ctrl),
      state: "missing",
      source: "hazard",
      confidence: 1,
    });
  }

  // Text overrides
  for (const c of controlFindings || []) {
    const val = normalize(c.control);
    const isMissing = val.includes("missing");
    const cleaned = val.replace("missing_", "");

    const index = states.findIndex(s => s.control === cleaned);

    if (index !== -1) {
      states[index] = {
        control: cleaned,
        state: isMissing ? "missing" : "present",
        source: "text",
        confidence: 0.7,
      };
    } else {
      states.push({
        control: cleaned,
        state: isMissing ? "missing" : "present",
        source: "text",
        confidence: 0.7,
      });
    }
  }

  return states;
}
