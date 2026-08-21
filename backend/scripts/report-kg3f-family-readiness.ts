/**
 * KG-3F (Phase 14) -- governed-cutover readiness, per HAZARD FAMILY.
 *
 * WHY A FAMILY-LEVEL MATRIX AND NOT THE PER-CITATION ONE. `report:cutover-coverage-matrix` answers
 * "is this citation governed and approved". That is the right question for a sourcing backlog and
 * the wrong question for a cutover decision, because a customer does not experience citations --
 * they experience "I reported a fall hazard and HazLenz said nothing". A family whose only
 * defensible candidate is filtered away by approved-only governance goes BLIND, and no per-citation
 * row says so: each individual row simply reads "not approved", which looks like backlog rather
 * than like a regression in what the product can answer.
 *
 * THE DISTINCTION THIS EXISTS TO ENFORCE. An empty result has two causes that look identical in a
 * coverage number and could not be more different in meaning:
 *
 *   EVIDENCE_UNKNOWN       -- HazLenz produced no candidate because the observation does not
 *                             establish the rule's applicability conditions. This is the CORRECT
 *                             behavior and is exactly what KG-3F Phases 5-7 built: 56.14132(b)(1)
 *                             is withheld when rear visibility is unstated. Governance is not
 *                             involved. Reporting this as a coverage failure would create pressure
 *                             to re-weaken the predicate to make a number go up.
 *
 *   GOVERNANCE_FILTER_EMPTY-- HazLenz DID produce a defensible candidate and approved-only
 *                             filtering removed it. This is a genuine corpus/governance gap and is
 *                             the only one of the two that can block cutover.
 *
 * A family is BLIND only in the second case. The hard readiness target is that no important
 * measured family becomes functionally blind because governance filtering removed its only
 * defensible candidate.
 *
 * Read-only. Diagnostic. Not customer production logic.
 *
 * Usage: DATABASE_URL=…test_… npx ts-node scripts/report-kg3f-family-readiness.ts <releaseId>
 */
import 'dotenv/config';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dataSource } from '../src/database/data-source';
import {
  applyEvidenceFoundation,
  applyFindingScopedStandards,
} from '../src/safescope-v2/evidence/evidence-foundation';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

interface GoldCase {
  id: string; area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string; expectedCitations: string[]; mustNotReturn: string[];
}

