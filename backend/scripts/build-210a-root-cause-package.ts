/**
 * §210A -- ROOT-CAUSE AND TOKEN-BLUEPRINT EVIDENCE PACKAGE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED AGAINST A PROVIDER.
 *
 * Reads the frozen §208 / §208B / §209 artefacts and emits the §210A matrices. It writes ONLY into
 * its own new output directory: no §208, §208B or §209 artefact is opened for writing, no verdict
 * is read except to report it, and no gate is recomputed.
 *
 * ==================== WHAT IS DERIVED AND WHAT IS AUTHORED ====================
 *
 * Two kinds of content live here and they are labelled separately in every row:
 *
 *   DERIVED   counted or copied from frozen evidence -- verdicts, reasons, token counts, candidate
 *             and declaration structure, payload identities. Reproducible by re-running this file.
 *
 *   ANALYSIS  the agent's root-cause classification. It is a READING of that evidence, not a
 *             measurement of it, it carries an explicit confidence, and it is never presented as a
 *             frozen fact. `ROOT_CAUSE_ANALYSIS` below is the single place it is authored.
 *
 * No §209 verdict is reinterpreted anywhere: the adjudicator's verdict and reason are carried
 * verbatim and every classification is downstream of them.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const EVID = join(V, 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RECOVERY = join(V, 'expert-hazlenz-verifier-recovery-208b-2026-09-08');
const ADJ = join(V, 'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');
const OUT = join(V, 'expert-hazlenz-210a-root-cause-and-token-blueprint-2026-09-08');

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const readJsonl = (p: string): any[] =>
  existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];

const sources: { label: string; path: string; sha256: string }[] = [];
const track = (label: string, p: string): string => {
  sources.push({ label, path: p.slice(ROOT.length + 1), sha256: sha256(readFileSync(p)) });
  return p;
};

const worksheet = readJson(track('§209 worksheet', join(ADJ, 'ADJUDICATION-WORKSHEET-209.json')));
const gates = readJson(track('§209 gate results', join(ADJ, 'GATE-RESULTS-209.json')));
const firstPass = readJsonl(track('§208 first pass', join(EVID, 'RAW-FIRST-PASS-208.jsonl')));
const projection = readJsonl(track('§208 corrected projection',
  join(EVID, 'PROJECTION-208-CORRECTED.jsonl')));
const governed = readJsonl(track('§208 governed stage', join(EVID, 'RAW-GOVERNED-208.jsonl')));
const ledger208 = readJsonl(track('§208 call ledger', join(EVID, 'CALL-LEDGER-208.jsonl')));
const ledger208b = readJsonl(track('§208B call ledger', join(RECOVERY, 'CALL-LEDGER-208B.jsonl')));

const slots: any[] = worksheet.slots;
const slotById = new Map(slots.map(s => [s.slotId, s]));
const fpBy = new Map(firstPass.map(r => [r.caseId, r]));
const projBy = new Map(projection.map(r => [r.caseId, r]));

// ================================================================ DERIVED: failing slots

const failing = new Map<string, { verdict: string; gates: string[] }>();
for (const g of gates.gates) {
  for (const f of g.failingSlots ?? []) {
    const e = failing.get(f.slotId) ?? { verdict: f.verdict as string, gates: [] as string[] };
    e.gates.push(g.gateId);
    failing.set(f.slotId, e);
  }
}

// ================================================================ ANALYSIS (authored)

type Family = 'RC-A' | 'RC-B' | 'RC-C' | 'RC-D' | 'RC-E';
interface Analysis {
  defect: string;
  firstStage: string;
  family: Family;
  subMode: string;
  status: 'UPSTREAM_ROOT' | 'DOWNSTREAM_CONSEQUENCE';
  evidence: string;
  remediation: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * AGENT ANALYSIS. Each entry is a reading of the frozen evidence named in `evidence`, downstream of
 * the product owner's verdict and reason, which are carried verbatim beside it in the matrix.
 */
