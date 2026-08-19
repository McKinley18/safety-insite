// Permanent regression invariants for the 2026-08-18 "inspection-level regulatory context +
// HazLenz autonomy" closure. Covers the 14 invariants required by that phase (Section P):
//
//   1. inspection regulatory context persists (entity column + migration + DTO validation)
//   2. findings inherit inspection regulatory context (controller override -> every finding)
//   3. confirmed General Industry excludes inappropriate Construction-only matches
//   4. confirmed Construction excludes inappropriate General-Industry-only matches
//   5. MSHA does not leak OSHA authority as governing regulation
//   6. unknown jurisdiction does not produce the old zero-candidate failure
//   7. unknown jurisdiction does not create false regulatory certainty
//   8. jurisdiction clarification is not repeatedly asked after inspection context is established
//   9. clarification history survives multiple rounds
//  10. Finding A's clarification answer cannot contaminate Finding B
//  11. manually entered eligible findings receive standards evaluation
//  12. clear/high-evidence findings can produce useful analysis without unnecessary blocking clarification
//  13. genuine ambiguity still triggers appropriate targeted clarification
//  14. standards remain finding-scoped through UI/persistence/report (data-shape level)
//
// Everything here runs against the real production functions (buildEvidenceFacts, evaluate via
// applyEvidenceFoundation/applyFindingScopedStandards, MultiHazardDecompositionService, the
// classify controller's inspection-context override) with no mocks of the reasoning path. The
// only stub is an in-memory InspectionService (returns a fixed persisted inspection) so the
// controller's authoritative-inheritance mechanism can be exercised without a database.
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { getMetadataArgsStorage } from 'typeorm';
import { applyEvidenceFoundation, applyFindingScopedStandards } from '../evidence/evidence-foundation';
import { buildEvidenceFacts, inferJurisdictionFromText } from '../evidence/shared-evidence-facts';
import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import { SafescopeV2Controller } from '../safescope-v2.controller';
import { Inspection, INSPECTION_REGULATORY_CONTEXTS, regulatoryContextProvenance } from '../../inspection/inspection.entity';
import { CreateInspectionDto, UpdateInspectionDto } from '../../inspection/dto/inspection.dto';

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) console.log(`PASS ${name}`);
  else { failures++; console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail).slice(0, 600) : ''); }
}

const decomp = new MultiHazardDecompositionService();
const pending: Promise<void>[] = [];
function return_(fn: () => Promise<void>) { pending.push(fn()); }

/** Runs the same pipeline order the controller uses for the parts under test. */
function analyze(text: string, request: Record<string, unknown> = {}) {
  const decomposition = decomp.decompose(text);
  const result: any = { multiHazardDecomposition: decomposition, hazards: [] };
  const req: any = { text, ...request };
  applyFindingScopedStandards(applyEvidenceFoundation(result, req), req);
  return result;
}
const decisions = (r: any) => (r.applicabilityDecisions || []) as any[];
const questions = (r: any) => (r.clarificationQuestions || []) as any[];
const hazards = (r: any) => (r.multiHazardDecomposition?.hazards || []) as any[];
const cands = (h: any) => (h.standardCandidates || []) as any[];

// ---------------------------------------------------------------- 1. persistence surface
{
  const column = getMetadataArgsStorage().columns.find(c => c.target === Inspection && c.propertyName === 'regulatoryContext');
  check('1a Inspection entity declares a persisted regulatoryContext column (varchar, default unknown)',
    !!column && column.options.type === 'varchar' && column.options.default === 'unknown', column?.options);
  const migration = fs.readdirSync(path.join(__dirname, '../../database/migrations')).find(f => /InspectionRegulatoryContext/.test(f));
  check('1b A migration adds inspection.regulatoryContext', !!migration, migration);
  const good = plainToInstance(CreateInspectionDto, { siteId: '3f2a4b6c-1111-4222-8333-444455556666', title: 'Full Inspection', regulatoryContext: 'osha-construction' });
  const bad = plainToInstance(CreateInspectionDto, { siteId: '3f2a4b6c-1111-4222-8333-444455556666', title: 'Full Inspection', regulatoryContext: 'nonsense' });
  check('1c CreateInspectionDto accepts every supported context and rejects an unknown value',
    validateSync(good).length === 0 && validateSync(bad).length > 0 && INSPECTION_REGULATORY_CONTEXTS.length === 4);
  const upd = plainToInstance(UpdateInspectionDto, { version: 1, regulatoryContext: 'msha' });
  check('1d UpdateInspectionDto accepts a regulatoryContext change', validateSync(upd).length === 0);
  check('1e provenance is derived honestly: unknown -> UNKNOWN, any regime -> USER_CONFIRMED',
    regulatoryContextProvenance('unknown') === 'UNKNOWN' && regulatoryContextProvenance('msha') === 'USER_CONFIRMED' && regulatoryContextProvenance(undefined) === 'UNKNOWN');
}

