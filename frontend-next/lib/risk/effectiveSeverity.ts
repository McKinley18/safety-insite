/**
 * MIRROR OF `backend/src/common/effective-severity.ts`.
 *
 * The frontend cannot import the backend module (separate packages, separate builds), so
 * this is a copy -- and a copy nobody checks is exactly the independently-maintained
 * approximation that produced D-008 in the first place. Parity is therefore ENFORCED:
 * `npm run check:effective-severity-parity` compares the two files' rule bodies and fails
 * if a single line differs. The same arrangement already holds `lib/inspection/riskBands.ts`
 * to the server's risk profiles.
 */

/**
 * §276 / D-008 — THE ONE RULE FOR "HOW SEVERE IS THIS FINDING?"
 *
 * ==================== THE DEFECT THIS EXISTS TO FIX ====================
 *
 * §275 generated a report whose finding 2 was printed **Critical** while the screen the
 * inspector had approved said **High**, and the stored record attributed the Critical to
 * `source: "reviewer_confirmed"` beside the rationale
 *
 *     "Reviewer-confirmed on the Standard 5x5 matrix: severity 4 x likelihood 4 = 16"
 *
 * 16 is High on that profile (High 10-16, Critical 17-25). Three things were wrong at
 * once: two surfaces disagreed, the wrong one left the building, and the record named a
 * person as the author of a number they did not choose.
 *
 * The mechanism was a field collision, not arithmetic. One `riskSnapshot` carries BOTH:
 *
 *   riskBand / aiRisk.escalationBand   HazLenz's ESCALATION band. Machine-authored.
 *   overallRisk / operationalRisk      the REVIEWER's matrix band. Human-authored.
 *
 * and every consumer picked its own preference order. The PDF renderer read
 * `riskBand || overallRisk`; the inspection workspace read `overallRisk || riskBand` in
 * three places and `riskBand || overallRisk` in two others. Each line was locally
 * defensible; together they made the product contradict itself.
 *
 * ==================== THE RULE (D-008) ====================
 *
 * THE EFFECTIVE HUMAN-REVIEWED SEVERITY IS AUTHORITATIVE ON COMPLIANCE ARTIFACTS.
 *
 * Once a person has reviewed a finding, their band is the finding's severity everywhere a
 * customer or a regulator can see it: finding detail, inspection review, report, history,
 * analytics and exports. HazLenz's escalation band is retained and may be shown, but only
 * ever LABELLED AS ITS OWN THING — never as the reviewer's, and never in place of it.
 *
 * ==================== WHY THE FALLBACK ORDER IS WHAT IT IS ====================
 *
 * When a snapshot is reviewer-confirmed, this NEVER falls back to the analysis band. A
 * reviewed finding whose human band is unreadable resolves to "not rated", because the
 * failure being prevented is precisely re-attribution: an AI number wearing a person's
 * name. "We cannot state a reviewed severity" is a gap a reader can see and act on; a
 * confidently wrong attribution is not.
 *
 * That is also why this reads correctly on rows written BEFORE the repair. §275's stored
 * snapshots still carry `riskBand: "Critical"` inside a `reviewer_confirmed` object; the
 * rule resolves them to High without needing a data migration, and
 * `analysisBand` still reports the Critical as what it actually is.
 *
 * There is deliberately no `frontend` copy of this logic that derives its own answer:
 * `frontend-next/lib/risk/effectiveSeverity.ts` is the same rule, and
 * `npm run check:effective-severity-parity` fails if the two drift.
 */

export type EffectiveSeverityBasis =
  /** A qualified person reviewed this finding and this is the band they confirmed. */
  | 'reviewer_confirmed'
  /** No human review yet; the band is the one the risk matrix computed. */
  | 'system_matrix'
  /** No human review and no matrix; the band is HazLenz's own escalation band. */
  | 'analysis_band'
  /** Nothing usable. Reported as a gap, never filled in from a lesser source. */
  | 'not_rated';

