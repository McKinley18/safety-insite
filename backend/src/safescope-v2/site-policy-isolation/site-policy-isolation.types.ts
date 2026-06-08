import { Jurisdiction } from '../approved-knowledge-registry/approved-knowledge-record.types';

export type AuthorityType = 
    | 'company_policy' 
    | 'site_rule' 
    | 'customer_requirement' 
    | 'manufacturer_instruction' 
    | 'contractor_requirement';

export type PolicyStatus = 'active' | 'draft' | 'retired';

export interface SitePolicyScope {
    workspaceId: string;
    siteId?: string;
}

export interface SitePolicyRecord {
    policyId: string;
    scope: SitePolicyScope;
    policyTitle: string;
    policyText: string;
    hazardFamilies: string[];
    taskContexts: string[];
    equipmentTypes: string[];
    authorityType: AuthorityType;
    status: PolicyStatus;
    effectiveDate: string;
    revisionDate?: string;
    sourceOwner: string;
    advisoryOnly: boolean;
    cannotOverrideRegulation: boolean;
    cannotCreateCitation: boolean;
}

export interface SitePolicyResolution {
    policy: SitePolicyRecord;
    relevanceScore: number;
    governanceResult: SitePolicyGovernanceResult;
}

export interface SitePolicyGovernanceResult {
    isAllowed: boolean;
    reason?: string;
}