// ---------------------------------------------------------------- 2. inheritance mechanism
{
  const fakeInspections: any = { findAccessible: async () => ({ id: 'insp-1', regulatoryContext: 'osha-construction' }) };
  const controller = new SafescopeV2Controller({} as any, fakeInspections);
  const body: any = { text: 'Worker exposed to an unprotected roof edge 18 feet up with no guardrail.', inspectionId: '3f2a4b6c-1111-4222-8333-444455556666',
    scopes: ['all'], structuredObservation: { jurisdiction: 'unknown' } };
  return_(async () => {
    await (controller as any).applyInspectionRegulatoryContext(body, { userId: 'u1' });
    check('2a Controller applies the persisted inspection context over whatever the client sent (jurisdiction "unknown", scopes all)',
      body.structuredObservation.jurisdiction === 'osha-construction' && JSON.stringify(body.scopes) === JSON.stringify(['osha_construction']) &&
      body.regulatoryContext?.provenance === 'USER_CONFIRMED' && body.regulatoryContext?.source === 'inspection', body);
    const text = 'Worker is exposed to an unprotected roof edge 18 feet above the lower level with no guardrail. Separately, an extension cord has exposed copper conductors and remains energized.';
    const req = { text, ...body, text2: undefined };
    const r = analyze(text, req);
    const facts = hazards(r).map((h: any) => ({ domain: h.domainId, cands: cands(h).map((c: any) => [c.citation, c.jurisdictionProvenance]) }));
    check('2b Every decomposed finding inherits the inspection context (all candidates evaluated under USER_CONFIRMED construction; no 1910 leakage)',
      hazards(r).length >= 2 && hazards(r).every((h: any) => cands(h).every((c: any) => c.jurisdictionProvenance === 'USER_CONFIRMED' && !/29 CFR 1910/.test(c.citation))), facts);
    check('2c Response carries regulatoryContext {value, provenance USER_CONFIRMED, source inspection}',
      r.regulatoryContext?.value === 'osha-construction' && r.regulatoryContext?.provenance === 'USER_CONFIRMED' && r.regulatoryContext?.source === 'inspection', r.regulatoryContext);
    const clientClaim: any = { text: 'x', regulatoryContext: { value: 'msha', provenance: 'USER_CONFIRMED', source: 'inspection' } };
    await (controller as any).applyInspectionRegulatoryContext(clientClaim, { userId: 'u1' });
    check('2d Without an inspectionId a client cannot claim inspection-level provenance (folded into an ordinary request jurisdiction)',
      clientClaim.regulatoryContext === undefined && clientClaim.structuredObservation?.jurisdiction === 'msha', clientClaim);
  });
}
// ---------------------------------------------------------------- 3/4/5. narrowing, no leakage
{
  const roof = 'Worker is exposed to an unprotected roof edge approximately 18 feet above the lower level with no guardrail or personal fall arrest system.';
  const gi = analyze(roof, { structuredObservation: { jurisdiction: 'osha-general-industry' } });
  check('3 Confirmed General Industry: 1910.28 SUPPORTED and Construction-only 1926.501 / 1926.451 do not leak',
    decisions(gi).some(d => d.citation === '29 CFR 1910.28' && d.status === 'SUPPORTED') && !decisions(gi).some(d => /1926/.test(d.citation)), decisions(gi).map(d => [d.citation, d.status]));
  const con = analyze(roof, { structuredObservation: { jurisdiction: 'osha-construction' } });
  check('4 Confirmed Construction: 1926.501 SUPPORTED and General-Industry-only 1910.28 does not substitute',
    decisions(con).some(d => d.citation === '29 CFR 1926.501' && d.status === 'SUPPORTED') && !decisions(con).some(d => /1910/.test(d.citation)), decisions(con).map(d => [d.citation, d.status]));
  const loto = 'Employee is servicing the conveyor with power connected and no lock or tag applied.';
  const msha = analyze(loto, { structuredObservation: { jurisdiction: 'msha' } });
  check('5 Confirmed MSHA: 30 CFR 56.12016 SUPPORTED and no 29 CFR authority is returned as governing',
    decisions(msha).some(d => d.citation === '30 CFR 56.12016' && d.status === 'SUPPORTED') && !decisions(msha).some(d => /29 CFR/.test(d.citation)) &&
    hazards(msha).every((h: any) => cands(h).every((c: any) => !/29 CFR/.test(c.citation))), decisions(msha).map(d => [d.citation, d.status]));
}

