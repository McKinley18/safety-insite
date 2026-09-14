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

export const AGREEMENTS: readonly AgreementDefinition[] = [INTERNAL_PRE_BETA_ACKNOWLEDGEMENT];

export function documentDigest(agreement: AgreementDefinition): string {
  return createHash('sha256').update(agreement.body, 'utf8').digest('hex');
}

export function findAgreement(agreementId: string): AgreementDefinition | undefined {
  return AGREEMENTS.find(a => a.agreementId === agreementId);
}

/** The agreements a user must have accepted, at their CURRENT versions, to register. */
export function agreementsRequiredAtRegistration(): readonly AgreementDefinition[] {
  return AGREEMENTS.filter(a => a.requiredAtRegistration);
}

export function describeAgreement(agreement: AgreementDefinition) {
  return {
    agreementId: agreement.agreementId,
    version: agreement.version,
    title: agreement.title,
    counselStatus: agreement.counselStatus,
    appliesTo: agreement.appliesTo,
    documentDigest: documentDigest(agreement),
    body: agreement.body,
  };
}