const ROOT_CAUSE_ANALYSIS: Record<string, Analysis> = {
  // ---- RC-A: present-state epistemic framing (largest family, spans G1/G3/G4/G7/G14)
  'AC-19.ROW.A': {
    defect: 'the decision-critical property "do the dressers actually wear RPE during cutting" was '
      + 'replaced by "is RPE available in the lockers"',
    firstStage: 'FIRST_PASS_GENERATION',
    family: 'RC-A', subMode: 'AVAILABILITY_FOR_USE',
    status: 'UPSTREAM_ROOT',
    evidence: 'DEC-1.missingFact names presence and accessibility in lockers; branchA/B and CL-1 '
      + 'carry the same availability framing. No candidate is INSUFFICIENT_EVIDENCE (CAND-1 '
      + 'CONTROLLED, CAND-2/3 UNKNOWN).',
    remediation: 'first-pass instruction must require the declared property to be a PRESENT STATE '
      + 'of the work as observed, and must reject a capability/availability proxy for it',
    confidence: 'HIGH',
  },
  'AC-19.ROW.B': {
    defect: 'the availability declaration is not a legitimate owed fact for this row',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'AVAILABILITY_FOR_USE',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'same single declaration DEC-1 as AC-19.ROW.A; precision fails because the one '
      + 'declaration emitted is the substituted property',
    remediation: 'resolved by the RC-A fix; no separate lever',
    confidence: 'HIGH',
  },
  'AC-19.FACT1.M': {
    defect: 'the clarification asks about availability and cannot settle actual use',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'AVAILABILITY_FOR_USE',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'CL-1 asks "Is RPE actually available to the dressers ... for use when abrasive '
      + 'cutting resumes?" -- the availability frame is inherited from the declaration',
    remediation: 'resolved by the RC-A fix; the clarification inherits the property frame',
    confidence: 'HIGH',
  },
  'AC-22.ROW.A': {
    defect: 'the frozen property (what was actually done about compressed-air AND accumulator '
      + 'energy before entry) was replaced by "does a bleed/block method exist", and the '
      + 'compressed-air conjunct was dropped',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'EXISTENCE_FOR_ACTION',
    status: 'UPSTREAM_ROOT',
    evidence: 'UF-1.missingFact = "Whether a physical means exists to bleed down or block the '
      + 'hydraulic accumulator\'s stored pressure". Candidate pneumatic_energy_not_locked exists '
      + 'but is ACTIVE and never enters a declaration.',
    remediation: 'RC-A present-state rule, plus a conjunct-completeness check when the frozen '
      + 'property is conjunctive',
    confidence: 'HIGH',
  },
  'AC-22.ROW.B': {
    defect: 'the sole declaration substitutes engineering-method availability for the pre-entry '
      + 'energy state and omits the compressed-air conjunct',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'EXISTENCE_FOR_ACTION',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'same UF-1 declaration', remediation: 'resolved by the RC-A fix', confidence: 'HIGH',
  },
  'AC-22.FACT1.M': {
    defect: 'the clarification asks whether the accumulator CAN be bled or blocked, not what was '
      + 'done before entry',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'EXISTENCE_FOR_ACTION',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'CQ-1 is a capability question inherited from UF-1',
    remediation: 'resolved by the RC-A fix', confidence: 'HIGH',
  },
  'AC-22.FACT1.N': {
    defect: 'a governed record stating a REQUIREMENT was declared to bear on whether a physical '
      + 'method EXISTS on this machine',
    firstStage: 'GOVERNED_STAGE_BINDING', family: 'RC-A', subMode: 'REQUIREMENT_FOR_FACT',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'RAW-GOVERNED-208 AC-22 bearingStatement: "...the requirement that stored or residual '
      + 'energy be dissipated or restrained ... which bears on whether such a method exists on the '
      + 'machine." The binding target was already an existence question (UF-1).',
    remediation: 'RC-A fixes the bound property; additionally the governed contract should force '
      + 'the bearing statement to separate what the record REQUIRES from what it EVIDENCES',
    confidence: 'HIGH',
  },
  'AC-22.FACT1.T': {
    defect: 'the binding extends a normative requirement into a factual proposition about this '
      + 'machine, which the record cannot ground',
    firstStage: 'GOVERNED_STAGE_BINDING', family: 'RC-A', subMode: 'REQUIREMENT_FOR_FACT',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'same bearingStatement; the product owner recorded that the provider-visible governed '
      + 'text WAS sufficient to judge grounding, so this is not an evidence-supply defect',
    remediation: 'same as AC-22.FACT1.N', confidence: 'HIGH',
  },
  'AC-08.FACT1.M': {
    defect: 'the clarification asks what traffic-management arrangements EXIST; it can be satisfied '
      + 'without establishing whether simultaneous pedestrian/truck occupancy is prevented',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'EXISTENCE_FOR_EFFECT',
    status: 'UPSTREAM_ROOT',
    evidence: 'decl-traffic-mgmt.missingFact asks whether arrangements "provide any operational '
      + 'control"; clar-traffic-mgmt enumerates arrangement types rather than the effect required',
    remediation: 'RC-A present-state rule extended to EFFECT: where the frozen property is an '
      + 'achieved effect, naming the mechanism is not the property',
    confidence: 'HIGH',
  },
  'AC-02.FACT2.M': {
    defect: 'the clarification asks whether the guard gap was CHECKED/ADJUSTED; a negative answer '
      + 'leaves the actual present clearance unestablished',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-A', subMode: 'PROCESS_FOR_STATE',
    status: 'UPSTREAM_ROOT',
    evidence: 'the §208B verifier VERIFIED_AS_IS this clarification, so the verifier did not catch '
      + 'the process/state substitution either',
    remediation: 'RC-A present-state rule; a process question is sufficient only when the process '
      + 'outcome is itself the frozen property',
    confidence: 'HIGH',
  },

  // ---- RC-B: verifier cross-fact drift (payload isolation)
  ...Object.fromEntries((['AC-01.FACT1.L', 'AC-01.FACT2.L', 'AC-02.FACT1.L', 'AC-02.FACT2.L',
    'AC-03.FACT1.L', 'AC-20.FACT1.L', 'AC-20.FACT2.L'] as const).map(id => [id, {
    defect: 'the verifier reached the correct owed fact but its rationale also evaluated sibling '
      + 'properties visible in the same payload, so the verdict is not bound to this fact and no '
      + 'other',
    firstStage: 'VERIFIER_INPUT_COMPOSITION',
    family: 'RC-B' as Family, subMode: 'SIBLING_PROPERTY_IN_PAYLOAD',
    status: 'UPSTREAM_ROOT' as const,
    evidence: 'every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); '
      + 'no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted '
      + 'on the sibling clarification.',
    remediation: 'single-fact verifier payload: supply exactly the target OwedFact, its own '
      + 'clarification and its own evidence span',
    confidence: 'HIGH' as const,
  }])),
  'AC-22.FACT1.L': {
    defect: 'the verifier evaluated the unlocked air valve and the incomplete procedure alongside '
      + 'the target fact, and did not detect that the projected fact had substituted for the frozen '
      + 'property',
    firstStage: 'VERIFIER_INPUT_COMPOSITION', family: 'RC-B', subMode: 'SIBLING_CANDIDATE_IN_PAYLOAD',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'AC-22 has one admitted fact and one clarification but three hazard candidates; the '
      + 'two properties named in the adjudicator reason are exactly the other two candidates',
    remediation: 'RC-B payload isolation covers the drift; the missed substitution is an RC-A '
      + 'consequence and is not repaired by isolation alone',
    confidence: 'MEDIUM',
  },

  // ---- RC-C: essential qualifier / conjunct lost at generation
  'AC-10.FACT1.C': {
    defect: 'the before-and-after proving sequence is absent from the declared property; it appears '
      + 'only in the clarification, which the projection does not carry',
    firstStage: 'FIRST_PASS_FIELD_ROUTING', family: 'RC-C', subMode: 'QUALIFIER_IN_WRONG_FIELD',
    status: 'UPSTREAM_ROOT',
    evidence: 'q1 asks whether the proving unit was used "before and after that test"; d1.missingFact '
      + 'and branchA say only "using a proving unit (perhaps since put away)". The projected OwedFact '
      + 'carries neither missingFact nor the clarification, so the verifier never saw the qualifier.',
    remediation: 'require every essential qualifier present anywhere in the declaration set to '
      + 'appear in the fields the projection carries; this is the D15 loss shape and is what axis Q '
      + 'measures',
    confidence: 'HIGH',
  },
  'AC-10.FACT1.E': {
    defect: 'branchA does not preserve that the indicator was proved both before and after the test, '
      + 'so the positive branch underspecifies the verification state',
    firstStage: 'FIRST_PASS_FIELD_ROUTING', family: 'RC-C', subMode: 'QUALIFIER_IN_WRONG_FIELD',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'same declaration d1', remediation: 'resolved by the RC-C fix', confidence: 'HIGH',
  },
  'AC-18.FACT1.F': {
    defect: 'decisionIfA concludes work may continue from a rating for a person alone, while the '
      + 'frozen fact also requires capacity for the materials being carried',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-C', subMode: 'MISSING_CONJUNCT',
    status: 'UPSTREAM_ROOT',
    evidence: 'D1.missingFact, branchA and Q1 all say "with a person on them"; the materials load '
      + 'conjunct is absent from every field',
    remediation: 'conjunct-completeness: where the frozen property is conjunctive, every conjunct '
      + 'must survive into the declared property, both branches and the clarification',
    confidence: 'HIGH',
  },
  'AC-18.FACT1.M': {
    defect: 'the clarification omits the materials load, so an answer can leave the actual-load '
      + 'property unresolved',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-C', subMode: 'MISSING_CONJUNCT',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'Q1 asks about the 1.8 m span with a person only',
    remediation: 'resolved by the RC-C fix', confidence: 'HIGH',
  },

  // ---- RC-D: structured emission / unresolved-fact framing
  'AC-03.ROW.A': {
    defect: 'the pooled-liquid identity gap was recognised and asked about but never emitted as a '
      + 'structured declaration',
    firstStage: 'FIRST_PASS_STRUCTURED_EMISSION', family: 'RC-D', subMode: 'RECOGNISED_NOT_EMITTED',
    status: 'UPSTREAM_ROOT',
    evidence: 'CAND-SPILL is INSUFFICIENT_EVIDENCE and names the identity question; CLAR-SPILL-ID '
      + 'asks it exactly; unresolvedFactDeclarations contains only DECL-FAN-STATE. Recognition '
      + 'succeeded; emission did not.',
    remediation: 'emission completeness at the contract level -- an INSUFFICIENT_EVIDENCE candidate '
      + 'or a BLOCKING clarification that reaches no declaration is a structural defect the '
      + 'deterministic layer can DETECT AND REFUSE (never repair)',
    confidence: 'HIGH',
  },
  'AC-03.ROW.H': {
    defect: 'only the fan gap survived as a structured owed fact, so the two independent gaps were '
      + 'not preserved independently',
    firstStage: 'FIRST_PASS_STRUCTURED_EMISSION', family: 'RC-D', subMode: 'RECOGNISED_NOT_EMITTED',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'same emission gap as AC-03.ROW.A', remediation: 'resolved by the RC-D fix',
    confidence: 'HIGH',
  },
  'AC-23.ROW.A': {
    defect: 'the ladder base-slip property is decision-critical and unresolved but produced no '
      + 'structured declaration',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-D', subMode: 'UNKNOWN_ASSERTED_AS_ESTABLISHED',
    status: 'UPSTREAM_ROOT',
    evidence: 'all four AC-23 candidates are ACTIVE, none INSUFFICIENT_EVIDENCE; zero clarifications '
      + 'and zero declarations were produced. The base-slip condition was framed as an established '
      + 'active hazard rather than an open question, so the unresolved-fact path was never entered.',
    remediation: 'the first-pass instruction must separate "this hazard is present" from "this '
      + 'decision-critical property is unknown"; an ACTIVE hazard does not discharge an open '
      + 'property that still governs today\'s action',
    confidence: 'MEDIUM',
  },

  // ---- RC-E: over-declaration / false gap
  'AC-05.ROW.B': {
    defect: 'padlock ownership was declared although the fitter\'s exclusive key control is '
      + 'established and lock ownership is decision-neutral today',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-E', subMode: 'ESTABLISHED_TREATED_AS_OPEN',
    status: 'UPSTREAM_ROOT',
    evidence: 'decl-lock-ownership is the row\'s only declaration and is the frozen false gap',
    remediation: 'the precision half of the RC-A present-state rule: a property the text answers, '
      + 'or whose answers do not change today\'s action, is not an owed fact',
    confidence: 'HIGH',
  },
  'AC-05.ROW.I': {
    defect: 'an unnecessary owed fact was created on a row whose decision-critical state was '
      + 'established',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-E', subMode: 'ESTABLISHED_TREATED_AS_OPEN',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'same declaration', remediation: 'resolved by the RC-E fix', confidence: 'HIGH',
  },
  'AC-07.ROW.B': {
    defect: 'an open-panel sound-level fact was declared that the frozen truth does not require',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-E', subMode: 'ESTABLISHED_TREATED_AS_OPEN',
    status: 'UPSTREAM_ROOT',
    evidence: 'd1 (sound level) is the surplus declaration; d2 (normal panel position) is the '
      + 'legitimate one',
    remediation: 'same precision lever as AC-05', confidence: 'HIGH',
  },
  'AC-07.FACT1.F': {
    defect: 'decisionIfA generalises a limited sound-level measurement into a conclusion that no '
      + 'hearing-protection requirement is triggered',
    firstStage: 'FIRST_PASS_GENERATION', family: 'RC-E', subMode: 'DOWNSTREAM_OVERCLAIM',
    status: 'DOWNSTREAM_CONSEQUENCE',
    evidence: 'the F slot is bound to d1, the surplus declaration; the overclaim is in its '
      + 'decisionIfA',
    remediation: 'RC-E removes the surplus declaration; independently, a decision statement may not '
      + 'claim more than its branch establishes (the frozen prohibitedDecisionClaims boundary)',
    confidence: 'MEDIUM',
  },
};

