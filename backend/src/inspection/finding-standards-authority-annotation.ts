import { EntityManager } from 'typeorm';
import {
  FindingStandardAuthority,
  resolveFindingStandardAuthority,
} from '../standards/releases/finding-standards-authority';

/**
 * FINDING-LEVEL GOVERNED AUTHORITY ANNOTATION — 2026-08-28.
 *
 * Where the governed authority state is attached to what a customer actually keeps.
 *
 * WHY HERE. `reconcileDecompositionFindings()` is the only engine path that writes
 * `inspection_findings`, and it is the point where BOTH halves of the question are in hand at once:
 * the hazard's code-resident standard candidates, and `analysis.knowledgeReleaseId` — the release
 * that governed the analysis those candidates came from. Annotating earlier would have no release;
 * annotating later would have no candidates.
 *
 * WHAT IT GUARANTEES.
 *
 *   - Every persisted standard candidate carries an explicit authority state. There is no longer a
 *     silent middle where a reader must infer authority from the presence of text or a source key.
 *   - Authority is granted by `resolveFindingStandardAuthority`, from release membership and
 *     effective review state — never from citation-string equality.
 *   - When no release governs the analysis (`knowledgeReleaseId` is NULL, which KG-1 records
 *     truthfully whenever retrieval is unscoped), every candidate resolves
 *     `LEGACY_CODE_RESIDENT_CONTENT`. That is the honest label for what the code-resident rule set
 *     produces, and it is unreachable from `APPROVED_GOVERNED_CONTENT`.
 *   - Reviewer identity and the record checksum appear ONLY on an approved member of that release.
 *
 * WHAT IT MUST NEVER DO. It must not remove, suppress or downgrade a hazard. Regulatory authority
 * and hazard recognition are separate concerns: a finding whose standards resolve to
 * `NO_GOVERNED_MATCH` keeps its hazard, its risk and its corrective action, and simply says so
 * about its standards. A failure inside this annotation is caught and the finding is persisted
 * with its candidates unannotated rather than lost — an unannotated candidate reads as
 * un-governed, which is the safe direction.
 */
export interface AnnotatedStandardCandidate {
  citation?: string;
  authorityState?: FindingStandardAuthority['state'];
  governedReleaseId?: string | null;
  governedReleaseMember?: boolean;
  governedRecordChecksum?: string | null;
  effectiveReviewState?: string | null;
  reviewerId?: string | null;
  reviewerRole?: string | null;
  reviewedAt?: string | null;
  corpusBacked?: boolean;
  contentDisclosure?: FindingStandardAuthority['contentDisclosure'];
  authorityReason?: string;
  [key: string]: unknown;
}

/**
 * Annotates one hazard's `standardCandidates` in place and returns how many were annotated.
 *
 * `releaseId` is the release that governs this finding. `null` is the ordinary case today and is
 * not an error: it means no release governed the analysis, so nothing may claim governed authority.
 */
export async function annotateFindingStandardsAuthority(
  manager: EntityManager,
  hazard: Record<string, unknown>,
  releaseId: string | null,
): Promise<number> {
  const candidates = Array.isArray((hazard as any)?.standardCandidates)
    ? ((hazard as any).standardCandidates as AnnotatedStandardCandidate[])
    : [];
  if (!candidates.length) return 0;

  let annotated = 0;
  for (const candidate of candidates) {
    const citation = String(candidate?.citation || '').trim();
    if (!citation) continue;
    let authority: FindingStandardAuthority;
    try {
      authority = await resolveFindingStandardAuthority(manager.connection, {
        citation,
        releaseId,
        // No release means governed resolution has nothing to resolve against. Saying so
        // explicitly is what keeps the result LEGACY rather than an accidental NO_GOVERNED_MATCH,
        // which would wrongly imply the governed corpus was consulted and came back empty.
        skipGovernedResolution: !releaseId,
      });
    } catch {
      // Leave the candidate unannotated: absent an authority state a reader must treat it as
      // un-governed, and the finding itself is untouched.
      continue;
    }
    candidate.authorityState = authority.state;
    candidate.governedReleaseId = authority.releaseId;
    candidate.governedReleaseMember = authority.releaseMember;
    candidate.governedRecordChecksum = authority.recordChecksum;
    candidate.effectiveReviewState = authority.effectiveReviewState;
    candidate.reviewerId = authority.reviewerId;
    candidate.reviewerRole = authority.reviewerRole;
    candidate.reviewedAt = authority.decidedAt;
    candidate.corpusBacked = authority.corpusBacked;
    candidate.contentDisclosure = authority.contentDisclosure;
    candidate.authorityReason = authority.reason;
    annotated += 1;
  }
  return annotated;
}
