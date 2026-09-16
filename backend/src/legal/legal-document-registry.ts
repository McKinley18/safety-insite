import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

import {
  CounselApproval, LEGAL_DOCUMENT_TYPES, LegalDocumentRecord, LegalDocumentType,
  PublicationState, ResolvedLegalDocument,
} from './legal-document.types';

/**
 * §308 (LG-3) — THE AUTHORITATIVE REGISTRY. WHAT MAY BE PUBLISHED, ENUMERATED BY HAND.
 *
 * ---------------------------------------------------------------------------------------------
 * THERE IS NO DIRECTORY SCAN, AND THAT IS THE DESIGN.
 *
 * §308 is explicit: "no hidden fallback to 'latest file'". So this module never lists a directory.
 * A file in `backend/legal-documents/` is inert until a human writes an entry below naming its
 * exact version, effective date, publication state, approval record and content digest. Dropping a
 * file in does nothing. Renaming one does nothing. The registry is the publication decision, and
 * the filesystem only supplies bytes the registry has already committed to.
 *
 * The consequence worth stating plainly: **the production registry below is EMPTY.** No attorney
 * has approved anything, so there is nothing to publish, so `/terms` and `/privacy` render the
 * bounded pre-publication state. That is the correct state of this product, not a gap in it.
 *
 * ---------------------------------------------------------------------------------------------
 * THE REGISTRY REFUSES TO LOAD RATHER THAN PUBLISHING SOMETHING WRONG.
 *
 * Every check below throws. That is deliberate and it is the strongest available enforcement: this
 * module is imported by the legal module, which is imported by `AppModule`, so a registry that
 * fails validation stops the application from starting. A legal publication surface that degrades
 * gracefully into serving the wrong document is worse than one that will not boot.
 *
 * Five things are refused:
 *
 *   1. A source file that does not exist.
 *   2. A body whose sha256 differs from the declared `expectedDigest`. This is §308's requirement
 *      O — a substantive change under an unchanged version fails the gate — and it is what makes
 *      an accepted version genuinely immutable rather than merely conventionally so.
 *   3. Anything past DRAFT with no counsel approval, or with an empty approver. Code must not turn
 *      DRAFT into APPROVED because a document exists.
 *   4. Anything past DRAFT with no effective date, or ACTIVE with an effective date in the future
 *      — "approved" and "in force" are different facts and the record must not assert both when
 *      only one is true.
 *   5. More than one ACTIVE document of the same type.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE DRAFTS IN `project-docs/legal/` ARE NOT REACHABLE FROM HERE.
 *
 * They carry `LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED` and five unresolved contracting
 * placeholders. §308 forbids presenting them as operative. Rather than relying on a state field to
 * hold that line, the publication root is a DIFFERENT DIRECTORY that the draft tree is not part
 * of, so there is no path expressible in this file that reaches a draft at all.
 */

/** The publication root. `project-docs/legal/` is deliberately NOT this. */
const PUBLICATION_ROOT = resolve(__dirname, '..', '..', 'legal-documents');

/**
 * ===============================================================================================
 * THE PRODUCTION REGISTRY.
 * ===============================================================================================
 *
 * EMPTY, and honestly so. LG-1 and LG-2 are open: the Controlled Beta Terms and the Beta Privacy
 * Notice are drafted, unapproved, and carry unresolved `[LEGAL ENTITY]`, `[ENTITY ADDRESS]`,
 * `[CONTACT EMAIL]`, `[GOVERNING LAW]` and `[BETA TERM]` placeholders.
 *
 * TO PUBLISH AN APPROVED DOCUMENT, this array is the only thing that changes besides adding the
 * approved body file. Nothing else in the architecture moves — not the routes, not the renderer,
 * not the acceptance binding, not the registration flow. That is what §308 meant by "bounded
 * content/configuration publication, not another architecture project", and it is the property the
 * activation fixture below exists to prove in advance.
 *
 *   {
 *     documentType: 'terms',
 *     version: '1.0.0',
 *     title: 'Controlled Beta Terms',
 *     state: 'ACTIVE',
 *     effectiveDate: '2026-11-01',
 *     sourceFile: 'terms-1.0.0.md',
 *     expectedDigest: '<sha256 of the approved body>',
 *     counselApproval: { approver: '<firm or authority>', approvedAt: '2026-10-28' },
 *     synthetic: false,
 *     requiredAtRegistration: true,
 *   }
 */
