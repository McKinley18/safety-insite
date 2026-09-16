import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgreementAcceptance } from './agreement-acceptance.entity';
import {
  AgreementDefinition, agreementsRequiredAtRegistration,
  allAgreements, describeAgreement, documentDigest, findAgreement, projectLegalDocument,
} from './agreement-registry';
import { LegalPublicationService } from '../legal/legal-publication.service';

export interface AcceptanceInput {
  readonly agreementId: string;
  readonly agreementVersion: string;
}

/**
 * §291 (SU-1 / SU-3) — THE SERVER DECIDES WHAT WAS ACCEPTED, NOT THE CLIENT.
 *
 * §288 recorded the defect precisely: acceptance was evaluated client-side and never transmitted,
 * so a tick in a browser was the entire evidential record and vanished with the page. Everything
 * here follows from inverting that.
 *
 * THE CLIENT SENDS AN ASSERTION, NOT A RECORD. It says "I accepted agreement X version Y". The
 * server checks that X exists and that Y is the version currently required -- a client cannot
 * accept a version that has been superseded, nor invent one -- and then writes the row itself,
 * stamping the timestamp, the digest and the counsel status from the server's own copy of the
 * document. No field a client supplies ends up in the evidence unexamined.
 */
@Injectable()
export class AgreementsService {
  constructor(
    @InjectRepository(AgreementAcceptance)
    private readonly acceptances: Repository<AgreementAcceptance>,
    /**
     * §308 (LG-3). The published legal documents are the SECOND source of agreements, and the
     * service asks for them per call rather than caching them, because the registry is the
     * authority on what is in force and a cached copy here would be a second opinion.
     */
    private readonly legal: LegalPublicationService,
  ) {}

  /**
   * §308. Every ACTIVE legal document, projected into the agreement shape.
   *
   * ONLY ACTIVE ONES. A SUPERSEDED document is deliberately absent, which is what makes §308's
   * requirement M — a caller cannot select a superseded version — fall out of `resolve()` without
   * a special case: the version simply is not the one the registry requires, and the existing §291
   * staleness refusal answers. A DRAFT is absent for the stronger reason that it is not a document
   * anybody may accept at all.
   */
  private projectedLegalAgreements(): readonly AgreementDefinition[] {
    return this.legal.activeDocuments().map((document) => projectLegalDocument({
      documentType: document.documentType,
      version: document.version,
      title: document.title,
      body: document.body,
      requiredAtRegistration: document.requiredAtRegistration,
    }));
  }

  listAgreements() {
    return allAgreements(this.projectedLegalAgreements()).map(describeAgreement);
  }

  /**
   * Validates an asserted acceptance against the server's own registry.
   *
   * Refusing a STALE version is as important as refusing an unknown one: a client that has cached
   * an old registration page would otherwise be able to accept superseded text forever, and the
   * re-acceptance mechanism would quietly stop working.
   */
  private resolve(input: AcceptanceInput): AgreementDefinition {
    const agreement = findAgreement(String(input?.agreementId || ''), this.projectedLegalAgreements());
    if (!agreement) throw new BadRequestException('Unknown agreement.');
    if (String(input?.agreementVersion || '') !== agreement.version) {
      throw new BadRequestException(
        `Agreement ${agreement.agreementId} must be accepted at version ${agreement.version}.`,
      );
    }
    return agreement;
  }

  /**
   * Records an acceptance. Idempotent by the unique index: accepting the same version twice is one
   * fact, so the second call returns the first row rather than creating a duplicate or failing.
   */
  async record(
    userId: string,
    organizationId: string | null,
    input: AcceptanceInput,
    channel: 'registration' | 'in_app',
  ): Promise<AgreementAcceptance> {
    const agreement = this.resolve(input);
    const existing = await this.acceptances.findOne({
      where: { userId, agreementId: agreement.agreementId, agreementVersion: agreement.version },
    });
    if (existing) return existing;

    try {
      return await this.acceptances.save(this.acceptances.create({
        userId,
        organizationId,
        agreementId: agreement.agreementId,
        agreementVersion: agreement.version,
        documentDigest: documentDigest(agreement),
        counselStatusAtAcceptance: agreement.counselStatus,
        acceptedAt: new Date(),
        acceptanceChannel: channel,
      }));
    } catch (error) {
      // Two concurrent accepts race to the same unique key. The loser re-reads the winner's row,
      // because both requests are asserting the same true fact and neither should see an error.
      const raced = await this.acceptances.findOne({
        where: { userId, agreementId: agreement.agreementId, agreementVersion: agreement.version },
      });
      if (raced) return raced;
      throw error;
    }
  }

