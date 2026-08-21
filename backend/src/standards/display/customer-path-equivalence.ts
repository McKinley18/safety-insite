/**
 * KG-5C -- evidence-based comparison classes for customer-path equivalence.
 *
 * =====================================================================================
 * WHY THIS MODULE EXISTS
 * =====================================================================================
 *
 * KG-5B measured 15 approved records as `CONTENT_DIFFERENCE`/`BLOCKING`. That count was
 * corroborated by an independent reconciliation, but it was produced by a comparator that selected
 * its legacy input with `normalizeCitationForMatch` -- NOT by exercising the live
 * `hydrateStandardReferences` customer path. So 15 was a DISCOVERY, not an equivalence result, and
 * the shadow comparator's single `CONTENT_DIFFERENCE` bucket cannot distinguish between:
 *
 *   - the governed artifact being an exact subsection of a larger legacy section dump;
 *   - a presentation/encoding difference that cannot alter regulatory meaning;
 *   - a genuine regulatory content disagreement.
 *
 * Those have completely different remedies, and collapsing them is how a corpus adjudication
 * becomes an unreadable wall of blockers. This module states the distinctions and the evidence
 * each one requires.
 *
 * =====================================================================================
 * THE RULE THAT KEEPS THIS HONEST
 * =====================================================================================
 *
 * Every relaxation below must be MECHANICALLY DEFINED, NARROW, and INCAPABLE OF ALTERING
 * REGULATORY MEANING. Nothing here strips substantive punctuation, operators, digits, units,
 * qualifiers, exceptions, negations, or regulatory structure. A comparison that cannot be proven
 * equivalent under these rules is `CONTENT_DIFFERENCE` -- the burden of proof is on equivalence,
 * never on difference.
 */

export type EquivalenceClass =
  /** Byte-identical after only already-approved canonical serialization. */
  | 'EXACT'
  /**
   * Differences are exclusively mechanical presentation/encoding normalization that cannot alter
   * regulatory meaning. The exact normalizations applied are reported per record.
   */
  | 'NORMALIZATION_ONLY'
  /**
   * The exact governed artifact exists as a deterministic, unmodified regulatory unit within the
   * larger legacy content, with PROVEN boundaries. A generic substring hit is NOT sufficient.
   */
  | 'GOVERNED_EXACT_SUBSET_OF_LEGACY'
  /** Substantively different, or not provable as equivalent under the rules above. */
  | 'CONTENT_DIFFERENCE'
  /** The real customer legacy path resolved no corpus record for this citation. */
  | 'LEGACY_UNRESOLVED'
  /** The governed path resolved no record for this citation. */
  | 'GOVERNED_UNRESOLVED'
  /** More than one plausible pairing exists and the application cannot pick authoritatively. */
  | 'PAIRING_AMBIGUOUS'
  /**
   * KG-5C. The governed artifact is a REVIEWED, CLAUSE-ACCURATE RENDERING of the cited regulation
   * rather than a verbatim extract of the legacy ingest, so byte-equality with the legacy corpus is
   * not achievable BY CONSTRUCTION and its absence is not evidence of disagreement.
   *
   * WHY THIS CATEGORY HAD TO EXIST. The two sides are different KINDS of artifact. Legacy
   * `standard_text` is a verbatim eCFR/MSHA ingest; the governed `canonicalText` is the reviewed
   * rendering KG-3D/3E/4A adjudicated clause by clause -- it expands defined terms inline (30 CFR
   * 62.120's "the action level" becomes "an 8-hour time-weighted average sound level of 85 dBA, or
   * equivalently a dose of 50 percent, per 30 CFR 62.101"), names limiting sibling paragraphs, and
   * states the citation explicitly. Forcing that into `CONTENT_DIFFERENCE` reports a governance
   * disagreement where none was measured, and forcing it into `EXACT`/`NORMALIZATION_ONLY` would
   * be a lie about what was compared.
   *
   * ENTRY IS MECHANICAL, NOT ASSERTED. All four must hold -- see `classifyEquivalence`:
   *   1. the record is reviewer-approved in the active release against its EXACT checksum;
   *   2. a clause-by-clause review is RECORDED for it in a named KG phase artifact;
   *   3. the text the customer path actually delivers is byte-identical to the release record's
   *      frozen `payload.canonicalText` -- the reviewed bytes, not a re-derivation;
   *   4. the legacy content, where it resolves at all, carries the SAME logical citation identity.
   *
   * WHAT IT DOES NOT PROVE, STATED PLAINLY. It does not mechanically prove the rendering is
   * non-contradictory with the underlying regulation. Nothing can: that is a legal reading, and it
   * is precisely what the recorded clause-by-clause review IS. This category therefore reports
   * that the delivered artifact is the reviewed one and that a review exists -- never that the
   * review was correct.
   */
  | 'GOVERNED_REVIEWED_RENDERING';

