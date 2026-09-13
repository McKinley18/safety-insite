/**
 * The single source of truth for product naming in the frontend.
 *
 * Two names are live and no others: "Safety InSite" is the product, "HazLenz" is the analysis
 * engine. Retired brands (SafeScope, Sentinel Safety, AuditAlly, GuideGuard, SightSignal,
 * ReviewCore) are deliberately NOT enumerated here. They used to be, in a parallel
 * `productNames.ts` that this module replaced, and a list of dead brands sitting in shipped
 * frontend code is a list that gets read as though it were still meaningful. The authoritative
 * register of retired brands now lives in the brand audit — `npm run brand:audit` in the backend —
 * which is the thing that actually enforces their absence.
 */
export const APP_NAME = "Safety InSite";

/** The engine's customer-facing name. "AI" is part of the spoken product name, not a suffix. */
export const AI_ENGINE_NAME = "HazLenz AI";

export const APP_TAGLINE = `Field safety intelligence powered by ${AI_ENGINE_NAME}.`;

export const APP_DESCRIPTION =
  "Capture field observations, identify hazard patterns, track corrective actions, and build audit-ready safety reports.";

export const BRAND_HEADER_LOGO = "/brand/safety-insite-header-logo.png";
export const BRAND_LOGIN_LOGO = "/brand/safety-insite-header-logo.png";
export const BRAND_LOGO = "/brand/safety-insite-header-logo.png";
export const BRAND_WORDMARK = "/brand/safety-insite-header-logo.png";