// ---------------------------------------------------------------- 6/7/8. unknown jurisdiction
{
  const roof = 'Worker is exposed to an unprotected roof edge approximately 18 feet above the lower level with no guardrail or personal fall arrest system.';
  const unknown = analyze(roof, { structuredObservation: { jurisdiction: 'unknown' } });
  check('6 Unknown jurisdiction: candidates are retained (no zero-candidate failure) across regimes',
    decisions(unknown).length >= 2 && hazards(unknown).every((h: any) => cands(h).length >= 2), decisions(unknown).map(d => [d.citation, d.status]));
  check('7 Unknown jurisdiction: no false certainty -- every regime candidate is UNKNOWN (conditional), none SUPPORTED, provenance UNKNOWN',
    decisions(unknown).every(d => d.status === 'UNKNOWN' && d.jurisdictionProvenance === 'UNKNOWN') && unknown.regulatoryContext?.provenance === 'UNKNOWN', decisions(unknown).map(d => [d.citation, d.status]));
  const jq = questions(unknown).filter(q => /jurisdiction/i.test(q.id));
  check('8a Unknown jurisdiction asks exactly ONE consolidated jurisdiction question (id "jurisdiction", inspection scope, named regime options)',
    jq.length === 1 && jq[0].id === 'jurisdiction' && jq[0].scope === 'inspection' && (jq[0].options || []).includes('MSHA') && (jq[0].options || []).includes('OSHA Construction'), questions(unknown));
  const established = analyze(roof, { structuredObservation: { jurisdiction: 'osha-construction' }, regulatoryContext: { value: 'osha-construction', provenance: 'USER_CONFIRMED', source: 'inspection' } });
  check('8b Once inspection context is established, the jurisdiction question is never asked again',
    !questions(established).some(q => /jurisdiction/i.test(q.id) || /jurisdiction/i.test(q.question)), questions(established));
  const answered = analyze(roof, { structuredObservation: { jurisdiction: 'unknown' }, clarificationAnswers: [{ questionId: 'jurisdiction', answer: 'OSHA Construction' }] });
  check('8c Answering the consolidated question resolves the regime (1926.501 SUPPORTED, USER_CONFIRMED) and clears it',
    decisions(answered).some(d => d.citation === '29 CFR 1926.501' && d.status === 'SUPPORTED' && d.jurisdictionProvenance === 'USER_CONFIRMED') && !questions(answered).some(q => /jurisdiction/i.test(q.id)), decisions(answered));
  const inferred = analyze('At the surface mine, a miner is servicing the crusher drive with power connected and no lock or tag applied.', { structuredObservation: { jurisdiction: 'unknown' } });
  check('7b/B HazLenz-inferred regime is labelled HAZLENZ_INFERRED (never USER_CONFIRMED), confidence capped below a confirmed match, and cites its basis',
    inferred.regulatoryContext?.provenance === 'HAZLENZ_INFERRED' && inferred.regulatoryContext?.value === 'msha' && (inferred.regulatoryContext?.basis || []).length > 0 &&
    decisions(inferred).every(d => d.jurisdictionProvenance === 'HAZLENZ_INFERRED' && d.confidence <= 0.8), inferred.regulatoryContext);
  check('7c Conflicting regime cues do not infer (stays UNKNOWN)',
    inferJurisdictionFromText('In the warehouse at the mine site an employee is servicing the conveyor.') === null &&
    inferJurisdictionFromText('The general contractor\'s crew is on the construction site.')?.value === 'osha-construction');
}

