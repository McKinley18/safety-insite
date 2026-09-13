import { Injectable } from '@nestjs/common';
import {
  ApprovedKnowledgeRegistryWriteGuardOutput,
  WriteDecision,
} from './approved-knowledge-registry-write-guard.types';

@Injectable()
export class ApprovedKnowledgeRegistryWriteGuardService {
  private readonly engineVersion = '0.1.0';

  async evaluateWriteGuard(
    askigOutput: any,
    akpwgOutput: any,
    reviewerData: any = {},
    auditData: any = {},
    versioningData: any = {}
  ): Promise<ApprovedKnowledgeRegistryWriteGuardOutput> {
    const sourceIntakeDecision = this.value(askigOutput?.intakeDecision || askigOutput?.decision);
    const promotionDecision = this.value(akpwgOutput?.promotionDecision || akpwgOutput?.decision);

    const possibleDuplicate =
      Boolean(askigOutput?.duplicateGovernance?.possibleDuplicate) ||
      Boolean(akpwgOutput?.duplicateReview?.possibleDuplicate) ||
      Boolean(versioningData?.possibleDuplicate);

    const duplicateResolved =
      !possibleDuplicate ||
      Boolean(versioningData?.duplicateResolved) ||
      Boolean(reviewerData?.duplicateResolved) ||
      ['merge_existing', 'update_existing', 'reject_duplicate'].includes(this.value(versioningData?.duplicateAction));

    const requestedAction = this.value(versioningData?.requestedAction || versioningData?.writeAction || 'create_new');
    const isUpdateOrMerge = ['update_existing', 'merge_existing'].includes(requestedAction) || possibleDuplicate;

    const reviewerApprovalPresent = Boolean(
      reviewerData?.approvalPresent ||
      reviewerData?.approved ||
      reviewerData?.finalApproval === true
    );

    const approverRole = this.value(reviewerData?.approverRole || reviewerData?.role);
    const requiredApproverRoles = ['qualified_safety_reviewer', 'safety_manager', 'safety_director', 'admin'];
    const approverRoleAccepted =
      reviewerApprovalPresent &&
      (requiredApproverRoles.includes(approverRole) || approverRole.includes('qualified') || approverRole.includes('safety'));

    const requiredAuditFields = [
      'sourceId',
      'reviewerId',
      'decisionTimestamp',
      'sourceSnapshot',
      'changeReason',
      'engineVersion',
    ];

    const auditFields = Array.isArray(auditData?.fields)
      ? auditData.fields.map((field: unknown) => this.value(field))
      : Object.keys(auditData || {}).map(key => this.value(key));

    const auditTrailPresent = Boolean(auditData?.auditTrailPresent || auditData?.present) &&
      requiredAuditFields.every(field => auditFields.includes(field.toLowerCase()) || Boolean(auditData?.[field]));

    const missingAuditFields = requiredAuditFields.filter(field =>
      !(auditFields.includes(field.toLowerCase()) || Boolean(auditData?.[field]))
    );

    const previousVersion = this.value(versioningData?.previousVersion || '');
    const proposedVersion = this.value(versioningData?.proposedVersion || '');
    const changeReason = String(versioningData?.changeReason || '').trim();

    const versioningPresent = !isUpdateOrMerge || (
      previousVersion !== 'unknown' &&
      proposedVersion !== 'unknown' &&
      previousVersion !== '' &&
      proposedVersion !== '' &&
      previousVersion !== proposedVersion
    );

    const changeReasonPresent = !isUpdateOrMerge || changeReason.length >= 8;

    const intakeRejectedOrBlocked = ['blocked', 'rejected', 'reject_write'].includes(sourceIntakeDecision);
    const promotionRejectedOrBlocked = ['blocked', 'rejected', 'reject_write'].includes(promotionDecision);

    const sourceReviewable = ['approved_candidate', 'needs_review'].includes(sourceIntakeDecision);
    const promotionReviewable = [
      'ready_for_final_review',
      'needs_review',
      'merge_review',
      'escalate',
      'hold_for_review',
      'approved_candidate',
    ].includes(promotionDecision);

    const advisoryGuardrailsValid =
      askigOutput?.advisoryGuardrails?.advisoryOnly !== false &&
      askigOutput?.advisoryGuardrails?.doesNotDeclareViolation !== false &&
      askigOutput?.advisoryGuardrails?.doesNotCreateCitation !== false &&
      askigOutput?.advisoryGuardrails?.requiresQualifiedReview !== false &&
      akpwgOutput?.advisoryGuardrails?.advisoryOnly !== false &&
      akpwgOutput?.advisoryGuardrails?.doesNotDeclareViolation !== false &&
      akpwgOutput?.advisoryGuardrails?.doesNotCreateCitation !== false &&
      akpwgOutput?.advisoryGuardrails?.requiresQualifiedReview !== false;

    const blockedReasons = Array.from(new Set([
      intakeRejectedOrBlocked ? `Source intake decision is ${sourceIntakeDecision}.` : undefined,
      promotionRejectedOrBlocked ? `Promotion decision is ${promotionDecision}.` : undefined,
      !reviewerApprovalPresent ? 'Final qualified reviewer approval is missing.' : undefined,
      reviewerApprovalPresent && !approverRoleAccepted ? 'Reviewer approval role is not accepted for approved-registry write.' : undefined,
      !auditTrailPresent ? 'Required audit trail is missing or incomplete.' : undefined,
      !duplicateResolved ? 'Possible duplicate is unresolved.' : undefined,
      isUpdateOrMerge && !versioningPresent ? 'Version increment is required for update or merge.' : undefined,
      isUpdateOrMerge && !changeReasonPresent ? 'Change reason is required for update or merge.' : undefined,
      !advisoryGuardrailsValid ? 'Advisory guardrails are missing or weakened.' : undefined,
    ].filter(Boolean) as string[]));

    const readyForDraft =
      sourceReviewable &&
      promotionReviewable &&
      advisoryGuardrailsValid &&
      !intakeRejectedOrBlocked &&
      !promotionRejectedOrBlocked;

    const readyForApprovedRegistry =
      readyForDraft &&
      reviewerApprovalPresent &&
      approverRoleAccepted &&
      auditTrailPresent &&
      duplicateResolved &&
      versioningPresent &&
      changeReasonPresent;

    const canCreateDraftCandidate = readyForDraft;
    const canWriteApprovedKnowledge = readyForApprovedRegistry;
    const canUpdateExistingRecord = canWriteApprovedKnowledge && requestedAction === 'update_existing';
    const canMergeDuplicate = canWriteApprovedKnowledge && requestedAction === 'merge_existing' && possibleDuplicate && duplicateResolved;

    let writeDecision: WriteDecision = 'blocked';
    if (canWriteApprovedKnowledge) {
      writeDecision = 'allow_write_candidate';
    } else if (readyForDraft) {
      writeDecision = 'hold_for_review';
    } else if (intakeRejectedOrBlocked || promotionRejectedOrBlocked || !advisoryGuardrailsValid) {
      writeDecision = intakeRejectedOrBlocked || promotionRejectedOrBlocked ? 'reject_write' : 'blocked';
    }

    const missingReadinessItems = Array.from(new Set([
      !sourceReviewable ? 'reviewable source intake decision' : undefined,
      !promotionReviewable ? 'reviewable promotion decision' : undefined,
      !reviewerApprovalPresent ? 'final qualified reviewer approval' : undefined,
      reviewerApprovalPresent && !approverRoleAccepted ? 'accepted approver role' : undefined,
      !auditTrailPresent ? 'complete audit trail' : undefined,
      !duplicateResolved ? 'duplicate resolution' : undefined,
      !versioningPresent ? 'version increment' : undefined,
      !changeReasonPresent ? 'change reason' : undefined,
      !advisoryGuardrailsValid ? 'preserved advisory guardrails' : undefined,
    ].filter(Boolean) as string[]));

    const duplicateAllowedAction =
      possibleDuplicate && !duplicateResolved ? 'none' :
      possibleDuplicate && requestedAction === 'merge_existing' ? 'merge_existing' :
      possibleDuplicate && requestedAction === 'update_existing' ? 'update_existing' :
      possibleDuplicate ? 'reject_duplicate' :
      requestedAction === 'update_existing' ? 'update_existing' :
      'create_new';

    const governanceWarnings = Array.from(new Set([
      'This guard is governance-only and does not persist approved knowledge.',
      'Approved-registry write requires final qualified reviewer approval.',
      !auditTrailPresent ? 'Audit trail must be completed before approved-registry write.' : undefined,
      possibleDuplicate && !duplicateResolved ? 'Duplicate must be resolved before approved-registry write.' : undefined,
      isUpdateOrMerge && !versioningPresent ? 'Version increment is required before update or merge.' : undefined,
      isUpdateOrMerge && !changeReasonPresent ? 'Change reason is required before update or merge.' : undefined,
    ].filter(Boolean) as string[]));

    return {
      engine: 'safescope_approved_knowledge_registry_write_guard_core',
      version: this.engineVersion,
      writeDecision,
      writePermission: {
        canWriteApprovedKnowledge,
        canCreateDraftCandidate,
        canUpdateExistingRecord,
        canMergeDuplicate,
        requiresFinalReviewerApproval: true,
      },
      requiredInputs: {
        sourceIntakeDecision,
        promotionDecision,
        reviewerApprovalPresent,
        auditTrailPresent,
        duplicateResolved,
        versioningPresent,
        changeReasonPresent,
      },
      registryRecordReadiness: {
        readyForDraft,
        readyForApprovedRegistry,
        missingReadinessItems,
      },
      duplicateWriteGuard: {
        possibleDuplicate,
        duplicateResolved,
        allowedAction: duplicateAllowedAction,
        reasons: Array.from(new Set([
          possibleDuplicate ? 'Possible duplicate detected by intake or promotion governance.' : 'No duplicate indicated.',
          possibleDuplicate && duplicateResolved ? 'Duplicate has been resolved for write-guard purposes.' : undefined,
          possibleDuplicate && !duplicateResolved ? 'Duplicate remains unresolved.' : undefined,
        ].filter(Boolean) as string[])),
      },
      versioningGuard: {
        requiresVersionIncrement: isUpdateOrMerge,
        previousVersion,
        proposedVersion,
        changeReasonRequired: isUpdateOrMerge,
        versioningWarnings: Array.from(new Set([
          isUpdateOrMerge && !versioningPresent ? 'Valid previous/proposed version increment is required.' : undefined,
          isUpdateOrMerge && !changeReasonPresent ? 'Change reason is required for update or merge.' : undefined,
        ].filter(Boolean) as string[])),
      },
      reviewerApprovalGuard: {
        approvalRequired: true,
        approvalPresent: reviewerApprovalPresent,
        approverRoleAccepted,
        requiredApproverRoles,
        approvalWarnings: Array.from(new Set([
          !reviewerApprovalPresent ? 'Final qualified reviewer approval is missing.' : undefined,
          reviewerApprovalPresent && !approverRoleAccepted ? 'Approver role is not accepted.' : undefined,
        ].filter(Boolean) as string[])),
      },
      auditGuard: {
        auditRequired: true,
        auditTrailPresent,
        requiredAuditFields,
        missingAuditFields,
      },
      blockedReasons,
      governanceWarnings,
      decisionTrace: [
        'Evaluated approved knowledge registry write guard.',
        `Source intake decision: ${sourceIntakeDecision}.`,
        `Promotion decision: ${promotionDecision}.`,
        `Reviewer approval present: ${reviewerApprovalPresent}.`,
        `Audit trail present: ${auditTrailPresent}.`,
        `Duplicate resolved: ${duplicateResolved}.`,
        `Versioning present: ${versioningPresent}.`,
        `Change reason present: ${changeReasonPresent}.`,
        `Write decision: ${writeDecision}.`,
        'Confirmed governance-only behavior; no approved knowledge was written.',
        'Preserved advisory-only boundary and qualified-review requirement.',
      ],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private value(value: unknown): string {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized || 'unknown';
  }
}
