import { WorkspaceGovernanceAccessService } from '../src/safescope-v2/workspace-governance-access/workspace-governance-access.service';
import { UserGovernanceContext } from '../src/safescope-v2/workspace-governance-access/workspace-governance.types';

async function validate() {
  const service = new WorkspaceGovernanceAccessService();
  
  console.log('--- Testing Workspace Auth Governance ---');

  const owner: UserGovernanceContext = {
      userId: 'user-1',
      workspaceId: 'work-A',
      role: 'owner',
      planTier: 'company',
      jurisdictionScopes: [],
      reviewerQualifications: []
  };

  const inspector: UserGovernanceContext = {
      userId: 'user-2',
      workspaceId: 'work-A',
      role: 'field_inspector',
      planTier: 'company',
      jurisdictionScopes: [],
      reviewerQualifications: [],
      assignedInspectionIds: ['ins-101']
  };

  const viewer: UserGovernanceContext = {
      userId: 'user-3',
      workspaceId: 'work-A',
      role: 'viewer',
      planTier: 'company',
      jurisdictionScopes: [],
      reviewerQualifications: []
  };

  const oshaReviewer: UserGovernanceContext = {
      userId: 'user-4',
      workspaceId: 'work-A',
      role: 'osha_general_industry_reviewer',
      planTier: 'company',
      jurisdictionScopes: ['osha_general_industry'],
      reviewerQualifications: ['osha_30']
  };

  // 1. Owner can view workspace audit records
  const case1 = service.can(owner, 'view_audit_records');
  if (!case1.allowed) throw new Error('Case 1 failed: Owner should be allowed to view audit records.');
  console.log('[PASS] Case 1: Owner authorized for audit records.');

  // 2. Field inspector cannot approve regulatory candidates
  const case2 = service.can(inspector, 'promote_knowledge');
  if (case2.allowed) throw new Error('Case 2 failed: Inspector should be blocked from promotion.');
  console.log('[PASS] Case 2: Field inspector blocked from knowledge promotion.');

  // 3. Viewer cannot edit findings
  const case3 = service.can(viewer, 'edit_findings');
  if (case3.allowed) throw new Error('Case 3 failed: Viewer should be blocked from editing.');
  console.log('[PASS] Case 3: Viewer blocked from editing findings.');

  // 4. Assigned field inspector can run SafeScope
  const case4 = service.can(inspector, 'run_classification', { inspectionId: 'ins-101' });
  if (!case4.allowed) throw new Error('Case 4 failed: Inspector should be allowed on assigned inspection.');
  console.log('[PASS] Case 4: Assigned inspector authorized for SafeScope.');

  // 5. Unassigned field inspector is blocked
  const case5 = service.can(inspector, 'run_classification', { inspectionId: 'ins-999' });
  if (case5.allowed) throw new Error('Case 5 failed: Inspector should be blocked on unassigned inspection.');
  console.log('[PASS] Case 5: Unassigned inspector blocked from SafeScope.');

  // 6. Cross-workspace access is blocked
  const case6 = service.can(owner, 'view_workspace_data', { workspaceId: 'work-B' });
  if (case6.allowed) throw new Error('Case 6 failed: Cross-workspace access must be blocked.');
  console.log('[PASS] Case 6: Cross-workspace isolation enforced.');

  // 7. Plan gating: individual plan cannot ingest sources
  const individual: UserGovernanceContext = { ...owner, planTier: 'individual' };
  const case7 = service.can(individual, 'ingest_sources');
  if (case7.allowed) throw new Error('Case 7 failed: Individual plan should be blocked from ingestion.');
  console.log('[PASS] Case 7: Plan-tier gating enforced.');

  // 8. Jurisdiction check: OSHA reviewer can review OSHA
  const case8 = service.can(oshaReviewer, 'review_osha_general');
  if (!case8.allowed) throw new Error('Case 8 failed: OSHA reviewer should be allowed.');
  console.log('[PASS] Case 8: Jurisdiction-specific reviewer authorized.');

  // 9. Jurisdiction check: OSHA reviewer cannot review MSHA
  const case9 = service.can(oshaReviewer, 'review_msha');
  if (case9.allowed) throw new Error('Case 9 failed: OSHA reviewer should be blocked from MSHA.');
  console.log('[PASS] Case 9: MSHA review blocked for OSHA-only reviewer.');

  console.log('✅ SafeScope workspace auth governance validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
