export interface StandardInput {
  citation: string;
  authority: string;
  title: string;
  description: string;
  isActive?: boolean;
  legacyKeywords?: string[];
  legacyHazardCodes?: string[];
  plainLanguageSummary?: string;
}
