/**
 * §252 -- HISTORICAL §243 STRUCTURAL REPLAY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * THIS IS NOT A CAPABILITY RESCORE. §243 stands at D HOLD RELEASE and nothing here revisits any
 * semantic judgement, any posture expectation or any driver-role expectation. The only question
 * asked is STRUCTURAL CONTAINMENT: given the exact bytes the provider returned in §243, does the
 * §252 admission path admit, refuse, or refuse-while-preserving, and does it ever invent meaning?
 *
 * CORRECT REFUSAL IS AN ACCEPTABLE OUTCOME. No §243 output is expected to become usable, and none is
 * repaired to make it so. The preserved outputs are the instrument here and are read, never rewritten.
 *
 * TWO PASSES, because they answer different questions.
 *
 *   CURRENT_CANDIDATE   each output admitted through the real production entry point as it stands
 *                       today. These bytes predate `roleJustification`, so wholesale refusal is
 *                       expected and says nothing about the admission layer on its own.
 *   CONFORMANCE_GATE    the verdict of the one component §252 adds, taken alone, against the §239
 *                       schema each output WAS ACTUALLY GENERATED WITH. This is the measurement that
 *                       isolates §252 from the later contract change, and it is cross-tabulated
 *                       against what the §243 pipeline concluded on the same bytes.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  conformsToContract252, closeObjectNodes252,
} from '../src/hazlenz/expert-hazlenz/contract/expert-252-structural-admission';
import { admitThroughProductionPath } from './lib/expert-252-replay-path';
import { normalizeExpertToolOutput235 } from '../src/hazlenz/expert-hazlenz/contract/expert-235-wire-normalization';
import { buildExpert247WireSchema } from '../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import { governedBindingFor } from '../src/hazlenz/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import { assembleFirstPass243 } from './lib/expert-243-assembly';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'verification',
  'expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12', 'RAW-243-FIRST-PASS.jsonl');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const TOOL = 'emit_expert_analysis';

interface Raw243 { caseId: string; stopReason: string | null; raw: any }

/** The provider's own tool input, taken from the persisted response. Never reshaped. */
function toolInputOf(rec: Raw243): { present: boolean; input: unknown; blocks: number } {
  const content = Array.isArray(rec.raw?.content) ? rec.raw.content : [];
  const blocks = content.filter((b: any) => b?.type === 'tool_use' && b?.name === TOOL);
  return { present: blocks.length > 0, input: blocks[0]?.input ?? null, blocks: blocks.length };
}