export type EffectiveSeverity = {
  /** The authoritative band, or null when none can be stated. */
  severity: string | null;
  /** Display-safe: the band, or 'Not rated'. Every surface prints THIS. */
  label: string;
  basis: EffectiveSeverityBasis;
  reviewerConfirmed: boolean;
  /**
   * HazLenz's escalation band, when there is one. Present so a surface can show the
   * analysis provenance beside the authoritative severity; `analysisBandDiffers` says
   * whether showing it adds anything.
   */
  analysisBand: string | null;
  analysisBandDiffers: boolean;
  /**
   * The severity and likelihood the AUTHORITATIVE band was chosen on, as the product labels
   * them. On a reviewed finding these are the reviewer's own words ("Serious", "Possible");
   * on an unreviewed one they are the matrix's own numbers.
   */
  severityLabel: string | null;
  likelihoodLabel: string | null;
  /**
   * The matrix arithmetic — present ONLY when it belongs to the band being stated.
   *
   * §276. `operationalRisk` holds the SYSTEM's computation and is not rewritten when a
   * reviewer confirms a different cell, so a reviewed finding can carry the reviewer's band
   * beside the system's score. The report printed exactly that:
   *
   *     Risk: Moderate
   *           Severity 4 · Likelihood 4 · Risk score 16 · Reviewer-confirmed
   *
   * where the reviewer had chosen 3 x 3 = 9. Every number on that line was the machine's,
   * on a line labelled as the person's — D-008's failure in a second field. The score is
   * therefore withheld unless the stored matrix agrees with the authoritative band, and a
   * surface that has no score simply does not print one.
   */
  matrixScore: number | null;
  matrixProfileLabel: string | null;
};

type Snapshot = Record<string, unknown> | null | undefined;

const NOT_STATED = new Set(['', 'not established', 'not set', 'not rated', 'unknown', 'none', 'null', 'undefined']);

/** A nested object, or null. Keeps every property read below total over untyped JSON. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function usableBand(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || NOT_STATED.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function toFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The single derivation. Total over the shapes the product actually persists, with no
 * silent default: every path below assigns a `basis` that says where the answer came from.
 */
