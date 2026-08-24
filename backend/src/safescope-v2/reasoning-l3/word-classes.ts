/**
 * L3-2f -- BOUNDED ENGLISH WORD CLASSES. The mechanism behind F1, F2 and F3, repaired ONCE.
 *
 * WHY THIS FILE EXISTS. Section 32.5 named a pattern that this programme has now recorded seven
 * times, and L3-2f found it in three more functions at once:
 *
 *   F1  negation-scope.ts::hasPredicate()  asked "is this verb in my list of 24 auxiliaries?"
 *   F2  predicate-role.ts::NP_TERMINATORS  asked "is this preposition in my list of 40?"
 *   F3  checkContradiction's head test      asked "does the head CONTAIN one of my 15 stems?"
 *
 * All three are the same mistake: **a bounded structural property of a clause or a noun phrase,
 * decided by membership in a hand-maintained lexical set.** Each was repaired four times by adding a
 * word. This module exists so it is repaired once, structurally, and so the next reader has one
 * place to look rather than three lists to extend.
 *
 * THE DISTINCTION THAT MAKES THIS BOUNDED RATHER THAN OPEN-ENDED, and it is the whole argument:
 *
 *   FUNCTION WORDS -- determiners, prepositions, coordinators, subordinators, pronouns, auxiliaries,
 *   modals -- are a GENUINELY CLOSED class in English. There are a few hundred, no new ones enter the
 *   language, and enumerating them is COMPLETE rather than incomplete. F2's list was not wrong in
 *   KIND; it was merely a partial copy of a closed set. Completing it closes F2 permanently.
 *
 *   LEXICAL VERBS are an OPEN class. They cannot be enumerated, which is why F1 could never have been
 *   fixed by adding `went`. But verb FINITENESS is decidable without enumerating verbs:
 *     * regular finite forms are MORPHOLOGICAL -- `-ed`, `-ing`, `-s`;
 *     * irregular finite past forms are themselves a CLOSED class -- English has ~180 of them, no new
 *       ones are coined, and every verb entering the language from now on is regular.
 *   Regular morphology plus the closed irregular inventory is therefore EXHAUSTIVE over finite
 *   lexical verbs. That is a bounded structural property, not an incomplete list.
 *
 * WHAT THIS MODULE MAY NOT BECOME. No parser, no grammar, no model call, no dependency, no
 * unrestricted linguistic analysis. It answers three narrow questions -- is this word a function
 * word, could this word be a finite verb, and does this token equal that token -- and its callers
 * decide what the answers license. It never decides what a hazard is.
 */

// ---------------------------------------------------------------- closed function-word classes

/** Articles, demonstratives, quantifiers and possessive determiners. Closed. */
export const DETERMINERS = [
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'each', 'every', 'either', 'neither',
  'some', 'any', 'no', 'all', 'both', 'half', 'several', 'many', 'much', 'most', 'few', 'little',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'whose', 'another', 'other', 'such', 'enough',
];

/**
 * Prepositions. Closed, and this is the COMPLETE ordinary inventory rather than the partial copy
 * `NP_TERMINATORS` carried -- `against`, `beyond`, `per`, `regarding`, `concerning` and `versus`
 * were the ones L3-2f measured missing, but the point is that the class is now complete.
 */
export const PREPOSITIONS = [
  'about', 'above', 'across', 'after', 'against', 'along', 'alongside', 'amid', 'amidst', 'among',
  'amongst', 'around', 'as', 'aside', 'astride', 'at', 'atop', 'barring', 'because', 'before',
  'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'concerning',
  'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for',
  'from', 'in', 'including', 'inside', 'into', 'like', 'minus', 'near', 'nearby', 'notwithstanding',
  'of', 'off', 'on', 'onto', 'opposite', 'outside', 'over', 'past', 'pending', 'per', 'plus',
  'regarding', 'respecting', 'round', 'save', 'since', 'than', 'through', 'throughout', 'till',
  'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'unto', 'up', 'upon',
  'versus', 'via', 'with', 'within', 'without',
];

/** Coordinating conjunctions. Closed. */
export const COORDINATORS = ['and', 'or', 'nor', 'but', 'yet', 'so', 'for', 'plus'];

/** Subordinating conjunctions and relativisers. Closed. */
export const SUBORDINATORS = [
  'although', 'though', 'because', 'since', 'unless', 'until', 'while', 'whilst', 'whereas',
  'wherever', 'whenever', 'whether', 'if', 'once', 'that', 'which', 'who', 'whom', 'whose',
  'where', 'when', 'why', 'how', 'however', 'therefore', 'thus', 'hence', 'meanwhile', 'lest',
];

/** Pronouns, including the indefinites that head a subject with no determiner. Closed. */
export const PRONOUNS = [
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
  'someone', 'somebody', 'something', 'anyone', 'anybody', 'anything',
  'everyone', 'everybody', 'everything', 'no-one', 'nobody', 'nothing', 'one', 'none',
  'there', 'here', 'who', 'what', 'which',
];

