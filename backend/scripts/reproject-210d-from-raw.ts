/**
 * §210D -- CORRECTED PROJECTION, RE-DERIVED FROM THE PERSISTED RAW OUTPUT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * WHY THIS FILE EXISTS.
 *
 * `execute-210d-confirmation.ts` read the clarification back-reference as `relatesToDeclarationId`.
 * The contract's field is `answersUnresolvedFactDeclarationId`. The executor therefore recorded
 * `PROPERTY_ABSENT` for every clarification on every case, which is an artefact of the projection
 * and says nothing about what the model wrote. Recorded as EXECUTOR_DEFECT_1.
 *
 * The defect is in a DERIVED view only. It never touched a request body, so no case was executed
 * with the wrong content and no case needs re-drawing. The raw provider responses were persisted
 * before any derivation and are intact, so the correct values are recoverable by reading them.
 *
 * Following the §208 precedent (`PROJECTION-208-CORRECTED.jsonl`), the original projection is
 * PRESERVED and never deleted; this writes a corrected file beside it. Adjudication reads the
 * corrected file. Nothing here repairs, infers or rewrites model output: every value is copied
 * verbatim from the persisted raw, and a field the model did not write is recorded as
 * FIELD_NOT_AUTHORED_BY_MODEL rather than filled in.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  CLARIFICATION_DECLARATION_BACKREF_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import { CONFIRMATION_STIMULI } from './lib/section-210d-confirmation-preregistration';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-210d-hosted-confirmation-2026-09-09');
const RAW = join(EVID, 'RAW-FIRST-PASS-210D.jsonl');
const ORIGINAL = join(EVID, 'PROJECTION-210D.jsonl');
const CORRECTED = join(EVID, 'PROJECTION-210D-CORRECTED.jsonl');

if (!existsSync(RAW)) throw new Error('§210D: raw evidence not found; nothing to re-derive from');
if (!existsSync(ORIGINAL)) throw new Error('§210D: original projection missing; refusing to run');

console.log('================ §210D CORRECTED PROJECTION (zero provider calls)');
console.log(`  backref field    : ${CLARIFICATION_DECLARATION_BACKREF_FIELD}`);
console.log('  original preserved, never deleted');

const NOT_AUTHORED = 'FIELD_NOT_AUTHORED_BY_MODEL' as const;
const lines: string[] = [];

for (const line of readFileSync(RAW, 'utf8').split('\n').filter(Boolean)) {
  const r = JSON.parse(line) as any;
  const parsed = (r.parsed ?? {}) as Record<string, unknown>;
  const frozen = CONFIRMATION_STIMULI.find(s => s.caseId === r.caseId);
  const declarations = Array.isArray(parsed.unresolvedFactDeclarations)
    ? parsed.unresolvedFactDeclarations as Record<string, unknown>[] : [];
  const clarifications = Array.isArray(parsed.decisionCriticalClarifications)
    ? parsed.decisionCriticalClarifications as Record<string, unknown>[] : [];

  const declarationIds = declarations.map(d => d.declarationId ?? null);

  const out = {
    caseId: r.caseId,
    reDerivedFrom: 'RAW-FIRST-PASS-210D.jsonl',
    executorDefectCorrected: 'EXECUTOR_DEFECT_1 -- clarification back-reference read under the '
      + 'wrong field name in the original projection',
    expectedDeclarationCount: frozen?.expectedDeclarationCount ?? null,
    observedDeclarationCount: declarations.length,
    failureClass: r.failureClass,
    stopReason: r.stopReason,
    declarationIds,
    declarations: declarations.map(d => ({
      declarationId: d.declarationId ?? NOT_AUTHORED,
      missingFact: d.missingFact ?? NOT_AUTHORED,
      observationSourceId: d.observationSourceId ?? NOT_AUTHORED,
      observationSpan: d.observationSpan ?? NOT_AUTHORED,
      notEstablishedBecause: d.notEstablishedBecause ?? NOT_AUTHORED,
      affectedDecision: d.affectedDecision ?? NOT_AUTHORED,
      branchA: d.branchA ?? NOT_AUTHORED,
      decisionIfA: d.decisionIfA ?? NOT_AUTHORED,
      branchB: d.branchB ?? NOT_AUTHORED,
      decisionIfB: d.decisionIfB ?? NOT_AUTHORED,
      whyNecessaryNow: d.whyNecessaryNow ?? NOT_AUTHORED,
    })),
    clarifications: clarifications.map(c => {
      const backref = c[CLARIFICATION_DECLARATION_BACKREF_FIELD];
      return {
        clarificationId: c.clarificationId ?? NOT_AUTHORED,
        question: c.question ?? NOT_AUTHORED,
        criticality: c.criticality ?? NOT_AUTHORED,
        affectedDecision: c.affectedDecision ?? NOT_AUTHORED,
        // The contract makes this back-reference OPTIONAL. Its absence is a real, reportable fact
        // about what the model authored, not a defect in this file.
        [CLARIFICATION_DECLARATION_BACKREF_FIELD]: backref ?? NOT_AUTHORED,
        backrefNamesAnEmittedDeclaration:
          backref === undefined || backref === null ? false : declarationIds.includes(backref),
      };
    }),
    hazardCandidates: Array.isArray(parsed.expertHazardCandidates)
      ? (parsed.expertHazardCandidates as Record<string, unknown>[]).map(h => ({
        hazardFamily: h.hazardFamily ?? NOT_AUTHORED,
        assertedConditionState: h.assertedConditionState ?? NOT_AUTHORED,
      }))
      : [],
  };
  lines.push(JSON.stringify(out));

  const bound = out.clarifications.filter(c => c.backrefNamesAnEmittedDeclaration).length;
  console.log(`  ${r.caseId}  decl=${declarations.length}(exp `
    + `${String(frozen?.expectedDeclarationCount)})  clarifications=${clarifications.length}  `
    + `bound to a declaration=${bound}`);
}

writeFileSync(CORRECTED, `${lines.join('\n')}\n`);
console.log(`\n  written: ${CORRECTED}`);
console.log('  ORIGINAL PRESERVED. NOTHING REPAIRED, INFERRED OR REWRITTEN.');