  /** Validates every agreement required at registration, BEFORE any account is created. */
  validateRegistrationAcceptances(inputs: AcceptanceInput[] | undefined): AgreementDefinition[] {
    /*
     * §308. The required set is DERIVED from publication state. With no ACTIVE legal document it is
     * exactly what §291 made it — the internal acknowledgement alone — so today's registration is
     * unchanged and §308 does not begin enforcing acceptance of documents that do not exist.
     * Activating a document turns the requirement on by itself; there is no second switch.
     */
    const required = agreementsRequiredAtRegistration(this.projectedLegalAgreements());
    const supplied = Array.isArray(inputs) ? inputs : [];
    return required.map(agreement => {
      const match = supplied.find(i => i && i.agreementId === agreement.agreementId);
      if (!match) {
        throw new BadRequestException(
          `Acceptance of "${agreement.title}" (${agreement.agreementId} v${agreement.version}) is required.`,
        );
      }
      return this.resolve(match);
    });
  }

  async recordRegistrationAcceptances(
    userId: string,
    organizationId: string | null,
    agreements: AgreementDefinition[],
  ): Promise<void> {
    for (const agreement of agreements) {
      await this.record(
        userId, organizationId,
        { agreementId: agreement.agreementId, agreementVersion: agreement.version },
        'registration',
      );
    }
  }

  /** The evidence: what this user has accepted, and when. */
  async acceptancesFor(userId: string) {
    const rows = await this.acceptances.find({ where: { userId }, order: { acceptedAt: 'DESC' } });
    return rows.map(r => ({
      agreementId: r.agreementId,
      agreementVersion: r.agreementVersion,
      documentDigest: r.documentDigest,
      counselStatusAtAcceptance: r.counselStatusAtAcceptance,
      acceptedAt: r.acceptedAt,
      acceptanceChannel: r.acceptanceChannel,
      userId: r.userId,
      organizationId: r.organizationId,
    }));
  }

  /**
   * §308 (LG-3) — CURRENT versus REACCEPTANCE_REQUIRED, as a server-side determination.
   *
   * §308 asks for exactly this and asks for it to be PROVEN rather than asserted, and it also says
   * not to invent an aggressive lockout UX. So this reports a state and does nothing else: it
   * blocks nothing, revokes nothing and logs nobody out. What it gives the product is the ability
   * to ANSWER the question — which is what was actually missing — and leaves what to do about a
   * `REACCEPTANCE_REQUIRED` user to a later product decision rather than making that decision here
   * by accident.
   *
   * The determination is the §291 comparison, unchanged: a user is CURRENT when they hold a row at
   * the version each in-force agreement currently requires. Publishing a new Terms version makes
   * every prior acceptance of the old one outstanding WITHOUT touching a stored row, so the
   * historical acceptance stays true and attributable to the exact text that was accepted.
   */
  async acceptanceStatusFor(userId: string): Promise<{
    status: 'CURRENT' | 'REACCEPTANCE_REQUIRED';
    outstanding: Awaited<ReturnType<AgreementsService['outstandingFor']>>;
  }> {
    const outstanding = await this.outstandingFor(userId);
    return {
      status: outstanding.length === 0 ? 'CURRENT' : 'REACCEPTANCE_REQUIRED',
      outstanding,
    };
  }

  /**
   * §291 — RE-ACCEPTANCE, WITHOUT A POLICY ENGINE.
   *
   * The whole mechanism is one comparison: is there a row for this user at the version the
   * registry currently requires? Raising a version makes every prior acceptance outstanding
   * without touching a single stored row, so no account is reset and no history is rewritten.
   */
  async outstandingFor(userId: string) {
    const rows = await this.acceptances.find({ where: { userId } });
    const accepted = new Set(rows.map(r => `${r.agreementId}@${r.agreementVersion}`));
    return allAgreements(this.projectedLegalAgreements())
      .filter(a => !accepted.has(`${a.agreementId}@${a.version}`))
      .map(a => ({
        agreementId: a.agreementId,
        requiredVersion: a.version,
        title: a.title,
        counselStatus: a.counselStatus,
        previouslyAcceptedVersions: rows
          .filter(r => r.agreementId === a.agreementId)
          .map(r => r.agreementVersion),
      }));
  }
}
