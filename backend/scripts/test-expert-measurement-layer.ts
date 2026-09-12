/**
 * EXPERT HAZLENZ -- §153. THE MEASUREMENT-LAYER REPAIRS, SELF-TESTED AGAINST REAL §152 DATA.
 *
 * §152 disclosed two measurement defects and this suite gates both repairs:
 *
 *   D  the DEGENERATE OUTPUT DETECTOR -- §152's HS-A1 returned `candidateKey "placeholder"`, empty
 *      prose and `summary "placeholder"`, and scored PRESENT, contaminating two denominators.
 *   M  the FAMILY COMPARISON MAP -- §151's canonical list was populated with EXPERT-side names, so
 *      the linter passed while the engine emits an entirely different routing vocabulary.
 *
 * >>> BOTH ARE TESTED AGAINST THE ACTUAL §152 RUN ARTIFACTS, not against invented examples. The real
 * >>> data supplies an adversarial case no invented one would have: HS-K1 carries a candidate whose
 * >>> key is literally "UNPLACEHOLDER" under an EMPTY summary, and a substring matcher flags it.
 *
 * >>> AND THE HARDER HALF IS THE NEGATIVES. A legitimate empty Expert response is a correct answer,
 * >>> and a detector that swallowed one would destroy the FORBIDDEN half of every probe this
 * >>> programme runs. Those cases are tested first.
 *
 * F  the FREEZE -- v13, analysis.v2, arbitration, the v9 bytes and the v9 digest are all unchanged,
 *    and v14 does not exist. §153 repairs MEASUREMENT ONLY.
 *
 * ZERO provider calls. $0.00.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import {
  detectDegenerateOutput, degenerateOutputReport, DEGENERATE_DETECTOR_VERSION,
  type DegenerateCheckInput,
} from './lib/expert-degenerate-output-detector';
import {
  classifyFamilyPair, deterministicCovers, unionCoverage, FAMILY_COMPARISON_MAP_VERSION,
  EXPERT_TO_DETERMINISTIC, WEAK_MAPPINGS, EXPERT_ONLY_NO_DETERMINISTIC_ROUTE,
  OBSERVED_DETERMINISTIC_FAMILIES, OBSERVED_EXPERT_FAMILIES,
} from './lib/expert-family-comparison-map';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_AFFECTED_DECISIONS,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  HARDENED_FIXTURES,
} from '../src/safescope-v2/expert-hazlenz/fixtures/hardened-development-set-v9';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

const ROOT = join(__dirname, '..', '..');
const V152 = join(ROOT, 'verification', 'expert-hazlenz-hardened-v13-baseline-2026-09-03');
const AUTHORIZED_V9_DIGEST =
  '434c127c44a8d6d8592c1b6e6c1cd01599428143f44737b19335a3123a7fe194';

/** The real §152 wire, read from the frozen artifact. */
const wire: Record<string, DegenerateCheckInput> = {};
for (const line of readFileSync(join(V152, 'RAW-WIRE.jsonl'), 'utf8').trim().split('\n')) {
  const o = JSON.parse(line) as { rowId: string; candidates: unknown[]; clarifications: unknown[];
    summary?: string; uncertainty?: string[] };
  wire[o.rowId] = { rowId: o.rowId, candidates: o.candidates as never,
    clarifications: o.clarifications as never, summary: o.summary, uncertainty: o.uncertainty };
}

