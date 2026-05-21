import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type AgencyCode = "OSHA" | "MSHA";
export type StandardScope =
  | "general_industry"
  | "construction"
  | "mining"
  | "mixed";

@Entity("standards_master")
@Index(["agencyCode", "citation"], { unique: true })
export class Standard {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "agency_code" })
  agencyCode: AgencyCode;

  @Column()
  citation: string;

  @Column({ name: "part_number", nullable: true })
  partNumber?: string;

  @Column({ name: "subpart", nullable: true })
  subpart?: string;

  @Column()
  title: string;

  @Column({ name: "standard_text", type: "text" })
  standardText: string;

  @Column({ name: "plain_language_summary", type: "text", nullable: true })
  plainLanguageSummary?: string;

  @Column({ name: "scope_code", nullable: true })
  scopeCode?: StandardScope;

  @Column({ name: "source_key", nullable: true })
  sourceKey?: string;

  @Column({ name: "source_name", nullable: true })
  sourceName?: string;

  @Column({ name: "source_type", nullable: true })
  sourceType?: string;

  @Column({ name: "authority_tier", default: 1 })
  authorityTier: number;

  @Column({ name: "allowed_use", nullable: true })
  allowedUse?: string;

  @Column({ name: "requires_approval", default: false })
  requiresApproval: boolean;

  @Column({ name: "approved_for_auto_ingestion", default: true })
  approvedForAutoIngestion: boolean;

  // 🔥 Hazard-based matching
  @Column({ name: "hazard_codes", type: "simple-array", nullable: true })
  hazardCodes?: string[];

  // 🔥 Control-based matching (NEW ENGINE)
  @Column({ name: "required_controls", type: "simple-array", nullable: true })
  requiredControls?: string[];

  // 🔥 Search + NLP support
  @Column({ name: "keywords", type: "simple-array", nullable: true })
  keywords?: string[];

  // 🔥 Risk weighting (future scoring engine)
  @Column({ name: "severity_weight", default: 1 })
  severityWeight: number;

  // 🔥 Active toggle
  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
