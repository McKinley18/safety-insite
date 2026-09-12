/**
 * §209 -- THE FROZEN ADJUDICATION INSTRUCTIONS, ONE COPY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED FROM THIS FILE.
 *
 * These are the §200 axis instructions, copied VERBATIM from `ADJUDICATION-WORKSHEET.json`. Not
 * paraphrased and not shortened: a reworded instruction is a different instruction.
 *
 * It lives in its own module because TWO artefacts now present it to a product owner -- the §209
 * session document (`build-209-adjudication-session.ts`) and the §209B/§209C per-slot review files
 * (`render-209b-adjudication-batch.ts`). Two copies could drift, and a product owner judging from
 * the drifted one would be judging under an instruction the instrument never froze.
 *
 * ==================== THE TWO AXES THAT ARE NOT IN THE §200 FILE ====================
 *
 * §207 amendment split §200's axis R into `R_SAFETY` (classify the fact) and `R_FLOOR` (compare
 * that classification against the projected priority, which is OTHER for every fact). Both halves
 * carry axis R's `mustNotInfluence` unchanged. Every other key here is present in the §200 file
 * and `assertFaithfulToSection200` re-checks it against that file at render time, so this copy
 * cannot silently diverge from the original it claims to reproduce.
 */

export interface Section209AxisGuidance {
  whatBearsOnIt?: string;
  correctWhen?: string;
  incorrectWhen?: string;
  partialWhen?: string;
  method?: string;
  mustNotInfluence: string;
}

