/**
 * §196 EXPERT HAZLENZ -- AUTHORISED SUPPLIED-SOURCE CITATION REUSE. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS.
 *
 * ==================== THE COLLISION THIS RESOLVES ====================
 *
 * §195 demonstrated deterministically, with no spend, that §193 and §194 combine into a case
 * neither anticipated:
 *
 *     reliance    SUPPLIED_GOVERNED_EVIDENCE
 *     sourceIds   ['GOV-WORKREST-01']            valid, supplied, closed-set member
 *     proposition '...the supplied record at 29 CFR 1910.215(a)(4) sets a maximum gap'
 *       -> admitted = false, PROHIBITED_REGULATORY_CITATION
 *
 * while the same verdict with the citation PARAPHRASED AWAY is admitted. A verifier behaving
 * correctly loses its whole verdict, and the repair it must learn is "paraphrase the source rather
 * than quote it" -- in a programme where `governed-evidence-derivation.ts` deliberately COPIES
 * governed vocabulary rather than paraphrasing it, because paraphrase is where fidelity is lost.
 *
 * ==================== THE DISTINCTION THAT ACTUALLY MATTERS ====================
 *
 *      PROVIDER-ORIGINATED CITATION AUTHORITY      -- a citation produced from memory. REFUSED.
 *      REPRODUCTION OF AUTHORISED SUPPLIED TEXT    -- a citation copied from evidence the system
 *                                                     itself handed over, under a declared and
 *                                                     validated reliance. ADMISSIBLE.
 *
 * Those two are not separable by reading the string, which is why §193 refused everything. They ARE
 * separable by asking whether the string is PRESENT IN THE SUPPLIED SOURCE -- a byte question, with
 * no inference in it, and the only rule that distinguishes quoting from inventing exactly. That was
 * §195's own preferred option and it is what this module implements.
 *
 * ==================== WHAT IS DELIBERATELY NOT BUILT ====================
 *
 * No fuzzy matching, no nearest citation, no prefix or family matching, no "same section" logic. A
 * token is admitted only on EXACT equality after a normalisation that touches case and whitespace
 * and NOTHING ELSE. A verdict that cites `1910.215(a)(4)` where the source says `1910.215` has
 * MADE A DIFFERENT CITATION and is refused, because a paragraph reference is where regulatory
 * meaning lives.
 *
 * ==================== THIS IS NOT PERMISSION TO QUOTE AT LENGTH ====================
 *
 * The unit admitted here is a CITATION IDENTIFIER and nothing else. Reproducing "29 CFR 1910.215"
 * is not reproducing the paragraph it names, and this module admits no other text: it lifts exactly
 * one refusal, for exactly the tokens it matched, and every other rule in the admission chain is
 * untouched. `QUOTATION_BOUNDARY_STATEMENT` records the honest position on the neighbouring
 * question, which is that no quotation-length limit exists on the verifier path today and §196
 * creates neither one nor a licence in its absence.
 */

export const GOVERNED_CITATION_REUSE_VERSION =
  'hazlenz.expert.governed-citation-reuse.v1' as const;

/**
 * A full citation token, not merely the citation-SHAPED prefix.
 *
 * `CITATION_SHAPED_PATTERN` (`\b\d{2}\s*CFR\s*\d+`) is the canonical DETECTOR and is reused
 * unchanged for detection everywhere else in the product. It matches only "29 CFR 1910", so it
 * cannot serve as the unit of COMPARISON: comparing prefixes would admit `1910.215(a)(4)` against a
 * source that says `1910.147`, which is a different regulation. This pattern extends the canonical
 * one rightwards over the dotted section and its parenthesised paragraphs so the whole identifier is
 * compared. It never matches anything the canonical detector would not also match, which the §196
 * suite asserts rather than assumes.
 */
export const CITATION_TOKEN_PATTERN =
  /\b\d{2}\s*CFR\s*\d+(?:\.\d+)*(?:\s*\([^()\s]{1,8}\))*/gi;

/**
 * Case and whitespace only.
 *
 * Recorded as an explicit list because the temptation with a normaliser is always to add one more
 * rule, and every rule beyond these two starts deciding that two different citations are the same.
 */
export const CITATION_NORMALISATION_RULES: readonly string[] = [
  'uppercase, because the canonical detector is already case-insensitive',
  'remove all whitespace, because "29 CFR 1910.215" and "29CFR1910.215" are the same identifier',
  'NOTHING ELSE: no punctuation stripping, no digit alteration, no paragraph truncation, no '
    + 'abbreviation expansion, no nearest-match',
];

export function canonicalCitationToken(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, '');
}

