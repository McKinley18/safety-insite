import { ApprovedKnowledgeRegistryValidator } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry.validator';
import { ApprovedKnowledgeDraftExportService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-draft-export.service';
import { ApprovedKnowledgeRecord } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-record.types';

async function validate() {
  const validator = ApprovedKnowledgeRegistryValidator;
  const draftService = new ApprovedKnowledgeDraftExportService();
  
  // Test Case: OSHA record
  const oshaRecord: ApprovedKnowledgeRecord = {
    recordId: 'rec-1',
    version: '1.0.0',
    status: 'approved',
    authority: {
        agency: 'OSHA',
        authorityTier: 'primary_regulation',
        jurisdiction: 'osha_general_industry',
        sourceUrl: 'http://osha.gov',
        citation: '1910.147',
        title: 'LOTO',
        effectiveDate: '2026-01-01',
        revisionDate: '2026-01-01',
        sourceDateStatus: 'current'
    },
    mapping: {
        domainId: 'loto',
        standardFamily: 'loto',
        hazardFamilies: ['energy'],
        mechanisms: ['unexpected_startup'],
        equipmentGroups: ['conveyor'],
        taskContexts: ['maintenance'],
        applicabilitySignals: ['energized'],
        requiredFacts: ['energy_source'],
        disqualifyingFacts: [],
        evidenceQuestions: ['Is energy isolated?']
    },

    applicability: {
        plainLanguageSummary: 'LOTO is required',
        appliesWhen: 'servicing',
        doesNotApplyWhen: 'normal operation',
        requiredReviewerChecks: ['LOTO check']
    },
    correctiveActionLinks: {
        preferredControlFamilies: ['isolation'],
        verificationMethods: ['zero energy check'],
        commonWeakActionsToAvoid: ['simple shutdown']
    },
    governance: {
        approvedBy: 'SafetyEngineer',
        approvedAt: '2026-06-06',
        reviewerRole: 'Safety Manager',
        changeReason: 'Initial approval',
        supersedesRecordIds: [],
        duplicateKeys: ['loto-1910.147'],
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true
    }
  };

  const oshaErrors = validator.validate(oshaRecord);
  if (oshaErrors.length > 0) {
      console.error('OSHA record validation failed:', oshaErrors);
      process.exit(1);
  }
  console.log('✅ OSHA record validation passed.');

  // Test Case: Prohibited language
  const prohibitedRecord = JSON.parse(JSON.stringify(oshaRecord));
  prohibitedRecord.governance.changeReason = 'This is a violation';
  const prohibitedErrors = validator.validate(prohibitedRecord);
  if (prohibitedErrors.length === 0) {
      console.error('Prohibited language validation failed to detect violation');
      process.exit(1);
  }
  console.log('✅ Prohibited language detection passed.');

  // Test Case: Draft candidate
  const draft = draftService.createDraft({});
  if (draft.status !== 'draft_candidate') {
      console.error('Draft candidate status incorrect');
      process.exit(1);
  }
  console.log('✅ Draft candidate validation passed.');

  console.log('✅ Approved knowledge registry schema validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