export const AXIS_GUIDANCE: Record<string, Section209AxisGuidance> = {
  A: {
    whatBearsOnIt: 'the observation text, what it establishes, what it leaves open. A fact is decision-critical only if two materially different answers lead to two different CURRENT outcomes.',
    correctWhen: 'every gap the text genuinely leaves open, and that changes what is done today, was declared',
    incorrectWhen: 'a gap that changes what is done today was not declared at all',
    partialWhen: 'some but not all such gaps were declared',
    mustNotInfluence: 'whether the count matches the preregistered range; how well written the declaration is',
  },
  B: {
    whatBearsOnIt: 'whether each declared fact is genuinely open in the text AND genuinely changes today\'s action',
    correctWhen: 'no declared fact is already established by the text and none is decision-neutral',
    incorrectWhen: 'a declared fact is answered by the text, or both its answers lead to the same action today',
    partialWhen: 'one of several declarations is unnecessary',
    mustNotInfluence: 'whether asking anyway would be harmless or good practice',
  },
  H: {
    whatBearsOnIt: 'whether two declared facts are genuinely different facts, and whether settling one leaves the other open',
    correctWhen: 'each declared fact stands alone and would need its own evidence',
    incorrectWhen: 'two declarations restate one gap, or one declaration silently merges two',
    partialWhen: 'both gaps are present but partly conflated',
    mustNotInfluence: 'the structural distinctness of the computed keys — already reported mechanically',
  },
  I: {
    whatBearsOnIt: 'the matched partner row is named so both can be read together',
    correctWhen: 'no fact was declared, or any declared fact is genuinely open',
    incorrectWhen: 'a fact was declared that the text answers, or that changes nothing today',
    partialWhen: 'a declared fact is marginal rather than clearly false',
    mustNotInfluence: 'that declaring something would have been more thorough',
  },
  C: {
    correctWhen: 'the property named is the one the text leaves open',
    incorrectWhen: 'the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification',
    partialWhen: 'the property is in the right area but stated more narrowly or more broadly than the open question',
    mustNotInfluence: 'that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration',
  },
  D: {
    correctWhen: 'the span is the text that shows the fact is open, or that makes it matter',
    incorrectWhen: 'the span is verbatim but points at something else',
    partialWhen: 'the span is relevant but a materially better one was available',
    mustNotInfluence: 'span length; deterministic substring validity is already proven and is not the question',
  },
  E: {
    correctWhen: 'both branches are real possible STATES OF THE WORLD given the observation',
    incorrectWhen: 'a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question',
    partialWhen: 'one branch is sound and the other is not',
    mustNotInfluence: 'which branch is more likely',
  },
  F: {
    correctWhen: 'the two actions differ in what someone would do now',
    incorrectWhen: 'the wording differs but the action is the same, or an action does not follow from its branch',
    partialWhen: 'the actions differ in degree but arguably not in kind',
    mustNotInfluence: 'that the boundary already refused identical strings — it compares bytes, not decisions',
  },
  G: {
    correctWhen: 'the label names the decision the missing fact actually blocks',
    incorrectWhen: 'the label names a topic rather than the blocked decision',
    partialWhen: 'the label is defensible but a listed alternative fits better',
    mustNotInfluence: 'whether it matches the preregistered one — acceptable alternatives are listed, and the preregistered truth is itself unreviewed',
  },
  L: {
    correctWhen: 'the verdict is about this fact and no other',
    incorrectWhen: 'it addresses a neighbouring property, a different hazard, or the row in general',
    partialWhen: 'it reaches the right topic but drifts to an adjacent property',
    mustNotInfluence: 'that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING.',
  },
  M: {
    correctWhen: 'an answer would establish or refute the property',
    incorrectWhen: 'it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature',
    partialWhen: 'an answer would narrow the fact without settling it',
    mustNotInfluence: 'how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY.',
  },
  N: {
    correctWhen: 'reliance declared only where the record bears on the fact, and the proposition says what the record says',
    incorrectWhen: 'reliance declared on an off-point record, or the proposition overstates it',
    partialWhen: 'reliance is defensible but the proposition stretches the record',
    mustNotInfluence: 'that admission passed — structural reuse is not semantic validation',
  },
  Q: {
    method: 'compare the first-pass missingFact (shown) against what the verifier actually received (the projected OwedFact, which does NOT carry missingFact), then read the verifier verdict, which only ever saw the projected form',
    mustNotInfluence: 'MEASUREMENT ONLY. Does not authorise adding a field or mutating the contract.',
  },
  R_SAFETY: {
    method: 'classify the fact on its own safety significance',
    mustNotInfluence: 'MEASUREMENT ONLY. Does not authorise changing the gate or granting the provider escalation authority.',
  },
  R_FLOOR: {
    method: 'compare your classification against the projected priority, which is OTHER for every fact',
    mustNotInfluence: 'MEASUREMENT ONLY. Does not authorise changing the gate or granting the provider escalation authority.',
  },
  S: {
    correctWhen: 'a record that bears on the fact was named, or an off-point record was correctly left unnamed',
    incorrectWhen: 'an off-point record was named, or a record that plainly bears on the fact was ignored',
    mustNotInfluence: 'NOT_EXERCISED where the capability was never present on a row that reached inference',
  },
  T: {
    correctWhen: 'the treatment was sufficient AND the binding is grounded in it',
    incorrectWhen: 'the treatment was sufficient and the binding is nonetheless ungrounded',
    mustNotInfluence: 'CORRECT sourceId SELECTION ALONE IS NEVER ENOUGH FOR T.',
  },
};

/**
 * ==================== THE TWO INSTRUCTIONS §209 DELIBERATELY DID NOT COPY VERBATIM ====================
 *
 * §200 adjudicated the §199 cohort, in which the governed capability was ABSENT on every row that
 * reached inference. Its axis S and axis T instructions therefore end with a §199-specific
 * universal: "NOT_EXERCISED for every §199 fact". The §209 cohort is not that cohort -- AC-22,
 * AC-23 and AC-24 supply real governed record sets -- so copying that sentence verbatim would
 * instruct a §209 product owner to record NOT_EXERCISED on slots where the capability WAS present,
 * which is the opposite of what the rule means.
 *
 * §209 therefore generalised the rule and dropped the §199 quantifier. That decision is already
 * frozen into ADJUDICATION-SESSION-209.md, which shows the generalised S text and never shows the
 * §199-specific one. It is recorded here rather than hidden, every affected slot discloses it to
 * the product owner, and `assertFaithfulToSection200` still REFUSES any divergence that is not on
 * this list. An allowlist that names the change is a governed deviation; a relaxed comparison
 * would be drift with the alarm switched off.
 */
