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

  @Column({ name: "release_id", nullable: true })
  releaseId?: string;

  @Column({ name: "source_url", type: "text", nullable: true })
  sourceUrl?: string;

  @Column({ name: "source_publication_date", type: "date", nullable: true })
  sourcePublicationDate?: string;

  @Column({ name: "effective_date", type: "date", nullable: true })
  effectiveDate?: string;

  @Column({ name: "revision_date", type: "date", nullable: true })
  revisionDate?: string;

  @Column({ name: "retrieval_date", type: "date", nullable: true })
  retrievalDate?: string;

  @Column({ name: "source_document_checksum", length: 64, nullable: true })
  sourceDocumentChecksum?: string;

  @Column({ name: "normalized_record_checksum", length: 64, nullable: true })
  normalizedRecordChecksum?: string;

  @Column({ name: "transformation_version", nullable: true })
  transformationVersion?: string;

  @Column({ name: "reviewer_approved", default: false })
  reviewerApproved: boolean;

  @Column({ name: "approval_date", type: "timestamptz", nullable: true })
  approvalDate?: Date;

  @Column({ name: "deprecation_status", default: "active" })
  deprecationStatus: string;

  @Column({ name: "superseded_by_citation", nullable: true })
  supersededByCitation?: string;

  @Column({ name: "applicability_schema_version", nullable: true })
  applicabilitySchemaVersion?: string;

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