const PRODUCTION_DOCUMENTS: readonly LegalDocumentRecord[] = [];

/**
 * ===============================================================================================
 * THE SYNTHETIC TEST FIXTURES.
 * ===============================================================================================
 *
 * §308 requires the ACTIVE path to be proven, and it cannot be proven against an empty registry.
 * These exist for that and only that. Every body begins `TEST TERMS — NOT A LEGAL DOCUMENT` or
 * `TEST PRIVACY — NOT A LEGAL DOCUMENT` so that a fixture appearing in front of a person would be
 * unmistakable rather than plausible.
 *
 * Their `counselApproval.approver` is the literal string `SYNTHETIC TEST FIXTURE — NO COUNSEL
 * INVOLVED`, which satisfies the structural requirement without pretending anybody approved
 * anything. The `synthetic: true` flag is what the gates actually key on.
 */
const TEST_FIXTURE_APPROVAL: CounselApproval = {
  approver: 'SYNTHETIC TEST FIXTURE — NO COUNSEL INVOLVED',
  approvedAt: '2026-01-01',
  reference: '§308 activation fixture',
};

const TEST_FIXTURE_DOCUMENTS: readonly LegalDocumentRecord[] = [
  {
    documentType: 'terms',
    version: '0.0.0-test.1',
    title: 'TEST TERMS — NOT A LEGAL DOCUMENT',
    state: 'ACTIVE',
    effectiveDate: '2026-01-01',
    sourceFile: 'test-fixtures/terms-0.0.0-test.1.md',
    expectedDigest: '08e633f1c6fcaf38a3dad465da540f30d200ad1d2a723a7d817fb534dd95e9ef',
    counselApproval: TEST_FIXTURE_APPROVAL,
    synthetic: true,
    requiredAtRegistration: true,
  },
  {
    /*
     * SUPERSEDED, and kept. The supersession test accepts this version first, then activates
     * `0.0.0-test.2`, and proves the earlier acceptance is still attributable to THIS body's
     * digest. Deleting a superseded record would be rewriting history, which is the one thing an
     * acceptance record exists to prevent.
     */
    documentType: 'privacy',
    version: '0.0.0-test.1',
    title: 'TEST PRIVACY — NOT A LEGAL DOCUMENT',
    state: 'SUPERSEDED',
    effectiveDate: '2026-01-01',
    sourceFile: 'test-fixtures/privacy-0.0.0-test.1.md',
    expectedDigest: 'c58811b0d2d7baa671cdd1ac14d43813dd96b1f47a257ac3b71fb69bae628c26',
    counselApproval: TEST_FIXTURE_APPROVAL,
    synthetic: true,
    requiredAtRegistration: true,
  },
  {
    documentType: 'privacy',
    version: '0.0.0-test.2',
    title: 'TEST PRIVACY — NOT A LEGAL DOCUMENT',
    state: 'ACTIVE',
    effectiveDate: '2026-01-02',
    sourceFile: 'test-fixtures/privacy-0.0.0-test.2.md',
    expectedDigest: '4b0cbb4c40df79beffc4ba10ef10d0981a18589b12d8feb38d9013c6351ab2e0',
    counselApproval: TEST_FIXTURE_APPROVAL,
    synthetic: true,
    requiredAtRegistration: true,
  },
];

/**
 * THE HOSTILE-CONTENT FIXTURE, held separately.
 *
 * It proves the renderer treats document bodies as data rather than as markup. It is NOT part of
 * the ordinary fixture set, because an XSS payload sitting in the same array as the documents every
 * other test activates is one careless edit away from being served by a test that did not mean to.
 * It loads only under its own flag.
 */
