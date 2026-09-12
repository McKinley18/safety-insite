/**
 * §151 EXPERT HAZLENZ -- THE FIXTURE LINTER. DEVELOPMENT INSTRUMENT ONLY.
 *
 * ==================== WHY THIS EXISTS, AND WHAT IT CANNOT DO ====================
 *
 * Across §149 and §150 the answer key was wrong four times, and every time in the SAME DIRECTION --
 * against the model. US-I1 claimed a derivation that needed an unstated premise; US-D1's observation
 * presupposed the fact it withheld; RB-H1 contained a real decision-critical gap inside a row
 * authored FORBIDDEN; RB-D1 named one of two equally exact selectors. An instrument that errs
 * consistently in one direction is not noisy, it is BIASED, and it cannot certify a model.
 *
 *   >>> THE LINTER CANNOT CATCH ANY OF THOSE FOUR. Every one is semantic. A presupposition, an
 *   >>> unstated premise, a sibling gap and a second valid selector are all judgements about meaning,
 *   >>> and §148 measured what happens when a keyword rule is trusted with a judgement about meaning:
 *   >>> in sample it looked perfect, and out of sample an adverb produced the deleting label.
 *
 * So this module does exactly two things and claims nothing else:
 *
 *   1. MECHANICAL CHECKS that are arithmetic or structural, and therefore complete. These FAIL
 *      CLOSED: a set carrying one of them must not reach hosted spend.
 *   2. MANUAL-REVIEW ASSERTIONS -- the semantic properties of the §151 authoring standard, carried as
 *      DECLARATIONS a human must sign per row. The linter verifies that a declaration EXISTS and is
 *      substantive; it never verifies that the declaration is TRUE. An unsigned row fails closed; a
 *      signed row is a human's claim, recorded with their words so a later reader can disagree.
 *
 * The distinction is the whole point. Pretending deterministic linting settles fixture validity would
 * be the §140 mistake -- measuring the instrument and reporting it as the product -- one layer down.
 */

export const FIXTURE_LINTER_VERSION = 'hazlenz.expert.fixture-linter.v1' as const;

/**
 * The eight REQUIRED and five FORBIDDEN semantic properties of the §151 authoring standard, plus the
 * family-mapping property. Each is a claim only a human can make.
 *
 * The names are deliberately the defect classes from `SECTION-150-ROW-READJUDICATION.md`, so a
 * signature is traceable to the failure it exists to prevent.
 */
export const REQUIRED_REVIEW_CLAIMS = [
  /** §151 R1. The missing fact is not already stated anywhere in the observation or evidence. */
  'NOT_ALREADY_STATED',
  /** §151 R2. Defect class A. No sentence presupposes it — US-D1's "the open lane". */
  'NO_PRESUPPOSITION',
  /** §151 R3. Defect class B. Not derivable from stated facts without an added premise. */
  'NOT_DETERMINISTICALLY_DERIVABLE',
  /** §151 R4. At least two materially plausible values remain open. */
  'TWO_PLAUSIBLE_VALUES',
  /** §151 R5. Those values change a contract-valid affectedDecision — TODAY, not as a follow-up. */
  'BRANCHES_CHANGE_A_CURRENT_DECISION',
  /** §151 R6. No supplied record or stated default collapses the branch. */
  'NO_HIDDEN_DEFAULT',
  /**
   * §151 R7. Defect class I — the one that bit RB-D1. The expected question targets the ONLY exact
   * missing fact, or every equally exact selector is enumerated as acceptable.
   */
  'SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED',
  /** §151 R8. Defect class E. The expected label is the decision the answer blocks. */
  'AFFECTED_DECISION_JUSTIFIED',
] as const;
export type RequiredReviewClaim = (typeof REQUIRED_REVIEW_CLAIMS)[number];

export const FORBIDDEN_REVIEW_CLAIMS = [
  /** §151 F1. The relevant fact is established, OR the unknown is decision-invariant. */
  'ESTABLISHED_OR_DECISION_INVARIANT',
  /** §151 F2. Defect class B. Reaching that conclusion needs no unstated premise — US-I1. */
  'NO_UNSTATED_PREMISE',
  /**
   * §151 F3. Defect class C — the one that bit RB-H1. NO other decision-critical gap remains
   * anywhere in the row, including one the author introduced as background colour.
   */
  'NO_SIBLING_DECISION_CRITICAL_GAP',
  /** §151 F4. The wording does not inadvertently create another legitimate opportunity. */
  'WORDING_CREATES_NO_OPPORTUNITY',
  /**
   * §151 F5. Defect class J. Advertised-absence wording ("the observation does not record X") is
   * permitted ONLY where the invariance is demonstrated in the same observation — §149's US-J1
   * showed the control working; §150's RB-F1 did not.
   */
  'ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED',
] as const;
export type ForbiddenReviewClaim = (typeof FORBIDDEN_REVIEW_CLAIMS)[number];

