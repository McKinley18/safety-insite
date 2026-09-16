/**
 * §308 (LG-3) — THE LEGAL PUBLICATION CONTRACT.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A LIFECYCLE AND NOT A BOOLEAN.
 *
 * "Is this document published?" is the question a boolean answers, and it is the wrong question.
 * The states below exist because each of them is a real, distinguishable situation that the
 * product is in RIGHT NOW or will be in shortly, and collapsing any two of them loses something a
 * customer or a regulator would later ask about:
 *
 *   DRAFT                  engineering wrote it; no attorney has read it. Every document in
 *                          `project-docs/legal/` is in this state today. A DRAFT is never served
 *                          to a customer and its body never leaves the repository.
 *
 *   APPROVED_NOT_EFFECTIVE counsel has approved this exact text, and it is not yet operative —
 *                          typically because its effective date is in the future. This is a real
 *                          state and not a formality: "approved" and "in force" are different
 *                          facts, and a Terms document that takes effect on a date is the ordinary
 *                          shape rather than the exotic one.
 *
 *   ACTIVE                 counsel-approved AND effective. Exactly one document per type may be
 *                          ACTIVE, this is the only state whose body is served publicly, and it is
 *                          the only state a registration acceptance can bind to.
 *
 *   SUPERSEDED             was ACTIVE; a later version replaced it. It is kept because historical
 *                          acceptances point at it. Superseding a version must never rewrite what
 *                          somebody accepted, so the record stays and only the state moves.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT CODE MAY NOT DO, STATED AS A TYPE RATHER THAN A CONVENTION.
 *
 * §308's central rule is that code must not convert DRAFT into APPROVED merely because a document
 * exists. So `counselApproval` is a REQUIRED property of the record rather than an optional
 * annotation, and it is `null` for anything not approved. A registry entry claiming ACTIVE with a
 * null approval is rejected by the registry at load — the application refuses to start rather than
 * serving a document that asserts an authority nobody granted.
 */

/** The document types the product publishes. Adding one is a deliberate act, not a file drop. */
export type LegalDocumentType = 'terms' | 'privacy';

export const LEGAL_DOCUMENT_TYPES: readonly LegalDocumentType[] = ['terms', 'privacy'];

export type PublicationState =
  | 'DRAFT'
  | 'APPROVED_NOT_EFFECTIVE'
  | 'ACTIVE'
  | 'SUPERSEDED';

/**
 * WHO APPROVED IT, AND WHEN. Engineering cannot synthesise this.
 *
 * `approver` is free text because the product owner may engage counsel under a firm name, an
 * individual name or an internal authority, and inventing a taxonomy for that would be engineering
 * deciding something that is not engineering's to decide. What engineering DOES enforce is that
 * the field is present and non-empty for anything past DRAFT.
 */
export interface CounselApproval {
  /** The named authority that approved this exact text. */
  readonly approver: string;
  /** ISO date on which the approval was given. */
  readonly approvedAt: string;
  /** Optional free-text reference: an engagement number, a letter reference, a decision record. */
  readonly reference?: string;
}

export interface LegalDocumentRecord {
  readonly documentType: LegalDocumentType;
  /**
   * The IMMUTABLE version identity. Once a version has been published and accepted, its body may
   * never change; a substantive change requires a new version. `check:legal-documents` enforces
   * that by recomputing the digest from the file, and the registry refuses to load on a mismatch.
   */
  readonly version: string;
  readonly title: string;
  readonly state: PublicationState;
  /** ISO date on which this version becomes/became operative. Null while DRAFT. */
  readonly effectiveDate: string | null;
  /** Path relative to `backend/legal-documents/`. */
  readonly sourceFile: string;
  /** sha256 of the exact body bytes, declared in the registry and re-derived from the file. */
  readonly expectedDigest: string;
  /** Null for DRAFT. Required, and non-empty, for every other state. */
  readonly counselApproval: CounselApproval | null;
  /**
   * TRUE for test fixtures. A synthetic document can never be served in production: the fixture
   * array is not even merged when NODE_ENV is production, and the gate asserts the production
   * registry contains none. Marked on the record as well so that any surface which somehow
   * received one can still tell.
   */
  readonly synthetic: boolean;
  /** Whether accepting this document is required to complete registration while it is ACTIVE. */
  readonly requiredAtRegistration: boolean;
}

/** A registry entry plus the body actually read from disk and the digest actually computed. */
export interface ResolvedLegalDocument extends LegalDocumentRecord {
  readonly body: string;
  /** Recomputed from `body`. Equal to `expectedDigest` or the registry refuses to load. */
  readonly documentDigest: string;
}

/**
 * WHAT A PUBLIC ROUTE RETURNS WHEN NOTHING IS ACTIVE.
 *
 * §308 forbids four specific dishonesties here, and the shape exists to make each of them
 * unrepresentable rather than merely discouraged: there is no `body` field to put draft text in,
 * no `effectiveDate` to claim, no `version` to imply one exists, and `acceptanceAvailable` is a
 * stated fact rather than something a client infers from an absence.
 */
export interface LegalDocumentUnavailable {
  readonly documentType: LegalDocumentType;
  readonly status: 'NOT_YET_PUBLISHED';
  readonly title: string;
  readonly reason: string;
  readonly acceptanceAvailable: false;
  /** What has to happen for this to become available. Customer-readable, and true. */
  readonly awaiting: string;
}

export interface LegalDocumentPublished {
  readonly documentType: LegalDocumentType;
  readonly status: 'ACTIVE';
  readonly title: string;
  readonly version: string;
  readonly effectiveDate: string;
  readonly documentDigest: string;
  readonly body: string;
  readonly acceptanceAvailable: true;
  readonly synthetic: boolean;
}

export type LegalDocumentResponse = LegalDocumentPublished | LegalDocumentUnavailable;