/**
 * Auxiliaries, copulas and modals. Closed, and ALWAYS FINITE when they head a verb group -- which is
 * why their presence alone has always been a sufficient predicate signal and remains one.
 */
export const AUXILIARIES_AND_MODALS = [
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'having',
  'do', 'does', 'did', 'doing',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought',
  'gets', 'get', 'got', 'gotten', 'becomes', 'became', 'remains', 'remained', 'stays', 'stayed',
  'appears', 'appeared', 'seems', 'seemed', 'looks', 'looked',
];

/**
 * IRREGULAR FINITE PAST-TENSE FORMS. A genuinely closed class -- no new irregular verb has entered
 * English in living memory, and every verb coined from now on takes `-ed`.
 *
 * PAST PARTICIPLES ARE DELIBERATELY EXCLUDED (`worn`, `broken`, `torn`, `seen`, `done`, `gone`,
 * `taken`). A participle is not finite: "gloves or boots WORN on the deck" is a reduced relative
 * inside a noun phrase and must NOT end a negation's scope, whereas "the fitter WENT inside" must.
 * When a participle really is predicated, its auxiliary is present ("has been CUT back") and the
 * auxiliary class above already catches it. This exclusion is what lets RC-08's coordinated list
 * keep crossing its commas.
 *
 * FORMS IDENTICAL TO COMMON NOUNS ARE ALSO EXCLUDED -- `saw`, `ground`, `wound`, `cut`, `set`, `put`,
 * `hit`, `left`, `read`, `spread`, `cost`, `found`, `bound`, `lit`, `fit`, `bit`, `rose`, `bore`,
 * `beat`, `shed`. In a safety note "the ground", "a saw", "the wound" and "the cut" are overwhelmingly
 * nouns, and the subject guard in `isFiniteVerbAt` cannot be relied on to separate them. Their
 * predicated uses almost always carry an auxiliary and are caught that way instead.
 */
export const IRREGULAR_FINITE_PAST = [
  'arose', 'awoke', 'became', 'began', 'bent', 'bled', 'blew', 'broke', 'brought', 'built', 'burnt',
  'burst', 'came', 'caught', 'chose', 'clung', 'crept', 'dealt', 'dove', 'drank', 'drew', 'drove',
  'dug', 'dwelt', 'fed', 'fell', 'felt', 'fled', 'flew', 'flung', 'forgave', 'forgot', 'forsook',
  'fought', 'froze', 'gave', 'grew', 'held', 'hid', 'hung', 'kept', 'knelt', 'knew', 'laid', 'lay',
  'leapt', 'learnt', 'led', 'lent', 'lost', 'made', 'meant', 'met', 'mistook', 'overcame',
  'overtook', 'paid', 'rang', 'ran', 'rode', 'sang', 'sank', 'sat', 'said', 'sent', 'shone',
  'shook', 'shot', 'shrank', 'slept', 'slid', 'slew', 'sold', 'sought', 'spat', 'sped', 'spent',
  'spilt', 'spoke', 'sprang', 'stank', 'stole', 'stood', 'stuck', 'strode', 'stove', 'strove',
  'struck', 'stung', 'swam', 'swept', 'swore', 'swung', 'taught', 'thought', 'threw', 'thrust',
  'told', 'took', 'tore', 'trod', 'understood', 'undertook', 'went', 'wept', 'withdrew', 'woke',
  'won', 'wore', 'wrote', 'wrung',
];

const set = (words: string[]) => new Set(words);
const DET = set(DETERMINERS);
const PREP = set(PREPOSITIONS);
const COORD = set(COORDINATORS);
const SUB = set(SUBORDINATORS);
const PRON = set(PRONOUNS);
const AUX = set(AUXILIARIES_AND_MODALS);
const IRREG = set(IRREGULAR_FINITE_PAST);

export const isDeterminer = (w: string): boolean => DET.has(w.toLowerCase());
export const isPreposition = (w: string): boolean => PREP.has(w.toLowerCase());
export const isCoordinator = (w: string): boolean => COORD.has(w.toLowerCase());
export const isSubordinator = (w: string): boolean => SUB.has(w.toLowerCase());
export const isPronoun = (w: string): boolean => PRON.has(w.toLowerCase());
export const isAuxiliary = (w: string): boolean => AUX.has(w.toLowerCase());
export const isIrregularFinitePast = (w: string): boolean => IRREG.has(w.toLowerCase());

/**
 * Any closed-class function word. This is what CLOSES a noun phrase, and it is the general answer to
 * F2: the head of a noun phrase is the last content word before ANY function word, not before a
 * listed one.
 */
export function isFunctionWord(w: string): boolean {
  const t = w.toLowerCase();
  return DET.has(t) || PREP.has(t) || COORD.has(t) || SUB.has(t) || PRON.has(t) || AUX.has(t);
}

/** A word carrying no closed-class role -- a noun, adjective, adverb or lexical verb. */
export const isContentWord = (w: string): boolean => !isFunctionWord(w);

// ---------------------------------------------------------------- verb morphology

