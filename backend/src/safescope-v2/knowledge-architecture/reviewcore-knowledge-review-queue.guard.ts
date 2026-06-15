import {
  ReviewCoreQueueActionType,
  ReviewCoreQueueActor,
  ReviewCoreQueueGuardDecision,
} from './reviewcore-knowledge-review-queue.api-types';

const MUTATING_ACTIONS: ReviewCoreQueueActionType[] = [
  'create_draft',
  'approve',
  'reject',
  'request_more_info',
  'supersede',
];

const APPROVAL_ACTIONS: ReviewCoreQueueActionType[] = ['approve', 'supersede'];

export class ReviewCoreKnowledgeReviewQueueGuard {
  canPerform(
    action: ReviewCoreQueueActionType,
    actor: ReviewCoreQueueActor,
    _recordStatus?: string,
  ): ReviewCoreQueueGuardDecision {
    if (!MUTATING_ACTIONS.includes(action)) {
      return {
        allowed: true,
        reason: 'read_allowed',
        actorAuthorized: true,
        planAuthorized: true,
      };
    }

    if (actor.role === 'viewer') {
      return {
        allowed: false,
        reason: 'role_not_authorized',
        actorAuthorized: false,
        planAuthorized: true,
      };
    }

    if (action === 'create_draft') {
      const allowed = ['owner', 'admin', 'compliance_admin', 'safety_manager', 'field_inspector'].includes(actor.role);
      return {
        allowed,
        reason: allowed ? 'draft_allowed' : 'role_not_authorized',
        actorAuthorized: allowed,
        planAuthorized: true,
      };
    }

    if (action === 'request_more_info') {
      const allowed = ['owner', 'admin', 'compliance_admin', 'safety_manager'].includes(actor.role);
      return {
        allowed,
        reason: allowed ? 'more_info_allowed' : 'role_not_authorized',
        actorAuthorized: allowed,
        planAuthorized: true,
      };
    }

    if (APPROVAL_ACTIONS.includes(action) && actor.planTier === 'individual') {
      return {
        allowed: false,
        reason: 'plan_not_authorized',
        actorAuthorized: ['owner', 'admin', 'compliance_admin'].includes(actor.role),
        planAuthorized: false,
      };
    }

    if (action === 'approve' || action === 'reject' || action === 'supersede') {
      const allowed = ['owner', 'admin', 'compliance_admin'].includes(actor.role);
      return {
        allowed,
        reason: allowed ? 'queue_governance_action_allowed' : 'role_not_authorized',
        actorAuthorized: allowed,
        planAuthorized: actor.planTier !== 'individual',
      };
    }

    return {
      allowed: false,
      reason: 'action_not_authorized',
      actorAuthorized: false,
      planAuthorized: actor.planTier !== 'individual',
    };
  }
}