const HOSTILE_FIXTURE_DOCUMENTS: readonly LegalDocumentRecord[] = [
  {
    documentType: 'terms',
    version: '0.0.0-hostile.1',
    title: 'TEST TERMS — NOT A LEGAL DOCUMENT',
    state: 'ACTIVE',
    effectiveDate: '2026-01-01',
    sourceFile: 'test-fixtures/terms-0.0.0-hostile.1.md',
    expectedDigest: '14a729db5843c4a638163c09b8946ea1af8b0001db5c8f2c353e344793861d31',
    counselApproval: TEST_FIXTURE_APPROVAL,
    synthetic: true,
    requiredAtRegistration: false,
  },
];

/**
 * ===============================================================================================
 * FIXTURE ADMISSION. THREE INDEPENDENT REASONS PRODUCTION CANNOT LOAD A FIXTURE.
 * ===============================================================================================
 *
 * §308: "These fixtures must be impossible to activate accidentally in production." One guard is a
 * preference; three that fail independently is a property.
 *
 *   1. HERE. `NODE_ENV === 'production'` returns false FIRST, before any variable is consulted, so
 *      no environment value can enable fixtures in production. This is not "the flag defaults to
 *      off" — the flag is not reachable.
 *   2. AT BOOT. `validateProductionEnvironment()` throws if the flag is set to anything at all in
 *      production, so a misconfigured service fails loudly rather than silently ignoring it.
 *   3. AT THE GATE. `check:legal-documents` asserts the PRODUCTION registry contains no synthetic
 *      document, which would catch a fixture pasted into the production array by hand — the one
 *      mistake the first two guards cannot see.
 */
export function legalTestFixturesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (String(env.NODE_ENV || '').trim() === 'production') return false;
  return String(env.LEGAL_TEST_FIXTURES || '').trim().toLowerCase() === 'true';
}

export function legalHostileFixtureEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (String(env.NODE_ENV || '').trim() === 'production') return false;
  return String(env.LEGAL_HOSTILE_FIXTURE || '').trim().toLowerCase() === 'true';
}

/** The registry entries in force for an environment, before validation. */
export function registryEntriesFor(env: NodeJS.ProcessEnv = process.env): readonly LegalDocumentRecord[] {
  const entries: LegalDocumentRecord[] = [...PRODUCTION_DOCUMENTS];
  if (legalTestFixturesEnabled(env)) entries.push(...TEST_FIXTURE_DOCUMENTS);
  if (legalHostileFixtureEnabled(env)) entries.push(...HOSTILE_FIXTURE_DOCUMENTS);
  return entries;
}

/** The production registry alone, for the gate that proves no fixture leaked into it. */
export function productionRegistryEntries(): readonly LegalDocumentRecord[] {
  return PRODUCTION_DOCUMENTS;
}

