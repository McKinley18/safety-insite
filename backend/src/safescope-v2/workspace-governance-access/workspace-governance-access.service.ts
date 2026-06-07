import { Injectable } from '@nestjs/common';
import { 
  UserGovernanceContext, 
  SafeScopePermission, 
  AccessDecision 
} from './workspace-governance.types';

@Injectable()
export class WorkspaceGovernanceAccessService {
  
  can(user: UserGovernanceContext, permission: SafeScopePermission, resourceContext?: { workspaceId?: string, inspectionId?: string, jurisdiction?: string }): AccessDecision {
    const { workspaceId } = user;
    
    // 1. Workspace Isolation
    if (resourceContext?.workspaceId && resourceContext.workspaceId !== workspaceId) {
      return this.deny(workspaceId, 'Cross-workspace access is blocked.');
    }

    // 2. Role-Based Permissions
    switch (permission) {
      case 'view_workspace_data':
        return this.allow(workspaceId);

      case 'run_classification':
        if (user.role === 'viewer') return this.deny(workspaceId, 'Viewers cannot run SafeScope classification.');
        if (user.role === 'field_inspector' && resourceContext?.inspectionId) {
           if (user.assignedInspectionIds?.includes(resourceContext.inspectionId)) {
             return this.allow(workspaceId);
           }
           return this.deny(workspaceId, 'Field inspectors can only run classification on assigned inspections.');
        }
        return this.allow(workspaceId);

      case 'view_traces':
      case 'view_audit_records':
      case 'view_candidates':
        if (['owner', 'admin', 'safety_manager', 'compliance_admin', 'osha_general_industry_reviewer', 'osha_construction_reviewer', 'msha_reviewer'].includes(user.role)) {
          return this.allow(workspaceId);
        }
        return this.deny(workspaceId, 'Role ' + user.role + ' does not have permission to ' + permission + '.');

      case 'manage_candidates':
        if (['owner', 'admin', 'safety_manager', 'compliance_admin', 'osha_general_industry_reviewer', 'osha_construction_reviewer', 'msha_reviewer'].includes(user.role)) {
          return this.allow(workspaceId);
        }
        return this.deny(workspaceId, 'Only safety managers and authorized reviewers can manage candidates.');

      case 'promote_knowledge':
      case 'ingest_sources':
        if (user.planTier === 'individual') {
          return this.deny(workspaceId, 'Team/Workspace governance features require a Team or Company plan.');
        }
        if (['owner', 'admin', 'compliance_admin'].includes(user.role)) {
          return this.allow(workspaceId);
        }
        return this.deny(workspaceId, 'Promotion and ingestion require admin or compliance authority.');

      case 'review_osha_general':
        if (user.role === 'osha_general_industry_reviewer' || user.role === 'compliance_admin' || user.role === 'admin' || user.role === 'owner') {
          return this.allow(workspaceId);
        }
        return this.deny(workspaceId, 'Requires OSHA General Industry reviewer qualification.');

      case 'review_osha_construction':
        if (user.role === 'osha_construction_reviewer' || user.role === 'compliance_admin' || user.role === 'admin' || user.role === 'owner') {
          return this.allow(workspaceId);
        }
        return this.deny(workspaceId, 'Requires OSHA Construction reviewer qualification.');

      case 'review_msha':
        if (user.role === 'msha_reviewer' || user.role === 'compliance_admin' || user.role === 'admin' || user.role === 'owner') {
          return this.allow(workspaceId);
        }
        return this.deny(workspaceId, 'Requires MSHA reviewer qualification.');

      case 'edit_findings':
      case 'finalize_reports':
        if (user.role === 'viewer') return this.deny(workspaceId, 'Viewers cannot edit or finalize reports.');
        return this.allow(workspaceId);

      default:
        return this.deny(workspaceId, 'Unknown permission: ' + permission);
    }
  }

  private allow(workspaceId: string): AccessDecision {
    return { allowed: true, reason: 'Authorized.', workspaceId };
  }

  private deny(workspaceId: string, reason: string): AccessDecision {
    return { allowed: false, reason, workspaceId };
  }
}