async function main(): Promise<void> {
  const records: Raw243[] = readFileSync(SRC, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const assembly = assembleFirstPass243();

  const rows: any[] = [];
  for (const rec of records) {
    const a = assembly.find(x => x.caseId === rec.caseId);
    if (a === undefined) throw new Error(`§252 REPLAY ABORT: no frozen assembly for ${rec.caseId}`);
    const observation = {
      sourceId: a.observationSourceId,
      text: a.input.authoritativeSources[0].text,
    };
    const governedSourceIds = a.governedRecords.map(g => g.sourceId);
    const { present, input, blocks } = toolInputOf(rec);

    /**
     * The current candidate, admitted through the REAL production entry point. The entry point
     * builds the §247 wire schema itself from the frozen input, so this pass is exactly what the
     * product would do with these bytes today.
     */
    const { result: currentCandidate } = await admitThroughProductionPath({
      input: a.input, observation, governedRecords: a.governedRecords, toolInput: input,
    });

    /**
     * THE NEW COMPONENT, ON ITS OWN. Everything else in the admission path existed before §252 and
     * behaved in §243 exactly as it behaves now. Only the whole-output conformance gate is new, so
     * its verdict is taken separately and cross-tabulated against what the §243 run concluded. That
     * is the one comparison in this file that measures §252 rather than the later contract change.
     */
    const norm = normalizeExpertToolOutput235(input, a.wireSchema);
    const gateOnly = norm.analysis === null
      ? [{ path: '$', code: 'OUTPUT_NOT_AN_OBJECT', reason: 'not an object' }]
      : conformsToContract252(norm.analysis, closeObjectNodes252(a.wireSchema));

    rows.push({
      caseId: rec.caseId,
      conformanceGateOnly: {
        admits: gateOnly.length === 0,
        violationCount: gateOnly.length,
        codes: [...new Set(gateOnly.map(v => v.code))],
        firstThree: gateOnly.slice(0, 3).map(v => `${v.path}: ${v.code}`),
      },
      stopReason: rec.stopReason,
      toolUseBlocks: blocks,
      toolInputPresent: present,
      toolInputSha: sha(JSON.stringify(input ?? null)),
      currentCandidate: {
        outcome: currentCandidate.admission,
        status: currentCandidate.status,
        admitted: currentCandidate.status !== 'FIRST_PASS_REFUSED',
        conformanceCodes: [...new Set(currentCandidate.conformanceViolations.map(v => v.code))],
        conformanceViolationCount: currentCandidate.conformanceViolations.length,
        postureCodes: currentCandidate.postureRefusalCodes,
        roleJustificationCodes: currentCandidate.roleJustificationCodes,
        declarationRefusals: currentCandidate.declarationRefusals.length,
        admittedFacts: currentCandidate.admittedFacts.length,
        preservedUnresolved: currentCandidate.admission === 'PRESERVE_UNRESOLVED' ? 1 : 0,
        semanticInventions: currentCandidate.semanticInventions,
      },
    });
  }

  const t = rows.map(r => r.currentCandidate);
  const summary = {
    totalOutputs: rows.length,
    fullyAdmitted: t.filter(x => x.admitted).length,
    refused: t.filter(x => !x.admitted).length,
    unresolvedTruthPreserved: t.filter(x => x.preservedUnresolved > 0).length,
    preservedRecordTotal: t.reduce((a, x) => a + x.preservedUnresolved, 0),
    unsafeMalformedOutputAdmitted: 0,
    semanticInventionEvents: t.reduce((a, x) => a + x.semanticInventions.length, 0),
    conformanceGateAdmits: rows.filter(r => r.conformanceGateOnly.admits).length,
  };

  /**
   * UNSAFE ADMISSION, defined mechanically rather than by inspection: an output that the §243 run
   * itself refused, and that the §252 path now ADMITS. If the new path admitted something the old
   * one refused on structural grounds, malformed output escaped.
   */
  const section243Refused = new Set(['G1', 'G2', 'G4', 'G8', 'C1', 'C3', 'C4', 'C6', 'C7', 'C8',
    'M2', 'M4', 'M5', 'M6']);
  const escaped = rows.filter(r => section243Refused.has(r.caseId) && r.currentCandidate.admitted);
  summary.unsafeMalformedOutputAdmitted = escaped.length;

  const gateAdmits = new Set(rows.filter(r => r.conformanceGateOnly.admits).map(r => r.caseId));
  const section243Admitted = rows.map(r => r.caseId).filter(c => !section243Refused.has(c));
  const conformanceGateCrossTab = {
    note: 'the conformance gate is the only component §252 adds. This compares its verdict alone '
      + 'against what the §243 pipeline concluded on the same bytes.',
    section243AdmittedAndGateAdmits: section243Admitted.filter(c => gateAdmits.has(c)),
    section243AdmittedButGateRefuses: section243Admitted.filter(c => !gateAdmits.has(c)),
    section243RefusedAndGateRefuses: [...section243Refused].filter(c => !gateAdmits.has(c)).sort(),
    section243RefusedButGateAdmits: [...section243Refused].filter(c => gateAdmits.has(c)).sort(),
    interpretation: 'a case in "section243RefusedButGateAdmits" is not an escape: those outputs were '
      + 'refused by the SEMANTIC-COHERENCE checks, which the gate does not duplicate and which still '
      + 'run and still refuse. The gate is an addition in front of them, never a replacement.',
  };

  const doc = {
    section: '252', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    conformanceGateCrossTab,
    isCapabilityRescore: false,
    measures: 'STRUCTURAL CONTAINMENT ONLY',
    source: 'verification/expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12/'
      + 'RAW-243-FIRST-PASS.jsonl, read and never rewritten',
    section243OutputsRefusedByTheSection243Run: [...section243Refused].sort(),
    escapedCaseIds: escaped.map(r => r.caseId),
    summary,
    rows,
  };
  writeFileSync(join(OUT, 'SECTION-252-SECTION243-STRUCTURAL-REPLAY.json'), JSON.stringify(doc, null, 2));

  console.log('case  currentCandidate                       §243run  gateOnly');
  for (const r of rows) {
    const x = r.currentCandidate;
    console.log(`${r.caseId.padEnd(5)} ${x.outcome.padEnd(19)} conf=${String(x.conformanceViolationCount).padStart(3)} `
      + `posture=${String(x.postureCodes.length).padStart(2)} decl=${String(x.declarationRefusals).padStart(2)} `
      + `pres=${String(x.preservedUnresolved).padStart(2)} inv=${x.semanticInventions.length}  `
      + `${section243Refused.has(r.caseId) ? 'REFUSED' : 'admitted'}  `
      + `${r.conformanceGateOnly.admits ? 'gate-admits' : 'gate-refuses'}`);
  }
  console.log(`\ntotal=${summary.totalOutputs} admitted=${summary.fullyAdmitted} `
    + `refused=${summary.refused} preserved=${summary.unresolvedTruthPreserved} `
    + `unsafeAdmitted=${summary.unsafeMalformedOutputAdmitted} `
    + `inventions=${summary.semanticInventionEvents}`);
  if (summary.unsafeMalformedOutputAdmitted !== 0 || summary.semanticInventionEvents !== 0) {
    process.exitCode = 1;
  }
}
if (require.main === module) void main();
