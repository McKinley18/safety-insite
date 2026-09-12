/**
 * §149 PHASE 5 -- RAW LINKAGE DIAGNOSTICS. DEVELOPMENT INSTRUMENT ONLY.
 *
 * ==================== THE BLIND SPOT THIS CLOSES ====================
 *
 * §148 disclosed it on TR-C2. The model set `relatesToCandidateKey = "haz-2"`, which named no
 * candidate it had emitted. `normalizeExpertOutput` did exactly the right thing -- it recorded
 * `CLARIFICATION_LINK_UNRESOLVED`, stripped the key to `null` and KEPT the question (§141's
 * non-destructive rule). But `linkageDiagnostics` in `expert-probe-measures.ts` derives
 * `INVALID_LINKAGE_ATTEMPTS` from `emittedClarifications`, which the probe fills from the
 * **VALIDATED** analysis -- and by then the key is already `null`.
 *
 *      THE METRIC READS THE OUTPUT AFTER THE THING IT COUNTS HAS BEEN REMOVED.
 *
 * So §148 reported `INVALID_LINKAGE_ATTEMPTS = 0` on the very row that made an invalid attempt. Only
 * `INVALID_LINKAGE_STRIPPED`, which counts issue codes, saw it. **An invalid attempt is invisible to
 * the attempts counter by construction, and the undercount is silent.**
 *
 * ==================== WHAT THIS MODULE DOES, AND WHAT IT REFUSES TO ====================
 *
 * It computes linkage-attempt diagnostics from the RAW provider response, captured BEFORE
 * normalization strips anything. Four numbers, reported separately and never collapsed:
 *
 *   RAW_LINKAGE_ATTEMPTS          links the MODEL actually declared, from the wire
 *   RAW_INVALID_LINKAGE_ATTEMPTS  of those, the ones naming no candidate the model emitted
 *   NORMALIZED_VALID_LINKAGES     links surviving on the VALIDATED analysis
 *   STRIPPED_INVALID_LINKAGES     `CLARIFICATION_LINK_UNRESOLVED` issues raised by the boundary
 *
 * >>> IT CHANGES NO ACCEPTED-OUTPUT SEMANTICS. Nothing here is imported by a production module. The
 * >>> normalizer, the runner, arbitration and the customer path are untouched: a broken key is still
 * >>> stripped, the question is still kept, and the issue is still recorded exactly as before. This
 * >>> is measurement, not behaviour.
 *
 * >>> IT RECONSTRUCTS NOTHING. `reconcile()` is PROSPECTIVE only. Where a run has no captured wire --
 * >>> which is every run before §148 -- the raw figures are `null`, NOT zero, and
 * >>> `rawCaptureAvailable` is false. §141-§148 historical metrics are NOT rewritten and NOT
 * >>> back-inferred; a missing measurement is reported missing.
 *
 * >>> AND IT DOES NOT WIDEN `ExpertNormalizationIssue.offendingText`. That field is safe only because
 * >>> every code carrying it is ANALYSIS_FATAL, so a populated field implies `validated === null`.
 * >>> `CLARIFICATION_LINK_UNRESOLVED` is NON-FATAL, so putting the broken key there would place model
 * >>> text on an ACCEPTED analysis and break the invariant. The raw wire is the right source.
 */

export const RAW_LINKAGE_DIAGNOSTICS_VERSION = 'hazlenz.expert.raw-linkage-diagnostics.v1' as const;

/** One clarification as the MODEL sent it, before the boundary touched anything. */
export interface RawWireClarification {
  clarificationId: string;
  /** Exactly what the model put in the field. `null` means it declared no link. */
  relatesToCandidateKey: string | null;
}

/** One candidate as the MODEL sent it. The key set the model could legally have named. */
export interface RawWireCandidate {
  candidateKey: string;
}

export interface RawLinkageCallInput {
  rowId: string;
  /**
   * The captured wire for this row, or `null` where no capture exists.
   *
   * `null` is NOT "no links". It is "not measured", and it propagates to a `null` result rather than
   * to a zero, because a zero would be a fabricated measurement.
   */
  wire: { clarifications: readonly RawWireClarification[];
          candidates: readonly RawWireCandidate[] } | null;
  /** From the VALIDATED analysis, after normalization. */
  normalizedClarifications: ReadonlyArray<{ relatesToCandidateKey: string | null }>;
  /** Issue codes raised by the boundary on this call. */
  issueCodes: readonly string[];
}

export interface RawLinkageDiagnostics {
  version: string;
  /** FALSE where any call lacked a captured wire. The raw figures are then `null`. */
  rawCaptureAvailable: boolean;
  callsWithRawCapture: number;
  callsWithoutRawCapture: number;

  /** Links the MODEL declared, counted before anything was stripped. `null` when not measured. */
  RAW_LINKAGE_ATTEMPTS: number | null;
  /** Of those, the ones naming no candidate the model emitted in the same response. */
  RAW_INVALID_LINKAGE_ATTEMPTS: number | null;
  /** Links surviving on the validated analysis. Always measurable. */
  NORMALIZED_VALID_LINKAGES: number;
  /** `CLARIFICATION_LINK_UNRESOLVED` issues the boundary raised. Always measurable. */
  STRIPPED_INVALID_LINKAGES: number;