/**
 * KG-5C -- THE PRIMARY VERDICT, and the one the brief's central question actually asks.
 *
 * "Does the real customer path resolve and deliver regulatory content that is equivalent to the
 * exact governed artifact that was reviewed and approved?" That is a question about DELIVERY
 * FIDELITY, not about legacy/governed similarity: a cutover whose whole purpose is to replace an
 * unreviewed ingest with a reviewed artifact SHOULD change the text, and measuring that change as
 * a defect would be measuring the feature.
 *
 * What must never happen is the badge and the bytes disagreeing.
 */
export type DeliveryEquivalence =
  /** Approved: the customer receives byte-for-byte the reviewed governed artifact. */
  | 'DELIVERS_REVIEWED_ARTIFACT'
  /** Not approved: governed mode delivered exactly what LEGACY delivers. A true no-op. */
  | 'FALLBACK_IDENTICAL_TO_LEGACY'
  /** DEFECT: an approved badge sits on content that is not the reviewed artifact. */
  | 'APPROVED_BADGE_ON_DIFFERENT_CONTENT'
  /** DEFECT: an unapproved record's delivery differs from legacy. */
  | 'FALLBACK_ALTERED_CUSTOMER_OUTPUT'
  /** DEFECT: unapproved content presented as approved. */
  | 'UNAPPROVED_PRESENTED_AS_APPROVED';

export interface EquivalenceEvidence {
  equivalenceClass: EquivalenceClass;
  /** Human-readable statement of WHY, naming the mechanism. Never a bare verdict. */
  basis: string;
  legacyLength: number;
  governedLength: number;
  /** Normalizations that were required to reach equality, in the order applied. Empty for EXACT. */
  normalizationsApplied: string[];
  /** For GOVERNED_EXACT_SUBSET_OF_LEGACY: the proven boundary evidence. */
  boundaryEvidence?: {
    startIndex: number;
    endIndex: number;
    startsAtRegulatoryBoundary: boolean;
    endsAtRegulatoryBoundary: boolean;
    boundaryRule: string;
  };
  /** True when the customer-visible body text differs between LEGACY and GOVERNED delivery. */
  customerVisibleTextDiffers: boolean;
}

/**
 * The normalization ladder. Each rung is applied in order and NAMED when it changes the string, so
 * a `NORMALIZATION_ONLY` verdict always reports exactly which mechanisms were needed.
 *
 * Deliberately excluded, and the exclusions are the substance of the contract:
 *   - no case folding beyond none at all (case can be substantive in defined terms);
 *   - no punctuation removal (a comma changes the scope of an enumeration);
 *   - no digit, unit or operator normalization;
 *   - no stopword or filler removal;
 *   - no stemming, lemmatization or synonym mapping;
 *   - no removal of parentheticals, exceptions, provisos or negations.
 *
 * What IS allowed is limited to transport-level encoding and whitespace: the ways the same
 * characters can be carried differently by a database column, a JSON round-trip or an eCFR scrape.
 */
const NORMALIZATION_LADDER: Array<{ name: string; apply: (value: string) => string }> = [
  {
    name: 'unicode-nfc',
    // Composed vs decomposed accents are the same characters, differently encoded.
    apply: value => value.normalize('NFC'),
  },
  {
    name: 'nbsp-to-space',
    // eCFR scrapes carry U+00A0 where a database column carries U+0020.
    apply: value => value.replace(/ /g, ' '),
  },
  {
    name: 'typographic-quotes-and-dashes',
    // Curly quotes and en/em dashes vs their ASCII forms. Character identity, not meaning:
    // the dash still separates the same two operands and the quote still bounds the same term.
    apply: value => value
      .replace(/[‘’‛]/g, "'")
      .replace(/[“”‟]/g, '"')
      .replace(/[‐‑‒–—]/g, '-'),
  },
  {
    name: 'section-sign-spacing',
    // "§1910.147" vs "§ 1910.147". The symbol and the citation are unchanged.
    apply: value => value.replace(/§\s*/g, '§ '),
  },
  {
    name: 'collapse-whitespace',
    // Line wrapping and indentation differ between a scrape and a column. Collapsed LAST so the
    // rungs above cannot be masked by it.
    apply: value => value.replace(/\s+/g, ' ').trim(),
  },
];