// ================================================================ matrix

const gateOf = (id: string): string[] => failing.get(id)?.gates ?? [];
const rows = [...failing.keys()]
  .sort((a, b) => slots.findIndex(s => s.slotId === a) - slots.findIndex(s => s.slotId === b))
  .map(id => {
    const s = slotById.get(id);
    const a = ROOT_CAUSE_ANALYSIS[id];
    if (a === undefined) throw new Error(`§210A: no analysis authored for failing slot ${id}`);
    return {
      caseId: s.caseId,
      slotId: id,
      axis: `${s.axisId} ${s.axisName}`,
      gates: gateOf(id),
      DERIVED_verdict: s.verdict,
      DERIVED_productOwnerReason: s.reason,
      DERIVED_factKey: s.factKey,
      ANALYSIS_observedDefect: a.defect,
      ANALYSIS_firstStageWhereDefectAppears: a.firstStage,
      ANALYSIS_rootCauseFamily: a.family,
      ANALYSIS_subMode: a.subMode,
      ANALYSIS_status: a.status,
      ANALYSIS_evidence: a.evidence,
      ANALYSIS_candidateRemediation: a.remediation,
      ANALYSIS_confidence: a.confidence,
    };
  });

// ================================================================ token baseline

const legRows = (rows2: any[]) => rows2.filter(r => typeof r.inputTokens === 'number');
const summarise = (label: string, rs: any[]) => {
  const r = legRows(rs);
  if (r.length === 0) return { stage: label, calls: 0, measured: false };
  const inn = r.map(x => x.inputTokens).sort((a, b) => a - b);
  const out = r.map(x => x.outputTokens).sort((a, b) => a - b);
  const p95 = (v: number[]) => v[Math.min(v.length - 1, Math.round(0.95 * (v.length - 1)))];
  return {
    stage: label, calls: r.length, measured: true,
    inputTokensTotal: inn.reduce((a, b) => a + b, 0),
    inputTokensMedian: inn[Math.floor(inn.length / 2)],
    inputTokensP95: p95(inn),
    inputTokensMin: inn[0], inputTokensMax: inn[inn.length - 1],
    inputSpreadAcrossCohort: inn[inn.length - 1] - inn[0],
    outputTokensTotal: out.reduce((a, b) => a + b, 0),
    outputTokensMedian: out[Math.floor(out.length / 2)],
    costUsd: Number(r.reduce((a, b) => a + (b.costUsd ?? 0), 0).toFixed(6)),
  };
};