/** One human signature. `note` must say WHY, in the author's own words, or the row fails closed. */
export interface ReviewSignature {
  claim: string;
  /** The author's reason. Short and specific; a bare restatement of the claim name is refused. */
  note: string;
}

/** The linter's view of a fixture row. Deliberately structural — it never sees prose meaning. */
export interface LintableFixtureRow {
  rowId: string;
  domain: string;
  observation: string;
  expectation: 'REQUIRED' | 'FORBIDDEN';
  allowedHazardFamilies: readonly string[];
  truthPresent: readonly string[];
  truthDefensible: readonly string[];
  truthForbidden: readonly string[];
  truthNegatedOrSafe: readonly string[];
  truthLifeCritical: readonly string[];
  /** Authored decision-critical gaps: exactly one on REQUIRED, none on FORBIDDEN. */
  gaps: ReadonlyArray<{ gapId: string; description: string; affectedDecision: string }>;
  /** Expected label on a REQUIRED row; absent on FORBIDDEN. */
  expectedAffectedDecision?: string;
  /** Which metric denominators the row declares itself part of. */
  denominators: readonly string[];
  /** The human's signatures. */
  review: readonly ReviewSignature[];
  /**
   * Canonical family mapping for any truth family whose name differs from what the deterministic
   * layer emits. Defect class D — the RB-C1 `suspended_loads` / `cranes_hoists` alias.
   */
  familyAliases?: Readonly<Record<string, string>>;
}

export interface LintFinding {
  rowId: string;
  /** MECHANICAL findings fail closed. REVIEW findings fail closed only when a signature is missing. */
  kind: 'MECHANICAL' | 'REVIEW';
  code: string;
  detail: string;
}

export interface LintResult {
  version: string;
  rowsLinted: number;
  findings: LintFinding[];
  mechanicalFailures: number;
  reviewFailures: number;
  /** FALSE blocks hosted spend. */
  passed: boolean;
  /** What a human still owes, stated so a green lint is never mistaken for a validated set. */
  semanticResidual: string;
}

const isSubstantive = (s: string | undefined, min = 25): boolean =>
  typeof s === 'string' && s.trim().length >= min;

/**
 * Lint a set. Every check here is mechanical or a signature-presence check; none reads meaning.
 *
 * `canonicalFamilies`, when supplied, is the vocabulary the deterministic layer actually emits. A
 * truth family outside it must carry an explicit alias mapping, which is defect class D closed at the
 * only point it can be closed without guessing.
 */
