/**
 * KG-3A shadow harness (Phases 14-17). VERIFICATION ONLY -- nothing here is reachable from the
 * customer path, and no live retrieval filter is changed.
 *
 * Answers one question with record-level evidence: if HazLenz retrieval were scoped to the
 * active governed release under TRUTHFUL approval semantics, what would change?
 *
 * The gold set is read from its TRACKED location and hash-verified first, so the untracked
 * `backend/tmp/gold-set-v3.ts` is never authoritative and no fourth copy is maintained. Only
 * the dataset is extracted (a pure array literal); the evaluation is driven here so the
 * tracked file needs no edit and no relocation.
 */
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';
import { EFFECTIVE_STATE_SQL } from '../src/standards/releases/release-record-review.service';

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
/** Recorded in KG-1/KG-2 verification; recomputed here from the actual file before use. */
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

interface GoldCase {
  id: string;
  area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string;
  expectedCitations: string[];
  mustNotReturn: string[];
  authoritativeSource: string;
  rationale: string;
}

/**
 * Extracts the GOLD_SET array literal from the tracked file after verifying its sha256.
 * The literal is pure data (strings/arrays/objects, no calls), so evaluating it is safe and
 * avoids either editing the tracked file or keeping a duplicate of the dataset.
 */
function loadTrackedGoldSet(): { cases: GoldCase[]; sha256: string } {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha256 = createHash('sha256').update(source).digest('hex');
  if (sha256 !== EXPECTED_GOLD_SET_SHA256) {
    throw new Error(
      `Tracked gold set hash mismatch. Expected ${EXPECTED_GOLD_SET_SHA256}, got ${sha256}. ` +
      'Refusing to score against an unverified gold set.',
    );
  }
  const start = source.indexOf('const GOLD_SET: GoldCase[] = [');
  const open = source.indexOf('[', start);
  const end = source.indexOf('\n];', open);
  if (start < 0 || end < 0) throw new Error('Could not locate the GOLD_SET literal in the tracked file.');
  const literal = source.slice(open, end + 2);
  // eslint-disable-next-line no-new-func
  const cases = new Function(`return ${literal};`)() as GoldCase[];
  return { cases, sha256 };
}

/**
 * The gold set's OWN citation comparison, reproduced from the tracked script
 * (`canonicalizeCitation` + `isCitationMatch`). Scoring the gold set must use the gold set's
 * semantics -- agency-prefix-insensitive substring matching -- not the release-identity key,
 * which is a different concept with different rules (it keeps the agency prefix on purpose).
 */
