function normalizeFieldOutputActions(input: {
  safeScopeResult: any;
  findingId: string | number;
}) {
  const fieldActions = input.safeScopeResult?.fieldOutput?.correctiveActions;

  if (!Array.isArray(fieldActions) || !fieldActions.length) {
    return [];
  }

  return fieldActions
    .filter(Boolean)
    .map((action: any, index: number) => {
      const title =
        typeof action === "string"
          ? action
          : action.title || action.description || "HazLenz AI field action";

      const verification =
        typeof action === "string"
          ? input.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] || ""
          : action.verification ||
            action.closureEvidence ||
            input.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
            "";

      return {
        ...(typeof action === "object" ? action : {}),
        id:
          typeof action === "object" && action.id
            ? action.id
            : `ACT-${input.findingId}-field-output-${index}`,
        title,
        description:
          typeof action === "string"
            ? action
            : action.description || title,
        priority:
          typeof action === "object" && action.priority
            ? action.priority
            : input.safeScopeResult?.fieldOutput?.priority || "Medium",
        status:
          typeof action === "object" && action.status ? action.status : "Open",
        due:
          typeof action === "object"
            ? action.due || action.dueDate || ""
            : "",
        closureEvidence: verification || "Supervisor verification",
        verification,
        source:
          typeof action === "object" && action.source
            ? action.source
            : "HazLenz AI field output",
        createdAt:
          typeof action === "object" && action.createdAt
            ? action.createdAt
            : new Date().toISOString(),
      };
    });
}

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

  const selectedAndManualActions = [
    ...input.selectedGeneratedActions,
    ...input.manualActions,
  ];

  const sourceActions = selectedAndManualActions.length
    ? selectedAndManualActions
    : normalizeFieldOutputActions({
        safeScopeResult: input.safeScopeResult,
        findingId,
      });

  const correctiveActions = sourceActions.map((action, index) => ({
    ...action,
    id: action.id || `ACT-${findingId}-${index}`,
    title: action.title || action.description || "Corrective action",
    priority: action.priority || "Medium",
    status: action.status || "Open",
    due: action.due || action.dueDate || "",
    source:
      action.source ||
      (index < input.selectedGeneratedActions.length
        ? "HazLenz AI"
        : input.selectedGeneratedActions.length || input.manualActions.length
          ? "User"
          : "HazLenz AI field output"),
    createdAt: action.createdAt || new Date().toISOString(),
  }));

  return {
    id: findingId,
    hazardCategory:
      input.hazardCategory ||
      input.safeScopeResult?.classification ||
      "Uncategorized",
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
