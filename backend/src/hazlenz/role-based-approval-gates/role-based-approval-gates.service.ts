import { Injectable } from '@nestjs/common';
import { GateInput, GateResult, ReviewerRole, GateAction } from './role-based-approval-gates.types';

@Injectable()
export class RoleBasedApprovalGatesService {
  private readonly version = '1.0.0';

  evaluate(input: GateInput): GateResult {
    const { role, action, candidateType, jurisdiction, isRegulatory, containsProhibitedLanguage, priority } = input;
    const timestamp = new Date().toISOString();

    // 1. System Admin always allowed unless prohibited language is being approved into knowledge
    if (role === 'system_admin') {
      if (action === 'approve' && containsProhibitedLanguage && isRegulatory) {
        return this.blocked('Prohibited legal language cannot be approved into regulatory knowledge even by system admins.', ['compliance_admin'], timestamp);
      }
      return this.allowed('System administrator override.', timestamp);
    }

    // 2. Prohibited language check
    if (containsProhibitedLanguage && action === 'approve') {
       return this.blocked('Prohibited legal/enforcement language detected. Approval blocked for all roles.', ['compliance_admin', 'system_admin'], timestamp);
    }

    // 3. Regulatory Source Candidates
    if (candidateType === 'source_ingestion' || isRegulatory) {
      if (role === 'compliance_admin') return this.allowed('Compliance admin authorized for all regulatory actions.', timestamp);

      if (jurisdiction === 'osha_general_industry') {
        if (role === 'osha_general_industry_reviewer') return this.allowed('OSHA General Industry reviewer authorized.', timestamp);
        return this.blocked('OSHA General Industry records require osha_general_industry_reviewer or compliance_admin.', ['osha_general_industry_reviewer', 'compliance_admin'], timestamp);
      }

      if (jurisdiction === 'osha_construction') {
        if (role === 'osha_construction_reviewer') return this.allowed('OSHA Construction reviewer authorized.', timestamp);
        return this.blocked('OSHA Construction records require osha_construction_reviewer or compliance_admin.', ['osha_construction_reviewer', 'compliance_admin'], timestamp);
      }

      if (jurisdiction === 'msha') {
        if (role === 'msha_competent_reviewer') return this.allowed('MSHA competent reviewer authorized.', timestamp);
        return this.blocked('MSHA records require msha_competent_reviewer or compliance_admin.', ['msha_competent_reviewer', 'compliance_admin'], timestamp);
      }

      if (jurisdiction === 'mixed') {
        return this.blocked('Mixed jurisdiction records require compliance_admin or system_admin.', ['compliance_admin', 'system_admin'], timestamp);
      }
    }

    // 4. Company Policy
    if (candidateType === 'company_policy' || jurisdiction === 'company_only') {
      if (role === 'company_policy_admin' || role === 'compliance_admin') return this.allowed('Company policy authorized.', timestamp);
      return this.blocked('Company policy records require company_policy_admin or compliance_admin.', ['company_policy_admin', 'compliance_admin'], timestamp);
    }

    // 5. Human Review Correction
    if (candidateType === 'human_review_learning') {
      if (role === 'safety_reviewer' || role === 'safety_manager' || role === 'compliance_admin') {
        // If it affects regulatory applicability
        if (input.metadata?.affectsRegulatoryApplicability) {
           if (role === 'compliance_admin') return this.allowed('Compliance admin authorized for applicability changes.', timestamp);
           return this.blocked('Corrections affecting regulatory applicability require compliance_admin.', ['compliance_admin'], timestamp);
        }
        return this.allowed('Safety role authorized for human review correction.', timestamp);
      }
      return this.blocked('Human review corrections require safety_reviewer, safety_manager, or compliance_admin.', ['safety_reviewer', 'safety_manager', 'compliance_admin'], timestamp);
    }

    // 6. Visual / Image Derived
    if (candidateType === 'visual_evidence' || candidateType === 'real_image_analysis') {
      if (role === 'visual_evidence_reviewer' || role === 'safety_manager' || role === 'compliance_admin') {
        if (action === 'promote' && isRegulatory) {
           if (role === 'compliance_admin') return this.allowed('Compliance admin authorized for promoting visual evidence to knowledge.', timestamp);
           return this.blocked('Promoting visual evidence to regulatory knowledge requires compliance_admin.', ['compliance_admin'], timestamp);
        }
        return this.allowed('Visual evidence role authorized.', timestamp);
      }
      if (action === 'approve' && !isRegulatory && role === 'safety_reviewer') {
        return this.allowed('Safety reviewer authorized to acknowledge visual findings.', timestamp);
      }
      return this.blocked('Visual evidence actions require visual_evidence_reviewer, safety_manager, or compliance_admin.', ['visual_evidence_reviewer', 'safety_manager', 'compliance_admin'], timestamp);
    }

    // 7. High Risk / Blocked overrides
    if (input.metadata?.isBlockedRecord && action !== 'archive') {
       if (role === 'compliance_admin') return this.allowed('Compliance admin authorized to manage blocked records.', timestamp);
       return this.blocked('Overriding blocked records requires compliance_admin.', ['compliance_admin'], timestamp);
    }

    // Default: block
    return this.blocked('Action not authorized for this role and candidate type.', ['compliance_admin', 'system_admin'], timestamp);
  }

  private allowed(reason: string, timestamp: string): GateResult {
    return { allowed: true, reason, requiredRoles: [], gateVersion: this.version, timestamp };
  }

  private blocked(reason: string, requiredRoles: ReviewerRole[], timestamp: string): GateResult {
    return { allowed: false, reason, requiredRoles, gateVersion: this.version, timestamp };
  }
}
