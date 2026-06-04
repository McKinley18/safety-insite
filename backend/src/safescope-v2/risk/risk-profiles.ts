export type RiskBand = "Low" | "Moderate" | "High" | "Critical";

export type RiskMatrixProfile = {
  id: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  label: string;
  size: 4 | 5 | 6;
  maxScore: number;
  description: string;
  severityLabels: string[];
  likelihoodLabels: string[];
  bands: { label: RiskBand; min: number; max: number }[];
};

export const RISK_PROFILES: Record<RiskMatrixProfile["id"], RiskMatrixProfile> = {
  simple_4x4: {
    id: "simple_4x4",
    label: "Simple 4x4",
    size: 4,
    maxScore: 16,
    description: "Simplified risk matrix for smaller teams or less complex operations.",
    severityLabels: ["Minor", "Moderate", "Serious", "Critical"],
    likelihoodLabels: ["Rare", "Unlikely", "Possible", "Likely"],
    bands: [
      { label: "Low", min: 1, max: 3 },
      { label: "Moderate", min: 4, max: 6 },
      { label: "High", min: 7, max: 11 },
      { label: "Critical", min: 12, max: 16 },
    ],
  },

  standard_5x5: {
    id: "standard_5x5",
    label: "Standard 5x5",
    size: 5,
    maxScore: 25,
    description: "Default Sentinel Safety risk matrix.",
    severityLabels: ["Minor", "Moderate", "Serious", "Major", "Critical"],
    likelihoodLabels: ["Rare", "Unlikely", "Possible", "Likely", "Frequent"],
    bands: [
      { label: "Low", min: 1, max: 4 },
      { label: "Moderate", min: 5, max: 9 },
      { label: "High", min: 10, max: 16 },
      { label: "Critical", min: 17, max: 25 },
    ],
  },

  advanced_6x6: {
    id: "advanced_6x6",
    label: "Advanced 6x6",
    size: 6,
    maxScore: 36,
    description: "Expanded matrix for organizations wanting more risk granularity.",
    severityLabels: ["Negligible", "Minor", "Moderate", "Serious", "Major", "Catastrophic"],
    likelihoodLabels: ["Remote", "Rare", "Unlikely", "Possible", "Likely", "Frequent"],
    bands: [
      { label: "Low", min: 1, max: 5 },
      { label: "Moderate", min: 6, max: 12 },
      { label: "High", min: 13, max: 23 },
      { label: "Critical", min: 24, max: 36 },
    ],
  },
};

export function getRiskProfile(profileId?: string): RiskMatrixProfile {
  if (profileId && profileId in RISK_PROFILES) {
    return RISK_PROFILES[profileId as RiskMatrixProfile["id"]];
  }

  return RISK_PROFILES.standard_5x5;
}

export function bandFromProfileScore(score: number, profile: RiskMatrixProfile): RiskBand {
  return profile.bands.find((band) => score >= band.min && score <= band.max)?.label || "Low";
}

export function scaleScoreToProfile(value: number, profile: RiskMatrixProfile): number {
  const rounded = Math.round(value);
  return Math.max(1, Math.min(profile.size, rounded));
}