/** Every citation token in a string, canonicalised, in order of appearance. */
export function citationTokens(text: string): string[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  // A fresh regex per call: CITATION_TOKEN_PATTERN carries /g, so a shared instance would carry
  // `lastIndex` between calls and silently skip matches. Asserted by the §196 suite.
  const re = new RegExp(CITATION_TOKEN_PATTERN.source, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null = re.exec(text);
  while (m !== null) {
    out.push(canonicalCitationToken(m[0]));
    m = re.exec(text);
  }
  return out;
}

export interface CitationReuseVerdict {
  /** Every canonical token found in the scanned text, in order, with duplicates preserved. */
  readonly tokensFound: readonly string[];
  /** Tokens matched verbatim in at least one authorised supplied source. */
  readonly admittedReuse: readonly string[];
  /** Tokens matched nowhere in the authorised sources. Any one of these refuses the whole verdict. */
  readonly refused: readonly string[];
  /** True when the text carries no citation token at all -- the ordinary case. */
  readonly clean: boolean;
  /** True when at least one token was found and every one of them is an authorised reuse. */
  readonly allReuse: boolean;
}

/**
 * Decide the citation tokens in `texts` against the text of the governed records the output validly
 * relied on.
 *
 * `authorisedSourceTexts` must already have been filtered to sources the caller VALIDATED -- ids
 * declared under a reliance mode and confirmed present in the supplied set. This function performs
 * no authorisation of its own, and an empty list therefore refuses every token, which is exactly
 * what must happen under `reliance: NONE`.
 */
export function decideCitationReuse(
  texts: readonly string[], authorisedSourceTexts: readonly string[],
): CitationReuseVerdict {
  const authorised = new Set<string>();
  for (const src of authorisedSourceTexts) for (const t of citationTokens(src)) authorised.add(t);

  const tokensFound: string[] = [];
  const admittedReuse: string[] = [];
  const refused: string[] = [];
  for (const text of texts) {
    for (const t of citationTokens(text)) {
      tokensFound.push(t);
      if (authorised.has(t)) admittedReuse.push(t); else refused.push(t);
    }
  }
  return {
    tokensFound,
    admittedReuse,
    refused,
    clean: tokensFound.length === 0,
    allReuse: tokensFound.length > 0 && refused.length === 0,
  };
}

/**
 * The admission matrix as data, so the evidence document and the suite read the same table rather
 * than two hand-kept copies of it.
 */
export const CITATION_ADMISSION_MATRIX = [
  {
    id: 'L',
    case: 'declared reliance, valid supplied sourceId, token present verbatim in that source',
    outcome: 'ADMITTED',
    why: 'the identifier is reproduction of authorised supplied text, not new authority',
  },
  {
    id: 'M',
    case: 'declared reliance, valid sourceId, token absent from every authorised source',
    outcome: 'REFUSED',
    why: 'produced from memory; a valid reliance declaration does not authorise a citation the '
      + 'source does not contain',
  },
  {
    id: 'M2',
    case: 'declared reliance, token is a DIFFERENT citation from the supplied one (altered section '
      + 'or added paragraph)',
    outcome: 'REFUSED',
    why: 'exact comparison over the whole identifier; a paragraph reference is where regulatory '
      + 'meaning lives and a changed one is a new claim',
  },
  {
    id: 'N',
    case: 'reliance NONE, any citation token anywhere',
    outcome: 'REFUSED',
    why: 'no authorised source text exists, so the authorised token set is empty and every token '
      + 'is refused. Unchanged from §194.',
  },
  {
    id: 'K',
    case: 'sourceId not in the supplied set',
    outcome: 'REFUSED BEFORE REUSE IS EVALUATED',
    why: 'SOURCE_ID_NOT_IN_SUPPLIED_SET is a non-citation code, and reuse is evaluated only when '
      + 'the citation refusal is the ONLY thing standing against the verdict',
  },
  {
    id: 'MIXED',
    case: 'two tokens, one an authorised reuse and one invented',
    outcome: 'REFUSED WHOLE',
    why: 'every token must be authorised; one unauthorised token refuses the verdict, as v1 to v3.2 '
      + 'all refuse whole',
  },
  {
    id: 'FIRST_PASS',
    case: 'any citation token in a first-pass structured declaration',
    outcome: 'REFUSED',
    why: 'the v15 HARD PROHIBITIONS block tells the first pass that reproducing a number from its '
      + 'own input is the same violation as inventing one, and §196 does not weaken v15',
  },
] as const;

/** The honest position on quotation length, recorded rather than implied. */
export const QUOTATION_BOUNDARY_STATEMENT = {
  ADMITTED_UNIT: 'a citation identifier matched by CITATION_TOKEN_PATTERN, and nothing else',
  QUOTATION_LENGTH_LIMIT_EXISTS_ON_THE_VERIFIER_PATH: false,
  SECTION_196_CREATES_A_QUOTATION_LENGTH_LIMIT: false,
  SECTION_196_CREATES_A_LICENCE_TO_QUOTE_AT_LENGTH: false,
  NOTE: 'A long verbatim regulatory paragraph carrying no citation-shaped string was admissible '
    + 'before §196 and is admissible after it — unchanged, because nothing in this module reads or '
    + 'admits any text other than the citation tokens it matched. That residual is a separate '
    + 'question from the one §195 raised and is not resolved here.',
} as const;
