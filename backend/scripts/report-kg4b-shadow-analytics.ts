/**
 * KG-4B (Phases 10, 14) -- aggregate analytics over the isolated shadow corpus, and event volume.
 *
 * THE RULE THIS REPORT IS BUILT AROUND: a 99% match rate can hide one catastrophic wrong-jurisdiction
 * case. So every BLOCKING mismatch is listed INDIVIDUALLY, always, regardless of how good the
 * aggregate looks -- and the aggregate is never printed without the blocking list beside it.
 *
 * Rates are reported against an explicit denominator every time. "Exact-match rate" is meaningless
 * unless the reader knows whether the denominator is analyses, findings, or citation comparisons;
 * this report states it in the label.
 *
 * Read-only. Consumes `shadow-events.jsonl` and `case-results.json`; writes a JSON report.
 *
 * Usage:
 *   CORPUS_DIR=<dir> [REPORT_OUT=<file>] npx ts-node scripts/report-kg4b-shadow-analytics.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  ALL_MISMATCH_CATEGORIES, ALL_SEVERITIES, ALL_ROOT_CAUSES,
} from '../src/standards/cutover/shadow-comparison';

const CORPUS_DIR = process.env.CORPUS_DIR || '.';
const REPORT_OUT = process.env.REPORT_OUT || '';

function counter<T extends string>(values: T[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const value of values) out[value] = (out[value] || 0) + 1;
  return out;
}
/** Rate with an explicit denominator, or null when the denominator is zero. */
function rate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : Number(((numerator / denominator) * 100).toFixed(2));
}

const events: any[] = readFileSync(join(CORPUS_DIR, 'shadow-events.jsonl'), 'utf8')
  .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
const caseFile = JSON.parse(readFileSync(join(CORPUS_DIR, 'case-results.json'), 'utf8'));
const cases: any[] = caseFile.results;

// ---------------------------------------------------------------- volume (Phase 10)

const byCorrelation = new Map<string, any[]>();
for (const event of events) {
  const list = byCorrelation.get(event.correlationId) || [];
  list.push(event);
  byCorrelation.set(event.correlationId, list);
}
const eventsPerAnalysis = [...byCorrelation.values()].map(list => list.length).sort((a, b) => a - b);
const distinctEventKeys = new Set(events.map(e => e.eventKey));
const distinctCitationsPerAnalysis = [...byCorrelation.values()]
  .map(list => new Set(list.map(e => e.requestedCitation)).size);

const volume = {
  analysesObserved: byCorrelation.size,
  totalEvents: events.length,
  distinctEventKeys: distinctEventKeys.size,
  // Equal counts prove no duplication: one event per (analysis, finding, citation, release).
  duplicateEvents: events.length - distinctEventKeys.size,
  eventsPerAnalysis: {
    min: eventsPerAnalysis[0] ?? 0,
    p50: eventsPerAnalysis[Math.floor(eventsPerAnalysis.length * 0.5)] ?? 0,
    max: eventsPerAnalysis[eventsPerAnalysis.length - 1] ?? 0,
    mean: eventsPerAnalysis.length
      ? Number((eventsPerAnalysis.reduce((a, b) => a + b, 0) / eventsPerAnalysis.length).toFixed(2)) : 0,
  },
  /**
   * Cardinality: one event per DISTINCT CITATION per analysis, not per internal resolver step and
   * not per candidate occurrence. The context memoises by citation, so a citation appearing on a
   * primary standard, its decision row and a hazard candidate produces ONE event, not three.
   */
  cardinality: 'one event per (analysis x distinct citation)',
  cardinalityHolds: [...byCorrelation.entries()].every(([id, list]) =>
    list.length === new Set(list.map(e => e.requestedCitation)).size),
  distinctCitationsPerAnalysis: {
    min: Math.min(...distinctCitationsPerAnalysis),
    max: Math.max(...distinctCitationsPerAnalysis),
  },
};

// ---------------------------------------------------------------- analytics (Phase 14)

const comparisons = events.length;
const analysesTotal = cases.length;
const findingsTotal = cases.reduce((sum, c) => sum + (c.findingCount || 0), 0);
const candidateStandards = cases.reduce((sum, c) => sum + c.legacyCitations.length, 0);

