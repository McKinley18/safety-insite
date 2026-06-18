export function getHazLenzScopesForAgencyMode(mode: string) {
  if (!mode || mode === "all") return undefined;

  const scopeMap: Record<string, string[]> = {
    msha: ["msha_mnm_surface"],
    msha_mnm_surface: ["msha_mnm_surface"],
    msha_mnm_underground: ["msha_mnm_underground"],
    msha_coal_underground: ["msha_coal_underground"],
    msha_coal_surface: ["msha_coal_surface"],
    osha_general: ["osha_general"],
    osha_construction: ["osha_construction"],
  };

  return scopeMap[mode] || [mode];
}

export function getHazLenzScopeLabel(mode: string) {
  const labelMap: Record<string, string> = {
    all: "All supported standards",
    msha: "MSHA MNM Surface",
    msha_mnm_surface: "MSHA MNM Surface",
    msha_mnm_underground: "MSHA MNM Underground",
    msha_coal_underground: "MSHA Coal Underground",
    msha_coal_surface: "MSHA Coal Surface",
    osha_general: "OSHA General Industry",
    osha_construction: "OSHA Construction",
  };

  return labelMap[mode] || mode.toUpperCase();
}

export function buildHazLenzObservationText(input: {
  hazardCategory?: string;
  description?: string;
  location?: string;
  evidenceNotes?: string;
  agencyMode?: string;
}) {
  return [
    `Hazard category: ${input.hazardCategory || "Unspecified"}`,
    `Observed condition: ${input.description || "No description provided"}`,
    `Location: ${input.location || "No location provided"}`,
    `Evidence notes: ${input.evidenceNotes || "No evidence notes provided"}`,
    `Regulatory scope: ${(input.agencyMode || "all").toUpperCase()}`,
  ].join("\n");
}

export function getStandardKey(standard: any) {
  return (
    standard.citation ||
    standard.id ||
    standard.title ||
    JSON.stringify(standard)
  );
}

export function hasFindingDraftData(input: {
  description?: string;
  hazardCategory?: string;
  location?: string;
  evidenceNotes?: string;
  photos?: any[];
  safeScopeResult?: any;
  selectedStandards?: any[];
  selectedGeneratedActions?: any[];
  manualActions?: any[];
  severity?: any;
  likelihood?: any;
}) {
  return !!(
    input.description ||
    input.hazardCategory ||
    input.location ||
    input.evidenceNotes ||
    input.photos?.length ||
    input.safeScopeResult ||
    input.selectedStandards?.length ||
    input.selectedGeneratedActions?.length ||
    input.manualActions?.length ||
    input.severity ||
    input.likelihood
  );
}
