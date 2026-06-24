export const PRODUCT_NAMES = {
  app: "Safety InSite",
  aiEngine: "HazLenz AI",

  legacy: {
    appNames: [
      "Sentinel Safety",
      "GuideGuard",
      "SightSignal",
      "AuditAlly",
    ],
    aiNames: [
      "SafeScope",
      "ReviewCore",
    ],
  },

  internal: {
    legacyApiNamespace: "safescope-v2",
    legacyResultField: "safeScopeResult",
  },
} as const;

export const APP_NAME = PRODUCT_NAMES.app;
export const AI_ENGINE_NAME = PRODUCT_NAMES.aiEngine;
