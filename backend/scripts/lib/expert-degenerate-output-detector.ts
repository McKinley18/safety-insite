/**
 * §153 EXPERT HAZLENZ -- DEGENERATE PROVIDER OUTPUT DETECTOR. DEVELOPMENT INSTRUMENT ONLY.
 *
 * ==================== THE DEFECT THIS CLOSES ====================
 *
 * §152's HS-A1 returned a transport-successful, schema-shaped, semantically empty response:
 *
 *      candidateKey "placeholder" · evidenceBasis "" · reasoning "" · summary "placeholder"
 *
 * The normalizer behaved correctly -- `CANDIDATE_MALFORMED`, candidate dropped -- but a malformed
 * ITEM is item-level rather than analysis-fatal, so the call was recorded `PRESENT`. **A response
 * consisting of the word "placeholder" therefore entered the strict-recall denominator as a miss and
 * the coverage denominator as an uncovered row.** That is a measurement defect, not a model defect,
 * and nothing in the harness could see it.
 *
 * ==================== WHAT IT MUST NOT DO, WHICH IS THE HARDER HALF ====================
 *
 *   >>> AN EMPTY EXPERT RESPONSE IS A LEGAL AND OFTEN CORRECT ANSWER. §149's US-H1 and §150's RB-I1
 *   >>> both returned zero candidates and zero clarifications and were both RIGHT. A detector that
 *   >>> swallowed those would destroy the FORBIDDEN half of every probe this programme runs.
 *
 *   >>> POOR REASONING IS NOT DEGENERATE. The detector reads STRUCTURE -- placeholder tokens,
 *   >>> wholly-absent prose, impossible repetition -- and never quality. §148 measured what happens
 *   >>> when a keyword rule is trusted with a judgement about meaning.
 *
 *   >>> A SINGLE THIN FIELD IS NOT DEGENERATE. §152's HS-J1 carried three candidates, one with an
 *   >>> empty `evidenceBasis` beside 342 characters of reasoning, under a substantive summary. That
 *   >>> is an ordinary malformed item and the normalizer already handles it.
 *
 * The real data supplies one adversarial case worth more than any invented one: **§152's HS-K1 has a
 * candidate whose key is literally `"UNPLACEHOLDER"`, under an EMPTY summary.** A detector matching
 * `contains("placeholder")` flags it, and would be wrong twice over -- the key is a real identifier
 * and the candidate carries 159 and 261 characters of substantive prose. **Whole-field equality, never
 * substring, and never a single signal.**
 *
 * ==================== THE RULE ====================
 *
 * Signals are counted, not tripped. A verdict of DEGENERATE requires TWO INDEPENDENT SIGNALS, or one
 * signal that is unambiguous on its own (`ALL_PROSE_IS_PLACEHOLDER`). Everything else is reported as
 * a SUSPECT with its signals listed, and a suspect is NOT excluded from any denominator.
 *
 * >>> DEGENERATE NEVER AUTHORIZES A RERUN. The row's request and cost are counted, its raw response
 * >>> and normalized result are preserved, and the denominator loss is reported explicitly. §153
 * >>> grants no retry and this module cannot request one.
 */

export const DEGENERATE_DETECTOR_VERSION =
  'hazlenz.expert.degenerate-output-detector.v2' as const;

/**
 * ==================== v2. §154. THE GAP §153 DISCLOSED AND DID NOT PATCH ====================
 *
 * v1 caught §152's HS-A1 (`candidateKey "placeholder"`, empty prose, `summary "placeholder"`) and
 * §153's HS-K1 (`summary "placeholder"`, zero candidates -- a shape it was not built against). It
 * MISSED §153's HS-A1:
 *
 *      summary "summary placis a a placeholder"      candidateKey "x"
 *      one candidate carrying 133 and 322 characters of real prose
 *
 * v1 matched WHOLE FIELDS ONLY, deliberately, because §152's real data contains a candidate key
 * literally named `UNPLACEHOLDER` that a substring matcher would have flagged. `"summary placis a a
 * placeholder"` is neither a whole-field token nor a clean string, so nothing fired. §153 DISCLOSED
 * that gap and refused to patch it mid-operation: widening a detector after seeing the data is the
 * post-hoc adjustment the sidecar exists to prevent.
 *
 * v2 closes it PROSPECTIVELY, before replicate 3 exists, and adds exactly two capabilities:
 *
 *   1. NEAR-PLACEHOLDER GARBLING -- a field whose TOKENS are mostly placeholder lexemes and filler,
 *      with no content word. `"summary placis a a placeholder"` is `summary` + `placis` + `a` + `a`
 *      + `placeholder`: two placeholder lexemes, one near-miss of one, two articles, and nothing
 *      that says anything. `UNPLACEHOLDER` remains safe -- it is ONE token, and a single token that
 *      is not itself a placeholder token cannot reach this rule.
 *   2. MEANINGLESS IDENTIFIER -- a candidateKey or clarificationId of one or two characters, or one
 *      made only of repeated characters. `"x"` qualifies; `cand-1`, `c1` and `UNPLACEHOLDER` do not.
 *
 * **THE TWO-SIGNAL THRESHOLD IS UNCHANGED, AND THAT IS WHAT KEEPS v2 CONSERVATIVE.** Each new rule
 * is one signal. §153's HS-A1 raises BOTH and is caught; a single terse identifier or one odd
 * sentence in an otherwise substantive response still is not.
 */

