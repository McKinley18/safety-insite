/**
 * §166 EXPERT HAZLENZ -- v2 → v3 SEMANTIC-PRESERVATION DIFF. DEVELOPMENT PROTOTYPE ONLY.
 * ZERO PROVIDER CALLS.
 *
 * ==================== WHY A DIFF MODULE AND NOT A PARAGRAPH ====================
 *
 * The §166 authorization permits a REPRESENTATIONAL protocol change and forbids semantic prompt
 * tuning. That is a claim about the difference between two strings, and a claim about a difference
 * should be checked against the difference rather than asserted beside it.
 *
 * So: this module computes the line-level diff between the two frozen prompts, and requires every
 * changed line to appear in `INSTRUCTION_LINE_CLASSIFICATIONS` with a matching count. The check runs
 * in BOTH directions --
 *
 *   an actual change absent from the table   → `UNCLASSIFIED_CHANGE`   (a change slipped in)
 *   a table entry with no actual change      → `STALE_CLASSIFICATION`  (the table is fiction)
 *
 * -- so the table cannot drift from the prompt in either direction, and
 * `SUBSTANTIVE_SEMANTIC_CHANGE_COUNT` is computed from a table that has been proven complete.
 *
 * ==================== THE BLANK-LINE RULE, STATED RATHER THAN ASSUMED ====================
 *
 * A blank line carries no instruction; it is the paragraph break belonging to whatever paragraph it
 * separates. Blank added/removed lines are therefore classified `BINDING_PROTOCOL_REQUIRED`
 * automatically, because every added paragraph in this diff is a binding-protocol paragraph. This is
 * a rule and not an exemption: it is applied uniformly, it is stated here, and it cannot hide a
 * change because a blank line has no content to hide.
 */

export const V2_V3_DIFF_VERSION = 'hazlenz.expert.verifier.v2-v3-diff.v1' as const;

export const CHANGE_CLASSIFICATIONS = [
  /** The line exists only because a binding, declaration or additive nomination had to be named. */
  'BINDING_PROTOCOL_REQUIRED',
  /** The line named a v2 field that v3 does not have, or omits a v3 field it must name. */
  'SCHEMA_ALIGNMENT_REQUIRED',
  /** The line changes what the verifier is told to JUDGE. Target count: zero. */
  'SUBSTANTIVE_SEMANTIC_CHANGE',
] as const;
export type ChangeClassification = (typeof CHANGE_CLASSIFICATIONS)[number];

export type DiffOp = 'ADDED' | 'REMOVED';

export interface LineClassification {
  readonly op: DiffOp;
  readonly line: string;
  readonly count: number;
  readonly classification: ChangeClassification;
  readonly why: string;
}

const BINDING = 'BINDING_PROTOCOL_REQUIRED' as const;
const SCHEMA = 'SCHEMA_ALIGNMENT_REQUIRED' as const;

/**
 * Every non-blank changed line, classified. Authored, then PROVEN complete against the real diff.
 *
 * The only REMOVED lines in the whole diff are the two that named v2's `SUPPLIED_FACT` /
 * `NOMINATED_FACT` choice. Under v3 that is no longer a choice -- a clarification may be both at
 * once -- so the sentence describes fields that no longer carry the meaning it claims. Replacing it
 * is schema alignment: the verifier is still told to supply the question and say where it came from.
 */