const fpLeg = ledger208.filter(r => r.leg === 'FIRST_PASS');
const govLeg = ledger208.filter(r => r.leg === 'GOVERNED_STAGE');
const baseline = {
  artifact: 'TOKEN_BASELINE_210A',
  pricingDerivedFromLedger: { inputUsdPerMTok: 2.0, outputUsdPerMTok: 10.0,
    note: 'solved from CALL-LEDGER-208 first-pass rows; reproduces every recorded costUsd exactly' },
  stages: [
    summarise('FIRST_PASS (§208, authoritative)', fpLeg),
    summarise('GOVERNED_STAGE (§208, authoritative)', govLeg),
    summarise('VERIFIER (§208B recovered, authoritative)', ledger208b),
    summarise('VERIFIER (§208 DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE — excluded from baseline)',
      ledger208.filter(r => r.leg === 'VERIFIER')),
  ],
  callsPerObservation: {
    firstPass: fpLeg.length / 24,
    verifier: ledger208b.length / 24,
    governed: govLeg.length / 24,
    note: 'the governed stage ran once across three governed cases: AC-23 and AC-24 admitted zero '
      + 'facts so there was nothing to bind. That is TBR-4 deterministic elision already working.',
  },
  callsPerAdmittedOwedFact: {
    admittedOwedFacts: projection.reduce((a, p) => a + p.admittedCount, 0),
    verifierCalls: ledger208b.length,
    ratio: ledger208b.length / projection.reduce((a, p) => a + p.admittedCount, 0),
  },
  deterministicallyElidedCalls: {
    verifierCallsNotMadeBecauseZeroAdmittedFacts:
      projection.filter(p => p.admittedCount === 0).map(p => p.caseId),
    governedCallsNotMadeBecauseZeroAdmittedFacts: ['AC-23', 'AC-24'],
  },
  staticPayloadReuse: {
    verifierDistinctSystemPromptIdentities: new Set(ledger208b.map(r => r.systemPromptIdentity)).size,
    verifierDistinctSchemaIdentities: new Set(ledger208b.map(r => r.schemaIdentity)).size,
    verifierDistinctWrapperIdentities: new Set(ledger208b.map(r => r.wrapperIdentity)).size,
    verifierDistinctUserPromptIdentities: new Set(ledger208b.map(r => r.userPromptIdentity)).size,
    firstPassDistinctTransmittedSchemaSha256:
      new Set(fpLeg.map(r => r.transmittedSchemaSha256)).size,
    firstPassDistinctGrammarIds: new Set(fpLeg.map(r => r.canonicalSchemaGrammarId)).size,
    firstPassSchemaBytesMedian: fpLeg.map(r => r.transmittedSchemaBytes).sort((a, b) => a - b)[12],
    firstPassBodyBytesMin: Math.min(...fpLeg.map(r => r.transmittedBodyBytes)),
    firstPassBodyBytesMax: Math.max(...fpLeg.map(r => r.transmittedBodyBytes)),
  },
  unavailableMeasurements: [
    'cached input tokens — the §208/§208B ledgers record no cache-read or cache-write token field, '
      + 'so no cached-token baseline exists and none is inferred',
    'per-component token attribution inside a single request — the ledgers record whole-request '
      + 'inputTokens only, so the static/dynamic split below is BOUNDED by the observed cohort '
      + 'spread rather than measured directly',
    'governed-stage token detail beyond the single executed call',
  ],
  generatedAt: new Date().toISOString(),
};