export function resolveEffectiveSeverity(riskSnapshot: Snapshot): EffectiveSeverity {
  const snapshot = asRecord(riskSnapshot);
  const operational = asRecord(snapshot?.operationalRisk) || {};
  const aiRisk = asRecord(snapshot?.aiRisk) || {};

  const analysisBand =
    usableBand(snapshot?.analysisRiskBand) ||
    usableBand(aiRisk.escalationBand) ||
    // Legacy and unreviewed rows keep the analysis band under the bare `riskBand` key.
    usableBand(snapshot?.riskBand);

  const storedMatrixBand = usableBand(operational.matrixBand);
  const storedMatrixScore = toFiniteNumber(operational.matrixScore);
  const storedProfileLabel = typeof operational.profileLabel === 'string' ? operational.profileLabel : null;

  const reviewerConfirmed = snapshot?.source === 'reviewer_confirmed';
  const humanBand = usableBand(snapshot?.overallRisk) || storedMatrixBand;

  /**
   * The stored matrix is the SYSTEM's computation and is never rewritten by a review, so on
   * a reviewed finding it is not the reviewer's cell and must not be printed as though it
   * were.
   *
   * An earlier version of this rule showed the stored score whenever its BAND matched the
   * reviewer's, on the reasoning that agreement meant they had chosen the same cell. They
   * had not: a reviewer who moved from severity 4 x likelihood 3 = 12 to 4 x 4 = 16 stays
   * inside "High" on the Standard 5x5 profile, and the line then printed "Risk score 12 ·
   * Reviewer-confirmed" for a person who chose 16. A band is not a cell, and "probably the
   * same cell" is not a standard a compliance artifact can be held to.
   *
   * The reviewer's severity and likelihood ARE their cell, and they are stated. The
   * arithmetic is not lost either: the reviewer's own rationale records it verbatim
   * ("Reviewer-confirmed on the Standard 5x5 matrix: severity 4 x likelihood 4 = 16") and
   * the report prints that rationale.
   */
  const matrixBelongsToTheBand = !reviewerConfirmed;
  const matrixScore = matrixBelongsToTheBand ? storedMatrixScore : null;
  const matrixProfileLabel = matrixBelongsToTheBand ? storedProfileLabel : null;

  const severityLabel = reviewerConfirmed
    ? usableBand(snapshot?.severity)
    : (toFiniteNumber(operational.severity) === null ? null : String(operational.severity));
  const likelihoodLabel = reviewerConfirmed
    ? usableBand(snapshot?.likelihood)
    : (toFiniteNumber(operational.likelihood) === null ? null : String(operational.likelihood));

  const base = {
    analysisBand,
    severityLabel,
    likelihoodLabel,
    matrixScore,
    matrixProfileLabel,
  };

  if (!snapshot) {
    return { ...base, severity: null, label: 'Not rated', basis: 'not_rated', reviewerConfirmed: false, analysisBandDiffers: false };
  }

  if (reviewerConfirmed) {
    if (!humanBand) {
      // Reviewed, but the human band did not survive. Reported as a gap on purpose --
      // see the header: an analysis band must never inherit a person's authority.
      return { ...base, severity: null, label: 'Not rated', basis: 'not_rated', reviewerConfirmed: true, analysisBandDiffers: Boolean(analysisBand) };
    }
    return {
      ...base,
      severity: humanBand,
      label: humanBand,
      basis: 'reviewer_confirmed',
      reviewerConfirmed: true,
      analysisBandDiffers: Boolean(analysisBand) && analysisBand !== humanBand,
    };
  }

  if (humanBand) {
    return {
      ...base,
      severity: humanBand,
      label: humanBand,
      basis: 'system_matrix',
      reviewerConfirmed: false,
      analysisBandDiffers: Boolean(analysisBand) && analysisBand !== humanBand,
    };
  }

  if (analysisBand) {
    return {
      ...base,
      severity: analysisBand,
      label: analysisBand,
      basis: 'analysis_band',
      reviewerConfirmed: false,
      analysisBandDiffers: false,
    };
  }

  return { ...base, severity: null, label: 'Not rated', basis: 'not_rated', reviewerConfirmed: false, analysisBandDiffers: false };
}

/**
 * The one-line "how this band was reached" a surface prints under the severity.
 *
 * Every element is drawn from the authoritative side, so nothing on this line can be the
 * machine's while the line says "Reviewer-confirmed".
 */
export function severityBasisLine(resolved: EffectiveSeverity): string {
  const parts: string[] = [];
  if (resolved.severityLabel) parts.push(`Severity ${resolved.severityLabel}`);
  if (resolved.likelihoodLabel) parts.push(`Likelihood ${resolved.likelihoodLabel}`);
  if (resolved.matrixScore !== null) parts.push(`Risk score ${resolved.matrixScore}`);
  if (resolved.reviewerConfirmed) parts.push('Reviewer-confirmed');
  const provenance = analysisBandProvenanceLabel(resolved);
  if (provenance) parts.push(provenance);
  return parts.join('  ·  ');
}

/** Convenience for the many surfaces that only need the label. */
export function effectiveSeverityLabel(riskSnapshot: Snapshot): string {
  return resolveEffectiveSeverity(riskSnapshot).label;
}

/**
 * How the analysis band should be described when a surface shows it beside the
 * authoritative severity. Never "reviewer-confirmed", never bare.
 */
export function analysisBandProvenanceLabel(resolved: EffectiveSeverity): string | null {
  if (!resolved.analysisBand || !resolved.analysisBandDiffers) return null;
  return `HazLenz analysis: ${resolved.analysisBand}`;
}