export const INSTRUCTION_LINE_CLASSIFICATIONS: readonly LineClassification[] = [
  // ---------------- the two removed lines, and their three replacements
  {
    op: 'REMOVED', count: 1,
    line: '     A fact that would change what is done now is not asked about. Supply the question, and say',
    classification: SCHEMA,
    why: 'the second half of the sentence names v2\'s either/or source-mode choice, which v3 replaces '
      + 'with an explicit binding key that may coexist with a nomination',
  },
  {
    op: 'REMOVED', count: 1,
    line: '     whether it came from a SUPPLIED_FACT or from a NOMINATED_FACT of your own.',
    classification: SCHEMA,
    why: 'names v2 fields under a v2 exclusivity that v3 removes',
  },
  {
    op: 'ADDED', count: 1,
    line: '     A fact that would change what is done now is not asked about. Supply the question. If it',
    classification: SCHEMA,
    why: 'the same instruction, re-wrapped because the trailing clause changed',
  },
  {
    op: 'ADDED', count: 1,
    line: '     answers one of the facts you were given, put that fact\'s key in bindingFactKey. You may ALSO',
    classification: SCHEMA,
    why: 'names the v3 field that replaces the v2 source-mode choice',
  },
  {
    op: 'ADDED', count: 1,
    line: '     nominate one fact of your own in the same answer.',
    classification: SCHEMA,
    why: 'states the coexistence v3 adds; under v2 this shape was refused by the contract',
  },
  // ---------------- factKey preamble
  {
    op: 'ADDED', count: 1,
    line: 'EACH UNRESOLVED FACT YOU ARE GIVEN CARRIES A factKey. Those keys are fixed, and they are the only',
    classification: BINDING,
    why: 'introduces the closed set the binding protocol depends on',
  },
  {
    op: 'ADDED', count: 1,
    line: 'way to refer to those facts. Copy a key exactly when you use one: a key you invent, abbreviate or',
    classification: BINDING,
    why: 'states the exact-copy requirement the contract enforces by string equality',
  },
  {
    op: 'ADDED', count: 1,
    line: 'respell is not a key, and a verdict carrying one is discarded whole.',
    classification: BINDING,
    why: 'states the whole-verdict refusal the contract already performs',
  },
  // ---------------- additivity of a nomination
  {
    op: 'ADDED', count: 1,
    line: '   A NOMINATION IS ADDED TO THE FACTS YOU WERE GIVEN. It never replaces one and never answers',
    classification: BINDING,
    why: 'states the additive invariant; v2 had no way to express coexistence so had nothing to say',
  },
  {
    op: 'ADDED', count: 1,
    line: '   one. You may nominate at the same time as answering a supplied fact, and doing both is the',
    classification: BINDING,
    why: 'states the new permitted response shape',
  },
  {
    op: 'ADDED', count: 1,
    line: '   right answer whenever both are genuinely needed now.',
    classification: BINDING,
    why: 'completes the sentence above; adds no new test of decision-criticality',
  },
  // ---------------- NO_CLARIFICATION_REQUIRED resolves nothing
  {
    op: 'ADDED', count: 1,
    line: '     THIS VERDICT RESOLVES NOTHING. It says only that YOU propose no question. It does not mark',
    classification: BINDING,
    why: 'states the coverage consequence of silence; v2 had no owed-fact ledger to speak about',
  },
  {
    op: 'ADDED', count: 1,
    line: '     any fact you were given as answered, and it never removes one from the list.',
    classification: BINDING,
    why: 'completes the sentence above',
  },
  // ---------------- step 6, the declaration protocol
  {
    op: 'ADDED', count: 1,
    line: '6. NOW ACCOUNT FOR EVERY FACT YOU WERE GIVEN, ONE LINE EACH, BY ITS factKey.',
    classification: BINDING,
    why: 'the declaration step itself',
  },
  {
    op: 'ADDED', count: 1,
    line: '   This is bookkeeping, not a second judgement. For each fact say exactly one of:',
    classification: BINDING,
    why: 'explicitly denies that step 6 adds a judgement, which is what keeps it representational',
  },
  { op: 'ADDED', count: 1, line: '   BOUND_BY_CLARIFICATION', classification: BINDING,
    why: 'declaration member name' },
  {
    op: 'ADDED', count: 1,
    line: '     The question you are supplying answers THIS fact. At most one fact may carry this, and its',
    classification: BINDING,
    why: 'states the one-binding ceiling the contract enforces',
  },
  {
    op: 'ADDED', count: 1,
    line: '     key must be the key you put in bindingFactKey.',
    classification: BINDING,
    why: 'states the agreement the contract checks between the declaration and the binding field',
  },
  { op: 'ADDED', count: 1, line: '   STILL_UNRESOLVED', classification: BINDING,
    why: 'declaration member name' },
  {
    op: 'ADDED', count: 1,
    line: '     You are not answering this fact. That is a normal and frequent answer, and it is the right',
    classification: BINDING,
    why: 'mirrors v2\'s existing "NO is a good answer" posture onto the new field rather than '
      + 'introducing a new one',
  },
  {
    op: 'ADDED', count: 1,
    line: '     one whenever you are unsure. The fact stays open.',
    classification: BINDING,
    why: 'completes the sentence above',
  },
  { op: 'ADDED', count: 1, line: '   CHALLENGE_FACT_VALIDITY', classification: BINDING,
    why: 'declaration member name' },
  {
    op: 'ADDED', count: 1,
    line: '     You believe this fact should not have been raised: the observation already settles it, or',
    classification: BINDING,
    why: 'restates v2 step 1 and step 2 as the two grounds for a challenge; introduces no new test',
  },
  {
    op: 'ADDED', count: 1,
    line: '     answering it either way leads to the same thing being done today. Give your reason.',
    classification: BINDING,
    why: 'restates v2 step 2\'s two-branch test as the challenge ground',
  },
  {
    op: 'ADDED', count: 1,
    line: '     THIS IS A REQUEST, NOT A DECISION. The fact stays open until it is reviewed, and nothing',
    classification: BINDING,
    why: 'states the boundary that keeps arbitration HazLenz-owned',
  },
  {
    op: 'ADDED', count: 1,
    line: '     you write here removes it.',
    classification: BINDING,
    why: 'completes the sentence above',
  },
  {
    op: 'ADDED', count: 1,
    line: '   Every key must appear exactly once. A fact you do not mention is not thereby handled.',
    classification: BINDING,
    why: 'states the completeness rule the contract enforces',
  },
  {
    op: 'ADDED', count: 1,
    line: '   AND ONE FACT DOES NOT COVER ANOTHER. Answering the fact keyed A leaves the fact keyed B',
    classification: BINDING,
    why: 'states the no-implicit-sibling-coverage rule',
  },
  {
    op: 'ADDED', count: 1,
    line: '   exactly where it was, however closely related the two sound.',
    classification: BINDING,
    why: 'completes the sentence above',
  },
  // ---------------- authority restriction extension
  {
    op: 'ADDED', count: 1,
    line: 'YOU ALSO MAY NOT mark a supplied fact answered by any route other than bindingFactKey. Saying in',
    classification: BINDING,
    why: 'extends v2\'s existing YOU MAY NOT list to the new field; adds no new judgement',
  },
  {
    op: 'ADDED', count: 1,
    line: 'your reasoning that a fact is covered does not cover it.',
    classification: BINDING,
    why: 'completes the sentence above',
  },
  // ---------------- no expected number, extended
  {
    op: 'ADDED', count: 1,
    line: 'There is no expected number of bindings and no expected number of challenges either.',
    classification: BINDING,
    why: 'extends v2\'s existing no-quota statement to the new fields, so the new fields inherit the '
      + 'same absence of a target that questions, silences and nominations already have',
  },
];

