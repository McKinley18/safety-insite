import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Site } from '../sites/entities/site.entity';
import { Invitation } from '../organizations/entities/invitation.entity';
import { Report } from '../reports/entities/report.entity';
import { Finding } from '../reports/entities/finding.entity';
import { ReportAttachment } from '../reports/entities/attachment.entity';
import { Classification } from '../classifications/entities/classification.entity';
import { ClassificationRule } from '../taxonomy/entities/rule.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Review } from '../reviews/entities/review.entity';
import { RiskScore } from '../risk/entities/risk-score.entity';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { Standard } from '../standards/entities/standard.entity';
import { HazardCategoryEntity } from '../standards/entities/hazard-category.entity';
import { HazardStandardMapping } from '../standards/entities/hazard-standard-mapping.entity';
import { CorrectiveActionTemplate } from '../standards/entities/corrective-action-template.entity';
import { ReportLanguageTemplate } from '../standards/entities/report-language-template.entity';
import { ClassificationFeedback } from '../standards/entities/classification-feedback.entity';
import { StandardMatchFeedback } from '../standards/entities/standard-match-feedback.entity';
import { RegulatoryAgency } from '../regulatory/entities/regulatory-agency.entity';
import { RegulatoryPart } from '../regulatory/entities/regulatory-part.entity';
import { RegulatorySubpart } from '../regulatory/entities/regulatory-subpart.entity';
import { RegulatorySection } from '../regulatory/entities/regulatory-section.entity';
import { RegulatoryParagraph } from '../regulatory/entities/regulatory-paragraph.entity';
import { HazardTaxonomy } from '../intelligence-framework/entities/hazard-taxonomy.entity';
import { Notification } from '../notifications/notification.entity';
import { SafeScopeReasoningSnapshot } from '../safescope-v2/snapshots/reasoning-snapshot.entity';
import { SafeScopeSupervisorValidation } from '../safescope-v2/validation/supervisor-validation.entity';
import { SafeScopeKnowledgeDocument } from '../safescope-knowledge/entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../safescope-knowledge/entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeRetrievalLog } from '../safescope-knowledge/entities/safescope-knowledge-retrieval-log.entity';
import { SafeScopeKnowledgeSource } from '../safescope-knowledge/entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: "mckinley",
  password: "",
  database: "sentinel_safety",
  entities: [
    User,
    Organization,
    Site,
    Invitation,
    Report,
    Finding,
    ReportAttachment,
    Classification,
    ClassificationRule,
    AuditLog,
    Review,
    RiskScore,
    CorrectiveAction,
    Standard,
    HazardCategoryEntity,
    HazardStandardMapping,
    CorrectiveActionTemplate,
    ReportLanguageTemplate,
    ClassificationFeedback,
    StandardMatchFeedback,
    RegulatoryAgency,
    RegulatoryPart,
    RegulatorySubpart,
    RegulatorySection,
    RegulatoryParagraph,
    HazardTaxonomy,
    Notification,
    SafeScopeReasoningSnapshot,
    SafeScopeSupervisorValidation,
    SafeScopeKnowledgeDocument,
    SafeScopeKnowledgeChunk,
    SafeScopeKnowledgeRetrievalLog,
    SafeScopeKnowledgeSource,
    SafeScopeKnowledgeIngestionRun,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
  });