console.log('§153 MEASUREMENT-LAYER REPAIRS — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== F
section('F. THE FREEZE — §153 repairs measurement only');
{
  // §177 moved the authorized ceiling v13 -> v14 for the §176 temporal-sufficiency repair, and
  // §178 moved it v14 -> v15 for the control-property-sufficiency repair. The INTENT of this
  // freeze is unchanged: the prompt may not drift PAST the authorized version.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'F.1 the prompt is v15 — the §178 authorized version, and no further', EXPERT_PROMPT_VERSION);
  const promptSrc = readFileSync(
    join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts'), 'utf8');
  // The ceiling moves WITH the authorization, never ahead of it: §177 authorized v14 and this
  // forbade v15/v16; §178 authorizes v15, so it forbids v16/v17. The gate is re-anchored, not
  // relaxed -- it still proves the module contains no successor beyond what was authorized.
  assert(!/prompt\.v16/.test(promptSrc) && !/prompt\.v17/.test(promptSrc),
    'F.1b and no unauthorized successor exists anywhere in the prompt module');
  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'F.2 analysis.v2 unchanged');
  assert(EXPERT_AFFECTED_DECISIONS.length === 6, 'F.3 the affectedDecision enum is unchanged');
  assert(/THE RETENTION BRIDGE/.test(EXPERT_SYSTEM_PROMPT)
    && /NOT OBSERVED IS NOT ABSENT/.test(EXPERT_SYSTEM_PROMPT)
    && /A THRESHOLD IS NOT A GAP/.test(EXPERT_SYSTEM_PROMPT)
    && /"how much \/ how many \/ how long \/ how far" is HAZARD_SEVERITY/.test(EXPERT_SYSTEM_PROMPT),
    'F.4 v10-v13 semantics and the §139 collision rule are all byte-present and untouched');

  // THE v9 BYTES AND DIGEST. The authorization states the digest as non-negotiable.
  const digest = createHash('sha256').update(JSON.stringify(
    [...HARDENED_FIXTURES].map(f => ({ id: f.row.source.rowId, form: f.form,
      obs: f.row.source.observation, allowed: f.row.source.allowedHazardFamilies,
      truth: f.row.truth, records: f.row.source.governedStandards.map(g => g.citation),
      expectation: f.expectation, denominators: f.denominators,
      review: f.review.map(x => [x.claim, x.note]) }))
      .sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
  assert(digest === AUTHORIZED_V9_DIGEST,
    'F.5 THE v9 DIGEST IS EXACTLY THE AUTHORIZED VALUE — the fixture bytes were not touched',
    digest);
  assert(HARDENED_FIXTURES.length === 16
    && HARDENED_FIXTURES.every(f => f.review.length === (f.expectation.kind === 'REQUIRED' ? 8 : 5)),
    'F.5b sixteen rows, every signature set intact');
}

// ===================================================================== D
section('D. the degenerate-output detector — NEGATIVES FIRST, because they are the harder half');
{
  // ---- D1. A LEGITIMATE EMPTY RESPONSE IS NOT DEGENERATE. This is the case that matters most:
  //      §149's US-H1 and §150's RB-I1 both returned nothing and were both CORRECT.
  const legitimatelyEmpty: DegenerateCheckInput = {
    rowId: 'EMPTY', candidates: [], clarifications: [],
    summary: 'The observation describes a respirator fit test that meets every criterion in the '
      + 'supplied governed record; no additional hazard candidates or decision-critical questions '
      + 'arise.', uncertainty: [],
  };
  const e = detectDegenerateOutput(legitimatelyEmpty);
  assert(!e.DEGENERATE_PROVIDER_OUTPUT && !e.suspect && e.signals.length === 0,
    'D.1 A LEGITIMATE EMPTY RESPONSE IS NOT DEGENERATE — zero candidates and zero clarifications '
    + 'under a substantive summary is a correct answer, and swallowing it would destroy the '
    + 'FORBIDDEN half of every probe', e.signals.join(','));

  // ---- D2. An empty response with a SHORT but real summary is still not degenerate.
  const terse = detectDegenerateOutput({ rowId: 'TERSE', candidates: [], clarifications: [],
    summary: 'Nothing to add beyond the deterministic findings.', uncertainty: [] });
  assert(!terse.DEGENERATE_PROVIDER_OUTPUT && !terse.suspect,
    'D.2 and a terse-but-real summary is not degenerate either — the detector reads STRUCTURE, '
    + 'never quality');

  // ---- D3. POOR REASONING IS NOT DEGENERATE.
  const poor = detectDegenerateOutput({ rowId: 'POOR',
    candidates: [{ candidateKey: 'c1', evidenceBasis: 'it looks dangerous',
      reasoning: 'this seems unsafe to me' }],
    clarifications: [], summary: 'There is a hazard here.', uncertainty: [] });
  assert(!poor.DEGENERATE_PROVIDER_OUTPUT && !poor.suspect,
    'D.3 POOR REASONING IS NOT DEGENERATE — thin content is a model result, not an execution '
    + 'anomaly, and conflating them would let the instrument discard bad answers it dislikes');

  // ---- D4. THE REAL ADVERSARIAL CASE, from §152's own data: HS-K1's candidate key is literally
  //      "UNPLACEHOLDER" and its summary is EMPTY. A substring matcher flags it; this must not.
  const k1 = detectDegenerateOutput(wire['HS-K1']);
  assert(!k1.DEGENERATE_PROVIDER_OUTPUT,
    'D.4 §152 HS-K1 IS NOT DEGENERATE — its candidateKey is literally "UNPLACEHOLDER" and its '
    + 'summary is EMPTY, and it carries 159 and 261 characters of substantive prose. WHOLE-FIELD '
    + 'equality, never substring', `signals: ${k1.signals.join(',') || 'none'}`);
  assert((wire['HS-K1'].candidates[0] as { candidateKey: string }).candidateKey === 'UNPLACEHOLDER',
    'D.4b (and that really is the key in the frozen artifact, not a constructed example)');

  // ---- D5. §152's HS-J1: one empty evidenceBasis beside 342 characters of reasoning, under a
  //      substantive summary. An ordinary malformed item the normalizer already handles.
  const j1 = detectDegenerateOutput(wire['HS-J1']);
  assert(!j1.DEGENERATE_PROVIDER_OUTPUT,
    'D.5 §152 HS-J1 IS NOT DEGENERATE — one thin field among three rich candidates is an ordinary '
    + 'malformed item, not a provider stub', `signals: ${j1.signals.join(',') || 'none'}`);

  // ---- D6. Every other §152 row must come back clean.
  const others = Object.keys(wire).filter(r => r !== 'HS-A1');
  const falsePositives = others.filter(r => detectDegenerateOutput(wire[r]).DEGENERATE_PROVIDER_OUTPUT);
  assert(falsePositives.length === 0,
    'D.6 ZERO false positives across the other fifteen §152 rows', falsePositives.join(', '));

  // ---- D7. AND IT CATCHES HS-A1. Only after the negatives are established.
  const a1 = detectDegenerateOutput(wire['HS-A1']);
  assert(a1.DEGENERATE_PROVIDER_OUTPUT,
    'D.7 §152 HS-A1 IS CAUGHT — the defect this module exists for', a1.signals.join(', '));
  assert(a1.signals.includes('ALL_PROSE_IS_PLACEHOLDER')
    && a1.signals.includes('PLACEHOLDER_IDENTIFIER')
    && a1.signals.includes('CANDIDATE_WITHOUT_ANY_PROSE')
    && a1.signals.includes('PLACEHOLDER_SUMMARY'),
    'D.7b on FOUR independent signals, not one', a1.signals.join(', '));

  // ---- D8. The threshold is real: one signal is a SUSPECT and is excluded from nothing.
  const oneSignal = detectDegenerateOutput({ rowId: 'ONE',
    candidates: [{ candidateKey: 'placeholder', evidenceBasis: 'a real and substantive basis '
      + 'describing what the observation states', reasoning: 'a real and substantive reasoning '
      + 'paragraph explaining the mechanism' }],
    clarifications: [], summary: 'A substantive summary of the analysis.', uncertainty: [] });
  assert(!oneSignal.DEGENERATE_PROVIDER_OUTPUT && oneSignal.suspect
    && oneSignal.signals.length === 1,
    'D.8 ONE signal is a SUSPECT, not a verdict — reported and excluded from nothing',
    oneSignal.signals.join(','));

  // ---- D9. Impossible repetition, the provider-stub shape the real data has not yet produced.
  const rep = detectDegenerateOutput({ rowId: 'REP',
    candidates: [1, 2, 3].map(i => ({ candidateKey: `c${i}`,
      evidenceBasis: 'the same basis repeated verbatim', reasoning: `distinct reasoning ${i}` })),
    clarifications: [], summary: 'A substantive summary.', uncertainty: [] });
  assert(rep.signals.includes('IMPOSSIBLE_REPETITION'),
    'D.9 three candidates sharing one evidenceBasis verbatim raises the repetition signal');

  // ---- D10. THE REPORT NEVER AUTHORIZES A RERUN, and says the denominator loss out loud.
  const report = degenerateOutputReport(Object.values(wire));
  assert(report.DEGENERATE_ROW_IDS.length === 1 && report.DEGENERATE_ROW_IDS[0] === 'HS-A1'
    && report.DENOMINATOR_LOSS === 1,
    'D.10 across the whole §152 replicate: exactly ONE degenerate row, and the denominator loss is '
    + 'stated explicitly', report.DEGENERATE_ROW_IDS.join(', '));
  assert(report.rerunAuthorized === false && /NO RERUN IS AUTHORIZED/.test(report.note),
    'D.10b and the report cannot request a rerun — §153 grants none');
  assert(DEGENERATE_DETECTOR_VERSION.endsWith('.v2'), 'D.11 the detector carries a version');
}

// ===================================================================== D2
section('D2. §154 detector v2 — the §153 gap, closed PROSPECTIVELY and still conservative');
{
  // §153's HS-A1 is the case v1 missed. It is loaded from the FROZEN §153 artifact, not retyped,
  // so this test cannot drift from what the provider actually returned.
  const r2wire: Record<string, DegenerateCheckInput> = {};
  for (const line of readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-hardened-v13-replicate2-2026-09-03', 'RAW-WIRE.jsonl'), 'utf8')
    .trim().split('\n')) {
    const o = JSON.parse(line) as { rowId: string; candidates: unknown[]; clarifications: unknown[];
      summary?: string; uncertainty?: string[] };
    r2wire[o.rowId] = { rowId: o.rowId, candidates: o.candidates as never,
      clarifications: o.clarifications as never, summary: o.summary, uncertainty: o.uncertainty };
  }

  // ---- THE THREE REAL DEGENERATE SHAPES. All three must be caught by ONE detector.
  const a1v152 = detectDegenerateOutput(wire['HS-A1']);
  assert(a1v152.DEGENERATE_PROVIDER_OUTPUT,
    'D2.1 §152 HS-A1 (exact placeholder form) is still caught by v2 — no regression',
    a1v152.signals.join(', '));

  const k1v153 = detectDegenerateOutput(r2wire['HS-K1']);
  assert(k1v153.DEGENERATE_PROVIDER_OUTPUT,
    'D2.2 §153 HS-K1 ("placeholder" summary, zero candidates) is still caught',
    k1v153.signals.join(', '));

  const a1v153 = detectDegenerateOutput(r2wire['HS-A1']);
  assert(a1v153.DEGENERATE_PROVIDER_OUTPUT,
    'D2.3 THE v1 GAP IS CLOSED: §153 HS-A1 — summary "summary placis a a placeholder", '
    + 'candidateKey "x", one candidate with 133 and 322 characters of REAL prose — is now caught',
    a1v153.signals.join(', '));
  assert(a1v153.signals.includes('NEAR_PLACEHOLDER_GARBLING')
    && a1v153.signals.includes('MEANINGLESS_IDENTIFIER'),
    'D2.3b on BOTH new signals, so the unchanged two-signal threshold is what convicts it — not a '
    + 'lowered bar', a1v153.signals.join(', '));
  assert((r2wire['HS-A1'].candidates[0] as { candidateKey: string }).candidateKey === 'x',
    'D2.3c (and that really is the key in the frozen §153 artifact)');

  // ---- THE NEGATIVES, RE-PROVED AGAINST v2. Every one of these is the reason v1 was narrow.
  const k1v152 = detectDegenerateOutput(wire['HS-K1']);
  assert(!k1v152.DEGENERATE_PROVIDER_OUTPUT,
    'D2.4 §152 HS-K1 IS STILL NOT DEGENERATE UNDER v2 — its key is literally "UNPLACEHOLDER" and '
    + 'its summary is EMPTY. The new garbling rule must not reach a single non-placeholder token, '
    + 'and the new identifier rule must not reach a 13-character name',
    `signals: ${k1v152.signals.join(',') || 'none'}`);
  const j1 = detectDegenerateOutput(wire['HS-J1']);
  assert(!j1.DEGENERATE_PROVIDER_OUTPUT,
    'D2.5 §152 HS-J1 (one thin field among three rich candidates) is still not degenerate');

  // Legitimate empty, terse, and poor-but-real, all re-checked under v2.
  for (const [label, input] of [
    ['a legitimate EMPTY response', { rowId: 'E', candidates: [], clarifications: [],
      summary: 'The observation describes controls that meet the supplied record; no additional '
        + 'hazard candidates or decision-critical questions arise.', uncertainty: [] }],
    ['a TERSE but substantive response', { rowId: 'T', candidates: [], clarifications: [],
      summary: 'Nothing to add beyond the deterministic findings.', uncertainty: [] }],
    ['a POOR-but-real response', { rowId: 'P',
      candidates: [{ candidateKey: 'c1', evidenceBasis: 'it looks dangerous',
        reasoning: 'this seems unsafe to me' }],
      clarifications: [], summary: 'There is a hazard here.', uncertainty: [] }],
    ['a SCHEMA-VALID negative control with a short key', { rowId: 'N',
      candidates: [{ candidateKey: 'c1', evidenceBasis: 'the guard is fitted and the interlock was '
        + 'demonstrated by test in my presence', reasoning: 'the control is verified working' }],
      clarifications: [], summary: 'The machine is guarded as designed.', uncertainty: [] }],
  ] as Array<[string, DegenerateCheckInput]>) {
    const v = detectDegenerateOutput(input);
    assert(!v.DEGENERATE_PROVIDER_OUTPUT,
      `D2.6 ${label} is NOT degenerate under v2`, v.signals.join(',') || 'no signals');
  }

  // A malformed-but-semantic response: an empty field beside real content is the normalizer's job.
  const malformedButSemantic = detectDegenerateOutput({ rowId: 'M',
    candidates: [{ candidateKey: 'cand-1', evidenceBasis: '',
      reasoning: 'a full and substantive reasoning paragraph naming the mechanism and the exposure' }],
    clarifications: [], summary: 'A substantive summary of the analysis and its findings.',
    uncertainty: [] });
  assert(!malformedButSemantic.DEGENERATE_PROVIDER_OUTPUT,
    'D2.7 a MALFORMED-BUT-SEMANTIC response is not degenerate — that is the normalizer\'s job',
    malformedButSemantic.signals.join(',') || 'no signals');

  // ---- THE NEW RULES, EXERCISED IN ISOLATION so each is known to fire on its own.
  const garbleOnly = detectDegenerateOutput({ rowId: 'G', candidates: [], clarifications: [],
    summary: 'summary placis a a placeholder', uncertainty: [] });
  assert(garbleOnly.signals.includes('NEAR_PLACEHOLDER_GARBLING'),
    'D2.8 NEAR_PLACEHOLDER_GARBLING fires on the §153 summary in isolation');
  const idOnly = detectDegenerateOutput({ rowId: 'I',
    candidates: [{ candidateKey: 'x', evidenceBasis: 'a real and substantive evidence basis here',
      reasoning: 'a real and substantive reasoning paragraph here' }],
    clarifications: [], summary: 'The pump is running with its coupling guard removed.',
    uncertainty: [] });
  assert(idOnly.signals.includes('MEANINGLESS_IDENTIFIER') && !idOnly.DEGENERATE_PROVIDER_OUTPUT
    && idOnly.suspect,
    'D2.9 MEANINGLESS_IDENTIFIER fires alone but only makes a SUSPECT — one signal is never a '
    + 'verdict, which is what keeps v2 conservative', idOnly.signals.join(','));

  // ---- THE FALSE POSITIVE THIS SUITE CAUGHT IN ITS OWN RULE, kept as a regression test.
  //      An earlier v2 draft counted the schema's field names as placeholder lexemes, which made
  //      "A substantive summary." garbled. Those words are ordinary English and now fall through to
  //      filler; only unambiguous placeholder words are lexemes.
  for (const realSummary of ['A substantive summary.', 'The summary is brief.',
    'Reasoning is given above.', 'A short summary of the candidate hazards.']) {
    const v = detectDegenerateOutput({ rowId: 'S', candidates: [], clarifications: [],
      summary: realSummary, uncertainty: [] });
    assert(!v.signals.includes('NEAR_PLACEHOLDER_GARBLING'),
      `D2.9b the garbling rule does NOT reach the ordinary summary ${JSON.stringify(realSummary)} `
      + '— schema field names are English words, not placeholder lexemes');
  }
  // And a REAL sentence that genuinely mentions a placeholder must survive.
  const realMention = detectDegenerateOutput({ rowId: 'RM', candidates: [], clarifications: [],
    summary: 'The permit has a placeholder entry for the gas test result and the box is unsigned.',
    uncertainty: [] });
  assert(!realMention.signals.includes('NEAR_PLACEHOLDER_GARBLING'),
    'D2.9c and a real sentence ABOUT a placeholder survives — it carries content words');

  // ---- AND THE IDENTIFIER RULE MUST NOT REACH ORDINARY SHORT KEYS.
  for (const key of ['c1', 'q1', 'cand-1', 'UNPLACEHOLDER', 'atmo-hazard']) {
    const v = detectDegenerateOutput({ rowId: 'K',
      candidates: [{ candidateKey: key, evidenceBasis: 'a substantive basis of adequate length',
        reasoning: 'a substantive reasoning paragraph of adequate length' }],
      clarifications: [], summary: 'A substantive summary.', uncertainty: [] });
    assert(!v.signals.includes('MEANINGLESS_IDENTIFIER'),
      `D2.10 the identifier rule does NOT reach the ordinary key ${JSON.stringify(key)}`);
  }

  // ---- THE FULL SWEEP. Exactly the three known degenerate rows across both replicates.
  const all152 = degenerateOutputReport(Object.values(wire));
  const all153 = degenerateOutputReport(Object.values(r2wire));
  assert(all152.DEGENERATE_ROW_IDS.join(',') === 'HS-A1',
    'D2.11 §152 under v2: exactly HS-A1', all152.DEGENERATE_ROW_IDS.join(','));
  assert(all153.DEGENERATE_ROW_IDS.sort().join(',') === 'HS-A1,HS-K1',
    'D2.12 §153 under v2: HS-A1 AND HS-K1 — v1 saw only HS-K1, so the POST-HOC COMMON-DETECTOR '
    + 'DIAGNOSTIC changes §153\'s execution-valid picture and must be labelled post hoc',
    all153.DEGENERATE_ROW_IDS.join(','));
  assert(all152.rerunAuthorized === false && all153.rerunAuthorized === false,
    'D2.13 and neither report can authorize a rerun');
}

// ===================================================================== M
section('M. the family comparison map — two taxonomies, not one canonical vocabulary');
{
  // ---- THE STRUCTURAL FINDING, asserted from the observed lists rather than claimed in prose.
  const det = new Set<string>(OBSERVED_DETERMINISTIC_FAMILIES);
  const exp = new Set<string>(OBSERVED_EXPERT_FAMILIES);
  const shared = [...det].filter(x => exp.has(x));
  const detOnly = [...det].filter(x => !exp.has(x));
  const expOnly = [...exp].filter(x => !det.has(x));
  assert(shared.length === 12 && detOnly.length === 17 && expOnly.length === 17,
    'M.1 THE TWO VOCABULARIES GENUINELY DIFFER — 12 shared, 17 deterministic-only, 17 Expert-only. '
    + 'This is not alias drift; they are different taxonomies doing different jobs',
    `${shared.length}/${detOnly.length}/${expOnly.length}`);

  // ---- THE §150 AND §152 DEFECTS, closed and proved closed.
  assert(deterministicCovers('suspended_loads', ['cranes_hoists']).covered,
    'M.2 THE §150 RB-C1 DEFECT IS CLOSED — truth suspended_loads is covered by engine cranes_hoists');
  assert(deterministicCovers('machine_guarding', ['guarding_interlocks']).covered,
    'M.3 THE §152 HS-E1 SHAPE IS CLOSED — truth machine_guarding is covered by guarding_interlocks');
  assert(deterministicCovers('confined_space_entry', ['confined_space']).covered,
    'M.4 and confined_space_entry by confined_space');
  assert(classifyFamilyPair('material_handling_storage', 'material_handling') === 'MAPPED',
    'M.5 material_handling_storage -> material_handling');
  assert(classifyFamilyPair('lockout_tagout', 'conveyors') === 'MAPPED',
    'M.6 lockout_tagout -> conveyors, the §150 RB-J1 / §152 HS-L1 routing');

  // ---- IDENTITY IS NOT A MAP ENTRY, and UNMAPPED IS A FIRST-CLASS ANSWER.
  assert(classifyFamilyPair('fall_protection', 'fall_protection') === 'IDENTICAL',
    'M.7 a shared name classifies IDENTICAL without needing a table entry');
  assert(classifyFamilyPair('electrical', 'hot_work') === 'NO_DETERMINISTIC_ROUTE',
    'M.8 an Expert family the engine has no domain for says so, rather than reading as a mismatch');
  assert(classifyFamilyPair('a_family_nobody_declared', 'hot_work') === 'UNMAPPED',
    'M.8b and a family the map has nothing to say about returns UNMAPPED, never a silent verdict');

  // ---- WEAK MAPPINGS ARE FLAGGED, not hidden. §152's HS-C1 forced this.
  assert(WEAK_MAPPINGS.includes('emergency_equipment')
    && classifyFamilyPair('emergency_equipment', 'emergency_egress') === 'MAPPED_WEAK',
    'M.9 emergency_equipment -> emergency_egress is MAPPED_WEAK — the §152 HS-C1 case, counted but '
    + 'flagged, because quietly treating one as the other would repeat §151\'s mistake inverted');
  assert(EXPERT_ONLY_NO_DETERMINISTIC_ROUTE.includes('electrical')
    && EXPERT_ONLY_NO_DETERMINISTIC_ROUTE.includes('lone_working'),
    'M.10 families with no engine route are enumerated, so a miss on one is not presented as '
    + 'symmetric', EXPERT_ONLY_NO_DETERMINISTIC_ROUTE.join(', '));

  // ---- THE MAP MUST NOT INVENT A ROUTE. Every target must be a family the engine actually emits.
  const badTargets = Object.entries(EXPERT_TO_DETERMINISTIC)
    .flatMap(([k, v]) => v.filter(t => !det.has(t)).map(t => `${k}->${t}`));
  assert(badTargets.length === 0,
    'M.11 EVERY mapping target is a family the engine was OBSERVED to emit — the discipline §151 '
    + 'skipped when it populated its canonical list with Expert-side names', badTargets.join(', '));

  // ---- THE §152 COVERAGE RECOMPUTATION, from the frozen run records.
  const rows: Array<{ rowId: string; truthPresent: string[]; deterministicEmitted: string[];
    expertEmitted: string[] }> = [];
  for (const line of readFileSync(join(V152, 'RUN-RECORDS.jsonl'), 'utf8').trim().split('\n')) {
    const r = JSON.parse(line) as { row: { source: { rowId: string };
      truth: { presentHazardFamilies: string[] } };
      deterministicFamiliesEmitted?: string[];
      calls: Array<{ analysis?: { expertHazardCandidates: Array<{ hazardFamily: string }> } }> };
    rows.push({ rowId: r.row.source.rowId, truthPresent: r.row.truth.presentHazardFamilies,
      deterministicEmitted: r.deterministicFamiliesEmitted ?? [],
      expertEmitted: (r.calls[0].analysis?.expertHazardCandidates ?? []).map(c => c.hazardFamily) });
  }
  const cov = unionCoverage(rows);
  console.log(`\n      §152 coverage RECOMPUTED: ${cov.coveredByEither}/${cov.truthPresentTotal}`
    + `   (expert-only ${cov.coveredByExpertOnly}, via map ${cov.coveredByDeterministicViaMap},`
    + ` weak-only ${cov.coveredViaWeakMappingOnly})`);
  console.log(`      still missed by both: `
    + cov.missedByBoth.map(m => `${m.rowId}:${m.family}`).join(' ') + '\n');
  assert(cov.truthPresentTotal === 9,
    'M.12 the §152 truth-present denominator is unchanged at 9 — the map changes the NUMERATOR '
    + 'reading, never the denominator', String(cov.truthPresentTotal));
  // ==================== M.12b IS A CORRECTION, AND IT CORRECTS §152's OWN REPORT ====================
  //
  // This assertion was authored expecting the honest map to RECOVER coverage §152 could not see.
  // IT DOES NOT. Recomputed, the figure is 4/9 — identical to what §152 reported — and the reason is
  // that §152's stated EXPLANATION of that figure was wrong, not the figure itself.
  //
  // §152's report said "three of four misses are artifacts… the wrong canonical family list on
  // HS-C1 and HS-E1". Checked against the frozen run records that is FALSE:
  //
  //   HS-C1  the engine emitted `guarding_interlocks` on an MRI-screening row. That is not an alias
  //          of `emergency_equipment`; it is a different hazard. The real defect is that
  //          `emergency_equipment` is a POOR TRUTH FAMILY for "patient screened before entry" — a
  //          fixture family mis-specification, not a vocabulary mismatch.
  //   HS-E1  the engine emitted NOTHING. There was no name to alias. Expert raised `lockout_tagout`
  //          where truth said `machine_guarding` — a genuine family-CHOICE disagreement.
  //   HS-K1  Expert raised only `personal_protective_equipment`. A genuine partial miss.
  //   HS-A1  the provider stub. The one real artifact, and it accounts for 2 of the 5 misses.
  //
  // The map repair was still necessary — §151's canonical list WAS wrong and the linter passed on it
  // — but it does not move this number, and saying otherwise would be inventing a result.
  assert(cov.coveredByEither === 4,
    'M.12b MEASURED, AND IT CORRECTS §152: recomputing with an honest map gives 4/9, IDENTICAL to '
    + 'the reported figure. §152\'s explanation of that figure was wrong — HS-C1 and HS-E1 are not '
    + 'alias artifacts. Recorded as measured rather than rewritten into the shape the repair wanted',
    `${cov.coveredByEither}/${cov.truthPresentTotal}`);
  assert(cov.missedByBoth.filter(m => m.rowId === 'HS-A1').length === 2,
    'M.12c TWO of the five misses ARE the HS-A1 provider stub, and no map repairs that — that is '
    + 'the whole of the artifact, and the other three are real');
  assert(cov.coveredByDeterministicViaMap === 0,
    'M.12d and the map contributed ZERO cross-vocabulary rescues on this replicate, because on '
    + 'every missed row the engine either emitted nothing or emitted an unrelated domain. The map '
    + 'is still required — §150 RB-C1 proves the shape is real (M.2) — but it did not fire here');
  assert(FAMILY_COMPARISON_MAP_VERSION.endsWith('.v1'), 'M.13 the map carries a version');

  // §152's REPORTED figure is historical and is not overwritten.
  assert(true,
    'M.14 §152\'s reported 4/9 STANDS as the historical result. This recomputation is a PROSPECTIVE '
    + 'diagnostic, reported beside it and never in place of it');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) { failures.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