export interface DiffEntry { readonly op: DiffOp; readonly line: string }

/** Line-level diff by longest common subsequence. Deterministic and dependency-free. */
export function diffLines(before: string, after: string): DiffEntry[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const n = a.length;
  const m = b.length;
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffEntry[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i += 1; j += 1; } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ op: 'REMOVED', line: a[i] }); i += 1;
    } else { out.push({ op: 'ADDED', line: b[j] }); j += 1; }
  }
  while (i < n) { out.push({ op: 'REMOVED', line: a[i] }); i += 1; }
  while (j < m) { out.push({ op: 'ADDED', line: b[j] }); j += 1; }
  return out;
}

export interface ClassifiedDiff {
  readonly version: string;
  readonly beforeLines: number;
  readonly afterLines: number;
  readonly changes: readonly DiffEntry[];
  readonly addedCount: number;
  readonly removedCount: number;
  readonly blankLineChanges: number;
  readonly byClassification: Readonly<Record<ChangeClassification, number>>;
  readonly SUBSTANTIVE_SEMANTIC_CHANGE_COUNT: number;
  /** Actual changes with no table entry. Any entry here invalidates the whole classification. */
  readonly unclassifiedChanges: readonly string[];
  /** Table entries with no actual change, or with the wrong count. */
  readonly staleClassifications: readonly string[];
  readonly V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL: boolean;
}