// ---------------------------------------------------------------- 9/10. multi-round history and finding isolation
{
  const text = 'A worker is servicing the stamping press and hazardous energy has not been isolated or locked out. Nearby, a portable generator power cord has exposed copper conductors and remains energized.';
  const round2 = analyze(text, {
    structuredObservation: { jurisdiction: 'unknown' },
    clarificationAnswers: [
      { questionId: 'jurisdiction', answer: 'OSHA General Industry' },      // round 1
      { questionId: 'predicate-29-cfr-1910-147-hazardous-energy-present-or-capable', answer: 'Yes' }, // round 2
    ],
  });
  const lotoH = hazards(round2).find((h: any) => h.domainId === 'lockout_tagout');
  const elecH = hazards(round2).find((h: any) => h.domainId === 'electrical');
  check('9 A jurisdiction answered on an earlier round survives later rounds (1910.147 SUPPORTED at finding scope on round 2)',
    !!lotoH && cands(lotoH).some((c: any) => c.citation === '29 CFR 1910.147' && c.status === 'SUPPORTED'), lotoH && cands(lotoH));
  check('10a Finding A (LOTO) answer does not contaminate Finding B (electrical): B has no LOTO citation, A has no electrical citation',
    !!elecH && !cands(elecH).some((c: any) => /1910\.147|56\.12016/.test(c.citation)) && !cands(lotoH).some((c: any) => /1910\.303|1926\.416/.test(c.citation)),
    { loto: cands(lotoH).map((c: any) => c.citation), elec: cands(elecH || {}).map((c: any) => c.citation) });
  // A resent evidenceSnapshot fact must not re-label provenance (see jurisdiction-unknown suite too).
  const echoed = analyze('A worker is servicing the stamping press and hazardous energy has not been isolated or locked out.', {
    structuredObservation: { jurisdiction: 'unknown' },
    evidenceSnapshot: { schemaVersion: '1.0', facts: [{ id: 'fact-1', type: 'jurisdiction', value: 'msha', source: 'user_confirmation', status: 'confirmed' }] },
  });
  check('10b An echoed snapshot jurisdiction fact alone cannot establish or re-label jurisdiction', echoed.regulatoryContext?.provenance === 'UNKNOWN', echoed.regulatoryContext);
}

// ---------------------------------------------------------------- 11. manually entered findings get standards evaluation
{
  const manual: Array<[string, string, RegExp]> = [
    ['Employee is servicing the packaging line without isolating hazardous energy; the line is still powered.', 'osha-general-industry', /1910\.147/],
    ['The point of operation on the punch press is unguarded and the operator\'s hands enter the die area while it is running.', 'osha-general-industry', /1910\.212/],
    ['A worker is on a scaffold platform about 12 feet above the ground with an open side that has no guardrail or personal fall arrest system.', 'osha-construction', /1926\.451\(g\)\(1\)/],
    ['An extension cord in use at the workbench has damaged insulation with exposed copper conductors and is still plugged in.', 'osha-general-industry', /1910\.303/],
    ['Employees in the grinding area are exposed to a measured 92 dBA 8-hour TWA with no hearing conservation program.', 'osha-general-industry', /1910\.95/],
  ];
  for (const [text, ctx, expected] of manual) {
    const r = analyze(text, { structuredObservation: { jurisdiction: ctx } });
    const finding = hazards(r)[0];
    check(`11 Manual finding evaluated with a finding-scoped standard [${expected}] and a decomposed finding: "${text.slice(0, 48)}..."`,
      !!finding && cands(finding).some((c: any) => expected.test(c.citation) && c.applicability === 'direct') && decisions(r).some(d => expected.test(d.citation) && d.status === 'SUPPORTED'),
      { hazards: hazards(r).map((h: any) => [h.domainId, cands(h).map((c: any) => [c.citation, c.applicability])]), decisions: decisions(r).map(d => [d.citation, d.status]) });
  }
}

