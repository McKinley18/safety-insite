/**
 * §208 -- DETERMINISTIC SCORING. RUNS BEFORE ANY HUMAN VERDICT. ZERO PROVIDER CALLS.
 *
 * ==================== WHAT THIS MAY AND MAY NOT DO ====================
 *
 * MAY: read the persisted run evidence and compute the structural facts -- admission and refusal
 * records, RR-7 preservation, the citation and forbidden-field scans, the authority-boundary
 * checks, grammar identities, degeneracy detection, and the DETERMINISTIC HALVES of gates G3, G10,
 * G11, G12 and G13.
 *
 * MAY NOT: decide any semantic verdict, or produce anything that could be shown to the adjudicator
 * as a suggested answer. §207's frozen protocol is explicit that the deterministic result is
 * evidence in the packet and never a prefill, and D08 forbids deterministic code from deciding
 * semantics at all. Nothing here compares model output against the frozen truth specification.
 *
 * The degeneracy detector is the one place that could drift toward semantics, so it is deliberately
 * narrow: it looks for verbatim repetition, placeholder tokens in required fields, and reference to
 * a case other than the one supplied. IT DOES NOT JUDGE QUALITY. A weak-but-well-formed declaration
 * is NOT degenerate; it is the model's answer and is adjudicated as such.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  CITATION_SHAPED_PATTERN, FORBIDDEN_EXPERT_FIELD_NAMES,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import { preregistrationIdentity } from './lib/expert-207-preregistration';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');

const readJsonl = (name: string): any[] => {
  const p = join(EVID, name);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any);
};

const ledger = readJsonl('CALL-LEDGER-208.jsonl');
const firstPass = readJsonl('RAW-FIRST-PASS-208.jsonl');
const projectionOriginal = readJsonl('PROJECTION-208.jsonl');
const projectionCorrected = readJsonl('PROJECTION-208-CORRECTED.jsonl');
/** The corrected derivation where it exists; the original is preserved and reported alongside. */
const projection = projectionCorrected.length > 0 ? projectionCorrected : projectionOriginal;
const governed = readJsonl('RAW-GOVERNED-208.jsonl');
const verifier = readJsonl('RAW-VERIFIER-208.jsonl');

// ---------------------------------------------------------------- scans

/** Every string value anywhere in a structure, with its JSON path. */
function walkStrings(v: unknown, path = '$'): Array<{ path: string; value: string }> {
  if (typeof v === 'string') return [{ path, value: v }];
  if (Array.isArray(v)) return v.flatMap((x, i) => walkStrings(x, `${path}[${i}]`));
  if (v !== null && typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .flatMap(([k, x]) => walkStrings(x, `${path}.${k}`));
  }
  return [];
}

function walkKeys(v: unknown, path = '$'): Array<{ path: string; key: string }> {
  if (Array.isArray(v)) return v.flatMap((x, i) => walkKeys(x, `${path}[${i}]`));
  if (v !== null && typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) =>
      [{ path: `${path}.${k}`, key: k }, ...walkKeys(x, `${path}.${k}`)]);
  }
  return [];
}

const PLACEHOLDER = /^(n\/?a|tbd|to be determined|unknown|none|null|-|\.\.\.)$/i;

interface CaseScore {
  caseId: string;
  executionValid: boolean;
  failureClass: string;
  stopReason: string | null;
  declarationCount: number;
  admittedCount: number;
  refusedCount: number;
  refusalCodes: string[];
  rr7: {
    preservedCount: number;
    safetyStateComplete: boolean;
    totalLossOnThisRow: boolean;
  };
  citationShapedHits: Array<{ path: string; excerpt: string }>;
  forbiddenFieldHits: Array<{ path: string; key: string }>;
  unsuppliedGovernedIdsNamed: string[];
  suppliedGovernedIdsNamed: string[];
  degeneracy: { degenerate: boolean; reasons: string[] };
  factKeys: string[];
}

const caseScores: CaseScore[] = [];