/**
 * A PAST PARTICIPLE or GERUND shape. Not finite on its own; finite only with an auxiliary. Kept
 * separate from `couldBeFiniteLexicalVerb` precisely so callers cannot conflate the two, which is
 * the confusion that produced F1's participle regex in the first place.
 */
export function hasParticipleShape(w: string): boolean {
  return /^[a-z]{4,}(?:ing|ed)$/i.test(w);
}

/**
 * Prepositions whose SPELLING is shared with an ordinary content word, so they cannot be trusted to
 * close a noun phrase on sight.
 *
 * The closed-class argument above is about the CLASS, not about every token spelling: `concerning` is
 * a real preposition in "no concerns concerning the tags" and an adjective in "no **concerning** wear",
 * and `following` is a preposition in "no defects following the repair" and a noun modifier in
 * "no **following** distance maintained" -- which matters here, because `mobile_equipment` is half of
 * this phase's independent sample.
 *
 * These are excluded from noun-phrase termination and recovered instead by the trailing-participle
 * rule in `nounPhraseHead`, which strips them when they really are post-modifiers. Particles such as
 * `off`, `down` and `inside` are deliberately NOT carved out -- terminating on them is an improvement
 * ("no lock **off**" resolves to `lock` rather than `off`).
 */
export const PREPOSITION_CONTENT_HOMOGRAPHS = [
  'concerning', 'following', 'including', 'considering', 'pending',
  'excluding', 'excepting', 'respecting', 'barring', 'save', 'like',
];
const HOMOGRAPH = set(PREPOSITION_CONTENT_HOMOGRAPHS);

/** A function word that may be trusted to close a noun phrase on sight. */
export function closesNounPhrase(w: string): boolean {
  const t = w.toLowerCase();
  return isFunctionWord(t) && !HOMOGRAPH.has(t);
}

/**
 * Could this word be a FINITE LEXICAL VERB, judged by morphology and the closed irregular inventory?
 *
 * Exhaustive over finite lexical verbs by construction: regular past and progressive are
 * morphological, and the irregular past forms are a closed class. `-s` third-person singular is
 * deliberately NOT included -- it is homographic with the plural noun suffix, it appears on almost
 * every noun in an inspection note, and no measured defect in six phases has turned on it. Adding it
 * would be exactly the unproven machinery this programme has learned to refuse.
 */
export function couldBeFiniteLexicalVerb(w: string): boolean {
  const t = w.toLowerCase();
  return IRREG.has(t) || hasParticipleShape(t);
}

// ---------------------------------------------------------------- boundary-safe token identity

/**
 * F3. Whether `token` occurs in `text` as a WHOLE WORD, optionally allowing the regular inflections
 * the caller has explicitly opted into.
 *
 * `head.includes(stem)` is an UNBOUNDED admission rule: it makes every word containing the stem a
 * member of the set, which is how `issue` matched inside `issued`, `harm` inside `harmless`,
 * `concern` inside `concerning` and `access` inside `accessory`. Containment is not identity.
 *
 * INTENTIONAL NORMALISATION, DECLARED. Some vocabularies genuinely mean the lemma and all its
 * regular inflections -- `deficienc` is written as a stem precisely so it covers `deficiency` and
 * `deficiencies`. Those are declared per-vocabulary by the caller through `allowInflection`, and the
 * inflections permitted are exactly the regular NOMINAL ones: `-s`, `-es`, `-ies` for a stem ending
 * `-y`. Verbal inflection is NOT included: `issued` is not an inflection of the noun `issue` for this
 * purpose, and treating it as one is the defect.
 */
export interface TokenMatchOptions {
  /** Permit regular nominal plural inflection of the vocabulary entry. Default false. */
  allowInflection?: boolean;
}

export function tokenMatchesWord(word: string, entry: string, opts: TokenMatchOptions = {}): boolean {
  const w = word.toLowerCase();
  const e = entry.toLowerCase();
  if (w === e) return true;
  if (!opts.allowInflection) return false;
  // Regular NOMINAL inflection only. Deliberately not -ed/-ing.
  if (w === `${e}s` || w === `${e}es`) return true;
  if (e.endsWith('y') && w === `${e.slice(0, -1)}ies`) return true;
  // A stem written without its final vowel -- `deficienc` covering `deficiency`/`deficiencies`.
  if (w === `${e}y` || w === `${e}ies` || w === `${e}ys`) return true;
  return false;
}

/**
 * The first vocabulary entry that matches ANY whole word of `phrase`, or null. Multi-word entries are
 * matched as whole phrases on word boundaries.
 */
export function findWholeWordMatch(
  phrase: string, entries: string[], opts: TokenMatchOptions = {},
): string | null {
  const words = (phrase.toLowerCase().match(/[a-z][a-z'-]*/g) ?? []);
  for (const entry of entries) {
    const e = entry.trim().toLowerCase();
    if (!e) continue;
    if (e.includes(' ')) {
      if (new RegExp(`\\b${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(phrase.toLowerCase())) return entry;
      continue;
    }
    if (words.some(w => tokenMatchesWord(w, e, opts))) return entry;
  }
  return null;
}
