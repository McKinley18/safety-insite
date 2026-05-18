export function buildFinding(input: {
  existingId?: string | number | null;
  fallbackId?: string | number | null;
  hazardCategory: string;
  description: string;
  location: string;
  evidenceNotes: string;
  photos: any[];
  safeScopeResult: any;
  selectedStandards: any[];
  selectedGeneratedActions: any[];
  manualActions: any[];
  severity: number | null;
  likelihood: number | null;
  riskScore: number | null;
}) {
  const findingId = input.existingId || input.fallbackId || Date.now();

  const correctiveActions = [
    ...input.selectedGeneratedActions,
    ...input.manualActions,
  ].map((action, index) => ({
    ...action,
    id: action.id || `ACT-${findingId}-${index}`,
    title: action.title || action.description || "Corrective action",
    priority: action.priority || "Medium",
    status: action.status || "Open",
    due: action.due || action.dueDate || "",
    source:
      action.source ||
      (index < input.selectedGeneratedActions.length ? "SafeScope" : "User"),
    createdAt: action.createdAt || new Date().toISOString(),
  }));

  return {
    id: findingId,
    hazardCategory: input.hazardCategory,
    description: input.description,
    location: input.location,
    evidenceNotes: input.evidenceNotes,
    photos: input.photos,
    safeScopeResult: input.safeScopeResult,
    selectedStandards: input.selectedStandards,
    selectedGeneratedActions: input.selectedGeneratedActions,
    manualActions: input.manualActions,
    correctiveActions,
    correctiveActionIds: correctiveActions.map((action) => action.id),
    severity: input.severity,
    likelihood: input.likelihood,
    riskScore: input.riskScore,
  };
}

export function generateInspectionReportId() {
  const year = new Date().getFullYear();
  const shortId = String(Date.now()).slice(-6);
  return `SSR-${year}-${shortId}`;
}