/** Read-only and hash-verified. This harness never writes to the protected gold set. */
function loadGoldSet(): GoldCase[] {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha = createHash('sha256').update(source).digest('hex');
  if (sha !== EXPECTED_GOLD_SET_SHA256) {
    throw new Error(`Gold set hash mismatch: ${sha}. Refusing to report against an altered artifact.`);
  }
  const start = source.indexOf('const GOLD_SET: GoldCase[] = [');
  const open = source.indexOf('[', start), end = source.indexOf('\n];', open);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${source.slice(open, end + 2)};`)() as GoldCase[];
}

/**
 * The hazard family, derived from the gold-set `area` rather than from a hand-maintained citation
 * map. A citation->family table has to be updated every time a predicate changes which citation it
 * emits, and it silently misattributes the family when it is not -- which is precisely what
 * happened to 56.14132 in KG-3E. The area is what the scenario is ABOUT, so it survives the
 * citation changing underneath it.
 */
function familyOf(area: string): string {
  return area
    .replace(/^(General Industry|Construction|MSHA)\s*-\s*/, '')
    .replace(/^Cross-regime adversarial:\s*/, 'cross-regime: ')
    .replace(/\s*\(negative control\)\s*$/, '')
    .replace(/\s*\(documented gap, honest empty\)\s*$/, '')
    .trim();
}

const isNegativeControl = (c: GoldCase) =>
  /negative control/i.test(c.area) || c.expectedCitations.length === 0;

const scopeToText = (r: GoldCase['regime']) =>
  r === 'msha' ? ['msha'] : r === 'osha_construction' ? ['osha_construction'] : ['osha_general'];

interface Measured {
  citations: string[];
  /** Rules the foundation evaluated and could not establish applicability for. */
  unknownPredicates: string[];
  /** Rules it evaluated and positively found not to apply -- a correct, deliberate silence. */
  notApplicable: string[];
}

function measure(c: GoldCase): Measured {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'kg3f-fam', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: c.observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  const citations: string[] = (result.multiHazardDecomposition.hazards[0].standardCandidates || [])
    .map((s: any) => String(s.citation)).filter(Boolean);

  // `applyFindingScopedStandards` drops NOT_APPLICABLE decisions, so it cannot distinguish "no rule
  // applied" from "no rule ran". The foundation exposes the full adjudication, which is the only
  // surface where EVIDENCE_UNKNOWN is observable as a positive fact rather than as an absence.
  const foundation: any = { multiHazardDecomposition: result.multiHazardDecomposition };
  applyEvidenceFoundation(foundation, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  const decisions: any[] = foundation.applicabilityDecisions || [];

  // Uncertainty is read at the PREDICATE level as well as the decision level. A decision can be
  // emitted while one of its required predicates is UNKNOWN -- that is exactly the corrected
  // 56.14132 shape, where the section-level citation is surfaced truthfully but the obstructed-view
  // trigger is not established. Reading only decision status would score that as fully certain and
  // hide the very uncertainty Phases 5-7 were built to expose.
  const predicateUnknown = (d: any) =>
    (d.requiredPredicates || []).some((p: any) => String(p.status) === 'UNKNOWN');

  return {
    citations,
    unknownPredicates: decisions
      .filter(d => String(d.status) === 'UNKNOWN' || predicateUnknown(d))
      .map(d => String(d.citation)),
    notApplicable: decisions.filter(d => String(d.status) === 'NOT_APPLICABLE')
      .map(d => String(d.citation)),
  };
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }
  const releaseId = process.argv[2];
  if (!releaseId) throw new Error('A releaseId argument is required.');
  await dataSource.initialize();

  const cases = loadGoldSet();

  // Governance state per citation, resolved once.
  const governance = new Map<string, { inRelease: boolean; approved: boolean }>();
  const resolveGovernance = async (citation: string) => {
    if (governance.has(citation)) return governance.get(citation)!;
    const governed = await resolveGovernedCitation(dataSource, releaseId, citation);
    const key = releaseCitationKey(citation);
    const rec = (await dataSource.query(
      `SELECT "recordChecksum" FROM regulatory_release_records
        WHERE "releaseId"=$1 AND "citationKey"=$2 LIMIT 1`, [releaseId, key]))[0];
    const decision = rec ? (await dataSource.query(
      `SELECT decision FROM regulatory_release_record_reviews
        WHERE "releaseId"=$1 AND "citationKey"=$2 AND "recordChecksum"=$3
        ORDER BY "decidedAt" DESC, "createdAt" DESC LIMIT 1`,
      [releaseId, key, rec.recordChecksum]))[0]?.decision ?? null : null;
    const state = { inRelease: governed.backing !== 'NOT_IN_RELEASE', approved: decision === 'approved' };
    governance.set(citation, state);
    return state;
  };

  const families = new Map<string, any>();

  for (const c of cases) {
    const family = familyOf(c.area);
    const m = measure(c);
    const fam = families.get(family) ?? {
      family,
      regimes: new Set<string>(),
      scenariosTested: 0,
      negativeControls: 0,
      citationsEmitted: new Set<string>(),
      governedCitations: new Set<string>(),
      approvedCitations: new Set<string>(),
      findingsWithCandidates: 0,
      findingsWithNoApprovedCandidate: 0,
      applicabilityUncertainFindings: 0,
      evidenceUnknownFindings: [] as string[],
      governanceFilterEmptyFindings: [] as string[],
      cases: [] as any[],
    };
    fam.regimes.add(c.regime);
    fam.scenariosTested += 1;
    if (isNegativeControl(c)) fam.negativeControls += 1;

    let approvedHere = 0;
    for (const cit of m.citations) {
      fam.citationsEmitted.add(cit);
      const g = await resolveGovernance(cit);
      if (g.inRelease) fam.governedCitations.add(cit);
      if (g.approved) { fam.approvedCitations.add(cit); approvedHere += 1; }
    }

    // The classification, per finding. Negative controls are excluded from the blindness
    // arithmetic entirely: an empty result there is the ASSERTED CORRECT outcome, and counting it
    // as a coverage gap would invert the meaning of the test.
    let outcome: string;
    if (isNegativeControl(c)) {
      outcome = 'NEGATIVE_CONTROL_CORRECTLY_SILENT';
    } else if (m.citations.length === 0) {
      // No candidate at all. Governance never got a chance to filter anything, so this cannot be
      // a governance failure by construction -- it is an evidence/applicability outcome.
      outcome = 'EVIDENCE_UNKNOWN';
      fam.evidenceUnknownFindings.push(c.id);
      fam.applicabilityUncertainFindings += 1;
    } else {
      fam.findingsWithCandidates += 1;
      if (approvedHere === 0) {
        // Candidates existed and approved-only filtering removed every one of them. THIS is the
        // governance gap, and the only outcome that can block cutover.
        outcome = 'GOVERNANCE_FILTER_EMPTY';
        fam.governanceFilterEmptyFindings.push(c.id);
        fam.findingsWithNoApprovedCandidate += 1;
      } else {
        outcome = 'COVERED';
      }
      if (m.unknownPredicates.length) fam.applicabilityUncertainFindings += 1;
    }

    fam.cases.push({
      id: c.id, area: c.area, outcome,
      emitted: m.citations,
      approvedEmitted: m.citations.filter(x => governance.get(x)?.approved),
      unknownPredicates: m.unknownPredicates,
      notApplicablePredicates: m.notApplicable,
    });
    families.set(family, fam);
  }

  const rows = [...families.values()].map(f => {
    const positiveScenarios = f.scenariosTested - f.negativeControls;
    // "Blind" means: this family has real scenarios, and governance filtering -- not evidence --
    // left at least one of them with nothing to say. A family every one of whose positive
    // scenarios is filtered empty is functionally blind under approved-only retrieval.
    const approvedOnlyEmptiesFamily = positiveScenarios > 0
      && f.approvedCitations.size === 0 && f.citationsEmitted.size > 0;
    const anyGovernanceFilterEmpty = f.governanceFilterEmptyFindings.length > 0;
    return {
      family: f.family,
      regimes: [...f.regimes].sort(),
      scenariosTested: f.scenariosTested,
      positiveScenarios,
      negativeControls: f.negativeControls,
      citationsEmitted: [...f.citationsEmitted].sort(),
      citationsEmittedCount: f.citationsEmitted.size,
      governedCoverage: `${f.governedCitations.size}/${f.citationsEmitted.size}`,
      approvedGovernedCoverage: `${f.approvedCitations.size}/${f.citationsEmitted.size}`,
      applicabilityUncertainFindings: f.applicabilityUncertainFindings,
      findingsWithNoApprovedCandidate: f.findingsWithNoApprovedCandidate,
      evidenceUnknownFindings: f.evidenceUnknownFindings,
      governanceFilterEmptyFindings: f.governanceFilterEmptyFindings,
      approvedOnlyEmptiesFamily,
      fallbackWouldBeRequired: anyGovernanceFilterEmpty,
      // Four states, not three. A family can be fully COVERED and still carry an unestablished
      // applicability predicate -- MSHA-TRAFFIC-01 emits the truthful section-level 56.14132 while
      // the obstructed-view trigger remains UNKNOWN. Collapsing that into plain READY would assert
      // that every applicability condition is satisfied, which is the exact claim Phase 15 requires
      // Standard Detail never to make. It is not a blocker; it is a disclosure obligation.
      readiness: anyGovernanceFilterEmpty ? 'BLOCKED_GOVERNANCE_GAP'
        : f.evidenceUnknownFindings.length ? 'READY_WITH_EVIDENCE_UNKNOWN'
        : f.applicabilityUncertainFindings > 0 ? 'READY_WITH_APPLICABILITY_UNCERTAINTY'
        : 'READY',
      cases: f.cases,
    };
  }).sort((a, b) => a.family.localeCompare(b.family));

  const blocked = rows.filter(r => r.readiness === 'BLOCKED_GOVERNANCE_GAP');
  const evidenceUnknownTotal = rows.reduce((n, r) => n + r.evidenceUnknownFindings.length, 0);
  const filterEmptyTotal = rows.reduce((n, r) => n + r.governanceFilterEmptyFindings.length, 0);

  const out = {
    releaseId,
    generatedFrom: {
      goldSet: 'gold-set-script-v3.ts', goldSetSha256: EXPECTED_GOLD_SET_SHA256,
      goldSetCases: cases.length, families: rows.length,
      note: 'Families are derived from the gold-set AREA, not from a citation->family table, so a '
        + 'predicate emitting a different citation cannot silently reclassify the family.',
    },
    summary: {
      familiesMeasured: rows.length,
      familiesReady: rows.filter(r => r.readiness === 'READY').length,
      familiesReadyWithEvidenceUnknown: rows.filter(r => r.readiness === 'READY_WITH_EVIDENCE_UNKNOWN').length,
      familiesReadyWithApplicabilityUncertainty:
        rows.filter(r => r.readiness === 'READY_WITH_APPLICABILITY_UNCERTAINTY').length,
      findingsWithUnestablishedPredicate:
        rows.reduce((n, r) => n + r.applicabilityUncertainFindings, 0),
      familiesBlockedByGovernanceGap: blocked.length,
      familiesEmptiedByApprovedOnlyFilter: rows.filter(r => r.approvedOnlyEmptiesFamily).length,
      EVIDENCE_UNKNOWN_findings: evidenceUnknownTotal,
      GOVERNANCE_FILTER_EMPTY_findings: filterEmptyTotal,
      hardReadinessTargetMet: blocked.length === 0,
    },
    families: rows,
  };

  const dest = process.env.REPORT_OUT;
  if (dest) writeFileSync(dest, JSON.stringify(out, null, 2));

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log(`\nKG-3F FAMILY READINESS — release ${releaseId}\n`);
  console.log(pad('HAZARD FAMILY', 34) + pad('SCEN', 6) + pad('EMIT', 6) + pad('GOV', 8)
    + pad('APPROVED', 10) + 'READINESS');
  for (const r of rows) {
    console.log(pad(r.family, 34) + pad(`${r.positiveScenarios}+${r.negativeControls}`, 6)
      + pad(r.citationsEmittedCount, 6) + pad(r.governedCoverage, 8)
      + pad(r.approvedGovernedCoverage, 10) + r.readiness);
  }
  console.log('\nEMPTY-RESULT ATTRIBUTION (the distinction that governs cutover):');
  console.log(`  EVIDENCE_UNKNOWN        ${evidenceUnknownTotal}  `
    + '(applicability not established — correct behavior, NOT a corpus failure)');
  console.log(`  GOVERNANCE_FILTER_EMPTY ${filterEmptyTotal}  `
    + '(a defensible candidate existed and governance removed it — a real gap)');
  console.log(`\nfamilies ${rows.length} | ready ${out.summary.familiesReady} | `
    + `ready-with-evidence-unknown ${out.summary.familiesReadyWithEvidenceUnknown} | `
    + `ready-with-applicability-uncertainty ${out.summary.familiesReadyWithApplicabilityUncertainty} | `
    + `blocked ${blocked.length}`);
  console.log(`\nHARD READINESS TARGET (no family blind due to governance filtering): `
    + `${out.summary.hardReadinessTargetMet ? 'MET' : 'NOT MET'}`);
  if (blocked.length) {
    console.log('\nBLOCKED FAMILIES:');
    for (const b of blocked) console.log(`  ${pad(b.family, 34)} ${b.governanceFilterEmptyFindings.join(', ')}`);
  }
  if (dest) console.log(`\nWrote ${dest}`);

  await dataSource.destroy();
}

main().catch(async e => {
  console.error(e);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