// ================================================================ write

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const write = (name: string, obj: unknown): string => {
  const p = join(OUT, name);
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
  return name;
};

const familyCounts: Record<string, number> = {};
for (const r of rows) familyCounts[r.ANALYSIS_rootCauseFamily] =
  (familyCounts[r.ANALYSIS_rootCauseFamily] ?? 0) + 1;

write('ROOT-CAUSE-MATRIX-210A.json', {
  artifact: 'ROOT_CAUSE_MATRIX_210A',
  providerCalls: 0,
  databaseOperations: 0,
  section209Reinterpreted: false,
  note: 'DERIVED_* fields are copied or counted from frozen evidence. ANALYSIS_* fields are the '
    + 'agent\'s reading of that evidence, downstream of the product owner\'s verdict, and carry an '
    + 'explicit confidence. No verdict was recomputed.',
  failingSlotCount: rows.length,
  familyCounts,
  sourcesRead: sources,
  rows,
});
write('TOKEN-BASELINE-210A.json', baseline);

console.log('================ §210A PACKAGE');
console.log(`  failing slots analysed : ${rows.length}`);
console.log(`  families               : ${JSON.stringify(familyCounts)}`);
console.log(`  output                 : ${OUT}`);
console.log('  provider calls: 0   database operations: 0');
