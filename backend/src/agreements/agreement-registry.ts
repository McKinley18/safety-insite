import { createHash } from 'crypto';

/**
 * §291 (SU-1 / SU-3) — WHAT A USER IS BEING ASKED TO ACCEPT, STATED HONESTLY.
 *
 * ==================== THE ONE THING THIS FILE MUST NOT DO ====================
 *
 * It must not imply that anything here is counsel-approved, because nothing is. LG-1, LG-2, LG-3
 * and SU-2 are all open at Threshold C and §291 is explicit that building this capability closes
 * none of them. So the agreement below is NAMED for what it is -- an internal, pre-beta
 * acknowledgement -- and its `counselStatus` says so in a field, not a comment, so that any
 * surface rendering it inherits the qualification rather than having to remember it.
 *
 * ==================== WHY THE VERSION IS PART OF THE IDENTITY ====================
 *
 * An acceptance that does not record WHICH TEXT was accepted is not evidence of anything. A year
 * from now the question will not be "did they tick a box", it will be "what did the document say
 * when they ticked it". So an acceptance binds three things -- agreement id, version, and a digest
 * of the exact text -- and the digest is computed from the body at module load rather than
 * maintained by hand, because a hand-maintained digest goes stale the first time someone fixes a
 * typo and that is precisely when it matters.
 *
 * Raising `version` is therefore a deliberate act that makes every existing acceptance of the
 * older version outstanding again. That is the re-acceptance mechanism, and it needs no policy
 * engine: a stored version is either the required one or it is not.
 */
export type CounselStatus = 'NOT_COUNSEL_REVIEWED' | 'COUNSEL_APPROVED';

export interface AgreementDefinition {
  readonly agreementId: string;
  readonly version: string;
  readonly title: string;
  readonly counselStatus: CounselStatus;
  readonly appliesTo: 'INTERNAL_OWNER_USE' | 'EXTERNAL_BETA';
  readonly requiredAtRegistration: boolean;
  readonly body: string;
}

const INTERNAL_PRE_BETA_ACKNOWLEDGEMENT: AgreementDefinition = {
  agreementId: 'internal-pre-beta-acknowledgement',
  version: '2026-09-14.1',
  title: 'Safety InSite — Internal / Pre-Beta Use Acknowledgement',
  counselStatus: 'NOT_COUNSEL_REVIEWED',
  appliesTo: 'INTERNAL_OWNER_USE',
  requiredAtRegistration: true,
  body: [
    'This acknowledgement covers INTERNAL and OWNER-CONTROLLED evaluation of Safety InSite only.',
    '',
    'It is NOT the Terms of Service, it is NOT a privacy notice, and it has NOT been reviewed by',
    'legal counsel. It does not authorise external use, and accepting it grants no licence and',
    'creates no commercial relationship.',
    '',
    'Safety InSite does not perform a statutory workplace examination and does not itself satisfy',
    'any recordkeeping obligation. Where a regulation requires an examination by a competent person',
    'designated by the operator, and requires the operator to make and retain the record, those',
    'duties remain with the operator and are not transferred by using this software.',
    '',
    'HazLenz analysis is advisory. It does not detect all hazards, does not guarantee compliance,',
    'and does not replace an inspection or the judgement of a qualified person. Every output must',
    'be reviewed by qualified personnel before it is relied on.',
    '',
    'This is pre-release software under evaluation. It may contain defects, its behaviour may',
    'change, and data entered during evaluation may be removed.',
  ].join('\n'),
};

/**
 * The agreements defined in THIS file. §308 adds a second source — the published legal documents —
 * and `allAgreements()` below is the composition. This stays exported under its original name
 * because it is the static set, and a reader who wants "what does this file define" should not have
 * to disentangle it from what the legal registry contributes.
 */
export const AGREEMENTS: readonly AgreementDefinition[] = [INTERNAL_PRE_BETA_ACKNOWLEDGEMENT];