/**
 * Tokens that are never a real answer when they constitute a WHOLE field.
 *
 * Matched against the trimmed, lowercased, punctuation-stripped ENTIRE value. `"UNPLACEHOLDER"` does
 * not match `"placeholder"`, and a sentence mentioning a placeholder does not match either.
 */
const PLACEHOLDER_TOKENS = new Set([
  'placeholder', 'placeholders', 'todo', 'tbd', 'tba', 'na', 'n a', 'none', 'null', 'nil',
  'example', 'sample', 'lorem ipsum', 'lorem', 'xxx', 'xx', 'foo', 'bar', 'baz', 'test',
  'string', 'text', 'value', 'unknown', 'undefined', 'insert', 'fill in', 'your text here',
  'candidate', 'summary', 'reasoning', 'question',
]);

const norm = (v: unknown): string =>
  typeof v === 'string' ? v.trim().toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ').trim() : '';
const isPlaceholder = (v: unknown): boolean => {
  const n = norm(v);
  return n.length > 0 && PLACEHOLDER_TOKENS.has(n);
};
const isBlank = (v: unknown): boolean =>
  typeof v !== 'string' || v.trim().length === 0;

/**
 * v2. Filler with no semantic content: articles, copulas, and the schema's own field names, which a
 * stub tends to echo back.
 */
const FILLER_TOKENS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'of', 'to', 'and', 'or', 'in', 'on', 'it',
  'this', 'that', 'summary', 'reasoning', 'basis', 'question', 'candidate', 'clarification',
  'evidence', 'here', 'text', 'value', 'field',
]);

/**
 * v2. NEAR-PLACEHOLDER GARBLING.
 *
 * A field is garbled when ALL THREE hold:
 *   - it contains at least one PLACEHOLDER LEXEME as a standalone token;
 *   - AT MOST ONE token is neither a placeholder lexeme nor filler -- so there is essentially no
 *     content, and the single allowance is the garbled fragment itself;
 *   - it is short (fewer than eight tokens), because a real sentence that happens to mention a
 *     placeholder is longer than this and carries several content words.
 *
 * `"summary placis a a placeholder"` -> lexemes {summary, placeholder}, filler {a, a}, other
 * {placis} = 1, five tokens. GARBLED.
 * `"UNPLACEHOLDER"` -> no standalone placeholder lexeme. Not garbled.
 * `"There is a hazard here."` -> no placeholder lexeme at all. Not garbled.
 * `"The permit has a placeholder entry for the gas test result"` -> one lexeme but five content
 * words. NOT garbled, which is the case that matters: a REAL sentence about a placeholder.
 *
 * NOTE ON DESIGN. An edit-distance rule was written first and REJECTED BY ITS OWN TESTS: `placis`
 * sits about five edits from `placeholder`, so any threshold loose enough to catch it would also
 * have caught ordinary words. Requiring a real placeholder lexeme PLUS an absence of content is
 * both tighter and easier to reason about.
 */
/**
 * The garbling rule uses a NARROWER lexeme set than the whole-field rule, and the reason is a false
 * positive its own tests caught: `PLACEHOLDER_TOKENS` contains the schema's field names (`summary`,
 * `reasoning`, `candidate`, `question`, `value`, `text`) so that a field literally reading
 * `"summary"` is convicted. Those words are also ORDINARY ENGLISH, and counting them as lexemes made
 * `"A substantive summary."` garbled. Only unambiguous placeholder words belong here; the field
 * names fall through to `FILLER_TOKENS`, which is where they behave correctly.
 */
const STRICT_PLACEHOLDER_LEXEMES = new Set([
  'placeholder', 'placeholders', 'todo', 'tbd', 'tba', 'lorem', 'ipsum',
  'foo', 'bar', 'baz', 'xxx', 'xx', 'undefined', 'null', 'nil',
]);

