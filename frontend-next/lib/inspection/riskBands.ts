/**
 * THE risk-band table for the frontend. One representation, imported by every consumer.
 *
 * This MIRRORS the authoritative server profiles in
 * `backend/src/safescope-v2/risk/risk-profiles.ts`. That file decides the band that is computed,
 * persisted on the finding, and printed in the report; anything the UI shows must agree with it or
 * the customer reads one risk on screen and a different one in the document.
 *
 * The frontend cannot import the backend module (separate packages, separate builds), so this is a
 * copy -- and a copy that nobody checks is exactly the "independently maintained approximation"
 * that caused the defect this replaces. Parity is therefore ENFORCED, not trusted:
 * `npm run check:risk-band-parity` parses the backend profile file and fails if a single boundary
 * differs. Change the backend bands and that check fails until this file is updated to match.
 *
 * The defect it replaces: both the workspace and the matrix component independently used a
 * proportional rule (>=75% Critical, >=50% High, >=25% Medium). On the 5x5 matrix severity 4 x
 * likelihood 3 = 12 is 48%, so the UI said "Moderate" and coloured the cell amber while the engine
 * -- and the saved finding, and the report -- said "High".
 */

export type RiskBandLabel = "Low" | "Moderate" | "High" | "Critical";

export type RiskBandRange = { label: RiskBandLabel; min: number; max: number };

/** Keyed by matrix size (4x4, 5x5, 6x6), matching `RiskMatrixProfile.size` on the server. */
export const RISK_BANDS_BY_MATRIX_SIZE: Record<number, RiskBandRange[]> = {
  4: [
    { label: "Low", min: 1, max: 3 },
    { label: "Moderate", min: 4, max: 6 },
    { label: "High", min: 7, max: 11 },
    { label: "Critical", min: 12, max: 16 },
  ],
  5: [
    { label: "Low", min: 1, max: 4 },
    { label: "Moderate", min: 5, max: 9 },
    { label: "High", min: 10, max: 16 },
    { label: "Critical", min: 17, max: 25 },
  ],
  6: [
    { label: "Low", min: 1, max: 5 },
    { label: "Moderate", min: 6, max: 12 },
    { label: "High", min: 13, max: 23 },
    { label: "Critical", min: 24, max: 36 },
  ],
};

/**
 * The band for a severity x likelihood score on a matrix of the given size.
 *
 * Mirrors the server's `bandFromProfileScore`, including its fallback: a score outside every
 * declared range resolves to "Low" rather than throwing.
 */
export function riskBandForScore(score: number, matrixSize: number): RiskBandLabel {
  const bands = RISK_BANDS_BY_MATRIX_SIZE[matrixSize] || RISK_BANDS_BY_MATRIX_SIZE[5];
  return bands.find((band) => score >= band.min && score <= band.max)?.label || "Low";
}

/** Tailwind classes per band, so the matrix cell colour and the stated band cannot diverge. */
export const RISK_BAND_CLASSES: Record<RiskBandLabel, string> = {
  Critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
  High: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
  Moderate: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  Low: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
};

/**
 * The governed remediation deadline for a risk band, mirroring `urgencyForRisk` in
 * `backend/src/inspection/risk-policy.ts`.
 *
 * The server computes and returns this policy; the UI shows it so the customer understands that
 * InSite set the due date BECAUSE of the risk they just confirmed, rather than being asked to
 * calculate a date. It is displayed, never entered, and the server's value is always the one that
 * is persisted -- this table exists so the deadline can be shown before the save round-trip, and
 * it is held to the server by `npm run check:risk-band-parity`.
 *
 * Note the server maps its four categorical levels from the band label, so "Critical" -> 1 day,
 * "High" -> 3, "Moderate" -> 7, "Low" -> 14.
 */
export const RISK_BAND_DUE_DAYS: Record<RiskBandLabel, number> = {
  Critical: 1,
  High: 3,
  Moderate: 7,
  Low: 14,
};

/** The governed due date for a band, from a caller-supplied "now" so it stays testable. */
export function governedDueDate(band: RiskBandLabel, now: Date): Date {
  return new Date(now.getTime() + RISK_BAND_DUE_DAYS[band] * 86400000);
}
