import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * §291 (SU-3) — THE EVIDENCE ROW. ONE PER (USER, AGREEMENT, VERSION).
 *
 * The unique index is the whole design. Accepting the same version twice is the SAME FACT, so it
 * must not produce a second row -- which also makes the accept route naturally idempotent under
 * the retry shape D-053 is about. Accepting a NEW version produces a new row and leaves the old
 * one untouched, because the old acceptance remains true: that person did accept that text on that
 * date, and a later document does not retract it.
 *
 * Nothing here is ever updated or deleted in the ordinary course. Re-acceptance is an INSERT.
 */
@Entity('agreement_acceptances')
@Index('uq_agreement_acceptance_user_version', ['userId', 'agreementId', 'agreementVersion'], { unique: true })
export class AgreementAcceptance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  /**
   * The workspace the acceptance was made in. NULL for a personal account, which is the same
   * convention corrective actions and every other workspace-scoped record already use -- a
   * different one here would be a second definition of "workspace" to keep in step.
   */
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 128 })
  agreementId: string;

  @Column({ type: 'varchar', length: 64 })
  agreementVersion: string;

  /**
   * sha256 of the exact text accepted. The version says WHICH document; this says the text of that
   * version had not been edited underneath the acceptance. Without it a silent edit to a published
   * version would rewrite history.
   */
  @Column({ type: 'varchar', length: 64 })
  documentDigest: string;

  @Column({ type: 'varchar', length: 64 })
  counselStatusAtAcceptance: string;

  @Column({ type: 'timestamptz' })
  acceptedAt: Date;

  /**
   * How the acceptance reached the server. Deliberately coarse -- 'registration' or 'in_app' --
   * rather than an IP address or a user agent: those are personal data that would need a privacy
   * basis this product does not yet have, and neither is needed to evidence that the person
   * accepted the document.
   */
  @Column({ type: 'varchar', length: 32 })
  acceptanceChannel: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