const isNearPlaceholderGarbled = (v: unknown): boolean => {
  const n = norm(v);
  if (n.length === 0) return false;
  const tokens = n.split(' ').filter(t => t.length > 0);
  if (tokens.length < 2 || tokens.length >= 8) return false;
  let lexemes = 0;
  let other = 0;
  for (const t of tokens) {
    if (STRICT_PLACEHOLDER_LEXEMES.has(t)) { lexemes += 1; continue; }
    if (FILLER_TOKENS.has(t)) continue;
    other += 1;
  }
  return lexemes >= 1 && other <= 1;
};

/**
 * v2. MEANINGLESS IDENTIFIER. A key carrying no identifying information at all: a SINGLE
 * alphanumeric character, or a short run of one repeated character.
 *
 * `"x"` and `"xx"` qualify. `"c1"`, `"q1"`, `"cand-1"`, `"atmo-hazard"` and `"UNPLACEHOLDER"` do
 * NOT -- and the first two are why this rule is ONE character rather than two. An earlier draft
 * used `length <= 2` and ITS OWN TESTS caught it flagging `c1` and `q1`, which appear throughout
 * the fixtures as ordinary keys.
 */
const isMeaninglessIdentifier = (v: unknown): boolean => {
  if (typeof v !== 'string') return false;
  const alnum = v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (alnum.length === 0) return false;
  if (alnum.length === 1) return true;
  return new Set(alnum).size === 1 && alnum.length <= 4;
};


/** The raw wire view the detector needs. Nothing here is read for meaning. */
export interface DegenerateCheckInput {
  rowId: string;
  candidates: ReadonlyArray<{
    candidateKey?: unknown; evidenceBasis?: unknown; reasoning?: unknown;
  }>;
  clarifications: ReadonlyArray<{
    clarificationId?: unknown; question?: unknown; whyItMatters?: unknown; evidenceGap?: unknown;
  }>;
  summary?: unknown;
  uncertainty?: readonly unknown[];
}

export const DEGENERATE_SIGNALS = [
  /** A candidateKey or clarificationId whose WHOLE value is a placeholder token. */
  'PLACEHOLDER_IDENTIFIER',
  /** A candidate with an identifier but BOTH prose fields blank. */
  'CANDIDATE_WITHOUT_ANY_PROSE',
  /** The summary's whole value is a placeholder token. */
  'PLACEHOLDER_SUMMARY',
  /** A clarification whose question or whyItMatters is a placeholder token. */
  'PLACEHOLDER_CLARIFICATION',
  /** Three or more candidates whose evidenceBasis values are byte-identical. */
  'IMPOSSIBLE_REPETITION',
  /** THE UNAMBIGUOUS ONE: every prose field the response carries is a placeholder token. */
  'ALL_PROSE_IS_PLACEHOLDER',
  /** v2. A field whose tokens are placeholder lexemes and filler with no content word. */
  'NEAR_PLACEHOLDER_GARBLING',
  /** v2. A candidateKey or clarificationId that carries no identifying information at all. */
  'MEANINGLESS_IDENTIFIER',
] as const;
export type DegenerateSignal = (typeof DEGENERATE_SIGNALS)[number];

export interface DegenerateVerdict {
  rowId: string;
  signals: DegenerateSignal[];
  detail: string[];
  /** TRUE only on two independent signals, or on `ALL_PROSE_IS_PLACEHOLDER`. */
  DEGENERATE_PROVIDER_OUTPUT: boolean;
  /** One signal, reported and NEVER excluded from a denominator. */
  suspect: boolean;
}

