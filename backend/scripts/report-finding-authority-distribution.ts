/**
 * The authority distribution of everything a customer workflow actually persisted.
 *
 * Reads `inspection_findings.sourceCandidate.standardCandidates[]` -- the exact structure the API,
 * the UI and the report consume -- and counts what each candidate CLAIMS. Deliberately a report
 * and not a gate: the correct governed count is whatever genuine release-scoped resolution
 * produces, and a threshold here would turn a measurement into a target.
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';

async function main() {
  const ds = await dataSource.initialize();
  const findings = await ds.query(
    `SELECT f.id, f."inspectionId", f."knowledgeReleaseId", f."hazardKey", f."hazardCategory", f."sourceCandidate",
            i."knowledgeReleaseId" AS "inspectionReleaseId"
       FROM inspection_findings f LEFT JOIN inspection i ON i.id = f."inspectionId"
      ORDER BY f."createdAt"`,
  );
  const rows: any[] = [];
  const states: Record<string, number> = {};
  for (const finding of findings) {
    const candidates = Array.isArray(finding.sourceCandidate?.standardCandidates)
      ? finding.sourceCandidate.standardCandidates : [];
    for (const candidate of candidates) {
      const state = candidate.authorityState ?? 'UNANNOTATED';
      states[state] = (states[state] || 0) + 1;
      rows.push({
        findingId: finding.id,
        hazardKey: finding.hazardKey, hazardCategory: finding.hazardCategory,
        citation: candidate.citation,
        authorityState: state,
        findingKnowledgeReleaseId: finding.knowledgeReleaseId ?? null,
        inspectionKnowledgeReleaseId: finding.inspectionReleaseId ?? null,
        governedReleaseId: candidate.governedReleaseId ?? null,
        governedReleaseMember: candidate.governedReleaseMember ?? null,
        governedRecordChecksum: candidate.governedRecordChecksum ?? null,
        effectiveReviewState: candidate.effectiveReviewState ?? null,
        reviewerId: candidate.reviewerId ?? null,
        corpusBacked: candidate.corpusBacked ?? null,
        contentDisclosure: candidate.contentDisclosure ?? null,
        backingStatus: candidate.backingStatus ?? null,
      });
    }
  }
  const summary = {
    inspections: await ds.query(
      `SELECT id, title, status, "knowledgeReleaseId" FROM inspection ORDER BY "createdAt"`),
    analyses: await ds.query(
      `SELECT id, "observationId", status, "knowledgeReleaseId" FROM hazlenz_analyses ORDER BY "createdAt"`),
    persistedFindings: findings.length,
    persistedStandardCandidates: rows.length,
    authorityStates: states,
    corpusBackedTrue: rows.filter(r => r.corpusBacked === true).length,
    reviewerPresent: rows.filter(r => Boolean(r.reviewerId)).length,
    checksumPresent: rows.filter(r => Boolean(r.governedRecordChecksum)).length,
    findingReleaseNull: rows.filter(r => !r.findingKnowledgeReleaseId).length,
    governedApproved: rows.filter(r => r.authorityState === 'APPROVED_GOVERNED_CONTENT').length,
    candidates: rows,
  };
  console.log(JSON.stringify(summary, null, 2));
  await ds.destroy();
}
main().catch(e => { console.error(e); process.exit(1); });