export function applyNormalizationLadder(value: string): { text: string; applied: string[] } {
  let text = String(value ?? '');
  const applied: string[] = [];
  for (const rung of NORMALIZATION_LADDER) {
    const next = rung.apply(text);
    if (next !== text) applied.push(rung.name);
    text = next;
  }
  return { text, applied };
}

/**
 * Proves whether `governed` sits inside `legacy` as a REGULATORY UNIT rather than as an arbitrary
 * substring.
 *
 * A generic `includes()` is explicitly not enough: "shall be guarded" occurs inside a hundred
 * unrelated sentences, and accepting that as containment would let an arbitrary fragment of an
 * unrelated obligation be presented as the reviewed artifact. Containment counts only when BOTH
 * boundaries fall where a regulatory unit can begin and end:
 *
 *   START  the string start, or a paragraph/sentence boundary, or immediately after a citation
 *          marker such as "(a)" / "(1)" / "§ 1910.147".
 *   END    the string end, or a sentence terminator, or immediately before a paragraph marker.
 *
 * Both must hold. A hit that satisfies neither is reported, with its indices, as NOT a boundary
 * match -- the caller then classifies `CONTENT_DIFFERENCE`, which is the conservative direction.
 */
export function proveGovernedSubsetOfLegacy(legacy: string, governed: string): {
  contained: boolean;
  startIndex: number;
  endIndex: number;
  startsAtRegulatoryBoundary: boolean;
  endsAtRegulatoryBoundary: boolean;
  boundaryRule: string;
} {
  const startIndex = governed && legacy ? legacy.indexOf(governed) : -1;
  if (startIndex < 0) {
    return {
      contained: false, startIndex: -1, endIndex: -1,
      startsAtRegulatoryBoundary: false, endsAtRegulatoryBoundary: false,
      boundaryRule: 'governed text does not occur in the legacy text at all',
    };
  }
  const endIndex = startIndex + governed.length;
  const before = legacy.slice(Math.max(0, startIndex - 24), startIndex);
  const after = legacy.slice(endIndex, endIndex + 24);

  const startsAtRegulatoryBoundary =
    startIndex === 0
    || /(?:^|[.;:]\s+|\n\s*)$/.test(before)
    || /\([a-z0-9]+\)\s*$/i.test(before)
    || /§\s*[\d.]+(?:\([a-z0-9]+\))*\s*$/i.test(before);

  const endsAtRegulatoryBoundary =
    endIndex === legacy.length
    || /^\s*$/.test(after)
    || /^[.;:]/.test(after)
    || /^\s*\([a-z0-9]+\)/i.test(after)
    || /^\s*\n/.test(after);

  return {
    contained: startsAtRegulatoryBoundary && endsAtRegulatoryBoundary,
    startIndex, endIndex, startsAtRegulatoryBoundary, endsAtRegulatoryBoundary,
    boundaryRule:
      `start=${startsAtRegulatoryBoundary ? 'boundary' : `mid-unit after ${JSON.stringify(before.slice(-16))}`}; ` +
      `end=${endsAtRegulatoryBoundary ? 'boundary' : `mid-unit before ${JSON.stringify(after.slice(0, 16))}`}`,
  };
}

/**
 * Classifies one legacy/governed pair. Pure, so the harness and its tests cannot disagree.
 *
 * Order is load-bearing and runs from strongest to weakest evidence, so a record is never reported
 * under a weaker class than it actually earns, and never under a stronger one than it proves.
 */