const mismatchCounts = counter(events.map(e => e.mismatch));
const severityCounts = counter(events.map(e => e.severity));
const rootCauseCounts = counter(events.map(e => e.rootCause));
const backingCounts = counter(events.map(e => e.governedBackingState));
const applicabilityCounts = counter(events.map(e => e.applicability));
const resolverHealthCounts = counter(events.map(e => e.resolverHealth));

const countOf = (category: string) => mismatchCounts[category] || 0;
const substantive = comparisons - countOf('EXACT_MATCH') - countOf('CONTENT_EQUIVALENT');

const byFamily: Record<string, Record<string, number>> = {};
for (const event of events) {
  const family = event.hazardFamily || '(unattributed)';
  byFamily[family] = byFamily[family] || {};
  byFamily[family][event.severity] = (byFamily[family][event.severity] || 0) + 1;
}
const byJurisdiction: Record<string, Record<string, number>> = {};
for (const event of events) {
  const regime = event.jurisdiction || '(unestablished)';
  byJurisdiction[regime] = byJurisdiction[regime] || {};
  byJurisdiction[regime][event.mismatch] = (byJurisdiction[regime][event.mismatch] || 0) + 1;
}
const byBackingState: Record<string, Record<string, number>> = {};
for (const event of events) {
  byBackingState[event.governedBackingState] = byBackingState[event.governedBackingState] || {};
  const bucket = byBackingState[event.governedBackingState];
  bucket[event.mismatch] = (bucket[event.mismatch] || 0) + 1;
}

const blocking = events.filter(e => e.severity === 'BLOCKING');
const review = events.filter(e => e.severity === 'REVIEW');

const report = {
  generatedBy: 'report-kg4b-shadow-analytics.ts',
  schemaVersion: events[0]?.schemaVersion ?? null,
  releaseId: [...new Set(events.map(e => e.releaseId))],
  releaseManifestChecksum: [...new Set(events.map(e => e.releaseManifestChecksum))],
  corpus: {
    goldSetCases: caseFile.goldSetCases, kg4bFixtures: caseFile.kg4bFixtures,
    totalCases: caseFile.totalCases, regimes: caseFile.regimes, shapes: caseFile.shapes,
  },
  totals: {
    analyses: analysesTotal,
    findings: findingsTotal,
    candidateStandards,
    citationComparisons: comparisons,
  },
  customerOutputInvariance: {
    casesCompared: caseFile.invariance.casesCompared,
    identical: caseFile.invariance.identical,
    identicalRatePercent: rate(caseFile.invariance.identical, caseFile.invariance.casesCompared),
    shadowPayloadsCarryingGovernedKeys: caseFile.invariance.shadowCarriedGovernedKeys,
  },
  ratesPerCitationComparison: {
    denominator: comparisons,
    exactMatchPercent: rate(countOf('EXACT_MATCH'), comparisons),
    contentEquivalentPercent: rate(countOf('CONTENT_EQUIVALENT'), comparisons),
    substantiveMismatchPercent: rate(substantive, comparisons),
    governedMissingPercent: rate(countOf('GOVERNED_MISSING'), comparisons),
    governedCitationOnlyPercent: rate(countOf('GOVERNED_CITATION_ONLY'), comparisons),
    granularityDifferencePercent: rate(countOf('GRANULARITY_DIFFERENCE'), comparisons),
    applicabilityDifferencePercent: rate(countOf('APPLICABILITY_DIFFERENCE'), comparisons),
    jurisdictionDifferencePercent: rate(countOf('JURISDICTION_DIFFERENCE'), comparisons),
    contentDifferencePercent: rate(countOf('CONTENT_DIFFERENCE'), comparisons),
    resolverFailurePercent: rate(countOf('RESOLVER_FAILURE'), comparisons),
    integrityFailurePercent: rate(countOf('INTEGRITY_FAILURE'), comparisons),
    blockingPercent: rate(blocking.length, comparisons),
  },
  distributions: {
    mismatch: mismatchCounts,
    severity: severityCounts,
    rootCause: rootCauseCounts,
    governedBackingState: backingCounts,
    applicability: applicabilityCounts,
    resolverHealth: resolverHealthCounts,
    // Declared-but-unobserved categories, listed explicitly so a reader can see what the corpus did
    // NOT exercise rather than inferring absence from a missing key.
    unobservedCategories: ALL_MISMATCH_CATEGORIES.filter(c => !(c in mismatchCounts)),
    unobservedSeverities: ALL_SEVERITIES.filter(s => !(s in severityCounts)),
    unobservedRootCauses: ALL_ROOT_CAUSES.filter(r => !(r in rootCauseCounts)),
  },
  byHazardFamily: byFamily,
  byJurisdiction,
  byBackingState,
  volume,
  /** ALWAYS listed individually. Never summarised into a percentage alone. */
  blockingMismatches: blocking.map(e => ({
    eventKey: e.eventKey, correlationId: e.correlationId, findingKey: e.findingKey,
    requestedCitation: e.requestedCitation, governedResolvedCitation: e.governedResolvedCitation,
    mismatch: e.mismatch, rootCause: e.rootCause, severity: e.severity,
    governedBackingState: e.governedBackingState, applicability: e.applicability,
    jurisdiction: e.jurisdiction, hazardFamily: e.hazardFamily, resolverHealth: e.resolverHealth,
  })),
  reviewMismatchSummary: Object.entries(counter(review.map(e => `${e.mismatch}|${e.rootCause}`)))
    .map(([key, count]) => {
      const [mismatch, rootCause] = key.split('|');
      return { mismatch, rootCause, count };
    }).sort((a, b) => b.count - a.count),
};