export function lintFixtureSet(
  rows: readonly LintableFixtureRow[],
  options: { canonicalFamilies?: readonly string[];
             declaredDenominators?: readonly string[] } = {},
): LintResult {
  const f: LintFinding[] = [];
  const push = (rowId: string, kind: LintFinding['kind'], code: string, detail: string) =>
    f.push({ rowId, kind, code, detail });

  // ---- SET-LEVEL: duplicate identity.
  const seenIds = new Set<string>();
  const seenDomains = new Set<string>();
  for (const r of rows) {
    if (seenIds.has(r.rowId)) push(r.rowId, 'MECHANICAL', 'DUPLICATE_ROW_ID', r.rowId);
    seenIds.add(r.rowId);
    if (seenDomains.has(r.domain)) {
      push(r.rowId, 'MECHANICAL', 'DUPLICATE_DOMAIN',
        `${r.domain} — a repeated domain over-samples one family and weakens the set`);
    }
    seenDomains.add(r.domain);
  }

  for (const r of rows) {
    // ---- TRUTH PARTITION. Disjoint and covering, both directions. This is the check that caught six
    //      real defects on the v5 set's first dry run, carried forward.
    const buckets: Array<[string, readonly string[]]> = [
      ['present', r.truthPresent], ['defensible', r.truthDefensible], ['forbidden', r.truthForbidden],
    ];
    const seen = new Map<string, string>();
    for (const [name, fams] of buckets) {
      for (const fam of fams) {
        const prior = seen.get(fam);
        if (prior) push(r.rowId, 'MECHANICAL', 'TRUTH_BUCKETS_OVERLAP', `${fam} is ${prior} and ${name}`);
        else seen.set(fam, name);
        if (!r.allowedHazardFamilies.includes(fam)) {
          push(r.rowId, 'MECHANICAL', 'TRUTH_FAMILY_OUTSIDE_VOCABULARY', `${fam} (${name})`);
        }
      }
    }
    for (const fam of r.allowedHazardFamilies) {
      if (!seen.has(fam)) {
        push(r.rowId, 'MECHANICAL', 'MALFORMED_TRUTH_PARTITION',
          `${fam} is in the vocabulary but in no bucket`);
      }
    }
    for (const fam of r.truthNegatedOrSafe) {
      if (!r.allowedHazardFamilies.includes(fam)) {
        push(r.rowId, 'MECHANICAL', 'NEGATED_FAMILY_OUTSIDE_VOCABULARY', fam);
      }
    }
    // The overlay is independent of the partition; a negated family still needs a partition home,
    // and it must never be the row's own forbidden bucket.
    for (const fam of r.truthNegatedOrSafe) {
      if (r.truthForbidden.includes(fam)) {
        push(r.rowId, 'MECHANICAL', 'NEGATED_FAMILY_IS_FORBIDDEN',
          `${fam} cannot be both a forbidden family and a recorded safe state`);
      }
    }
    for (const fam of r.truthLifeCritical) {
      if (!r.truthPresent.includes(fam)) {
        push(r.rowId, 'MECHANICAL', 'LIFE_CRITICAL_NOT_PRESENT', fam);
      }
    }

    // ---- GAP METADATA, and its consistency with the row's own expectation.
    const gapIds = new Set<string>();
    for (const g of r.gaps) {
      if (gapIds.has(g.gapId)) push(r.rowId, 'MECHANICAL', 'DUPLICATE_GAP_ID', g.gapId);
      gapIds.add(g.gapId);
      if (!isSubstantive(g.description, 20)) {
        push(r.rowId, 'MECHANICAL', 'GAP_DESCRIPTION_INSUBSTANTIAL', g.gapId);
      }
    }
    if (r.expectation === 'REQUIRED') {
      if (r.gaps.length !== 1) {
        push(r.rowId, 'MECHANICAL', 'MISSING_EXPECTED_OPPORTUNITY_METADATA',
          `a REQUIRED row must declare exactly one gap; found ${r.gaps.length}`);
      }
      if (!isSubstantive(r.expectedAffectedDecision, 3)) {
        push(r.rowId, 'MECHANICAL', 'REQUIRED_ROW_WITHOUT_AFFECTED_DECISION', r.rowId);
      } else if (r.gaps.length === 1
                 && r.gaps[0].affectedDecision !== r.expectedAffectedDecision) {
        push(r.rowId, 'MECHANICAL', 'AFFECTED_DECISION_DISAGREEMENT',
          `row truth says ${r.gaps[0].affectedDecision}, expectation says `
          + `${r.expectedAffectedDecision} — one row, one label`);
      }
    } else {
      // Defect class F, mechanically detectable in its one detectable form.
      if (r.gaps.length !== 0) {
        push(r.rowId, 'MECHANICAL', 'FORBIDDEN_ROW_CARRIES_EXPECTED_GAP',
          `a FORBIDDEN row declared ${r.gaps.length} decision-critical gap(s)`);
      }
      if (r.expectedAffectedDecision !== undefined) {
        push(r.rowId, 'MECHANICAL', 'FORBIDDEN_ROW_CARRIES_AFFECTED_DECISION',
          String(r.expectedAffectedDecision));
      }
    }

    // ---- DENOMINATOR DECLARATIONS must match what the row actually is.
    const expectDen = r.expectation === 'REQUIRED' ? 'STRICT_REQUIRED_RECALL' : 'FORBIDDEN_SILENCE';
    if (!r.denominators.includes(expectDen)) {
      push(r.rowId, 'MECHANICAL', 'DENOMINATOR_INCONSISTENT_WITH_ROW',
        `a ${r.expectation} row must declare ${expectDen}; declared [${r.denominators.join(', ')}]`);
    }
    const wrongDen = r.expectation === 'REQUIRED' ? 'FORBIDDEN_SILENCE' : 'STRICT_REQUIRED_RECALL';
    if (r.denominators.includes(wrongDen)) {
      push(r.rowId, 'MECHANICAL', 'DENOMINATOR_CONTAMINATION',
        `a ${r.expectation} row declared ${wrongDen}`);
    }
    for (const d of r.denominators) {
      if (options.declaredDenominators && !options.declaredDenominators.includes(d)) {
        push(r.rowId, 'MECHANICAL', 'UNKNOWN_DENOMINATOR', d);
      }
    }

    // ---- FAMILY ALIAS. Defect class D, closed where it can be closed without guessing.
    if (options.canonicalFamilies) {
      const canonical = new Set(options.canonicalFamilies);
      for (const fam of [...r.truthPresent, ...r.truthDefensible]) {
        if (!canonical.has(fam) && !(r.familyAliases && r.familyAliases[fam])) {
          push(r.rowId, 'MECHANICAL', 'FAMILY_ALIAS_MISSING',
            `${fam} is not in the canonical vocabulary and declares no alias mapping — this is the `
            + 'RB-C1 defect, where authored truth and the engine named one hazard two ways');
        }
        if (r.familyAliases && r.familyAliases[fam] && !canonical.has(r.familyAliases[fam])) {
          push(r.rowId, 'MECHANICAL', 'FAMILY_ALIAS_TARGET_NOT_CANONICAL',
            `${fam} -> ${r.familyAliases[fam]}`);
        }
      }
    }

    if (!isSubstantive(r.observation, 120)) {
      push(r.rowId, 'MECHANICAL', 'OBSERVATION_INSUBSTANTIAL',
        `${r.observation.trim().length} chars`);
    }

    // ---- MANUAL-REVIEW SIGNATURES. Presence and substance only. NEVER truth.
    const need: readonly string[] = r.expectation === 'REQUIRED'
      ? REQUIRED_REVIEW_CLAIMS : FORBIDDEN_REVIEW_CLAIMS;
    const signed = new Map(r.review.map(s => [s.claim, s.note]));
    for (const claim of need) {
      if (!signed.has(claim)) {
        push(r.rowId, 'REVIEW', 'UNSIGNED_REVIEW_CLAIM',
          `${claim} — a ${r.expectation} row cannot enter spend unsigned`);
      } else if (!isSubstantive(signed.get(claim))) {
        push(r.rowId, 'REVIEW', 'REVIEW_NOTE_INSUBSTANTIAL',
          `${claim} — the signature must say WHY, in the author's own words`);
      } else if (signed.get(claim)!.trim().toUpperCase().replace(/[^A-Z]/g, '')
                 === claim.replace(/[^A-Z]/g, '')) {
        push(r.rowId, 'REVIEW', 'REVIEW_NOTE_RESTATES_THE_CLAIM', claim);
      }
    }
    for (const s of r.review) {
      if (!need.includes(s.claim)) {
        push(r.rowId, 'REVIEW', 'UNKNOWN_REVIEW_CLAIM',
          `${s.claim} is not a claim the ${r.expectation} standard defines`);
      }
    }
  }

  const mechanicalFailures = f.filter(x => x.kind === 'MECHANICAL').length;
  const reviewFailures = f.filter(x => x.kind === 'REVIEW').length;

  return {
    version: FIXTURE_LINTER_VERSION,
    rowsLinted: rows.length,
    findings: f,
    mechanicalFailures,
    reviewFailures,
    // FAIL CLOSED on both: a mechanical defect is a defect, and an unsigned semantic claim means
    // nobody has taken responsibility for the property the linter cannot check.
    passed: mechanicalFailures === 0 && reviewFailures === 0,
    semanticResidual:
      'A GREEN LINT IS NOT A VALIDATED SET. The four defects that actually occurred in §149 and §150 '
      + '— a presupposition leak, an unstated-premise derivation, a genuine gap inside a FORBIDDEN '
      + 'row, and a second equally exact selector — are ALL SEMANTIC and NONE is detectable here. '
      + 'What this result establishes is that the mechanical properties hold and that a human has '
      + 'signed for each semantic property in their own words. The signatures are claims, not proofs, '
      + 'and a later reader may disagree with any of them.',
  };
}