export function classifyEquivalence(input: {
  legacyText: string | null | undefined;
  governedText: string | null | undefined;
  legacyResolved: boolean;
  governedResolved: boolean;
  pairingCandidates?: number;
  /** KG-5C. The four mechanical preconditions for `GOVERNED_REVIEWED_RENDERING`. */
  reviewedRendering?: {
    approvedAtExactChecksum: boolean;
    clauseReviewRecorded: boolean;
    deliveredTextIsFrozenArtifact: boolean;
    sameLogicalCitationIdentity: boolean;
    evidencePhases: string[];
  };
}): EquivalenceEvidence {
  const legacy = String(input.legacyText ?? '');
  const governed = String(input.governedText ?? '');
  const base = {
    legacyLength: legacy.length,
    governedLength: governed.length,
    normalizationsApplied: [] as string[],
    customerVisibleTextDiffers: legacy !== governed,
  };

  if (!input.governedResolved) {
    return { ...base, equivalenceClass: 'GOVERNED_UNRESOLVED',
      basis: 'The governed resolver returned no record for this citation in the active release.' };
  }
  if (!input.legacyResolved) {
    return { ...base, equivalenceClass: 'LEGACY_UNRESOLVED',
      basis: 'The real customer legacy hydration path resolved no corpus record for this citation, '
        + 'so there is no legacy content to disagree with.' };
  }
  if ((input.pairingCandidates ?? 1) > 1) {
    return { ...base, equivalenceClass: 'PAIRING_AMBIGUOUS',
      basis: `${input.pairingCandidates} legacy rows are plausible pairings and the customer path `
        + 'cannot deterministically establish which is authoritative.' };
  }

  if (legacy === governed) {
    return { ...base, equivalenceClass: 'EXACT', customerVisibleTextDiffers: false,
      basis: 'Byte-identical without any normalization.' };
  }

  const l = applyNormalizationLadder(legacy);
  const g = applyNormalizationLadder(governed);
  if (l.text === g.text) {
    return {
      ...base, equivalenceClass: 'NORMALIZATION_ONLY',
      normalizationsApplied: Array.from(new Set([...l.applied, ...g.applied])),
      basis: 'Equal after transport-level encoding/whitespace normalization only. No substantive '
        + 'character, digit, operator, qualifier or structural element was altered to reach equality.',
    };
  }

  const proof = proveGovernedSubsetOfLegacy(l.text, g.text);
  if (proof.contained) {
    return {
      ...base, equivalenceClass: 'GOVERNED_EXACT_SUBSET_OF_LEGACY',
      normalizationsApplied: Array.from(new Set([...l.applied, ...g.applied])),
      boundaryEvidence: {
        startIndex: proof.startIndex, endIndex: proof.endIndex,
        startsAtRegulatoryBoundary: proof.startsAtRegulatoryBoundary,
        endsAtRegulatoryBoundary: proof.endsAtRegulatoryBoundary,
        boundaryRule: proof.boundaryRule,
      },
      basis: 'The governed artifact occurs in the legacy content as a complete regulatory unit, '
        + 'with both boundaries proven to fall at paragraph/sentence/citation-marker positions.',
    };
  }

  // KG-5C. Only now, after EXACT, NORMALIZATION_ONLY and proven containment have all been tried
  // and failed, may a reviewed rendering be recognised -- so this can never mask a difference that
  // one of the stronger classes would have explained.
  const rr = input.reviewedRendering;
  if (rr && rr.approvedAtExactChecksum && rr.clauseReviewRecorded
      && rr.deliveredTextIsFrozenArtifact && rr.sameLogicalCitationIdentity) {
    return {
      ...base, equivalenceClass: 'GOVERNED_REVIEWED_RENDERING',
      normalizationsApplied: Array.from(new Set([...l.applied, ...g.applied])),
      basis: 'The delivered text is byte-identical to the release record\'s frozen reviewed '
        + `artifact; the record is approved against its exact checksum; a clause-by-clause review `
        + `is recorded in ${rr.evidencePhases.join(', ') || 'a named KG phase'}; and the legacy `
        + 'content carries the same logical citation identity. Byte-equality with the verbatim '
        + 'legacy ingest is not achievable by construction and its absence is therefore not '
        + 'evidence of regulatory disagreement. This does NOT mechanically prove the rendering is '
        + 'non-contradictory -- that is the recorded review, not a computation.',
    };
  }

  return {
    ...base, equivalenceClass: 'CONTENT_DIFFERENCE',
    normalizationsApplied: Array.from(new Set([...l.applied, ...g.applied])),
    ...(proof.startIndex >= 0
      ? { boundaryEvidence: {
          startIndex: proof.startIndex, endIndex: proof.endIndex,
          startsAtRegulatoryBoundary: proof.startsAtRegulatoryBoundary,
          endsAtRegulatoryBoundary: proof.endsAtRegulatoryBoundary,
          boundaryRule: proof.boundaryRule,
        } }
      : {}),
    basis: proof.startIndex >= 0
      ? 'The governed text occurs in the legacy content but NOT at proven regulatory boundaries, '
        + 'so containment cannot be established mechanically. Treated as a content difference, '
        + 'which is the conservative direction.'
      : 'The compared regulatory content differs substantively and equivalence cannot be proven '
        + 'under the allowed normalizations.',
  };
}
