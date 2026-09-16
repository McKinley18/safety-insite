import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { LEGAL_DOCUMENT_TYPES, LegalDocumentType } from './legal-document.types';
import { LegalPublicationService } from './legal-publication.service';

/**
 * §308 (LG-3) — THE PUBLIC LEGAL PUBLICATION ROUTES.
 *
 * ---------------------------------------------------------------------------------------------
 * UNAUTHENTICATED, DELIBERATELY, AND THAT IS NOT A WEAKENING.
 *
 * A Terms document nobody can read without an account is not published. §308 requires both routes
 * to be reachable without authentication, and the registration page has to be able to link to them
 * before an account exists at all. They carry no guard for that reason — which is the same reason
 * `/health` carries none — and the surface they expose is a document that was approved for public
 * publication, so there is nothing here an authenticated caller would be entitled to that an
 * anonymous one is not.
 *
 * They are still inside the global 100/60s throttle, and they carry an explicit route throttle of
 * their own because an unauthenticated route that reads a cached string is exactly the shape
 * someone points a script at.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS ROUTE CANNOT LEAK, BY CONSTRUCTION RATHER THAN BY CARE.
 *
 * §308 lists filesystem paths, draft repository paths, approval notes, counsel communications,
 * internal legal comments, unpublished drafts and server configuration. None of them is reachable:
 * the controller returns exactly what `publicResponse()` builds, that shape has no field capable
 * of carrying any of them, and the only body it can ever contain belongs to a document in state
 * ACTIVE. `sourceFile`, `expectedDigest`, `counselApproval` and every DRAFT record stay inside the
 * service, which is why the response type is a separate type rather than the record itself.
 *
 * ---------------------------------------------------------------------------------------------
 * A BAD TYPE IS 400, NOT 404.
 *
 * `/legal/documents/nonsense` is a malformed request, not a missing document — and the distinction
 * matters here more than usual, because §308 requires that `/terms` and `/privacy` never 404 "due
 * missing engineering". Reserving 404 for nothing at all on this controller means a 404 from this
 * path is always a routing fault and never a publication state.
 */
@Controller('legal')
export class LegalController {
  constructor(private readonly legal: LegalPublicationService) {}

  /** The publication status of every document type. No bodies. */
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get('documents')
  summary() {
    return { documents: this.legal.publicationSummary() };
  }

  /**
   * The ACTIVE document of a type, or the bounded pre-publication state.
   *
   * ALWAYS 200 FOR A VALID TYPE. "Not yet published" is a state of the publication process, not a
   * failure of this endpoint, and answering 404 would make a working surface indistinguishable
   * from the missing one LG-3 was raised about.
   */
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get('documents/:documentType')
  document(@Param('documentType') documentType: string) {
    if (!LEGAL_DOCUMENT_TYPES.includes(documentType as LegalDocumentType)) {
      throw new BadRequestException(
        `Unknown legal document type. Supported types: ${LEGAL_DOCUMENT_TYPES.join(', ')}.`,
      );
    }
    return this.legal.publicResponse(documentType as LegalDocumentType);
  }
}
