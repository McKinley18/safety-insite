export type RiskLevel = "low" | "medium" | "high" | "critical";

export const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

export const riskLevelLabels: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const riskLevelCellClasses: Record<RiskLevel, string> = {
  low: "bg-emerald-500 hover:bg-emerald-600",
  medium: "bg-amber-500 hover:bg-amber-600",
  high: "bg-orange-500 hover:bg-orange-600",
  critical: "bg-red-600 hover:bg-red-700",
};

const RISK_LEVEL_CYCLE: RiskLevel[] = ["low", "medium", "high", "critical"];

export function nextRiskLevel(level: RiskLevel): RiskLevel {
  const index = RISK_LEVEL_CYCLE.indexOf(level);
  return RISK_LEVEL_CYCLE[(index + 1) % RISK_LEVEL_CYCLE.length];
}

export type LikelihoodOrigin = "bottom" | "top";
export type SeverityOrigin = "left" | "right";

export type CustomRiskMatrix = {
  name: string;
  likelihoodLabels: string[];
  severityLabels: string[];
  cellLevels: RiskLevel[][];
  likelihoodOrigin: LikelihoodOrigin;
  severityOrigin: SeverityOrigin;
  updatedAt: string;
};

/** Row indices (into likelihoodLabels/cellLevels) in top-to-bottom visual render order. */
export function visualRowOrder(rows: number, origin: LikelihoodOrigin): number[] {
  const indices = Array.from({ length: rows }, (_, index) => index);
  return origin === "bottom" ? indices.reverse() : indices;
}

/** Column indices (into severityLabels/cellLevels) in left-to-right visual render order. */
export function visualColOrder(cols: number, origin: SeverityOrigin): number[] {
  const indices = Array.from({ length: cols }, (_, index) => index);
  return origin === "right" ? indices.reverse() : indices;
}

const STORAGE_KEY = "safety_insite_custom_risk_matrix";

const DEFAULT_LIKELIHOOD_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain", "Certain"];
const DEFAULT_SEVERITY_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic", "Extreme"];

export function readCustomRiskMatrix(storage: Storage | null): CustomRiskMatrix | null {
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.cellLevels) || !Array.isArray(parsed.likelihoodLabels) || !Array.isArray(parsed.severityLabels)) {
      return null;
    }
    return {
      ...parsed,
      likelihoodOrigin: parsed.likelihoodOrigin === "top" ? "top" : "bottom",
      severityOrigin: parsed.severityOrigin === "right" ? "right" : "left",
    } as CustomRiskMatrix;
  } catch {
    return null;
  }
}

export function writeCustomRiskMatrix(storage: Storage | null, matrix: CustomRiskMatrix) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(matrix));
}

function defaultLevelForCell(rowIndex: number, colIndex: number, rows: number, cols: number): RiskLevel {
  const maxSum = rows + cols - 2;
  const ratio = maxSum === 0 ? 0 : (rowIndex + colIndex) / maxSum;

  if (ratio >= 0.75) return "critical";
  if (ratio >= 0.5) return "high";
  if (ratio >= 0.25) return "medium";
  return "low";
}

export function buildMatrixForSize(
  rows: number,
  cols: number,
  previous?: CustomRiskMatrix | null,
): CustomRiskMatrix {
  const likelihoodLabels = Array.from(
    { length: rows },
    (_, index) => previous?.likelihoodLabels[index] || DEFAULT_LIKELIHOOD_LABELS[index] || `Level ${index + 1}`,
  );

  const severityLabels = Array.from(
    { length: cols },
    (_, index) => previous?.severityLabels[index] || DEFAULT_SEVERITY_LABELS[index] || `Level ${index + 1}`,
  );

  const cellLevels: RiskLevel[][] = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from(
      { length: cols },
      (_, colIndex) => previous?.cellLevels[rowIndex]?.[colIndex] || defaultLevelForCell(rowIndex, colIndex, rows, cols),
    ),
  );

  return {
    name: previous?.name || "My Custom Matrix",
    likelihoodLabels,
    severityLabels,
    cellLevels,
    likelihoodOrigin: previous?.likelihoodOrigin || "bottom",
    severityOrigin: previous?.severityOrigin || "left",
    updatedAt: previous?.updatedAt || "",
  };
}