export function detectDegenerateOutput(input: DegenerateCheckInput): DegenerateVerdict {
  const signals: DegenerateSignal[] = [];
  const detail: string[] = [];
  const add = (s: DegenerateSignal, d: string) => {
    if (!signals.includes(s)) signals.push(s);
    detail.push(d);
  };

  // 1. Placeholder identifiers. WHOLE-VALUE equality: "UNPLACEHOLDER" is a real key.
  for (const c of input.candidates) {
    if (isPlaceholder(c.candidateKey)) {
      add('PLACEHOLDER_IDENTIFIER', `candidateKey ${JSON.stringify(c.candidateKey)}`);
    }
  }
  for (const q of input.clarifications) {
    if (isPlaceholder(q.clarificationId)) {
      add('PLACEHOLDER_IDENTIFIER', `clarificationId ${JSON.stringify(q.clarificationId)}`);
    }
  }

  // 2. A candidate carrying NO prose at all. One thin field is ordinary; both blank is not.
  //    §152's HS-J1 had an empty evidenceBasis beside 342 characters of reasoning and must not fire.
  for (const c of input.candidates) {
    if (!isBlank(c.candidateKey) && isBlank(c.evidenceBasis) && isBlank(c.reasoning)) {
      add('CANDIDATE_WITHOUT_ANY_PROSE',
        `candidate ${JSON.stringify(c.candidateKey)} has neither evidenceBasis nor reasoning`);
    }
  }

  // 3. A placeholder summary. NOTE: an EMPTY summary is NOT this signal -- §152's HS-K1 had one
  //    beside a fully substantive candidate, and the normalizer already records it.
  if (isPlaceholder(input.summary)) {
    add('PLACEHOLDER_SUMMARY', `summary ${JSON.stringify(input.summary)}`);
  }

  // 4. Placeholder clarification prose.
  for (const q of input.clarifications) {
    if (isPlaceholder(q.question) || isPlaceholder(q.whyItMatters) || isPlaceholder(q.evidenceGap)) {
      add('PLACEHOLDER_CLARIFICATION', `clarification ${JSON.stringify(q.clarificationId)}`);
    }
  }

  // 5. Impossible repetition -- a provider stub emitting one string N times.
  const bases = input.candidates.map(c => (typeof c.evidenceBasis === 'string'
    ? c.evidenceBasis.trim() : '')).filter(x => x.length > 0);
  if (bases.length >= 3 && new Set(bases).size === 1) {
    add('IMPOSSIBLE_REPETITION', `${bases.length} candidates share one evidenceBasis verbatim`);
  }

  // 7. v2. NEAR-PLACEHOLDER GARBLING -- §153's HS-A1 summary, which v1 could not see.
  for (const [label, value] of [['summary', input.summary] as const,
    ...input.candidates.map((c, i) => [`candidates[${i}].evidenceBasis`, c.evidenceBasis] as const),
    ...input.candidates.map((c, i) => [`candidates[${i}].reasoning`, c.reasoning] as const)]) {
    if (isNearPlaceholderGarbled(value)) {
      add('NEAR_PLACEHOLDER_GARBLING', `${label} ${JSON.stringify(value)}`);
    }
  }

  // 8. v2. MEANINGLESS IDENTIFIER -- §153's HS-A1 candidateKey "x".
  for (const c of input.candidates) {
    if (isMeaninglessIdentifier(c.candidateKey)) {
      add('MEANINGLESS_IDENTIFIER', `candidateKey ${JSON.stringify(c.candidateKey)}`);
    }
  }
  for (const q of input.clarifications) {
    if (isMeaninglessIdentifier(q.clarificationId)) {
      add('MEANINGLESS_IDENTIFIER', `clarificationId ${JSON.stringify(q.clarificationId)}`);
    }
  }

  // 6. THE UNAMBIGUOUS SIGNAL. Every prose field present is a placeholder token, and at least one
  //    exists. A legitimate EMPTY response has no prose fields at all and cannot reach this.
  const prose: unknown[] = [
    ...input.candidates.flatMap(c => [c.evidenceBasis, c.reasoning]),
    ...input.clarifications.flatMap(q => [q.question, q.whyItMatters, q.evidenceGap]),
    input.summary,
  ].filter(v => typeof v === 'string' && (v as string).trim().length > 0);
  if (prose.length > 0 && prose.every(isPlaceholder)) {
    add('ALL_PROSE_IS_PLACEHOLDER',
      `every non-empty prose field (${prose.length}) is a placeholder token`);
  }

  const degenerate = signals.includes('ALL_PROSE_IS_PLACEHOLDER') || signals.length >= 2;
  return {
    rowId: input.rowId,
    signals,
    detail,
    DEGENERATE_PROVIDER_OUTPUT: degenerate,
    suspect: !degenerate && signals.length === 1,
  };
}

/**
 * Run the detector across a replicate and report the denominator loss EXPLICITLY.
 *
 * The excluded ids are returned rather than silently applied, because §152's whole lesson is that a
 * denominator must never change without saying so.
 */
export function degenerateOutputReport(
  inputs: readonly DegenerateCheckInput[],
): {
  version: string;
  verdicts: DegenerateVerdict[];
  DEGENERATE_ROW_IDS: string[];
  SUSPECT_ROW_IDS: string[];
  DENOMINATOR_LOSS: number;
  rerunAuthorized: false;
  note: string;
} {
  const verdicts = inputs.map(detectDegenerateOutput);
  const degenerate = verdicts.filter(v => v.DEGENERATE_PROVIDER_OUTPUT).map(v => v.rowId);
  return {
    version: DEGENERATE_DETECTOR_VERSION,
    verdicts,
    DEGENERATE_ROW_IDS: degenerate,
    SUSPECT_ROW_IDS: verdicts.filter(v => v.suspect).map(v => v.rowId),
    DENOMINATOR_LOSS: degenerate.length,
    rerunAuthorized: false,
    note: 'A degenerate row keeps its provider request and its cost, keeps its raw response and its '
      + 'normalized result, and is excluded ONLY from semantic model denominators — reported, never '
      + 'silently. NO RERUN IS AUTHORIZED by this operation and this module cannot request one. A '
      + 'SUSPECT row is reported and excluded from nothing.',
  };
}