function canonicalizeCitation(cit: string): string {
  return String(cit ?? '')
    .toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function isCitationMatch(a: string, b: string): boolean {
  const c1 = canonicalizeCitation(a);
  const c2 = canonicalizeCitation(b);
  if (!c1 || !c2) return false;
  return c1.includes(c2) || c2.includes(c1);
}

function scopeToText(regime: GoldCase['regime']): string[] {
  if (regime === 'msha') return ['msha'];
  if (regime === 'osha_construction') return ['osha_construction'];
  return ['osha_general'];
}

/** Runs the in-code selection engine exactly as the tracked gold-set script does. */
function evaluateCase(c: GoldCase) {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'gold-1', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: c.observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  const candidates = result.multiHazardDecomposition.hazards[0].standardCandidates || [];
  const confirmed = candidates
    .filter((s: any) => s?.applicability === 'direct')
    .map((s: any) => String(s.citation));
  const all = candidates.map((s: any) => String(s.citation));
  return { confirmed, all };
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against a non-disposable database: ${dbName}`);
  }

  const { cases, sha256 } = loadTrackedGoldSet();
  await dataSource.initialize();
  const service = new RegulatoryReleaseLifecycleService(dataSource);
  // SHADOW_RELEASE_ID lets the comparison answer "what WOULD governed filtering do if this
  // release governed retrieval" for a release that is correctly not activatable yet. That is
  // the only way to measure the real corpus, which has no reviewer-approved record and
  // therefore cannot legitimately be activated.
  const candidateReleaseId = process.env.SHADOW_RELEASE_ID || null;
  const active = candidateReleaseId
    ? await service.getRelease(candidateReleaseId)
    : await service.getActiveRelease();

  // ------------------------------------------------ corpus-level governed vs current sets
  const corpus: Array<Record<string, any>> = await dataSource.query(
    `SELECT id, agency_code, citation, source_key, reviewer_approved, deprecation_status, is_active
     FROM standards_master ORDER BY agency_code, citation`,
  );
  // KG-3B: the snapshot's frozen `reviewState` can never show an approval, because finalization
  // does not confer one -- reviewer approval is a post-finalization control state recorded in
  // `regulatory_release_record_reviews` and bound to an exact record checksum. Reading the frozen
  // column alone would report every release as 0-governed forever, regardless of real review
  // work. `EFFECTIVE_STATE_SQL` overlays the frozen state with the latest decision for that exact
  // version, which is the same resolution the activation gate uses.
  const snapshot: Array<Record<string, any>> = active
    ? await dataSource.query(
      `SELECT e.citation, e."citationKey", e."effectiveState" AS "reviewState",
              r."reviewStateReason"
         FROM (${EFFECTIVE_STATE_SQL}) AS e
         JOIN regulatory_release_records r
           ON r."releaseId" = $1 AND r."citationKey" = e."citationKey"`, [active.releaseId])
    : [];
  const governedRecords = snapshot.filter(r => r.reviewState === 'reviewer_approved');
  const governedKeys = new Set(governedRecords.map(r => r.citationKey));
  const snapshotByKey = new Map(snapshot.map(r => [r.citationKey, r]));
  /** Gold-set citations are matched against governed records with the gold set's own semantics. */
  const isGovernedCitation = (citation: string) =>
    governedRecords.some(r => isCitationMatch(citation, r.citation));

  // Per-record reason each live row would be lost under governed filtering.
  const recordDiff = corpus.map(row => {
    const key = releaseCitationKey(row.citation);
    const snap = snapshotByKey.get(key);
    const governed = governedKeys.has(key);
    let reason = 'retained under governed filtering';
    if (!active) reason = 'no active release: nothing is governed';
    else if (!snap) reason = `not a member of active release ${active.releaseId}`;
    else if (!governed) reason = `review state '${snap.reviewState}': ${snap.reviewStateReason}`;
    return {
      citation: row.citation, agency: row.agency_code, sourceKey: row.source_key,
      currentlyRetrievable: row.is_active === true,
      governedRetrievable: governed, reason,
    };
  });
  const lost = recordDiff.filter(r => r.currentlyRetrievable && !r.governedRetrievable);

  // ------------------------------------------------------------- gold-set case evaluation
  const caseRows = cases.map(c => {
    const evaluated = evaluateCase(c);
    const expectedGoverned = c.expectedCitations.map((citation: string) => ({
      citation, governed: isGovernedCitation(citation),
    }));
    const returnedGoverned = evaluated.confirmed.map((citation: string) => ({
      citation, governed: isGovernedCitation(citation),
    }));
    const gotForbidden = evaluated.confirmed.some((r: string) =>
      c.mustNotReturn.some((f: string) => isCitationMatch(r, f)));
    const gotExpected = c.expectedCitations.length === 0
      ? evaluated.confirmed.length === 0
      : !gotForbidden && evaluated.confirmed.some((r: string) =>
        c.expectedCitations.some((e: string) => isCitationMatch(r, e)));
    return {
      id: c.id, regime: c.regime, expected: c.expectedCitations,
      returnedConfirmed: evaluated.confirmed, gotExpected, gotForbidden,
      expectedGoverned, returnedGoverned,
      losesCorpusBacking: returnedGoverned
        .filter((r: { governed: boolean }) => !r.governed)
        .map((r: { citation: string }) => r.citation),
    };
  });

  const applicable = cases.filter(c => c.expectedCitations.length > 0).length;
  const correct = caseRows.filter(r => r.gotExpected).length;
  const expectedCitationsAll = Array.from(new Set(
    cases.flatMap(c => c.expectedCitations)));
  const expectedGovernedCount = expectedCitationsAll.filter(c => isGovernedCitation(c)).length;
  const wrongRegime = caseRows.filter(r => r.gotForbidden).length;

  const report = {
    goldSet: { path: TRACKED_GOLD_SET.replace(/.*Safety_InSite\//, ''), sha256, cases: cases.length, applicable },
    activeRelease: active?.releaseId ?? null,
    selectionPathFinding:
      'applyFindingScopedStandards() (evidence-foundation) performs citation SELECTION entirely ' +
      'in code with no database access. standards_master is consumed by ' +
      'hydrateStandardReferences() for enrichment (title/summary/sourceKey -> corpusBacked) and ' +
      'by ApplicableStandardsService.suggest() for the separate suggestion path. Governed ' +
      'release filtering of standards_master therefore CANNOT change which citations this ' +
      'engine asserts -- it can only strip their corpus backing.',
    corpus: {
      liveRows: corpus.length,
      currentlyRetrievable: corpus.filter(r => r.is_active === true).length,
      governedRetrievable: recordDiff.filter(r => r.governedRetrievable).length,
      lostUnderGovernedFiltering: lost.length,
    },
    goldSetOutcome: {
      casesEvaluated: cases.length,
      correctUnderCurrentEngine: correct,
      // Identical by construction: the engine never reads the filtered corpus.
      correctUnderGovernedFiltering: correct,
      wrongRegimeMatches: wrongRegime,
      distinctExpectedCitations: expectedCitationsAll.length,
      expectedCitationsGoverned: expectedGovernedCount,
      expectedCitationsLosingCorpusBacking: expectedCitationsAll.length - expectedGovernedCount,
    },
    lostRecords: lost,
    caseRows,
  };

  console.log(JSON.stringify(report, null, 2));
  await dataSource.destroy();
}

main().catch(async error => {
  if (dataSource.isInitialized) await dataSource.destroy();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