// ---------------------------------------------------------------- 12. clear cases: no unnecessary clarification
{
  const clear: Array<[string, string, RegExp]> = [
    ['Employee is servicing the conveyor with power connected and no lock or tag applied.', 'osha-general-industry', /1910\.147/],
    ['Operator\'s hand can reach the unguarded point of operation on the running press.', 'osha-general-industry', /1910\.212/],
    ['Worker is exposed to an unprotected roof edge approximately 18 feet above the lower level with no guardrail or personal fall arrest system.', 'osha-construction', /1926\.501/],
    ['Extension cord has exposed copper conductors and remains energized in the work area.', 'osha-general-industry', /1910\.303/],
    ['A worker is dry-cutting concrete block with a gas-powered masonry saw with no water suppression or dust collection, generating a visible dust cloud in his breathing zone.', 'osha-construction', /1926\.1153/],
    ['The guard on the conveyor tail pulley at the surface mine is missing, exposing miners to the moving parts.', 'msha', /56\.14107/],
    ['Two laborers are working in a 7-foot deep trench in clay soil with no trench box, sloping, or shoring.', 'osha-construction', /1926\.652/],
  ];
  for (const [text, ctx, expected] of clear) {
    const r = analyze(text, { structuredObservation: { jurisdiction: ctx } });
    check(`12 Clear evidence -> supported standard [${expected}] with ZERO clarification questions: "${text.slice(0, 44)}..."`,
      decisions(r).some(d => expected.test(d.citation) && d.status === 'SUPPORTED') && questions(r).length === 0 && hazards(r).length >= 1,
      { decisions: decisions(r).map(d => [d.citation, d.status, d.missingPredicates]), questions: questions(r).map(q => q.id) });
  }
  const safe = analyze('The documented lockout/tagout procedure was followed on the conveyor and the zero-energy state was verified with a tester before servicing began.', { structuredObservation: { jurisdiction: 'osha-general-industry' } });
  check('12b Verified-safe LOTO produces no SUPPORTED violation and no energy questions',
    !decisions(safe).some(d => d.status === 'SUPPORTED') && !questions(safe).some(q => /energ/i.test(q.id)), { decisions: decisions(safe).map(d => [d.citation, d.status]), questions: questions(safe).map(q => q.id) });
}

// ---------------------------------------------------------------- 13. genuine ambiguity still asks
{
  const maint = analyze('Maintenance is being performed on the packaging line.', { structuredObservation: { jurisdiction: 'osha-general-industry' } });
  check('13a Servicing with no energy-control facts stays a candidate and asks a targeted energy question (no fabricated SUPPORTED)',
    !decisions(maint).some(d => d.status === 'SUPPORTED') && questions(maint).some(q => /energy|isolat/i.test(q.id)), { decisions: decisions(maint).map(d => [d.citation, d.status]), questions: questions(maint).map(q => q.id) });
  const trench = analyze('A trench about 5 feet deep is open near the loading dock.', { structuredObservation: { jurisdiction: 'osha-construction' } });
  check('13b Trench with unknown exposure/protection stays a candidate and asks about exposure/protective system',
    !decisions(trench).some(d => d.status === 'SUPPORTED') && questions(trench).some(q => /cave-in|protective/i.test(q.id)), questions(trench).map(q => q.id));
  const roofUnknown = analyze('Worker is exposed to an unprotected roof edge approximately 18 feet above the lower level with no guardrail or personal fall arrest system.', { structuredObservation: { jurisdiction: 'unknown' } });
  check('13c Genuinely unknown jurisdiction with no regime cues asks the one jurisdiction question', questions(roofUnknown).some(q => q.id === 'jurisdiction'));
}

// ---------------------------------------------------------------- 14. finding-scoped data shape for UI/persistence/report
{
  const r = analyze('Guardrails on the mezzanine platform are properly secured and no deficiencies were observed there. Separately, a portable generator power cord has exposed conductors and damaged insulation near a wet floor area. A worker was performing maintenance on the stamping press without lockout applied and stored energy had not been released.',
    { structuredObservation: { jurisdiction: 'osha-general-industry' } });
  const loto = hazards(r).find((h: any) => h.domainId === 'lockout_tagout');
  const elec = hazards(r).find((h: any) => h.domainId === 'electrical');
  check('14a Each finding carries its OWN standardCandidates array (present even when empty) with jurisdictionProvenance on every candidate',
    hazards(r).every((h: any) => Array.isArray(h.standardCandidates) && cands(h).every((c: any) => c.jurisdictionProvenance)), hazards(r).map((h: any) => [h.domainId, cands(h).length]));
  check('14b LOTO finding owns 1910.147 only; electrical finding owns 1910.303 only (the same shape the persisted sourceCandidate, Standard Detail panel and PDF extractStandard read)',
    !!loto && !!elec && cands(loto).some((c: any) => c.citation === '29 CFR 1910.147') && !cands(loto).some((c: any) => c.citation === '29 CFR 1910.303') &&
    cands(elec).some((c: any) => c.citation === '29 CFR 1910.303') && !cands(elec).some((c: any) => c.citation === '29 CFR 1910.147'),
    { loto: loto && cands(loto).map((c: any) => c.citation), elec: elec && cands(elec).map((c: any) => c.citation) });
}

Promise.all(pending).then(() => {
  console.log('='.repeat(60));
  if (failures > 0) {
    console.error(`HazLenz inspection-context / autonomy regression: ${failures} FAILED`);
    process.exit(1);
  }
  console.log('HazLenz inspection-context / autonomy regression: all invariants passed, 0 failed');
});