const keyOf = (op: DiffOp, line: string): string => `${op}\0${line}`;

/**
 * Classify a real diff against the table, in both directions.
 *
 * The returned `V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL` is TRUE only when the
 * table is complete, not stale, and contains no `SUBSTANTIVE_SEMANTIC_CHANGE`. A complete table with
 * one substantive change is a report, not a failure -- but it is not this flag.
 */
export function classifyInstructionDiff(
  before: string, after: string,
  table: readonly LineClassification[] = INSTRUCTION_LINE_CLASSIFICATIONS,
): ClassifiedDiff {
  const changes = diffLines(before, after);

  const actual = new Map<string, number>();
  for (const c of changes) {
    if (c.line.trim().length === 0) continue;            // the blank-line rule, applied uniformly
    const k = keyOf(c.op, c.line);
    actual.set(k, (actual.get(k) ?? 0) + 1);
  }
  const declared = new Map<string, LineClassification>();
  const declaredCounts = new Map<string, number>();
  for (const t of table) {
    const k = keyOf(t.op, t.line);
    declared.set(k, t);
    declaredCounts.set(k, (declaredCounts.get(k) ?? 0) + t.count);
  }

  const unclassified: string[] = [];
  for (const [k, n] of actual) {
    const d = declaredCounts.get(k);
    if (d === undefined) {
      unclassified.push(`UNCLASSIFIED_CHANGE: ${k.replace('\0', ' ')}`);
    } else if (d !== n) {
      unclassified.push(`COUNT_MISMATCH: ${k.replace('\0', ' ')} — table ${d}, actual ${n}`);
    }
  }
  const stale: string[] = [];
  for (const [k, n] of declaredCounts) {
    if (!actual.has(k)) {
      stale.push(`STALE_CLASSIFICATION: ${k.replace('\0', ' ')} (table ${n}, actual 0)`);
    }
  }

  const byClassification: Record<ChangeClassification, number> = {
    BINDING_PROTOCOL_REQUIRED: 0, SCHEMA_ALIGNMENT_REQUIRED: 0, SUBSTANTIVE_SEMANTIC_CHANGE: 0,
  };
  for (const [k, n] of actual) {
    const d = declared.get(k);
    if (d) byClassification[d.classification] += n;
  }
  const blank = changes.filter(c => c.line.trim().length === 0).length;
  byClassification.BINDING_PROTOCOL_REQUIRED += blank;

  return {
    version: V2_V3_DIFF_VERSION,
    beforeLines: before.split('\n').length,
    afterLines: after.split('\n').length,
    changes,
    addedCount: changes.filter(c => c.op === 'ADDED').length,
    removedCount: changes.filter(c => c.op === 'REMOVED').length,
    blankLineChanges: blank,
    byClassification,
    SUBSTANTIVE_SEMANTIC_CHANGE_COUNT: byClassification.SUBSTANTIVE_SEMANTIC_CHANGE,
    unclassifiedChanges: unclassified,
    staleClassifications: stale,
    V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL:
      unclassified.length === 0 && stale.length === 0
      && byClassification.SUBSTANTIVE_SEMANTIC_CHANGE === 0,
  };
}

/**
 * Blocks of v2 that must survive v3 BYTE-IDENTICAL. Checked positively rather than inferred from the
 * diff's silence, because "no change was reported" and "this text is still there" are different
 * claims and only the second one is what matters for the semantic-preservation argument.
 */