// ---------------------------------------------------------------- output

console.log(`\nKG-4B shadow analytics — release ${report.releaseId.join(', ')}`);
console.log(`manifest ${report.releaseManifestChecksum.join(', ')}\n`);
console.log(`corpus            ${report.corpus.totalCases} cases ` +
  `(${report.corpus.goldSetCases} gold-set + ${report.corpus.kg4bFixtures} KG-4B fixtures)`);
console.log(`analyses          ${report.totals.analyses}`);
console.log(`findings          ${report.totals.findings}`);
console.log(`candidate stds    ${report.totals.candidateStandards}`);
console.log(`comparisons       ${report.totals.citationComparisons}`);
console.log(`\ncustomer-output invariance  ${report.customerOutputInvariance.identical}/` +
  `${report.customerOutputInvariance.casesCompared} identical ` +
  `(${report.customerOutputInvariance.identicalRatePercent}%), ` +
  `${report.customerOutputInvariance.shadowPayloadsCarryingGovernedKeys} payloads carried governed keys`);

console.log('\nmismatch distribution (denominator = citation comparisons):');
for (const [key, count] of Object.entries(mismatchCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${key.padEnd(26)} ${String(count).padStart(4)}  ${String(rate(count, comparisons)).padStart(6)}%`);
}
console.log('\nseverity:');
for (const severity of ALL_SEVERITIES) {
  console.log(`  ${severity.padEnd(26)} ${String(severityCounts[severity] || 0).padStart(4)}`);
}
console.log('\nroot cause:');
for (const [key, count] of Object.entries(rootCauseCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${key.padEnd(26)} ${String(count).padStart(4)}`);
}
console.log('\nevent volume:');
console.log(`  analyses observed         ${volume.analysesObserved}`);
console.log(`  events                    ${volume.totalEvents}`);
console.log(`  distinct event keys       ${volume.distinctEventKeys}`);
console.log(`  duplicates                ${volume.duplicateEvents}`);
console.log(`  events/analysis           min ${volume.eventsPerAnalysis.min} · p50 ${volume.eventsPerAnalysis.p50} · max ${volume.eventsPerAnalysis.max} · mean ${volume.eventsPerAnalysis.mean}`);
console.log(`  cardinality holds         ${volume.cardinalityHolds}`);

console.log(`\nBLOCKING mismatches: ${blocking.length}`);
if (blocking.length === 0) {
  console.log('  (none in this isolated corpus — every difference is a designed fallback or a review item)');
} else {
  for (const item of report.blockingMismatches) {
    console.log(`  ${item.requestedCitation.padEnd(26)} ${item.mismatch.padEnd(24)} ${item.rootCause.padEnd(22)} ${item.jurisdiction ?? '-'}`);
  }
}

if (REPORT_OUT) { writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2)); console.log(`\nreport written: ${REPORT_OUT}`); }