export function digestOf(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

const STATES_REQUIRING_APPROVAL: readonly PublicationState[] =
  ['APPROVED_NOT_EFFECTIVE', 'ACTIVE', 'SUPERSEDED'];

export class LegalRegistryError extends Error {}

/**
 * Read, verify and freeze the registry for an environment.
 *
 * `now` is a parameter rather than `new Date()` so the future-effective-date rule is testable
 * without moving a machine clock — the §308 suite asserts both sides of it.
 */
export function resolveRegistry(
  env: NodeJS.ProcessEnv = process.env,
  now: Date = new Date(),
): readonly ResolvedLegalDocument[] {
  const entries = registryEntriesFor(env);
  const resolved: ResolvedLegalDocument[] = [];

  for (const entry of entries) {
    const label = `${entry.documentType}@${entry.version}`;

    if (!LEGAL_DOCUMENT_TYPES.includes(entry.documentType)) {
      throw new LegalRegistryError(`§308 REGISTRY REFUSED: ${label} declares an unknown document type.`);
    }

    /*
     * The path is joined under the publication root and then checked to still be inside it, so a
     * `sourceFile` containing `../` cannot reach `project-docs/legal/` or anywhere else. The
     * registry is hand-written, so this is not defending against a hostile author — it is
     * defending against a plausible typo that would publish a draft.
     */
    const full = join(PUBLICATION_ROOT, entry.sourceFile);
    if (!resolve(full).startsWith(resolve(PUBLICATION_ROOT) + '/')) {
      throw new LegalRegistryError(
        `§308 REGISTRY REFUSED: ${label} names a source file outside the publication root. `
        + 'Published bodies live in backend/legal-documents/ and nowhere else.');
    }
    if (!existsSync(full)) {
      throw new LegalRegistryError(`§308 REGISTRY REFUSED: ${label} names a source file that does not exist: ${entry.sourceFile}`);
    }

    const body = readFileSync(full, 'utf8');
    const documentDigest = digestOf(body);
    if (documentDigest !== entry.expectedDigest) {
      throw new LegalRegistryError(
        `§308 REGISTRY REFUSED: ${label} has been edited without a new version. `
        + `The registry declares ${entry.expectedDigest} and the file is ${documentDigest}. `
        + 'A published version is immutable: publish a NEW version rather than changing this one, '
        + 'because acceptances already recorded point at the declared digest.');
    }

    if (STATES_REQUIRING_APPROVAL.includes(entry.state)) {
      if (!entry.counselApproval || !String(entry.counselApproval.approver || '').trim()) {
        throw new LegalRegistryError(
          `§308 REGISTRY REFUSED: ${label} is ${entry.state} with no counsel approval recorded. `
          + 'Engineering cannot promote a document past DRAFT; approval is the product owner\'s and '
          + 'counsel\'s to give, and its absence is not something code may work around.');
      }
      if (!entry.effectiveDate) {
        throw new LegalRegistryError(`§308 REGISTRY REFUSED: ${label} is ${entry.state} with no effective date.`);
      }
    } else if (entry.counselApproval) {
      throw new LegalRegistryError(
        `§308 REGISTRY REFUSED: ${label} is DRAFT but carries a counsel approval. `
        + 'A DRAFT that somebody approved is not a DRAFT; move it to APPROVED_NOT_EFFECTIVE or ACTIVE.');
    }

    if (entry.state === 'ACTIVE') {
      const effective = new Date(`${entry.effectiveDate}T00:00:00Z`);
      if (Number.isNaN(effective.getTime())) {
        throw new LegalRegistryError(`§308 REGISTRY REFUSED: ${label} has an unparseable effective date.`);
      }
      if (effective.getTime() > now.getTime()) {
        throw new LegalRegistryError(
          `§308 REGISTRY REFUSED: ${label} is ACTIVE with an effective date in the future `
          + `(${entry.effectiveDate}). Approved and in force are different facts; use `
          + 'APPROVED_NOT_EFFECTIVE until the date arrives.');
      }
    }

    resolved.push({ ...entry, body, documentDigest });
  }

  for (const type of LEGAL_DOCUMENT_TYPES) {
    const active = resolved.filter((d) => d.documentType === type && d.state === 'ACTIVE');
    if (active.length > 1) {
      throw new LegalRegistryError(
        `§308 REGISTRY REFUSED: ${active.length} ACTIVE ${type} documents `
        + `(${active.map((d) => d.version).join(', ')}). Exactly one version of a document type may `
        + 'be in force, or "the current Terms" has no answer.');
    }
    const versions = resolved.filter((d) => d.documentType === type).map((d) => d.version);
    if (new Set(versions).size !== versions.length) {
      throw new LegalRegistryError(`§308 REGISTRY REFUSED: duplicate ${type} version in the registry.`);
    }
  }

  return Object.freeze(resolved);
}

/** The publication root, exported for the gate's reporting only. */
export const LEGAL_PUBLICATION_ROOT = PUBLICATION_ROOT;
export type { LegalDocumentType };