  /**
   * THE RECONCILIATION, and the reason this module exists.
   *
   * Every invalid attempt the model made must be visible in the raw figures, and every strip the
   * boundary performed must correspond to one. When the two disagree, the instrument is wrong and
   * says so rather than reporting the smaller number.
   */
  reconciled: boolean | null;
  reconciliationDetail: string;

  perRow: Array<{
    rowId: string;
    rawAttempts: number | null;
    rawInvalid: number | null;
    rawInvalidKeys: string[];
    normalizedValid: number;
    stripped: number;
    /** TRUE only where the row's raw and normalized views agree. `null` without a capture. */
    consistent: boolean | null;
  }>;
}

const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/**
 * Compute the four figures and reconcile them.
 *
 * The invalid test is deliberately the SAME test the normalizer applies -- a declared key that names
 * no candidate emitted in the SAME response -- so a disagreement between the two views is evidence
 * about the instrument rather than about a difference of definition.
 */
export function rawLinkageDiagnostics(
  calls: readonly RawLinkageCallInput[],
): RawLinkageDiagnostics {
  let rawAttemptsTotal = 0;
  let rawInvalidTotal = 0;
  let normalizedValid = 0;
  let stripped = 0;
  let withCapture = 0;
  let withoutCapture = 0;

  const perRow: RawLinkageDiagnostics['perRow'] = [];

  for (const c of calls) {
    const rowStripped = c.issueCodes.filter(i => i === 'CLARIFICATION_LINK_UNRESOLVED').length;
    const rowNormalizedValid = c.normalizedClarifications
      .filter(q => isNonEmpty(q.relatesToCandidateKey)).length;
    normalizedValid += rowNormalizedValid;
    stripped += rowStripped;

    if (c.wire === null) {
      withoutCapture += 1;
      perRow.push({ rowId: c.rowId, rawAttempts: null, rawInvalid: null, rawInvalidKeys: [],
        normalizedValid: rowNormalizedValid, stripped: rowStripped, consistent: null });
      continue;
    }

    withCapture += 1;
    const emittedKeys = new Set(c.wire.candidates.map(x => x.candidateKey).filter(isNonEmpty));
    const declared = c.wire.clarifications
      .map(q => q.relatesToCandidateKey)
      .filter(isNonEmpty);
    const invalidKeys = declared.filter(k => !emittedKeys.has(k));

    rawAttemptsTotal += declared.length;
    rawInvalidTotal += invalidKeys.length;

    perRow.push({
      rowId: c.rowId,
      rawAttempts: declared.length,
      rawInvalid: invalidKeys.length,
      rawInvalidKeys: invalidKeys,
      normalizedValid: rowNormalizedValid,
      stripped: rowStripped,
      // A row is consistent when the boundary stripped exactly the attempts the wire shows as
      // invalid, AND the surviving links are exactly the attempts the wire shows as valid.
      consistent: invalidKeys.length === rowStripped
        && (declared.length - invalidKeys.length) === rowNormalizedValid,
    });
  }

  const available = withoutCapture === 0 && calls.length > 0;
  const reconciled = available
    ? (rawInvalidTotal === stripped
       && (rawAttemptsTotal - rawInvalidTotal) === normalizedValid)
    : null;

  const detail = !available
    ? `NOT RECONCILABLE — ${withoutCapture} of ${calls.length} calls have no captured wire. The raw `
      + 'figures are null rather than zero, and nothing is reconstructed for them.'
    : reconciled
      ? `raw attempts ${rawAttemptsTotal} = ${rawAttemptsTotal - rawInvalidTotal} valid + `
        + `${rawInvalidTotal} invalid; normalized kept ${normalizedValid} and the boundary stripped `
        + `${stripped}. Every invalid attempt the model made is visible in the raw figures.`
      : `INSTRUMENT DISAGREEMENT — raw invalid ${rawInvalidTotal} vs stripped ${stripped}, and raw `
        + `valid ${rawAttemptsTotal - rawInvalidTotal} vs normalized ${normalizedValid}. The larger `
        + 'discrepancy is reported rather than the smaller number.';

  return {
    version: RAW_LINKAGE_DIAGNOSTICS_VERSION,
    rawCaptureAvailable: available,
    callsWithRawCapture: withCapture,
    callsWithoutRawCapture: withoutCapture,
    RAW_LINKAGE_ATTEMPTS: available ? rawAttemptsTotal : null,
    RAW_INVALID_LINKAGE_ATTEMPTS: available ? rawInvalidTotal : null,
    NORMALIZED_VALID_LINKAGES: normalizedValid,
    STRIPPED_INVALID_LINKAGES: stripped,
    reconciled,
    reconciliationDetail: detail,
    perRow,
  };
}
