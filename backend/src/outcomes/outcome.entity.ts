import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * §291 — THE PROVENANCE OF THIS TABLE, ESTABLISHED RATHER THAN ASSUMED.
 *
 * NO MIGRATION CREATES `outcomes`, AND THE TABLE EXISTS IN PRODUCTION ANYWAY. Both halves of that
 * sentence are measured facts. §289 read the production database and found it: 13 columns, 0 rows,
 * one of the tables in the production backup.
 *
 * HOW IT GOT THERE. The production column set matches THIS ENTITY exactly -- every column, every
 * type, and every default including `uuid_generate_v4()`, `'UNVERIFIED'`, `false`, `'0'`, `'1'`
 * and a `timestamp without time zone` for `@CreateDateColumn`. That is the signature of TypeORM
 * `synchronize` creating it from this class, during a period when `TYPEORM_SYNCHRONIZE` was
 * enabled. It is `false` in production now and the application refuses to start with it enabled
 * there, so nothing is creating tables this way any more -- but the tables it already created
 * remain. §291 measured the full extent: TWENTY-ONE production tables are outside the migration
 * lineage, all entity-derived, and this is one of them.
 *
 * WHAT THIS TABLE IS. An ACTIVE FEATURE DEPENDENCY, not dead residue: `OutcomesModule` is wired
 * into `AppModule` and `recordOutcome` runs on every corrective-action closure. It is also a
 * CANDIDATE FOR GOVERNED MIGRATION ADOPTION, which is a product-owner decision and not taken here.
 *
 * WHAT MUST NOT BE WRITTEN HERE AGAIN. Until §291 the closure path carried the reasoning that the
 * recurrence branch could not run because no migration creates this table. Every clause of that
 * was true and the conclusion was false. Do not replace it with another unreachability claim.
 * The recurrence query is REACHABLE, and it is made safe by being workspace-scoped in
 * `OutcomeService.checkRecurrence`, not by being unreachable.
 *
 * See `project-docs/preservation/v1-beta/PRODUCTION-SCHEMA-PROVENANCE.md` for the full register.
 */
@Entity('outcomes')
export class Outcome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actionId: string;

  @Column()
  category: string;

  @Column('jsonb')
  originalRecommendation: any;

  @Column('jsonb')
  userActionTaken: any;

  @CreateDateColumn()
  completionTimestamp: Date;

  @Column({
    type: 'varchar',
    default: 'UNVERIFIED',
  })
  verificationStatus: "UNVERIFIED" | "VERIFIED_STRONG" | "VERIFIED_MODERATE" | "WEAK_VALIDATION";

  @Column({
    type: 'varchar',
    nullable: true,
  })
  verificationMethod: "FOLLOW_UP_INSPECTION" | "PHOTO_EVIDENCE" | "SUPERVISOR_SIGNOFF";

  @Column({ default: false })
  recurrenceDetected: boolean;

  // 🔷 VCL FIELDS
  @Column('float', { default: 0 })
  verificationConfidence: number;

  @Column({ default: 0 })
  observationWindowDays: number;

  @Column({ default: 0 })
  inspectionsPerformed: number;

  @Column('float', { default: 1.0 })
  exposureLevelAtLocation: number;
}
