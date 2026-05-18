export type InspectionMode = "quick" | "advanced";

export type InspectionContext = {
  inspectionType: string;
  inspectionTitle: string;
  agency: string;
  workflowDepth?: string;
};

export function loadInspectionContext(): InspectionContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(
      "sentinel_selected_inspection_context"
    );

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function determineInspectionMode(
  workflowDepth?: string
): InspectionMode {
  if (
    workflowDepth === "standard" ||
    workflowDepth === "intelligent"
  ) {
    return "advanced";
  }

  return "quick";
}

export function isQuickHazardCapture(
  inspectionType?: string
): boolean {
  return inspectionType === "quick_hazard_capture";
}