/**
 * §308 (LG-3) — PUBLISHED LEGAL DOCUMENTS ARE AGREEMENTS, AND THE BINDING IS THE §291 ONE.
 *
 * ==================== WHY THIS IS A PROJECTION AND NOT A SECOND SYSTEM ====================
 *
 * §308 requires the server to record, for each accepted legal document, the exact type, version,
 * digest, timestamp and user — and to refuse a caller-chosen version, a caller-chosen digest and a
 * superseded version. Every one of those is a property `AgreementsService` was already built to
 * have at §291 and already proves: `resolve()` refuses an unknown or stale version, the digest is
 * computed from the server's own copy, the timestamp is server-generated, and the evidence row is
 * insert-only with a unique index per (user, agreement, version).
 *
 * Building a parallel acceptance table for legal documents would have duplicated all of it and
 * given the two copies somewhere to drift — the defect class this repository has repeatedly paid
 * for. So an ACTIVE legal document is PROJECTED into the agreement shape instead, and inherits the
 * proven machinery unchanged. It also means no migration: `agreement_acceptances` already carries
 * `agreementId`, `agreementVersion` and a 64-character `documentDigest`, which is exactly a sha256.
 *
 * ==================== THE COUNSEL STATUS IS CARRIED, NOT ASSUMED ====================
 *
 * A projected document reports `COUNSEL_APPROVED`, and it may do so only because the legal registry
 * refuses to load an ACTIVE document with no counsel approval recorded. The claim is therefore
 * inherited from a check rather than asserted here. The internal acknowledgement above remains
 * `NOT_COUNSEL_REVIEWED`, and §308 does not change that.
 */
export function projectLegalDocument(document: {
  readonly documentType: string;
  readonly version: string;
  readonly title: string;
  readonly body: string;
  readonly requiredAtRegistration: boolean;
}): AgreementDefinition {
  return {
    agreementId: `legal:${document.documentType}`,
    version: document.version,
    title: document.title,
    counselStatus: 'COUNSEL_APPROVED',
    appliesTo: 'EXTERNAL_BETA',
    requiredAtRegistration: document.requiredAtRegistration,
    body: document.body,
  };
}

/**
 * Every agreement in force: the static set plus the projected ACTIVE legal documents.
 *
 * The legal documents are supplied by the caller rather than imported, so this module stays a pure
 * description of agreements and the composition happens in `AgreementsService`, which is where the
 * legal registry is already injected. It also keeps this file loadable by a test that wants to
 * assert the static set alone.
 */
export function allAgreements(
  projectedLegalDocuments: readonly AgreementDefinition[] = [],
): readonly AgreementDefinition[] {
  return [...AGREEMENTS, ...projectedLegalDocuments];
}

export function documentDigest(agreement: AgreementDefinition): string {
  return createHash('sha256').update(agreement.body, 'utf8').digest('hex');
}

export function findAgreement(
  agreementId: string,
  projectedLegalDocuments: readonly AgreementDefinition[] = [],
): AgreementDefinition | undefined {
  return allAgreements(projectedLegalDocuments).find(a => a.agreementId === agreementId);
}

/** The agreements a user must have accepted, at their CURRENT versions, to register. */
export function agreementsRequiredAtRegistration(
  projectedLegalDocuments: readonly AgreementDefinition[] = [],
): readonly AgreementDefinition[] {
  return allAgreements(projectedLegalDocuments).filter(a => a.requiredAtRegistration);
}

export function describeAgreement(agreement: AgreementDefinition) {
  return {
    agreementId: agreement.agreementId,
    version: agreement.version,
    title: agreement.title,
    counselStatus: agreement.counselStatus,
    appliesTo: agreement.appliesTo,
    /**
     * §308. Exposed so the registration client can send an acceptance for EVERY agreement the
     * server requires rather than for one it was hard-coded to look for. Before §308 the register
     * page searched the list for `appliesTo === 'INTERNAL_OWNER_USE'`, which would have silently
     * ignored published Terms and Privacy the moment they existed.
     */
    requiredAtRegistration: agreement.requiredAtRegistration,
    documentDigest: documentDigest(agreement),
    body: agreement.body,
  };
}