export interface Section200Deviation {
  readonly axisId: string;
  readonly field: string;
  readonly section200Text: string;
  readonly section209Text: string;
  readonly reason: string;
}

export const KNOWN_SECTION_200_DEVIATIONS: readonly Section200Deviation[] = [
  {
    axisId: 'S',
    field: 'mustNotInfluence',
    section200Text: 'NOT_EXERCISED for every §199 fact — the capability was never present on a row '
      + 'that reached inference',
    section209Text: 'NOT_EXERCISED where the capability was never present on a row that reached '
      + 'inference',
    reason: 'the §199 universal is replaced by the condition it stood for. §209 supplies governed '
      + 'record sets on AC-22, AC-23 and AC-24, so "every fact" is false here while the underlying '
      + 'rule is unchanged.',
  },
  {
    axisId: 'T',
    field: 'mustNotInfluence',
    section200Text: 'CORRECT sourceId SELECTION ALONE IS NEVER ENOUGH FOR T. NOT_EXERCISED for '
      + 'every §199 fact.',
    section209Text: 'CORRECT sourceId SELECTION ALONE IS NEVER ENOUGH FOR T.',
    reason: 'the §199-specific second sentence is dropped for the same reason. The operative '
      + 'restriction -- that correct sourceId selection alone is never enough -- is carried '
      + 'unchanged.',
  },
];

export const deviationsForAxis = (axisId: string): readonly Section200Deviation[] =>
  KNOWN_SECTION_200_DEVIATIONS.filter(d => d.axisId === axisId);

/**
 * Re-derives this module against the §200 worksheet it claims to copy. Every axis present in both
 * must match field for field; the two amendment halves must carry axis R's `mustNotInfluence`.
 * Returns the divergences, so a caller can REFUSE rather than render under a drifted instruction.
 */
export const assertFaithfulToSection200 = (section200: {
  rowAxes: readonly any[]; factAxes: readonly any[];
}): string[] => {
  const divergences: string[] = [];
  const original: Record<string, any> = {};
  for (const a of [...section200.rowAxes, ...section200.factAxes]) original[a.id] = a;

  const FIELDS = ['whatBearsOnIt', 'correctWhen', 'incorrectWhen', 'partialWhen', 'method',
    'mustNotInfluence'] as const;

  for (const [axisId, copied] of Object.entries(AXIS_GUIDANCE)) {
    if (axisId === 'R_SAFETY' || axisId === 'R_FLOOR') {
      const r = original.R;
      if (r === undefined) { divergences.push(`${axisId}: §200 has no axis R to inherit from`); }
      else if (copied.mustNotInfluence !== r.mustNotInfluence) {
        divergences.push(`${axisId}.mustNotInfluence does not match §200 axis R`);
      }
      continue;
    }
    const o = original[axisId];
    if (o === undefined) { divergences.push(`${axisId}: not present in the §200 worksheet`); continue; }
    for (const f of FIELDS) {
      const mine = (copied as any)[f];
      if (mine === undefined) continue;
      if (o[f] === mine) continue;
      const approved = KNOWN_SECTION_200_DEVIATIONS.find(
        d => d.axisId === axisId && d.field === f
          && d.section200Text === o[f] && d.section209Text === mine);
      if (approved === undefined) {
        divergences.push(`${axisId}.${f} diverges from the §200 worksheet and is not a recorded `
          + 'deviation');
      }
    }
  }
  return divergences;
};