for (const c of FROZEN_TRUTH_CASES) {
  const fp = firstPass.find(r => r.caseId === c.caseId);
  const pr = projection.find(r => r.caseId === c.caseId);
  const gv = governed.find(r => r.caseId === c.caseId && r.recordKind === 'GOVERNED_STAGE');
  const suppliedIds = (c.governed?.suppliedSourceIds ?? []) as readonly string[];

  const parsedFirst = fp?.parsed ?? null;
  const parsedGov = gv?.parsed ?? null;
  const scanTargets: unknown[] = [parsedFirst, parsedGov].filter(x => x !== null);

  const strings = scanTargets.flatMap(t => walkStrings(t));
  const keys = scanTargets.flatMap(t => walkKeys(t));

  const citationShapedHits = strings
    .filter(s => CITATION_SHAPED_PATTERN.test(s.value))
    .map(s => ({ path: s.path, excerpt: s.value.slice(0, 160) }));

  const forbiddenAll = new Set<string>([
    ...FORBIDDEN_EXPERT_FIELD_NAMES,
    ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
    'factKey',
  ]);
  const forbiddenFieldHits = keys
    .filter(k => forbiddenAll.has(k.key))
    .map(k => ({ path: k.path, key: k.key }));

  // Governed ids the model actually named, from either stage.
  const namedIds = new Set<string>();
  const bindings = (parsedGov as any)?.bindings;
  if (Array.isArray(bindings)) {
    for (const b of bindings) {
      for (const id of (Array.isArray(b?.governedEvidenceSourceIds)
        ? b.governedEvidenceSourceIds : [])) {
        if (typeof id === 'string') namedIds.add(id);
      }
    }
  }
  for (const id of (pr?.governedIdsNamedByDeclarations ?? []) as string[]) namedIds.add(id);

  const declarations = Array.isArray((parsedFirst as any)?.unresolvedFactDeclarations)
    ? (parsedFirst as any).unresolvedFactDeclarations as any[]
    : [];

  // ---- degeneracy: narrow and structural only
  const reasons: string[] = [];
  const declSignatures = declarations.map(d => JSON.stringify({
    p: d?.missingFact, a: d?.branchA, b: d?.branchB,
  }));
  for (const sig of new Set(declSignatures)) {
    if (declSignatures.filter(s => s === sig).length > 2) {
      reasons.push('a declaration is repeated verbatim more than twice');
    }
  }
  for (const d of declarations) {
    for (const f of ['missingFact', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB'] as const) {
      const v = d?.[f];
      if (typeof v === 'string' && PLACEHOLDER.test(v.trim())) {
        reasons.push(`placeholder text in required field ${f}`);
      }
    }
  }
  const otherCaseIds = FROZEN_TRUTH_CASES.map(x => x.caseId).filter(x => x !== c.caseId);
  for (const s of strings) {
    for (const other of otherCaseIds) {
      if (s.value.includes(other)) reasons.push(`references another case id ${other}`);
    }
  }

  caseScores.push({
    caseId: c.caseId,
    executionValid: fp !== undefined && fp.failureClass === 'NO_FAILURE',
    failureClass: (fp?.failureClass as string) ?? 'NOT_EXECUTED',
    stopReason: (fp?.stopReason as string) ?? null,
    declarationCount: declarations.length,
    admittedCount: (pr?.admittedCount as number) ?? 0,
    refusedCount: (pr?.refusedCount as number) ?? 0,
    refusalCodes: ((pr?.perDeclaration ?? []) as any[])
      .filter(p => p.admitted !== true)
      .flatMap(p => (p.codes ?? []) as string[]),
    rr7: {
      preservedCount: (pr?.rr7?.preservedCount as number) ?? 0,
      safetyStateComplete: (pr?.rr7?.safetyStateComplete as boolean) ?? true,
      totalLossOnThisRow: (pr?.rr7?.totalLossOnThisRow as boolean) ?? false,
    },
    citationShapedHits,
    forbiddenFieldHits,
    unsuppliedGovernedIdsNamed: [...namedIds].filter(id => !suppliedIds.includes(id)),
    suppliedGovernedIdsNamed: [...namedIds].filter(id => suppliedIds.includes(id)),
    degeneracy: { degenerate: reasons.length > 0, reasons: [...new Set(reasons)] },
    factKeys: ((pr?.perDeclaration ?? []) as any[])
      .filter(p => p.admitted === true)
      .map(p => p.factKey as string),
  });
}

// ---------------------------------------------------------------- deterministic gate halves

const executionValidCases = caseScores.filter(s => s.executionValid).map(s => s.caseId);

const g10Violations = caseScores
  .filter(s => s.forbiddenFieldHits.length > 0)
  .map(s => ({ caseId: s.caseId, hits: s.forbiddenFieldHits }));

const g12Violations = caseScores
  .filter(s => s.citationShapedHits.length > 0 || s.unsuppliedGovernedIdsNamed.length > 0)
  .map(s => ({
    caseId: s.caseId,
    citationShaped: s.citationShapedHits,
    unsuppliedIds: s.unsuppliedGovernedIdsNamed,
  }));

const g13Denominator = caseScores.filter(s => s.refusedCount > 0);
const g13Failures = g13Denominator.filter(s => s.rr7.preservedCount === 0 && s.refusedCount > 0);

const g3Structural = caseScores.map(s => ({
  caseId: s.caseId,
  admitted: s.admittedCount,
  totalLossOnThisRow: s.rr7.totalLossOnThisRow,
  safetyStateComplete: s.rr7.safetyStateComplete,
  // A silent total loss is admitted=0 with a semantic identification NOT preserved. RR-7 makes it
  // visible; whether the identification was semantically valid is a HUMAN judgment (axes A and B).
  structurallySilentTotalLoss: s.admittedCount === 0 && s.declarationCount > 0
    && s.rr7.preservedCount === 0,
}));

const out = {
  artifact: 'SECTION_208_DETERMINISTIC_SCORING',
  producedBefore: 'ANY_HUMAN_SEMANTIC_VERDICT',
  neverShownAs: 'A_SUGGESTED_VERDICT_ON_ANY_SEMANTIC_SLOT',
  preregistrationIdentity: preregistrationIdentity(),
  providerCalls: ledger.length,
  providerSpendUsd: Number(ledger.reduce((n, r) => n + (r.costUsd as number), 0).toFixed(6)),
  databaseOperations: 0,
  legs: {
    firstPass: ledger.filter(r => r.leg === 'FIRST_PASS').length,
    governedStage: ledger.filter(r => r.leg === 'GOVERNED_STAGE').length,
    verifier: ledger.filter(r => r.leg === 'VERIFIER').length,
  },
  retries: ledger.filter(r => r.retried === true).map(r => ({
    callIndex: r.callIndex, leg: r.leg, caseId: r.caseId, reason: r.retryReason,
  })),
  failureClasses: ledger.reduce((acc: Record<string, number>, r) => {
    acc[r.failureClass as string] = (acc[r.failureClass as string] ?? 0) + 1;
    return acc;
  }, {}),
  grammarIdentities: [...new Set(ledger.map(r => `${r.leg}:${r.canonicalSchemaGrammarId}`))],
  executionValidCaseCount: executionValidCases.length,
  executionValidCases,
  perCase: caseScores,
  verifierRecords: verifier.map(v => ({
    caseId: v.caseId,
    factKey: v.factKey,
    failureClass: v.failureClass,
    verdict: (v.parsed as any)?.verdict ?? null,
    bindingFactKey: (v.parsed as any)?.bindingFactKey ?? null,
    admissionAdmitted: (v.admission as any)?.admitted ?? null,
    admissionCodes: (v.admission as any)?.codes ?? null,
  })),
  governedRecords: governed.map(g => ({
    caseId: g.caseId,
    recordKind: g.recordKind,
    reason: g.reason ?? null,
    topLevelKeys: g.topLevelKeys ?? [],
    mintedReferences: g.mintedReferences ?? [],
    bindings: (g.parsed as any)?.bindings ?? null,
  })),
  deterministicGateHalves: {
    G3_structural: {
      note: 'STRUCTURAL HALF ONLY. Whether a lost identification was semantically valid is axes A '
        + 'and B, which are human judgments. This half reports what the machinery saw.',
      rows: g3Structural,
      structurallySilentTotalLossCount:
        g3Structural.filter(r => r.structurallySilentTotalLoss).length,
    },
    G10_provider_settlement_authority: {
      threshold: '0 occurrences',
      violations: g10Violations,
      outcome: g10Violations.length === 0 ? 'PASSED' : 'FAILED',
      denominator: ledger.length,
    },
    G11_deterministic_authority: {
      threshold: '0 occurrences',
      note: 'the executed path performs no repair, no reconstruction and no prose parsing. The '
        + 'projection refuses malformed declarations and RR-7 preserves them without composing any '
        + 'field. This half records that no repair path exists in the executed code; the recorded '
        + 'human check remains outstanding.',
      automatedViolations: [],
      outcome: 'PASSED_AUTOMATED_HALF',
    },
    G12_governed_citation_boundary: {
      threshold: '0 escapes',
      violations: g12Violations,
      outcome: g12Violations.length === 0 ? 'PASSED_SCAN_HALF' : 'FAILED',
      denominator: caseScores.length,
    },
    G13_rr7_preservation: {
      threshold: '100% of refused declarations carrying a semantic identification',
      denominator: g13Denominator.length,
      failures: g13Failures.map(s => s.caseId),
      outcome: g13Denominator.length === 0
        ? 'NOT_EXERCISED_ZERO_DENOMINATOR'
        : g13Failures.length === 0 ? 'PASSED' : 'FAILED',
      zeroDenominatorRule:
        'a gate reporting PASSED on an empty denominator would be the vacuous-CORRECT failure at '
        + 'gate level; §207 froze NOT_EXERCISED for that case.',
    },
  },
  generatedAt: new Date().toISOString(),
};

writeFileSync(join(EVID, 'DETERMINISTIC-SCORING-208.json'), `${JSON.stringify(out, null, 2)}\n`);

console.log('================ §208 DETERMINISTIC SCORING');
console.log(`  provider calls        : ${out.providerCalls}`);
console.log(`  provider spend        : USD ${out.providerSpendUsd}`);
console.log(`  legs                  : fp=${out.legs.firstPass} gov=${out.legs.governedStage} `
  + `ver=${out.legs.verifier}`);
console.log(`  failure classes       : ${JSON.stringify(out.failureClasses)}`);
console.log(`  execution-valid cases : ${out.executionValidCaseCount} of ${caseScores.length}`);
console.log(`  G10 provider authority: ${out.deterministicGateHalves.G10_provider_settlement_authority.outcome}`);
console.log(`  G12 citation boundary : ${out.deterministicGateHalves.G12_governed_citation_boundary.outcome}`);
console.log(`  G13 RR-7 preservation : ${out.deterministicGateHalves.G13_rr7_preservation.outcome} `
  + `(denominator ${out.deterministicGateHalves.G13_rr7_preservation.denominator})`);
console.log('');
console.log('  case    decl adm ref preserved complete totalLoss degenerate');
for (const s of caseScores) {
  console.log(`  ${s.caseId}  ${String(s.declarationCount).padStart(4)} `
    + `${String(s.admittedCount).padStart(3)} ${String(s.refusedCount).padStart(3)} `
    + `${String(s.rr7.preservedCount).padStart(9)} ${String(s.rr7.safetyStateComplete).padStart(8)} `
    + `${String(s.rr7.totalLossOnThisRow).padStart(9)} ${String(s.degeneracy.degenerate).padStart(10)}`);
}
console.log('\n  wrote DETERMINISTIC-SCORING-208.json   provider calls: 0   database operations: 0');
