/** The scenario transforms, factored out so the veto instrument and the gate table share ONE
 *  definition. Two copies of a load-bearing transform is the failure mode 32.5 names. */
'use strict';
const UNDECIDED = ['INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
const PRIORITY = ['ACTIVE', 'CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED',
                  'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
const assertedFrom = (states) => {
  if (!states || states.length === 0) return null;
  for (const s of PRIORITY) if (states.includes(s)) return s;
  return states[0];
};
function candidatesFor(view, states) {
  const src = view.scoredTier.candidates || [];
  return states.map((s, i) => ({
    candidateKey: (src[i] && src[i].candidateKey) || `bound-${i}`,
    hazardFamily: (src[i] && src[i].hazardFamily) || (src[0] && src[0].hazardFamily) || 'unknown',
    conditionState: s,
  }));
}
const IDENTITY = (view) => view.scoredTier;
const S1_boundTier = (view) => {
  if (!view.binderTier) return view.scoredTier;
  const states = view.binderTier.boundStates || [];
  return { ...view.scoredTier, candidates: candidatesFor(view, states), assertedState: assertedFrom(states) };
};
const STATE_UNSUPPORTED = 'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE';
function demoteStateUnsupported(view) {
  if (!view.binderTier) return null;
  const demotable = (view.binderTier.rejected || []).filter(r => (r.codes || []).length === 1 && r.codes[0] === STATE_UNSUPPORTED);
  if (demotable.length === 0) return null;
  return (view.binderTier.boundStates || []).concat(demotable.map(() => 'INSUFFICIENT_EVIDENCE'));
}
const S2_boundPlusDemote = (view) => {
  const base = S1_boundTier(view);
  const states = demoteStateUnsupported(view);
  if (!states) return base;
  return { ...base, candidates: candidatesFor(view, states), assertedState: assertedFrom(states) };
};
const S3_boundPlusDemotePlusClarification = (view) => {
  const s2 = S2_boundPlusDemote(view);
  if (!demoteStateUnsupported(view)) return s2;
  return { ...s2, raisedClarification: true };
};
const S4_activeWithSelfDeclaredUndecided = (view) => {
  const states = (view.scoredTier.candidates || []).map(c => c.conditionState);
  const active = view.scoredTier.assertedState === 'ACTIVE';
  if (!(active && states.some(s => UNDECIDED.includes(s)) && view.providerTier.candidateBorneClarification === true)) return view.scoredTier;
  const next = states.map(s => (s === 'ACTIVE' ? 'INSUFFICIENT_EVIDENCE' : s));
  return { ...view.scoredTier, candidates: candidatesFor(view, next), assertedState: assertedFrom(next) };
};
const S5_combined = (view) => S4_activeWithSelfDeclaredUndecided({ ...view, scoredTier: S2_boundPlusDemote(view) });

module.exports = { SCENARIOS: [
  ['S0_IDENTITY_baseline', IDENTITY],
  ['S1_authoritative_tier_BOUND', S1_boundTier],
  ['S2_BOUND_plus_demote_not_delete', S2_boundPlusDemote],
  ['S3_S2_plus_carrier_clarification', S3_boundPlusDemotePlusClarification],
  ['S4_RC2_proposal_level_approximation', S4_activeWithSelfDeclaredUndecided],
  ['S5_S2_plus_S4', S5_combined],
], assertedFrom, candidatesFor };
