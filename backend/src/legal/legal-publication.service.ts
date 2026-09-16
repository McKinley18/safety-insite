import { Injectable } from '@nestjs/common';

import { productName } from '../auth/password-reset-transport';
import {
  LEGAL_DOCUMENT_TYPES, LegalDocumentResponse, LegalDocumentType, ResolvedLegalDocument,
} from './legal-document.types';
import { resolveRegistry } from './legal-document-registry';

/**
 * §308 (LG-3) — WHAT IS PUBLISHED, RIGHT NOW, ACCORDING TO THE SERVER.
 *
 * ---------------------------------------------------------------------------------------------
 * THE REGISTRY IS RESOLVED ONCE, AT CONSTRUCTION.
 *
 * Re-reading the files per request would mean a document could change underneath a reader between
 * the moment they opened it and the moment they accepted it, which is exactly the property the
 * digest exists to rule out. Resolving once also means the validation in `resolveRegistry` runs at
 * application START: a registry that fails its checks stops the service rather than serving a
 * wrong document, which for a legal publication surface is the correct trade.
 *
 * ---------------------------------------------------------------------------------------------
 * THE PRODUCT NAME IS CONFIGURATION, NOT A CONSTANT.
 *
 * §308: the product name changes before external Beta, so it must not be hard-coded into the
 * publication framework. `productName(env)` is the authority §306 already established, and this
 * imports it rather than introducing a second one — two sources of truth for a brand is how a
 * rename half-lands. It is used only for the FRAMEWORK's own prose (titles and the
 * pre-publication explanation). It is never applied to a document BODY: rewriting the text of a
 * legal document is not engineering's to do, and §308 says so explicitly.
 */
@Injectable()
export class LegalPublicationService {
  private readonly documents: readonly ResolvedLegalDocument[];

  constructor() {
    this.documents = resolveRegistry();
  }

  /** Every registry entry, whatever its state. Never exposed publicly — gates and tests only. */
  allDocuments(): readonly ResolvedLegalDocument[] {
    return this.documents;
  }

  /** The one ACTIVE document of a type, or null. Null is the ordinary answer today. */
  activeDocument(type: LegalDocumentType): ResolvedLegalDocument | null {
    return this.documents.find((d) => d.documentType === type && d.state === 'ACTIVE') ?? null;
  }

  /** Every ACTIVE document. The set registration must bind to. */
  activeDocuments(): readonly ResolvedLegalDocument[] {
    return LEGAL_DOCUMENT_TYPES
      .map((type) => this.activeDocument(type))
      .filter((d): d is ResolvedLegalDocument => d !== null);
  }

  /**
   * The ACTIVE documents whose acceptance completes registration.
   *
   * WITH NOTHING ACTIVE THIS IS EMPTY, AND THAT IS THE POINT. §308 forbids registration from
   * beginning to enforce acceptance against invented versions merely to make a test pass. Because
   * the requirement is DERIVED from publication state rather than configured beside it, today's
   * behaviour is unchanged and activation turns enforcement on by itself — there is no second
   * switch anybody can forget.
   */
  requiredAtRegistration(): readonly ResolvedLegalDocument[] {
    return this.activeDocuments().filter((d) => d.requiredAtRegistration);
  }

  /**
   * THE PUBLIC RESPONSE. The only method a public route may call.
   *
   * §308 forbids four dishonesties when nothing is ACTIVE, and none of them is expressible here:
   * there is no body to fill with draft text, no version, no effective date, and
   * `acceptanceAvailable` is stated rather than inferred. `NOT_YET_PUBLISHED` is also deliberately
   * not an error — the engineering surface is working, and saying so is more accurate than a 404
   * that suggests it is not.
   */
  publicResponse(type: LegalDocumentType): LegalDocumentResponse {
    const active = this.activeDocument(type);
    const brand = productName();
    if (active) {
      return {
        documentType: type,
        status: 'ACTIVE',
        title: active.title,
        version: active.version,
        effectiveDate: active.effectiveDate as string,
        documentDigest: active.documentDigest,
        body: active.body,
        acceptanceAvailable: true,
        synthetic: active.synthetic,
      };
    }
    const label = type === 'terms' ? 'Terms of Service' : 'Privacy Notice';
    return {
      documentType: type,
      status: 'NOT_YET_PUBLISHED',
      title: `${brand} — ${label}`,
      /*
       * TRUE, AND SAYING NOTHING IT SHOULD NOT. It does not name a repository path, a draft, a
       * filename, a reviewer or an internal note — §308 lists all of those as things a public
       * legal route must not expose. What it does say is the actual reason, because "unavailable"
       * with no reason reads as a fault rather than as a state.
       */
      reason: `No ${label} has been approved for publication yet, so none is in force. `
        + 'Nothing here has been reviewed by legal counsel, and this product does not present an '
        + 'unapproved draft as though it were operative.',
      acceptanceAvailable: false,
      awaiting: 'Legal counsel review and approval of the document, and authorisation of an '
        + 'effective date by the product owner.',
    };
  }

  /**
   * The publication status of every type, without any body. Safe for an index or a footer, and the
   * shape the frontend uses to decide whether to offer an acceptance control at all.
   */
  publicationSummary() {
    return LEGAL_DOCUMENT_TYPES.map((type) => {
      const active = this.activeDocument(type);
      return {
        documentType: type,
        status: active ? ('ACTIVE' as const) : ('NOT_YET_PUBLISHED' as const),
        version: active?.version ?? null,
        effectiveDate: active?.effectiveDate ?? null,
        documentDigest: active?.documentDigest ?? null,
        acceptanceAvailable: Boolean(active),
        requiredAtRegistration: Boolean(active?.requiredAtRegistration),
      };
    });
  }
}
