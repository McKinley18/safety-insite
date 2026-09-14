import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgreementAcceptance } from './agreement-acceptance.entity';
import {
  AGREEMENTS, AgreementDefinition, agreementsRequiredAtRegistration,
  describeAgreement, documentDigest, findAgreement,
} from './agreement-registry';

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
  ) {}

  listAgreements() {
    return AGREEMENTS.map(describeAgreement);
  }

  /**
   * Validates an asserted acceptance against the server's own registry.
   *
   * Refusing a STALE version is as important as refusing an unknown one: a client that has cached
   * an old registration page would otherwise be able to accept superseded text forever, and the
   * re-acceptance mechanism would quietly stop working.
   */
  private resolve(input: AcceptanceInput): AgreementDefinition {
    const agreement = findAgreement(String(input?.agreementId || ''));
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
    const required = agreementsRequiredAtRegistration();
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
   * §291 — RE-ACCEPTANCE, WITHOUT A POLICY ENGINE.
   *
   * The whole mechanism is one comparison: is there a row for this user at the version the
   * registry currently requires? Raising a version makes every prior acceptance outstanding
   * without touching a single stored row, so no account is reset and no history is rewritten.
   */
  async outstandingFor(userId: string) {
    const rows = await this.acceptances.find({ where: { userId } });
    const accepted = new Set(rows.map(r => `${r.agreementId}@${r.agreementVersion}`));
    return AGREEMENTS
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