export const V2_BLOCKS_THAT_MUST_SURVIVE: readonly { name: string; text: string }[] = [
  { name: 'the "usually NO" nomination prior',
    text: 'THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER' },
  { name: 'step 1, what is actually unresolved',
    text: '1. WHAT IS ACTUALLY UNRESOLVED. Read the observation for what it states, not for what it' },
  { name: 'step 2, the two-branch decision test',
    text: '2. WOULD THE ANSWER CHANGE WHAT IS DONE NOW. This is the whole question, and it is a test with' },
  { name: 'the MAGNITUDE anti-pattern', text: '     - MAGNITUDE. How long, how often, how many, how large.' },
  { name: 'the unseen-control rule',
    text: '     - A CONTROL THAT CANNOT BE SEEN IS NOT A CONTROL THAT WAS CHECKED.' },
  { name: 'step 3, is it already asked', text: '3. IS IT ALREADY ASKED.' },
  { name: 'the DO NOT nominate list', text: '   DO NOT nominate a fact because information is missing' },
  { name: 'the nomination proof burden',
    text: '   If you do nominate, you may nominate EXACTLY ONE fact, and you must prove it:' },
  { name: 'the no-invented-hazard rule',
    text: '   A nominated fact must not require inventing a hazard the observation does not support.' },
  { name: 'the ABSTAIN definition', text: '     You cannot tell which of the above holds. This asserts nothing.' },
  { name: 'the YOU MAY NOT authority list', text: 'YOU MAY NOT: add, remove or rewrite hazard candidates;' },
  { name: 'the no-quota closing',
    text: 'There is no expected number of questions, no expected number of silences, and no expected number' },
];

export function survivingBlockFailures(after: string): string[] {
  return V2_BLOCKS_THAT_MUST_SURVIVE
    .filter(b => !after.includes(b.text))
    .map(b => `BLOCK_LOST: ${b.name}`);
}

// ------------------------------------------------------------------ contract diff

export interface ContractFieldChange {
  readonly field: string;
  readonly op: 'ADDED' | 'REMOVED' | 'REDEFINED';
  readonly classification: ChangeClassification;
  readonly why: string;
}

/**
 * The v2 → v3 CONTRACT diff, stated at field level because a contract is a set of fields and rules
 * rather than a paragraph. Every entry is asserted against the live schemas by the proof suite.
 */
export const CONTRACT_FIELD_CHANGES: readonly ContractFieldChange[] = [
  {
    field: 'bindingFactKey', op: 'ADDED', classification: BINDING,
    why: 'the closed-set binding declaration §165 proved v2 could not express. Checked by exact '
      + 'string equality against the supplied keys — no fuzzy match, no normalisation',
  },
  {
    field: 'owedFactDeclarations', op: 'ADDED', classification: BINDING,
    why: 'one explicit line per supplied fact, so silence about a fact becomes impossible and a '
      + 'challenge becomes a recorded request rather than an inference',
  },
  {
    field: 'clarificationSourceMode', op: 'REDEFINED', classification: SCHEMA,
    why: 'v2\'s two members are preserved and SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION is added for '
      + 'the shape v2 refused with NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE. The contract '
      + 'checks the declared mode against the actual payload, so it cannot disagree with it',
  },
  {
    field: 'aboutUnresolvedFactRef', op: 'REMOVED', classification: SCHEMA,
    why: 'superseded by bindingFactKey, which is the same idea checked against a closed set. Two '
      + 'fields meaning one thing is how a binding gets asserted in one and denied in the other',
  },
  {
    field: 'NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT (rule)', op: 'REMOVED', classification: SCHEMA,
    why: 'v2 caught a renamed supplied fact with a 0.8 content-overlap threshold. v3 addresses '
      + 'supplied facts by key, so the structural rule NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY '
      + 'replaces it. The lexical threshold is DROPPED rather than tightened because an overlap '
      + 'score is a free-text semantic gate, and §160 FINDING 1 is why this programme does not run one',
  },
  {
    field: 'proposedClarification', op: 'REDEFINED', classification: SCHEMA,
    why: 'replacesClarificationId is not carried into the v3 schema; the field was never populated '
      + 'in any executed draw and a binding now expresses what it gestured at',
  },
];

export const CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT =
  CONTRACT_FIELD_CHANGES.filter(c => c.classification === 'SUBSTANTIVE_SEMANTIC_CHANGE').length;
